import type { APIRoute, GetStaticPaths } from 'astro';
import { pngResponse, renderOgImage } from '@/lib/og';
import { type Post, formatDate, getPosts } from '@/lib/posts';

export const getStaticPaths = (async () => {
  const posts = await getPosts();
  return posts.map((post) => ({ params: { slug: post.id }, props: { post } }));
}) satisfies GetStaticPaths;

/** 글마다 제목과 설명이 들어간 OG 이미지를 빌드 시점에 만들어 둔다. */
export const GET: APIRoute<{ post: Post }> = async ({ props }) => {
  const { title, description, pubDate } = props.post.data;
  return pngResponse(await renderOgImage({ title, description, footnote: formatDate(pubDate) }));
};
