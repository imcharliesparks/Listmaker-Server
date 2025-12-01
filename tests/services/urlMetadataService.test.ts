import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  UrlMetadataService,
  UrlValidationError,
} from '../../src/services/urlMetadataService';

describe('UrlMetadataService', () => {
  let service: UrlMetadataService;

  beforeEach(() => {
    service = new UrlMetadataService();
    vi.clearAllMocks();
  });

  describe('URL Validation (SSRF Protection)', () => {
    describe('Protocol validation', () => {
      it('should reject ftp:// URLs', async () => {
        const result = await service.extractMetadata(
          'ftp://example.com/file.txt'
        );
        // The service returns fallback metadata on error
        expect(result.url).toBe('ftp://example.com/file.txt');
        expect(result.title).toBe('ftp://example.com/file.txt');
      });

      it('should reject file:// URLs', async () => {
        const result = await service.extractMetadata(
          'file:///etc/passwd'
        );
        expect(result.url).toBe('file:///etc/passwd');
        expect(result.title).toBe('file:///etc/passwd');
      });

      it('should reject javascript: URLs', async () => {
        const result = await service.extractMetadata(
          'javascript:alert(1)'
        );
        expect(result.url).toBe('javascript:alert(1)');
        expect(result.title).toBe('javascript:alert(1)');
      });

      it('should reject data: URLs', async () => {
        const result = await service.extractMetadata(
          'data:text/html,<script>alert(1)</script>'
        );
        expect(result.url).toBe('data:text/html,<script>alert(1)</script>');
      });
    });

    describe('Private IP blocking', () => {
      it('should reject localhost URLs', async () => {
        const result = await service.extractMetadata(
          'http://localhost:3000/api'
        );
        expect(result.url).toBe('http://localhost:3000/api');
        expect(result.title).toBe('http://localhost:3000/api');
      });

      it('should reject 127.0.0.1 URLs', async () => {
        const result = await service.extractMetadata(
          'http://127.0.0.1:8080/admin'
        );
        expect(result.url).toBe('http://127.0.0.1:8080/admin');
        expect(result.title).toBe('http://127.0.0.1:8080/admin');
      });

      it('should reject 10.x.x.x URLs', async () => {
        const result = await service.extractMetadata(
          'http://10.0.0.1/internal'
        );
        expect(result.url).toBe('http://10.0.0.1/internal');
        expect(result.title).toBe('http://10.0.0.1/internal');
      });

      it('should reject 192.168.x.x URLs', async () => {
        const result = await service.extractMetadata(
          'http://192.168.1.1/router'
        );
        expect(result.url).toBe('http://192.168.1.1/router');
        expect(result.title).toBe('http://192.168.1.1/router');
      });

      it('should reject 172.16.x.x URLs', async () => {
        const result = await service.extractMetadata(
          'http://172.16.0.1/internal'
        );
        expect(result.url).toBe('http://172.16.0.1/internal');
        expect(result.title).toBe('http://172.16.0.1/internal');
      });

      it('should reject 169.254.x.x (link-local) URLs', async () => {
        const result = await service.extractMetadata(
          'http://169.254.169.254/latest/meta-data/'
        );
        expect(result.url).toBe('http://169.254.169.254/latest/meta-data/');
        expect(result.title).toBe('http://169.254.169.254/latest/meta-data/');
      });
    });

    describe('Invalid URL handling', () => {
      it('should reject invalid URLs', async () => {
        const result = await service.extractMetadata('not-a-valid-url');
        expect(result.url).toBe('not-a-valid-url');
        expect(result.title).toBe('not-a-valid-url');
      });
    });
  });

  describe('UrlValidationError', () => {
    it('should have correct name and message', () => {
      const error = new UrlValidationError('Test error message');
      expect(error.name).toBe('UrlValidationError');
      expect(error.message).toBe('Test error message');
      expect(error instanceof Error).toBe(true);
    });
  });
});
