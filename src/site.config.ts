/**
 * 사이트 전역 설정.
 * 블로그 이름, 소개 문구, 링크처럼 자주 바꿀 만한 값은 전부 여기에 모여 있다.
 */
export const SITE = {
  /** 배포 주소. sitemap, RSS, canonical, OG 이미지 URL의 기준이 된다. */
  url: 'https://parkyes90.github.io',
  /** 헤더와 브라우저 탭에 표시되는 블로그 이름. */
  title: 'parkyes90',
  /** 홈 화면 첫 줄에 크게 보이는 문구. */
  tagline: '만들고, 운영하고, 기록합니다.',
  /** 검색 엔진과 RSS 리더에 노출되는 사이트 설명. */
  description: '개발하며 배운 것과 겪은 문제를 정리해 두는 공간입니다.',
  /** 글쓴이 표기. RSS, JSON-LD, 푸터에 쓰인다. */
  author: 'parkyes90',
  lang: 'ko',
  locale: 'ko_KR',
  /** 날짜를 표시할 때 기준이 되는 시간대. */
  timeZone: 'Asia/Seoul',
  /** 홈 화면에 보여줄 최근 글 개수. */
  recentPostCount: 8,
  links: {
    github: 'https://github.com/Parkyes90',
  },
  /**
   * giscus 댓글 설정. 값이 비어 있으면 댓글 영역을 렌더링하지 않는다.
   * https://giscus.app 에서 저장소를 선택하면 나오는 값을 그대로 넣으면 된다.
   */
  giscus: {
    repo: '',
    repoId: '',
    category: '',
    categoryId: '',
  },
};

export const NAV = [
  { href: '/posts/', label: '글' },
  { href: '/tags/', label: '태그' },
  { href: '/about/', label: '소개' },
] as const;
