import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface TryOnRequest {
  personImageUrl: string;
  garmentImageUrl: string;
}

export interface TryOnResponse {
  resultImageUrl: string;
  processingTime: number;
}

/**
 * 阿里云 AI 试衣 Provider (OutfitAnyone)
 * 文档：https://help.aliyun.com/zh/model-studio/outfitanyone-api
 */
@Injectable()
export class AiTryonProvider {
  private readonly logger = new Logger(AiTryonProvider.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/virtualtryon/generation';
  private readonly enabled: boolean;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('ALIYUN_DASHSCOPE_API_KEY', '');
    this.enabled = !!this.apiKey;

    if (!this.enabled) {
      this.logger.warn('阿里云AI试衣未配置 ALIYUN_DASHSCOPE_API_KEY，将使用Mock模式');
    }
  }

  /**
   * 判断AI服务是否可用
   */
  isAvailable(): boolean {
    return this.enabled;
  }

  /**
   * 调用阿里云AI试衣服务
   * @param request 试穿请求参数
   * @returns 试穿结果
   */
  async generate(request: TryOnRequest): Promise<TryOnResponse> {
    if (!this.enabled) {
      return this.mockGenerate(request);
    }

    const startTime = Date.now();

    try {
      // 提交异步任务
      const taskResponse = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'X-DashScope-Async': 'enable',
        },
        body: JSON.stringify({
          model: 'aitryon',
          input: {
            person_image_url: request.personImageUrl,
            garment_image_url: request.garmentImageUrl,
          },
          parameters: {
            resolution: 768,
          },
        }),
      });

      if (!taskResponse.ok) {
        const errorBody = await taskResponse.text();
        this.logger.error(`阿里云AI试衣请求失败: ${taskResponse.status} ${errorBody}`);
        throw new Error(`AI试衣服务请求失败: ${taskResponse.status}`);
      }

      const taskData = await taskResponse.json();
      const taskId = taskData.output?.task_id;

      if (!taskId) {
        throw new Error('未获取到任务ID');
      }

      // 轮询任务状态
      const result = await this.pollTaskResult(taskId);
      const processingTime = Date.now() - startTime;

      return {
        resultImageUrl: result,
        processingTime,
      };
    } catch (error) {
      this.logger.error(`AI试穿生成失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 轮询任务结果
   * 连续请求失败3次直接标记为FAILED，避免网络不稳时空跑
   */
  private async pollTaskResult(taskId: string, maxAttempts = 60): Promise<string> {
    const taskUrl = `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`;
    let consecutiveFailures = 0;

    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000));

      try {
        const response = await fetch(taskUrl, {
          headers: { 'Authorization': `Bearer ${this.apiKey}` },
        });

        if (!response.ok) {
          consecutiveFailures++;
          if (consecutiveFailures >= 3) {
            throw new Error(`轮询连续失败${consecutiveFailures}次，终止等待`);
          }
          continue;
        }

        // 请求成功，重置失败计数
        consecutiveFailures = 0;

        const data = await response.json();
        const status = data.output?.task_status;

        if (status === 'SUCCEEDED') {
          const resultUrl = data.output?.results?.[0]?.url;
          if (resultUrl) return resultUrl;
          throw new Error('任务完成但未返回结果图片');
        }

        if (status === 'FAILED') {
          throw new Error(`AI处理失败: ${data.output?.message || '未知错误'}`);
        }
      } catch (error) {
        if (error.message.includes('轮询连续失败') || error.message.includes('AI处理失败') || error.message.includes('未返回结果')) {
          throw error;
        }
        consecutiveFailures++;
        if (consecutiveFailures >= 3) {
          throw new Error(`网络异常，连续${consecutiveFailures}次请求失败`);
        }
      }
    }

    throw new Error('AI处理超时');
  }

  /**
   * Mock 模式（未配置API Key时使用）
   */
  private async mockGenerate(request: TryOnRequest): Promise<TryOnResponse> {
    this.logger.debug('使用Mock模式生成试穿结果');
    await new Promise(resolve => setTimeout(resolve, 1500));
    return {
      resultImageUrl: request.personImageUrl,
      processingTime: 1500,
    };
  }
}
