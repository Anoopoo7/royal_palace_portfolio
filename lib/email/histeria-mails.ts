/**
 * Histeria Mails API Client
 *
 * Sends passwordless email authorization codes using Histeria Mails API endpoint:
 * POST https://histeriamails.vercel.app/api/proxy/v1/emails/send
 * Headers:
 *   - Content-Type: application/json
 *   - x-api-key: process.env.HISTERIA_MAILS_API_KEY
 * Payload:
 *   {
 *     "templateId": "rph-order-autherization-code",
 *     "to": "user@example.com",
 *     "data": { "code": "1234" }
 *   }
 */

export async function sendAuthorizationCode(toEmail: string, code: string): Promise<boolean> {
  const apiKey = process.env.HISTERIA_MAILS_API_KEY;
  if (!apiKey) {
    console.error("[sendAuthorizationCode] Missing HISTERIA_MAILS_API_KEY in environment variables.");
    throw new Error("Email service API key is not configured.");
  }

  const payload = {
    templateId: "rph-order-autherization-code",
    to: toEmail.trim().toLowerCase(),
    data: {
      code: String(code),
    },
  };

  try {
    const response = await fetch("https://histeriamails.vercel.app/api/proxy/v1/emails/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error(`[sendAuthorizationCode] API returned HTTP ${response.status}: ${errorText}`);
      throw new Error(`Failed to send email verification code (${response.status})`);
    }

    return true;
  } catch (error) {
    console.error("[sendAuthorizationCode] Failed to dispatch email:", error);
    throw error;
  }
}
