"use client";
import React from "react";
import LegalPageLayout, { LegalSection } from "@/components/LegalPageLayout";
import { Truck, Clock, Globe, AlertCircle, Mail, DollarSign } from "lucide-react";

export default function ShippingPage() {
    return (
        <LegalPageLayout
            title="Shipping"
            subtitle="Global delivery from our cloud base."
            lastUpdated="Feb 2026"
        >
            <div className="bg-neutral-50 p-6 rounded-2xl text-sm text-neutral-500 mb-8 border border-neutral-100">
                <p>
                    We ship worldwide. Once your order is placed, you’ll receive a confirmation email,
                    followed by tracking details as soon as your order leaves our warehouse.
                </p>
            </div>

            <LegalSection title="Processing" icon={Clock}>
                <p>
                    All orders are processed within 1–3 business days. During launches, drops, or sale periods,
                    processing may take slightly longer due to high volume.
                </p>
            </LegalSection>

            <LegalSection title="Shipping Times" icon={Truck}>
                <p>Estimated delivery times from dispatch:</p>
                <ul className="list-disc pl-5 space-y-2 mt-2">
                    <li><strong>Domestic (Regional):</strong> 1–3 business days</li>
                    <li><strong>GCC / Middle East:</strong> 3–7 business days</li>
                    <li><strong>International:</strong> 5–12 business days</li>
                </ul>
                <p className="text-xs text-neutral-400 mt-4">
                    *Delivery times may vary depending on location, customs clearance, and courier delays.
                </p>
            </LegalSection>

            <LegalSection title="Costs" icon={DollarSign}>
                <p>
                    Shipping rates are calculated dynamically at checkout based on your location and order weight.
                    Free shipping options may be available for qualifying orders.
                </p>
            </LegalSection>

            <LegalSection title="Customs & Duties" icon={Globe}>
                <p>
                    International orders may be subject to local duties or taxes upon arrival. These charges are determined by your
                    local customs authority and are the sole responsibility of the customer.
                </p>
                <div className="bg-red-50 text-red-600/80 p-4 rounded-xl text-xs mt-4 flex gap-3 items-start">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <p>
                        If customs fees are declined, the parcel may be returned or destroyed.
                        We are not responsible for packages abandoned due to unpaid duties.
                    </p>
                </div>
            </LegalSection>

            <LegalSection title="Tracking" icon={Mail}>
                <p>
                    Once shipped, you’ll receive a tracking link via email. If you haven’t received tracking information
                    after 3 business days, please contact our support team.
                </p>
                <p>
                    <strong>Undeliverable Packages:</strong> If a package is returned due to an incorrect address, refusal,
                    or unpaid duties, original shipping fees are non-refundable. Re-delivery will incur an additional charge.
                </p>
            </LegalSection>

        </LegalPageLayout>
    );
}
