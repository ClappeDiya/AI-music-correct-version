"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Separator } from '@/components/ui/Separator';
import { ArrowLeft } from 'lucide-react';
import { ThemeToggleSection } from '@/components/ThemeToggleSection';

export default function TermsPage() {
  // Last updated date
  const lastUpdated = "June 15, 2024";

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
          {/* Main content */}
          <div className="flex-1">
            {/* Header */}
            <div className="mb-8">
              <Link 
                href="/"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
              <h1 className="text-3xl font-bold tracking-tight mb-2">Terms of Service</h1>
              <p className="text-muted-foreground">Last updated: {lastUpdated}</p>
            </div>

            <Separator className="my-6" />

            {/* Introduction */}
            <section className="mb-8">
              <p className="text-muted-foreground mb-4">
                Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the Retoone website and application (the "Service") operated by Retoone, Inc. ("us", "we", or "our").
              </p>
              <p className="text-muted-foreground mb-4">
                Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who access or use the Service.
              </p>
              <p className="text-muted-foreground">
                By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the Service.
              </p>
            </section>

            {/* Sections */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">1. Accounts</h2>
              <p className="text-muted-foreground mb-4">
                When you create an account with us, you must provide accurate, complete, and current information at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
              </p>
              <p className="text-muted-foreground mb-4">
                You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password, whether your password is with our Service or a third-party service.
              </p>
              <p className="text-muted-foreground">
                You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">2. Subscriptions</h2>
              <p className="text-muted-foreground mb-4">
                Some parts of the Service are billed on a subscription basis ("Subscription(s)"). You will be billed in advance on a recurring and periodic basis ("Billing Cycle"). Billing cycles are set either on a monthly or annual basis, depending on the type of subscription plan you select when purchasing a Subscription.
              </p>
              <p className="text-muted-foreground mb-4">
                At the end of each Billing Cycle, your Subscription will automatically renew under the exact same conditions unless you cancel it or Retoone, Inc. cancels it. You may cancel your Subscription renewal either through your online account management page or by contacting Retoone, Inc. customer support team.
              </p>
              <p className="text-muted-foreground">
                A valid payment method, including credit card or PayPal, is required to process the payment for your Subscription. You shall provide Retoone, Inc. with accurate and complete billing information including full name, address, state, zip code, telephone number, and valid payment method information. By submitting such payment information, you automatically authorize Retoone, Inc. to charge all Subscription fees incurred through your account to any such payment instruments.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">3. Free Trial</h2>
              <p className="text-muted-foreground mb-4">
                Retoone, Inc. may, at its sole discretion, offer a Subscription with a free trial for a limited period of time ("Free Trial").
              </p>
              <p className="text-muted-foreground mb-4">
                You may be required to enter your billing information in order to sign up for the Free Trial.
              </p>
              <p className="text-muted-foreground">
                If you do enter your billing information when signing up for the Free Trial, you will not be charged by Retoone, Inc. until the Free Trial has expired. On the last day of the Free Trial period, unless you cancelled your Subscription, you will be automatically charged the applicable subscription fee for the type of Subscription you have selected.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">4. Content</h2>
              <p className="text-muted-foreground mb-4">
                Our Service allows you to create, post, link, store, share and otherwise make available certain information, text, graphics, videos, audio files, or other material ("Content"). You are responsible for the Content that you generate using the Service, including its legality, reliability, and appropriateness.
              </p>
              <p className="text-muted-foreground mb-4">
                By generating Content through the Service, you warrant that you either own or have the necessary rights, licenses, consents, and permissions to use and authorize Retoone, Inc. to use all intellectual property and publicity rights in and to the Content in accordance with these Terms.
              </p>
              <p className="text-muted-foreground mb-4">
                You retain all of your ownership rights in your Content. However, by posting Content to the Service, you grant Retoone, Inc. a limited license to use, modify, publicly perform, publicly display, reproduce, and distribute such Content on and through the Service consistent with the purpose of providing the Service to you.
              </p>
              <p className="text-muted-foreground mb-4">
                Depending on your subscription tier, different content ownership and usage rights may apply:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>
                  <strong>Free Plan:</strong> Music created with the free plan includes a non-removable Retoone attribution and cannot be used for commercial purposes.
                </li>
                <li>
                  <strong>Creator Plan:</strong> Music created with the Creator plan may be used for commercial purposes under a non-exclusive license, meaning both you and Retoone may use the content.
                </li>
                <li>
                  <strong>Professional & Enterprise Plans:</strong> Music created with these plans grants you full ownership and commercial rights to the content you create.
                </li>
              </ul>
              <p className="text-muted-foreground">
                Retoone, Inc. has the right but not the obligation to monitor and edit all Content provided by users.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">5. Prohibited Uses</h2>
              <p className="text-muted-foreground mb-4">
                You may use the Service only for lawful purposes and in accordance with these Terms. You agree not to use the Service:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>
                  In any way that violates any applicable national or international law or regulation.
                </li>
                <li>
                  For the purpose of exploiting, harming, or attempting to exploit or harm minors in any way.
                </li>
                <li>
                  To transmit, or procure the sending of, any advertising or promotional material, including any "junk mail", "chain letter," "spam," or any other similar solicitation.
                </li>
                <li>
                  To impersonate or attempt to impersonate Retoone, Inc., a Retoone, Inc. employee, another user, or any other person or entity.
                </li>
                <li>
                  To create content that infringes on the copyright, trademark, or intellectual property rights of others.
                </li>
                <li>
                  To create content that is defamatory, obscene, offensive, or promotes illegal activities.
                </li>
                <li>
                  To attempt to circumvent any content-filtering techniques we employ or to attempt to access any service or area of the Service that you are not authorized to access.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">6. Copyright Policy</h2>
              <p className="text-muted-foreground mb-4">
                We respect the intellectual property rights of others. It is our policy to respond to any claim that Content posted on the Service infringes the copyright or other intellectual property rights of any person.
              </p>
              <p className="text-muted-foreground mb-4">
                If you are a copyright owner, or authorized on behalf of one, and you believe that the copyrighted work has been copied in a way that constitutes copyright infringement that is taking place through the Service, you must submit your notice in writing to the attention of "Copyright Infringement" of dmca@retoone.com and include in your notice a detailed description of the alleged infringement.
              </p>
              <p className="text-muted-foreground">
                You may be held accountable for damages (including costs and attorneys' fees) for misrepresenting that any Content is infringing your copyright.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">7. Limitation of Liability</h2>
              <p className="text-muted-foreground mb-4">
                In no event shall Retoone, Inc., nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; (iii) any content obtained from the Service; and (iv) unauthorized access, use or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence) or any other legal theory, whether or not we have been informed of the possibility of such damage, and even if a remedy set forth herein is found to have failed of its essential purpose.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">8. Disclaimer</h2>
              <p className="text-muted-foreground mb-4">
                Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The Service is provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement or course of performance.
              </p>
              <p className="text-muted-foreground">
                Retoone, Inc. its subsidiaries, affiliates, and its licensors do not warrant that a) the Service will function uninterrupted, secure or available at any particular time or location; b) any errors or defects will be corrected; c) the Service is free of viruses or other harmful components; or d) the results of using the Service will meet your requirements.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">9. Governing Law</h2>
              <p className="text-muted-foreground">
                These Terms shall be governed and construed in accordance with the laws of California, United States, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect. These Terms constitute the entire agreement between us regarding our Service, and supersede and replace any prior agreements we might have between us regarding the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">10. Changes</h2>
              <p className="text-muted-foreground mb-4">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
              </p>
              <p className="text-muted-foreground">
                By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, please stop using the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">11. Contact Us</h2>
              <p className="text-muted-foreground mb-4">
                If you have any questions about these Terms, please contact us:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>
                  By email: legal@retoone.com
                </li>
                <li>
                  By mail: Retoone, Inc., 123 Creative Avenue, San Francisco, CA 94103, United States
                </li>
              </ul>
            </section>

            {/* Agreement Section */}
            <div className="bg-muted/30 p-6 rounded-lg my-8">
              <h3 className="font-bold mb-2">Your Agreement</h3>
              <p className="text-muted-foreground mb-4">
                By using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild>
                  <Link href="/">I Accept</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/privacy">View Privacy Policy</Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-64 order-first lg:order-last">
            <div className="sticky top-24 space-y-6 bg-card p-6 rounded-lg border">
              <nav className="space-y-1">
                <h3 className="font-medium mb-3">On this page</h3>
                <a href="#introduction" className="block text-sm text-muted-foreground hover:text-foreground py-1">Introduction</a>
                <a href="#use-of-services" className="block text-sm text-muted-foreground hover:text-foreground py-1">Use of Services</a>
                <a href="#account" className="block text-sm text-muted-foreground hover:text-foreground py-1">Account</a>
                <a href="#content" className="block text-sm text-muted-foreground hover:text-foreground py-1">Content</a>
                <a href="#privacy" className="block text-sm text-muted-foreground hover:text-foreground py-1">Privacy</a>
                <a href="#termination" className="block text-sm text-muted-foreground hover:text-foreground py-1">Termination</a>
              </nav>
              
              <Separator />
              
              <ThemeToggleSection 
                title="Try our new theme"
                description="Experience our futuristic light mode"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 