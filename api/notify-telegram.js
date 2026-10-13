const WINDOW_MS = 5 * 60 * 1000;
const MAX_REQUESTS = 8;
const requestBuckets = new Map();

const clean = (value, maxLength = 600) =>
  String(value || "").replace(/[<>]/g, "").trim().slice(0, maxLength);

const getClientIp = (request) => {
  const forwarded = request.headers["x-forwarded-for"];
  return String(Array.isArray(forwarded) ? forwarded[0] : forwarded || request.socket?.remoteAddress || "unknown")
    .split(",")[0]
    .trim();
};

const isRateLimited = (key) => {
  const now = Date.now();
  const active = (requestBuckets.get(key) || []).filter((time) => now - time < WINDOW_MS);
  if (active.length >= MAX_REQUESTS) return true;
  active.push(now);
  requestBuckets.set(key, active);
  return false;
};

const buildMessage = (payload) => {
  const alias = clean(payload.alias, 40) || "Người hỏi ẩn danh";
  const question = clean(payload.question, 600);
  const tag = clean(payload.tag, 40) || "NGL Anonymous";
  const privacy = payload.keepPrivate ? "Riêng tư" : "Có thể công khai";
  const score = Number(payload.interestScore) || 0;
  const location = clean(payload.location, 140) || "Chưa xác định";
  const device = clean(payload.device, 180) || "Chưa xác định";
  const dashboardUrl = clean(payload.dashboardUrl, 300) ||
    "https://phong-dev-portfolio.vercel.app/#/admin-analytics";

  const headline = payload.kind === "hot_lead"
    ? "🔥 KHÁCH VỪA ĐẠT MỨC RẤT QUAN TÂM!"
    : "💌 CÓ TIN NHẮN ẨN DANH MỚI!";

  return [
    headline,
    "━━━━━━━━━━━━━━━━━━━━",
    `👤 Người gửi: ${alias}`,
    `💬 Nội dung: “${question}”`,
    `🏷️ Chủ đề: ${tag}`,
    `🔒 Chế độ: ${privacy}`,
    "",
    "📊 NGỮ CẢNH PHIÊN:",
    `• Điểm quan tâm: ${score}`,
    `• Vị trí gần đúng: ${location}`,
    `• Thiết bị: ${device}`,
    "",
    `👉 Mở Admin: ${dashboardUrl}`,
  ].join("\n");
};

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store, max-age=0");

  if (request.method !== "POST") {
    return response.status(405).json({ success: false, error: "Method not allowed" });
  }

  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
    return response.status(503).json({
      success: false,
      configured: false,
      error: "Telegram notification is not configured",
    });
  }

  const clientIp = getClientIp(request);
  if (isRateLimited(clientIp)) {
    return response.status(429).json({ success: false, error: "Too many requests" });
  }

  const question = clean(request.body?.question, 600);
  if (!question) {
    return response.status(400).json({ success: false, error: "Question is required" });
  }

  try {
    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: process.env.TELEGRAM_CHAT_ID,
          text: buildMessage(request.body || {}),
          disable_web_page_preview: true,
        }),
      }
    );
    const data = await telegramResponse.json().catch(() => ({}));
    if (!telegramResponse.ok || data.ok === false) {
      return response.status(502).json({ success: false, error: "Telegram delivery failed" });
    }
    return response.status(200).json({ success: true, provider: "telegram" });
  } catch (error) {
    return response.status(500).json({ success: false, error: error.message });
  }
}
