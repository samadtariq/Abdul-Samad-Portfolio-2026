import { Router } from "express";
import { createAuthController } from "../controllers/authController.js";
export function createAuthRouter({
  production,
  sameOrigin,
  csrf,
  requireAuth,
  limits,
}) {
  const router = Router(),
    c = createAuthController({ production });
  router.post("/login", limits.login, sameOrigin, c.login);
  router.get("/me", requireAuth, c.me);
  router.post("/logout", requireAuth, csrf, c.logout);
  router.patch("/account", requireAuth, csrf, c.updateAccount);
  return router;
}
