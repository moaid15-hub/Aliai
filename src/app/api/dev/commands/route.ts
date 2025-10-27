// 🎯 API: تنفيذ الأوامر

import { NextRequest, NextResponse } from 'next/server';
import { verifyApiKey } from '@/lib/developer/api-key-manager';
import {
  createCommand,
  validateCommand,
  createSuccessResult,
  createFailureResult,
} from '@/lib/developer/command-parser';
import {
  readFile,
  writeFile,
  deleteFile,
  listFiles,
  createDirectory,
} from '@/lib/developer/file-operations';
import { CommandType, ApiResponse, CommandRequest, CommandResult } from '@/types/developer';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body: CommandRequest = await request.json();
    const { type, payload, project_id, api_key } = body;

    // التحقق من API Key
    if (!api_key) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'API key is required',
      }, { status: 401 });
    }

    const authResult = verifyApiKey(api_key);
    if (!authResult.valid) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid API key',
      }, { status: 401 });
    }

    // إنشاء الأمر
    const command = createCommand(type, payload, project_id);

    // التحقق من صحة الأمر
    const validation = validateCommand(command);
    if (!validation.valid) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid command',
        data: { errors: validation.errors },
      }, { status: 400 });
    }

    // تنفيذ الأمر
    let result: CommandResult;
    try {
      const output = await executeCommand(type, payload);
      const executionTime = Date.now() - startTime;
      result = createSuccessResult(command.id, output, executionTime);
    } catch (error: any) {
      const executionTime = Date.now() - startTime;
      result = createFailureResult(command.id, error.message, executionTime);
    }

    return NextResponse.json<ApiResponse<CommandResult>>({
      success: result.status === 'success',
      data: result,
      message: result.status === 'success' ? 'Command executed successfully' : 'Command failed',
    });

  } catch (error: any) {
    const executionTime = Date.now() - startTime;
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to execute command',
      data: { execution_time: executionTime },
    }, { status: 500 });
  }
}

/**
 * تنفيذ الأمر حسب نوعه
 */
async function executeCommand(type: CommandType, payload: Record<string, any>): Promise<any> {
  switch (type) {
    case CommandType.READ_FILE:
      return await readFile(payload.path);

    case CommandType.WRITE_FILE:
      await writeFile(payload.path, payload.content, payload.sanitize !== false);
      return { success: true, path: payload.path };

    case CommandType.DELETE_FILE:
      await deleteFile(payload.path);
      return { success: true, path: payload.path };

    case CommandType.LIST_FILES:
      return await listFiles(payload.path || '.');

    case CommandType.CREATE_DIRECTORY:
      await createDirectory(payload.path);
      return { success: true, path: payload.path };

    case CommandType.GIT_STATUS:
      // في النسخة الكاملة، نستخدم simple-git
      throw new Error('Git operations not implemented yet');

    case CommandType.GIT_COMMIT:
      throw new Error('Git operations not implemented yet');

    case CommandType.GIT_PUSH:
      throw new Error('Git operations not implemented yet');

    case CommandType.GIT_PULL:
      throw new Error('Git operations not implemented yet');

    case CommandType.EXECUTE_COMMAND:
      throw new Error('Command execution not allowed for security reasons');

    default:
      throw new Error(`Unknown command type: ${type}`);
  }
}
