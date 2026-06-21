import { Router } from "express";
import * as controller from "../../controllers/admin/dashboard.controller.js";
import { requireAuth } from "../../middlewares/admin/auth.middleware.js";

const router = Router();

router.use(requireAuth);
router.get("/", controller.index);

export const dashboardRoutes = router;
