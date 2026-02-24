import { ResearchPack } from '../../../entities/research/model/types';

/**
 * 리서치 데이터를 저장하거나 업데이트합니다.
 */
export async function saveResearch(id: string, pack: ResearchPack): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/research/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pack),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '저장에 실패했습니다.');
    }

    return { success: true };
  } catch (error) {
    console.error('Save research error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '알 수 없는 에러가 발생했습니다.' 
    };
  }
}
