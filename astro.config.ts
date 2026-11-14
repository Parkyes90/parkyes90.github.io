import { satteri } from '@astrojs/markdown-satteri';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import expressiveCode from 'astro-expressive-code';
import { defineConfig } from 'astro/config';
import { taskListLabels } from './src/lib/markdown';
import { SITE } from './src/site.config';

// https://astro.build/config
export default defineConfig({
  site: SITE.url,
  trailingSlash: 'always',
  prefetch: true,
  integrations: [
    // expressiveCode는 mdx보다 먼저 와야 MDX 안의 코드 블록에도 적용된다.
    expressiveCode({
      themes: ['github-light', 'github-dark'],
      // 사이트의 data-theme 값을 따라가도록 하고, OS 설정 기반 전환은 끈다.
      themeCssSelector: (theme) => `[data-theme='${theme.type}']`,
      useDarkModeMediaQuery: false,
      styleOverrides: {
        borderRadius: '0.625rem',
        borderColor: 'var(--border)',
        codeFontFamily: 'var(--font-mono)',
        codeFontSize: '0.875rem',
        codeLineHeight: '1.7',
        uiFontFamily: 'var(--font-sans)',
        frames: {
          shadowColor: 'transparent',
        },
      },
    }),
    mdx(),
    sitemap(),
  ],
  markdown: {
    processor: satteri({
      hastPlugins: [taskListLabels],
      features: {
        // 각주 영역의 안내 문구를 한국어로 바꾼다.
        gfm: { footnotes: { label: '각주', backLabel: '본문 {reference}번 위치로 돌아가기' } },
      },
    }),
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
