import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({ 
      success: true, 
      message: 'API is working correctly',
      timestamp: new Date().toISOString(),
      hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
      keyPrefix: process.env.ANTHROPIC_API_KEY ? process.env.ANTHROPIC_API_KEY.substring(0, 8) + '...' : 'Not found'
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Test API failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 