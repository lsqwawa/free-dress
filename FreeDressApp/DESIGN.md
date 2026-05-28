# FreeDress · Editorial Couture Design System

> Postal Monochromatic · Neo-minimalism · Approachable Sophistication
>
> 一刊一搭，把每天穿成展览。

---

## 1. 设计哲学

### 1.1 立意

FreeDress（畅搭）是一本「可穿戴的电子杂志」。每一次打开 App 都像翻开一期新刊：封面有期号、有 kicker、有衬线大字标题；内页有不对称版式、有期刊编号、有印刷颗粒。我们刻意拒绝外卖工具类 App 的"圆角橙色卡片堆叠"，转向编辑刊物的视觉语言。

### 1.2 关键词与原则

| 关键词 | 含义 |
| --- | --- |
| Postal | 邮政纸的暖灰、低饱和、纸感纹理 |
| Monochromatic | 围绕单一色相的明暗层次，而非彩色拼接 |
| Neo-minimalism | 克制的留白、hairline 分隔，不靠装饰元素堆砌 |
| Approachable | 衬线大字 + 一抹焦糖橙带来温度，不冷僻 |
| Sophistication | 每个间距与字距都经设计，杂志级排版精度 |

### 1.3 与原版（橙色 Material 风）的差异

| 维度 | 原版 | 重构 |
| --- | --- | --- |
| 主色 | `#FF6B35` 高饱和荧光橙 | `#A86B3D` 烧赭赤陶（muted） |
| 背景 | `#F5F5F5` 中性灰 | `#EBE4D6` 米杏暖底 |
| 圆角 | 全局 12 / 16 圆润 | 主用 0 / 4 直角 |
| 字体 | 系统默认无衬线 | 衬线 Display + 无衬线 Body + 等宽 Mono |
| 图标 | emoji（👕👔👗📷⭐） | Feather 矢量线性图标 |
| 版式 | 标题 + 卡片堆叠 | 期刊封面 + 不对称网格 + hairline 分隔 |
| 动效 | 仅 opacity press | 进入渐入、列表错落、按钮缩放、TabBar 滑动 |
| 个性 | 通用工具感 | 编辑级杂志感 |

---

## 2. 色彩 · Atelier Palette

| Token | Hex | 用途 |
| --- | --- | --- |
| `ink` | `#1F1B16` | 主文字、深色块、TabBar、按钮主底 |
| `inkSoft` | `#4A4138` | 次级文字 |
| `inkMuted` | `#7A6F62` | 弱化文字、占位 |
| `ecru` | `#EBE4D6` | App 主背景 |
| `cream` | `#F6F1E6` | 卡片、组件底色 |
| `paper` | `#FBF8F1` | 高亮纸感 |
| `caramel` | `#A86B3D` | 主品牌色（点睛） |
| `caramelDeep` | `#7A4A28` | 按下/强调态 |
| `caramelTint` | `#D9B492` | 浅化背景 |
| `sand` | `#BFA478` | 金棕辅助、VIP、期号 |
| `mistGray` | `#C9C0B0` | hairline 边框 |
| `clay` | `#948876` | 占位、辅助文字 |
| `signal` | `#8C4A3F` | 错误（赭红） |
| `jade` | `#5E6B4D` | 成功（橄榄） |

