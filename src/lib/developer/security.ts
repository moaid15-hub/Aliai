// 🛡️ الأمان والتحقق

import { CommandType, SecurityLevel } from '@/types/developer';

/**
 * قائمة الملفات والمجلدات المحظورة
 */
const BLOCKED_PATTERNS = [
  /node_modules/,
  /\.git/,
  /\.env/,
  /\.env\.local/,
  /\.env\.production/,
  /package-lock\.json/,
  /yarn\.lock/,
  /\.next/,
  /dist/,
  /build/,
];

/**
 * امتدادات الملفات المسموحة
 */
const ALLOWED_EXTENSIONS = [
  '.ts', '.tsx', '.js', '.jsx',
  '.json', '.md', '.txt',
  '.css', '.scss', '.sass',
  '.html', '.svg',
];

/**
 * أوامر Shell محظورة
 */
const BLOCKED_COMMANDS = [
  'rm -rf /',
  'rm -rf *',
  'dd',
  'mkfs',
  'format',
  ':(){ :|:& };:',  // Fork bomb
];

/**
 * التحقق من أمان المسار
 */
export function isPathSafe(path: string): { safe: boolean; reason?: string } {
  // التحقق من Path Traversal
  if (path.includes('..')) {
    return { safe: false, reason: 'Path traversal detected' };
  }

  // التحقق من الأنماط المحظورة
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(path)) {
      return { safe: false, reason: `Blocked pattern: ${pattern}` };
    }
  }

  return { safe: true };
}

/**
 * التحقق من أمان اسم الملف
 */
export function isFilenameSafe(filename: string): { safe: boolean; reason?: string } {
  // التحقق من الامتداد
  const ext = filename.substring(filename.lastIndexOf('.'));
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return { safe: false, reason: `File extension ${ext} not allowed` };
  }

  // التحقق من الأحرف الخطيرة
  if (/[<>:"|?*]/.test(filename)) {
    return { safe: false, reason: 'Invalid characters in filename' };
  }

  return { safe: true };
}

/**
 * تنظيف وتعقيم المحتوى
 */
export function sanitizeContent(content: string): string {
  // إزالة أي محاولات لحقن كود خطير
  return content
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/onerror=/gi, '')
    .replace(/onclick=/gi, '');
}

/**
 * التحقق من أمان الأمر
 */
export function isCommandSafe(command: string): { safe: boolean; reason?: string } {
  const lowerCommand = command.toLowerCase();

  // التحقق من الأوامر المحظورة
  for (const blocked of BLOCKED_COMMANDS) {
    if (lowerCommand.includes(blocked.toLowerCase())) {
      return { safe: false, reason: `Blocked command: ${blocked}` };
    }
  }

  // التحقق من محاولات الحقن
  if (command.includes(';') || command.includes('&&') || command.includes('||')) {
    return { safe: false, reason: 'Command chaining detected' };
  }

  return { safe: true };
}

/**
 * تحديد مستوى الأمان للأمر
 */
export function getSecurityLevel(commandType: CommandType): SecurityLevel {
  const securityLevels: Record<CommandType, SecurityLevel> = {
    [CommandType.READ_FILE]: SecurityLevel.SAFE,
    [CommandType.LIST_FILES]: SecurityLevel.SAFE,
    [CommandType.GIT_STATUS]: SecurityLevel.SAFE,
    
    [CommandType.WRITE_FILE]: SecurityLevel.MODERATE,
    [CommandType.CREATE_DIRECTORY]: SecurityLevel.MODERATE,
    [CommandType.GIT_COMMIT]: SecurityLevel.MODERATE,
    
    [CommandType.DELETE_FILE]: SecurityLevel.DANGEROUS,
    [CommandType.GIT_PUSH]: SecurityLevel.DANGEROUS,
    [CommandType.GIT_PULL]: SecurityLevel.DANGEROUS,
    [CommandType.EXECUTE_COMMAND]: SecurityLevel.DANGEROUS,
  };

  return securityLevels[commandType] || SecurityLevel.DANGEROUS;
}

/**
 * التحقق من الحاجة للموافقة
 */
export function requiresApproval(securityLevel: SecurityLevel, autoApprove: boolean): boolean {
  if (autoApprove && securityLevel === SecurityLevel.SAFE) {
    return false;
  }
  
  return securityLevel === SecurityLevel.DANGEROUS;
}

/**
 * تحليل المخاطر
 */
export function analyzeRisk(
  commandType: CommandType,
  payload: Record<string, any>
): { risk: SecurityLevel; warnings: string[] } {
  const warnings: string[] = [];
  const risk = getSecurityLevel(commandType);

  // تحليل محتوى الـ payload
  if (payload.path) {
    const pathCheck = isPathSafe(payload.path as string);
    if (!pathCheck.safe) {
      warnings.push(pathCheck.reason!);
    }
  }

  if (payload.content) {
    if ((payload.content as string).length > 1000000) {
      warnings.push('Content size exceeds 1MB');
    }
  }

  if (commandType === CommandType.EXECUTE_COMMAND && payload.command) {
    const cmdCheck = isCommandSafe(payload.command as string);
    if (!cmdCheck.safe) {
      warnings.push(cmdCheck.reason!);
    }
  }

  return { risk, warnings };
}

/**
 * إنشاء whitelist للمشروع
 */
export function createProjectWhitelist(projectPath: string): string[] {
  return [
    projectPath,
    `${projectPath}/src/**/*`,
    `${projectPath}/public/**/*`,
    `${projectPath}/components/**/*`,
    `${projectPath}/lib/**/*`,
    `${projectPath}/pages/**/*`,
    `${projectPath}/app/**/*`,
  ];
}

/**
 * التحقق من أن المسار ضمن الـ whitelist
 */
export function isPathInWhitelist(path: string, whitelist: string[]): boolean {
  return whitelist.some(pattern => {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return regex.test(path);
  });
}
