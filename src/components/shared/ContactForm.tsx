import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Send, Loader2, Mail } from "lucide-react";
import { z } from 'zod';

/**
 * Contact Form with validation
 * Auto-response messaging included
 */

const contactSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  subject: z.string().min(1, "Please select a subject"),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(1000),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactFormProps {
  className?: string;
}

export default function ContactForm({ className = '' }: ContactFormProps) {
  const [formData, setFormData] = useState<Partial<ContactFormData>>({});
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const subjects = [
    { value: "general", label: "General Inquiry" },
    { value: "technical", label: "Website/Technical Issue" },
    { value: "partnership", label: "Partnership Opportunity" },
    { value: "feedback", label: "Feedback & Suggestions" },
    { value: "privacy", label: "Privacy & Data Request" },
    { value: "other", label: "Other" },
  ];

  const handleChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: typeof errors = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof ContactFormData] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    
    // Simulate submission (in real app, send to backend/email service)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <Card className={`border-emerald-500/30 bg-emerald-500/5 ${className}`}>
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
          <p className="text-muted-foreground mb-4">
            Thanks for contacting ZIVO. We'll respond within 24–48 hours.
          </p>
          <p className="text-sm text-muted-foreground">
            A confirmation email has been sent to <strong>{formData.email}</strong>
          </p>
          <Button 
            variant="outline" 
            className="mt-6"
            onClick={() => {
              setIsSubmitted(false);
              setFormData({});
            }}
          >
            Send Another Message
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-primary" />
          Send Us a Message
        </CardTitle>
        <CardDescription>
          Fill out the form below and we'll get back to you within 24-48 hours.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="Your name"
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Select 
              value={formData.subject} 
              onValueChange={(value) => handleChange('subject', value)}
            >
              <SelectTrigger className={errors.subject ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select a topic" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map(subject => (
                  <SelectItem key={subject.value} value={subject.value}>
                    {subject.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.subject && <p className="text-xs text-red-500">{errors.subject}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              placeholder="How can we help you?"
              rows={5}
              value={formData.message || ''}
              onChange={(e) => handleChange('message', e.target.value)}
              className={errors.message ? 'border-red-500' : ''}
            />
            {errors.message && <p className="text-xs text-red-500">{errors.message}</p>}
            <p className="text-xs text-muted-foreground text-right">
              {(formData.message?.length || 0)}/1000
            </p>
          </div>

          {/* Important Notice */}
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-muted-foreground">
            <strong className="text-amber-500">Note:</strong> ZIVO cannot help with booking changes, 
            cancellations, refunds, or payment issues. Please contact your airline, hotel, or rental 
            company directly for booking-related inquiries.
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
