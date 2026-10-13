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
  const locationStr = formatLocation(ipContext);
  const deviceStr = formatDeviceInfo(ipContext);
  const timestampStr = new Date().toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour12: false,
  });

  const privacyLabel = keepPrivate
    ? "🔒 RIÊNG TƯ (Yêu cầu KHÔNG công khai lên bảng tin Q&A)"
    : "🌐 Bình thường (Có thể công khai)";

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
    const error = await apiResponse.json().catch(() => ({}));
    return { success: false, message: error.error || "Email notification request failed" };
  } catch (apiError) {
    return { success: false, message: apiError.message || "Email notification service unavailable" };
  }
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
