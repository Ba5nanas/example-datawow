import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Call backend API with new JWT endpoint
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { success: false, error: errorData.message || 'Login failed' },
        { status: response.status }
      );
    }

    const data = await response.json();

    console.log('Backend login response:', data);

    // Set JWT cookie (for middleware)
    const cookieStore = await cookies();
    cookieStore.set('jwt', data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    // Store user data in cookie (for middleware)
    cookieStore.set('userData', JSON.stringify({
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      role: data.user.role,
      createdAt: data.user.createdAt,
      updatedAt: data.user.updatedAt,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    // Create response with token for client-side localStorage
    const nextResponse = NextResponse.json({
      success: true,
      user: data.user,
      access_token: data.access_token,
    });

    console.log('Returning user to client:', data.user);

    return nextResponse;
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
