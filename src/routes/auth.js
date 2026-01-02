"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const authController_1 = require("../controllers/authController");
const router = (0, express_1.Router)();
router.post('/sync', auth_1.authenticate, authController_1.syncUser);
router.get('/me', auth_1.authenticate, authController_1.getCurrentUser);
exports.default = router;
