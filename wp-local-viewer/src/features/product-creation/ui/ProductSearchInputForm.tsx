import React from 'react';
import { Search, Link as LinkIcon, Layers, ChevronDown, Loader2 } from 'lucide-react';
import { GlassCard } from '@/shared/ui/GlassCard';
import { Button } from '@/shared/ui/button';
import { SearchMode } from '@/widgets/product-creation/ui/ProductCreation';

const CATEGORIES = [
  { id: "1001", name: "여성패션" },
  { id: "1002", name: "남성패션" },
  { id: "1010", name: "뷰티" },
  { id: "1011", name: "출산/유아동" },
  { id: "1012", name: "식품" },
  { id: "1013", name: "주방용품" },
  { id: "1014", name: "생활용품" },
  { id: "1015", name: "홈인테리어" },
  { id: "1016", name: "가전디지털" },
  { id: "1017", name: "스포츠/레저" },
  { id: "1018", name: "자동차용품" },
  { id: "1019", name: "도서/음반/DVD" },
  { id: "1020", name: "완구/취미" },
  { id: "1021", name: "문구/오피스" },
  { id: "1024", name: "헬스/건강식품" },
  { id: "1025", name: "국내여행" },
  { id: "1026", name: "해외여행" },
  { id: "1029", name: "반려동물용품" },
  { id: "1030", name: "유아동패션" }
];

const PL_BRANDS = [
  { id: "1001", name: "탐사" },
  { id: "1002", name: "코멧" },
  { id: "1003", name: "Gomgom" },
  { id: "1004", name: "줌" },
  { id: "1006", name: "곰곰" },
  { id: "1007", name: "꼬리별" },
  { id: "1008", name: "베이스알파에센셜" },
  { id: "1010", name: "비타할로" },
  { id: "1011", name: "비지엔젤" }
];

export interface ProductSearchInputFormProps {
  mode: SearchMode;
  value: string;
  setValue: (value: string) => void;
  onAction: () => void;
  loading: boolean;
}

export function ProductSearchInputForm({
  mode,
  value,
  setValue,
  onAction,
  loading
}: ProductSearchInputFormProps) {
  return (
    <GlassCard className="p-8">
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          {mode === "keyword" ? <Search className="w-5 h-5 text-blue-400" /> : null}
          {mode === "link" ? <LinkIcon className="w-5 h-5 text-emerald-400" /> : null}
          {(mode === "category" || mode === "pl_brand") ? <Layers className="w-5 h-5 text-purple-400" /> : null}
          <h2 className="text-xl font-bold text-white uppercase tracking-tight">
            {mode.replace('_', ' ')} Search
          </h2>
        </div>

        {mode === "link" ? (
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="쿠팡 상품 URL을 입력하세요 (여러 줄 가능)"
            className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none" 
          />
        ) : mode === "category" ? (
          <div className="relative">
            <select
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 pr-12 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none cursor-pointer">
              <option value="" disabled className="text-slate-500">카테고리를 선택하세요</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id} className="text-black">
                  {cat.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
              <ChevronDown className="w-5 h-5" />
            </div>
          </div>
        ) : mode === "pl_brand" ? (
          <div className="relative">
            <select
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 pr-12 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none cursor-pointer">
              <option value="" disabled className="text-slate-500">PL 브랜드를 선택하세요</option>
              {PL_BRANDS.map((cat) => (
                <option key={cat.id} value={cat.id} className="text-black">
                  {cat.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
              <ChevronDown className="w-5 h-5" />
            </div>
          </div>
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" ? onAction() : null}
            placeholder="티셔츠, 무선충전기 등 키워드를 입력하세요"
            className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" 
          />
        )}

        <Button
          onClick={onAction}
          disabled={loading || !value.trim()}
          className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-500/20">
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              검색 중...
            </>
          ) : "상품 검색"}
        </Button>
      </div>
    </GlassCard>
  );
}
