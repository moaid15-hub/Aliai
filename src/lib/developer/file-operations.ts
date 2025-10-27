// 📁 عمليات الملفات

import fs from 'fs/promises';
import path from 'path';
import { isPathSafe, isFilenameSafe, sanitizeContent } from './security';
import { ProjectFile } from '@/types/developer';

/**
 * قراءة محتوى ملف
 */
export async function readFile(filePath: string): Promise<string> {
  const pathCheck = isPathSafe(filePath);
  if (!pathCheck.safe) {
    throw new Error(`Unsafe path: ${pathCheck.reason}`);
  }

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return content;
  } catch (error: any) {
    throw new Error(`Failed to read file: ${error.message}`);
  }
}

/**
 * كتابة محتوى إلى ملف
 */
export async function writeFile(
  filePath: string,
  content: string,
  sanitize: boolean = true
): Promise<void> {
  const pathCheck = isPathSafe(filePath);
  if (!pathCheck.safe) {
    throw new Error(`Unsafe path: ${pathCheck.reason}`);
  }

  const filename = path.basename(filePath);
  const filenameCheck = isFilenameSafe(filename);
  if (!filenameCheck.safe) {
    throw new Error(`Unsafe filename: ${filenameCheck.reason}`);
  }

  try {
    // إنشاء المجلد إذا لم يكن موجوداً
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });

    // تعقيم المحتوى إذا مطلوب
    const finalContent = sanitize ? sanitizeContent(content) : content;

    await fs.writeFile(filePath, finalContent, 'utf-8');
  } catch (error: any) {
    throw new Error(`Failed to write file: ${error.message}`);
  }
}

/**
 * حذف ملف
 */
export async function deleteFile(filePath: string): Promise<void> {
  const pathCheck = isPathSafe(filePath);
  if (!pathCheck.safe) {
    throw new Error(`Unsafe path: ${pathCheck.reason}`);
  }

  try {
    await fs.unlink(filePath);
  } catch (error: any) {
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}

/**
 * إنشاء مجلد
 */
export async function createDirectory(dirPath: string): Promise<void> {
  const pathCheck = isPathSafe(dirPath);
  if (!pathCheck.safe) {
    throw new Error(`Unsafe path: ${pathCheck.reason}`);
  }

  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error: any) {
    throw new Error(`Failed to create directory: ${error.message}`);
  }
}

/**
 * عرض قائمة الملفات
 */
export async function listFiles(dirPath: string = '.'): Promise<ProjectFile[]> {
  const pathCheck = isPathSafe(dirPath);
  if (!pathCheck.safe) {
    throw new Error(`Unsafe path: ${pathCheck.reason}`);
  }

  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    const files: ProjectFile[] = await Promise.all(
      entries.map(async (entry) => {
        const fullPath = path.join(dirPath, entry.name);
        const stats = await fs.stat(fullPath);

        return {
          path: fullPath,
          name: entry.name,
          type: entry.isDirectory() ? 'directory' : 'file',
          size: entry.isFile() ? stats.size : undefined,
          modified_at: stats.mtime,
        };
      })
    );

    return files;
  } catch (error: any) {
    throw new Error(`Failed to list files: ${error.message}`);
  }
}

/**
 * التحقق من وجود ملف
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * الحصول على معلومات الملف
 */
export async function getFileInfo(filePath: string): Promise<ProjectFile | null> {
  const pathCheck = isPathSafe(filePath);
  if (!pathCheck.safe) {
    return null;
  }

  try {
    const stats = await fs.stat(filePath);
    const isDirectory = stats.isDirectory();

    return {
      path: filePath,
      name: path.basename(filePath),
      type: isDirectory ? 'directory' : 'file',
      size: isDirectory ? undefined : stats.size,
      modified_at: stats.mtime,
    };
  } catch {
    return null;
  }
}

/**
 * نسخ ملف
 */
export async function copyFile(source: string, destination: string): Promise<void> {
  const sourceCheck = isPathSafe(source);
  const destCheck = isPathSafe(destination);

  if (!sourceCheck.safe) {
    throw new Error(`Unsafe source path: ${sourceCheck.reason}`);
  }
  if (!destCheck.safe) {
    throw new Error(`Unsafe destination path: ${destCheck.reason}`);
  }

  try {
    await fs.copyFile(source, destination);
  } catch (error: any) {
    throw new Error(`Failed to copy file: ${error.message}`);
  }
}

/**
 * نقل/إعادة تسمية ملف
 */
export async function moveFile(source: string, destination: string): Promise<void> {
  const sourceCheck = isPathSafe(source);
  const destCheck = isPathSafe(destination);

  if (!sourceCheck.safe) {
    throw new Error(`Unsafe source path: ${sourceCheck.reason}`);
  }
  if (!destCheck.safe) {
    throw new Error(`Unsafe destination path: ${destCheck.reason}`);
  }

  try {
    await fs.rename(source, destination);
  } catch (error: any) {
    throw new Error(`Failed to move file: ${error.message}`);
  }
}

/**
 * الحصول على حجم الملف
 */
export async function getFileSize(filePath: string): Promise<number> {
  try {
    const stats = await fs.stat(filePath);
    return stats.size;
  } catch (error: any) {
    throw new Error(`Failed to get file size: ${error.message}`);
  }
}

/**
 * تنسيق حجم الملف
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}
