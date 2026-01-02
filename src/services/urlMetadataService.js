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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UrlMetadataService = exports.UrlValidationError = void 0;
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
const dns = __importStar(require("dns"));
const net = __importStar(require("net"));
const util_1 = require("util");
const dnsLookup = (0, util_1.promisify)(dns.lookup);
/**
 * Custom error for URL validation failures (SSRF protection)
 */
class UrlValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'UrlValidationError';
    }
}
exports.UrlValidationError = UrlValidationError;
class UrlMetadataService {
    /**
     * Validates a URL to prevent SSRF attacks
     * - Only allows http and https protocols
     * - Blocks requests to private/reserved IP ranges
     * - Resolves hostnames to check their IP addresses
     */
    async validateUrl(url) {
        let parsedUrl;
        try {
            parsedUrl = new URL(url);
        }
        catch {
            throw new UrlValidationError('Invalid URL format');
        }
        // Only allow http and https protocols
        if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
            throw new UrlValidationError(`Invalid protocol: ${parsedUrl.protocol}. Only http and https are allowed`);
        }
        const hostname = parsedUrl.hostname;
        // Block localhost variants
        if (hostname === 'localhost' ||
            hostname === 'localhost.localdomain' ||
            hostname.endsWith('.localhost')) {
            throw new UrlValidationError('Requests to localhost are not allowed');
        }
        // Check if hostname is already an IP address
        if (net.isIP(hostname)) {
            if (this.isBlockedIp(hostname)) {
                throw new UrlValidationError('Requests to private/reserved IP addresses are not allowed');
            }
        }
        else {
            // Resolve hostname to IP and validate
            try {
                const result = await dnsLookup(hostname);
                if (this.isBlockedIp(result.address)) {
                    throw new UrlValidationError('Requests to private/reserved IP addresses are not allowed');
                }
            }
            catch (error) {
                if (error instanceof UrlValidationError) {
                    throw error;
                }
                throw new UrlValidationError(`Unable to resolve hostname: ${hostname}`);
            }
        }
    }
    /**
     * Checks if an IP address matches any blocked pattern
     */
    isBlockedIp(ip) {
        return UrlMetadataService.BLOCKED_IP_PATTERNS.some((pattern) => pattern.test(ip));
    }
    async extractMetadata(url) {
        try {
            // Validate URL to prevent SSRF attacks
            await this.validateUrl(url);
            // Detect source type
            const sourceType = this.detectSourceType(url);
            // Handle specific platforms
            if (sourceType === 'youtube') {
                return await this.extractYouTubeMetadata(url);
            }
            // Default: scrape Open Graph tags
            return await this.extractOpenGraphMetadata(url);
        }
        catch (error) {
            console.error('Error extracting metadata:', error);
            return {
                url,
                title: url,
                sourceType: 'website',
            };
        }
    }
    detectSourceType(url) {
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            return 'youtube';
        }
        if (url.includes('amazon.')) {
            return 'amazon';
        }
        if (url.includes('twitter.com') || url.includes('x.com')) {
            return 'twitter';
        }
        if (url.includes('instagram.com')) {
            return 'instagram';
        }
        return 'website';
    }
    async extractOpenGraphMetadata(url) {
        const response = await axios_1.default.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; ListAppBot/1.0)',
            },
            timeout: 10000,
        });
        const $ = cheerio.load(response.data);
        const metadata = {
            url,
            title: $('meta[property="og:title"]').attr('content') ||
                $('title').text() ||
                url,
            description: $('meta[property="og:description"]').attr('content') ||
                $('meta[name="description"]').attr('content'),
            thumbnail: $('meta[property="og:image"]').attr('content') ||
                $('meta[name="twitter:image"]').attr('content'),
            sourceType: this.detectSourceType(url),
        };
        return metadata;
    }
    async extractYouTubeMetadata(url) {
        // Extract video ID
        const videoId = this.extractYouTubeId(url);
        if (!videoId) {
            return { url, sourceType: 'youtube' };
        }
        // Use oEmbed API (no API key required)
        try {
            const response = await axios_1.default.get(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
            return {
                url,
                title: response.data.title,
                description: response.data.author_name,
                thumbnail: response.data.thumbnail_url,
                sourceType: 'youtube',
                metadata: {
                    videoId,
                    channelName: response.data.author_name,
                },
            };
        }
        catch (error) {
            // Fallback to basic scraping
            return await this.extractOpenGraphMetadata(url);
        }
    }
    extractYouTubeId(url) {
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/,
            /youtube\.com\/embed\/([^&\s]+)/,
        ];
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match)
                return match[1];
        }
        return null;
    }
}
exports.UrlMetadataService = UrlMetadataService;
/**
 * List of private/reserved IP ranges that should be blocked
 */
UrlMetadataService.BLOCKED_IP_PATTERNS = [
    /^127\./, // Loopback (127.0.0.0/8)
    /^10\./, // Private (10.0.0.0/8)
    /^192\.168\./, // Private (192.168.0.0/16)
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // Private (172.16.0.0/12)
    /^169\.254\./, // Link-local (169.254.0.0/16)
    /^0\./, // Current network (0.0.0.0/8)
    /^224\./, // Multicast (224.0.0.0/4)
    /^240\./, // Reserved (240.0.0.0/4)
    /^255\./, // Broadcast
    /^100\.(6[4-9]|[7-9][0-9]|1[0-2][0-7])\./, // Shared (100.64.0.0/10)
    /^198\.1[89]\./, // Benchmark (198.18.0.0/15)
    /^::1$/, // IPv6 loopback
    /^fc00:/i, // IPv6 unique local
    /^fd00:/i, // IPv6 unique local
    /^fe80:/i, // IPv6 link-local
];
exports.default = new UrlMetadataService();
