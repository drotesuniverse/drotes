import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
const DATA_FILE = path.join(process.cwd(), 'src/data/admin-settings.json');
export async function GET() {
    try {
        const docRef = doc(db, "config", "settings");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return NextResponse.json(docSnap.data());
        }
        // --- MIGRATION FALLBACK: Read from JSON if Firestore is empty ---
        if (fs.existsSync(DATA_FILE)) {
            console.log("Migration: Seeding Firestore from local JSON...");
            const data = fs.readFileSync(DATA_FILE, 'utf8');
            const jsonData = JSON.parse(data);
            // Seed Firestore
            await setDoc(docRef, jsonData);
            return NextResponse.json(jsonData);
        }
        return NextResponse.json({});
    } catch (e) {
        console.error("Firestore Read Error:", e);
        return NextResponse.json({ error: 'Failed to read settings' }, { status: 500 });
    }
}
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const docRef = doc(db, "config", "settings");
        await setDoc(docRef, body, { merge: true });
        return NextResponse.json({ success: true });
    } catch (e) {
        console.error("Firestore Write Error:", e);
        return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
    }
}
