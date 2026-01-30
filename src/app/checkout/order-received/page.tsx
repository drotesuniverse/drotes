"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ChevronDown, ChevronUp, MapPin, Mail, Phone, Lock, ArrowRight, ShoppingBag, Package } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@apollo/client";
import { GET_ORDER } from "@/lib/queries";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

// ===================================
// HELPER COMPONENTS
// ===================================

function DetailRow({ label, children }: { label: string, children: React.ReactNode }) {
    return (
        <div className="mb-6">
            <h4 className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">{label}</h4>
            <div className="text-sm text-neutral-900 leading-relaxed font-medium">
                {children}
            </div>
        </div>
    );
}

function SummaryItem({ item }: { item: any }) {
    return (
        <div className="flex items-start justify-between py-4 group border-b border-neutral-100 last:border-0">
            <div className="flex-1 pr-4">
                <p className="text-sm font-semibold text-neutral-900 leading-snug">{item.product?.node?.name}</p>
                {item.variation?.node?.name && (
                    <p className="text-xs text-neutral-500 mt-1">{item.variation.node.name}</p>
                )}
                <div className="text-[10px] uppercase font-bold text-neutral-400 mt-2 tracking-wider">Qty: {item.quantity}</div>
            </div>
            <div className="text-sm font-medium text-neutral-900 font-mono">
                {cleanPrice(item.total)}
            </div>
        </div>
    );
}

function CreditCardIcon({ type }: { type?: string }) {
    return (
        <div className="w-8 h-5 bg-neutral-100 rounded border border-neutral-200 flex items-center justify-center text-[8px] font-bold text-neutral-500 uppercase">
            {type?.toLowerCase().includes('visa') ? 'VISA' : 'CARD'}
        </div>
    );
}

function FooterSimple() {
    return (
        <div className="flex gap-6 text-xs text-neutral-400">
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
        </div>
    );
}

// ===================================
// PRINT ONLY INVOICE (Hidden on Screen)
// ===================================

