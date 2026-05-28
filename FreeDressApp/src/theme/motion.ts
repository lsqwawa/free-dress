/**
 * 动效配置
 * Reanimated 全局默认时长与曲线
 */
import { withTiming, WithTimingConfig } from 'react-native-reanimated';
import { EASE, DURATION } from '../constants';

/** 标准过渡 */
export const editorialTransition: WithTimingConfig = {
  duration: DURATION.base,
  easing: EASE.editorial,
};

/** 慢速过渡（页面进入、长动作） */
export const slowTransition: WithTimingConfig = {
  duration: DURATION.slow,
  easing: EASE.editorial,
};

/** 快速过渡（按下反馈） */
export const fastTransition: WithTimingConfig = {
  duration: DURATION.fast,
  easing: EASE.press,
};

/** 包装的 withTiming，默认编辑级配置 */
export const withEditorialTiming = (toValue: number, config?: WithTimingConfig) =>
  withTiming(toValue, { ...editorialTransition, ...config });

export const withFastTiming = (toValue: number, config?: WithTimingConfig) =>
  withTiming(toValue, { ...fastTransition, ...config });
