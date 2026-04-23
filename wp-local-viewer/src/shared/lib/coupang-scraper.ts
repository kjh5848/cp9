import * as cheerio from 'cheerio';

/**
 * 주어진 쿠팡 상품 페이지 HTML에서 상품 이미지 URL 목록을 추출합니다.
 * 참고: 쿠팡은 봇(bot) 접근을 차단하므로 서버(Node.js)에서 직접 fetch를 날리면 403 에러가 발생합니다.
 * 이 함수는 클라이언트 사이드 스크래핑(브라우저 확장 앱, 크롤링 프록시 등)으로 얻은 HTML을 파싱할 때 사용해야 합니다.
 */
export function extractCoupangImagesFromHtml(html: string): string[] {
  const $ = cheerio.load(html);
  const images: string[] = [];

  // 쿠팡 모바일/PC 웹의 다양한 썸네일 컨테이너 클래스들을 순회합니다.
  // 1. 유저분께서 제공해주신 twc- 클래스로 이루어진 컨테이너의 이미지 (새로운 레이아웃)
  $('.product-image.twc-relative img, .prod-image__item').each((_, el) => {
    let src = $(el).attr('data-src') || $(el).attr('src');
    
    if (src) {
      if (src.startsWith('//')) {
        src = 'https:' + src;
      }
      
      // 저화질 썸네일(48x48ex 등)을 고화질(492x492ex 등)로 변환
      src = src.replace(/\/\d+x\d+ex\//, '/492x492ex/');
      if (!images.includes(src)) {
        images.push(src);
      }
    }
  });

  return images;
}
