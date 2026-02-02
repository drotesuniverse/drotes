"use client";
import React from "react";
import LegalPageLayout, { LegalSection } from "@/components/LegalPageLayout";
import { Lock, Eye, Cookie, Shield, UserCheck } from "lucide-react";

export default function PrivacyPage() {
    return (
        <LegalPageLayout
            title="Privacy"
            subtitle="Your data, protected and respected."
            lastUpdated="Feb 2026"
        >
            <LegalSection title="Commitment" icon={Shield}>
                <p>
                    Drotes is committed to protecting your privacy and ensuring your personal information is handled responsibly.
                    This policy explains how we collect, use, and protect your data when you interact with our platform.
                </p>
            </LegalSection>

            <LegalSection title="What We Collect" icon={Eye}>
                <p>
                    When you visit or make a purchase, we may collect the following information to improve your experience:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="bg-neutral-50 p-4 rounded-xl text-sm">
                        <strong>Personal Details</strong>
                        <p className="text-neutral-500 mt-1">Name, email, shipping address.</p>
                    </div>
                    <div className="bg-neutral-50 p-4 rounded-xl text-sm">
                        <strong>Usage Data</strong>
                        <p className="text-neutral-500 mt-1">Device type, browser, site interactions.</p>
                    </div>
                </div>
            </LegalSection>

            <LegalSection title="Usage" icon={UserCheck}>
                <p>
                    We use your information primarily to process orders, communicate updates, and prevent fraud.
                </p>
                <p>
                    <strong>Third-Party Services:</strong> We work with trusted partners (e.g., payment gateways, logistics)
                    who only access data necessary to perform their functions. They are obligated to protect your information.
                </p>
            </LegalSection>

            <LegalSection title="Cookies" icon={Cookie}>
                <p>
                    We use cookies and similar technologies to improve site functionality and personalize your experience.
                    You can disable cookies through your browser settings, though this may affect site performance.
                </p>
            </LegalSection>

            <LegalSection title="Your Rights" icon={Lock}>
                <p>
                    You have the right to access the personal data we hold about you, request corrections, or ask for deletion
                    (subject to legal retention requirements). To exercise any of these rights, please contact our support team.
                </p>
                <div className="mt-4 p-4 bg-neutral-50 border-l-2 border-black text-sm italic text-neutral-600">
                    "By using our services, you agree to the transfer and processing of your personal data
                    in accordance with this policy."
                </div>
            </LegalSection>

        </LegalPageLayout>
    );
}
