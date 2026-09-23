// Copyright (c) 未来飞马
//
// Licensed under the MIT License. See LICENSE in the project root
// for the full license text.
//
// Trademark Notice:
// The MIT license grants copyright permissions for source code only.
// It does NOT grant any rights to use trademarks including "未来飞马",
// "Harness Loop", "RSI", and associated slogan "让AI进化提前发生，让AI落地快人一步".
// Any use of these trademarks requires separate written permission.
// skill-image v0.2.1 — 纯ESM零依赖版
// 架构图/应用界面/场景插图/整页PPT生成器

import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ===== 模式注册表 =====
export const MODES = {
  '--arch': {
    prefix: '纯白背景扁平风格架构图。',
    suffix: '简洁扁平商务风格，纯白背景适合PPT。',
    size: '1792x1024', cost: 0.5, desc: '架构/分层/闭环图',
  },
  '--app': {
    prefix: '现代SaaS应用界面截图，浅色主题。',
    suffix: '界面细节清晰锐利，中文界面文字，像真实在运行的产品。',
    size: '1792x1024', cost: 0.5, desc: '产品界面（表现力最强）',
  },
  '--explode': {
    prefix: '技术爆炸图，内部分层剖开并标注数据流向。',
    suffix: '扁平科技风格，纯白背景，层级与流向清晰。',
    size: '1792x1024', cost: 0.5, desc: '内部运转/拆解图',
  },
  '--product': {
    prefix: '产品设计效果图，纯白背景，多角度组合渲染。',
    suffix: '工业设计质感，材质细腻，白底适合PPT，写实渲染。',
    size: '1792x1024', cost: 0.5, desc: '产品设计图（硬件/工业）',
  },
  '--scene': {
    prefix: '扁平插画场景。',
    suffix: '清新明亮风格。',
    size: '1024x1024', cost: 0.3, desc: '场景/人物/痛点插图',
  },
  '--detail': {
    prefix: '精密细节特写图。',
    suffix: '写实质感，清晰锐利。',
    size: '1024x1024', cost: 0.3, desc: '零件/材质/实物特写',
  },
  '--slide': {
    prefix: '一页16:9演示幻灯片。',
    suffix: '留白充足，字号层级分明，商务演示风格。',
    size: '1920x1080', cost: 0.5, desc: '整页PPT直接使用',
  },
};

// ===== 凭据自动获取 =====
export function getApiKey() {
  let key = process.env.FMODE_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN || '';
  if (key && !key.includes('***') && key.length > 10) return key;

  try {
    const p = join(homedir(), '.fmode', 'config.json');
    if (existsSync(p)) {
      const c = JSON.parse(readFileSync(p, 'utf-8'));
      for (const k of ['api_key', 'FMODE_API_KEY', 'fmodeApiToken']) if (c[k]) return c[k];
    }
  } catch {}

  try {
    const p = join(homedir(), '.fmode', 'config.yaml');
    if (existsSync(p)) {
      for (const l of readFileSync(p, 'utf-8').split('\n')) {
        for (const kw of ['api_key', 'FMODE_API_KEY', 'fmodeApiToken']) {
          if (l.includes(kw)) {
            const v = l.split(':').slice(1).join(':').trim().replace(/["']/g, '');
            if (v && v !== '${FMODE_API_KEY}') return v;
          }
        }
      }
    }
  } catch {}

  for (const p of ['/opt/data/.env', '.env']) {
    try {
      if (existsSync(p)) {
        for (const l of readFileSync(p, 'utf-8').split('\n')) {
          if (l.includes('FMODE_API_KEY')) {
            const v = l.split('=').slice(1).join('=').trim().replace(/["']/g, '');
            if (v && !v.includes('***') && v.length > 10) return v;
          }
        }
      }
    } catch {}
  }

  throw new Error('No API Key found. Set FMODE_API_KEY env or ~/.fmode/config.json');
}

// ===== API调用（纯fetch，零依赖） =====
export async function callImageAPI(prompt, size) {
  const key = getApiKey();
  const resp = await fetch('https://api.fmode.cn/v1/images/generations', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'gpt-image-2.5-sunburst', prompt, n: 1, size }),
    signal: AbortSignal.timeout(300000),
  });
  if (!resp.ok) throw new Error(`API ${resp.status}: ${(await resp.text().catch(()=>'')).slice(0,200)}`);
  const data = await resp.json();
  if (data.data?.[0]?.b64_json) return Buffer.from(data.data[0].b64_json, 'base64');
  if (data.data?.[0]?.url) {
    const r = await fetch(data.data[0].url, { signal: AbortSignal.timeout(60000) });
    if (!r.ok) throw new Error(`Download failed: ${r.status}`);
    return Buffer.from(await r.arrayBuffer());
  }
  throw new Error('Response has no image data');
}

// ===== 统一生成 =====
export async function gen(mode, prompt, name = 'output') {
  const cfg = MODES[mode];
  if (!cfg) throw new Error(`Unknown mode: ${mode}`);
  const fullPrompt = `${cfg.prefix}${prompt} ${cfg.suffix}`;
  const outdir = process.env.SKILL_IMAGE_OUTPUT || '.';
  mkdirSync(outdir, { recursive: true });
  const outPath = join(outdir, `${name}.png`);
  const imgData = await callImageAPI(fullPrompt, cfg.size);
  writeFileSync(outPath, imgData);
  console.log(`  OK ${cfg.desc} | ${Math.round(imgData.length/1024)}KB | ${cfg.size} | ${outPath}`);
  return outPath;
}

export const genArch = (p, n) => gen('--arch', p, n);
export const genApp = (p, n) => gen('--app', p, n);
export const genExplode = (p, n) => gen('--explode', p, n);
export const genProduct = (p, n) => gen('--product', p, n);
export const genScene = (p, n) => gen('--scene', p, n);
export const genDetail = (p, n) => gen('--detail', p, n);
export const genSlide = (p, n) => gen('--slide', p, n);

export async function batch(tasks) {
  let total = 0;
  for (const [mode, name, prompt] of tasks) {
    process.stdout.write(`${name}: `);
    try { await gen(mode, prompt, name); total += MODES[mode].cost; }
    catch (e) { console.error(`  FAIL: ${e.message}`); }
  }
  console.log(`\nTotal cost: ¥${total.toFixed(1)}`);
}

async function main() {
  const args = process.argv.slice(2);
  if (!args.length || args[0] === '--help' || args[0] === '-h') {
    console.log(`
skill-image v0.2.1 — AI架构图和场景插图生成器

用法:
  npx skill-image --arch    "prompt" [name]    架构图 ¥0.5
  npx skill-image --app     "prompt" [name]    应用界面 ¥0.5
  npx skill-image --scene   "prompt" [name]    场景插图 ¥0.3
  npx skill-image --slide   "prompt" [name]    整页PPT ¥0.5
  npx skill-image --explode "prompt" [name]    爆炸图 ¥0.5
  npx skill-image --detail  "prompt" [name]    细节图 ¥0.3
`);
    process.exit(0);
  }
  const mode = args[0];
  if (!MODES[mode]) { console.error(`Unknown mode: ${mode}`); process.exit(1); }
  const prompt = args.slice(1, -1).join(' ') || args[1] || '';
  const name = args.length > 2 ? args[args.length - 1] : 'output';
  if (!prompt) { console.error('Error: prompt required'); process.exit(1); }
  try { await gen(mode, prompt, name); }
  catch (e) { console.error(`Error: ${e.message}`); process.exit(1); }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
