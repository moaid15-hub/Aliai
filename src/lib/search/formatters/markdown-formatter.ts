// ============================================
// 📝 Markdown Formatter
// تنسيق النتائج بصيغة Markdown
// ============================================

import { SearchResult, SearchResponse, MultiSourceResponse, SourceResults } from '../core/types';

// ============================================
// 📝 Markdown Formatter Class
// ============================================

export class MarkdownFormatter {

  // ============================================
  // 📊 Format Search Response
  // ============================================

  static formatSearchResponse(response: SearchResponse): string {
    let output = '';

    // Header
    output += `# 🔍 نتائج البحث: ${response.query}\n\n`;

    // Stats
    output += `**عدد النتائج:** ${response.totalResults} • `;
    output += `**الوقت:** ${response.searchTime}ms • `;
    output += `**المصادر:** ${response.sources.join(', ')}\n\n`;

    if (response.cached) {
      output += `💾 _النتائج من التخزين المؤقت_\n\n`;
    }

    output += `---\n\n`;

    // Results
    response.results.forEach((result, index) => {
      output += this.formatResult(result, index + 1);
      output += `\n---\n\n`;
    });

    // Suggestions
    if (response.suggestions && response.suggestions.length > 0) {
      output += `## 💡 اقتراحات ذات صلة\n\n`;
      response.suggestions.forEach(suggestion => {
        output += `- ${suggestion}\n`;
      });
      output += `\n`;
    }

    return output;
  }

  // ============================================
  // 🌐 Format Multi-Source Response
  // ============================================

  static formatMultiSourceResponse(response: MultiSourceResponse): string {
    let output = '';

    // Header
    output += `# 🌐 بحث متعدد المصادر: ${response.query}\n\n`;

    // Stats
    output += `**إجمالي النتائج:** ${response.totalResults} • `;
    output += `**الوقت:** ${response.searchTime}ms • `;
    output += `**عدد المصادر:** ${response.additionalSources.length + 1}\n\n`;

    output += `---\n\n`;

    // Primary Source
    output += `## ${response.primarySource.icon} ${response.primarySource.sourceLabel} (المصدر الرئيسي)\n\n`;
    output += this.formatSourceResults(response.primarySource);

    // Additional Sources
    if (response.additionalSources.length > 0) {
      output += `\n## 📚 مصادر إضافية\n\n`;

      response.additionalSources.forEach(sourceResult => {
        output += `### ${sourceResult.icon} ${sourceResult.sourceLabel}\n\n`;
        output += this.formatSourceResults(sourceResult, 3); // Max 3 results per source
        output += `\n`;
      });
    }

    return output;
  }

  // ============================================
  // 📦 Format Source Results
  // ============================================

  private static formatSourceResults(sourceResult: SourceResults, maxResults: number = 5): string {
    let output = '';

    if (sourceResult.results.length === 0) {
      output += `_لا توجد نتائج_\n\n`;
      return output;
    }

    const resultsToShow = sourceResult.results.slice(0, maxResults);

    resultsToShow.forEach((result, index) => {
      output += this.formatResult(result, index + 1, false);
      output += `\n`;
    });

    if (sourceResult.results.length > maxResults) {
      output += `_...و ${sourceResult.results.length - maxResults} نتيجة أخرى_\n\n`;
    }

    return output;
  }

  // ============================================
  // 📄 Format Single Result
  // ============================================

