import { NextRequest, NextResponse } from 'next/server';

// POST /api/trips/[id]/cleanup-duplicates - Remove duplicate activities
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // For now, return success without cleaning up duplicates
    // TODO: Re-enable database calls once migration issues are resolved
    
    return NextResponse.json({
      success: true,
      message: `Cleaned up 0 duplicate activities (Mock)`,
      deletedCount: 0,
      totalDuplicatesFound: 0
    });
  } catch (error) {
    console.error('Error cleaning up duplicates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to cleanup duplicates' },
      { status: 500 }
    );
  }
} 