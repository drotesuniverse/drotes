"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X, Check, Info, RotateCcw, ChevronRight, ChevronLeft,
    Cake, Heart, GraduationCap, MessageCircleHeart, Star,
    Music, Video, Type, Mic, Upload, CreditCard
} from "lucide-react";
import { DROTES_PATCH_ADDONS, AddonField, AddonCondition } from "@/lib/addonConfig";
import { useCurrency } from "@/lib/currency";
import FileUpload from "@/components/FileUpload";

interface ProductAddonPopupProps {
    onUpdate: (totalPrice: number, selections: Record<string, any>, readableSummary?: Record<string, string>) => void;
}

// Icon Mapping for Visual Flair
const ICON_MAP: Record<string, React.ReactNode> = {
    // Occasions
    "354gx": <Cake size={24} />,          // Birthday
    "hcti2": <Heart size={24} />,         // Anniversary
    "w35l1": <GraduationCap size={24} />, // Graduation
    "b6gl9": <MessageCircleHeart size={24} />, // Confessions
    "5358m": <Star size={24} />,          // Others

    // Types (Generic Mapping based on keywords if exact slug unknown, or mapped by slug)
    "bzv42": <Type size={20} />, // Text
    "otys3": <Music size={20} />, // Audio
    "ex5cr": <Video size={20} />, // Video
    "u8r0l": <Type size={20} />,
    "hqxxr": <Mic size={20} />,
    "mpjz8": <Video size={20} />,
    "8ejpf": <Type size={20} />,
    "9ufxi": <Mic size={20} />,
    "wfhva": <Upload size={20} />,
};

const STEP_TITLES = ["Select Occasion", "Choose Type", "Customize", "Review"];

