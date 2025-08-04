import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserByEmail, canCreateTrip, incrementFreeTripsUsed } from '@/lib/db/actions';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing subscription system...');
    
    // Test 1: Create a test user
    const testUserId = `test_user_${Date.now()}`;
    const testEmail = `test_${Date.now()}@example.com`;
    
    console.log('🧪 Creating test user:', testUserId);
    const createResult = await createUser({
      id: testUserId,
      email: testEmail,
      name: 'Test User',
      hasActiveSubscription: false,
      freeTripsUsed: 0
    });
    
    console.log('🧪 Create user result:', createResult);
    
    if (!createResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Failed to create test user',
        details: createResult.error
      });
    }
    
    // Test 2: Get the user
    console.log('🧪 Getting user by email:', testEmail);
    const getUserResult = await getUserByEmail(testEmail);
    console.log('🧪 Get user result:', getUserResult);
    
    // Test 3: Check if user can create trip (should be true initially)
    console.log('🧪 Checking if user can create trip (should be true)');
    const canCreateResult1 = await canCreateTrip(testUserId);
    console.log('🧪 Can create trip result 1:', canCreateResult1);
    
    // Test 4: Increment free trips used
    console.log('🧪 Incrementing free trips used');
    const incrementResult = await incrementFreeTripsUsed(testUserId);
    console.log('🧪 Increment result:', incrementResult);
    
    // Test 5: Check if user can create trip (should be false now)
    console.log('🧪 Checking if user can create trip (should be false)');
    const canCreateResult2 = await canCreateTrip(testUserId);
    console.log('🧪 Can create trip result 2:', canCreateResult2);
    
    return NextResponse.json({
      success: true,
      testResults: {
        userCreated: createResult.success,
        userRetrieved: getUserResult.success,
        canCreateInitially: canCreateResult1.canCreate,
        incrementSuccess: incrementResult.success,
        canCreateAfterIncrement: canCreateResult2.canCreate,
        userData: getUserResult.data
      }
    });
    
  } catch (error) {
    console.error('🧪 Test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 