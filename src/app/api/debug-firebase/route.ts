import { NextRequest, NextResponse } from 'next/server';
// Direct REST API URL for Firebase Realtime Database
// Using the URL provided by the user
const FIREBASE_DB_URL = 'https://otp-drotes-default-rtdb.firebaseio.com';
export async function GET() {
    const results = {
        method: 'REST API',
        step1_write: 'pending',
        step2_read: 'pending',
        error: null as any
    };
    try {
        // Step 1: Write Test via REST
        results.step1_write = 'attempting...';
        const timestamp = Date.now();
        const writeRes = await fetch(`${FIREBASE_DB_URL}/debug/connection_test.json`, {
            method: 'PUT',
            body: JSON.stringify({
                status: 'online_rest',
                timestamp: timestamp
            })
        });
        if (!writeRes.ok) {
            throw new Error(`Write failed: ${writeRes.status} ${writeRes.statusText}`);
        }
        results.step1_write = 'success';
        // Step 2: Read Test via REST
        results.step2_read = 'attempting...';
        const readRes = await fetch(`${FIREBASE_DB_URL}/debug/connection_test.json`);
        if (!readRes.ok) {
            throw new Error(`Read failed: ${readRes.status} ${readRes.statusText}`);
        }
        const data = await readRes.json();
        if (data && data.timestamp === timestamp) {
            results.step2_read = 'success';
        } else {
            results.step2_read = 'failed: data mismatch';
        }
        return NextResponse.json({ success: true, results });
    } catch (error: any) {
        results.error = error.message || String(error);
        return NextResponse.json({ success: false, results }, { status: 500 });
    }
}
