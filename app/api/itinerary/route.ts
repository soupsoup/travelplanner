import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'Anthropic API key not set.' }, { status: 500 });
  }

  // Build a prompt for Claude
  const prompt = `You are a travel planner AI. Based on the following user input, generate a detailed, day-by-day travel itinerary. Be creative, specific, and helpful.\n\nUser Input:\n${JSON.stringify(body, null, 2)}\n\nItinerary:`;

  try {
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'anthropic-version': '2023-06-01',
        'x-api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!anthropicRes.ok) {
      const error = await anthropicRes.text();
      console.error('Claude API error:', error);
      return NextResponse.json({ error: `Failed to generate itinerary: ${error}` }, { status: 500 });
    }

    const data = await anthropicRes.json();
    const itinerary = data.content?.[0]?.text || 'No itinerary generated.';
    return NextResponse.json({ itinerary });
  } catch (err: any) {
    console.error('Error calling Claude API:', err);
    return NextResponse.json({ error: err.message || 'Failed to generate itinerary' }, { status: 500 });
  }
} 