"use client";
import React from "react";
import Image from "next/image";
import { Order } from "@/hooks/useAdminSettings";
import { X } from "lucide-react";

interface ShippingLabelProps {
    order: Order;
    onClose: () => void;
}

export default function ShippingLabel({ order, onClose }: ShippingLabelProps) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 print:p-0 print:bg-white print:static">
            <div className="bg-white text-black w-full max-w-2xl shadow-2xl relative print:shadow-none print:w-full print:max-w-none">
                {/* Screen-only Close Button */}
                <button
                    onClick={onClose}
                    className="absolute -top-12 right-0 text-white hover:text-red-500 print:hidden"
                >
                    <X size={24} />
                </button>

                {/* Print Button */}
                <button
                    onClick={handlePrint}
                    className="absolute -top-12 right-10 text-white hover:text-green-500 mr-4 print:hidden uppercase text-xs font-bold tracking-widest"
                >
                    Print Label
                </button>

                {/* Label Content */}
                <div className="p-8 border-b-2 border-black flex justify-between items-start">
                    <div>
                        <h1 className="text-4xl font-black mb-2 tracking-tighter">DROTES.</h1>
                        <p className="text-xs uppercase tracking-widest">Premium Streetwear<br />Dubai, UAE</p>
                    </div>
                    <div className="text-right">
                        <div className="w-32 h-32 bg-black text-white flex items-center justify-center font-mono text-xs p-2 text-center">
                            [QR CODE PLACEHOLDER]
                            <br />
                            {order.id}
                        </div>
                    </div>
                </div>

                <div className="p-8 grid grid-cols-2 gap-8 border-b border-black/10">
                    <div>
                        <h3 className="text-[10px] uppercase tracking-widest text-neutral-500 mb-2">Ship To:</h3>
                        <p className="font-bold text-lg">{order.customer}</p>
                        <p className="text-sm text-neutral-600 mt-1">
                            123 Street Name<br />
                            Apartment 4B<br />
                            Dubai, United Arab Emirates
                        </p>
                    </div>
                    <div className="text-right">
                        <h3 className="text-[10px] uppercase tracking-widest text-neutral-500 mb-2">Order Details:</h3>
                        <p className="font-mono font-bold text-lg">{order.id}</p>
                        <p className="text-sm text-neutral-600 mt-1">Date: {order.date}</p>
                        <p className="text-sm text-neutral-600">Weight: 1.2kg</p>
                    </div>
                </div>

                <div className="p-8">
                    <h3 className="text-[10px] uppercase tracking-widest text-neutral-500 mb-4">Packing List</h3>
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-black">
                                <th className="pb-2 w-16">Qty</th>
                                <th className="pb-2">Item</th>
                                <th className="pb-2 text-right">Notes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items.map((item, i) => (
                                <tr key={i} className="border-b border-neutral-100">
                                    <td className="py-4 font-bold">{item.quantity}</td>
                                    <td className="py-4">
                                        <div className="font-bold">{item.name}</div>
                                        <div className="text-xs text-neutral-500">AED {item.price}</div>
                                    </td>
                                    <td className="py-4 text-right">
                                        {item.customFile ? (
                                            <span className="inline-block bg-black text-white text-[10px] px-2 py-1 uppercase tracking-widest">
                                                Custom Design
                                            </span>
                                        ) : (
                                            <span className="text-neutral-400 text-[10px] uppercase">Standard</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-8 bg-neutral-100 text-center text-[10px] uppercase tracking-widest text-neutral-500 print:bg-transparent">
                    Thanks for your order. No returns on custom items.
                </div>
            </div>
        </div>
    );
}
