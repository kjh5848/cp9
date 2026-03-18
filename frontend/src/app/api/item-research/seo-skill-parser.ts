import fs from "fs";
import path from "path";

/**
 * 프로젝트 내 .agents/skills/seo-pipeline 폴더 하위의
 * 스킬(프롬프트 템플릿) 마크다운 파일을 읽어 문자열로 반환하는 유틸리티입니다.
 */
export async function getSeoSkillTemplate(filename: string): Promise<string> {
  const tryPaths = [
    // Next.js App Router API에서 process.cwd()는 frontend 디렉토리 최상단을 가리킵니다.
    // 배포 환경(.agents 폴더 누락)에 대비하여 src 폴더 내부의 templates를 최우선으로 탐색
    path.join(process.cwd(), "src", "app", "api", "item-research", "pipeline", "templates", filename),
    // 하위 호환성 (로컬 개발 환경 등에서 .agents가 있는 경우)
    path.join(process.cwd(), "..", ".agents", "skills", "seo-pipeline", "references", filename),
    path.join(process.cwd(), "..", ".agents", "skills", "seo-article-writer", "references", filename)
  ];

  for (const filePath of tryPaths) {
    try {
      if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, "utf-8");
        const currentYear = new Date().getFullYear();
        // 동적 연도 교체: 프롬프트에 하드코딩된 과거 연도(2024, 2025 등)를 방지
        content = content.replace(/202[4-9]년/g, `\${currentYear}년`);
        return content;
      }
    } catch (err) {
      // ignore and try next
    }
  }

  console.warn(`[Warning] Failed to read SEO skill template: ${filename}. Using fallback literal.`);
  return `[Mock Template for ${filename}]\n\n*This is a fallback template because the original file was not found.*`;
}
