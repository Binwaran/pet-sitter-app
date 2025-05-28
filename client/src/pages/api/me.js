import jwt from "jsonwebtoken";

export default function handler(req, res) {
  const { token } = req.cookies;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.status(200).json(decoded);
  } catch (e) {
    res.status(401).json({ message: "Invalid token" });
  }
}