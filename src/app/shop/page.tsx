"use client";
import React from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useQuery } from "@apollo/client";
import { GET_SHOP_PRODUCTS } from "@/lib/queries";

const MOCK_PRODUCTS = [
    { id: 1, name: "The Shell", price: 120 },
    { id: 2, name: "The Pant", price: 90 },
    { id: 3, name: "The Hoodie", price: 110 },
    { id: 4, name: "The Cap", price: 45 },
    { id: 5, name: "Knit Vest", price: 85 },
    { id: 6, name: "Cargo Short", price: 95 },
];



// ... existing imports

export default function ShopPage() {
    // Live Data Fetching
    const { loading, error, data } = useQuery(GET_SHOP_PRODUCTS);

    // Prices are pre-formatted by WooCommerce/Curcy - no frontend conversion needed
    const products = data?.products?.nodes ? flattenVariations(data.products.nodes) : MOCK_PRODUCTS;

    if (loading) return (
        <main className="min-h-screen bg-white text-black flex items-center justify-center">
            <div className="text-xs uppercase tracking-widest animate-pulse">Loading Collection...</div>
        </main>
    );

    if (error) {
        console.error("GraphQL Error:", error);
        // Fallback to MOCK if error, or show error message. 
        // For now, let's fall back to mock but log error.
    }

    return (
        <main className="min-h-screen bg-white text-black selection:bg-black/10">
            <Navigation theme="light" />

            <div className="pt-32 pb-20 px-6 md:px-12 max-w-[1800px] mx-auto">
                <header className="mb-16 flex flex-col md:flex-row justify-between items-end border-b border-neutral-200 pb-8">
                    <div>
                        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">Shop All</h1>
                        <p className="text-xs text-neutral-500 uppercase tracking-widest">
                            Collection 01 / {products.length} Items
                        </p>
                    </div>

                    <div className="flex gap-8 text-xs font-bold uppercase tracking-widest mt-8 md:mt-0">
                        <button className="hover:text-neutral-500 transition-colors">Filter</button>
                        <button className="hover:text-neutral-500 transition-colors">Sort</button>
                    </div>
                </header>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-12">
                    {products.map((product: any, index: number) => (
                        <ProductCard
                            key={product.id}
                            index={index}
                            name={product.name}
                            slug={product.slug} // Add slug
                            price={product.priceRawStr || product.price} // Handle both formats
                            image={product.image}
                            category={product.category}
                            color={product.color}
                            swatches={product.swatches}
                            secondaryImage={product.secondaryImage}
                        />
                    ))}
                </div>
            </div>

            <Footer />
        </main>
    );
}

