'use client';

import { useState, useCallback, useRef, type ComponentType } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Loader2,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  MapPin,
  MessageCircle,
  Repeat2,
  Heart,
  BarChart3,
  Bookmark,
  Send,
  Eye,
  Copy,
  ClipboardCopy,
  Share2,
  Camera,
  ThumbsUp as ThumbsUpIcon,
  ThumbsDown as ThumbsDownIcon,
  // Modern property type icons
  Building2,
  Home,
  Hotel,
  Crown,
  LandPlot,
  Briefcase,
  Store,
  DoorClosed,
  Palmtree,
  Warehouse,
  // Modern feature icons
  Waves,
  Car,
  ShieldCheck,
  Sailboat,
  Trees,
  Dumbbell,
  ArrowDownToLine,
  ArrowUpDown,
  Sofa,
  Gem,
  Sun,
  ChefHat,
  // Misc icons
  ThumbsUp as LikeIcon,
  MessageSquare,
  Globe,
  TrendingUp,
  BriefcaseBusiness,
  Brain,
  Sparkles as SparklesIcon,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas-pro';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import DefaultPropertyImage from './DefaultPropertyImage';
import ShareButtons from './ShareButtons';
import { useVisitorId, useGenerationCount, useDailyGenerationCount, makeVariationSeed, isAdminMode } from '@/lib/visitor';
import {
  VARIATION_ANGLES,
  POST_MODES,
  CUSTOM_SECTIONS,
  PROPERTY_FAMILY_MAP,
  FAMILY_FEATURES,
  FAMILY_LABELS,
  PURPOSE_OPTIONS,
  getPurposeOption,
  type PropertyFamily,
  type Purpose,
  type ResolvedProperty,
  type OptionalDetails,
  type PostMode,
} from '@/lib/ai-types';
import {
  ChevronDown, Wallet, FileCheck, Zap, Layers, SlidersHorizontal,
  Phone, Bath, Calendar, School, Stethoscope, Landmark, Percent,
  Ruler, KeyRound, Hash, Users, Navigation, Maximize2, Building, ScrollText,
  Tag, Key, ClipboardCheck, Clock, Receipt, CalendarClock,
} from 'lucide-react';

// ─── Platform SVG Icons (Modern & Professional) ───────────

function InstagramIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069z" stroke="url(#ig-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 6.838a5.162 5.162 0 100 10.324 5.162 5.162 0 000-10.324z" stroke="url(#ig-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="18.406" cy="5.595" r="1.44" fill="url(#ig-grad)"/>
      <defs>
        <linearGradient id="ig-grad" x1="0" y1="24" x2="24" y2="0">
          <stop stopColor="#FFDC80"/>
          <stop offset="0.15" stopColor="#FCAF45"/>
          <stop offset="0.3" stopColor="#F77737"/>
          <stop offset="0.5" stopColor="#E1306C"/>
          <stop offset="0.7" stopColor="#C13584"/>
          <stop offset="0.85" stopColor="#833AB4"/>
          <stop offset="1" stopColor="#405DE6"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

function XIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

function SnapchatIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12.922-.214.12-.042.195-.066.27-.066a.6.6 0 01.34.09c.24.15.39.42.39.72 0 .27-.12.51-.33.66-.18.12-.39.21-.6.27-.21.06-.42.12-.57.21-.18.09-.33.24-.42.45-.09.21-.06.48.09.78.24.45.63.93 1.17 1.44.36.33.75.63 1.14.87.18.12.33.21.42.27.15.09.3.21.39.39.09.18.12.39.06.6-.12.39-.51.63-1.02.78-.27.09-.57.15-.87.18-.15.03-.3.03-.42.06-.12.03-.24.06-.33.15-.09.09-.15.21-.21.39-.06.18-.15.33-.3.45-.18.15-.42.21-.69.21-.3 0-.63-.06-.93-.15-.3-.09-.63-.18-.96-.18-.09 0-.18 0-.27.03-.39.06-.78.24-1.2.45-.54.24-1.11.51-1.86.51h-.09c-.75 0-1.32-.27-1.86-.51-.42-.21-.81-.39-1.2-.45-.09-.03-.18-.03-.27-.03-.33 0-.66.09-.96.18-.3.09-.63.15-.93.15-.27 0-.51-.06-.69-.21-.15-.12-.24-.27-.3-.45-.06-.18-.12-.3-.21-.39-.09-.09-.21-.12-.33-.15-.12-.03-.27-.03-.42-.06-.3-.03-.6-.09-.87-.18-.51-.15-.9-.39-1.02-.78a.68.68 0 01.06-.6c.09-.18.24-.3.39-.39.09-.06.24-.15.42-.27.39-.24.78-.54 1.14-.87.54-.51.93-.99 1.17-1.44.15-.3.18-.57.09-.78-.09-.21-.24-.36-.42-.45-.15-.09-.36-.15-.57-.21-.21-.06-.42-.15-.6-.27-.21-.15-.33-.39-.33-.66 0-.3.15-.57.39-.72a.6.6 0 01.34-.09c.075 0 .15.024.27.066.263.094.622.198.922.214.198 0 .326-.045.401-.09-.008-.165-.018-.33-.03-.51l-.003-.06c-.104-1.628-.23-3.654.299-4.847C7.859 1.069 11.216.793 12.206.793z"/>
    </svg>
  );
}

function WhatsAppIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

function LinkedInIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

function FacebookIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

// ─── Data Maps ────────────────────────────────────────────────

const PROPERTY_TYPES = [
  { value: 'شقة', Icon: Building2, color: 'text-[#0D7C66]' },
  { value: 'فيلا', Icon: Home, color: 'text-[#D4A853]' },
  { value: 'دوبلكس', Icon: Warehouse, color: 'text-[#0D7C66]' },
  { value: 'بنتهاوس', Icon: Crown, color: 'text-[#D4A853]' },
  { value: 'أرض', Icon: LandPlot, color: 'text-[#0D7C66]' },
  { value: 'مكتب تجاري', Icon: Briefcase, color: 'text-[#0D7C66]' },
  { value: 'محل تجاري', Icon: Store, color: 'text-[#D4A853]' },
  { value: 'عمارة سكنية', Icon: Building2, color: 'text-[#0D7C66]' },
  { value: 'استوديو', Icon: DoorClosed, color: 'text-[#D4A853]' },
  { value: 'شاليه', Icon: Palmtree, color: 'text-[#0D7C66]' },
];

const COUNTRIES = [
  { value: 'السعودية', flag: '🇸🇦', currency: 'ريال' },
  { value: 'الإمارات', flag: '🇦🇪', currency: 'درهم' },
  { value: 'قطر', flag: '🇶🇦', currency: 'ريال قطري' },
  { value: 'الكويت', flag: '🇰🇼', currency: 'دينار' },
  { value: 'البحرين', flag: '🇧🇭', currency: 'دينار' },
  { value: 'عُمان', flag: '🇴🇲', currency: 'ريال عُماني' },
  { value: 'مصر', flag: '🇪🇬', currency: 'جنيه' },
  { value: 'الأردن', flag: '🇯🇴', currency: 'دينار' },
  { value: 'العراق', flag: '🇮🇶', currency: 'دينار' },
  { value: 'المغرب', flag: '🇲🇦', currency: 'درهم مغربي' },
  { value: 'لبنان', flag: '🇱🇧', currency: 'ليرة لبنانية' },
  { value: 'تركيا', flag: '🇹🇷', currency: 'ليرة' },
  { value: 'الجزائر', flag: '🇩🇿', currency: 'دينار جزائري' },
  { value: 'تونس', flag: '🇹🇳', currency: 'دينار تونسي' },
  { value: 'ليبيا', flag: '🇱🇾', currency: 'دينار ليبي' },
  { value: 'السودان', flag: '🇸🇩', currency: 'جنيه سوداني' },
  { value: 'فلسطين', flag: '🇵🇸', currency: 'شيقل' },
  { value: 'اليمن', flag: '🇾🇪', currency: 'ريال يمني' },
  { value: 'سوريا', flag: '🇸🇾', currency: 'ليرة سورية' },
  { value: 'موريتانيا', flag: '🇲🇷', currency: 'أوقية' },
  { value: 'الصومال', flag: '🇸🇴', currency: 'شلن صومالي' },
  { value: 'جيبوتي', flag: '🇩🇯', currency: 'فرنك جيبوتي' },
];

const CITIES_BY_COUNTRY: Record<string, string[]> = {
  'السعودية': ['الرياض', 'جدة', 'الدمام', 'الخبر', 'مكة المكرمة', 'المدينة المنورة', 'أبها', 'تبوك', 'بريدة', 'نجران', 'الطائف', 'ينبع', 'حائل', 'الجبيل', 'نيوم'],
  'الإمارات': ['دبي', 'أبوظبي', 'الشارقة', 'عجمان', 'رأس الخيمة', 'الفجيرة', 'أم القيوين'],
  'قطر': ['الدوحة', 'لوسيل', 'الوكرة', 'الخور', 'الدخان'],
  'الكويت': ['الكويت العاصمة', 'حولي', 'الفروانية', 'الأحمدي', 'الجهراء', 'مبارك الكبير'],
  'البحرين': ['المنامة', 'المحرق', 'الرفاع', 'مدينة حمد', 'مدينة عيسى'],
  'عُمان': ['مسقط', 'صحار', 'صلالة', 'نزوى', 'السيب', 'بركاء'],
  'مصر': ['القاهرة', 'الجيزة', 'العاصمة الإدارية', 'الإسكندرية', 'التجمع الخامس', 'المنصورة', 'أسيوط', 'طنطا', 'شرم الشيخ', 'الغردقة'],
  'الأردن': ['عمّان', 'إربد', 'العقبة', 'الزرقاء', 'الكرك'],
  'العراق': ['بغداد', 'أربيل', 'البصرة', 'النجف', 'كربلاء', 'السليمانية', 'الموصل'],
  'المغرب': ['الدار البيضاء', 'الرباط', 'مراكش', 'فاس', 'طنجة', 'أغادير', 'مكناس', 'وجدة'],
  'لبنان': ['بيروت', 'طرابلس', 'صيدا', 'زحلة', 'جونية'],
  'تركيا': ['إسطنبول', 'أنقرة', 'أنطاليا', 'إزمير', 'بورصة', 'قونية'],
  'الجزائر': ['الجزائر العاصمة', 'وهران', 'قسنطينة', 'عنابة', 'سطيف', 'البليدة', 'تلمسان', 'بجاية', 'تيزي وزو', 'ورقلة', 'سوق أهراس', 'المسيلة'],
  'تونس': ['تونس العاصمة', 'صفاقس', 'سوسة', 'القيروان', 'بنزرت', 'المنستير', 'المهدية', 'نابل', 'جربة', 'حمامات'],
  'ليبيا': ['طرابلس', 'بنغازي', 'مصراتة', 'سبها', 'الزاوية', 'زليتن', 'الخمس'],
  'السودان': ['الخرطوم', 'أم درمان', 'بورتسودان', 'كسلا', 'الأبيض', 'كادوقلي', 'عطبرة'],
  'فلسطين': ['رام الله', 'غزة', 'نابلس', 'الخليل', 'بيت لحم', 'أريحا', 'طولكرم', 'قلقيلية', 'جنين', 'طبريا'],
  'اليمن': ['صنعاء', 'عدن', 'تعز', 'الحديدة', 'إب', 'ذمار', 'المكلا', 'سيئون'],
  'سوريا': ['دمشق', 'حلب', 'حمص', 'اللاذقية', 'حماه', 'طرطوس', 'دير الزور', 'الرقة', 'إدلب'],
  'موريتانيا': ['نواكشوط', 'نواذيبو', 'روصو', 'كيفه', 'النعمة'],
  'الصومال': ['مقديشو', 'هرجيسا', 'كيسمايو', 'بارعو', 'جاروي'],
  'جيبوتي': ['جيبوتي', 'علي صبيح', 'تاجورة', 'أوبوك'],
};

/* ─── Smart feature lists per property family ───
 * Each family shows ONLY features relevant to it. Driven by FAMILY_FEATURES
 * in ai-types.ts. Icons are looked up dynamically below. */
const FEATURE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'مسبح': Waves,
  'موقف سيارات': Car,
  'حراسة أمنية': ShieldCheck,
  'إطلالة بحرية': Sailboat,
  'حديقة خاصة': Trees,
  'صالة رياضية': Dumbbell,
  'قبو': ArrowDownToLine,
  'مصعد': ArrowUpDown,
  'مفروش': Sofa,
  'تشطيب فاخر': Gem,
  'تراس': Sun,
  'مطبخ مجهز': ChefHat,
  'شرفة': Sun,
  'تكييف': Zap,
  'إطلالة': Eye,
  'قرب المترو': Navigation,
  'مدخل مستقل': DoorClosed,
  'غرفة خادمة': Home,
  'جراج': Warehouse,
  'مجلس': BriefcaseBusiness,
  // Land
  'مرافق موصلة': Zap,
  'أرض زاوية': Layers,
  'على شارعين': Maximize2,
  'مخططة': ScrollText,
  'مسوّرة': ShieldCheck,
  'قرب طريق سريع': Navigation,
  'أرض مستوية': Maximize2,
  // Building
  'مواقف': Car,
  'سولار مركزي': Zap,
  'خزانات': Building,
  // Commercial
  'واجهة زجاجية': Building2,
  'عدّاد مستقل': Hash,
};

function getFeatureIcon(value: string): React.ComponentType<{ className?: string }> {
  return FEATURE_ICONS[value] || Sparkles;
}

/** Returns the feature list relevant to the current property family. */
function getFeaturesForFamily(family: PropertyFamily | ''): Array<{ value: string; Icon: React.ComponentType<{ className?: string }> }> {
  if (!family) return [];
  return FAMILY_FEATURES[family].map(value => ({ value, Icon: getFeatureIcon(value) }));
}

type Platform = 'instagram' | 'twitter' | 'snapchat' | 'whatsapp' | 'linkedin' | 'facebook';

interface PlatformConfig {
  value: Platform;
  name: string;
  description: string;
  tabColor: string;
  activeBg: string;
  activeBorder: string;
}

