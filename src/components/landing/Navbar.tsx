'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet';

const navLinks = [
  { label: 'جرّب الآن', href: '#demo' },
  { label: 'المميزات', href: '#features' },
  { label: 'كيف يعمل', href: '#how' },
  { label: 'الأسئلة الشائعة', href: '#faq' },
];

/* Custom SadaAlAqar logo — a building with echo/sound waves */
function SadaLogo({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Building body */}
      <rect x="8" y="12" width="24" height="22" rx="2" fill="#0D7C66" />
      {/* Windows */}
      <rect x="12" y="16" width="4" height="4" rx="0.5" fill="#FBF8F2" />
      <rect x="18" y="16" width="4" height="4" rx="0.5" fill="#FBF8F2" />
      <rect x="24" y="16" width="4" height="4" rx="0.5" fill="#FBF8F2" />
      <rect x="12" y="23" width="4" height="4" rx="0.5" fill="#FBF8F2" />
      <rect x="24" y="23" width="4" height="4" rx="0.5" fill="#FBF8F2" />
      {/* Door */}
      <rect x="17" y="27" width="6" height="7" rx="1" fill="#D4A853" />
      {/* Echo waves emanating from top-right */}
      <path
        d="M34 8C34 8 36 10 36 12C36 14 34 16 34 16"
        stroke="#D4A853"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M37 5C37 5 40 8.5 40 12C40 15.5 37 19 37 19"
        stroke="#D4A853"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
    </svg>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  // ── Hyration safety: don't render the client-only Sheet (Radix Dialog) until
  //    after mount. Radix generates random aria-controls IDs that differ between
  //    server and client, causing hydration mismatches. By deferring the Sheet
  //    render to after mount, we ensure the IDs are only generated client-side.
  //    Same for the framer-motion initial animation (server renders opacity:0,
  //    client animates to opacity:1 — mismatch).
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Use requestAnimationFrame to defer setState out of the effect body,
    // avoiding the "setState synchronously within an effect" lint rule.
    const raf = requestAnimationFrame(() => setMounted(true));
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const handleLinkClick = () => setOpen(false);

  return (
    <motion.nav
      initial={mounted ? { y: -80, opacity: 0 } : false}
      animate={mounted ? { y: 0, opacity: 1 } : { opacity: 1 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'nav-blur shadow-md'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 group">
          <SadaLogo className="h-9 w-9 transition-transform duration-200 group-hover:scale-110" />
          <span className="text-xl font-bold text-[#0D7C66]">صدى <span className="text-[#D4A853]">العقار</span></span>
        </a>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[#5B564C] transition-colors hover:text-[#0D7C66]"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:block">
          <a href="#lead-form">
            <Button className="rounded-full bg-[#0D7C66] px-6 text-white hover:bg-[#0a6b58] cursor-pointer">
              سجّل الآن
            </Button>
          </a>
        </div>

        {/* Mobile menu — deferred until mount to avoid Radix aria-controls hydration mismatch */}
        <div className="md:hidden">
          {mounted ? (
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <button
                  aria-label="فتح القائمة"
                  className="inline-flex items-center justify-center rounded-md p-2 text-[#211F1A] transition-colors hover:bg-[#F5F0E8]"
                >
                  <Menu className="h-6 w-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] bg-[#FBF8F2] p-0">
                <SheetHeader className="border-b border-[#E8E1D2] px-6 py-5">
                  <SheetTitle className="flex items-center gap-2 text-right">
                    <SadaLogo className="h-7 w-7" />
                    <span className="text-lg font-bold text-[#0D7C66]">صدى <span className="text-[#D4A853]">العقار</span></span>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-1 px-4 py-6">
                  {navLinks.map((link, i) => (
                    <motion.a
                      key={link.href}
                      href={link.href}
                      onClick={handleLinkClick}
                      initial={{ x: 30, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.08 * i, duration: 0.3 }}
                      className="rounded-xl px-4 py-3 text-base font-medium text-[#211F1A] transition-colors hover:bg-[#F5F0E8] hover:text-[#0D7C66]"
                    >
                      {link.label}
                    </motion.a>
                  ))}
                  <div className="mt-4 border-t border-[#E8E1D2] pt-4">
                    <a href="#lead-form" onClick={handleLinkClick}>
                      <Button className="w-full rounded-full bg-[#0D7C66] py-3 text-white hover:bg-[#0a6b58] cursor-pointer">
                        سجّل الآن
                      </Button>
                    </a>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            // Placeholder button (same dimensions) rendered on server to prevent layout shift
            <button
              aria-label="فتح القائمة"
              className="inline-flex items-center justify-center rounded-md p-2 text-[#211F1A] transition-colors hover:bg-[#F5F0E8]"
            >
              <Menu className="h-6 w-6" />
            </button>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
