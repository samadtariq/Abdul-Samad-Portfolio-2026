import { Router } from "express";
import { submitInquiry } from "../controllers/contactController.js";
export function createContactRouter({ sameOrigin, limits }) {
  const router = Router();
  router.post("/", limits.contact, sameOrigin, submitInquiry);
  return router;
}
