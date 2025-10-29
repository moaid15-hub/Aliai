// VideoCards.tsx
// عرض بطاقات الفيديوهات التعليمية من يوتيوب

import React from 'react';
import './VideoCards.css';

interface Video {
  id: string;
  title: string;
  url: string;
  thumbnail?: string;
  channelName?: string;
  duration?: string;
  views?: string;
  publishedAt?: string;
}

interface VideoCardsProps {
  videos: Video[];
  isExplicitSearch?: boolean;
}

const VideoCards: React.FC<VideoCardsProps> = ({ videos, isExplicitSearch = false }) => {
  if (!videos || videos.length === 0) {
    return null;
  }

  return (
    <div className="video-cards-container">
      {isExplicitSearch && (
        <div className="video-cards-header">
          <h3>🎬 فيديوهات تعليمية من يوتيوب</h3>
          <p>شوف هاي الفيديوهات الزينة يا شاطر!</p>
        </div>
      )}
      {!isExplicitSearch && (
        <div className="video-cards-header suggested">
          <h3>📚 فيديوهات مقترحة قد تعجبك</h3>
        </div>
      )}

      <div className="video-cards-grid">
        {videos.map((video, index) => (
          <a
            key={video.id || index}
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="video-card"
          >
            <div className="video-card-thumbnail">
              {video.thumbnail ? (
                <img src={video.thumbnail} alt={video.title} />
              ) : (
                <div className="video-card-thumbnail-placeholder">
                  <span>🎥</span>
                </div>
              )}
              {video.duration && (
                <div className="video-card-duration">{video.duration}</div>
              )}
            </div>

            <div className="video-card-content">
              <h4 className="video-card-title">{video.title}</h4>

              {video.channelName && (
                <p className="video-card-channel">
                  <span className="channel-icon">👤</span>
                  {video.channelName}
                </p>
              )}

              {video.views && (
                <p className="video-card-views">
                  <span className="views-icon">👁️</span>
                  {video.views} مشاهدة
                </p>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default VideoCards;
