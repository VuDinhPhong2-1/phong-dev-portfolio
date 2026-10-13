const getHeader = (request, name) => {
  const value = request.headers[name.toLowerCase()] || request.headers[name];
  return Array.isArray(value) ? value[0] : value;
};

const getForwardedIp = (request) => {
  const forwardedFor = getHeader(request, "x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const forwarded = getHeader(request, "forwarded");
  const forwardedMatch = forwarded?.match(/for="?([^;,"]+)/i);
  if (forwardedMatch?.[1]) {
    return forwardedMatch[1].replace(/^\[/, "").replace(/\]$/, "");
  }

  return (
    getHeader(request, "x-real-ip") ||
    getHeader(request, "cf-connecting-ip") ||
    request.socket?.remoteAddress ||
    ""
  );
};

const decodeHeader = (value) => {
  if (!value) return "";
  try {
    return decodeURIComponent(String(value));
  } catch {
    return String(value);
  }
};

const parseCoordinate = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

export default function handler(request, response) {
  response.setHeader("Cache-Control", "no-store, max-age=0");
  response.status(200).json({
    ipAddress: getForwardedIp(request),
    city: decodeHeader(getHeader(request, "x-vercel-ip-city")),
    region: decodeHeader(getHeader(request, "x-vercel-ip-country-region")),
    country: decodeHeader(getHeader(request, "x-vercel-ip-country")),
    latitude: parseCoordinate(getHeader(request, "x-vercel-ip-latitude")),
    longitude: parseCoordinate(getHeader(request, "x-vercel-ip-longitude")),
    locationSource: "vercel_ip_headers",
  });
}
