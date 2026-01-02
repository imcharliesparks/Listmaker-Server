"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = require("@src/config/prisma");
/******************************************************************************
                                Helpers
******************************************************************************/
function mapUser(row) {
    return {
        id: row.id,
        name: row.displayName ?? row.display_name ?? '',
        email: row.email,
        created: row.createdAt ?? row.created_at ?? row.created ?? undefined,
        updated: row.updatedAt ?? row.updated_at ?? row.updated ?? undefined,
    };
}
/******************************************************************************
                                Functions
******************************************************************************/
/**
 * Get one user by email.
 */
async function getOne(email) {
    const result = await prisma_1.prisma.user.findUnique({
        where: { email },
    });
    return result ? mapUser(result) : null;
}
/**
 * See if a user with the given id exists.
 */
async function persists(id) {
    const result = await prisma_1.prisma.user.findUnique({
        where: { id },
        select: { id: true },
    });
    return Boolean(result);
}
/**
 * Get all users.
 */
async function getAll() {
    const result = await prisma_1.prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
    });
    return result.map(mapUser);
}
/**
 * Add one user (upsert on id).
 */
async function add(user) {
    const userId = user.id?.toString().trim() || crypto_1.default.randomUUID();
    const displayName = user.name?.trim() || null;
    const email = user.email?.trim();
    if (!email) {
        throw new Error('User email is required to create a user');
    }
    const result = await prisma_1.prisma.user.upsert({
        where: { id: userId },
        update: {
            email,
            displayName,
            photoUrl: null,
            updatedAt: new Date(),
        },
        create: {
            id: userId,
            email,
            displayName,
            photoUrl: null,
        },
    });
    return mapUser(result);
}
/**
 * Update a user.
 */
async function update(user) {
    if (!user.id) {
        throw new Error('User id is required for update');
    }
    const result = await prisma_1.prisma.user.update({
        where: { id: user.id },
        data: {
            email: user.email ?? undefined,
            displayName: user.name ?? undefined,
            updatedAt: new Date(),
        },
    });
    return result ? mapUser(result) : null;
}
/**
 * Delete one user.
 */
async function delete_(id) {
    if (!id) {
        throw new Error('User id is required for delete');
    }
    await prisma_1.prisma.user.delete({ where: { id } });
}
// **** Unit-Tests Only **** //
/**
 * Delete every user record.
 */
async function deleteAllUsers() {
    await prisma_1.prisma.user.deleteMany();
}
/**
 * Insert multiple users.
 */
async function insertMult(users) {
    const inserted = [];
    for (const user of users) {
        const nextUser = { ...user };
        if (!nextUser.id) {
            nextUser.id = crypto_1.default.randomUUID();
        }
        const result = await prisma_1.prisma.user.upsert({
            where: { id: nextUser.id },
            update: {
                email: nextUser.email,
                displayName: nextUser.name ?? null,
                photoUrl: null,
                updatedAt: new Date(),
            },
            create: {
                id: nextUser.id,
                email: nextUser.email,
                displayName: nextUser.name ?? null,
                photoUrl: null,
            },
        });
        inserted.push(mapUser(result));
    }
    return inserted;
}
/******************************************************************************
                                Export default
******************************************************************************/
exports.default = {
    getOne,
    persists,
    getAll,
    add,
    update,
    delete: delete_,
    deleteAllUsers,
    insertMult,
};
