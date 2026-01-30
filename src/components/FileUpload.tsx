"use client";
import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, FileAudio, FileVideo, Image, FileText, Check, Loader2, AlertCircle } from "lucide-react";

interface FileUploadProps {
    onUploadComplete: (url: string, publicId: string, fileName: string) => void;
    onUploadRemove: () => void;
    maxSizeMB?: number;
    allowedTypes?: string[];
    currentFile?: { url: string; name: string } | null;
}

const MAX_SIZE_BYTES = 30 * 1024 * 1024; // 30MB
const ALLOWED_EXTENSIONS = ['mp3', 'wav', 'ogg', 'mp4', 'mov', 'avi', 'webm', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'];
const ALLOWED_MIMES = [
    'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3',
    'video/mp4', 'video/quicktime', 'video/avi', 'video/webm',
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf'
];

const getFileIcon = (type: string) => {
    if (type.startsWith('audio/')) return <FileAudio size={24} className="text-purple-500" />;
    if (type.startsWith('video/')) return <FileVideo size={24} className="text-blue-500" />;
    if (type.startsWith('image/')) return <Image size={24} className="text-green-500" />;
    if (type.includes('pdf')) return <FileText size={24} className="text-red-500" />;
    return <FileText size={24} className="text-neutral-500" />;
};

// Helper to sanitize filename for Cloudinary public_id
const sanitizeFilename = (filename: string): string => {
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, ''); // Remove extension
    return nameWithoutExt
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_') // Replace non-alphanumeric with underscore
        .replace(/_+/g, '_') // Collapse multiple underscores
        .replace(/^_|_$/g, '') // Trim leading/trailing underscores
        .substring(0, 50); // Limit length
};

export default function FileUpload({
    onUploadComplete,
    onUploadRemove,
    maxSizeMB = 30,
    currentFile = null
}: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [uploadedFile, setUploadedFile] = useState<{ url: string; name: string; type: string } | null>(
        currentFile ? { ...currentFile, type: '' } : null
    );
    const inputRef = useRef<HTMLInputElement>(null);
    // Guard to prevent duplicate uploads (React StrictMode can cause double mounts)
    const uploadInProgressRef = useRef<string | null>(null);

    const validateFile = (file: File): string | null => {
        // Check size
        if (file.size > MAX_SIZE_BYTES) {
            return `File too large. Maximum size is ${maxSizeMB}MB.`;
        }

        // Check type
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
            return `Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`;
        }

        if (!ALLOWED_MIMES.some(mime => file.type.includes(mime.split('/')[1]) || file.type === mime)) {
            // Fallback: check by extension if MIME is weird
            if (!ALLOWED_EXTENSIONS.includes(ext)) {
                return `Invalid file type.`;
            }
        }

        return null;
    };

    // Store file locally as base64 (deferred upload - will upload with order ID later)
    const processFile = async (file: File) => {
        // Generate unique ID based on file
        const fileId = `${file.name}_${file.size}_${file.lastModified}`;

        // Guard: Check if already processing this file
        if (uploadInProgressRef.current === fileId) {
            console.log('File already being processed, skipping duplicate');
            return;
        }

        // Guard: Skip if already processed
        if (uploadedFile && uploadedFile.name === file.name) {
            console.log('File already processed, skipping');
            return;
        }

        uploadInProgressRef.current = fileId;
        setIsUploading(true);
        setUploadProgress(0);
        setError(null);

        try {
            // Convert file to base64 data URL for local storage
            const reader = new FileReader();

            const base64Promise = new Promise<string>((resolve, reject) => {
                reader.onprogress = (e) => {
                    if (e.lengthComputable) {
                        const percent = Math.round((e.loaded / e.total) * 100);
                        setUploadProgress(percent);
                    }
                };
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = () => reject(new Error('Failed to read file'));
            });

            reader.readAsDataURL(file);
            const base64 = await base64Promise;

            // Create a local preview URL (for display purposes)
            const previewUrl = URL.createObjectURL(file);

            setUploadedFile({
                url: previewUrl,
                name: file.name,
                type: file.type
            });

            // Pass base64 data to parent for later upload with order ID
            // The 'url' here is actually the base64 data, 'publicId' is empty since not uploaded yet
            onUploadComplete(base64, '', file.name);

        } catch (err: any) {
            console.error('File processing error:', err);
            setError(err.message || 'Failed to process file. Please try again.');
        } finally {
            setIsUploading(false);
            uploadInProgressRef.current = null;
        }
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            const validationError = validateFile(file);
            if (validationError) {
                setError(validationError);
                return;
            }
            processFile(file);
        }
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const validationError = validateFile(file);
            if (validationError) {
                setError(validationError);
                return;
            }
            processFile(file);
        }
    };

    const handleRemove = () => {
        setUploadedFile(null);
        setUploadProgress(0);
        setError(null);
        onUploadRemove();
        if (inputRef.current) inputRef.current.value = '';
    };

    return (
        <div className="w-full">
            <AnimatePresence mode="wait">
                {uploadedFile ? (
                    // Uploaded File Preview
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 flex items-center gap-4"
                    >
                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                            {getFileIcon(uploadedFile.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-neutral-800 truncate">{uploadedFile.name}</p>
                            <p className="text-xs text-green-600 flex items-center gap-1 mt-0.5">
                                <Check size={12} /> Uploaded successfully
                            </p>
                        </div>
                        <button
                            onClick={handleRemove}
                            className="p-2 hover:bg-red-100 rounded-full transition-colors group"
                            title="Remove file"
                        >
                            <X size={18} className="text-neutral-400 group-hover:text-red-500" />
                        </button>
                    </motion.div>
                ) : isUploading ? (
                    // Upload Progress
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="bg-neutral-50 border border-neutral-200 rounded-xl p-6"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <Loader2 size={20} className="animate-spin text-[#1a472a]" />
                            <span className="text-sm font-medium text-neutral-700">Uploading...</span>
                            <span className="text-sm font-bold text-[#1a472a] ml-auto">{uploadProgress}%</span>
                        </div>
                        <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${uploadProgress}%` }}
                                className="h-full bg-gradient-to-r from-[#1a472a] to-emerald-500 rounded-full"
                            />
                        </div>
                    </motion.div>
                ) : (
                    // Drop Zone
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => inputRef.current?.click()}
                        className={`
                            relative cursor-pointer border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300
                            ${isDragging
                                ? 'border-[#1a472a] bg-green-50 scale-[1.02]'
                                : 'border-neutral-300 hover:border-neutral-400 bg-neutral-50 hover:bg-neutral-100'
                            }
                        `}
                    >
                        <input
                            ref={inputRef}
                            type="file"
                            accept=".mp3,.wav,.ogg,.mp4,.mov,.avi,.webm,.jpg,.jpeg,.png,.gif,.webp,.pdf"
                            onChange={handleFileSelect}
                            className="hidden"
                        />

                        <div className={`
                            w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center transition-colors
                            ${isDragging ? 'bg-[#1a472a] text-white' : 'bg-neutral-200 text-neutral-500'}
                        `}>
                            <Upload size={24} />
                        </div>

                        <p className="text-sm font-medium text-neutral-700 mb-1">
                            {isDragging ? 'Drop your file here' : 'Drag & drop or click to upload'}
                        </p>
                        <p className="text-xs text-neutral-500">
                            Audio, Video, Images, PDF • Max {maxSizeMB}MB
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error Message */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-600"
                    >
                        <AlertCircle size={16} />
                        {error}
                        <button onClick={() => setError(null)} className="ml-auto p-1 hover:bg-red-100 rounded">
                            <X size={14} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
