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
        if (!isLoaded) return;

        const hasAuth = document.cookie
            .split("; ")
            .some(row => row.startsWith("members_access=") || row.startsWith("auth_token="));

        const isAdmin = pathname.startsWith("/miniadmin");

        const isMembersPage = pathname === "/members-only";
        const isApi = pathname.startsWith("/api");

        if (settings?.membersOnly?.enabled) {
            // SITE LOCKED
            if (!hasAuth && !isAdmin && !isMembersPage && !isApi) {
                router.replace("/members-only"); // replace prevents history loops
                return;
            }
        }

        setAuthorized(true);
    }, [isLoaded, settings?.membersOnly?.enabled, pathname, router]);

    if (!isLoaded) return null;

    // Prevent flashing protected content
    if (settings?.membersOnly?.enabled && !authorized && pathname !== "/members-only") {
        return null;
    }

    return <>{children}</>;
}