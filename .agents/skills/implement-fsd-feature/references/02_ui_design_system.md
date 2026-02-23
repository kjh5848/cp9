# 02. UI/UX 디자인 시스템 (Deep Tech 기반)

이 문서는 프론트엔드 프로젝트의 "Deep Tech SaaS" 브랜드 아이덴티티를 구현하기 위한 UI/UX 작성 가이드입니다.

## 1. Deep Tech & Dark Mode 기본 원칙

본 프로젝트는 첨단 기술과 깊이 있는 전문성을 상징하는 다크 테마 기반의 UI를 기본으로 합니다.

- **색상 체계 (Color Palette)**
  - **배경 (Background)**: 매우 짙은 무채색 또는 미세한 파란색이 섞인 검은색(예: `#0A0A0B`, `slate-950`).
  - **텍스트 (Text)**: 높은 가독성을 위해 완전한 흰색(`text-white`) 혹은 약간 회색조가 섞인 흰색(`text-gray-200`, `text-slate-300`).
  - **강조 색상 (Accent)**: 데이터, 주요 지표 측정 등 강조가 필요한 곳에는 형광성 네온 컬러(예: Electric Blue, Neon Purple, Emerald Green).

## 2. Glassmorphism 구현 (Tailwind CSS)

투명하면서도 깊이감을 주는 유리 효과(Glassmorphism)를 적극적으로 사용합니다. 데이터 시각화 보드나 모달, 요약 카드에 주로 적용합니다.

**Tailwind 적용 공식 코딩 룰**:
```tsx
import { cn } from "@/shared/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export const GlassCard = ({ children, className }: GlassCardProps) => {
  return (
    <div
      className={cn(
        // 배경을 반투명하게 하고, 뒷 배경을 블러 처리합니다.
        "bg-white/5 backdrop-blur-md", 
        // 얇고 은은한 테두리로 유리의 외곽선을 표현합니다.
        "border border-white/10",
        // 모서리를 둥글게 처리하고 적절한 여백을 줍니다.
        "rounded-2xl p-6 shadow-xl", 
        className
      )}
    >
      {children}
    </div>
  );
};
```

## 3. shadcn/ui 라이브러리 조합

새로운 기능 구현 시, 완전히 처음부터 마크업을 짜기보다는 `shared/ui`에 존재하는(혹은 추가할) shadcn/ui 기반 컴포넌트를 우선적으로 사용해야 합니다. 
만약 필요한 컴포넌트가 없다면, shadcn/ui 문서(https://ui.shadcn.com/docs)를 참조하여 표준적인 구조로 추가합니다. 기본 `Button`, `Card`, `Input`, `Dialog` 등을 오버라이딩하여 글래스모피즘 스타일을 주입해도 좋습니다.

## 4. 모션 및 애니메이션 (Framer Motion)

시각적 피드백 시 UI의 덜컹거림(Wobbling 등)을 방지하고 부드럽고 묵직한(Premium) 애니메이션을 제공해야 합니다.

- UI 요소 등장 시 또는 호버(Hover) 시:
```tsx
import { motion } from "framer-motion";

<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, ease: "easeOut" }}
  whileHover={{ scale: 1.02 }}
  className="glass-card"
>
  ...
</motion.div>
```
- 상태 변화나 라우트 변경 시 요소들이 갑자기 '팝업'되지 않고 서서히 페이드(Fade)되도록 `framer-motion` 또는 Tailwind의 `transition-all`을 일관되게 적용합니다.
