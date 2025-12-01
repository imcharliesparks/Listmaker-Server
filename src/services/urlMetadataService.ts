import axios from 'axios';
import * as cheerio from 'cheerio';
import { UrlMetadata } from '../types';

export class UrlMetadataService {
  async extractMetadata(url: string): Promise<UrlMetadata> {
    try {
      // Detect source type
      const sourceType = this.detectSourceType(url);

      // Handle specific platforms
      if (sourceType === 'youtube') {
        return await this.extractYouTubeMetadata(url);
      }

      // Default: scrape Open Graph tags
      return await this.extractOpenGraphMetadata(url);
    } catch (error) {
      console.error('Error extracting metadata:', error);
      return {
        url,
        title: url,
        sourceType: 'website',
      };
    }
  }

  private detectSourceType(url: string): string {
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

  private async extractOpenGraphMetadata(url: string): Promise<UrlMetadata> {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ListAppBot/1.0)',
      },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);

    const metadata: UrlMetadata = {
      url,
      title:
        $('meta[property="og:title"]').attr('content') ||
        $('title').text() ||
        url,
      description:
        $('meta[property="og:description"]').attr('content') ||
        $('meta[name="description"]').attr('content'),
      thumbnail:
        $('meta[property="og:image"]').attr('content') ||
        $('meta[name="twitter:image"]').attr('content'),
      sourceType: this.detectSourceType(url),
    };

    return metadata;
  }

  private async extractYouTubeMetadata(url: string): Promise<UrlMetadata> {
    // Extract video ID
    const videoId = this.extractYouTubeId(url);

    if (!videoId) {
      return { url, sourceType: 'youtube' };
    }

    // Use oEmbed API (no API key required)
    try {
      const response = await axios.get(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
      );

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
    } catch (error) {
      // Fallback to basic scraping
      return await this.extractOpenGraphMetadata(url);
    }
  }

  private extractYouTubeId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/,
      /youtube\.com\/embed\/([^&\s]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }

    return null;
  }
}

export default new UrlMetadataService();
