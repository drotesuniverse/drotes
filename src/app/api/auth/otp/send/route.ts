import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Secret key for hashing (in production, use an env var)
const SECRET = process.env.OTP_SECRET || 'drotes-otp-secret-key-2026';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });
        }

        // 1. Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // 2. Hash the OTP with the email and expiry
        const expiresAt = Date.now() + 5 * 60 * 1000; // 5 Minutes
        const dataToHash = `${email}:${otp}:${expiresAt}`;
        const hash = crypto.createHmac('sha256', SECRET).update(dataToHash).digest('hex');

        // 3. Simulate Sending Email (Production Grade: Integrate SendGrid/AWS SES here)
        // Since we don't have SMTP creds yet, we log it for the user to verify functionality.
        console.log(`[OTP SYSTEM] Sending Code: ${otp} to ${email}`);

        // 4. Set Cookie with Hash (Stateless Verification)
        const response = NextResponse.json({ success: true, message: 'OTP Sent' });

        response.cookies.set('drotes_otp_hash', `${hash}.${expiresAt}.${email}`, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 300, // 5 minutes
            path: '/',
        });

        return response;

    } catch (error) {
        console.error('OTP Send Error:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
