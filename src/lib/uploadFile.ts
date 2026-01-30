/**
 * Utility for deferred Cloudinary uploads
 * Files are stored locally during customization and uploaded after order creation
 */

export interface PendingFile {
    name: string;
    type: string;
    size: number;
    base64: string; // Data URL format: data:mime/type;base64,...
}

// Helper to sanitize filename for Cloudinary public_id
export const sanitizeFilename = (filename: string): string => {
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, ''); // Remove extension
    return nameWithoutExt
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '')
        .substring(0, 50);
};

// Convert File to base64 data URL
export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
};

// Convert base64 data URL back to Blob for upload
export const base64ToBlob = (base64: string): Blob => {
    const [meta, data] = base64.split(',');
    const mimeMatch = meta.match(/data:([^;]+)/);
    const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
    const binary = atob(data);
    const array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        array[i] = binary.charCodeAt(i);
    }
    return new Blob([array], { type: mime });
};

// Upload file to Cloudinary with order ID
export const uploadToCloudinaryWithOrderId = async (
    pendingFile: PendingFile,
    orderId: string
): Promise<{ url: string; publicId: string }> => {
    const sanitizedName = sanitizeFilename(pendingFile.name);
    const customPublicId = `order_${orderId}_${sanitizedName}`;

    // 1. Get signed params from our API
    const signRes = await fetch('/api/cloudinary/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            folder: 'drotes/orders',
            public_id: customPublicId
        })
    });

    if (!signRes.ok) throw new Error('Failed to get upload signature');
    const signData = await signRes.json();

    // 2. Convert base64 back to blob
    const blob = base64ToBlob(pendingFile.base64);
    const file = new File([blob], pendingFile.name, { type: pendingFile.type });

    // 3. Upload to Cloudinary
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', signData.api_key);
    formData.append('timestamp', signData.timestamp.toString());
    formData.append('signature', signData.signature);
    formData.append('folder', signData.folder);
    if (signData.public_id) {
        formData.append('public_id', signData.public_id);
    }

    const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${signData.cloud_name}/auto/upload`,
        { method: 'POST', body: formData }
    );

    if (!uploadRes.ok) throw new Error('Upload failed');
    const result = await uploadRes.json();

    return {
        url: result.secure_url,
        publicId: result.public_id
    };
};

// Store pending file in sessionStorage (survives page refresh)
export const storePendingFile = (cartItemKey: string, file: PendingFile) => {
    const stored = sessionStorage.getItem('pending_uploads') || '{}';
    const pending = JSON.parse(stored);
    pending[cartItemKey] = file;
    sessionStorage.setItem('pending_uploads', JSON.stringify(pending));
};

// Get pending file from sessionStorage
export const getPendingFile = (cartItemKey: string): PendingFile | null => {
    const stored = sessionStorage.getItem('pending_uploads') || '{}';
    const pending = JSON.parse(stored);
    return pending[cartItemKey] || null;
};

// Get all pending files
export const getAllPendingFiles = (): Record<string, PendingFile> => {
    const stored = sessionStorage.getItem('pending_uploads') || '{}';
    return JSON.parse(stored);
};

// Clear pending file
export const clearPendingFile = (cartItemKey: string) => {
    const stored = sessionStorage.getItem('pending_uploads') || '{}';
    const pending = JSON.parse(stored);
    delete pending[cartItemKey];
    sessionStorage.setItem('pending_uploads', JSON.stringify(pending));
};

// Clear all pending files
export const clearAllPendingFiles = () => {
    sessionStorage.removeItem('pending_uploads');
};

// --- ADMIN UPLOAD HELPER ---
export const uploadAdminImage = async (file: File): Promise<string> => {
    // 1. Convert to base64
    const base64 = await fileToBase64(file);
    const blob = base64ToBlob(base64);

    // 2. We need a signature. For now, we will try to use the same endpoint but with a generic ID.
    // NOTE: In a real app, we'd have a specific admin endpoint. 
    // We'll reuse the existing flow but with a 'admin_upload' prefix.

    const timestamp = Date.now();
    const cleanName = sanitizeFilename(file.name);
    const publicId = `admin_${timestamp}_${cleanName}`;

    // Get signature
    const signRes = await fetch('/api/cloudinary/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            folder: 'drotes/admin',
            public_id: publicId
        })
    });

    if (!signRes.ok) throw new Error('Failed to get upload signature');
    const signData = await signRes.json();

    // Upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', signData.api_key);
    formData.append('timestamp', signData.timestamp.toString());
    formData.append('signature', signData.signature);
    formData.append('folder', signData.folder);
    if (signData.public_id) formData.append('public_id', signData.public_id);

    const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${signData.cloud_name}/auto/upload`,
        { method: 'POST', body: formData }
    );

    if (!uploadRes.ok) throw new Error('Upload failed');
    const result = await uploadRes.json();

    return result.secure_url;
};
