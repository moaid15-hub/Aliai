// ============================================
// 📇 بطاقة نتيجة البحث - Search Result Card
// ============================================

'use client';

import React from 'react';

// ============================================
// 📝 Types
// ============================================

export interface SearchCardProps {
  title: string;
  url: string;
  snippet: string;
  source?: string;
  thumbnail?: string;
  displayLink?: string;
  author?: string;
  publishDate?: string;
  relevanceScore?: number;
  video?: {
    duration?: string;
    views?: string;
    channelName?: string;
  };
  index?: number;
}

// ============================================
// 🎨 Component
// ============================================

export const SearchCard: React.FC<SearchCardProps> = ({
  title,
  url,
  snippet,
  source,
  thumbnail,
  displayLink,
  author,
  publishDate,
  relevanceScore,
  video,
  index
}) => {

  // تحديد أيقونة المصدر
  const getSourceIcon = () => {
    if (source?.toLowerCase().includes('youtube')) return '📹';
    if (source?.toLowerCase().includes('wikipedia')) return '📚';
    if (source?.toLowerCase().includes('google')) return '🔍';
    return '🌐';
  };

  // تحديد لون المصدر
  const getSourceColor = () => {
    if (source?.toLowerCase().includes('youtube')) return '#FF0000';
    if (source?.toLowerCase().includes('wikipedia')) return '#000000';
    if (source?.toLowerCase().includes('google')) return '#4285F4';
    return '#666';
  };

  // تنسيق التاريخ
  const formatDate = (date?: string) => {
    if (!date) return null;
    try {
      const d = new Date(date);
      return d.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return null;
    }
  };

  return (
    <div className="search-card" style={{
      background: '#fff',
      borderRadius: '5px',
      padding: '6px',
      marginBottom: '5px',
      boxShadow: '0 1px 5px rgba(0,0,0,0.1)',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      border: '1px solid #e0e0e0',
      position: 'relative'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
      e.currentTarget.style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
      e.currentTarget.style.transform = 'translateY(0)';
    }}
    onClick={() => window.open(url, '_blank')}
    >
      {/* رقم النتيجة */}
      {index !== undefined && (
        <div style={{
          position: 'absolute',
          top: '4px',
          right: '4px',
          background: '#3b82f6',
          color: '#fff',
          width: '14px',
          height: '14px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '8px',
          fontWeight: 'bold',
          zIndex: 1
        }}>
          {index}
        </div>
      )}

      {/* الصورة المصغرة */}
      {thumbnail && (
        <div style={{
          marginBottom: '5px',
          borderRadius: '4px',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <img
            src={thumbnail}
            alt={title}
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: '84px',
              objectFit: 'cover'
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          {/* مدة الفيديو */}
          {video?.duration && (
            <div style={{
              position: 'absolute',
              bottom: '2px',
              right: '2px',
              background: 'rgba(0,0,0,0.8)',
              color: '#fff',
              padding: '1px 4px',
              borderRadius: '3px',
              fontSize: '7px',
              fontWeight: 'bold'
            }}>
              {video.duration}
            </div>
          )}
        </div>
      )}

      {/* معلومات المصدر */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        marginBottom: '4px',
        fontSize: '8px',
        color: '#666'
      }}>
        {/* أيقونة المصدر */}
        <span style={{ fontSize: '10px' }}>
          {getSourceIcon()}
        </span>

        {/* اسم المصدر */}
        {displayLink && (
          <span style={{
            color: getSourceColor(),
            fontWeight: '500'
          }}>
            {displayLink}
          </span>
        )}

        {/* معلومات الفيديو */}
        {video && (
          <>
            {video.channelName && (
              <span>• {video.channelName}</span>
            )}
            {video.views && (
              <span>• {video.views} مشاهدة</span>
            )}
          </>
        )}

        {/* التاريخ */}
        {publishDate && (
          <span>• {formatDate(publishDate)}</span>
        )}
      </div>

      {/* العنوان */}
      <h3 style={{
        margin: '0 0 4px 0',
        fontSize: '10px',
        fontWeight: 'bold',
        color: '#1a1a1a',
        lineHeight: '1.3',
        paddingRight: index !== undefined ? '18px' : '0',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }}>
        {title}
      </h3>

      {/* المقتطف (Snippet) */}
      {snippet && (
        <p style={{
          margin: '0',
          fontSize: '8px',
          color: '#666',
          lineHeight: '1.4',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {snippet}
        </p>
      )}

      {/* درجة الصلة */}
      {relevanceScore !== undefined && relevanceScore > 0 && (
        <div style={{
          marginTop: '4px',
          fontSize: '7px',
          color: '#999',
          display: 'flex',
          alignItems: 'center',
          gap: '2px'
        }}>
          <span>⭐</span>
          <span>{Math.round(relevanceScore)}% ملاءمة</span>
        </div>
      )}
    </div>
  );
};

export default SearchCard;
