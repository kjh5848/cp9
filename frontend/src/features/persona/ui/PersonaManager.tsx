'use client';

import React, { useEffect, useState } from 'react';
import { usePersonaViewModel } from '../model/usePersonaViewModel';
import { Persona, CreatePersonaPayload } from '@/entities/persona/model/types';

export function PersonaManager() {
  const {
    personas,
    isLoading,
    error,
    fetchPersonas,
    createPersona,
    updatePersona,
    deletePersona,
  } = usePersonaViewModel();

  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreatePersonaPayload>({
    name: '',
    systemPrompt: '',
    toneDescription: '',
    negativePrompt: '',
  });

  useEffect(() => {
    fetchPersonas();
  }, [fetchPersonas]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditClick = (persona: Persona) => {
    setIsEditing(persona.id);
    setFormData({
      name: persona.name,
      systemPrompt: persona.systemPrompt,
      toneDescription: persona.toneDescription,
      negativePrompt: persona.negativePrompt || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDuplicateClick = (persona: Persona) => {
    setIsEditing(null); // 신규 생성 모드
    setFormData({
      name: `${persona.name} (커스텀)`,
      systemPrompt: persona.systemPrompt,
      toneDescription: persona.toneDescription,
      negativePrompt: persona.negativePrompt || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setIsEditing(null);
    setFormData({ name: '', systemPrompt: '', toneDescription: '', negativePrompt: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      const success = await updatePersona(isEditing, formData);
      if (success) {
        handleCancelEdit();
      }
    } else {
      const success = await createPersona(formData);
      if (success) {
        handleCancelEdit();
      }
    }
  };

  if (error) {
    return <div className="p-4 bg-red-900/20 border border-red-500/20 text-red-400 rounded-xl font-medium tracking-tight">오류: {error}</div>;
  }

  return (
    <div className="space-y-8">
      {/* 폼 영역 */}
      <div className="bg-slate-900/50 rounded-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_8px_20px_rgba(0,0,0,0.2)] border border-slate-800/50 overflow-hidden relative backdrop-blur-xl p-8">
        <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />
        <h2 className="text-xl font-bold font-syne tracking-tight text-white mb-6 relative z-10 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
          {isEditing ? '페르소나 수정' : '새 페르소나 생성'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5 tracking-tight">페르소나 이름</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="예: 깐깐한 40대 맘카페 유저"
              className="w-full p-3 bg-slate-950/50 border border-slate-800/50 rounded-xl focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-200 placeholder:text-slate-600 outline-none shadow-inner"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5 tracking-tight">시스템 프롬프트 (역할 부여)</label>
            <textarea
              name="systemPrompt"
              value={formData.systemPrompt}
              onChange={handleChange}
              placeholder="예: 당신은 육아와 가전제품에 관심이 많은 깐깐한 40대 맘카페 유저입니다. 항상 가성비와 실제 후기를 중요하게 생각합니다."
              className="w-full p-3 bg-slate-950/50 border border-slate-800/50 rounded-xl focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-200 placeholder:text-slate-600 outline-none shadow-inner h-24 resize-none leading-relaxed"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5 tracking-tight">톤앤매너 설명</label>
            <textarea
              name="toneDescription"
              value={formData.toneDescription}
              onChange={handleChange}
              placeholder="예: ~했어요, ~했지 뭐예요 같은 친근하고 부드러운 말투를 사용하세요. 가끔 이모지도 섞어 쓰세요😊"
              className="w-full p-3 bg-slate-950/50 border border-slate-800/50 rounded-xl focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-200 placeholder:text-slate-600 outline-none shadow-inner h-24 resize-none leading-relaxed"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5 tracking-tight">금지 프롬프트 (옵션)</label>
            <textarea
              name="negativePrompt"
              value={formData.negativePrompt || ''}
              onChange={handleChange}
              placeholder="예: '안녕하세요 블로거입니다' 같은 기계적인 인사말은 절대 피하세요."
              className="w-full p-3 bg-slate-950/50 border border-slate-800/50 rounded-xl focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-200 placeholder:text-slate-600 outline-none shadow-inner h-16 resize-none leading-relaxed"
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800/50 mt-6 pt-6">
            {isEditing ? (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-5 py-2.5 text-sm font-medium text-slate-300 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:bg-slate-700 transition-colors hover:text-white"
              >
                취소
              </button>
            ) : null}
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-500 disabled:opacity-50 shadow-[inset_0_1px_0px_rgba(255,255,255,0.2),0_4px_10px_rgba(37,99,235,0.2)] active:scale-[0.98] transition-all flex items-center gap-2"
            >
              {isLoading ? '저장 중...' : (isEditing ? '수정 내용 저장' : '새 페르소나 만들기')}
            </button>
          </div>
        </form>
      </div>

      {/* 목록 영역 */}
      <div className="bg-slate-900/50 rounded-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_8px_20px_rgba(0,0,0,0.2)] border border-slate-800/50 overflow-hidden relative backdrop-blur-xl p-8">
        <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none"></div>
        <h2 className="text-xl font-bold font-syne tracking-tight text-white mb-6 relative z-10 flex items-center gap-2">
           <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
           등록된 페르소나 뱅크 ({personas.length})
        </h2>
        <div className="relative z-10">
          {isLoading && personas.length === 0 ? (
            <div className="text-slate-400 text-center py-12 flex justify-center items-center flex-col gap-4">
              <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
              데이터를 불러오는 중입니다...
            </div>
          ) : personas.length === 0 ? (
            <div className="text-slate-400 p-12 text-center bg-slate-800/30 rounded-xl border border-slate-800/50 font-medium tracking-tight">
              아직 등록된 페르소나가 없습니다. 위쪽 폼에서 첫 페르소나를 생성해보세요!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {personas.map((persona) => (
                <div key={persona.id} className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700/50 hover:bg-slate-800/50 hover:border-slate-600/50 transition-all group backdrop-blur-sm">
                  <div className="flex justify-between items-start mb-5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-lg text-slate-100 tracking-tight group-hover:text-blue-400 transition-colors">{persona.name}</h3>
                      {persona.isSystem ? (
                        <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-widest shadow-[inset_0_0_8px_rgba(59,130,246,0.1)]">System</span>
                      ) : null}
                    </div>
                    <div className="space-x-3 flex items-center ml-2">
                      <button
                        onClick={() => handleDuplicateClick(persona)}
                        className="text-[13px] font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        복제
                      </button>
                      {!persona.isSystem ? (
                        <>
                          <button
                            onClick={() => handleEditClick(persona)}
                            className="text-[13px] font-medium text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            수정
                          </button>
                          <button
                            onClick={() => deletePersona(persona.id)}
                            className="text-[13px] font-medium text-red-400 hover:text-red-300 transition-colors"
                          >
                            삭제
                          </button>
                        </>
                      ) : null}
                    </div>
                  </div>
                  
                  <div className="space-y-4 text-sm mt-2">
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/50 shadow-inner">
                      <span className="font-semibold text-slate-400 block mb-2 text-xs tracking-wider uppercase">System Prompt</span>
                      <p className="text-slate-300 text-[13px] leading-relaxed break-words whitespace-pre-wrap">
                        {persona.systemPrompt}
                      </p>
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/50 shadow-inner">
                      <span className="font-semibold text-slate-400 block mb-2 text-xs tracking-wider uppercase">Tone & Manner</span>
                      <p className="text-slate-300 text-[13px] leading-relaxed break-words whitespace-pre-wrap">
                        {persona.toneDescription}
                      </p>
                    </div>
                    {persona.negativePrompt ? (
                      <div className="bg-red-950/20 p-4 rounded-xl border border-red-900/30 shadow-inner">
                        <span className="font-semibold text-red-400/80 block mb-2 text-xs tracking-wider uppercase">Negative</span>
                        <p className="text-red-300/90 text-[13px] leading-relaxed break-words whitespace-pre-wrap">
                          {persona.negativePrompt}
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
