import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { documentId, accessToken } = await request.json();

    if (!documentId || !accessToken) {
      return NextResponse.json(
        { error: 'Document ID and access token are required' },
        { status: 400 }
      );
    }

    // Fetch document content from Google Docs API
    const response = await fetch(
      `https://docs.googleapis.com/v1/documents/${documentId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: 'Failed to fetch document', details: error },
        { status: response.status }
      );
    }

    const document = await response.json();
    
    // Extract text content from Google Doc
    const textContent = extractTextContent(document);
    
    // Parse the text into itinerary format
    const parsedItinerary = parseGoogleDocItinerary(textContent);

    return NextResponse.json({
      success: true,
      documentTitle: document.title,
      textContent,
      itinerary: parsedItinerary
    });

  } catch (error) {
    console.error('Error importing Google Doc:', error);
    return NextResponse.json(
      { error: 'Failed to import Google Doc', details: error.message },
      { status: 500 }
    );
  }
}

function extractTextContent(document: any): string {
  let content = '';
  
  if (document.body && document.body.content) {
    for (const element of document.body.content) {
      if (element.paragraph) {
        for (const paragraphElement of element.paragraph.elements) {
          if (paragraphElement.textRun) {
            content += paragraphElement.textRun.content;
          }
        }
      }
    }
  }
  
  return content;
}

function parseGoogleDocItinerary(text: string) {
  if (!text) return { activities: [], overview: '' };
  
  const activities = [];
  let activityId = 1;
  let overview = '';
  let currentDay = 1;
  
  // Extract trip overview first
  const overviewMatch = text.match(/trip overview[:\n](.+?)(?=day \d+|$)/i);
  if (overviewMatch) {
    overview = overviewMatch[1].trim();
  }
  
  // Split by days - handle different day formats
  const dayPattern = /(?:^|\n)(?:day\s+(\d+)|(\d+)\.\s*day|\*\*day\s+(\d+))/gi;
  const dayMatches = text.split(dayPattern).filter(section => section && section.trim());
  
  let currentDaySection = '';
  let extractedDay = 1;
  
  for (let i = 0; i < dayMatches.length; i++) {
    const section = dayMatches[i];
    
    // Check if this is a day number
    if (/^\d+$/.test(section.trim())) {
      extractedDay = parseInt(section.trim());
      continue;
    }
    
    // Check if this is a day section
    if (section.includes('day') || section.includes('Day')) {
      currentDaySection = section;
      continue;
    }
    
    // Parse activities in this section
    const sectionActivities = parseActivitiesFromSection(section, extractedDay);
    activities.push(...sectionActivities);
    
    // Update activity IDs
    sectionActivities.forEach(activity => {
      activity.id = activityId++;
    });
  }
  
  // If no structured days found, try to parse as a simple list
  if (activities.length === 0) {
    const lines = text.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;
      
      // Skip headers and overview
      if (trimmedLine.toLowerCase().includes('itinerary') || 
          trimmedLine.toLowerCase().includes('trip overview')) {
        continue;
      }
      
      // Try to extract activity information
      const activity = parseActivityFromLine(trimmedLine, currentDay, activityId);
      if (activity) {
        activities.push(activity);
        activityId++;
      }
    }
  }
  
  return { activities, overview };
}

function parseActivitiesFromSection(section: string, day: number) {
  const activities = [];
  const lines = section.split('\n').filter(line => line.trim());
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;
    
    const activity = parseActivityFromLine(trimmedLine, day, activities.length + 1);
    if (activity) {
      activities.push(activity);
    }
  }
  
  return activities;
}

function parseActivityFromLine(line: string, day: number, id: number) {
  // Skip empty lines or pure headers
  if (!line.trim() || line.trim().length < 5) return null;
  
  // Extract time pattern
  const timePattern = /(morning|afternoon|evening|night|\d{1,2}:\d{2}\s*(?:am|pm)?|\d{1,2}\s*(?:am|pm))/i;
  const timeMatch = line.match(timePattern);
  
  // Extract title - everything before first dash, colon, or parenthesis
  let title = line.replace(/^\*+\s*/, '').replace(/^-+\s*/, '').trim();
  title = title.split(/[-:(]/)[0].trim();
  
  // Skip if title is too short or looks like a header
  if (title.length < 3 || title.toLowerCase().includes('day')) return null;
  
  // Determine activity type
  const type = determineActivityType(title, line);
  
  // Extract cost
  const cost = extractCostFromLine(line);
  
  // Extract location if mentioned
  const location = extractLocationFromLine(line) || 'Destination';
  
  // Get default time based on type
  const time = timeMatch ? formatTime(timeMatch[0]) : getDefaultTime(type);
  
  return {
    id,
    day,
    title,
    type,
    time,
    location,
    cost: cost || generateEstimatedCost(type, id),
    description: line.trim(),
    priority: determinePriority(type, line),
    tips: ''
  };
}

function determineActivityType(title: string, fullLine: string): string {
  const titleLower = title.toLowerCase();
  const fullLineLower = fullLine.toLowerCase();
  
  if (titleLower.includes('hotel') || titleLower.includes('check') || 
      titleLower.includes('accommodation') || titleLower.includes('stay')) {
    return 'accommodation';
  }
  if (titleLower.includes('dinner') || titleLower.includes('lunch') || 
      titleLower.includes('breakfast') || titleLower.includes('restaurant') || 
      titleLower.includes('food') || titleLower.includes('eat') || 
      titleLower.includes('meal')) {
    return 'restaurant';
  }
  if (titleLower.includes('flight') || titleLower.includes('transport') || 
      titleLower.includes('travel') || titleLower.includes('airport') || 
      titleLower.includes('train') || titleLower.includes('bus') || 
      titleLower.includes('taxi') || titleLower.includes('drive')) {
    return 'transport';
  }
  return 'activity';
}

function extractCostFromLine(line: string): number | null {
  const costMatch = line.match(/\$(\d+(?:\.\d{2})?)/);
  return costMatch ? parseFloat(costMatch[1]) : null;
}

function extractLocationFromLine(line: string): string | null {
  // Look for location patterns like "at Location", "in Location", "Location:"
  const locationPatterns = [
    /(?:at|in|@)\s+([A-Za-z\s]+?)(?:\s*-|\s*\(|$)/i,
    /^([A-Za-z\s]+?):\s*/i
  ];
  
  for (const pattern of locationPatterns) {
    const match = line.match(pattern);
    if (match && match[1] && match[1].trim().length > 2) {
      return match[1].trim();
    }
  }
  
  return null;
}

function formatTime(timeStr: string): string {
  const timeLower = timeStr.toLowerCase();
  if (timeLower === 'morning') return '9:00 AM - 12:00 PM';
  if (timeLower === 'afternoon') return '1:00 PM - 5:00 PM';
  if (timeLower === 'evening') return '6:00 PM - 9:00 PM';
  if (timeLower === 'night') return '9:00 PM - 11:00 PM';
  return timeStr;
}

function getDefaultTime(type: string): string {
  switch (type) {
    case 'accommodation': return '3:00 PM - 4:00 PM';
    case 'restaurant': return '7:00 PM - 9:00 PM';
    case 'activity': return '10:00 AM - 12:00 PM';
    case 'transport': return '8:00 AM - 9:00 AM';
    default: return '10:00 AM - 12:00 PM';
  }
}

function determinePriority(type: string, text: string): string {
  if (type === 'accommodation' || text.toLowerCase().includes('must') || 
      text.toLowerCase().includes('essential') || text.toLowerCase().includes('important')) {
    return 'high';
  }
  if (text.toLowerCase().includes('optional') || text.toLowerCase().includes('if time') || 
      text.toLowerCase().includes('maybe')) {
    return 'low';
  }
  return 'medium';
}

function generateEstimatedCost(type: string, activityId: number): number {
  // Use deterministic pseudo-random based on activity ID
  const seed = activityId;
  const pseudoRandom = (seed * 9301 + 49297) % 233280 / 233280;
  
  switch (type) {
    case 'accommodation': return 0; // Usually pre-paid
    case 'restaurant': return Math.floor(pseudoRandom * 60) + 20; // $20-80
    case 'activity': return Math.floor(pseudoRandom * 40) + 15; // $15-55
    case 'transport': return Math.floor(pseudoRandom * 30) + 10; // $10-40
    default: return Math.floor(pseudoRandom * 25) + 10; // $10-35
  }
} 