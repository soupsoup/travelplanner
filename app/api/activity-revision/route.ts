import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { activity, trip, prompt } = await request.json();

    if (!activity || !trip || !prompt) {
      return NextResponse.json(
        { success: false, error: 'Activity, trip, and prompt are required' },
        { status: 400 }
      );
    }

    // Create a comprehensive prompt for AI revision
    const aiPrompt = `You are a travel planning expert. I need help improving an activity in my travel itinerary.

Trip Context:
- Destination: ${trip.destination}
- Duration: ${trip.daysCount} days
- Travelers: ${trip.travelers}
- Travel Style: ${trip.travelStyle || 'Not specified'}
- Budget: ${trip.budget || 'Not specified'}

Current Activity:
- Title: ${activity.title}
- Description: ${activity.description || 'No description'}
- Time: ${activity.time || 'Not specified'}
- Location: ${activity.location || 'Not specified'}
- Cost: $${activity.cost || 0}
- Type: ${activity.type}
- Priority: ${activity.priority || 'medium'}
- Tips: ${activity.tips || 'None'}

User's Revision Request: ${prompt}

Please provide specific, actionable suggestions to improve this activity based on the user's request. Your response should include:

1. **Title**: Suggest an improved title if relevant
2. **Description**: Provide a more detailed or improved description
3. **Tips**: Add helpful tips or insider knowledge
4. **Alternatives**: Suggest similar activities if the user wants alternatives
5. **Cost Optimization**: Suggest ways to save money if budget is a concern
6. **Timing**: Suggest better timing if relevant
7. **Location**: Suggest better locations or nearby attractions if relevant

Format your response clearly with sections marked by **bold headers**. Be specific and practical in your suggestions. Focus on making the activity more enjoyable, cost-effective, or better suited to the traveler's needs.

Example format:
**Title**: [suggested title]
**Description**: [improved description]
**Tips**: [helpful tips]
**Cost Optimization**: [budget suggestions]
**Timing**: [timing suggestions]
**Location**: [location suggestions]`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: aiPrompt
        }
      ]
    });

    const suggestions = message.content[0].type === 'text' ? message.content[0].text : 'Error generating suggestions';

    return NextResponse.json({
      success: true,
      suggestions,
      data: {
        activityId: activity.id,
        prompt,
        tripDestination: trip.destination
      }
    });

  } catch (error) {
    console.error('Error getting AI revision:', error);
    
    // Handle specific Anthropic errors
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        return NextResponse.json(
          { success: false, error: 'Authentication failed: Invalid API key' },
          { status: 401 }
        );
      } else if (error.message.includes('429')) {
        return NextResponse.json(
          { success: false, error: 'Rate limit exceeded: Too many requests' },
          { status: 429 }
        );
      } else if (error.message.includes('403')) {
        return NextResponse.json(
          { success: false, error: 'Access denied: API key lacks permissions' },
          { status: 403 }
        );
      }
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to get AI revision suggestions' },
      { status: 500 }
    );
  }
} 