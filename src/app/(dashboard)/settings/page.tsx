'use client';

import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="h-full overflow-y-auto bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          ⚙️ الإعدادات
        </h1>

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>الملف الشخصي</CardTitle>
            <CardDescription>معلوماتك الشخصية</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                الاسم الكامل
              </label>
              <p className="mt-1 text-gray-900">
                {user?.full_name || 'غير محدد'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                البريد الإلكتروني
              </label>
              <p className="mt-1 text-gray-900">{user?.email}</p>
            </div>
            <Button variant="outline">تعديل الملف الشخصي</Button>
          </CardContent>
        </Card>

        {/* Usage Card */}
        <Card>
          <CardHeader>
            <CardTitle>الاستخدام</CardTitle>
            <CardDescription>إحصائيات استخدامك الشهري</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                التوكنات المستخدمة
              </label>
              <div className="mt-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">
                    {user?.monthly_tokens_used.toLocaleString()} من{' '}
                    {user?.monthly_tokens_limit.toLocaleString()}
                  </span>
                  <span className="text-gray-600">
                    {user?.monthly_tokens_used &&
                    user?.monthly_tokens_limit
                      ? (
                          (user.monthly_tokens_used /
                            user.monthly_tokens_limit) *
                          100
                        ).toFixed(1)
                      : 0}
                    %
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${
                        user?.monthly_tokens_used &&
                        user?.monthly_tokens_limit
                          ? (user.monthly_tokens_used /
                              user.monthly_tokens_limit) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Card */}
        <Card>
          <CardHeader>
            <CardTitle>الحساب</CardTitle>
            <CardDescription>إدارة حسابك</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                حالة الحساب
              </label>
              <p className="mt-1">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user?.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {user?.is_active ? '✓ نشط' : '✗ غير نشط'}
                </span>
              </p>
            </div>
            <Button variant="destructive" disabled>
              حذف الحساب
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


