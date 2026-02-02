import { motion } from "framer-motion";
import { ShoppingBag, Eye, CreditCard, CheckCircle2, Globe, Clock, MapPin } from "lucide-react";
import clsx from "clsx";

interface ActivityItemProps {
    action: 'view' | 'cart' | 'checkout' | 'complete';
    path: string;
    city?: string;
    country?: string;
    ago: number; // seconds ago
}

export default function ActivityItem({ item }: { item: ActivityItemProps }) {
    const getIcon = () => {
        switch (item.action) {
            case 'view': return <Eye size={16} className="text-neutral-500" />;
            case 'cart': return <ShoppingBag size={16} className="text-blue-500" />;
            case 'checkout': return <CreditCard size={16} className="text-amber-500" />;
            case 'complete': return <CheckCircle2 size={16} className="text-green-500" />;
        }
    };

    const getBgColor = () => {
        switch (item.action) {
            case 'view': return "bg-neutral-100";
            case 'cart': return "bg-blue-50";
            case 'checkout': return "bg-amber-50";
            case 'complete': return "bg-green-50";
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20, height: 0 }}
            animate={{ opacity: 1, x: 0, height: 'auto' }}
            exit={{ opacity: 0, x: 20, height: 0 }}
            className="flex items-center gap-3 py-3 border-b border-neutral-100 last:border-0 group hover:bg-neutral-50/50 rounded-lg px-2 transition-colors -mx-2"
        >
            <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center shrink-0 border border-white shadow-sm", getBgColor())}>
                {getIcon()}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-neutral-900 truncate pr-2">
                        {item.path === '/' ? 'Home' : item.path}
                    </div>
                    <span className="text-xs text-neutral-400 font-mono whitespace-nowrap tabular-nums">
                        {item.ago < 60 ? `${item.ago}s` : `${Math.floor(item.ago / 60)}m`}
                    </span>
                </div>

                <div className="flex items-center gap-2 mt-0.5">
                    {item.city && (
                        <div className="flex items-center gap-1 text-xs text-neutral-500">
                            <MapPin size={10} />
                            <span>{item.city}, {item.country}</span>
                        </div>
                    )}
                    {!item.city && (
                        <span className="text-xs text-neutral-400 capitalize">{item.action}</span>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
