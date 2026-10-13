import React, { useState } from "react";
import { faCopy, faCheck, faDownload, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const drawRoundedRect = (ctx, x, y, width, height, radius) => {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
};

const drawWrappedText = (ctx, text, x, y, maxWidth, lineHeight, maxLines = 8) => {
  const words = String(text || "").split(/\s+/);
  const lines = [];
  let line = "";
  words.forEach((word) => {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  });
  if (line) lines.push(line);
  lines.slice(0, maxLines).forEach((value, index) => {
    const finalLine = index === maxLines - 1 && lines.length > maxLines ? `${value.slice(0, -1)}…` : value;
    ctx.fillText(finalLine, x, y + index * lineHeight);
  });
};

const createStoryCanvas = async (item) => {
  await document.fonts?.ready;
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext("2d");

  const background = ctx.createLinearGradient(0, 0, 1080, 1920);
  background.addColorStop(0, "#1e1b4b");
  background.addColorStop(0.46, "#7c3aed");
  background.addColorStop(1, "#ec4899");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, 1080, 1920);

  ctx.globalAlpha = 0.18;
  ctx.fillStyle = "#67e8f9";
  ctx.beginPath(); ctx.arc(920, 260, 300, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#f9a8d4";
  ctx.beginPath(); ctx.arc(120, 1680, 360, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;

  ctx.fillStyle = "#ffffff";
  ctx.font = "800 62px Arial, sans-serif";
  ctx.fillText("NGL", 90, 150);
  ctx.font = "500 28px Arial, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,.78)";
  ctx.fillText("ngl.link/vudinhphong", 90, 202);

  drawRoundedRect(ctx, 75, 300, 930, 520, 54);
  ctx.fillStyle = "rgba(255,255,255,.96)";
  ctx.fill();
  ctx.fillStyle = "#7c3aed";
  ctx.font = "700 28px Arial, sans-serif";
  ctx.fillText(item.tag || "Hỏi ẩn danh", 130, 380);
  ctx.fillStyle = "#111827";
  ctx.font = "700 48px Arial, sans-serif";
  drawWrappedText(ctx, `“${item.question}”`, 130, 475, 820, 66, 5);
  ctx.fillStyle = "#64748b";
  ctx.font = "500 28px Arial, sans-serif";
  ctx.fillText(`— ${item.alias || "Người hỏi ẩn danh"}`, 130, 748);

  drawRoundedRect(ctx, 75, 890, 930, 650, 54);
  ctx.fillStyle = "rgba(15,23,42,.9)";
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath(); ctx.arc(145, 980, 42, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#7c3aed";
  ctx.font = "800 38px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("P", 145, 994);
  ctx.textAlign = "left";
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 32px Arial, sans-serif";
  ctx.fillText("Vũ Đình Phong ✓", 215, 972);
  ctx.fillStyle = "#94a3b8";
  ctx.font = "500 24px Arial, sans-serif";
  ctx.fillText("Full-stack Dev & MOS Instructor", 215, 1010);
  ctx.fillStyle = "#f8fafc";
  ctx.font = "600 42px Arial, sans-serif";
  drawWrappedText(ctx, item.answer || "Mình sẽ trả lời câu hỏi này sớm nhé!", 130, 1115, 820, 58, 6);

  ctx.fillStyle = "rgba(255,255,255,.92)";
  ctx.font = "700 30px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Gửi câu hỏi ẩn danh tại Portfolio của Phong ✨", 540, 1760);
  ctx.font = "500 24px Arial, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,.68)";
  ctx.fillText("1080 × 1920 • Story Card", 540, 1810);
  ctx.textAlign = "left";
  return canvas;
};

export default function NglStoryModal({ item, onClose }) {
  const [copied, setCopied] = useState(false);
  const [imageStatus, setImageStatus] = useState("");

  if (!item) return null;

  const handleCopy = () => {
    const text = `[HỎI ẨN DANH / NGL]\n❓ "${item.question}" - ${item.alias || "Ẩn danh"}\n\n💬 PHONG TRẢ LỜI:\n"${item.answer || "Đang soạn câu trả lời..."}"\n\n👉 Ghé portfolio hỏi ẩn danh cho Phong nhé!`;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = async () => {
    const canvas = await createStoryCanvas(item);
    const link = document.createElement("a");
    link.download = `phong-ngl-story-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    setImageStatus("Đã tải ảnh Story HD.");
  };

  const handleCopyImage = async () => {
    if (!navigator.clipboard || typeof window.ClipboardItem === "undefined") {
      setImageStatus("Trình duyệt chưa hỗ trợ copy ảnh; bạn hãy dùng nút tải ảnh.");
      return;
    }
    const canvas = await createStoryCanvas(item);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    await navigator.clipboard.write([new window.ClipboardItem({ "image/png": blob })]);
    setImageStatus("Đã copy ảnh Story vào clipboard.");
  };

  return (
    <div className="ngl-modal-overlay" onClick={onClose}>
      <div className="ngl-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="ngl-modal-header">
          <h3>📸 Xem trước Story Card (NGL 9:16)</h3>
          <button type="button" className="ngl-modal-close" onClick={onClose}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <p className="ngl-modal-tip">
          Bạn có thể chụp màn hình tấm thẻ 9:16 dưới đây để đăng trực tiếp lên Facebook / Instagram Story!
        </p>

        {/* 9:16 Story Canvas Container */}
        <div className="ngl-story-card">
          <div className="ngl-story-bg-mesh" />

          {/* Story Top Bar */}
          <div className="ngl-story-top">
            <div className="story-logo">
              <span className="story-logo-badge">NGL</span>
              <span className="story-logo-text">ngl.link/vudinhphong</span>
            </div>
            <span className="story-timestamp">Story Reply</span>
          </div>

          {/* Question Box */}
          <div className="ngl-story-question">
            <div className="story-question-pill">
              <span>Hỏi ẩn danh</span>
              {item.tag ? <span className="pill-tag">{item.tag}</span> : null}
            </div>
            <p className="story-question-text">"{item.question}"</p>
            <span className="story-sender">— {item.alias || "Người hỏi ẩn danh"}</span>
          </div>

          {/* Phong Answer Box */}
          <div className="ngl-story-answer">
            <div className="story-author-header">
              <div className="story-avatar">P</div>
              <div>
                <strong>Vũ Đình Phong ✓</strong>
                <small>Full-stack Dev & MOS Instructor</small>
              </div>
            </div>
            <p className="story-answer-text">
              {item.answer || "Chưa nhập câu trả lời. Bạn nhập và lưu câu trả lời trước nhé!"}
            </p>
          </div>

          {/* Story Footer Call to Action */}
          <div className="ngl-story-footer">
            <span>✨ Hỏi ẩn danh cho Phong tại trang portfolio</span>
          </div>
        </div>

        <div className="ngl-modal-actions">
          <button type="button" className="button-primary" onClick={handleDownload}>
            <FontAwesomeIcon icon={faDownload} />
            <span>Tải ảnh 1080×1920</span>
          </button>
          <button type="button" className="button-secondary" onClick={handleCopyImage}>
            <FontAwesomeIcon icon={faCopy} />
            <span>Copy ảnh</span>
          </button>
          <button type="button" className="button-primary" onClick={handleCopy}>
            <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
            <span>{copied ? "Đã copy nội dung!" : "Sao chép text câu trả lời"}</span>
          </button>
          <button type="button" className="button-secondary" onClick={onClose}>
            Đóng
          </button>
        </div>
        {imageStatus && <p className="ngl-modal-tip" role="status">{imageStatus}</p>}
      </div>
    </div>
  );
}
