import { describe, it, expect } from 'vitest';
import { generateThumbnail } from '../src/lib/thumbnail-generator';
import fs from 'fs';
import path from 'path';

describe('thumbnail-generator', () => {
  it('should generate a valid thumbnail image buffer and save it for manual inspection', async () => {
    const params = {
      imageUrl: 'https://thumbnail7.coupangcdn.com/thumbnails/remote/230x230ex/image/retail/images/2021/11/04/10/8/d6d7cf61-12c8-47bc-ad7e-61beaf6d9fd3.png',
      title: '애플 맥북 프로 M3 14인치 역대급 특가 등장!',
      subtitle: '지금 확인하면 로켓배송 특가 즉시 적용',
    };

    const buffer = await generateThumbnail(params);

    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);

    // 수동 시각적 검증을 위해 파일 쓰기 (REFACTOR 단계)
    const outputPath = path.join(process.cwd(), 'test-thumbnail.jpg');
    fs.writeFileSync(outputPath, buffer);
    console.log(`Saved test thumbnail to: \${outputPath}`);
  });
});
