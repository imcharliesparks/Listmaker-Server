"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = exports.syncUser = void 0;
const prisma_1 = require("../config/prisma");
const serializeUser = (user) => ({
    id: user.id,
    email: user.email,
    display_name: user.displayName ?? null,
    photo_url: user.photoUrl ?? null,
    created_at: user.createdAt,
    updated_at: user.updatedAt,
});
const syncUser = async (req, res) => {
    try {
        const { uid, email } = req.user;
        const { displayName, photoUrl } = req.body;
        if (!email) {
            return res.status(401).json({ error: 'User email not available' });
        }
        const user = await prisma_1.prisma.user.upsert({
            where: { id: uid },
            create: {
                id: uid,
                email,
                displayName: displayName ?? null,
                photoUrl: photoUrl ?? null,
            },
            update: {
                email,
                displayName: displayName ?? null,
                photoUrl: photoUrl ?? null,
                updatedAt: new Date(),
            },
        });
        res.json({ user: serializeUser(user) });
    }
    catch (error) {
        console.error('Error syncing user:', error);
        res.status(500).json({ error: 'Failed to sync user' });
    }
};
exports.syncUser = syncUser;
const getCurrentUser = async (req, res) => {
    try {
        const { uid } = req.user;
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: uid },
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ user: serializeUser(user) });
    }
    catch (error) {
        console.error('Error getting user:', error);
        res.status(500).json({ error: 'Failed to get user' });
    }
};
exports.getCurrentUser = getCurrentUser;
