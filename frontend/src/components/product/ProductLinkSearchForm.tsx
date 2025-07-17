'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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
      />
      <Button
        className="mt-2 w-full"
        onClick={handleLinkSubmit}
        disabled={loading}
      >
        딥링크 변환 단계로
      </Button>
    </div>
  );
}
