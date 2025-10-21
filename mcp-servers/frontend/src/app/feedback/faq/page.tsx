"use client";

import { useState } from "react";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/Accordion";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Search, MessageSquare, Lightbulb, ThumbsUp } from "lucide-react";

// FAQ data organized by category
const faqData = {
  general: [
    {
      question: "How can I provide feedback about the platform?",
      answer: "You can provide general feedback through the Feedback section. Navigate to Feedback → General Feedback and share your thoughts about your experience with our music platform."
    },
    {
      question: "Are my feedback submissions anonymous?",
      answer: "By default, your feedback is associated with your account to allow us to follow up if needed. However, you can choose to submit anonymously by checking the 'Submit Anonymously' option when available."
    },
    {
      question: "How do you use the feedback I provide?",
      answer: "Your feedback helps us improve our platform. We review all submissions to identify patterns, prioritize improvements, and fix issues. Feedback directly informs our product roadmap and development process."
    },
    {
      question: "Can I see feedback from other users?",
      answer: "Some feedback, like feature requests, is visible to all users so you can see what others have suggested and vote on ideas. General feedback submissions are kept private between you and our team."
    },
    {
      question: "How quickly do you respond to feedback?",
      answer: "We review all feedback regularly. While we can't respond to every submission individually, critical issues are prioritized. You may receive notifications when we implement changes based on your feedback."
    }
  ],
  featureRequests: [
    {
      question: "How do I submit a feature request?",
      answer: "Go to Feedback → Feature Requests and click on the 'New Feature Request' button. Fill out the form with a title, description, and category for your requested feature."
    },
    {
      question: "How does voting on feature requests work?",
      answer: "Each user can upvote feature requests they'd like to see implemented. The number of votes helps us prioritize which features to develop next. You can vote on as many requests as you'd like."
    },
    {
      question: "Can I edit or delete my feature request after submitting it?",
      answer: "Yes, you can edit or delete your own feature requests. On the feature request details page, look for the edit or delete options if you're the original submitter."
    },
    {
      question: "What do the different status labels mean on feature requests?",
      answer: "Feature requests can have various statuses: 'Pending' (under review), 'Planned' (scheduled for development), 'In Progress' (currently being built), 'Completed' (implemented), or 'Declined' (not planned for implementation)."
    },
    {
      question: "Why was my feature request declined?",
      answer: "Feature requests may be declined for various reasons, including technical limitations, conflicts with product direction, or similarity to existing features. When possible, we provide an explanation for declined requests."
    }
  ],
  surveys: [
    {
      question: "How often are new surveys available?",
      answer: "We release new surveys regularly, typically monthly or when we're considering significant platform changes. The frequency may increase during beta testing periods or major feature rollouts."
    },
    {
      question: "Are surveys mandatory?",
      answer: "No, surveys are entirely optional. However, completing them helps us make better decisions about the platform's future and may earn you rewards or early access to new features."
    },
    {
      question: "How long do surveys typically take to complete?",
      answer: "Most surveys are designed to be completed in 5-10 minutes. The estimated completion time is displayed at the beginning of each survey."
    },
    {
      question: "Can I take a survey multiple times?",
      answer: "No, each survey can only be completed once per user. This ensures we get diverse perspectives and prevents skewed results."
    },
    {
      question: "Can I see the results of surveys I've participated in?",
      answer: "We often share aggregated survey results with our community through blog posts or in-app announcements. Individual responses remain confidential, but you can see how the community voted on key questions."
    }
  ],
  technical: [
    {
      question: "I encountered an error when submitting feedback. What should I do?",
      answer: "If you experience technical issues when submitting feedback, try refreshing the page and submitting again. If the problem persists, take a screenshot of the error and send it to our support team at support@retoone.com."
    },
    {
      question: "Why can't I see my previous feedback submissions?",
      answer: "Ensure you're logged into the correct account. Navigate to your profile and check the 'My Feedback' section. If items are missing, check if you submitted them anonymously or if they were removed due to content policies."
    },
    {
      question: "Can I attach files to my feedback?",
      answer: "Yes, you can attach screenshots, audio files, or documents to your feedback submissions when relevant. Look for the attachment option when creating a new feedback submission."
    },
    {
      question: "Is there a character limit for feedback submissions?",
      answer: "Yes, there is a limit of 2,000 characters for text feedback to ensure submissions remain focused. For more detailed feedback, consider attaching a document or contacting our support team directly."
    },
    {
      question: "How do I report inappropriate content in public feedback?",
      answer: "If you see inappropriate content in feature requests or other public feedback areas, use the 'Report' option on the content. Our moderation team will review it promptly."
    }
  ]
};

export default function FeedbackFAQ() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("general");
  
  // Filter FAQ items based on search query
  const filteredFaqItems = searchQuery 
    ? Object.values(faqData).flat().filter(item => 
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqData[activeCategory as keyof typeof faqData];

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Feedback FAQ</h1>
        <p className="text-muted-foreground mt-1">
          Find answers to common questions about our feedback system
        </p>
      </div>

      {/* Search bar */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search for answers..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* FAQ content */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>
            Everything you need to know about providing feedback and making feature requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="general"
            value={activeCategory}
            onValueChange={(value) => {
              setActiveCategory(value);
              setSearchQuery("");
            }}
            className="w-full"
          >
            <TabsList className="mb-6 grid w-full grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="general" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">General</span>
              </TabsTrigger>
              <TabsTrigger value="featureRequests" className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                <span className="hidden sm:inline">Feature Requests</span>
              </TabsTrigger>
              <TabsTrigger value="surveys" className="flex items-center gap-2">
                <ThumbsUp className="h-4 w-4" />
                <span className="hidden sm:inline">Surveys</span>
              </TabsTrigger>
              <TabsTrigger value="technical" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">Technical</span>
              </TabsTrigger>
            </TabsList>

            {/* Display filtered FAQ items */}
            <Accordion
              type="single"
              collapsible
              className="w-full"
            >
              {filteredFaqItems.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left hover:no-underline">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}

              {filteredFaqItems.length === 0 && (
                <div className="py-4 text-center text-muted-foreground">
                  No results found for "{searchQuery}". Try a different search term.
                </div>
              )}
            </Accordion>
          </Tabs>
        </CardContent>
      </Card>

      {/* Additional help section */}
      <div className="mt-8 text-center">
        <p className="text-muted-foreground mb-2">
          Can't find what you're looking for? Visit our 
          <a href="/help" className="text-primary mx-1 hover:underline">
            Help Center
          </a>
          or 
          <a href="/contact" className="text-primary mx-1 hover:underline">
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
} 