"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Loader2, Palette } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface ThemeSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  onSync: (themeId: string) => Promise<void>;
}

export const ThemeSyncModal = ({ isOpen, onClose, selectedCount, onSync }: ThemeSyncModalProps) => {
  const [themes, setThemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchThemes();
    }
  }, [isOpen]);

  const fetchThemes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/design/themes");
      if (res.ok) {
        const data = await res.json();
        setThemes(data.themes || []);
      }
    } catch (e) {
      console.error("Failed to fetch themes", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (!selectedThemeId) return;
    setSyncing(true);
    try {
      await onSync(selectedThemeId);
      onClose();
    } catch (e) {
      console.error("Sync failed", e);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-blue-500" />
            테마 일괄 재적용
          </DialogTitle>
          <DialogDescription>
            선택한 {selectedCount}개의 글에 새로운 테마의 CTA와 디자인을 다시 적용합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : themes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center">불러올 수 있는 테마가 없습니다.</p>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              {themes.map((theme) => (
                <div
                  key={theme.id}
                  onClick={() => setSelectedThemeId(theme.id)}
                  className={cn(
                    "p-3 rounded-xl border cursor-pointer transition-all",
                    selectedThemeId === theme.id 
                      ? "border-blue-500 bg-blue-50/50 dark:bg-blue-500/10" 
                      : "border-border hover:border-blue-300 hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{theme.name}</span>
                    {theme.isDefault && (
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">
                        기본 테마
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={syncing}>
            취소
          </Button>
          <Button 
            onClick={handleSync} 
            disabled={!selectedThemeId || syncing}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {syncing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                적용 중...
              </>
            ) : (
              '재적용 실행'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
