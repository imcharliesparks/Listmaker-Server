"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.agent = void 0;
const vitest_1 = require("vitest");
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("@src/app"));
const UserRepo_1 = __importDefault(require("@src/repos/UserRepo"));
const prisma_1 = require("@src/config/prisma");
/******************************************************************************
                                    Run
******************************************************************************/
let agent;
(0, vitest_1.beforeAll)(async () => {
    exports.agent = agent = supertest_1.default.agent(app_1.default);
    await UserRepo_1.default.deleteAllUsers();
});
(0, vitest_1.afterAll)(async () => {
    await (0, prisma_1.disconnectPrisma)();
});
