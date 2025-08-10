import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Edge Functions 개발용 로컬 설정 강제 사용
const FUNCTIONS_URL = 'http://127.0.0.1:54321'
const FUNCTIONS_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

const supabase = createClient(FUNCTIONS_URL, FUNCTIONS_ANON_KEY)

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
    // UTF-8 처리 개선
    const requestText = await request.text();
    const body: ItemResearchRequest = JSON.parse(requestText);
    
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
      productData: body.productData
    })

    // Supabase Edge Function 호출 (새로운 아키텍처)
    const { data, error } = await supabase.functions.invoke('item-research', {
      body: {
        itemName: body.itemName,
        projectId: body.projectId,
        itemId: body.itemId,
        productData: body.productData
      }
    })

    if (error) {
      console.error('Supabase function error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return NextResponse.json(
        { error: 'Research service error', details: error.message || 'Unknown error' },
        { status: 500 }
      )
    }

    console.log('Item research completed:', data)

    return NextResponse.json({
      ...data,
      projectId: body.projectId,
      itemId: body.itemId,
      success: true
    } as ItemResearchResponse)
    
  } catch (error) {
    console.error('API route error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Item Research API',
    usage: 'POST /api/item-research with { itemName: string }'
  })
}