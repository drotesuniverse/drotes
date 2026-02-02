import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';

// Re-implement init logic to test it directly
function getDb() {
    try {
        if (!getApps().length) {
            if (process.env.FIREBASE_SERVICE_ACCOUNT) {
                const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
                initializeApp({
                    credential: cert(serviceAccount),
                    databaseURL: 'https://otp-drotes-default-rtdb.firebaseio.com'
                });
            } else {
                initializeApp({
                    databaseURL: 'https://otp-drotes-default-rtdb.firebaseio.com'
                });
            }
        }
        return getDatabase();
    } catch (e) {
        throw e;
    }
}

export async function GET() {
    const results = {
        step1_init: 'pending',
        step2_write: 'pending',
        step3_read: 'pending',
        error: null as any
    };

    try {
        // Step 1: Init
        const db = getDb();
        results.step1_init = 'success';

        // Step 2: Write Test
        const testRef = db.ref('debug/connection_test');
        const timestamp = Date.now();
        await testRef.set({
            status: 'online',
            timestamp: timestamp
        });
        results.step2_write = 'success';

        // Step 3: Read Test
        const snapshot = await testRef.once('value');
        const val = snapshot.val();

        if (val && val.timestamp === timestamp) {
            results.step3_read = 'success';
        } else {
            results.step3_read = 'failed: data mismatch';
        }

        return NextResponse.json({ success: true, results });

    } catch (error: any) {
        results.error = error.message || error;
        return NextResponse.json({ success: false, results }, { status: 500 });
    }
}
