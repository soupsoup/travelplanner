import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: NextRequest) {
  try {
    // Check if API key is available
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY not found in environment variables');
      return NextResponse.json(
        { 
          success: false, 
          error: 'API key not configured',
          details: 'ANTHROPIC_API_KEY environment variable is missing'
        },
        { status: 500 }
      );
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const body = await request.json();
    const { 
      destination, 
      narrative,
      startDate, 
      endDate, 
      travelers, 
      budget, 
      interests, 
      travelStyle, 
      groupType, 
      activityLevel 
    } = body;

    // Validate required fields
    if (!destination || !narrative || !startDate || !endDate || !travelers) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields',
          details: 'destination, narrative, startDate, endDate, and travelers are required'
        },
        { status: 400 }
      );
    }

    // Calculate trip duration
    const days = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));

    // Create a detailed prompt for Claude that incorporates the user's narrative
    const prompt = `Create a detailed travel itinerary for ${destination} based on this traveler's description of their ideal trip:

**Traveler's Vision:**
"${narrative}"

**Trip Details:**
- Destination: ${destination}
- Duration: ${days} days (${startDate} to ${endDate})
- Number of travelers: ${travelers}
- Budget: ${budget}
- Travel style: ${travelStyle}
- Group type: ${groupType}
- Activity level: ${activityLevel}
- Interests: ${interests?.join(', ') || 'General travel'}

**Instructions:**
Based on the traveler's narrative description above, create a highly personalized itinerary that:
1. Addresses the specific experiences and desires mentioned in their description
2. Matches their stated travel style and preferences
3. Includes day-by-day activities for all ${days} days
4. Incorporates specific restaurants, attractions, and experiences that align with their vision
5. Considers their budget and travel style preferences
6. Tailors activities to their mentioned interests and group type
7. Includes practical tips and local insights
8. Provides estimated costs where relevant

**Format the response as:**
- Trip overview that references their specific goals and desires
- Day-by-day breakdown with morning, afternoon, and evening activities
- Recommendations that specifically address what they're looking for
- Budget breakdown by category
- Local insights and cultural tips
- Special touches that make this trip uniquely theirs

Make this itinerary feel like it was crafted specifically for their vision and preferences!`;

    console.log('Calling Anthropic API for destination:', destination);
    console.log('Request details:', { destination, days, travelers, budget, travelStyle });
    
    let itinerary = '';
    
    try {
      const message = await anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 3000,
        temperature: 0.7,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      console.log('Anthropic API response received, content type:', message.content[0].type);
      
      itinerary = message.content[0].type === 'text' ? message.content[0].text : 'Error generating itinerary';

      console.log('Successfully generated itinerary for:', destination, '- Length:', itinerary.length);
    } catch (apiError: any) {
      console.error('Anthropic API call failed:', apiError);
      
      // Handle specific Anthropic errors
      if (apiError.status === 401) {
        throw new Error('Authentication failed: Invalid API key');
      } else if (apiError.status === 429) {
        throw new Error('Rate limit exceeded: Too many requests');
      } else if (apiError.status === 403) {
        throw new Error('Access denied: API key lacks permissions');
      } else if (apiError.status === 500) {
        throw new Error('Anthropic service error: Please try again later');
      } else if (apiError.message?.includes('network')) {
        throw new Error('Network error: Please check your internet connection');
      } else if (apiError.message?.includes('timeout')) {
        throw new Error('Request timeout: Please try again');
      } else {
        throw new Error(`Anthropic API error: ${apiError.message || 'Unknown API error'}`);
      }
    }

    return NextResponse.json({ 
      success: true, 
      itinerary,
      tripDetails: {
        destination,
        people: travelers,
        days,
        transport: 'Flight',
        budget,
        interests: interests?.join(', ') || 'General travel',
        travelStyle,
        groupType,
        activityLevel,
        startDate,
        endDate
      }
    });

  } catch (error) {
    console.error('Error generating itinerary:', error);
    console.error('Error type:', typeof error);
    console.error('Error details:', error instanceof Error ? error.message : JSON.stringify(error));
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate itinerary',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 