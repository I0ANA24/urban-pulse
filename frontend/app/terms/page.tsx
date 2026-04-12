"use client";

import Link from "next/link";
import GoBackButton from "@/components/ui/GoBackButton";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-inter px-5 py-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <GoBackButton />
      </div>

      <h1 className="font-montagu text-3xl font-bold mb-2">Terms of Service</h1>
      <p className="text-white/40 text-sm mb-8">Last updated: April 2026</p>

      <div className="flex flex-col gap-6 text-white/70 text-sm leading-relaxed">
        <section>
          <h2 className="text-white font-bold text-lg mb-2">1. Acceptance of Terms</h2>
          <p>By accessing or using UrbanPulse, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the application.</p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-2">2. Description of Service</h2>
          <p>UrbanPulse is a community platform that connects neighbors, facilitates resource sharing, and enables rapid communication during emergencies. The platform allows users to post events, share skills and tools, report emergencies, and find lost pets.</p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-2">3. User Accounts</h2>
          <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate and complete information when creating your account. You must be at least 18 years old to use UrbanPulse.</p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-2">4. User Conduct</h2>
          <p>You agree not to use UrbanPulse to:</p>
          <ul className="list-disc list-inside mt-2 flex flex-col gap-1">
            <li>Post false or misleading information</li>
            <li>Harass, threaten, or harm other users</li>
            <li>Share inappropriate or illegal content</li>
            <li>Spam or send unsolicited messages</li>
            <li>Impersonate other users or entities</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-2">5. Content</h2>
          <p>You retain ownership of content you post on UrbanPulse. By posting content, you grant UrbanPulse a non-exclusive license to display and distribute that content within the platform. You are solely responsible for the content you post.</p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-2">6. Trust Score & Verification</h2>
          <p>UrbanPulse uses a trust score system based on community feedback. Verified status is awarded automatically when a user meets certain criteria. UrbanPulse reserves the right to modify or revoke verification status at any time.</p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-2">7. Emergency Features</h2>
          <p>The emergency reporting features on UrbanPulse are intended to supplement, not replace, official emergency services. Always contact official emergency services (112) in life-threatening situations.</p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-2">8. Account Termination</h2>
          <p>UrbanPulse reserves the right to suspend or terminate accounts that violate these terms. Users who are banned will lose access to all platform features.</p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-2">9. Disclaimer</h2>
          <p>UrbanPulse is provided "as is" without warranties of any kind. We are not responsible for the accuracy of user-generated content or for any damages resulting from the use of the platform.</p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-2">10. Changes to Terms</h2>
          <p>We may update these Terms of Service from time to time. Continued use of UrbanPulse after changes constitutes acceptance of the new terms.</p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-2">11. Contact</h2>
          <p>If you have any questions about these Terms of Service, please contact us at <span className="text-green-light">support@urbanpulse.app</span></p>
        </section>
      </div>

      <div className="mt-10 pt-6 border-t border-white/10 text-center">
        <Link href="/privacy" className="text-white/40 hover:text-white text-sm transition-colors">
          Privacy Policy →
        </Link>
      </div>
    </div>
  );
}