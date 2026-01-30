"use client";
import React from "react";
import { Order } from "@/hooks/useAdminSettings";
import { X } from "lucide-react";

interface ShippingLabelProps {
    order: Order;
    onClose: () => void;
}

export default function ShippingLabelA5({ order, onClose }: ShippingLabelProps) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 print:p-0 print:bg-white print:static print:block">
            {/* Screen UI: Backdrop Close */}
            <div className="absolute inset-0 cursor-pointer print:hidden" onClick={onClose} />

            {/* A5 Container (Scaled for screen) */}
            <div className="bg-white text-black shadow-2xl relative print:shadow-none print:w-full print:h-full overflow-hidden w-[148mm] min-h-[210mm] mx-auto print:m-0 print:overflow-visible">

                {/* Controls (Screen Only) */}
                <div className="absolute top-0 right-0 -mr-16 bg-white rounded-lg p-2 print:hidden flex flex-col gap-2">
                    <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full"><X size={20} /></button>
                </div>
                <div className="absolute top-0 left-0 -ml-32 print:hidden">
                    <button
                        onClick={handlePrint}
                        className="bg-green-500 text-black px-6 py-3 font-bold uppercase tracking-widest text-xs hover:bg-green-400"
                    >
                        Print Label
                    </button>
                    <p className="text-white text-[10px] mt-2 w-28 opacity-70">Suggested: A5 size, Portrait, No margins</p>
                </div>

                {/* --- LABEL CONTENT START --- */}
                <div className="h-full flex flex-col p-[10mm] border-[0.5mm] border-dashed border-neutral-300 m-[2mm] print:border-none print:m-0">

                    {/* Header */}
                    <div className="flex justify-between items-start border-b-[2px] border-black pb-4 mb-6">
                        <div>
                            <h1 className="text-3xl font-black tracking-tighter uppercase leading-none">Drotes.</h1>
                            <p className="text-[10px] font-bold uppercase tracking-widest mt-1">Dubai, United Arab Emirates</p>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] uppercase font-bold text-neutral-500">Dispatch Note</div>
                            <div className="font-mono text-xl font-bold">{order.id}</div>
                            <div className="text-xs">{order.date}</div>
                        </div>
                    </div>

                    {/* Addresses */}
                    <div className="grid grid-cols-2 gap-8 mb-8">
                        {/* Sold To */}
                        <div>
                            <h3 className="text-[9px] uppercase tracking-widest font-bold text-neutral-400 mb-1 border-b border-neutral-200 pb-1">Sold To</h3>
                            <p className="font-bold text-sm uppercase">{order.customer}</p>
                            <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                                123 Customer St<br />
                                Apartment 4B<br />
                                Dubai, UAE
                            </p>
                            <div className="mt-2 text-[10px] font-mono">+971 50 123 4567</div>
                        </div>

                        {/* Ship To (Same for now) */}
                        <div>
                            <h3 className="text-[9px] uppercase tracking-widest font-bold text-neutral-400 mb-1 border-b border-neutral-200 pb-1">Ship To</h3>
                            <p className="font-bold text-sm uppercase">{order.customer}</p>
                            <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                                123 Customer St<br />
                                Apartment 4B<br />
                                Dubai, UAE
                            </p>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="flex-1">
                        <h3 className="text-[9px] uppercase tracking-widest font-bold text-neutral-400 mb-2">Packing List</h3>
                        <table className="w-full text-left text-xs">
                            <thead className="border-b-2 border-black">
                                <tr>
                                    <th className="pb-1 uppercase font-bold w-12">Qty</th>
                                    <th className="pb-1 uppercase font-bold">Item Description</th>
                                    <th className="pb-1 uppercase font-bold text-right">SKU/ID</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200">
                                {order.items.map((item, i) => (
                                    <tr key={i}>
                                        <td className="py-2 align-top font-bold text-sm">{item.quantity}</td>
                                        <td className="py-2 align-top">
                                            <span className="font-bold block text-sm">{item.name}</span>
                                            {item.customFile && (
                                                <div className="mt-1 flex items-center gap-1 text-[10px] text-black bg-neutral-100 w-fit px-1 rounded">
                                                    ★ CUSTOM FILE ATTACHED
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-2 align-top text-right font-mono text-[10px] text-neutral-500">
                                            DRTS-V1-{i + 1}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    <div className="mt-auto border-t-[2px] border-black pt-4">
                        <div className="flex justify-between items-center">
                            <div className="text-[8px] uppercase tracking-widest text-neutral-400 max-w-[50%]">
                                Returns accepted within 14 days.<br />Custom items are non-refundable.
                            </div>
                            <div className="text-right">
                                <div className="w-32 h-10 bg-black text-white flex items-center justify-center font-mono text-[10px] tracking-widest">
                                    {order.id}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Global Print Styles */}
            <style jsx global>{`
                @media print {
                    @page {
                        size: A5 portrait;
                        margin: 0;
                    }
                    body {
                        background: white;
                    }
                }
            `}</style>
        </div>
    );
}
