import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import * as https from 'https';

/**
 * 微信登录会话信息（小程序 jscode2session 返回）
 */
export interface WechatMpSession {
  openid: string;
  unionid?: string;
  session_key: string;
}

/**
 * 微信 App 登录授权信息（移动应用 oauth2/access_token 返回）
 */
export interface WechatAppAuth {
  openid: string;
  unionid?: string;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
}

/**
 * 微信开放平台调用封装
 * - 一期 UnionId 暂未就绪，调用方需要对 unionid 做空值兜底
 * - 测试环境无配置时，提供 mock 入口（仅 NODE_ENV !== 'production' 生效）
 */
@Injectable()
export class WechatService {
  private readonly logger = new Logger(WechatService.name);

  /**
   * 小程序 code 换 openid/unionid/session_key
   */
  async jscode2session(code: string): Promise<WechatMpSession> {
    const appid = process.env.WECHAT_MP_APPID;
    const secret = process.env.WECHAT_MP_SECRET;

    // 测试环境兜底：未配置 AppID/Secret 时使用 code 作为伪 openid
    // 这样小程序端可以在 IDE 里直接调通流程，不依赖真实微信账号
    if (!appid || !secret) {
      if (process.env.NODE_ENV === 'production') {
        throw new BadRequestException('微信小程序未配置 AppID/Secret');
      }
      this.logger.warn('[WechatService] MP AppID/Secret 未配置，使用 mock 模式');
      return {
        openid: `mock_mp_${code}`,
        session_key: 'mock_session_key',
      };
    }

    const url =
      `https://api.weixin.qq.com/sns/jscode2session` +
      `?appid=${encodeURIComponent(appid)}` +
      `&secret=${encodeURIComponent(secret)}` +
      `&js_code=${encodeURIComponent(code)}` +
      `&grant_type=authorization_code`;

    const res = await this.httpGetJson(url);
    if (res.errcode) {
      this.logger.error('[WechatService] jscode2session 失败', res);
      throw new BadRequestException(
        `微信登录失败: ${res.errmsg || res.errcode}`,
      );
    }
    return {
      openid: res.openid,
      unionid: res.unionid,
      session_key: res.session_key,
    };
  }

  /**
   * App 端 code 换 access_token + openid + unionid
   */
  async appOauthAccessToken(code: string): Promise<WechatAppAuth> {
    const appid = process.env.WECHAT_APP_APPID;
    const secret = process.env.WECHAT_APP_SECRET;

    if (!appid || !secret) {
      if (process.env.NODE_ENV === 'production') {
        throw new BadRequestException('微信移动应用未配置 AppID/Secret');
      }
      this.logger.warn('[WechatService] App AppID/Secret 未配置，使用 mock 模式');
      return {
        openid: `mock_app_${code}`,
        access_token: 'mock_access_token',
        refresh_token: 'mock_refresh_token',
        expires_in: 7200,
        scope: 'snsapi_userinfo',
      };
    }

    const url =
      `https://api.weixin.qq.com/sns/oauth2/access_token` +
      `?appid=${encodeURIComponent(appid)}` +
      `&secret=${encodeURIComponent(secret)}` +
      `&code=${encodeURIComponent(code)}` +
      `&grant_type=authorization_code`;

    const res = await this.httpGetJson(url);
    if (res.errcode) {
      this.logger.error('[WechatService] appOauthAccessToken 失败', res);
      throw new BadRequestException(
        `微信登录失败: ${res.errmsg || res.errcode}`,
      );
    }
    return {
      openid: res.openid,
      unionid: res.unionid,
      access_token: res.access_token,
      refresh_token: res.refresh_token,
      expires_in: res.expires_in,
      scope: res.scope,
    };
  }

  /**
   * 拉取微信用户信息（昵称/头像）。仅 App 端可用，需 access_token + openid。
   * - 失败不抛错，返回 null（不影响主登录流程）
   */
  async getAppUserInfo(
    accessToken: string,
    openid: string,
  ): Promise<{ nickname?: string; headimgurl?: string } | null> {
    if (accessToken === 'mock_access_token') {
      return { nickname: '微信用户', headimgurl: '' };
    }
    try {
      const url =
        `https://api.weixin.qq.com/sns/userinfo` +
        `?access_token=${encodeURIComponent(accessToken)}` +
        `&openid=${encodeURIComponent(openid)}`;
      const res = await this.httpGetJson(url);
      if (res.errcode) return null;
      return { nickname: res.nickname, headimgurl: res.headimgurl };
    } catch (e) {
      this.logger.warn('[WechatService] getAppUserInfo 失败', e as any);
      return null;
    }
  }

  /**
   * 简易 HTTPS GET + JSON 解析
   */
  private httpGetJson(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      https
        .get(url, (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            try {
              resolve(JSON.parse(data));
            } catch (e) {
              reject(e);
            }
          });
        })
        .on('error', reject);
    });
  }
}
