"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Send, Ruler, HelpCircle } from "lucide-react";
import Image from "next/image";
import { useQuery } from "@apollo/client";
import clsx from "clsx";
import { GET_PAGE_BY_SLUG } from "@/lib/queries";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface SizeGuideModalProps extends ModalProps {
    content: string;
}

export function DeliveryModal({ isOpen, onClose }: ModalProps) {
    const { data, loading, error } = useQuery(GET_PAGE_BY_SLUG, {
        variables: { slug: "delivery-return" },
        skip: !isOpen
    });

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative bg-white w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-sm shadow-2xl flex flex-col"
                    >
                        <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-6 border-b border-neutral-100">
                            <h2 className="text-xl font-bold uppercase tracking-tight">Delivery & Returns</h2>
                            <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-8 md:p-12 overflow-y-auto custom-scrollbar">
                            {loading ? (
                                <div className="flex items-center justify-center py-24">
                                    <Loader2 className="animate-spin text-neutral-400 w-8 h-8" />
                                </div>
                            ) : error ? (
                                <div className="text-center py-12">
                                    <p className="text-red-500 font-medium">Unable to load content.</p>
                                    <button onClick={onClose} className="mt-4 text-xs underline">Close</button>
                                </div>
                            ) : (
                                <article className="prose prose-sm prose-neutral max-w-none 
                                    prose-headings:font-black prose-headings:uppercase prose-headings:tracking-widest prose-headings:mb-4
                                    prose-p:text-neutral-500 prose-p:font-light prose-p:leading-relaxed prose-p:mb-6
                                    prose-ul:list-disc prose-ul:font-light prose-ul:text-neutral-500 prose-li:mb-2
                                    prose-strong:font-bold prose-strong:text-black
                                    prose-a:text-black prose-a:underline prose-a:underline-offset-2 hover:prose-a:text-neutral-600
                                ">
                                    <div dangerouslySetInnerHTML={{ __html: data?.page?.content || "No content found." }} />
                                </article>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

export function SizeGuideModal({ isOpen, onClose, content }: SizeGuideModalProps) {
    const isTable = typeof content === 'object' && (content as any).headers && (content as any).rows;
    const tableData = isTable ? (content as any) : null;

    const [displayUnit, setDisplayUnit] = useState<"cm" | "in">("cm");

    useEffect(() => {
        if (tableData?.unit) setDisplayUnit(tableData.unit);
    }, [tableData]);

    const convertValue = (val: string, ri: number, ci: number): string => {
        if (!tableData || !val) return val;

        // Check for manual override if we are in alternate unit mode
        const isAlternate = displayUnit !== tableData.unit;
        if (isAlternate && tableData.alternateRows?.[ri]?.[ci]) {
            return tableData.alternateRows[ri][ci];
        }

        // Check if value is a numeric range like "50-52"
        if (val.includes("-")) {
            return val.split("-").map(v => convertValue(v.trim(), ri, ci)).join("-");
        }
        const num = parseFloat(val);
        if (isNaN(num)) return val;
        if (tableData.unit === displayUnit) return val;

        // CM to IN
        if (tableData.unit === "cm" && displayUnit === "in") {
            return (num / 2.54).toFixed(1);
        }
        // IN to CM
        if (tableData.unit === "in" && displayUnit === "cm") {
            return (num * 2.54).toFixed(1);
        }
        return val;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative bg-white w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-[32px] shadow-2xl flex flex-col"
                    >
                        <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-8 border-b border-neutral-100">
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-tighter">Size Guide</h2>
                                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-1">Measurements in {displayUnit === 'in' ? 'Inches' : 'Centimeters'}</p>
                            </div>
                            <button onClick={onClose} className="p-3 hover:bg-neutral-100 rounded-full transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-8 md:p-12 overflow-y-auto custom-scrollbar">
                            {isTable && tableData.image && (
                                <div className="mb-8 rounded-2xl overflow-hidden border border-neutral-100 bg-neutral-50 px-4 py-8 aspect-[16/10] relative">
                                    <Image src={tableData.image} alt="Size Guide Diagram" fill className="object-contain p-4" unoptimized />
                                </div>
                            )}
                            {isTable && (
                                <div className="flex justify-end mb-4">
                                    <div className="bg-neutral-100 p-1 rounded-full flex gap-1">
                                        {[
                                            { id: "cm", label: "CM" },
                                            { id: "in", label: "IN" }
                                        ].map((u) => (
                                            <button
                                                key={u.id}
                                                disabled={!tableData.allowConversion && displayUnit !== u.id}
                                                onClick={() => setDisplayUnit(u.id as any)}
                                                className={clsx(
                                                    "px-4 py-1.5 rounded-full text-[10px] font-bold transition-all",
                                                    displayUnit === u.id
                                                        ? "bg-white text-black shadow-sm"
                                                        : "text-neutral-400 hover:text-black"
                                                )}
                                            >
                                                {u.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {isTable ? (
                                <div className="overflow-x-auto rounded-2xl border border-neutral-100">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-neutral-50">
                                                {tableData.headers?.map((h: string, i: number) => (
                                                    <th key={i} className="p-4 text-[10px] font-black uppercase tracking-widest text-neutral-400 border-b border-neutral-100 whitespace-nowrap">
                                                        {h}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tableData.rows.map((row: string[], ri: number) => (
                                                <tr key={ri} className="hover:bg-neutral-50/50 transition-colors">
                                                    {row.map((cell: string, ci: number) => (
                                                        <td key={ci} className="p-4 text-xs font-bold border-b border-neutral-50 last:border-b-0 whitespace-nowrap">
                                                            {convertValue(cell, ri, ci)}
                                                            {displayUnit === 'in' && !isNaN(parseFloat(cell)) && <span className="text-[8px] ml-0.5 opacity-40">"</span>}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : content ? (
                                <div className="prose prose-sm max-w-none 
                                    prose-table:w-full prose-table:border-collapse
                                    prose-th:bg-neutral-50 prose-th:p-4 prose-th:text-[10px] prose-th:font-black prose-th:uppercase prose-th:tracking-widest prose-th:text-neutral-400 prose-th:border-b prose-th:border-neutral-100
                                    prose-td:p-4 prose-td:text-xs prose-td:font-bold prose-td:border-b prose-td:border-neutral-50
                                ">
                                    {/* Simple check for image URL vs HTML */}
                                    {typeof content === 'string' && content.match(/\.(jpeg|jpg|gif|png|webp)$/) ? (
                                        <img src={content} alt="Size Guide" className="w-full h-auto rounded-xl" />
                                    ) : (
                                        <div dangerouslySetInnerHTML={{ __html: String(content) }} />
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-neutral-50 rounded-3xl border border-dashed border-neutral-200">
                                    <Ruler className="mx-auto text-neutral-300 mb-4" size={48} />
                                    <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest">No Measurements Available</p>
                                </div>
                            )}

                            <div className="mt-12 p-6 bg-neutral-900 rounded-2xl text-white">
                                <div className="flex gap-4 items-start">
                                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                                        <HelpCircle size={16} />
                                    </div>
                                    <div className="text-[10px] font-medium leading-relaxed opacity-60 uppercase tracking-widest">
                                        <p className="font-bold opacity-100 mb-1">How to measure?</p>
                                        <p>Compare these measurements with a similar item you already own. Lay your garment flat on a level surface and measure without stretching the fabric.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

export function AskQuestionModal({ isOpen, onClose }: ModalProps) {
    const [formData, setFormData] = useState({
        yourName: "",
        yourEmail: "",
        yourSubject: "",
        yourMessage: ""
    });
    const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("submitting");
        setErrorMessage("");

        // CF7 Form Data
        const body = new FormData();
        body.append("_wpcf7", "813fcf9");
        body.append("_wpcf7_unit_tag", "wpcf7-f813fcf9-p1-o1");

        body.append("your-name", formData.yourName);
        body.append("your-email", formData.yourEmail);
        body.append("your-subject", formData.yourSubject);
        body.append("your-message", formData.yourMessage);

        try {
            const res = await fetch("https://bck.drotes.com/wp-json/contact-form-7/v1/contact-forms/813fcf9/feedback", {
                method: "POST",
                body: body
            });
            const json = await res.json();
            console.log("CF7 Response:", json); // Debugging

            if (json.status === "mail_sent") {
                setStatus("success");
                setTimeout(onClose, 2000);
            } else {
                setStatus("error");
                setErrorMessage(json.message || "Failed to send message.");
                if (json.invalid_fields) {
                    console.error("Invalid Fields:", json.invalid_fields);
                }
            }
        } catch (err) {
            console.error(err);
            setStatus("error");
            setErrorMessage("Network error. Please try again.");
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative bg-white w-full max-w-lg rounded-sm shadow-2xl flex flex-col"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-neutral-100">
                            <h2 className="text-xl font-bold uppercase tracking-tight">Ask a Question</h2>
                            <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6">
                            {status === "success" ? (
                                <div className="text-center py-12 space-y-4">
                                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                                        <Send size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold">Message Sent!</h3>
                                    <p className="text-neutral-500">We'll get back to you shortly.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold uppercase tracking-widest block mb-2">Name</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full border border-neutral-200 p-3 text-sm focus:border-black outline-none transition-colors"
                                            value={formData.yourName}
                                            onChange={e => setFormData({ ...formData, yourName: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold uppercase tracking-widest block mb-2">Email</label>
                                        <input
                                            required
                                            type="email"
                                            className="w-full border border-neutral-200 p-3 text-sm focus:border-black outline-none transition-colors"

                                            value={formData.yourEmail}
                                            onChange={e => setFormData({ ...formData, yourEmail: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold uppercase tracking-widest block mb-2">Subject</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full border border-neutral-200 p-3 text-sm focus:border-black outline-none transition-colors"
                                            value={formData.yourSubject}
                                            onChange={e => setFormData({ ...formData, yourSubject: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold uppercase tracking-widest block mb-2">Message</label>
                                        <textarea
                                            required
                                            rows={4}
                                            className="w-full border border-neutral-200 p-3 text-sm focus:border-black outline-none transition-colors resize-none"
                                            value={formData.yourMessage}
                                            onChange={e => setFormData({ ...formData, yourMessage: e.target.value })}
                                        />
                                    </div>

                                    {status === "error" && (
                                        <p className="text-red-500 text-sm text-center">{errorMessage || "Failed to send. Please try again."}</p>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={status === "submitting"}
                                        className="w-full bg-black text-white py-4 font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {status === "submitting" ? <Loader2 className="animate-spin" /> : "Send Message"}
                                    </button>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
