'use client'

import { LoginForm } from '@/components/auth/LoginForm'
import { LoginCard } from '@/components/auth/LoginCard'
import { HeroSection } from '@/components/home/HeroSection'
import { FeatureGrid } from '@/components/home/FeatureGrid'
import { GlassCard } from '@/components/ui/glass-card'
import { AnimatedButton } from '@/components/ui/animated-button'
import { GradientBackground } from '@/components/ui/gradient-background'

export default function ComponentsShowcase() {
  return (
    <div className="min-h-screen bg-gray-950">
      <GradientBackground />
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">
            Component Showcase
          </h1>
          <p className="text-xl text-gray-400">
            모든 UI 컴포넌트 미리보기
          </p>
        </div>

        {/* Hero Section Preview */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-white mb-8">Hero Section</h2>
          <div className="rounded-2xl overflow-hidden border border-gray-800">
            <HeroSection />
          </div>
        </section>

        {/* Login Components */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-white mb-8">Authentication Components</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-300 mb-4">Login Card</h3>
              <LoginCard />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-300 mb-4">Login Form</h3>
              <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-800">
                <LoginForm />
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-white mb-8">Feature Grid</h2>
          <FeatureGrid />
        </section>

        {/* Glass Cards */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-white mb-8">Glass Cards</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <GlassCard>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-2">Glass Card 1</h3>
                <p className="text-gray-400">Modern glass morphism effect</p>
              </div>
            </GlassCard>
            <GlassCard className="bg-gradient-to-br from-purple-500/10 to-pink-500/10">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-2">Gradient Glass</h3>
                <p className="text-gray-400">With gradient background</p>
              </div>
            </GlassCard>
            <GlassCard className="border-blue-500/50">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-2">Colored Border</h3>
                <p className="text-gray-400">Custom border color</p>
              </div>
            </GlassCard>
          </div>
        </section>

        {/* Buttons */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-white mb-8">Animated Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <AnimatedButton>Default Button</AnimatedButton>
            <AnimatedButton variant="gradient">Gradient Button</AnimatedButton>
            <AnimatedButton variant="outline">Outline Button</AnimatedButton>
            <AnimatedButton variant="glow">Glow Effect</AnimatedButton>
            <AnimatedButton size="lg">Large Button</AnimatedButton>
            <AnimatedButton disabled>Disabled</AnimatedButton>
          </div>
        </section>
      </div>
    </div>
  )
}