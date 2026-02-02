"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, Search, ShoppingBag, X, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

import { useQuery, useLazyQuery, useMutation } from "@apollo/client";
import { GET_CART, SEARCH_PRODUCTS, REMOVE_CART_ITEM } from "@/lib/queries";
import { useAdminSettings } from "@/hooks/useAdminSettings";

interface NavigationProps {
    theme?: "dark" | "light";
}

export default function Navigation({ theme = "dark" }: NavigationProps) {
    const { settings } = useAdminSettings();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [cartOpen, setCartOpen] = useState(false);

    const { data: cartData, refetch: refetchCart, error } = useQuery(GET_CART, {
        fetchPolicy: "cache-and-network",
        notifyOnNetworkStatusChange: true
    });

    // Remove Cart Item Mutation
    const [removeFromCart, { loading: removingItem }] = useMutation(REMOVE_CART_ITEM, {
        onCompleted: () => {
            refetchCart();
            window.dispatchEvent(new Event('cart-updated'));
        }
    });
    const [removingKey, setRemovingKey] = useState<string | null>(null);

    const handleRemoveItem = async (key: string) => {
        setRemovingKey(key);
        try {
            await removeFromCart({ variables: { keys: [key] } });
        } catch (err) {
            console.error('Failed to remove item:', err);
        } finally {
            setRemovingKey(null);
        }
    };

    // Listen for global cart updates
    useEffect(() => {
        const handleCartUpdate = () => {
            refetchCart();
            setCartOpen(true);
        };
        window.addEventListener('cart-updated', handleCartUpdate);
        return () => window.removeEventListener('cart-updated', handleCartUpdate);
    }, [refetchCart]);

    // Refetch when drawer opens
    useEffect(() => {
        if (cartOpen) refetchCart();
    }, [cartOpen, refetchCart]);
    const cartCount = cartData?.cart?.contents?.nodes?.length || 0;

    // Search Query
    const [executeSearch, { data: searchData, loading: searchLoading }] = useLazyQuery(SEARCH_PRODUCTS);

    // Handle Search Input
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (searchQuery.length > 2) {
                executeSearch({ variables: { search: searchQuery } });
            }
        }, 500);
        return () => clearTimeout(delayDebounce);
    }, [searchQuery, executeSearch]);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Helper to clean price
    const cleanPrice = (price: string) => {
        if (!price) return "";
        let cleaned = price.replace(/&nbsp;/g, ' ').replace(/&#160;/g, ' ');
        return cleaned.replace(/د.إ/g, "AED").replace(/AED\s?AED/g, "AED");
    };

    return (
        <>
            <nav className={cn(
                "fixed top-0 left-0 w-full z-50 px-6 py-6 transition-all duration-500 ease-out",
                scrolled ? (theme === "dark" ? "bg-[#050505]/90 backdrop-blur-md py-4" : "bg-white/90 backdrop-blur-md py-4 shadow-sm") : "bg-transparent"
            )}>
                <div className="max-w-[1800px] mx-auto grid grid-cols-3 items-center">
                    {/* Desktop Menu (Left) */}
                    <div className="hidden md:flex items-center gap-8">
                        {settings.menuItems.map((link) => {
                            const isExternal = link.href.startsWith("http");
                            return (
                                isExternal ? (
                                    <a
                                        key={link.id}
                                        href={link.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={cn(
                                            "text-xs uppercase tracking-widest transition-colors font-medium cursor-pointer",
                                            theme === "dark" ? "text-white/80 hover:text-white" : "text-black/60 hover:text-black"
                                        )}
                                    >
                                        {link.name}
                                    </a>
                                ) : (
                                    <Link
                                        key={link.id}
                                        href={link.href}
                                        className={cn(
                                            "text-xs uppercase tracking-widest transition-colors font-medium",
                                            theme === "dark" ? "text-white/80 hover:text-white" : "text-black/60 hover:text-black"
                                        )}
                                    >
                                        {link.name}
                                    </Link>
                                )
                            );
                        })}
                    </div>

                    {/* Mobile Menu Button (Left) */}
                    <div className="flex md:hidden justify-start">
                        <button onClick={() => setMobileMenuOpen(true)} className={cn("transition-colors", theme === "dark" ? "text-white hover:text-white/60" : "text-black hover:text-black/60")}>
                            <Menu strokeWidth={1} size={24} />
                        </button>
                    </div>

                    {/* Center: Logo */}
                    <div className="flex justify-center">
                        <Link href="/" className={`relative opacity-90 hover:opacity-100 transition-opacity`} style={{ width: settings.logo.width, height: settings.logo.height }}>
                            <Image
                                src={settings.logo.url}
                                alt="Drotes"
                                fill
                                className={cn(
                                    "object-contain object-center",
                                    theme === "dark" ? "invert brightness-0 invert" : "brightness-0"
                                )}
                            />
                        </Link>
                    </div>

                    {/* Right: Cart & Search */}
                    <div className="flex justify-end items-center gap-6" >
                        <div className="hidden md:flex items-center gap-6 pr-6 border-r border-black/5 mr-2">
                            <a
                                href="https://anecdote.drotes.com"
                                target="_blank"
                                className={cn(
                                    "flex items-center gap-3 px-4 py-2 rounded-full transition-all group relative overflow-hidden",
                                    theme === "dark" ? "bg-white/5 hover:bg-white/10" : "bg-black/5 hover:bg-black/10"
                                )}
                            >
                                <div className="relative flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping opacity-40" />
                                    <div className="absolute w-1 h-1 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                </div>
                                <span className={cn(
                                    "text-[9px] font-black uppercase tracking-[0.2em] transition-colors",
                                    theme === "dark" ? "text-white/40 group-hover:text-white" : "text-black/40 group-hover:text-black"
                                )}>
                                    The Narrative
                                </span>
                            </a>
                        </div>

                        <button
                            onClick={() => setSearchOpen(true)}
                            className={cn("transition-colors hidden md:block", theme === "dark" ? "text-white hover:text-white/60" : "text-black hover:text-black/60")}
                        >
                            <Search strokeWidth={1} size={20} />
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setCartOpen(true)}
                                className={cn("transition-colors relative", theme === "dark" ? "text-white hover:text-white/60" : "text-black hover:text-black/60")}
                            >
                                <ShoppingBag strokeWidth={1} size={20} />
                                {cartCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-emerald-600 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                                        {cartCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Cart Drawer (Right Side) */}
            <AnimatePresence>
                {cartOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setCartOpen(false)}
                            className="fixed inset-0 bg-black/50 z-[1000] backdrop-blur-sm"
                        />
                        {/* Drawer */}
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="fixed top-0 right-0 h-full w-full max-w-[420px] bg-white/80 backdrop-blur-2xl z-[1001] shadow-2xl flex flex-col border-l border-white/20"
                        >
                            {/* Drawer Header */}
                            <div className="flex items-center justify-between p-8 border-b border-black/5 bg-white/50">
                                <div className="flex items-baseline gap-2">
                                    <h2 className="text-xl font-black uppercase tracking-tighter text-black">Your Bag</h2>
                                    <span className="text-sm font-bold text-neutral-400">({cartCount})</span>
                                </div>
                                <button
                                    onClick={() => setCartOpen(false)}
                                    className="p-2 hover:bg-black/5 rounded-full transition-colors text-black/60 hover:text-black"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Cart Items */}
                            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                                {cartCount === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-in fade-in zoom-in duration-300">
                                        <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-300">
                                            <ShoppingBag size={32} strokeWidth={1.5} />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-sm font-bold uppercase tracking-widest text-black">Your bag is empty</h3>
                                            <p className="text-xs text-neutral-500 max-w-[200px] mx-auto leading-relaxed">
                                                Looks like you haven't added anything to your bag yet.
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => { setCartOpen(false); }}
                                            className="px-8 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-full hover:scale-105 active:scale-95 transition-all shadow-xl"
                                        >
                                            Start Shopping
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-8">
                                        {/* Items List */}
                                        <div className="space-y-6">
                                            {cartData?.cart?.contents?.nodes
                                                ?.filter((item: any) => {
                                                    const productSlug = (item.product?.node?.slug || '').toLowerCase();
                                                    return !productSlug.includes('fee') && !productSlug.includes('customization');
                                                })
                                                .map((item: any) => {
                                                    const productName = item.variation?.node?.name || item.product?.node?.name || 'Product';
                                                    const imageUrl = item.variation?.node?.image?.sourceUrl || item.product?.node?.image?.sourceUrl || '';

                                                    // Parse Customization
                                                    const customization = item.extraData?.find((m: any) => m.key === "Customization" || m.key === "customization");

                                                    return (
                                                        <div key={item.key} className={`group relative flex gap-5 ${removingKey === item.key ? 'opacity-50' : ''}`}>
                                                            {/* Delete Button (Absolute) */}
                                                            <button
                                                                onClick={() => handleRemoveItem(item.key)}
                                                                disabled={removingKey === item.key}
                                                                className="absolute top-0 right-0 p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-300 hover:text-red-500 disabled:opacity-50 z-10"
                                                                title="Remove item"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>

                                                            {/* Image */}
                                                            <div className="w-24 h-32 bg-neutral-100 flex-shrink-0 overflow-hidden relative">
                                                                {imageUrl ? (
                                                                    <img src={imageUrl} alt={productName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-neutral-300 text-[10px]">NO IMG</div>
                                                                )}
                                                            </div>

                                                            {/* Details */}
                                                            <div className="flex-1 py-1 flex flex-col justify-between pr-4">
                                                                <div>
                                                                    <div className="flex justify-between items-start mb-1">
                                                                        <h4 className="text-sm font-bold uppercase tracking-wide leading-tight text-black line-clamp-2">
                                                                            {productName}
                                                                        </h4>
                                                                    </div>
                                                                    <div className="text-sm font-bold text-black mb-2" dangerouslySetInnerHTML={{ __html: cleanPrice(item.subtotal || '') }} />

                                                                    {/* Customization Badge */}
                                                                    {customization && (
                                                                        <div className="inline-block px-2 py-0.5 bg-[#1a472a]/10 text-[#1a472a] text-[9px] font-bold uppercase tracking-wider rounded-sm mb-2">
                                                                            Personalized
                                                                        </div>
                                                                    )}

                                                                    <p className="text-xs text-neutral-500 font-medium">Qty: {item.quantity}</p>
                                                                </div>

                                                                {/* Customization Lines */}
                                                                {customization && (
                                                                    <div className="text-[10px] text-neutral-400 space-y-0.5 border-l-2 border-[#1a472a]/20 pl-2 mt-2">
                                                                        {customization.value.split(" | ").map((line: string, i: number) => (
                                                                            <p key={i} className="leading-tight truncate">{line}</p>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer / Summary */}
                            {cartCount > 0 && (
                                <div className="p-8 bg-white/50 border-t border-black/5 backdrop-blur-md">
                                    <div className="space-y-3 mb-6">
                                        <div className="flex justify-between text-xs text-neutral-500 uppercase tracking-widest">
                                            <span>Subtotal</span>
                                            <span className="text-black font-bold" dangerouslySetInnerHTML={{ __html: cleanPrice(cartData?.cart?.subtotal || '') }} />
                                        </div>

                                        {/* Fees */}
                                        {cartData?.cart?.fees && cartData.cart.fees.map((fee: any, idx: number) => (
                                            <div key={idx} className="flex justify-between text-xs text-neutral-500 uppercase tracking-widest">
                                                <span>{fee.name}</span>
                                                <span className="text-black font-bold" dangerouslySetInnerHTML={{ __html: cleanPrice(fee.total || '') }} />
                                            </div>
                                        ))}
                                        <div className="flex justify-between text-xs text-neutral-500 uppercase tracking-widest">
                                            <span>Shipping</span>
                                            <span>Calculated at checkout</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <Link href="/cart" onClick={() => setCartOpen(false)}>
                                            <button className="w-full py-4 border border-black text-black text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all rounded-sm">
                                                View Bag
                                            </button>
                                        </Link>
                                        <Link href="/checkout" onClick={() => setCartOpen(false)}>
                                            <button className="w-full py-4 bg-black text-white text-xs font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl rounded-sm">
                                                Checkout
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Search Overlay */}
            <AnimatePresence>
                {searchOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-white/95 backdrop-blur-xl flex flex-col pt-32 px-6"
                    >
                        <button
                            onClick={() => setSearchOpen(false)}
                            className="absolute top-8 right-8 text-black hover:text-neutral-500 transition-colors"
                        >
                            <X size={32} strokeWidth={1} />
                        </button>

                        <div className="max-w-4xl mx-auto w-full">
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full text-6xl font-black uppercase tracking-tighter border-b-2 border-black/10 pb-4 bg-transparent outline-none placeholder:text-neutral-200 text-black"
                                autoFocus
                            />

                            <div className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-8">
                                {searchLoading && <p className="text-neutral-400 uppercase tracking-widest text-xs">Searching...</p>}

                                {searchData?.products?.nodes.map((p: any) => (
                                    <Link key={p.id} href={`/products/${p.slug}`} onClick={() => setSearchOpen(false)} className="group">
                                        <div className="relative aspect-[3/4] bg-neutral-100 mb-4 overflow-hidden">
                                            {p.image?.sourceUrl && (
                                                <Image src={p.image.sourceUrl} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                            )}
                                        </div>
                                        <h4 className="text-xs font-bold uppercase tracking-widest text-black">{p.name}</h4>
                                        <p className="text-[10px] text-neutral-500">{cleanPrice(p.price)}</p>
                                    </Link>
                                ))}

                                {searchData?.products?.nodes.length === 0 && searchQuery.length > 2 && !searchLoading && (
                                    <p className="text-neutral-400 uppercase tracking-widest text-xs">No results found.</p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: "-100%" }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: "-100%" }}
                        transition={{ type: "tween", duration: 0.3 }}
                        className="fixed inset-0 z-[60] bg-[#050505] flex flex-col p-8 md:hidden"
                    >
                        <div className="flex justify-between items-center mb-12">
                            <div className="relative w-20 h-6">
                                <Image src="/logo.png" alt="Drotes" fill className="object-contain object-left invert brightness-0 invert" />
                            </div>
                            <button onClick={() => setMobileMenuOpen(false)} className="text-white">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex flex-col gap-8">
                            {settings.menuItems.map((link) => (
                                <Link
                                    key={link.id}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-2xl text-white font-light uppercase tracking-wider"
                                >
                                    {link.name}
                                </Link>
                            ))}

                            <div className="h-px bg-white/5 my-4" />
                            <div className="space-y-6">
                                <h4 className="text-[10px] font-bold text-neutral-700 uppercase tracking-[0.6em] mb-4">Universe</h4>
                                <a href="https://anecdote.drotes.com" target="_blank" className="flex items-center gap-4 group">
                                    <div className="relative flex items-center justify-center">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping opacity-40" />
                                        <div className="absolute w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                                    </div>
                                    <span className="text-xl text-white font-light uppercase tracking-wider">Anecdote</span>
                                </a>
                                <a href="https://patch.drotes.com" target="_blank" className="flex items-center gap-4 group">
                                    <div className="relative flex items-center justify-center">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping opacity-40" />
                                        <div className="absolute w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                                    </div>
                                    <span className="text-xl text-white font-light uppercase tracking-wider">The Patch</span>
                                </a>
                                <a href="https://founder.drotes.com" target="_blank" className="flex items-center gap-4 group opacity-60">
                                    <span className="text-xl text-white font-light uppercase tracking-wider pl-6">Founder's Note</span>
                                </a>
                            </div>
                        </div>

                        <div className="mt-auto text-white/40 text-xs uppercase tracking-widest">
                            Drotes © 2026
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
