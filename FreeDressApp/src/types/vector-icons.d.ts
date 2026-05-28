/**
 * react-native-vector-icons 模块声明
 * 由于 v10.x 默认导出 .js 文件，需要补充类型声明
 */
declare module 'react-native-vector-icons/Feather' {
  import { Component } from 'react';
  import { TextProps } from 'react-native';
  interface IconProps extends TextProps {
    name: string;
    size?: number;
    color?: string;
  }
  export default class Icon extends Component<IconProps> {}
}

declare module 'react-native-vector-icons/Ionicons' {
  import { Component } from 'react';
  import { TextProps } from 'react-native';
  interface IconProps extends TextProps {
    name: string;
    size?: number;
    color?: string;
  }
  export default class Icon extends Component<IconProps> {}
}

declare module 'react-native-vector-icons/MaterialCommunityIcons' {
  import { Component } from 'react';
  import { TextProps } from 'react-native';
  interface IconProps extends TextProps {
    name: string;
    size?: number;
    color?: string;
  }
  export default class Icon extends Component<IconProps> {}
}

declare module 'react-native-vector-icons/MaterialIcons' {
  import { Component } from 'react';
  import { TextProps } from 'react-native';
  interface IconProps extends TextProps {
    name: string;
    size?: number;
    color?: string;
  }
  export default class Icon extends Component<IconProps> {}
}
