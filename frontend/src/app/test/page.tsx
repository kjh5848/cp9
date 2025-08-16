'use client';

import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';

export default function TestPage() {
  const [urls, setUrls] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    setLoading(true);
    try {
      const urlList = urls.split(',').map(u => u.trim()).filter(Boolean);
      const response = await fetch('/api/products/deeplink', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: urlList }),
      });
      
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">딥링크 API 테스트</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">URLs (쉼표로 구분)</label>
          <Input
            value={urls}
            onChange={(e) => setUrls(e.target.value)}
            placeholder="https://www.coupang.com/vp/products/123456789"
            className="w-full"
          />
        </div>
        
        <Button onClick={handleTest} disabled={loading}>
          {loading ? '테스트 중...' : '테스트'}
        </Button>
        
        {result && (
          <div>
            <label className="block text-sm font-medium mb-2">결과</label>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {result}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
} 