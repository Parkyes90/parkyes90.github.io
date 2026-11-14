#!/usr/bin/env node
// 빌드 결과(dist)의 모든 HTML을 훑어 사이트 내부 링크가 실제 파일과 앵커를 가리키는지 확인한다.
// 외부 링크는 네트워크 상태에 따라 결과가 흔들리므로 검사하지 않는다.
//   pnpm build && pnpm check:links
import { existsSync, statSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');

if (!existsSync(dist)) {
  console.error('dist 폴더가 없어요. 먼저 pnpm build를 실행하세요.');
  process.exit(1);
}

const htmlFiles = (await readdir(dist, { recursive: true }))
  .filter((file) => file.endsWith('.html') && !file.startsWith('pagefind'))
  .map((file) => join(dist, file));

/** 파일별로 문서 안에 있는 id 목록을 기억해 둔다. */
const idCache = new Map();
async function idsOf(file) {
  if (!idCache.has(file)) {
    const html = await readFile(file, 'utf8');
    idCache.set(file, new Set([...html.matchAll(/\sid="([^"]*)"/g)].map((match) => match[1])));
  }
  return idCache.get(file);
}

/** 사이트 경로를 dist 안의 실제 파일로 바꾼다. 없으면 undefined. */
function resolveTarget(pathname) {
  const target = join(dist, decodeURIComponent(pathname));
  if (existsSync(target) && statSync(target).isFile()) return target;
  const index = join(target, 'index.html');
  if (existsSync(index)) return index;
  return undefined;
}

const decodeEntities = (value) =>
  value.replaceAll('&amp;', '&').replaceAll('&#38;', '&').replaceAll('&#x26;', '&');

const problems = [];
let checked = 0;

for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  const page = `/${relative(dist, file)}`.replace(/index\.html$/, '');
  const base = new URL(page, 'https://site.invalid');

  for (const [, attribute, raw] of html.matchAll(/\s(href|src)="([^"]*)"/g)) {
    const value = decodeEntities(raw);
    if (!value || /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(value)) continue; // 외부 링크, mailto: 등

    const url = new URL(value, base);
    checked += 1;

    const target = resolveTarget(url.pathname);
    if (!target) {
      problems.push(`${page}: ${attribute}="${value}" → 파일이 없어요`);
      continue;
    }

    const fragment = decodeURIComponent(url.hash.slice(1));
    if (fragment && target.endsWith('.html') && !(await idsOf(target)).has(fragment)) {
      problems.push(`${page}: ${attribute}="${value}" → #${fragment} 앵커가 없어요`);
    }
  }
}

if (problems.length > 0) {
  console.error(`깨진 내부 링크 ${problems.length}개:\n`);
  for (const problem of problems) console.error(`  ${problem}`);
  process.exit(1);
}

console.log(`내부 링크 ${checked}개 확인 완료 (${htmlFiles.length}개 페이지)`);
