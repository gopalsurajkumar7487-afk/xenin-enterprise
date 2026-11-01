
const { OAuth2Client } = require("google-auth-library");
const crypto = require("crypto");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function createSession(payload) {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");

  const signature = crypto
    .createHmac("sha256", process.env.SESSION_SECRET)
    .update(data)
    .digest("base64url");

  return `${data}.${signature}`;
}

module.exports = async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    if (
      !process.env.GOOGLE_CLIENT_ID ||
      !process.env.SESSION_SECRET ||
      process.env.SESSION_SECRET.length < 32
    ) {
      return res.status(500).json({
        error: "Authentication configuration missing"
      });
    }

    const { credential } = req.body || {};

    if (!credential) {
      return res.status(400).json({
        error: "Google credential missing"
      });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const user = ticket.getPayload();

    if (!user || !user.email || !user.email_verified) {
      return res.status(401).json({
        error: "Google account verification failed"
      });
    }

    const now = Math.floor(Date.now() / 1000);

    const session = createSession({
      email: user.email,
      name: user.name || "",
      picture: user.picture || "",
      exp: now + 3600
    });

    res.setHeader(
      "Set-Cookie",
      `xenin_session=${session}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=3600`
    );

    return res.status(200).json({
      success: true,
      user: {
        email: user.email,
        name: user.name || "",
        picture: user.picture || ""
      }
    });

  } catch (error) {
    console.error("Google authentication error:", error.message);

    return res.status(401).json({
      error: "Google login verification failed"
    });
  }
};
