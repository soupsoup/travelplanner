import { NextRequest, NextResponse } from 'next/server';
import { canCreateTrip, getUserByEmail } from '@/lib/db/actions';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Get or create user
    let userResult = await getUserByEmail(email);
    if (!userResult.success) {
      // Create a new user if they don't exist
      const { createUser } = await import('@/lib/db/actions');
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      userResult = await createUser({
        id: userId,
        email,
        name: email.split('@')[0], // Use email prefix as name
        hasActiveSubscription: false,
        freeTripsUsed: 0
      });
    }

    if (!userResult.success) {
      return NextResponse.json(
        { success: false, error: 'Failed to get or create user' },
        { status: 500 }
      );
    }

    const user = userResult.data;
    const canCreateResult = await canCreateTrip(user.id);

    if (!canCreateResult.success) {
      return NextResponse.json(
        { success: false, error: canCreateResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        canCreate: canCreateResult.canCreate,
        reason: canCreateResult.reason,
        user: {
          id: user.id,
          email: user.email,
          hasActiveSubscription: user.hasActiveSubscription,
          freeTripsUsed: user.freeTripsUsed
        }
      }
    });
  } catch (error) {
    console.error('Error checking subscription:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check subscription' },
      { status: 500 }
    );
  }
} 