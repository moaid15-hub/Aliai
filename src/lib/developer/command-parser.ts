// 📝 تحليل وتنفيذ الأوامر

import {
  Command,
  CommandType,
  CommandResult,
  CommandStatus,
  SecurityLevel,
} from '@/types/developer';
import { getSecurityLevel, analyzeRisk } from './security';

/**
 * تحليل الأمر من النص
 */
export function parseCommand(input: string): Partial<Command> | null {
  const trimmed = input.trim();

  // قراءة ملف
  if (trimmed.startsWith('read ') || trimmed.startsWith('cat ')) {
    const path = trimmed.split(' ')[1];
    return {
      type: CommandType.READ_FILE,
      payload: { path },
      security_level: SecurityLevel.SAFE,
      requires_approval: false,
    };
  }

  // كتابة ملف
  if (trimmed.startsWith('write ') || trimmed.startsWith('create ')) {
    const parts = trimmed.split(' ');
    const path = parts[1];
    return {
      type: CommandType.WRITE_FILE,
      payload: { path, content: '' },
      security_level: SecurityLevel.MODERATE,
      requires_approval: false,
    };
  }

  // حذف ملف
  if (trimmed.startsWith('delete ') || trimmed.startsWith('rm ')) {
    const path = trimmed.split(' ')[1];
    return {
      type: CommandType.DELETE_FILE,
      payload: { path },
      security_level: SecurityLevel.DANGEROUS,
      requires_approval: true,
    };
  }

  // قائمة الملفات
  if (trimmed === 'ls' || trimmed === 'list' || trimmed.startsWith('list ')) {
    const path = trimmed.split(' ')[1] || '.';
    return {
      type: CommandType.LIST_FILES,
      payload: { path },
      security_level: SecurityLevel.SAFE,
      requires_approval: false,
    };
  }

  // Git status
  if (trimmed === 'git status') {
    return {
      type: CommandType.GIT_STATUS,
      payload: {},
      security_level: SecurityLevel.SAFE,
      requires_approval: false,
    };
  }

  // Git commit
  if (trimmed.startsWith('git commit')) {
    const messageMatch = trimmed.match(/-m ["'](.+)["']/);
    const message = messageMatch ? messageMatch[1] : '';
    return {
      type: CommandType.GIT_COMMIT,
      payload: { message },
      security_level: SecurityLevel.MODERATE,
      requires_approval: false,
    };
  }

  // Git push
  if (trimmed === 'git push') {
    return {
      type: CommandType.GIT_PUSH,
      payload: {},
      security_level: SecurityLevel.DANGEROUS,
      requires_approval: true,
    };
  }

  return null;
}

/**
 * التحقق من صحة الأمر
 */
export function validateCommand(command: Partial<Command>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!command.type) {
    errors.push('Command type is required');
  }

  if (!command.payload) {
    errors.push('Command payload is required');
  }

  // التحقق من المخاطر
  if (command.type && command.payload) {
    const { risk, warnings } = analyzeRisk(command.type, command.payload);
    if (warnings.length > 0) {
      errors.push(...warnings);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * إنشاء أمر كامل
 */
export function createCommand(
  type: CommandType,
  payload: Record<string, any>,
  project_id?: string
): Command {
  const security_level = getSecurityLevel(type);
  const requires_approval = security_level === SecurityLevel.DANGEROUS;

  return {
    id: crypto.randomUUID(),
    type,
    payload,
    project_id,
    created_at: new Date(),
    security_level,
    requires_approval,
  };
}

/**
 * إنشاء نتيجة نجاح
 */
export function createSuccessResult(
  command_id: string,
  output: any,
  execution_time: number
): CommandResult {
  return {
    command_id,
    status: CommandStatus.SUCCESS,
    output,
    executed_at: new Date(),
    execution_time,
  };
}

/**
 * إنشاء نتيجة فشل
 */
export function createFailureResult(
  command_id: string,
  error: string,
  execution_time: number
): CommandResult {
  return {
    command_id,
    status: CommandStatus.FAILED,
    error,
    executed_at: new Date(),
    execution_time,
  };
}

/**
 * تحليل نتيجة الأمر
 */
export function analyzeResult(result: CommandResult): {
  success: boolean;
  summary: string;
} {
  const success = result.status === CommandStatus.SUCCESS;
  
  let summary = '';
  if (success) {
    summary = `✅ تم التنفيذ بنجاح في ${result.execution_time}ms`;
  } else {
    summary = `❌ فشل التنفيذ: ${result.error}`;
  }

  return { success, summary };
}

/**
 * تنسيق وقت التنفيذ
 */
export function formatExecutionTime(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * الحصول على وصف للأمر
 */
export function getCommandDescription(command: Command): string {
  const descriptions: Record<CommandType, (payload: any) => string> = {
    [CommandType.READ_FILE]: (p) => `قراءة الملف: ${p.path}`,
    [CommandType.WRITE_FILE]: (p) => `كتابة الملف: ${p.path}`,
    [CommandType.DELETE_FILE]: (p) => `حذف الملف: ${p.path}`,
    [CommandType.LIST_FILES]: (p) => `عرض الملفات في: ${p.path || '.'}`,
    [CommandType.CREATE_DIRECTORY]: (p) => `إنشاء مجلد: ${p.path}`,
    [CommandType.GIT_STATUS]: () => 'عرض حالة Git',
    [CommandType.GIT_COMMIT]: (p) => `حفظ التغييرات: ${p.message}`,
    [CommandType.GIT_PUSH]: () => 'رفع التغييرات للـ Repository',
    [CommandType.GIT_PULL]: () => 'سحب التحديثات من الـ Repository',
    [CommandType.EXECUTE_COMMAND]: (p) => `تنفيذ: ${p.command}`,
  };

  const descFn = descriptions[command.type];
  return descFn ? descFn(command.payload) : 'أمر غير معروف';
}
