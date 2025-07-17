'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useSearchStore, ProductHistory } from '@/store/searchStore';

/**
 * 상품 입력/검색 UI (링크 직접 입력, 키워드 검색 방식 토글)
 */
export default function ProductInput() {
  // zustand store 연동
  const { results, setResults, selected, setSelected, history, addHistory, clear } = useSearchStore();
  // 입력 방식: 'link' | 'keyword' | 'category'
  const [mode, setMode] = useState<'link' | 'keyword' | 'category'>('category');
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
  // 결과 뷰 타입: grid | list
  const [viewType, setViewType] = useState<'grid' | 'list'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('viewType') as 'grid' | 'list') || 'grid';
    }
    return 'grid';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('viewType', viewType);
    }
  }, [viewType]);
  // 링크 수정용 임시 상태
  const [editIndex, setEditIndex] = useState<number|null>(null);
  const [editLink, setEditLink] = useState('');
  const [rocketOnly, setRocketOnly] = useState(false);
  const [step, setStep] = useState<'search' | 'deeplink'>('search');
  const [showHistory, setShowHistory] = useState(false);
  const [historyDetail, setHistoryDetail] = useState<ProductHistory|null>(null);
  // 카테고리, 이미지 사이즈, limit 상태 추가
  const [categoryId, setCategoryId] = useState('1002'); // 기본값 '남성패션'
  const [imageWidth, setImageWidth] = useState(512);
  const [imageHeight, setImageHeight] = useState(512);
  const [imageRatio, setImageRatio] = useState('1:1');
  const [bestLimit, setBestLimit] = useState(20);
  // 가격 필터 상태
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(500000);

  // 이미지 사이즈 셀렉트 옵션
  const imageSizeOptions = [256, 512, 768, 1024];

  // 가격 프리셋
  const pricePresets = [
    { label: '0~10만', min: 0, max: 100000 },
    { label: '0~20만', min: 0, max: 200000 },
    { label: '0~30만', min: 0, max: 300000 },
    { label: '0~40만', min: 0, max: 400000 },
    { label: '0~50만', min: 0, max: 500000 },
  ];

  // 로켓배송 필터 적용
  const filteredResults = rocketOnly ? deeplinkResult.filter(item => item.isRocket || item.rocketShipping) : deeplinkResult;

  // 카테고리 검색 결과 필터링
  const filteredCategoryResults = mode === 'category'
    ? deeplinkResult.filter(item =>
        (item.productPrice ?? 0) >= priceMin && (item.productPrice ?? 0) <= priceMax
      )
    : filteredResults;

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

  // addHistory 호출 전 공백 검색 방지
  const safeAddHistory = (keyword: string, items: any[]) => {
    if (keyword.trim()) addHistory(keyword, items);
  };

  // 링크 → 딥링크 변환 요청 (mock)
  const handleLinkSubmit = async () => {
    setLoading(true);
    // TODO: 실제 딥링크 변환 API 연동
    const urls = links.split(',').map((v) => v.trim()).filter(Boolean).slice(0, 20);
    const items = urls.map((url) => ({
      title: url,
      image: '',
      price: 0,
      url,
      productId: url,
      deepLink: url + '?deeplink=1',
      rocketShipping: false,
    }));
    setTimeout(() => {
      setDeeplinkResult(items);
      setLoading(false);
      setStep('deeplink');
      safeAddHistory(links, items);
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
      safeAddHistory(keyword, Array.isArray(data) ? data.slice(0, itemCount) : []);
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
    }, 500);
  };

  // 상품 선택 토글(색상 변경)
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
  const handleModeChange = (newMode: 'link' | 'keyword' | 'category') => {
    setMode(newMode);
    setEditIndex(null);
    setEditLink('');
    setSelected([]);
    setStep('search');
  };

  // 전체선택
  const allIds = filteredResults.map(item => item.productId || item.url);
  const allChecked = allIds.length > 0 && allIds.every(id => selected.includes(id));
  const handleSelectAll = () => {
    setSelected(allChecked ? [] : allIds);
  };

  const cardClass = 'border rounded-lg bg-card text-card-foreground shadow-sm flex flex-col p-4 text-left relative cursor-pointer transition-colors min-h-[220px]';
  const cardSelected = 'bg-blue-50 border-blue-400 ring-2 ring-blue-300';
  
  // 날짜/시간 포맷
  const formatDate = (iso: string) => {
    if (!iso) return '---';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '---';
    return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
  };

  // 반응형: PC(>=md) 사이드, 모바일 버튼+모달
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // 이력 지우기 버튼 핸들러: 이력, 결과, 선택 모두 초기화
  const handleClearHistory = () => {
    clear();
    setResults([]);
    setDeeplinkResult([]);
    setSelected([]);
  };

  // 카테고리 상품 검색 핸들러 (API Route로 요청)
  const handleCategorySearch = async () => {
    if (!categoryId) return;
    setLoading(true);
    try {
      const imageSize = `${imageWidth}x${imageHeight}`;
      const res = await fetch('/api/products/bestcategories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId, limit: bestLimit, imageSize }),
      });
      if (!res.ok) throw new Error(await res.text());
      const products = await res.json();
      setDeeplinkResult(products);
      setStep('deeplink');
    } catch (e) {
      alert('카테고리 상품 검색 실패: ' + (e instanceof Error ? e.message : ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-6 md:flex-row">
      <Card className="w-full flex-1 p-6 hover:bg-white hover:bg-opacity-90 hover:shadow-md transition-colors bg-white text-[#171717]">
        {/* 기존 탭 UI: 갤러리 제거 */}
        <div className="flex gap-2 mb-4">
          <Button variant={mode === 'link' ? 'default' : 'outline'} onClick={() => handleModeChange('link')} className="bg-[#ededed] text-[#171717] hover:bg-white hover:bg-opacity-90 transition-colors">링크 직접 입력</Button>
          <Button variant={mode === 'keyword' ? 'default' : 'outline'} onClick={() => handleModeChange('keyword')} className="bg-[#ededed] text-[#171717] hover:bg-white hover:bg-opacity-90 transition-colors">키워드 검색</Button>
          <Button variant={mode === 'category' ? 'default' : 'outline'} onClick={() => handleModeChange('category')} className="bg-[#ededed] text-[#171717] hover:bg-white hover:bg-opacity-90 transition-colors">카테고리 검색</Button>
        </div>
        {/* 카테고리 검색 모드에서만 입력폼 노출 */}
        {mode === 'category' && (
          <>
            <div className="flex items-center gap-4 border-b pb-3 mb-3">
              <label className="w-20 text-sm font-medium">카테고리</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-48 rounded border px-2 py-1"
              >
                <option value="">카테고리 선택</option>
                <option value="1001">여성패션</option>
                <option value="1002">남성패션</option>
                <option value="1010">뷰티</option>
                <option value="1011">출산/유아동</option>
                <option value="1012">식품</option>
                <option value="1013">주방용품</option>
                <option value="1014">생활용품</option>
                <option value="1015">홈인테리어</option>
                <option value="1016">가전디지털</option>
                <option value="1017">스포츠/레저</option>
                <option value="1018">자동차용품</option>
                <option value="1019">도서/음반/DVD</option>
                <option value="1020">완구/취미</option>
                <option value="1021">문구/오피스</option>
                <option value="1024">헬스/건강식품</option>
                <option value="1025">국내여행</option>
                <option value="1026">해외여행</option>
                <option value="1029">반려동물용품</option>
                <option value="1030">유아동패션</option>
              </select>
            </div>
            <div className="flex items-center gap-4 border-b pb-3 mb-3">
              <label className="w-20 text-sm font-medium">이미지</label>
              <span className="text-xs">가로</span>
              <select
                value={imageWidth}
                onChange={(e) => setImageWidth(Number(e.target.value))}
                className="w-20 rounded border px-2 py-1"
              >
                {imageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <span className="text-xs">세로</span>
              <select
                value={imageHeight}
                onChange={(e) => setImageHeight(Number(e.target.value))}
                className="w-20 rounded border px-2 py-1"
              >
                {imageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <span className="text-xs">비율</span>
              <select
                value={imageRatio}
                onChange={(e) => setImageRatio(e.target.value)}
                className="w-20 rounded border px-2 py-1"
              >
                <option value="1:1">1:1</option>
                <option value="4:3">4:3</option>
                <option value="3:4">3:4</option>
                <option value="16:9">16:9</option>
                <option value="9:16">9:16</option>
              </select>
            </div>
            <div className="flex items-center gap-4 border-b pb-3 mb-3">
              <label className="w-20 text-sm font-medium">개수</label>
              <input
                type="number"
                min={1}
                max={100}
                placeholder="limit"
                value={bestLimit}
                onChange={(e) => setBestLimit(Number(e.target.value))}
                className="w-24 rounded border px-2 py-1"
              />
              <span className="text-xs text-gray-500">
                최대 100개까지 가능
              </span>
            </div>
            <div className="flex items-center gap-4">
              <label className="w-20 text-sm font-medium">가격</label>
              <input
                type="number"
                min={0}
                value={priceMin}
                onChange={(e) => setPriceMin(Number(e.target.value))}
                className="w-24 rounded border px-2 py-1"
              />
              <span className="mx-1">~</span>
              <input
                type="number"
                min={0}
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className="w-24 rounded border px-2 py-1"
              />
            </div>
            <div className="flex flex-wrap gap-1 mt-2 mb-3">
              {pricePresets.map((preset) => (
                <Button
                  key={preset.label}
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setPriceMin(preset.min);
                    setPriceMax(preset.max);
                  }}
                  className="whitespace-nowrap"
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            <Button className="mt-2 w-full transition-transform active:scale-95 bg-[#ededed] text-[#171717] hover:bg-white hover:bg-opacity-90 transition-colors" onClick={handleCategorySearch} disabled={loading}>카테고리 상품 검색</Button>
          </>
        )}
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
          </div>
        ) : mode === 'keyword' ? (
          <div>
            <div className="mb-2 flex gap-2">
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
        ) : null}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold">딥링크/상품 결과 <span className="text-sm text-gray-500 font-normal">({(mode === 'category' ? filteredCategoryResults : filteredResults).length})</span></h3>
            <div className="flex gap-2">
              <Button size="sm" variant={viewType === 'grid' ? 'default' : 'outline'} onClick={() => setViewType('grid')}>그리드</Button>
              <Button size="sm" variant={viewType === 'list' ? 'default' : 'outline'} onClick={() => setViewType('list')}>리스트</Button>
            </div>
          </div>
          {loading ? (
            <div className="flex h-48 w-full items-center justify-center">로딩 중...</div>
          ) : (
            <ul className={`${viewType === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4' : 'flex flex-col gap-2'} h-full w-full`}>
              {(mode === 'category' ? filteredCategoryResults : filteredResults).map((item, i) => (
                <li
                  key={i}
                  className={`${cardClass} ${selected.includes(item.productId || item.url) ? cardSelected : ''}`}
                  onClick={() => handleSelect(item.productId || item.url)}
                >
                  {(item.isRocket || item.rocketShipping) && (
                    <span className="absolute right-2 top-2 rounded bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">로켓</span>
                  )}
                  <div className="mb-2 flex flex-1 flex-col gap-2">
                    <span className="pr-10 font-bold line-clamp-2">{item.title || item.productName}</span>
                    <div className="border-t"></div>
                    <div className="text-sm text-gray-500">가격: <span className="font-semibold text-gray-800">{Number(item.price ?? item.productPrice).toLocaleString()}원</span></div>
                    <div className="border-t"></div>
                    {item.categoryName && <div className="text-xs text-gray-500">카테고리: {item.categoryName}</div>}
                    <div className="border-t"></div>
                    <div className="truncate text-xs text-blue-600">링크: <a href={item.url || item.productUrl || item.originalUrl} className="hover:underline" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>{item.url || item.productUrl || item.originalUrl}</a></div>
                  </div>
                  
                  {editIndex === i ? (
                    <div className="mt-auto flex gap-2">
                      <Input
                        value={editLink}
                        onChange={e => setEditLink(e.target.value)}
                        onClick={e => e.stopPropagation()}
                        onKeyDown={e => { e.stopPropagation(); if(e.key === 'Enter') handleEditLink(i, editLink); }}
                        autoFocus
                        className="h-8"
                      />
                      <Button size="sm" onClick={(e) => { e.stopPropagation(); handleEditLink(i, editLink); }}>저장</Button>
                      <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setEditIndex(null); }}>취소</Button>
                    </div>
                  ) : (
                    <Button size="sm" className="mt-auto w-full" onClick={e => { e.stopPropagation(); setEditIndex(i); setEditLink(item.url || item.originalUrl); }}>수정</Button>
                  )}
                </li>
              ))}
            </ul>
          )}
          {step === 'deeplink' && filteredResults.length > 0 && (
            <Button className="mt-4 w-full" onClick={handleDeeplinkConvert} disabled={loading || selected.length === 0}>선택 상품 딥링크 변환</Button>
          )}
        </div>
      </Card>
      {/* PC: 사이드 이력, 모바일: 버튼+모달 */}
      <div className="hidden md:block md:w-80 lg:w-96">
        <Card className="sticky top-24 p-4 hover:bg-white hover:bg-opacity-90 hover:shadow-md transition-colors bg-white text-[#171717]">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="font-bold">검색 이력</h4>
            <Button size="sm" variant="outline" className="px-2 py-1 text-xs" onClick={handleClearHistory}>이력 지우기</Button>
          </div>
          <ul className="max-h-[60vh] space-y-1 overflow-y-auto text-xs">
            {history.map((h, idx) => (
              <li key={idx} className="truncate cursor-pointer border-b pb-1 hover:bg-gray-100" onClick={() => setHistoryDetail(h)}>
                <span className="font-semibold">{h.keyword}</span> <span className="text-gray-500">{formatDate(h.date)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <div className="block md:hidden mt-4">
        <Button onClick={() => setShowHistory(true)} className="w-full">검색 이력 보기</Button>
        {showHistory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="mx-auto w-11/12 max-w-md rounded-lg bg-white p-4">
              <h4 className="font-bold mb-2">검색 이력</h4>
              <ul className="max-h-60 space-y-1 overflow-y-auto text-xs">
                {history.map((h, idx) => (
                  <li key={idx} className="truncate cursor-pointer border-b pb-1 hover:bg-gray-100" onClick={() => { setHistoryDetail(h); setShowHistory(false); }}>
                    <span className="font-semibold">{h.keyword}</span> <span className="text-gray-500">{formatDate(h.date)}</span>
                  </li>
                ))}
              </ul>
              <Button className="mt-2 w-full" variant="outline" onClick={handleClearHistory}>이력 지우기</Button>
              <Button className="mt-4 w-full" onClick={() => setShowHistory(false)}>닫기</Button>
            </div>
          </div>
        )}
      </div>
      {/* 상세 모달 */}
      {historyDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="relative mx-auto w-11/12 max-w-2xl rounded-lg bg-white p-6">
            <button className="absolute right-2 top-2 text-xl" onClick={() => setHistoryDetail(null)}>&times;</button>
            <h4 className="font-bold mb-2">검색 상세: <span className="text-blue-700">{historyDetail.keyword}</span> <span className="text-gray-500">{formatDate(historyDetail.date)}</span></h4>
            <ul className="grid max-h-[60vh] grid-cols-1 gap-4 overflow-y-auto md:grid-cols-2">
              {Array.isArray(historyDetail.results) && historyDetail.results.map((item, i) => (
                <li key={i} className="flex flex-col gap-2 rounded border p-2">
                  {item.image && <img src={item.image} alt={item.title} className="mx-auto h-32 w-32 rounded object-cover" />}
                  <div className="font-bold line-clamp-2">{item.title}</div>
                  <div>가격: {item.price?.toLocaleString()}원</div>
                  <div className="truncate overflow-hidden whitespace-nowrap max-w-full">링크: <a href={item.url} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer"><span className="inline-block max-w-[180px] align-bottom truncate">{item.url}</span></a></div>
                  {item.rocketShipping && <span className="rounded bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">로켓</span>}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
} 