import type { APIRoute } from 'astro';
import { pngResponse, renderOgImage } from '@/lib/og';
import { SITE } from '@/site.config';

/** 글이 아닌 페이지에서 쓰는 사이트 기본 OG 이미지. */
export const GET: APIRoute = async () =>
  pngResponse(await renderOgImage({ title: SITE.tagline, description: SITE.description }));
