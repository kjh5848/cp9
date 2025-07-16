import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useSearchStore } from '@/store/searchStore';

/**
 * 상품 입력/검색 UI (링크 직접 입력, 키워드 검색 방식 토글)
 */
export default function ProductInput() {
  // zustand store 연동
  const { results, setResults, selected, setSelected, history, addHistory, clear } = useSearchStore();
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
  // 결과 뷰 타입: gallery | grid | list
  const [viewType, setViewType] = useState<'gallery' | 'grid' | 'list'>('gallery');
  // 링크 수정용 임시 상태
  const [editIndex, setEditIndex] = useState<number|null>(null);
  const [editLink, setEditLink] = useState('');
  const [rocketOnly, setRocketOnly] = useState(false);
  const [step, setStep] = useState<'search' | 'deeplink'>('search');

  // 검색 결과 zustand에 저장/복원
  useEffect(() => {
    if (results.length > 0) setDeeplinkResult(results);
  }, []);
  useEffect(() => {
    setResults(deeplinkResult);
  }, [deeplinkResult]);

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
      setDeeplinkResult(urls.map((url, i) => ({ originalUrl: url, deepLink: url + '?deeplink=1', productId: url })));
      setLoading(false);
      setStep('deeplink');
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
      setDeeplinkResult(Array.isArray(data) ? data.slice(0, itemCount) : []);
      setStep('deeplink');
    } finally {
      setLoading(false);
    }
  };

  // 딥링크 변환 단계: 선택된 상품만 변환
  const handleDeeplinkConvert = () => {
    setLoading(true);
    setTimeout(() => {
      setDeeplinkResult(deeplinkResult.map(item =>
        selected.includes(item.productId || item.url)
          ? { ...item, deepLink: (item.url || item.originalUrl) + '?deeplink=1' }
          : item
      ));
      setLoading(false);
      addHistory(deeplinkResult);
    }, 500);
  };

  // 상품 선택 토글
  const handleSelect = (id: string) => {
    setSelected(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]);
  };

  // 링크 단건 수정/추가 (mock, 실제 API 연동 필요)
  const handleEditLink = (idx: number, link: string) => {
    setDeeplinkResult(prev => prev.map((item, i) => i === idx ? { ...item, originalUrl: link, deepLink: link + '?deeplink=1' } : item));
    setEditIndex(null);
    setEditLink('');
  };
  const handleAddLink = () => {
    if (editLink.trim()) {
      setDeeplinkResult(prev => [...prev, { originalUrl: editLink.trim(), deepLink: editLink.trim() + '?deeplink=1' }]);
      setEditLink('');
    }
  };

  // 입력 방식 변경 시 상태 초기화
  const handleModeChange = (newMode: 'link' | 'keyword') => {
    setMode(newMode);
    setEditIndex(null);
    setEditLink('');
    setDeeplinkResult([]);
    setSelected([]);
    setStep('search');
  };

  // 뷰 타입별 클래스
  const getResultListClass = () => {
    if (viewType === 'gallery') return 'grid grid-cols-2 md:grid-cols-3 gap-4';
    if (viewType === 'grid') return 'grid grid-cols-1 md:grid-cols-2 gap-2';
    return 'flex flex-col gap-2';
  };

  // 로켓배송 필터 적용
  const filteredResults = rocketOnly ? deeplinkResult.filter(item => item.rocketShipping) : deeplinkResult;

  // 전체선택
  const allIds = filteredResults.map(item => item.productId || item.url);
  const allChecked = allIds.length > 0 && allIds.every(id => selected.includes(id));
  const handleSelectAll = () => {
    setSelected(allChecked ? [] : allIds);
  };

  // 카드 고정 높이, 영역 분리, 구분선 스타일
  const cardClass = 'border rounded shadow flex flex-col justify-between p-2 h-[320px] min-h-[320px] max-h-[600px] text-left relative';
  const divider = <div className="border-t my-2" />;

  return (
    <Card className="p-6 mx-auto mt-8">
      <div className="flex gap-2 mb-4">
        <Button variant={mode === 'link' ? 'default' : 'outline'} onClick={() => handleModeChange('link')}>링크 직접 입력</Button>
        <Button variant={mode === 'keyword' ? 'default' : 'outline'} onClick={() => handleModeChange('keyword')}>키워드 검색</Button>
      </div>
      <div className="mb-2 flex items-center gap-4">
        <label className="flex items-center gap-1 text-sm">
          <input type="checkbox" checked={rocketOnly} onChange={e => setRocketOnly(e.target.checked)} />
          로켓배송만 보기
        </label>
        <label className="flex items-center gap-1 text-sm">
          <input type="checkbox" checked={allChecked} onChange={handleSelectAll} />
          전체선택
        </label>
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
          <Button className="mt-2 w-full" onClick={handleLinkSubmit} disabled={loading}>딥링크 변환 단계로</Button>
          <div className="flex gap-2 mt-2">
            <Input
              placeholder="링크 추가"
              value={editLink}
              onChange={e => setEditLink(e.target.value)}
              onKeyDown={e => handleEnter(e, handleAddLink)}
              disabled={loading}
            />
            <Button onClick={handleAddLink} disabled={loading}>추가</Button>
          </div>
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
        <div className="flex gap-2 mb-2">
          <Button size="sm" variant={viewType === 'gallery' ? 'default' : 'outline'} onClick={() => setViewType('gallery')}>갤러리</Button>
          <Button size="sm" variant={viewType === 'grid' ? 'default' : 'outline'} onClick={() => setViewType('grid')}>그리드</Button>
          <Button size="sm" variant={viewType === 'list' ? 'default' : 'outline'} onClick={() => setViewType('list')}>리스트</Button>
        </div>
        <h3 className="font-bold mb-2">딥링크/상품 결과</h3>
        {loading ? (
          <div>로딩 중...</div>
        ) : (
          <ul className={(viewType === 'gallery' ? 'grid grid-cols-2 md:grid-cols-3 gap-4 items-stretch' : viewType === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-2 items-stretch' : 'flex flex-col gap-2') + ' h-full'}>
            {filteredResults.map((item, i) => (
              <li key={i} className={cardClass + ' flex flex-col justify-between h-full'}>
                <div className="flex flex-col gap-2 flex-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={selected.includes(item.productId || item.url)} onChange={() => handleSelect(item.productId || item.url)} />
                    {item.image && (
                      <img src={item.image} alt={item.title} className="w-40 h-40 object-cover rounded" />
                    )}
                    {item.rocketShipping && (
                      <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-1 rounded">로켓</span>
                    )}
                  </label>
                  {divider}
                    <span className="font-bold flex-1 line-clamp-2">{item.title}</span>
                  {divider}
                  <div>가격: <span className="font-semibold">{item.price?.toLocaleString()}원</span></div>
                  {divider}
                  <div className="truncate overflow-hidden whitespace-nowrap max-w-full">링크: <a href={item.url || item.originalUrl} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer"><span className="truncate inline-block align-bottom max-w-[180px]">{item.url || item.originalUrl}</span></a></div>
                  {divider}
                </div>
                {editIndex === i ? (
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={editLink}
                      onChange={e => setEditLink(e.target.value)}
                      onKeyDown={e => handleEnter(e, () => handleEditLink(i, editLink))}
                      autoFocus
                    />
                    <Button size="sm" onClick={() => handleEditLink(i, editLink)}>저장</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditIndex(null)}>취소</Button>
                  </div>
                ) : (
                  <Button size="sm" className="mt-1" onClick={() => { setEditIndex(i); setEditLink(item.url || item.originalUrl); }}>수정</Button>
                )}
              </li>
            ))}
          </ul>
        )}
        {step === 'deeplink' && filteredResults.length > 0 && (
          <Button className="mt-4 w-full" onClick={handleDeeplinkConvert} disabled={loading || selected.length === 0}>선택 상품 딥링크 변환</Button>
        )}
      </div>
      {/* 검색 이력 */}
      <div className="mt-8">
        <h4 className="font-bold mb-2">검색 이력</h4>
        <ul className="text-xs space-y-1">
          {history.map((h, idx) => (
            <li key={idx} className="truncate border-b pb-1">{h.map(x => x.title).join(', ')}</li>
          ))}
        </ul>
      </div>
    </Card>
  );
} 