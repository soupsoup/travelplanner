import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// Helper function to parse AI itinerary text into structured activities
function parseAIItinerary(text: string, destination: string, totalDays: number) {
  if (!text) return { activities: [], overview: '' };
  
  const activities = [];
  let activityId = 1;
  let overview = '';
  
  // Extract trip overview first - look for the overview section
  const overviewMatch = text.match(/\*\*Trip Overview:\*\*\s*([^*]+?)(?=\*\*|$)/i);
  if (overviewMatch) {
    overview = overviewMatch[1].trim();
  } else {
    // Try alternative overview extraction
    const lines = text.split('\n');
    const overviewLines = [];
    let inOverview = false;
    for (const line of lines) {
      if (line.toLowerCase().includes('overview') || line.toLowerCase().includes('trip')) {
        inOverview = true;
      } else if (line.toLowerCase().includes('day 1') || line.toLowerCase().includes('**day')) {
        break;
      }
      if (inOverview && line.trim()) {
        overviewLines.push(line.trim());
      }
    }
    overview = overviewLines.join(' ').replace(/\*\*/g, '').trim();
  }
  
  // Find all day sections using a more specific pattern
  const dayPattern = /\*\*Day\s+(\d+)[^*]*\*\*:\s*\n?(.*?)(?=\*\*Day\s+\d+|\*\*Budget|$)/gi;
  let dayMatch;
  
  while ((dayMatch = dayPattern.exec(text)) !== null) {
    const dayNumber = parseInt(dayMatch[1]);
    const dayContent = dayMatch[2];
    
    if (dayNumber <= totalDays) {
      // Parse activities from this day's content
      const dayActivities = parseActivitiesFromDayContent(dayContent, dayNumber, destination);
      activities.push(...dayActivities);
      
      // Update activity IDs
      dayActivities.forEach(activity => {
        activity.id = activityId++;
      });
    }
  }
  
  // If no structured days found, try alternative parsing
  if (activities.length === 0) {
    const alternativeActivities = parseAlternativeFormat(text, destination, totalDays);
    activities.push(...alternativeActivities);
  }
  
  return { activities, overview };
}

function parseActivitiesFromDayContent(dayContent: string, day: number, destination: string) {
  const activities = [];
  
  // Look for time-based activities: Morning: Activity - Description
  const timePattern = /(Morning|Afternoon|Evening|Night):\s*([^-\n]+)\s*-\s*([^\n]+)/gi;
  let timeMatch;
  
  while ((timeMatch = timePattern.exec(dayContent)) !== null) {
    const timeOfDay = timeMatch[1];
    const activityTitle = timeMatch[2].trim();
    const activityDescription = timeMatch[3].trim();
    
    if (activityTitle.length > 3) {
      const activity = {
        id: 0, // Will be set later
        day,
        title: activityTitle.slice(0, 100),
        type: determineActivityType(activityTitle, activityDescription),
        time: getTimeForPeriod(timeOfDay),
        location: extractLocationFromDescription(activityDescription) || destination,
        cost: extractCostFromLine(activityDescription) || generateEstimatedCost('activity', activityTitle.length),
        description: activityDescription.slice(0, 500),
        priority: determinePriority('activity', activityDescription),
        tips: extractTipsFromLine(activityDescription)
      };
      activities.push(activity);
    }
  }
  
  return activities;
}

function parseAlternativeFormat(text: string, destination: string, totalDays: number) {
  const activities = [];
  let currentDay = 1;
  let activityId = 1;
  
  const lines = text.split('\n').filter(line => line.trim());
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;
    
    // Check for day indicators
    const dayMatch = trimmedLine.match(/Day\s+(\d+)/i);
    if (dayMatch) {
      currentDay = parseInt(dayMatch[1]);
      continue;
    }
    
    // Look for activity lines with time patterns
    const activityMatch = trimmedLine.match(/(Morning|Afternoon|Evening|Night):\s*([^-]+)\s*-\s*(.+)/i);
    if (activityMatch && currentDay <= totalDays) {
      const timeOfDay = activityMatch[1];
      const activityTitle = activityMatch[2].trim();
      const activityDescription = activityMatch[3].trim();
      
      if (activityTitle.length > 3) {
        const activity = {
          id: activityId++,
          day: currentDay,
          title: activityTitle.slice(0, 100),
          type: determineActivityType(activityTitle, activityDescription),
          time: getTimeForPeriod(timeOfDay),
          location: extractLocationFromDescription(activityDescription) || destination,
          cost: extractCostFromLine(activityDescription) || generateEstimatedCost('activity', activityTitle.length),
          description: activityDescription.slice(0, 500),
          priority: determinePriority('activity', activityDescription),
          tips: extractTipsFromLine(activityDescription)
        };
        activities.push(activity);
      }
    }
  }
  
  return activities;
}

function getTimeForPeriod(period: string): string {
  switch (period.toLowerCase()) {
    case 'morning': return '9:00 AM - 12:00 PM';
    case 'afternoon': return '1:00 PM - 5:00 PM';
    case 'evening': return '6:00 PM - 9:00 PM';
    case 'night': return '8:00 PM - 11:00 PM';
    default: return '10:00 AM - 12:00 PM';
  }
}

