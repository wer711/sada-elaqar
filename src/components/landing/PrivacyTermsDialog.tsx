'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield, FileText } from 'lucide-react';

type DocType = 'privacy' | 'terms';

interface PrivacyTermsDialogProps {
  open: boolean;
  type: DocType | null;
  onOpenChange: (open: boolean) => void;
}

export function PrivacyTermsDialog({ open, type, onOpenChange }: PrivacyTermsDialogProps) {
  const isPrivacy = type === 'privacy';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl max-h-[85vh] p-0 gap-0 overflow-hidden bg-white"
        dir="rtl"
      >
        <DialogHeader className="px-6 py-5 border-b border-[#E8E1D2] bg-[#FBF8F2]">
          <DialogTitle className="flex items-center gap-3 text-right text-xl font-bold text-[#211F1A]">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0D7C66]/10">
              {isPrivacy ? (
                <Shield className="h-5 w-5 text-[#0D7C66]" />
              ) : (
                <FileText className="h-5 w-5 text-[#0D7C66]" />
              )}
            </span>
            {isPrivacy ? 'سياسة الخصوصية' : 'الشروط والأحكام'}
          </DialogTitle>
          <DialogDescription className="text-right text-xs text-[#5B564C] mt-1">
            آخر تحديث: يونيو ٢٠٢٥
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="px-6 py-5 text-sm md:text-base leading-relaxed text-[#211F1A] space-y-4">
            {isPrivacy ? <PrivacyContent /> : <TermsContent />}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Shared contact block ─── */
function ContactBlock() {
  return (
    <div className="mt-6 rounded-xl border border-[#E8E1D2] bg-[#FBF8F2] p-4">
      <p className="font-bold text-[#211F1A] mb-1">للتواصل بخصوص خصوصيتك:</p>
      <p className="text-[#5B564C] text-sm">
        عبر البريد: info@sadaaqar.com
      </p>
      <p className="text-[#5B564C] text-sm mt-1">
        عبر واتساب: الرقم الظاهر في أسفل الصفحة
      </p>
    </div>
  );
}

/* ─── Privacy content ─── */
function PrivacyContent() {
  return (
    <>
      <p className="text-[#5B564C]">
        في «صدى العقار» نولي خصوصيتك أهمية قصوى. تشرح هذه السياسة كيف نجمع بياناتك
        ونستخدمها ونحميها عند استخدامك موقعنا وخدمة كتابة المحتوى التسويقي العقاري.
      </p>

      <section>
        <h3 className="font-bold text-[#211F1A] mb-2">١. البيانات التي نجمعها</h3>
        <ul className="list-disc pr-5 space-y-1 text-[#5B564C]">
          <li>
            <strong>بيانات التسجيل:</strong> الاسم، رقم واتساب، البريد الإلكتروني
            (اختياري)، الدولة، المدينة، نوع النشاط، التحديات التي تواجهها،
            الميزة الأكثر رغبة، الميزانية الشهرية.
          </li>
          <li>
            <strong>بيانات الاستخدام:</strong> تفاعلك مع أداة كتابة المحتوى (نوع
            العقار، المدينة، المنصة المختارة، تقييمك للنتيجة) — مرتبطة برمز
            زائر مجهول لا باسمك إلا بعد تسجيلك.
          </li>
          <li>
            <strong>بيانات تقنية:</strong> نوع المتصفح، نظام التشغيل، الموقع
            الجغرافي على مستوى الدولة.
          </li>
        </ul>
      </section>

      <section>
        <h3 className="font-bold text-[#211F1A] mb-2">٢. كيف نستخدم بياناتك</h3>
        <ul className="list-disc pr-5 space-y-1 text-[#5B564C]">
          <li>تقديم خدمة كتابة المحتوى التسويقي العقاري وتحسين جودتها.</li>
          <li>التواصل معك بخصوص الوصول المبكر وإطلاق النسخة الكاملة.</li>
          <li>فهم اهتماماتك العقارية لتطوير ميزات تهمك فعلاً.</li>
          <li>إرسال تحديثات وعروض (يمكنك إلغاء الاشتراك في أي وقت).</li>
        </ul>
      </section>

      <section>
        <h3 className="font-bold text-[#211F1A] mb-2">٣. المشاركة مع أطراف ثالثة</h3>
        <p className="text-[#5B564C]">
          نُخزّن بياناتك في جداول بيانات محمية لاستخدامها داخلياً في المتابعة
          والتطوير. لا نبيع بياناتك ولا نشاركها مع جهات تسويق خارجية. قد نشاركها
          فقط مع مزوّدي خدمات تشغيليين (مثل استضافة البيانات) تحت اتفاقيات سرية
          صارمة، أو عند الإلزام القانوني.
        </p>
      </section>

      <section>
        <h3 className="font-bold text-[#211F1A] mb-2">٤. حقوقك</h3>
        <ul className="list-disc pr-5 space-y-1 text-[#5B564C]">
          <li>الوصول إلى بياناتك أو طلب نسخة منها.</li>
          <li>تصحيح أي بيانة غير دقيقة.</li>
          <li>طلب حذف بياناتك بالكامل.</li>
          <li>سحب موافقتك في أي وقت (مع التأثير على استمرار الخدمة).</li>
        </ul>
        <p className="text-[#5B564C] mt-2">
          لممارسة أي من هذه الحقوق، تواصل معنا عبر البيانات أدناه.
        </p>
      </section>

      <section>
        <h3 className="font-bold text-[#211F1A] mb-2">٥. حماية البيانات</h3>
        <p className="text-[#5B564C]">
          نطبّق إجراءات تقنية وتنظيمية لحماية بياناتك من الوصول غير المصرّح به
          أو الفقدان. ومع ذلك، لا يمكن ضمان أمان بنسبة ١٠٠٪ لأي نظام متصل
          بالإنترنت.
        </p>
      </section>

      <section>
        <h3 className="font-bold text-[#211F1A] mb-2">٦. الامتثال للقوانين</h3>
        <p className="text-[#5B564C]">
          نلتزم بأنظمة حماية البيانات السارية في الأسواق التي نخدمها، بما فيها
          نظام حماية البيانات الشخصية (PDPL) في المملكة العربية السعودية، وقانون
          حماية البيانات (DPL) في الإمارات، والتشريعات المماثلة في بقية دول
          الشرق الأوسط وشمال إفريقيا.
        </p>
      </section>

      <ContactBlock />
    </>
  );
}

