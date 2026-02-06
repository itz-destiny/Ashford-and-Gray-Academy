import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    // Clear any server-side session cookies if you have them
    const response = NextResponse.redirect(new URL('/login', req.url));

    // Clear auth cookies
    response.cookies.delete('session');
    response.cookies.delete('token');

    return response;
}

export async function POST(req: NextRequest) {
    // For client-side logout, just return success
    // The actual logout happens on the client via Firebase auth.signOut()
    return NextResponse.json({ success: true });
}
