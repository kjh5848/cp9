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
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold mb-4">{isEditing ? '페르소나 수정' : '새 페르소나 생성'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">페르소나 이름</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="예: 깐깐한 40대 맘카페 유저"
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">시스템 프롬프트 (역할 부여)</label>
            <textarea
              name="systemPrompt"
              value={formData.systemPrompt}
              onChange={handleChange}
              placeholder="예: 당신은 육아와 가전제품에 관심이 많은 깐깐한 40대 맘카페 유저입니다. 항상 가성비와 실제 후기를 중요하게 생각합니다."
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 h-24"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">톤앤매너 설명</label>
            <textarea
              name="toneDescription"
              value={formData.toneDescription}
              onChange={handleChange}
              placeholder="예: ~했어요, ~했지 뭐예요 같은 친근하고 부드러운 말투를 사용하세요. 가끔 이모지도 섞어 쓰세요😊"
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 h-24"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">금지 프롬프트 (옵션)</label>
            <textarea
              name="negativePrompt"
              value={formData.negativePrompt || ''}
              onChange={handleChange}
              placeholder="예: '안녕하세요 블로거입니다' 같은 기계적인 인사말은 절대 피하세요."
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 h-16"
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-2">
            {isEditing && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
              >
                취소
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? '저장 중...' : (isEditing ? '수정하기' : '생성하기')}
            </button>
          </div>
        </form>
      </div>

      {/* 목록 영역 */}
      <div>
        <h2 className="text-xl font-bold mb-4">등록된 페르소나 목록 ({personas.length})</h2>
        {isLoading && personas.length === 0 ? (
          <div className="text-gray-500">로딩 중...</div>
        ) : personas.length === 0 ? (
          <div className="text-gray-500 p-8 text-center bg-gray-50 rounded-xl border border-gray-100">
            아직 등록된 페르소나가 없습니다. 위쪽 폼에서 첫 페르소나를 생성해보세요!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {personas.map((persona) => (
              <div key={persona.id} className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-lg text-gray-900">{persona.name}</h3>
                  <div className="space-x-2 flex">
                    <button
                      onClick={() => handleEditClick(persona)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => deletePersona(persona.id)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      삭제
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-500 block mb-1">시스템 프롬프트</span>
                    <p className="text-gray-800 bg-gray-50 p-2 rounded text-xs leading-relaxed">
                      {persona.systemPrompt}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500 block mb-1">톤앤매너</span>
                    <p className="text-gray-800 bg-gray-50 p-2 rounded text-xs leading-relaxed">
                      {persona.toneDescription}
                    </p>
                  </div>
                  {persona.negativePrompt && (
                    <div>
                      <span className="font-medium text-gray-500 block mb-1">금지 문구</span>
                      <p className="text-red-800 bg-red-50 p-2 rounded text-xs leading-relaxed">
                        {persona.negativePrompt}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
