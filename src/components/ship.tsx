"use client";
import React, { useState } from 'react';
import { ShieldCheck, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdminSettings } from '@/hooks/useAdminSettings';
import { useCurrency } from '@/lib/currency';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CART, ADD_TO_CART, REMOVE_CART_ITEM } from '@/lib/queries';

interface ShippingGuaranteeProps {
  className?: string;
  variant?: 'minimal' | 'full';
}

export default function ShippingGuarantee({ className = "", variant = 'minimal' }: ShippingGuaranteeProps) {
  // 0. Basic hooks — MUST run on every render
  const { settings, isLoaded } = useAdminSettings() as { settings?: any; isLoaded?: boolean };
  const { formatAddonPrice } = useCurrency();
  const [isHovered, setIsHovered] = useState(false);

  // 1. Cart Data — unconditional so hook order stays stable
  const { data: cartData, loading: cartLoading, refetch } = useQuery(GET_CART, {
    fetchPolicy: "cache-and-network"
  });

  // 2. Mutations — also unconditional
  const [addToCart, { loading: adding }] = useMutation(ADD_TO_CART, {
    onCompleted: () => { refetch(); window.dispatchEvent(new Event('cart-updated')); },
    onError: (err) => console.error("Failed to add protection", err)
  });
  const [removeFromCart, { loading: removing }] = useMutation(REMOVE_CART_ITEM, {
    onCompleted: () => { refetch(); window.dispatchEvent(new Event('cart-updated')); },
    onError: (err) => console.error("Failed to remove protection", err)
  });

  // 3. Wait until settings are loaded before showing the real UI to avoid flicker.
  // If the hook provides `isLoaded` use it; otherwise fall back to checking settings presence.
  const ready = typeof isLoaded === 'boolean' ? isLoaded : Boolean(settings);
  if (!ready) {
    // Skeleton placeholder keeps layout stable and prevents the brief show-then-hide flash
    return (
      <div className={`h-[64px] w-full rounded-xl bg-neutral-100 animate-pulse ${className}`} />
    );
  }

  // 4. Safe access to config after ready
  const config = settings?.shippingGuarantee;
  if (!config?.enabled) return null;

  const PROTECTION_ID = String(config?.productId ?? "99999");
  const priceValue = config?.price ?? 25;
  const PRICE_DISPLAY = formatAddonPrice(priceValue);

  // 5. Find in Cart
  const items = cartData?.cart?.contents?.nodes || [];
  const existingItem = items.find((item: any) =>
    String(item.product?.node?.databaseId) === PROTECTION_ID ||
    String(item.product?.node?.id) === PROTECTION_ID
  );
  const isProtected = !!existingItem;

  const isLoading = adding || removing || cartLoading;

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLoading) return;

    if (isProtected) {
      await removeFromCart({ variables: { keys: [existingItem.key] } });
    } else {
      await addToCart({
        variables: {
          productId: parseInt(PROTECTION_ID, 10),
          quantity: 1
        }
      });
    }
  };

  if (!settings?.shippingGuarantee?.enabled) {
  return null;
}

//   if (!isLoaded) {
//   return (
//     <div className="h-[64px] w-full rounded-xl bg-neutral-100 animate-pulse" />
//   );
// }

  return (
    <motion.div
      layout
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleToggle}
      className={`
        relative flex items-center gap-3 py-3 px-4 rounded-xl border cursor-pointer select-none transition-all duration-300
        ${isProtected
          ? "bg-[#1b4d3e]/5 border-[#1b4d3e]/20 hover:bg-[#1b4d3e]/10"
          : "bg-white border-neutral-200 hover:border-black/20 hover:bg-neutral-50"
        }
        ${className}
      `}
    >
      {/* Toggle Switch Visual */}
      <div className={`
        flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-300
        ${isProtected ? "bg-[#1b4d3e] border-[#1b4d3e]" : "bg-white border-neutral-300"}
      `}>
        <AnimatePresence mode='wait'>
          {isLoading ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Loader2 size={10} className={`animate-spin ${isProtected ? "text-white" : "text-black"}`} />
            </motion.div>
          ) : isProtected ? (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <Check size={12} strokeWidth={3} className="text-white" />
            </motion.div>
          ) : (
            <motion.div className="w-full h-full rounded-full" />
          )}
        </AnimatePresence>
      </div>

      {/* Icon */}
      <div className="relative">
        <ShieldCheck
          size={variant === 'full' ? 20 : 18}
          strokeWidth={1.5}
          className={`transition-colors duration-300 ${isProtected ? "text-[#1b4d3e]" : "text-neutral-400 group-hover:text-black"}`}
        />
        {!isProtected && !isLoading && (
          <span className="absolute inset-0 rounded-full bg-black/10 animate-ping opacity-20" />
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1">
        <div className="flex justify-between items-center w-full">
          <span className={`font-bold uppercase tracking-wider transition-colors duration-300 ${variant === 'full' ? 'text-xs' : 'text-[10px]'} ${isProtected ? "text-[#1b4d3e]" : "text-black"}`}>
            Shipping Protection
          </span>
          <span className={`text-[10px] font-mono font-bold transition-colors ${isProtected ? "text-[#1b4d3e]" : "text-neutral-500"}`}>
            +{PRICE_DISPLAY}
          </span>
        </div>
        {variant === 'full' && (
          <span className="text-[10px] text-neutral-400 font-medium mt-0.5 leading-tight">
            {isProtected ? "Your order is fully protected against loss & damage." : "Protect your order against loss or damage."}
          </span>
        )}
      </div>

      {/* Success Glow Ring */}
      {isProtected && (
        <motion.div
          layoutId="glow"
          className="absolute inset-0 rounded-xl border-2 border-[#1b4d3e]/10 pointer-events-none"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        />
      )}
    </motion.div>
  );
}
