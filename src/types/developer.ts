// 🔧 أنواع Developer Assistant

/**
 * طرق المصادقة المدعومة
 */
export enum AuthMethod {
  API_KEY = 'api_key',
  SESSION = 'session',
}

/**
 * حالة الاتصال بين UI و Dev Server
 */
export enum ConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error',
}

/**
 * أنواع الأوامر المدعومة
 */
export enum CommandType {
  READ_FILE = 'read_file',
  WRITE_FILE = 'write_file',
  DELETE_FILE = 'delete_file',
  LIST_FILES = 'list_files',
  CREATE_DIRECTORY = 'create_directory',
  GIT_STATUS = 'git_status',
  GIT_COMMIT = 'git_commit',
  GIT_PUSH = 'git_push',
  GIT_PULL = 'git_pull',
  EXECUTE_COMMAND = 'execute_command',
}

/**
 * حالة تنفيذ الأمر
 */
export enum CommandStatus {
  PENDING = 'pending',
  EXECUTING = 'executing',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

/**
 * مستوى الأمان للأمر
 */
export enum SecurityLevel {
  SAFE = 'safe',           // آمن تماماً (قراءة فقط)
  MODERATE = 'moderate',   // متوسط (كتابة ملفات)
  DANGEROUS = 'dangerous', // خطير (حذف، git push)
}

/**
 * API Key
 */
export interface ApiKey {
  id: string;
  key: string;
  name: string;
  created_at: Date;
  last_used?: Date;
  expires_at?: Date;
  permissions: string[];
  is_active: boolean;
}

/**
 * معلومات المشروع
 */
export interface Project {
  id: string;
  name: string;
  path: string;
  description?: string;
  repository?: string;
  branch?: string;
  created_at: Date;
  last_connected?: Date;
  is_active: boolean;
}

/**
 * أمر من UI إلى Dev Server
 */
export interface Command {
  id: string;
  type: CommandType;
  payload: Record<string, any>;
  project_id?: string;
  created_at: Date;
  security_level: SecurityLevel;
  requires_approval: boolean;
}

/**
 * نتيجة تنفيذ الأمر
 */
export interface CommandResult {
  command_id: string;
  status: CommandStatus;
  output?: any;
  error?: string;
  executed_at?: Date;
  execution_time?: number; // بالمللي ثانية
}

/**
 * طلب تنفيذ أمر
 */
export interface CommandRequest {
  type: CommandType;
  payload: Record<string, any>;
  project_id?: string;
  api_key: string;
}

/**
 * استجابة API
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * حالة الاتصال
 */
export interface ConnectionState {
  status: ConnectionStatus;
  project?: Project;
  last_ping?: Date;
  error_message?: string;
}

/**
 * تاريخ الأوامر
 */
export interface CommandHistory {
  id: string;
  command: Command;
  result: CommandResult;
  timestamp: Date;
}

/**
 * إعدادات Developer Assistant
 */
export interface DeveloperSettings {
  auto_approve_safe_commands: boolean;
  show_command_preview: boolean;
  enable_notifications: boolean;
  default_project_id?: string;
  theme: 'light' | 'dark' | 'auto';
}

/**
 * معلومات عن عملية جارية
 */
export interface Operation {
  id: string;
  type: string;
  description: string;
  status: 'running' | 'completed' | 'failed';
  progress?: number; // 0-100
  started_at: Date;
  completed_at?: Date;
}

/**
 * إحصائيات
 */
export interface Statistics {
  total_commands: number;
  successful_commands: number;
  failed_commands: number;
  average_execution_time: number;
  last_command?: Date;
}

/**
 * ملف في المشروع
 */
export interface ProjectFile {
  path: string;
  name: string;
  type: 'file' | 'directory';
  size?: number;
  modified_at?: Date;
  git_status?: 'modified' | 'added' | 'deleted' | 'untracked' | 'clean';
}

/**
 * Diff لملف
 */
export interface FileDiff {
  path: string;
  old_content?: string;
  new_content: string;
  changes: DiffChange[];
}

/**
 * تغيير في Diff
 */
export interface DiffChange {
  type: 'add' | 'remove' | 'modify';
  line_number: number;
  content: string;
}

/**
 * طلب موافقة على تعديل
 */
export interface ApprovalRequest {
  id: string;
  command: Command;
  changes: FileDiff[];
  security_level: SecurityLevel;
  created_at: Date;
}
