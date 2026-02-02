"use client";
import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
    GET_CART,
    GET_PAYMENT_GATEWAYS,
    CHECKOUT_MUTATION,
    UPDATE_CUSTOMER_MUTATION
} from "@/lib/queries";
import { useCurrency } from "@/lib/currency";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    Loader2,
    ChevronDown,
    CreditCard,
    Lock,
    MapPin,
    Truck,
    Mail,
    User,
    ArrowRight,
    ShieldCheck
} from "lucide-react";
import { getAllPendingFiles, uploadToCloudinaryWithOrderId, clearAllPendingFiles } from "@/lib/uploadFile";
import ShippingGuarantee from "@/components/ShippingGuarantee";

// --- Helpers ---
const Spinner = ({ className }: { className?: string }) => (
    <Loader2 className={`animate-spin ${className}`} />
);

const PriceDisplay = ({ amount, className }: { amount: string | number, className?: string }) => {
    const { currency } = useCurrency();

    // If it's a number, format it
    if (typeof amount === 'number') {
        return <span className={className}>{currency.symbol} {amount.toFixed(2)}</span>;
    }

    // If it's a string...
    if (!amount) return null;

    // Clean html entities and arabic symbol
    const cleanAmount = amount.replace(/&nbsp;/g, ' ').replace(/&#160;/g, ' ').replace(/د.إ/g, "AED").replace(/AED\s?AED/g, "AED");

    // Check if it's already formatted (e.g. "AED 100")
    if (isNaN(Number(amount))) {
        // It's already formatted, just render
        return <span className={className}>{cleanAmount}</span>;
    }

    // It's a raw numeric string (e.g. "10.00")
    return <span className={className}>{currency.symbol} {cleanAmount}</span>;
};

// Premium Floating Input
function FloatingInput({
    label,
    type = "text",
    value,
    onChange,
    required = false,
    placeholder = " ",
    className = "",
    name,
    error,
    disabled = false,
    onBlur,
    icon: Icon
}: any) {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className={`relative ${className}`}>
            <div className={`
                relative w-full rounded-xl border bg-white transition-all duration-300 overflow-hidden
                ${error ? 'border-red-500 bg-red-50/10' : isFocused ? 'border-black shadow-lg shadow-black/5 ring-1 ring-black/5' : 'border-neutral-200 hover:border-neutral-300'}
                ${disabled ? 'bg-neutral-50 text-neutral-400 cursor-not-allowed' : ''}
             `}>
                <input
                    type={type}
                    name={name}
                    required={required}
                    value={value}
                    onChange={onChange}
                    onBlur={(e) => { setIsFocused(false); onBlur && onBlur(e); }}
                    onFocus={() => setIsFocused(true)}
                    disabled={disabled}
                    className="peer w-full h-[56px] px-4 pt-5 pb-1 text-base text-[#111] bg-transparent outline-none placeholder-transparent z-10 relative"
                    placeholder={placeholder}
                />
                <label
                    className={`
                        pointer-events-none absolute left-4 transition-all duration-300 ease-out origin-[0] text-neutral-500 font-medium truncate max-w-[85%]
                        ${value || isFocused ? 'top-2 text-[10px] tracking-wide uppercase' : 'top-4 text-sm'}
                    `}
                >
                    {label}
                </label>
                {Icon && (
                    <div className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${isFocused ? 'text-black' : 'text-neutral-300'}`}>
                        <Icon size={18} strokeWidth={1.5} />
                    </div>
                )}
            </div>
            {error && (
                <motion.p
                    initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                    className="text-[10px] text-red-500 mt-1 ml-2 font-medium"
                >
                    {error}
                </motion.p>
            )}
        </div>
    );
}

// Global Countries List (Comprehensive)
const ALL_COUNTRIES = [
    { code: "AE", name: "United Arab Emirates" },
    { code: "SA", name: "Saudi Arabia" },
    { code: "KW", name: "Kuwait" },
    { code: "QA", name: "Qatar" },
    { code: "BH", name: "Bahrain" },
    { code: "OM", name: "Oman" },
    { code: "US", name: "United States" },
    { code: "GB", name: "United Kingdom" },
    { code: "CA", name: "Canada" },
    { code: "AU", name: "Australia" },
    { code: "DE", name: "Germany" },
    { code: "FR", name: "France" },
    { code: "IT", name: "Italy" },
    { code: "ES", name: "Spain" },
    { code: "NL", name: "Netherlands" },
    { code: "SE", name: "Sweden" },
    { code: "NO", name: "Norway" },
    { code: "DK", name: "Denmark" },
    { code: "CH", name: "Switzerland" },
    { code: "BE", name: "Belgium" },
    { code: "AT", name: "Austria" },
    { code: "IE", name: "Ireland" },
    { code: "NZ", name: "New Zealand" },
    { code: "CN", name: "China" },
    { code: "JP", name: "Japan" },
    { code: "KR", name: "South Korea" },
    { code: "SG", name: "Singapore" },
    { code: "HK", name: "Hong Kong" },
    { code: "IN", name: "India" },
    { code: "ZA", name: "South Africa" },
    { code: "BR", name: "Brazil" },
    { code: "MX", name: "Mexico" },
    { code: "AR", name: "Argentina" },
    { code: "CL", name: "Chile" },
    { code: "CO", name: "Colombia" },
    { code: "PE", name: "Peru" },
    { code: "EG", name: "Egypt" },
    { code: "LB", name: "Lebanon" },
    { code: "JO", name: "Jordan" },
    { code: "TR", name: "Turkey" },
    { code: "RU", name: "Russia" },
    { code: "PL", name: "Poland" },
    { code: "CZ", name: "Czech Republic" },
    { code: "GR", name: "Greece" },
    { code: "PT", name: "Portugal" },
    { code: "HU", name: "Hungary" },
    { code: "RO", name: "Romania" },
    { code: "TH", name: "Thailand" },
    { code: "MY", name: "Malaysia" },
    { code: "ID", name: "Indonesia" },
    { code: "PH", name: "Philippines" },
    { code: "VN", name: "Vietnam" }
].sort((a, b) => a.name.localeCompare(b.name));

const COUNTRY_PHONE_DATA: Record<string, { code: string, flag: string, mask: string }> = {
    AE: { code: "+971", flag: "🇦🇪", mask: "50 123 4567" },
    SA: { code: "+966", flag: "🇸🇦", mask: "50 123 4567" },
    US: { code: "+1", flag: "🇺🇸", mask: "(555) 123-4567" },
    GB: { code: "+44", flag: "🇬🇧", mask: "7911 123456" },
    KW: { code: "+965", flag: "🇰🇼", mask: "1234 5678" },
    BH: { code: "+973", flag: "🇧🇭", mask: "3123 4567" },
    OM: { code: "+968", flag: "🇴🇲", mask: "9123 4567" },
    QA: { code: "+974", flag: "🇶🇦", mask: "3123 4567" },
    IN: { code: "+91", flag: "🇮🇳", mask: "98765 43210" },
    PK: { code: "+92", flag: "🇵🇰", mask: "300 1234567" },
    CA: { code: "+1", flag: "🇨🇦", mask: "(555) 123-4567" },
    AU: { code: "+61", flag: "🇦🇺", mask: "412 345 678" },
    DE: { code: "+49", flag: "🇩🇪", mask: "151 1234567" },
    FR: { code: "+33", flag: "🇫🇷", mask: "6 12 34 56 78" },
    IT: { code: "+39", flag: "🇮🇹", mask: "333 123 4567" },
    ES: { code: "+34", flag: "🇪🇸", mask: "612 34 56 78" },
    NL: { code: "+31", flag: "🇳🇱", mask: "6 12345678" },
    CH: { code: "+41", flag: "🇨🇭", mask: "79 123 45 67" },
    SE: { code: "+46", flag: "🇸🇪", mask: "70 123 45 67" },
    NO: { code: "+47", flag: "🇳🇴", mask: "912 34 567" },
    DK: { code: "+45", flag: "🇩🇰", mask: "12 34 56 78" },
    FI: { code: "+358", flag: "🇫🇮", mask: "50 1234567" },
    CN: { code: "+86", flag: "🇨🇳", mask: "138 0013 8000" },
    JP: { code: "+81", flag: "🇯🇵", mask: "90 1234 5678" },
    KR: { code: "+82", flag: "🇰🇷", mask: "10 1234 5678" },
    SG: { code: "+65", flag: "🇸🇬", mask: "9123 4567" },
    MY: { code: "+60", flag: "🇲🇾", mask: "12 345 6789" },
    TH: { code: "+66", flag: "🇹🇭", mask: "81 234 5678" },
    ID: { code: "+62", flag: "🇮🇩", mask: "812 3456 7890" },
    PH: { code: "+63", flag: "🇵🇭", mask: "917 123 4567" },
    RU: { code: "+7", flag: "🇷🇺", mask: "(912) 345-67-89" },
    TR: { code: "+90", flag: "🇹🇷", mask: "532 123 45 67" },
    BR: { code: "+55", flag: "🇧🇷", mask: "(11) 91234-5678" },
    MX: { code: "+52", flag: "🇲🇽", mask: "55 1234 5678" },
    ZA: { code: "+27", flag: "🇿🇦", mask: "83 123 4567" },
    EG: { code: "+20", flag: "🇪🇬", mask: "100 123 4567" },
    NG: { code: "+234", flag: "🇳🇬", mask: "803 123 4567" },
    DEFAULT: { code: "+1", flag: "🌍", mask: "123 456 7890" }
};



// --- Order Summary (Right Column) ---
function OrderSummary({ cart, loading }: { cart: any, loading: boolean }) {
    if (loading) return <div className="animate-pulse bg-neutral-100 h-96 w-full rounded-2xl"></div>;
    if (!cart || cart.contents.nodes.length === 0) return null;

    return (
        <div className="bg-neutral-50/50 backdrop-blur-3xl h-full min-h-screen border-l border-neutral-100 p-6 lg:p-12 w-full">
            <div className="sticky top-24 max-w-[400px] mx-auto">
                <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-widest mb-6">Your Order</h3>
                {/* Items */}
                <div className="space-y-6">
                    {cart.contents.nodes.map((item: any) => {
                        const product = item.product?.node;
                        const variation = item.variation?.node;
                        const meta = item.extraData || [];
                        const customizationKeys = meta.filter((m: any) => !m.key.startsWith('_') && m.key !== 'key');

                        return (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                                key={item.key}
                                className="flex gap-4 items-center relative group"
                            >
                                <div className="relative flex-shrink-0">
                                    <div className="w-20 h-24 bg-white rounded-xl overflow-hidden relative shadow-sm group-hover:shadow-md transition-shadow">
                                        <img
                                            src={variation?.image?.sourceUrl || product?.image?.sourceUrl || '/placeholder.png'}
                                            alt={product?.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] font-bold w-6 h-6 flex items-center justify-center rounded-full z-10 shadow-lg border-2 border-white">
                                        {item.quantity}
                                    </span>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-bold text-neutral-900 truncate tracking-tight">{product?.name}</h3>
                                    {variation && <p className="text-xs text-neutral-500 font-medium truncate mt-0.5">{variation.name.replace(`${product?.name} - `, '')}</p>}
                                    {customizationKeys.length > 0 && (
                                        <div className="mt-2 text-[10px] text-neutral-500 space-y-1 bg-white/50 p-2 rounded-md">
                                            {customizationKeys.map((m: any) => (
                                                <div key={m.key} className="flex gap-1"><span className="opacity-60">{m.key}:</span><span className="font-semibold text-neutral-700">{m.value}</span></div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="text-sm font-semibold text-neutral-900"><PriceDisplay amount={item.subtotal} /></div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Subtotals */}
                <div className="mt-10 pt-8 border-t border-dashed border-neutral-200 space-y-4">
                    <div className="flex justify-between text-sm text-neutral-500"><span>Subtotal</span><PriceDisplay amount={cart.subtotal} className="font-semibold text-neutral-900" /></div>

                    {/* Fees */}
                    {cart.fees && cart.fees.length > 0 && cart.fees.map((fee: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-sm text-neutral-500">
                            <span>{fee.name}</span>
                            <PriceDisplay amount={fee.total} className="font-semibold text-neutral-900" />
                        </div>
                    ))}
                    <div className="flex justify-between text-sm text-neutral-500">
                        <span className="flex items-center gap-1.5"><Truck size={14} /> Shipping</span>
                        {cart.shippingTotal && cart.shippingTotal !== "0" && cart.shippingTotal !== "0.00" ? (
                            <PriceDisplay amount={cart.shippingTotal} className="font-semibold text-neutral-900" />
                        ) : (
                            <span className="text-xs text-neutral-400 font-medium bg-neutral-100 px-2 py-1 rounded-full">Calculated next</span>
                        )}
                    </div>
                </div>

                {/* Total */}
                <div className="mt-8 pt-6 border-t border-neutral-200 flex justify-between items-baseline">
                    <span className="text-base font-bold text-neutral-900">Total</span>
                    <div className="text-2xl font-bold text-black flex items-baseline gap-2 tracking-tight">
                        <PriceDisplay amount={cart.total} className="" />
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- Main Checkout Page ---

// Trust Badges Component
// Trust Badges Component
const TrustBadges = () => (
    <div className="flex flex-col gap-3 mt-6 p-4 bg-neutral-50/50 rounded-xl border border-dashed border-neutral-200">
        <div className="flex items-center justify-center gap-4 opacity-80 grayscale hover:grayscale-0 transition-all duration-300">
            {/* VISA */}
            <div className="h-8 w-12 bg-white rounded shadow-sm border border-neutral-100 flex items-center justify-center p-1">
                <img src="/icons/visa.png" alt="Visa" className="w-full h-full object-contain" />
            </div>

            {/* MASTERCARD */}
            <div className="h-8 w-12 bg-white rounded shadow-sm border border-neutral-100 flex items-center justify-center p-1">
                <img src="/icons/mastercard.png" alt="Mastercard" className="w-full h-full object-contain" />
            </div>

            {/* MAESTRO / AMEX */}
            <div className="h-8 w-12 bg-white rounded shadow-sm border border-neutral-100 flex items-center justify-center p-1">
                <img src="/icons/maestro.png" alt="Maestro" className="w-full h-full object-contain" />
            </div>
        </div>
        <div className="flex items-center justify-center gap-2 text-[10px] text-neutral-400 font-medium">
            <Lock size={12} className="text-green-600" />
            <span>SSL Encrypted • 100% Secure Payment</span>
        </div>
    </div>
);
export default function CheckoutPage() {
    const { detectedCountry, loading: geoLoading } = useCurrency();
    const { data: cartData, loading: cartLoading, refetch: refetchCart } = useQuery(GET_CART, { fetchPolicy: "network-only" });
    const { data: gatewayData, loading: gatewayLoading } = useQuery(GET_PAYMENT_GATEWAYS);

    const [updateCustomer, { loading: updatingCustomer }] = useMutation(UPDATE_CUSTOMER_MUTATION);
    const [checkout, { loading: checkoutLoading }] = useMutation(CHECKOUT_MUTATION);

    const [formData, setFormData] = useState({
        email: "", firstName: "", lastName: "", address1: "", address2: "", city: "",
        country: detectedCountry || "AE", state: "", postcode: "", phone: ""
    });

    // Sync country when geolocation finishes loading
    useEffect(() => {
        if (!geoLoading && detectedCountry && formData.country === "AE" && detectedCountry !== "AE") {
            setFormData(prev => ({ ...prev, country: detectedCountry }));
        }
    }, [geoLoading, detectedCountry]);

    // Derived Phone Data
    const phoneData = COUNTRY_PHONE_DATA[formData.country] || COUNTRY_PHONE_DATA.DEFAULT;

    const [selectedRate, setSelectedRate] = useState<string | null>(null);
    const [shippingLoading, setShippingLoading] = useState(false);

    // Initial Rate Selection
    useEffect(() => {
        const rates = cartData?.cart?.availableShippingMethods?.[0]?.rates;
        if (rates && rates.length > 0 && !selectedRate) setSelectedRate(rates[0].id);
    }, [cartData]);

    const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const updateAddressDebounced = async () => {
        if (formData.country && formData.city) {
            setShippingLoading(true);
            try {
                await updateCustomer({
                    variables: {
                        input: {
                            shipping: { ...formData, postcode: formData.postcode || "00000" },
                            billing: { ...formData, postcode: formData.postcode || "00000" }
                        }
                    }
                });
                await refetchCart();
            } catch (e) {
                console.error("Shipping Update Error", e);
            } finally {
                setShippingLoading(false);
            }
        }
    };

    const handlePayment = async () => {
        if (!formData.email || !formData.address1 || !formData.phone) {
            alert("Please fill in all details, including your phone number.");
            return;
        }
        try {
            const ziinaGateway = gatewayData?.paymentGateways?.nodes?.find((g: any) => g.id === 'ziina' || g.id.includes('ziina'))
                || gatewayData?.paymentGateways?.nodes?.[0];

            if (!ziinaGateway) { alert("Payment gateway unavailable."); return; }

            // Smooth Scroll to Top + Loading State
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // Prep Phone: If user didn't type code, prepend it
            let finalPhone = formData.phone;
            if (!finalPhone.startsWith('+')) {
                finalPhone = `${phoneData.code}${finalPhone}`;
            }

            const input = {
                billing: { ...formData, phone: finalPhone, country: formData.country },
                shipping: { ...formData, phone: finalPhone, country: formData.country },
                paymentMethod: ziinaGateway.id,
                shipToDifferentAddress: false,
                customerNote: "Checkout via Drotes Next.js"
            };

            const response = await checkout({ variables: { input } });

            // Defer Upload Logic:
            if (response.data?.checkout?.order?.databaseId) {
                const orderId = response.data.checkout.order.databaseId;
                const orderKey = response.data.checkout.order.orderNumber;
                const orderTotal = parseFloat(response.data.checkout.order.total?.replace(/[^0-9.]/g, '') || "0");
                const pendingFiles = getAllPendingFiles();

                // --- CAPTURE ORDER FOR ADMIN PANEL (SIMULATION) ---
                try {
                    const savedSettings = localStorage.getItem("drotes_admin_settings");
                    if (savedSettings) {
                        const settings = JSON.parse(savedSettings);
                        const cartItems = cartData?.cart?.contents?.nodes || [];

                        const newOrder = {
                            id: `#WEB-${orderKey || orderId}`,
                            customer: `${formData.firstName} ${formData.lastName}`,
                            date: new Date().toISOString().split('T')[0],
                            total: orderTotal,
                            status: "processing",
                            shippingCost: parseFloat(cartData?.cart?.shippingTotal?.replace(/[^0-9.]/g, '') || "0"),
                            items: cartItems.map((item: any) => {
                                const pid = item.product?.node?.databaseId;
                                return {
                                    name: item.product?.node?.name,
                                    cost: settings.productCosts?.[pid] || 0, // Fetch cost from Admin Settings
                                    price: item.subtotal ? parseFloat(item.subtotal.replace(/[^0-9.]/g, '') || "0") / item.quantity : 0,
                                    quantity: item.quantity,
                                    image: item.variation?.node?.image?.sourceUrl || item.product?.node?.image?.sourceUrl,
                                    customFile: pendingFiles[item.key] ? URL.createObjectURL(pendingFiles[item.key] as any) : undefined // Note: This is a blob URL, effectively temporary for this session
                                };
                            })
                        };

                        const updatedcapturedOrders = [newOrder, ...settings.capturedOrders];
                        localStorage.setItem("drotes_admin_settings", JSON.stringify({ ...settings, capturedOrders: updatedcapturedOrders }));
                    }
                } catch (err) {
                    console.error("Failed to sync order to Admin Panel", err);
                }
                // --------------------------------------------------

                // Upload all files in parallel
                await Promise.all(
                    Object.values(pendingFiles).map(file =>
                        uploadToCloudinaryWithOrderId(file, orderId)
                            .catch(e => console.error("Deferred upload failed", e))
                    )
                );

                clearAllPendingFiles();
            }

            // Save detailed order data (Multi-layer persistence)
            if (response.data?.checkout?.order) {
                const orderData = response.data.checkout.order;
                const orderBase64 = Buffer.from(JSON.stringify(orderData)).toString('base64');

                try {
                    // 1. LocalStorage (Standard)
                    localStorage.setItem("latest_checkout_order", JSON.stringify(orderData));

                    // 2. SessionStorage (Backup)
                    sessionStorage.setItem("latest_checkout_order", JSON.stringify(orderData));

                    // 3. Cookie (Cross-port/subdomain resilient, 1 hour expiry)
                    // We strip heavy items (like lineItems) if needed, but let's try strict first
                    const simplifiedOrder = { ...orderData, lineItems: { nodes: [] } }; // Keep cookie small
                    document.cookie = `last_order_meta=${JSON.stringify(simplifiedOrder)}; path=/; max-age=3600; SameSite=Lax`;

                } catch (e) {
                    console.error("Persistence failed", e);
                }
            }

            // Fallback: Use URL Parameters for bulletproof data passing
            // This works even if LocalStorage/Cookies fail across domains/ports
            const params = new URLSearchParams();
            if (response.data?.checkout?.order) {
                const o = response.data.checkout.order;
                params.set("orderId", o.databaseId);
                params.set("orderNumber", o.orderNumber);
                params.set("email", o.billing?.email || "");
                params.set("total", o.total || "");
                params.set("key", o.orderKey || "");
                params.set("date", o.date || new Date().toISOString());
            }

            // Redirect Logic
            if (response.data?.checkout?.redirect) {
                window.location.href = response.data.checkout.redirect;
            } else if (response.data?.checkout?.order?.databaseId) {
                window.location.href = `/checkout/order-received?${params.toString()}`;
            } else {
                alert("Payment initialization failed. Please try again.");
            }
        } catch (err) {
            console.error("Checkout Error:", err);
            alert("An error occurred processing your request.");
        }
    };

    const shippingRates = cartData?.cart?.availableShippingMethods?.[0]?.rates || [];

    if (cartLoading && !cartData) return <div className="h-screen w-full flex items-center justify-center bg-white"><div className="flex flex-col items-center gap-4"><img src="/checkout-logo-center.jpg" className="h-8 animate-pulse opacity-50" /><Spinner className="w-5 h-5 text-neutral-300" /></div></div>;

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="min-h-screen bg-white font-sans text-[#111] selection:bg-black selection:text-white"
        >
            {/* Sticky Minimal Header */}
            <header className="w-full border-b border-neutral-100 bg-white/80 backdrop-blur-md py-4 flex justify-center sticky top-0 z-50">
                <Link href="/">
                    <img src="/checkout-logo-center.jpg" alt="Drotes" className="h-[28px] w-auto object-contain hover:opacity-70 transition-opacity" />
                </Link>
            </header>

            <div className="flex flex-col lg:flex-row">
                {/* Left Column: Form */}
                <div className="w-full lg:w-[58%] order-2 lg:order-1 pt-8 lg:pt-0">
                    <div className="max-w-[600px] ml-auto mr-auto lg:mr-0 lg:ml-auto px-6 py-8 lg:px-16 lg:py-16 space-y-12">

                        {/* 1. Contact */}
                        <motion.section initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold tracking-tight text-black flex items-center gap-2">
                                    Contact
                                </h2>
                                <Link href="/login" className="text-xs font-semibold underline decoration-neutral-300 underline-offset-4 hover:decoration-black transition-all">Log in</Link>
                            </div>
                            <FloatingInput
                                label="Email address" name="email" type="email" required
                                value={formData.email} onChange={handleInput} icon={Mail}
                            />
                            <div className="flex items-center gap-3 mt-4 ml-1">
                                <input type="checkbox" id="newsletter" className="accent-black w-4 h-4 rounded border-gray-300 cursor-pointer" />
                                <label htmlFor="newsletter" className="text-sm text-neutral-500 cursor-pointer select-none font-medium">Email me with news and exclusive offers</label>
                            </div>
                        </motion.section>

                        {/* 2. Delivery */}
                        <motion.section initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                            <h2 className="text-xl font-bold tracking-tight text-black mb-6 flex items-center gap-2">
                                Shipping Address
                            </h2>
                            <div className="space-y-4">
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-neutral-100 rounded-xl -z-10 group-hover:scale-[1.01] transition-transform"></div>
                                    <select
                                        className="w-full h-[56px] appearance-none rounded-xl border border-neutral-200 bg-white px-4 pt-5 pb-1 text-base text-[#111] outline-none focus:border-black focus:ring-1 focus:ring-black/5"
                                        name="country"
                                        value={formData.country}
                                        onChange={(e) => { handleInput(e); updateAddressDebounced(); }}
                                    >
                                        {ALL_COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                                    </select>
                                    <label className="pointer-events-none absolute left-4 top-2 text-[10px] text-neutral-500 font-medium uppercase tracking-wide">Country/Region</label>
                                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FloatingInput label="First name" name="firstName" required value={formData.firstName} onChange={handleInput} icon={User} />
                                    <FloatingInput label="Last name" name="lastName" required value={formData.lastName} onChange={handleInput} />
                                </div>

                                <FloatingInput label="Address" name="address1" required value={formData.address1} onChange={handleInput} onBlur={updateAddressDebounced} icon={MapPin} />
                                <FloatingInput label="Apartment, suite, etc. (optional)" name="address2" value={formData.address2} onChange={handleInput} />

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="col-span-1"><FloatingInput label="City" name="city" required value={formData.city} onChange={handleInput} onBlur={updateAddressDebounced} /></div>

                                    {/* Smart Phone Field */}
                                    <div className="col-span-2 relative">
                                        <div className="relative w-full rounded-xl border border-neutral-200 bg-white transition-all duration-300 overflow-hidden hover:border-neutral-300 focus-within:border-black focus-within:shadow-lg focus-within:shadow-black/5 focus-within:ring-1 focus-within:ring-black/5">
                                            {/* Flag/Code Prefix */}
                                            <div className="absolute left-0 top-0 bottom-0 w-[4.5rem] bg-neutral-50 border-r border-neutral-100 flex items-center justify-center text-xs text-neutral-600 font-medium select-none z-10">
                                                <span className="mr-1">{phoneData.flag}</span> {phoneData.code}
                                            </div>
                                            <input
                                                type="tel"
                                                name="phone"
                                                required
                                                value={formData.phone}
                                                onChange={handleInput}
                                                className="peer w-full h-[56px] pl-[5rem] pr-4 pt-5 pb-1 text-base text-[#111] bg-transparent outline-none placeholder-transparent z-10 relative"
                                                placeholder="Mobile Phone"
                                            />
                                            <label className={`pointer-events-none absolute left-[5rem] transition-all duration-300 ease-out origin-[0] text-neutral-500 font-medium truncate max-w-[85%] ${formData.phone ? 'top-2 text-[10px] tracking-wide uppercase' : 'top-4 text-sm'}`}>
                                                Mobile Phone
                                            </label>
                                        </div>
                                        {/* Hint based on mask */}
                                        {phoneData.mask && !formData.phone && (
                                            <p className="absolute right-2 -bottom-4 text-[9px] text-neutral-400">Example: {phoneData.mask}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.section>

                        {/* 3. Shipping Method */}
                        <motion.section initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                            <h2 className="text-xl font-bold tracking-tight text-black mb-6 flex items-center gap-2">
                                Method
                            </h2>
                            <div className="bg-neutral-50 rounded-2xl p-2 border border-neutral-100">
                                {shippingLoading ? (
                                    <div className="p-8 flex items-center justify-center gap-3 text-sm text-neutral-400">
                                        <Spinner className="w-5 h-5 text-black" /> <span className="animate-pulse">Finding best rates...</span>
                                    </div>
                                ) : shippingRates.length > 0 ? (
                                    <div className="space-y-2">
                                        {shippingRates.map((rate: any) => (
                                            <motion.div
                                                layout
                                                key={rate.id}
                                                onClick={() => setSelectedRate(rate.id)}
                                                className={`
                                                    relative flex items-center justify-between p-5 cursor-pointer transition-all duration-300 rounded-xl border
                                                    ${selectedRate === rate.id ? 'bg-white border-black shadow-md scale-[1.01] z-10' : 'bg-white border-transparent hover:border-neutral-200'}
                                                `}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedRate === rate.id ? 'border-black' : 'border-neutral-300'}`}>
                                                        {selectedRate === rate.id && <motion.div layoutId="dot" className="w-2.5 h-2.5 bg-black rounded-full" />}
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-bold text-black block">{rate.label}</span>
                                                        <span className="text-[10px] text-neutral-500 font-medium">Standard Delivery</span>
                                                    </div>
                                                </div>
                                                <span className="text-sm font-bold text-black">
                                                    {rate.cost === "0" ? "Free" : <PriceDisplay amount={rate.cost} />}
                                                </span>
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-sm text-neutral-400 text-center font-medium bg-white rounded-xl border border-dashed border-neutral-200">
                                        Enter your shipping address to view available rates.
                                    </div>
                                )}
                            </div>
                        </motion.section>

                        {/* 4. Payment */}
                        <motion.section initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
                            <h2 className="text-xl font-bold tracking-tight text-black mb-2 flex items-center gap-2">
                                Payment
                            </h2>
                            <p className="text-sm text-neutral-500 mb-6 pl-8">All transactions are secure and encrypted.</p>

                            <div className="border border-neutral-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-500">
                                <div className="bg-black p-5 flex items-center justify-between text-white">
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center">
                                            <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                                        </div>
                                        <span className="text-sm font-bold tracking-wide">Credit / Debit Card</span>
                                    </div>
                                    <div className="flex gap-1 opacity-80">
                                        <CreditCard size={18} />
                                    </div>
                                </div>
                                <div className="bg-neutral-50 p-10 flex flex-col items-center text-center gap-5">
                                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                                        <Lock size={32} className="text-black/20" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-black mb-1">Redirect to Ziina</h3>
                                        <p className="text-xs text-neutral-500 max-w-xs mx-auto leading-relaxed">
                                            You will be redirected to our secure payment partner to complete your purchase safely.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.section>

                        {/* Submit Button */}
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="pt-8 pb-12">
                            <button
                                onClick={handlePayment}
                                disabled={checkoutLoading || shippingLoading}
                                className="group w-full bg-[#1b4d3e] text-white h-16 rounded-2xl text-lg font-bold hover:bg-[#143d30] transition-all shadow-[0_10px_40px_-10px_rgba(27,77,62,0.5)] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                {checkoutLoading ? <Spinner className="w-6 h-6 text-white/80" /> : (
                                    <>
                                        Pay now <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                            <div className="mt-4">
                                <ShippingGuarantee variant="minimal" className="bg-white border-neutral-200" />
                            </div>
                            <TrustBadges />
                        </motion.div>

                        <div className="border-t border-neutral-100 pt-8 flex flex-wrap gap-8 text-xs text-neutral-400 font-medium justify-center lg:justify-start">
                            <Link href="/" className="hover:text-black transition-colors">Refund policy</Link>
                            <Link href="/" className="hover:text-black transition-colors">Shipping policy</Link>
                            <Link href="/" className="hover:text-black transition-colors">Privacy policy</Link>
                            <Link href="/" className="hover:text-black transition-colors">Terms of service</Link>
                        </div>
                    </div>
                </div>

                {/* Right Column: Summary */}
                <div className="w-full lg:w-[42%] order-1 lg:order-2 hidden lg:block sticky top-0 h-screen">
                    <OrderSummary cart={cartData?.cart} loading={cartLoading} />
                </div>
            </div>
        </motion.div>
    );
}
