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
    const { activity, destination, travelStyle, groupType } = body;

    // Validate required fields
    if (!activity || !activity.title) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields',
          details: 'activity with title is required'
        },
        { status: 400 }
      );
    }

    // Create a detailed prompt for Claude to provide specific activity advice
    const prompt = `Provide detailed, practical advice for this specific travel activity. Format your response with clear sections using ** for headers:

**Activity Details:**
- Title: ${activity.title}
- Description: ${activity.description || 'No description provided'}
- Location: ${activity.location || destination}
- Time: ${activity.time || 'Not specified'}
- Type: ${activity.type || 'activity'}
- Current cost estimate: $${activity.cost || 0}

**Travel Context:**
- Destination: ${destination}
- Travel style: ${travelStyle || 'Not specified'}
- Group type: ${groupType || 'Not specified'}

Please structure your advice with the following sections (use ** around section titles):

**Best Practices and Tips**
Provide 2-3 key tips for enjoying this activity, including timing recommendations and how to avoid crowds.

**What to Expect**
Describe what visitors should expect - duration, crowds, difficulty level, and any preparation needed.

**Money-Saving Tips and Enhancements**
Share specific ways to save money or enhance the experience, including any free alternatives or upgrades worth considering.

**What to Bring or Wear**
List essential items, appropriate clothing, or gear needed for this activity.

**Local Insights**
Share insider knowledge that most tourists don't know about, including hidden gems or local customs.

**Booking Recommendations**
Advise on reservations, best times to visit, and any advance planning needed.

Keep each section concise but informative. Focus on practical, actionable advice that enhances their experience.`;

    console.log('Getting AI advice for activity:', activity.title);
    
    let advice = '';
    
    try {
      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        temperature: 0.7,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      console.log('Anthropic API response received for activity advice');
      
      advice = message.content[0].type === 'text' ? message.content[0].text : 'Error generating advice';

      console.log('Successfully generated advice for activity:', activity.title);
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
      advice
    });

  } catch (error) {
    console.error('Error generating activity advice:', error);
    console.error('Error type:', typeof error);
    console.error('Error details:', error instanceof Error ? error.message : JSON.stringify(error));
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate activity advice',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 