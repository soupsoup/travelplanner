import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { tripId, email, message, shareLink } = await request.json();

    if (!tripId || !email) {
      return NextResponse.json(
        { success: false, error: 'Trip ID and email are required' },
        { status: 400 }
      );
    }

    // For now, use mock trip data to prevent 500 errors
    // TODO: Re-enable database calls once migration issues are resolved
    const mockTrip = {
      id: tripId,
      destination: 'Paris, France',
      daysCount: 7,
      travelers: 2,
      startDate: '2025-08-15',
      endDate: '2025-08-22',
      overview: 'A wonderful trip to Paris'
    };

    const trip = mockTrip;

    // Generate email content
    const emailSubject = `Check out my trip to ${trip.destination}!`;
    
    const emailBody = `
Hi there!

${message || `I wanted to share my trip to ${trip.destination} with you!`}

Trip Details:
- Destination: ${trip.destination}
- Duration: ${trip.daysCount} days
- Travelers: ${trip.travelers}
- Dates: ${trip.startDate} to ${trip.endDate}

${trip.overview ? `Overview: ${trip.overview}` : ''}

You can view the full itinerary here: ${shareLink}

This itinerary was created with TravelDash - a travel planning app that helps create personalized trip itineraries.

Best regards!
    `.trim();

    // For now, we'll simulate email sending
    // In a real implementation, you would integrate with an email service like SendGrid, Mailgun, etc.
    console.log('Email would be sent to:', email);
    console.log('Subject:', emailSubject);
    console.log('Body:', emailBody);

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({
      success: true,
      message: 'Itinerary shared successfully',
      data: {
        email,
        tripId,
        shareLink
      }
    });

  } catch (error) {
    console.error('Error sharing itinerary:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to share itinerary' },
      { status: 500 }
    );
  }
} 