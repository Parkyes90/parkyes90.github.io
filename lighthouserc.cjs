// Lighthouse CI 설정. 빌드 결과(dist)를 임시 서버로 띄워 주요 페이지를 검사한다.
//   pnpm build && npx @lhci/cli autorun
const { existsSync, readdirSync } = require('node:fs');

// 글 페이지는 글이 있을 때만 하나 골라 검사 대상에 넣는다.
const posts = existsSync('dist/posts')
  ? readdirSync('dist/posts', { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => `http://localhost/posts/${entry.name}/`)
  : [];

module.exports = {
  ci: {
    collect: {
      staticDistDir: './dist',
      url: [
        'http://localhost/',
        'http://localhost/posts/',
        'http://localhost/tags/',
        'http://localhost/about/',
        ...posts.slice(0, 1),
      ],
      numberOfRuns: 1,
    },
    assert: {
      assertions: {
        // 성능 점수는 실행 환경에 따라 흔들리므로 경고만 한다.
        'categories:performance': ['warn', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.95 }],
        // 글 본문에서 생기는 사소한 감점 하나(예: "여기" 같은 링크 문구)로는 실패하지 않게 둔다.
        'categories:seo': ['error', { minScore: 0.9 }],
      },
    },
  },
};
