"use client";

import { useState, useEffect } from "react";

/* ============================
   TYPES
============================ */

export interface MenuItem {
  id: string;
  name: string;
  href: string;
}

export interface Order {
  id: string;
  customer: string;
  date: string;
  total: number;
  currency: string;
  status:
    | "processing"
    | "completed"
    | "shipped"
    | "cancelled"
    | "refunded"
    | "failed"
    | "trash";
  items: Array<{
    name: string;
    cost: number;
    price: number;
    quantity: number;
    image?: string;
    customFile?: string;
  }>;
  shippingCost: number;
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
  orders: Order[];
  capturedOrders: Order[];
  productCosts: Record<string, number>;
  productPrices: Record<string, number>;
  productOverrides: Record<string, { image?: string; galleryImages?: string[] }>;
  addonEnabledProducts?: string[];
  membersOnly: {
    enabled: boolean;
    saleDate: string;
  };
  exchangeRates?: Record<string, number>;
  shippingGuarantee: {
    enabled: boolean;
    price: number;
    productId: string;
  };
  sizeCharts?: any[];
  productSizeCharts?: Record<string, string>;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    tiktok?: string;
    youtube?: string;
  };
}

/* ============================
   DEFAULTS
============================ */

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
    { id: "2", name: "Shop", href: "/shop" },
    { id: "3", name: "About Brand", href: "#about" }
  ],
  popup: {
    enabled: false,
    title: "Join The Inner Circle",
    text: "Get exclusive access.",
    placeholder: "Enter email",
    buttonText: "Unlock"
  },
  orders: [],
  capturedOrders: [],
  productCosts: {},
  productPrices: {},
  productOverrides: {},
  addonEnabledProducts: [],
  membersOnly: {
    enabled: false,
    saleDate: "2026-02-01T00:00:00.000Z"
  },
  exchangeRates: {
    USD: 3.67,
    INR: 0.044
  },
  shippingGuarantee: {
    enabled: false,
    price: 25,
    productId: "99999"
  },
  sizeCharts: [],
  productSizeCharts: {},
  socialLinks: {}
};

/* ============================
   HOOK
============================ */

export function useAdminSettings() {
  const [settings, setSettings] = useState<AdminSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      let localMerged = { ...DEFAULT_SETTINGS };

      /* ============================
         1️⃣ Load LocalStorage (Optional)
      ============================ */
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("drotes_admin_settings");
        if (saved) {
          try {
            localMerged = { ...localMerged, ...JSON.parse(saved) };
          } catch (err) {
            console.error("Local parse failed", err);
          }
        }
      }

      // Set initial local state BUT do NOT mark loaded yet
      setSettings(localMerged);

      /* ============================
         2️⃣ Fetch Server Truth
      ============================ */
      try {
        const res = await fetch("/api/settings", { cache: "no-store" });

        if (res.ok) {
          const serverData = await res.json();

          if (Object.keys(serverData).length > 0) {
            setSettings(prev => ({
              ...prev,
              ...serverData
            }));
          }
        }
      } catch (err) {
        console.error("Server fetch failed", err);
      }

      /* ============================
         3️⃣ Mark Loaded ONLY AFTER
      ============================ */
      setIsLoaded(true);
    };

    loadSettings();
  }, []);

  /* ============================
     UPDATE SETTINGS
  ============================ */

  const updateSettings = (newSettings: Partial<AdminSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);

    if (typeof window !== "undefined") {
      localStorage.setItem(
        "drotes_admin_settings",
        JSON.stringify(updated)
      );
      window.dispatchEvent(new Event("admin-settings-updated"));
    }

    fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated)
    }).catch(err => console.error("Save failed", err));
  };

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
