"use client";
import React, { useState } from "react";
import LegalPageLayout from "@/components/LegalPageLayout";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, Search, ShoppingBag, Truck, Package, RotateCcw } from "lucide-react";

const FAQ_DATA = [
    {
        category: "Orders",
        icon: ShoppingBag,
        items: [
            { q: "Can I modify my order after placing it?", a: "We process orders quickly. Once placed, modifications are not guaranteed. Contact support immediately if you notice an error." },
            { q: "Where is my order confirmation?", a: "Check your spam folder. If you still can't find it, email us with your name and date of purchase, and we’ll resend it." },
            { q: "Do you ship worldwide?", a: "Yes, we ship globally from our central hub. Delivery times vary by region." }
        ]
    },
    {
        category: "Shipping",
        icon: Truck,
        items: [
            { q: "How long does shipping take?", a: "Domestic: 1-3 days. GCC: 3-7 days. International: 5-12 days. Processing takes an additional 1-3 business days." },
            { q: "Will I tackle customs fees?", a: "International orders may be subject to local duties upon arrival. These are not included in our shipping price and are the customer's responsibility." }
        ]
    },
    {
        category: "Returns",
        icon: RotateCcw,
        items: [
            { q: "What is your return policy?", a: "We accept returns on unworn items within 7 days of delivery. Original tags must be attached." },
            { q: "Do you offer free returns?", a: "Return shipping costs are the responsibility of the customer unless the item arrived damaged or incorrect." }
        ]
    },
    {
        category: "Product",
        icon: Package,
        items: [
            { q: "How do I care for my items?", a: "Check the care label inside your garment. Generally: Wash cold, inside out. Do not tumble dry." },
            { q: "When is the next restock?", a: "We operate on limited drops. Sign up for our newsletter to get notified before anyone else." }
        ]
    }
];

export default function FAQPage() {
    const [activeCategory, setActiveCategory] = useState("Orders");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredData = FAQ_DATA.filter(cat =>
        cat.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.items.some(item => item.q.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <LegalPageLayout
            title="FAQ"
            subtitle="Answers to your most common questions."
        >
            {/* Search */}
            <div className="relative mb-12">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                <input
                    type="text"
                    placeholder="Search questions..."
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-neutral-50 border border-neutral-100 focus:outline-none focus:ring-1 focus:ring-black transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Category Tabs (Desktop) */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar scroll-smooth">
                {FAQ_DATA.map((cat) => (
                    <button
                        key={cat.category}
                        onClick={() => { setActiveCategory(cat.category); setSearchQuery(""); }}
                        className={`
                            px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2
                            ${activeCategory === cat.category && !searchQuery ? 'bg-black text-white shadow-lg shadow-black/10' : 'bg-neutral-50 text-neutral-500 hover:bg-neutral-100'}
                        `}
                    >
                        <cat.icon size={14} />
                        {cat.category}
                    </button>
                ))}
            </div>

            {/* FAQ Items */}
            <div className="space-y-4">
                {filteredData.map((cat) => (
                    (searchQuery || activeCategory === cat.category) && (
                        <div key={cat.category} className="space-y-4">
                            {searchQuery && <h3 className="text-xs uppercase tracking-widest text-neutral-400 mb-4 ml-2">{cat.category}</h3>}

                            {cat.items.filter(item =>
                                !searchQuery ||
                                item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                item.a.toLowerCase().includes(searchQuery.toLowerCase())
                            ).map((item, idx) => (
                                <AccordionItem key={idx} question={item.q} answer={item.a} />
                            ))}
                        </div>
                    )
                ))}

                {filteredData.length === 0 && (
                    <div className="text-center py-12 text-neutral-400">
                        <p>No answers found for "{searchQuery}"</p>
                    </div>
                )}
            </div>
        </LegalPageLayout>
    );
}

function AccordionItem({ question, answer }: { question: string, answer: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <motion.div
            initial={false}
            className={`border rounded-xl transition-colors duration-300 ${isOpen ? 'bg-neutral-50 border-neutral-200' : 'bg-white border-neutral-100 hover:border-neutral-200'}`}
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-6 text-left"
            >
                <span className={`font-medium pr-8 transition-colors ${isOpen ? 'text-black' : 'text-neutral-600'}`}>
                    {question}
                </span>
                <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isOpen ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-400'}`}>
                    {isOpen ? <Minus size={14} /> : <Plus size={14} />}
                </div>
            </button>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                        <div className="px-6 pb-6 text-neutral-500 leading-relaxed text-sm">
                            {answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
