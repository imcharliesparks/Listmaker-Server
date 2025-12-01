import admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
if (!serviceAccountPath) {
  throw new Error('FIREBASE_SERVICE_ACCOUNT_PATH environment variable is not set.');
}
const resolvedPath = path.resolve(serviceAccountPath);
if (!fs.existsSync(resolvedPath)) {
  throw new Error(`Service account file not found at path: ${resolvedPath}`);
}
const serviceAccount = require(resolvedPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const auth = admin.auth();
export default admin;
