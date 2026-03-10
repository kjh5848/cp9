"use client";

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import { ThemeConfig, ArticleTheme } from '@/entities/design/model/types';
import { getDefaultConfig, PRESET_THEME_NAMES, createMigratedBlocks } from './constants';

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
  showDeleteConfirm: boolean;
  isPublishModeOpen: boolean;
  /** 현재 선택된 테마가 프리셋(읽기전용)인지 여부 */
  isPresetTheme: boolean;
  router: ReturnType<typeof useRouter>;

  // 액션
  actions: {
    setThemeName: (name: string) => void;
    setActiveTab: (tab: string) => void;
    selectTheme: (theme: ArticleTheme) => void;
    updateConfig: <K extends keyof ThemeConfig>(section: K, updates: Partial<ThemeConfig[K]>) => void;
    handleSave: () => Promise<void>;
    handleSetDefault: () => Promise<void>;
    handleDelete: () => void;
    confirmDelete: () => Promise<void>;
    cancelDelete: () => void;
    handleNewTheme: () => void;
    handleDuplicate: () => Promise<void>;
    handleExport: () => void;
    handleImport: () => void;
    handleReset: () => void;
    setPublishModeOpen: (open: boolean) => void;
  };
}

/**
 * [Features/DesignTheme Layer]
 * 아티클 디자인 테마의 상태 관리와 비즈니스 로직(API 통신)을 담당하는 ViewModel 훅입니다.
 */
