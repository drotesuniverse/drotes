"use client";

import Image from "next/image";
import Link from "next/link";

interface SpecimenProps {
    id: string;
    name: string;
    price: string;
    sku: string;
    image: string;
    colSpan?: string;
}

export default function SpecimenCard({ id, name, price, sku, image, colSpan = "col-span-4" }: SpecimenProps) {
    return (
        <div className={`md:${colSpan} border-b border-black flex flex-col relative group`}>
            {/* Header Data Segment */}
            <div className="flex justify-between items-center p-2 border-b border-black text-[10px] uppercase font-bold bg-white z-10">
                <span>{sku}</span>
                <span>STATUS: AVAIL</span>
            </div>

            {/* Image Container */}
            <div className="relative aspect-square w-full overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-300">
                <Image src={image} alt={name} fill className="object-cover" />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-neon opacity-0 group-hover:opacity-40 mix-blend-multiply transition-opacity duration-200" />
            </div>

            {/* Specimen Info */}
            <div className="p-4 flex flex-col gap-2 bg-white flex-1">
                <h3 className="font-[family-name:var(--font-heading)] text-3xl leading-none uppercase">{name}</h3>

                <div className="flex justify-between items-end mt-4">
                    <span className="text-xl font-bold">${price}</span>
                    <Link href={`/shop/${id}`} className="px-4 py-1 bg-black text-white hover:bg-neon hover:text-black text-xs uppercase font-bold transition-colors">
                        Acquire
                    </Link>
                </div>
            </div>
        </div>
    );
}
