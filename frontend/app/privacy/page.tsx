"use client";

import Link from "next/link";
import GoBackButton from "@/components/ui/GoBackButton";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-inter px-5 py-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <GoBackButton />
      </div>

      <h1 className="font-montagu text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-white/40 text-sm mb-8">Last updated: April 2026</p>

      <div className="flex flex-col gap-6 text-white/70 text-sm leading-relaxed">
        <section>
          <h2 className="text-white font-bold text-lg mb-2">1. Information We Collect</h2>
          <p>When you use UrbanPulse, we collect the following information:</p>
          <ul className="list-disc list-inside mt-2 flex flex-col gap-1">
            <li>Account information: name, email address, password</li>
            <li>Profile information: bio, skills, tools, location</li>
            <li>Content you post: events, messages, comments</li>
            <li>Usage data: interactions with posts, ratings given</li>
            <li>Photos and images you upload</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-2">2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul className="list-disc list-inside mt-2 flex flex-col gap-1">
            <li>Provide and improve the UrbanPulse platform</li>
            <li>Connect you with neighbors and community members</li>
            <li>Send emergency alerts and notifications</li>
            <li>Calculate and display trust scores</li>
            <li>Match lost and found pet reports using AI analysis</li>
            <li>Detect duplicate accounts and prevent abuse</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-2">3. Location Data</h2>
          <p>UrbanPulse uses your location to show relevant nearby events and connect you with neighbors in your area. Your exact location is never publicly displayed — we apply a privacy offset to protect your precise address. You can update or remove your location at any time in your profile settings.</p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-2">4. AI Features</h2>
          <p>UrbanPulse uses AI to analyze pet photos for our Lost & Found Pet matching feature. Photos uploaded for pet posts are processed by the AI to extract characteristics such as species, color, and breed. This data is stored to enable matching between lost and found pet reports.</p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-2">5. Image Storage</h2>
          <p>Images you upload (profile photos, post images) are stored securely on Cloudinary. These images may be publicly visible to other UrbanPulse users within the platform.</p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-2">6. Data Sharing</h2>
          <p>We do not sell your personal data to third parties. We share data only with:</p>
          <ul className="list-disc list-inside mt-2 flex flex-col gap-1">
            <li>Cloudinary — for image storage and processing</li>
            <li>Anthropic — for AI-powered pet image analysis</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-2">7. Data Security</h2>
          <p>We implement industry-standard security measures to protect your data. Passwords are hashed and never stored in plain text. Authentication uses JWT tokens with expiration. However, no method of transmission over the internet is 100% secure.</p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-2">8. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc list-inside mt-2 flex flex-col gap-1">
            <li>Access and update your personal information</li>
            <li>Delete your account and associated data</li>
            <li>Remove your location from your profile</li>
            <li>Request a copy of your data</li>
          </ul>
          <p className="mt-2">You can manage most of these options directly in your profile settings.</p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-2">9. Cookies</h2>
          <p>UrbanPulse uses cookies only for authentication purposes — to keep you logged in between sessions. We do not use tracking or advertising cookies.</p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-2">10. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. We will notify you of significant changes through the platform. Continued use of UrbanPulse after changes constitutes acceptance of the updated policy.</p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-2">11. Contact</h2>
          <p>If you have any questions about this Privacy Policy or how we handle your data, please contact us at <span className="text-green-light">privacy@urbanpulse.app</span></p>
        </section>
      </div>

      <div className="mt-10 pt-6 border-t border-white/10 text-center">
        <Link href="/terms" className="text-white/40 hover:text-white text-sm transition-colors">
          Terms of Service →
        </Link>
      </div>
    </div>
  );
}