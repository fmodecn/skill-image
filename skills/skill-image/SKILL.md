---
name: skill-image
description: "触发词:生成架构图/场景图/插图/产品设计图/爆炸图。走API出白底PNG，自动读Key，¥0.3-0.5/张。"
version: 0.2.1
author: Fmode
license: MIT
platforms: [linux, macos, windows]
---

# skill-image v0.2.1 — AI图像生成器

7种模式 · 零依赖纯ESM · 自动读API Key · 白底PNG直接放PPT

## 七种模式速查

| 模式 | 尺寸 | 成本 | 用途 |
|------|------|------|------|
| `--app` | 1792×1024 | ¥0.5 | **应用界面**（投入产出比最高） |
| `--arch` | 1792×1024 | ¥0.5 | 架构图/分层/闭环 |
| `--explode` | 1792×1024 | ¥0.5 | **产品爆炸图/内部结构拆解** |
| `--product` | 1792×1024 | ¥0.5 | **产品设计图**（硬件/工业设计） |
| `--slide` | 1920×1080 | ¥0.5 | 整页PPT（封面/金句页） |
| `--scene` | 1024×1024 | ¥0.3 | 场景插图/痛点 |
| `--detail` | 1024×1024 | ¥0.3 | 零件/材质特写 |

## 安装
```bash
npm install -g skill-image
```

## 快速使用
```bash
# 应用界面（推荐！）
npx skill-image --app "标题'内容合规系统'左侧导航5项，顶部指标卡3张" app-demo

# 架构图
npx skill-image --arch "Harness五层引擎，从上到下数据流" harness

# 产品设计图（硬件/工业产品）
npx skill-image --product "一款智能水杯的三视图+爆炸图组合，白底，科技感渲染" cup-design

# 产品爆炸图（零件分解）
npx skill-image --explode "智能手表爆炸图：表盘/表圈/电池/主板/表带分层分解" watch-explode

# 场景插图（省40%成本）
npx skill-image --scene "法务团队深夜加班堆满稿件" scene

# 整页PPT
npx skill-image --slide "封面：内容营销的超级预审Agent" cover
```

## 输出控制
- `FMODE_API_KEY` 环境变量（必设）
- `SKILL_IMAGE_OUTPUT` 输出目录（默认当前目录）

## 最佳实践

### --app 界面图
- 结构=左导航+顶部指标卡+中间表格+右侧详情，指标卡带同比↑瞬间真实
- 所有数字必须与讲稿/产品实际数据一致（AI会编造）

### --arch 架构图
- 右侧数据卡是灵魂，所有数字必须与讲稿一致
- 层级名用系统真实命名，配色走品牌色

### --product 产品设计图（硬件沉淀）
- **适合**：硬件产品（水杯/手表/家居/电子）、工业设计、产品概念图
- **多角度组合**：一次 prompt 里要"主视图+侧视图+顶视图+3/4视角"多角度
- **白底必须**：`纯白背景` 写进 prompt，方便放PPT/对比图
- **材质与工艺**：指定材质（磨砂/金属/玻璃/镜面）+工艺感（倒角/精密加工）
- **场景化渲染**：加"使用场景/人手持/桌面摆放"，比纯产品更有说服力
- **爆炸图搭配**：产品设计图常配一张 `--explode` 展示内部结构

### --explode 产品爆炸图
- **适合**：展示产品内部结构、零件分解、组装关系、数据流向
- **分层分解**：从外壳→内部组件→核心芯片逐层炸开
- **数据流向**：标注"数据从传感器→主板→显示"流向箭头
- **装配关系**：用虚线/序号标出装配顺序，工程感强
- **纯白底**：方便放PPT技术页

### --scene 场景图
- 给情绪词（焦虑/惊喜）比纯描述生动十倍
- 对比场景（Before/After）冲击最大

### --slide 整页PPT
- 封面/金句/章节过渡页最稳（文字少），内容页素材图+HTML排版

## 独立调用（ESM import）
```js
import { gen, genArch, genApp, genExplode, genProduct, genScene, genSlide, batch } from "skill-image";
await genProduct("智能水杯多角度+爆炸图组合，白底", "cup");
await genExplode("手表爆炸分层分解，标注数据流", "watch-explode");
```

## 版本历史
- **v0.1.0**：首发 ESM 化（6种通用模式：app/arch/explode/scene/detail/slide）
- **v0.2.0**：新增 `--product` 产品设计模式 + 产品设计/爆炸图最佳实践
- **v0.2.1**：更名 `fmode-image` → `skill-image`，bin 增加 install/workspace/check/smoke 安装子命令

## 链接
- GitHub：https://github.com/fmodecn/skill-image
- npm：https://www.npmjs.com/package/skill-image
