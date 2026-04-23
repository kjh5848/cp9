import { useState } from 'react';
import useSWR from 'swr';
import { Persona, CreatePersonaPayload, UpdatePersonaPayload, SYSTEM_PERSONAS } from '@/entities/persona/model/types';

const fetcher = (url: string) => fetch(url).then(async (res) => {
  if (!res.ok) throw new Error('Failed to fetch personas');
  const data = await res.json();
  if (data.success) return data.data;
  throw new Error(data.error);
});

export function usePersonaViewModel() {
  const { data: personas = [], error: swrError, isLoading: swrIsLoading, mutate: fetchPersonas } = useSWR<Persona[]>('/api/personas', fetcher);

  const [isMutating, setIsMutating] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const isLoading = swrIsLoading || isMutating;
  const error = swrError?.message || mutationError;

  // 생성
  const createPersona = async (payload: CreatePersonaPayload) => {
    setIsMutating(true);
    setMutationError(null);
    try {
      const res = await fetch('/api/personas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to create persona');
      await fetchPersonas();
      return true;
    } catch (err: any) {
      setMutationError(err.message);
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  // 수정
  const updatePersona = async (id: string, payload: UpdatePersonaPayload) => {
    setIsMutating(true);
    setMutationError(null);
    try {
      const res = await fetch(`/api/personas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to update persona');
      await fetchPersonas();
      return true;
    } catch (err: any) {
      setMutationError(err.message);
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  // 삭제
  const deletePersona = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까? 관련 큐 목록이 참조 중이라면 삭제되지 않을 수 있습니다.')) return false;
    
    setIsMutating(true);
    setMutationError(null);
    try {
      const res = await fetch(`/api/personas/${id}`, {
        method: 'DELETE',
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete persona');
      
      await fetchPersonas();
      return true;
    } catch (err: any) {
      setMutationError(err.message);
      alert(err.message);
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  return {
    personas,
    isLoading,
    error,
    fetchPersonas,
    createPersona,
    updatePersona,
    deletePersona,
  };
}
