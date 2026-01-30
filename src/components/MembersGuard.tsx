"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAdminSettings } from "@/hooks/useAdminSettings";

export default function MembersGuard({ children }: { children: React.ReactNode }) {
    const { settings, isLoaded } = useAdminSettings();
    const router = useRouter();
    const pathname = usePathname();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        // Allow hydration first
        if (!isLoaded) return;

        // Check for Admin Override OR Logged In User Cookie
        // Note: For real security this should be server-side middleware.
        const hasAuth = document.cookie.split('; ').some(row => row.startsWith('members_access=') || row.startsWith('auth_token='));
        const isAdmin = window.location.pathname.startsWith('/miniadmin'); // Simple check to allow admin access

        // Define public routes (Members Page, API)
        const isPublic = pathname === "/members-only" || pathname.startsWith("/api");

        if (settings.membersOnly?.enabled) {
            // LOCK ACTIVE
            if (!hasAuth && !isAdmin && !isPublic) {
                router.push("/members-only");
            } else {
                setAuthorized(true);
            }
        } else {
            // LOCK INACTIVE
            // If user stays on members-only when disabled, redirect home
            if (pathname === "/members-only") {
                router.push("/");
            } else {
                setAuthorized(true);
            }
        }
    }, [isLoaded, settings.membersOnly?.enabled, pathname, router]);

    // Show nothing while checking (or a loader) to prevent content flash
    if (!isLoaded) return null; // Or a global loader

    // If lock is enabled and we are not authorized yet (calculating), show nothing
    // if (settings.membersOnly?.enabled && !authorized && pathname !== "/members-only") return null;

    return <>{children}</>;
}
