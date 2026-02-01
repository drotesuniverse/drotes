"use client";
import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

interface CurrencyInfo {
    code: string;       // e.g., "USD", "INR", "AED"
    symbol: string;     // e.g., "$", "₹", "AED"
    rate: number;       // Exchange rate from AED (base currency)
    position: "left" | "right"; // Symbol position
}

const FALLBACK_RATES: Record<string, number> = {
    "AED": 1,
    "USD": 0.272,
    "EUR": 0.25,
    "GBP": 0.21,
    "INR": 25.00, // Tuned to match live backend rate
    "SAR": 1.02,
    "KWD": 0.083
};

interface CurrencyContextType {
    currency: CurrencyInfo;
    loading: boolean;
    formatAddonPrice: (priceInAED: number) => string;
    formatValue: (value: number) => string;
    cleanWooPrice: (priceString: string) => string;
    syncFromPriceString: (priceString: string) => void;
    detectedCountry: string;
}

// Default to AED
const defaultCurrency: CurrencyInfo = {
    code: "AED",
    symbol: "AED",
    rate: 1,
    position: "left"
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
    const [currency, setCurrency] = useState<CurrencyInfo>(defaultCurrency);
    const [rates, setRates] = useState<Record<string, number>>(FALLBACK_RATES);
    const [detectedCountry, setDetectedCountry] = useState("AE");
    const [loading, setLoading] = useState(true);

    // Fetch currency info from Curcy API on mount
    useEffect(() => {
        const fetchCurrencyInfo = async () => {
            try {
                const res = await fetch("/api/currencies");
                if (!res.ok) throw new Error("Failed to fetch");
                const data = await res.json();

                if (data.rates) {
                    console.log("✅ [Currency] LIVE RATES FETCHED:", data.rates);
                    setRates(data.rates);
                } else {
                    console.warn("⚠️ [Currency] API returned no rates. Data:", data);
                }

                // Curcy WMC returns data in different formats depending on endpoint
                // Try to parse the response
                if (data.current_currency) {
                    // WMC params endpoint format
                    setCurrency({
                        code: data.current_currency || "AED",
                        symbol: data.currency_symbol || data.current_currency || "AED",
                        rate: parseFloat(data.rate) || 1,
                        position: data.currency_pos === "left" ? "left" : "right"
                    });
                } else if (data.code) {
                    // WC data/currencies format
                    setCurrency({
                        code: data.code || "AED",
                        symbol: (data.code === "AED") ? "AED" : (data.symbol || data.code || "AED"),
                        rate: (data.rates && data.rates[data.code]) || 1,
                        position: "left"
                    });
                }

                // NEW: Detect Country from API (if backend provides it, otherwise fallback to CC code)
                if (data.country) {
                    setDetectedCountry(data.country);
                } else if (data.current_currency === 'INR') {
                    setDetectedCountry('IN');
                } else if (data.current_currency === 'SAR') {
                    setDetectedCountry('SA');
                } else if (data.current_currency === 'USD') {
                    setDetectedCountry('US');
                }
            } catch (err) {
                console.error("Currency fetch failed, using defaults:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCurrencyInfo();
    }, []);

    // Format addon prices (which are always defined in AED in the codebase)
    const formatAddonPrice = useCallback((priceInAED: number): string => {
        const converted = priceInAED * currency.rate;
        return formatValue(converted);
    }, [currency]);

    // Format any value in the CURRENT currency
    const formatValue = useCallback((value: number): string => {
        let formattedValue: string;
        if (currency.code === "INR") {
            // Indian formatting
            formattedValue = value.toLocaleString("en-IN", { maximumFractionDigits: 0 });
        } else if (currency.code === "USD" || currency.code === "EUR" || currency.code === "GBP") {
            formattedValue = value.toFixed(2);
        } else {
            formattedValue = Math.round(value).toString();
        }

        // Apply symbol position
        if (currency.position === "left") {
            return `${currency.symbol}${formattedValue}`;
        } else {
            return `${formattedValue} ${currency.symbol}`;
        }
    }, [currency]);

    // Clean WooCommerce price strings (remove HTML entities, keep currency formatting)
    const cleanWooPrice = useCallback((priceString: string): string => {
        if (!priceString) return "";
        return priceString
            .replace(/&nbsp;/g, " ")
            .replace(/&#160;/g, " ")
            .replace(/<[^>]*>/g, "") // Remove HTML tags
            .replace(/د.إ/g, "AED")   // Arabic AED
            .replace(/ريال/g, "SAR")  // Saudi
            .replace(/₹/g, "₹")      // Rupee
            .trim();
    }, []);

    // Sync currency based on incoming price string (detect $ vs AED vs ₹)
    const syncFromPriceString = useCallback((priceString: string) => {
        if (!priceString) return;

        let newCurrency: CurrencyInfo | null = null;

        if (priceString.includes("₹") || priceString.includes("INR")) {
            newCurrency = { ...currency, code: "INR", symbol: "₹" };
        } else if (priceString.includes("$") || priceString.includes("USD")) {
            newCurrency = { ...currency, code: "USD", symbol: "$" };
        } else if (priceString.includes("AED") || priceString.includes("د.إ") || priceString.includes("إ")) {
            newCurrency = { ...currency, code: "AED", symbol: "AED" };
        } else if (priceString.includes("SR") || priceString.includes("SAR") || priceString.includes("ريال")) {
            newCurrency = { ...currency, code: "SAR", symbol: "SAR" };
        } else if (priceString.includes("KD") || priceString.includes("KWD")) {
            newCurrency = { ...currency, code: "KWD", symbol: "KD" };
        } else if (priceString.includes("€") || priceString.includes("EUR")) {
            newCurrency = { ...currency, code: "EUR", symbol: "€" };
        } else if (priceString.includes("£") || priceString.includes("GBP")) {
            newCurrency = { ...currency, code: "GBP", symbol: "£" };
        }

        // Only update if code changed or symbol changed
        if (newCurrency && (newCurrency.code !== currency.code || newCurrency.symbol !== currency.symbol)) {
            newCurrency.rate = rates[newCurrency.code] || FALLBACK_RATES[newCurrency.code] || 1;
            setCurrency(prev => ({ ...prev, ...newCurrency }));

            // NEW: Set Standard Plugin Cookies so Backend knows the currency
            if (typeof document !== 'undefined') {
                document.cookie = `wmc_current_currency=${newCurrency.code}; path=/; max-age=31536000; SameSite=Lax`;
                document.cookie = `woocs_current_currency=${newCurrency.code}; path=/; max-age=31536000; SameSite=Lax`;
                document.cookie = `woocommerce_current_currency=${newCurrency.code}; path=/; max-age=31536000; SameSite=Lax`;
                document.cookie = `yaycurrency_current_currency=${newCurrency.code}; path=/; max-age=31536000; SameSite=Lax`;
            }
        }
    }, [currency, rates]);

    return (
        <CurrencyContext.Provider value={{ currency, loading, formatAddonPrice, formatValue, cleanWooPrice, syncFromPriceString, detectedCountry }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrency() {
    const context = useContext(CurrencyContext);
    if (!context) {
        throw new Error("useCurrency must be used within a CurrencyProvider");
    }
    return context;
}

// Legacy compatibility exports (for gradual migration)
// These are deprecated but prevent breaking existing code
export const formatPrice = (value: number) => `AED ${value}`;
export const convertValue = (value: number) => value;
export const syncCurrency = () => { };
