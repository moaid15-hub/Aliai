// 🔐 إدارة API Keys

import crypto from 'crypto';

interface StoredApiKey {
  id: string;
  key_hash: string;
  name: string;
  created_at: string;
  last_used?: string;
  expires_at?: string;
  permissions: string[];
  is_active: boolean;
}

// تخزين مؤقت في الذاكرة (في الإنتاج استخدم Database)
const API_KEYS = new Map<string, StoredApiKey>();

/**
 * توليد API Key جديد
 */
export function generateApiKey(name: string, permissions: string[] = []): { id: string; key: string } {
  const id = crypto.randomUUID();
  const key = `oqool_${crypto.randomBytes(32).toString('hex')}`;
  const key_hash = hashApiKey(key);

  const apiKey: StoredApiKey = {
    id,
    key_hash,
    name,
    created_at: new Date().toISOString(),
    permissions,
    is_active: true,
  };

  API_KEYS.set(id, apiKey);

  return { id, key };
}

/**
 * التحقق من صحة API Key
 */
export function verifyApiKey(key: string): { valid: boolean; key_id?: string; permissions?: string[] } {
  const key_hash = hashApiKey(key);

  for (const [id, storedKey] of API_KEYS.entries()) {
    if (storedKey.key_hash === key_hash && storedKey.is_active) {
      // تحديث آخر استخدام
      storedKey.last_used = new Date().toISOString();
      
      // التحقق من انتهاء الصلاحية
      if (storedKey.expires_at && new Date(storedKey.expires_at) < new Date()) {
        return { valid: false };
      }

      return {
        valid: true,
        key_id: id,
        permissions: storedKey.permissions,
      };
    }
  }

  return { valid: false };
}

/**
 * إلغاء API Key
 */
export function revokeApiKey(key_id: string): boolean {
  const key = API_KEYS.get(key_id);
  if (key) {
    key.is_active = false;
    return true;
  }
  return false;
}

/**
 * الحصول على جميع API Keys
 */
export function listApiKeys(): StoredApiKey[] {
  return Array.from(API_KEYS.values());
}

/**
 * الحصول على API Key بالـ ID
 */
export function getApiKeyById(key_id: string): StoredApiKey | undefined {
  return API_KEYS.get(key_id);
}

/**
 * تشفير API Key للتخزين
 */
function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

/**
 * حذف API Keys منتهية الصلاحية
 */
export function cleanupExpiredKeys(): number {
  let removed = 0;
  const now = new Date();

  for (const [id, key] of API_KEYS.entries()) {
    if (key.expires_at && new Date(key.expires_at) < now) {
      API_KEYS.delete(id);
      removed++;
    }
  }

  return removed;
}

/**
 * التحقق من الصلاحيات
 */
export function hasPermission(key_id: string, permission: string): boolean {
  const key = API_KEYS.get(key_id);
  if (!key || !key.is_active) return false;

  // إذا كان لديه صلاحية '*' يعني لديه كل الصلاحيات
  if (key.permissions.includes('*')) return true;

  return key.permissions.includes(permission);
}
