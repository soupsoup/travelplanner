import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function GET(request: NextRequest) {
  try {
    // Check if API key is available
    if (!process.env.ANTHROPIC_API_KEY) {
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

    console.log('Testing Anthropic API connection...');
    
    try {
      const message = await anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 100,
        temperature: 0.7,
        messages: [
          {
            role: 'user',
            content: 'Hello, please respond with "API connection successful" to confirm you are working.'
          }
        ]
      });

      console.log('Anthropic API test successful');
      
      const response = message.content[0].type === 'text' ? message.content[0].text : 'Error in response';

      return NextResponse.json({ 
        success: true, 
        message: 'API connection successful',
        response: response,
        timestamp: new Date().toISOString()
      });

    } catch (apiError: any) {
      console.error('Anthropic API test failed:', apiError);
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'API connection failed',
          details: apiError.message || 'Unknown API error',
          status: apiError.status || 'unknown'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error testing Anthropic API:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 