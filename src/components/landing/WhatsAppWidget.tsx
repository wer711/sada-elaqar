'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, ExternalLink } from 'lucide-react'

// Public-facing WhatsApp number (Gulf-facing brand presence).
// Sourced from NEXT_PUBLIC_WHATSAPP_NUMBER env var; falls back to a Saudi placeholder.
const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '966500000000'

const quickReplies = [
  {
    label: '🎯 أريد تجربة المنتج',
    action: 'demo',
  },
  {
    label: '💬 عندي سؤال',
    action: 'question',
  },
  {
    label: '🏢 أريد عرضاً لشركتي',
    action: 'company',
  },
]

export default function WhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        isOpen &&
        panelRef.current &&
        buttonRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  function handleQuickReply(action: string) {
    if (action === 'demo') {
      setIsOpen(false)
      const el = document.getElementById('demo')
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    } else if (action === 'question') {
      window.open(
        `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('مرحباً، عندي سؤال عن صدى العقار')}`,
        '_blank'
      )
      setIsOpen(false)
    } else if (action === 'company') {
      window.open(
        `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('مرحباً، أريد عرضاً خاصاً لشركتي')}`,
        '_blank'
      )
      setIsOpen(false)
    }
  }

  return (
    <div className="fixed bottom-6 left-6 z-50" dir="rtl">
      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="absolute bottom-16 left-0 w-[300px] sm:w-[340px] rounded-2xl overflow-hidden shadow-2xl border border-[#E8E1D2] bg-white"
          >
            {/* Header */}
            <div className="bg-[#0D7C66] px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">
                    👋 مرحباً! فريق صدى العقار هنا
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors p-1"
                aria-label="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-5">
              <p className="text-[#5B564C] text-sm mb-4">كيف يمكننا مساعدتك؟</p>

              <div className="space-y-2.5">
                {quickReplies.map((reply) => (
                  <button
                    key={reply.action}
                    onClick={() => handleQuickReply(reply.action)}
                    className="w-full text-right px-4 py-3 rounded-xl border border-[#E8E1D2] bg-[#FBF8F2] hover:bg-[#F5F0E8] hover:border-[#0D7C66]/30 transition-all text-sm font-medium text-[#211F1A] flex items-center justify-between group"
                  >
                    <span>{reply.label}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#5B564C] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        ref={buttonRef}
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-colors wa-float focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D7C66] focus-visible:ring-offset-2"
        style={{ backgroundColor: '#25D366' }}
        animate={
          !isOpen
            ? {
                y: [0, -6, 0],
              }
            : {}
        }
        transition={
          !isOpen
            ? {
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }
            : {}
        }
        aria-label="تواصل معنا عبر واتساب"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="white"
            className="w-7 h-7"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        )}
      </motion.button>
    </div>
  )
}
