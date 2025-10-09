'use client';

import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  content: string;
  isUser: boolean;
}

export function MessageBubble({ content, isUser }: MessageBubbleProps) {
  return (
    <div
      className={cn(
        'px-4 py-3 rounded-2xl max-w-[80%] break-words',
        isUser
          ? 'bg-blue-600 text-white rounded-br-sm'
          : 'bg-gray-100 text-gray-900 rounded-bl-sm'
      )}
    >
      <div className="whitespace-pre-wrap text-sm leading-relaxed">
        {content}
      </div>
    </div>
  );
}


