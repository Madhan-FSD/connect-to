type DeviceType = "ANDROID" | "IOS" | "WEB";

export function getDeviceType(): DeviceType {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return "WEB";
  }

  const userAgent = navigator.userAgent;
  const isMobile = /Mobi|Android|iPhone|iPad|iPod|Windows Phone|iemobile/i.test(
    userAgent
  );

  if (isMobile) {
    if (/(iPhone|iPad|iPod)/i.test(userAgent)) {
      if (
        userAgent.includes("iPad") ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
      ) {
        return "IOS";
      }
      return "IOS";
    }
    if (/Android/i.test(userAgent)) {
      return "ANDROID";
    }
  }

  return "WEB";
}
