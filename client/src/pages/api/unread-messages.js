export default function handler(req, res) {
  res.status(200).json({ unreadCount: 0, messages: [] });
}