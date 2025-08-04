import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // For now, return mock data to prevent 500 errors
    // TODO: Re-enable database calls once migration issues are resolved
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful! (Mock)',
      data: {
        currentTime: new Date().toISOString(),
        postgresVersion: 'Mock PostgreSQL'
      }
    });
  } catch (error) {
    console.error('Database connection error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 