/**
 * Email Notification Service for Portfolio & NGL Questions
 * Automatically delivers an email notification to vudinhphong.26001@gmail.com
 * whenever a visitor sends an anonymous question or message.
 */

export const DEFAULT_NOTIFY_EMAIL = "vudinhphong.26001@gmail.com";

export const getNotifyEmail = () =>
  process.env.REACT_APP_NOTIFY_EMAIL || DEFAULT_NOTIFY_EMAIL;

/**
 * Format location string from IP context object
 */
const formatLocation = (ipContext = {}) => {
  const parts = [
    ipContext.city,
    ipContext.region,
    ipContext.country,
  ].filter(Boolean);

  if (parts.length > 0) {
    return parts.join(", ");
  }
  return ipContext.ipAddress ? `IP: ${ipContext.ipAddress}` : "Không rõ vị trí";
};

/**
 * Format device / browser details
 */
const formatDeviceInfo = (ipContext = {}) => {
  const parts = [
    ipContext.os,
    ipContext.browser,
    ipContext.screen ? `Màn hình: ${ipContext.screen}` : null,
  ].filter(Boolean);

  if (parts.length > 0) {
    return parts.join(" • ");
  }
  if (typeof navigator !== "undefined" && navigator.userAgent) {
    return navigator.userAgent;
  }
  return "Không rõ thiết bị";
};

/**
 * Send email notification for a newly submitted question / message
 */
export const sendQuestionEmailNotification = async ({
  id,
  alias = "Người hỏi ẩn danh",
  question,
  contact = "",
  tag = "NGL Anonymous",
  keepPrivate = false,
  ipContext = {},
}) => {
  const targetEmail = getNotifyEmail();
  const locationStr = formatLocation(ipContext);
  const deviceStr = formatDeviceInfo(ipContext);
  const timestampStr = new Date().toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour12: false,
  });

  const privacyLabel = keepPrivate
    ? "🔒 RIÊNG TƯ (Yêu cầu KHÔNG công khai lên bảng tin Q&A)"
    : "🌐 Bình thường (Có thể công khai)";

  const emailSubject = keepPrivate
    ? `🔒 [Portfolio NGL - RIÊNG TƯ] Tin nhắn mới từ ${alias} (${tag})`
    : `💌 [Portfolio NGL] Tin nhắn mới từ ${alias} (${tag})`;

  const dashboardUrl =
    typeof window !== "undefined" && window.location?.origin
      ? `${window.location.origin}/#/admin-analytics`
      : "https://phong-dev-portfolio.vercel.app/#/admin-analytics";

  // 1. Try local or deployed Serverless API endpoint (/api/notify-email)
  try {
    const apiResponse = await fetch("/api/notify-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipient: targetEmail,
        id,
        alias,
        question,
        contact: contact || "Ẩn danh hoàn toàn",
        tag,
        keepPrivate: Boolean(keepPrivate),
        privacy: privacyLabel,
        location: locationStr,
        device: deviceStr,
        timestamp: timestampStr,
        dashboardUrl,
      }),
    });

    if (apiResponse.ok) {
      const data = await apiResponse.json().catch(() => ({}));
      return { success: true, provider: data.provider || "serverless-api" };
    }
  } catch (_apiErr) {
    // Serverless endpoint not present (e.g. static dev server or GitHub Pages)
  }

  // 2. Fallback: FormSubmit AJAX endpoint (zero-config, directly sends to target email)
  try {
    const payload = {
      _subject: emailSubject,
      _template: "table",
      _captcha: "false",
      "Người gửi": alias,
      "Chủ đề (Tag)": tag,
      "Chế độ bảo mật": privacyLabel,
      "Nội dung tin nhắn / câu hỏi": question,
      "Thông tin liên hệ (nếu có)": contact || "Ẩn danh (Không để lại liên hệ)",
      "Thời gian gửi": timestampStr,
      "Vị trí địa lý": locationStr,
      "Thiết bị": deviceStr,
      "Mã câu hỏi (ID)": id || "N/A",
      "Link Quản trị (Admin)": dashboardUrl,
    };

    const formSubmitResponse = await fetch(
      `https://formsubmit.co/ajax/${encodeURIComponent(targetEmail)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    if (formSubmitResponse.ok) {
      const result = await formSubmitResponse.json().catch(() => ({}));
      return { success: true, provider: "formsubmit", result };
    }
  } catch (fsErr) {
    console.warn("FormSubmit email notification error:", fsErr);
  }

  // 3. Fallback: Web3Forms if access key is available in env
  const web3Key = process.env.REACT_APP_WEB3FORMS_ACCESS_KEY;
  if (web3Key) {
    try {
      const web3Response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: web3Key,
          subject: `💌 [Portfolio NGL] Tin nhắn mới từ ${alias}`,
          from_name: "Phong Portfolio Notification",
          message: `Người gửi: ${alias}\nChủ đề: ${tag}\nNội dung: ${question}\nLiên hệ: ${contact || "Không có"}\nVị trí: ${locationStr}\nAdmin: ${dashboardUrl}`,
        }),
      });

      if (web3Response.ok) {
        return { success: true, provider: "web3forms" };
      }
    } catch (_w3Err) {
      // Ignore
    }
  }

  return { success: false, message: "All email providers unavailable" };
};

/**
 * Send a test email to verify that notification delivery works
 */
export const sendTestNotificationEmail = async () => {
  return sendQuestionEmailNotification({
    id: "test-" + Date.now(),
    alias: "Hệ thống Portfolio (Test)",
    question:
      "Đây là tin nhắn thử nghiệm để xác nhận hệ thống thông báo email qua vudinhphong.26001@gmail.com đang hoạt động hoàn hảo!",
    contact: "vudinhphong.26001@gmail.com",
    tag: "Kiểm tra kết nối",
    ipContext: {
      city: "Hồ Chí Minh",
      country: "Việt Nam",
      browser: "Trình duyệt của bạn",
      os: "Hệ điều hành",
    },
  });
};
