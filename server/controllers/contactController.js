import { models } from "../models/index.js";
import { error } from "../utils/validation.js";
import { notifyInquiry } from "../services/emailService.js";
export async function submitInquiry(req, res) {
  const { name, email, message, serviceInterest, budget, website } = req.body;
  if (website) throw error("Submission rejected.");
  if (
    typeof name !== "string" ||
    !name.trim() ||
    name.length > 120 ||
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    email.length > 254 ||
    typeof message !== "string" ||
    message.trim().length < 10 ||
    message.length > 20000
  )
    throw error(
      "Enter your name, valid email and a message of at least 10 characters.",
    );
  const doc = await models.inquiries.create({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    message: message.trim(),
    ...(typeof serviceInterest === "string"
      ? { serviceInterest: serviceInterest.slice(0, 255) }
      : {}),
    ...(typeof budget === "string" ? { budget: budget.slice(0, 255) } : {}),
    status: "unread",
  });
  await notifyInquiry(doc);
  res.status(201).json({ ok: true });
}
