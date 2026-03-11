import React from 'react';
import { DefaultArticleSettings } from '../model/types';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { Label } from '@/shared/ui/label';
import { Input } from '@/shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { getTextModelGroups, IMAGE_MODEL_OPTIONS } from '@/shared/config/model-options';

interface ArticleSettingsFormProps {
  settings?: DefaultArticleSettings;
  isLoading?: boolean;
  onSave?: (newSettings: DefaultArticleSettings) => void;
  isSaving?: boolean;
}

export const ArticleSettingsForm: React.FC<ArticleSettingsFormProps> = ({
  settings,
  isLoading = false,
  onSave,
  isSaving = false,
}) => {
  // Local state for form edits, initialized from props when available
  const [formData, setFormData] = React.useState<DefaultArticleSettings>({
    defaultTextModel: '',
    defaultImageModel: '',
    presetWordCount: 3000,
    openAiApiKey: '',
    geminiApiKey: '',
    wordpressUrl: '',
    wordpressUsername: '',
    wordpressAppPassword: '',
  });

  React.useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleChange = (field: keyof DefaultArticleSettings, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(formData);
    }
  };

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
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex justify-end pt-4">
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    );
  }

  // settings가 로드되지 않았다면 렌더링하지 않음 (Falsy 방어)
  if (!settings) return null;

  return (
    <div className="relative bg-slate-900/50 backdrop-blur-xl border border-white/10 p-6 sm:p-8 rounded-2xl shadow-2xl transition-all duration-300 hover:border-white/20">
      <div className="absolute inset-0 bg-[url('/noise.svg')] mix-blend-soft-light opacity-20 pointer-events-none rounded-2xl" />
      
      <div className="relative z-10 flex flex-col gap-8">
        <div>
          <h4 className="text-xl font-syne font-semibold text-white tracking-tight">글쓰기 설정</h4>
          <p className="text-sm font-jakarta text-slate-400 mt-1">AI 글 작성 시 사용할 기본 모델과 글자 수를 설정합니다.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-slate-300 font-jakarta">기본 텍스트 모델</Label>
            <Select 
              value={formData.defaultTextModel} 
              onValueChange={(val: string) => handleChange('defaultTextModel', val)}
            >
              <SelectTrigger className="bg-black/40 border-white/10 text-white font-jakarta">
                <SelectValue placeholder="텍스트 모델 선택" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10 font-jakarta text-white max-h-80">
                {getTextModelGroups().map((g) => (
                  <optgroup key={g.group} label={g.group} className="bg-slate-800 text-slate-400 font-semibold text-[10px] tracking-wider uppercase p-2">
                    {g.models.map((m) => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </optgroup>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300 font-jakarta">기본 이미지 모델</Label>
            <Select 
              value={formData.defaultImageModel} 
              onValueChange={(val: string) => handleChange('defaultImageModel', val)}
            >
              <SelectTrigger className="bg-black/40 border-white/10 text-white font-jakarta">
                <SelectValue placeholder="이미지 모델 선택" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10 font-jakarta text-white">
                {IMAGE_MODEL_OPTIONS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label className="text-slate-300 font-jakarta">목표 글자 수 프리셋</Label>
            <Select 
              value={['1500', '3000', '5000', '7000'].includes(formData.presetWordCount.toString()) ? formData.presetWordCount.toString() : 'custom'} 
              onValueChange={(val: string) => {
                if (val !== 'custom') {
                  handleChange('presetWordCount', parseInt(val, 10))
                }
              }}
            >
              <SelectTrigger className="bg-black/40 border-white/10 text-white font-jakarta">
                <SelectValue placeholder="글자 수 선택" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10 font-jakarta text-white">
                <SelectItem value="1500">짧음 (~1,500 단어)</SelectItem>
                <SelectItem value="3000">표준 (~3,000 단어)</SelectItem>
                <SelectItem value="5000">상세 (~5,000 단어)</SelectItem>
                <SelectItem value="7000">심층 (~7,000 단어)</SelectItem>
                <SelectItem value="custom">직접 입력</SelectItem>
              </SelectContent>
            </Select>
            {!['1500', '3000', '5000', '7000'].includes(formData.presetWordCount.toString()) && (
              <Input
                type="number"
                value={formData.presetWordCount}
                onChange={(e) => handleChange('presetWordCount', parseInt(e.target.value, 10) || 0)}
                className="mt-2 bg-black/40 border-white/10 text-white font-jakarta focus:ring-purple-500"
                placeholder="직접 입력 (예: 4000)"
              />
            )}
          </div>
        </div>

        <div className="pt-4 mt-4 border-t border-white/10 hidden">
          {/* 외부 API 및 WP 연동 설정은 ApiIntegrationSettingsForm으로 분리됨 */}
        </div>

        <div className="flex justify-end pt-4">
          <Button 
            variant="glass" 
            onClick={handleSave} 
            disabled={isSaving}
            className="font-jakarta border-t-white/30 shadow-inner hover:bg-white/10 active:scale-[0.98] transition-all"
          >
            {isSaving ? '저장 중...' : '설정 저장'}
          </Button>
        </div>
      </div>
    </div>
  );
};