export default function ProductAddonPopup({ onUpdate }: ProductAddonPopupProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selections, setSelections] = useState<Record<string, any>>({});
    const [addonPrice, setAddonPrice] = useState(0);
    const [step, setStep] = useState(0);
    // Store localized file data (preview URL + metadata)
    const [uploadedFile, setUploadedFile] = useState<{ url: string; name: string; type: string } | null>(null);
    const [isInfoOpen, setIsInfoOpen] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    const { formatAddonPrice } = useCurrency();

    // Calculate Price & Visibility
    const { total, visibleFields } = useMemo(() => {
        let t = 0;
        const visible: AddonField[] = [];

        // Helper to check visibility
        const isVisible = (field: AddonField): boolean => {
            // Hardcoded Fix: Always show Occasion (Start)
            if (field.id === "6967882222607") return true;

            if (!field.conditionals || field.conditionals.length === 0) return true;
            return field.conditionals.some(group => {
                return group.rules.every(rule => {
                    const val = selections[rule.field];
                    switch (rule.condition) {
                        case "==": return val === rule.value;
                        case "!=": return val !== rule.value;
                        case "!empty": return !!val && val !== "";
                        case "empty": return !val || val === "";
                        default: return false;
                    }
                });
            });
        };

        DROTES_PATCH_ADDONS.forEach(field => {
            if (field.type === "section" || field.type === "sectionend" || field.type === "p") return;
            if (!isVisible(field)) return;

            visible.push(field);
            const val = selections[field.id];
            if (val && field.choices) {
                const choice = field.choices.find(c => c.slug === val);
                if (choice) t += choice.pricing_amount;
            }
        });

        return { total: t, visibleFields: visible };
    }, [selections]);

    // Lift state up
    useEffect(() => {
        if (total !== addonPrice) setAddonPrice(total);

        // Use visible fields ONLY for summary to avoid stale data
        const summary: Record<string, string> = {};
        visibleFields.forEach(f => {
            const val = selections[f.id];
            if (!val) return;
            let label = val;
            if (f.choices) {
                const c = f.choices.find(ch => ch.slug === val);
                if (c) label = c.label.trim();
            }
            summary[f.label || "Custom"] = label;
        });

        onUpdate(total, selections, summary);
    }, [total, selections, visibleFields, addonPrice, onUpdate]);

    // Wizard Logic
    // Step 0: Occasion (Field ...607)
    // Step 1: Type (Field ...886 OR ...429 OR ...42b OR ...12b)
    // Step 2: Details (The rest)

    // We determine the "Active Field" based on visibility and step
    const getFieldsForStep = (stepIdx: number) => {
        if (stepIdx === 0) return visibleFields.filter(f => f.id === "6967882222607");

        // Occasion Value
        const occasion = selections["6967882222607"];
        if (!occasion) return [];

        if (stepIdx === 1) {
            // Return the Type field that corresponds to the selected occasion
            return visibleFields.filter(f =>
                ["6967882235886", "69678822bc429", "696788228542b", "69678822ce12b"].includes(f.id)
            );
        }

        if (stepIdx === 2) {
            // Return all other visible fields (Inputs, secondary radios)
            return visibleFields.filter(f =>
                !["6967882222607", "6967882235886", "69678822bc429", "696788228542b", "69678822ce12b"].includes(f.id)
            );
        }

        return [];
    };

    const currentStepFields = getFieldsForStep(step);

    // Auto-advance logic (Optional: can be annoying if user wants to change mind)
    // Let's stick to manual "Next" unless it's the very first selection
    const handleSelection = (fieldId: string, val: any) => {
        setSelections(prev => ({ ...prev, [fieldId]: val }));
    };

    // Navigation
    const canAccceed = () => {
        // Check if all fields in current step have a value (if required)
        const fields = getFieldsForStep(step);
        if (fields.length === 0 && step < 2) return false; // Should not happen if config is correct relative to Occasion

        return fields.every(f => {
            // Treat all as required for the flow logic, except specifically optional ones
            // In wizard flow, we usually want them to pick something before Next
            if (f.required === false) return true;
            return !!selections[f.id];
        });
    };

    const handleNext = () => {
        let nextStep = step + 1;

        // Skip Step 1 (Type) if no Type fields are visible (e.g. for "Others" or "Confessions")
        // This prevents showing an empty "Choose Type" screen
        if (nextStep === 1) {
            const typeFields = getFieldsForStep(1);
            if (typeFields.length === 0) {
                nextStep = 2;
            }
        }

        if (nextStep <= 3) setStep(nextStep);
        else setIsOpen(false); // Done
    };

    const handleBack = () => {
        if (step > 0) setStep(s => s - 1);
    };

    // Derived State for UI
    const triggerLabel = addonPrice > 0
        ? `Added (+${formatAddonPrice(addonPrice)})`
        : "Customize Drotes Patch";

    return (
        <>
            {/* Elegant Trigger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className={`group w-full relative overflow-hidden rounded-sm border py-4 transition-all duration-300
                    ${addonPrice > 0
                        ? "border-[#1a472a] bg-[#1a472a] text-white"
                        : "border-neutral-200 bg-white text-black hover:border-[#1a472a] hover:text-white"
                    }
                `}
            >
                <div className="relative z-10 flex items-center justify-between px-6">
                    <span className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                        {addonPrice > 0 ? <Check size={14} /> : <CreditCard size={14} />}
                        {addonPrice > 0 ? "Patch Personalized" : "Personalize Patch"}
                        {addonPrice === 0 && <span className="text-[10px] font-medium normal-case tracking-normal text-neutral-400">(optional)</span>}
                    </span>
                    <span className="text-xs font-bold">
                        {addonPrice > 0 ? `+${formatAddonPrice(addonPrice)}` : "Start"}
                    </span>
                </div>
                {/* Hover Fill Effect - Forest Green */}
                {addonPrice === 0 && (
                    <div className="absolute inset-0 bg-[#1a472a] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500 ease-out z-0" />
                )}
            </button>

            {/* Full Screen / Large Modal */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-neutral-900/40 backdrop-blur-md"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[85vh] md:h-[600px]"
                        >
                            {/* Left Panel: Sidebar / Context */}
                            <div className="w-full md:w-1/3 bg-neutral-50 p-8 flex flex-col justify-between border-r border-neutral-100">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <h2 className="text-2xl font-black uppercase tracking-tighter">Customize</h2>
                                        <button
                                            onClick={() => setIsInfoOpen(true)}
                                            className="w-8 h-8 rounded-full flex items-center justify-center bg-white border border-neutral-200 text-neutral-400 hover:text-[#1a472a] hover:border-[#1a472a] transition-all"
                                            title="What is this?"
                                        >
                                            <Info size={16} />
                                        </button>
                                    </div>
                                    <p className="text-xs text-neutral-500 font-medium leading-relaxed mb-8">
                                        Make it unique. Add memories, songs, or messages to your Drotes Patch.
                                    </p>

                                    {/* Steps Indicator */}
                                    <div className="space-y-4">
                                        {STEP_TITLES.slice(0, 3).map((title, idx) => (
                                            <div key={idx} className={`flex items-center gap-3 ${idx === step ? "opacity-100" : "opacity-30"}`}>
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border ${idx === step ? "border-[#1a472a] bg-[#1a472a] text-white" : "border-neutral-300"}`}>
                                                    {idx + 1}
                                                </div>
                                                <span className="text-xs font-bold uppercase tracking-widest">{title}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Live Price */}
                                <div className="mt-auto pt-8 border-t border-neutral-200">
                                    <span className="text-[10px] text-neutral-400 uppercase tracking-widest block mb-1">Total Extra</span>
                                    <div className="text-3xl font-black tracking-tighter">
                                        {formatAddonPrice(addonPrice)}
                                    </div>
                                </div>
                            </div>

                            {/* Right Panel: Content Area */}
                            <div className="flex-1 p-8 md:p-12 flex flex-col relative overflow-hidden">
                                {/* Close Button */}
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="absolute top-6 right-6 p-2 hover:bg-neutral-100 rounded-full transition-colors z-20"
                                >
                                    <X size={20} />
                                </button>

                                {/* Dynamic Content Stage */}
                                <div className="flex-1 overflow-y-auto custom-scrollbar pt-4 pb-20">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={step}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.3 }}
                                            className="space-y-8"
                                        >
                                            <h3 className="text-xl font-bold uppercase tracking-wide mb-6">
                                                {step === 0 && "What's the Occasion?"}
                                                {step === 1 && "Choose Your Style"}
                                                {step === 2 && "Add the Details"}
                                                {step === 3 && "Review"}
                                            </h3>

                                            {step === 3 && (
                                                <div className="flex flex-col items-center justify-center py-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                    {/* Engaging Success Card */}
                                                    <div className="bg-white border border-neutral-100 shadow-xl rounded-2xl p-8 w-full max-w-sm text-center relative overflow-hidden">
                                                        {/* Green Glow Backlight */}
                                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-green-100 blur-[60px] rounded-full z-0" />

                                                        <div className="relative z-10">
                                                            <div className="w-16 h-16 mx-auto bg-[#1a472a] rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-900/20">
                                                                <Check className="text-white" size={32} strokeWidth={3} />
                                                            </div>
                                                            <h4 className="text-2xl font-black uppercase tracking-tight mb-2">All Set!</h4>
                                                            <p className="text-neutral-500 text-sm mb-6">
                                                                Your personal touch has been added.
                                                            </p>

                                                            {/* Receipt Summary */}
                                                            <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100 text-left space-y-3">
                                                                {DROTES_PATCH_ADDONS.map(field => {
                                                                    if (!selections[field.id]) return null;
                                                                    if (field.type === "section" || field.type === "sectionend" || field.type === "p") return null;

                                                                    let displayVal = selections[field.id];
                                                                    if (field.choices) {
                                                                        const c = field.choices.find(x => x.slug === displayVal);
                                                                        if (c) displayVal = c.label;
                                                                    }

                                                                    return (
                                                                        <div key={field.id} className="flex justify-between items-start text-xs">
                                                                            <span className="text-neutral-400 font-medium uppercase tracking-wider">{field.label}</span>
                                                                            <span className="font-bold text-black max-w-[60%] text-right">{displayVal}</span>
                                                                        </div>
                                                                    )
                                                                })}
                                                                <div className="h-px bg-neutral-200 my-2" />
                                                                <div className="flex justify-between items-center text-sm pt-1">
                                                                    <span className="font-bold text-neutral-900">Total Extra</span>
                                                                    <span className="font-black text-[#1a472a]">{formatAddonPrice(addonPrice)}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Fallback for Step 2 if no fields are visible (e.g. choice has no extra params) */}
                                            {step === 2 && currentStepFields.length === 0 && (
                                                <div className="text-center py-12 text-neutral-400 animate-in fade-in zoom-in duration-300">
                                                    <Check size={48} className="mx-auto mb-4 opacity-50" />
                                                    <p>No additional details needed for this selection.</p>
                                                    <p className="text-xs mt-2">Click Next to review.</p>
                                                </div>
                                            )}

                                            {currentStepFields.map(field => {
                                                // Specific Instruction Field (Email Info)
                                                if (field.id === "696788225fdd1") {
                                                    // Check if Customer Uploaded option is selected
                                                    const isCustomerUpload = selections["696788226f7a5"] === "4pvdw";

                                                    return (
                                                        <div key={field.id} className="space-y-6">
                                                            {/* File Upload Zone - Only for Customer Uploaded */}
                                                            {isCustomerUpload && (
                                                                <div className="animate-in fade-in slide-in-from-bottom-2">
                                                                    <h4 className="font-bold uppercase tracking-widest text-xs mb-4 text-neutral-600">Upload Your File</h4>
                                                                    <FileUpload
                                                                        onUploadComplete={(base64, publicId, name) => {
                                                                            // create object URL for preview only
                                                                            // Note: base64 is passed up, but for local preview we use the helper from FileUpload or just assume valid state
                                                                            // Actually FileUpload passes base64 as 'url' param in our new implementation
                                                                            // But for preview state in this component, we can assume success

                                                                            // We need to store the base64, name, type, size in the selections for later
                                                                            // For preview, we'll keep using the state
                                                                            setUploadedFile({ url: '', name, type: '' }); // URL not needed for state logic here really, FileUpload handles preview

                                                                            handleSelection('customer_file_base64', base64);
                                                                            handleSelection('customer_file_name', name);
                                                                            // We don't have direct access to type/size here unless we change callback signature, 
                                                                            // but FileUpload handles the conversion. 
                                                                            // We'll update FileUpload signature to pass file object or more details if needed, 
                                                                            // but for now base64 + name is enough to recreate blob.
                                                                        }}
                                                                        onUploadRemove={() => {
                                                                            setUploadedFile(null);
                                                                            handleSelection('customer_file_base64', '');
                                                                            handleSelection('customer_file_name', '');
                                                                        }}
                                                                        currentFile={uploadedFile ? { url: uploadedFile.url, name: uploadedFile.name } : null}
                                                                    />
                                                                </div>
                                                            )}

                                                            {/* Email Instructions */}
                                                            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6 text-center animate-in fade-in slide-in-from-bottom-2">
                                                                <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4">
                                                                    <CreditCard size={20} />
                                                                </div>
                                                                <h4 className="font-bold uppercase tracking-widest text-sm mb-2">Email Instructions</h4>
                                                                <div className="bg-white border border-neutral-200 rounded p-3 mb-4 inline-block">
                                                                    <code className="text-sm font-bold text-[#1a472a]">custom@drotes.com</code>
                                                                </div>
                                                                <p className="text-sm text-neutral-600 leading-relaxed max-w-sm mx-auto">
                                                                    After completing your purchase, please email us all your customization details — including your <strong>ORDER NUMBER</strong> — to <span className="font-bold">custom@drotes.com</span>.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    );
                                                }

                                                // Grid Layout for Radio Buttons (Occasion/Type)
                                                if (field.type === "radio" || field.type === "text-swatch") {
                                                    const isOccasion = field.id === "6967882222607";

                                                    return (
                                                        <div key={field.id} className={`grid ${isOccasion ? "grid-cols-2 gap-4" : "grid-cols-1 gap-3"}`}>
                                                            {field.choices?.map(choice => {
                                                                const isSelected = selections[field.id] === choice.slug;
                                                                return (
                                                                    <button
                                                                        key={choice.slug}
                                                                        onClick={() => handleSelection(field.id, choice.slug)}
                                                                        className={`relative p-4 rounded-lg border text-left transition-all duration-200 group
                                                                            ${isSelected
                                                                                ? "border-[#1a472a] bg-neutral-50 ring-1 ring-[#1a472a] shadow-none"
                                                                                : "border-neutral-200 hover:border-neutral-400 hover:shadow-sm"
                                                                            }
                                                                        `}
                                                                    >
                                                                        <div className="flex items-start justify-between mb-2">
                                                                            {ICON_MAP[choice.slug] && (
                                                                                <span className={`${isSelected ? "text-[#1a472a]" : "text-neutral-400 group-hover:text-black"}`}>
                                                                                    {ICON_MAP[choice.slug]}
                                                                                </span>
                                                                            )}
                                                                            {/* Checkmark for active */}
                                                                            {isSelected && <div className="bg-[#1a472a] text-white rounded-full p-0.5"><Check size={10} /></div>}
                                                                        </div>

                                                                        <span className="block text-sm font-bold uppercase tracking-tight mb-1">
                                                                            {choice.label}
                                                                        </span>

                                                                        {choice.pricing_amount > 0 && (
                                                                            <span className="text-xs font-semibold text-neutral-500">
                                                                                +{formatAddonPrice(choice.pricing_amount)}
                                                                            </span>
                                                                        )}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    )
                                                }

                                                // Clean Inputs
                                                if (field.type === "text" || field.type === "textarea") {
                                                    return (
                                                        <div key={field.id} className="space-y-2">
                                                            <label className="text-xs font-bold uppercase tracking-widest">{field.label}</label>
                                                            {field.type === "textarea" ? (
                                                                <textarea
                                                                    value={selections[field.id] || ""}
                                                                    onChange={e => handleSelection(field.id, e.target.value)}
                                                                    placeholder={field.placeholder}
                                                                    className="w-full p-4 border border-neutral-200 rounded-lg focus:border-[#1a472a] focus:ring-1 focus:ring-[#1a472a] outline-none transition-all min-h-[140px] text-sm leading-relaxed"
                                                                />
                                                            ) : (
                                                                <input
                                                                    type="text"
                                                                    value={selections[field.id] || ""}
                                                                    onChange={e => handleSelection(field.id, e.target.value)}
                                                                    placeholder={field.placeholder}
                                                                    className="w-full p-4 border border-neutral-200 rounded-lg focus:border-[#1a472a] focus:ring-1 focus:ring-[#1a472a] outline-none transition-all text-sm"
                                                                />
                                                            )}
                                                            {field.description && <p className="text-xs text-neutral-400">{field.description}</p>}
                                                        </div>
                                                    )
                                                }
                                                return null;
                                            })}
                                        </motion.div>
                                    </AnimatePresence>
                                </div>

                                {/* Footer Navigation */}
                                <div className="absolute bottom-0 left-0 right-0 p-8 bg-white border-t border-neutral-100 flex items-center justify-between z-20">
                                    <button
                                        onClick={handleBack}
                                        disabled={step === 0}
                                        className="text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-black disabled:opacity-0 transition-all flex items-center gap-2"
                                    >
                                        <ChevronLeft size={14} /> Back
                                    </button>

                                    {step === 3 ? (
                                        <button
                                            onClick={() => setIsOpen(false)}
                                            className="px-8 py-3 bg-[#1a472a] text-white text-xs font-bold uppercase tracking-widest rounded-full hover:scale-105 active:scale-95 transition-all shadow-xl shadow-green-900/20"
                                        >
                                            Confirm & Close
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleNext}
                                            disabled={!canAccceed()}
                                            className="px-8 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-full hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
                                        >
                                            {step === 2 ? "Review" : "Next"} <ChevronRight size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Personalized Patch Info Modal */}
            <AnimatePresence>
                {isInfoOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsInfoOpen(false)}
                            className="absolute inset-0 bg-neutral-900/60 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden p-8 md:p-12"
                        >
                            <button
                                onClick={() => setIsInfoOpen(false)}
                                className="absolute top-6 right-6 p-2 hover:bg-neutral-100 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <div className="space-y-6">
                                <div className="w-16 h-16 bg-[#1a472a]/10 rounded-2xl flex items-center justify-center text-[#1a472a] mb-2">
                                    <Info size={32} />
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black uppercase tracking-tighter">What is Personalized Patch?</h3>
                                    <p className="text-sm text-neutral-500 font-medium leading-relaxed">
                                        Our Drotes Rubber Patches are more than just accessories—they are interactive storytelling portals.
                                    </p>
                                </div>

                                <div className="p-6 bg-neutral-50 rounded-2xl border border-neutral-100 space-y-4">
                                    <p className="text-sm text-neutral-600 leading-relaxed font-medium">
                                        When you customize a patch, we embed digital content (songs, personal videos, or emotional notes) that can be accessed by anyone who scans the physical patch.
                                    </p>

                                    <div className="grid grid-cols-1 gap-3 pt-2">
                                        <div className="flex items-start gap-3">
                                            <div className="w-5 h-5 rounded-full bg-[#1a472a] flex items-center justify-center shrink-0 mt-0.5">
                                                <Check size={12} className="text-white" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-widest text-black">Gifting</p>
                                                <p className="text-[11px] text-neutral-500 font-medium">Perfect for birthdays or anniversaries.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-5 h-5 rounded-full bg-[#1a472a] flex items-center justify-center shrink-0 mt-0.5">
                                                <Check size={12} className="text-white" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-widest text-black">Exclusive Content</p>
                                                <p className="text-[11px] text-neutral-500 font-medium">Unlock team-made surprises.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 flex flex-col items-center gap-4">
                                    <a
                                        href="https://patch.drotes.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full py-4 bg-black text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-full text-center hover:scale-105 transition-transform shadow-xl"
                                    >
                                        Learn more at patch.drotes.com
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
