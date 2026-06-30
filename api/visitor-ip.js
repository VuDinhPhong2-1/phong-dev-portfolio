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

export default function handler(request, response) {
  response.setHeader("Cache-Control", "no-store, max-age=0");
  response.status(200).json({
    ipAddress: getForwardedIp(request),
  });
}
