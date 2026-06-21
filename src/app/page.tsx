import Navbar from '@/components/landing/Navbar'
import Hero from '@/components/landing/Hero'
import PainPoints from '@/components/landing/PainPoints'
import HowItWorks from '@/components/landing/HowItWorks'
import DailyTip from '@/components/landing/DailyTip'
import InteractiveDemo from '@/components/landing/InteractiveDemo'
import Features from '@/components/landing/Features'
import TargetAudience from '@/components/landing/TargetAudience'
import FAQ from '@/components/landing/FAQ'
import FounderPlan from '@/components/landing/FounderPlan'
import LeadForm from '@/components/landing/LeadForm'
import FeedbackSection from '@/components/landing/FeedbackSection'
import SocialProof from '@/components/landing/SocialProof'
import Footer from '@/components/landing/Footer'
import WhatsAppWidget from '@/components/landing/WhatsAppWidget'
import { PrivacyTermsMount } from '@/components/landing/PrivacyTermsDialog'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FBF8F2]">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <PainPoints />
        <HowItWorks />
        <DailyTip />
        <InteractiveDemo />
        <Features />
        <TargetAudience />
        <FAQ />
        <FounderPlan />
        <LeadForm />
        <FeedbackSection />
        <SocialProof />
      </main>
      <Footer />
      <WhatsAppWidget />
      <PrivacyTermsMount />
    </div>
  )
}
