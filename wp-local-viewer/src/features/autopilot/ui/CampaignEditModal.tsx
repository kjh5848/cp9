import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Settings, Info } from 'lucide-react';
import type { CategoryCampaign } from '@/entities/campaign/model/types';

interface CampaignEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  campaign: CategoryCampaign | null;
  onUpdate: (id: string, payload: any) => Promise<boolean>;
}

export function CampaignEditModal({
  isOpen,
  onClose,
  isLoading,
  campaign,
  onUpdate,
}: CampaignEditModalProps) {
  const [batchSize, setBatchSize] = useState(15);
  const [targetAge, setTargetAge] = useState<string>('');
  const [targetGender, setTargetGender] = useState<string>('');
  const [targetPrice, setTargetPrice] = useState<string>('');
  const [targetIndustry, setTargetIndustry] = useState<string>('');
  
  const [textModel, setTextModel] = useState<string>('gpt-4o');
  const [imageModel, setImageModel] = useState<string>('dall-e-3');
  const [articleType, setArticleType] = useState<string>('auto');
  
  const [sortCriteria, setSortCriteria] = useState<string>('salePriceAsc');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [isRocketOnly, setIsRocketOnly] = useState<boolean>(false);

  useEffect(() => {
    if (campaign && isOpen) {
      setBatchSize(campaign.batchSize || 15);
      setTargetAge(campaign.targetAge || '');
      setTargetGender(campaign.targetGender || '');
      setTargetPrice(campaign.targetPrice || '');
      setTargetIndustry(campaign.targetIndustry || '');
      
      setTextModel(campaign.textModel || 'gpt-4o');
      setImageModel(campaign.imageModel || 'dall-e-3');
      setArticleType(campaign.articleType || 'auto');
      
      setSortCriteria(campaign.sortCriteria || 'salePriceAsc');
      setMinPrice(campaign.minPrice ? campaign.minPrice.toString() : '');
      setMaxPrice(campaign.maxPrice ? campaign.maxPrice.toString() : '');
      setIsRocketOnly(campaign.isRocketOnly || false);
    }
  }, [campaign, isOpen]);

  const handleUpdate = async () => {
    if (!campaign) return;

    const payload = {
      batchSize,
      targetAge: targetAge || null,
      targetGender: targetGender || null,
      targetPrice: targetPrice || null,
      targetIndustry: targetIndustry || null,
      textModel,
      imageModel,
      articleType,
      sortCriteria,
      minPrice,
      maxPrice,
      isRocketOnly,
    };

    const success = await onUpdate(campaign.id, payload);
    if (success) {
      onClose();
    }
  };

  if (!campaign) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] p-0 border-slate-700/50 bg-slate-900/95 backdrop-blur-xl">
        <div className="flex flex-col gap-4 bg-slate-800/40 p-5 md:p-6 rounded-xl">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-indigo-400">
              <Settings className="w-5 h-5" />
              캠페인 설정 수정
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-400">
            <span className="text-blue-400 font-bold">"{campaign.categoryName}"</span> 캠페인의 발행 규칙과 타겟팅 옵션을 수정합니다.
          </p>

          <div className="flex flex-col w-full md:w-40 mt-4">
            <span className="text-xs text-slate-500 mb-1">발행 대기열 보충 단위 (회당)</span>
            <Select value={batchSize.toString()} onValueChange={(v) => setBatchSize(Number(v))}>
              <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-200 h-10">
                <SelectValue placeholder="선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5개</SelectItem>
                <SelectItem value="10">10개</SelectItem>
                <SelectItem value="15">15개</SelectItem>
                <SelectItem value="20">20개</SelectItem>
                <SelectItem value="30">30개</SelectItem>
                <SelectItem value="50">50개</SelectItem>
                <SelectItem value="100">100개</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="pt-4 border-t border-slate-700/50 mt-2">
            <h4 className="text-sm font-semibold text-slate-300 mb-3">콘텐츠 타겟팅 (옵션)</h4>
            <p className="text-xs text-slate-400 mb-4">입력한 타겟팅 정보는 AI 리서치 프롬프트에 반영되며 결과 메타데이터에 저장됩니다.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 mb-1">타겟 연령</span>
                <Select value={targetAge || "none"} onValueChange={(v) => setTargetAge(v === "none" ? "" : v)}>
                  <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-200 h-10">
                    <SelectValue placeholder="선택안함" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">선택안함</SelectItem>
                    <SelectItem value="1020">10~20대 (1020)</SelectItem>
                    <SelectItem value="2030">20~30대 (2030)</SelectItem>
                    <SelectItem value="3040">30~40대 (3040)</SelectItem>
                    <SelectItem value="4050">40~50대 (4050)</SelectItem>
                    <SelectItem value="5060">50대 이상 (5060)</SelectItem>
                    <SelectItem value="전 연령">전 연령</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 mb-1">타겟 성별</span>
                <Select value={targetGender || "none"} onValueChange={(v) => setTargetGender(v === "none" ? "" : v)}>
                  <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-200 h-10">
                    <SelectValue placeholder="선택안함" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">선택안함</SelectItem>
                    <SelectItem value="남성">남성</SelectItem>
                    <SelectItem value="여성">여성</SelectItem>
                    <SelectItem value="남녀공용">남녀공용</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 mb-1">가격대</span>
                <Select value={targetPrice || "none"} onValueChange={(v) => setTargetPrice(v === "none" ? "" : v)}>
                  <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-200 h-10">
                    <SelectValue placeholder="선택안함" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">선택안함</SelectItem>
                    <SelectItem value="가성비">가성비 중심</SelectItem>
                    <SelectItem value="중저가">중저가</SelectItem>
                    <SelectItem value="프리미엄">프리미엄/고가</SelectItem>
                    <SelectItem value="상관없음">상관없음</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col">
                <span className="flex items-center gap-1.5 text-xs text-slate-500 mb-1 relative group">
                  주요 업종/관심사
                  <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden w-64 p-3 text-xs leading-relaxed text-slate-200 bg-slate-800 border border-slate-700/80 rounded-lg shadow-xl group-hover:block z-50">
                    <p className="font-semibold text-emerald-400 mb-1 flex items-center gap-1">💡 대분류와의 차이점</p>
                    <p className="mb-2"><strong className="text-white">대분류:</strong> 소싱할 상품의 물리적 카테고리 (예: 가전디지털)</p>
                    <p><strong className="text-white">업종/관심사:</strong> 글의 맥락과 타겟 독자. (예: '도서/취미' 선택 시 가전디지털 상품을 '취미용' 맥락으로 포스팅)</p>
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-800 border-b border-r border-slate-700/80 transform rotate-45"></div>
                  </div>
                </span>
                <Select value={targetIndustry || "none"} onValueChange={(v) => setTargetIndustry(v === "none" ? "" : v)}>
                  <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-200 h-10">
                    <SelectValue placeholder="선택안함" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">선택안함</SelectItem>
                    <SelectItem value="IT/전자기기">IT/전자기기</SelectItem>
                    <SelectItem value="패션/의류">패션/의류</SelectItem>
                    <SelectItem value="뷰티/화장품">뷰티/화장품</SelectItem>
                    <SelectItem value="식품/건강">식품/건강</SelectItem>
                    <SelectItem value="생활/주방">생활/주방</SelectItem>
                    <SelectItem value="가구/인테리어">가구/인테리어</SelectItem>
                    <SelectItem value="도서/취미">도서/취미</SelectItem>
                    <SelectItem value="스포츠/레저">스포츠/레저</SelectItem>
                    <SelectItem value="육아/아동">육아/아동</SelectItem>
                    <SelectItem value="반려동물">반려동물</SelectItem>
                    <SelectItem value="기타">기타</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-700/50 mt-4">
              <h4 className="text-sm font-semibold text-slate-300 mb-3 block">AI 모델 및 글 유형 설정</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col">
                  <span className="text-xs text-slate-500 mb-1">제목·본문 AI 모델</span>
                  <Select value={textModel} onValueChange={setTextModel}>
                    <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-200 h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4o">GPT-4 Omni</SelectItem>
                      <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                      <SelectItem value="claude-3.5-sonnet">Claude 3.5 Sonnet</SelectItem>
                      <SelectItem value="gemini-exp">Gemini Pro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-slate-500 mb-1">대표 이미지 AI 모델</span>
                  <Select value={imageModel} onValueChange={setImageModel}>
                    <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-200 h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dall-e-3">DALL-E 3</SelectItem>
                      <SelectItem value="flux-schnell">Flux Schnell</SelectItem>
                      <SelectItem value="none">사용 안함</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-slate-500 mb-1">작성 기준 (글 유형)</span>
                  <Select value={articleType} onValueChange={setArticleType}>
                    <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-200 h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">AI 자동 결정 (Auto)</SelectItem>
                      <SelectItem value="single">단일 상품 리뷰 (1개)</SelectItem>
                      <SelectItem value="compare">비교 분석 리뷰 (2개)</SelectItem>
                      <SelectItem value="list">큐레이션 리스트 (3개 이상)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-700/50 mt-4">
              <h4 className="text-sm font-semibold text-slate-300 mb-3 block">아이템 소싱 기준 설정</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="flex flex-col">
                  <span className="text-xs text-slate-500 mb-1">정렬 기준</span>
                  <Select value={sortCriteria} onValueChange={setSortCriteria}>
                    <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-200 h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="salePriceAsc">낮은 가격순</SelectItem>
                      <SelectItem value="salePriceDesc">높은 가격순</SelectItem>
                      <SelectItem value="ranking">쿠팡 랭킹순</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-xs text-slate-500 mb-1">최소 가격 (원)</span>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="최소 가격"
                    className="h-10 px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-sm text-slate-200 outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-slate-500 mb-1">최대 가격 (원)</span>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="최대 가격"
                    className="h-10 px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-sm text-slate-200 outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="flex flex-col justify-end pb-1.5">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${isRocketOnly ? 'bg-blue-600' : 'bg-slate-700'}`}>
                      <input 
                        type="checkbox"
                        disabled={false}
                        checked={isRocketOnly}
                        onChange={(e) => setIsRocketOnly(e.target.checked)}
                        className="sr-only" 
                      />
                      <span className={`pointer-events-none absolute left-0 inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isRocketOnly ? 'translate-x-4' : 'translate-x-0'}`} />
                    </div>
                    <span className="text-sm font-medium text-slate-300 group-hover:text-blue-400 transition-colors flex items-center gap-1.5">
                      <span className="text-blue-400 font-bold">로켓배송</span>만 검색
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          {/* 하단 버튼 블록 */}
          <div className="flex justify-end pt-4 mt-2 border-t border-slate-700/50 gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-slate-200 text-sm font-medium transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleUpdate}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-xl hover:from-blue-500 hover:to-indigo-500 focus:ring-4 focus:ring-blue-500/30 transition-all disabled:opacity-50"
            >
              저장하기
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
