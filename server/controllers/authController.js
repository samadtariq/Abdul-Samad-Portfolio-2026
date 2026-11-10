import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { Admin, AdminSession } from "../models/index.js";
import { hash } from "../utils/crypto.js";
import { error } from "../utils/validation.js";
export function createAuthController({ production }) {
  async function login(req, res) {
    const { email, password } = req.body;
    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      password.length > 200
    )
      return res.status(400).json({ error: "Enter your email and password." });
    const user = await Admin.findOne({
      email: email.trim().toLowerCase(),
      active: true,
    }).select("+passwordHash");
    if (!user || !(await bcrypt.compare(password, user.passwordHash)))
      throw error("Email or password is incorrect.", 401);
    const token = randomBytes(32).toString("hex"),
      expiresAt = new Date(
        Date.now() +
          Math.min(168, Math.max(1, Number(process.env.SESSION_HOURS) || 12)) *
            3600000,
      );
    await AdminSession.create({
      adminId: user._id,
      tokenHash: hash(token),
      expiresAt,
    });
    res.cookie("portfolio_session", token, {
      httpOnly: true,
      secure: production,
      sameSite: "strict",
      expires: expiresAt,
      path: "/",
    });
    res.json({
      user: { name: user.name, email: user.email },
      csrf: hash("csrf:" + token),
    });
  }

  function me(req, res) {
    res.set("Cache-Control", "no-store").json({
      user: { name: req.admin.name, email: req.admin.email },
      csrf: hash("csrf:" + req.rawToken),
    });
  }

  async function logout(req, res) {
    await AdminSession.deleteOne({ _id: req.session._id });
    res.clearCookie("portfolio_session", { path: "/" }).json({ ok: true });
  }

  async function updateAccount(req, res) {
    const { name, email, currentPassword, newPassword } = req.body;
    const user = await Admin.findById(req.admin._id).select("+passwordHash");
    if (
      typeof currentPassword !== "string" ||
      !(await bcrypt.compare(currentPassword, user.passwordHash))
    )
      throw error("Current password is incorrect.");
    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    )
      throw error("Valid name and email required.");
    user.name = name.trim();
    user.email = email.trim().toLowerCase();
    if (newPassword) {
      if (
        typeof newPassword !== "string" ||
        newPassword.length < 12 ||
        Buffer.byteLength(newPassword) > 72
      )
        throw error(
          "Password requires 12+ characters, maximum 72 UTF-8 bytes.",
        );
      user.passwordHash = await bcrypt.hash(newPassword, 12);
      user.passwordChangedAt = new Date();
    }
    await user.save();
    await AdminSession.deleteMany({ adminId: user._id });
    res
      .clearCookie("portfolio_session", { path: "/" })
      .json({ ok: true, signInAgain: true });
  }
  return { login, me, logout, updateAccount };
}
