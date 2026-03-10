import fs from "fs";
import path from "path";

/**
 * 프로젝트 내 .agents/skills/seo-pipeline 폴더 하위의
 * 스킬(프롬프트 템플릿) 마크다운 파일을 읽어 문자열로 반환하는 유틸리티입니다.
 */
export async function getSeoSkillTemplate(filename: string): Promise<string> {
  const tryPaths = [
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
