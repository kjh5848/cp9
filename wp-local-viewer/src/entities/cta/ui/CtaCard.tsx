import React from 'react';
import type { CtaData } from '../model/types';

interface CtaCardProps {
  data: CtaData;
}

/**
 * [FSD Entity] 순수 View를 담당하는 Dumb Component
 * 부수 효과(API, State) 없이 오직 UI 렌더링만 수행합니다.
 * 조건부 렌더링 시 && 대신 ? : null 판별을 사용하여 UI 깨짐을 방지합니다.
 */
export const CtaCard: React.FC<CtaCardProps> = ({ data }) => {
  const {
    productUrl,
    productName = '추천 상품',
    copyText = '지금 바로 확인하세요!',
    buttonText = '최저가 확인하기',
    imageUrl,
    price,
    isRocket = false,
    themeType = 'A',
  } = data;

  const displayPrice = price ? `${price.toLocaleString()}원` : null;

// Type A: 프로모션 정보 카드형 (Vercel Commerce / Sleek Light Mode)
  if (themeType === 'A') {
    return (
      <a
        href={productUrl}
        target="_blank"
        rel="nofollow noopener noreferrer"
        className="flex flex-col sm:flex-row items-center gap-5 p-6 my-8 bg-white border border-black/5 rounded-[20px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 group no-underline font-['Pretendard','Inter',sans-serif]"
      >
        {imageUrl ? (
          <div className="shrink-0 rounded-[14px] overflow-hidden bg-[#fafafa] p-2 border border-black/5">
            <img
              src={imageUrl}
              alt={productName}
              className="w-[130px] h-[130px] object-contain rounded-lg group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        ) : null}
        <div className="flex-1 min-w-[200px] flex flex-col items-start w-full">
          <p className="text-[13px] font-bold text-slate-500 mb-1 uppercase tracking-wide">⭐ BEST PICK</p>
          <h3 className="text-[18px] font-bold text-slate-900 leading-[1.4] tracking-tight line-clamp-2 mb-2">
            {productName}
          </h3>
          {displayPrice ? (
            <div className="text-[20px] font-extrabold text-black mb-5 flex items-center gap-2">
              {displayPrice}
              {isRocket ? (
                <span className="text-[12px] font-extrabold text-blue-600 tracking-tight bg-blue-50 px-2 py-1 rounded-md">
                  🚀 로켓배송
                </span>
              ) : null}
            </div>
          ) : (
            <p className="text-[14px] text-slate-600 mb-5 leading-relaxed">{copyText}</p>
          )}
          <div className="inline-flex items-center justify-center bg-black text-white font-bold text-[15px] px-7 py-[14px] rounded-full shadow-[0_4px_14px_rgba(0,0,0,0.15)] border border-white/5 transition-all duration-200 group-hover:bg-gray-900 group-hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)] group-hover:-translate-y-[2px]">
            {buttonText} <span className="ml-2 text-base">↗</span>
          </div>
        </div>
      </a>
    );
  }

  // Type B: 긴급성 및 FOMO 유발형 (Apple Event / Deep Black Glow Style)
  if (themeType === 'B') {
    return (
      <div className="relative p-8 my-10 bg-[#09090b] border border-white/10 rounded-[24px] text-center overflow-hidden shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] font-['Pretendard','Inter',sans-serif]">
        {/* 오로라 앰비언트 백그라운드 */}
        <div className="absolute -top-[50px] left-1/2 -translate-x-1/2 w-[200px] h-[100px] bg-gradient-to-br from-[#FF0080] to-[#7928CA] blur-[60px] opacity-30 pointer-events-none" />
        
        <div className="inline-block bg-gradient-to-br from-[#FF0080] to-[#7928CA] bg-clip-text text-transparent text-[14px] font-extrabold tracking-widest mb-2 relative z-10">
          🚨 LIMITED OFFER
        </div>
        <h3 className="text-[20px] font-bold text-white leading-[1.4] tracking-tight mb-6 relative z-10">
          {productName}
        </h3>
        
        {imageUrl ? (
          <div className="bg-white rounded-[16px] p-4 inline-block mb-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)] relative z-10">
            <img
              src={imageUrl}
              alt={productName}
              className="h-[180px] object-contain rounded-lg contrast-105 block"
            />
          </div>
        ) : null}
        
        {displayPrice ? (
          <div className="flex items-baseline justify-center gap-2 mb-6 relative z-10">
            <span className="text-[28px] font-extrabold text-white">{displayPrice}</span>
            {isRocket ? (
              <span className="text-[15px] font-bold text-indigo-300">🚀 로켓</span>
            ) : null}
          </div>
        ) : (
          <p className="text-slate-300 mb-6 relative z-10">{copyText}</p>
        )}
        
        <a
          href={productUrl}
          target="_blank"
          rel="nofollow noopener noreferrer"
          className="block w-full bg-gradient-to-br from-[#FF0080] to-[#7928CA] text-white font-extrabold text-[16px] py-[18px] px-6 rounded-[16px] shadow-[0_12px_24px_-8px_rgba(255,0,128,0.4)] border border-white/20 relative z-10 transition-transform duration-300 hover:scale-[1.02] no-underline"
        >
          가장 먼저 혜택 확보하기를 누르세요
        </a>
      </div>
    );
  }

  // Type C: 네이티브 결합형 (Minimalist Glassmorphism Inline)
  return (
    <div className="my-8 p-6 bg-slate-50/80 backdrop-blur-md border border-black/5 rounded-[20px] font-['Pretendard','Inter',sans-serif]">
      <div className="flex gap-3 mb-5 items-start">
        <div className="flex items-center justify-center w-6 h-6 bg-black text-white rounded-full text-xs shrink-0 mt-0.5">💬</div>
        <p className="text-[15px] text-slate-700 leading-relaxed italic m-0">
          <strong>에디터 코멘트:</strong> "{copyText}"
        </p>
      </div>
      
      <div className="flex items-center gap-4 bg-white p-4 rounded-[16px] border border-black/5 shadow-[0_4px_12px_rgba(0,0,0,0.02)] flex-wrap">
        {imageUrl ? (
          <div className="bg-slate-50 rounded-[10px] p-1.5 shrink-0">
            <img
              src={imageUrl}
              alt={productName}
              className="w-14 h-14 object-contain"
            />
          </div>
        ) : null}
        <div className="flex-1 min-w-[150px]">
          <p className="text-[14px] font-bold text-slate-900 line-clamp-1 mb-1.5">
            {productName}
          </p>
          {displayPrice ? (
            <p className="text-[15px] font-extrabold text-black flex items-center gap-1 m-0">
              {displayPrice} {isRocket ? <span className="text-blue-600">🚀</span> : null}
            </p>
          ) : null}
        </div>
        <a
          href={productUrl}
          target="_blank"
          rel="nofollow noopener noreferrer"
          className="bg-transparent text-black px-5 py-2.5 rounded-full text-[14px] font-bold border-[1.5px] border-black transition-all hover:bg-black hover:text-white shrink-0 no-underline"
        >
          상세 정보 ↗
        </a>
      </div>
    </div>
  );
};
