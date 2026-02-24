import fs from "fs";
import path from "path";

/**
 * 프로젝트 내 .agents/skills/seo-pipeline 폴더 하위의
 * 스킬(프롬프트 템플릿) 마크다운 파일을 읽어 문자열로 반환하는 유틸리티입니다.
 */
export async function getSeoSkillTemplate(filename: string): Promise<string> {
  const filePath = path.join(
    process.cwd(),
    "..", // frontend 부모 디렉토리 (프로젝트 루트)
    ".agents",
    "skills",
    "seo-pipeline",
    "references",
    filename
  );

  try {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    return fileContent;
  } catch (error) {
    console.warn(`[Warning] Failed to read SEO skill template: ${filename}. Using fallback literal.`);
    return `[Mock Template for ${filename}]\n\n*This is a fallback template because the original file was not found.*`;
  }
}
