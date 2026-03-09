'use client';

import React, { useEffect, useState } from 'react';
import { useAutopilotViewModel } from '../model/useAutopilotViewModel';
import { usePersonaViewModel } from '@/features/persona/model/usePersonaViewModel';

export function AutopilotDashboard() {
  const {
    queue,
    isLoading: isQueueLoading,
    error: queueError,
    fetchQueue,
    addToQueue,
    deleteFromQueue,
    triggerCronManually
  } = useAutopilotViewModel();

  const {
    personas,
    fetchPersonas
  } = usePersonaViewModel();

  const [keyword, setKeyword] = useState('');
  const [personaId, setPersonaId] = useState('');

  useEffect(() => {
    fetchQueue();
    fetchPersonas();
  }, [fetchQueue, fetchPersonas]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword) return;

    const payload = {
      keyword,
      personaId: personaId || undefined
    };

    const success = await addToQueue(payload);
    if (success) {
      setKeyword('');
      setPersonaId('');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full border border-yellow-200">대기 중</span>;
      case 'PROCESSING':
        return <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full border border-blue-200">처리 중</span>;
      case 'COMPLETED':
        return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full border border-green-200">완료됨</span>;
      case 'FAILED':
        return <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full border border-red-200">실패</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">{status}</span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* 액션 및 폼 영역 */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">새 아이템 큐(Queue)에 추가하기</h2>
          <button
            onClick={triggerCronManually}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm transition-colors"
          >
            임의 자동 발행(Cron) 실행 (테스트용)
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">키워드 (검색어)</label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="예: 다이슨 청소기 추천"
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">적용할 페르소나 (선택)</label>
            <select
              value={personaId}
              onChange={(e) => setPersonaId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">기본 IT 페르소나 사용</option>
              {personas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={isQueueLoading || !keyword}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 h-[42px]"
          >
            {isQueueLoading ? '추가 중...' : '큐에 담기'}
          </button>
        </form>
        {queueError && <p className="mt-2 text-sm text-red-600">{queueError}</p>}
      </div>

      {/* 큐 리스트 영역 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">현재 대기/처리 큐 목록</h2>
          <span className="text-sm text-gray-500">총 {queue.length}건</span>
        </div>
        
        {isQueueLoading && queue.length === 0 ? (
          <div className="p-8 text-center text-gray-500">목록을 불러오는 중...</div>
        ) : queue.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            현재 자동 수집/발행을 대기 중인 키워드가 없습니다.<br/>
            위 폼에서 새로운 키워드를 큐에 추가해주세요.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    등록 일자
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    대상 키워드
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    페르소나
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    비고 메시지
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {queue.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.keyword}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {item.persona?.name || '기본 IT 페르소나'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {item.errorMessage || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => deleteFromQueue(item.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
