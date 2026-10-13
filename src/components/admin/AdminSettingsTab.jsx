import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faCogs,
  faDownload,
  faEnvelope,
  faPaperPlane,
  faShieldHalved,
} from "@fortawesome/free-solid-svg-icons";
import { getNotifyEmail, sendTestNotificationEmail } from "../../services/emailNotificationService";
import { sendTestTelegramNotification } from "../../services/telegramNotificationService";

export default function AdminSettingsTab({ questions = [], showToast }) {
  const [isSending, setIsSending] = useState(false);
  const [testResult, setTestResult] = useState("");
  const [isTestingTelegram, setIsTestingTelegram] = useState(false);
  const [telegramResult, setTelegramResult] = useState("");

  const handleTestEmail = async () => {
    setIsSending(true);
    setTestResult("");
    try {
      const res = await sendTestNotificationEmail();
      if (res.success) {
        setTestResult(`✅ Gửi thành công tới ${getNotifyEmail()} (Provider: ${res.provider})`);
        showToast("✉️ Đã gửi email test thành công!");
      } else {
        setTestResult(`⚠️ Gửi thất bại: ${res.error || "Không rõ nguyên nhân"}`);
      }
    } catch (err) {
      setTestResult(`❌ Lỗi: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleTestTelegram = async () => {
    setIsTestingTelegram(true);
    setTelegramResult("");
    try {
      await sendTestTelegramNotification();
      setTelegramResult("✅ Telegram Bot đã nhận tin nhắn kiểm tra.");
      showToast("✈️ Đã gửi Telegram test thành công!");
    } catch (error) {
      setTelegramResult(`⚠️ ${error.message}`);
    } finally {
      setIsTestingTelegram(false);
    }
  };

  const handleExportBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(questions, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `portfolio_qa_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("💾 Đã tải xuống file sao lưu JSON!");
  };

  return (
    <div className="adm-settings-manager">
      <div className="adm-toolbar">
        <div className="adm-toolbar-title">
          <h2>
            <FontAwesomeIcon icon={faCogs} style={{ marginRight: 8, color: "#a855f7" }} />
            Cài đặt & Tiện ích Hệ thống
          </h2>
          <p>Kiểm tra thông báo email, sao lưu dữ liệu và cấu hình hệ thống quản trị.</p>
        </div>
      </div>

      <div style={{ display: "grid", gap: 20 }}>
        <div className="adm-question-card">
          <h3 style={{ fontSize: 16, margin: "0 0 8px", color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
            <FontAwesomeIcon icon={faPaperPlane} style={{ color: "#38bdf8" }} />
            Telegram Bot thông báo tức thì
          </h3>
          <p style={{ color: "#94a3b8", fontSize: 14, margin: "0 0 16px" }}>
            Cấu hình <code>TELEGRAM_BOT_TOKEN</code> và <code>TELEGRAM_CHAT_ID</code> trên Vercel để nhận tin NGL mới.
          </p>
          <button type="button" className="adm-btn-primary" onClick={handleTestTelegram} disabled={isTestingTelegram}>
            {isTestingTelegram ? "Đang kiểm tra..." : "Gửi Telegram test"}
          </button>
          {telegramResult && (
            <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 8, background: "rgba(56,189,248,0.1)", color: "#bae6fd", fontSize: 13 }}>
              {telegramResult}
            </div>
          )}
        </div>

        <div className="adm-question-card">
          <h3 style={{ fontSize: 16, margin: "0 0 8px", color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
            <FontAwesomeIcon icon={faEnvelope} style={{ color: "#818cf8" }} />
            Thông báo Email Tự động khi có Tin nhắn mới
          </h3>
          <p style={{ color: "#94a3b8", fontSize: 14, margin: "0 0 16px" }}>
            Hệ thống tự động gửi thông báo chi tiết (nội dung, người gửi, tag, IP, vị trí) tới email:{" "}
            <strong style={{ color: "#fff" }}>{getNotifyEmail()}</strong>.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              type="button"
              className="adm-btn-primary"
              onClick={handleTestEmail}
              disabled={isSending}
            >
              {isSending ? "⏳ Đang gửi thử..." : "✉️ Gửi Email Test Xác Nhận"}
            </button>
          </div>
          {testResult && (
            <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 8, background: "rgba(99,102,241,0.12)", color: "#c7d2fe", fontSize: 13 }}>
              {testResult}
            </div>
          )}
        </div>

        <div className="adm-question-card">
          <h3 style={{ fontSize: 16, margin: "0 0 8px", color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
            <FontAwesomeIcon icon={faDownload} style={{ color: "#34d399" }} />
            Sao lưu Dữ liệu Câu hỏi & Tin nhắn (Backup JSON)
          </h3>
          <p style={{ color: "#94a3b8", fontSize: 14, margin: "0 0 16px" }}>
            Xuất toàn bộ {questions.length} câu hỏi và tin nhắn ẩn danh trong cơ sở dữ liệu thành file JSON dự phòng.
          </p>
          <button
            type="button"
            className="adm-btn-sec"
            onClick={handleExportBackup}
            disabled={questions.length === 0}
          >
            <FontAwesomeIcon icon={faDownload} /> Tải file JSON ({questions.length} mục)
          </button>
        </div>

        <div className="adm-question-card">
          <h3 style={{ fontSize: 16, margin: "0 0 12px", color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
            <FontAwesomeIcon icon={faShieldHalved} style={{ color: "#38bdf8" }} />
            Trạng thái Dịch vụ Nền tảng
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            <div style={{ padding: 12, borderRadius: 10, background: "rgba(0,0,0,0.2)" }}>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>Firebase Auth & Rules</div>
              <strong style={{ color: "#34d399", display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                <FontAwesomeIcon icon={faCheckCircle} /> Hoạt động bình thường
              </strong>
            </div>
            <div style={{ padding: 12, borderRadius: 10, background: "rgba(0,0,0,0.2)" }}>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>Cloud Firestore Realtime</div>
              <strong style={{ color: "#34d399", display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                <FontAwesomeIcon icon={faCheckCircle} /> Đồng bộ trực tiếp
              </strong>
            </div>
            <div style={{ padding: 12, borderRadius: 10, background: "rgba(0,0,0,0.2)" }}>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>NGL Dynamic Prompts</div>
              <strong style={{ color: "#34d399", display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                <FontAwesomeIcon icon={faCheckCircle} /> Bật & Khả dụng
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
