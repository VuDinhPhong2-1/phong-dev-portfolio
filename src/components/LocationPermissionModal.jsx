import { useState } from "react";
import { getLocationWithAddress } from "../services/locationService";
import "./LocationPermissionModal.css";

export default function LocationPermissionModal({ onSuccess }) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);

      const location = await getLocationWithAddress();

      console.log("📍 Location:", location);

      onSuccess?.(location);
    } catch (error) {
      console.error("❌ Không lấy được vị trí:", error);

      // Không lấy được vị trí vẫn cho phép vào website
      onSuccess?.(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onSuccess?.(null);
  };

  return (
    <div className="location-modal-overlay">
      <div className="location-modal">
        <div className="location-modal-icon">
          <span>📍</span>
        </div>

        <div className="location-modal-content">
          <span className="location-modal-badge">
            LOCATION ACCESS
          </span>

          <h2>
            Xác nhận bạn muốn
            <br />
            vào website?
          </h2>

          <p>
            Website có thể xin quyền truy cập vị trí hiện tại
            của bạn để cung cấp trải nghiệm phù hợp hơn.
          </p>

          <div className="location-info">
            <div className="location-info-item">
              <span className="location-info-icon">🌐</span>

              <div>
                <strong>Vị trí của bạn</strong>
                <span>
                  Chỉ sử dụng khi bạn cho phép
                </span>
              </div>
            </div>

            <div className="location-info-item">
              <span className="location-info-icon">🔒</span>

              <div>
                <strong>Quyền riêng tư</strong>
                <span>
                  Bạn có thể từ chối bất cứ lúc nào
                </span>
              </div>
            </div>
          </div>

          <div className="location-modal-actions">
            <button
              type="button"
              className="location-btn location-btn-cancel"
              onClick={handleCancel}
              disabled={loading}
            >
              Hủy
            </button>

            <button
              type="button"
              className="location-btn location-btn-confirm"
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="location-spinner" />
                  Đang lấy vị trí...
                </>
              ) : (
                <>
                  Cho phép
                  <span className="location-arrow">→</span>
                </>
              )}
            </button>
          </div>

          <p className="location-modal-note">
            Bằng cách tiếp tục, bạn đồng ý cho website
            truy cập vị trí thiết bị của mình.
          </p>
        </div>
      </div>
    </div>
  );
}