function extractLocationFromDescription(description: string): string | null {
  // Look for location indicators in the description
  const locationMatch = description.match(/(?:at|in|to|visit)\s+([^,.!?;:\(\)]+)/i);
  if (locationMatch) {
    return locationMatch[1].trim().slice(0, 100);
  }
  return null;
}



function determineActivityType(title: string, fullLine: string): string {
  const titleLower = title.toLowerCase();
  const fullLineLower = fullLine.toLowerCase();
  
  if (titleLower.includes('hotel') || titleLower.includes('check') || 
      titleLower.includes('accommodation') || titleLower.includes('stay') ||
      titleLower.includes('resort') || titleLower.includes('lodge')) {
    return 'accommodation';
  }
  if (titleLower.includes('dinner') || titleLower.includes('lunch') || 
      titleLower.includes('breakfast') || titleLower.includes('restaurant') || 
      titleLower.includes('food') || titleLower.includes('eat') || 
      titleLower.includes('meal') || titleLower.includes('cafe') ||
      titleLower.includes('dining')) {
    return 'restaurant';
  }
  if (titleLower.includes('flight') || titleLower.includes('transport') || 
      titleLower.includes('travel') || titleLower.includes('airport') || 
      titleLower.includes('train') || titleLower.includes('bus') || 
      titleLower.includes('taxi') || titleLower.includes('drive') ||
      titleLower.includes('transfer')) {
    return 'transport';
  }
  if (titleLower.includes('shopping') || titleLower.includes('market') ||
      titleLower.includes('boutique') || titleLower.includes('store')) {
    return 'shopping';
  }
  return 'activity';
}

function extractCostFromLine(line: string): number | null {
  const costMatch = line.match(/\$(\d+(?:,\d{3})*(?:\.\d{2})?)/);
  if (costMatch) {
    return parseInt(costMatch[1].replace(/,/g, ''));
  }
  return null;
}

function extractLocationFromLine(line: string): string | null {
  // Look for location indicators
  const locationMatch = line.match(/(?:at|in|to|visit)\s+([^,.!?;:\(\)]+)/i);
  if (locationMatch) {
    return locationMatch[1].trim().slice(0, 100);
  }
  return null;
}

function generateEstimatedCost(type: string, seed: number): number {
  // Use title length as seed for deterministic pseudo-random
  const pseudoRandom = (seed * 9301 + 49297) % 233280 / 233280;
  
  switch (type) {
    case 'accommodation': return 0; // Usually pre-paid
    case 'restaurant': return Math.floor(pseudoRandom * 80) + 25; // $25-105
    case 'activity': return Math.floor(pseudoRandom * 60) + 20; // $20-80
    case 'transport': return Math.floor(pseudoRandom * 50) + 15; // $15-65
    case 'shopping': return Math.floor(pseudoRandom * 100) + 30; // $30-130
    default: return Math.floor(pseudoRandom * 40) + 15; // $15-55
  }
}

function determinePriority(type: string, line: string): string {
  if (type === 'accommodation' || type === 'transport') return 'high';
  if (line.toLowerCase().includes('must') || line.toLowerCase().includes('essential')) return 'high';
  if (line.toLowerCase().includes('optional') || line.toLowerCase().includes('if time')) return 'low';
  return 'medium';
}

function extractTipsFromLine(line: string): string {
  // Look for tip indicators
  const tipMatch = line.match(/(?:tip|note|remember|don't forget|be sure to)[:\s]+([^.!?]+)/i);
  if (tipMatch) {
    return tipMatch[1].trim();
  }
  return '';
}

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

**IMPORTANT: Format the response EXACTLY as follows:**

**Trip Overview:**
[Write a compelling overview that references their specific goals and desires]

**Day 1 (${startDate}):**
Morning: [Activity name] - [Description with location and details]
Afternoon: [Activity name] - [Description with location and details]
Evening: [Activity name] - [Description with location and details]

**Day 2:**
Morning: [Activity name] - [Description with location and details]
Afternoon: [Activity name] - [Description with location and details]
Evening: [Activity name] - [Description with location and details]

[Continue this pattern for all ${days} days]

**Budget Breakdown:**
- Accommodation: $[amount]
- Dining: $[amount]
- Activities: $[amount]
- Transportation: $[amount]
- Total: $[amount]

**Local Insights:**
[Cultural tips and insider knowledge]

Make this itinerary feel like it was crafted specifically for their vision and preferences!`;

    console.log('Calling Anthropic API for destination:', destination);
    console.log('Request details:', { destination, days, travelers, budget, travelStyle });
    
    let itinerary = '';
    let parsedData = { activities: [], overview: '' };
    
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
      
      // Parse the AI response into structured activities
      parsedData = parseAIItinerary(itinerary, destination, days);
      
      console.log('Parsed', parsedData.activities.length, 'activities from AI response');
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
      activities: parsedData.activities,
      overview: parsedData.overview,
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
} // Updated at Sun Aug  3 11:28:32 EDT 2025
