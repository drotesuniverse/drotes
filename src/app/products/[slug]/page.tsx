"use client";
import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_PRODUCT_BY_SLUG, ADD_TO_CART, GET_CART_TOTAL } from "@/lib/queries";
import { storePendingFile } from "@/lib/uploadFile";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ProductGallery from "@/components/ProductGallery";
import { useCurrency } from "@/lib/currency";
import { useParams } from "next/navigation";
import ProductAddonPopup from "@/components/ProductAddonPopup";
import { ShoppingBag, ChevronRight, Minus, Plus, Share2, HelpCircle, Truck, Ruler, ChevronDown } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { AskQuestionModal, DeliveryModal, SizeGuideModal } from "@/components/ProductModals";
import ShippingGuarantee from "@/components/ShippingGuarantee";
import { useAdminSettings } from "@/hooks/useAdminSettings";

// Color Map for Swatches
const COLOR_MAP: Record<string, string> = {
    "black": "#000000",
    "white": "#ffffff",
    "grey": "#808080",
    "crimson dust red": "#9e1b32",
    "faded horizon blue": "#7fb5b7",
    "obsidian black": "#1a1a1a",
    "blue": "#0000ff",
    "navy": "#000080",
    "forest": "#228b22",
};

function getColorHex(name: string) {
    if (!name) return "#e5e5e5";
    const lower = name.toLowerCase();
    if (COLOR_MAP[lower]) return COLOR_MAP[lower];
    // Fuzzy matching
    if (lower.includes("red")) return "#ad0031";
    if (lower.includes("blue")) return "#34d1ed";
    if (lower.includes("green")) return "#228b22";
    if (lower.includes("black")) return "#000000";
    return "#cccccc";
}

