const getDashboardUrl = () => {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}${window.location.pathname}#/admin-analytics`;
};

export const sendQuestionTelegramNotification = async (payload = {}) => {
  const response = await fetch("/api/notify-telegram", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      alias: payload.alias,
      kind: payload.kind || "question",
      question: payload.question,
      tag: payload.tag,
      keepPrivate: payload.keepPrivate,
      interestScore: payload.interestScore || 0,
      location: [payload.ipContext?.city, payload.ipContext?.region, payload.ipContext?.country]
        .filter(Boolean)
        .join(", "),
      device: payload.ipContext?.device || "",
      dashboardUrl: getDashboardUrl(),
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Không thể gửi thông báo Telegram.");
  }
  return data;
};

export const sendHotLeadTelegramNotification = ({ score, action, ipContext, device }) =>
  sendQuestionTelegramNotification({
    kind: "hot_lead",
    alias: "Khách ẩn danh",
    question: `Hành vi vừa ghi nhận: ${action}`,
    tag: "Hot lead",
    keepPrivate: true,
    interestScore: score,
    ipContext: { ...ipContext, device },
  });

export const sendTestTelegramNotification = () =>
  sendQuestionTelegramNotification({
    alias: "Hệ thống Portfolio",
    question: "Đây là tin nhắn kiểm tra kết nối Telegram.",
    tag: "Kiểm tra hệ thống",
    keepPrivate: true,
  });
