'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/shared/ui'
import { useAuth } from '@/features/auth/contexts/AuthContext'
import { GlassCard, ScaleOnHover } from '@/shared/components/advanced-ui'
import { Menu, X, User, LogOut, Package, Search } from 'lucide-react'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  // 외부 클릭 시 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false)
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMobileMenuOpen])

  return (
    <div className="fixed top-4 left-0 right-0 z-50 px-[10%]" ref={menuRef}>
      <GlassCard variant="light" className="shadow-lg">
        <div className="px-6 py-2">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="relative">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">C9</span>
                  </div>
                  <div className="absolute -inset-1 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 opacity-0 group-hover:opacity-30 blur transition-opacity duration-300"></div>
                </div>
                <h1 className="text-xl font-bold text-white hidden sm:block">CP9</h1>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              <Link href="/product">
                <ScaleOnHover scale={1.05}>
                  <Button variant="ghost" size="sm" className="text-gray-100 hover:text-white hover:bg-white/15">
                    <Package className="w-4 h-4 mr-2" />
                    아이템 생성
                  </Button>
                </ScaleOnHover>
              </Link>
              <Link href="/research">
                <ScaleOnHover scale={1.05}>
                  <Button variant="ghost" size="sm" className="text-gray-100 hover:text-white hover:bg-white/15">
                    <Search className="w-4 h-4 mr-2" />
                    리서치 관리
                  </Button>
                </ScaleOnHover>
              </Link>
              <Link href="/components">
                <ScaleOnHover scale={1.05}>
                  <Button variant="ghost" size="sm" className="text-gray-100 hover:text-white hover:bg-white/15">
                    컴포넌트
                  </Button>
                </ScaleOnHover>
              </Link>
            </nav>

            {/* User Menu & Mobile Toggle */}
            <div className="flex items-center gap-2">
              {/* Desktop User Menu */}
              <div className="hidden md:flex items-center gap-2">
                {user ? (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/20 border border-white/25">
                      <User className="w-4 h-4 text-gray-200" />
                      <span className="text-sm text-gray-100 max-w-32 truncate">{user.email}</span>
                    </div>
                    <ScaleOnHover scale={1.05}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={signOut}
                        className="text-gray-100 hover:text-white hover:bg-white/15"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        로그아웃
                      </Button>
                    </ScaleOnHover>
                  </div>
                ) : (
                  <Link href="/login">
                    <ScaleOnHover scale={1.05}>
                      <Button variant="outline" size="sm" className="border-white/25 text-gray-100 hover:bg-white/15 hover:text-white">
                        로그인
                      </Button>
                    </ScaleOnHover>
                  </Link>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <ScaleOnHover scale={1.1}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMobileMenu}
                  className="md:hidden text-gray-100 hover:text-white hover:bg-white/15"
                >
                  {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              </ScaleOnHover>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 md:hidden">
              <GlassCard variant="light" className="shadow-xl">
                <div className={`transition-all duration-300 ease-in-out ${
                  isMobileMenuOpen 
                    ? 'opacity-100 pb-4' 
                    : 'opacity-0'
                }`}>
            <nav className="flex flex-col gap-2 pt-4 border-t border-white/20">
              <Link href="/product" onClick={() => setIsMobileMenuOpen(false)}>
                <ScaleOnHover scale={1.02}>
                  <Button variant="ghost" className="w-full justify-start text-gray-100 hover:text-white hover:bg-white/15">
                    <Package className="w-4 h-4 mr-3" />
                    아이템 생성
                  </Button>
                </ScaleOnHover>
              </Link>
              <Link href="/research" onClick={() => setIsMobileMenuOpen(false)}>
                <ScaleOnHover scale={1.02}>
                  <Button variant="ghost" className="w-full justify-start text-gray-100 hover:text-white hover:bg-white/15">
                    <Search className="w-4 h-4 mr-3" />
                    리서치 관리
                  </Button>
                </ScaleOnHover>
              </Link>
              <Link href="/components" onClick={() => setIsMobileMenuOpen(false)}>
                <ScaleOnHover scale={1.02}>
                  <Button variant="ghost" className="w-full justify-start text-gray-100 hover:text-white hover:bg-white/15">
                    컴포넌트
                  </Button>
                </ScaleOnHover>
              </Link>
              
              <div className="border-t border-white/20 pt-2 mt-2">
                {user ? (
                  <>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/20 mb-2 border border-white/25">
                      <User className="w-4 h-4 text-gray-200" />
                      <span className="text-sm text-gray-100">{user.email}</span>
                    </div>
                    <ScaleOnHover scale={1.02}>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          signOut()
                          setIsMobileMenuOpen(false)
                        }}
                        className="w-full justify-start text-gray-100 hover:text-white hover:bg-white/15"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        로그아웃
                      </Button>
                    </ScaleOnHover>
                  </>
                ) : (
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <ScaleOnHover scale={1.02}>
                      <Button variant="outline" className="w-full border-white/25 text-gray-100 hover:bg-white/15 hover:text-white">
                        로그인
                      </Button>
                    </ScaleOnHover>
                  </Link>
                )}
              </div>
                </nav>
              </div>
            </GlassCard>
          </div>
        )}
        </div>
      </GlassCard>
    </div>
  )
}