function PrintInvoice({ order }: { order: any }) {
    if (!order) return null;
    return (
        <div className="hidden print:block p-8 bg-white text-black font-sans w-full">
            <div className="flex justify-between items-start mb-8 border-b border-black pb-4">
                <div>
                    <h1 className="text-2xl font-bold uppercase tracking-widest mb-2">Invoice</h1>
                    <p className="text-sm">Order #{order.orderNumber}</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-neutral-500">{new Date(order.date).toLocaleDateString()}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
                <div>
                    <h3 className="font-bold uppercase tracking-wider text-xs mb-2 text-neutral-500">Billed To</h3>
                    <p>{order.billing?.firstName} {order.billing?.lastName}</p>
                    <p>{order.billing?.email}</p>
                    <p>{order.billing?.address1}</p>
                    <p>{order.billing?.city}, {order.billing?.country}</p>
                </div>
                <div>
                    <h3 className="font-bold uppercase tracking-wider text-xs mb-2 text-neutral-500">Shipped To</h3>
                    <p>{order.shipping?.firstName} {order.shipping?.lastName}</p>
                    <p>{order.shipping?.address1}</p>
                    <p>{order.shipping?.city}, {order.shipping?.country}</p>
                </div>
            </div>

            <table className="w-full mb-8 text-sm">
                <thead>
                    <tr className="border-b border-black text-left">
                        <th className="py-2 font-bold uppercase text-xs">Item</th>
                        <th className="py-2 text-center font-bold uppercase text-xs">Qty</th>
                        <th className="py-2 text-right font-bold uppercase text-xs">Total</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                    {order.lineItems?.nodes?.map((item: any) => (
                        <tr key={item.id}>
                            <td className="py-3">
                                <div>{item.product?.node?.name}</div>
                                {item.variation?.node?.name && <div className="text-xs text-neutral-500">{item.variation.node.name}</div>}
                            </td>
                            <td className="py-3 text-center">{item.quantity}</td>
                            <td className="py-3 text-right">{item.total}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="flex justify-end border-t border-black pt-4">
                <div className="w-48 space-y-2 text-right">
                    <div className="flex justify-between text-sm">
                        <span>Subtotal</span>
                        <span>{order.subtotal}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span>Shipping</span>
                        <span>{order.shippingTotal || "Free"}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t border-neutral-200">
                        <span>Total</span>
                        <span>{order.total}</span>
                    </div>
                </div>
            </div>

            <div className="mt-12 pt-8 border-t border-neutral-100 text-center text-xs text-neutral-400">
                <p>Thank you for your purchase.</p>
                <p>drotes.com</p>
            </div>
        </div>
    );
}

// Helper to clean price strings
function cleanPrice(price: string | number): string {
    if (!price) return "---";
    const str = String(price);
    return str.replace(/د.إ/g, "AED").replace(/AED\s?AED/g, "AED");
}

// ===================================
// MAIN CONTENT (Screen Only)
// ===================================

function ShopifySuccessContent() {
    const searchParams = useSearchParams();
    const [showSummaryMobile, setShowSummaryMobile] = useState(false);

    // 1. Get Params
    const orderId = searchParams.get("orderId");
    const paramOrderNumber = searchParams.get("orderNumber");
    const paramEmail = searchParams.get("email");
    const paramTotal = searchParams.get("total");
    const paramDate = searchParams.get("date");

    // 2. Fetch Data
    const { data, loading, error } = useQuery(GET_ORDER, {
        variables: { orderId: orderId },
        skip: !orderId,
    });

    // 3. Construct Order Object
    const order = data?.order || {
        orderNumber: paramOrderNumber || orderId || "---",
        date: paramDate || new Date().toISOString(),
        total: paramTotal || "---",
        subtotal: paramTotal,
        email: paramEmail,
        currency: "AED",
        billing: { email: paramEmail || "Unknown" },
        shipping: { firstName: paramEmail ? "Guest" : "Customer", address1: "See details in email", city: "Processing", country: "" },
        lineItems: { nodes: [] }
    };

    if (!orderId && !order.orderNumber) return null;

    return (
        <>
            {/* SCREEN LAYOUT (Hidden on Print) */}
            <div className="flex flex-col min-h-screen font-sans print:hidden">
                {/* Header branding */}
                <header className="w-full border-b border-neutral-100 bg-white/80 backdrop-blur-md py-4 flex justify-center sticky top-0 z-50">
                    <Link href="/">
                        <img src="/checkout-logo-center.jpg" alt="Drotes" className="h-[28px] w-auto object-contain hover:opacity-70 transition-opacity" />
                    </Link>
                </header>

                <div className="flex flex-col lg:flex-row flex-1">

                    {/* LEFT COLUMN: Main Verification & Details */}
                    <div className="flex-1 bg-white lg:pt-12 lg:pb-24 lg:px-12 xl:px-24 order-2 lg:order-1 px-6 py-8">
                        <div className="max-w-xl ml-auto lg:mr-12 mr-auto">

                            {/* Header Group */}
                            <div className="mb-10">
                                <div className="flex items-start gap-4 mb-4">
                                    <CheckCircle2 className="w-12 h-12 text-black shrink-0" strokeWidth={1.5} />
                                    <div>
                                        <p className="text-sm text-neutral-500 font-medium mb-1">Order #{order.orderNumber}</p>
                                        <h1 className="text-3xl lg:text-4xl font-bold text-neutral-900 tracking-tight">
                                            Thank you, {order.shipping?.firstName || "Customer"}!
                                        </h1>
                                    </div>
                                </div>

                                <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-100 text-sm text-neutral-600">
                                    Your order is confirmed. You’ll receive an email at <span className="font-semibold text-black">{order.billing?.email}</span> with your order details.
                                </div>
                            </div>

                            {/* Customer Information Grid */}
                            <div className="border rounded-xl border-neutral-200 overflow-hidden bg-white mb-10 shadow-sm">
                                <div className="p-6 grid md:grid-cols-2 gap-8">
                                    <DetailRow label="Contact Information">
                                        <p>{order.billing?.email}</p>
                                        {order.billing?.phone && <p>{order.billing.phone}</p>}
                                    </DetailRow>
                                    <DetailRow label="Payment Method">
                                        <div className="flex items-center gap-2">
                                            <CreditCardIcon type={order.paymentMethodTitle} />
                                            <span>{order.paymentMethodTitle || "Credit Card"}</span>
                                        </div>
                                        <p className="text-neutral-500 text-xs mt-1">Wrapped securely.</p>
                                    </DetailRow>
                                    <DetailRow label="Shipping Address">
                                        <p>{order.shipping?.firstName} {order.shipping?.lastName}</p>
                                        <p>{order.shipping?.address1}</p>
                                        <p>{order.shipping?.city} {order.shipping?.postcode}</p>
                                        <p>{order.shipping?.country}</p>
                                    </DetailRow>
                                    <DetailRow label="Billing Address">
                                        <p>{order.billing?.firstName} {order.billing?.lastName}</p>
                                        <p>{order.billing?.address1}</p>
                                        <p>{order.billing?.city} {order.billing?.postcode}</p>
                                        <p>{order.billing?.country}</p>
                                    </DetailRow>
                                </div>
                                {/* Map Visual / Tracking Placeholder */}
                                <div className="bg-neutral-50 p-6 border-t border-neutral-200 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Package className="text-neutral-400" size={20} />
                                        <span className="text-sm font-medium text-neutral-600">Estimated Delivery</span>
                                    </div>
                                    <span className="text-sm font-bold text-black">3-5 Business Days</span>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-neutral-100">
                                <Link href="/shop" className="text-sm font-semibold text-black hover:opacity-70 flex items-center gap-2 transition-opacity">
                                    <ArrowRight className="rotate-180" size={16} />
                                    Return to Store
                                </Link>
                                <button onClick={() => window.print()} className="text-sm font-semibold text-neutral-500 hover:text-black transition-colors">
                                    Print Receipt
                                </button>
                            </div>

                            <div className="mt-16 pt-8 border-t border-neutral-100 lg:block hidden">
                                <FooterSimple />
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Sidebar Summary (Grey) */}
                    <div className="bg-neutral-50 lg:w-[45%] w-full border-l border-neutral-200 order-1 lg:order-2 flex flex-col">
                        <div className="lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto w-full">

                            {/* Mobile Toggle */}
                            <div
                                className="lg:hidden flex items-center justify-between p-6 border-b border-neutral-200 cursor-pointer bg-neutral-50"
                                onClick={() => setShowSummaryMobile(!showSummaryMobile)}
                            >
                                <div className="flex items-center gap-2 text-sm font-semibold text-black">
                                    <ShoppingBag size={18} />
                                    <span>{showSummaryMobile ? "Hide" : "Show"} order summary</span>
                                    {showSummaryMobile ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </div>
                                <div className="font-bold text-lg">{cleanPrice(order.total)}</div>
                            </div>

                            {/* Content */}
                            <div className={`px-6 lg:px-12 py-8 lg:py-12 max-w-lg mr-auto w-full ${showSummaryMobile ? 'block' : 'hidden lg:block'}`}>
                                {/* Items List */}
                                <div className="mb-8 border-b border-neutral-200">
                                    {loading && (
                                        <div className="animate-pulse space-y-6 py-4">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="flex justify-between items-start">
                                                    <div className="space-y-2 w-2/3">
                                                        <div className="h-4 bg-neutral-200 rounded w-full" />
                                                        <div className="h-3 bg-neutral-200 rounded w-1/2" />
                                                    </div>
                                                    <div className="h-4 bg-neutral-200 rounded w-16" />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {(error || (!loading && (!order.lineItems?.nodes || order.lineItems.nodes.length === 0))) && (
                                        <div className="py-6 text-sm text-neutral-500">
                                            <p className="mb-2 font-medium">Detailed item list unavailable.</p>
                                            <p>Please check the confirmation email sent to <span className="font-bold">{order.billing.email}</span> for total item breakdown.</p>
                                        </div>
                                    )}

                                    {!loading && !error && order.lineItems?.nodes?.length > 0 && (
                                        order.lineItems.nodes.map((item: any) => (
                                            <SummaryItem key={item.id} item={item} />
                                        ))
                                    )}
                                </div>

                                {/* Totals Block */}
                                <div className="space-y-3 pb-8 border-b border-neutral-200">
                                    <div className="flex justify-between text-sm text-neutral-600">
                                        <span>Subtotal</span>
                                        <span className="font-medium text-neutral-900">{cleanPrice(order.subtotal || paramTotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-neutral-600">
                                        <span>Shipping</span>
                                        <span className="font-medium text-neutral-900">{cleanPrice(order.shippingTotal || "Calculated")}</span>
                                    </div>
                                </div>

                                {/* Grand Total */}
                                <div className="pt-6 flex justify-between items-center">
                                    <span className="text-base font-medium text-neutral-900">Total</span>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-xs text-neutral-500 uppercase">{order.currency || "AED"}</span>
                                        <span className="text-2xl font-bold text-neutral-900 tracking-tight">{cleanPrice(order.total || paramTotal)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print Component */}
            <PrintInvoice order={order} />
        </>
    );
}

export default function OrderReceivedPage() {
    return (
        <main className="min-h-screen bg-white">
            <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center bg-white">
                    <div className="animate-pulse flex flex-col items-center">
                        <div className="h-12 w-12 bg-neutral-100 rounded-full mb-4"></div>
                        <div className="h-4 w-32 bg-neutral-100 rounded"></div>
                    </div>
                </div>
            }>
                <ShopifySuccessContent />
            </Suspense>
        </main>
    );
}
