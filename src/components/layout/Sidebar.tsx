'use client';

import { useChat } from '@/hooks/useChat';
import { Button } from '@/components/ui/button';
import { formatDate, truncate } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Sidebar() {
  const {
    conversations,
    currentConversation,
    selectConversation,
    createConversation,
    deleteConversation,
    isLoading,
  } = useChat();
  const pathname = usePathname();

  const handleNewChat = async () => {
    const conv = await createConversation();
    window.location.href = `/chat?id=${conv.id}`;
  };

  return (
    <aside className="w-64 bg-white border-l border-gray-200 flex flex-col">
      {/* New Chat Button */}
      <div className="p-4 border-b border-gray-200">
        <Button
          onClick={handleNewChat}
          className="w-full"
          disabled={isLoading}
        >
          💬 محادثة جديدة
        </Button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-2">
        {isLoading && conversations.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            جاري التحميل...
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            لا توجد محادثات بعد
          </div>
        ) : (
          <div className="space-y-1">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`group relative p-3 rounded-lg cursor-pointer transition-colors ${
                  currentConversation?.id === conv.id
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => selectConversation(conv.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {truncate(conv.title, 30)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(conv.updated_at)}
                    </p>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('هل تريد حذف هذه المحادثة؟')) {
                        deleteConversation(conv.id);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 text-sm"
                    title="حذف"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <div className="border-t border-gray-200 p-2">
        <Link
          href="/history"
          className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
            pathname === '/history'
              ? 'bg-gray-100 text-gray-900'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          📜 السجل
        </Link>
        <Link
          href="/settings"
          className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
            pathname === '/settings'
              ? 'bg-gray-100 text-gray-900'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          ⚙️ الإعدادات
        </Link>
      </div>
    </aside>
  );
}


