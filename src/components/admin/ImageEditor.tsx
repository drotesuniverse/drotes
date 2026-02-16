"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Area } from "react-easy-crop";
import clsx from "clsx";
import { X, Check, ZoomIn } from "lucide-react";

interface ImageEditorProps {
    imageSrc: string; // The selected file URL (blob/base64)
    aspectRatio?: number; // e.g. 1 (square), 16/9 (hero)
    onCancel: () => void;
    onSave: (croppedImage: Blob) => void;
    onClose: () => void;
}

export default function ImageEditor({ imageSrc, aspectRatio = 1, onCancel, onSave }: ImageEditorProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const createImage = (url: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener("load", () => resolve(image));
            image.addEventListener("error", (error) => reject(error));
            image.src = url;
        });

    const getCroppedImg = async (
        imageSrc: string,
        pixelCrop: Area,
    ): Promise<Blob> => {
        const image = await createImage(imageSrc);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
            throw new Error("No 2d context");
        }

        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
        );

        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error("Canvas is empty"));
                    return;
                }
                resolve(blob);
            }, "image/jpeg", 0.9); // High quality
        });
    };

    const handleSave = async () => {
        if (!croppedAreaPixels) return;
        try {
            const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
            onSave(croppedBlob);
        } catch (e) {
            console.error(e);
            alert("Failed to crop image");
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[80vh]">
                {/* Header */}
                <div className="p-4 border-b border-neutral-100 flex justify-between items-center bg-white z-10">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-900">Edit Image</h3>
                    <button onClick={onCancel} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                        <X size={20} className="text-neutral-500" />
                    </button>
                </div>

                {/* Editor Area */}
                <div className="flex-1 relative bg-neutral-100">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={aspectRatio}
                        onCropChange={setCrop}
                        onCropComplete={onCropComplete}
                        onZoomChange={setZoom}
                        classes={{
                            containerClassName: "h-full w-full",
                            mediaClassName: "max-w-none"
                        }}
                    />
                </div>

                {/* Controls */}
                <div className="p-6 bg-white border-t border-neutral-100 space-y-6">
                    <div className="flex items-center gap-4">
                        <ZoomIn size={16} className="text-neutral-400" />
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="w-full h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-black"
                        />
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={onCancel}
                            className="flex-1 py-3 text-xs font-bold uppercase tracking-widest border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex-1 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
                        >
                            <Check size={16} /> Save & Upload
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
