import { NextRequest, NextResponse } from 'next/server';
import { createSubscription, updateUser, getUserByEmail } from '@/lib/db/actions';

export async function POST(request: NextRequest) {
  try {
    const { email, plan } = await request.json();

    if (!email || !plan) {
      return NextResponse.json(
        { success: false, error: 'Email and plan are required' },
        { status: 400 }
      );
    }

    if (!['monthly', 'annual'].includes(plan)) {
      return NextResponse.json(
        { success: false, error: 'Invalid plan. Must be monthly or annual' },
        { status: 400 }
      );
    }

    // Get user
    const userResult = await getUserByEmail(email);
    if (!userResult.success) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const user = userResult.data;
    const price = plan === 'monthly' ? '5.99' : '50.00';
    const startDate = new Date();
    const endDate = new Date();
    
    if (plan === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    // Create subscription
    const subscriptionResult = await createSubscription({
      userId: user.id,
      status: 'active',
      plan,
      price,
      startDate,
      endDate,
      stripeSubscriptionId: null, // Will be set when Stripe is integrated
      stripeCustomerId: null // Will be set when Stripe is integrated
    });

    if (!subscriptionResult.success) {
      return NextResponse.json(
        { success: false, error: 'Failed to create subscription' },
        { status: 500 }
      );
    }

    // Update user to mark as having active subscription
    const updateResult = await updateUser(user.id, {
      hasActiveSubscription: true
    });

    if (!updateResult.success) {
      return NextResponse.json(
        { success: false, error: 'Failed to update user' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        subscription: subscriptionResult.data,
        user: updateResult.data
      }
    });
  } catch (error) {
    console.error('Error purchasing subscription:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to purchase subscription' },
      { status: 500 }
    );
  }
} 