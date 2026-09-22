# skill-image

Claude Code 技能包 + CLI：**AI 图像生成器**。7 种模式覆盖 PPT 配图全部场景，零依赖纯 ESM，自动读取 Fmode API Key。

## 快速使用

```bash
npx skill-image --app     "标题xxx，左侧导航，顶部指标卡"   应用界面  ← 最推荐
npx skill-image --arch    "标题xxx，从上到下五层"          架构图
npx skill-image --product "智能水杯三视图+爆炸图组合"      产品设计图
npx skill-image --explode "智能手表分层分解"               爆炸图
npx skill-image --scene   "法务团队深夜加班场景"           场景插图
npx skill-image --detail  "零件特写"                       细节图
npx skill-image --slide   "主标题/副标题"                  整页PPT
```

## 安装为 Claude Code 技能

```bash
npx skill-image@latest workspace   # 写入 ./.claude/skills/skill-image/
npx skill-image@latest install     # 写入 ~/.claude/skills/skill-image/
```

安装后可直接在 Claude Code 里说：「用 skill-image 生成一张架构图」。

## 环境变量

- `FMODE_API_KEY` — Fmode API 密钥（必设）
- `SKILL_IMAGE_OUTPUT` — 输出目录（默认当前目录）

## 凭据读取顺序

1. `FMODE_API_KEY` 环境变量
2. `ANTHROPIC_AUTH_TOKEN` 环境变量
3. `~/.fmode/config.json` 中的 api_key / FMODE_API_KEY / fmodeApiToken
4. `~/.fmode/config.yaml`
5. `/opt/data/.env`、`.env` 文件

## 输出

纯白底 PNG，可直接拖入 PPT 使用。

## 链接

- GitHub: https://github.com/fmodecn/skill-image
- npm: https://www.npmjs.com/package/skill-image
