import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Plus, ShoppingCart, Info, Loader2 } from 'lucide-react';
import { CATEGORY_TREE } from '@/shared/constants/categories';
import { CartKeywordLoader } from '@/features/keyword-extraction/ui/CartKeywordLoader';

interface CampaignCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  onCreate: (payload: any) => Promise<boolean>;
  
  personaId: string;
  themeId: string | null;
  intervalHours: string;
  publishTimes?: string;
  publishDays?: string;
  jitterMinutes?: string;
  dailyCap?: string;
  activeTimeStart: string;
  activeTimeEnd: string;
  publishTargets?: any[];
  textModel: string;
  imageModel: string;
  articleType: string;
  sortCriteria: string;
  minPrice: string;
  maxPrice: string;
  isRocketOnly: boolean;
  
  configNode: React.ReactNode;
  quickPresetNode: React.ReactNode;
  publishTargetNode?: React.ReactNode;
  
  depth1: string;
  setDepth1: (v: string) => void;
  depth2: string;
  setDepth2: (v: string) => void;
  depth3: string;
  setDepth3: (v: string) => void;
  customCategory: string;
  setCustomCategory: (v: string | ((prev: string) => string)) => void;
}

export function CampaignCreateModal({
  isOpen,
  onClose,
  isLoading,
  onCreate,
  personaId,
  themeId,
  intervalHours,
  publishTimes,
  publishDays,
  jitterMinutes,
  dailyCap,
  activeTimeStart,
  activeTimeEnd,
  publishTargets,
  textModel,
  imageModel,
  articleType,
  sortCriteria,
  minPrice,
  maxPrice,
  isRocketOnly,
  configNode,
  quickPresetNode,
  publishTargetNode,
  depth1,
  setDepth1,
  depth2,
  setDepth2,
  depth3,
  setDepth3,
  customCategory,
  setCustomCategory,
}: CampaignCreateModalProps) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [inputType, setInputType] = useState<'category' | 'custom'>('category');
  const [batchSize, setBatchSize] = useState(15);
  const [targetAge, setTargetAge] = useState<string>('');
  const [targetGender, setTargetGender] = useState<string>('');
  const [targetPrice, setTargetPrice] = useState<string>('');
  const [targetIndustry, setTargetIndustry] = useState<string>('');

  const depth1List = useMemo(() => CATEGORY_TREE.map(c => c.name), []);
  const depth2List = useMemo(() => {
    if (!depth1) return [];
    return CATEGORY_TREE.find(c => c.name === depth1)?.subtypes.map(s => s.name) || [];
  }, [depth1]);
  const depth3List = useMemo(() => {
    if (!depth1 || !depth2) return [];
    return CATEGORY_TREE.find(c => c.name === depth1)?.subtypes.find(s => s.name === depth2)?.details || [];
  }, [depth1, depth2]);

  const currentCategoryName = useMemo(() => {
    return [depth1, depth2, depth3].filter(Boolean).join(' > ');
  }, [depth1, depth2, depth3]);

  const isBasicConfigComplete = !!personaId && !!themeId && !!intervalHours && !!activeTimeStart && !!activeTimeEnd;

  const handleCreate = async () => {
    let finalCategoryName = '';
  
    if (inputType === 'category') {
      if (!depth1) return alert('대분류를 선택해주세요. (중분류/소분류는 선택사항입니다)');
      finalCategoryName = currentCategoryName;
    } else {
      if (!customCategory.trim()) return alert('캠페인을 지속할 제품이나 주제 키워드를 직접 입력해주세요.');
      finalCategoryName = customCategory.trim();
    }
    
    // 유효성 검증
    if (!personaId) return alert('페르소나를 선택해주세요.');
    if (!themeId) return alert('테마를 선택해주세요.');
    if (!intervalHours) return alert('발행 주기를 설정해주세요.');
    if (!activeTimeStart || !activeTimeEnd) return alert('활성 시간을 설정해주세요.');
    
    if (!publishTargets || publishTargets.length === 0) {
      return alert('발행 설정 정보가 없습니다. 마이페이지 기본 설정을 확인해주세요.');
    }
    const enabledTargets = publishTargets.filter((t: any) => t.enabled);
    if (enabledTargets.length === 0) {
      return alert('다중 플랫폼 발행 설정에서 최소 1개 이상의 플랫폼을 켜주세요(체크).');
    }
    for (const t of enabledTargets) {
      if (t.platform === 'google' && !t.meta?.blogId) {
        return alert('활성화된 구글 블로그의 블로그 ID가 누락되었습니다.');
      }
      if (t.platform === 'naver_cafe' && (!t.meta?.clubId || !t.meta?.menuId)) {
        return alert('활성화된 네이버 카페의 클럽 ID 또는 메뉴 ID가 누락되었습니다.');
      }
    }
    
    await onCreate({
      categoryName: finalCategoryName,
      personaId,
      themeId,
      intervalHours,
      publishTimes,
      publishDays,
      jitterMinutes,
      dailyCap,
      activeTimeStart,
      activeTimeEnd,
      batchSize,
      isAutoApprove: true,
      targetAge,
      targetGender,
      targetPrice,
      targetIndustry,
      textModel,
      imageModel,
      articleType,
      sortCriteria,
      minPrice,
      maxPrice,
      isRocketOnly,
      publishTargets
    });

    setDepth1('');
    setDepth2('');
    setDepth3('');
    setCustomCategory('');
    setTargetAge('');
    setTargetGender('');
    setTargetPrice('');
    setTargetIndustry('');
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] p-0 border-slate-700/50 bg-slate-900/95 backdrop-blur-xl">
          <div className="flex flex-col gap-4 bg-slate-800/40 p-5 p-6 rounded-xl">
            <DialogHeader className="mb-2">
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-400" />
                새 카테고리 / 주제 캠페인 생성
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-slate-400">
              "전자기기", "건강식품" 등의 카테고리를 선택하거나, 특정 제품 키워드를 직접 입력하여 AI가 부족한 스케줄 큐를 주기적으로 채워 넣도록 설정하세요.
            </p>
        
            <div className="flex bg-slate-900/50 p-1 rounded-lg w-fit border border-slate-700/50 mt-2">
              <button
                onClick={() => setInputType('category')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  inputType === 'category' ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                카테고리 트리 선택
              </button>
              <button
                onClick={() => setInputType('custom')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  inputType === 'custom' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                직접 입력 (자유 키워드)
              </button>
              
              <div className="flex-1" />
              
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="text-xs flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-md border border-emerald-500/30 ml-2"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                장바구니에서 불러오기
              </button>
            </div>

            <div className="flex flex-col md:flex-row items-end gap-3 mt-2">
              <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-3 gap-2">
                {inputType === 'category' ? (
                  <>
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-500 mb-1">대분류</span>
                      <Select 
                        value={depth1} 
                        onValueChange={(val) => { setDepth1(val); setDepth2(''); setDepth3(''); }}
                      >
                        <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-200">
                          <SelectValue placeholder="선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {depth1List.map(name => (
                            <SelectItem key={name} value={name}>{name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-500 mb-1">중분류 (선택)</span>
                      <Select 
                        value={depth2 || "none"} 
                        onValueChange={(val) => { setDepth2(val === "none" ? "" : val); setDepth3(''); }}
                        disabled={!depth1}
                      >
                        <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-200">
                          <SelectValue placeholder="선택 (옵션)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">선택안함</SelectItem>
                          {depth2List.map(name => (
                            <SelectItem key={name} value={name}>{name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-500 mb-1">소분류 (선택)</span>
                      <Select 
                        value={depth3} 
                        onValueChange={setDepth3}
                        disabled={!depth2}
                      >
                        <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-200">
                          <SelectValue placeholder="선택 (옵션)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">선택안함</SelectItem>
                          {depth3List.map(name => (
                            <SelectItem key={name} value={name}>{name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                ) : (
                  <div className="col-span-3 flex flex-col">
                    <span className="text-xs text-slate-500 mb-1">캠페인 키워드 / 제품명</span>
                    <input
                      type="text"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="무한 스케줄링할 자유 제품명 (예: 아이폰 16 맥세이프 케이스)"
                      className="bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-md px-3 py-2 outline-none focus:border-indigo-500 transition-colors w-full"
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-col w-full md:w-40">
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
            </div>

            <div className="py-4 border-t border-slate-800/50 mt-2">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-semibold text-slate-300">공통 스케줄 및 디자인 설정</h4>
                {quickPresetNode}
              </div>
              {configNode}
            </div>

            {publishTargetNode ? (
              <div className="pt-4 border-t border-slate-800/50 mt-2">
                 <h4 className="text-sm font-semibold text-slate-300 mb-3">다중 플랫폼 발행 설정</h4>
                {publishTargetNode}
              </div>
            ) : null}

            <div className="flex justify-end pt-4 mt-2 border-t border-slate-700/50 gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-slate-400 hover:text-slate-200 text-sm font-medium transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleCreate}
                disabled={isLoading || !isBasicConfigComplete || (inputType === 'category' && !depth1) || (inputType === 'custom' && !customCategory.trim())}
                title={!isBasicConfigComplete ? "공통 스케줄 및 디자인 설정을 모두 완료해주세요." : ""}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-xl hover:from-blue-500 hover:to-indigo-500 focus:ring-4 focus:ring-blue-500/30 transition-all disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                캠페인 등록
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <CartKeywordLoader
        isOpen={isCartOpen}
        onOpenChange={setIsCartOpen}
        maxSelection={10}
        onLoad={(kws) => {
          if (kws.length > 0) {
            setInputType('custom');
            const addedTerms = kws.map(k => k.keyword).join(', ');
            setCustomCategory((prev: string) => prev ? `${prev}, ${addedTerms}` : addedTerms);
          }
        }}
      />
    </>
  );
}
