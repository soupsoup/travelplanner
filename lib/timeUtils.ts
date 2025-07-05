// Time parsing and sorting utilities

export interface TimeRange {
  start: Date;
  end: Date;
  original: string;
}

export function parseTimeString(timeStr: string): TimeRange | null {
  if (!timeStr) return null;

  // Handle different time formats
  const cleanTime = timeStr.toLowerCase().trim();

  // Handle time ranges like "9:00 AM - 12:00 PM"
  if (cleanTime.includes(' - ')) {
    const [startStr, endStr] = cleanTime.split(' - ');
    const start = parseToDate(startStr.trim());
    const end = parseToDate(endStr.trim());
    
    if (start && end) {
      return { start, end, original: timeStr };
    }
  }

  // Handle single times like "9:00 AM"
  const singleTime = parseToDate(cleanTime);
  if (singleTime) {
    const end = new Date(singleTime);
    end.setHours(end.getHours() + 1); // Default 1 hour duration
    return { start: singleTime, end, original: timeStr };
  }

  // Handle named times
  const namedTime = parseNamedTime(cleanTime);
  if (namedTime) {
    return namedTime;
  }

  return null;
}

function parseToDate(timeStr: string): Date | null {
  const baseDate = new Date();
  baseDate.setSeconds(0);
  baseDate.setMilliseconds(0);

  // Match patterns like "9:00 AM", "14:30", "9am", etc.
  const patterns = [
    /(\d{1,2}):(\d{2})\s*(am|pm)/i,
    /(\d{1,2})\s*(am|pm)/i,
    /(\d{1,2}):(\d{2})/,
    /(\d{1,2})/
  ];

  for (const pattern of patterns) {
    const match = timeStr.match(pattern);
    if (match) {
      let hours = parseInt(match[1]);
      const minutes = match[2] ? parseInt(match[2]) : 0;
      const period = match[3] || match[2]; // For cases where am/pm is in position 2

      if (period && period.toLowerCase().includes('pm') && hours !== 12) {
        hours += 12;
      } else if (period && period.toLowerCase().includes('am') && hours === 12) {
        hours = 0;
      }

      if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
        baseDate.setHours(hours, minutes);
        return baseDate;
      }
    }
  }

  return null;
}

function parseNamedTime(timeStr: string): TimeRange | null {
  const baseDate = new Date();
  
  if (timeStr.includes('morning')) {
    return {
      start: new Date(baseDate.setHours(9, 0)),
      end: new Date(baseDate.setHours(12, 0)),
      original: timeStr
    };
  }
  
  if (timeStr.includes('afternoon')) {
    return {
      start: new Date(baseDate.setHours(13, 0)),
      end: new Date(baseDate.setHours(17, 0)),
      original: timeStr
    };
  }
  
  if (timeStr.includes('evening')) {
    return {
      start: new Date(baseDate.setHours(18, 0)),
      end: new Date(baseDate.setHours(21, 0)),
      original: timeStr
    };
  }

  if (timeStr.includes('night')) {
    return {
      start: new Date(baseDate.setHours(21, 0)),
      end: new Date(baseDate.setHours(23, 59)),
      original: timeStr
    };
  }

  return null;
}

export function sortActivitiesByTime(activities: any[]): any[] {
  return activities.sort((a, b) => {
    const timeA = parseTimeString(a.time);
    const timeB = parseTimeString(b.time);

    // If we can't parse times, maintain original order
    if (!timeA && !timeB) return 0;
    if (!timeA) return 1; // Put unparseable times at the end
    if (!timeB) return -1;

    // Compare start times
    return timeA.start.getTime() - timeB.start.getTime();
  });
}

export function getTimeMinutes(timeStr: string): number {
  const parsed = parseTimeString(timeStr);
  if (!parsed) return 0;
  
  return parsed.start.getHours() * 60 + parsed.start.getMinutes();
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours} hr`;
  return `${hours} hr ${mins} min`;
}

// Distance calculation utilities
export interface LocationDistance {
  distance: number; // in miles
  duration: number; // in minutes
  mode: 'driving' | 'walking' | 'transit';
}

export function calculateStraightLineDistance(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

export function estimateDistanceFromLocations(fromLocation: string, toLocation: string): LocationDistance {
  // This is a basic estimation - in a real app you'd use Google Maps API
  // For now, estimate based on location type and distance patterns
  
  const fromLower = fromLocation.toLowerCase();
  const toLower = toLocation.toLowerCase();
  
  // Check if it's the same general area (same city/district)
  const isSameArea = fromLower.includes(toLower) || toLower.includes(fromLower) || 
                     hasSameKeywords(fromLower, toLower);
  
  let distance: number;
  let mode: 'driving' | 'walking' | 'transit' = 'driving';
  
  if (isSameArea) {
    // Within same area - shorter distance
    distance = Math.random() * 2 + 0.3; // 0.3 to 2.3 miles
    if (distance < 0.8) {
      mode = 'walking';
    }
  } else {
    // Different areas - longer distance
    distance = Math.random() * 8 + 1.5; // 1.5 to 9.5 miles
    if (distance > 15) {
      mode = 'transit'; // Use transit for very long distances
    }
  }
  
  // Calculate duration based on mode
  let duration: number;
  switch (mode) {
    case 'walking':
      duration = distance * 15; // 15 minutes per mile walking
      break;
    case 'transit':
      duration = distance * 4 + 10; // 4 min per mile + 10 min wait/transfer time
      break;
    case 'driving':
    default:
      if (distance < 3) {
        duration = distance * 5; // City driving - 5 min per mile
      } else {
        duration = distance * 2.5; // Highway driving - 2.5 min per mile
      }
      break;
  }
  
  return {
    distance: Math.round(distance * 10) / 10,
    duration: Math.round(duration),
    mode
  };
}

function hasSameKeywords(location1: string, location2: string): boolean {
  const keywords1 = location1.split(/[\s,]+/).filter(word => word.length > 2);
  const keywords2 = location2.split(/[\s,]+/).filter(word => word.length > 2);
  
  // Check if they share common location keywords
  return keywords1.some(keyword1 => 
    keywords2.some(keyword2 => 
      keyword1.includes(keyword2) || keyword2.includes(keyword1)
    )
  );
}

export async function getDistanceFromGoogleMaps(
  fromLocation: string,
  toLocation: string
): Promise<LocationDistance | null> {
  // This would make an API call to Google Maps Distance Matrix API
  // For now, return estimated data
  return estimateDistanceFromLocations(fromLocation, toLocation);
} 