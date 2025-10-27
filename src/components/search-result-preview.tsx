// ============================================
// 🔍 Search Result Preview Component
// ============================================

"use client";

import React, { useMemo } from 'react';
import { SearchResult } from '@/lib/types';

interface SearchResultPreviewProps {
  results: SearchResult[];
  query: string;
  onResultClick?: (result: SearchResult) => void;
  className?: string;
}

export const SearchResultPreview: React.FC<SearchResultPreviewProps> = ({
  results,
  query,
  onResultClick,
  className = ""
}) => {
  if (!results || results.length === 0) {
    return (
      <div className={`p-6 text-center text-gray-500 ${className}`}>
        <div className="mb-4">🔍</div>
        <p>لم يتم العثور على نتائج للبحث: "{query}"</p>
        <p className="text-sm mt-2">جرب كلمات مختلفة أو أعد صياغة السؤال</p>
      </div>
    );
  }

  const orderedResults = useMemo(() => {
    const getPriority = (result: SearchResult) => {
      const url = result.url.toLowerCase();
      if (url.includes('youtube.com') || url.includes('youtu.be')) return 1;
      if (url.includes('wikipedia.org')) return 2;
      if (url.includes('stackoverflow.com') || url.includes('stack overflow')) return 3;
      return 0;
    };

    return [...results]
      .map((result) => ({ ...result }))
      .sort((a, b) => getPriority(a) - getPriority(b));
  }, [results]);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="text-sm text-gray-600 mb-4">
        🔍 {orderedResults.length} نتيجة للبحث: "{query}"
      </div>
      
      {orderedResults.map((result, index) => (
        <SearchResultCard
          key={`${result.url}-${index}`}
          result={result}
          index={index + 1}
          onClick={() => onResultClick?.(result)}
        />
      ))}
    </div>
  );
};

// ============================================
// 🎴 Search Result Card Component
// ============================================

interface SearchResultCardProps {
  result: SearchResult;
  index: number;
  onClick?: () => void;
}

const SearchResultCard: React.FC<SearchResultCardProps> = ({
  result,
  index,
  onClick
}) => {
  const isYouTube = result.url.includes('youtube.com') || result.url.includes('youtu.be');
  const isWikipedia = result.url.includes('wikipedia.org');
  const isStackOverflow = result.url.includes('stackoverflow.com');
  const isGitHub = result.url.includes('github.com');
  const youTubeThumbnail = isYouTube ? buildYouTubeThumbnail(result.url) : undefined;
  const thumbnailToShow = result.thumbnail || youTubeThumbnail;

  // تحديد الأيقونة حسب المصدر
  let icon = '🔍';
  if (isYouTube) icon = '🎥';
  else if (isWikipedia) icon = '📚';
  else if (isStackOverflow) icon = '💻';
  else if (isGitHub) icon = '⚙️';

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="text-lg">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            #{index} • {result.displayLink || new URL(result.url).hostname}
          </div>
          
          <h3 className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 line-clamp-2 mb-2">
            {result.title}
          </h3>
        </div>
      </div>

      {/* YouTube metadata */}
      {isYouTube && (result.author || result.duration || result.views) && (
        <div className="text-sm text-gray-600 dark:text-gray-300 mb-2 flex gap-4">
          {result.author && <span>👤 {result.author}</span>}
          {result.duration && <span>⏱️ {result.duration}</span>}
          {result.views && <span>👁️ {result.views}</span>}
        </div>
      )}

      {/* Snippet */}
      {result.snippet && (
        <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-3 mb-3">
          {result.snippet}
        </p>
      )}

      {/* Thumbnails */}
      {thumbnailToShow && (
        <div className="mb-3">
          <img
            src={thumbnailToShow}
            alt={result.title}
            className="w-full h-32 object-cover rounded-md"
            loading="lazy"
          />
        </div>
      )}

      {/* URL */}
      <div className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate">
        🔗 {result.url}
      </div>

      {/* Action buttons */}
      <div className="mt-3 flex gap-2">
        <a
          href={result.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-md text-sm hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          🔗 فتح الرابط
        </a>
        
        {isYouTube && (
          <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md text-sm">
            🎥 فيديو
          </span>
        )}
      </div>
    </div>
  );
};

// ============================================
// 🎯 Loading Component
// ============================================

export const SearchResultSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700"
        >
          <div className="animate-pulse">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-2"></div>
                <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-3"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SearchResultPreview;

function buildYouTubeThumbnail(url: string): string | undefined {
  try {
    const videoId = extractYouTubeId(url);
    if (!videoId) return undefined;
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  } catch (error) {
    console.warn('Failed to build YouTube thumbnail:', error);
    return undefined;
  }
}

function extractYouTubeId(url: string): string | undefined {
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname.includes('youtu.be')) {
      return parsedUrl.pathname.replace('/', '') || undefined;
    }

    if (parsedUrl.searchParams.has('v')) {
      return parsedUrl.searchParams.get('v') || undefined;
    }

    const pathMatch = parsedUrl.pathname.match(/\/embed\/([\w-]+)/);
    if (pathMatch) {
      return pathMatch[1];
    }
  } catch (error) {
    console.warn('Failed to parse YouTube URL:', error);
  }

  return undefined;
}