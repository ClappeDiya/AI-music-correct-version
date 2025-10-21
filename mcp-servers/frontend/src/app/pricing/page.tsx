"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, X, HelpCircle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';
import { FuturisticUIDemo } from '@/components/FuturisticUIDemo';

// Feature explanation tooltips
const featureInfo = {
  ai_music_generation: "Create original music using our AI algorithms",
  stem_separation: "Split tracks into individual instrument components",
  voice_cloning: "Create vocal models based on sample recordings",
  lyrics_generation: "Generate lyrics for your compositions",
  realtime_collaboration: "Work together with others in real-time",
  cloud_storage: "Store your projects securely in the cloud",
  exports_per_month: "Number of high-quality exports allowed monthly",
  commercial_use: "Legal rights to use in commercial projects",
  priority_generation: "Get faster processing for AI generation",
  api_access: "Access to our developer API",
  custom_models: "Create and train custom AI models",
  private_projects: "Keep your projects private",
  personal_support: "Direct contact with our support team"
};

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  
  const pricingPlans = [
    {
      name: "Free",
      description: "Basic features for hobbyists and beginners",
      price: {
        monthly: 0,
        yearly: 0,
      },
      features: [
        { name: "AI music generation", included: true, limit: "5 tracks/month" },
        { name: "Stem separation", included: true, limit: "5 tracks/month" },
        { name: "Voice cloning", included: false },
        { name: "Lyrics generation", included: true, limit: "10 per month" },
        { name: "Realtime collaboration", included: false },
        { name: "Cloud storage", included: true, limit: "500MB" },
        { name: "Exports per month", included: true, limit: "10 MP3 only" },
        { name: "Commercial use", included: false },
        { name: "Priority generation", included: false },
        { name: "API access", included: false },
        { name: "Custom models", included: false },
        { name: "Private projects", included: false },
        { name: "Personal support", included: false },
      ],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Creator",
      description: "Essential tools for independent creators",
      price: {
        monthly: 19.99,
        yearly: 199.99,
      },
      features: [
        { name: "AI music generation", included: true, limit: "20 tracks/month" },
        { name: "Stem separation", included: true, limit: "20 tracks/month" },
        { name: "Voice cloning", included: true, limit: "3 voices" },
        { name: "Lyrics generation", included: true, limit: "Unlimited" },
        { name: "Realtime collaboration", included: true, limit: "Up to 2 users" },
        { name: "Cloud storage", included: true, limit: "5GB" },
        { name: "Exports per month", included: true, limit: "50 MP3/WAV" },
        { name: "Commercial use", included: true, limit: "Non-exclusive" },
        { name: "Priority generation", included: false },
        { name: "API access", included: false },
        { name: "Custom models", included: false },
        { name: "Private projects", included: true },
        { name: "Personal support", included: true, limit: "Email" },
      ],
      cta: "Try Free for 14 Days",
      popular: true,
    },
    {
      name: "Professional",
      description: "Advanced features for serious musicians and producers",
      price: {
        monthly: 49.99,
        yearly: 499.99,
      },
      features: [
        { name: "AI music generation", included: true, limit: "Unlimited" },
        { name: "Stem separation", included: true, limit: "Unlimited" },
        { name: "Voice cloning", included: true, limit: "10 voices" },
        { name: "Lyrics generation", included: true, limit: "Unlimited" },
        { name: "Realtime collaboration", included: true, limit: "Up to 5 users" },
        { name: "Cloud storage", included: true, limit: "50GB" },
        { name: "Exports per month", included: true, limit: "Unlimited all formats" },
        { name: "Commercial use", included: true, limit: "Full rights" },
        { name: "Priority generation", included: true },
        { name: "API access", included: true, limit: "5,000 calls/month" },
        { name: "Custom models", included: false },
        { name: "Private projects", included: true },
        { name: "Personal support", included: true, limit: "Priority email" },
      ],
      cta: "Try Free for 14 Days",
      popular: false,
    },
    {
      name: "Enterprise",
      description: "Custom solutions for studios and businesses",
      price: {
        monthly: 199.99,
        yearly: 1999.99,
      },
      features: [
        { name: "AI music generation", included: true, limit: "Unlimited" },
        { name: "Stem separation", included: true, limit: "Unlimited" },
        { name: "Voice cloning", included: true, limit: "Unlimited" },
        { name: "Lyrics generation", included: true, limit: "Unlimited" },
        { name: "Realtime collaboration", included: true, limit: "Unlimited users" },
        { name: "Cloud storage", included: true, limit: "500GB" },
        { name: "Exports per month", included: true, limit: "Unlimited all formats" },
        { name: "Commercial use", included: true, limit: "Full rights" },
        { name: "Priority generation", included: true },
        { name: "API access", included: true, limit: "50,000 calls/month" },
        { name: "Custom models", included: true },
        { name: "Private projects", included: true },
        { name: "Personal support", included: true, limit: "Dedicated manager" },
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  const savings = {
    Creator: Math.round(((pricingPlans[1].price.monthly * 12) - pricingPlans[1].price.yearly) / (pricingPlans[1].price.monthly * 12) * 100),
    Professional: Math.round(((pricingPlans[2].price.monthly * 12) - pricingPlans[2].price.yearly) / (pricingPlans[2].price.monthly * 12) * 100),
    Enterprise: Math.round(((pricingPlans[3].price.monthly * 12) - pricingPlans[3].price.yearly) / (pricingPlans[3].price.monthly * 12) * 100)
  };

  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Choose the plan that fits your creative needs, with no hidden fees
          </p>
          
          {/* New UI Experience Showcase */}
          <div className="mt-12 mb-4">
            <div className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
              NEW
            </div>
            <h2 className="text-2xl font-semibold mb-2">Experience Our New Futuristic Interface</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              All plans now include our beautiful new interface with light and dark mode options
            </p>
            <div className="max-w-5xl mx-auto">
              <FuturisticUIDemo />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          {/* Billing toggle */}
          <div className="flex justify-center mb-12">
            <Tabs 
              value={billingPeriod} 
              onValueChange={(value) => setBillingPeriod(value as "monthly" | "yearly")}
              className="w-[400px]"
            >
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="monthly">Monthly Billing</TabsTrigger>
                <TabsTrigger value="yearly">
                  Yearly Billing
                  <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    Save 16-20%
                  </span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Pricing cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
            {pricingPlans.map((plan, index) => (
              <Card 
                key={plan.name} 
                className={`relative ${plan.popular ? 'border-primary shadow-lg shadow-primary/10' : 'border-border'}`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-8 transform -translate-y-1/2 bg-primary px-3 py-1 rounded-full text-primary-foreground text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold">
                        ${billingPeriod === "monthly" ? plan.price.monthly : plan.price.yearly}
                      </span>
                      <span className="text-muted-foreground ml-2">
                        /{billingPeriod === "monthly" ? "month" : "year"}
                      </span>
                    </div>
                    {billingPeriod === "yearly" && plan.price.yearly > 0 && (
                      <p className="text-sm text-primary mt-1">
                        Save {savings[plan.name as keyof typeof savings]}% with annual billing
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    {plan.features.map((feature) => (
                      <div key={feature.name} className="flex items-start">
                        {feature.included ? (
                          <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        ) : (
                          <X className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                        )}
                        <span className="ml-2 flex-1 text-sm">
                          {feature.name}
                          {feature.included && feature.limit && (
                            <span className="text-muted-foreground"> ({feature.limit})</span>
                          )}
                        </span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="h-4 w-4 text-muted-foreground ml-1" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-sm">
                                {featureInfo[feature.name.toLowerCase().replace(/\s/g, '_') as keyof typeof featureInfo]}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className={`w-full ${plan.name === "Enterprise" ? "bg-background border border-primary text-primary hover:bg-primary/10" : ""}`}
                    variant={plan.popular ? "default" : "outline"}
                    asChild
                  >
                    <Link href={plan.name === "Enterprise" ? "/contact" : "/auth/signup"}>
                      {plan.popular && <Zap className="mr-2 h-4 w-4" />}
                      {plan.cta}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Have questions about our pricing or features? Find answers to common questions below.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Can I upgrade or downgrade my plan?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes, you can upgrade or downgrade your plan at any time. Changes to your subscription will be applied at the start of your next billing cycle.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Do you offer refunds?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We offer a 14-day money-back guarantee on all paid plans. If you're not satisfied with our service, contact our support team within 14 days of your purchase for a full refund.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">What happens to my music when my subscription ends?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  You'll always retain ownership of your exported files. If your subscription ends, you'll still have access to your exported music, but you won't be able to create new content until you renew.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">How do commercial rights work?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  <strong>Free Plan:</strong> Music created with the free plan includes a non-removable Retoone attribution and cannot be used for commercial purposes.
                </p>
                <p className="text-muted-foreground">
                  <strong>Creator Plan:</strong> Music created with the Creator plan may be used for commercial purposes under a non-exclusive license, meaning both you and Retoone may use the content.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Can I try before I buy?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Absolutely! You can start with our Free plan to experience core features, or try our Creator and Professional plans with a 14-day free trial (credit card required).
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Do you offer educational discounts?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes, we offer special pricing for educational institutions. Contact our sales team for more information about our education plans and discounts.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">
              Still have questions? We're here to help.
            </p>
            <Button variant="outline" asChild>
              <Link href="/contact">Contact our Support Team</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Creating?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Join thousands of musicians and producers already using Retoone to create amazing music.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="gap-2">
              <Zap className="h-5 w-5" />
              <span>Get Started Free</span>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/features">
                Learn More About Features
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
} 