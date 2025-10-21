"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Separator } from '@/components/ui/Separator';
import { ArrowLeft } from 'lucide-react';
import { ThemeToggleSection } from '@/components/ThemeToggleSection';

export default function PrivacyPage() {
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
              <h1 className="text-3xl font-bold tracking-tight mb-2">Privacy Policy</h1>
              <p className="text-muted-foreground">Last updated: {lastUpdated}</p>
            </div>

            <Separator className="my-6" />

            {/* Introduction */}
            <section className="mb-8">
              <p className="text-muted-foreground mb-4">
                Retoone, Inc. ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and application (the "Service").
              </p>
              <p className="text-muted-foreground mb-4">
                Please read this Privacy Policy carefully. By accessing or using the Service, you acknowledge that you have read, understood, and agree to be bound by all the terms of this Privacy Policy. If you do not agree with our policies and practices, please do not use our Service.
              </p>
              <p className="text-muted-foreground">
                This Privacy Policy may change from time to time. It is our policy to post any changes we make to our Privacy Policy on this page. The date the Privacy Policy was last revised is identified at the top of the page.
              </p>
            </section>

            {/* Sections */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">1. Information We Collect</h2>
              <p className="text-muted-foreground mb-4">
                We collect several types of information from and about users of our Service, including:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>
                  <strong>Personal Data:</strong> We may collect personal identification information from you in a variety of ways, including, but not limited to, when you visit our Service, register on the Service, create or modify your account, place an order, subscribe to our newsletter, respond to a survey, fill out a form, or in connection with other activities, services, features, or resources we make available on our Service. Personal data may include your name, email address, mailing address, phone number, credit card information, and other information that could be used to identify you.
                </li>
                <li>
                  <strong>Non-Personal Data:</strong> We may collect non-personal identification information about you whenever you interact with our Service. Non-personal identification information may include your browser name, the type of computer, device, or mobile device you use to access the Service, and technical information about your connection to our Service, such as the operating system, internet service providers, and other similar information.
                </li>
                <li>
                  <strong>Usage Data:</strong> We may collect information about how you use the Service, including your browsing and usage patterns, preferences, the pages of our Service that you visit, the time and date of your visit, the time spent on those pages, and other diagnostic data.
                </li>
                <li>
                  <strong>Content Data:</strong> We collect information about the content you create using our Service, including audio files, music compositions, and metadata associated with your creations.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">2. How We Collect Information</h2>
              <p className="text-muted-foreground mb-4">
                We use different methods to collect information from and about you including:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>
                  <strong>Direct interactions:</strong> You may provide us with your personal data by filling in forms, creating an account, subscribing to our service, or corresponding with us by mail, phone, email, or otherwise.
                </li>
                <li>
                  <strong>Automated technologies or interactions:</strong> As you interact with our Service, we may automatically collect technical data about your equipment, browsing actions, and patterns. We collect this data by using cookies, server logs, and other similar technologies.
                </li>
                <li>
                  <strong>Third parties or publicly available sources:</strong> We may receive personal data about you from various third parties such as analytics providers, advertising networks, and search information providers.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">3. Use of Your Information</h2>
              <p className="text-muted-foreground mb-4">
                We use the information we collect about you or that you provide to us, including any personal data, for the following purposes:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>
                  To provide and maintain our Service, including to process your account registration, subscriptions, and payments.
                </li>
                <li>
                  To improve and personalize your experience when you use our Service.
                </li>
                <li>
                  To provide customer support and respond to your requests, comments, or questions.
                </li>
                <li>
                  To process and deliver your orders and manage your account.
                </li>
                <li>
                  To provide you with information, products, or services that you request from us or that we think you may be interested in.
                </li>
                <li>
                  To carry out our obligations and enforce our rights arising from any contracts entered into between you and us, including for billing and collection.
                </li>
                <li>
                  To notify you about changes to our Service or any products or services we offer or provide through it.
                </li>
                <li>
                  To monitor and analyze usage patterns, trends, and other activities to improve our Service.
                </li>
                <li>
                  To protect our Service, our users, and the public.
                </li>
                <li>
                  To comply with applicable laws, regulations, and legal processes.
                </li>
              </ul>
              <p className="text-muted-foreground mb-4">
                We may also use your information in the following ways:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>
                  <strong>Training and Improvement of AI Models:</strong> We may use content you create with our Service to train and improve our AI models. This helps us enhance the quality and capabilities of our music generation technology.
                </li>
                <li>
                  <strong>Aggregated Data:</strong> We may use aggregated, anonymized data for research, analysis, and improvement of our Service. This data does not identify specific users.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">4. Disclosure of Your Information</h2>
              <p className="text-muted-foreground mb-4">
                We may disclose personal information that we collect or you provide as described in this Privacy Policy:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>
                  <strong>To Subsidiaries and Affiliates:</strong> We may share your information with our subsidiaries and affiliates for purposes consistent with this Privacy Policy.
                </li>
                <li>
                  <strong>To Contractors, Service Providers, and Other Third Parties:</strong> We may share your information with contractors, service providers, and other third parties we use to support our business and who are bound by contractual obligations to keep personal information confidential and use it only for the purposes for which we disclose it to them.
                </li>
                <li>
                  <strong>To Fulfill the Purpose for Which You Provide It:</strong> For example, if you give us an email address to use the "share a friend" feature of our Service, we will transmit the contents of that email and your email address to the recipients.
                </li>
                <li>
                  <strong>For Business Transfers:</strong> If we are involved in a merger, acquisition, or sale of all or a portion of our assets, your information may be transferred as part of that transaction. We will notify you via email and/or a prominent notice on our Service of any change in ownership or uses of your personal information, as well as any choices you may have regarding your personal information.
                </li>
                <li>
                  <strong>To Comply with Legal Obligations:</strong> We may disclose your information where we believe it is necessary to comply with a legal obligation, protect and defend our rights or property, protect the safety of our users or others, or investigate fraud.
                </li>
              </ul>
              <p className="text-muted-foreground">
                We may also disclose aggregated, non-personally identifiable information about our users without restriction.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">5. Data Security</h2>
              <p className="text-muted-foreground mb-4">
                We have implemented measures designed to secure your personal information from accidental loss and from unauthorized access, use, alteration, and disclosure. All information you provide to us is stored on secure servers behind firewalls. Any payment transactions will be encrypted using SSL technology.
              </p>
              <p className="text-muted-foreground mb-4">
                The safety and security of your information also depends on you. Where we have given you (or where you have chosen) a password for access to certain parts of our Service, you are responsible for keeping this password confidential. We ask you not to share your password with anyone.
              </p>
              <p className="text-muted-foreground">
                Unfortunately, the transmission of information via the internet is not completely secure. Although we do our best to protect your personal information, we cannot guarantee the security of your personal information transmitted to our Service. Any transmission of personal information is at your own risk. We are not responsible for circumvention of any privacy settings or security measures contained on the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">6. Data Retention</h2>
              <p className="text-muted-foreground mb-4">
                We will retain your personal information only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use your information to the extent necessary to comply with our legal obligations, resolve disputes, and enforce our policies.
              </p>
              <p className="text-muted-foreground">
                Content data, such as the music you create using our Service, will be retained according to the terms of your subscription plan. Free tier users may have their content deleted after a period of inactivity, while paid subscribers will have their content retained for the duration of their active subscription and for a reasonable period afterward.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">7. Your Choices and Rights</h2>
              <p className="text-muted-foreground mb-4">
                You have certain choices and rights regarding your personal information. These include:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>
                  <strong>Account Information:</strong> You can review and change your personal information by logging into your account and visiting your account profile page.
                </li>
                <li>
                  <strong>Email Communications:</strong> You can opt out of receiving promotional emails from us by following the instructions in those emails. If you opt out, we may still send you non-promotional emails, such as those about your account or our ongoing business relations.
                </li>
                <li>
                  <strong>Cookies:</strong> You can set your browser to refuse all or some browser cookies or to alert you when cookies are being sent. If you disable or refuse cookies, please note that some parts of the Service may be inaccessible or not function properly.
                </li>
                <li>
                  <strong>Access, Correction, and Deletion:</strong> Depending on your location, you may have the right to access, correct, or delete your personal information. You can make these requests by contacting us as described in the "Contact Us" section below.
                </li>
                <li>
                  <strong>Data Portability:</strong> You may have the right to receive a copy of the personal information we hold about you in a structured, machine-readable format.
                </li>
                <li>
                  <strong>Withdrawal of Consent:</strong> If we rely on your consent to process your personal information, you have the right to withdraw your consent at any time.
                </li>
              </ul>
              <p className="text-muted-foreground">
                Please note that some of these rights may be limited where we have compelling legitimate grounds or legal obligations to process your personal information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">8. Children's Privacy</h2>
              <p className="text-muted-foreground mb-4">
                Our Service is not intended for children under 16 years of age. We do not knowingly collect personal information from children under 16. If you are a parent or guardian and you believe that your child has provided us with personal information, please contact us. If we become aware that we have collected personal information from a child under 16 without verification of parental consent, we will take steps to remove that information from our servers.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">9. International Data Transfers</h2>
              <p className="text-muted-foreground mb-4">
                We are based in the United States and the information we collect is governed by U.S. law. If you are accessing the Service from outside the United States, please be aware that information collected through the Service may be transferred to, processed, stored, and used in the United States or other countries where our servers are located. Data protection laws in the U.S. may be different from those of your country of residence.
              </p>
              <p className="text-muted-foreground">
                If you are a resident of the European Economic Area (EEA), the United Kingdom, or Switzerland, we will ensure that appropriate safeguards are in place to protect your personal information when it is transferred outside of these territories.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">10. Your California Privacy Rights</h2>
              <p className="text-muted-foreground mb-4">
                If you are a California resident, California law may provide you with additional rights regarding our use of your personal information. To learn more about your California privacy rights, visit our <Link href="/privacy/ccpa" className="text-primary hover:underline">CCPA Privacy Notice</Link>.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">11. Changes to Our Privacy Policy</h2>
              <p className="text-muted-foreground mb-4">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date at the top of this page. If we make material changes to how we treat our users' personal information, we will notify you through a notice on the Service home page or by email to the primary email address specified in your account.
              </p>
              <p className="text-muted-foreground">
                You are responsible for ensuring we have an up-to-date, active, and deliverable email address for you, and for periodically visiting our Service and this Privacy Policy to check for any changes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">12. Contact Us</h2>
              <p className="text-muted-foreground mb-4">
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>
                  By email: privacy@retoone.com
                </li>
                <li>
                  By mail: Retoone, Inc., 123 Creative Avenue, San Francisco, CA 94103, United States
                </li>
              </ul>
            </section>

            {/* Agreement Section */}
            <div className="bg-muted/30 p-6 rounded-lg my-8">
              <h3 className="font-bold mb-2">Your Acknowledgement</h3>
              <p className="text-muted-foreground mb-4">
                By using our Service, you acknowledge that you have read and understood this Privacy Policy and agree to its terms.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild>
                  <Link href="/">I Accept</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/terms">View Terms of Service</Link>
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
                <a href="#information" className="block text-sm text-muted-foreground hover:text-foreground py-1">Information We Collect</a>
                <a href="#use" className="block text-sm text-muted-foreground hover:text-foreground py-1">How We Use Information</a>
                <a href="#sharing" className="block text-sm text-muted-foreground hover:text-foreground py-1">Information Sharing</a>
                <a href="#security" className="block text-sm text-muted-foreground hover:text-foreground py-1">Data Security</a>
                <a href="#rights" className="block text-sm text-muted-foreground hover:text-foreground py-1">Your Rights</a>
                <a href="#changes" className="block text-sm text-muted-foreground hover:text-foreground py-1">Policy Changes</a>
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