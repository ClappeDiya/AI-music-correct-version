"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Separator } from '@/components/ui/Separator';
import { ArrowLeft } from 'lucide-react';

export default function CookiePolicyPage() {
  // Last updated date
  const lastUpdated = "June 15, 2024";

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link 
              href="/"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Cookie Policy
            </h1>
            <p className="text-muted-foreground">
              Last updated: {lastUpdated}
            </p>
          </div>

          <Separator className="my-6" />

          {/* Introduction */}
          <section className="mb-8">
            <p className="text-muted-foreground mb-4">
              This Cookie Policy explains how Retoone, Inc. ("we", "our", or "us") uses cookies and similar technologies when you visit our website and application (the "Service").
            </p>
            <p className="text-muted-foreground mb-4">
              By using our Service, you consent to the use of cookies and similar technologies in accordance with this Cookie Policy. If you do not agree to our use of cookies in this way, you should set your browser settings accordingly or not use the Service.
            </p>
            <p className="text-muted-foreground">
              We may update this Cookie Policy from time to time to reflect changes in technology, regulation, or our business practices. Any changes will become effective when we post the revised policy on our website. Please check this page periodically for updates.
            </p>
          </section>

          {/* Sections */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">1. What Are Cookies?</h2>
            <p className="text-muted-foreground mb-4">
              Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit a website. They are widely used to make websites work more efficiently and provide information to the website owners.
            </p>
            <p className="text-muted-foreground mb-4">
              Cookies help with various functions, including allowing you to navigate between pages efficiently, remembering your preferences, and generally improving your user experience. They can also ensure that advertisements you see online are more relevant to you and your interests.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">2. Types of Cookies We Use</h2>
            <p className="text-muted-foreground mb-4">
              We use the following types of cookies on our Service:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
              <li>
                <strong>Essential Cookies:</strong> These cookies are necessary for the Service to function properly and securely. They enable core functionality such as security, network management, and account access. You cannot opt out of these cookies as the Service cannot function properly without them.
              </li>
              <li>
                <strong>Preference Cookies:</strong> These cookies enable the Service to remember information that changes the way it behaves or looks, such as your preferred language or the region you are in. They help make your experience more personalized.
              </li>
              <li>
                <strong>Analytics Cookies:</strong> These cookies collect information about how you use the Service, which pages you visited, and which links you clicked on. All of the data is anonymized and cannot be used to identify you. It is used solely to improve the functionality of the Service.
              </li>
              <li>
                <strong>Marketing Cookies:</strong> These cookies track your online activity to help deliver more relevant advertising or to limit how many times you see an ad. These cookies can share information with other organizations or advertisers.
              </li>
              <li>
                <strong>Session Cookies:</strong> These are temporary cookies that are deleted when you close your browser. They are used to maintain your session and keep you logged in.
              </li>
              <li>
                <strong>Persistent Cookies:</strong> These remain on your device after you close your browser and may be used by your browser on subsequent visits to the Service. They help remember your preferences and settings.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">3. Specific Cookies We Use</h2>
            <p className="text-muted-foreground mb-4">
              Below is a detailed list of the specific cookies we use on our Service:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">Cookie Name</th>
                    <th className="text-left p-2 font-medium">Type</th>
                    <th className="text-left p-2 font-medium">Purpose</th>
                    <th className="text-left p-2 font-medium">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-2">dashboard_session</td>
                    <td className="p-2">Essential</td>
                    <td className="p-2">Maintains your authentication state</td>
                    <td className="p-2">7 days</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2">accessToken</td>
                    <td className="p-2">Essential</td>
                    <td className="p-2">Authenticates your user session</td>
                    <td className="p-2">30 days</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2">next-auth.session-token</td>
                    <td className="p-2">Essential</td>
                    <td className="p-2">Manages your authentication session</td>
                    <td className="p-2">Session</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2">_ga</td>
                    <td className="p-2">Analytics</td>
                    <td className="p-2">Used by Google Analytics to distinguish users</td>
                    <td className="p-2">2 years</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2">_gid</td>
                    <td className="p-2">Analytics</td>
                    <td className="p-2">Used by Google Analytics to distinguish users</td>
                    <td className="p-2">24 hours</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2">user_preferences</td>
                    <td className="p-2">Preference</td>
                    <td className="p-2">Remembers your UI preferences</td>
                    <td className="p-2">1 year</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">4. Third-Party Cookies</h2>
            <p className="text-muted-foreground mb-4">
              Some cookies may be placed by third-party services that appear on our pages. These third parties may collect information about your online activities over time and across different websites when you use our Service. We do not control the placement of cookies by third parties.
            </p>
            <p className="text-muted-foreground mb-4">
              Third-party services we use that may place cookies include:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
              <li>
                <strong>Google Analytics:</strong> Used to collect information about how visitors use our Service. We use this information to compile reports and help us improve the Service.
              </li>
              <li>
                <strong>Payment Processors:</strong> Used to process payments securely when you subscribe to our Service.
              </li>
              <li>
                <strong>Social Media Platforms:</strong> If you use social media features on our Service, these platforms may use cookies to track your activities.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">5. Managing Cookies</h2>
            <p className="text-muted-foreground mb-4">
              Most web browsers allow you to control cookies through their settings preferences. However, if you limit the ability of websites to set cookies, you may worsen your overall user experience, as it will no longer be personalized to you. It may also stop you from saving customized settings like login information.
            </p>
            <p className="text-muted-foreground mb-4">
              To manage cookies in different browsers, you can refer to the following guides:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
              <li>
                <a 
                  href="https://support.google.com/chrome/answer/95647" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Google Chrome
                </a>
              </li>
              <li>
                <a 
                  href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Mozilla Firefox
                </a>
              </li>
              <li>
                <a 
                  href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Safari
                </a>
              </li>
              <li>
                <a 
                  href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Microsoft Edge
                </a>
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">6. Do Not Track Signals</h2>
            <p className="text-muted-foreground mb-4">
              Some browsers include the ability to transmit "Do Not Track" (DNT) signals. We do our best to respond to DNT signals. However, there is no standard interpretation or practice for DNT signals, so we may not respond to them in every case.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">7. Cookie Consent</h2>
            <p className="text-muted-foreground mb-4">
              When you first visit our Service, you may be presented with a cookie banner that allows you to accept or decline non-essential cookies. You can change your cookie preferences at any time by clicking on the "Cookie Settings" link in the footer of our website.
            </p>
            <p className="text-muted-foreground mb-4">
              By continuing to use our Service after making your cookie preferences, you consent to our use of cookies in accordance with this Cookie Policy and your expressed preferences.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">8. Changes to This Cookie Policy</h2>
            <p className="text-muted-foreground mb-4">
              We may update our Cookie Policy from time to time. We will notify you of any changes by posting the new Cookie Policy on this page and updating the "Last updated" date at the top.
            </p>
            <p className="text-muted-foreground mb-4">
              You are advised to review this Cookie Policy periodically for any changes. Changes to this Cookie Policy are effective when they are posted on this page.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">9. Contact Us</h2>
            <p className="text-muted-foreground mb-4">
              If you have any questions about this Cookie Policy, please contact us:
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
              By using our Service, you acknowledge that you have read and understood this Cookie Policy and agree to its terms.
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
      </div>
    </div>
  );
} 