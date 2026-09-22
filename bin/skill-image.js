#!/usr/bin/env node
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const SKILL_NAME = 'skill-image';
const SOURCE_ROOT = path.resolve(__dirname, '..');
const SKILL_SOURCE = path.join(SOURCE_ROOT, 'skills', SKILL_NAME);
const LIB = path.join(SOURCE_ROOT, 'lib', 'skill-image.mjs');
const WORKSPACE_ROOT = process.cwd();
const GLOBAL_TARGET = path.join(os.homedir(), '.claude', 'skills', SKILL_NAME);
const WORKSPACE_TARGET = path.join(WORKSPACE_ROOT, '.claude', 'skills', SKILL_NAME);
const WORKSPACE_SKILLS_ROOT = path.join(WORKSPACE_ROOT, '.claude', 'skills');
const GLOBAL_SKILLS_ROOT = path.join(os.homedir(), '.claude', 'skills');

const SUBCOMMANDS = ['install', 'install-workspace', 'workspace', 'check', 'path', 'smoke', 'help'];

function expandHome(value) {
  return String(value || '').replace(/^~(?=$|[\\/])/, os.homedir());
}

function parseArgs(argv) {
  const first = argv[0];
  if (!first || !SUBCOMMANDS.includes(first)) {
    // No subcommand: passthrough to the image generator (--arch/--app/--scene/...).
    return { command: 'generate', passthrough: argv };
  }
  const args = { command: first, target: GLOBAL_TARGET, smoke: false, force: false, help: false };
  if (first === 'workspace' || first === 'install-workspace') {
    args.command = 'install';
    args.target = WORKSPACE_TARGET;
  }
  for (let i = 1; i < argv.length; i++) {
    const token = argv[i];
    if (token === '--target' && argv[i + 1]) args.target = argv[++i];
    else if (token.startsWith('--target=')) args.target = token.slice('--target='.length);
    else if (token === '--workspace') args.target = WORKSPACE_TARGET;
    else if (token === '--global') args.target = GLOBAL_TARGET;
    else if (token === '--smoke') args.smoke = true;
    else if (token === '--force') args.force = true;
    else if (token === '--help' || token === '-h') args.help = true;
  }
  args.target = path.resolve(expandHome(args.target));
  return args;
}

function printHelp() {
  console.log([
    'skill-image — AI 图像生成器 + Claude Code skill 安装器',
    '',
    'Usage:',
    '  npx skill-image --arch    "prompt" [name]   # 架构图 ¥0.5',
    '  npx skill-image --app     "prompt" [name]   # 应用界面 ¥0.5',
    '  npx skill-image --explode "prompt" [name]   # 爆炸图 ¥0.5',
    '  npx skill-image --product "prompt" [name]   # 产品设计图 ¥0.5',
    '  npx skill-image --scene   "prompt" [name]   # 场景插图 ¥0.3',
    '  npx skill-image --detail  "prompt" [name]   # 细节图 ¥0.3',
    '  npx skill-image --slide   "prompt" [name]   # 整页PPT ¥0.5',
    '',
    '  npx skill-image@latest workspace [--smoke]  # install into ./.claude/skills/skill-image',
    '  npx skill-image@latest install [--smoke]    # install into ~/.claude/skills/skill-image',
    '  npx skill-image@latest install --target <dir> [--force]',
    '  npx skill-image@latest check',
    '  npx skill-image@latest smoke',
    '  npx skill-image@latest path',
    '',
    'Options:',
    '  --workspace      Install into ./.claude/skills/skill-image',
    '  --global         Install into ~/.claude/skills/skill-image (default)',
    '  --target <dir>   Install into a custom directory',
    '  --force          Allow overwriting a custom target',
    '  --smoke          Run smoke checks after install',
    '  --help, -h       Show help'
  ].join('\n'));
}

function ensureDir(dirPath) { fs.mkdirSync(dirPath, { recursive: true }); }

