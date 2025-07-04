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
    if (!destination || !startDate || !endDate || !travelers) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields',
          details: 'destination, startDate, endDate, and travelers are required'
        },
        { status: 400 }
      );
    }

    // Calculate trip duration
    const days = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));

    // Create a detailed prompt for Claude
    const prompt = `Create a detailed travel itinerary for ${destination} with the following specifications:

**Trip Details:**
- Destination: ${destination}
- Duration: ${days} days (${startDate} to ${endDate})
- Number of travelers: ${travelers}
- Budget: ${budget}
- Travel style: ${travelStyle}
- Group type: ${groupType}
- Activity level: ${activityLevel}
- Interests: ${interests?.join(', ') || 'General travel'}

**Requirements:**
1. Create a day-by-day itinerary for all ${days} days
2. Include specific activities, restaurants, and attractions
3. Consider the travel style and budget constraints
4. Tailor activities to the mentioned interests
5. Include practical tips and recommendations
6. Format with clear headings and bullet points
7. Include estimated costs where relevant
8. Add travel tips and local insights

**Format the response as:**
- Trip overview with key details
- Day-by-day breakdown with morning, afternoon, and evening activities
- Practical tips and recommendations
- Budget breakdown by category
- Local insights and cultural tips

Make it engaging, practical, and personalized to their preferences!`;

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
    } catch (apiError) {
      console.error('Anthropic API call failed:', apiError);
      throw new Error(`Anthropic API error: ${apiError instanceof Error ? apiError.message : 'Unknown API error'}`);
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