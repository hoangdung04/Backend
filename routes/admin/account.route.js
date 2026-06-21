import { Router } from "express";
import * as controller from "../../controllers/admin/account.controller.js";
import multer from "multer";
import { uploadSingle } from "../../middlewares/admin/uploadCloud.middleware.js";
import { requireAuth } from "../../middlewares/admin/auth.middleware.js";
import { checkPermission } from "../../middlewares/admin/permission.middleware.js";

const router = Router();
const upload = multer();

// Tất cả routes cần đăng nhập
router.use(requireAuth);

// [GET] /api/admin/accounts  – Danh sách tài khoản
router.get("/", checkPermission("accounts_view"), controller.index);

// [GET] /api/admin/accounts/:id  – Chi tiết tài khoản
router.get("/:id", checkPermission("accounts_view"), controller.detail);

// [POST] /api/admin/accounts/create  – Tạo tài khoản
router.post("/create", upload.single("avatar"), uploadSingle, checkPermission("accounts_create"), controller.createPost);

// [PATCH] /api/admin/accounts/:id  – Sửa tài khoản
router.patch("/:id", upload.single("avatar"), uploadSingle, checkPermission("accounts_edit"), controller.editPatch);

// [DELETE] /api/admin/accounts/:id  – Xóa tài khoản
router.delete("/:id", checkPermission("accounts_delete"), controller.deletePatch);

export const accountRoutes = router;
