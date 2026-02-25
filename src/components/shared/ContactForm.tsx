// ============= Full file contents =============

1: import { useState } from 'react';
2: import { Button } from "@/components/ui/button";
3: import { Input } from "@/components/ui/input";
4: import { Textarea } from "@/components/ui/textarea";
5: import { Label } from "@/components/ui/label";
6: import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
7: import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
8: import { CheckCircle2, Send, Loader2, Mail } from "lucide-react";
9: import { z } from 'zod';
10: import { cn } from "@/lib/utils";
11: 
12: /**
13:  * Contact Form with validation
14:  * Auto-response messaging included
15:  */
16: 
17: const contactSchema = z.object({
18:   name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
19:   email: z.string().trim().email("Please enter a valid email").max(255),
20:   subject: z.string().min(1, "Please select a subject"),
21:   message: z.string().trim().min(10, "Message must be at least 10 characters").max(1000),
22: });
23: 
24: type ContactFormData = z.infer<typeof contactSchema>;
25: 
26: interface ContactFormProps {
27:   className?: string;
28: }
29: 
30: export default function ContactForm({ className = '' }: ContactFormProps) {
31:   const [formData, setFormData] = useState<Partial<ContactFormData>>({});
32:   const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
33:   const [isSubmitting, setIsSubmitting] = useState(false);
34:   const [isSubmitted, setIsSubmitted] = useState(false);
35: 
36:   const subjects = [
37:     { value: "general", label: "General Inquiry" },
38:     { value: "technical", label: "Website/Technical Issue" },
39:     { value: "partnership", label: "Partnership Opportunity" },
40:     { value: "feedback", label: "Feedback & Suggestions" },
41:     { value: "privacy", label: "Privacy & Data Request" },
42:     { value: "other", label: "Other" },
43:   ];
44: 
45:   const handleChange = (field: keyof ContactFormData, value: string) => {
46:     setFormData(prev => ({ ...prev, [field]: value }));
47:     // Clear error when user types
48:     if (errors[field]) {
49:       setErrors(prev => ({ ...prev, [field]: undefined }));
50:     }
51:   };
52: 
53:   const handleSubmit = async (e: React.FormEvent) => {
54:     e.preventDefault();
55:     
56:     // Validate
57:     const result = contactSchema.safeParse(formData);
58:     if (!result.success) {
59:       const fieldErrors: typeof errors = {};
60:       result.error.errors.forEach(err => {
61:         if (err.path[0]) {
62:           fieldErrors[err.path[0] as keyof ContactFormData] = err.message;
63:         }
64:       });
65:       setErrors(fieldErrors);
66:       return;
67:     }
68: 
69:     setIsSubmitting(true);
70:     
71:     // Simulate submission (in real app, send to backend/email service)
72:     await new Promise(resolve => setTimeout(resolve, 1500));
73:     
74:     setIsSubmitting(false);
75:     setIsSubmitted(true);
76:   };
77: 
78:   if (isSubmitted) {
79:     return (
80:       <Card className={`border-emerald-500/30 bg-emerald-500/5 ${className}`}>
81:         <CardContent className="p-8 text-center">
82:           <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
83:             <CheckCircle2 className="w-8 h-8 text-emerald-500" />
84:           </div>
85:           <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
86:           <p className="text-muted-foreground mb-4">
87:             Thanks for contacting ZIVO. We'll respond within 24–48 hours.
88:           </p>
89:           <p className="text-sm text-muted-foreground">
90:             A confirmation email has been sent to <strong>{formData.email}</strong>
91:           </p>
92:           <Button 
93:             variant="outline" 
94:             className="mt-6 rounded-xl active:scale-95 transition-all duration-200 touch-manipulation"
95:             onClick={() => {
96:               setIsSubmitted(false);
97:               setFormData({});
98:             }}
99:           >
100:             Send Another Message
101:           </Button>
102:         </CardContent>
103:       </Card>
104:     );
105:   }
106: 
107:   return (
108:     <Card className={className}>
109:       <CardHeader>
110:         <CardTitle className="flex items-center gap-2">
111:           <Mail className="w-5 h-5 text-primary" />
112:           Send Us a Message
113:         </CardTitle>
114:         <CardDescription>
115:           Fill out the form below and we'll get back to you within 24-48 hours.
116:         </CardDescription>
117:       </CardHeader>
118:       <CardContent>
119:         <form onSubmit={handleSubmit} className="space-y-4">
120:           <div className="grid sm:grid-cols-2 gap-4">
121:             <div className="space-y-2">
122:               <Label htmlFor="name">Name *</Label>
123:               <Input
124:                 id="name"
125:                 placeholder="Your name"
126:                 value={formData.name || ''}
127:                 onChange={(e) => handleChange('name', e.target.value)}
128:                 className={cn(errors.name ? 'border-red-500' : '', "rounded-xl focus:ring-2 focus:ring-primary/20 transition-all duration-200")}
129:               />
130:               {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
131:             </div>
132:             <div className="space-y-2">
133:               <Label htmlFor="email">Email *</Label>
134:               <Input
135:                 id="email"
136:                 type="email"
137:                 placeholder="you@example.com"
138:                 value={formData.email || ''}
139:                 onChange={(e) => handleChange('email', e.target.value)}
140:                 className={cn(errors.email ? 'border-red-500' : '', "rounded-xl focus:ring-2 focus:ring-primary/20 transition-all duration-200")}
141:               />
142:               {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
143:             </div>
144:           </div>
145: 
146:           <div className="space-y-2">
147:             <Label htmlFor="subject">Subject *</Label>
148:             <Select 
149:               value={formData.subject} 
150:               onValueChange={(value) => handleChange('subject', value)}
151:             >
152:               <SelectTrigger className={cn(errors.subject ? 'border-red-500' : '', "rounded-xl focus:ring-2 focus:ring-primary/20 transition-all duration-200")}>
153:                 <SelectValue placeholder="Select a topic" />
154:               </SelectTrigger>
155:               <SelectContent>
156:                 {subjects.map(subject => (
157:                   <SelectItem key={subject.value} value={subject.value}>
158:                     {subject.label}
159:                   </SelectItem>
160:                 ))}
161:               </SelectContent>
162:             </Select>
163:             {errors.subject && <p className="text-xs text-red-500">{errors.subject}</p>}
164:           </div>
165: 
166:           <div className="space-y-2">
167:             <Label htmlFor="message">Message *</Label>
168:             <Textarea
169:               id="message"
170:               placeholder="How can we help you?"
171:               rows={5}
172:               value={formData.message || ''}
173:               onChange={(e) => handleChange('message', e.target.value)}
174:               className={cn(errors.message ? 'border-red-500' : '', "rounded-xl focus:ring-2 focus:ring-primary/20 transition-all duration-200 resize-none")}
175:             />
176:             {errors.message && <p className="text-xs text-red-500">{errors.message}</p>}
177:             <p className="text-xs text-muted-foreground text-right">
178:               {(formData.message?.length || 0)}/1000
179:             </p>
180:           </div>
181: 
182:           {/* Important Notice */}
183:           <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-muted-foreground">
184:             <strong className="text-amber-500">Note:</strong> ZIVO cannot help with booking changes, 
185:             cancellations, refunds, or payment issues. Please contact your airline, hotel, or rental 
186:             company directly for booking-related inquiries.
187:           </div>
188: 
189:           <Button 
190:             type="submit" 
191:             className="w-full rounded-xl h-12 font-bold shadow-lg active:scale-[0.98] transition-all duration-200 touch-manipulation"
192:             disabled={isSubmitting}
193:           >
194:             {isSubmitting ? (
195:               <>
196:                 <Loader2 className="w-4 h-4 mr-2 animate-spin" />
197:                 Sending...
198:               </>
199:             ) : (
200:               <>
201:                 <Send className="w-4 h-4 mr-2" />
202:                 Send Message
203:               </>
204:             )}
205:           </Button>
206:         </form>
207:       </CardContent>
208:     </Card>
209:   );
210: }