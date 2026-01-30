import { NextResponse } from 'next/server';
import crypto from 'crypto';

const SECRET = process.env.OTP_SECRET || 'drotes-otp-secret-key-2026';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, code } = body;

        if (!email || !code) {
            return NextResponse.json({ success: false, message: 'Email and Code are required' }, { status: 400 });
        }

        // 1. Get Hash from Cookie
        const cookie = request.headers.get('cookie') || '';
        const match = cookie.match(/drotes_otp_hash=([^;]+)/);

        if (!match) {
            return NextResponse.json({ success: false, message: 'Session expired or invalid. Please request a new code.' }, { status: 400 });
        }

        const [hash, expiresAt, storedEmail] = match[1].split('.');

        // 2. Validate Expiry & Email
        if (Date.now() > parseInt(expiresAt)) {
            return NextResponse.json({ success: false, message: 'Code expired. Please request a new code.' }, { status: 400 });
        }

        if (storedEmail !== email) {
            return NextResponse.json({ success: false, message: 'Email mismatch.' }, { status: 400 });
        }

        // 3. Re-Hash Input to Verify
        const dataToHash = `${email}:${code}:${expiresAt}`;
        const validHash = crypto.createHmac('sha256', SECRET).update(dataToHash).digest('hex');

        if (hash !== validHash) {
            return NextResponse.json({ success: false, message: 'Invalid Verification Code.' }, { status: 400 });
        }

        // 4. Success! (Clear Cookie)
        const response = NextResponse.json({ success: true, message: 'Verified' });
        response.cookies.delete('drotes_otp_hash');

        return response;

    } catch (error) {
        console.error('OTP Verify Error:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
