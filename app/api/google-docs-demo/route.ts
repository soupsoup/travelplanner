import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { documentId } = await request.json();

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    // For demo purposes, return sample itinerary data
    const sampleItinerary = {
      activities: [
        {
          id: 1,
          day: 1,
          title: "Arrival at Airport",
          type: "transport",
          time: "10:00 AM - 11:00 AM",
          location: "International Airport",
          cost: 50,
          description: "Land at the international airport and take transportation to hotel",
          priority: "high",
          tips: "Book airport transfer in advance for better rates"
        },
        {
          id: 2,
          day: 1,
          title: "Hotel Check-in",
          type: "accommodation",
          time: "3:00 PM - 4:00 PM",
          location: "Downtown Hotel",
          cost: 0,
          description: "Check into your downtown hotel room",
          priority: "high",
          tips: "Early check-in may be available if you call ahead"
        },
        {
          id: 3,
          day: 1,
          title: "Welcome Dinner",
          type: "restaurant",
          time: "7:00 PM - 9:00 PM",
          location: "Local Restaurant",
          cost: 45,
          description: "Enjoy a traditional welcome dinner at a local restaurant",
          priority: "medium",
          tips: "Try the local specialties and ask for recommendations"
        },
        {
          id: 4,
          day: 2,
          title: "City Walking Tour",
          type: "activity",
          time: "9:00 AM - 12:00 PM",
          location: "Historic Downtown",
          cost: 25,
          description: "Guided walking tour through the historic city center",
          priority: "high",
          tips: "Wear comfortable walking shoes and bring water"
        },
        {
          id: 5,
          day: 2,
          title: "Museum Visit",
          type: "activity",
          time: "2:00 PM - 5:00 PM",
          location: "National Museum",
          cost: 15,
          description: "Explore the national museum with art and history exhibits",
          priority: "medium",
          tips: "Audio guides are available for an enhanced experience"
        },
        {
          id: 6,
          day: 2,
          title: "Sunset Dinner Cruise",
          type: "restaurant",
          time: "6:30 PM - 9:30 PM",
          location: "Harbor",
          cost: 85,
          description: "Romantic dinner cruise with sunset views over the harbor",
          priority: "medium",
          tips: "Bring a light jacket as it can get windy on the water"
        },
        {
          id: 7,
          day: 3,
          title: "Market Visit",
          type: "activity",
          time: "8:00 AM - 11:00 AM",
          location: "Local Market",
          cost: 20,
          description: "Browse the bustling local market for souvenirs and local products",
          priority: "medium",
          tips: "Bargaining is expected - start at 50% of the asking price"
        },
        {
          id: 8,
          day: 3,
          title: "Beach Relaxation",
          type: "activity",
          time: "12:00 PM - 5:00 PM",
          location: "Sunny Beach",
          cost: 0,
          description: "Relax and unwind at the beautiful sandy beach",
          priority: "low",
          tips: "Don't forget sunscreen and stay hydrated"
        },
        {
          id: 9,
          day: 3,
          title: "Farewell Dinner",
          type: "restaurant",
          time: "7:00 PM - 9:00 PM",
          location: "Rooftop Restaurant",
          cost: 65,
          description: "Final dinner with panoramic city views from rooftop restaurant",
          priority: "high",
          tips: "Make reservations in advance - this place gets busy"
        }
      ],
      overview: "A 3-day cultural and relaxing getaway combining city exploration, museum visits, and beach relaxation. Perfect for first-time visitors who want to experience both the cultural heritage and natural beauty of the destination."
    };

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    return NextResponse.json({
      success: true,
      documentTitle: "Sample Travel Itinerary",
      textContent: generateTextContent(sampleItinerary),
      itinerary: sampleItinerary
    });

  } catch (error) {
    console.error('Error in demo import:', error);
    return NextResponse.json(
      { error: 'Demo import failed', details: error.message },
      { status: 500 }
    );
  }
}

function generateTextContent(itinerary: any): string {
  let content = `Trip Overview:\n${itinerary.overview}\n\n`;
  
  const dayGroups = itinerary.activities.reduce((groups: any, activity: any) => {
    const day = activity.day;
    if (!groups[day]) groups[day] = [];
    groups[day].push(activity);
    return groups;
  }, {});

  Object.keys(dayGroups).sort((a, b) => parseInt(a) - parseInt(b)).forEach(day => {
    content += `Day ${day}\n`;
    dayGroups[day].forEach((activity: any) => {
      content += `- ${activity.title} (${activity.time}) - $${activity.cost}\n`;
      content += `  ${activity.description}\n`;
      if (activity.tips) {
        content += `  Tip: ${activity.tips}\n`;
      }
      content += '\n';
    });
  });

  return content;
} 