'use client';

import { Message } from '@/types/chat';
import { MessageBubble } from './MessageBubble';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatTime } from '@/lib/utils';
import { useState } from 'react';

interface ChatMessageProps {
  message: Message;
  userName?: string;
}

export function ChatMessage({ message, userName }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`flex gap-3 mb-4 ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {/* Avatar */}
      <Avatar className="flex-shrink-0">
        <AvatarFallback
          className={isUser ? 'bg-blue-600 text-white' : 'bg-gray-600 text-white'}
        >
          {isUser ? (userName?.[0]?.toUpperCase() || 'U') : '🤖'}
        </AvatarFallback>
      </Avatar>

      {/* Message Content */}
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} flex-1`}>
        {/* Message Bubble */}
        <MessageBubble content={message.content} isUser={isUser} />

        {/* Timestamp & Actions */}
        <div
          className={`flex items-center gap-2 mt-1 px-2 ${
            isUser ? 'flex-row-reverse' : 'flex-row'
          }`}
        >
          <span className="text-xs text-gray-500">
            {formatTime(message.created_at)}
          </span>

          {/* Copy Button */}
          {!isUser && (
            <button
              onClick={handleCopy}
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
              title="نسخ"
            >
              {copied ? '✓ تم النسخ' : '📋 نسخ'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


