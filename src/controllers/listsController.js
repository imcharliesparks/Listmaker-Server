"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteList = exports.updateList = exports.getListById = exports.getUserLists = exports.createList = void 0;
const prisma_1 = require("../config/prisma");
const serializeList = (list, itemCount) => ({
    id: list.id,
    user_id: list.userId,
    title: list.title,
    description: list.description,
    is_public: list.isPublic,
    cover_image: list.coverImage,
    created_at: list.createdAt,
    updated_at: list.updatedAt,
    ...(typeof itemCount === 'number' ? { item_count: itemCount } : {}),
});
const createList = async (req, res) => {
    try {
        const { uid } = req.user;
        const { title, description, isPublic } = req.body;
        if (typeof title !== 'string' || title.trim().length === 0) {
            return res.status(400).json({ error: 'Title must not be empty or whitespace only' });
        }
        if (title.trim().length > 255) {
            return res.status(400).json({ error: 'Title must not exceed 255 characters' });
        }
        const list = await prisma_1.prisma.list.create({
            data: {
                userId: uid,
                title: title.trim(),
                description: description ?? null,
                isPublic: Boolean(isPublic),
            },
        });
        res.status(201).json({ list: serializeList(list) });
    }
    catch (error) {
        console.error('Error creating list:', error);
        res.status(500).json({ error: 'Failed to create list' });
    }
};
exports.createList = createList;
const getUserLists = async (req, res) => {
    try {
        const { uid } = req.user;
        const lists = await prisma_1.prisma.list.findMany({
            where: { userId: uid },
            orderBy: { createdAt: 'desc' },
            include: { _count: { select: { items: true } } },
        });
        res.json({
            lists: lists.map(list => serializeList(list, list._count.items)),
        });
    }
    catch (error) {
        console.error('Error getting lists:', error);
        res.status(500).json({ error: 'Failed to get lists' });
    }
};
exports.getUserLists = getUserLists;
const getListById = async (req, res) => {
    try {
        const { uid } = req.user;
        const { id } = req.params;
        const listId = Number(id);
        if (Number.isNaN(listId)) {
            return res.status(400).json({ error: 'Invalid list id' });
        }
        const list = await prisma_1.prisma.list.findFirst({
            where: { id: listId, userId: uid },
        });
        if (!list) {
            return res.status(404).json({ error: 'List not found' });
        }
        res.json({ list: serializeList(list) });
    }
    catch (error) {
        console.error('Error getting list:', error);
        res.status(500).json({ error: 'Failed to get list' });
    }
};
exports.getListById = getListById;
const updateList = async (req, res) => {
    try {
        const { uid } = req.user;
        const { id } = req.params;
        const { title, description, isPublic } = req.body;
        const listId = Number(id);
        if (Number.isNaN(listId)) {
            return res.status(400).json({ error: 'Invalid list id' });
        }
        const list = await prisma_1.prisma.list.findFirst({
            where: { id: listId, userId: uid },
        });
        if (!list) {
            return res.status(404).json({ error: 'List not found' });
        }
        const updated = await prisma_1.prisma.list.update({
            where: { id: listId },
            data: {
                title: title ?? list.title,
                description: description ?? list.description,
                isPublic: typeof isPublic === 'boolean' ? isPublic : list.isPublic,
                updatedAt: new Date(),
            },
        });
        if (!updated) {
            return res.status(404).json({ error: 'List not found' });
        }
        res.json({ list: serializeList(updated) });
    }
    catch (error) {
        console.error('Error updating list:', error);
        res.status(500).json({ error: 'Failed to update list' });
    }
};
exports.updateList = updateList;
const deleteList = async (req, res) => {
    try {
        const { uid } = req.user;
        const { id } = req.params;
        const listId = Number(id);
        if (Number.isNaN(listId)) {
            return res.status(400).json({ error: 'Invalid list id' });
        }
        const list = await prisma_1.prisma.list.findFirst({
            where: { id: listId, userId: uid },
        });
        if (!list) {
            return res.status(404).json({ error: 'List not found' });
        }
        await prisma_1.prisma.list.delete({ where: { id: listId } });
        res.json({ message: 'List deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting list:', error);
        res.status(500).json({ error: 'Failed to delete list' });
    }
};
exports.deleteList = deleteList;
