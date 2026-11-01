
const { OAuth2Client } = require("google-auth-library");

const CLIENT_ID =
  "614858412481-nuba46lg31ddimhmi7mq8c6akap153pp.apps.googleusercontent.com";

const googleClient = new OAuth2Client(CLIENT_ID);

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { credential } = req.body || {};

    if (!credential || typeof credential !== "string") {
      return res.status(400).json({
        error: "Google credential is required"
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: CLIENT_ID
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email || !payload.email_verified) {
      return res.status(401).json({
        error: "Google account verification failed"
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
      error: "Invalid Google login"
    });
  }
};