const PLATFORMS: PlatformConfig[] = [
  {
    value: 'instagram',
    name: 'إنستغرام',
    description: 'وصف تفصيلي مع هاشتاقات للوصول الأوسع',
    tabColor: 'text-[#E1306C]',
    activeBg: 'bg-gradient-to-br from-[#FCAF45]/10 to-[#E1306C]/10',
    activeBorder: 'border-[#E1306C]/30',
  },
  {
    value: 'twitter',
    name: 'إكس',
    description: 'تغريدة مختصرة تجذب الانتباه فوراً',
    tabColor: 'text-[#0F1419]',
    activeBg: 'bg-[#0F1419]/5',
    activeBorder: 'border-[#0F1419]/20',
  },
  {
    value: 'snapchat',
    name: 'سناب شات',
    description: 'عنوان قصير ومثير للفضول',
    tabColor: 'text-[#211F1A]',
    activeBg: 'bg-[#FFFC00]/15',
    activeBorder: 'border-[#FFFC00]/50',
  },
  {
    value: 'whatsapp',
    name: 'واتساب',
    description: 'رسالة جاهزة للإرسال المباشر للعملاء',
    tabColor: 'text-[#25D366]',
    activeBg: 'bg-[#25D366]/10',
    activeBorder: 'border-[#25D366]/30',
  },
  {
    value: 'facebook',
    name: 'فيسبوك',
    description: 'منشور اجتماعي تفاعلي يصل لجمهور واسع',
    tabColor: 'text-[#1877F2]',
    activeBg: 'bg-[#1877F2]/10',
    activeBorder: 'border-[#1877F2]/30',
  },
  {
    value: 'linkedin',
    name: 'لينكدين',
    description: 'محتوى مهني موجّه للمستثمرين ورجال الأعمال',
    tabColor: 'text-[#0A66C2]',
    activeBg: 'bg-[#0A66C2]/10',
    activeBorder: 'border-[#0A66C2]/30',
  },
];

/* ─── Platform-adaptive theme for property data bar ─── */
interface PlatformTheme {
  barBg: string;
  barBorder: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  iconColor: string;
  label: string;
}

const PLATFORM_THEME: Record<Platform, PlatformTheme> = {
  instagram: {
    barBg: 'bg-gradient-to-l from-[#FCAF45]/8 via-[#E1306C]/5 to-[#833AB4]/8',
    barBorder: 'border-[#E1306C]/20',
    badgeBg: 'bg-white',
    badgeText: 'text-[#262626]',
    badgeBorder: 'border-[#E1306C]/25',
    iconColor: 'text-[#E1306C]',
    label: 'إنستغرام',
  },
  twitter: {
    barBg: 'bg-[#0F1419]/3',
    barBorder: 'border-[#0F1419]/15',
    badgeBg: 'bg-white',
    badgeText: 'text-[#0F1419]',
    badgeBorder: 'border-[#0F1419]/20',
    iconColor: 'text-[#1D9BF0]',
    label: 'إكس',
  },
  snapchat: {
    barBg: 'bg-[#FFFC00]/15',
    barBorder: 'border-[#FFFC00]/60',
    badgeBg: 'bg-white',
    badgeText: 'text-[#211F1A]',
    badgeBorder: 'border-[#211F1A]/15',
    iconColor: 'text-[#211F1A]',
    label: 'سناب شات',
  },
  whatsapp: {
    barBg: 'bg-[#25D366]/8',
    barBorder: 'border-[#25D366]/25',
    badgeBg: 'bg-white',
    badgeText: 'text-[#075E54]',
    badgeBorder: 'border-[#25D366]/30',
    iconColor: 'text-[#25D366]',
    label: 'واتساب',
  },
  facebook: {
    barBg: 'bg-[#1877F2]/8',
    barBorder: 'border-[#1877F2]/25',
    badgeBg: 'bg-white',
    badgeText: 'text-[#1877F2]',
    badgeBorder: 'border-[#1877F2]/30',
    iconColor: 'text-[#1877F2]',
    label: 'فيسبوك',
  },
  linkedin: {
    barBg: 'bg-[#0A66C2]/8',
    barBorder: 'border-[#0A66C2]/25',
    badgeBg: 'bg-white',
    badgeText: 'text-[#0A66C2]',
    badgeBorder: 'border-[#0A66C2]/30',
    iconColor: 'text-[#0A66C2]',
    label: 'لينكدين',
  },
};

// ─── Types ────────────────────────────────────────────────────

type Step = 1 | 2 | 3 | 4;

interface PropertySnapshot {
  propertyType: string;
  city: string;
  country: string;
  customArea: string;
  area: string;
  rooms: string;
  price: string;
  currency: string;
  features: string[];
  optionalDetails?: OptionalDetails;
  postMode?: PostMode;
  customSections?: string[];
}

interface GeneratedResult {
  content: string;
  hashtags: string;
  headline: string;
  sessionId: string;
  snapshot: PropertySnapshot;
  /** Property data EXACTLY as it appears in the generated content.
   *  The displayed property card uses THIS so it always matches the copy. */
  resolvedProperty: ResolvedProperty;
  /** Which style "personality" was used (for the learning indicator) */
  variationAngle: string;
  variationSeed: number;
}

const STEP_LABELS: Record<Step, string> = {
  1: 'نوع العقار',
  2: 'الموقع',
  3: 'تفاصيل العقار',
  4: 'المنصة والنمط',
};

const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction < 0 ? 80 : -80, opacity: 0 }),
};

// ─── Helper: Platform icon component ───

function PlatformIcon({ platform, className }: { platform: Platform; className?: string }) {
  switch (platform) {
    case 'instagram': return <InstagramIcon className={className} />;
    case 'twitter': return <XIcon className={className} />;
    case 'snapchat': return <SnapchatIcon className={className} />;
    case 'whatsapp': return <WhatsAppIcon className={className} />;
    case 'facebook': return <FacebookIcon className={className} />;
    case 'linkedin': return <LinkedInIcon className={className} />;
  }
}

// ─── Helper: collapsible section for optional details ───

