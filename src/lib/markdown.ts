import type { SatteriProcessorOptions } from '@astrojs/markdown-satteri';

type HastPlugin = NonNullable<SatteriProcessorOptions['hastPlugins']>[number];

/**
 * GFM 체크리스트(`- [ ] 할 일`)의 체크박스에 항목 내용을 접근성 이름으로 붙인다.
 * 기본 출력은 레이블 없는 <input>이라 스크린 리더가 무엇에 대한 체크박스인지 읽지 못한다.
 */
export const taskListLabels: HastPlugin = {
  name: 'task-list-labels',
  element: {
    filter: ['input'],
    visit(node, ctx) {
      if (node.properties.type !== 'checkbox') return;
      const label = ctx.textContent(ctx.parent(node)).trim();
      if (label) ctx.setProperty(node, 'ariaLabel', label);
    },
  },
};
