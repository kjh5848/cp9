import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface ItemResearchRequest {
  itemName: string
}

interface ItemResearchResponse {
  itemName: string
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
    const body: ItemResearchRequest = await request.json()
    
    if (!body.itemName) {
      return NextResponse.json(
        { error: 'itemName is required' },
        { status: 400 }
      )
    }

    // Supabase Edge Function 호출
    const { data, error } = await supabase.functions.invoke('item-research', {
      body: {
        itemName: body.itemName
      }
    })

    if (error) {
      console.error('Supabase function error:', error)
      return NextResponse.json(
        { error: 'Research service error', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data as ItemResearchResponse)
    
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