import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * HTTP 异常过滤器
 * 统一处理应用中的异常
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();
    
    // 构建错误响应
    const errorResponse = {
      code: status,
      message: this.extractErrorMessage(exceptionResponse),
      data: null,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(errorResponse);
  }

  /**
   * 提取错误信息
   */
  private extractErrorMessage(response: string | object): string {
    if (typeof response === 'string') {
      return response;
    }
    
    if (typeof response === 'object' && response !== null) {
      return (response as any).message || '请求失败';
    }
    
    return '未知错误';
  }
}

/**
 * 全局异常过滤器
 * 捕获所有未被处理的异常
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : '服务器内部错误';

    // 打印完整错误堆栈用于调试
    if (process.env.NODE_ENV === 'development') {
      console.error('错误详情:', exception);
    }

    response.status(status).json({
      code: status,
      message,
      data: null,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