function isInside(parentDir, childDir) {
  const relative = path.relative(path.resolve(parentDir), path.resolve(childDir));
  return relative === '' || (!!relative && !relative.startsWith('..') && !path.isAbsolute(relative));
}

function canOverwriteTarget(targetDir, force) {
  return force
    || path.resolve(targetDir) === path.resolve(GLOBAL_TARGET)
    || isInside(WORKSPACE_SKILLS_ROOT, targetDir)
    || isInside(GLOBAL_SKILLS_ROOT, targetDir);
}

function copyDirRecursive(source, destination) {
  const stat = fs.statSync(source);
  if (stat.isDirectory()) {
    ensureDir(destination);
    for (const child of fs.readdirSync(source)) {
      if (child === 'node_modules' || child === 'outputs' || child === '.git') continue;
      copyDirRecursive(path.join(source, child), path.join(destination, child));
    }
    return;
  }
  ensureDir(path.dirname(destination));
  fs.copyFileSync(source, destination);
}

function installSkill(target, force) {
  if (!fs.existsSync(SKILL_SOURCE)) {
    throw new Error(`Skill source missing: ${SKILL_SOURCE}`);
  }
  if (fs.existsSync(target)) {
    if (!canOverwriteTarget(target, force)) {
      throw new Error(`Refusing to overwrite custom target without --force: ${target}`);
    }
    fs.rmSync(target, { recursive: true, force: true });
  }
  ensureDir(target);
  copyDirRecursive(SKILL_SOURCE, target);
}

function checkSkill(target) {
  const required = ['SKILL.md'];
  const missing = required.filter(entry => !fs.existsSync(path.join(target, entry)));
  if (missing.length) {
    throw new Error(`Install target is missing required files: ${missing.join(', ')}`);
  }
  return { status: 'ok', skill: SKILL_NAME, target, required };
}

function runSmoke() {
  const result = spawnSync(process.execPath, ['scripts/smoke.js'], { cwd: SOURCE_ROOT, stdio: 'inherit', shell: false });
  if (result.status !== 0) throw new Error('smoke failed');
}

function printNextSteps(target) {
  const workspaceMode = isInside(WORKSPACE_SKILLS_ROOT, target);
  console.log('');
  console.log('Install complete.');
  console.log(`Skill installed at: ${target}`);
  console.log('');
  console.log(workspaceMode
    ? 'Project-level skill is ready. Restart the VSCode Claude Code session if it was open.'
    : 'User-level skill is ready for all Claude Code workspaces.');
  console.log('');
  console.log('API Key: set FMODE_API_KEY, or ~/.fmode/config.json -> api_key / fmodeApiToken.');
  console.log('');
  console.log('Try this prompt in Claude Code:');
  console.log('  用 skill-image 生成一张"内容合规系统"的架构图，输出到当前目录。');
}

function generate(argv) {
  const result = spawnSync(process.execPath, [LIB, ...argv], { stdio: 'inherit' });
  process.exit(result.status ?? 0);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.command === 'generate') {
    if (!args.passthrough.length || args.passthrough[0] === '--help' || args.passthrough[0] === '-h') {
      printHelp();
      process.exit(0);
    }
    generate(args.passthrough);
    return;
  }
  if (args.help || args.command === 'help') { printHelp(); return; }
  if (args.command === 'path') { console.log(args.target); return; }
  if (args.command === 'install') {
    installSkill(args.target, args.force);
    console.log(JSON.stringify(checkSkill(args.target), null, 2));
    if (args.smoke) runSmoke();
    printNextSteps(args.target);
    return;
  }
  if (args.command === 'check') { console.log(JSON.stringify(checkSkill(args.target), null, 2)); return; }
  if (args.command === 'smoke') { runSmoke(); return; }
  printHelp();
  process.exitCode = 1;
}

try { main(); }
catch (error) { console.error(`skill-image failed: ${error.message}`); process.exit(1); }
