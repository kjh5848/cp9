import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ThemeConfig, ArticleTheme } from '@/entities/design/model/types';
import { getDefaultConfig } from './constants';

/**
 * ViewModel 반환 타입 정의
 */
interface UseDesignViewModelReturn {
  // 상태
  themes: ArticleTheme[];
  selectedThemeId: string | null;
  themeName: string;
  config: ThemeConfig;
  activeTab: string;
  saving: boolean;
  loading: boolean;
  router: ReturnType<typeof useRouter>;

  // 액션
  actions: {
    setThemeName: (name: string) => void;
    setActiveTab: (tab: string) => void;
    selectTheme: (theme: ArticleTheme) => void;
    updateConfig: <K extends keyof ThemeConfig>(section: K, updates: Partial<ThemeConfig[K]>) => void;
    handleSave: () => Promise<void>;
    handleSetDefault: () => Promise<void>;
    handleDelete: () => Promise<void>;
    handleNewTheme: () => void;
  };
}

/**
 * [Features/DesignTheme Layer]
 * 아티클 디자인 테마의 상태 관리와 비즈니스 로직(API 통신)을 담당하는 ViewModel 훅입니다.
 */
export const useDesignViewModel = (): UseDesignViewModelReturn => {
  const router = useRouter();
  const [themes, setThemes] = useState<ArticleTheme[]>([]);
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);
  const [themeName, setThemeName] = useState('');
  const [config, setConfig] = useState<ThemeConfig>(getDefaultConfig());
  const [activeTab, setActiveTab] = useState('heading');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // ── 테마 선택 ──
  const selectTheme = useCallback((theme: ArticleTheme) => {
    setSelectedThemeId(theme.id);
    setThemeName(theme.name);
    try {
      setConfig(JSON.parse(theme.config));
    } catch {
      setConfig(getDefaultConfig());
    }
  }, []);

  // ── 테마 목록 로드 ──
  const fetchThemes = useCallback(async () => {
    try {
      const res = await fetch('/api/design');
      const data = await res.json();
      setThemes(data.themes || []);
      // 기본 테마 자동 선택
      if (data.themes?.length > 0) {
        const defaultTheme = data.themes.find((t: ArticleTheme) => t.isDefault) || data.themes[0];
        selectTheme(defaultTheme);
      }
    } catch (err) {
      console.error('테마 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  }, [selectTheme]);

  useEffect(() => { fetchThemes(); }, [fetchThemes]);

  // ── config 부분 업데이트 ──
  const updateConfig = useCallback(<K extends keyof ThemeConfig>(section: K, updates: Partial<ThemeConfig[K]>) => {
    setConfig(prev => ({
      ...prev,
      [section]: { ...prev[section], ...updates },
    }));
  }, []);

  // ── 저장 ──
  const handleSave = useCallback(async () => {
    if (!themeName.trim()) {
      toast.error('테마 이름을 입력해주세요.');
      return;
    }
    setSaving(true);
    try {
      const method = selectedThemeId ? 'PUT' : 'POST';
      const body = {
        ...(selectedThemeId && { id: selectedThemeId }),
        name: themeName.trim(),
        config: JSON.stringify(config),
      };
      const res = await fetch('/api/design', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('저장 실패');
      const data = await res.json();
      toast.success('테마가 저장되었습니다!');
      setSelectedThemeId(data.theme.id);
      await fetchThemes();
    } catch (err) {
      toast.error('저장에 실패했습니다.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  }, [themeName, selectedThemeId, config, fetchThemes]);

  // ── 기본 테마로 설정 ──
  const handleSetDefault = useCallback(async () => {
    if (!selectedThemeId) return;
    try {
      await fetch('/api/design', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedThemeId, isDefault: true }),
      });
      toast.success('기본 테마로 설정되었습니다.');
      await fetchThemes();
    } catch {
      toast.error('설정에 실패했습니다.');
    }
  }, [selectedThemeId, fetchThemes]);

  // ── 삭제 ──
  const handleDelete = useCallback(async () => {
    if (!selectedThemeId) return;
    if (!confirm('이 테마를 삭제하시겠습니까?')) return;
    try {
      await fetch(`/api/design?id=${selectedThemeId}`, { method: 'DELETE' });
      toast.success('테마가 삭제되었습니다.');
      setSelectedThemeId(null);
      setThemeName('');
      setConfig(getDefaultConfig());
      await fetchThemes();
    } catch {
      toast.error('삭제에 실패했습니다.');
    }
  }, [selectedThemeId, fetchThemes]);

  // ── 새 테마 ──
  const handleNewTheme = useCallback(() => {
    setSelectedThemeId(null);
    setThemeName('새 테마');
    setConfig(getDefaultConfig());
  }, []);

  return {
    themes,
    selectedThemeId,
    themeName,
    config,
    activeTab,
    saving,
    loading,
    router,
    actions: {
      setThemeName,
      setActiveTab,
      selectTheme,
      updateConfig,
      handleSave,
      handleSetDefault,
      handleDelete,
      handleNewTheme,
    },
  };
};
