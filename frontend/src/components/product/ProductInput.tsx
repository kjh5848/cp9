import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

/**
 * 상품 입력/검색 UI (링크 직접 입력, 키워드 검색 방식 토글)
 */
export default function ProductInput() {
  // 입력 방식: 'link' | 'keyword'
  const [mode, setMode] = useState<'link' | 'keyword'>('link');
  // 링크 입력값 (최대 20개, ,로 구분)
  const [links, setLinks] = useState('');
  // 키워드 입력값
  const [keyword, setKeyword] = useState('');
  // 아이템 개수
  const [itemCount, setItemCount] = useState(5);
  // 딥링크 결과 상태
  const [deeplinkResult, setDeeplinkResult] = useState<any[]>([]);
  // 로딩 상태
  const [loading, setLoading] = useState(false);

  // 엔터로 검색되는 공통 훅
  const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>, action: () => void) => {
    if (e.key === 'Enter') action();
  };

  // 링크 → 딥링크 변환 요청 (mock)
  const handleLinkSubmit = async () => {
    setLoading(true);
    // TODO: 실제 딥링크 변환 API 연동
    const urls = links.split(',').map((v) => v.trim()).filter(Boolean).slice(0, 20);
    setTimeout(() => {
      setDeeplinkResult(urls.map((url, i) => ({ originalUrl: url, deepLink: url + '?deeplink=1' })));
      setLoading(false);
    }, 500);
  };

  // 키워드 → 상품 검색 요청
  const handleKeywordSearch = async () => {
    setLoading(true);
    setDeeplinkResult([]);
    try {
      const res = await fetch('/api/products/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword }),
      });
      const data = await res.json();
      setDeeplinkResult(data.slice(0, itemCount));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 max-w-xl mx-auto mt-8">
      <div className="flex gap-2 mb-4">
        <Button variant={mode === 'link' ? 'default' : 'outline'} onClick={() => setMode('link')}>링크 직접 입력</Button>
        <Button variant={mode === 'keyword' ? 'default' : 'outline'} onClick={() => setMode('keyword')}>키워드 검색</Button>
      </div>
      {mode === 'link' ? (
        <div>
          <Input
            placeholder="쿠팡 상품 링크를 ,로 구분해 입력 (최대 20개)"
            value={links}
            onChange={e => setLinks(e.target.value)}
            onKeyDown={e => handleEnter(e, handleLinkSubmit)}
            disabled={loading}
          />
          <Button className="mt-2 w-full" onClick={handleLinkSubmit} disabled={loading}>딥링크 변환</Button>
        </div>
      ) : (
        <div>
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="검색할 키워드 입력"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onKeyDown={e => handleEnter(e, handleKeywordSearch)}
              disabled={loading}
            />
            <Input
              type="number"
              min={1}
              max={20}
              value={itemCount}
              onChange={e => setItemCount(Number(e.target.value))}
              className="w-20"
              disabled={loading}
            />
          </div>
          <Button className="w-full" onClick={handleKeywordSearch} disabled={loading}>상품 검색</Button>
        </div>
      )}
      <div className="mt-6">
        <h3 className="font-bold mb-2">딥링크/상품 결과</h3>
        {loading ? (
          <div>로딩 중...</div>
        ) : (
          <ul className="space-y-2">
            {deeplinkResult.map((item, i) => (
              <li key={i} className="border p-2 rounded">
                {mode === 'link' ? (
                  <>
                    <div>원본: <a href={item.originalUrl} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">{item.originalUrl}</a></div>
                    <div>딥링크: <span className="text-green-700">{item.deepLink}</span></div>
                  </>
                ) : (
                  <>
                    <div>상품명: {item.title}</div>
                    <div>가격: {item.price?.toLocaleString()}원</div>
                    <div>링크: <a href={item.url} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">{item.url}</a></div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
} 