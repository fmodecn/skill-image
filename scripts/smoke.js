#!/usr/bin/env node
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
const fs = require('fs');
const path = require('path');
const os = require('os');
const { pathToFileURL } = require('url');

const ROOT = path.resolve(__dirname, '..');
const SKILL_DIR = path.join(ROOT, 'skills', 'skill-image');

function fail(msg) { console.error('SMOKE FAIL: ' + msg); process.exit(1); }

// 1. 包结构
for (const rel of ['SKILL.md']) {
  if (!fs.existsSync(path.join(SKILL_DIR, rel))) fail('missing skills/skill-image/' + rel);
}
for (const rel of ['bin/skill-image.js', 'lib/skill-image.mjs', 'skill-package-manifest.json', '.claude-plugin/plugin.json']) {
  if (!fs.existsSync(path.join(ROOT, rel))) fail('missing ' + rel);
}

// 2. 元数据一致性：包名/版本/bin 三处对齐
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'skill-package-manifest.json'), 'utf8'));
const plugin = JSON.parse(fs.readFileSync(path.join(ROOT, '.claude-plugin', 'plugin.json'), 'utf8'));
if (pkg.name !== 'skill-image') fail('package.json name should be skill-image, got ' + pkg.name);
if (manifest.name !== 'skill-image') fail('manifest name should be skill-image, got ' + manifest.name);
if (plugin.name !== 'skill-image') fail('plugin.json name should be skill-image, got ' + plugin.name);
if (manifest.version !== pkg.version) fail(`version mismatch: manifest ${manifest.version} vs package ${pkg.version}`);
if (plugin.version !== pkg.version) fail(`version mismatch: plugin ${plugin.version} vs package ${pkg.version}`);
if (!pkg.bin || !pkg.bin['skill-image']) fail('package.json bin should expose skill-image');

// 3. 无残留旧名（模式由片段拼出，避免本文件自匹配）
const OLD_NAME = ['fmode', 'image'].join('-');
const OLD_RE = new RegExp(OLD_NAME);
const stale = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) { walk(full); continue; }
    if (!/\.(js|mjs|json|md)$/.test(entry.name)) continue;
    const text = fs.readFileSync(full, 'utf8');
    if (OLD_RE.test(text)) stale.push(path.relative(ROOT, full));
  }
})(ROOT);
if (stale.length) fail(`stale "${OLD_NAME}" references in: ` + stale.join(', '));

(async () => {
  // 4. 模块导出
  const mod = await import(pathToFileURL(path.join(ROOT, 'lib', 'skill-image.mjs')).href);
  for (const fn of ['getApiKey', 'callImageAPI', 'gen', 'genArch', 'genApp', 'genExplode', 'genProduct', 'genScene', 'genDetail', 'genSlide', 'batch']) {
    if (typeof mod[fn] !== 'function') fail('export ' + fn + ' is not a function');
  }

  // 5. 模式注册表完整性
  const expected = ['--arch', '--app', '--explode', '--product', '--scene', '--detail', '--slide'];
  for (const mode of expected) {
    if (!mod.MODES[mode]) fail('missing mode ' + mode);
    for (const key of ['prefix', 'suffix', 'size', 'cost', 'desc']) {
      if (mod.MODES[mode][key] === undefined) fail(`mode ${mode} missing ${key}`);
    }
  }
  if (Object.keys(mod.MODES).length !== expected.length) {
    fail(`expected ${expected.length} modes, got ${Object.keys(mod.MODES).length}`);
  }

  // 6. 未知模式应抛错
  try {
    await mod.gen('--nope', 'x', 'smoke');
    fail('gen() should reject an unknown mode');
  } catch (e) {
    if (!/Unknown mode/.test(e.message)) fail('unexpected error for unknown mode: ' + e.message);
  }

  // 7. Key 解析链：环境变量优先，无任何来源时应抛错并指明设置方式
  const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-image-smoke-'));
  const oldHome = process.env.HOME;
  const savedKey = process.env.FMODE_API_KEY;
  const savedAuth = process.env.ANTHROPIC_AUTH_TOKEN;
  process.env.HOME = tmpHome;
  delete process.env.FMODE_API_KEY;
  delete process.env.ANTHROPIC_AUTH_TOKEN;
  try {
    try {
      mod.getApiKey();
      fail('getApiKey should throw when no key source exists');
    } catch (e) {
      if (!/FMODE_API_KEY/.test(e.message)) fail('error message should mention FMODE_API_KEY');
    }
    // 环境变量命中时应直接返回
    process.env.FMODE_API_KEY = 'sk-smoke-test-key-0123456789';
    if (mod.getApiKey() !== 'sk-smoke-test-key-0123456789') fail('getApiKey should prefer FMODE_API_KEY env');
  } finally {
    process.env.HOME = oldHome;
    if (savedKey) process.env.FMODE_API_KEY = savedKey; else delete process.env.FMODE_API_KEY;
    if (savedAuth) process.env.ANTHROPIC_AUTH_TOKEN = savedAuth;
    fs.rmSync(tmpHome, { recursive: true, force: true });
  }

  console.log('SMOKE OK: skill-image package structure + metadata + module exports + mode registry + key chain verified');
})().catch(e => fail(e.message));
