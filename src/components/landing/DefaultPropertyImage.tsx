'use client';

import {
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
  Waves,
  Car,
  ShieldCheck,
  Sailboat,
  Trees,
  Dumbbell,
  ArrowUpDown,
  Sofa,
  Gem,
  Sun,
  ChefHat,
  MapPin,
  type LucideIcon,
} from 'lucide-react';

/* ─── Property type visual config ─── */
interface PropertyVisual {
  Icon: LucideIcon;
  gradient: string; // tailwind gradient classes
  accent: string; // hex accent color
  pattern: 'urban' | 'residential' | 'luxury' | 'land' | 'commercial';
}

const PROPERTY_VISUALS: Record<string, PropertyVisual> = {
  'شقة': { Icon: Building2, gradient: 'from-[#0D7C66] to-[#0a6b58]', accent: '#0D7C66', pattern: 'urban' },
  'فيلا': { Icon: Home, gradient: 'from-[#D4A853] to-[#b8923f]', accent: '#D4A853', pattern: 'residential' },
  'دوبلكس': { Icon: Warehouse, gradient: 'from-[#0D7C66] to-[#0a6b58]', accent: '#0D7C66', pattern: 'residential' },
  'بنتهاوس': { Icon: Crown, gradient: 'from-[#D4A853] to-[#8B6F2A]', accent: '#D4A853', pattern: 'luxury' },
  'أرض': { Icon: LandPlot, gradient: 'from-[#0D7C66] to-[#1a8a72]', accent: '#0D7C66', pattern: 'land' },
  'مكتب تجاري': { Icon: Briefcase, gradient: 'from-[#211F1A] to-[#3a3530]', accent: '#211F1A', pattern: 'commercial' },
  'محل تجاري': { Icon: Store, gradient: 'from-[#D4A853] to-[#b8923f]', accent: '#D4A853', pattern: 'commercial' },
  'عمارة سكنية': { Icon: Building2, gradient: 'from-[#0D7C66] to-[#0a6b58]', accent: '#0D7C66', pattern: 'urban' },
  'استوديو': { Icon: DoorClosed, gradient: 'from-[#D4A853] to-[#b8923f]', accent: '#D4A853', pattern: 'residential' },
  'شاليه': { Icon: Palmtree, gradient: 'from-[#0D7C66] to-[#1a8a72]', accent: '#0D7C66', pattern: 'land' },
};

const DEFAULT_VISUAL: PropertyVisual = {
  Icon: Building2,
  gradient: 'from-[#0D7C66] to-[#D4A853]',
  accent: '#0D7C66',
  pattern: 'urban',
};

/* ─── Feature icon map ─── */
const FEATURE_ICONS: Record<string, LucideIcon> = {
  'مسبح': Waves,
  'موقف سيارات': Car,
  'حراسة أمنية': ShieldCheck,
  'إطلالة بحرية': Sailboat,
  'حديقة خاصة': Trees,
  'صالة رياضية': Dumbbell,
  'مصعد': ArrowUpDown,
  'مفروش': Sofa,
  'تشطيب فاخر': Gem,
  'تراس': Sun,
  'مطبخ مجهز': ChefHat,
};

interface DefaultPropertyImageProps {
  propertyType: string;
  city: string;
  country?: string;
  customArea?: string;
  area?: string;
  rooms?: string;
  price?: string;
  currency?: string;
  features?: string[];
  headline?: string;
  className?: string;
  /** Compact mode for smaller preview areas */
  compact?: boolean;
}

/**
 * DefaultPropertyImage — A beautiful, auto-generated property card image
 * that adapts to the property data (type, location, price, features).
 * No external image needed — pure SVG/CSS, renders crisply at any size.
 */
