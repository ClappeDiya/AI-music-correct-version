"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Lightbulb, MessageSquare, ThumbsUp, HelpCircle } from "lucide-react";
import Link from "next/link";

export default function FeedbackPage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Feedback</h1>
        <p className="text-muted-foreground mt-1">
          Help us improve our platform by providing your valuable feedback
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-primary" />
              General Feedback
            </CardTitle>
            <CardDescription>
              Share your thoughts about your experience with our platform
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-sm">
              Tell us what you like, what you don't like, or any other thoughts you have about our service.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/feedback/general">Submit Feedback</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lightbulb className="h-5 w-5 mr-2 text-primary" />
              Feature Requests
            </CardTitle>
            <CardDescription>
              Suggest new features and vote on ideas from other users
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-sm">
              Have an idea for how to make our platform better? Submit a feature request and let the community vote on it.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/feedback/feature-requests">Feature Requests</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ThumbsUp className="h-5 w-5 mr-2 text-primary" />
              Surveys
            </CardTitle>
            <CardDescription>
              Participate in surveys to help shape our roadmap
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-sm">
              Answer short surveys about potential new features and improvements to help us prioritize our development efforts.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/feedback/surveys">Take Surveys</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center">
              <HelpCircle className="h-5 w-5 mr-2 text-primary" />
              FAQ
            </CardTitle>
            <CardDescription>
              Find answers to common questions
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-sm">
              Browse our frequently asked questions to find quick answers to common inquiries and issues.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full" variant="outline">
              <Link href="/feedback/faq">View FAQ</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 