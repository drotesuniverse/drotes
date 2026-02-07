"use client";
import { useState, useEffect } from "react";

// Types
export interface MenuItem {
    id: string;
    name: string;
    href: string;
}

export interface AdminSettings {
    logo: {
        url: string;
        width: number;
        height: number;
    };
    heroImage: string;
    heroOverlayOpacity: number;
    menuItems: MenuItem[];
    popup: {
        enabled: boolean;
        title: string;
        text: string;
        placeholder?: string;
        buttonText?: string;
        bgImage?: string;
    };
    orders: Order[]; // Mock orders
    capturedOrders: Order[]; // Real orders from checkout
    productCosts: Record<string, number>; // databaseId -> cost
    productPrices: Record<string, number>; // databaseId -> price override
    productOverrides: Record<string, { image?: string; galleryImages?: string[] }>; // databaseId -> override
    addonEnabledProducts?: string[]; // List of product IDs with addon enabled
    membersOnly: {
        enabled: boolean;
        saleDate: string; // ISO string for countdown
    };
    exchangeRates?: Record<string, number>;
    shippingGuarantee: {
        enabled: boolean;
        price: number;
        productId: string; // The virtual product ID in WooCommerce
    };
    sizeCharts?: Array<{ id: string; name: string; headers: string[]; rows: string[][]; alternateRows?: string[][]; image?: string; unit?: "cm" | "in"; allowConversion?: boolean }>; // Interactive Size Charts (Table-based)
    productSizeCharts?: Record<string, string>; // Product Name -> Chart ID override
    socialLinks?: {
        instagram?: string;
        twitter?: string;
        tiktok?: string;
        youtube?: string;
    };
}

export interface Order {
    id: string;
    customer: string;
    date: string;
    total: number;
    currency: string;
    status: "processing" | "completed" | "shipped" | "cancelled" | "refunded" | "failed" | "trash";
    items: Array<{ name: string; cost: number; price: number; quantity: number; image?: string; customFile?: string }>;
    shippingCost: number;
}

// Defaults
const DEFAULT_SETTINGS: AdminSettings = {
    logo: {
        url: "/logo.png",
        width: 80,
        height: 24
    },
    heroImage: "/hero-main.png",
    heroOverlayOpacity: 0.5,
    menuItems: [
        { id: "1", name: "Home", href: "/" },
        { id: "2", name: "Drop: anec:dote", href: "/shop" },
        { id: "3", name: "About Brand", href: "#about" }
    ],
    popup: {
        enabled: false,
        title: "Join The Inner Circle",
        text: "Get exclusive access to new drops and limited editions.",
        placeholder: "ENTER EMAIL ACCESS CODE",
        buttonText: "UNLOCK ACCESS"
    },
    orders: [
        {
            id: "#WEB-1001",
            customer: "Fayiz Al Amri",
            date: "2026-01-26",
            total: 1250,
            currency: "AED",
            status: "processing",
            items: [{ name: "Boxed Hoodie", cost: 150, price: 1250, quantity: 1 }],
            shippingCost: 30
        },
        {
            id: "#WEB-1002",
            customer: "Sarah Jones",
            date: "2026-01-25",
            total: 3400,
            currency: "AED",
            status: "completed",
            items: [
                { name: "Heavyweight Tee", cost: 80, price: 450, quantity: 2 },
                { name: "Wide Leg Cargo", cost: 200, price: 2500, quantity: 1 }
            ],
            shippingCost: 45
        }
    ],
    capturedOrders: [],
    productCosts: {},
    productPrices: {},
    productOverrides: {},
    addonEnabledProducts: [], // Default empty
    membersOnly: {
        enabled: false,
        saleDate: "2026-02-01T00:00:00.000Z" // Static default for hydration safety
    },
    exchangeRates: {
        USD: 3.67,
        INR: 0.044, // Approx 1 AED = 22.7 INR (1/0.044)
        EUR: 4.0,
        GBP: 4.8
    },
    shippingGuarantee: {
        enabled: true,
        price: 25,
        productId: "99999" // Default placeholder
    },
    sizeCharts: [
        {
            id: "default",
            name: "Standard Size Guide",
            headers: ["Size", "Chest (cm)", "Length (cm)", "Shoulder (cm)"],
            rows: [
                ["S", "52", "68", "45"],
                ["M", "55", "70", "47"],
                ["L", "58", "72", "49"],
                ["XL", "61", "74", "51"]
            ]
        }
    ],
    productSizeCharts: {},
    socialLinks: {
        instagram: "anecdotedrotes",
        twitter: "drotes",
        tiktok: "drotes"
    }
};

