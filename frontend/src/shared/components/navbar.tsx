'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/features/components/ui/button'
import { useAuth } from '@/features/auth/contexts/AuthContext'
import { Menu, X, User, LogOut, Package, Search } from 'lucide-react'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <header className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-md border-b border-gray-800">
      <div className="container mx-auto px-4">
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
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-gray-800">
                <Package className="w-4 h-4 mr-2" />
                아이템 생성
              </Button>
            </Link>
            <Link href="/research">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-gray-800">
                <Search className="w-4 h-4 mr-2" />
                리서치 관리
              </Button>
            </Link>
            <Link href="/components">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-gray-800">
                컴포넌트
              </Button>
            </Link>
          </nav>

          {/* User Menu & Mobile Toggle */}
          <div className="flex items-center gap-2">
            {/* Desktop User Menu */}
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-300 max-w-32 truncate">{user.email}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={signOut}
                    className="text-gray-300 hover:text-white hover:bg-gray-800"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    로그아웃
                  </Button>
                </div>
              ) : (
                <Link href="/login">
                  <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
                    로그인
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="md:hidden text-gray-300 hover:text-white hover:bg-gray-800"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen 
            ? 'max-h-96 opacity-100 pb-4' 
            : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <nav className="flex flex-col gap-2 pt-4 border-t border-gray-800">
            <Link href="/product" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800">
                <Package className="w-4 h-4 mr-3" />
                아이템 생성
              </Button>
            </Link>
            <Link href="/research" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800">
                <Search className="w-4 h-4 mr-3" />
                리서치 관리
              </Button>
            </Link>
            <Link href="/components" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800">
                컴포넌트
              </Button>
            </Link>
            
            <div className="border-t border-gray-800 pt-2 mt-2">
              {user ? (
                <>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 mb-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-300">{user.email}</span>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      signOut()
                      setIsMobileMenuOpen(false)
                    }}
                    className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    로그아웃
                  </Button>
                </>
              ) : (
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
                    로그인
                  </Button>
                </Link>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}