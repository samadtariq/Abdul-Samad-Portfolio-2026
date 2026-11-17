import { Router } from "express";
import { clientDist } from "../config/paths.js";
import { createPublicController } from "../controllers/publicController.js";
export function createPublicRouter({ origin, session }) {
  const router = Router(),
    c = createPublicController({ origin });
  router.get("/robots.txt", c.robots);
  router.get("/sitemap.xml", c.sitemap);
  router.get("/googleff69133ab6aaa669.html", (_req, res) =>
    res.sendFile("googleff69133ab6aaa669.html", { root: clientDist }),
  );
  router.use(session);
  router.get("/admin{/*rest}", c.adminPage);
  router.get("/{*rest}", c.publicPage);
  return router;
}
