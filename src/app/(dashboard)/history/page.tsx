'use client';

import { useChat } from '@/hooks/useChat';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateTime, truncate } from '@/lib/utils';
import Link from 'next/link';

export default function HistoryPage() {
  const { conversations, isLoading } = useChat();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-600">جاري تحميل السجل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          📜 سجل المحادثات
        </h1>

        {conversations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-600">لا توجد محادثات في السجل</p>
              <Link
                href="/chat"
                className="text-blue-600 hover:underline mt-4 inline-block"
              >
                ابدأ محادثة جديدة
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {conversations.map((conv) => (
              <Link
                key={conv.id}
                href={`/chat?id=${conv.id}`}
                className="block"
              >
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{conv.title}</span>
                      <span className="text-sm font-normal text-gray-500">
                        {formatDateTime(conv.updated_at)}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  {conv.summary && (
                    <CardContent>
                      <p className="text-gray-600 text-sm">
                        {truncate(conv.summary, 150)}
                      </p>
                    </CardContent>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


