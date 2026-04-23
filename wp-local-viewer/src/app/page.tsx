"use client";

import React, { useState, useEffect } from "react";
import { marked } from "marked";

export default function WPViewerPage() {
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [markdownText, setMarkdownText] = useState("");
  const [htmlPreview, setHtmlPreview] = useState("");
  const [categories, setCategories] = useState<{id: number, name: string}[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [documentList, setDocumentList] = useState<any[]>([]);
  
  // 쿠팡 파트너스 패널 상태
  const [searchKeyword, setSearchKeyword] = useState("");
  const [coupangResults, setCoupangResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 초기 데이터 로드 (카테고리 및 저장된 문서 목록)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [catRes, docRes] = await Promise.all([
          fetch("/api/wordpress/categories"),
          fetch("/api/documents")
        ]);
        
        const catData = await catRes.json();
        if (catData.success && catData.categories) {
          setCategories(catData.categories);
        }

        const docData = await docRes.json();
        if (docData.success && docData.documents) {
          setDocumentList(docData.documents);
        }
      } catch (err) {
        console.error("초기 데이터 로드 오류:", err);
      }
    };
    fetchInitialData();
  }, []);

  // 마크다운 실시간 변환
  useEffect(() => {
    const convertMarkdown = async () => {
      try {
        const html = await marked.parse(markdownText);
        setHtmlPreview(html);
      } catch (err) {
        console.error("Markdown 파싱 오류:", err);
      }
    };
    convertMarkdown();
  }, [markdownText]);

  // 문서 저장 로직
  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: documentId, // null이면 새로 생성
          title,
          markdown: markdownText,
          categoryId: selectedCategory
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDocumentId(data.document.id);
        alert("✅ 문서가 성공적으로 임시 저장되었습니다.");
        // 목록 갱신
        const docRes = await fetch("/api/documents");
        const docData = await docRes.json();
        if (docData.success) setDocumentList(docData.documents);
      }
    } catch (err) {
      console.error(err);
      alert("문서 저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  // 문서 불러오기
  const handleLoadDocument = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const docId = e.target.value;
    if (!docId) {
      // 새 문서
      setDocumentId(null);
      setTitle("");
      setMarkdownText("");
      setSelectedCategory(null);
      return;
    }
    const doc = documentList.find(d => d.id === docId);
    if (doc) {
      setDocumentId(doc.id);
      setTitle(doc.title);
      setMarkdownText(doc.markdown);
      setSelectedCategory(doc.categoryId);
    }
  };

  const handleCoupangSearch = async () => {
    if (!searchKeyword) return;
    setIsSearching(true);
    try {
      const res = await fetch("/api/products/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: searchKeyword, limit: 5 })
      });
      const data = await res.json();
      if (res.ok) {
        setCoupangResults(data);
      } else {
        alert(`검색 실패: ${data.error}`);
      }
    } catch (error) {
      console.error(error);
      alert("검색 중 오류가 발생했습니다.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleInsertCoupangProduct = async (product: any) => {
    try {
      const res = await fetch("/api/products/deeplink", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls: [product.productUrl] })
      });
      const data = await res.json();
      
      let deeplinkUrl = product.productUrl;
      if (res.ok && data.length > 0) {
        deeplinkUrl = data[0].shortenUrl;
      }

      const snippet = `\n\n<div class="coupang-product" style="border:1px solid #ddd; padding: 15px; border-radius: 8px; display:flex; gap: 15px; align-items:center; margin: 20px 0;">
  <img src="${product.productImage}" alt="${product.productName}" style="width: 120px; height: 120px; object-fit: cover; border-radius: 8px;" />
  <div>
    <h4 style="margin: 0 0 10px 0; font-size: 16px;">${product.productName}</h4>
    <p style="color: #e52528; font-weight: bold; font-size: 18px; margin: 0 0 10px 0;">${product.productPrice.toLocaleString()}원</p>
    <a href="${deeplinkUrl}" target="_blank" rel="nofollow noopener noreferrer" style="background: #0073e9; color: white; padding: 8px 16px; border-radius: 4px; text-decoration: none; display: inline-block; font-weight: bold;">최저가 보러가기</a>
  </div>
</div>
<p style="font-size: 11px; color: #999; text-align: center;">이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.</p>\n\n`;

      setMarkdownText(prev => prev + snippet);
    } catch (err) {
      console.error(err);
      alert("딥링크 생성 중 오류가 발생했습니다.");
    }
  };

  const handleGenerateThumbnail = async () => {
    alert("LLM 썸네일 생성 API 연동 예정입니다.");
  };

  const handleUploadToWP = async () => {
    if (!title || !markdownText) {
      alert("제목과 본문을 입력해주세요.");
      return;
    }
    if (!selectedCategory) {
      alert("카테고리를 선택해주세요.");
      return;
    }

    setIsPublishing(true);
    try {
      const res = await fetch("/api/wordpress/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content: htmlPreview,
          categoryIds: [selectedCategory],
        })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        alert(`✅ 워드프레스 발행 완료!\n포스트 링크: ${data.postUrl}`);
        // DB 상태 업데이트
        await fetch("/api/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: documentId,
            title,
            markdown: markdownText,
            categoryId: selectedCategory,
            status: "PUBLISHED",
            publishedUrl: data.postUrl
          })
        });
      } else {
        alert(`❌ 발행 실패: ${data.error || data.message}`);
      }
    } catch (error) {
      console.error(error);
      alert("워드프레스 발행 중 오류가 발생했습니다.");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden font-sans">
      {/* 1. 좌측 사이드바: 마크다운 입력창 */}
      <div className="w-1/3 border-r border-gray-200 bg-white p-4 flex flex-col gap-4 shadow-sm z-10">
        <div className="flex items-center justify-between border-b pb-2">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span>📝</span> 문서 작성
          </h2>
          <select 
            className="text-sm p-1.5 border border-gray-300 rounded bg-gray-50"
            value={documentId || ""}
            onChange={handleLoadDocument}
          >
            <option value="">새 문서 작성...</option>
            {documentList.map(doc => (
              <option key={doc.id} value={doc.id}>
                {doc.title || "제목 없음"} ({doc.status === 'PUBLISHED' ? '발행됨' : '임시저장'})
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-600">포스트 제목</label>
          <input 
            type="text"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            placeholder="포스트 제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2 flex-1">
          <label className="text-sm font-semibold text-gray-600">본문 내용 (Markdown)</label>
          <textarea
            className="flex-1 w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-none shadow-inner"
            placeholder="마크다운 형식으로 작성하세요..."
            value={markdownText}
            onChange={(e) => setMarkdownText(e.target.value)}
          />
        </div>

        <button 
          className="w-full bg-blue-50 text-blue-600 py-2.5 rounded-lg font-bold border border-blue-200 hover:bg-blue-100 transition shadow-sm"
          onClick={handleSaveDraft}
          disabled={isSaving}
        >
          {isSaving ? '저장 중...' : '💾 로컬 DB에 임시 저장'}
        </button>
      </div>

      {/* 2. 중앙 메인 뷰어: HTML 미리보기 */}
      <div className="w-1/3 p-0 overflow-y-auto bg-gray-100 shadow-inner border-r border-gray-200">
        <div className="bg-white min-h-full p-8 prose prose-blue max-w-none break-all">
          {title && <h1 className="border-b pb-4 mb-6">{title}</h1>}
          {htmlPreview ? (
            <div dangerouslySetInnerHTML={{ __html: htmlPreview }} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 font-medium mt-20">
              미리보기가 이곳에 표시됩니다.
            </div>
          )}
        </div>
      </div>

      {/* 3. 우측 컨트롤 패널: 카테고리, 쿠팡, 업로드 */}
      <div className="w-1/3 bg-white p-5 flex flex-col gap-6 overflow-y-auto shadow-sm z-10">
        
        {/* WP 카테고리 설정 */}
        <section className="bg-gray-50 p-4 rounded-xl border border-gray-100">
          <h3 className="text-md font-bold mb-3 text-gray-800 flex items-center gap-2">
            <span>🏷</span> 워드프레스 카테고리
          </h3>
          <select 
            className="w-full p-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            value={selectedCategory || ""}
            onChange={(e) => setSelectedCategory(Number(e.target.value))}
          >
            <option value="">카테고리 선택...</option>
            {categories.map(c => (
              <option key={c.id} value={c.id} dangerouslySetInnerHTML={{ __html: c.name }}></option>
            ))}
          </select>
        </section>

        {/* 쿠팡 파트너스 연동 패널 */}
        <section className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex-1 flex flex-col min-h-0">
          <h3 className="text-md font-bold mb-3 text-gray-800 flex items-center gap-2">
            <span>🛒</span> 쿠팡 파트너스 검색
          </h3>
          <div className="flex gap-2 mb-4">
            <input 
              type="text" 
              className="flex-1 p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" 
              placeholder="상품 검색어 입력"
              value={searchKeyword}
              onKeyDown={(e) => e.key === 'Enter' && handleCoupangSearch()}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
            <button 
              className="bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 shadow-sm transition disabled:opacity-50"
              onClick={handleCoupangSearch}
              disabled={isSearching}
            >
              {isSearching ? '검색중...' : '검색'}
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1 pb-2">
            {coupangResults.map((item, idx) => (
              <div key={idx} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex flex-col gap-2 hover:border-blue-300 transition shrink-0">
                <div className="flex gap-3">
                  <img src={item.productImage} alt="product" className="w-16 h-16 object-cover rounded border" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold truncate" title={item.productName}>{item.productName}</h4>
                    <p className="text-red-600 font-bold text-sm mt-1">{item.productPrice.toLocaleString()}원</p>
                  </div>
                </div>
                <button 
                  className="w-full bg-gray-100 text-gray-700 py-1.5 rounded text-sm font-medium hover:bg-gray-200 transition"
                  onClick={() => handleInsertCoupangProduct(item)}
                >
                  본문에 삽입하기
                </button>
              </div>
            ))}
            {coupangResults.length === 0 && !isSearching && (
              <div className="text-center text-gray-400 text-sm mt-10">
                검색 결과가 없습니다.
              </div>
            )}
          </div>
        </section>

        {/* 발행 컨트롤러 */}
        <section className="mt-auto flex flex-col gap-3 pt-4 border-t border-gray-200 shrink-0">
          <button 
            className="w-full bg-indigo-50 text-indigo-700 py-3 rounded-xl font-bold border border-indigo-200 hover:bg-indigo-100 transition shadow-sm"
            onClick={handleGenerateThumbnail}
          >
            🎨 AI 썸네일 자동 생성
          </button>
          
          <button 
            className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 shadow-md hover:shadow-lg transition disabled:opacity-50"
            onClick={handleUploadToWP}
            disabled={isPublishing}
          >
            {isPublishing ? '🚀 발행 중...' : '🚀 워드프레스 발행하기'}
          </button>
        </section>

      </div>
    </div>
  );
}