// Utility to clean price string (e.g., "$120.00", "AED&nbsp;549.00")
function cleanPriceString(price: string): string {
    if (!price) return "";
    // Replace HTML entities like &nbsp; with space
    let cleaned = price.replace(/&nbsp;/g, ' ').replace(/&#160;/g, ' ');
    // Replace Arabic Symbol globally
    cleaned = cleaned.replace(/د.إ/g, 'AED').replace(/AED\s?AED/g, 'AED'); // Safety check for double replace
    // Optional: strip HTML tags if present (unlikely for price but WP might send <span class="amount">)
    cleaned = cleaned.replace(/<[^>]*>/g, '');
    return cleaned.trim();
}

// Utility to clean price string (e.g., "$120.00" -> 120.00)
function parsePrice(priceIdx: string | number): number {
    if (typeof priceIdx === 'number') return priceIdx;
    if (!priceIdx) return 0;
    const clean = priceIdx.replace(/[^0-9.]/g, '');
    return parseFloat(clean);
}

// Utility to format slug to text (e.g. "crimson-dust-red" -> "Crimson Dust Red")
function formatColorName(slug: string): string {
    if (!slug) return "";
    return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

// Utility to flatten variable products into individual variations
function flattenVariations(products: any[]) {
    let flattened: any[] = [];
    products.forEach(p => {
        const category = p.productCategories?.nodes?.[0]?.name || "Anecdote";

        // 1. Get All Available Colors from Parent Attributes
        let availableColors: string[] = [];
        if (p.attributes?.nodes) {
            const colorAttr = p.attributes.nodes.find((a: any) =>
                a.name === 'pa_color' ||
                a.name.toLowerCase() === 'color' ||
                a.name.toLowerCase() === 'colour'
            );
            if (colorAttr && colorAttr.options) {
                // Determine if options are slugs or names. Usually slugs in this context.
                // We map them to formatted names for display.
                availableColors = colorAttr.options.map((opt: string) => formatColorName(opt));
            }
        }

        if (p.variations) {
            p.variations.nodes.forEach((v: any) => {
                let colorName = "";

                // 2. Get Selected Color from Variation Attributes
                if (v.attributes?.nodes) {
                    const colorAttr = v.attributes.nodes.find((a: any) =>
                        a.name === 'pa_color' ||
                        a.name.toLowerCase() === 'color' ||
                        a.name.toLowerCase() === 'colour'
                    );
                    if (colorAttr) {
                        colorName = formatColorName(colorAttr.value);
                    }
                }

                // STRICT: If no color attribute, DO NOT try to parse title. 
                // User requested to "totally avoid using product title".

                // Map for HOODIE back images
                const HOODIE_IMAGES: Record<string, string> = {
                    "Crimson Dust Red": "https://bck.drotes.com/wp-content/uploads/2025/10/4V6A4383-600x900.webp",
                    "Faded Horizon Blue": "https://bck.drotes.com/wp-content/uploads/2025/11/4V6A1898-600x900.jpg",
                    "Obsidian Black": "https://bck.drotes.com/wp-content/uploads/2025/11/4V6A1862-600x900.jpg",
                    // Lowercase fallbacks
                    "crimson dust red": "https://bck.drotes.com/wp-content/uploads/2025/10/4V6A4383-600x900.webp",
                    "faded horizon blue": "https://bck.drotes.com/wp-content/uploads/2025/11/4V6A1898-600x900.jpg",
                    "obsidian black": "https://bck.drotes.com/wp-content/uploads/2025/11/4V6A1862-600x900.jpg"
                };

                // Map for SWEAT PANT back images
                const PANT_IMAGES: Record<string, string> = {
                    "Crimson Dust Red": "https://bck.drotes.com/wp-content/uploads/2025/11/4V6A4364-scaled.webp",
                    "Faded Horizon Blue": "https://bck.drotes.com/wp-content/uploads/2025/11/4V6A1904-scaled.jpg",
                    "Obsidian Black": "https://bck.drotes.com/wp-content/uploads/2025/11/4V6A1849-600x900.jpg",
                    // Lowercase fallbacks
                    "crimson dust red": "https://bck.drotes.com/wp-content/uploads/2025/11/4V6A4364-scaled.webp",
                    "faded horizon blue": "https://bck.drotes.com/wp-content/uploads/2025/11/4V6A1904-scaled.jpg",
                    "obsidian black": "https://bck.drotes.com/wp-content/uploads/2025/11/4V6A1849-600x900.jpg"
                };

                // Fix: Do NOT fallback to parent price if variation price is missing.
                const varPrice = v.price ? cleanPriceString(v.price) : "";

                // Get Secondary Image based on Product Type
                let secondaryImg = "";
                const lowerName = p.name.toLowerCase();

                if (lowerName.includes("hoodie")) {
                    secondaryImg = HOODIE_IMAGES[colorName] || HOODIE_IMAGES[colorName.toLowerCase()] || "";
                } else if (lowerName.includes("pant") || lowerName.includes("sweat")) {
                    secondaryImg = PANT_IMAGES[colorName] || PANT_IMAGES[colorName.toLowerCase()] || "";
                }

                flattened.push({
                    id: v.id,
                    name: p.name, // Force parent product name
                    slug: p.slug, // Use parent slug
                    priceRawStr: varPrice,
                    price: parsePrice(varPrice),
                    image: v.image?.sourceUrl || p.image?.sourceUrl || "",
                    secondaryImage: secondaryImg,
                    category: category,
                    color: colorName,
                    swatches: availableColors // Pass all available colors for this product
                });
            });
        } else {
            flattened.push({
                ...p,
                slug: p.slug,
                name: p.name,
                priceRawStr: cleanPriceString(p.price),
                price: parsePrice(cleanPriceString(p.price)),
                image: p.image?.sourceUrl || "",
                secondaryImage: "",
                category: category,
                color: "",
                swatches: []
            });
        }
    });

    // Sort: Hoodies first
    flattened.sort((a, b) => {
        const aIsHoodie = a.name.toLowerCase().includes("hoodie");
        const bIsHoodie = b.name.toLowerCase().includes("hoodie");
        if (aIsHoodie && !bIsHoodie) return -1;
        if (!aIsHoodie && bIsHoodie) return 1;
        return 0;
    });

    return flattened;
}
