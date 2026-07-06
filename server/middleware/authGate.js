export default function authGate(req, res, next) {
  const pin = process.env.APP_PIN;
  if (!pin) return next();
  if (req.headers["x-app-pin"] === pin) return next();
  return res.status(401).json({ error: "Unauthorized" });
}