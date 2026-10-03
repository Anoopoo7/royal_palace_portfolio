import crypto from "crypto";

const TOKEN_EXPIRY_SECONDS = 30 * 60; // 30 minutes

/**
 * Creates a signed JWT-compatible Bearer token valid for 30 minutes.
 */
export function createAdminToken(secret: string): { token: string; expiresIn: number; expiresAt: number } {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const exp = now + TOKEN_EXPIRY_SECONDS;
  const payload = Buffer.from(JSON.stringify({ role: "admin", iat: now, exp })).toString("base64url");
  const data = `${header}.${payload}`;
  const signature = crypto.createHmac("sha256", secret).update(data).digest("base64url");

  return {
    token: `${data}.${signature}`,
    expiresIn: TOKEN_EXPIRY_SECONDS,
    expiresAt: exp * 1000,
  };
}

/**
 * Verifies a 30-minute Bearer token. Checks signature and expiration.
 */
export function verifyAdminToken(token: string, secret: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const [header, payload, signature] = parts;
    const data = `${header}.${payload}`;
    const expectedSignature = crypto.createHmac("sha256", secret).update(data).digest("base64url");

    // Timing-safe comparison to prevent timing side-channel attacks
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSignature);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return false;
    }

    const payloadObj = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    const now = Math.floor(Date.now() / 1000);

    // Verify expiration (30 minute window)
    if (!payloadObj.exp || typeof payloadObj.exp !== "number" || payloadObj.exp < now) {
      return false;
    }

    return payloadObj.role === "admin";
  } catch {
    return false;
  }
}

/**
 * Shared authorization validator for admin routes.
 * Accepts:
 *  1. Bearer <30_minute_signed_token> (standard UI flow)
 *  2. Direct ADMIN_SECRET_KEY in Bearer or x-admin-key (for automated scripts / cURL)
 */
export function verifyAdminAuth(request: Request): boolean {
  const secret = process.env.ADMIN_SECRET_KEY;
  if (!secret) return true; // dev mode bypass if no secret configured

  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : authHeader.trim();

  // 1. Direct secret match (server-to-server or cURL)
  if (token && token === secret) return true;
  const custom = request.headers.get("x-admin-key");
  if (custom && custom === secret) return true;

  // 2. 30-minute signed Bearer token check
  if (token && verifyAdminToken(token, secret)) {
    return true;
  }

  return false;
}