定义位置：[src/constants/index.ts](file:///d:/project/free-dress/FreeDressApp/src/constants/index.ts) 中的 `COLORS`。
旧字段（`primary` / `background` / `white` 等）已映射至新色值，旧引用无需改动即可获得新视觉。

---

## 3. 字体 · Typography

### 3.1 字体族

| Token | iOS | Android | 用途 |
| --- | --- | --- | --- |
| `FONTS.display` | Didot | serif (Noto Serif) | 巨型 Hero、封面大字 |
| `FONTS.serif` | Times New Roman | serif | 章节标题、卡片标题 |
| `FONTS.body` | Avenir Next | sans-serif | 正文、按钮 |
| `FONTS.bodyMedium` | Avenir Next | sans-serif-medium | 强调、Kicker |
| `FONTS.mono` | Menlo | monospace | 期号、编号 |

### 3.2 字号尺度

```
xs       11    sm    13    base 15    md   17    lg   22
xl       28    xxl   40    display 56  hero 80
```

### 3.3 排版预设

- `HeroText` 80px 巨型衬线，登录 / 封面页用
- `DisplayText` 56px 衬线
- `SerifTitle` 40px 衬线主标题
- `SectionTitle` 22px 衬线 section 标题
- `QuoteText` 17px 衬线斜体引文
- `BodyText` 15px Avenir 正文
- `CaptionText` 13px 弱化正文
- `KickerText` 11px Avenir Medium，2.4 字距，UPPERCASE
- `MonoText` 11px Menlo，1 字距，期号编号
- `MonoLargeText` 13px Menlo

### 3.4 后续接入自定义字体

如需引入 Playfair Display + Cormorant Garamond：

1. 下载 ttf 至 `src/assets/fonts/`
2. 配置 [react-native.config.js](file:///d:/project/free-dress/FreeDressApp/react-native.config.js)：`assets: ['./src/assets/fonts/']`
3. 执行 `npx react-native-asset`
4. 在 [src/constants/index.ts](file:///d:/project/free-dress/FreeDressApp/src/constants/index.ts) 把 `FONTS.display` 改为 `'PlayfairDisplay-Regular'`

---

## 4. 间距 · 圆角 · 阴影

### 4.1 间距 4px 网格

```
1=4   2=8   3=12   4=16   5=20   6=24   7=28
8=32  10=40 12=48  16=64  20=80
```

`HStack` / `VStack` 的 `space / mb / mt / px / py` 全部走 `SPACING` token，传入索引即可。

### 4.2 圆角

```
none 0   sm 4   md 8   lg 16   full 999
```

主要使用 `0` 与 `4`，仅头像与胶囊用 `full`。

### 4.3 阴影

抛弃通用蓝色阴影。

```ts
SHADOWS.press   // 1px 偏移，按下态
SHADOWS.card    // 0/6 长偏移，柔和卡片
SHADOWS.poster  // 2/4 偏移，印刷错位感
```

---

## 5. 动效 · Motion

### 5.1 曲线

- `EASE.editorial = bezier(0.22, 1, 0.36, 1)` — 主曲线，所有进入与转场
- `EASE.press = bezier(0.4, 0, 0.2, 1)` — 按下反馈
- `EASE.in / out` — 标准在/出

### 5.2 时长

```
fast 180   base 260   slow 480   scenic 800
```

### 5.3 动效模式

- **页面进入**：`opacity 0→1 + translateY 12→0`，使用 `slowTransition`
- **错落入场**：列表项 `delay = index * 60ms`
- **按钮按下**：scale `1 → 0.97`，时长 `fast`
- **图标按钮**：scale `1 → 0.92`
- **TabBar 指示器**：横向滑动 480ms editorial
- **TabBar 中心按钮**：按下时 rotate 180°
- **TryOn 加载**：3 dot 循环 `sand → caramel → cream`

---

## 6. 组件库

入口：[src/components/index.ts](file:///d:/project/free-dress/FreeDressApp/src/components/index.ts)。

### 6.1 排版

`HeroText` `DisplayText` `SerifTitle` `SectionTitle` `QuoteText` `BodyText` `CaptionText` `KickerText` `MonoText` `MonoLargeText`

### 6.2 基础

- `Button`：`variant: solid | outline | ghost | link | inverse`，`colorScheme: caramel | ink | cream`，press 缩放 + 长偏移投影
- `Input`：`variant: outline | underline | filled`，underline 最具杂志感，浮动 label
- `Card`：`variant: flat | outlined | editorial | poster`
- `Badge`：`variant: solid | outline | stamp`，stamp 为印章感（VIP/限定/AI）
- `Tag`：胶囊标签，active 实心 / inactive hairline

### 6.3 复合

- `Section`：分区头（Kicker + 标题 + 期号 + hairline）
- `ScreenHeader`：页眉（期号 + 主标题 + 右侧动作）
- `EmptyState`：杂志风空状态
- `Avatar`：头像（圆/方，可挂 stamp）
- `IconButton`：图标按钮（圆/方，多 variant）
- `Skeleton`：骨架屏（shimmer）

### 6.4 主题层

- `GrainBackground` / `GrainOverlay`：颗粒纹理叠加（无新依赖）
- `editorialTransition / slowTransition / fastTransition`：Reanimated 配置

---

## 7. 七个页面线框

### 7.1 LoginScreen

```
+----------------------------------+
| · FREEDRESS · ATELIER  VOL.01—26'SS|
|                                  |
|   畅                              |
|   搭          FREEDRESS           |
|               № 24                |
|   ────────────────────            |
|   一刊一搭 · 把每天穿成展览          |
|                                  |
|   手机号 ____________               |
|   ──────────────────              |
|   密  码 ____________               |
|   ──────────────────              |
|                                  |
|   [▣ 进入衣橱        →]            |
|                                  |
|   ── NEW HERE — CREATE ACCOUNT ──|
+----------------------------------+
```

### 7.2 HomeScreen

```
+----------------------------------+
| · EDITORIAL · ISSUE 24  26·MAY·FRI|
|                                  |
|   TODAY                          |
|   今日                            |
|   穿什么            № 24          |
|   ──── By FreeDress · 一刊一搭     |
|                                  |
|   QUICK ACCESS · 进入栏目  04 PIECES|
|   ─────────────────────           |
|   ┌──────────┐  ┌────────┐        |
|   │ 01 上传  │  │ 02 搭配 │        |
|   │  CAMERA │  │ LAYERS  │        |
|   └──────────┘  └────────┘        |
|             ┌────────┐  ┌──────┐  |
|             │03 试穿 │  │ 04   │  |
|             │ TRY-ON │  │收藏柜│  |
|             └────────┘  └──────┘  |
|                                  |
|   EDITOR'S PICK · 今日推荐         |
|   ── ──────────────                |
|   [◢ 大图卡片 → ◢ 中图 → ◢ 中图]    |
|                                  |
|   STYLE RADIO · 风格电台  04 BANDS |
|   ┌────┐ ┌────┐                   |
|   │休闲│ │商务│                   |
|   └────┘ └────┘                   |
+----------------------------------+
| 【 HOME · 衣橱 · ⊙试穿 · 搭配 · 我的 】|
+----------------------------------+
```

### 7.3 WardrobeScreen

```
+----------------------------------+
| MY WARDROBE · 衣橱     00 PIECES  |
| ─────────────────                  |
|                                  |
| (◯全部) (◯上衣) (◯下装) (◯外套)…  |
|                                  |
|        [LINE-DRAWN ICON]          |
|        ── NO ENTRIES ──           |
|        衣橱待编纂                  |
|        点击右下添加…                |
|        [▣ 开始上传 →]              |
|                                  |
|                          ADD PIECE|
|                          ⦿ +     |
+----------------------------------+
```

### 7.4 OutfitScreen

```
+----------------------------------+
| STYLE LAB · 搭配实验室  DRAFT №07  |
| ─────────────────                 |
|                                  |
| ▌FROM YOUR WARDROBE               |
| ▌选三五件你心仪之物，让 AI 拟稿…    |
|                                  |
| SELECTED PIECES · 已选衣物 00 ITEMS|
| ─────────────────                 |
| (⊕)  请从衣橱挑选 3-5 件…         |
|                                  |
| STYLE INTENT · 风格意图  MULTI     |
| ─────────────────                 |
| ●极简 ●中性 ○商务 ○街头 ○复古…    |
|                                  |
| [▣ 生成今日搭配      ⦿]            |
| 预计耗时 8-12 秒…                  |
|                                  |
| OUTFIT RESULT · 拟稿               |
| [   黑底大图 + AI 札记 …   ]       |
| 重新生成 │ 收藏 │ 试穿              |
+----------------------------------+
```

### 7.5 TryOnScreen

```
+----------------------------------+
| TRY-ON STUDIO · AI 试穿 STUDIO №07|
| ─────────────                     |
|                                  |
|  (●01)─(○02)─(○03)               |
|  UPLOAD  CHOOSE  COMPOSE         |
|                                  |
|  STEP 01 · 上传你的全身照           |
|  ┌╴╴╴╴╴╴╴╴╴╴╴┐                  |
|  │  [CAMERA]   │                  |
|  │  点击上传    │                  |
|  │  全身照…    │                  |
|  └╴╴╴╴╴╴╴╴╴╴╴┘                  |
|                                  |
|  STEP 02 · 选择搭配                |
|  [DRAFT №01] [DRAFT №02] [№03]   |
|                                  |
|  [▣ 开始合成    ⦿⦿⦿]              |
|                                  |
|  OUTPUT · VOL.24 / TRY-ON №07     |
|  ┌─────────────────┐               |
|  │   黑底大图占位     │              |
|  │  把身影借给衣服…  │              |
|  └─────────────────┘               |
+----------------------------------+
```

### 7.6 ProfileScreen

```
+----------------------------------+
| ATELIER · YOU · 我的  MEMBER №001 |
| ─────────────                     |
|                                  |
| ┌───────  墨黑 + 颗粒  ───────┐   |
| │ EST.2026          VOL. 24    │   |
| │ (👤 80px)  匿名读者          │   |
| │           +86 ··· ····       │   |
| │ ─────                        │   |
| │ ✦ "我的衣橱，是另一本日记。" │   |
| └─────────────────────────────┘   |
|                                  |
| EDITORIAL STATS · 编辑数据         |
| ─────────────                     |
| ┌─────┬─────┬─────┬─────┐          |
| │ 01  │ 02  │ 03  │ 04  │          |
| │ 00  │ 00  │ 00  │ 00  │          |
| │PIECES│OUT.│SAVE │TRY  │          |
| └─────┴─────┴─────┴─────┘          |
|                                  |
| DIRECTORY · 目录  06 PAGES         |
| ─────────────                     |
| №01  ⌘ 收藏柜          ›          |
| ──────────────                    |
| №02  ⏱ 搭配历史        ›          |
| ──────────────                    |
| ...                              |
|                                  |
| [□ 退订本期 · 登出]                |
| ── 畅搭 · 0.1.0 · COUTURE ──       |
+----------------------------------+
```

### 7.7 RegisterScreen

与 LoginScreen 同语言，标题改为「新刊订阅 · 开启你的衣橱专栏」，五个 underline 字段（手机/验证码/密码/确认/昵称）依次浮动 label，底部主按钮文案「订阅创刊号」。

---

## 8. 自定义 TabBar

[src/navigation/CustomTabBar.tsx](file:///d:/project/free-dress/FreeDressApp/src/navigation/CustomTabBar.tsx)

- ink 深色底 + cream hairline 上边线
- 5 个 Tab，每个含 Feather 图标 + 极小 kicker 英文
- 中心 Tab 为 TryOn，圆形 caramel 按钮，按下旋转 180°
- 顶部 caramel 横线指示器，跟随 active index 滑动 480ms

---

## 9. 不做的事 · 边界

- 未引入 `react-native-svg` / `react-native-linear-gradient` / `react-native-fast-image` 等新依赖（颗粒、渐变、阴影全部用纯 View 与 boxShadow 模拟）
- 未打包 ttf 字体文件，避免版权与 APK 体积，使用平台内置衬线 + 预留扩展位
- 不动 backend 与 [src/api](file:///d:/project/free-dress/FreeDressApp/src/api) [src/store](file:///d:/project/free-dress/FreeDressApp/src/store) 任何业务逻辑
- 仅在 Android [build.gradle](file:///d:/project/free-dress/FreeDressApp/android/app/build.gradle) 末尾追加 vector-icons 的 fonts.gradle 引用，未改包名签名
- 占位空状态保留（搭配生成、AI 试穿、上传未实现真实业务）

---

## 10. 后续可演进项

1. **深色模式（Atelier Noir）**：基于现有 token 切换 ink/ecru 反转
2. **自定义字体打包**：Playfair Display + Cormorant Garamond + Source Han Serif SC，实现真正的 Display 衬线
3. **图像处理**：接入 react-native-fast-image + Blurhash 占位
4. **A/B Hero**：HomeScreen Hero 区每日切换不同的衬线大字诗句
5. **微动效进阶**：滚动视差、卡片 3D tilt、Tab 切换转场
6. **可访问性**：font-scale 适配、TalkBack/VoiceOver 标签、对比度复核（当前 ink/ecru 对比 15.4:1，达 AAA）

---

最后更新：Vol.01 创刊号 · Postal Edition
