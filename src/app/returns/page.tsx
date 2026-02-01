"use client";
import React from "react";
import LegalPageLayout, { LegalSection } from "@/components/LegalPageLayout";
import { MoveLeft, HelpCircle, PackageX, CheckCircle, RefreshCcw } from "lucide-react";

export default function ReturnsPage() {
    return (
        <LegalPageLayout
            title="Returns"
            subtitle="Hassle-free process, global support."
            lastUpdated="Feb 2026"
        >
            <div className="bg-neutral-50 p-6 rounded-2xl text-center border border-neutral-100">
                <RefreshCcw className="mx-auto mb-4 text-neutral-400" size={32} />
                <p className="text-neutral-600 max-w-lg mx-auto leading-relaxed">
                    We want you to be fully satisfied. If something isn’t right,
                    we accept returns on eligible items within <strong>7 days</strong> of delivery.
                </p>
            </div>

            <LegalSection title="Conditions" icon={CheckCircle}>
                <ul className="space-y-3">
                    <ListItem text="Items must be unworn, unwashed, and in original condition." />
                    <ListItem text="Original tags must still be attached." />
                    <ListItem text="Items must be returned in their original packaging." />
                </ul>
                <p className="text-xs text-neutral-400 mt-4 italic">
                    We reserve the right to reject returns that show signs of wear.
                </p>
            </LegalSection>

            <LegalSection title="Non-Returnable" icon={PackageX}>
                <div className="grid grid-cols-2 gap-4">
                    <Badge text="Final Sale Items" />
                    <Badge text="Underwear / Socks" />
                    <Badge text="Gift Cards" />
                    <Badge text="Limited Editions" />
                </div>
            </LegalSection>

            <LegalSection title="How to Return" icon={MoveLeft}>
                <ol className="list-decimal pl-5 space-y-4 marker:font-bold marker:text-neutral-300">
                    <li>
                        <strong>Initiate:</strong> Email our support team with your order number and reason for return.
                    </li>
                    <li>
                        <strong>Approve:</strong> If eligible, we’ll send you detailed return instructions and the nearest return address.
                    </li>
                    <li>
                        <strong>Refund:</strong> Once received and inspected, we’ll process your refund (minus shipping) to your original payment method within 10 business days.
                    </li>
                </ol>
            </LegalSection>

            <LegalSection title="Faulty Items" icon={HelpCircle}>
                <p>
                    If you receive a damaged or incorrect item, please contact us within 48 hours of delivery.
                    We’ll sort it out immediately at no extra cost to you.
                </p>
            </LegalSection>

        </LegalPageLayout>
    );
}

function ListItem({ text }: { text: string }) {
    return (
        <li className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-neutral-300 mt-2 shrink-0" />
            <span className="text-neutral-600">{text}</span>
        </li>
    );
}

function Badge({ text }: { text: string }) {
    return (
        <div className="bg-neutral-50 border border-neutral-100 text-neutral-500 px-4 py-3 rounded-lg text-sm text-center">
            {text}
        </div>
    );
}