/* ─── Terms content ─── */
function TermsContent() {
  return (
    <>
      <p className="text-[#5B564C]">
        باستخدامك موقع «صدى العقار» وخدماته، فإنك توافق على الشروط التالية.
        يرجى قراءتها بعناية.
      </p>

      <section>
        <h3 className="font-bold text-[#211F1A] mb-2">١. طبيعة الخدمة</h3>
        <p className="text-[#5B564C]">
          «صدى العقار» منصة تساعد المسوّقين والوكلاء العقاريين على كتابة محتوى
          تسويقي احترافي لعقاراتهم. الخدمة في نسختها الحالية تجريبية وتُهدف إلى
          جمع رأي الجمهور العقاري وتجهيز النسخة النهائية لاحقاً.
        </p>
      </section>

      <section>
        <h3 className="font-bold text-[#211F1A] mb-2">٢. استخدام الخدمة</h3>
        <ul className="list-disc pr-5 space-y-1 text-[#5B564C]">
          <li>تلتزم باستخدام الخدمة لأغراض مهنية عقارية مشروعة فقط.</li>
          <li>لا تستخدم الخدمة لنشر محتوى مخالف أو مضلّل أو احتيالي.</li>
          <li>لا تحاول إساءة استخدام الخدمة أو الوصول غير المصرّح به لأنظمتها.</li>
          <li>المحتوى المكتوب مسؤوليتك الكاملة قبل نشره — راجعه قبل النشر.</li>
        </ul>
      </section>

      <section>
        <h3 className="font-bold text-[#211F1A] mb-2">٣. الملكية الفكرية</h3>
        <p className="text-[#5B564C]">
          المحتوى الذي تنتجه الخدمة من حقك استخدامه في تسويق عقاراتك. لكن
          التقنية والخوارزميات والتصميم والشعارات ملك لـ«صدى العقار» ولا يجوز
          نسخها أو إعادة استخدامها بدون إذن.
        </p>
      </section>

      <section>
        <h3 className="font-bold text-[#211F1A] mb-2">٤. حدود المسؤولية</h3>
        <p className="text-[#5B564C]">
          تُقدَّم الخدمة «كما هي» بدون ضمانات صريحة أو ضمنية. لا نتحمّل
          مسؤولية أي خسارة مباشرة أو غير مباشرة ناتجة عن استخدام المحتوى
          المكتوب أو الاعتماد عليه. أنت مسؤول عن التحقق من دقة بيانات العقار
          قبل نشرها.
        </p>
      </section>

      <section>
        <h3 className="font-bold text-[#211F1A] mb-2">٥. حدود الاستخدام</h3>
        <p className="text-[#5B564C]">
          خلال المرحلة التجريبية، يُسمح لكل زائر بعدد معيّن من كتابات المحتوى
          يومياً (بين ١٠ و ٢٠ كتابة). يُحتفظ بالحق في تعديل هذا الحد أو وقف
          الخدمة مؤقتاً لأسباب تشغيلية.
        </p>
      </section>

      <section>
        <h3 className="font-bold text-[#211F1A] mb-2">٦. التعديلات</h3>
        <p className="text-[#5B564C]">
          قد نُحدّث هذه الشروط من وقت لآخر. الاستمرار في استخدام الخدمة بعد
          التعديلات يعني موافقتك على النسخة المُحدَّثة.
        </p>
      </section>

      <ContactBlock />
    </>
  );
}

/* ─── Hook for opening from anywhere ─── */
export function usePrivacyTerms() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<DocType | null>(null);

  const openPrivacy = () => {
    setType('privacy');
    setOpen(true);
  };
  const openTerms = () => {
    setType('terms');
    setOpen(true);
  };

  // Listen for global events (so footer / form can trigger it)
  useEffect(() => {
    function handler(e: Event) {
      const detail = (e as CustomEvent).detail as DocType;
      if (detail === 'privacy') openPrivacy();
      else if (detail === 'terms') openTerms();
    }
    window.addEventListener('open-privacy-terms', handler as EventListener);
    return () =>
      window.removeEventListener('open-privacy-terms', handler as EventListener);
  }, []);

  return { open, type, setOpen, openPrivacy, openTerms };
}

/* ─── Helper for triggering from anywhere ─── */
export function triggerPrivacyTermsDialog(type: DocType) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('open-privacy-terms', { detail: type }));
  }
}

/* ─── Mount-once wrapper: listens for global events and renders the dialog ─── */
export function PrivacyTermsMount() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<DocType | null>(null);

  useEffect(() => {
    function handler(e: Event) {
      const detail = (e as CustomEvent).detail as DocType;
      if (detail === 'privacy' || detail === 'terms') {
        setType(detail);
        setOpen(true);
      }
    }
    window.addEventListener('open-privacy-terms', handler as EventListener);
    return () =>
      window.removeEventListener('open-privacy-terms', handler as EventListener);
  }, []);

  return <PrivacyTermsDialog open={open} type={type} onOpenChange={setOpen} />;
}