export const useDesignViewModel = (): UseDesignViewModelReturn => {
  const router = useRouter();
  
  // ── SWR 페처 ──
  const fetcher = (url: string) => fetch(url).then(res => res.json());

  const { data: themesData, isLoading: loading, mutate: fetchThemes } = useSWR('/api/design', fetcher);
  const themes: ArticleTheme[] = themesData?.themes || [];

  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);
  const [themeName, setThemeName] = useState('');
  const [config, setConfig] = useState<ThemeConfig>(getDefaultConfig());
  const [activeTab, setActiveTab] = useState('heading');
  const [saving, setSaving] = useState(false);
  const [isPublishModeOpen, setPublishModeOpen] = useState(false);

  // ── 테마 선택 ──
  const selectTheme = useCallback((theme: ArticleTheme) => {
    setSelectedThemeId(theme.id);
    setThemeName(theme.name);
    try {
      const parsed = JSON.parse(theme.config);
      // 기존 테마에 새로운 필드가 없으면 기본값 병합
      const defaults = getDefaultConfig();
      setConfig({
        ...defaults,
        ...parsed,
        heading: { ...defaults.heading, ...(parsed.heading || {}) },
        bold: { ...defaults.bold, ...(parsed.bold || {}) },
        blockquote: { ...defaults.blockquote, ...(parsed.blockquote || {}) },
        list: { ...defaults.list, ...(parsed.list || {}) },
        table: { ...defaults.table, ...(parsed.table || {}) },
        cta: { ...defaults.cta, ...(parsed.cta || {}) },
        ctaBlocks: parsed.ctaBlocks || createMigratedBlocks(parsed.cta),
        article: { ...defaults.article, ...(parsed.article || {}) },
        disclaimer: { ...defaults.disclaimer, ...(parsed.disclaimer || {}) },
        advanced: { ...defaults.advanced, ...(parsed.advanced || {}) },
      });
    } catch {
      setConfig(getDefaultConfig());
    }
  }, []);

  // ── 기본 테마 자동 선택 ──
  useEffect(() => {
    if (themes.length > 0 && !selectedThemeId && !themeName) {
      const defaultTheme = themes.find((t: ArticleTheme) => t.isDefault) || themes[0];
      selectTheme(defaultTheme);
    }
  }, [themes, selectedThemeId, themeName, selectTheme]);

  // ── 프리셋(읽기전용) 테마 판별 ──
  const isPresetTheme = useMemo(() => {
    return (PRESET_THEME_NAMES as readonly string[]).includes(themeName);
  }, [themeName]);

  // ── config 부분 업데이트 ──
  const updateConfig = useCallback(<K extends keyof ThemeConfig>(section: K, updates: Partial<ThemeConfig[K]>) => {
    setConfig(prev => {
      // 프리셋 테마인 경우 advanced.styleMode 변경만 허용
      if ((PRESET_THEME_NAMES as readonly string[]).includes(themeName)) {
        if (section === 'advanced' && 'styleMode' in updates) {
          const { styleMode } = updates as any;
          return {
            ...prev,
            advanced: { ...prev.advanced, styleMode },
          };
        }
        toast.error('기본 테마는 발행 모드만 변경할 수 있습니다.');
        return prev;
      }
      
      return {
        ...prev,
        [section]: Array.isArray(updates) ? updates : { ...prev[section], ...updates },
      };
    });
  }, [themeName]);

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
      if (!selectedThemeId) {
        setSelectedThemeId(data.theme.id);
      }
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
  // ── 삭제 확인 상태 ──
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = useCallback(() => {
    if (!selectedThemeId) return;
    setShowDeleteConfirm(true);
  }, [selectedThemeId]);

  const confirmDelete = useCallback(async () => {
    if (!selectedThemeId) return;
    setShowDeleteConfirm(false);
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

  const cancelDelete = useCallback(() => {
    setShowDeleteConfirm(false);
  }, []);

  // ── 새 테마 ──
  const handleNewTheme = useCallback(() => {
    setSelectedThemeId(null);
    setThemeName('새 테마');
    setConfig(getDefaultConfig());
  }, []);

  // ── 테마 복제 ──
  const handleDuplicate = useCallback(async () => {
    if (!themeName.trim()) return;
    setSaving(true);
    try {
      const body = {
        name: `${themeName} (복제)`,
        config: JSON.stringify(config),
      };
      const res = await fetch('/api/design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('복제 실패');
      const data = await res.json();
      toast.success('테마가 복제되었습니다!');
      setSelectedThemeId(data.theme.id);
      setThemeName(data.theme.name);
      await fetchThemes();
    } catch (err) {
      toast.error('복제에 실패했습니다.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  }, [themeName, config, fetchThemes]);

  // ── JSON 내보내기 ──
  const handleExport = useCallback(() => {
    const exportData = {
      name: themeName,
      config,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `theme-${themeName.replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('테마가 JSON으로 내보내졌습니다.');
  }, [themeName, config]);

  // ── JSON 가져오기 ──
  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        if (data.config) {
          const defaults = getDefaultConfig();
          const importedConfig = typeof data.config === 'string' ? JSON.parse(data.config) : data.config;
          setConfig({
            ...defaults,
            ...importedConfig,
            advanced: { ...defaults.advanced, ...(importedConfig.advanced || {}) },
          });
          if (data.name) setThemeName(data.name);
          setSelectedThemeId(null); // 새 테마로 저장될 수 있도록
          toast.success('테마를 가져왔습니다. 저장 버튼을 눌러 저장하세요.');
        } else {
          toast.error('올바른 테마 JSON 파일이 아닙니다.');
        }
      } catch {
        toast.error('JSON 파일 파싱에 실패했습니다.');
      }
    };
    input.click();
  }, []);

  // ── 테마 원래 상태로 초기화 ──
  const handleReset = useCallback(() => {
    if (!confirm('현재 설정을 저장된 상태로 되돌리시겠습니까?')) return;
    
    if (selectedThemeId) {
      const originalTheme = themes.find(t => t.id === selectedThemeId);
      if (originalTheme) {
        selectTheme(originalTheme);
        toast.success('저장된 설정으로 돌아갔습니다.');
        return;
      }
    }
    
    setConfig(getDefaultConfig());
    toast.success('설정이 기본값으로 초기화되었습니다.');
  }, [selectedThemeId, themes, selectTheme]);



  return {
    themes,
    selectedThemeId,
    themeName,
    config,
    activeTab,
    saving,
    loading,
    showDeleteConfirm,
    isPublishModeOpen,
    isPresetTheme,
    router,
    actions: {
      setThemeName,
      setActiveTab,
      selectTheme,
      updateConfig,
      handleSave,
      handleSetDefault,
      handleDelete,
      confirmDelete,
      cancelDelete,
      handleNewTheme,
      handleDuplicate,
      handleExport,
      handleImport,
      handleReset,
      setPublishModeOpen,
    },
  };
};

