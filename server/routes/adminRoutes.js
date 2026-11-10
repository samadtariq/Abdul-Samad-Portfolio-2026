import { Router } from "express";
import { dashboard } from "../controllers/dashboardController.js";
import { createContentController } from "../controllers/contentController.js";
import { noStore } from "../middleware/securityMiddleware.js";
export function createAdminRouter({ storage, requireAuth, csrf }) {
  const router = Router(),
    c = createContentController({ storage });
  router.use(requireAuth, csrf, noStore);
  router.get("/dashboard", dashboard);
  router.get("/schema", c.schema);
  router.get("/reference-options", c.referenceOptions);
  router.get("/:collection", c.list);
  router.get("/:collection/:id", c.get);
  router.post("/:collection", c.create);
  router.put("/:collection/:id", c.update);
  router.delete("/:collection/:id", c.remove);
  return router;
}
