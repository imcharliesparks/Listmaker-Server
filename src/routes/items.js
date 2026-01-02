"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const itemsController_1 = require("../controllers/itemsController");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate); // All routes require authentication
router.post('/', itemsController_1.addItem);
router.get('/list/:listId', itemsController_1.getListItems);
router.delete('/:id', itemsController_1.deleteItem);
exports.default = router;
