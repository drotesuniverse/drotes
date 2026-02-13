"use client";
import React, { useState, useEffect, useRef } from "react";
import AdminLogin from "@/components/admin/AdminLogin";
import ImageEditor from "@/components/admin/ImageEditor";
import { motion, AnimatePresence, useScroll, useTransform, Reorder } from "framer-motion";
import { useAdminSettings, Order } from "@/hooks/useAdminSettings";
import {
    LayoutDashboard, Palette, ShoppingBag, Package, Settings, LogOut, Upload,
    Plus, Trash2, Printer, Search, Bell, Menu, X, ChevronRight, Eye, MoreHorizontal,
    ArrowUpRight, GripVertical, Check, Truck, Box, TrendingUp, Puzzle, ShieldCheck, Loader2,
    Ruler, FileText, Edit3, Instagram, Twitter, Youtube, Music2, Globe, Smartphone, Monitor,
    UsersIcon, CreditCard, CheckCircle2
} from "lucide-react";
import Image from "next/image";
import createGlobe from "cobe";
import { useQuery } from "@apollo/client";
import { GET_SHOP_PRODUCTS } from "@/lib/queries";
import { uploadAdminImage } from "@/lib/uploadFile";
import ShippingLabelA5 from "@/components/admin/ShippingLabelA5";
import clsx from "clsx";
import LiveCounter, { SmoothCounter } from "@/components/admin/LiveCounter";
import ActivityItem from "@/components/admin/ActivityItem";

// --- ANIMATIONS ---
const containerVar: any = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};
const itemVar: any = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } }
};

// --- COMPONENTS ---

const MetricCard = ({ title, value, sub, trend = "up", highlight = false }: any) => (
    <motion.div
        variants={itemVar}
        className={clsx(
            "p-8 rounded-[32px] relative overflow-hidden group transition-all duration-500",
            highlight ? "bg-black text-white" : "bg-white text-black border border-neutral-100 hover:border-neutral-200 hover:shadow-xl hover:shadow-black/5"
        )}
    >
        <div className="flex justify-between items-start mb-8">
            <span className={clsx("text-xs font-bold uppercase tracking-widest", highlight ? "text-neutral-500" : "text-neutral-400")}>{title}</span>
            <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center", highlight ? "bg-white/10" : "bg-neutral-50")}>
                <ArrowUpRight size={14} className={highlight ? "text-white" : "text-black"} />
            </div>
        </div>
        <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">{value}</h2>
            <p className={clsx("text-xs font-medium flex items-center gap-2", highlight ? "text-neutral-400" : "text-neutral-500")}>
                {trend === "up" && <span className="text-green-500">↑ 14%</span>}
                {sub}
            </p>
        </div>

        {/* Decorative Blur */}
        <div className={clsx("absolute -right-10 -bottom-10 w-32 h-32 rounded-full blur-[50px] transition-opacity duration-500 opacity-0 group-hover:opacity-100", highlight ? "bg-white/10" : "bg-black/5")} />
    </motion.div>
);

const BentoAction = ({ title, subtitle, icon: Icon, href }: any) => (
    <motion.a
        variants={itemVar}
        href={href}
        target="_blank"
        className="group relative p-6 bg-white rounded-[24px] border border-neutral-100 hover:border-black/10 transition-all duration-300 overflow-hidden"
    >
        <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Icon size={18} className="text-black" />
            </div>
            <div>
                <h3 className="text-lg font-bold text-neutral-900 group-hover:translate-x-1 transition-transform">{title}</h3>
                <p className="text-xs text-neutral-400 font-medium mt-1">{subtitle}</p>
            </div>
        </div>
        <div className="absolute inset-0 bg-neutral-50 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out -z-0" />
    </motion.a>
);

// --- TABS ---

const DashboardTab = ({ settings }: { settings: any }) => (
    <motion.div variants={containerVar} initial="hidden" animate="show" className="space-y-8 pb-20">
        <motion.div variants={itemVar} className="mb-12">
            <h1 className="text-4xl font-black tracking-tighter mb-2">Overview</h1>
            <p className="text-neutral-400">Welcome back, Administrator.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <MetricCard title="Total Revenue" value="AED 48.2k" sub="vs last month" highlight />
            <MetricCard title="Active Orders" value={settings.orders.length.toString()} sub="Processing now" />
            <MetricCard title="Site Visits" value="12.4k" sub="Unique visitors" />
        </div>

        <div>
            <motion.h3 variants={itemVar} className="text-sm font-bold uppercase tracking-widest text-neutral-400 mb-6 flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Live Systems
            </motion.h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <BentoAction title="Media" subtitle="Cloudinary Assets" icon={Upload} href="https://cloudinary.com/console/media_library" />
                <BentoAction title="Store" subtitle="WooCommerce" icon={ShoppingBag} href="https://bck.drotes.com/wp-admin/edit.php?post_type=shop_order" />
                <BentoAction title="Deploy" subtitle="Vercel Status" icon={ArrowUpRight} href="https://vercel.com/dashboard" />
                <BentoAction title="Analytics" subtitle="Google Data" icon={Search} href="https://analytics.google.com" />
            </div>
        </div>
    </motion.div>
);

