
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
export async function GET() {
    try {
        const docRef = doc(db, "config", "debug_test");
        // Try Write
        await setDoc(docRef, { timestamp: new Date().toISOString(), status: "ok" });
        // Try Read
        const docSnap = await getDoc(docRef);
        // Try Read Settings
        const settingsRef = doc(db, "config", "settings");
        const settingsSnap = await getDoc(settingsRef);
        return NextResponse.json({
            status: "success",
            writeTest: "ok",
            readTest: docSnap.exists() ? "ok" : "missing",
            settingsRead: settingsSnap.exists() ? "found" : "missing",
            data: settingsSnap.data()
        });
    } catch (e: any) {
        return NextResponse.json({
            status: "error",
            code: e.code,
            message: e.message,
            stack: e.stack
        }, { status: 500 });
    }
}
