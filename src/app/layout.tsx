"use client";

import { Geist, Geist_Mono, Poppins } from "next/font/google";
import "./globals.css";
import { ReactLenis } from "lenis/react";
import { CurrencyProvider } from "@/lib/currency";
import { ApolloProvider } from "@apollo/client";
import { client } from "@/lib/apollo";
import PopupManager from "@/components/PopupManager";
import MembersGuard from "@/components/MembersGuard";
import LiveTracker from "@/components/LiveTracker";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

const poppins = Poppins({
    variable: "--font-poppins",
    subsets: ["latin"],
    weight: ["400", "700", "900"],
});

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} antialiased`} suppressHydrationWarning>
            <ReactLenis root>
                <body suppressHydrationWarning style={{ zoom: "90%" }}>
                    <ApolloProvider client={client}>
                        <CurrencyProvider>
                            <PopupManager />
                            <LiveTracker />
                            <MembersGuard>
                                {children}
                            </MembersGuard>
                        </CurrencyProvider>
                    </ApolloProvider>
                </body>
            </ReactLenis>
        </html>
    );
}
