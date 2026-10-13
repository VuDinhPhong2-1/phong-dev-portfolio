/**
 * Vercel Serverless Function: /api/notify-email
 * Receives question payload and delivers email notification to vudinhphong.26001@gmail.com
 */

const clean = (value, maxLength = 600) => String(value || "").trim().slice(0, maxLength);
const notificationBuckets = new Map();
const escapeHtml = (value) => clean(value).replace(/[&<>'"]/g, (char) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "'": "&#39;",
  '"': "&quot;",
}[char]));

const isRateLimited = (request) => {
  const forwarded = request.headers["x-forwarded-for"];
  const key = String(Array.isArray(forwarded) ? forwarded[0] : forwarded || request.socket?.remoteAddress || "unknown")
    .split(",")[0]
    .trim();
  const now = Date.now();
  const attempts = (notificationBuckets.get(key) || []).filter((time) => now - time < 5 * 60 * 1000);
  if (attempts.length >= 8) return true;
  attempts.push(now);
  notificationBuckets.set(key, attempts);
  return false;
};

export default async function handler(request, response) {
  // Allow CORS for development & cross-origin API calls
  const requestOrigin = request.headers.origin;
  if (requestOrigin) response.setHeader("Access-Control-Allow-Origin", requestOrigin);
  response.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT",
  );
  response.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
  );

  if (request.method === "OPTIONS") {
    return response.status(200).end();
  }

  if (request.method !== "POST") {
    return response.status(405).json({ error: "Method not allowed" });
  }

  if (isRateLimited(request)) {
    return response.status(429).json({ success: false, error: "Too many requests" });
  }

  const {
    alias = "Người hỏi ẩn danh",
    question = "",
    contact = "",
    tag = "NGL Anonymous",
    keepPrivate = false,
    privacy = "",
    location = "",
    device = "",
    timestamp = "",
  } = request.body || {};

  const recipient = process.env.NOTIFY_EMAIL || "vudinhphong.26001@gmail.com";
  const safeAlias = escapeHtml(clean(alias, 40));
  const safeQuestion = escapeHtml(clean(question, 600));
  const safeContact = escapeHtml(clean(contact, 80));
  const safeTag = escapeHtml(clean(tag, 40));
  const safeLocation = escapeHtml(clean(location, 180));
  const safeDevice = escapeHtml(clean(device, 200));
  const safeTimestamp = escapeHtml(clean(timestamp, 80));
  const safeDashboardUrl = escapeHtml(
    clean(process.env.ADMIN_DASHBOARD_URL, 300) ||
      "https://phong-dev-portfolio.vercel.app/#/admin-analytics"
  );

  if (!clean(question, 600)) {
    return response.status(400).json({ success: false, error: "Question is required" });
  }

  const privacyText =
    privacy ||
    (keepPrivate
      ? "🔒 RIÊNG TƯ (Yêu cầu KHÔNG công khai lên bảng tin Q&A)"
      : "🌐 Bình thường (Có thể công khai)");
  const safePrivacyText = escapeHtml(clean(privacyText, 120));

  const emailSubject = keepPrivate
    ? `🔒 [Portfolio NGL - RIÊNG TƯ] Tin nhắn mới từ ${clean(alias, 40)} (${clean(tag, 40)})`
    : `💌 [Portfolio NGL] Tin nhắn mới từ ${clean(alias, 40)} (${clean(tag, 40)})`;

  // 1. If RESEND_API_KEY is configured in Vercel environment variables
  if (process.env.RESEND_API_KEY) {
    try {
      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from:
            process.env.RESEND_FROM_EMAIL ||
            "Portfolio NGL <onboarding@resend.dev>",
          to: recipient,
          subject: emailSubject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
              <h2 style="color: #4f46e5; margin-top: 0; font-size: 20px;">💌 Bạn có tin nhắn ẩn danh mới!</h2>
              <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px; font-weight: bold; width: 140px; color: #475569;">Người gửi:</td>
                  <td style="padding: 10px; color: #0f172a; font-weight: 600;">${safeAlias}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px; font-weight: bold; color: #475569;">Chủ đề (Tag):</td>
                  <td style="padding: 10px;"><span style="background: #e0e7ff; color: #3730a3; padding: 3px 10px; border-radius: 999px; font-size: 13px; font-weight: 500;">${safeTag}</span></td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px; font-weight: bold; color: #475569;">Chế độ bảo mật:</td>
                  <td style="padding: 10px; color: ${keepPrivate ? "#b91c1c" : "#15803d"}; font-weight: 600;">${safePrivacyText}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px; font-weight: bold; color: #475569; vertical-align: top;">Nội dung:</td>
                  <td style="padding: 10px; color: #0f172a; font-size: 15px; line-height: 1.6; background: #f8fafc; border-radius: 8px;">${safeQuestion}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px; font-weight: bold; color: #475569;">Liên hệ:</td>
                  <td style="padding: 10px; color: #0f172a;">${safeContact || "Ẩn danh hoàn toàn"}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px; font-weight: bold; color: #475569;">Thời gian:</td>
                  <td style="padding: 10px; color: #64748b;">${safeTimestamp}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px; font-weight: bold; color: #475569;">Vị trí & Thiết bị:</td>
                  <td style="padding: 10px; color: #64748b; font-size: 13px;">${safeLocation} • ${safeDevice}</td>
                </tr>
              </table>
              <div style="margin-top: 24px; text-align: center;">
                <a href="${safeDashboardUrl}" style="display: inline-block; background: #4f46e5; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Mở Dashboard Quản Trị & Trả Lời</a>
              </div>
            </div>
          `,
        }),
      });

      if (resendRes.ok) {
        const data = await resendRes.json();
        return response
          .status(200)
          .json({ success: true, provider: "resend", data });
      }
    } catch (resendError) {
      console.error("Resend delivery failed:", resendError);
    }
  }

  // 2. Server-side forward to FormSubmit
  try {
    const fsRes = await fetch(
      `https://formsubmit.co/ajax/${encodeURIComponent(recipient)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          _subject: emailSubject,
          _template: "table",
          _captcha: "false",
          "Người gửi": clean(alias, 40),
          "Chủ đề (Tag)": clean(tag, 40),
          "Chế độ bảo mật": clean(privacyText, 120),
          "Nội dung": clean(question, 600),
          "Liên hệ": clean(contact, 80) || "Ẩn danh",
          "Thời gian": clean(timestamp, 80),
          "Vị trí": clean(location, 180),
          "Thiết bị": clean(device, 200),
          "Link Dashboard Admin": clean(
            process.env.ADMIN_DASHBOARD_URL ||
              "https://phong-dev-portfolio.vercel.app/#/admin-analytics",
            300
          ),
        }),
      },
    );

    const fsData = await fsRes.json().catch(() => ({}));
    if (!fsRes.ok) {
      return response.status(502).json({ success: false, error: "Email delivery failed" });
    }
    return response
      .status(200)
      .json({ success: true, provider: "formsubmit", data: fsData });
  } catch (fsErr) {
    return response.status(500).json({ success: false, error: fsErr.message });
  }
}
