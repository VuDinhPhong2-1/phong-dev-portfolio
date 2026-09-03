export function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Trình duyệt không hỗ trợ định vị."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        resolve({
          latitude,
          longitude,
          accuracy,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}

export async function getAddressFromCoordinates(
  latitude,
  longitude
) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=vi`
    );

    if (!response.ok) {
      throw new Error("Không thể lấy địa chỉ.");
    }

    const data = await response.json();

    return {
      address: data.display_name || null,

      road: data.address?.road || null,

      ward:
        data.address?.suburb ||
        data.address?.village ||
        data.address?.town ||
        null,

      district:
        data.address?.county ||
        data.address?.district ||
        null,

      city:
        data.address?.city ||
        data.address?.municipality ||
        data.address?.state ||
        null,

      country: data.address?.country || null,
    };
  } catch (error) {
    console.error("❌ Reverse geocoding error:", error);
    return null;
  }
}

export async function getLocationWithAddress() {
  const coordinates = await getCurrentLocation();

  const address = await getAddressFromCoordinates(
    coordinates.latitude,
    coordinates.longitude
  );

  return {
    ...coordinates,
    ...address,
  };
}