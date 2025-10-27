// ============================================
// 📊 نتائج البحث - Search Results Component
// ============================================

'use client';

import React, { useState } from 'react';
import SearchCard, { SearchCardProps } from './SearchCard';

// ============================================
// 📝 Types
// ============================================

export interface SearchResultsProps {
  query: string;
  results: SearchCardProps[];
  totalResults?: number;
  searchTime?: number;
  sources?: string[];
  cached?: boolean;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
}

// ============================================
// 🎨 Component
// ============================================

export const SearchResults: React.FC<SearchResultsProps> = ({
  query,
  results,
  totalResults,
  searchTime,
  sources = [],
  cached = false,
  loading = false,
  error,
  onRetry
}) => {

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'relevance' | 'date'>('relevance');

  // ============================================
  // 🔄 معالجة البيانات
  // ============================================

  // ترتيب النتائج
  const sortedResults = [...results].sort((a, b) => {
    if (sortBy === 'relevance') {
      return (b.relevanceScore || 0) - (a.relevanceScore || 0);
    } else {
      const dateA = a.publishDate ? new Date(a.publishDate).getTime() : 0;
      const dateB = b.publishDate ? new Date(b.publishDate).getTime() : 0;
      return dateB - dateA;
    }
  });

  // ============================================
  // 🎨 Loading State
  // ============================================

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        gap: '20px'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          border: '4px solid #e0e0e0',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <div style={{
          fontSize: '16px',
          color: '#666',
          fontWeight: '600'
        }}>
          🔍 جاري البحث عن "{query}"...
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // ============================================
  // ❌ Error State
  // ============================================

  if (error) {
    return (
      <div style={{
        background: '#fff3cd',
        border: '1px solid #ffc107',
        borderRadius: '12px',
        padding: '24px',
        margin: '20px 0',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '48px',
          marginBottom: '16px'
        }}>⚠️</div>
        <div style={{
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#856404',
          marginBottom: '8px'
        }}>
          حدث خطأ في البحث
        </div>
        <div style={{
          fontSize: '14px',
          color: '#856404',
          marginBottom: '16px'
        }}>
          {error}
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            style={{
              background: '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 24px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#4a9fd6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#3b82f6';
            }}
          >
            🔄 إعادة المحاولة
          </button>
        )}
      </div>
    );
  }

  // ============================================
  // 📭 Empty State
  // ============================================

  if (!results || results.length === 0) {
    return (
      <div style={{
        background: '#f8f9fa',
        borderRadius: '12px',
        padding: '60px 20px',
        textAlign: 'center',
        margin: '20px 0'
      }}>
        <div style={{
          fontSize: '64px',
          marginBottom: '16px'
        }}>🔍</div>
        <div style={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#333',
          marginBottom: '8px'
        }}>
          لم يتم العثور على نتائج
        </div>
        <div style={{
          fontSize: '14px',
          color: '#666'
        }}>
          جرب كلمات مفتاحية مختلفة أو تحقق من الإملاء
        </div>
      </div>
    );
  }

  // ============================================
  // ✅ Results Display
  // ============================================

  return (
    <div className="search-results-container" style={{
      padding: '0'
    }}>
      {/* عنوان البحث */}
      <div style={{
        marginBottom: '20px',
        marginTop: '-16px',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '18px',
          fontWeight: '600',
          background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #fbbf24 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '8px',
          filter: 'drop-shadow(0 2px 4px rgba(251, 191, 36, 0.3))'
        }}>
          {query}
        </div>
        <div style={{
          height: '3px',
          background: 'linear-gradient(90deg, transparent, #fbbf24, #f59e0b, #fbbf24, transparent)',
          borderRadius: '2px',
          maxWidth: '400px',
          margin: '0 auto',
          boxShadow: '0 2px 8px rgba(251, 191, 36, 0.4)'
        }} />
      </div>

      {/* النتائج */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '10px',
        maxWidth: '700px'
      }}>
        {sortedResults.map((result, index) => (
          <SearchCard
            key={`${result.url}-${index}`}
            {...result}
            index={index + 1}
          />
        ))}
      </div>

      {/* تذييل النتائج */}
      {results.length > 0 && (
        <div style={{
          textAlign: 'center',
          padding: '8px',
          fontSize: '12px',
          color: '#888'
        }}>
          تم عرض {results.length} من أصل {totalResults || results.length} نتيجة
        </div>
      )}
    </div>
  );
};

export default SearchResults;
