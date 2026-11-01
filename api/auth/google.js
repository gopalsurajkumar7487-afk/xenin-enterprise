
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

module.exports = async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { credential } = req.body || {};

    if (!credential) {
      return res.status(400).json({
        error: "Google credential missing"
      });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({
        error: "Google Client ID not configured"
      });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email || !payload.email_verified) {
      return res.status(401).json({
        error: "Google account could not be verified"
      });
    }

    return res.status(200).json({
      success: true,
      email: payload.email,
      name: payload.name || "",
      picture: payload.picture || ""
    });

  } catch (error) {
    console.error("Google login error:", error.message);

    return res.status(401).json({
      error: "Google login verification failed"
    });
  }
};
