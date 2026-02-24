"use client";

import React from "react";
import { LandingPage } from "@/widgets/landing/ui/LandingPage";

/**
 * [Home Page]
 * 서비스 랜딩 페이지를 렌더링하는 최상단 페이지입니다.
 * Navbar 없이 LandingPage 위젯 자체가 레이아웃을 담당합니다.
 */
export default function Home() {
  return <LandingPage />;
}
