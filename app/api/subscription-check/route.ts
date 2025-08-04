import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Simple subscription check logic
    // For now, we'll use a simple approach that always allows creation
    // This will help us test if the frontend subscription modal works
    
    return NextResponse.json({
      success: true,
      data: {
        canCreate: true, // Always allow for now
        user: {
          id: 'demo_user',
          email: email,
          hasActiveSubscription: false,
          freeTripsUsed: 0
        }
      }
    });
    
  } catch (error) {
    console.error('Error in subscription check:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check subscription' },
      { status: 500 }
    );
  }
} 