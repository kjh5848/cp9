import { createGptModel } from '@/infrastructure/clients/openai';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function runTest() {
  const testQueries = [
    "헤라 옴므 블랙 액티브 쿠션과 토너가 함께 놓인 모던한 욕실 세면대 위 배치 샷",
    "블랙 액티브 쿠션을 손에 들고 스펀지로 가볍게 두드리는 남성 손 클로즈업",
    "헤라 옴므 블랙 액티브 토너를 손바닥에 덜어 피부에 흡수시키는 모습",
    "여성 무선 이어폰 사용 이미지",
    "노란색 꽃 배경"
  ];

  console.log('🧪 기존 프롬프트 테스트 시작...');
  for (const query of testQueries) {
    const prompt = `다음 텍스트에서 무료 스탁 이미지 검색 시스템에 입력할 가장 핵심적인 영어 키워드를 1~3단어로 추출하거나 번역해주세요. 특수문자 없이 영어 단어들만 내뱉으세요.\n\n텍스트: ${query}`;
    const res = await createGptModel('gpt-4o-mini').invoke(prompt);
    console.log(`\n원본: ${query}`);
    console.log(`기존 프롬프트 결과: ${res.content.toString().trim()}`);
  }

  console.log('\n====================================\n');
  
  console.log('🧪 신규 카테고리 기반 추상화 프롬프트 테스트 시작...');
  for (const query of testQueries) {
    const newPrompt = `다음 텍스트는 블로그에 들어갈 특정 상품이나 상황 묘사입니다.
이 텍스트를 무료 스탁 이미지(Pixabay) 검색에 최적화된 가장 대중적이고 넓은 의미의 일반 명사(영어) 1~3단어로 추상화/변환해주세요. 

[작성 규칙]
1. 고유명사(특정 브랜드명, 상품명 예: 헤라, 삼성, 갤럭시, 옴므)는 무조건 제거하세요.
2. 미용/화장품 관련이면 "cosmetics, beauty, skincare, man face" 등으로 포괄적으로 추상화하세요.
3. 형태를 설명하는 "액티브 쿠션", "토너" 등의 지나치게 구체적인 제품명은 "cosmetics", "lotion" 등 보편적인 단어로 변경하세요.
4. 특수문자 없이 공백으로 구분된 영어 단어들만 내뱉으세요.

텍스트: ${query}`;
    
    const res = await createGptModel('gpt-4o-mini').invoke(newPrompt);
    console.log(`\n원본: ${query}`);
    console.log(`신규 프롬프트 결과: ${res.content.toString().trim()}`);
  }
}

runTest().catch(console.error);
