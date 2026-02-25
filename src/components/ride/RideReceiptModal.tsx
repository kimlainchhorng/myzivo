// ============= Full file contents =============

1: import { useState } from "react";
2: import { motion, AnimatePresence } from "framer-motion";
3: import { Star, CheckCircle2, Loader2, Heart } from "lucide-react";
4: import {
5:   Dialog,
6:   DialogContent,
7:   DialogHeader,
8:   DialogTitle,
9: } from "@/components/ui/dialog";
10: import { Button } from "@/components/ui/button";
11: import { Textarea } from "@/components/ui/textarea";
12: import { Input } from "@/components/ui/input";
13: import { cn } from "@/lib/utils";
14: import { saveRideRating, saveRideTip } from "@/lib/supabaseRide";
15: import { PLATFORM_COMMISSION_RATE, DRIVER_SHARE_RATE } from "@/config/adminConfig";
16: import { toast } from "sonner";
17: 
18: interface RideReceiptModalProps {
19:   isOpen: boolean;
20:   onClose: () => void;
21:   tripElapsed: number; // seconds
22:   distance: number; // miles
23:   price: number;
24:   rideName: string;
25:   onDone: () => void;
26:   tripId?: string;
27: }
28: 
29: const RideReceiptModal = ({ 
30:   isOpen, 
31:   onClose, 
32:   tripElapsed,
33:   distance,
34:   price,
35:   rideName,
36:   onDone,
37:   tripId,
38: }: RideReceiptModalProps) => {
39:   const [rating, setRating] = useState(0);
40:   const [hoveredStar, setHoveredStar] = useState(0);
41:   const [hasRated, setHasRated] = useState(false);
42:   const [selectedTip, setSelectedTip] = useState<number | null>(null);
43:   const [feedback, setFeedback] = useState("");
44:   const [isSaving, setIsSaving] = useState(false);
45:   const [ratingError, setRatingError] = useState<string | null>(null);
46:   const [tipSaved, setTipSaved] = useState(false);
47:   const [isSavingTip, setIsSavingTip] = useState(false);
48:   const [showCustomTip, setShowCustomTip] = useState(false);
49:   const [customTipValue, setCustomTipValue] = useState("");
50:   const [ratingCategories, setRatingCategories] = useState<Record<string, number>>({});
51:   const [selectedTags, setSelectedTags] = useState<string[]>([]);
52: 
53:   // Format elapsed time for display
54:   const formatTime = (seconds: number) => {
55:     const mins = Math.floor(seconds / 60);
56:     const secs = seconds % 60;
57:     return `${mins}:${secs.toString().padStart(2, '0')}`;
58:   };
59: 
60:   // Calculate fare breakdown
61:   const baseFare = 2.50;
62:   const serviceFee = 1.50;
63:   const timeMinutes = Math.ceil(tripElapsed / 60);
64:   const timeCost = timeMinutes * 0.30;
65:   const distanceCost = Math.max(0, price - baseFare - serviceFee - timeCost);
66:   
67:   // Total with tip
68:   const totalWithTip = price + (selectedTip || 0);
69: 
70:   const handleStarClick = (stars: number) => {
71:     setRating(stars);
72:     setRatingError(null);
73:   };
74: 
75:   const handleSubmitRating = async () => {
76:     if (rating === 0) return;
77:     
78:     if (tripId) {
79:       setIsSaving(true);
80:       setRatingError(null);
81:       
82:       const result = await saveRideRating({
83:         tripId,
84:         rating,
85:         feedback: feedback.trim() || undefined,
86:         ratingCategories: Object.keys(ratingCategories).length > 0 ? ratingCategories : undefined,
87:         ratingTags: selectedTags.length > 0 ? selectedTags : undefined,
88:       });
89:       
90:       setIsSaving(false);
91:       
92:       if (!result.success) {
93:         setRatingError("Failed to save rating. Please try again.");
94:         return;
95:       }
96:     }
97:     
98:     setHasRated(true);
99:   };
100: 
101:   const handleDone = async () => {
102:     // Save tip if selected and not yet saved
103:     if (selectedTip && selectedTip > 0 && !tipSaved && tripId) {
104:       setIsSavingTip(true);
105:       const result = await saveRideTip(tripId, selectedTip);
106:       setIsSavingTip(false);
107:       if (result.success) {
108:         setTipSaved(true);
109:         toast.success("Tip added! 100% goes to your driver.");
110:         // Brief delay to show confirmation
111:         await new Promise(r => setTimeout(r, 1200));
112:       } else {
113:         toast.error("Failed to save tip. Please try again.");
114:         return;
115:       }
116:     }
117: 
118:     onDone();
119:     // Reset state for next use
120:     setRating(0);
121:     setHasRated(false);
122:     setSelectedTip(null);
123:     setFeedback("");
124:     setRatingError(null);
125:     setTipSaved(false);
126:     setShowCustomTip(false);
127:     setCustomTipValue("");
128:     setRatingCategories({});
129:     setSelectedTags([]);
130:   };
131: 
132:   const RIDE_FEEDBACK_TAGS = [
133:     { id: "great_conversation", label: "Great conversation", positive: true },
134:     { id: "smooth_ride", label: "Smooth ride", positive: true },
135:     { id: "clean_car", label: "Clean car", positive: true },
136:     { id: "late_arrival", label: "Late arrival", positive: false },
137:     { id: "unsafe_driving", label: "Unsafe driving", positive: false },
138:     { id: "rude_behavior", label: "Rude behavior", positive: false },
139:   ];
140: 
141:   const CATEGORY_LABELS = [
142:     { key: "driving", label: "Driving" },
143:     { key: "cleanliness", label: "Cleanliness" },
144:     { key: "friendliness", label: "Friendliness" },
145:     { key: "navigation", label: "Navigation" },
146:   ];
147: 
148:   const toggleFeedbackTag = (tagId: string) => {
149:     setSelectedTags((prev) =>
150:       prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
151:     );
152:   };
153: 
154:   return (
155:     <Dialog open={isOpen} onOpenChange={onClose}>
156:       <DialogContent className="bg-zinc-900/98 backdrop-blur-xl border-white/10 text-white max-w-sm mx-auto max-h-[90vh] overflow-y-auto">
157:         <DialogHeader className="text-center pb-2">
158:           <motion.div
159:             initial={{ scale: 0 }}
160:             animate={{ scale: 1 }}
161:             transition={{ type: "spring", delay: 0.1 }}
162:             className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3"
163:           >
164:             <CheckCircle2 className="w-8 h-8 text-green-500" />
165:           </motion.div>
166:           <DialogTitle className="text-2xl font-bold text-white">Trip Complete!</DialogTitle>
167:         </DialogHeader>
168: 
169:         {/* Fare Breakdown */}
170:         <motion.div
171:           initial={{ opacity: 0, y: 20 }}
172:           animate={{ opacity: 1, y: 0 }}
173:           transition={{ delay: 0.2 }}
174:           className="space-y-3 py-4"
175:         >
176:           <div className="space-y-2 text-sm">
177:             <div className="flex justify-between">
178:               <span className="text-white/60">Base fare</span>
179:               <span className="text-white">${baseFare.toFixed(2)}</span>
180:             </div>
181:             <div className="flex justify-between">
182:               <span className="text-white/60">Time ({formatTime(tripElapsed)})</span>
183:               <span className="text-white">${timeCost.toFixed(2)}</span>
184:             </div>
185:             <div className="flex justify-between">
186:               <span className="text-white/60">Distance ({distance.toFixed(1)} mi)</span>
187:               <span className="text-white">${distanceCost.toFixed(2)}</span>
188:             </div>
189:             <div className="flex justify-between">
190:               <span className="text-white/60">Service fee</span>
191:               <span className="text-white">${serviceFee.toFixed(2)}</span>
192:             </div>
193:           </div>
194: 
195:           <div className="border-t border-white/10 pt-3 space-y-2">
196:             {selectedTip && (
197:               <div className="flex justify-between items-center text-sm">
198:                 <span className="text-white/60">Tip</span>
199:                 <span className="text-white">${selectedTip.toFixed(2)}</span>
200:               </div>
201:             )}
202:             <div className="flex justify-between items-center">
203:               <span className="font-semibold text-white">Total</span>
204:               <span className="text-2xl font-bold text-primary">${totalWithTip.toFixed(2)}</span>
205:             </div>
206:           </div>
207: 
208:           {/* Commission Breakdown - read-only display */}
209:           <div className="pt-3 mt-3 border-t border-white/10 space-y-2 text-sm">
210:             <div className="flex justify-between">
211:               <span className="text-white/60">Driver earned</span>
212:               <span className="text-green-400">${(price * DRIVER_SHARE_RATE).toFixed(2)}</span>
213:             </div>
214:             <div className="flex justify-between">
215:               <span className="text-white/60">Platform fee</span>
216:               <span className="text-white/40">${(price * PLATFORM_COMMISSION_RATE).toFixed(2)}</span>
217:             </div>
218:           </div>
219:         </motion.div>
220: 
221:         {/* Rating Section */}
222:         <motion.div
223:           initial={{ opacity: 0, y: 20 }}
224:           animate={{ opacity: 1, y: 0 }}
225:           transition={{ delay: 0.3 }}
226:           className="py-4 border-t border-white/10"
227:         >
228:           <p className="text-center text-white/60 mb-3">Rate your driver</p>
229:           
230:           <div className="flex justify-center gap-2">
231:             {[1, 2, 3, 4, 5].map((star) => (
232:               <motion.button
233:                 key={star}
234:                 whileHover={{ scale: 1.1 }}
235:                 whileTap={{ scale: 0.9 }}
236:                 onMouseEnter={() => setHoveredStar(star)}
237:                 onMouseLeave={() => setHoveredStar(0)}
238:                 onClick={() => handleStarClick(star)}
239:                 disabled={isSaving || hasRated}
240:                 className="p-1 transition-all duration-200 disabled:opacity-50 active:scale-90 touch-manipulation"
241:               >
242:                 <Star
243:                   className={cn(
244:                     "w-8 h-8 transition-colors",
245:                     (hoveredStar >= star || rating >= star)
246:                       ? "text-yellow-400 fill-yellow-400"
247:                       : "text-white/20"
248:                   )}
249:                 />
250:               </motion.button>
251:             ))}
252:           </div>
253: 
254:           {/* Category Ratings */}
255:           {rating > 0 && !hasRated && (
256:             <motion.div
257:               initial={{ opacity: 0, height: 0 }}
258:               animate={{ opacity: 1, height: "auto" }}
259:               className="mt-4 space-y-3"
260:             >
261:               <p className="text-xs text-white/40 text-center">Rate specific areas (optional)</p>
262:               <div className="grid grid-cols-2 gap-2">
263:                 {CATEGORY_LABELS.map(({ key, label }) => (
264:                   <div key={key} className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-150">
265:                     <p className="text-xs text-white/60 mb-1">{label}</p>
266:                     <div className="flex gap-0.5">
267:                       {[1, 2, 3, 4, 5].map((s) => (
268:                         <button
269:                           key={s}
270:                           type="button"
271:                           onClick={() => setRatingCategories((prev) => ({ ...prev, [key]: s }))}
272:                           className="p-0.5"
273:                         >
274:                           <Star
275:                             className={cn(
276:                               "w-4 h-4 transition-colors",
277:                               (ratingCategories[key] || 0) >= s
278:                                 ? "text-yellow-400 fill-yellow-400"
279:                                 : "text-white/15"
280:                             )}
281:                           />
282:                         </button>
283:                       ))}
284:                     </div>
285:                   </div>
286:                 ))}
287:               </div>
288: 
289:               {/* Feedback Tags */}
290:               <div className="flex flex-wrap gap-1.5">
291:                 {RIDE_FEEDBACK_TAGS.map((tag) => (
292:                   <button
293:                     key={tag.id}
294:                     onClick={() => toggleFeedbackTag(tag.id)}
295:                     className={cn(
296:                       "px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 border touch-manipulation active:scale-90",
297:                       selectedTags.includes(tag.id)
298:                         ? tag.positive
299:                           ? "bg-green-600 border-green-600 text-white"
300:                           : "bg-destructive border-destructive text-white"
301:                         : "bg-transparent border-white/15 text-white/60 hover:bg-white/5"
302:                     )}
303:                   >
304:                     {tag.label}
305:                   </button>
306:                 ))}
307:               </div>
308:             </motion.div>
309:           )}
310: 
311:           {!hasRated && (
312:             <motion.div
313:               initial={{ opacity: 0, height: 0 }}
314:               animate={{ opacity: 1, height: "auto" }}
315:               className="mt-4"
316:             >
317:               <Textarea
318:                 value={feedback}
319:                 onChange={(e) => setFeedback(e.target.value)}
320:                 placeholder="Tell us about your experience (optional)..."
321:                 className="min-h-[80px] bg-white/5 border-white/10 text-white placeholder:text-white/40 resize-none"
322:                 maxLength={500}
323:                 disabled={isSaving || hasRated}
324:               />
325:               <p className="text-xs text-white/30 mt-1 text-right">
326:                 {feedback.length}/500
327:               </p>
328:             </motion.div>
329:           )}
330: 
331:           {/* Submit Rating Button */}
332:           {!hasRated && (
333:             <Button
334:               onClick={handleSubmitRating}
335:               disabled={isSaving || rating === 0}
336:               className="w-full mt-3 h-11 bg-primary hover:bg-primary/90 rounded-xl font-bold shadow-md active:scale-[0.97] transition-all duration-200 touch-manipulation"
337:             >
338:               {isSaving ? (
339:                 <>
340:                   <Loader2 className="w-4 h-4 mr-2 animate-spin" />
341:                   Saving...
342:                 </>
343:               ) : (
344:                 'Submit Rating'
345:               )}
346:             </Button>
347:           )}
348: 
349:           {/* Error Message */}
350:           <AnimatePresence>
351:             {ratingError && (
352:               <motion.p
353:                 initial={{ opacity: 0, y: -10 }}
354:                 animate={{ opacity: 1, y: 0 }}
355:                 exit={{ opacity: 0 }}
356:                 className="text-center text-sm text-red-400 mt-2"
357:               >
358:                 {ratingError}
359:               </motion.p>
360:             )}
361:           </AnimatePresence>
362: 
363:           {/* Success Message */}
364:           <AnimatePresence>
365:             {hasRated && (
366:               <motion.div
367:                 initial={{ opacity: 0, y: -10 }}
368:                 animate={{ opacity: 1, y: 0 }}
369:                 exit={{ opacity: 0 }}
370:                 className="flex items-center justify-center gap-2 text-green-400 mt-3"
371:               >
372:                 <CheckCircle2 className="w-4 h-4" />
373:                 <span className="text-sm">Thanks for your feedback!</span>
374:               </motion.div>
375:             )}
376:           </AnimatePresence>
377:         </motion.div>
378: 
379:         {/* Tip Selection */}
380:         <motion.div
381:           initial={{ opacity: 0, y: 20 }}
382:           animate={{ opacity: 1, y: 0 }}
383:           transition={{ delay: 0.35 }}
384:           className="py-4 border-t border-white/10"
385:         >
386:           <div className="flex items-center justify-center gap-2 mb-3">
387:             <Heart className="w-4 h-4 text-emerald-500" />
388:             <p className="text-white/60">Add a tip</p>
389:           </div>
390: 
391:           {tipSaved ? (
392:             <motion.div
393:               initial={{ opacity: 0, scale: 0.9 }}
394:               animate={{ opacity: 1, scale: 1 }}
395:               className="flex items-center justify-center gap-2 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl"
396:             >
397:               <CheckCircle2 className="w-5 h-5 text-emerald-500" />
398:               <span className="text-sm text-emerald-400 font-medium">
399:                 ${selectedTip?.toFixed(2)} tip added — 100% goes to your driver
400:               </span>
401:             </motion.div>
402:           ) : (
403:             <>
404:               <div className="flex justify-center gap-2">
405:                 {[1, 3, 5].map((amount) => (
406:                   <motion.button
407:                     key={amount}
408:                     whileTap={{ scale: 0.95 }}
409:                     disabled={isSavingTip}
410:                     onClick={() => setSelectedTip(selectedTip === amount ? null : amount)}
411:                     className={cn(
412:                       "px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border touch-manipulation active:scale-[0.95]",
413:                       selectedTip === amount
414:                         ? "bg-emerald-500 text-white border-emerald-500"
415:                         : "bg-white/5 text-white/80 border-white/10 hover:bg-white/10"
416:                     )}
417:                   >
418:                     ${amount}
419:                   </motion.button>
420:                 ))}
421:                 <motion.button
422:                   whileTap={{ scale: 0.95 }}
423:                   disabled={isSavingTip}
424:                   onClick={() => {
425:                     setCustomTipValue(selectedTip && ![1, 3, 5].includes(selectedTip) ? selectedTip.toString() : "");
426:                     setShowCustomTip(true);
427:                   }}
428:                   className={cn(
429:                     "px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border touch-manipulation active:scale-[0.95]",
430:                     selectedTip && ![1, 3, 5].includes(selectedTip)
431:                       ? "bg-emerald-500 text-white border-emerald-500"
432:                       : "bg-white/5 text-white/80 border-white/10 hover:bg-white/10"
433:                   )}
434:                 >
435:                   Custom
436:                 </motion.button>
437:               </div>
438:               {selectedTip && (
439:                 <motion.button
440:                   initial={{ opacity: 0 }}
441:                   animate={{ opacity: 1 }}
442:                   onClick={() => setSelectedTip(null)}
443:                   className="block mx-auto mt-2 text-xs text-white/40 hover:text-white/60 transition-all duration-200 touch-manipulation active:scale-95"
444:                 >
445:                   No tip
446:                 </motion.button>
447:               )}
448:               <p className="text-xs text-white/30 mt-2 text-center">100% of tip goes to your driver</p>
449:             </>
450:           )}
451:         </motion.div>
452: 
453:         {/* Custom Tip Dialog */}
454:         <Dialog open={showCustomTip} onOpenChange={setShowCustomTip}>
455:           <DialogContent className="bg-zinc-900 border-white/10 max-w-xs">
456:             <DialogHeader>
457:               <DialogTitle>Custom Tip</DialogTitle>
458:             </DialogHeader>
459:             <div className="space-y-4">
460:               <div className="relative">
461:                 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">$</span>
462:                 <Input
463:                   type="number"
464:                   min="0"
465:                   step="0.01"
466:                   placeholder="0.00"
467:                   value={customTipValue}
468:                   onChange={(e) => setCustomTipValue(e.target.value)}
469:                   className="pl-7 bg-zinc-800 border-white/10 text-lg h-12"
470:                   autoFocus
471:                 />
472:               </div>
473:               <Button
474:                 onClick={() => {
475:                   const value = parseFloat(customTipValue);
476:                   if (!isNaN(value) && value >= 0) {
477:                     setSelectedTip(Math.round(value * 100) / 100);
478:                     setShowCustomTip(false);
479:                     setCustomTipValue("");
480:                   }
481:                 }}
482:                 className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-11"
483:               >
484:                 Add Tip
485:               </Button>
486:             </div>
487:           </DialogContent>
488:         </Dialog>
489: 
490:         {/* Footer Actions */}
491:         <div className="mt-4 pt-4 border-t border-white/10 flex gap-3">
492:           <Button
493:             variant="outline"
494:             onClick={handleDone}
495:             className="flex-1 h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white"
496:           >
497:             Done
498:           </Button>
499:         </div>
500:       </DialogContent>
501:     </Dialog>
502:   );
503: };
504: 
505: export default RideReceiptModal;