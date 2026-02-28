import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Call backend API with new JWT endpoint
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { success: false, error: errorData.message || 'Registration failed' },
        { status: response.status }
      );
    }

    const user = await response.json();

    // Set JWT cookie (for middleware)
    const cookieStore = await cookies();
    cookieStore.set('jwt', user.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    // Store user data in cookie (for middleware)
    cookieStore.set('userData', JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
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
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      access_token: user.access_token,
    });

    return nextResponse;
  } catch (error) {
    console.error('Register API error:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}
