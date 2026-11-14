import { type CollectionEntry, getCollection } from 'astro:content';
import { SITE } from '@/site.config';

export type Post = CollectionEntry<'posts'>;

/** 최신 글이 먼저 오도록 정렬한 글 목록. 초안은 배포본에서 빠진다. */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('posts', ({ data }) => !(import.meta.env.PROD && data.draft));
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export function postUrl(post: Post): string {
  return `/posts/${post.id}/`;
}

/** 태그 이름을 URL 경로에 쓸 수 있는 형태로 바꾼다. */
export function tagSlug(tag: string): string {
  return tag.trim().toLowerCase().replace(/\s+/g, '-').replaceAll('/', '-');
}

export function tagUrl(tag: string): string {
  return `/tags/${tagSlug(tag)}/`;
}

export interface TagSummary {
  name: string;
  slug: string;
  posts: Post[];
}

/** 글이 많은 태그가 먼저 오도록 정렬한 태그 목록. */
export function getTags(posts: Post[]): TagSummary[] {
  const tags = new Map<string, TagSummary>();
  for (const post of posts) {
    for (const name of post.data.tags) {
      const slug = tagSlug(name);
      const tag = tags.get(slug) ?? { name, slug, posts: [] };
      tag.posts.push(post);
      tags.set(slug, tag);
    }
  }
  return [...tags.values()].sort(
    (a, b) => b.posts.length - a.posts.length || a.name.localeCompare(b.name, SITE.lang),
  );
}

/** 연도별로 묶은 글 목록. 입력 순서(최신순)를 유지한다. */
export function groupByYear(posts: Post[]): { year: string; posts: Post[] }[] {
  const groups = new Map<string, Post[]>();
  for (const post of posts) {
    const year = formatDate(post.data.pubDate).slice(0, 4);
    groups.set(year, [...(groups.get(year) ?? []), post]);
  }
  return [...groups.entries()].map(([year, posts]) => ({ year, posts }));
}

const dateParts = new Intl.DateTimeFormat('en-CA', {
  timeZone: SITE.timeZone,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** `2026.01.31` 형태의 날짜 문자열. */
export function formatDate(date: Date): string {
  return dateParts.format(date).replaceAll('-', '.');
}

/**
 * 본문을 읽는 데 걸리는 대략적인 시간(분).
 * 한글은 분당 500자, 그 외 단어는 분당 220단어 기준으로 계산하고 코드 블록은 제외한다.
 */
export function readingMinutes(body: string | undefined): number {
  const text = (body ?? '').replace(/```[\s\S]*?```/g, '');
  const hangul = text.match(/[가-힣]/g)?.length ?? 0;
  const words = text.match(/[A-Za-z0-9]+/g)?.length ?? 0;
  return Math.max(1, Math.round(hangul / 500 + words / 220));
}
