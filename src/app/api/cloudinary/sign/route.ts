import { v2 as cloudinary } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            folder = 'drotes/customer-uploads',
            public_id // Optional: custom filename for the upload
        } = body;

        const timestamp = Math.round(new Date().getTime() / 1000);

        // Build params object for signing
        const paramsToSign: Record<string, any> = {
            timestamp,
            folder,
        };

        // Include public_id in signature if provided
        if (public_id) {
            paramsToSign.public_id = public_id;
        }

        // Generate signature for signed upload
        const signature = cloudinary.utils.api_sign_request(
            paramsToSign,
            process.env.CLOUDINARY_API_SECRET!
        );

        return NextResponse.json({
            signature,
            timestamp,
            api_key: process.env.CLOUDINARY_API_KEY,
            cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
            folder,
            public_id, // Return to client so they can include in upload
        });
    } catch (error) {
        console.error('Cloudinary sign error:', error);
        return NextResponse.json(
            { error: 'Failed to generate upload signature' },
            { status: 500 }
        );
    }
}
