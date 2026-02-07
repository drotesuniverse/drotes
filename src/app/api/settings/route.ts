
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
const DATA_FILE = path.join(process.cwd(), 'src/data/admin-settings.json');
export async function GET() {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            return NextResponse.json({});
        }
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return NextResponse.json(JSON.parse(data));
    } catch (e) {
        return NextResponse.json({ error: 'Failed to read settings' }, { status: 500 });
    }
}
export async function POST(req: Request) {
    try {
        const body = await req.json();
        // Ensure directory exists
        const dir = path.dirname(DATA_FILE);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(DATA_FILE, JSON.stringify(body, null, 2), 'utf8');
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
    }
}
