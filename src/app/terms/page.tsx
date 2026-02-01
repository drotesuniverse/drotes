"use client";
import React from "react";
import LegalPageLayout, { LegalSection } from "@/components/LegalPageLayout";
import { ShieldCheck, Lock, Globe, Copyright } from "lucide-react";

export default function TermsPage() {
    return (
        <LegalPageLayout
            title="Terms"
            subtitle="Understand our service conditions."
            lastUpdated="Feb 2026"
        >
            <LegalSection title="General" icon={Globe}>
                <p>
                    The following terms apply to all orders placed by the customer via the Drotes website.
                    By placing an order, you agree to be bound by the terms set out below.
                </p>
                <p>
                    The inclusion of any products or services on this site at a particular time does not guarantee
                    that these products or services will be available at all times. We reserve the right to
                    discontinue any product at any time.
                </p>
            </LegalSection>

            <LegalSection title="Use of Service" icon={ShieldCheck}>
                <p>
                    To ensure the best possible experience, you agree not to:
                </p>
                <ul className="list-disc pl-5 space-y-2 mt-2">
                    <li>Post or transmit content that may harm our brand or users.</li>
                    <li>Use any device or software that interferes with the site’s functioning.</li>
                    <li>Use automated systems (bots, scrapers) to access content.</li>
                </ul>
                <p className="mt-4">
                    We reserve the right to restrict access or terminate accounts found in violation
                    of these provisions.
                </p>
            </LegalSection>

            <LegalSection title="Intellectual Property" icon={Copyright}>
                <p>
                    All content on this site, including images, videos, product descriptions, logos,
                    and layout, is the property of Drotes or its licensors.
                </p>
                <p>
                    Any use of this content—including copying, reproduction, distribution, or storage,
                    other than for personal, non-commercial use—is prohibited without prior written permission.
                </p>
            </LegalSection>

            <LegalSection title="Prices and Taxes" icon={Lock}>
                <p>
                    All prices displayed include applicable taxes unless otherwise stated.
                    Shipping charges will be added during checkout based on your location.
                </p>
                <p className="border-l-2 border-neutral-200 pl-4 py-1 my-4 bg-neutral-50 rounded-r-lg">
                    <strong>International Customers:</strong> Customs duties and import taxes may apply based on your
                    country’s regulations. These charges are the customer’s responsibility.
                </p>
            </LegalSection>

            <LegalSection title="Disclaimer" icon={AlertCircle}>
                <p>
                    While we strive to ensure all content on our site is accurate and up to date,
                    we make no guarantees as to its completeness or accuracy.
                </p>
                <p>
                    Drotes is not liable for any direct or indirect damages that may result from the use of,
                    or reliance on, the information provided.
                </p>
            </LegalSection>

        </LegalPageLayout>
    );
}

// Helper for icon consistency
function AlertCircle({ size, className }: any) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
    );
}
