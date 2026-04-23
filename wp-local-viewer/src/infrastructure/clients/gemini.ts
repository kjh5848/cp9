/**
 * [Infrastructure Layer]
 * Gemini (Google) 클라이언트
 * - LangChain ChatGoogleGenerativeAI 팩토리 함수 (호출 시 모델 동적 지정)
 * - Nano Banana: Google Imagen 3 이미지 생성 연동
 */
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import fs from "fs/promises";
import path from "path";

const googleApiKey = process.env.GOOGLE_API_KEY || 'placeholder';

/**
 * Gemini 모델 팩토리 함수 - 런타임에 모델을 동적으로 선택
 * @param modelName - 사용할 Gemini 모델 ID
 */
export function createGeminiModel(modelName: string = 'gemini-2.5-flash') {
  return new ChatGoogleGenerativeAI({
    apiKey: googleApiKey,
    model: modelName,
    maxRetries: 1,
  });
}

// 하위 호환성을 위한 기본 인스턴스 (gemini-2.0-flash 고정)
export const geminiModel = createGeminiModel('gemini-2.0-flash');

/**
 * Nano Banana - gemini-2.5-flash-image 모델을 통한 이미지 생성
 * Base64 이미지를 로컬 서버에 저장하고 퍼블릭 URL을 반환합니다.
 * @param prompt - 이미지 생성 프롬프트
 * @returns 저장된 이미지의 퍼블릭 URL (실패 시 null)
 */
export async function generateNanoBananaImage(prompt: string): Promise<string | null> {
  if (!googleApiKey || googleApiKey === 'placeholder') {
    console.warn('[ImageGen] GOOGLE_API_KEY가 설정되지 않아 이미지 생성을 건너뜁니다.');
    return null;
  }

  try {
    console.log(`[ImageGen] gemini-2.5-flash-image API 호출 시작...`);

    // Gemini generateContent API (이미지 생성 모드)
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-04-17:generateContent?key=${googleApiKey}`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt.substring(0, 1000) }] }],
        generationConfig: {
          // 이미지 생성 모드 활성화
          responseModalities: ['image'],
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[ImageGen] Gemini Image API 오류 (${response.status}):`, errText);
      return null;
    }

    const data = await response.json() as any;
    // 응답에서 inlineData(base64) 추출
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find((p: any) => p.inlineData?.mimeType?.startsWith('image/'));

    if (!imagePart?.inlineData?.data) {
      console.warn('[ImageGen] Gemini Image API 응답에 이미지 데이터가 없습니다:', JSON.stringify(data).substring(0, 200));
      return null;
    }

    // Base64 디코딩 후 로컬 /public/uploads/generated-images 에 저장
    const buffer = Buffer.from(imagePart.inlineData.data, 'base64');
    const ext = imagePart.inlineData.mimeType.includes('png') ? 'png' : 'jpg';
    const fileName = `nb_${Date.now()}.${ext}`;
    const publicDir = path.join(process.cwd(), 'public/uploads/generated-images');
    await fs.mkdir(publicDir, { recursive: true });
    await fs.writeFile(path.join(publicDir, fileName), buffer);

    const imageUrl = `/uploads/generated-images/${fileName}`;
    console.log(`[ImageGen] gemini-2.5-flash-image 이미지 저장 완료: ${imageUrl}`);
    return imageUrl;

  } catch (err) {
    console.error('[ImageGen] gemini-2.5-flash-image 이미지 생성 실패:', err);
    return null;
  }
}

