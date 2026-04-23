import React from 'react';
import { DefaultThemeSettings } from '../model/types';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { Label } from '@/shared/ui/label';
import { Input } from '@/shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';

interface ThemeSettingsFormProps {
  settings?: DefaultThemeSettings;
  profileName?: string;
  isLoading?: boolean;
  onSave?: (newSettings: DefaultThemeSettings) => void;
  isSaving?: boolean;
}

export const ThemeSettingsForm: React.FC<ThemeSettingsFormProps> = ({
  settings,
  isLoading = false,
  onSave,
  isSaving = false,
  profileName,
}) => {
  const [formData, setFormData] = React.useState<DefaultThemeSettings>({
    themeId: 'dark',
    personaId: '',
    personaName: '',
  });

    React.useEffect(() => {
    if (settings) {
      setFormData({
        ...settings,
        personaName: settings.personaName || profileName || '',
      });
    }
  }, [settings, profileName]);

  const handleChange = (field: keyof DefaultThemeSettings, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(formData);
    }
  };

  const [themes, setThemes] = React.useState<{ id: string; name: string }[]>([]);

  React.useEffect(() => {
    fetch('/api/design')
      .then((res) => res.json())
      .then((data) => {
        if (data.themes) {
          setThemes(data.themes);
        }
      })
      .catch((err) => console.error('Failed to fetch themes:', err));
  }, []);

  if (isLoading) {
    return (
      <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl space-y-6">
        <div>
          <Skeleton className="h-6 w-1/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex justify-end pt-4">
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="relative bg-slate-900/50 backdrop-blur-xl border border-white/10 p-6 sm:p-8 rounded-2xl shadow-2xl transition-all duration-300 hover:border-white/20">
      <div className="absolute inset-0 bg-[url('/noise.svg')] mix-blend-soft-light opacity-20 pointer-events-none rounded-2xl" />
      
      {/* Decorative Glow - Accentuated slightly differently to differentiate from other cards */}
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/3 pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-8">
        <div>
          <h4 className="text-xl font-syne font-semibold text-white tracking-tight">디스플레이 및 개인화</h4>
          <p className="text-sm font-jakarta text-slate-400 mt-1">생성될 글의 디자인 템플릿과 기본 글쓰기 페르소나를 설정합니다.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-slate-300 font-jakarta">기본 글 디자인(디자인 토큰)</Label>
            <Select 
              value={formData.themeId} 
              onValueChange={(val: string) => handleChange('themeId', val)}
            >
              <SelectTrigger className="bg-black/40 border-white/10 text-white font-jakarta">
                <SelectValue placeholder="디자인 테마 선택" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10 font-jakarta text-white">
                {themes.map((theme) => (
                  <SelectItem key={theme.id} value={theme.id}>{theme.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
             <Label className="text-slate-300 font-jakarta">기본 페르소나</Label>
             <Select 
               value={formData.personaId || ''} 
               onValueChange={(val: string) => handleChange('personaId', val)}
             >
               <SelectTrigger className="bg-black/40 border-white/10 text-white font-jakarta">
                 <SelectValue placeholder="페르소나를 선택하세요" />
               </SelectTrigger>
               <SelectContent className="bg-slate-900 border-white/10 font-jakarta text-white">
                 {/*  향후 서버에서 동적으로 가져온 Persona List를 매핑해야 하지만, Entities 레벨에서는 주입된 Data나 Static한 항목으로 제공 */}
                 <SelectItem value="MASTER_CURATOR_H">마스터 큐레이터 (Professional)</SelectItem>
                 <SelectItem value="IT">IT/테크 전문가 블로거</SelectItem>
                 <SelectItem value="BEAUTY">패션/뷰티 트렌드 쇼퍼</SelectItem>
                 <SelectItem value="LIVING">살림/인테리어 고수 크리에이터</SelectItem>
                 <SelectItem value="HUNTER">가성비/할인 헌터 블로거</SelectItem>
               </SelectContent>
                          </Select>
             <p className="text-[11px] font-jakarta text-slate-500 mt-1 leading-tight">
               지정된 페르소나는 새로운 글을 생성하거나 기획할 때 기본 컨텍스트로 자동 주입됩니다.
             </p>
             <div className="pt-3">
               <Label className="text-slate-300 font-jakarta">작성자 닉네임 (제한적 노출)</Label>
               <Input
                 type="text"
                 placeholder={profileName || "예: 마스터 큐레이터 H"}
                 value={formData.personaName || ""}
                 onChange={(e) => handleChange('personaName', e.target.value)}
                 className="mt-1 bg-black/40 border-white/10 text-white font-jakarta focus-visible:ring-violet-500"
               />
             </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 mt-2 border-t border-white/10">
          <Button 
            variant="tech" 
            onClick={handleSave} 
            disabled={isSaving}
            className="font-jakarta bg-gradient-to-r from-violet-600/80 to-indigo-600/80 border-t-violet-300/50 shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] active:scale-[0.98] transition-all"
          >
            {isSaving ? '적용 중...' : '테마 적용'}
          </Button>
        </div>
      </div>
    </div>
  );
};
