"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
let config;
// Check for the standard connection string (recommended for Neon)
if (process.env.DATABASE_URL) {
    config = {
        // The pg library will automatically parse the host, user, password, etc., from this string.
        connectionString: process.env.DATABASE_URL,
        // 💡 IMPORTANT: Neon requires SSL. This configuration tells the pg library to use it.
        ssl: {
            // Set this to false for development environments,
            // as your local machine might not recognize Neon's root certificate.
            // NOTE: For production, you should aim to keep rejectUnauthorized: true.
            rejectUnauthorized: false
        }
    };
}
else {
    // This block is the fallback for your original separate parameters (DB_HOST, etc.)
    config = {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    };
}
const pool = new pg_1.Pool(config);
pool.on('connect', () => {
    console.log('✅ Connected to PostgreSQL database');
});
pool.on('error', (err) => {
    console.error('❌ Unexpected error on idle client', err);
});
exports.default = pool;
