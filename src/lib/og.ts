import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import satori from 'satori';
import sharp from 'sharp';
import { SITE } from '@/site.config';

/** satori는 woff2를 읽지 못해서 pretendard 패키지에 들어 있는 정적 OTF를 쓴다. */
const FONT_DIR = join(process.cwd(), 'node_modules/pretendard/dist/public/static');

const COLORS = {
  bg: '#0c0d12',
  fg: '#f3f3f6',
  muted: '#9a9bab',
  accent: '#a5a8ff',
  border: '#272833',
};

const WIDTH = 1200;
const HEIGHT = 630;

type Font = { name: string; data: Buffer; weight: 400 | 700; style: 'normal' };
let fonts: Promise<Font[]> | undefined;

function loadFonts(): Promise<Font[]> {
  fonts ??= Promise.all([
    readFile(join(FONT_DIR, 'Pretendard-Regular.otf')),
    readFile(join(FONT_DIR, 'Pretendard-Bold.otf')),
  ]).then(([regular, bold]) => [
    { name: 'Pretendard', data: regular, weight: 400, style: 'normal' },
    { name: 'Pretendard', data: bold, weight: 700, style: 'normal' },
  ]);
  return fonts;
}

type Node = { type: string; props: { style: Record<string, unknown>; children?: unknown } };

/** JSX 없이 satori가 받는 요소 객체를 만든다. */
function h(style: Record<string, unknown>, ...children: (Node | string)[]): Node {
  return { type: 'div', props: { style: { display: 'flex', ...style }, children } };
}

/** 제목이나 설명이 길어도 아래쪽 줄이 캔버스 밖으로 밀려나지 않게 글자 수로 자른다. */
function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

export interface OgImageOptions {
  title: string;
  description?: string;
  /** 오른쪽 아래에 표시할 보조 문구 (예: 날짜) */
  footnote?: string;
}

/** 1200×630 PNG로 렌더링한 Open Graph 이미지. */
export async function renderOgImage({
  title,
  description,
  footnote,
}: OgImageOptions): Promise<Buffer> {
  const tree = h(
    {
      // 안쪽 여백이 캔버스 크기에 포함되도록 border-box로 고정한다.
      boxSizing: 'border-box',
      width: WIDTH,
      height: HEIGHT,
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '72px 80px',
      backgroundColor: COLORS.bg,
      color: COLORS.fg,
      fontFamily: 'Pretendard',
    },
    h(
      { alignItems: 'center', fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em' },
      h({
        width: 18,
        height: 18,
        marginRight: 16,
        borderRadius: 4,
        backgroundColor: COLORS.accent,
      }),
      SITE.title,
    ),
    h(
      { flexDirection: 'column' },
      h(
        {
          fontSize: title.length > 34 ? 60 : 72,
          fontWeight: 700,
          lineHeight: 1.25,
          letterSpacing: '-0.035em',
          wordBreak: 'keep-all',
        },
        truncate(title, 64),
      ),
      ...(description
        ? [
            h(
              {
                marginTop: 28,
                fontSize: 30,
                lineHeight: 1.5,
                color: COLORS.muted,
                wordBreak: 'keep-all',
              },
              truncate(description, 76),
            ),
          ]
        : []),
    ),
    h(
      {
        justifyContent: 'space-between',
        paddingTop: 28,
        borderTop: `1px solid ${COLORS.border}`,
        fontSize: 24,
        color: COLORS.muted,
      },
      h({}, new URL(SITE.url).host),
      h({}, footnote ?? ''),
    ),
  );

  const svg = await satori(tree as unknown as Parameters<typeof satori>[0], {
    width: WIDTH,
    height: HEIGHT,
    fonts: await loadFonts(),
  });
  return sharp(Buffer.from(svg)).png().toBuffer();
}

export function pngResponse(image: Buffer): Response {
  return new Response(new Uint8Array(image), {
    headers: { 'Content-Type': 'image/png' },
  });
}
