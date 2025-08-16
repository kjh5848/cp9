'use client';

import { Input } from '@/features/components/ui/input';
import { Button } from '@/features/components/ui/button';
import { ScaleOnHover } from '@/features/components/ui/animated-sections';

interface ProductLinkSearchFormProps {
  loading: boolean;
  links: string;
  setLinks: (value: string) => void;
  handleLinkSubmit: () => void;
  handleEnter: (e: React.KeyboardEvent<HTMLInputElement>, action: () => void) => void;
}

export default function ProductLinkSearchForm({
  loading,
  links,
  setLinks,
  handleLinkSubmit,
  handleEnter,
}: ProductLinkSearchFormProps) {
  return (
    <div>
      <Input
        placeholder="쿠팡 상품 링크를 ,로 구분해 입력 (최대 20개)"
        value={links}
        onChange={(e) => setLinks(e.target.value)}
        onKeyDown={(e) => handleEnter(e, handleLinkSubmit)}
        disabled={loading}
        className="mb-4 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500"
      />
      <ScaleOnHover scale={1.02}>
        <Button
          className="w-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-400 transition-colors"
          onClick={handleLinkSubmit}
          disabled={loading}
        >
          딥링크 변환
        </Button>
      </ScaleOnHover>
    </div>
  );
} 