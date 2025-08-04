import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    // Test the database connection
    const result = await sql`SELECT NOW() as current_time, version() as postgres_version`;
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful!',
      data: {
        currentTime: result[0].current_time,
        postgresVersion: result[0].postgres_version
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