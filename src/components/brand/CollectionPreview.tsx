"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@apollo/client";
import { GET_SHOP_PRODUCTS } from "@/lib/queries";
import { useCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { useRef } from "react";
import { ArrowRight, ShoppingBag } from "lucide-react";

export default function CollectionPreview() {
  const containerRef = useRef<HTMLDivElement>(null);
  // Fetch latest 10 products
  const { data, loading, error } = useQuery(GET_SHOP_PRODUCTS, {
    variables: { first: 10 },
  });
  console.log(data);
  const { formatAddonPrice } = useCurrency();

  if (loading) {
    return (
      <section className="py-24 px-6 bg-[#050505]">
        <div className="max-w-[1920px] mx-auto">
          <div className="h-20 w-64 bg-white/5 animate-pulse mb-16 rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="aspect-[4/5] bg-white/5 animate-pulse rounded-3xl"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || !data?.products?.nodes?.length) return null;

  const displayItems: any[] = [];
  data.products.nodes.forEach((product: any) => {
    if (product.variations?.nodes?.length > 0) {
      product.variations.nodes.forEach((v: any) => {
        displayItems.push({
          id: v.id,
          dbId: v.databaseId,
          name: v.name || product.name,
          price: v.price || product.price,
          image: v.image?.sourceUrl || product.image?.sourceUrl,
          slug: product.slug,
          isVariation: true,
        });
      });
    } else {
      displayItems.push({
        id: product.id,
        dbId: product.databaseId,
        name: product.name,
        price: product.price,
        image: product.image?.sourceUrl,
        slug: product.slug,
        isVariation: false,
      });
    }
  });
  const finalItems = displayItems.slice(0, 3);
  console.log(finalItems);

  return (
    <section ref={containerRef} className="py-24 px-6 bg-[#050505]">
      <div className="max-w-[1920px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-12 border-b border-white/5 pb-10">
          <div className="space-y-4">
            <span className="text-white/20 font-mono text-[10px] uppercase tracking-[0.6em]">
              New Collection / 01
            </span>
            <h2 className="text-5xl md:text-8xl font-black text-white tracking-widest uppercase leading-none">
              LATEST
              <br />
              <span className="text-neutral-800">PIECES</span>
            </h2>
          </div>

          <Link href="/shop" className="group flex items-center gap-6">
            <span className="uppercase tracking-[0.4em] text-[10px] font-bold text-white group-hover:text-neutral-400 transition-colors">
              Archive Access
            </span>
            <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white group-hover:border-white group-hover:rotate-45 transition-all duration-500">
              <ArrowRight size={18} />
            </div>
          </Link>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {finalItems.map((item: any, i: number) => {
            return (
              <ProductCard
                key={item.id}
                item={item}
                index={i}
                formatAddonPrice={formatAddonPrice}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ProductCard({
  item,
  index,
  formatAddonPrice,
}: {
  item: any;
  index: number;
  formatAddonPrice: any;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"],
  });


function extractPrice(price: string) {
  if (!price) return 0;
  const match = price.match(/[\d,.]+/);
  return match ? Number(match[0].replace(/,/g, "")) : 0;
}

const priceRaw = item.price
  ? item.price.replace(/[^0-9.]/g, '').replace(/^\.+/, '')
  : "0";

console.log(priceRaw,"PP")
const priceDisplay = formatAddonPrice(priceRaw);
  // Internal Parallax for Image
  const y = useTransform(scrollYProgress, [0, 1], [-50, 50]);

  return (
    <Link href="/shop" className="group block">
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.8,
          delay: index * 0.1,
          ease: [0.16, 1, 0.3, 1],
        }}
        viewport={{ once: true }}
        className="relative aspect-[4/5] bg-neutral-900 rounded-[2.5rem] overflow-hidden mb-8"
      >
        {/* Internal Parallax Image */}
        <motion.div
          style={{ y, willChange: "transform" }}
          className="absolute inset-0 z-0"
        >
          {item.image ? (
            <Image
              src={item.image}
              alt={item.name}
              fill
              className="object-cover scale-150 transition-all duration-700 grayscale group-hover:grayscale-0 group-hover:scale-[1.6]"
            />
          ) : (
            <div className="absolute inset-0 bg-neutral-800 flex items-center justify-center text-white/5 text-6xl font-black uppercase tracking-tighter">
              {item.name.split(" ")[0]}
            </div>
          )}
        </motion.div>

        {/* Glass Badge */}
        <div className="absolute top-8 left-8 p-4 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-[-10px] group-hover:translate-y-0">
          <ShoppingBag size={14} className="text-white" />
        </div>

        {/* Bottom Overlay */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/20 to-transparent group-hover:opacity-0 transition-opacity duration-700" />
      </motion.div>

      <div className="flex justify-between items-start px-4">
        <div className="space-y-2">
          <h3 className="text-white text-xl font-black uppercase tracking-tighter transition-colors group-hover:text-neutral-400">
            {item.name}
          </h3>
          <p className="text-neutral-600 text-[9px] font-mono uppercase tracking-[0.4em]">
            Core Tech / Season 01
          </p>
        </div>
        {parseFloat(priceRaw) > 0 && (
          <div className="bg-white/5 px-4 py-2 rounded-xl backdrop-blur-md border border-white/5 group-hover:bg-white group-hover:text-black transition-all">
            <span className="text-white group-hover:text-black font-mono text-[10px] font-bold uppercase tracking-widest">
              {priceDisplay}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
