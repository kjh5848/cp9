import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 환경변수 기반 Supabase 설정 (하드코딩 제거)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface ItemResearchRequest {
  itemName: string
  projectId: string
  itemId: string
  productData?: {
    productName: string
    productPrice: number
    productImage: string
    productUrl: string
    categoryName: string
    isRocket: boolean
    isFreeShipping: boolean
  }
}

interface ItemResearchResponse {
  itemName: string
  projectId: string
  itemId: string
  researchData: {
    overview: string
    features: string[]
    benefits: string[]
    targetAudience: string
    marketAnalysis: string
    recommendations: string[]
    priceRange: string
    popularBrands: string[]
  }
  success: boolean
}

export async function POST(request: NextRequest) {
  try {
    // UTF-8 처리
    const requestText = await request.text()
    const body: ItemResearchRequest = JSON.parse(requestText)

    if (!body.itemName || !body.projectId || !body.itemId) {
      return NextResponse.json(
        { error: 'itemName, projectId, and itemId are required' },
        { status: 400 }
      )
    }

    console.log('Item research request:', {
      itemName: body.itemName,
      projectId: body.projectId,
      itemId: body.itemId,
    })

    // Supabase Edge Function 호출
    const { data, error } = await supabase.functions.invoke('item-research', {
      body: {
        itemName: body.itemName,
        projectId: body.projectId,
        itemId: body.itemId,
        productData: body.productData,
      },
    })

    if (error) {
      console.error('Supabase function error:', error.message)
      return NextResponse.json(
        { error: 'Research service error', details: error.message || 'Unknown error' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ...data,
      projectId: body.projectId,
      itemId: body.itemId,
      success: true,
    } as ItemResearchResponse)
  } catch (error) {
    console.error('Item research error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Item research API endpoint' })
}