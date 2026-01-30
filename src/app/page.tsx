import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import BentoGrid from "@/components/BentoGrid";
import CollectionPreview from "@/components/brand/CollectionPreview";
import Footer from "@/components/Footer";

// We can allow the page to show immediately, but if parts are slow, we use Suspense.
// For now, let's keep the standard structure. Next.js `loading.tsx` handles full page transitions.

export default function Home() {
    return (
        <main className="min-h-screen bg-[#050505] text-white selection:bg-white/20">
            <Navigation theme="dark" />
            <Hero />
            <BentoGrid />
            <CollectionPreview />
            <Footer />
        </main>
    );
}
