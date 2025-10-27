// ============================================
// 📹 YouTube Search Provider
// مزود بحث يوتيوب
// ============================================

import { BaseSearchProvider } from './base-provider';
import { SearchResult, SearchOptions, SearchSource, ProviderQuota } from '../core/types';

// ============================================
// 📹 YouTube Search Provider
// ============================================

export class YouTubeSearchProvider extends BaseSearchProvider {
  private requestCount: number = 0;
  private readonly DAILY_LIMIT = 100;

  constructor(apiKey?: string) {
    super(
      'YouTube Data API',
      SearchSource.YOUTUBE,
      8, // High priority for video content
      apiKey || process.env.YOUTUBE_API_KEY
    );

    this.baseUrl = 'https://www.googleapis.com/youtube/v3';
  }

  // ============================================
  // 🔍 Search Implementation
  // ============================================

  async search(query: string, options?: SearchOptions): Promise<SearchResult[]> {
    if (!this.apiKey) {
      console.warn('⚠️ YouTube Search: API key not configured');
      return [];
    }

    const maxResults = options?.maxResults || 3; // 🎬 الحد الأقصى 3 فيديوهات
    const language = options?.language || 'ar';
    const timeout = options?.timeout || 10000;

    try {
      console.log(`📹 YouTube Search: "${query}"`);

      // Build query params
      const params = new URLSearchParams({
        key: this.apiKey,
        q: query,
        part: 'snippet',
        type: 'video',
        maxResults: String(Math.min(maxResults, 50)),
        relevanceLanguage: language,
        safeSearch: options?.safeSearch === 'high' ? 'strict' : 'moderate',
        order: 'relevance'
      });

      // Add date filter if specified
      if (options?.dateRange?.preset) {
        params.append('publishedAfter', this.getPublishedAfter(options.dateRange.preset));
      }

      const url = `${this.baseUrl}/search?${params}`;

      const response = await this.fetchWithTimeout(url, {}, timeout);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Check for errors
      if (data.error) {
        throw new Error(data.error.message || 'YouTube API Error');
      }

      this.requestCount++;

      // Parse results
      const results = await this.parseResults(data, query);

      console.log(`✅ YouTube Search: ${results.length} results found`);

      return results;

    } catch (error: any) {
      this.handleError(error, 'search');
    }
  }

  // ============================================
  // 📊 Parse YouTube Results
  // ============================================

  private async parseResults(data: any, query: string): Promise<SearchResult[]> {
    if (!data.items || !Array.isArray(data.items)) {
      return [];
    }

    // Get video IDs
    const videoIds = data.items
      .filter((item: any) => item.id.kind === 'youtube#video')
      .map((item: any) => item.id.videoId);

    if (videoIds.length === 0) {
      return [];
    }

    // Get video details (duration, views, etc.)
    const videoDetails = await this.getVideoDetails(videoIds);

    return data.items.map((item: any, index: number) => {
      const videoId = item.id.videoId;
      const snippet = item.snippet;
      const details = videoDetails.get(videoId);

      const result: SearchResult = {
        id: videoId,
        title: snippet.title,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        snippet: snippet.description,
        content: snippet.description,
        source: SearchSource.YOUTUBE,
        displayLink: 'youtube.com',
        relevanceScore: 1 - (index * 0.1),

        // Thumbnail
        thumbnail: snippet.thumbnails?.high?.url ||
                   snippet.thumbnails?.medium?.url ||
                   snippet.thumbnails?.default?.url,

        // Publish date
        publishDate: snippet.publishedAt,

        // Author
        author: snippet.channelTitle,

        // Video info
        video: {
          videoId: videoId,
          duration: details?.duration || 'Unknown',
          views: details?.views || '0',
          uploadDate: snippet.publishedAt,
          channelName: snippet.channelTitle,
          channelUrl: `https://www.youtube.com/channel/${snippet.channelId}`,
          thumbnailUrl: snippet.thumbnails?.high?.url
        },

        // Metadata
        metadata: {
          channelId: snippet.channelId,
          liveBroadcastContent: snippet.liveBroadcastContent,
          thumbnails: snippet.thumbnails,
          categoryId: details?.categoryId,
          tags: details?.tags
        }
      };

      return result;
    });
  }

  // ============================================
  // 📹 Get Video Details
  // ============================================

  private async getVideoDetails(videoIds: string[]): Promise<Map<string, any>> {
    if (!this.apiKey || videoIds.length === 0) {
      return new Map();
    }

    try {
      const params = new URLSearchParams({
        key: this.apiKey,
        id: videoIds.join(','),
        part: 'contentDetails,statistics'
      });

      const url = `${this.baseUrl}/videos?${params}`;

      const response = await this.fetchWithTimeout(url);

      if (!response.ok) {
        return new Map();
      }

      const data = await response.json();

      const detailsMap = new Map();

      if (data.items) {
        for (const item of data.items) {
          detailsMap.set(item.id, {
            duration: this.parseDuration(item.contentDetails?.duration),
            views: this.formatViews(item.statistics?.viewCount),
            likes: item.statistics?.likeCount,
            categoryId: item.snippet?.categoryId,
            tags: item.snippet?.tags
          });
        }
      }

      return detailsMap;

    } catch (error) {
      console.warn('⚠️ Failed to get video details:', error);
      return new Map();
    }
  }

  // ============================================
  // ⏱️ Parse ISO 8601 Duration
  // ============================================

  private parseDuration(duration: string): string {
    if (!duration) return 'Unknown';

    // Parse ISO 8601 duration (PT1H2M30S)
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);

    if (!match) return duration;

    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  }

  // ============================================
  // 👁️ Format View Count
  // ============================================

  private formatViews(count: string): string {
    if (!count) return '0';

    const num = parseInt(count);

    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    } else {
      return count;
    }
  }

  // ============================================
  // 📅 Get Published After Date
  // ============================================

  private getPublishedAfter(preset: string): string {
    const now = new Date();

    switch (preset) {
      case 'today':
        now.setDate(now.getDate() - 1);
        break;
      case 'week':
        now.setDate(now.getDate() - 7);
        break;
      case 'month':
        now.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        now.setFullYear(now.getFullYear() - 1);
        break;
    }

    return now.toISOString();
  }

  // ============================================
  // ✅ Check Availability
  // ============================================

  async isAvailable(): Promise<boolean> {
    if (!this.apiKey) {
      return false;
    }

    const quota = await this.getQuota();
    return quota.remaining > 0;
  }

  // ============================================
  // 📊 Get Quota
  // ============================================

  async getQuota(): Promise<ProviderQuota> {
    return {
      used: this.requestCount,
      limit: this.DAILY_LIMIT,
      remaining: Math.max(0, this.DAILY_LIMIT - this.requestCount),
      resetAt: this.getNextResetDate()
    };
  }

  // ============================================
  // 🔄 Get Next Reset Date
  // ============================================

  private getNextResetDate(): Date {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  }

  // ============================================
  // 🔄 Reset Daily Count
  // ============================================

  resetDailyCount(): void {
    this.requestCount = 0;
    console.log('🔄 YouTube Search: Daily count reset');
  }
}

// ============================================
// 🌍 Export default instance
// ============================================

export const youtubeSearchProvider = new YouTubeSearchProvider();