export default function DefaultPropertyImage({
  propertyType,
  city,
  country,
  customArea,
  area,
  rooms,
  price,
  currency = 'ريال',
  features = [],
  headline,
  className = '',
  compact = false,
}: DefaultPropertyImageProps) {
  const visual = PROPERTY_VISUALS[propertyType] || DEFAULT_VISUAL;
  const { Icon } = visual;

  const locationText = [customArea, city, country].filter(Boolean).join('، ');
  const formattedPrice = price ? Number(price).toLocaleString('ar-SA') + ' ' + currency : '';
  const topFeatures = features.slice(0, 4);
  const displayHeadline = headline || `${propertyType} مميّز في ${city}`;

  if (compact) {
    // Compact version for smaller preview slots (e.g., Snapchat, WhatsApp)
    return (
      <div className={`relative w-full h-full overflow-hidden bg-gradient-to-br ${visual.gradient} ${className}`} dir="rtl">
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-10">
          <PatternBackground pattern={visual.pattern} />
        </div>
        {/* Glow */}
        <div className="absolute -top-8 -left-8 w-32 h-32 rounded-full bg-white/15 blur-2xl" />
        <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-white/10 blur-2xl" />

        <div className="relative h-full flex flex-col items-center justify-center text-center p-4 text-white">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-2 border border-white/30">
            <Icon className="h-7 w-7" strokeWidth={1.5} />
          </div>
          <p className="font-black text-base leading-tight">{displayHeadline}</p>
          {formattedPrice && (
            <p className="text-sm font-bold mt-1 bg-white/20 px-3 py-0.5 rounded-full">{formattedPrice}</p>
          )}
          <p className="text-[10px] mt-1 opacity-90 flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {city}
          </p>
        </div>
      </div>
    );
  }

  // Full version — professional property card
  return (
    <div
      className={`relative w-full overflow-hidden bg-gradient-to-br ${visual.gradient} ${className}`}
      dir="rtl"
    >
      {/* Decorative pattern background */}
      <div className="absolute inset-0 opacity-10">
        <PatternBackground pattern={visual.pattern} />
      </div>

      {/* Glow orbs */}
      <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-white/15 blur-3xl" />
      <div className="absolute -bottom-16 -right-16 w-56 h-56 rounded-full bg-black/10 blur-3xl" />

      {/* Top brand strip */}
      <div className="absolute top-0 inset-x-0 flex items-center justify-between px-4 py-2.5 bg-gradient-to-b from-black/30 to-transparent">
        <div className="flex items-center gap-1.5 text-white">
          <div className="w-6 h-6 rounded-md bg-white/25 backdrop-blur-sm flex items-center justify-center">
            <span className="text-[10px] font-black">ص</span>
          </div>
          <span className="text-[11px] font-bold tracking-wide">صدى العقار</span>
        </div>
        <span className="text-[10px] font-bold text-white/90 bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
          {propertyType}
        </span>
      </div>

      {/* Main content */}
      <div className="relative h-full min-h-[240px] flex flex-col items-center justify-center text-center px-6 py-8 text-white">
        {/* Property icon with ring */}
        <div className="relative mb-3">
          <div className="absolute inset-0 rounded-full bg-white/20 blur-xl scale-150" />
          <div className="relative w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40 shadow-2xl">
            <Icon className="h-10 w-10" strokeWidth={1.5} />
          </div>
        </div>

        {/* Headline */}
        <p className="font-black text-xl md:text-2xl leading-tight mb-1 drop-shadow-lg">
          {displayHeadline}
        </p>

        {/* Location */}
        {locationText && (
          <p className="text-xs md:text-sm font-medium opacity-95 flex items-center gap-1.5 mb-3">
            <MapPin className="h-3.5 w-3.5" />
            {locationText}
          </p>
        )}

        {/* Price tag */}
        {formattedPrice && (
          <div className="inline-flex items-center gap-1.5 bg-white/25 backdrop-blur-md border border-white/40 rounded-full px-4 py-1.5 mb-3 shadow-lg">
            <Gem className="h-3.5 w-3.5" />
            <span className="font-black text-sm">{formattedPrice}</span>
          </div>
        )}

        {/* Quick specs */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {area && (
            <span className="text-[10px] font-bold bg-white/15 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/20">
              📐 {area} م²
            </span>
          )}
          {rooms && (
            <span className="text-[10px] font-bold bg-white/15 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/20">
              🛏️ {rooms} غرف
            </span>
          )}
        </div>

        {/* Feature badges */}
        {topFeatures.length > 0 && (
          <div className="flex items-center justify-center gap-1.5 flex-wrap mt-3">
            {topFeatures.map((f, i) => {
              const FIcon = FEATURE_ICONS[f];
              return (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 text-[10px] font-bold bg-black/20 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/15"
                >
                  {FIcon && <FIcon className="h-2.5 w-2.5" strokeWidth={2.2} />}
                  {f}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom watermark */}
      <div className="absolute bottom-0 inset-x-0 flex items-center justify-center px-4 py-1.5 bg-gradient-to-t from-black/40 to-transparent">
        <span className="text-[9px] font-medium text-white/80 tracking-wide">
          محتوى تسويقي احترافي · صدى العقار
        </span>
      </div>
    </div>
  );
}

/* ─── Decorative pattern background (SVG) ─── */
function PatternBackground({ pattern }: { pattern: PropertyVisual['pattern'] }) {
  if (pattern === 'urban') {
    return (
      <svg className="w-full h-full" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <g fill="white">
          <rect x="20" y="80" width="20" height="120" />
          <rect x="50" y="60" width="25" height="140" />
          <rect x="85" y="100" width="18" height="100" />
          <rect x="115" y="40" width="30" height="160" />
          <rect x="155" y="90" width="22" height="110" />
        </g>
        <g fill="white" opacity="0.5">
          <rect x="24" y="90" width="3" height="3" /><rect x="30" y="90" width="3" height="3" />
          <rect x="24" y="100" width="3" height="3" /><rect x="30" y="100" width="3" height="3" />
          <rect x="55" y="70" width="3" height="3" /><rect x="62" y="70" width="3" height="3" />
          <rect x="55" y="80" width="3" height="3" /><rect x="62" y="80" width="3" height="3" />
          <rect x="120" y="50" width="3" height="3" /><rect x="128" y="50" width="3" height="3" />
          <rect x="135" y="50" width="3" height="3" /><rect x="120" y="60" width="3" height="3" />
        </g>
      </svg>
    );
  }
  if (pattern === 'residential') {
    return (
      <svg className="w-full h-full" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <g fill="white">
          <polygon points="40,120 60,100 80,120 80,180 40,180" />
          <polygon points="120,110 145,85 170,110 170,180 120,180" />
          <rect x="80" y="130" width="40" height="50" />
          <polygon points="80,130 100,115 120,130" />
        </g>
        <g fill="white" opacity="0.5">
          <rect x="50" y="135" width="8" height="8" /><rect x="62" y="135" width="8" height="8" />
          <rect x="50" y="155" width="8" height="8" /><rect x="62" y="155" width="8" height="8" />
          <rect x="130" y="125" width="10" height="10" /><rect x="150" y="125" width="10" height="10" />
          <rect x="130" y="145" width="10" height="10" /><rect x="150" y="145" width="10" height="10" />
        </g>
      </svg>
    );
  }
  if (pattern === 'luxury') {
    return (
      <svg className="w-full h-full" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <g fill="white" opacity="0.6">
          <polygon points="100,30 110,60 140,60 115,80 125,110 100,90 75,110 85,80 60,60 90,60" />
        </g>
        <g fill="white" opacity="0.3">
          <circle cx="40" cy="40" r="3" /><circle cx="160" cy="40" r="3" />
          <circle cx="40" cy="160" r="3" /><circle cx="160" cy="160" r="3" />
          <circle cx="100" cy="170" r="2" /><circle cx="30" cy="100" r="2" /><circle cx="170" cy="100" r="2" />
        </g>
        <g fill="white" opacity="0.4">
          <path d="M 0 180 L 60 140 L 100 160 L 140 130 L 200 170 L 200 200 L 0 200 Z" />
        </g>
      </svg>
    );
  }
  if (pattern === 'land') {
    return (
      <svg className="w-full h-full" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <g fill="white" opacity="0.4">
          <path d="M 0 150 Q 50 130 100 145 T 200 140 L 200 200 L 0 200 Z" />
          <path d="M 0 165 Q 60 150 120 160 T 200 155 L 200 200 L 0 200 Z" opacity="0.6" />
        </g>
        <g fill="white" opacity="0.5">
          <circle cx="30" cy="140" r="4" /><circle cx="50" cy="135" r="3" />
          <circle cx="150" cy="138" r="4" /><circle cx="170" cy="142" r="3" />
          <circle cx="100" cy="130" r="3" />
        </g>
        <g stroke="white" strokeWidth="1" opacity="0.3">
          <line x1="20" y1="60" x2="20" y2="140" /><line x1="60" y1="70" x2="60" y2="135" />
          <line x1="140" y1="65" x2="140" y2="138" /><line x1="180" y1="75" x2="180" y2="142" />
        </g>
      </svg>
    );
  }
  // commercial
  return (
    <svg className="w-full h-full" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <g fill="white">
        <rect x="30" y="70" width="140" height="110" />
        <rect x="30" y="60" width="140" height="15" />
      </g>
      <g fill="white" opacity="0.5">
        <rect x="45" y="95" width="20" height="25" /><rect x="75" y="95" width="20" height="25" />
        <rect x="105" y="95" width="20" height="25" /><rect x="135" y="95" width="20" height="25" />
        <rect x="45" y="135" width="20" height="25" /><rect x="75" y="135" width="20" height="25" />
        <rect x="105" y="135" width="20" height="25" /><rect x="135" y="135" width="20" height="25" />
      </g>
      <g stroke="white" strokeWidth="2" opacity="0.4">
        <line x1="30" y1="60" x2="170" y2="60" />
      </g>
    </svg>
  );
}
