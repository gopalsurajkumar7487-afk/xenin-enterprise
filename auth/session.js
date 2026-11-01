
const crypto = require("crypto");

function verifySession(token) {
  if (!process.env.SESSION_SECRET || !token) {
    return null;
  }

  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [data, signature] = parts;

  const expected = crypto
    .createHmac("sha256", process.env.SESSION_SECRET)
    .update(data)
    .digest();

  let received;

  try {
    received = Buffer.from(signature, "base64url");
  } catch {
    return null;
  }

  if (
    received.length !== expected.length ||
    !crypto.timingSafeEqual(received, expected)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(data, "base64url").toString("utf8")
    );

    const now = Math.floor(Date.now() / 1000);

    if (
      !payload.email ||
      !Number.isInteger(payload.exp) ||
      payload.exp <= now
    ) {
      return null;
    }

    return {
      email: payload.email,
      name: payload.name || "",
      picture: payload.picture || ""
    };
  } catch {
    return null;
  }
}

module.exports = function handler(req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  const cookieHeader = req.headers.cookie || "";

  const sessionCookie = cookieHeader
    .split(";")
    .map(item => item.trim())
    .find(item => item.startsWith("xenin_session="));

  const token = sessionCookie
    ? sessionCookie.substring("xenin_session=".length)
    : null;

  const user = verifySession(token);

  if (!user) {
    return res.status(401).json({
      authenticated: false
    });
  }

  return res.status(200).json({
    authenticated: true,
    user
  });
};
