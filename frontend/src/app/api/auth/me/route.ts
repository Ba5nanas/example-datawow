import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export async function GET(request: NextRequest) {
  try {
    // Get JWT token from httpOnly cookie
    const cookieStore = await cookies();
    const jwtToken = cookieStore.get('jwt')?.value;

    if (!jwtToken) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Validate JWT token with backend
    const response = await fetch(`${API_BASE_URL}/auth/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get user data from cookie
    const userData = cookieStore.get('userData')?.value;

    if (!userData) {
      return NextResponse.json(
        { success: false, error: 'User data not found' },
        { status: 401 }
      );
    }

    const user = JSON.parse(userData);

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get current user' },
      { status: 500 }
    );
  }
}
