import { useState } from "react";
import { getLocationWithAddress } from "../services/locationService";

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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-md">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 px-7 py-8 text-white">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-2xl">
            📍
          </div>

          <h2 className="text-2xl font-bold">
            Cho phép truy cập vị trí
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-300">
            Website cần quyền truy cập vị trí của bạn để xác định khu vực
            truy cập và hiển thị thông tin phù hợp.
          </p>
        </div>

        {/* Body */}
        <div className="px-7 py-6">
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="flex gap-3">
              <span className="text-xl">🔐</span>

              <div>
                <p className="font-semibold text-slate-900">
                  Quyền vị trí là bắt buộc
                </p>

                <p className="mt-1 text-sm leading-5 text-slate-500">
                  Bạn cần cho phép trình duyệt truy cập vị trí để tiếp tục
                  vào trang web.
                </p>
              </div>
            </div>
          </div>

          {error ? (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-5 text-red-700">
              <div className="font-semibold">Không thể tiếp tục</div>
              <div className="mt-1">{error}</div>
            </div>
          ) : null}

          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="mt-6 w-full rounded-2xl bg-slate-900 px-5 py-3.5 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Đang xác định vị trí...
              </span>
            ) : (
              "Cho phép truy cập vị trí"
            )}
          </button>

          <p className="mt-4 text-center text-xs leading-5 text-slate-400">
            Nếu bạn chọn “Chặn” trên trình duyệt, hãy mở cài đặt quyền
            Location của website và cho phép lại.
          </p>
        </div>
      </div>
    </div>
  );
}