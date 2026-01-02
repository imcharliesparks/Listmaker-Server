"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const backend_1 = require("@clerk/backend");
// Initialize Clerk client
const clerkClient = (0, backend_1.createClerkClient)({
    secretKey: process.env.CLERK_SECRET_KEY,
});
/**
 * Authentication middleware using Clerk session tokens.
 * Verifies the Bearer token and attaches user info to req.user.
 */
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }
        const token = authHeader.split('Bearer ')[1];
        try {
            // Verify Clerk session token
            const payload = await (0, backend_1.verifyToken)(token, {
                secretKey: process.env.CLERK_SECRET_KEY,
            });
            if (!payload || !payload.sub) {
                return res.status(401).json({ error: 'Invalid or expired token' });
            }
            const userId = payload.sub;
            // Fetch user details from Clerk to get email
            const user = await clerkClient.users.getUser(userId);
            // Get primary email address
            const email = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress;
            if (!email) {
                return res.status(401).json({ error: 'User email not available' });
            }
            // Attach user info to request (maintaining same interface as Firebase)
            req.user = {
                uid: userId,
                email,
            };
            next();
        }
        catch (verifyError) {
            console.error('Token verification error:', verifyError);
            return res.status(401).json({ error: 'Invalid or expired token' });
        }
    }
    catch (error) {
        console.error('Authentication error:', error);
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};
exports.authenticate = authenticate;
