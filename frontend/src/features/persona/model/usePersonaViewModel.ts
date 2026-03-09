import { useState, useCallback } from 'react';
import { Persona, CreatePersonaPayload, UpdatePersonaPayload, SYSTEM_PERSONAS } from '@/entities/persona/model/types';

export function usePersonaViewModel() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 리스트 패치
  const fetchPersonas = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/personas');
      if (!res.ok) throw new Error('Failed to fetch personas');
      const data = await res.json();
      if (data.success) {
        setPersonas(data.data);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 생성
  const createPersona = async (payload: CreatePersonaPayload) => {
    setIsLoading(true);
    setError(null);
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
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 수정
  const updatePersona = async (id: string, payload: UpdatePersonaPayload) => {
    setIsLoading(true);
    setError(null);
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
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 삭제
  const deletePersona = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까? 관련 큐 목록이 참조 중이라면 삭제되지 않을 수 있습니다.')) return false;
    
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/personas/${id}`, {
        method: 'DELETE',
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete persona');
      
      await fetchPersonas();
      return true;
    } catch (err: any) {
      setError(err.message);
      alert(err.message);
      return false;
    } finally {
      setIsLoading(false);
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
