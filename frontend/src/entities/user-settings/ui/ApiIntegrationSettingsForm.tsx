import React from 'react';
import { DefaultArticleSettings } from '../model/types';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { Label } from '@/shared/ui/label';
import { Input } from '@/shared/ui/input';

interface ApiIntegrationSettingsFormProps {
  settings?: DefaultArticleSettings;
  isLoading?: boolean;
  onSave?: (newSettings: DefaultArticleSettings) => void;
  isSaving?: boolean;
}

export const ApiIntegrationSettingsForm: React.FC<ApiIntegrationSettingsFormProps> = ({
  settings,
  isLoading = false,
  onSave,
  isSaving = false,
}) => {
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

  const handleChange = (field: keyof DefaultArticleSettings, value: string) => {
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
      
      <div className="relative z-10 flex flex-col gap-8">
        <div>
          <h4 className="text-xl font-syne font-semibold text-white tracking-tight">외부 API 및 연동 설정</h4>
          <p className="text-sm font-jakarta text-slate-400 mt-1">LLM API 키와 블로그 발행을 위한 WordPress 연동 정보를 관리합니다.</p>
        </div>

        <div className="space-y-8">
          <div>
            <h5 className="text-sm font-syne font-semibold text-white mb-4">외부 API 연동 (선택사항)</h5>
            <div className="space-y-4">
              <div className="space-y-2">
                 <Label className="text-slate-300 font-jakarta">OpenAI API 키 (BYOK)</Label>
                 <Input 
                   type="password" 
                   placeholder="sk-..." 
                   value={formData.openAiApiKey || ''} 
                   onChange={(e) => handleChange('openAiApiKey', e.target.value)}
                   className="bg-black/40 border-white/10 text-white font-jakarta focus-visible:ring-cyan-500/50"
                 />
              </div>
              <div className="space-y-2">
                 <Label className="text-slate-300 font-jakarta">Google Gemini API 키</Label>
                 <Input 
                   type="password" 
                   placeholder="AIzaSy..." 
                   value={formData.geminiApiKey || ''} 
                   onChange={(e) => handleChange('geminiApiKey', e.target.value)}
                   className="bg-black/40 border-white/10 text-white font-jakarta focus-visible:ring-cyan-500/50"
                 />
              </div>
            </div>
          </div>
          
          <div>
            <h5 className="text-sm font-syne font-semibold text-white mb-4">WordPress 연동 (필수)</h5>
            <div className="space-y-4">
              <div className="space-y-2">
                 <Label className="text-slate-300 font-jakarta">WordPress 사이트 URL</Label>
                 <Input 
                   type="url" 
                   placeholder="https://example.com" 
                   value={formData.wordpressUrl || ''} 
                   onChange={(e) => handleChange('wordpressUrl', e.target.value)}
                   className="bg-black/40 border-white/10 text-white font-jakarta focus-visible:ring-cyan-500/50"
                 />
                 <p className="text-[11px] font-jakarta text-slate-500 mt-1">/wp-json API 통신을 위한 기본 도메인을 입력해주세요.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                   <Label className="text-slate-300 font-jakarta">사용자 계정명 (Username)</Label>
                   <Input 
                     type="text" 
                     placeholder="admin" 
                     value={formData.wordpressUsername || ''} 
                     onChange={(e) => handleChange('wordpressUsername', e.target.value)}
                     className="bg-black/40 border-white/10 text-white font-jakarta focus-visible:ring-cyan-500/50"
                   />
                </div>
                <div className="space-y-2">
                   <Label className="text-slate-300 font-jakarta">앱 비밀번호 (App Password)</Label>
                   <Input 
                     type="password" 
                     placeholder="xxxx xxxx xxxx xxxx" 
                     value={formData.wordpressAppPassword || ''} 
                     onChange={(e) => handleChange('wordpressAppPassword', e.target.value)}
                     className="bg-black/40 border-white/10 text-white font-jakarta focus-visible:ring-cyan-500/50"
                   />
                </div>
              </div>
            </div>
          </div>
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
