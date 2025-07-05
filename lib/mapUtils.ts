export interface MapExtractedData {
  distance?: string;
  time?: string;
  from?: string;
  to?: string;
  error?: string;
}

/**
 * Extract time and distance information from a Google Maps link
 * @param googleMapLink - The Google Maps URL
 * @returns Extracted distance and time information
 */
export function extractFromGoogleMapLink(googleMapLink: string): MapExtractedData {
  if (!googleMapLink || !googleMapLink.includes('maps') || !googleMapLink.includes('google')) {
    return { error: 'Invalid Google Maps link' };
  }

  try {
    const url = new URL(googleMapLink);
    const params = new URLSearchParams(url.search);
    
    // Try to extract from different Google Maps URL formats
    const result: MapExtractedData = {};
    
    // Format 1: Check for directions URL with saddr and daddr
    if (params.has('saddr') && params.has('daddr')) {
      result.from = params.get('saddr') || '';
      result.to = params.get('daddr') || '';
    }
    
    // Format 2: Check for /dir/ in the path (directions)
    if (url.pathname.includes('/dir/')) {
      const pathParts = url.pathname.split('/');
      const dirIndex = pathParts.indexOf('dir');
      if (dirIndex !== -1 && dirIndex + 1 < pathParts.length) {
        const locations = pathParts[dirIndex + 1].split('/');
        if (locations.length >= 2) {
          result.from = decodeURIComponent(locations[0]);
          result.to = decodeURIComponent(locations[1]);
        }
      }
    }
    
    // Format 3: Check for data parameter (contains route info)
    if (params.has('data')) {
      const dataParam = params.get('data');
      if (dataParam) {
        // This is a more complex format, try to extract basic info
        const decodedData = decodeURIComponent(dataParam);
        // Look for patterns that might indicate distance/time
        const distanceMatch = decodedData.match(/(\d+(?:\.\d+)?)\s*(km|mi|miles|kilometers)/i);
        const timeMatch = decodedData.match(/(\d+)\s*(min|minutes|hrs|hours|h|m)/i);
        
        if (distanceMatch) {
          result.distance = `${distanceMatch[1]} ${distanceMatch[2]}`;
        }
        if (timeMatch) {
          result.time = `${timeMatch[1]} ${timeMatch[2]}`;
        }
      }
    }
    
    // If we couldn't extract time/distance, provide estimates based on common patterns
    if (!result.distance && !result.time && (result.from || result.to)) {
      // Try to make educated guesses based on location names
      result.distance = 'Distance not available';
      result.time = 'Time not available';
    }
    
    return result;
    
  } catch (error) {
    console.error('Error parsing Google Maps link:', error);
    return { error: 'Failed to parse Google Maps link' };
  }
}

/**
 * Validate if a URL is a valid Google Maps link
 * @param url - The URL to validate
 * @returns boolean indicating if it's a valid Google Maps link
 */
export function isValidGoogleMapLink(url: string): boolean {
  if (!url) return false;
  
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes('maps.google') || 
           urlObj.hostname.includes('google.com') && urlObj.pathname.includes('/maps');
  } catch {
    return false;
  }
}

/**
 * Format extracted time and distance for display
 * @param extractedData - The extracted data from Google Maps
 * @returns Formatted string for display
 */
export function formatExtractedData(extractedData: MapExtractedData): string {
  if (extractedData.error) {
    return `Error: ${extractedData.error}`;
  }
  
  const parts: string[] = [];
  
  if (extractedData.distance && extractedData.distance !== 'Distance not available') {
    parts.push(`Distance: ${extractedData.distance}`);
  }
  
  if (extractedData.time && extractedData.time !== 'Time not available') {
    parts.push(`Time: ${extractedData.time}`);
  }
  
  if (extractedData.from && extractedData.to) {
    parts.push(`Route: ${extractedData.from} → ${extractedData.to}`);
  }
  
  return parts.length > 0 ? parts.join(' • ') : 'No route information available';
}

/**
 * Extract time and distance from Google Maps URL and return formatted strings
 * @param googleMapLink - The Google Maps URL
 * @returns Object with formatted distance and time strings
 */
export function extractTimeAndDistance(googleMapLink: string): { distance: string; time: string } {
  const extracted = extractFromGoogleMapLink(googleMapLink);
  
  return {
    distance: extracted.distance || 'Not available',
    time: extracted.time || 'Not available'
  };
} 