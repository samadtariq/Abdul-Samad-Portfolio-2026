import { Router } from "express";
import { createPublicController } from "../controllers/publicController.js";
export function createPublicRouter({ origin, session }) {
  const router = Router(),
    c = createPublicController({ origin });
  router.get("/robots.txt", c.robots);
  router.get("/sitemap.xml", c.sitemap);
  router.use(session);
  router.get("/admin{/*rest}", c.adminPage);
  router.get("/{*rest}", c.publicPage);
  return router;
}
