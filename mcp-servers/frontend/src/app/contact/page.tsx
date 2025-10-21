"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/Card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { Label } from '@/components/ui/Label';
import {
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  Clock,
  AlertCircle,
  CheckCircle2,
  Twitter,
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
  Sparkles,
} from 'lucide-react';
import { FuturisticThemeToggle } from '@/components/ui/FuturisticThemeToggle';

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    inquiry: '',
    message: ''
  });
  
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setFormStatus('submitting');
    
    // Simulate form submission
    try {
      // In a real application, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setFormStatus('success');
      
      // Reset form after successful submission
      setFormState({
        name: '',
        email: '',
        subject: '',
        inquiry: '',
        message: ''
      });
      
      // Reset status after 5 seconds
      setTimeout(() => setFormStatus('idle'), 5000);
    } catch (error) {
      setFormStatus('error');
      // Reset status after 5 seconds
      setTimeout(() => setFormStatus('idle'), 5000);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="bg-background py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Contact Us
              </h1>
              <p className="text-muted-foreground max-w-2xl">
                Have questions or feedback? We'd love to hear from you. Our team is here to help.
              </p>
            </div>
            
            <div className="mt-6 md:mt-0 flex flex-col items-center">
              <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-3">
                Try our new theme
              </div>
              <FuturisticThemeToggle />
            </div>
          </div>
        </div>
      </section>
      
      {/* Contact Form and Info */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Send Us a Message</CardTitle>
                  <CardDescription>
                    Fill out the form below and we'll get back to you as soon as possible.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Your Name</Label>
                        <Input 
                          id="name" 
                          name="name"
                          placeholder="Enter your full name" 
                          value={formState.name}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input 
                          id="email" 
                          name="email"
                          type="email" 
                          placeholder="Enter your email address" 
                          value={formState.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input 
                          id="subject" 
                          name="subject"
                          placeholder="What is this regarding?" 
                          value={formState.subject}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="inquiry">Inquiry Type</Label>
                        <Select 
                          value={formState.inquiry} 
                          onValueChange={(value) => handleSelectChange('inquiry', value)}
                        >
                          <SelectTrigger id="inquiry">
                            <SelectValue placeholder="Select an inquiry type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General Inquiry</SelectItem>
                            <SelectItem value="support">Technical Support</SelectItem>
                            <SelectItem value="billing">Billing Question</SelectItem>
                            <SelectItem value="feedback">Feedback</SelectItem>
                            <SelectItem value="partnership">Partnership</SelectItem>
                            <SelectItem value="press">Press Inquiry</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="message">Your Message</Label>
                      <Textarea 
                        id="message" 
                        name="message"
                        placeholder="Please provide details about your inquiry..." 
                        rows={6}
                        value={formState.message}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full md:w-auto"
                      disabled={formStatus === 'submitting'}
                    >
                      {formStatus === 'submitting' ? (
                        <>Sending Message...</>
                      ) : (
                        <>Send Message</>
                      )}
                    </Button>
                    
                    {formStatus === 'success' && (
                      <div className="flex items-center gap-2 text-green-500 mt-4 p-3 bg-green-50 dark:bg-green-950/30 rounded-md">
                        <CheckCircle2 className="h-5 w-5" />
                        <p>Thank you! Your message has been sent successfully.</p>
                      </div>
                    )}
                    
                    {formStatus === 'error' && (
                      <div className="flex items-center gap-2 text-red-500 mt-4 p-3 bg-red-50 dark:bg-red-950/30 rounded-md">
                        <AlertCircle className="h-5 w-5" />
                        <p>There was an error sending your message. Please try again.</p>
                      </div>
                    )}
                  </form>
                </CardContent>
              </Card>
            </div>
            
            {/* Contact Information */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>
                    Reach out to us directly through these channels.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Email */}
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-md">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Email Us</h3>
                      <a href="mailto:support@retoone.com" className="text-sm text-primary hover:underline">
                        support@retoone.com
                      </a>
                    </div>
                  </div>
                  
                  {/* Phone */}
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-md">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Call Us</h3>
                      <a href="tel:+15551234567" className="text-sm text-primary hover:underline">
                        +1 (555) 123-4567
                      </a>
                      <p className="text-xs text-muted-foreground">Monday-Friday, 9am-5pm PST</p>
                    </div>
                  </div>
                  
                  {/* Address */}
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-md">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Visit Us</h3>
                      <address className="text-sm not-italic text-muted-foreground">
                        Retoone HQ<br />
                        123 Creative Avenue<br />
                        San Francisco, CA 94103<br />
                        United States
                      </address>
                    </div>
                  </div>
                  
                  {/* Support Hours */}
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-md">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Support Hours</h3>
                      <p className="text-sm text-muted-foreground">
                        Monday-Friday: 9am-5pm PST<br />
                        Saturday: 10am-2pm PST<br />
                        Sunday: Closed
                      </p>
                    </div>
                  </div>
                  
                  {/* Live Chat */}
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-md">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Live Chat</h3>
                      <p className="text-sm text-muted-foreground">
                        Available for paid plans during support hours.
                      </p>
                      <Button variant="outline" size="sm" className="mt-2" asChild>
                        <Link href="/help">Visit Help Center</Link>
                      </Button>
                    </div>
                  </div>
                  
                  {/* Social Media */}
                  <div className="pt-4 border-t">
                    <h3 className="font-medium mb-4">Connect With Us</h3>
                    <div className="flex gap-4">
                      <a 
                        href="https://twitter.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 rounded-full bg-muted/50 hover:bg-primary/10 transition-colors"
                        aria-label="Twitter"
                      >
                        <Twitter className="h-5 w-5" />
                      </a>
                      <a 
                        href="https://facebook.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 rounded-full bg-muted/50 hover:bg-primary/10 transition-colors"
                        aria-label="Facebook"
                      >
                        <Facebook className="h-5 w-5" />
                      </a>
                      <a 
                        href="https://instagram.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 rounded-full bg-muted/50 hover:bg-primary/10 transition-colors"
                        aria-label="Instagram"
                      >
                        <Instagram className="h-5 w-5" />
                      </a>
                      <a 
                        href="https://youtube.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 rounded-full bg-muted/50 hover:bg-primary/10 transition-colors"
                        aria-label="YouTube"
                      >
                        <Youtube className="h-5 w-5" />
                      </a>
                      <a 
                        href="https://linkedin.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 rounded-full bg-muted/50 hover:bg-primary/10 transition-colors"
                        aria-label="LinkedIn"
                      >
                        <Linkedin className="h-5 w-5" />
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Quick answers to common questions. For more detailed information, visit our Help Center.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">How quickly will I get a response?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We typically respond to all inquiries within 24-48 business hours. Priority support is available for Professional and Enterprise plan subscribers.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Do you offer phone support?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Phone support is available for Enterprise plan customers. All other customers can reach us via email or our in-app chat support.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">How can I report a bug?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  You can report bugs through our contact form, or directly from the app using the "Report Issue" feature in the Help menu.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Can I request new features?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Absolutely! We love hearing from users about features they'd like to see. Submit feature requests through our contact form or in-app feedback tool.
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center mt-12">
            <Button variant="outline" asChild>
              <Link href="/help">
                Visit Help Center
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Map Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Find Us</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our headquarters is located in the heart of San Francisco.
            </p>
          </div>
          
          <div className="aspect-video w-full max-w-5xl mx-auto rounded-lg overflow-hidden border border-border">
            <div className="w-full h-full bg-muted flex items-center justify-center">
              {/* Map placeholder - in a real app, this would be replaced with an actual map component */}
              <div className="text-center p-12">
                <MapPin className="h-12 w-12 mx-auto mb-4 text-primary/50" />
                <h3 className="text-xl font-bold mb-2">Retoone HQ</h3>
                <p className="text-muted-foreground">
                  123 Creative Avenue, San Francisco, CA 94103
                </p>
                <Button size="sm" variant="outline" className="mt-4">
                  <a 
                    href="https://maps.google.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    Get Directions
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 