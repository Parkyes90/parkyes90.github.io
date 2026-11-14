# parkyes90.github.io

개인 기술 블로그. [Astro](https://astro.build)로 만든 정적 사이트를 GitHub Actions로 검사하고 GitHub Pages에 배포한다.

- 주소: <https://parkyes90.github.io>
- 스택: Astro 7 · TypeScript · Tailwind CSS 4 · MDX · Expressive Code · Pagefind

## 시작하기

Node.js 22.23.4 이상(권장: `.nvmrc`의 26)과 pnpm이 필요하다.

```bash
nvm use            # .nvmrc에 적힌 Node 버전으로 전환
npm i -g pnpm      # pnpm이 없다면
pnpm install
pnpm dev           # http://localhost:4321
```

## 글 쓰기

```bash
pnpm new django-on-commit "transaction.on_commit을 쓸 때 알아둘 것"
```

`src/content/posts/django-on-commit.md`가 만들어지고, 파일 이름이 곧 주소(`/posts/django-on-commit/`)가 된다.
이미지를 같이 두고 싶으면 `src/content/posts/django-on-commit/index.md`처럼 폴더로 만들고 상대 경로로 불러오면 된다.

```md
---
title: 'transaction.on_commit을 쓸 때 알아둘 것'
description: '목록, 검색 결과, 공유 미리보기에 나오는 한두 문장 요약'
pubDate: 2026-01-31
updatedDate: 2026-02-03 # 선택
tags: [Django, 데이터베이스] # 선택
draft: true # 선택. 개발 서버에서만 보이고 배포본에서는 빠진다
---

본문은 Markdown 또는 MDX(`.mdx`)로 쓴다.
```

`master`에 올리면 검사를 거쳐 자동으로 배포된다. 글마다 공유용 이미지(`/og/<slug>.png`)도 빌드할 때 만들어진다.

코드 블록은 [Expressive Code](https://expressive-code.com/key-features/syntax-highlighting/) 문법을 쓴다.

````md
```python title="views.py" {2-3}
def submit(request):
    with transaction.atomic(): # 강조할 줄은 {2-3}처럼 지정
        ...
```
````

## 설정

| 바꾸고 싶은 것                             | 파일                    |
| ------------------------------------------ | ----------------------- |
| 블로그 이름, 소개 문구, 링크, 댓글(giscus) | `src/site.config.ts`    |
| 색상, 글꼴, 본문 타이포그래피              | `src/styles/global.css` |
| 소개 페이지 내용                           | `src/pages/about.astro` |
| 코드 블록 테마, Markdown 옵션              | `astro.config.ts`       |
| 글 머리말(frontmatter) 항목                | `src/content.config.ts` |

댓글은 [giscus](https://giscus.app)를 쓴다. 저장소에서 Discussions를 켜고 giscus 앱을 설치한 뒤, giscus.app에서 나오는 값 네 개를 `src/site.config.ts`의 `giscus`에 넣으면 글 아래에 댓글 창이 나타난다. 비워 두면 댓글 영역은 렌더링되지 않는다.

## 명령어

| 명령어             | 하는 일                                                  |
| ------------------ | -------------------------------------------------------- |
| `pnpm dev`         | 개발 서버 (초안 포함, 검색은 동작하지 않음)              |
| `pnpm build`       | `dist/`에 사이트를 빌드하고 검색 색인(Pagefind)을 만든다 |
| `pnpm preview`     | 빌드 결과를 로컬에서 그대로 띄운다 (검색 확인은 여기서)  |
| `pnpm new <slug>`  | 새 글 파일 생성                                          |
| `pnpm format`      | Prettier로 포맷 적용                                     |
| `pnpm lint`        | ESLint                                                   |
| `pnpm check`       | `astro check` (타입 검사)                                |
| `pnpm check:links` | 빌드 결과의 내부 링크와 앵커가 깨지지 않았는지 검사      |
| `pnpm verify`      | 위 검사를 CI와 같은 순서로 한 번에 실행                  |

## CI/CD

워크플로는 `.github/workflows/`에 있고, 쓰는 액션은 전부 커밋 SHA로 고정돼 있다.

**`ci.yml` (CI/CD)**

| 시점                | 실행되는 것                                                              |
| ------------------- | ------------------------------------------------------------------------ |
| PR                  | 포맷·린트·타입 검사 → 빌드·링크 검사 → Lighthouse (접근성·SEO·모범 사례) |
| `master` push       | 같은 검사와 빌드를 통과하면 GitHub Pages에 배포                          |
| 매주 월요일 12:00   | `master`를 다시 빌드해 배포 (자동 병합된 의존성 업데이트 반영)           |
| 수동 (Run workflow) | `master` push와 동일                                                     |

모든 검사 결과는 `CI`라는 job 하나로 모이므로, 브랜치 보호 규칙에서는 `CI`만 필수 검사로 지정하면 된다.

**`dependabot-auto-merge.yml`**

Dependabot이 매주 월요일 올리는 마이너·패치 묶음 PR은 `CI`가 통과하면 자동으로 squash 병합된다. 메이저 업데이트는 자동 병합하지 않는다.

**저장소 설정** (한 번만 해 두면 된다)

1. Settings → Pages → Source를 **GitHub Actions**로 설정
2. Settings → General → **Allow auto-merge** 켜기
3. Settings → Rules → `master`에 `CI` 검사를 필수로 요구하는 ruleset 추가 (저장소 관리자는 우회 허용)

2, 3번은 Dependabot 자동 병합에만 필요하다.

## 구조

```text
src/
├── content/posts/     글 (Markdown / MDX)
├── content.config.ts  글 머리말 스키마
├── site.config.ts     사이트 전역 설정
├── pages/             라우트 (홈, 글, 태그, 소개, RSS, OG 이미지 등)
├── layouts/           공통 레이아웃
├── components/        헤더, 검색, 목차, 댓글 등
├── lib/               글 조회, 날짜, OG 이미지 렌더링, Markdown 플러그인
└── styles/global.css  색상 토큰과 본문 스타일
scripts/               새 글 생성, 링크 검사
```
