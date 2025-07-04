import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'You must be logged in to create a trip' },
        { status: 401 }
      )
    }

    const data = await request.json()
    const { destination, tripName, startDate, endDate, transportation, description } = data

    // Validate required fields
    if (!destination || !tripName || !startDate || !endDate || !transportation) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create the trip
    const trip = await prisma.trip.create({
      data: {
        destination,
        name: tripName,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        transportation,
        description,
        user: {
          connect: {
            email: session.user.email,
          },
        },
      },
    })

    return NextResponse.json(trip)
  } catch (error) {
    console.error('Error creating trip:', error)
    return NextResponse.json(
      { error: 'Failed to create trip' },
      { status: 500 }
    )
  }
} 