export default function SingleProductPage() {
    const params = useParams();
    const slug = params?.slug as string;
    const { settings } = useAdminSettings();

    // Quantity State
    const [quantity, setQuantity] = useState(1);

    // Queries
    const { loading, error, data } = useQuery(GET_PRODUCT_BY_SLUG, {
        variables: { slug: slug },
        skip: !slug
    });

    const product = data?.product;
    const { formatAddonPrice, cleanWooPrice, syncFromPriceString, formatValue, currency } = useCurrency();

    // State for selected variation
    const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
    const [selectedVariation, setSelectedVariation] = useState<any>(null);

    // Auto-Detect Currency from Backend Price String
    // We trust the visual symbol returned by WP for the product price
    useEffect(() => {
        const rawPrice = selectedVariation?.price || product?.price || "";
        if (rawPrice) syncFromPriceString(rawPrice);
    }, [product, selectedVariation, syncFromPriceString]);

    // State for addon price (AED) and selections
    const [addonPriceAED, setAddonPriceAED] = useState(0);
    const [addonSelections, setAddonSelections] = useState<Record<string, any>>({});
    // Key to reset ProductAddonPopup component
    const [addonResetKey, setAddonResetKey] = useState(0);

    // Add to Cart Mutation
    const [addToCart, { loading: addingToCart }] = useMutation(ADD_TO_CART, {
        refetchQueries: [{ query: GET_CART_TOTAL }]
    });

    const [isAdding, setIsAdding] = useState(false);

    // Accordion State
    const [openAccordion, setOpenAccordion] = useState<string | null>("description");

    // State for readable customization details
    const [addonSummary, setAddonSummary] = useState<Record<string, string>>({});

    // Modal State
    const [isAskOpen, setIsAskOpen] = useState(false);
    const [isDeliveryOpen, setIsDeliveryOpen] = useState(false);
    const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

    const handleAddonUpdate = React.useCallback((priceInAED: number, selections: Record<string, any>, readableSummary?: Record<string, string>) => {
        // Only update if changes actually occurred to avoid loop (though specific check inside setState is better, this is a coarse guard)
        setAddonPriceAED(prev => prev === priceInAED ? prev : priceInAED);
        setAddonSelections(prev => JSON.stringify(prev) === JSON.stringify(selections) ? prev : selections);
        if (readableSummary) {
            setAddonSummary(prev => JSON.stringify(prev) === JSON.stringify(readableSummary) ? prev : readableSummary);
        }
    }, []);

    const handleAttributeSelect = (name: string, value: string) => {
        const newAttributes = { ...selectedAttributes, [name]: value };
        setSelectedAttributes(newAttributes);
        findVariation(newAttributes);
    };

    // Improved Variation Finding Logic
    const findVariation = (attrs: Record<string, string>) => {
        if (!product?.variations?.nodes) return;

        console.log("Finding variation for:", attrs);

        const bestMatch = product.variations.nodes.find((v: any) => {
            return v.attributes.nodes.every((vAttr: any) => {
                let selectedValue = attrs[vAttr.name]; // Try direct name match

                // Fuzzy Key Match if direct fails (e.g. "Size" vs "pa_size")
                if (!selectedValue) {
                    const foundKey = Object.keys(attrs).find(k =>
                        k.toLowerCase().replace('pa_', '') === vAttr.name.toLowerCase().replace('pa_', '')
                    );
                    if (foundKey) selectedValue = attrs[foundKey];
                }

                if (!vAttr.value) return true; // Wildcard
                if (!selectedValue) return false; // Missing selection for this attribute

                // Case-insensitive, robust comparison
                const match = selectedValue.trim().toLowerCase() === vAttr.value.trim().toLowerCase();

                if (!match) {
                    // console.log(`Mismatch on ${vAttr.name}: Selected '${selectedValue}' vs Variation '${vAttr.value}'`);
                }
                return match;
            });
        });

        if (bestMatch) {
            console.log("Variation Found:", bestMatch.name, bestMatch.databaseId);
        } else {
            console.warn("No matching variation found for attributes.");
        }
        setSelectedVariation(bestMatch || null);
    };

    // Auto-select "Blue" for Boxed Hoodie if nothing selected
    useEffect(() => {
        if (!product) return;
        // Only run if no attributes selected yet
        if (Object.keys(selectedAttributes).length > 0) return;

        // Try to find Color attribute
        const colorAttr = product.attributes?.nodes?.find((a: any) => a.name.toLowerCase().includes("color"));
        if (colorAttr && colorAttr.options) {
            // Find option containing "Blue"
            const blueOption = colorAttr.options.find((opt: string) => opt.toLowerCase().includes("blue"));
            if (blueOption) {
                handleAttributeSelect(colorAttr.name, blueOption);
            }
        }
    }, [product]);

    // Quantity Handlers
    const incrementQty = () => setQuantity(q => q + 1);
    const decrementQty = () => setQuantity(q => Math.max(1, q - 1));

    // Handle Add to Cart
    const handleAddToCart = async () => {
        if (!product || isAdding) return;

        // Dynamic Data
        const isVariable = product.type?.toLowerCase() === 'variable' || product.variations?.nodes?.length > 0;

        console.log("Debug AddToCart:", {
            type: product.type,
            isVariable,
            hasNodes: product.variations?.nodes?.length,
            selectedId: selectedVariation?.databaseId
        });

        // Strict Validation: Must have variation selected AND it must have a valid ID
        if (isVariable && (!selectedVariation || !selectedVariation.databaseId)) {
            alert("Please select a size and color before adding to bag.");
            return;
        }

        setIsAdding(true);

        try {
            // Format Addon Selections as FLAT OBJECT (not array of {key, value})
            // WPGraphQL decodes this and passes directly to WC()->cart->add_to_cart()
            const extraDataObj: Record<string, string> = {};

            // 1. Add Customization Text
            if (Object.keys(addonSummary).length > 0) {
                const desc = Object.entries(addonSummary).map(([key, val]) => {
                    return `${key}: ${val}`;
                }).join(" | ");

                extraDataObj["customization"] = desc;
            }

            // 2. Add Dynamic Fee Amount (for backend processing)
            if (addonPriceAED > 0) {
                console.log(`[Frontend] Adding Custom Fee: ${addonPriceAED} AED`);
                extraDataObj["custom_fee_amount"] = String(addonPriceAED);
            }

            // 3. Add Customer File Name (if exists)
            if (addonSelections["customer_file_name"]) {
                extraDataObj["customer_file_name"] = addonSelections["customer_file_name"];
            }

            // 3. Build Variation Array for WPGraphQL WooCommerce
            // Format: [{attributeName: "pa_size", attributeValue: "L"}, ...]
            const variationInput = selectedAttributes
                ? Object.entries(selectedAttributes).map(([key, val]) => ({
                    attributeName: key,
                    attributeValue: val
                }))
                : undefined;

            // Prepare extraData - only stringify if we have data
            const extraDataStr = Object.keys(extraDataObj).length > 0
                ? JSON.stringify(extraDataObj)
                : undefined;

            console.log("[Frontend] Sending:", { variationInput, extraDataStr });

            const { data: addToCartData } = await addToCart({
                variables: {
                    productId: product.databaseId,
                    quantity: quantity,
                    variationId: selectedVariation ? selectedVariation.databaseId : undefined,
                    variation: variationInput,
                    extraData: extraDataStr
                }
            });

            // Store Pending File for Deferred Upload (if exists)
            if (addonSelections["customer_file_base64"] && addToCartData?.addToCart?.cartItem?.key) {
                storePendingFile(addToCartData.addToCart.cartItem.key, {
                    name: addonSelections["customer_file_name"],
                    base64: addonSelections["customer_file_base64"],
                    type: "application/octet-stream", // Fallback, normally we'd want real type but base64 has it
                    size: 0 // We don't strictly need size for upload, base64 length is proxy
                });
            }

            // Dispatch event to update navbar/cart drawer
            window.dispatchEvent(new Event('cart-updated'));

            // Reset addon state after successful add
            setAddonPriceAED(0);
            setAddonSelections({});
            setAddonSummary({});
            setAddonResetKey(prev => prev + 1); // Force re-mount of addon popup
            setQuantity(1); // Reset quantity
        } catch (err: any) {
            console.error(err);
            alert(`Failed to add to cart: ${err.message || "Unknown error"}`);
        } finally {
            setIsAdding(false);
        }
    };

    if (loading) return (
        <main className="min-h-screen bg-white flex items-center justify-center">
            <div className="text-xs uppercase tracking-widest animate-pulse">Loading Product...</div>
        </main>
    );

    if (error) return (
        <main className="min-h-screen bg-white flex items-center justify-center p-4">
            <div className="text-red-500 font-mono text-xs max-w-lg break-all">
                Error: {error.message}
                <br />
                {JSON.stringify(error)}
            </div>
        </main>
    );

    if (!product) return (
        <main className="min-h-screen bg-white flex items-center justify-center">
            <div className="text-xs uppercase tracking-widest">Product not found</div>
        </main>
    );

    // Dynamic Data
    const isVariable = product.type === 'VARIABLE' || product.variations?.nodes?.length > 0;
    const isPreOrder = product.preOrder?.value === "yes" || false;

    // Check if variations are loaded
    const hasVariations = product.variations?.nodes?.length > 0;

    // Price Display
    // Update logic: If variation is selected, use ITS price strictly. Do not fallback to parent.
    // If price is 0 or null, we treat as Out of Stock.
    let rawPriceString = "";
    if (selectedVariation) {
        rawPriceString = selectedVariation.price || "";
    } else {
        rawPriceString = product?.price || "";
    }

    const displayPrice = cleanWooPrice(rawPriceString);

    // Calculate Numeric Totals for "Add to Bag" Button
    // 1. Parse Base Price (remove non-numeric except dot)
    const basePriceNumeric = parseFloat(displayPrice.replace(/[^0-9.]/g, '')) || 0;

    // Detect technical "Out of Stock" based on Price 0 rule
    const isPriceZero = selectedVariation && basePriceNumeric === 0;

    // Effective Stock Status
    // If specific variation is selected: Check its stock status AND its price
    // If no variation: Check product stock status
    const effectiveStockStatus = selectedVariation
        ? (selectedVariation.stockStatus === 'OUT_OF_STOCK' || isPriceZero ? 'OUT_OF_STOCK' : 'IN_STOCK')
        : product?.stockStatus;

    const isOutOfStock = effectiveStockStatus === 'OUT_OF_STOCK';

    // 2. Calculate Addon Price in Target Currency
    // addonPriceAED is user input. We convert it to target currency using the rate we have in context.
    const addonPriceTargetCurrency = addonPriceAED * currency.rate;

    // 3. Format Addon Display
    const addonPriceDisplay = addonPriceAED > 0 ? formatAddonPrice(addonPriceAED) : null;

    // 4. Total Price (Base + Addon)
    const totalPriceNumeric = basePriceNumeric + addonPriceTargetCurrency;
    // Show "Out of Stock" if applicable, otherwise price
    const totalPriceDisplay = isOutOfStock
        ? "Out of Stock"
        : (addonPriceAED > 0 ? formatValue(totalPriceNumeric) : (displayPrice || formatValue(0)));

    // ... (Galleries) ...
    const mainImage = selectedVariation?.image?.sourceUrl || product.image?.sourceUrl || "";

    // ... (Manual Variation Galleries Code omitted, presumed unchanged) ...

    // ... (Render) ...

    {/* Actions Row */ }
    <div className="flex gap-4 items-stretch h-14 mb-12">
        {/* Stylish Quantity Selector */}
        <div className={`w-24 border rounded-sm flex items-center justify-between px-2 bg-neutral-50 ${isOutOfStock ? 'opacity-50 pointer-events-none border-neutral-100' : 'border-neutral-200'}`}>
            <button onClick={decrementQty} className="text-neutral-400 hover:text-black p-2"><Minus size={14} /></button>
            <span className="text-sm font-semibold">{quantity}</span>
            <button onClick={incrementQty} className="text-neutral-400 hover:text-black p-2"><Plus size={14} /></button>
        </div>

        <button
            onClick={handleAddToCart}
            disabled={isAdding || isOutOfStock}
            className={`flex-1 bg-black text-white flex items-center justify-center gap-3 text-sm font-bold uppercase tracking-widest hover:bg-neutral-800 transition-all rounded-sm shadow-xl active:scale-[0.99]
                                    ${(isAdding || isOutOfStock) ? "opacity-70 cursor-not-allowed bg-neutral-400 shadow-none" : ""}
                                `}
        >
            <ShoppingBag size={18} />
            {isAdding ? "Adding..." : (
                <>
                    {isOutOfStock ? "Out of Stock" : (isPreOrder ? "Pre-Order" : "Add to Bag")}
                    {!isOutOfStock && <>&nbsp;&middot;&nbsp; {totalPriceDisplay}</>}
                </>
            )}
        </button>
    </div>
    const VARIATION_GALLERIES: Record<string, string[]> = {
        "blue": [
            "https://bck.drotes.com/wp-content/uploads/2025/11/4V6A1899-scaled.jpg",
            "https://bck.drotes.com/wp-content/uploads/2025/11/4V6A1898-scaled.jpg",
            "https://bck.drotes.com/wp-content/uploads/2025/11/4V6A1895-scaled.jpg",
            "https://bck.drotes.com/wp-content/uploads/2025/11/4V6A1881-scaled.jpg",
            "https://bck.drotes.com/wp-content/uploads/2025/11/4V6A1887-scaled.jpg"
        ],
        "crimson dust red": [ // "red" in user request, typically "crimson dust red" in attr
            "https://bck.drotes.com/wp-content/uploads/2025/10/4V6A4383-scaled.webp",
            "https://bck.drotes.com/wp-content/uploads/2025/10/4V6A4328-scaled.webp",
            "https://bck.drotes.com/wp-content/uploads/2025/10/4V6A4320-scaled.webp",
            "https://bck.drotes.com/wp-content/uploads/2025/10/4V6A4375-scaled.webp"
        ],
        "obsidian black": [ // "black"
            "https://bck.drotes.com/wp-content/uploads/2025/11/4V6A1853-scaled.jpg",
            "https://bck.drotes.com/wp-content/uploads/2025/11/4V6A1855-scaled.jpg",
            "https://bck.drotes.com/wp-content/uploads/2025/11/4V6A1871-scaled.jpg",
            "https://bck.drotes.com/wp-content/uploads/2025/11/4V6A1862-scaled.jpg",
            "https://bck.drotes.com/wp-content/uploads/2026/01/4V6A1874-scaled.jpg"
        ],
        // Fallback for simple "red" or "black" if attributes vary
        "red": [
            "https://bck.drotes.com/wp-content/uploads/2025/10/4V6A4383-scaled.webp",
            "https://bck.drotes.com/wp-content/uploads/2025/10/4V6A4328-scaled.webp",
            "https://bck.drotes.com/wp-content/uploads/2025/10/4V6A4320-scaled.webp",
            "https://bck.drotes.com/wp-content/uploads/2025/10/4V6A4375-scaled.webp"
        ],
        "black": [
            "https://bck.drotes.com/wp-content/uploads/2025/11/4V6A1853-scaled.jpg",
            "https://bck.drotes.com/wp-content/uploads/2025/11/4V6A1855-scaled.jpg",
            "https://bck.drotes.com/wp-content/uploads/2025/11/4V6A1871-scaled.jpg",
            "https://bck.drotes.com/wp-content/uploads/2025/11/4V6A1862-scaled.jpg",
            "https://bck.drotes.com/wp-content/uploads/2026/01/4V6A1874-scaled.jpg"
        ]
    };

    // Detect selected color
    let selectedColor = "";
    if (selectedAttributes) {
        // Find key like 'pa_color' or 'color'
        const colorKey = Object.keys(selectedAttributes).find(k => k.includes("color"));
        if (colorKey) selectedColor = selectedAttributes[colorKey].toLowerCase();
    }

    // Determine Gallery
    let galleryImages = product.galleryImages?.nodes?.map((n: any) => n.sourceUrl) || [];

    // 1. Admin Override (Highest Priority)
    // Check Variation specific override first, then Parent override
    const variationOverride = selectedVariation ? settings.productOverrides?.[selectedVariation.name]?.galleryImages : null;
    const parentOverride = settings.productOverrides?.[product.name]?.galleryImages;

    const adminGallery = variationOverride?.length ? variationOverride : parentOverride;

    if (adminGallery && adminGallery.length > 0) {
        galleryImages = adminGallery;
    }
    // 2. Variation Override (If no Admin Override)
    else if (selectedColor) {
        // Try exact match then fuzzy
        if (VARIATION_GALLERIES[selectedColor]) {
            galleryImages = VARIATION_GALLERIES[selectedColor];
        } else {
            // Check for fuzzy match (e.g. "blue" inside "faded horizon blue")
            const fuzzyKey = Object.keys(VARIATION_GALLERIES).find(k => selectedColor.includes(k));
            if (fuzzyKey) galleryImages = VARIATION_GALLERIES[fuzzyKey];
        }
    }

    return (
        <main className="min-h-screen bg-white text-black selection:bg-black/10 pb-20">
            <Navigation theme="light" />

            <div className="pt-32 px-6 md:px-12 max-w-[1800px] mx-auto [zoom:0.9]">
                {/* Clean Breadcrumb */}
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-neutral-400 mb-10">
                    <Link href="/shop" className="hover:text-black transition-colors">Shop</Link>
                    <ChevronRight size={10} />
                    <span className="text-black">{product.name}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-start mb-24">
                    {/* Left: Gallery (Sticky on Desktop) */}
                    <div className="md:sticky md:top-32 relative">
                        <ProductGallery
                            mainImage={mainImage}
                            galleryImages={galleryImages}
                            selectedVariationImage={selectedVariation?.image?.sourceUrl}
                        />
                    </div>

                    {/* Right: Details (Scrollable) */}
                    <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {/* Header Section */}
                        <div className="mb-8 border-b border-neutral-100 pb-8">
                            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-4">{product.name}</h1>
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col items-start gap-1">
                                    <p className="text-2xl font-light text-black tracking-tight flex flex-col items-start">
                                        <span>{displayPrice}</span>
                                        {addonPriceDisplay && (
                                            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-1">
                                                + {addonPriceDisplay} Customization
                                            </span>
                                        )}
                                    </p>
                                </div>
                                {isPreOrder && (
                                    <span className="px-3 py-1 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
                                        Pre-Order
                                    </span>
                                )}
                            </div>

                            {/* Short Description */}
                            {product.shortDescription && (
                                <div
                                    className="mt-6 text-sm text-neutral-500 font-light leading-relaxed prose prose-sm max-w-none hover:text-neutral-700 transition-colors"
                                    dangerouslySetInnerHTML={{ __html: product.shortDescription }}
                                />
                            )}
                        </div>

                        {/* Options Section */}
                        <div className="space-y-8 mb-10">
                            {isVariable && product.attributes?.nodes?.map((attr: any) => {
                                const lowerName = attr.name.toLowerCase();
                                // Skip Material and Wash Care in this section (displayed at bottom)
                                if (lowerName.includes("material") || lowerName.includes("care") || lowerName.includes("wash")) return null;

                                const isColor = lowerName.includes("color");
                                return (
                                    <div key={attr.name}>
                                        <div className="flex justify-between items-center mb-3">
                                            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-900">{attr.name.replace('pa_', '')}</h3>
                                            {attr.name.toLowerCase().includes("size") && settings.productSizeCharts?.[product.name] !== "disabled" && (
                                                <button
                                                    onClick={() => setIsSizeGuideOpen(true)}
                                                    className="flex items-center gap-1 text-[10px] uppercase tracking-wider underline text-neutral-400 hover:text-black transition-colors"
                                                >
                                                    <Ruler size={12} /> Size Guide
                                                </button>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap gap-3">
                                            {attr.options?.map((opt: string) => {
                                                const isSelected = selectedAttributes[attr.name] === opt;

                                                if (isColor) {
                                                    return (
                                                        <button
                                                            key={opt}
                                                            onClick={() => handleAttributeSelect(attr.name, opt)}
                                                            title={opt}
                                                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all bg-white relative
                                                                ${isSelected ? "ring-1 ring-black ring-offset-2" : "ring-1 ring-neutral-200 hover:ring-neutral-300"}
                                                            `}
                                                        >
                                                            <span
                                                                className="w-full h-full rounded-full border border-neutral-100/50"
                                                                style={{ backgroundColor: getColorHex(opt) }}
                                                            />
                                                        </button>
                                                    );
                                                }

                                                return (
                                                    <button
                                                        key={opt}
                                                        onClick={() => handleAttributeSelect(attr.name, opt)}
                                                        className={`px-5 py-2.5 text-xs uppercase tracking-wider transition-all rounded-sm
                                                            ${isSelected
                                                                ? "bg-black text-white border border-black shadow-lg"
                                                                : "bg-white text-neutral-600 border border-neutral-200 hover:border-black"
                                                            }
                                                        `}
                                                    >
                                                        {opt}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Custom Addons - Only for Boxed Hoodie (ID 6436) */}
                        {product.databaseId === 6436 && (
                            <div className="mb-6">
                                <ProductAddonPopup key={addonResetKey} onUpdate={handleAddonUpdate} />
                            </div>
                        )}

                        {/* Actions Row */}
                        <div className="flex gap-4 items-stretch h-14 mb-12">
                            {/* Stylish Quantity Selector */}
                            <div className="w-24 border border-neutral-200 rounded-sm flex items-center justify-between px-2 bg-neutral-50">
                                <button onClick={decrementQty} className="text-neutral-400 hover:text-black p-2"><Minus size={14} /></button>
                                <span className="text-sm font-semibold">{quantity}</span>
                                <button onClick={incrementQty} className="text-neutral-400 hover:text-black p-2"><Plus size={14} /></button>
                            </div>

                            <button
                                onClick={handleAddToCart}
                                disabled={isAdding || isOutOfStock}
                                className={`flex-1 flex items-center justify-center gap-3 text-sm font-bold uppercase tracking-widest transition-all rounded-sm shadow-xl active:scale-[0.99]
                                    ${(isAdding || isOutOfStock)
                                        ? "bg-neutral-400 text-white cursor-not-allowed shadow-none pointer-events-none"
                                        : "bg-black text-white hover:bg-neutral-800"
                                    }
                                    ${isAdding ? "cursor-wait" : ""}
                                `}
                            >
                                <ShoppingBag size={18} />
                                {isAdding ? "Adding..." : (
                                    <>
                                        {isOutOfStock ? "Out of Stock" : (isPreOrder ? "Pre-Order" : "Add to Bag")}
                                        {!isOutOfStock && <>&nbsp;&middot;&nbsp; {totalPriceDisplay}</>}
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Drotes Imprint Charity Message */}
                        <Link
                            href="/drotes-imprint"
                            className="group flex items-center gap-4 px-5 py-4 bg-neutral-50 hover:bg-neutral-100 border border-neutral-100 rounded-lg mb-8 transition-all hover:shadow-md"
                        >
                            <div className="relative flex items-center justify-center w-2.5 h-2.5 flex-shrink-0">
                                <span className="absolute w-full h-full bg-emerald-400 rounded-full animate-ping opacity-60" />
                                <span className="relative w-2 h-2 bg-emerald-500 rounded-full" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-neutral-500 leading-relaxed">
                                    <span className="font-semibold text-neutral-700">1%</span> of drotes annual sales supports the{' '}
                                    <span className="font-bold text-neutral-900 underline underline-offset-2 decoration-emerald-500/40 group-hover:decoration-emerald-500 transition-all">Drotes Imprint</span>
                                </p>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 group-hover:translate-x-1 transition-transform">Learn →</span>
                        </Link>

                        {/* Shipping Guarantee */}
                        <div className="mb-10">
                            <ShippingGuarantee variant="full" />
                        </div>

                        {/* Footer Links (Icons) */}
                        <div className="grid grid-cols-3 gap-4 border-t border-neutral-100 pt-8 mb-12">
                            <button
                                onClick={() => setIsAskOpen(true)}
                                className="flex flex-col items-center gap-2 text-[10px] uppercase tracking-widest text-neutral-400 hover:text-black transition-colors group"
                            >
                                <HelpCircle size={18} className="group-hover:scale-110 transition-transform" />
                                <span>Ask Question</span>
                            </button>
                            <button
                                onClick={() => setIsDeliveryOpen(true)}
                                className="flex flex-col items-center gap-2 text-[10px] uppercase tracking-widest text-neutral-400 hover:text-black transition-colors group"
                            >
                                <Truck size={18} className="group-hover:scale-110 transition-transform" />
                                <span>Delivery</span>
                            </button>
                            <button
                                onClick={() => {
                                    if (navigator.share) {
                                        navigator.share({
                                            title: product.name,
                                            url: window.location.href
                                        });
                                    } else {
                                        // Fallback: Copy to clipboard
                                        navigator.clipboard.writeText(window.location.href);
                                        alert("Link copied to clipboard!");
                                    }
                                }}
                                className="flex flex-col items-center gap-2 text-[10px] uppercase tracking-widest text-neutral-400 hover:text-black transition-colors group"
                            >
                                <Share2 size={18} className="group-hover:scale-110 transition-transform" />
                                <span>Share</span>
                            </button>
                        </div>

                        <DeliveryModal isOpen={isDeliveryOpen} onClose={() => setIsDeliveryOpen(false)} />
                        <AskQuestionModal isOpen={isAskOpen} onClose={() => setIsAskOpen(false)} />
                        <SizeGuideModal
                            isOpen={isSizeGuideOpen}
                            onClose={() => setIsSizeGuideOpen(false)}
                            content={(() => {
                                // 1. Check for Admin Override
                                const overrideChartId = settings.productSizeCharts?.[product.name];
                                if (overrideChartId) {
                                    const customChart = settings.sizeCharts?.find((c: any) => c.id === overrideChartId);
                                    if (customChart) return customChart;
                                }
                                // 2. Fallback to WooCommerce Backend content
                                return product?.sizeGuide?.value;
                            })()}
                        />

                        {/* Collapsible Info Sections (Moved Bottom) */}
                        <div className="border-t border-neutral-100">
                            {/* Description */}
                            <div className="border-b border-neutral-100">
                                <button
                                    onClick={() => setOpenAccordion(openAccordion === 'description' ? null : 'description')}
                                    className="w-full py-4 flex items-center justify-between text-xs font-bold uppercase tracking-widest text-black/80 hover:text-black"
                                >
                                    <span>Description</span>
                                    <ChevronDown size={14} className={`transition-transform duration-300 ${openAccordion === 'description' ? 'rotate-180' : ''}`} />
                                </button>
                                <AnimatePresence>
                                    {openAccordion === 'description' && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div
                                                className="pb-6 prose prose-sm text-neutral-500 max-w-none font-light leading-relaxed"
                                                dangerouslySetInnerHTML={{ __html: product.description || product.shortDescription || "No description available." }}
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Material (Dynamic) */}
                            <div className="border-b border-neutral-100">
                                <button
                                    onClick={() => setOpenAccordion(openAccordion === 'material' ? null : 'material')}
                                    className="w-full py-4 flex items-center justify-between text-xs font-bold uppercase tracking-widest text-black/80 hover:text-black"
                                >
                                    <span>Material</span>
                                    <ChevronDown size={14} className={`transition-transform duration-300 ${openAccordion === 'material' ? 'rotate-180' : ''}`} />
                                </button>
                                <AnimatePresence>
                                    {openAccordion === 'material' && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="pb-6 text-sm text-neutral-500 font-light">
                                                {/* Placeholder or fetch from attributes if available */}
                                                <p>Premium 100% Cotton. Heavyweight fabric designed for comfort and durability.</p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Wash Care (Static/Placeholder) */}
                            <div className="border-b border-neutral-100">
                                <button
                                    onClick={() => setOpenAccordion(openAccordion === 'care' ? null : 'care')}
                                    className="w-full py-4 flex items-center justify-between text-xs font-bold uppercase tracking-widest text-black/80 hover:text-black"
                                >
                                    <span>Wash Care</span>
                                    <ChevronDown size={14} className={`transition-transform duration-300 ${openAccordion === 'care' ? 'rotate-180' : ''}`} />
                                </button>
                                <AnimatePresence>
                                    {openAccordion === 'care' && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="pb-6 text-sm text-neutral-500 font-light">
                                                <ul className="list-disc list-inside space-y-1">
                                                    <li>Machine wash cold inside out</li>
                                                    <li>Do not bleach</li>
                                                    <li>Tumble dry low</li>
                                                    <li>Iron on low heat if needed</li>
                                                </ul>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                    </div>
                </div>
            </div>



            <Footer />
        </main >
    );
}
