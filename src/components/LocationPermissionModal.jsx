import { useState } from "react";
import { getLocationWithAddress } from "../services/locationService";

export default function LocationPermissionModal({ onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const location = await getLocationWithAddress();
      /**
       * CHỈ gọi onSuccess khi đã có đầy đủ location.
       */
      if (
        typeof location.latitude !== "number" ||
        typeof location.longitude !== "number" ||
        !location.address
      ) {
        throw new Error(
          "Chưa lấy đủ thông tin vị trí và địa chỉ."
        );
      }

      onSuccess?.(location);
    } catch (error) {
      console.error("❌ Location error:", error);

      setError(
        error?.message ||
          "Không thể xác định vị trí của bạn."
      );

      /**
       * KHÔNG gọi onSuccess(null)
       *
       * => Không cho vào website.
       */
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="location-overlay">
      <div className="location-modal">

        <div className="location-icon">
          📍
        </div>

        <div className="location-badge">
          QUYỀN RIÊNG TƯ
        </div>

        <h1>
          Cho phép truy cập vị trí
        </h1>

        <p className="location-description">
          Website cần quyền truy cập vị trí của bạn
          để xác định khu vực truy cập và hiển thị
          thông tin phù hợp.
        </p>

        <div className="location-required">
          <div className="location-required-icon">
            🔐
          </div>

          <div>
            <strong>
              Quyền vị trí là bắt buộc
            </strong>

            <span>
              Bạn cần cho phép trình duyệt truy cập
              vị trí để tiếp tục.
            </span>
          </div>
        </div>

        {error ? (
          <div className="location-error">
            <strong>
              Không thể tiếp tục
            </strong>

            <span>
              {error}
            </span>

            <small>
              Hãy kiểm tra biểu tượng 🔒 trên thanh
              địa chỉ trình duyệt và bật quyền
              Location, sau đó thử lại.
            </small>
          </div>
        ) : null}

        <button
          type="button"
          onClick={handleConfirm}
          disabled={loading}
          className="location-button"
        >
          {loading
            ? "Đang xác định vị trí..."
            : "Cho phép truy cập vị trí →"}
        </button>

        <p className="location-note">
          Nếu bạn chọn "Chặn" trên trình duyệt,
          website sẽ không thể tiếp tục cho đến khi
          quyền Location được bật lại.
        </p>

      </div>
    </div>
  );
}