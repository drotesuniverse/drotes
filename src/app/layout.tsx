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
import Script from "next/script"; // <-- ADD THIS IMPORT

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
            <head>
                {/* Meta Pixel Code */}
                <noscript>
                    <img height="1" width="1" style={{ display: "none" }}
                        src="https://www.facebook.com/tr?id=1473126554430964&ev=PageView&noscript=1"
                    />
                </noscript>
            </head>
            <ReactLenis root>
                <body suppressHydrationWarning style={{ zoom: "90%" }}>
                    {/* Meta Pixel Script */}
                    <Script id="meta-pixel" strategy="afterInteractive">
                        {`
                            !function(f,b,e,v,n,t,s)
                            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                            n.queue=[];t=b.createElement(e);t.async=!0;
                            t.src=v;s=b.getElementsByTagName(e)[0];
                            s.parentNode.insertBefore(t,s)}(window, document,'script',
                            'https://connect.facebook.net/en_US/fbevents.js');
                            fbq('init', '1473126554430964');
                            fbq('track', 'PageView');
                        `}
                    </Script>

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
