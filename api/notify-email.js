/**
 * Vercel Serverless Function: /api/notify-email
 * Receives question payload and delivers email notification to vudinhphong.26001@gmail.com
 */

export default async function handler(request, response) {
  // Allow CORS for development & cross-origin API calls
  response.setHeader("Access-Control-Allow-Credentials", "true");
  response.setHeader("Access-Control-Allow-Origin", "*");
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

  const {
    recipient = "vudinhphong.26001@gmail.com",
    alias = "Người hỏi ẩn danh",
    question = "",
    contact = "",
    tag = "NGL Anonymous",
    keepPrivate = false,
    privacy = "",
    location = "",
    device = "",
    timestamp = "",
    dashboardUrl = "",
  } = request.body || {};

  const privacyText =
    privacy ||
    (keepPrivate
      ? "🔒 RIÊNG TƯ (Yêu cầu KHÔNG công khai lên bảng tin Q&A)"
      : "🌐 Bình thường (Có thể công khai)");

  const emailSubject = keepPrivate
    ? `🔒 [Portfolio NGL - RIÊNG TƯ] Tin nhắn mới từ ${alias} (${tag})`
    : `💌 [Portfolio NGL] Tin nhắn mới từ ${alias} (${tag})`;

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
                  <td style="padding: 10px; color: #0f172a; font-weight: 600;">${alias}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px; font-weight: bold; color: #475569;">Chủ đề (Tag):</td>
                  <td style="padding: 10px;"><span style="background: #e0e7ff; color: #3730a3; padding: 3px 10px; border-radius: 999px; font-size: 13px; font-weight: 500;">${tag}</span></td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px; font-weight: bold; color: #475569;">Chế độ bảo mật:</td>
                  <td style="padding: 10px; color: ${keepPrivate ? "#b91c1c" : "#15803d"}; font-weight: 600;">${privacyText}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px; font-weight: bold; color: #475569; vertical-align: top;">Nội dung:</td>
                  <td style="padding: 10px; color: #0f172a; font-size: 15px; line-height: 1.6; background: #f8fafc; border-radius: 8px;">${question}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px; font-weight: bold; color: #475569;">Liên hệ:</td>
                  <td style="padding: 10px; color: #0f172a;">${contact || "Ẩn danh hoàn toàn"}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px; font-weight: bold; color: #475569;">Thời gian:</td>
                  <td style="padding: 10px; color: #64748b;">${timestamp}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px; font-weight: bold; color: #475569;">Vị trí & Thiết bị:</td>
                  <td style="padding: 10px; color: #64748b; font-size: 13px;">${location} • ${device}</td>
                </tr>
              </table>
              <div style="margin-top: 24px; text-align: center;">
                <a href="${dashboardUrl || "https://phong-dev-portfolio.vercel.app/#/admin-analytics"}" style="display: inline-block; background: #4f46e5; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Mở Dashboard Quản Trị & Trả Lời</a>
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
          "Người gửi": alias,
          "Chủ đề (Tag)": tag,
          "Chế độ bảo mật": privacyText,
          "Nội dung": question,
          "Liên hệ": contact || "Ẩn danh",
          "Thời gian": timestamp,
          "Vị trí": location,
          "Thiết bị": device,
          "Link Dashboard Admin": dashboardUrl,
        }),
      },
    );

    const fsData = await fsRes.json().catch(() => ({}));
    return response
      .status(200)
      .json({ success: true, provider: "formsubmit", data: fsData });
  } catch (fsErr) {
    return response.status(500).json({ success: false, error: fsErr.message });
  }
}
