import { useState } from "react";
import { getLocationWithAddress } from "../services/locationService";

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

      // Không lấy được GPS vẫn cho vào website
      onSuccess?.(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Hủy cũng cho vào website nhưng không lấy vị trí
    onSuccess?.(null);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-[90%] max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="text-xl font-semibold text-gray-900">
          Xác nhận bạn muốn vào web?
        </h2>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="rounded-xl border border-gray-300 px-5 py-2.5 text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
          >
            Hủy
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="rounded-xl bg-black px-5 py-2.5 text-white transition hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Đang xử lý..." : "Xác nhận"}
          </button>
        </div>
      </div>
    </div>
  );
}