const ContentTab = ({ settings, updateSettings, initiateUpload }: any) => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
    const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

    // Menu Builder State
    const [newItemName, setNewItemName] = useState("");
    const [newItemHref, setNewItemHref] = useState("");

    const addMenuItem = () => {
        if (!newItemName || !newItemHref) return;
        const newItem = { id: Date.now().toString(), name: newItemName, href: newItemHref };
        updateSettings({ menuItems: [...settings.menuItems, newItem] });
        setNewItemName(""); setNewItemHref("");
    };

    const removeMenuItem = (id: string) => {
        updateSettings({ menuItems: settings.menuItems.filter((i: any) => i.id !== id) });
    };

    return (
        <motion.div variants={containerVar} initial="hidden" animate="show" className="space-y-12 pb-20">
            <motion.div variants={itemVar}>
                <h1 className="text-4xl font-black tracking-tighter mb-2">Experience</h1>
                <p className="text-neutral-400">Manage visual storytelling.</p>
            </motion.div>

            {/* HERO EDITOR */}
            <motion.div ref={ref} variants={itemVar} className="bg-white rounded-[32px] overflow-hidden border border-neutral-100 shadow-sm relative group">
                <div className="relative h-[400px] w-full overflow-hidden bg-neutral-900">
                    <motion.div style={{ y }} className="absolute inset-0">
                        <Image src={settings.heroImage} alt="Hero Preview" fill className="object-cover opacity-80" />
                    </motion.div>

                    <div
                        className="absolute inset-0 bg-black pointer-events-none transition-opacity duration-300"
                        style={{ opacity: settings.heroOverlayOpacity ?? 0.5 }}
                    />

                    <div className="absolute inset-x-0 bottom-0 p-12 text-center z-10 flex flex-col items-center">
                        <h1 className="text-6xl font-black text-white uppercase tracking-tighter leading-none mb-4 mix-blend-difference">anec:dote</h1>
                        <button className="bg-white text-black px-8 py-3 uppercase font-bold text-xs tracking-widest hover:bg-neutral-200 transition-colors pointer-events-none">Shop Collection</button>
                    </div>

                    <div className="absolute top-6 right-6 flex gap-3 z-20">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => document.getElementById("hero-upload")?.click()}
                            className="bg-white/10 backdrop-blur-md text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest border border-white/20 hover:bg-white hover:text-black transition-all flex items-center gap-2"
                        >
                            <Upload size={14} /> Change Visual
                        </motion.button>
                        <input id="hero-upload" type="file" className="hidden" onChange={(e) => e.target.files?.[0] && initiateUpload('hero', e.target.files[0])} />
                    </div>
                </div>

                <div className="p-8 border-t border-neutral-100 bg-white">
                    <div className="flex items-center gap-6">
                        <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center shrink-0">
                            <Eye size={20} />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between mb-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-neutral-900">Cinematic Overlay Opacity</label>
                                <span className="text-xs font-mono font-medium text-neutral-400">{(settings.heroOverlayOpacity * 100).toFixed(0)}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={settings.heroOverlayOpacity ?? 0.5}
                                onChange={(e) => updateSettings({ heroOverlayOpacity: parseFloat(e.target.value) })}
                                className="w-full h-2 bg-neutral-100 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:shadow-lg hover:[&::-webkit-slider-thumb]:scale-110 transition-all"
                            />
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* BRAND LOGO */}
                <motion.div variants={itemVar} className="bg-white p-8 rounded-[32px] border border-neutral-100 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold">Brand Logo</h3>
                        <button className="text-xs font-bold underline" onClick={() => document.getElementById("logo-upload")?.click()}>Replace</button>
                        <input id="logo-upload" type="file" className="hidden" onChange={(e) => e.target.files?.[0] && initiateUpload('logo', e.target.files[0])} />
                    </div>
                    <div className="h-32 bg-neutral-50 rounded-2xl flex items-center justify-center border border-dashed border-neutral-200">
                        <Image src={settings.logo.url} alt="Logo" width={100} height={40} className="max-h-16 w-auto object-contain" unoptimized />
                    </div>
                </motion.div>

                {/* POPUP CONFIG */}
                <motion.div variants={itemVar} className="bg-white p-8 rounded-[32px] border border-neutral-100 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold">Inner Circle Popup</h3>
                        <div
                            onClick={() => updateSettings({ popup: { ...settings.popup, enabled: !settings.popup.enabled } })}
                            className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-colors duration-300 ${settings.popup.enabled ? "bg-black" : "bg-neutral-200"}`}
                        >
                            <motion.div layout className="w-5 h-5 bg-white rounded-full shadow-sm" />
                        </div>
                    </div>
                    <input
                        className="w-full bg-neutral-50 border-none rounded-xl p-4 text-sm font-bold mb-3 focus:ring-0"
                        value={settings.popup.title}
                        onChange={(e) => updateSettings({ popup: { ...settings.popup, title: e.target.value } })}
                    />
                    <textarea
                        className="w-full bg-neutral-50 border-none rounded-xl p-4 text-sm resize-none h-24 focus:ring-0"
                        value={settings.popup.text}
                        onChange={(e) => updateSettings({ popup: { ...settings.popup, text: e.target.value } })}
                    />
                </motion.div>
            </div>

            {/* RESTORED: MENU BUILDER */}
            <motion.div variants={itemVar} className="bg-white p-8 rounded-[32px] border border-neutral-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold">Navigation Menu</h3>
                    <span className="text-xs font-mono text-neutral-400">{settings.menuItems.length} Links</span>
                </div>

                <div className="space-y-3 mb-6">
                    <Reorder.Group axis="y" values={settings.menuItems} onReorder={(newItems) => updateSettings({ menuItems: newItems })} className="space-y-3">
                        {settings.menuItems.map((item: any) => (
                            <Reorder.Item key={item.id} value={item} className="p-4 bg-neutral-50 rounded-xl flex items-center gap-4 cursor-grab active:cursor-grabbing border border-neutral-100">
                                <GripVertical size={16} className="text-neutral-300" />
                                <div className="flex-1 grid grid-cols-2 gap-4">
                                    <input
                                        value={item.name}
                                        onChange={(e) => updateSettings({ menuItems: settings.menuItems.map((i: any) => i.id === item.id ? { ...i, name: e.target.value } : i) })}
                                        className="bg-transparent font-bold text-sm focus:outline-none"
                                    />
                                    <input
                                        value={item.href}
                                        onChange={(e) => updateSettings({ menuItems: settings.menuItems.map((i: any) => i.id === item.id ? { ...i, href: e.target.value } : i) })}
                                        className="bg-transparent font-mono text-xs text-neutral-500 focus:outline-none"
                                    />
                                </div>
                                <button onClick={() => removeMenuItem(item.id)} className="text-neutral-300 hover:text-red-500 transition-colors"><X size={16} /></button>
                            </Reorder.Item>
                        ))}
                    </Reorder.Group>
                </div>

                <div className="flex gap-4 p-4 bg-neutral-50 rounded-xl border border-dashed border-neutral-200">
                    <input
                        placeholder="Link Name"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        className="flex-1 bg-transparent text-sm font-bold focus:outline-none"
                    />
                    <input
                        placeholder="/path"
                        value={newItemHref}
                        onChange={(e) => setNewItemHref(e.target.value)}
                        className="flex-1 bg-transparent text-sm font-mono focus:outline-none"
                    />
                    <button onClick={addMenuItem} className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center hover:scale-110 transition-transform"><Plus size={16} /></button>
                </div>
            </motion.div>
        </motion.div>
    );
};

const CommerceTab = ({ settings, calculateOrderProfit, updateSettings }: any) => {
    const allOrders = [...(settings.capturedOrders || []), ...settings.orders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [showLabel, setShowLabel] = useState(false);

    return (
        <motion.div variants={containerVar} initial="hidden" animate="show" className="space-y-8 pb-20">
            <AnimatePresence>
                {selectedOrder && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white w-full max-w-2xl rounded-[32px] overflow-hidden shadow-2xl">
                            <div className="p-8 border-b border-neutral-100 flex justify-between items-center">
                                <div>
                                    <h3 className="text-2xl font-black">{selectedOrder.id}</h3>
                                    <p className="text-neutral-400 text-sm">{selectedOrder.customer} • {selectedOrder.date}</p>
                                </div>
                                <button onClick={() => { setSelectedOrder(null); setShowLabel(false); }} className="p-2 hover:bg-neutral-100 rounded-full"><X size={20} /></button>
                            </div>

                            <div className="p-8 bg-neutral-50 space-y-4">
                                {selectedOrder.items.map((item, i) => (
                                    <div key={i} className="flex justify-between items-center bg-white p-4 rounded-xl border border-neutral-100">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center text-xs font-bold">{item.quantity}x</div>
                                            <div>
                                                <div className="font-bold text-sm">{item.name}</div>
                                                <div className="text-[10px] text-neutral-400 font-mono">{selectedOrder.currency} {item.price}</div>
                                            </div>
                                        </div>
                                        <div className="font-bold text-sm">{selectedOrder.currency} {item.price * item.quantity}</div>
                                    </div>
                                ))}
                                <div className="flex justify-between font-bold pt-4 border-t border-neutral-200">
                                    <span>Total</span>
                                    <span>{selectedOrder.currency} {selectedOrder.total}</span>
                                </div>
                            </div>

                            <div className="p-8 border-t border-neutral-100 flex gap-4">
                                <button
                                    onClick={() => setShowLabel(true)}
                                    className="flex-1 bg-black text-white h-12 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-neutral-800"
                                >
                                    <Printer size={16} /> Print Label
                                </button>

                                {selectedOrder.status !== 'completed' && (
                                    <button
                                        onClick={() => {
                                            const updatedOrders = settings.orders.map((o: Order) => o.id === selectedOrder.id ? { ...o, status: 'completed' } : o);
                                            // Ideally update captured orders too
                                            updateSettings({ orders: updatedOrders });
                                            setSelectedOrder({ ...selectedOrder, status: 'completed' });
                                        }}
                                        className="flex-1 bg-green-500 text-black h-12 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-green-400"
                                    >
                                        <Check size={16} /> Mark Completed
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
                {/* Print Label Portal */}
                {showLabel && selectedOrder && <ShippingLabelA5 order={selectedOrder} onClose={() => setShowLabel(false)} />}
            </AnimatePresence>

            <motion.div variants={itemVar}>
                <h1 className="text-4xl font-black tracking-tighter mb-2">Commerce</h1>
                <p className="text-neutral-400">Track orders and profitability.</p>
            </motion.div>

            <motion.div variants={itemVar} className="bg-white rounded-[32px] border border-neutral-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-neutral-50 border-b border-neutral-100">
                            <tr>
                                <th className="p-6 font-bold text-xs uppercase tracking-widest text-neutral-500">Order ID</th>
                                <th className="p-6 font-bold text-xs uppercase tracking-widest text-neutral-500">Customer</th>
                                <th className="p-6 font-bold text-xs uppercase tracking-widest text-neutral-500">Date</th>
                                <th className="p-6 font-bold text-xs uppercase tracking-widest text-neutral-500">Status</th>
                                <th className="p-6 font-bold text-xs uppercase tracking-widest text-neutral-500 text-right">Total</th>
                                <th className="p-6 font-bold text-xs uppercase tracking-widest text-neutral-500 text-right">Profit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {allOrders.map((order) => {
                                const { profit, margin } = calculateOrderProfit(order);
                                return (
                                    <tr
                                        key={order.id}
                                        onClick={() => setSelectedOrder(order)}
                                        className="group hover:bg-neutral-50 transition-colors cursor-pointer"
                                    >
                                        <td className="p-6 font-bold font-mono group-hover:underline">{order.id}</td>
                                        <td className="p-6 font-medium">{order.customer}</td>
                                        <td className="p-6 text-neutral-500">{order.date}</td>
                                        <td className="p-6">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${order.status === 'completed' || order.status === 'shipped' ? 'bg-green-100 text-green-700' :
                                                order.status === 'processing' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-red-100 text-red-700' // Fail/Cancel/Refund
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="p-6 text-right font-bold">
                                            <div>{order.currency || "AED"} {order.total}</div>
                                            {order.currency !== 'AED' && (
                                                <div className="text-[10px] text-neutral-400 font-medium">
                                                    ≈ AED {calculateOrderProfit(order).adjustedTotal.toFixed(2)}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-6 text-right font-mono text-xs">
                                            <div className={clsx("font-bold", profit >= 0 ? "text-green-600" : "text-red-500")}>
                                                {profit >= 0 ? '+' : ''}AED {profit.toFixed(2)}
                                            </div>
                                            <div className="text-neutral-400">{margin.toFixed(0)}%</div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </motion.div>
    );
};

const ProductsTab = ({ settings, updateSettings, initiateUpload }: any) => {
    // Determine currency symbol from settings or default
    const currencySymbol = settings.currency || "AED";

    // Fetch Live Products
    const { loading, data, error } = useQuery(GET_SHOP_PRODUCTS, {
        variables: { first: 50 },
        fetchPolicy: 'cache-and-network'
    });

    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Helper to parse price string (e.g. "AED 1,250.00" -> 1250)
    const parsePrice = (priceStr: string) => {
        if (!priceStr) return 0;
        return parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;
    };

    const products = (data?.products?.nodes || []).map((p: any) => {
        // 1. Parent Product
        const parent = {
            id: String(p.databaseId),
            name: p.name,
            price: parsePrice(p.price),
            image: p.image?.sourceUrl || "",
            type: p.variations ? 'variable' : 'simple'
        };

        // 2. Variations (if any)
        const variations = (p.variations?.nodes || []).map((v: any) => ({
            id: String(v.databaseId),
            name: v.name || `${p.name} - Variation ${v.databaseId}`,
            price: parsePrice(v.price),
            image: v.image?.sourceUrl || "",
            type: 'variation',
            parentId: String(p.databaseId)
        }));

        return { ...parent, variations };
    });

    if (loading && !data) return <div className="p-8 text-neutral-400 animate-pulse">Loading Inventory...</div>;
    if (error && !data) return <div className="p-8 text-red-500">Failed to load inventory.</div>;

    // Helper Card Component for reusability
    const InventoryCard = ({ item, isVariation = false }: { item: any, isVariation?: boolean }) => (
        <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`bg-white rounded-[24px] border border-neutral-100 shadow-sm flex flex-col group overflow-hidden relative ${isVariation ? 'p-4 min-w-[200px]' : 'p-6'}`}
        >
            {/* Type Badge */}
            {isVariation && (
                <span className="absolute top-4 left-4 bg-neutral-900/90 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest z-10 border border-white/10 shadow-lg">
                    Variation
                </span>
            )}

            <div className="flex justify-between items-start mb-4">
                <h3 className={`font-bold leading-tight ${isVariation ? 'text-sm' : 'text-lg'}`}>{item.name.replace(item.parentId ? /.*?- / : '', '')}</h3>
                <span className="text-[10px] font-mono bg-neutral-100 px-2 py-1 rounded whitespace-nowrap ml-2">
                    AED {settings.productPrices?.[item.name] ?? item.price}
                </span>
            </div>

            <div className={`bg-neutral-100 rounded-xl mb-4 relative overflow-hidden group-hover:shadow-md transition-all ${isVariation ? 'aspect-square' : 'aspect-[4/5]'}`}>
                {item.image ? (
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-neutral-300 font-bold text-xs opacity-40">NO IMG</div>
                )}

                <button
                    onClick={() => setEditingProduct(item)}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity transform hover:scale-110 z-20"
                >
                    <Settings size={14} />
                </button>
            </div>

            {!isVariation && (
                <div className="mt-auto space-y-4 pt-4 border-t border-neutral-100">
                    <div>
                        <div className="flex justify-between items-center text-[10px] text-neutral-400 font-bold uppercase tracking-wider mb-2">
                            <span>Override Price</span>
                        </div>
                        <input
                            type="number"
                            className="w-full bg-neutral-50 border-none rounded-xl p-2 text-sm font-bold focus:ring-0"
                            placeholder={String(item.price)}
                            value={settings.productPrices?.[item.name] || ""}
                            onChange={(e) => updateSettings({ productPrices: { ...settings.productPrices, [item.name]: parseFloat(e.target.value) } })}
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center text-[10px] text-neutral-400 font-bold uppercase tracking-wider mb-2">
                            <span>Size Guide</span>
                        </div>
                        <select
                            className="w-full bg-neutral-50 border-none rounded-xl p-2 text-[11px] font-bold focus:ring-0 appearance-none"
                            value={settings.productSizeCharts?.[item.name] || ""}
                            onChange={(e) => updateSettings({
                                productSizeCharts: { ...settings.productSizeCharts, [item.name]: e.target.value }
                            })}
                        >
                            <option value="">Default (Backend)</option>
                            <option value="disabled" className="text-red-500">Disabled (Hide Guide)</option>
                            {(settings.sizeCharts || []).map((chart: any) => (
                                <option key={chart.id} value={chart.id}>{chart.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}
        </motion.div>
    );

    return (
        <motion.div variants={containerVar} initial="hidden" animate="show" className="space-y-8 pb-20">
            {/* EDIT MODAL */}
            <AnimatePresence>
                {editingProduct && (
                    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white w-full max-w-md rounded-[32px] p-8 shadow-2xl">
                            <div className="flex justify-between mb-6">
                                <h3 className="text-xl font-bold">Edit Product</h3>
                                <button onClick={() => setEditingProduct(null)}><X size={20} /></button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block mb-2">Display Name</label>
                                    <input
                                        className="w-full bg-neutral-50 p-3 rounded-xl font-bold text-sm"
                                        placeholder={editingProduct.name}
                                    // Logic to save name override would go here (omitted for brevity, focus on Cost/Image)
                                    />
                                </div>
                                <button
                                    onClick={() => {
                                        // This would ideally open the image editor flow
                                        document.getElementById('product-override-upload')?.click();
                                    }}
                                    className="w-full h-32 bg-neutral-50 rounded-xl border border-dashed border-neutral-300 flex flex-col items-center justify-center gap-2 text-neutral-400 hover:bg-neutral-100 hover:border-black transition-all"
                                >
                                    <Upload size={20} />
                                    <span className="text-xs font-bold uppercase">Change Main Image</span>
                                </button>
                                <input id="product-override-upload" type="file" className="hidden" />

                                {/* GALLERY MANAGEMENT */}
                                <div className="pt-6 border-t border-neutral-100">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block mb-3">Gallery Images</label>

                                    <div className="grid grid-cols-3 gap-2 mb-3">
                                        {(settings.productOverrides?.[editingProduct.name]?.galleryImages || []).map((img: string, idx: number) => (
                                            <div key={idx} className="aspect-[4/5] bg-neutral-50 rounded-lg relative group overflow-hidden border border-neutral-100">
                                                <Image src={img} alt="Gallery" fill className="object-cover" />
                                                <button
                                                    onClick={() => {
                                                        const current = settings.productOverrides?.[editingProduct.name]?.galleryImages || [];
                                                        const updated = current.filter((_: string, i: number) => i !== idx);
                                                        updateSettings({
                                                            productOverrides: {
                                                                ...settings.productOverrides,
                                                                [editingProduct.name]: {
                                                                    ...settings.productOverrides?.[editingProduct.name],
                                                                    galleryImages: updated
                                                                }
                                                            }
                                                        });
                                                    }}
                                                    className="absolute top-1 right-1 bg-white/90 p-1.5 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                                                >
                                                    <X size={10} />
                                                </button>
                                            </div>
                                        ))}

                                        {/* Upload Button */}
                                        <button
                                            disabled={isUploading}
                                            onClick={() => document.getElementById('gallery-upload')?.click()}
                                            className="aspect-[4/5] bg-neutral-50 rounded-lg border border-dashed border-neutral-300 flex flex-col items-center justify-center gap-1 text-neutral-400 hover:bg-neutral-100 hover:border-black transition-all hover:text-black"
                                        >
                                            {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                                            <span className="text-[9px] font-bold uppercase">{isUploading ? 'Uploading...' : 'Add Image'}</span>
                                        </button>
                                    </div>
                                    <input
                                        id="gallery-upload"
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={async (e) => {
                                            if (e.target.files?.[0]) {
                                                setIsUploading(true);
                                                try {
                                                    const url = await uploadAdminImage(e.target.files[0]);
                                                    const current = settings.productOverrides?.[editingProduct.name]?.galleryImages || [];
                                                    updateSettings({
                                                        productOverrides: {
                                                            ...settings.productOverrides,
                                                            [editingProduct.name]: {
                                                                ...settings.productOverrides?.[editingProduct.name],
                                                                galleryImages: [...current, url]
                                                            }
                                                        }
                                                    });
                                                } catch (err) {
                                                    console.error(err);
                                                    alert("Upload failed");
                                                } finally {
                                                    setIsUploading(false);
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            <button onClick={() => setEditingProduct(null)} className="w-full bg-black text-white py-3 rounded-xl font-bold uppercase text-xs mt-6">Save Changes</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <motion.div variants={itemVar}>
                <h1 className="text-4xl font-black tracking-tighter mb-2">Inventory</h1>
                <p className="text-neutral-400">Manage costs and assets.</p>
            </motion.div>

            <div className="space-y-16">
                {products.map((p: any) => (
                    <motion.div key={p.id} variants={itemVar} className="space-y-6">
                        {/* Parent Product Section */}
                        <div className="flex items-center gap-4">
                            <div className="h-px bg-neutral-200 flex-1"></div>
                            <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">{p.name} Family</span>
                            <div className="h-px bg-neutral-200 flex-1"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {/* Parent Card */}
                            <div className="md:col-span-1">
                                <InventoryCard item={p} />
                            </div>

                            {/* Variations Grid */}
                            {p.variations.length > 0 && (
                                <div className="md:col-span-3 bg-neutral-50/50 rounded-[32px] p-6 border border-neutral-100/50 flex flex-col justify-center">
                                    <div className="flex items-center gap-2 mb-6">
                                        <span className="text-xs font-bold uppercase tracking-widest text-neutral-400 bg-white px-3 py-1 rounded-full border border-neutral-100 shadow-sm">Variations ({p.variations.length})</span>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {p.variations.map((v: any) => (
                                            <InventoryCard key={v.id} item={v} isVariation={true} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

// --- NEW ADDONS TAB ---

const AddonsTab = ({ settings, updateSettings }: any) => {
    // Fetch Live Products from WooCommerce
    const { loading, data, error } = useQuery(GET_SHOP_PRODUCTS, { variables: { first: 50 }, fetchPolicy: 'cache-and-network' });
    const products = data?.products?.nodes || [];

    const toggleAddon = (id: string, name: string) => { // Using name/slug or DBID? using DB ID is safest
        const current = settings.addonEnabledProducts || [];
        // Important: databaseId is integer from GraphQL, settings handles it as string/number mismatch potentially
        const idStr = String(id);

        const exists = current.includes(idStr);
        const updated = exists
            ? current.filter((i: string) => i !== idStr)
            : [...current, idStr];

        updateSettings({ addonEnabledProducts: updated });
    };

    if (loading) return <div className="p-8 text-neutral-400 animate-pulse">Loading Products...</div>;
    if (error) return <div className="p-8 text-red-500">Failed to load products.</div>;

    return (
        <motion.div variants={containerVar} initial="hidden" animate="show" className="space-y-8 pb-20">
            <motion.div variants={itemVar}>
                <h1 className="text-4xl font-black tracking-tighter mb-2">Personalization</h1>
                <p className="text-neutral-400">Manage interactive addons per product.</p>
            </motion.div>

            <div className="grid grid-cols-1 gap-4">
                {products.map((p: any) => {
                    const isEnabled = (settings.addonEnabledProducts || []).includes(String(p.databaseId));
                    return (
                        <motion.div
                            key={p.databaseId}
                            variants={itemVar}
                            className={`p-6 rounded-[24px] border transition-all flex items-center gap-6 ${isEnabled ? 'bg-black text-white border-black' : 'bg-white text-black border-neutral-100 hover:border-neutral-200'}`}
                        >
                            <div className="w-16 h-20 bg-neutral-100 rounded-xl relative overflow-hidden shrink-0">
                                {p.image?.sourceUrl && <Image src={p.image.sourceUrl} alt={p.name} fill className="object-cover" />}
                            </div>

                            <div className="flex-1">
                                <h3 className="font-bold text-lg mb-1">{p.name}</h3>
                                <div className="flex gap-2 text-xs opacity-60 font-mono">
                                    <span>ID: {p.databaseId}</span>
                                    <span>•</span>
                                    <span>{p.slug}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => toggleAddon(p.databaseId, p.name)}
                                className={`h-10 px-6 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${isEnabled
                                    ? "bg-white text-black hover:bg-neutral-200"
                                    : "bg-black text-white hover:bg-neutral-800"
                                    }`}
                            >
                                {isEnabled ? "Disable Addon" : "Enable Addon"}
                            </button>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
};

const SizeChartTab = ({ settings, updateSettings }: any) => {
    const [editingChart, setEditingChart] = useState<any>(null);
    const [activeEditUnit, setActiveEditUnit] = useState<"primary" | "alternate">("primary");

    const addChart = () => {
        const newChart = {
            id: `chart-${Date.now()}`,
            name: "New Size Chart",
            headers: ["Size", "Chest", "Length"],
            rows: [["S", "", ""], ["M", "", ""], ["L", "", ""]],
            alternateRows: [["S", "", ""], ["M", "", ""], ["L", "", ""]],
            unit: "cm"
        };
        updateSettings({ sizeCharts: [...(settings.sizeCharts || []), newChart] });
        setEditingChart(newChart);
    };

    const deleteChart = (id: string) => {
        if (!confirm("Are you sure?")) return;
        updateSettings({ sizeCharts: (settings.sizeCharts || []).filter((c: any) => c.id !== id) });
    };

    // Table Grid Handlers
    const addColumn = () => {
        const newChart = { ...editingChart };
        newChart.headers.push("New Column");
        newChart.rows = newChart.rows.map((row: string[]) => [...row, ""]);
        if (newChart.alternateRows) {
            newChart.alternateRows = newChart.alternateRows.map((row: string[]) => [...row, ""]);
        } else {
            newChart.alternateRows = newChart.rows.map((row: string[]) => row.map(() => ""));
        }
        setEditingChart(newChart);
    };

    const removeColumn = (index: number) => {
        if (editingChart.headers.length <= 1) return;
        const newChart = { ...editingChart };
        newChart.headers.splice(index, 1);
        newChart.rows = newChart.rows.map((row: string[]) => {
            const newRow = [...row];
            newRow.splice(index, 1);
            return newRow;
        });
        if (newChart.alternateRows) {
            newChart.alternateRows = newChart.alternateRows.map((row: string[]) => {
                const newRow = [...row];
                newRow.splice(index, 1);
                return newRow;
            });
        }
        setEditingChart(newChart);
    };

    const addRow = () => {
        const newChart = { ...editingChart };
        newChart.rows.push(new Array(newChart.headers.length).fill(""));
        if (!newChart.alternateRows) {
            newChart.alternateRows = newChart.rows.map((row: string[]) => [...row]);
        }
        newChart.alternateRows.push(new Array(newChart.headers.length).fill(""));
        setEditingChart(newChart);
    };

    const removeRow = (index: number) => {
        if (editingChart.rows.length <= 1) return;
        const newChart = { ...editingChart };
        newChart.rows.splice(index, 1);
        if (newChart.alternateRows) {
            newChart.alternateRows.splice(index, 1);
        }
        setEditingChart(newChart);
    };

    const updateHeader = (index: number, val: string) => {
        const newChart = { ...editingChart };
        newChart.headers[index] = val;
        setEditingChart(newChart);
    };

    const updateCell = (rowIndex: number, colIndex: number, val: string) => {
        const newChart = { ...editingChart };
        if (activeEditUnit === "primary") {
            newChart.rows[rowIndex][colIndex] = val;
        } else {
            if (!newChart.alternateRows) {
                // Initialize alternateRows from current rows if it doesn't exist
                newChart.alternateRows = newChart.rows.map((row: string[]) => [...row]);
            }
            newChart.alternateRows[rowIndex][colIndex] = val;
        }
        setEditingChart(newChart);
    };

    return (
        <motion.div variants={containerVar} initial="hidden" animate="show" className="space-y-8 pb-20">
            <motion.div variants={itemVar} className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter mb-2">Size Guides</h1>
                    <p className="text-neutral-400">Manage interactive measurement tables for your products.</p>
                </div>
                <button
                    onClick={addChart}
                    className="bg-black text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-neutral-800 transition-all"
                >
                    <Plus size={16} /> Create New Chart
                </button>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(settings.sizeCharts || []).map((chart: any) => (
                    <motion.div
                        key={chart.id}
                        variants={itemVar}
                        className="bg-white p-6 rounded-[32px] border border-neutral-100 shadow-sm group hover:border-black/10 transition-all flex flex-col"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-neutral-50 flex items-center justify-center">
                                <Ruler size={24} className="text-neutral-400" />
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setEditingChart(chart)} className="p-2 hover:bg-neutral-50 rounded-full text-neutral-400 hover:text-black transition-colors">
                                    <Edit3 size={16} />
                                </button>
                                <button onClick={() => deleteChart(chart.id)} className="p-2 hover:bg-neutral-50 rounded-full text-neutral-400 hover:text-red-500 transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <h3 className="text-xl font-black mb-1">{chart.name}</h3>
                        <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest mb-6">
                            {(chart.headers?.length || 0)} Columns • {(chart.rows?.length || 0)} Rows
                        </div>

                        <div className="mt-auto bg-neutral-50 rounded-2xl p-4 overflow-hidden mask-fade-bottom h-32">
                            <table className="w-full text-left text-[10px] border-collapse">
                                <thead>
                                    <tr>
                                        {(chart.headers || []).slice(0, 3).map((h: string, i: number) => (
                                            <th key={i} className="font-bold uppercase tracking-widest text-neutral-400 pb-2 border-b border-neutral-200">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {(chart.rows || []).slice(0, 2).map((row: string[], ri: number) => (
                                        <tr key={ri}>
                                            {(row || []).slice(0, 3).map((cell: string, ci: number) => (
                                                <td key={ci} className="py-2 font-medium border-b border-neutral-100">{cell}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* TABLE EDITOR MODAL */}
            <AnimatePresence>
                {editingChart && (
                    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white w-full max-w-6xl h-[90vh] rounded-[48px] overflow-hidden flex flex-col shadow-2xl border border-white/20"
                        >
                            <div className="p-8 border-b border-neutral-100 flex justify-between items-center bg-white/10 backdrop-blur-xl">
                                <div>
                                    <input
                                        className="text-3xl font-black bg-transparent border-none focus:ring-0 p-0 tracking-tighter"
                                        value={editingChart.name}
                                        onChange={(e) => setEditingChart({ ...editingChart, name: e.target.value })}
                                        autoFocus
                                    />
                                    <p className="text-neutral-400 text-[10px] mt-1 font-bold uppercase tracking-[0.2em]">Live Table Editor</p>
                                </div>
                                <div className="flex items-center gap-4 px-6 py-3 bg-neutral-50 rounded-full border border-neutral-100">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Unit:</span>
                                    <div className="flex gap-1 border-r border-neutral-200 pr-4 mr-4">
                                        {["cm", "in"].map((u) => (
                                            <button
                                                key={u}
                                                onClick={() => setEditingChart({ ...editingChart, unit: u })}
                                                className={clsx(
                                                    "px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all",
                                                    (editingChart.unit || "cm") === u ? "bg-black text-white shadow-sm" : "text-neutral-400 hover:text-black"
                                                )}
                                            >
                                                {u}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setEditingChart({ ...editingChart, allowConversion: !editingChart.allowConversion })}
                                        className={clsx(
                                            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all border",
                                            editingChart.allowConversion ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-neutral-50 text-neutral-400 border-neutral-100"
                                        )}
                                    >
                                        <div className={clsx("w-2 h-2 rounded-full", editingChart.allowConversion ? "bg-blue-600" : "bg-neutral-300")} />
                                        Dual Unit Mode
                                    </button>
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setEditingChart(null)}
                                        className="px-6 py-3 border border-neutral-200 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-neutral-50 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => {
                                            const updatedCharts = (settings.sizeCharts || []).map((c: any) => c.id === editingChart.id ? editingChart : c);
                                            updateSettings({ sizeCharts: updatedCharts });
                                            setEditingChart(null);
                                        }}
                                        className="px-8 py-3 bg-black text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 shadow-xl shadow-black/20 hover:scale-105 transition-all"
                                    >
                                        Save Chart
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-auto p-12 bg-neutral-50/50">
                                <div className="max-w-5xl mx-auto space-y-8">
                                    {/* DIAGRAM EDITOR */}
                                    <div className="bg-white rounded-[40px] p-8 shadow-sm border border-neutral-100">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 block mb-4">Measurement Diagram / Visual Guide</label>
                                        <div className="flex flex-col md:flex-row gap-8 items-center">
                                            <div className="w-full md:w-64 aspect-square bg-neutral-50 rounded-2xl border border-dashed border-neutral-200 flex items-center justify-center overflow-hidden relative group shrink-0">
                                                {editingChart.image ? (
                                                    <>
                                                        <Image src={editingChart.image} alt="Diagram" fill className="object-cover" />
                                                        <button
                                                            onClick={() => setEditingChart({ ...editingChart, image: undefined })}
                                                            className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-bold text-xs uppercase"
                                                        >
                                                            Remove Image
                                                        </button>
                                                    </>
                                                ) : (
                                                    <div className="text-center p-4">
                                                        <Upload size={24} className="mx-auto mb-2 text-neutral-300" />
                                                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">No Diagram</p>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 space-y-4">
                                                <h4 className="text-lg font-bold">Guide Visual</h4>
                                                <p className="text-sm text-neutral-500 max-w-sm leading-relaxed">
                                                    Upload a measurement diagram or product visual to help customers understand how to measure. This will be shown alongside the data table.
                                                </p>
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() => document.getElementById('chart-image-upload')?.click()}
                                                        className="bg-black text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-all shadow-lg shadow-black/10"
                                                    >
                                                        Upload Image
                                                    </button>
                                                    <input
                                                        id="chart-image-upload"
                                                        type="file"
                                                        className="hidden"
                                                        onChange={async (e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                try {
                                                                    const url = await uploadAdminImage(file);
                                                                    setEditingChart({ ...editingChart, image: url });
                                                                } catch (e) { alert("Upload failed"); }
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-[40px] shadow-sm border border-neutral-100 overflow-hidden">
                                        {/* Edit Mode Toggle */}
                                        <div className="p-4 bg-neutral-50/50 border-b border-neutral-100 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${activeEditUnit === 'primary' ? 'bg-black' : 'bg-blue-500 animate-pulse'}`} />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                                                    Currently Editing: <span className="text-neutral-900">{activeEditUnit === 'primary' ? `PRIMARY (${(editingChart.unit || "cm").toUpperCase()})` : `MANUAL OVERRIDE (${((editingChart.unit || "cm") === "cm" ? "in" : "cm").toUpperCase()})`}</span>
                                                </span>
                                            </div>
                                            <div className="flex gap-1 bg-white p-1 rounded-full shadow-sm border border-neutral-200">
                                                <button
                                                    onClick={() => setActiveEditUnit("primary")}
                                                    className={clsx(
                                                        "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all",
                                                        activeEditUnit === "primary" ? "bg-black text-white" : "text-neutral-400 hover:text-black"
                                                    )}
                                                >
                                                    PRIMARY ({(editingChart.unit || "cm").toUpperCase()})
                                                </button>
                                                <button
                                                    onClick={() => setActiveEditUnit("alternate")}
                                                    className={clsx(
                                                        "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all",
                                                        activeEditUnit === "alternate" ? "bg-blue-600 text-white" : "text-neutral-400 hover:text-blue-600"
                                                    )}
                                                >
                                                    MANUAL OVERRIDE ({((editingChart.unit || "cm") === "cm" ? "in" : "cm").toUpperCase()})
                                                </button>
                                            </div>
                                        </div>

                                        <div className="overflow-x-auto">
                                            <table className="w-full border-collapse">
                                                <thead>
                                                    <tr className="bg-neutral-50/50">
                                                        {editingChart.headers.map((h: string, i: number) => (
                                                            <th key={i} className="group relative p-6 min-w-[140px] border-r border-neutral-100 last:border-r-0">
                                                                <div className="flex flex-col gap-2">
                                                                    <input
                                                                        className="w-full bg-transparent border-none focus:ring-0 p-0 text-xs font-black uppercase tracking-widest text-neutral-400 text-center"
                                                                        value={h}
                                                                        placeholder="Header..."
                                                                        onChange={(e) => updateHeader(i, e.target.value)}
                                                                    />
                                                                    <button
                                                                        onClick={() => removeColumn(i)}
                                                                        className="absolute -top-2 left-1/2 -translate-x-1/2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all scale-75"
                                                                    >
                                                                        <Trash2 size={12} />
                                                                    </button>
                                                                </div>
                                                            </th>
                                                        ))}
                                                        <th className="p-6 bg-neutral-50/20">
                                                            <button
                                                                onClick={addColumn}
                                                                className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:scale-110 transition-all mx-auto shadow-lg"
                                                                title="Add Column"
                                                            >
                                                                <Plus size={16} />
                                                            </button>
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {editingChart.rows.map((row: string[], ri: number) => {
                                                        const getAutoPlaceholder = (val: string): string => {
                                                            if (!val) return "";
                                                            if (val.includes("-")) {
                                                                return val.split("-").map(v => getAutoPlaceholder(v.trim())).join("-");
                                                            }
                                                            const num = parseFloat(val);
                                                            if (isNaN(num)) return "";
                                                            const primaryUnit = editingChart.unit || "cm";
                                                            if (primaryUnit === "cm") return (num / 2.54).toFixed(1);
                                                            return (num * 2.54).toFixed(1);
                                                        };

                                                        return (
                                                            <tr key={ri} className="group hover:bg-neutral-50/30 transition-colors">
                                                                {row.map((cell: string, ci: number) => (
                                                                    <td key={ci} className="p-0 border-r border-neutral-100 last:border-r-0">
                                                                        <input
                                                                            className="w-full h-16 bg-transparent border-none focus:ring-2 focus:ring-black/5 px-6 font-bold text-sm text-center"
                                                                            value={activeEditUnit === "primary" ? cell : (editingChart.alternateRows?.[ri]?.[ci] || "")}
                                                                            placeholder={activeEditUnit === "alternate" ? getAutoPlaceholder(cell) : "0"}
                                                                            onChange={(e) => updateCell(ri, ci, e.target.value)}
                                                                        />
                                                                    </td>
                                                                ))}
                                                                <td className="p-4 w-12 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <button
                                                                        onClick={() => removeRow(ri)}
                                                                        className="p-3 text-neutral-300 hover:text-red-500 transition-colors"
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                    <tr>
                                                        <td colSpan={editingChart.headers.length + 1} className="p-6 border-t border-neutral-100">
                                                            <button
                                                                onClick={addRow}
                                                                className="w-full py-4 border-2 border-dashed border-neutral-200 rounded-2xl text-xs font-bold uppercase tracking-widest text-neutral-400 hover:border-black hover:text-black transition-all flex items-center justify-center gap-2"
                                                            >
                                                                <Plus size={14} /> Add New Row
                                                            </button>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    <div className="mt-8 flex gap-6 p-6 bg-blue-50/50 rounded-3xl border border-blue-100/50">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                            <FileText size={18} />
                                        </div>
                                        <div className="text-xs leading-relaxed text-blue-800/70">
                                            <p className="font-bold text-blue-900 mb-1">Editor Instructions</p>
                                            <p>Use the top black (+) button to add columns. Use the bottom dashed button to add rows. Your changes are live in the preview above, but you must click <b>"Save Chart"</b> to persist them permanently. Hover over headers or rows to see delete options.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const ProfitTab = ({ settings, calculateOrderProfit }: any) => {
    const allOrders = [...(settings.capturedOrders || []), ...settings.orders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Analytics Aggregation
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())).getTime();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    const stats = allOrders.reduce((acc, order) => {
        const orderDate = new Date(order.date).getTime();
        const { profit } = calculateOrderProfit(order);

        acc.total += profit;
        if (orderDate >= startOfMonth) acc.month += profit;
        if (orderDate >= startOfWeek) acc.week += profit;
        if (orderDate >= startOfDay) acc.day += profit;

        return acc;
    }, { total: 0, month: 0, week: 0, day: 0 });

    return (
        <motion.div variants={containerVar} initial="hidden" animate="show" className="space-y-8 pb-20">
            <motion.div variants={itemVar}>
                <h1 className="text-4xl font-black tracking-tighter mb-2">Profit Analytics</h1>
                <p className="text-neutral-400">Net profit breakdown per period.</p>
            </motion.div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard title="Net Profit (All Time)" value={`AED ${stats.total.toLocaleString()}`} sub="Lifetime" highlight />
                <MetricCard title="This Month" value={`AED ${stats.month.toLocaleString()}`} sub="Since 1st" />
                <MetricCard title="This Week" value={`AED ${stats.week.toLocaleString()}`} sub="Since Sunday" />
                <MetricCard title="Today" value={`AED ${stats.day.toLocaleString()}`} sub="Past 24h" />
            </div>

            <motion.div variants={itemVar} className="bg-white rounded-[32px] border border-neutral-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-neutral-100">
                    <h3 className="font-bold text-lg">Order Profitability</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-neutral-50 border-b border-neutral-100">
                            <tr>
                                <th className="p-6 font-bold text-xs uppercase tracking-widest text-neutral-500">Order</th>
                                <th className="p-6 font-bold text-xs uppercase tracking-widest text-neutral-500">Date</th>
                                <th className="p-6 font-bold text-xs uppercase tracking-widest text-neutral-500 text-right">Revenue (Orig)</th>
                                <th className="p-6 font-bold text-xs uppercase tracking-widest text-neutral-500 text-right">Cost (AED)</th>
                                <th className="p-6 font-bold text-xs uppercase tracking-widest text-neutral-500 text-right">Net Profit (AED)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {allOrders.map((order) => {
                                const { profit, margin, totalCost, adjustedTotal } = calculateOrderProfit(order);
                                const isConverted = order.currency !== 'AED';

                                return (
                                    <tr key={order.id} className="group hover:bg-neutral-50 transition-colors">
                                        <td className="p-6 font-bold font-mono">
                                            {order.id}
                                            <div className="text-[10px] text-neutral-400 font-sans mt-0.5 w-max">
                                                {order.customer}
                                                {order.status === 'refunded' && <span className="ml-2 text-red-500 font-bold bg-red-100 px-1 rounded">REFUNDED</span>}
                                                {order.status === 'cancelled' && <span className="ml-2 text-red-500 font-bold bg-red-100 px-1 rounded">CANCELLED</span>}
                                            </div>
                                        </td>
                                        <td className="p-6 text-neutral-500">{order.date}</td>

                                        {/* Revenue: Show Original & Converted Hint */}
                                        <td className="p-6 text-right font-medium">
                                            <div>{order.currency || "AED"} {order.total}</div>
                                            {isConverted && <div className="text-[10px] text-neutral-400">≈ AED {adjustedTotal.toFixed(2)}</div>}
                                        </td>

                                        {/* Cost: Always AED */}
                                        <td className="p-6 text-right text-neutral-500">AED {totalCost.toFixed(2)}</td>

                                        {/* Profit: Always AED */}
                                        <td className="p-6 text-right font-mono">
                                            <div className={clsx("font-bold", profit >= 0 ? "text-green-600" : "text-red-500")}>
                                                {profit >= 0 ? '+' : ''}AED {profit.toFixed(2)}
                                            </div>
                                            <div className="text-[10px] text-neutral-400">{margin.toFixed(0)}% Margin</div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </motion.div>
    );
};

const SettingsTab = ({ settings, updateSettings }: any) => {
    // Helper to update rates
    const updateRate = (currency: string, val: string) => {
        const newRates = { ...settings.exchangeRates, [currency]: parseFloat(val) };
        updateSettings({ exchangeRates: newRates });
    };

    return (
        <motion.div variants={containerVar} initial="hidden" animate="show" className="space-y-8 pb-20">
            <motion.div variants={itemVar}>
                <h1 className="text-4xl font-black tracking-tighter mb-2">System Configuration</h1>
                <p className="text-neutral-400">Manage global settings and financial parameters.</p>
            </motion.div>

            {/* Members Access Control */}
            <motion.div variants={itemVar} className="bg-black text-white p-8 rounded-[32px] border border-white/10 shadow-xl relative overflow-hidden">
                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                <LogOut size={14} className="ml-0.5" />
                            </div>
                            <h3 className="font-bold text-lg">Members Only Access</h3>
                        </div>
                        <p className="text-neutral-400 text-sm max-w-md">
                            When enabled, the entire site is locked. Visitors see a countdown page. Only Admin and Password holders can enter.
                        </p>
                    </div>

                    <div className="flex flex-col items-end gap-4">
                        <button
                            onClick={() => updateSettings({ membersOnly: { ...settings.membersOnly, enabled: !settings.membersOnly?.enabled } })}
                            className={`w-16 h-9 rounded-full p-1 cursor-pointer transition-colors duration-300 ${settings.membersOnly?.enabled ? "bg-green-500" : "bg-neutral-800"}`}
                        >
                            <motion.div
                                layout
                                className="w-7 h-7 bg-white rounded-full shadow-sm"
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                        </button>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                            {settings.membersOnly?.enabled ? "Mode: ACTIVE" : "Mode: DISABLED"}
                        </span>
                    </div>
                </div>

                {settings.membersOnly?.enabled && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-8 pt-8 border-t border-white/10"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2 block">Sale Live Date</label>
                                <input
                                    type="datetime-local"
                                    value={(() => {
                                        if (!settings.membersOnly?.saleDate) return "";
                                        const d = new Date(settings.membersOnly.saleDate);
                                        const offset = d.getTimezoneOffset() * 60000;
                                        const localISOTime = (new Date(d.getTime() - offset)).toISOString().slice(0, 16);
                                        return localISOTime;
                                    })()}
                                    onChange={(e) => {
                                        const date = new Date(e.target.value);
                                        updateSettings({ membersOnly: { ...settings.membersOnly, saleDate: date.toISOString() } });
                                    }}
                                    className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-xl px-4 py-3 font-mono text-sm focus:ring-1 focus:ring-white/20 outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2 block">Direct Access Link</label>
                                <div className="px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-400 text-xs font-mono break-all">
                                    {typeof window !== 'undefined' ? `${window.location.origin}/members-only` : '...'}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </motion.div>

            {/* Currency Rates Section */}
            <motion.div variants={itemVar} className="bg-white p-8 rounded-[32px] border border-neutral-100 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <TrendingUp size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Exchange Rates</h3>
                        <p className="text-neutral-400 text-sm">Define how many units of foreign currency equal 1 AED using the 'Base AED' standard.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {['USD', 'INR', 'EUR', 'GBP'].map((curr) => (
                        <div key={curr} className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100">
                            <label className="block text-xs font-bold text-neutral-500 mb-2 uppercase tracking-wide">
                                1 AED = ? {curr}
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 font-mono text-sm font-bold"
                                value={settings.exchangeRates?.[curr] || ''}
                                onChange={(e) => updateRate(curr, e.target.value)}
                                placeholder="e.g. 3.67"
                            />
                            <div className="mt-2 text-[10px] text-neutral-400">
                                {settings.exchangeRates?.[curr] ? (
                                    <>
                                        <div>1 {curr} = {(1 / settings.exchangeRates[curr]).toFixed(4)} AED</div>
                                        <div className="text-blue-600 font-bold mt-1">
                                            Example: 100 {curr} = {(100 / settings.exchangeRates[curr]).toFixed(0)} AED
                                        </div>
                                    </>
                                ) : "Not Set"}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Shipping Guarantee Settings */}
                <motion.div variants={itemVar} className="bg-white p-8 rounded-[32px] border border-neutral-100 shadow-sm mt-8">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-neutral-900 flex items-center justify-center text-white">
                                <ShieldCheck size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Shipping Guarantee</h3>
                                <p className="text-neutral-400 text-sm">Offer paid protection at checkout.</p>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-3">
                            <button
                                onClick={() => updateSettings({ shippingGuarantee: { ...settings.shippingGuarantee, enabled: !settings.shippingGuarantee.enabled } })}
                                className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-colors duration-300 ${settings.shippingGuarantee?.enabled ? "bg-green-500" : "bg-neutral-200"}`}
                            >
                                <motion.div
                                    layout
                                    className="w-6 h-6 bg-white rounded-full shadow-sm"
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            </button>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                                {settings.shippingGuarantee?.enabled ? "Active" : "Disabled"}
                            </span>
                        </div>
                    </div>

                    {settings.shippingGuarantee?.enabled && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-neutral-100"
                        >
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2 block">Price (AED)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 text-sm font-bold">AED</span>
                                    <input
                                        type="number"
                                        value={settings.shippingGuarantee.price}
                                        onChange={(e) => updateSettings({ shippingGuarantee: { ...settings.shippingGuarantee, price: parseFloat(e.target.value) } })}
                                        className="w-full bg-neutral-50 border-none rounded-xl pl-12 pr-4 py-3 font-bold text-sm focus:ring-0"
                                    />
                                </div>
                                <p className="text-[10px] text-neutral-400 mt-2">Auto-converts to user currency.</p>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2 block">Virtual Product ID</label>
                                <input
                                    type="text"
                                    value={settings.shippingGuarantee.productId}
                                    onChange={(e) => updateSettings({ shippingGuarantee: { ...settings.shippingGuarantee, productId: e.target.value } })}
                                    className="w-full bg-neutral-50 border-none rounded-xl px-4 py-3 font-mono text-sm focus:ring-0"
                                    placeholder="e.g. 15402"
                                />
                                <p className="text-[10px] text-neutral-400 mt-2">ID of the virtual product in WooCommerce.</p>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </motion.div>

            {/* Social Media Channels */}
            <motion.div variants={itemVar} className="bg-white p-8 rounded-[32px] border border-neutral-100 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-pink-50 flex items-center justify-center text-pink-600">
                        <Instagram size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Social Presence</h3>
                        <p className="text-neutral-400 text-sm">Manage your brand's social media usernames for the footer.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { key: 'instagram', label: 'Instagram', icon: Instagram },
                        { key: 'twitter', label: 'Twitter', icon: Twitter },
                        { key: 'tiktok', label: 'TikTok', icon: Music2 },
                        { key: 'youtube', label: 'YouTube', icon: Youtube }
                    ].map((platform) => (
                        <div key={platform.key} className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 block">{platform.label}</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 text-xs font-bold">@</span>
                                <input
                                    type="text"
                                    className="w-full bg-neutral-50 border-none rounded-xl pl-8 pr-4 py-3 text-sm font-bold focus:ring-0"
                                    placeholder="username"
                                    value={(settings.socialLinks as any)?.[platform.key] || ""}
                                    onChange={(e) => updateSettings({
                                        socialLinks: { ...settings.socialLinks, [platform.key]: e.target.value }
                                    })}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            <motion.div variants={itemVar} className="bg-red-50 p-8 rounded-[32px] border border-red-100">
                <h3 className="font-bold text-red-900 mb-2">Danger Zone</h3>
                <p className="text-red-700/60 text-sm mb-6">Resetting will clear all local changes and return to defaults.</p>
                <button
                    onClick={() => {
                        if (confirm("Are you sure? This will wipe all changes.")) {
                            localStorage.removeItem("drotes_admin_settings");
                            window.location.reload();
                        }
                    }}
                    className="bg-red-600 text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                    <Trash2 size={16} /> Reset All Data
                </button>
            </motion.div>
        </motion.div>
    );
};

// --- LIVE ANALYTICS TAB (Shopify-Style) ---

const LiveViewTab = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const pointerInteracting = useRef<number | null>(null);
    const pointerInteractionMovement = useRef(0);
    const phiRef = useRef(0);
    const globeRef = useRef<any>(null);

    const [expandedLocation, setExpandedLocation] = useState<string | null>(null);
    const [visitorPeriod, setVisitorPeriod] = useState<'live' | '24h' | '7d'>('live');
    const [globeScale, setGlobeScale] = useState(1.15);
    const scaleRef = useRef(1.15);

    const [stats, setStats] = useState<any>({
        rightNow: 0,
        visitors24h: 0,
        visitors7d: 0,
        funnel: { viewing: 0, activeCarts: 0, checkingOut: 0, completed: 0 },
        locations: [],
        markers: [],
        pages: [],
        daily: { date: '', orders: 0, revenue: 0, uniqueVisitors: 0 },
        devices: { mobile: 0, desktop: 0 },
        recent: []
    });

    // Fetch stats every 3 seconds
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/analytics/stats');
                const data = await res.json();
                setStats(data);
            } catch (e) {
                console.error("Stats fetch failed", e);
            }
        };
        fetchStats();
        const interval = setInterval(fetchStats, 3000);
        return () => clearInterval(interval);
    }, []);

    // Interactive Cobe Globe with RESPONSIVE sizing
    useEffect(() => {
        if (!canvasRef.current || !containerRef.current) return;

        let globe: any;

        const onResize = () => {
            if (globe) globe.destroy();

            const w = containerRef.current?.offsetWidth || 600;
            const h = containerRef.current?.offsetHeight || 600;

            globe = createGlobe(canvasRef.current!, {
                devicePixelRatio: 2,
                width: w * 2,
                height: h * 2,
                phi: 0,
                theta: 0.25,
                dark: 0,
                diffuse: 1.5,
                mapSamples: 20000,
                mapBrightness: 8,
                baseColor: [0.98, 0.98, 0.98],
                markerColor: [0.2, 0.5, 1],
                glowColor: [0.95, 0.95, 0.95],
                scale: scaleRef.current,
                markers: stats.markers || [],
                onRender: (state) => {
                    if (!pointerInteracting.current) {
                        phiRef.current += 0.002;
                    }
                    state.phi = phiRef.current + pointerInteractionMovement.current;
                    state.scale = scaleRef.current;
                },
            });
        };

        window.addEventListener('resize', onResize);
        onResize(); // Initial

        if (canvasRef.current) {
            canvasRef.current.style.opacity = '1';
        }

        return () => {
            window.removeEventListener('resize', onResize);
            if (globe) globe.destroy();
        };
    }, [stats.markers]);

    // Get visitor count based on selected period
    const getVisitorCount = () => {
        switch (visitorPeriod) {
            case 'live': return stats.rightNow;
            case '24h': return stats.visitors24h || 0;
            case '7d': return stats.visitors7d || 0;
            default: return stats.rightNow;
        }
    };

    // ... state logic remains same ...

    return (
        <motion.div variants={containerVar} initial="hidden" animate="show" className="space-y-6 pb-20">
            {/* Header Row */}
            <motion.div variants={itemVar} className="flex justify-between items-center">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Live View</h1>
                        <span className="flex items-center gap-1.5 px-2.5 py-0.5 bg-green-50 text-green-600 text-xs font-bold tracking-wide rounded-full border border-green-100">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            LIVE
                        </span>
                    </div>
                    <p className="text-neutral-500 text-sm mt-1">Real-time activity on your store</p>
                </div>
                <div className="text-right text-sm text-neutral-400 font-medium">
                    Last updated: Just now
                </div>
            </motion.div>

            {/* Top Stats Grid */}
            <motion.div variants={itemVar} className="bg-white rounded-2xl border border-neutral-200/60 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-semibold text-neutral-900">Visitors</h3>
                    <div className="flex bg-neutral-100 rounded-lg p-1">
                        {(['live', '24h', '7d'] as const).map((period) => (
                            <button
                                key={period}
                                onClick={() => setVisitorPeriod(period)}
                                className={clsx(
                                    "px-4 py-1.5 text-xs font-semibold rounded-md transition-all",
                                    visitorPeriod === period
                                        ? "bg-white text-neutral-900 shadow-sm"
                                        : "text-neutral-500 hover:text-neutral-700"
                                )}
                            >
                                {period === 'live' ? 'Live' : period === '24h' ? '24 Hours' : '7 Days'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Card 1: Main Metric */}
                    <div className="bg-neutral-50/50 p-5 rounded-xl border border-neutral-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <UsersIcon className="w-16 h-16 text-neutral-900" />
                        </div>
                        <p className="text-neutral-500 text-xs font-bold uppercase tracking-wider">
                            {visitorPeriod === 'live' ? 'Right Now' : visitorPeriod === '24h' ? 'Last 24h' : 'Last 7 Days'}
                        </p>
                        <div className="mt-2 flex items-baseline gap-2">
                            <SmoothCounter value={getVisitorCount()} className="text-5xl font-black text-neutral-900 tracking-tight" />
                        </div>
                        <p className="text-neutral-400 text-xs mt-2 font-medium">
                            {visitorPeriod === 'live' ? 'Active on site' : 'Unique visitors'}
                        </p>
                    </div>

                    {/* Card 2: Today */}
                    <div className="bg-white p-5 rounded-xl border border-neutral-100">
                        <p className="text-neutral-500 text-xs font-bold uppercase tracking-wider">Today</p>
                        <div className="mt-2">
                            <h2 className="text-4xl font-bold text-neutral-900 tracking-tight">{stats.daily?.uniqueVisitors || 0}</h2>
                        </div>
                        <p className="text-neutral-400 text-xs mt-2 font-medium">Total sessions</p>
                    </div>

                    {/* Card 3: Orders */}
                    <div className="bg-white p-5 rounded-xl border border-neutral-100">
                        <p className="text-neutral-500 text-xs font-bold uppercase tracking-wider">Orders</p>
                        <div className="mt-2">
                            <h2 className="text-4xl font-bold text-neutral-900 tracking-tight">{stats.daily?.orders || 0}</h2>
                        </div>
                        <p className="text-neutral-400 text-xs mt-2 font-medium">Completed today</p>
                    </div>

                    {/* Card 4: Revenue */}
                    <div className="bg-neutral-900 text-white p-5 rounded-xl shadow-lg shadow-neutral-200">
                        <p className="text-neutral-400 text-xs font-bold uppercase tracking-wider">Revenue</p>
                        <div className="mt-2">
                            <h2 className="text-4xl font-bold tracking-tight">AED {stats.daily?.revenue?.toLocaleString() || 0}</h2>
                        </div>
                        <p className="text-neutral-500 text-xs mt-2 font-medium">Gross sales</p>
                    </div>
                </div>
            </motion.div>

            {/* Middle Row: Globe & Behavior */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                {/* Globe Container */}
                <motion.div
                    variants={itemVar}
                    ref={containerRef}
                    className="lg:col-span-3 bg-white rounded-2xl border border-neutral-200/60 shadow-sm relative overflow-hidden"
                    style={{ minHeight: '520px' }}
                >
                    <div className="absolute top-6 left-6 z-10 pointer-events-none">
                        <h3 className="text-sm font-semibold text-neutral-900 bg-white/50 backdrop-blur-sm px-3 py-1 rounded-full border border-neutral-100/50">
                            Live Geography
                        </h3>
                    </div>

                    <div className="absolute top-6 right-6 z-10 flex flex-col gap-2 pointer-events-none">
                        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-neutral-100 shadow-sm">
                            <Smartphone size={14} className="text-neutral-500" />
                            <span className="text-xs font-bold text-neutral-700">{stats.devices?.mobile || 0}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-neutral-100 shadow-sm">
                            <Monitor size={14} className="text-neutral-500" />
                            <span className="text-xs font-bold text-neutral-700">{stats.devices?.desktop || 0}</span>
                        </div>
                    </div>

                    {/* Zoom Controls */}
                    <div className="absolute bottom-6 right-6 z-10 flex flex-col gap-1">
                        <button
                            onClick={() => {
                                scaleRef.current = Math.min(2.5, scaleRef.current + 0.15);
                                setGlobeScale(scaleRef.current);
                            }}
                            className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-lg border border-neutral-200 shadow-sm flex items-center justify-center text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 transition-colors font-bold text-lg"
                            title="Zoom In"
                        >
                            +
                        </button>
                        <button
                            onClick={() => {
                                scaleRef.current = Math.max(0.5, scaleRef.current - 0.15);
                                setGlobeScale(scaleRef.current);
                            }}
                            className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-lg border border-neutral-200 shadow-sm flex items-center justify-center text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 transition-colors font-bold text-lg"
                            title="Zoom Out"
                        >
                            −
                        </button>
                    </div>

                    <div
                        className="flex items-center justify-center h-full w-full absolute inset-0"
                        onWheel={(e) => {
                            e.preventDefault();
                            const delta = e.deltaY > 0 ? -0.08 : 0.08;
                            scaleRef.current = Math.max(0.5, Math.min(2.5, scaleRef.current + delta));
                            setGlobeScale(scaleRef.current);
                        }}
                    >
                        <canvas
                            ref={canvasRef}
                            onPointerDown={(e) => {
                                pointerInteracting.current = e.clientX - pointerInteractionMovement.current * 100;
                                if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
                            }}
                            onPointerUp={() => {
                                pointerInteracting.current = null;
                                if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
                            }}
                            onPointerOut={() => {
                                pointerInteracting.current = null;
                                if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
                            }}
                            onMouseMove={(e) => {
                                if (pointerInteracting.current !== null) {
                                    const delta = e.clientX - pointerInteracting.current;
                                    pointerInteractionMovement.current = delta / 100;
                                }
                            }}
                            onTouchMove={(e) => {
                                if (pointerInteracting.current !== null && e.touches[0]) {
                                    const delta = e.touches[0].clientX - pointerInteracting.current;
                                    pointerInteractionMovement.current = delta / 100;
                                }
                            }}
                            style={{
                                width: '100%',
                                height: '100%',
                                cursor: 'grab',
                                opacity: 0,
                                transition: 'opacity 0.8s ease'
                            }}
                        />
                    </div>
                </motion.div>

                {/* Vertical Stack: Funnel + Top Locations */}
                <div className="lg:col-span-2 flex flex-col gap-6">

                    {/* Behavior / Funnel */}
                    <motion.div variants={itemVar} className="bg-white rounded-2xl border border-neutral-200/60 shadow-sm p-6 flex-1">
                        <h3 className="text-sm font-semibold text-neutral-900 mb-6">Live Funnel (10m)</h3>
                        <div className="space-y-5">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md">
                                            <ShoppingBag size={14} />
                                        </div>
                                        <span className="text-sm font-medium text-neutral-700">Active Carts</span>
                                    </div>
                                    <span className="text-lg font-bold text-neutral-900">{stats.funnel?.activeCarts || 0}</span>
                                </div>
                                <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(100, (stats.funnel?.activeCarts || 0) * 10)}%` }}
                                        className="bg-blue-500 h-full rounded-full"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-amber-50 text-amber-600 rounded-md">
                                            <CreditCard size={14} />
                                        </div>
                                        <span className="text-sm font-medium text-neutral-700">Checking Out</span>
                                    </div>
                                    <span className="text-lg font-bold text-neutral-900">{stats.funnel?.checkingOut || 0}</span>
                                </div>
                                <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(100, (stats.funnel?.checkingOut || 0) * 15)}%` }}
                                        className="bg-amber-500 h-full rounded-full"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-green-50 text-green-600 rounded-md">
                                            <CheckCircle2 size={14} />
                                        </div>
                                        <span className="text-sm font-medium text-neutral-700">Purchased</span>
                                    </div>
                                    <span className="text-lg font-bold text-neutral-900">{stats.funnel?.completed || 0}</span>
                                </div>
                                <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(100, (stats.funnel?.completed || 0) * 20)}%` }}
                                        className="bg-green-500 h-full rounded-full"
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Top Locations */}
                    <motion.div variants={itemVar} className="bg-white rounded-2xl border border-neutral-200/60 shadow-sm p-6 flex-1 overflow-hidden">
                        <h3 className="text-sm font-semibold text-neutral-900 mb-4">Top Locations</h3>
                        <div className="space-y-1 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                            {(stats.locations || []).slice(0, 5).map((loc: any, i: number) => (
                                <div key={i}>
                                    <button
                                        onClick={() => setExpandedLocation(expandedLocation === loc.code ? null : loc.code)}
                                        className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-neutral-50 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded bg-neutral-100 flex items-center justify-center text-[10px] font-bold text-neutral-600 group-hover:bg-white group-hover:shadow-sm transition-all">
                                                {loc.code}
                                            </div>
                                            <span className="text-sm font-medium text-neutral-700">{loc.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded-full">{loc.count}</span>
                                            <ChevronRight
                                                size={14}
                                                className={clsx(
                                                    "text-neutral-400 transition-transform duration-200",
                                                    expandedLocation === loc.code && "rotate-90"
                                                )}
                                            />
                                        </div>
                                    </button>
                                    <AnimatePresence>
                                        {expandedLocation === loc.code && loc.visitors && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="ml-10 pl-4 border-l border-neutral-100 py-2 space-y-2">
                                                    {loc.visitors.map((visitor: any, j: number) => (
                                                        <div key={j} className="text-xs space-y-0.5">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-mono text-neutral-500">{visitor.ip}</span>
                                                                <span className="text-neutral-300">•</span>
                                                                <span className="text-neutral-500 font-medium">{visitor.city}</span>
                                                            </div>
                                                            <div className="text-neutral-400 truncate max-w-[150px]">{visitor.path}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                            {(stats.locations?.length || 0) === 0 && (
                                <div className="text-center py-8 text-neutral-400 text-sm">No location data available</div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Bottom Row: Active Pages & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Active Pages */}
                <motion.div variants={itemVar} className="bg-white rounded-2xl border border-neutral-200/60 shadow-sm p-6">
                    <h3 className="text-sm font-semibold text-neutral-900 mb-4">Active Pages</h3>
                    <div className="space-y-1">
                        {(stats.pages || []).slice(0, 6).map((page: any, i: number) => (
                            <div key={i} className="flex items-center justify-between py-2.5 px-2 border-b border-neutral-50 last:border-0 hover:bg-neutral-50 rounded-lg transition-colors">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="p-1.5 bg-neutral-100 rounded text-neutral-500">
                                        <FileText size={14} />
                                    </div>
                                    <span className="text-sm text-neutral-600 truncate font-medium">{page.path}</span>
                                </div>
                                <span className="text-xs font-bold bg-neutral-900 text-white px-2 py-0.5 rounded-md shadow-sm">{page.count}</span>
                            </div>
                        ))}
                        {(stats.pages?.length || 0) === 0 && (
                            <div className="text-center py-10 text-neutral-400 text-sm">No active pages</div>
                        )}
                    </div>
                </motion.div>

                {/* Recent Activity Feed */}
                <motion.div variants={itemVar} className="bg-white rounded-2xl border border-neutral-200/60 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-neutral-900">Recent Activity</h3>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-xs font-medium text-neutral-500">Live Feed</span>
                        </div>
                    </div>

                    <div className="space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                        <AnimatePresence mode="popLayout">
                            {(stats.recent || []).slice(0, 8).map((activity: any, i: number) => (
                                <ActivityItem key={`${activity.path}-${i}-${activity.ago}`} item={activity} />
                            ))}
                        </AnimatePresence>
                        {(stats.recent?.length || 0) === 0 && (
                            <div className="text-center py-10 text-neutral-400 text-sm">Waiting for visitors...</div>
                        )}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );


};


// --- MAIN LAYOUT ---

export default function MiniAdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [activeTab, setActiveTab] = useState("dashboard");
    const { settings, updateSettings, calculateOrderProfit } = useAdminSettings();
    const [mounted, setMounted] = useState(false);

    // Editor State
    const [editorState, setEditorState] = useState<{
        open: boolean;
        file: File | null;
        imageSrc: string | null;
        field: 'logo' | 'hero' | null;
    }>({ open: false, file: null, imageSrc: null, field: null });

    useEffect(() => { setMounted(true); }, []);

    // HYDRATION FIX
    if (!mounted) return <div className="min-h-screen bg-[#FAFAFA]" />;
    if (!isAuthenticated) return <AdminLogin onLogin={() => setIsAuthenticated(true)} />;

    // File Upload Handlers
    const initiateFileUpload = (field: 'logo' | 'hero', file: File) => {
        const reader = new FileReader();
        reader.addEventListener("load", () => {
            setEditorState({ open: true, file, imageSrc: reader.result as string, field });
        });
        reader.readAsDataURL(file);
    };

    const handleEditorSave = async (croppedBlob: Blob) => {
        if (!editorState.field) return;
        const file = new File([croppedBlob], editorState.file?.name || "image.jpg", { type: "image/jpeg" });
        try {
            const url = await uploadAdminImage(file);
            if (editorState.field === 'logo') updateSettings({ logo: { ...settings.logo, url } });
            else updateSettings({ heroImage: url });
            setEditorState({ open: false, file: null, imageSrc: null, field: null });
        } catch (e) { alert("Upload failed"); }
    };

return (
  <div className="min-h-screen w-full bg-[#f8f8f8]">
    <div className="flex">
      
      {/* ================= SIDEBAR ================= */}
      <aside className="w-20 lg:w-72 bg-white border-r border-neutral-200 flex flex-col fixed h-screen">
        
        {/* Logo */}
        <div className="h-24 flex items-center px-6">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-black text-xs">
            AN
          </div>
          <span className="ml-3 font-bold hidden lg:block">
            ANEC:DOTE
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 space-y-2 py-8 overflow-y-auto">
          {[
            { id: "dashboard", icon: LayoutDashboard, label: "Overview" },
            { id: "live", icon: Globe, label: "Live View" },
            { id: "addons", icon: Puzzle, label: "Addons" },
            { id: "content", icon: Palette, label: "Experience" },
            { id: "commerce", icon: ShoppingBag, label: "Commerce" },
            { id: "profit", icon: TrendingUp, label: "Profit" },
            { id: "products", icon: Package, label: "Inventory" },
            { id: "size-guide", icon: Ruler, label: "Size Guide" },
            { id: "settings", icon: Settings, label: "System" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "flex items-center gap-4 px-4 py-4 rounded-2xl w-full transition-all duration-300",
                activeTab === tab.id
                  ? "bg-black text-white"
                  : "text-neutral-500 hover:bg-neutral-100"
              )}
            >
              <tab.icon size={20} />
              <span className="hidden lg:block text-sm font-bold">
                {tab.label}
              </span>
            </button>
          ))}
        </nav>

        {/* Sign Out */}
        <div className="p-4 border-t border-neutral-200">
          <button
            onClick={() => setIsAuthenticated(false)}
            className="flex items-center gap-4 px-4 py-3 w-full text-neutral-400 hover:text-red-500 transition-colors"
          >
            <LogOut size={18} />
            <span className="hidden lg:block text-xs font-bold uppercase">
              Sign Out
            </span>
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <div className="ml-20 lg:ml-72 w-full">
        <div className="max-w-[1400px] mx-auto p-8 lg:p-16">

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === "dashboard" && <DashboardTab settings={settings} />}
              {activeTab === "live" && <LiveViewTab />}
              {activeTab === "addons" && <AddonsTab settings={settings} updateSettings={updateSettings} />}
              {activeTab === "content" && <ContentTab settings={settings} updateSettings={updateSettings} initiateUpload={initiateFileUpload} />}
              {activeTab === "commerce" && <CommerceTab settings={settings} calculateOrderProfit={calculateOrderProfit} updateSettings={updateSettings} />}
              {activeTab === "profit" && <ProfitTab settings={settings} calculateOrderProfit={calculateOrderProfit} />}
              {activeTab === "products" && <ProductsTab settings={settings} updateSettings={updateSettings} initiateUpload={initiateFileUpload} />}
              {activeTab === "size-guide" && <SizeChartTab settings={settings} updateSettings={updateSettings} />}
              {activeTab === "settings" && <SettingsTab settings={settings} updateSettings={updateSettings} />}
            </motion.div>
          </AnimatePresence>

        </div>
      </div>
    </div>

    {/* Image Editor Modal */}
    {editorState.open && editorState.imageSrc && (
      <ImageEditor
        imageSrc={editorState.imageSrc}
        onSave={handleEditorSave}
        onClose={() => setEditorState({ open: false, file: null, imageSrc: null, field: null })}
      />
    )}
  </div>
);
}
