import { NextRequest, NextResponse } from 'next/server';

// Sample AI response for testing
const sampleAIResponse = `**Trip Overview:**
This 9-day Orlando itinerary is tailored specifically for a family of 4 seeking an adventure-filled theme park experience. With a focus on the world-famous attractions in the area, this trip will immerse you in the magic and excitement that Orlando is renowned for. From thrilling rides to captivating shows, this itinerary promises an unforgettable journey for all ages.

**Day 1 (July 11th):**
Morning: Arrive in Orlando and check into your hotel - Spend some time settling in and exploring the hotel amenities
Afternoon: Head to Magic Kingdom Park at Walt Disney World Resort - Embark on classic rides like Space Mountain, Splash Mountain, and the iconic Haunted Mansion
Evening: Enjoy a delicious dinner at Be Our Guest Restaurant - Don't miss the spectacular fireworks show in the evening

**Day 2 (July 12th):**
Morning: Start your day at Disney's Hollywood Studios - Experience the thrills of Rock 'n' Roller Coaster Starring Aerosmith and the epic Star Wars: Rise of the Resistance attraction
Afternoon: Continue exploring Hollywood Studios - Catch shows like the Indiana Jones Epic Stunt Spectacular and the mesmerizing Beauty and the Beast – Live on Stage
Evening: Head to Disney Springs for an evening of shopping, dining, and entertainment - Catch the captivating Cirque du Soleil show, "Drawn to Life," or enjoy a meal at one of the many restaurants

**Day 3 (July 13th):**
Morning: Spend the day at Universal Studios Florida - Experience the excitement of The Wizarding World of Harry Potter – Diagon Alley and the thrilling Revenge of the Mummy roller coaster
Afternoon: Continue your Universal Studios adventure - Catch shows like the Hilarious Universal's Horror Make-Up Show and the action-packed WaterWorld stunt show
Evening: Enjoy a delicious dinner at the iconic Toothsome Chocolate Emporium & Savory Feast Kitchen - Where you can indulge in decadent desserts and savory dishes

**Budget Breakdown:**
- Accommodation: $1,200
- Dining: $800
- Activities: $600
- Transportation: $200
- Total: $2,800

**Local Insights:**
Orlando offers incredible weather year-round, but July can be hot and humid. Stay hydrated and take breaks in the shade during your theme park visits. Consider purchasing theme park tickets in advance to save time and money. Explore the diverse culinary scene in Orlando, from international flavors to local favorites like Cuban and Southern cuisine.`;

// Copy the parsing functions from the main API
function parseAIItinerary(text: string, destination: string, totalDays: number) {
  if (!text) return { activities: [], overview: '' };
  
  console.log('Parsing AI response, length:', text.length);
  console.log('First 500 chars:', text.substring(0, 500));
  
  const activities = [];
  let activityId = 1;
  let overview = '';
  
  // Extract trip overview first - look for the overview section
  const overviewMatch = text.match(/\*\*Trip Overview:\*\*\s*([^*]+?)(?=\*\*|$)/i);
  if (overviewMatch) {
    overview = overviewMatch[1].trim();
    console.log('Found overview:', overview.substring(0, 200) + '...');
  } else {
    console.log('No overview found with pattern');
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
  let dayCount = 0;
  
  while ((dayMatch = dayPattern.exec(text)) !== null) {
    const dayNumber = parseInt(dayMatch[1]);
    const dayContent = dayMatch[2];
    dayCount++;
    
    console.log(`Found Day ${dayNumber}, content length:`, dayContent.length);
    
    if (dayNumber <= totalDays) {
      // Parse activities from this day's content
      const dayActivities = parseActivitiesFromDayContent(dayContent, dayNumber, destination);
      activities.push(...dayActivities);
      
      console.log(`Parsed ${dayActivities.length} activities for Day ${dayNumber}`);
      
      // Update activity IDs
      dayActivities.forEach(activity => {
        activity.id = activityId++;
      });
    }
  }
  
  console.log(`Total days found: ${dayCount}, total activities: ${activities.length}`);
  
  // If no structured days found, try alternative parsing
  if (activities.length === 0) {
    console.log('No activities found, trying alternative parsing...');
    const alternativeActivities = parseAlternativeFormat(text, destination, totalDays);
    activities.push(...alternativeActivities);
    console.log(`Alternative parsing found ${alternativeActivities.length} activities`);
  }
  
  return { activities, overview };
}

function parseActivitiesFromDayContent(dayContent: string, day: number, destination: string) {
  const activities = [];
  
  console.log(`Parsing day ${day} content:`, dayContent.substring(0, 300) + '...');
  
  // Look for time-based activities: Morning: Activity - Description
  const timePattern = /(Morning|Afternoon|Evening|Night):\s*([^-\n]+)\s*-\s*([^\n]+)/gi;
  let timeMatch;
  let matchCount = 0;
  
  while ((timeMatch = timePattern.exec(dayContent)) !== null) {
    const timeOfDay = timeMatch[1];
    const activityTitle = timeMatch[2].trim();
    const activityDescription = timeMatch[3].trim();
    matchCount++;
    
    console.log(`Found ${timeOfDay} activity: "${activityTitle}" - "${activityDescription.substring(0, 50)}..."`);
    
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
  
  console.log(`Day ${day}: Found ${matchCount} time matches, created ${activities.length} activities`);
  
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

export async function GET(request: NextRequest) {
  console.log('Testing AI parsing logic...');
  
  const destination = 'Orlando, FL';
  const totalDays = 9;
  
  const result = parseAIItinerary(sampleAIResponse, destination, totalDays);
  
  return NextResponse.json({
    success: true,
    original: sampleAIResponse,
    parsed: result,
    summary: {
      overviewLength: result.overview.length,
      activitiesCount: result.activities.length,
      activitiesByDay: result.activities.reduce((acc, activity) => {
        acc[activity.day] = (acc[activity.day] || 0) + 1;
        return acc;
      }, {} as Record<number, number>)
    }
  });
} 