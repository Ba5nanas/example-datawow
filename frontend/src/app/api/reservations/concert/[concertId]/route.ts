import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://concert-backend:3000';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ concertId: string }> }
) {
  try {
    // Await params in Next.js 15+
    const { concertId } = await params;

    const response = await fetch(`${API_BASE_URL}/reservations/concert/${concertId}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json(
        { message: 'Failed to fetch concert reservations' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching concert reservations:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
