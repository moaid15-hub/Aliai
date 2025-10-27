/**
 * VideoCard Component
 * بطاقة عرض الفيديوهات التعليمية
 */

import React from 'react';

interface VideoCardProps {
  title: string;
  url: string;
  thumbnail?: string;
  author?: string;
  source?: string;
}

const VideoCard: React.FC<VideoCardProps> = ({
  title,
  url,
  thumbnail,
  author,
  source
}) => {
  // استخراج YouTube video ID من الرابط
  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return match ? match[1] : null;
  };

  const videoId = getYouTubeId(url);
  const thumbnailUrl = thumbnail || (videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : '/images/video-placeholder.jpg');

  const handleClick = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      onClick={handleClick}
      className="video-card group cursor-pointer bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
      style={{ direction: 'rtl' }}
    >
      {/* الصورة المصغرة */}
      <div className="relative w-full h-40 bg-gray-200 overflow-hidden">
        <img
          src={thumbnailUrl}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.src = '/images/video-placeholder.jpg';
          }}
        />
        {/* أيقونة التشغيل */}
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
          </div>
        </div>
        {/* شارة YouTube */}
        {source?.toLowerCase().includes('youtube') && (
          <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
            YouTube
          </div>
        )}
      </div>

      {/* المحتوى */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>

        {author && (
          <p className="text-xs text-gray-500 mb-2">
            👤 {author}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>📹 فيديو تعليمي</span>
          <span className="text-blue-500 group-hover:text-blue-700 font-semibold">
            شاهد الآن ←
          </span>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
