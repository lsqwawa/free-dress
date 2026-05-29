/**
 * 微信 SDK 封装
 * - 一期未集成 react-native-wechat-lib，提供一个 stub 实现
 * - 后续接入 SDK 时替换 sendAuthRequest 的内部实现即可，对外接口保持不变
 */

export interface WechatAuthResult {
  code: string;
}

/**
 * 是否已就绪（决定 UI 是否显示「微信登录」按钮）
 * - 当前为 false，UI 入口默认隐藏
 * - 集成 SDK 后改为返回 true
 */
export const isWechatAvailable = (): boolean => {
  return false;
};

/**
 * 初始化微信 SDK（App 启动调用）
 */
export const initWechat = async (): Promise<void> => {
  // TODO: 集成 react-native-wechat-lib 后调用 registerApp(WECHAT_APP_ID, universalLink)
  // 后续如要正式启用 App 端微信登录，仅需：①npm i react-native-wechat-lib + 原生 iOS/Android 配置；②替换 services/wechat.ts 内部实现并让 isWechatAvailable() 返回 true。
};

/**
 * 拉起微信授权登录
 * @throws 集成 SDK 之前调用会抛错，UI 层应基于 isWechatAvailable 隐藏入口
 */
export const sendAuthRequest = async (): Promise<WechatAuthResult> => {
  throw new Error('微信 SDK 尚未集成，请联系开发人员开启该入口');
  // 集成后示例：
  // import * as WeChat from 'react-native-wechat-lib';
  // const res = await WeChat.sendAuthRequest('snsapi_userinfo', 'freedress_state');
  // return { code: res.code };
};