function OptionalSection({
  title, icon: Icon, emoji, children, defaultOpen = false, count,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  emoji?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  count?: number;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`rounded-xl border transition-all duration-200 ${open ? 'border-[#0D7C66]/30 bg-[#0D7C66]/3' : 'border-[#E8E1D2] bg-white'}`}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-3 cursor-pointer"
      >
        <span className="flex items-center gap-2 font-bold text-sm text-[#211F1A]">
          {emoji && <span className="text-base">{emoji}</span>}
          <Icon className="h-4 w-4 text-[#0D7C66]" />
          {title}
          {count !== undefined && count > 0 && (
            <span className="text-[10px] bg-[#0D7C66] text-white rounded-full px-1.5 py-0.5 font-bold">{count}</span>
          )}
        </span>
        <ChevronDown className={`h-4 w-4 text-[#5B564C] transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-3 pb-3 pt-1 space-y-3">{children}</div>
      )}
    </div>
  );
}

// ─── Helper: labeled field row ───

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-[#5B564C] font-medium">{label}</Label>
      {children}
      {hint && <p className="text-[10px] text-[#5B564C]/70">{hint}</p>}
    </div>
  );
}

// ─── Helper: yes/no/empty toggle ───

function YesNoToggle({ value, onChange }: { value: 'yes' | 'no' | undefined; onChange: (v: 'yes' | 'no' | undefined) => void }) {
  return (
    <div className="flex gap-1.5">
      <button type="button" onClick={() => onChange(value === 'yes' ? undefined : 'yes')}
        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${value === 'yes' ? 'border-[#0D7C66] bg-[#0D7C66]/10 text-[#0D7C66]' : 'border-[#E8E1D2] bg-white text-[#5B564C] hover:border-[#0D7C66]/40'}`}>
        نعم
      </button>
      <button type="button" onClick={() => onChange(value === 'no' ? undefined : 'no')}
        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${value === 'no' ? 'border-[#E0793C] bg-[#E0793C]/10 text-[#E0793C]' : 'border-[#E8E1D2] bg-white text-[#5B564C] hover:border-[#E0793C]/40'}`}>
        لا
      </button>
    </div>
  );
}

// ─── Helper: enum toggle (multi-option single-select) ───

function EnumToggle({ options, value, onChange }: { options: { value: string; label: string }[]; value: string | undefined; onChange: (v: string | undefined) => void }) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {options.map(o => (
        <button key={o.value} type="button" onClick={() => onChange(value === o.value ? undefined : o.value)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${value === o.value ? 'border-[#0D7C66] bg-[#0D7C66]/10 text-[#0D7C66]' : 'border-[#E8E1D2] bg-white text-[#5B564C] hover:border-[#0D7C66]/40'}`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ─── Helper: chip multi-select (for suitableFor) ───

function ChipMulti({ options, selected, onToggle }: { options: string[]; selected: string[]; onToggle: (v: string) => void }) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {options.map(o => {
        const on = selected.includes(o);
        return (
          <button key={o} type="button" onClick={() => onToggle(o)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${on ? 'border-[#0D7C66] bg-[#0D7C66]/10 text-[#0D7C66]' : 'border-[#E8E1D2] bg-white text-[#5B564C] hover:border-[#0D7C66]/40'}`}>
            {o}
          </button>
        );
      })}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * SmartPropertyDetails — Step 3 of the wizard.
 *
 * This is the HEART of the re-architecture: a single step that adapts its
 * fields to the property family. Land never asks for rooms; commercial never
 * asks for a pool; building asks for floors/units. It also merges the smart
 * feature list (per family) and the 5 "essentials" optional fields so the
 * wizard stays short (4 steps total) instead of the old 6.
 * ════════════════════════════════════════════════════════════════════════ */
function SmartPropertyDetails({
  family, purpose,
  area, setArea,
  rooms, setRooms,
  price, setPrice,
  currency,
  notes, setNotes,
  selectedFeatures,
  toggleFeature,
  optionalDetails,
  updateOptional,
}: {
  family: PropertyFamily | '';
  purpose: Purpose | '';
  area: string; setArea: (v: string) => void;
  rooms: string; setRooms: (v: string) => void;
  price: string; setPrice: (v: string) => void;
  currency: string;
  notes: string; setNotes: (v: string) => void;
  selectedFeatures: string[];
  toggleFeature: (f: string) => void;
  optionalDetails: OptionalDetails;
  updateOptional: <K extends keyof OptionalDetails>(key: K, value: OptionalDetails[K]) => void;
}) {
  const fam: PropertyFamily = family || 'residential';
  const isLand = fam === 'land';
  const isBuilding = fam === 'building';
  const isCommercial = fam === 'commercial';
  const isRent = purpose === 'rent';
  const isEvaluate = purpose === 'evaluate';
  const isSale = purpose === 'sale';
  const features = getFeaturesForFamily(fam);

  // ── Dynamic price label & placeholder per purpose ──
  const priceLabel = isRent
    ? `الإيجار الشهري (${currency})`
    : isEvaluate
    ? `السعر المُقترح للتقييم (${currency})`
    : `السعر الإجمالي (${currency})`;
  const pricePlaceholder = isRent ? 'مثال: ٢٥٠٠' : isEvaluate ? 'مثال: ٨٥٠,٠٠٠' : 'مثال: ٨٥٠,٠٠٠';
  const priceHint = isRent
    ? 'الإيجار الشهري — يُذكر بوضوح في الإعلان'
    : isEvaluate
    ? 'سعر التاجر للافتراض — سيقارنه صدى العقار بالقيمة التقديرية'
    : 'السعر الإجمالي للطلب';

  // Section title text adapts to purpose
  const sectionTitle = isRent
    ? 'تفاصيل الإيجار (للمستأجر)'
    : isEvaluate
    ? 'بيانات التقييم'
    : 'تفاصيل العقار';
  const sectionDesc = isLand
    ? 'بما أنك اخترت أرضاً، سنطلب منك فقط ما يناسبها — لا غرف ولا حمامات'
    : isBuilding
    ? 'تفاصيل العمارة: الأدوار، الوحدات، المصعد — كل ما يهم مستثمر العمائر'
    : isCommercial
    ? 'تفاصيل التجاري: الموقع، الواجهة، صلاحية الاستخدام'
    : isRent
    ? 'ركّز على ما يبحث عنه المستأجر: الإيجار، التأثيث، الجاهزية، المرافق'
    : isEvaluate
    ? 'أدخل بيانات العقار بدقة — سيستخدمها صدى العقار لتقدير القيمة والتوصية'
    : 'أدخل التفاصيل الأساسية — كلما زادت، قوي المحتوى وزاد إقناعاً';

  return (
    <div className="space-y-5">
      <div className="text-center mb-2">
        <h3 className="text-xl font-bold text-[#211F1A]">{sectionTitle}</h3>
        <p className="text-sm text-[#5B564C] mt-1">{sectionDesc}</p>
      </div>

      {/* ── A) Common fields: area, price (+ rooms for non-land) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label className="text-[#5B564C] flex items-center gap-1.5">
            <LandPlot className="h-4 w-4 text-[#0D7C66]" />
            {isLand ? 'مساحة الأرض (م²)' : 'المساحة (م²)'}
          </Label>
          <Input type="number" min={0} placeholder={isLand ? 'مثال: ٦٠٠' : 'مثال: ١٥٠'} value={area}
            onChange={e => setArea(e.target.value)}
            className="border-[#E8E1D2] focus:ring-[#0D7C66]/30 text-lg" />
        </div>
        {!isLand && (
          <div className="space-y-2">
            <Label className="text-[#5B564C] flex items-center gap-1.5">
              <Home className="h-4 w-4 text-[#0D7C66]" />
              {isBuilding ? 'الوحدات' : 'عدد الغرف'}
            </Label>
            <Input type="number" min={0} placeholder={isBuilding ? 'مثال: ١٢' : 'مثال: ٣'} value={rooms}
              onChange={e => setRooms(e.target.value)}
              className="border-[#E8E1D2] focus:ring-[#0D7C66]/30 text-lg" />
          </div>
        )}
        <div className={`space-y-2 ${isLand ? 'sm:col-span-2' : ''}`}>
          <Label className="text-[#5B564C] flex items-center gap-1.5">
            <Gem className="h-4 w-4 text-[#D4A853]" />
            {priceLabel}
          </Label>
          <Input type="number" min={0} placeholder={pricePlaceholder} value={price}
            onChange={e => setPrice(e.target.value)}
            className="border-[#E8E1D2] focus:ring-[#0D7C66]/30 text-lg" />
          <p className="text-[10px] text-[#5B564C]/70">{priceHint}</p>
        </div>
      </div>

      {/* ── B) Family-specific dynamic fields ── */}
      {isLand && (
        <div className="rounded-xl border border-[#0D7C66]/20 bg-[#0D7C66]/3 p-3 space-y-3">
          <p className="text-xs font-bold text-[#0D7C66] flex items-center gap-1.5">
            <LandPlot className="h-3.5 w-3.5" /> تفاصيل الأرض
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Field label="نوع الأرض">
              <EnumToggle
                options={[
                  { value: 'بيضاء', label: 'بيضاء' },
                  { value: 'سكنية', label: 'سكنية' },
                  { value: 'تجارية', label: 'تجارية' },
                  { value: 'زراعية', label: 'زراعية' },
                  { value: 'صناعية', label: 'صناعية' },
                ]}
                value={optionalDetails.landType || ''}
                onChange={v => updateOptional('landType', v)}
              />
            </Field>
            <Field label="محتوى الأرض">
              <EnumToggle
                options={[
                  { value: 'خالية', label: 'خالية' },
                  { value: 'بها مباني', label: 'بها مباني' },
                  { value: 'بها حديقة', label: 'بها حديقة' },
                ]}
                value={optionalDetails.landContents || ''}
                onChange={v => updateOptional('landContents', v)}
              />
            </Field>
            <Field label="حالة التخطيط">
              <EnumToggle
                options={[
                  { value: 'مخططة', label: 'مخططة' },
                  { value: 'غير مخططة', label: 'غير مخططة' },
                  { value: 'على مخطط معتمد', label: 'على مخطط معتمد' },
                ]}
                value={optionalDetails.planningStatus || ''}
                onChange={v => updateOptional('planningStatus', v)}
              />
            </Field>
            <Field label="عرض الشارع (م)">
              <Input type="number" min={0} placeholder="مثال: 20" value={optionalDetails.streetWidth || ''}
                onChange={e => updateOptional('streetWidth', e.target.value)}
                className="border-[#E8E1D2] focus:ring-[#0D7C66]/30 text-sm h-9" />
            </Field>
            <Field label="طول الواجهة (م)">
              <Input type="number" min={0} placeholder="مثال: 30" value={optionalDetails.frontageWidth || ''}
                onChange={e => updateOptional('frontageWidth', e.target.value)}
                className="border-[#E8E1D2] focus:ring-[#0D7C66]/30 text-sm h-9" />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="المرافق موصلة؟">
                <YesNoToggle value={optionalDetails.hasUtilities} onChange={v => updateOptional('hasUtilities', v)} />
              </Field>
              <Field label="أرض زاوية؟">
                <YesNoToggle value={optionalDetails.isCorner} onChange={v => updateOptional('isCorner', v)} />
              </Field>
            </div>
          </div>
        </div>
      )}

      {isBuilding && (
        <div className="rounded-xl border border-[#0D7C66]/20 bg-[#0D7C66]/3 p-3 space-y-3">
          <p className="text-xs font-bold text-[#0D7C66] flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5" /> تفاصيل العمارة
          </p>
          <div className="grid grid-cols-3 gap-2">
            <Field label="عدد الأدوار">
              <Input type="number" min={0} placeholder="مثال: 5" value={optionalDetails.buildingFloors || ''}
                onChange={e => updateOptional('buildingFloors', e.target.value)}
                className="border-[#E8E1D2] focus:ring-[#0D7C66]/30 text-sm h-9" />
            </Field>
            <Field label="شقق/دور">
              <Input type="number" min={0} placeholder="مثال: 2" value={optionalDetails.apartmentsPerFloor || ''}
                onChange={e => updateOptional('apartmentsPerFloor', e.target.value)}
                className="border-[#E8E1D2] focus:ring-[#0D7C66]/30 text-sm h-9" />
            </Field>
            <Field label="إجمالي الوحدات">
              <Input type="number" min={0} placeholder="مثال: 10" value={optionalDetails.totalUnits || ''}
                onChange={e => updateOptional('totalUnits', e.target.value)}
                className="border-[#E8E1D2] focus:ring-[#0D7C66]/30 text-sm h-9" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label="يوجد مصعد؟">
              <YesNoToggle value={optionalDetails.hasElevator} onChange={v => updateOptional('hasElevator', v)} />
            </Field>
            <Field label="يوجد قبو؟">
              <YesNoToggle value={optionalDetails.hasBasement} onChange={v => updateOptional('hasBasement', v)} />
            </Field>
          </div>
        </div>
      )}

      {isCommercial && (
        <div className="rounded-xl border border-[#0D7C66]/20 bg-[#0D7C66]/3 p-3 space-y-3">
          <p className="text-xs font-bold text-[#0D7C66] flex items-center gap-1.5">
            <Store className="h-3.5 w-3.5" /> تفاصيل تجارية
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Field label="نوع الموقع">
              <EnumToggle
                options={[
                  { value: 'شارع رئيسي', label: 'شارع رئيسي' },
                  { value: 'داخل مول', label: 'داخل مول' },
                  { value: 'داخل مجمع', label: 'داخل مجمع' },
                  { value: 'داخل حي', label: 'داخل حي' },
                ]}
                value={optionalDetails.locationType || ''}
                onChange={v => updateOptional('locationType', v)}
              />
            </Field>
            <Field label="صلاحية الاستخدام">
              <EnumToggle
                options={[
                  { value: 'مكتب', label: 'مكتب' },
                  { value: 'عيادة', label: 'عيادة' },
                  { value: 'مطعم', label: 'مطعم' },
                  { value: 'معرض', label: 'معرض' },
                ]}
                value={optionalDetails.commercialSuitability || ''}
                onChange={v => updateOptional('commercialSuitability', v)}
              />
            </Field>
          </div>
        </div>
      )}

      {/* ── B2) Rent-specific dynamic fields (purpose === 'rent') ── */}
      {isRent && (
        <div className="rounded-xl border border-[#D4A853]/30 bg-[#D4A853]/5 p-3 space-y-3">
          <p className="text-xs font-bold text-[#D4A853] flex items-center gap-1.5">
            <Key className="h-3.5 w-3.5" /> تفاصيل الإيجار — ما يبحث عنه المستأجر
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Field label="دورية الإيجار">
              <EnumToggle
                options={[
                  { value: 'monthly', label: 'شهري' },
                  { value: 'annual', label: 'سنوي' },
                  { value: 'weekly', label: 'أسبوعي' },
                  { value: 'daily', label: 'يومي (إقامة قصيرة)' },
                ]}
                value={optionalDetails.rentPeriod || ''}
                onChange={v => updateOptional('rentPeriod', v as 'monthly' | 'annual' | 'weekly' | 'daily' | undefined)}
              />
            </Field>
            <Field label="التأثيث">
              <EnumToggle
                options={[
                  { value: 'yes', label: 'مفروش بالكامل' },
                  { value: 'partial', label: 'نصف مفروش' },
                  { value: 'no', label: 'فارغ' },
                ]}
                value={optionalDetails.rentFurnished || ''}
                onChange={v => updateOptional('rentFurnished', v as 'yes' | 'no' | 'partial' | undefined)}
              />
            </Field>
            <Field label="مدة العقد (أشهر)">
              <Input type="number" min={1} placeholder="مثال: 12" value={optionalDetails.rentContractDuration || ''}
                onChange={e => updateOptional('rentContractDuration', e.target.value)}
                className="border-[#E8E1D2] focus:ring-[#D4A853]/30 text-sm h-9" />
            </Field>
            <Field label="مبلغ التأمين">
              <Input type="text" placeholder="مثال: 5000 أو شهرين" value={optionalDetails.rentDeposit || ''}
                onChange={e => updateOptional('rentDeposit', e.target.value)}
                className="border-[#E8E1D2] focus:ring-[#D4A853]/30 text-sm h-9" />
            </Field>
            <Field label="طريقة الدفع">
              <EnumToggle
                options={[
                  { value: 'monthly', label: 'شهري' },
                  { value: 'quarterly', label: 'ربعي' },
                  { value: 'biannual', label: 'نصف سنوي' },
                  { value: 'annual', label: 'سنوي مسبق' },
                ]}
                value={optionalDetails.rentPaymentFrequency || ''}
                onChange={v => updateOptional('rentPaymentFrequency', v as 'monthly' | 'annual' | 'quarterly' | 'biannual' | undefined)}
              />
            </Field>
            <Field label="المرافق مشمولة؟">
              <YesNoToggle value={optionalDetails.rentIncludesUtilities} onChange={v => updateOptional('rentIncludesUtilities', v)} />
            </Field>
          </div>
          <Field label="جاهز للسكن فوراً؟">
            <YesNoToggle value={optionalDetails.rentImmediateMoveIn} onChange={v => updateOptional('rentImmediateMoveIn', v)} />
          </Field>
        </div>
      )}

      {/* ── B3) Evaluate-specific dynamic fields (purpose === 'evaluate') ── */}
      {isEvaluate && (
        <div className="rounded-xl border border-[#0D7C66]/30 bg-[#0D7C66]/5 p-3 space-y-3">
          <p className="text-xs font-bold text-[#0D7C66] flex items-center gap-1.5">
            <ClipboardCheck className="h-3.5 w-3.5" /> هدف التقييم — ماذا تريد من صدى العقار؟
          </p>
          <Field label="الهدف من التقييم">
            <EnumToggle
              options={[
                { value: 'estimate_value', label: 'تقدير القيمة السوقية' },
                { value: 'sell_or_rent_decision', label: 'هل أبيع أم أؤجّر؟' },
                { value: 'investment_feasibility', label: 'دراسة جدوى استثمارية' },
              ]}
              value={optionalDetails.evaluateGoal || ''}
              onChange={v => updateOptional('evaluateGoal', v as 'estimate_value' | 'sell_or_rent_decision' | 'investment_feasibility' | undefined)}
            />
          </Field>
          <p className="text-[10px] text-[#5B564C]/80 leading-relaxed">
            💡 سيحلّل صدى العقار بيانات العقار وموقعه وسوق الدولة والمدينة، ثم يقدّم:
            <br />• نطاقاً تقديرياً للقيمة السوقية
            <br />• مقارنة بالسعر المُدخل (أعلى/أدنى/مطابق للسوق)
            <br />• توصية واضحة بالأفضل (بيع/إيجار/احتفاظ/تحسين أولاً)
            <br />• تقدير العائد المتوقع ونسبة التقيّم
          </p>
        </div>
      )}

      {/* ── C) Smart features (per family) ── */}
      <div>
        <p className="text-xs font-bold text-[#5B564C] mb-2 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-[#D4A853]" />
          المميزات — اختر ما ينطبق
          {selectedFeatures.length > 0 && (
            <span className="text-[#0D7C66] font-normal">({selectedFeatures.length} مختارة)</span>
          )}
        </p>
        {features.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {features.map(feature => {
              const isSelected = selectedFeatures.includes(feature.value);
              const { Icon } = feature;
              // Cast to a uniform component type so TS doesn't trip on lucide's overloads
              const TypedIcon = Icon as ComponentType<{ className?: string; strokeWidth?: number }>;
              return (
                <button key={feature.value} onClick={() => toggleFeature(feature.value)}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border-2 transition-all duration-200 cursor-pointer text-right ${
                    isSelected ? 'border-[#0D7C66] bg-[#0D7C66]/8 shadow-sm'
                    : 'border-[#E8E1D2] bg-white hover:border-[#0D7C66]/30'}`}>
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-[#0D7C66]/15' : 'bg-[#F5F0E8]'}`}>
                    <TypedIcon className={`h-3.5 w-3.5 ${isSelected ? 'text-[#0D7C66]' : 'text-[#5B564C]'}`} strokeWidth={2} />
                  </div>
                  <span className={`text-xs font-medium flex-1 ${isSelected ? 'text-[#0D7C66] font-bold' : 'text-[#211F1A]'}`}>{feature.value}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-[#0D7C66] shrink-0" />}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-[#5B564C]/60 italic">اختر نوع عقار أولاً لعرض المميزات المناسبة</p>
        )}
      </div>

      {/* ── D) Essentials (5 quick optional fields merged in) — purpose-aware ── */}
      {isSale && (
        <div className="rounded-xl border border-[#D4A853]/20 bg-[#D4A853]/3 p-3 space-y-3">
          <p className="text-xs font-bold text-[#D4A853] flex items-center gap-1.5">
            <Wallet className="h-3.5 w-3.5" /> إضافات تُعزّز فرصة البيع (اختياري)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Field label="نوع الملكية / الوثيقة">
              <Input type="text" placeholder="مثال: صك إفرادي، طابو..." value={optionalDetails.ownershipType || ''}
                onChange={e => updateOptional('ownershipType', e.target.value)}
                className="border-[#E8E1D2] focus:ring-[#0D7C66]/30 text-sm h-9" />
            </Field>
            <Field label="رقم التواصل">
              <Input type="text" placeholder="مثال: واتساب 05x..." value={optionalDetails.contactPhone || ''}
                onChange={e => updateOptional('contactPhone', e.target.value)}
                className="border-[#E8E1D2] focus:ring-[#0D7C66]/30 text-sm h-9" />
            </Field>
            <Field label="حالة الإشغال">
              <EnumToggle
                options={[
                  { value: 'مأهول', label: 'مأهول' },
                  { value: 'فارغ', label: 'فارغ' },
                  { value: 'جاهز للسكن', label: 'جاهز للسكن' },
                ]}
                value={optionalDetails.occupancyStatus || ''}
                onChange={v => updateOptional('occupancyStatus', v)}
              />
            </Field>
            <Field label="هل يقبل التقسيط؟">
              <YesNoToggle value={optionalDetails.installmentAvailable} onChange={v => updateOptional('installmentAvailable', v)} />
            </Field>
          </div>
          <Field label="سبب البيع / ملاحظة إنسانية (اختياري)">
            <Input type="text" placeholder="مثال: الانتقال لمدينة أخرى..." value={optionalDetails.reasonForSale || ''}
              onChange={e => updateOptional('reasonForSale', e.target.value)}
              className="border-[#E8E1D2] focus:ring-[#0D7C66]/30 text-sm h-9" />
          </Field>
        </div>
      )}

      {isRent && (
        <div className="rounded-xl border border-[#D4A853]/20 bg-[#D4A853]/3 p-3 space-y-3">
          <p className="text-xs font-bold text-[#D4A853] flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" /> إضافات تُعزّز ثقة المستأجر (اختياري)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Field label="رقم التواصل">
              <Input type="text" placeholder="مثال: واتساب 05x..." value={optionalDetails.contactPhone || ''}
                onChange={e => updateOptional('contactPhone', e.target.value)}
                className="border-[#E8E1D2] focus:ring-[#D4A853]/30 text-sm h-9" />
            </Field>
            <Field label="حالة الإشغال">
              <EnumToggle
                options={[
                  { value: 'مأهول', label: 'مأهول حتى تاريخ' },
                  { value: 'فارغ', label: 'فارغ' },
                  { value: 'جاهز للسكن', label: 'جاهز للسكن فوراً' },
                ]}
                value={optionalDetails.occupancyStatus || ''}
                onChange={v => updateOptional('occupancyStatus', v)}
              />
            </Field>
          </div>
        </div>
      )}

      {isEvaluate && (
        <div className="rounded-xl border border-[#0D7C66]/20 bg-[#0D7C66]/3 p-3 space-y-3">
          <p className="text-xs font-bold text-[#0D7C66] flex items-center gap-1.5">
            <FileCheck className="h-3.5 w-3.5" /> بيانات تُحسّن دقة التقييم (اختياري)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Field label="نوع الملكية / الوثيقة">
              <Input type="text" placeholder="مثال: صك إفرادي، طابو..." value={optionalDetails.ownershipType || ''}
                onChange={e => updateOptional('ownershipType', e.target.value)}
                className="border-[#E8E1D2] focus:ring-[#0D7C66]/30 text-sm h-9" />
            </Field>
            <Field label="حالة الإشغال">
              <EnumToggle
                options={[
                  { value: 'مأهول', label: 'مأهول' },
                  { value: 'فارغ', label: 'فارغ' },
                  { value: 'جاهز للسكن', label: 'جاهز للسكن' },
                ]}
                value={optionalDetails.occupancyStatus || ''}
                onChange={v => updateOptional('occupancyStatus', v)}
              />
            </Field>
            <Field label="العائد الإيجاري المتوقع (إن معروف)">
              <Input type="text" placeholder="مثال: 60,000 سنوياً" value={optionalDetails.expectedRent || ''}
                onChange={e => updateOptional('expectedRent', e.target.value)}
                className="border-[#E8E1D2] focus:ring-[#0D7C66]/30 text-sm h-9" />
            </Field>
            <Field label="العائد على الاستثمار المتوقع">
              <Input type="text" placeholder="مثال: 7% سنوياً" value={optionalDetails.expectedROI || ''}
                onChange={e => updateOptional('expectedROI', e.target.value)}
                className="border-[#E8E1D2] focus:ring-[#0D7C66]/30 text-sm h-9" />
            </Field>
          </div>
          <Field label="مشاريع تنموية محيطة (اختياري)">
            <Input type="text" placeholder="مثال: مترو جديد، مول، مشروع حكومي..." value={optionalDetails.surroundingProjects || ''}
              onChange={e => updateOptional('surroundingProjects', e.target.value)}
              className="border-[#E8E1D2] focus:ring-[#0D7C66]/30 text-sm h-9" />
          </Field>
        </div>
      )}

      {/* ── E) Free-text notes (for the pro who wants to add more) ── */}
      <div>
        <Field label="ملاحظات إضافية (اختياري)" hint="للمحترف: أضف أي تفاصيل تريد ذكرها في الإعلان — سيُدمجها صدى العقار باحتراف">
          <textarea
            placeholder="مثال: قرب الجامعة، إطلالة على الحديقة، تشطيب رخام طبيعي، تكييف مركزي..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={2}
            className="w-full border border-[#E8E1D2] rounded-md px-3 py-2 text-sm focus:ring-[#0D7C66]/30 focus:outline-none resize-none bg-white"
          />
        </Field>
      </div>

      <div className="bg-[#0D7C66]/5 rounded-lg p-3 border border-[#0D7C66]/15">
        <p className="text-xs text-[#0D7C66] font-medium">
          {isRent
            ? '💡 المستأجر يقرر بسرعة — كلما كنت واضحاً في الإيجار والتأثيث والجاهزية، زادت فرصة تواصله'
            : isEvaluate
            ? '💡 كلما أضفت بيانات أدق (الملكية، العائد المتوقع، المشاريع المحيطة)، زادت دقة التقييم والتوصية'
            : '💡 كلما أضفت تفاصيل أكثر، زاد مصداقية الإعلان — وستُولّد صورة احترافية تلقائياً تناسب عقارك'}
        </p>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * PlatformAndMode — Step 4. Platform selection + post mode (short/full/custom)
 * with the custom-sections checklist. Lifted out of the old Step 6 unchanged
 * in behavior, just encapsulated for clarity.
 * ════════════════════════════════════════════════════════════════════════ */
function PlatformAndMode({
  platform, setPlatform,
  postMode, setPostMode,
  customSections,
  toggleCustomSection,
  PlatformIcon,
}: {
  platform: Platform | '';
  setPlatform: (p: Platform) => void;
  postMode: PostMode | '';
  setPostMode: (m: PostMode) => void;
  customSections: string[];
  toggleCustomSection: (id: string) => void;
  PlatformIcon: React.FC<{ platform: Platform; className?: string }>;
}) {
  return (
    <div className="space-y-5">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-[#211F1A]">أين ستنشر؟ وبأي نمط؟</h3>
        <p className="text-sm text-[#5B564C] mt-1">اختر المنصة ونمط البوست — يمكنك لاحقاً التبديل بين المنصات</p>
      </div>

      {/* ── Platform selection ── */}
      <div>
        <Label className="text-[#5B564C] font-medium mb-2 block">المنصة <span className="text-[#E0793C]">*</span></Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {PLATFORMS.map(p => (
            <button key={p.value} onClick={() => setPlatform(p.value)}
              className={`relative flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer text-right ${
                platform === p.value ? `${p.activeBorder} ${p.activeBg} shadow-md`
                : 'border-[#E8E1D2] bg-white hover:border-[#0D7C66]/30'}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                platform === p.value ? p.activeBg : 'bg-[#F5F0E8]'}`}>
                <PlatformIcon platform={p.value} className={`h-5 w-5 ${p.tabColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-[#211F1A]">{p.name}</p>
                <p className="text-[11px] text-[#5B564C] mt-0.5 truncate">{p.description}</p>
              </div>
              {platform === p.value && <Check className="h-4 w-4 text-[#0D7C66] shrink-0" />}
            </button>
          ))}
        </div>
      </div>

      {/* ── Post mode selection ── */}
      <div>
        <Label className="text-[#5B564C] font-medium mb-2 block">نمط البوست <span className="text-[#E0793C]">*</span></Label>
        <div className="grid grid-cols-1 gap-2.5">
          {POST_MODES.map(m => {
            const isSelected = postMode === m.value;
            const Icon = m.value === 'short' ? Zap : m.value === 'full' ? Layers : SlidersHorizontal;
            return (
              <button key={m.value} onClick={() => setPostMode(m.value)}
                className={`relative flex items-start gap-3 p-3.5 rounded-xl border-2 transition-all duration-200 cursor-pointer text-right ${
                  isSelected ? 'border-[#0D7C66] bg-[#0D7C66]/8 shadow-md'
                  : 'border-[#E8E1D2] bg-white hover:border-[#0D7C66]/30'}`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  isSelected ? 'bg-[#0D7C66]/15' : 'bg-[#F5F0E8]'}`}>
                  <Icon className={`h-5 w-5 ${isSelected ? 'text-[#0D7C66]' : 'text-[#5B564C]'}`} strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-sm ${isSelected ? 'text-[#0D7C66]' : 'text-[#211F1A]'}`}>{m.label}</p>
                  <p className="text-[11px] text-[#5B564C] mt-0.5">{m.desc}</p>
                </div>
                {isSelected && <Check className="h-4 w-4 text-[#0D7C66] shrink-0 mt-1" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Custom sections checklist (only when postMode === 'custom') ── */}
      {postMode === 'custom' && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ duration: 0.25 }}>
          <div className="rounded-xl border-2 border-[#0D7C66]/30 bg-[#0D7C66]/3 p-3">
            <p className="text-xs font-bold text-[#0D7C66] mb-2.5 flex items-center gap-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              اختر الأقسام التي تريد إدراجها في البوست
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CUSTOM_SECTIONS.map(s => {
                const on = customSections.includes(s.id);
                return (
                  <button key={s.id} onClick={() => toggleCustomSection(s.id)}
                    className={`flex items-start gap-2 p-2.5 rounded-lg border text-right transition-all cursor-pointer ${
                      on ? 'border-[#0D7C66] bg-[#0D7C66]/10'
                      : 'border-[#E8E1D2] bg-white hover:border-[#0D7C66]/40'}`}>
                    <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 mt-0.5 ${on ? 'bg-[#0D7C66]' : 'border border-[#C8C0B0]'}`}>
                      {on && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold ${on ? 'text-[#0D7C66]' : 'text-[#211F1A]'}`}>{s.label}</p>
                      <p className="text-[10px] text-[#5B564C] mt-0.5 leading-tight">{s.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
            {customSections.length === 0 && (
              <p className="text-[10px] text-[#E0793C] mt-2 text-center">⚠️ اختر قسماً واحداً على الأقل، أو بدّل إلى نمط آخر</p>
            )}
            {customSections.length > 0 && (
              <p className="text-[10px] text-[#0D7C66] mt-2 text-center font-medium">✅ تم اختيار {customSections.length} قسم</p>
            )}
          </div>
        </motion.div>
      )}

      <div className="bg-[#D4A853]/5 rounded-lg p-3 border border-[#D4A853]/15">
        <p className="text-xs text-[#D4A853] font-medium">💡 بعد الكتابة، يمكنك التبديل بين المنصات المختلفة لنفس العقار بضغطة واحدة</p>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────

export default function InteractiveDemo() {
  const [step, setStep] = useState<Step>(1);
  const [direction, setDirection] = useState(1);

  // Form
  const [propertyType, setPropertyType] = useState('');
  const [family, setFamily] = useState<PropertyFamily | ''>('');
  // ── Purpose: MANDATORY selection (sale | rent | evaluate).
  //    No default — the user MUST choose one before proceeding. This drives
  //    the entire marketing angle (buyer vs tenant vs advisory).
  const [purpose, setPurpose] = useState<Purpose | ''>('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [customCity, setCustomCity] = useState('');
  const [customArea, setCustomArea] = useState('');
  const [area, setArea] = useState('');
  const [rooms, setRooms] = useState('');
  const [price, setPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [platform, setPlatform] = useState<Platform | ''>('');

  // ── Optional details (the "essentials" subset merged into Step 3) ──
  const [optionalDetails, setOptionalDetails] = useState<OptionalDetails>({});
  const [postMode, setPostMode] = useState<PostMode | ''>('');
  const [customSections, setCustomSections] = useState<string[]>([]);

  // Results (per-platform cache)
  const [results, setResults] = useState<Partial<Record<Platform, GeneratedResult>>>({});
  const [activePlatform, setActivePlatform] = useState<Platform | ''>('');
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState<'up' | 'down' | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // ── Background-training hooks ──
  // visitorId: stable anonymous ID per browser (the key to the per-user
  //   StyleProfile that makes content evolve and differ between users).
  // generationCount: client-side mirror for instant UI feedback.
  const visitorId = useVisitorId();
  const [generationCount, bumpGenerationCount] = useGenerationCount();
  const daily = useDailyGenerationCount();
  const adminMode = typeof window !== 'undefined' && isAdminMode();

  const previewRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  // Derived
  const countryData = COUNTRIES.find(c => c.value === country);
  const currency = countryData?.currency || 'ريال';
  const availableCities = CITIES_BY_COUNTRY[country] || [];
  const effectiveCity = customCity || city;

  // Current result for active platform
  const currentResult = activePlatform ? results[activePlatform] : null;

  const canProceed = (): boolean => {
    switch (step) {
      case 1: return !!propertyType && !!purpose; // both type AND purpose mandatory
      case 2: return !!country && (!!city || !!customCity);
      case 3: return true; // details — always skippable (price/area optional)
      case 4: return !!platform && !!postMode;
      default: return false;
    }
  };

  const goNext = () => {
    if (step < 4 && canProceed()) {
      setDirection(1);
      setStep((step + 1) as Step);
      // Scroll the demo section into view so the next step is visible
      setTimeout(() => {
        document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  };
  const goPrev = () => {
    if (step > 1) {
      setDirection(-1);
      setStep((step - 1) as Step);
      setTimeout(() => {
        document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  };

  // ── When property type changes, auto-set the family + clear features that
  //    don't belong to the new family (so we never carry "مسبح" into a land). ──
  const handlePropertyTypeChange = useCallback((val: string) => {
    setPropertyType(val);
    const newFamily = PROPERTY_FAMILY_MAP[val] || 'residential';
    setFamily(newFamily);
    // Drop any selected feature that isn't in the new family's feature list
    const allowed = new Set(FAMILY_FEATURES[newFamily]);
    setSelectedFeatures(prev => prev.filter(f => allowed.has(f)));
    // Clear rooms if land (land has no rooms)
    if (newFamily === 'land') {
      setRooms('');
      // Also clear land-irrelevant optional fields
      setOptionalDetails(prev => {
        const next = { ...prev };
        delete next.bathrooms; delete next.floor; delete next.totalFloors;
        delete next.yearBuilt; delete next.finishType; delete next.majlisCount;
        delete next.ceilingHeight; delete next.facadeType;
        delete next.gardenArea; delete next.roofArea; delete next.maidRoom;
        delete next.independentEntrance;
        return next;
      });
    }
  }, []);

  const handleCountryChange = useCallback((val: string) => { setCountry(val); setCity(''); setCustomCity(''); }, []);

  const toggleFeature = useCallback((feature: string) => {
    setSelectedFeatures(prev => prev.includes(feature) ? prev.filter(f => f !== feature) : [...prev, feature]);
  }, []);

  // ── NEW: update a single optional-details field ──
  const updateOptional = useCallback(<K extends keyof OptionalDetails>(key: K, value: OptionalDetails[K]) => {
    setOptionalDetails(prev => {
      const next = { ...prev };
      if (value === '' || value === undefined || value === null ||
          (Array.isArray(value) && value.length === 0)) {
        delete next[key];
      } else {
        next[key] = value;
      }
      return next;
    });
  }, []);

  // ── NEW: toggle a custom section (for postMode === 'custom') ──
  const toggleCustomSection = useCallback((id: string) => {
    setCustomSections(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  }, []);

  const copyToClipboard = useCallback(async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      toast.success('تم النسخ!', { description: 'تم نسخ النص إلى الحافظة', duration: 2000 });
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      toast.error('فشل النسخ', { description: 'حاول مرة أخرى' });
    }
  }, []);

  const copyAllContent = useCallback(async () => {
    if (!currentResult) return;
    let fullText = currentResult.content;
    if (currentResult.hashtags && currentResult.hashtags !== 'لا يوجد') fullText += '\n\n' + currentResult.hashtags;
    await copyToClipboard(fullText, 'all');
  }, [currentResult, copyToClipboard]);

  const downloadAsImage = useCallback(async () => {
    const el = exportRef.current;
    if (!el || !currentResult || !activePlatform) return;
    const toastId = toast.loading('جارٍ تجهيز الصورة...', { description: 'قد يستغرق ذلك بضع ثوانٍ' });
    // Make the export div visible for rendering
    el.style.position = 'fixed';
    el.style.left = '-9999px';
    el.style.top = '0';
    el.style.zIndex = '-1';
    el.style.display = 'block';
    try {
      // Small delay to let browser render
      await new Promise(r => setTimeout(r, 250));

      const canvas = await html2canvas(el, {
        backgroundColor: '#FBF8F2',
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
      });

      const link = document.createElement('a');
      const platName = PLATFORMS.find(p => p.value === activePlatform)?.name || activePlatform;
      const rp = currentResult.resolvedProperty;
      // Use the resolved property type (matches the copy) in the filename
      const fileName = `صدى-العقار-${rp.type}-${rp.location.split('،')[0]}-${platName}.png`;
      link.download = fileName;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('تم تنزيل الصورة!', { id: toastId, description: 'تحقّق من مجلد التنزيلات', duration: 3000 });
    } catch (err) {
      console.error('[downloadAsImage] failed:', err);
      toast.error('فشل التنزيل', { id: toastId, description: 'جرّب زر «نسخ النص» بدلاً من ذلك', duration: 5000 });
    } finally {
      // Always hide the export div again
      el.style.display = 'none';
      el.style.position = 'absolute';
      el.style.left = '-9999px';
    }
  }, [currentResult, activePlatform]);

  const submitRating = useCallback(async (type: 'up' | 'down') => {
    if (!currentResult?.sessionId || rating) return;
    setRating(type);
    try {
      await fetch('/api/demo/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: currentResult.sessionId, rating: type, visitorId }),
      });
      toast.success(
        type === 'up' ? 'شكراً لتقييمك! 👍 سنتعلّم من تفضيلاتك' : 'شكراً لملاحظتك! 👎 سنتجنّب هذا الأسلوب لاحقاً',
        { duration: 2500 },
      );
    } catch { /* silent */ }
  }, [currentResult, rating, visitorId]);

  const generateForPlatform = useCallback(async (targetPlatform: Platform, opts?: { forceAngle?: string; isRegenerate?: boolean }) => {
    if (!propertyType || !country || !effectiveCity) {
      toast.error('بيانات ناقصة', { description: 'يرجى إكمال جميع الخطوات المطلوبة' });
      return;
    }
    if (!purpose) {
      toast.error('اختَر الغرض', { description: 'للبيع أو للإيجار أو تقييم واستشارة' });
      return;
    }
    if (!postMode) {
      toast.error('اختَر نمط البوست', { description: 'مختصر أو كامل أو مخصّص' });
      return;
    }
    // ── Daily free-cap gate ──
    // If the visitor hit the daily limit (client-side check), show a prompt
    // to register/subscribe instead of calling the API. The server enforces
    // this too (429 response), but this avoids a wasted round-trip.
    if (daily.isLimited && !adminMode && !adminMode) {
      toast.error('بلغت الحد اليومي المجاني', {
        description: 'سجّل بالأسفل للمتابعة، أو اشترك كداعم لاستخدام بلا حدود.',
        duration: 6000,
        action: {
          label: 'سجّل الآن',
          onClick: () => {
            document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' });
          },
        },
      });
      return;
    }
    setLoading(true);
    try {
      const variationSeed = makeVariationSeed();
      // ── Build a CLEAN optionalDetails object (drop empty values) ──
      const cleanOptional: OptionalDetails = {};
      for (const [k, v] of Object.entries(optionalDetails)) {
        if (v !== '' && v !== undefined && v !== null &&
            !(Array.isArray(v) && v.length === 0)) {
          (cleanOptional as Record<string, unknown>)[k] = v;
        }
      }
      const hasOptional = Object.keys(cleanOptional).length > 0;
      const res = await fetch('/api/demo/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyType, family, purpose,
          city: effectiveCity, country, area, rooms, price, currency,
          features: selectedFeatures, platform: targetPlatform, customArea, customCity,
          notes: notes.trim() || undefined,
          visitorId, variationSeed,
          adminKey: adminMode ? 'sada-admin-2026' : undefined,
          forceAngle: opts?.forceAngle,
          isRegenerate: opts?.isRegenerate,
          optionalDetails: hasOptional ? cleanOptional : undefined,
          postMode: postMode || undefined,
          customSections: postMode === 'custom' && customSections.length > 0 ? customSections : undefined,
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        // Handle the server-side daily-limit response (HTTP 429) specially:
        // force the client counter to the limit so the UI matches the server.
        if (res.status === 429 && errData?.kind === 'daily_limit_reached') {
          for (let i = daily.todayCount; i < (errData.limit || daily.limit); i++) daily.bump();
        }
        throw new Error(errData.error || 'حدث خطأ');
      }
      const data = await res.json();
      // Capture a snapshot of the property data used for THIS generation (for the
      // auto-generated image + export). The DISPLAYED property data bar, however,
      // uses data.resolvedProperty so it always matches the marketing copy exactly.
      const snapshot: PropertySnapshot = {
        propertyType,
        city: effectiveCity,
        country,
        customArea,
        area,
        rooms,
        price,
        currency,
        features: [...selectedFeatures],
        optionalDetails: hasOptional ? cleanOptional : undefined,
        postMode: postMode || undefined,
        customSections: postMode === 'custom' && customSections.length > 0 ? [...customSections] : undefined,
      };
      // For land, resolvedProperty should not include rooms
      const isLandProp = family === 'land';
      // Build resolvedProperty from the API response; fall back to the snapshot
      // so the bar is never empty even if the LLM omitted the field.
      const resolvedProperty: ResolvedProperty = data.resolvedProperty
        ? {
            type: data.resolvedProperty.type || snapshot.propertyType,
            location: data.resolvedProperty.location
              || [snapshot.customArea, snapshot.city, snapshot.country].filter(Boolean).join('، '),
            area: data.resolvedProperty.area || (snapshot.area ? snapshot.area + ' م²' : undefined),
            rooms: isLandProp ? undefined : (data.resolvedProperty.rooms || (snapshot.rooms ? snapshot.rooms + ' غرف' : undefined)),
            price: data.resolvedProperty.price || (snapshot.price ? Number(snapshot.price).toLocaleString('ar-SA') + ' ' + snapshot.currency : undefined),
            features: Array.isArray(data.resolvedProperty.features) && data.resolvedProperty.features.length > 0
              ? data.resolvedProperty.features
              : snapshot.features,
          }
        : {
            type: snapshot.propertyType,
            location: [snapshot.customArea, snapshot.city, snapshot.country].filter(Boolean).join('، '),
            area: snapshot.area ? snapshot.area + ' م²' : undefined,
            rooms: isLandProp ? undefined : (snapshot.rooms ? snapshot.rooms + ' غرف' : undefined),
            price: snapshot.price ? Number(snapshot.price).toLocaleString('ar-SA') + ' ' + snapshot.currency : undefined,
            features: snapshot.features,
          };
      const newResult: GeneratedResult = {
        content: data.content,
        hashtags: data.hashtags,
        headline: data.headline,
        sessionId: data.sessionId || '',
        snapshot,
        resolvedProperty,
        variationAngle: data.variationAngle || '',
        variationSeed: data.variationSeed || variationSeed,
      };
      setResults(prev => ({ ...prev, [targetPlatform]: newResult }));
      setActivePlatform(targetPlatform);
      if (opts?.isRegenerate || !opts) {
        bumpGenerationCount();
        daily.bump();
      }

      // ✅ تتبع توليد المحتوى في لوحة التحكم
      if (typeof window !== 'undefined' && window.sada) {
        (window.__sadaSafeTrack || (() => {}))('generate', {
          label: 'كتابة محتوى عقاري',
          category: 'content',
          value: 1,
        });
      }
    } catch (err) {
      toast.error('خطأ في الكتابة', { description: err instanceof Error ? err.message : 'يرجى المحاولة مرة أخرى' });
    } finally { setLoading(false); }
  }, [propertyType, family, purpose, country, effectiveCity, area, rooms, price, currency, selectedFeatures, customArea, customCity, notes, visitorId, bumpGenerationCount, daily, optionalDetails, postMode, customSections]);

  const handleGenerate = useCallback(async () => {
    if (!platform || !postMode) return;
    setRating(null);
    await generateForPlatform(platform as Platform);
  }, [platform, postMode, generateForPlatform]);

  // Switch to a different platform tab (generate if not cached)
  const switchPlatformTab = useCallback(async (targetPlatform: Platform) => {
    if (loading) return;
    setActivePlatform(targetPlatform);
    setRating(null);
    if (!results[targetPlatform]) {
      await generateForPlatform(targetPlatform);
    }
  }, [loading, results, generateForPlatform]);

  const resetAll = () => {
    setResults({});
    setRating(null);
    setStep(1);
    setActivePlatform('');
    setPropertyType(''); setFamily(''); setPurpose('');
    setCountry(''); setCity(''); setCustomCity(''); setCustomArea('');
    setArea(''); setRooms(''); setPrice(''); setNotes('');
    setSelectedFeatures([]); setPlatform('');
    setOptionalDetails({}); setPostMode(''); setCustomSections([]);
  };

  // ── "Regenerate" — produce a FRESH variation for the current platform.
  // We deliberately pick a DIFFERENT style angle than the one currently shown,
  // so the user always sees visibly different copy (never a repeat). This is a
  // key part of the "no two results are the same" promise.
  const handleRegenerate = useCallback(async () => {
    if (!activePlatform || loading) return;
    const currentAngle = results[activePlatform as Platform]?.variationAngle;
    // Pick a different angle from the available pool
    const otherAngles = VARIATION_ANGLES.map(a => a.key).filter(k => k !== currentAngle);
    const forcedAngle = otherAngles[Math.floor(Math.random() * otherAngles.length)];
    setRating(null);
    await generateForPlatform(activePlatform as Platform, { forceAngle: forcedAngle, isRegenerate: true });
    toast.success('تمت كتابة نسخة جديدة بأسلوب مختلف', { duration: 2000 });
  }, [activePlatform, loading, results, generateForPlatform]);

  // ─── Render: Step Content ──────────────────────────────

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-5">
            <div className="text-center mb-2">
              <h3 className="text-xl font-bold text-[#211F1A]">ما الغرض من العقار؟ وما نوعه؟</h3>
              <p className="text-sm text-[#5B564C] mt-1">اختر الغرض أولاً (إلزامي) ثم نوع العقار — سيُكيّف صدى العقار الأسئلة والمحتوى حسب اختيارك</p>
            </div>

            {/* ── Purpose selection (MANDATORY) — 3 prominent cards with study-based priorities ── */}
            <div>
              <Label className="text-[#5B564C] font-medium mb-2 block flex items-center gap-1">
                الغرض من الطرح <span className="text-[#E0793C]">*</span>
                <span className="text-[10px] text-[#5B564C]/70 mr-1 font-normal">(إلزامي — يحدد جمهور المحتوى وزاوية الإقناع)</span>
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {PURPOSE_OPTIONS.map(opt => {
                  const isSelected = purpose === opt.value;
                  // Per-purpose accent color
                  const accent = opt.value === 'sale'
                    ? { ring: 'border-[#0D7C66]', bg: 'bg-[#0D7C66]/8', text: 'text-[#0D7C66]', chip: 'bg-[#0D7C66]/15' }
                    : opt.value === 'rent'
                    ? { ring: 'border-[#D4A853]', bg: 'bg-[#D4A853]/8', text: 'text-[#D4A853]', chip: 'bg-[#D4A853]/15' }
                    : { ring: 'border-[#0D7C66]', bg: 'bg-[#0D7C66]/8', text: 'text-[#0D7C66]', chip: 'bg-[#0D7C66]/15' };
                  const Icon = opt.value === 'sale' ? Tag : opt.value === 'rent' ? Key : ClipboardCheck;
                  return (
                    <button key={opt.value} type="button" onClick={() => setPurpose(opt.value)}
                      className={`relative flex flex-col gap-2 p-3.5 rounded-xl border-2 transition-all duration-200 cursor-pointer text-right ${
                        isSelected ? `${accent.ring} ${accent.bg} shadow-md`
                        : 'border-[#E8E1D2] bg-white hover:border-[#0D7C66]/40'}`}>
                      <div className="flex items-center gap-2">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? accent.chip : 'bg-[#F5F0E8]'}`}>
                          <Icon className={`h-4.5 w-4.5 ${isSelected ? accent.text : 'text-[#5B564C]'}`} strokeWidth={2} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-bold text-sm flex items-center gap-1.5 ${isSelected ? accent.text : 'text-[#211F1A]'}`}>
                            <span>{opt.emoji}</span>
                            <span>{opt.label}</span>
                          </p>
                        </div>
                        {isSelected && <Check className={`h-4 w-4 ${accent.text} shrink-0`} />}
                      </div>
                      <p className="text-[11px] text-[#5B564C] leading-tight">{opt.shortDesc}</p>
                      {isSelected && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden">
                          <div className={`mt-1 pt-2 border-t ${accent.ring}/20 border-t-[1px]`}>
                            <p className={`text-[10px] font-bold ${accent.text} mb-1`}>🎯 أولويات المحتوى:</p>
                            <ul className="space-y-0.5">
                              {opt.priorities.slice(0, 4).map((p, i) => (
                                <li key={i} className="text-[10px] text-[#5B564C] leading-tight flex items-start gap-1">
                                  <span className={`inline-block w-1 h-1 rounded-full ${accent.text} bg-current mt-1.5 shrink-0`} />
                                  <span>{p.split('—')[0].trim()}</span>
                                </li>
                              ))}
                            </ul>
                            <p className={`text-[10px] italic ${accent.text} mt-1.5`}>💡 {opt.selectedHint}</p>
                          </div>
                        </motion.div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Property types grouped by family ── */}
            <div>
              <Label className="text-[#5B564C] font-medium mb-2 block flex items-center gap-1">
                نوع العقار <span className="text-[#E0793C]">*</span>
                <span className="text-[10px] text-[#5B564C]/70 mr-1 font-normal">(إلزامي)</span>
              </Label>
              <div className="space-y-3">
                {(['residential', 'villa', 'land', 'building', 'commercial'] as PropertyFamily[]).map(fam => {
                  const typesInFamily = (Object.keys(PROPERTY_FAMILY_MAP) as string[]).filter(t => PROPERTY_FAMILY_MAP[t] === fam);
                  return (
                    <div key={fam} className="space-y-2">
                      <p className="text-[11px] font-bold text-[#5B564C] uppercase tracking-wide flex items-center gap-1.5">
                        <span className="inline-block w-1 h-3 bg-[#0D7C66] rounded-full" />
                        {FAMILY_LABELS[fam]}
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {typesInFamily.map(type => {
                          const pt = PROPERTY_TYPES.find(p => p.value === type);
                          if (!pt) return null;
                          const isSelected = propertyType === type;
                          const { Icon } = pt;
                          return (
                            <button key={type} onClick={() => handlePropertyTypeChange(type)}
                              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                                isSelected ? 'border-[#0D7C66] bg-[#0D7C66]/8 shadow-md scale-[1.02]'
                                : 'border-[#E8E1D2] bg-white hover:border-[#0D7C66]/40 hover:shadow-sm'}`}>
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                                isSelected ? 'bg-[#0D7C66]/15' : 'bg-[#F5F0E8]'}`}>
                                <Icon className={`h-5 w-5 ${isSelected ? 'text-[#0D7C66]' : 'text-[#5B564C]'}`} strokeWidth={1.8} />
                              </div>
                              <span className={`text-xs font-bold ${isSelected ? 'text-[#0D7C66]' : 'text-[#211F1A]'}`}>{type}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {propertyType && family && purpose && (
              <div className="bg-[#0D7C66]/5 rounded-lg p-3 border border-[#0D7C66]/15 text-center">
                <p className="text-xs text-[#0D7C66] font-medium">
                  ✅ اخترت: {propertyType} — {getPurposeOption(purpose)?.label || ''}
                  <br />
                  <span className="text-[#5B564C]">
                    ستجد في الخطوات التالية الحقول المناسبة لـ«{FAMILY_LABELS[family]}» فقط، والمحتوى موجّه
                    {purpose === 'sale' ? ' للمشتري والمستثمر' : purpose === 'rent' ? ' للمستأجر' : ' لدراسة الجدوى والتقييم'}
                  </span>
                </p>
              </div>
            )}
            {(!propertyType || !purpose) && (
              <div className="bg-[#E0793C]/5 rounded-lg p-3 border border-[#E0793C]/20 text-center">
                <p className="text-xs text-[#E0793C] font-medium">
                  ⚠️ يرجى اختيار {!purpose && !propertyType ? 'الغرض ونوع العقار' : !purpose ? 'الغرض من الطرح (للبيع / للإيجار / تقييم)' : 'نوع العقار'} للمتابعة
                </p>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-5">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-[#211F1A]">أين يقع العقار؟</h3>
              <p className="text-sm text-[#5B564C] mt-1">حدد الدولة والمدينة — ويمكنك إضافة حي أو مدينة مخصصة</p>
            </div>
            <div>
              <Label className="text-[#5B564C] font-medium mb-2 block">الدولة <span className="text-[#E0793C]">*</span></Label>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-44 overflow-y-auto custom-scrollbar p-1">
                {COUNTRIES.map(c => (
                  <button key={c.value} onClick={() => handleCountryChange(c.value)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm transition-all duration-200 cursor-pointer ${
                      country === c.value ? 'border-[#0D7C66] bg-[#0D7C66]/8 font-bold text-[#0D7C66]'
                      : 'border-[#E8E1D2] bg-white hover:border-[#0D7C66]/40 text-[#211F1A]'}`}>
                    <span className="text-base">{c.flag}</span>
                    <span className="truncate">{c.value}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-[#5B564C] font-medium mb-2 block">المدينة <span className="text-[#E0793C]">*</span></Label>
              {availableCities.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-36 overflow-y-auto custom-scrollbar p-1">
                  {availableCities.map(c => (
                    <button key={c} onClick={() => { setCity(c); setCustomCity(''); }}
                      className={`px-3 py-2 rounded-lg border text-sm transition-all duration-200 cursor-pointer ${
                        city === c && !customCity ? 'border-[#D4A853] bg-[#D4A853]/8 font-bold text-[#D4A853]'
                        : 'border-[#E8E1D2] bg-white hover:border-[#D4A853]/40 text-[#211F1A]'}`}>
                      📍 {c}
                    </button>
                  ))}
                </div>
              ) : null}
              <div className="mt-2">
                <Label className="text-[#5B564C] text-xs font-medium mb-1.5 block">
                  <MapPin className="inline h-3 w-3 ml-1" />
                  أو اكتب اسم المدينة إن لم تظهر في القائمة
                </Label>
                <Input type="text" placeholder="مثال: حائل، كفر الشيخ، سيدي بلعباس..."
                  value={customCity} onChange={e => { setCustomCity(e.target.value); setCity(''); }}
                  className="border-[#E8E1D2] focus:ring-[#0D7C66]/30" />
              </div>
            </div>
            <div>
              <Label className="text-[#5B564C] text-xs font-medium mb-1.5 block">
                <MapPin className="inline h-3 w-3 ml-1" />
                منطقة / حي مخصص (اختياري)
              </Label>
              <Input type="text" placeholder="مثال: حي الورود، المرابع، الخزام..."
                value={customArea} onChange={e => setCustomArea(e.target.value)}
                className="border-[#E8E1D2] focus:ring-[#0D7C66]/30" />
              <p className="text-[10px] text-[#5B564C]/60 mt-1">أدخل اسم الحي أو المنطقة لجعل المحتوى أكثر تخصيصاً</p>
            </div>
          </div>
        );

      case 3:
        return (
          <SmartPropertyDetails
            family={family}
            purpose={purpose}
            area={area} setArea={setArea}
            rooms={rooms} setRooms={setRooms}
            price={price} setPrice={setPrice}
            currency={currency}
            notes={notes} setNotes={setNotes}
            selectedFeatures={selectedFeatures}
            toggleFeature={toggleFeature}
            optionalDetails={optionalDetails}
            updateOptional={updateOptional}
          />
        );

      case 4:
        return (
          <PlatformAndMode
            platform={platform} setPlatform={setPlatform}
            postMode={postMode} setPostMode={setPostMode}
            customSections={customSections}
            toggleCustomSection={toggleCustomSection}
            PlatformIcon={PlatformIcon}
          />
        );

      default: return null;
    }
  };

  // ─── Render: Platform Preview ──────────────────────────

  const renderPreview = () => {
    if (!activePlatform) return null;
    if (!currentResult) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-[#5B564C]">
          <Loader2 className="h-8 w-8 animate-spin text-[#0D7C66] mb-3" />
          <p className="text-sm font-bold">جارٍ كتابة المحتوى...</p>
        </div>
      );
    }

    // The preview uses resolvedProperty — the property data AS WRITTEN in the
    // content — so the auto-generated image and the location text always match
    // whatever the assistant actually wrote (villa vs apartment, etc.).
    const rp = currentResult.resolvedProperty;
    const snap = currentResult.snapshot;
    const imgType = rp.type;
    const imgLocation = rp.location;
    const imgArea = rp.area;     // already includes " م²" if present
    const imgRooms = rp.rooms;   // already includes " غرف" if present
    const imgFeatures = rp.features;

    // DefaultPropertyImage adds its own units (" م²", " غرف"), so strip them.
    // Fall back to the snapshot values (raw numbers) when resolved is missing.
    const rawArea = imgArea ? imgArea.replace(/\s*م²\s*$/, '').trim() : snap.area;
    const rawRooms = imgRooms ? imgRooms.replace(/\s*غرف\s*$/, '').trim() : snap.rooms;

    // Shared props for every DefaultPropertyImage in the previews — driven by
    // resolvedProperty so the image always matches the marketing copy.
    const imgProps = {
      propertyType: imgType,
      city: imgLocation,
      country: '',
      customArea: '',
      area: rawArea,
      rooms: rawRooms,
      price: snap.price,
      currency: snap.currency,
      features: imgFeatures,
    };

    return (
      <div ref={previewRef} className="rounded-xl overflow-hidden" dir="rtl">
        {/* ── Instagram Preview ── */}
        {activePlatform === 'instagram' && (
          <div className="bg-white rounded-xl overflow-hidden border border-[#DBDBDB]">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[#EFEFEF]">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] p-[2px] shrink-0">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] flex items-center justify-center text-white text-[9px] font-black">صدى</div>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#262626] text-sm font-bold">sadaaqar</p>
                <p className="text-[#8E8E8E] text-[10px] truncate">{imgLocation}</p>
              </div>
              <span className="text-[#262626] text-lg">•••</span>
            </div>
            <div className="relative aspect-square max-h-80 overflow-hidden">
              <DefaultPropertyImage
                propertyType={imgProps.propertyType}
                city={imgProps.city}
                country={imgProps.country}
                customArea={imgProps.customArea}
                area={imgProps.area}
                rooms={imgProps.rooms}
                price={imgProps.price}
                currency={imgProps.currency}
                features={imgProps.features}
                headline={currentResult.headline}
                className="aspect-square max-h-80"
              />
            </div>
            <div className="flex items-center gap-4 px-4 py-3">
              <Heart className="h-6 w-6 text-[#262626]" />
              <MessageCircle className="h-6 w-6 text-[#262626]" />
              <Send className="h-6 w-6 text-[#262626]" />
              <Bookmark className="h-6 w-6 text-[#262626] mr-auto" />
            </div>
            <div className="px-4 pb-1">
              <p className="text-[#262626] text-sm font-bold">١٢٨ إعجاب</p>
            </div>
            <div className="px-4 pb-3">
              <p className="text-sm text-[#262626] leading-relaxed whitespace-pre-wrap">
                <span className="font-bold">sadaaqar</span>{' '}
                {currentResult.content}
              </p>
              {currentResult.hashtags && currentResult.hashtags !== 'لا يوجد' && (
                <p className="text-sm text-[#00376B] mt-2 leading-relaxed">{currentResult.hashtags}</p>
              )}
              <p className="text-[10px] text-[#8E8E8E] mt-2">منذ ساعة واحدة</p>
            </div>
          </div>
        )}

        {/* ── Twitter/X Preview ── */}
        {activePlatform === 'twitter' && (
          <div className="bg-white rounded-xl overflow-hidden border border-[#EFF3F4]">
            <div className="px-4 pt-3 pb-1 flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#0D7C66] flex items-center justify-center text-white font-black text-sm shrink-0">صدى</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <p className="font-bold text-[#0F1419] text-[15px] truncate">صدى العقار</p>
                  <svg viewBox="0 0 22 22" className="h-[18px] w-[18px] text-[#1D9BF0] shrink-0"><path fill="currentColor" d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.855-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.69-.13.635-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.636.433 1.221.878 1.69.47.446 1.055.752 1.69.883.635.13 1.294.083 1.902-.141.27.587.7 1.086 1.24 1.44.54.354 1.167.551 1.813.568.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.224 1.26.272 1.893.141.634-.131 1.218-.437 1.687-.883.445-.469.749-1.054.878-1.69.13-.633.08-1.29-.144-1.896.587-.273 1.084-.705 1.438-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"/></svg>
                </div>
                <p className="text-[#5B6B7A] text-[13px]">@sadaaqar</p>
              </div>
              <span className="text-[#5B6B7A] text-[13px] shrink-0">· الآن</span>
            </div>
            <div className="px-4 pb-3">
              <p className="text-[#0F1419] text-[15px] leading-[22px] whitespace-pre-wrap">{currentResult.content}</p>
              {currentResult.hashtags && currentResult.hashtags !== 'لا يوجد' && (
                <p className="text-[#1D9BF0] text-[15px] mt-0.5">{currentResult.hashtags}</p>
              )}
              <div className="mt-3 rounded-2xl overflow-hidden border border-[#EFF3F4]">
                <DefaultPropertyImage
                  propertyType={imgProps.propertyType}
                  city={imgProps.city}
                  country={imgProps.country}
                  customArea={imgProps.customArea}
                  area={imgProps.area}
                  rooms={imgProps.rooms}
                  price={imgProps.price}
                  currency={imgProps.currency}
                  features={imgProps.features}
                  headline={currentResult.headline}
                  className="max-h-72"
                />
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#EFF3F4] text-[#5B6B7A] text-[13px] max-w-[425px]">
                <span className="flex items-center gap-1"><MessageCircle className="h-[18px] w-[18px]" /> ١٢</span>
                <span className="flex items-center gap-1"><Repeat2 className="h-[18px] w-[18px]" /> ٤٥</span>
                <span className="flex items-center gap-1"><Heart className="h-[18px] w-[18px]" /> ١٢٨</span>
                <span className="flex items-center gap-1"><BarChart3 className="h-[18px] w-[18px]" /> ٣.٢K</span>
                <span className="flex items-center gap-2"><Bookmark className="h-[18px] w-[18px]" /><Copy className="h-[18px] w-[18px]" /></span>
              </div>
            </div>
          </div>
        )}

        {/* ── Snapchat Preview ── */}
        {activePlatform === 'snapchat' && (
          <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#FFFC00' }}>
            <div className="relative flex flex-col items-center justify-center p-6 min-h-[320px] text-center"
              style={{ backgroundColor: '#FFFC00' }}>
              {/* Snap header bar */}
              <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <SnapchatIcon className="h-6 w-6 text-[#211F1A]" />
                  <span className="text-[#211F1A] text-sm font-black">صدى العقار</span>
                </div>
                <span className="text-[#211F1A] text-xs font-bold">الآن</span>
              </div>

              <div className="mt-8 w-full max-w-xs">
                <div className="rounded-2xl overflow-hidden mb-3 border-4 border-white shadow-lg h-40">
                  <DefaultPropertyImage
                    propertyType={imgProps.propertyType}
                    city={imgProps.city}
                    country={imgProps.country}
                    customArea={imgProps.customArea}
                    area={imgProps.area}
                    rooms={imgProps.rooms}
                    price={imgProps.price}
                    currency={imgProps.currency}
                    features={imgProps.features}
                    headline={currentResult.headline}
                    compact
                    className="h-40"
                  />
                </div>
                <div className="bg-white/20 rounded-2xl p-4 backdrop-blur-sm">
                  <p className="text-[#211F1A] font-black text-xl leading-snug">{currentResult.headline}</p>
                  <p className="text-[#211F1A]/80 text-sm mt-2 leading-relaxed whitespace-pre-wrap">{currentResult.content}</p>
                  {currentResult.hashtags && currentResult.hashtags !== 'لا يوجد' && (
                    <p className="text-[#211F1A]/50 text-xs mt-2">{currentResult.hashtags}</p>
                  )}
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-[#211F1A]" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[#211F1A] text-xs bg-white/50 px-4 py-2 rounded-full font-bold flex items-center gap-1">
                    ⬇️ إضافة للقصة
                  </span>
                  <span className="text-[#211F1A] text-xs bg-white/50 px-4 py-2 rounded-full font-bold flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" /> إرسال
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── WhatsApp Preview ── */}
        {activePlatform === 'whatsapp' && (
          <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#ECE5DD' }}>
            <div className="bg-[#075E54] px-4 py-2.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#128C7E] flex items-center justify-center text-white shrink-0">
                <Home className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-bold">صدى العقار</p>
                <p className="text-white/60 text-[10px]">متصل الآن</p>
              </div>
              <div className="flex items-center gap-4 text-white/70">
                <Camera className="h-5 w-5" />
                <MessageCircle className="h-5 w-5" />
                <span className="text-lg">•••</span>
              </div>
            </div>
            <div className="p-4 space-y-2" style={{ backgroundColor: '#ECE5DD' }}>
              <div className="relative max-w-[75%] mr-auto mb-2">
                <div className="rounded-lg overflow-hidden shadow-sm max-h-56">
                  <DefaultPropertyImage
                    propertyType={imgProps.propertyType}
                    city={imgProps.city}
                    country={imgProps.country}
                    customArea={imgProps.customArea}
                    area={imgProps.area}
                    rooms={imgProps.rooms}
                    price={imgProps.price}
                    currency={imgProps.currency}
                    features={imgProps.features}
                    headline={currentResult.headline}
                    compact
                    className="max-h-56"
                  />
                </div>
                <div className="bg-white rounded-lg rounded-tr-none p-3 shadow-sm border-l-[#DCF8C6] border-l-[3px] mt-1">
                  <p className="text-[#211F1A] text-[14px] leading-[22px] whitespace-pre-wrap">{currentResult.content}</p>
                  {currentResult.hashtags && currentResult.hashtags !== 'لا يوجد' && (
                    <p className="text-[#0D7C66] text-[13px] mt-2">{currentResult.hashtags}</p>
                  )}
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-[#8E9BA3] text-[11px]">10:30</span>
                    <span className="text-[#53BDEB] text-[11px]">✓✓</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-[#F0F0F0] px-3 py-2 flex items-center gap-2">
              <span className="flex items-center gap-2 flex-1 bg-white rounded-full px-4 py-2 text-xs text-[#8E9BA3]">
                <Copy className="h-3.5 w-3.5" /> اكتب رسالة...
              </span>
              <div className="w-9 h-9 rounded-full bg-[#075E54] flex items-center justify-center shrink-0">
                <Send className="h-4 w-4 text-white -rotate-45" />
              </div>
            </div>
          </div>
        )}

        {/* ── Facebook Preview ── */}
        {activePlatform === 'facebook' && (
          <div className="bg-white rounded-xl overflow-hidden border border-[#DADDE1]">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center text-white shrink-0">
                <Home className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#050505] text-sm font-bold">صدى العقار</p>
                <p className="text-[#65676B] text-[11px] flex items-center gap-1">
                  الآن · <Globe className="h-3 w-3 inline" />
                </p>
              </div>
              <span className="text-[#65676B] text-lg">•••</span>
            </div>
            <div className="px-4 pb-3">
              <p className="text-[#050505] text-[14px] leading-[20px] whitespace-pre-wrap">{currentResult.content}</p>
              {currentResult.hashtags && currentResult.hashtags !== 'لا يوجد' && (
                <p className="text-[#1877F2] text-[14px] mt-1">{currentResult.hashtags}</p>
              )}
            </div>
            <div className="border-t border-b border-[#DADDE1]">
              <DefaultPropertyImage
                propertyType={imgProps.propertyType}
                city={imgProps.city}
                country={imgProps.country}
                customArea={imgProps.customArea}
                area={imgProps.area}
                rooms={imgProps.rooms}
                price={imgProps.price}
                currency={imgProps.currency}
                features={imgProps.features}
                headline={currentResult.headline}
                className="max-h-80"
              />
            </div>
            <div className="flex items-center justify-around px-4 py-2 text-[#65676B] text-[12px] font-medium">
              <span className="flex items-center gap-1.5 hover:bg-[#F2F2F2] px-3 py-1.5 rounded cursor-pointer">
                <LikeIcon className="h-4 w-4" /> إعجاب
              </span>
              <span className="flex items-center gap-1.5 hover:bg-[#F2F2F2] px-3 py-1.5 rounded cursor-pointer">
                <MessageSquare className="h-4 w-4" /> تعليق
              </span>
              <span className="flex items-center gap-1.5 hover:bg-[#F2F2F2] px-3 py-1.5 rounded cursor-pointer">
                <Share2 className="h-4 w-4" /> مشاركة
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 border-t border-[#DADDE1]">
              <div className="w-7 h-7 rounded-full bg-[#E4E6EB] flex items-center justify-center">
                <LikeIcon className="h-3.5 w-3.5 text-[#1877F2]" />
              </div>
              <span className="text-[#65676B] text-[12px]">٢٥٦ · ٤٢ تعليق</span>
            </div>
          </div>
        )}

        {/* ── LinkedIn Preview ── */}
        {activePlatform === 'linkedin' && (
          <div className="bg-white rounded-xl overflow-hidden border border-[#E0DFDC]">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-12 h-12 rounded-full bg-[#0A66C2] flex items-center justify-center text-white shrink-0">
                <BriefcaseBusiness className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#000000E6] text-[14px] font-bold">صدى العقار</p>
                <p className="text-[#00000099] text-[12px]">مساعد التسويق العقاري · أول متابع</p>
                <p className="text-[#00000099] text-[11px] flex items-center gap-1 mt-0.5">
                  الآن · <Globe className="h-3 w-3 inline" />
                </p>
              </div>
              <span className="text-[#00000099] text-lg">•••</span>
            </div>
            <div className="px-4 pb-3">
              <p className="text-[#000000E6] text-[14px] leading-[20px] whitespace-pre-wrap">{currentResult.content}</p>
              {currentResult.hashtags && currentResult.hashtags !== 'لا يوجد' && (
                <p className="text-[#0A66C2] text-[13px] mt-2 font-medium">{currentResult.hashtags}</p>
              )}
            </div>
            <div className="border-t border-b border-[#E0DFDC]">
              <DefaultPropertyImage
                propertyType={imgProps.propertyType}
                city={imgProps.city}
                country={imgProps.country}
                customArea={imgProps.customArea}
                area={imgProps.area}
                rooms={imgProps.rooms}
                price={imgProps.price}
                currency={imgProps.currency}
                features={imgProps.features}
                headline={currentResult.headline}
                className="max-h-80"
              />
            </div>
            <div className="flex items-center justify-between px-4 py-2 border-b border-[#E0DFDC]">
              <span className="flex items-center gap-1 text-[#00000099] text-[12px]">
                <span className="flex -space-x-1">
                  <span className="w-4 h-4 rounded-full bg-[#0A66C2] border border-white"></span>
                  <span className="w-4 h-4 rounded-full bg-[#D4A853] border border-white"></span>
                  <span className="w-4 h-4 rounded-full bg-[#0D7C66] border border-white"></span>
                </span>
                محمود علي و٣٢ آخرون
              </span>
              <span className="text-[#00000099] text-[12px]">٨ تعليقات · ٣ مشاركات</span>
            </div>
            <div className="flex items-center justify-around px-2 py-1 text-[#00000099] text-[12px] font-medium">
              <span className="flex items-center gap-1.5 hover:bg-[#0000000D] px-3 py-2 rounded cursor-pointer flex-1 justify-center">
                <LikeIcon className="h-4 w-4" /> إعجاب
              </span>
              <span className="flex items-center gap-1.5 hover:bg-[#0000000D] px-3 py-2 rounded cursor-pointer flex-1 justify-center">
                <MessageSquare className="h-4 w-4" /> تعليق
              </span>
              <span className="flex items-center gap-1.5 hover:bg-[#0000000D] px-3 py-2 rounded cursor-pointer flex-1 justify-center">
                <Share2 className="h-4 w-4" /> إعادة نشر
              </span>
              <span className="flex items-center gap-1.5 hover:bg-[#0000000D] px-3 py-2 rounded cursor-pointer flex-1 justify-center">
                <Send className="h-4 w-4" /> إرسال
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ─── Render: Export Template (clean html2canvas-friendly) ──

  const renderExportTemplate = () => {
    if (!currentResult || !activePlatform) return null;
    const platName = PLATFORMS.find(p => p.value === activePlatform)?.name || '';
    const snap = currentResult.snapshot;
    const rp = currentResult.resolvedProperty;
    // The exported image uses resolvedProperty so the exported card always
    // matches the marketing copy (villa vs apartment, etc.).
    const rawArea = rp.area ? rp.area.replace(/\s*م²\s*$/, '').trim() : snap.area;
    const rawRooms = rp.rooms ? rp.rooms.replace(/\s*غرف\s*$/, '').trim() : snap.rooms;
    const exportPriceText = rp.price || (snap.price ? Number(snap.price).toLocaleString('ar-SA') + ' ' + snap.currency : '');

    return (
      <div ref={exportRef} style={{ display: 'none', position: 'absolute', left: '-9999px' }}>
        <div dir="rtl" style={{
          width: '540px',
          backgroundColor: '#FBF8F2',
          padding: '32px',
          fontFamily: 'Tajawal, sans-serif',
        }}>
          {/* Brand header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px',
            paddingBottom: '16px',
            borderBottom: '2px solid #E8E1D2',
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: '#0D7C66',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '14px',
              fontWeight: 900,
            }}>صدى</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#211F1A' }}>
                صدى <span style={{ color: '#D4A853' }}>العقار</span>
              </div>
              <div style={{ fontSize: '11px', color: '#5B564C' }}>محتوى تسويقي عقاري — {platName}</div>
            </div>
          </div>

          {/* Default property image (auto-generated, matches property data) */}
          <div style={{
            width: '100%',
            height: '260px',
            borderRadius: '12px',
            overflow: 'hidden',
            marginBottom: '16px',
          }}>
            <DefaultPropertyImage
              propertyType={rp.type}
              city={rp.location}
              country=""
              customArea=""
              area={rawArea}
              rooms={rawRooms}
              price={snap.price}
              currency={snap.currency}
              features={rp.features}
              headline={currentResult.headline}
              className="h-[260px]"
            />
          </div>

          {/* Property data card — uses resolvedProperty so it always matches the copy */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E8E1D2',
            padding: '16px',
            marginBottom: '16px',
          }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {[
                rp.type,
                rp.location,
                rp.area || '',
                rp.rooms || '',
                exportPriceText,
                ...rp.features.map(f => '✓ ' + f),
              ].filter(Boolean).map((item, i) => (
                <span key={i} style={{
                  display: 'inline-block',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  backgroundColor: '#F5F0E8',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#211F1A',
                }}>{item}</span>
              ))}
            </div>
          </div>

          {/* Content */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E8E1D2',
            padding: '20px',
          }}>
            {currentResult.headline && activePlatform !== 'snapchat' && (
              <div style={{
                fontSize: '18px',
                fontWeight: 800,
                color: '#211F1A',
                marginBottom: '12px',
                paddingBottom: '10px',
                borderBottom: '1px solid #E8E1D2',
              }}>{currentResult.headline}</div>
            )}
            <div style={{
              fontSize: '15px',
              lineHeight: '1.7',
              color: '#211F1A',
              whiteSpace: 'pre-wrap',
            }}>{currentResult.content}</div>
            {currentResult.hashtags && currentResult.hashtags !== 'لا يوجد' && (
              <div style={{
                fontSize: '13px',
                color: activePlatform === 'twitter' ? '#1D9BF0' : activePlatform === 'linkedin' ? '#0A66C2' : activePlatform === 'facebook' ? '#1877F2' : '#0D7C66',
                marginTop: '12px',
                paddingTop: '10px',
                borderTop: '1px solid #E8E1D2',
              }}>{currentResult.hashtags}</div>
            )}
          </div>

          {/* Footer watermark */}
          <div style={{
            marginTop: '16px',
            textAlign: 'center',
            fontSize: '11px',
            color: '#5B564C',
          }}>
            أنشئه بواسطة صدى العقار — مساعد التسويق العقاري
          </div>
        </div>
      </div>
    );
  };

  // ─── Main Render ───────────────────────────────────────

  const showResult = Object.keys(results).length > 0 && !!activePlatform && !!results[activePlatform];
  const theme = activePlatform ? PLATFORM_THEME[activePlatform] : null;

  // ═══ THE FIX ═══
  // The displayed property data bar now uses `resolvedProperty` — the property
  // data EXACTLY as it appears in the generated marketing content (returned by
  // the assistant), NOT the form snapshot. This guarantees the bar always
  // matches whatever copy was written below it: if the copy says "فيلا" the bar
  // shows "فيلا"; if it says "شقة" the bar shows "شقة". No more static bar with
  // varying content.
  const resolved = currentResult?.resolvedProperty;
  const rpType = resolved?.type ?? propertyType;
  const rpLocation = resolved?.location ?? [customArea, effectiveCity, country].filter(Boolean).join('، ');
  const rpArea = resolved?.area;
  const rpRooms = resolved?.rooms;
  const rpPrice = resolved?.price;
  const rpFeatures = resolved?.features ?? selectedFeatures;

  const propertyTypeData = PROPERTY_TYPES.find(pt => pt.value === rpType);
  const PropertyTypeIcon = propertyTypeData?.Icon || Home;

  // Build property data items — driven by resolvedProperty so they ALWAYS match
  // the marketing content written below.
  const propertyDataItems: { icon: React.ReactNode; label: string }[] = [
    { icon: <PropertyTypeIcon className={`h-3.5 w-3.5 ${theme?.iconColor || 'text-[#0D7C66]'}`} strokeWidth={2} />, label: rpType },
    { icon: <MapPin className={`h-3.5 w-3.5 ${theme?.iconColor || 'text-[#0D7C66]'}`} />, label: rpLocation },
    ...(rpArea ? [{ icon: <LandPlot className={`h-3.5 w-3.5 ${theme?.iconColor || 'text-[#0D7C66]'}`} />, label: rpArea }] : []),
    ...(rpRooms ? [{ icon: <Home className={`h-3.5 w-3.5 ${theme?.iconColor || 'text-[#0D7C66]'}`} />, label: rpRooms }] : []),
    ...(rpPrice ? [{ icon: <Gem className={`h-3.5 w-3.5 ${theme?.iconColor || 'text-[#0D7C66]'}`} />, label: rpPrice }] : []),
    ...(rpFeatures.length > 0 ? [{ icon: <Check className={`h-3.5 w-3.5 ${theme?.iconColor || 'text-[#0D7C66]'}`} />, label: rpFeatures.length + ' ميزة' }] : []),
  ];

  // Current variation angle name (for the learning indicator)
  const currentAngleName = currentResult?.variationAngle
    ? VARIATION_ANGLES.find(a => a.key === currentResult.variationAngle)?.name
    : undefined;

  return (
    <section id="demo" className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 scroll-mt-20">
      <div className="text-center mb-10">
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.5 }} className="text-3xl md:text-4xl font-bold text-[#211F1A] mb-4">
          جرّب <span className="grad-text">صدى العقار</span> الآن
        </motion.h2>
        <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }} className="text-[#5B564C] text-lg max-w-2xl mx-auto">
          ٤ خطوات سريعة — واحصل على محتوى تسويقي جاهز للنشر بلهجة بلدك
        </motion.p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="bg-white rounded-2xl border border-[#E8E1D2] shadow-sm overflow-hidden relative">
        {!showResult ? (
          <>
            {/* Progress bar */}
            <div className="px-6 pt-5 pb-2">
              <div className="flex items-center justify-between mb-2">
                {([1, 2, 3, 4] as Step[]).map(s => (
                  <div key={s} className="flex items-center gap-1">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      s < step ? 'bg-[#0D7C66] text-white' : s === step ? 'bg-[#0D7C66]/15 text-[#0D7C66] border-2 border-[#0D7C66]' : 'bg-[#F5F0E8] text-[#5B564C]'}`}>
                      {s < step ? <Check className="h-3.5 w-3.5" /> : s}
                    </div>
                    <span className={`text-[10px] hidden md:block ${s === step ? 'text-[#0D7C66] font-bold' : 'text-[#5B564C]'}`}>{STEP_LABELS[s]}</span>
                  </div>
                ))}
              </div>
              <div className="h-1.5 rounded-full bg-[#F5F0E8] overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-l from-[#0D7C66] to-[#D4A853] bar-fill"
                  style={{ width: `${((step - 1) / 3) * 100}%` }} />
              </div>
            </div>
            {/* Step content */}
            <div className="px-6 py-6 min-h-[320px]">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div key={step} custom={direction} variants={slideVariants}
                  initial="enter" animate="center" exit="exit" transition={{ duration: 0.3, ease: 'easeInOut' }}>
                  {renderStep()}
                </motion.div>
              </AnimatePresence>
            </div>
            {/* Navigation */}
            <div className="px-6 pb-5 flex items-center justify-between gap-4">
              <Button variant="outline" onClick={goPrev} disabled={step === 1}
                className="border-[#E8E1D2] text-[#5B564C] hover:border-[#0D7C66] hover:text-[#0D7C66] cursor-pointer">
                <ChevronRight className="h-4 w-4 ml-1" /> السابق
              </Button>
              {/* Daily quota indicator (only meaningful on the final step where generation happens) */}
              {step >= 4 && (
                <span className={`text-[11px] font-bold rounded-full px-3 py-1 border ${
                  daily.isLimited && !adminMode
                    ? 'bg-[#E0793C]/10 text-[#E0793C] border-[#E0793C]/30'
                    : daily.remaining <= 3
                    ? 'bg-[#D4A853]/10 text-[#D4A853] border-[#D4A853]/30'
                    : 'bg-[#0D7C66]/8 text-[#0D7C66] border-[#0D7C66]/20'
                }`} title={`حد اليوم: ${daily.limit} كتابة`}>
                  {daily.isLimited && !adminMode
                    ? 'بلغت الحد اليومي'
                    : `باقي ${daily.remaining} من ${daily.limit} كتابة اليوم`}
                </span>
              )}
              {step < 4 ? (
                <Button onClick={goNext} disabled={!canProceed()} className="bg-[#0D7C66] hover:bg-[#0a6b58] text-white cursor-pointer">
                  التالي <ChevronLeft className="h-4 w-4 mr-1" />
                </Button>
              ) : (
                <Button onClick={handleGenerate} disabled={!canProceed() || loading || daily.isLimited && !adminMode}
                  data-sada-track="generate-btn" data-sada-category="content"
                  className="bg-[#0D7C66] hover:bg-[#0a6b58] text-white font-bold px-8 cursor-pointer">
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin ml-1" /> جارٍ الكتابة...</>
                  : <><Sparkles className="h-4 w-4 ml-1" /> اكتب المحتوى</>}
                </Button>
              )}
            </div>
          </>
        ) : (
          <div className="p-6">
            {/* ── Smart CTA: after 3 writings, invite to register (filtering signal) ── */}
            {generationCount >= 3 && !daily.isLimited && !adminMode && (
              <div className="mb-5 rounded-xl border border-[#D4A853]/30 bg-gradient-to-l from-[#D4A853]/10 to-[#0D7C66]/5 p-4 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <p className="text-sm font-bold text-[#211F1A]">
                      أعجبك صدى العقار؟ كن من الأوائل
                    </p>
                    <p className="text-xs text-[#5B564C] mt-0.5">
                      سجّل مجاناً الآن — تحصل على أولوية في الإطلاق + ميزات حصرية للمسجّلين الأوائل.
                    </p>
                  </div>
                </div>
                <a
                  href="#lead-form"
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#0D7C66] hover:bg-[#0a6b58] text-white text-xs font-bold px-4 py-2 transition-colors cursor-pointer"
                >
                  سجّل الآن
                  <ChevronLeft className="h-3.5 w-3.5" />
                </a>
              </div>
            )}
            {/* ── Daily-limit reached banner (stronger CTA) ── */}
            {daily.isLimited && !adminMode && (
              <div className="mb-5 rounded-xl border border-[#E0793C]/40 bg-[#E0793C]/8 p-4 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⏰</span>
                  <div>
                    <p className="text-sm font-bold text-[#211F1A]">
                      بلغت الحد اليومي المجاني ({daily.limit} كتابة)
                    </p>
                    <p className="text-xs text-[#5B564C] mt-0.5">
                      سجّل بالأسفل للمتابعة، أو اشترك كداعم لاستخدام بلا حدود حتى الإطلاق.
                    </p>
                  </div>
                </div>
                <a
                  href="#lead-form"
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#E0793C] hover:bg-[#c9682f] text-white text-xs font-bold px-4 py-2 transition-colors cursor-pointer"
                >
                  سجّل للمتابعة
                  <ChevronLeft className="h-3.5 w-3.5" />
                </a>
              </div>
            )}
            {/* ── Platform Tabs ── */}
            <div className="flex items-center gap-1 p-1.5 bg-[#F5F0E8] rounded-xl mb-5 overflow-x-auto custom-scrollbar">
              {PLATFORMS.map(p => {
                const hasContent = !!results[p.value];
                const isActive = activePlatform === p.value;
                const isGenerating = loading && activePlatform === p.value;
                return (
                  <button
                    key={p.value}
                    onClick={() => switchPlatformTab(p.value)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-white shadow-sm text-[#211F1A]'
                        : 'text-[#5B564C] hover:text-[#211F1A] hover:bg-white/50'
                    }`}
                  >
                    <PlatformIcon platform={p.value} className={`h-4 w-4 ${isActive ? p.tabColor : ''}`} />
                    <span>{p.name}</span>
                    {isGenerating && <Loader2 className="h-3.5 w-3.5 animate-spin text-[#0D7C66]" />}
                    {hasContent && !isActive && !isGenerating && <Check className="h-3.5 w-3.5 text-[#0D7C66]" />}
                  </button>
                );
              })}
            </div>

            {/* ── Platform-adaptive Property Data Bar ── */}
            {theme && (
              <div className={`rounded-xl border ${theme.barBg} ${theme.barBorder} p-3 mb-5 transition-all duration-300`}>
                <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <PlatformIcon platform={activePlatform as Platform} className={`h-3.5 w-3.5 ${theme.iconColor}`} />
                    <span className={`text-[10px] font-bold ${theme.iconColor} uppercase tracking-wide`}>
                      بيانات العقار — {theme.label}
                    </span>
                  </div>
                  {/* Subtle learning indicator — shows the assistant is adapting to this visitor */}
                  {currentAngleName && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-[#5B564C] bg-white/70 border border-[#E8E1D2] rounded-full px-2 py-0.5" title="أسلوب الكتابة المُختار لهذا المحتوى">
                      <Brain className="h-3 w-3 text-[#0D7C66]" />
                      أسلوب: {currentAngleName}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {propertyDataItems.map((item, i) => (
                    <span key={i} className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border ${theme.badgeBg} ${theme.badgeBorder} ${theme.badgeText} text-[11px] font-medium transition-all`}>
                      {item.icon}
                      <span>{item.label}</span>
                    </span>
                  ))}
                </div>
                {generationCount > 0 && (
                  <p className="text-[9px] text-[#5B564C]/70 mt-2 flex items-center gap-1">
                    <SparklesIcon className="h-2.5 w-2.5 text-[#D4A853]" />
                    {generationCount >= 3
                      ? `يتعلّم أسلوبك — ${generationCount} محتوى تمت كتابته لك بأساليب متنوعة`
                      : generationCount >= 1
                      ? `بدأ صدى العقار يتعرّف على أسلوبك (${generationCount} كتابة)`
                      : ''}
                  </p>
                )}
              </div>
            )}

            {/* Preview */}
            <div className="mb-5">{renderPreview()}</div>

            {/* Headline (for non-snapchat) */}
            {activePlatform !== 'snapchat' && currentResult?.headline && (
              <div className="bg-[#FBF8F2] rounded-lg p-3 border border-[#E8E1D2] mb-4">
                <p className="text-xs text-[#5B564C] font-medium mb-1">📌 عنوان قصير:</p>
                <p className="text-sm text-[#211F1A] font-bold">{currentResult.headline}</p>
              </div>
            )}

            {/* Share to social media — direct publishing */}
            {currentResult && (
              <div className="mb-4">
                <ShareButtons
                  text={`${currentResult.content}${currentResult.hashtags && currentResult.hashtags !== 'لا يوجد' ? '\n\n' + currentResult.hashtags : ''}`}
                />
              </div>
            )}

            {/* Action buttons */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              <Button onClick={copyAllContent} variant="outline" className="border-[#E8E1D2] hover:border-[#0D7C66] hover:text-[#0D7C66] h-auto py-3 flex flex-col items-center gap-1 cursor-pointer">
                {copiedKey === 'all' ? <Check className="h-5 w-5 text-[#0D7C66]" /> : <ClipboardCopy className="h-5 w-5" />}
                <span className="text-[11px] font-bold">{copiedKey === 'all' ? 'تم النسخ!' : 'نسخ النص'}</span>
              </Button>
              <Button onClick={downloadAsImage} variant="outline" className="border-[#E8E1D2] hover:border-[#D4A853] hover:text-[#D4A853] h-auto py-3 flex flex-col items-center gap-1 cursor-pointer">
                <Download className="h-5 w-5" /><span className="text-[11px] font-bold">تنزيل صورة</span>
              </Button>
              <Button onClick={handleRegenerate} disabled={loading} variant="outline" className="border-[#E8E1D2] hover:border-[#0D7C66] hover:text-[#0D7C66] h-auto py-3 flex flex-col items-center gap-1 cursor-pointer">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-5 w-5" />}
                <span className="text-[11px] font-bold">{loading ? 'جارٍ...' : 'نسخة بأسلوب جديد'}</span>
              </Button>
            </div>

            {/* Rating */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <span className="text-sm text-[#5B564C]">ما رأيك في النتيجة؟</span>
              <button onClick={() => submitRating('up')} disabled={!!rating}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full border-2 transition-all duration-200 cursor-pointer ${
                  rating === 'up' ? 'border-[#0D7C66] bg-[#0D7C66]/10 text-[#0D7C66]'
                  : 'border-[#E8E1D2] hover:border-[#0D7C66] hover:bg-[#0D7C66]/5 text-[#5B564C]'}`}>
                <ThumbsUp className="h-4 w-4" /><span className="text-xs font-bold">ممتاز</span>
              </button>
              <button onClick={() => submitRating('down')} disabled={!!rating}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full border-2 transition-all duration-200 cursor-pointer ${
                  rating === 'down' ? 'border-[#E0793C] bg-[#E0793C]/10 text-[#E0793C]'
                  : 'border-[#E8E1D2] hover:border-[#E0793C] hover:bg-[#E0793C]/5 text-[#5B564C]'}`}>
                <ThumbsDown className="h-4 w-4" /><span className="text-xs font-bold">يحتاج تحسين</span>
              </button>
            </div>

            {/* Start over + CTA */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-[#E8E1D2]">
              <Button onClick={resetAll} variant="ghost" className="text-[#5B564C] hover:text-[#0D7C66] cursor-pointer">
                <RotateCcw className="h-4 w-4 ml-1" /> ابدأ من جديد
              </Button>
              <div className="sm:mr-auto">
                <a href="#lead-form">
                  <Button className="bg-[#D4A853] hover:bg-[#D4A853]/90 text-[#211F1A] font-bold pulse-cta cursor-pointer">
                    🚀 سجّل واحصل على وصول مبكر
                  </Button>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {loading && !showResult && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-2xl z-10">
            <div className="text-center space-y-3">
              <div className="relative mx-auto w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-[#F5F0E8]" />
                <div className="absolute inset-0 rounded-full border-4 border-t-[#0D7C66] animate-spin" />
              </div>
              <p className="text-[#211F1A] font-bold">جارٍ إعداد محتوى مخصص لعقارك...</p>
              <p className="text-[#5B564C] text-sm">يتم دمج بيانات العقار والمميزات واللهجة والمنصة</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Hidden export template for image download */}
      {renderExportTemplate()}
    </section>
  );
}
