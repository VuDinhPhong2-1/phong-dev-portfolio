import { useState } from "react";
import { getLocationWithAddress } from "../services/locationService";
import "./LocationPermissionModal.css";

export default function LocationPermissionModal({ onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    setLoading(true);
    setError("");

    try {
      const location = await getLocationWithAddress();

      console.log("📍 Location:", location);
      console.log("📍 Latitude:", location?.latitude);
      console.log("📍 Longitude:", location?.longitude);
      console.log("📍 Accuracy:", location?.accuracy);
      console.log("📍 Address:", location?.address);

      // Bắt buộc phải có GPS
      if (
        !location ||
        typeof location.latitude !== "number" ||
        typeof location.longitude !== "number"
      ) {
        throw new Error(
          "Không lấy được vị trí của bạn. Vui lòng cho phép truy cập vị trí để tiếp tục."
        );
      }

      // Nếu muốn BẮT BUỘC phải lấy được địa chỉ
      if (!location.address) {
        throw new Error(
          "Không thể xác định địa chỉ từ vị trí của bạn. Vui lòng thử lại."
        );
      }

      // Chỉ khi đầy đủ dữ liệu mới cho vào web
      onSuccess?.(location);
    } catch (error) {
      console.error("❌ Location error:", error);

      let message =
        "Bạn cần cho phép truy cập vị trí để tiếp tục vào website.";

      if (error?.code === 1) {
        message =
          "Bạn đã từ chối quyền truy cập vị trí. Hãy cho phép Location trong cài đặt trình duyệt rồi thử lại.";
      } else if (error?.code === 2) {
        message =
          "Không thể xác định vị trí hiện tại. Vui lòng kiểm tra GPS/vị trí của thiết bị rồi thử lại.";
      } else if (error?.code === 3) {
        message =
          "Lấy vị trí quá lâu. Vui lòng bật Location và thử lại.";
      } else if (error?.message) {
        message = error.message;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="location-modal-overlay">
      <div className="location-modal">
        <div className="location-modal-content">
          <div className="location-modal-icon">
            📍
          </div>

          <div className="location-modal-badge">QUYỀN RIÊNG TƯ</div>

          <h2>Cho phép truy cập vị trí</h2>

          <p>
            Website cần quyền truy cập vị trí của bạn để xác định khu vực
            truy cập và hiển thị thông tin phù hợp.
          </p>

          <div className="location-info">
            <div className="location-info-item">
              <span className="location-info-icon">🔐</span>

              <div>
                <strong>Quyền vị trí là bắt buộc</strong>
                <span>Bạn cần cho phép trình duyệt truy cập vị trí để tiếp tục.</span>
              </div>
            </div>
          </div>

          {error ? (
            <div className="location-modal-error" role="alert">
              <strong>Không thể tiếp tục</strong>
              <span>{error}</span>
            </div>
          ) : null}

          <div className="location-modal-actions">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className="location-btn location-btn-confirm"
            >
              {loading ? (
                <>
                  <span className="location-spinner" />
                  Đang xác định vị trí...
                </>
              ) : (
                <>
                  Cho phép truy cập vị trí
                  <span className="location-arrow">→</span>
                </>
              )}
            </button>
          </div>

          <p className="location-modal-note">
            Nếu bạn chọn “Chặn” trên trình duyệt, hãy mở cài đặt quyền
            Location của website và cho phép lại.
          </p>
        </div>
      </div>
    </div>
  );
}