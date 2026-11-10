import { models } from "../models/index.js";
export const audit = async (req, collection, targetId, action) => {
  await models.audit_logs.create({
    actorId: req.admin._id,
    targetCollection: collection,
    targetId,
    action,
  });
};
