"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const urlMetadataService_1 = require("../../src/services/urlMetadataService");
(0, vitest_1.describe)('UrlMetadataService', () => {
    let service;
    (0, vitest_1.beforeEach)(() => {
        service = new urlMetadataService_1.UrlMetadataService();
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.describe)('URL Validation (SSRF Protection)', () => {
        (0, vitest_1.describe)('Protocol validation', () => {
            (0, vitest_1.it)('should reject ftp:// URLs', async () => {
                const result = await service.extractMetadata('ftp://example.com/file.txt');
                // The service returns fallback metadata on error
                (0, vitest_1.expect)(result.url).toBe('ftp://example.com/file.txt');
                (0, vitest_1.expect)(result.title).toBe('ftp://example.com/file.txt');
            });
            (0, vitest_1.it)('should reject file:// URLs', async () => {
                const result = await service.extractMetadata('file:///etc/passwd');
                (0, vitest_1.expect)(result.url).toBe('file:///etc/passwd');
                (0, vitest_1.expect)(result.title).toBe('file:///etc/passwd');
            });
            (0, vitest_1.it)('should reject javascript: URLs', async () => {
                const result = await service.extractMetadata('javascript:alert(1)');
                (0, vitest_1.expect)(result.url).toBe('javascript:alert(1)');
                (0, vitest_1.expect)(result.title).toBe('javascript:alert(1)');
            });
            (0, vitest_1.it)('should reject data: URLs', async () => {
                const result = await service.extractMetadata('data:text/html,<script>alert(1)</script>');
                (0, vitest_1.expect)(result.url).toBe('data:text/html,<script>alert(1)</script>');
            });
        });
        (0, vitest_1.describe)('Private IP blocking', () => {
            (0, vitest_1.it)('should reject localhost URLs', async () => {
                const result = await service.extractMetadata('http://localhost:3000/api');
                (0, vitest_1.expect)(result.url).toBe('http://localhost:3000/api');
                (0, vitest_1.expect)(result.title).toBe('http://localhost:3000/api');
            });
            (0, vitest_1.it)('should reject 127.0.0.1 URLs', async () => {
                const result = await service.extractMetadata('http://127.0.0.1:8080/admin');
                (0, vitest_1.expect)(result.url).toBe('http://127.0.0.1:8080/admin');
                (0, vitest_1.expect)(result.title).toBe('http://127.0.0.1:8080/admin');
            });
            (0, vitest_1.it)('should reject 10.x.x.x URLs', async () => {
                const result = await service.extractMetadata('http://10.0.0.1/internal');
                (0, vitest_1.expect)(result.url).toBe('http://10.0.0.1/internal');
                (0, vitest_1.expect)(result.title).toBe('http://10.0.0.1/internal');
            });
            (0, vitest_1.it)('should reject 192.168.x.x URLs', async () => {
                const result = await service.extractMetadata('http://192.168.1.1/router');
                (0, vitest_1.expect)(result.url).toBe('http://192.168.1.1/router');
                (0, vitest_1.expect)(result.title).toBe('http://192.168.1.1/router');
            });
            (0, vitest_1.it)('should reject 172.16.x.x URLs', async () => {
                const result = await service.extractMetadata('http://172.16.0.1/internal');
                (0, vitest_1.expect)(result.url).toBe('http://172.16.0.1/internal');
                (0, vitest_1.expect)(result.title).toBe('http://172.16.0.1/internal');
            });
            (0, vitest_1.it)('should reject 169.254.x.x (link-local) URLs', async () => {
                const result = await service.extractMetadata('http://169.254.169.254/latest/meta-data/');
                (0, vitest_1.expect)(result.url).toBe('http://169.254.169.254/latest/meta-data/');
                (0, vitest_1.expect)(result.title).toBe('http://169.254.169.254/latest/meta-data/');
            });
        });
        (0, vitest_1.describe)('Invalid URL handling', () => {
            (0, vitest_1.it)('should reject invalid URLs', async () => {
                const result = await service.extractMetadata('not-a-valid-url');
                (0, vitest_1.expect)(result.url).toBe('not-a-valid-url');
                (0, vitest_1.expect)(result.title).toBe('not-a-valid-url');
            });
        });
    });
    (0, vitest_1.describe)('UrlValidationError', () => {
        (0, vitest_1.it)('should have correct name and message', () => {
            const error = new urlMetadataService_1.UrlValidationError('Test error message');
            (0, vitest_1.expect)(error.name).toBe('UrlValidationError');
            (0, vitest_1.expect)(error.message).toBe('Test error message');
            (0, vitest_1.expect)(error instanceof Error).toBe(true);
        });
    });
});