  private static formatResult(result: SearchResult, index: number, detailed: boolean = true): string {
    let output = '';

    // Title
    output += `## ${index}. ${result.title}\n\n`;

    // Thumbnail
    if (result.thumbnail) {
      output += `![${result.title}](${result.thumbnail})\n\n`;
    }

    // Metadata
    const metadata: string[] = [];

    if (result.source) {
      metadata.push(`**المصدر:** ${result.source}`);
    }

    if (result.author) {
      metadata.push(`**الكاتب:** ${result.author}`);
    }

    if (result.publishDate) {
      const date = new Date(result.publishDate);
      metadata.push(`**التاريخ:** ${date.toLocaleDateString('ar-SA')}`);
    }

    if (result.relevanceScore && result.relevanceScore > 0) {
      metadata.push(`**الصلة:** ${Math.round(result.relevanceScore * 100)}%`);
    }

    if (metadata.length > 0) {
      output += metadata.join(' • ') + '\n\n';
    }

    // Video Info
    if (result.video) {
      output += `📹 **معلومات الفيديو:**\n`;
      if (result.video.duration) output += `- المدة: ${result.video.duration}\n`;
      if (result.video.views) output += `- المشاهدات: ${result.video.views}\n`;
      if (result.video.channelName) output += `- القناة: ${result.video.channelName}\n`;
      output += `\n`;
    }

    // Snippet
    output += `${result.snippet}\n\n`;

    // Full content (if detailed)
    if (detailed && result.content && result.content !== result.snippet) {
      output += `**التفاصيل:**\n${result.content.substring(0, 500)}...\n\n`;
    }

    // URL
    output += `🔗 [اضغط للفتح](${result.url})\n`;

    if (result.displayLink) {
      output += `\n_${result.displayLink}_\n`;
    }

    return output;
  }

  // ============================================
  // 📋 Format Results List (Compact)
  // ============================================

  static formatCompactList(results: SearchResult[]): string {
    let output = '';

    results.forEach((result, index) => {
      output += `${index + 1}. **[${result.title}](${result.url})**\n`;
      output += `   ${result.snippet.substring(0, 100)}...\n`;

      if (result.source) {
        output += `   _المصدر: ${result.source}_\n`;
      }

      output += `\n`;
    });

    return output;
  }

  // ============================================
  // 📊 Format Statistics
  // ============================================

  static formatStatistics(stats: any): string {
    let output = '';

    output += `# 📊 إحصائيات البحث\n\n`;

    // Cache Stats
    if (stats.cache) {
      output += `## 💾 التخزين المؤقت\n\n`;
      output += `- عدد المدخلات: ${stats.cache.l1Size + stats.cache.l2Size}\n`;
      output += `- L1 Cache: ${stats.cache.l1Size}\n`;
      output += `- L2 Cache: ${stats.cache.l2Size}\n`;
      output += `- معدل النجاح: ${stats.cache.hitRate.toFixed(2)}%\n`;
      output += `- الإصابات: ${stats.cache.hits}\n`;
      output += `- الإخفاقات: ${stats.cache.misses}\n\n`;
    }

    // Usage Stats
    if (stats.usage) {
      output += `## 📈 الاستخدام اليومي\n\n`;
      output += `- إجمالي البحوث: ${stats.usage.today.total}\n`;
      output += `- الناجحة: ${stats.usage.today.successful}\n`;
      output += `- الفاشلة: ${stats.usage.today.failed}\n`;
      output += `- المتبقي: ${stats.usage.today.remaining}\n`;
      output += `- معدل النجاح: ${stats.usage.successRate.toFixed(2)}%\n\n`;

      if (Object.keys(stats.usage.bySource).length > 0) {
        output += `### الاستخدام حسب المصدر:\n\n`;
        for (const [source, count] of Object.entries(stats.usage.bySource)) {
          output += `- ${source}: ${count}\n`;
        }
        output += `\n`;
      }
    }

    // Providers
    if (stats.providers) {
      output += `## 🔌 المزودات المتاحة\n\n`;
      stats.providers.forEach((provider: any) => {
        output += `- **${provider.name}** (${provider.source}) - Priority: ${provider.priority}\n`;
      });
      output += `\n`;
    }

    return output;
  }

  // ============================================
  // 🎨 Format with Custom Template
  // ============================================

  static formatWithTemplate(result: SearchResult, template: string): string {
    return template
      .replace(/{title}/g, result.title)
      .replace(/{url}/g, result.url)
      .replace(/{snippet}/g, result.snippet)
      .replace(/{content}/g, result.content)
      .replace(/{source}/g, result.source)
      .replace(/{author}/g, result.author || 'غير معروف')
      .replace(/{date}/g, result.publishDate || 'غير محدد')
      .replace(/{thumbnail}/g, result.thumbnail || '');
  }
}
