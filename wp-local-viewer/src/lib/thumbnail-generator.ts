import { chromium } from 'playwright';

export async function generateThumbnail(params: {
  imageUrl: string;
  title: string;
  subtitle: string;
}): Promise<Buffer> {
  const { imageUrl, title, subtitle } = params;

  const html = `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          margin: 0;
          padding: 0;
          width: 800px;
          height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Pretendard', sans-serif;
          background-color: #111;
          overflow: hidden;
        }
        .container {
          position: relative;
          width: 800px;
          height: 400px;
          overflow: hidden;
        }
        .bg-image {
          position: absolute;
          top: -20px;
          left: -20px;
          width: 840px;
          height: 440px;
          object-fit: cover;
          filter: blur(20px) brightness(0.5);
        }
        .overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 20px;
          box-sizing: border-box;
        }
        .badge {
          background: rgba(255, 255, 255, 0.1);
          padding: 8px 16px;
          border-radius: 20px;
          color: #fff;
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 20px;
          backdrop-filter: blur(5px);
        }
        .title {
          font-size: 42px;
          font-weight: 800;
          color: #fff;
          margin: 0;
          line-height: 1.3;
          word-break: keep-all;
          text-shadow: 2px 2px 8px rgba(0,0,0,0.8);
        }
        .subtitle {
          font-size: 28px;
          color: #FF4742;
          font-weight: bold;
          margin-top: 15px;
          text-shadow: 1px 1px 4px rgba(0,0,0,0.8);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <img class="bg-image" src="\${imageUrl}" />
        <div class="overlay">
          <div class="badge">🚀 텔레그램 한정 핫딜 알림</div>
          <h1 class="title">\${title}</h1>
          <p class="subtitle">\${subtitle}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // 실행 속도 최적화를 위해 args 추가 (sandbox 해제)
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  });
  
  const context = await browser.newContext({
    viewport: { width: 800, height: 400 },
  });
  
  const page = await context.newPage();

  // 네트워크 아이들 상태까지 대기하여 이미지가 완전히 로드되도록 함
  await page.setContent(html, { waitUntil: 'networkidle' });

  // 스크린샷 캡처
  const buffer = await page.screenshot({ type: 'jpeg', quality: 90 });

  await browser.close();

  return buffer;
}
