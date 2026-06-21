'use client'

import { MessageCircle, Mail } from 'lucide-react'
import { triggerPrivacyTermsDialog } from './PrivacyTermsDialog'

// Public-facing WhatsApp number (Gulf-facing brand presence).
const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '966500000000'

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
      fill="none"
      className={className}
      aria-hidden="true"
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
      {/* Echo waves */}
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
  )
}

type FooterLink =
  | { label: string; href: string }
  | { label: string; action: 'privacy' | 'terms' };

const footerLinks: FooterLink[] = [
  { label: 'تواصل معنا', href: `https://wa.me/${WA_NUMBER}` },
  { label: 'سياسة الخصوصية', action: 'privacy' },
  { label: 'الشروط والأحكام', action: 'terms' },
]

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-[#E8E1D2] bg-[#FBF8F2]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Main footer content */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Right side - Logo & tagline (appears first on mobile, right on desktop due to RTL) */}
          <div className="flex items-center gap-3">
            <LogoMark className="h-10 w-10 shrink-0" />
            <div>
              <div className="text-xl font-extrabold text-[#211F1A]">
              صدى <span className="text-[#D4A853]">العقار</span>
              </div>
              <div className="text-xs text-[#5B564C] font-medium -mt-0.5">
                مساعد التسويق العقاري
              </div>
            </div>
          </div>

          {/* Center - Links */}
          <nav aria-label="روابط تذييل الموقع" className="flex flex-wrap items-center justify-center gap-6">
            {footerLinks.map((link) =>
              'href' in link ? (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.href.startsWith('http') ? '_blank' : undefined}
                  rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="text-sm font-medium text-[#5B564C] hover:text-[#0D7C66] transition-colors duration-200"
                >
                  {link.label}
                </a>
              ) : (
                <button
                  key={link.label}
                  type="button"
                  onClick={() => triggerPrivacyTermsDialog(link.action)}
                  className="text-sm font-medium text-[#5B564C] hover:text-[#0D7C66] transition-colors duration-200"
                >
                  {link.label}
                </button>
              )
            )}
          </nav>

          {/* Left side - Social icons */}
          <div className="flex items-center gap-3">
            <a
              href={`https://wa.me/${WA_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="تواصل عبر واتساب"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-[#0D7C66]/8 text-[#0D7C66] hover:bg-[#0D7C66] hover:text-white transition-colors duration-200"
            >
              <MessageCircle className="h-5 w-5" />
            </a>
            <a
              href="mailto:info@sadaaqar.com"
              aria-label="أرسل بريد إلكتروني"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-[#0D7C66]/8 text-[#0D7C66] hover:bg-[#0D7C66] hover:text-white transition-colors duration-200"
            >
              <Mail className="h-5 w-5" />
            </a>
            <a
              href="https://x.com/sadaaqar"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="تابعنا على إكس"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-[#0D7C66]/8 text-[#0D7C66] hover:bg-[#0D7C66] hover:text-white transition-colors duration-200"
            >
              <XIcon className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="my-6 h-px bg-[#E8E1D2]" />

        {/* Copyright */}
        <div className="text-center text-xs text-[#5B564C] font-medium">
          © 2025 صدى العقار — جميع الحقوق محفوظة
        </div>
      </div>
    </footer>
  )
}
