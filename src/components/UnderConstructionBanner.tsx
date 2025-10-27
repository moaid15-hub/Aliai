'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

export default function UnderConstructionBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="under-construction-banner">
      <div className="banner-content">
        <div className="banner-scroll">
          <span className="banner-text">
            Dr.Muayad وفريق عقول • منصة عقول للذكاء الاصطناعي (Oqool AI) • نبني المستقبل بإبداع عراقي
          </span>
          <span className="banner-text">
            Dr.Muayad وفريق عقول • منصة عقول للذكاء الاصطناعي (Oqool AI) • نبني المستقبل بإبداع عراقي
          </span>
          <span className="banner-text">
            Dr.Muayad وفريق عقول • منصة عقول للذكاء الاصطناعي (Oqool AI) • نبني المستقبل بإبداع عراقي
          </span>
          <span className="banner-text">
            Dr.Muayad وفريق عقول • منصة عقول للذكاء الاصطناعي (Oqool AI) • نبني المستقبل بإبداع عراقي
          </span>
        </div>
      </div>

      <button
        onClick={() => setIsVisible(false)}
        className="banner-close"
        aria-label="إغلاق"
      >
        <X size={16} />
      </button>

      <style jsx>{`
        .under-construction-banner {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: linear-gradient(135deg, #1e3a5f 0%, #0f172a 50%, #1e293b 100%);
          color: #e8e8e8;
          padding: 8px 0;
          z-index: 9999;
          overflow: hidden;
          border-bottom: 1px solid rgba(251, 191, 36, 0.3);
          backdrop-filter: blur(10px);
        }

        .under-construction-banner::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(251, 191, 36, 0.1),
            transparent
          );
          animation: shimmer 3s infinite;
        }

        .banner-content {
          width: 100%;
          overflow: hidden;
          position: relative;
          z-index: 1;
        }

        .banner-scroll {
          display: flex;
          animation: scroll 40s linear infinite;
          white-space: nowrap;
        }

        .banner-text {
          display: inline-block;
          padding: 0 60px;
          font-weight: 500;
          font-size: 14px;
          letter-spacing: 0.5px;
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #fbbf24 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          position: relative;
        }

        .banner-text::before {
          content: '•';
          position: absolute;
          left: 25px;
          color: #3b82f6;
          -webkit-text-fill-color: #3b82f6;
        }

        .banner-close {
          position: absolute;
          top: 50%;
          right: 12px;
          transform: translateY(-50%);
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid rgba(251, 191, 36, 0.2);
          border-radius: 50%;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #e8e8e8;
          z-index: 2;
        }

        .banner-close:hover {
          background: rgba(30, 41, 59, 0.9);
          border-color: rgba(251, 191, 36, 0.5);
          transform: translateY(-50%) rotate(90deg);
          box-shadow: 0 0 15px rgba(251, 191, 36, 0.3);
        }

        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        /* Mobile Styles */
        @media (max-width: 768px) {
          .under-construction-banner {
            padding: 7px 0;
          }

          .banner-text {
            font-size: 13px;
            padding: 0 40px;
          }

          .banner-close {
            width: 26px;
            height: 26px;
            right: 8px;
          }
        }

        @media (max-width: 480px) {
          .under-construction-banner {
            padding: 6px 0;
          }

          .banner-text {
            font-size: 11px;
            padding: 0 30px;
          }

          .banner-close {
            width: 24px;
            height: 24px;
            right: 6px;
          }
        }
      `}</style>
    </div>
  );
}
