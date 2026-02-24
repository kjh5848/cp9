"use client";

import React from "react";
import { ProductCreation } from "@/widgets/product-creation/ui/ProductCreation";

/**
 * [Product Page]
 * 상품 생성 및 검색 위젯을 배치하는 페이지입니다.
 */
export default function ProductPage() {
  return (
    <div className="min-h-screen bg-gray-950 pt-20">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Item Creation</h1>
          <p className="text-slate-400">자동 포스팅을 위한 상품 데이터를 확보하고 분석 프로세스를 시작합니다.</p>
        </header>

        <ProductCreation />
      </div>
    </div>
  );
}
