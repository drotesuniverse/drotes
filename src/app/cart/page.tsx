"use client";
import React from "react";
import { useQuery } from "@apollo/client";
import { GET_CART } from "@/lib/queries";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Minus, Plus, Trash2, ArrowRight, ShieldCheck, Lock } from "lucide-react";
import ShippingGuarantee from "@/components/ShippingGuarantee";

export default function CartPage() {
    const { loading, error, data, refetch } = useQuery(GET_CART, {
        fetchPolicy: "network-only"
    });
    // Prices are pre-formatted by WooCommerce/Curcy - no frontend conversion needed

    if (loading) return (
        <div className="min-h-screen bg-white">
            <Navigation />
            <div className="h-[60vh] flex items-center justify-center">
                <div className="text-xs font-bold uppercase tracking-widest animate-pulse">Loading Cart...</div>
            </div>
            <Footer />
        </div>
    );

    const cart = data?.cart;
    const items = cart?.contents?.nodes || [];

    // Filter out Fee Product for cleaner UI? 
    // Or display it as "Customization Service"?
    // Let's display it but style it differently if it's the fee product (ID 16805)

    const cleanPrice = (price: string) => {
        if (!price) return "";
        let cleaned = price.replace(/&nbsp;/g, ' ').replace(/&#160;/g, ' ');
        return cleaned.replace(/د.إ/g, "AED").replace(/AED\s?AED/g, "AED");
    };

    return (
        <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
            <Navigation theme="light" />

            <main className="pt-32 pb-24 px-4 md:px-8 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row items-baseline justify-between mb-12 border-b border-neutral-200 pb-8">
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 md:mb-0">
                        Your Bag
                    </h1>
                    <span className="text-sm font-bold uppercase tracking-widest text-neutral-500">
                        {cart?.contents?.nodes?.length || 0} Items
                    </span>
                </div>

                {items.length === 0 ? (
                    <div className="text-center py-24">
                        <p className="text-neutral-400 mb-8">Your bag is empty.</p>
                        <Link href="/shop" className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white uppercase text-xs font-bold tracking-widest hover:bg-neutral-800 transition-all">
                            Start Shopping <ArrowRight size={14} />
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-16">
                        {/* Cart Items List */}
                        <div className="flex-1 space-y-8">
                            {items.map((item: any) => {
                                const product = item.product?.node;
                                const variation = item.variation?.node;
                                const isFeeProduct = product?.id?.includes("16805"); // Check ID roughly
                                const imgUrl = variation?.image?.sourceUrl || product?.image?.sourceUrl || "";

                                // Parse Meta Data (Customization)
                                const customizationData = item.extraData?.find((m: any) => m.key === "Customization" || m.key === "customization");

                                return (
                                    <div key={item.key} className="flex gap-6 py-6 border-b border-neutral-100 last:border-0 relative group">
                                        {/* Image */}
                                        <div className="w-24 h-32 bg-neutral-100 relative overflow-hidden flex-shrink-0">
                                            {imgUrl ? (
                                                <img src={imgUrl} alt={product?.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-neutral-300">
                                                    <span className="text-[9px] uppercase">No Img</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-lg uppercase tracking-tight">
                                                    {product?.name}
                                                </h3>
                                                <span className="font-bold text-sm">
                                                    <span dangerouslySetInnerHTML={{ __html: cleanPrice(item.subtotal) }} />
                                                </span>
                                            </div>

                                            {/* Variation Info */}
                                            {variation && (
                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    {variation.attributes?.nodes.map((attr: any) => (
                                                        <span key={attr.name} className="text-xs text-neutral-500 bg-neutral-50 px-2 py-1 rounded-sm uppercase tracking-wide">
                                                            {attr.name}: <span className="text-black font-semibold">{attr.value}</span>
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Customization Metadata */}
                                            {customizationData && (
                                                <div className="mt-4 p-4 bg-[#f4f7f5] border border-[#e0e9e2] rounded-md">
                                                    <h4 className="text-[10px] uppercase font-black tracking-widest text-[#1a472a] mb-2 flex items-center gap-2">
                                                        <ShieldCheck size={12} /> Personalization Included
                                                    </h4>
                                                    <div className="text-xs text-neutral-700 space-y-1">
                                                        {customizationData.value.split(" | ").map((line: string, idx: number) => (
                                                            <div key={idx} className="flex gap-2">
                                                                <span className="w-1 h-1 bg-black rounded-full mt-1.5 opacity-40"></span>
                                                                <span>{line}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Summary Sidebar */}
                        <div className="w-full lg:w-[400px] flex-shrink-0">
                            <div className="bg-neutral-50 p-8 rounded-xl sticky top-32">
                                <h3 className="text-xl font-black uppercase tracking-tight mb-8">Order Summary</h3>

                                <div className="space-y-4 text-sm mb-8">
                                    <div className="flex justify-between text-neutral-500">
                                        <span>Subtotal</span>
                                        <span className="text-black font-bold" dangerouslySetInnerHTML={{ __html: cleanPrice(cart?.subtotal) }} />
                                    </div>
                                    <div className="flex justify-between text-neutral-500">
                                        <span>Shipping</span>
                                        <span className="text-xs font-medium">Calculated at checkout</span>
                                    </div>
                                </div>

                                <div className="border-t border-neutral-200 pt-6 mb-8">
                                    <div className="flex justify-between items-end">
                                        <span className="font-black uppercase tracking-wider text-lg">Total</span>
                                        <div className="text-right">
                                            <span className="block text-2xl font-black tracking-tighter" dangerouslySetInnerHTML={{ __html: cleanPrice(cart?.total) }} />
                                        </div>
                                    </div>
                                </div>

                                <Link href="/checkout" className="block w-full text-center py-4 bg-black text-white uppercase text-xs font-bold tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl rounded-sm flex items-center justify-center gap-3">
                                    <Lock size={14} /> Checkout Securely
                                </Link>

                                <div className="mt-6">
                                    <ShippingGuarantee variant="minimal" className="bg-white border-neutral-200" />
                                </div>

                                <div className="mt-6 flex items-center justify-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-4" alt="Visa" />
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-6" alt="Mastercard" />
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-4" alt="PayPal" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
