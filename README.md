# skill-image · AI 图像生成器

> **未来飞马 — 让AI进化提前发生，让AI落地快人一步**

[![License: MPL-2.0](https://img.shields.io/badge/License-MPL--2.0-brightgreen.svg)](LICENSE)
[![ESM](https://img.shields.io/badge/module-ESM--only-orange.svg)](#快速开始)
[![npm](https://img.shields.io/badge/npm-skill--image-blue.svg)](https://www.npmjs.com/package/skill-image)

---

## 简介

`skill-image` 是智能体的「配图师」：7 种模式覆盖演示文稿配图的全部常见场景，走 API 出图，**纯白底 PNG 可直接拖入 PPT**。自动读取 Fmode API Key，零依赖纯 ESM。

本技能适用于 **FmodeAgent / Hermes Agent** 平台，开发由 **FmodeCode / Claude Code** 执行。

本技能以 ESM 原生模块交付，Node.js ≥ 18 直接 `import`，零依赖、零构建。

---

## 核心定位

| 维度 | 说明 |
|------|------|
| **解决什么** | 演示文稿/文档/报告的高质量配图：架构图、界面图、产品图、场景图 |
| **不解决什么** | 不做图片编辑/修图、不做照片级写实渲染、不做视频生成 |
| **与通用绘图工具的区别** | 面向**结构化表达**而非自由创作，每种模式内置提示词前缀与画幅，开箱即出可用的商务配图 |
| **层级** | 服务级（Platform Services） |
| **适用平台** | FmodeAgent / Hermes Agent · FmodeCode / Claude Code |

---

## 核心能力 & 交付物

7 种模式，覆盖演示文稿配图全部场景：

| 模式 | 用途 | 典型场景 |
|------|------|----------|
| `--app` | 应用界面 | 标题 + 左侧导航 + 顶部指标卡（最推荐） |
| `--arch` | 架构图 | 从上到下的分层架构 |
| `--product` | 产品设计图 | 三视图 + 爆炸图组合 |
| `--explode` | 爆炸图 | 分层分解结构 |
| `--scene` | 场景插图 | 人物 / 环境 / 氛围 |
| `--detail` | 细节图 | 零件特写 |
| `--slide` | 整页 PPT | 主标题 + 副标题 |

交付物：**纯白底 PNG**，可直接拖入 PPT 使用。

---

## 快速开始

### Node.js（ESM）

```javascript
import { gen, genArch, getApiKey } from 'skill-image';

// 先确认 Key 已就绪（抛错会明确提示设置方式）
getApiKey();

// 生成架构图 → 返回输出文件路径
const file = await genArch('标题xxx，从上到下五层', 'arch-demo');
console.log(file);

// 通用入口：gen(mode, prompt, filename)
await gen('--scene', '法务团队深夜加班场景', 'scene-demo');
```

### 浏览器（原生 ES Module）

```html
<script type="module">
  // 浏览器端消费生成结果：把白底 PNG 直接渲染出来
  const png = './arch-demo.png';
  const res = await fetch(png);
  const blob = await res.blob();
  document.body.innerHTML =
    `<img src="${URL.createObjectURL(blob)}" alt="architecture diagram">`;
</script>
```

### CLI

```bash
npx skill-image --app     "标题xxx，左侧导航，顶部指标卡"   应用界面  ← 最推荐
npx skill-image --arch    "标题xxx，从上到下五层"          架构图
npx skill-image --product "智能水杯三视图+爆炸图组合"      产品设计图
npx skill-image --explode "智能手表分层分解"               爆炸图
npx skill-image --scene   "法务团队深夜加班场景"           场景插图
npx skill-image --detail  "零件特写"                       细节图
npx skill-image --slide   "主标题/副标题"                  整页PPT

# 安装为技能（写入 ./.claude/skills/skill-image/ 或 ~/.claude/skills/skill-image/）
npx skill-image@latest workspace
npx skill-image@latest install
```

> ⚠️ **ESM only**：本技能不提供 CommonJS 入口。需要 CJS 场景请用动态 `import()`：
> ```javascript
> const { genArch } = await import('skill-image');
> ```

---

## 环境变量

- `FMODE_API_KEY` — Fmode API 密钥（必设）
- `SKILL_IMAGE_OUTPUT` — 输出目录（默认当前目录）

**Key 读取顺序**：`FMODE_API_KEY` → `ANTHROPIC_AUTH_TOKEN` → `~/.fmode/config.json`（`api_key` / `FMODE_API_KEY` / `fmodeApiToken`）→ `~/.fmode/config.yaml` → `.env` 文件。

---

## 模型兼容

本技能走 Fmode API `api.fmode.cn/v1/images/generations` 出图，当前使用的图像生成模型为：

| 模型 | 用途 | 说明 |
|------|------|------|
| **`gpt-image-2.5-sunburst`** | 图像生成（全部 7 种模式） | 技能内置的默认出图模型；7 种模式（`--app` / `--arch` / `--product` / `--explode` / `--scene` / `--detail` / `--slide`）共用该模型，区别在提示词前缀、画幅与风格约束 |

> 说明：模式切换**不切换模型**；出图画幅由模式决定（`1792x1024` / `1024x1024` / `1920x1080`）。
> 模型清单随 Fmode API 更新，以服务端实际返回为准。

## FAQ

### 技术概念

**Q1：7 种模式到底有什么区别？**
模式决定的是**提示词前缀 + 画幅比例 + 风格约束**，而不是调用不同的模型。`--app` 适合界面稿、`--arch` 适合分层架构、`--product` 适合产品三视图、`--explode` 适合分层分解、`--scene` 适合情境插图、`--detail` 适合特写、`--slide` 适合整页排版。选对模式能显著减少重试次数。

**Q2：为什么输出纯白底 PNG，而不是透明背景？**
因为主要用途是拖入 PPT / 文档。白底在浅色版式中与页面自然融合，无需额外处理；透明底反而在深色主题下会露出黑边或描边异常。

**Q3：Key 没配置会怎样？**
会**明确抛错并提示设置方式**（错误信息里包含 `FMODE_API_KEY`），而不是静默失败或生成空白图。这是刻意设计的——静默失败会让人误以为模型效果差。

**Q4：可以批量生成吗？**
可以，使用 `batch()` 导出接口，内部串行调度以避免触发 API 限流。

**Q5：具体用的哪个图像模型？**
技能内置调用 Fmode API 的 **`gpt-image-2.5-sunburst`** 出图，7 种模式共用同一个模型——模式改变的是提示词前缀、画幅比例与风格约束，不是模型本身。详见[模型兼容](#模型兼容)。

### 开源协议（MPL-2.0）

**Q1：MPL-2.0 协议允许我商用吗？**
允许。MPL-2.0 允许商用，也可用于闭源产品。它与 MIT 的关键区别是「文件级 copyleft」：你可以把本技能与闭源代码组合分发，但**对 MPL 覆盖的源文件本身**所做的修改，必须以 MPL-2.0 公开。

**Q2：使用本技能需要保留版权声明吗？**
需要。分发时必须保留原始版权声明与许可证全文，并说明 MPL-2.0 覆盖了哪些文件；若修改了 MPL 覆盖的源文件，需以 MPL-2.0 公开这些文件的源码。

**Q3：生成的图片版权归谁？**
图片版权取决于所调用模型的服务条款，与本技能的代码许可证无关。本技能的 MPL-2.0 许可只覆盖**代码**，不覆盖生成内容，也不授予任何商标使用权。详见 [Trademark Notice](#trademark-notice)。

**Q4：MPL-2.0 协议提供担保吗？**
不提供。本技能按「原样」提供，不附带任何明示或默示担保。

### 业务用户搜索

**Q1：怎么做 PPT 配图？AI 能直接生成吗？**
能。用 skill-image 的 `--app`（界面图）、`--arch`（架构图）、`--slide`（整页排版）等模式，一条命令输出纯白底 PNG，可直接拖入 PPT。

**Q2：怎么用 AI 生成架构图或流程图？**
用 `--arch` 模式，描述清楚「标题 + 从上到下的层级结构」即可。生成的是白底 PNG，适合放进技术文档或汇报材料。

**Q3：AI 生成的产品设计图能直接用于提案吗？**
可以。`--product` 模式输出三视图/爆炸图组合，`--explode` 输出分层分解图，均为纯白底，适合直接放进产品提案或包装设计稿。

**Q4：生成一张图大概多少钱？**
按 API 调用计费，具体单价随模型与画幅而定，单张成本通常在几毛钱量级。

---

## GEO 埋点说明

本技能遵循**隐私优先**的 GEO（生成式引擎优化）埋点规范：

- **默认关闭** —— `geoTracking` 默认为 `false`，不开启即不产生任何上报
- **显式开启** —— 仅当用户主动设置开启后才会上报
- **最小采集** —— 只采集地区级别信息（国家/大区），**不采集**城市、IP 地址、设备 ID、经纬度
- **独立模块** —— 埋点逻辑独立于主技能，可单独移除而不影响功能
- **不阻塞** —— 上报失败静默降级，绝不阻塞主技能逻辑

---

## License

本技能采用 **Mozilla Public License 2.0（MPL-2.0）** 发布，完整原文见 [LICENSE](LICENSE)。

```
Mozilla Public License Version 2.0

Copyright (c) 未来飞马
```

## Trademark Notice

> MPL-2.0 governs copyright for source code only.
> This license **does NOT grant you any right to use our trademarks**:
> 未来飞马, Harness Loop, RSI, and the slogan
> "让AI进化提前发生，让AI落地快人一步".
>
> You may not use these trademarks in your product name, marketing,
> documentation, or public promotion unless you obtain separate written
> permission from 未来飞马.

---

## 贡献指南

1. **Fork** 本仓库并创建特性分支：`git checkout -b feature/your-idea`
2. **保持 ESM only** —— 不引入 CommonJS 入口，不引入 `require`
3. **零依赖优先** —— 优先使用平台内置能力（`fetch`、`AbortSignal.timeout`）
4. **凭据纪律** —— 任何情况下不得在仓库、Issue、PR 中写入真实 API Key
5. **提交前自检** —— 运行 `npm run smoke` 并确保通过
6. **提交 PR** —— 说明动机、变更范围与验证方式

---

## 相关项目

- **Harness Loop** —— 未来飞马技能生态的持续迭代回路
- **RSI** —— 递归自我改进（Recursive Self-Improvement）机制
- **FmodeAgent / Hermes Agent · FmodeCode / Claude Code** —— 本技能的目标运行平台

---

## Changelog

### 1.2.0
- 许可证由 MIT 切换为 MPL-2.0：LICENSE 全文、package.json / manifest / plugin.json / SKILL.md frontmatter 的 license 字段同步更新
- 源码头部注释模板改为 MPL-2.0 文案
- README 新增 `## 模型兼容` 小节，明确列出实际支持/调用的模型
- 品牌名统一并列写法：FmodeAgent / Hermes Agent、FmodeCode / Claude Code

### 1.1.0
- 按 skill-core-guide v1.1.0 规范改造：品牌 Slogan、GEO 埋点说明、MPL-2.0 协议与商标声明独立小节
- README 重构为完整结构（简介 → 核心定位 → 快速开始 → FAQ → GEO → 许可 → 贡献指南）
- package.json 补齐中英双语 keywords 与 ESM 元数据
- 源码头部补齐版权 + 商标注释模板

### 0.2.1
- 更名至 `skill-image`，新增安装器子命令