export function useAdminSettings() {
    const [settings, setSettings] = useState<AdminSettings>(DEFAULT_SETTINGS);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from Server + LocalStorage
    useEffect(() => {
        const loadSettings = async () => {
            let merged = { ...DEFAULT_SETTINGS };
            let hasLocalData = false;

            // 1. Try LocalStorage (Fastest) - Optimistic update
            if (typeof window !== "undefined") {
                const saved = localStorage.getItem("drotes_admin_settings");
                if (saved) {
                    try {
                        merged = { ...merged, ...JSON.parse(saved) };
                        hasLocalData = true;
                    } catch (e) { }
                }
            }

            // OPTIMIZATION: If we have local data, or even if we don't (using defaults), 
            // set loaded to true IMMEDIATELY to unblock UI.
            setSettings(merged);
            setIsLoaded(true);

            // 2. Try Server (Truth) - Background Update
            try {
                const res = await fetch('/api/settings', { cache: 'no-store' }); // Disable caching
                if (res.ok) {
                    const serverData = await res.json();

                    // Only update if server has meaningful data
                    if (Object.keys(serverData).length > 0) {
                        // MIGRATION: Ensure all size charts have headers and rows (Legacy fallback)
                        const migratedCharts = (serverData.sizeCharts || []).map((chart: any) => ({
                            ...chart,
                            headers: chart.headers || ["Size", "Measurement"],
                            rows: chart.rows || (chart.content ? [] : [["", ""]]), // Fallback for very old data
                            unit: chart.unit || "cm" // Default to CM
                        }));

                        const migratedData = { ...serverData, sizeCharts: migratedCharts };

                        // Intelligent Merge: Don't overwrite if local defines it but server is empty
                        setSettings(prev => {
                            // If we have local menu items but server sent empty/default, keep local
                            const validMenuItems = (migratedData.menuItems?.length > 0)
                                ? migratedData.menuItems
                                : prev.menuItems;

                            return {
                                ...prev,
                                ...migratedData,
                                menuItems: validMenuItems
                            };
                        });
                    }
                }
            } catch (e) {
                console.error("Failed to fetch server settings", e);
            }

            // 3. Fetch Real WooCommerce Orders - Background Update
            try {
                const orderRes = await fetch('/api/orders');
                if (orderRes.ok) {
                    const wcOrders = await orderRes.json();
                    const mappedOrders: Order[] = wcOrders.map((o: any) => ({
                        id: `#${o.id}`,
                        customer: `${o.billing.first_name} ${o.billing.last_name}`,
                        date: o.date_created.split('T')[0],
                        total: parseFloat(o.total),
                        currency: o.currency || "AED",
                        status: o.status === 'completed' ? 'completed' : o.status === 'processing' ? 'processing' : 'cancelled', // simplify status
                        items: o.line_items.map((li: any) => ({
                            name: li.name,
                            cost: 0, // WC doesn't usually share cost, default to 0 (will use override)
                            price: parseFloat(li.price),
                            quantity: li.quantity,
                            image: li.image?.src // Optional, WC sometimes includes image in line items meta
                        })),
                        shippingCost: parseFloat(o.shipping_total)
                    }));

                    // Replace mock orders with real ones in the background
                    setSettings(prev => ({ ...prev, orders: mappedOrders }));
                }
            } catch (e) {
                console.error("Failed to fetch WC orders", e);
            }
        };

        loadSettings();
    }, []);

    // Save method with Server Sync
    const updateSettings = (newSettings: Partial<AdminSettings>) => {
        const updated = { ...settings, ...newSettings };
        setSettings(updated);

        // 1. Local Persistence
        if (typeof window !== "undefined") {
            localStorage.setItem("drotes_admin_settings", JSON.stringify(updated));
            window.dispatchEvent(new Event("admin-settings-updated"));
        }

        // 2. Server Persistence
        fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updated)
        }).catch(err => console.error("Failed to save to server", err));
    };

    // Calculate Profit for an Order
    const calculateOrderProfit = (order: Order) => {
        let orderTotalRevenue = 0;
        let orderTotalCost = 0;

        const processedItems = order.items.map(item => {
            // COST LOGIC: Use setting override -> Fallback to item cost -> Fallback to 0
            const unitCost = settings.productCosts[item.name] !== undefined
                ? Number(settings.productCosts[item.name])
                : (item.cost || 0);

            // PRICE LOGIC: Use setting override -> Fallback to item price
            // Note: Changing price retrospectively changes the *calculated* revenue for analytics,
            // even if the customer paid differently. This is often desired for "correction" purposes.
            const unitPrice = settings.productPrices?.[item.name] !== undefined
                ? Number(settings.productPrices[item.name])
                : item.price;

            const itemRevenue = unitPrice * item.quantity;
            const itemCost = unitCost * item.quantity;

            orderTotalRevenue += itemRevenue;
            orderTotalCost += itemCost;

            return { ...item, cost: unitCost, price: unitPrice };
        });

        // Use the recalculated revenue if we want "corrected" stats,
        // OR stick to `order.total` if we only want to change Costs.
        // Given user said "price shown is wrong", let's affect revenue too if overridden.
        // However, `order.total` usually includes shipping.
        // Let's recalculate total based on new items + existing shipping.

        // If NO price overrides exist for this order's items, usually matches order.total
        // But to be safe and allow "Price Correction", we rely on the sum.
        const effectiveRevenue = orderTotalRevenue + (order.shippingCost || 0);

        const profit = effectiveRevenue - (orderTotalCost + (order.shippingCost || 0));
        const margin = effectiveRevenue > 0 ? (profit / effectiveRevenue) * 100 : 0;

        return { profit, margin, totalCost: orderTotalCost + (order.shippingCost || 0), adjustedTotal: effectiveRevenue };
    };

    return {
        settings,
        isLoaded,
        updateSettings,
        calculateOrderProfit
    };
}
