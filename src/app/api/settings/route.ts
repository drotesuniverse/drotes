
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
const DATA_FILE = path.join(process.cwd(), 'src/data/admin-settings.json');
export async function GET() {
    try {
        // 1. Try Reading from Firestore
        try {
            const docRef = doc(db, "config", "settings");
            // TIMEOUT FIX: Fail fast if Firestore hangs (common on serverless cold starts)
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Firestore read timed out")), 1500)
            );
            const docSnap: any = await Promise.race([
                getDoc(docRef),
                timeoutPromise
            ]);
            if (docSnap.exists()) {
                console.log("Settings loaded from Firestore");
                return NextResponse.json(docSnap.data());
            }
        } catch (dbError) {
            console.warn("Firestore read failed/timed out (falling back to file):", dbError);
        }
        // 2. Fallback: Read from local JSON (Initial Seed or Offline dev)
        if (fs.existsSync(DATA_FILE)) {
            console.log("Settings loaded from JSON file (Fallback/Seed)");
            const data = fs.readFileSync(DATA_FILE, 'utf8');
            const jsonData = JSON.parse(data);
            // Optional: Auto-seed Firestore if it was empty (but only if db read didn't fail)
            // We skip this to avoid write errors on read-only environments if not authenticated.
            return NextResponse.json(jsonData);
        }
        return NextResponse.json({});
    } catch (e) {
        console.error("Settings Read Error:", e);
        return NextResponse.json({ error: 'Failed to read settings' }, { status: 500 });
    }
}
export async function POST(req: Request) {
    try {
        const body = await req.json();
        // 1. Write to Firestore (Primary)
        try {
            const docRef = doc(db, "config", "settings");
            await setDoc(docRef, body, { merge: true });
            console.log("Settings saved to Firestore");
        } catch (dbError) {
            console.error("Firestore write failed:", dbError);
            // If Firestore fails, we continue to save to file so local dev still works
        }
        // 2. Write to JSON (Backup / Local Dev)
        try {
            const dir = path.dirname(DATA_FILE);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(DATA_FILE, JSON.stringify(body, null, 2), 'utf8');
            console.log("Settings saved to JSON file");
        } catch (fileError) {
            console.error("JSON write failed:", fileError);
        }
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
    }
}
