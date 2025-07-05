import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fromLocation, toLocation, mode = 'driving' } = body;

    // Validate required fields
    if (!fromLocation || !toLocation) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields',
          details: 'fromLocation and toLocation are required'
        },
        { status: 400 }
      );
    }

    // For now, use our estimation function
    // In production, you would integrate with Google Maps Distance Matrix API
    const distance = estimateDistanceFromLocations(fromLocation, toLocation);

    return NextResponse.json({ 
      success: true, 
      distance: distance.distance,
      duration: distance.duration,
      mode: distance.mode,
      fromLocation,
      toLocation
    });

  } catch (error) {
    console.error('Error calculating distance:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to calculate distance',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper function - same as in timeUtils but duplicated here to avoid import issues
function estimateDistanceFromLocations(fromLocation: string, toLocation: string) {
  const fromLower = fromLocation.toLowerCase();
  const toLower = toLocation.toLowerCase();
  
  // Check if it's the same general area (same city/district)
  const isSameArea = fromLower.includes(toLower) || toLower.includes(fromLower) || 
                     hasSameKeywords(fromLower, toLower);
  
  let distance: number;
  let mode: 'driving' | 'walking' | 'transit' = 'driving';
  
  if (isSameArea) {
    // Within same area - shorter distance
    distance = Math.random() * 2 + 0.3; // 0.3 to 2.3 miles
    if (distance < 0.8) {
      mode = 'walking';
    }
  } else {
    // Different areas - longer distance
    distance = Math.random() * 8 + 1.5; // 1.5 to 9.5 miles
    if (distance > 15) {
      mode = 'transit'; // Use transit for very long distances
    }
  }
  
  // Calculate duration based on mode
  let duration: number;
  switch (mode) {
    case 'walking':
      duration = distance * 15; // 15 minutes per mile walking
      break;
    case 'transit':
      duration = distance * 4 + 10; // 4 min per mile + 10 min wait/transfer time
      break;
    case 'driving':
    default:
      if (distance < 3) {
        duration = distance * 5; // City driving - 5 min per mile
      } else {
        duration = distance * 2.5; // Highway driving - 2.5 min per mile
      }
      break;
  }
  
  return {
    distance: Math.round(distance * 10) / 10,
    duration: Math.round(duration),
    mode
  };
}

function hasSameKeywords(location1: string, location2: string): boolean {
  const keywords1 = location1.split(/[\s,]+/).filter(word => word.length > 2);
  const keywords2 = location2.split(/[\s,]+/).filter(word => word.length > 2);
  
  // Check if they share common location keywords
  return keywords1.some(keyword1 => 
    keywords2.some(keyword2 => 
      keyword1.includes(keyword2) || keyword2.includes(keyword1)
    )
  );
}

/* 
Example integration with Google Maps Distance Matrix API:

async function getGoogleMapsDistance(fromLocation: string, toLocation: string, mode: string) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    throw new Error('Google Maps API key not configured');
  }

  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?` +
    `origins=${encodeURIComponent(fromLocation)}&` +
    `destinations=${encodeURIComponent(toLocation)}&` +
    `mode=${mode}&` +
    `units=imperial&` +
    `key=${apiKey}`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.status !== 'OK') {
    throw new Error(`Google Maps API error: ${data.status}`);
  }

  const element = data.rows[0].elements[0];
  
  if (element.status !== 'OK') {
    throw new Error(`Route not found: ${element.status}`);
  }

  return {
    distance: parseFloat(element.distance.text.replace(' mi', '')),
    duration: Math.round(element.duration.value / 60), // Convert seconds to minutes
    mode: mode
  };
}
*/ 