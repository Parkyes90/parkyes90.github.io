#!/usr/bin/env node
// 새 글 파일을 만든다.
//   pnpm new <slug> [제목]
//   예) pnpm new django-on-commit "transaction.on_commit을 쓸 때 알아둘 것"
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const [slug, ...titleWords] = process.argv.slice(2);

if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
  console.error('사용법: pnpm new <slug> [제목]');
  console.error(
    'slug는 글 주소(/posts/<slug>/)가 되므로 영문 소문자, 숫자, 하이픈만 쓸 수 있어요.',
  );
  process.exit(1);
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const file = join(root, 'src/content/posts', `${slug}.md`);

if (existsSync(file) || existsSync(file.replace(/\.md$/, '.mdx'))) {
  console.error(`이미 같은 slug의 글이 있어요: ${relative(root, file)}`);
  process.exit(1);
}

// 한국 시간 기준 오늘 날짜 (YYYY-MM-DD)
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date());
const title = titleWords.join(' ') || slug;

const content = `---
title: ${JSON.stringify(title)}
description: ""
pubDate: ${today}
tags: []
draft: true
---

`;

await mkdir(dirname(file), { recursive: true });
await writeFile(file, content);
console.log(`만들었어요: ${relative(root, file)}`);
console.log('다 쓰고 나면 draft: true 줄을 지워야 배포본에 포함돼요.');
