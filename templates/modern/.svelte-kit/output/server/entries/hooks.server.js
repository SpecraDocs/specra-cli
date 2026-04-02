import { g as generateCSPHeader } from "../chunks/mdx-security.js";
import { sequence } from "@sveltejs/kit/hooks";
const SECURITY_HEADERS = {
  // Prevent clickjacking
  "X-Frame-Options": "SAMEORIGIN",
  // Prevent MIME type sniffing
  "X-Content-Type-Options": "nosniff",
  // Enable XSS protection (legacy browsers)
  "X-XSS-Protection": "1; mode=block",
  // Control referrer information
  "Referrer-Policy": "strict-origin-when-cross-origin",
  // Permissions Policy (formerly Feature Policy)
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()"
};
function applySecurityHeaders(response, options) {
  const { customCSP, production = true } = options || {};
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
  const csp = customCSP || generateCSPHeader(void 0, production);
  response.headers.set("Content-Security-Policy", csp);
  return response;
}
function validateRequestPath(pathname) {
  const decoded = decodeURIComponent(pathname);
  if (decoded.includes("../") || decoded.includes("..\\")) {
    return { valid: false, reason: "Path traversal detected" };
  }
  if (decoded.includes("%2e%2e") || decoded.includes("%252e%252e") || pathname.includes("%2e%2e") || pathname.includes("%252e%252e")) {
    return { valid: false, reason: "Encoded path traversal detected" };
  }
  if (decoded.includes("\0") || pathname.includes("%00")) {
    return { valid: false, reason: "Null byte injection detected" };
  }
  return { valid: true };
}
function createSecurityHandle(options) {
  return async ({ event, resolve }) => {
    const { strictPathValidation = true } = options || {};
    if (strictPathValidation) {
      const pathValidation = validateRequestPath(event.url.pathname);
      if (!pathValidation.valid) {
        const ip = event.request.headers.get("x-forwarded-for") || event.request.headers.get("x-real-ip") || "unknown";
        console.warn(`[Security] Blocked request: ${pathValidation.reason}`, {
          path: event.url.pathname,
          ip
        });
        return new Response("Bad Request", { status: 400 });
      }
    }
    const response = await resolve(event);
    return applySecurityHeaders(response, options);
  };
}
const handle = sequence(
  createSecurityHandle({
    strictPathValidation: true
  })
);
export {
  handle
};
