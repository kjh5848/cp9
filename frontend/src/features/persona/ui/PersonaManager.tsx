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
    return <div className="p-4 bg-red-50 text-red-600 rounded">오류: {error}</div>;
  }

  return (
    <div className="space-y-8">
      {/* 폼 영역 */}
      <div className="bg-white rounded-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_8px_20px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden relative backdrop-blur-xl p-6">
        <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none"></div>
        <h2 className="text-xl font-bold font-syne tracking-tight text-gray-900 mb-6 relative z-10">
          {isEditing ? '페르소나 수정' : '새 페르소나 생성'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 tracking-tight">페르소나 이름</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="예: 깐깐한 40대 맘카페 유저"
              className="w-full p-2.5 bg-gray-50/50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 tracking-tight">시스템 프롬프트 (역할 부여)</label>
            <textarea
              name="systemPrompt"
              value={formData.systemPrompt}
              onChange={handleChange}
              placeholder="예: 당신은 육아와 가전제품에 관심이 많은 깐깐한 40대 맘카페 유저입니다. 항상 가성비와 실제 후기를 중요하게 생각합니다."
              className="w-full p-2.5 bg-gray-50/50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors h-24"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 tracking-tight">톤앤매너 설명</label>
            <textarea
              name="toneDescription"
              value={formData.toneDescription}
              onChange={handleChange}
              placeholder="예: ~했어요, ~했지 뭐예요 같은 친근하고 부드러운 말투를 사용하세요. 가끔 이모지도 섞어 쓰세요😊"
              className="w-full p-2.5 bg-gray-50/50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors h-24"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 tracking-tight">금지 프롬프트 (옵션)</label>
            <textarea
              name="negativePrompt"
              value={formData.negativePrompt || ''}
              onChange={handleChange}
              placeholder="예: '안녕하세요 블로거입니다' 같은 기계적인 인사말은 절대 피하세요."
              className="w-full p-2.5 bg-gray-50/50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors h-16"
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            {isEditing ? (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
            ) : null}
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 shadow-[inset_0_1px_0px_rgba(255,255,255,0.2)] active:scale-[0.98] transition-all"
            >
              {isLoading ? '저장 중...' : (isEditing ? '수정하기' : '생성하기')}
            </button>
          </div>
        </form>
      </div>

      {/* 목록 영역 */}
      <div className="bg-white rounded-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_8px_20px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden relative backdrop-blur-xl p-8">
        <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none"></div>
        <h2 className="text-xl font-bold font-syne tracking-tight text-gray-900 mb-6 relative z-10">등록된 페르소나 목록 ({personas.length})</h2>
        <div className="relative z-10">
          {isLoading && personas.length === 0 ? (
            <div className="text-gray-500 text-center py-8">데이터를 불러오는 중입니다...</div>
          ) : personas.length === 0 ? (
            <div className="text-gray-500 p-12 text-center bg-gray-50/80 rounded-xl border border-gray-100 font-medium tracking-tight">
              아직 등록된 페르소나가 없습니다. 위쪽 폼에서 첫 페르소나를 생성해보세요!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {personas.map((persona) => (
                <div key={persona.id} className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg text-gray-900 tracking-tight">{persona.name}</h3>
                      {persona.isSystem ? (
                        <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider">System</span>
                      ) : null}
                    </div>
                    <div className="space-x-3 flex">
                      <button
                        onClick={() => handleDuplicateClick(persona)}
                        className="text-sm font-medium text-emerald-600 hover:text-emerald-800 transition-colors"
                      >
                        복제
                      </button>
                      {!persona.isSystem ? (
                        <>
                          <button
                            onClick={() => handleEditClick(persona)}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            수정
                          </button>
                          <button
                            onClick={() => deletePersona(persona.id)}
                            className="text-sm font-medium text-red-500 hover:text-red-700 transition-colors"
                          >
                            삭제
                          </button>
                        </>
                      ) : null}
                    </div>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-semibold text-gray-600 block mb-1">시스템 프롬프트</span>
                      <p className="text-gray-700 bg-gray-50/80 p-3 rounded-lg text-xs leading-relaxed border border-gray-100">
                        {persona.systemPrompt}
                      </p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-600 block mb-1">톤앤매너</span>
                      <p className="text-gray-700 bg-gray-50/80 p-3 rounded-lg text-xs leading-relaxed border border-gray-100">
                        {persona.toneDescription}
                      </p>
                    </div>
                    {persona.negativePrompt ? (
                      <div>
                        <span className="font-semibold text-gray-600 block mb-1">금지 문구</span>
                        <p className="text-red-700 bg-red-50 p-3 rounded-lg text-xs leading-relaxed border border-red-100">
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
