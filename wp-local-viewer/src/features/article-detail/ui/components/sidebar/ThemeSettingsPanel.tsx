import React from 'react';
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/shared/ui/accordion';
import { GlassCard } from '@/shared/ui/GlassCard';
import { Palette } from 'lucide-react';
import { ThemeSwitcher } from '@/entities/design/ui/ThemeSwitcher';

interface ThemeSettingsPanelProps {
  pack: any;
  themes: any[];
  previewThemeId: string | null;
  themesLoading: boolean;
  applyingTheme: boolean;
  onApplyTheme: (themeId: string) => void;
}

export function ThemeSettingsPanel({ 
  pack, 
  themes, 
  previewThemeId, 
  themesLoading, 
  applyingTheme, 
  onApplyTheme 
}: ThemeSettingsPanelProps) {
  if (!pack.content || pack.status === 'PROCESSING') return null;

  return (
    <AccordionItem value="theme" className="border-none">
      <GlassCard className="p-0 overflow-hidden">
        <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-white/5 data-[state=open]:border-b data-[state=open]:border-white/5">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-blue-400" />
            <span className="font-bold text-sm text-foreground">디자인 테마 설정</span>
          </div>
        </AccordionTrigger>
        
        <AccordionContent className="p-4 bg-black/10">
          <ThemeSwitcher
            themes={themes}
            activeThemeId={previewThemeId ?? pack.appliedThemeId}
            onSelect={(themeId) => { if (themeId) onApplyTheme(themeId); }}
            loading={themesLoading}
            applying={applyingTheme} 
          />
        </AccordionContent>
      </GlassCard>
    </AccordionItem>
  );
}
