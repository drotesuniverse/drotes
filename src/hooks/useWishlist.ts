"use client";
import { useState, useEffect } from "react";

export interface WishlistItem {
    id: string;
    name: string;
    price: string | number;
    image: string;
    slug: string;
}

export function useWishlist() {
    const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("drotes_wishlist");
        if (stored) {
            setWishlist(JSON.parse(stored));
        }
        setIsLoaded(true);
    }, []);

    const addToWishlist = (item: WishlistItem) => {
        // Avoid duplicates
        if (wishlist.some((w) => w.id === item.id)) return;

        const updated = [...wishlist, item];
        setWishlist(updated);
        localStorage.setItem("drotes_wishlist", JSON.stringify(updated));
    };

    const removeFromWishlist = (id: string) => {
        const updated = wishlist.filter((item) => item.id !== id);
        setWishlist(updated);
        localStorage.setItem("drotes_wishlist", JSON.stringify(updated));
    };

    const isInWishlist = (id: string) => {
        return wishlist.some((item) => item.id === id);
    };

    return {
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        isLoaded
    };
}
