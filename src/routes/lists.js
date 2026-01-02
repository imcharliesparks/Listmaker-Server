"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const listsController_1 = require("../controllers/listsController");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate); // All routes require authentication
router.post('/', listsController_1.createList);
router.get('/', listsController_1.getUserLists);
router.get('/:id', listsController_1.getListById);
router.put('/:id', listsController_1.updateList);
router.delete('/:id', listsController_1.deleteList);
exports.default = router;
