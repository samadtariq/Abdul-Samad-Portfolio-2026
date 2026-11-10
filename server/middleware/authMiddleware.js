import { Admin, AdminSession } from "../models/index.js";
import { hash } from "../utils/crypto.js";
import { error } from "../utils/validation.js";
export const session = async (req, res, next) => {
  try {
    const token = req.cookies.portfolio_session;
    if (token) {
      const s = await AdminSession.findOne({
        tokenHash: hash(token),
        expiresAt: { $gt: new Date() },
        revokedAt: { $exists: false },
      }).lean();
      if (s) {
        const user = await Admin.findOne({
          _id: s.adminId,
          active: true,
        }).lean();
        if (user) {
          req.admin = user;
          req.session = s;
          req.rawToken = token;
        }
      }
    }
    next();
  } catch (e) {
    next(e);
  }
};
export const requireAuth = (req, res, next) =>
  req.admin ? next() : next(error("Please sign in again.", 401));
