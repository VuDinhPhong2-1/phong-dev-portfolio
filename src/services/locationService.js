// src/services/locationService.js

/**
 * Lấy GPS hiện tại của trình duyệt.
 *
 * Lưu ý:
 * Browser không cho website tự động ép người dùng
 * phải bấm "Allow". Người dùng vẫn có quyền Deny.
 */
export function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Trình duyệt không hỗ trợ định vị."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        if (
          typeof latitude !== "number" ||
          typeof longitude !== "number"
        ) {
          reject(new Error("Không nhận được tọa độ GPS."));
          return;
        }

        resolve({
          latitude,
          longitude,
          accuracy:
            typeof accuracy === "number"
              ? accuracy
              : null,
        });
      },
      (error) => {
        let message = "Không thể lấy vị trí.";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            message =
              "Bạn đã từ chối quyền truy cập vị trí. Vui lòng cho phép Location trong trình duyệt.";
            break;

          case error.POSITION_UNAVAILABLE:
            message =
              "Không thể xác định vị trí hiện tại. Hãy kiểm tra GPS hoặc mạng.";
            break;

          case error.TIMEOUT:
            message =
              "Lấy vị trí quá lâu. Vui lòng thử lại.";
            break;

          default:
            message = error.message || message;
        }

        reject(new Error(message));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  });
}


/**
 * Reverse geocoding:
 * Latitude + Longitude -> địa chỉ.
 *
 * Không dùng Nominatim trực tiếp nữa vì trong trường hợp
 * hiện tại request đang bị ERR_CONNECTION_RESET.
 */
export async function getAddressFromCoordinates(
  latitude,
  longitude
) {
  if (
    typeof latitude !== "number" ||
    typeof longitude !== "number"
  ) {
    throw new Error("Tọa độ không hợp lệ.");
  }

  const url =
    `https://api.bigdatacloud.net/data/reverse-geocode-client` +
    `?latitude=${encodeURIComponent(latitude)}` +
    `&longitude=${encodeURIComponent(longitude)}` +
    `&localityLanguage=vi`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Reverse geocoding thất bại (${response.status}).`
    );
  }

  const data = await response.json();

  const localityInfo = data.localityInfo || {};

  const administrative = Array.isArray(
    localityInfo.administrative
  )
    ? localityInfo.administrative
    : [];

  const getAdminName = (order) => {
    const item = administrative.find(
      (entry) => entry.order === order
    );

    return (
      item?.name ||
      item?.description ||
      null
    );
  };

  const address =
    data.locality ||
    data.city ||
    data.principalSubdivision ||
    null;

  const country =
    data.countryName || null;

  return {
    address:
      data.localityInfo?.informative?.[0]?.name ||
      data.locality ||
      data.city ||
      [
        data.locality,
        data.city,
        data.principalSubdivision,
        data.countryName,
      ]
        .filter(Boolean)
        .join(", ") ||
      null,

    road:
      data.localityInfo?.informative?.find(
        (item) =>
          item.description
            ?.toLowerCase()
            .includes("road")
      )?.name || null,

    ward:
      data.locality ||
      getAdminName(8) ||
      null,

    district:
      getAdminName(7) ||
      data.city ||
      null,

    city:
      data.city ||
      data.principalSubdivision ||
      null,

    country,

    countryCode:
      data.countryCode || null,

    formattedAddress:
      [
        address,
        country,
      ]
        .filter(Boolean)
        .join(", "),
  };
}


/**
 * Lấy đầy đủ:
 *
 * latitude
 * longitude
 * accuracy
 * address
 * road
 * ward
 * district
 * city
 * country
 */
export async function getLocationWithAddress() {
  // Bước 1: bắt buộc lấy GPS
  const coordinates = await getCurrentLocation();

  // Bước 2: bắt buộc reverse geocoding
  const address = await getAddressFromCoordinates(
    coordinates.latitude,
    coordinates.longitude
  );

  if (!address?.address && !address?.formattedAddress) {
    throw new Error(
      "Không xác định được địa chỉ từ tọa độ."
    );
  }

  return {
    ...coordinates,
    ...address,

    // Đảm bảo luôn có hai field này
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    accuracy: coordinates.accuracy,
  };
}