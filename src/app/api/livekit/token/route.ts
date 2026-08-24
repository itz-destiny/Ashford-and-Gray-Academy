import { NextResponse } from 'next/server';

// LiveKit integration removed. Keep a lightweight route so generated
// Next types that reference this path continue to resolve.
export const POST = async () => {
    return NextResponse.json({ error: 'LiveKit integration removed' }, { status: 410 });
};
