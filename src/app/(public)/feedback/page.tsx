"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Star, CheckCircle2, MessageSquare, ThumbsUp, ThumbsDown,
  Send, Loader2, Smile, Meh, Frown, AlertCircle,
} from "lucide-react";

const SERVICES = [
  "Complaint Resolution", "Water Supply", "Road Maintenance",
  "Sanitation", "Street Lighting", "Parks & Gardens",
  "Staff Behavior", "Online Portal", "Other",
];

const RATINGS = [
  { value: 1, icon: Frown, label: "Very Poor", color: "text-red-500", bg: "bg-red-50 border-red-200" },
  { value: 2, icon: Frown, label: "Poor", color: "text-orange-500", bg: "bg-orange-50 border-orange-200" },
  { value: 3, icon: Meh, label: "Average", color: "text-amber-500", bg: "bg-amber-50 border-amber-200" },
  { value: 4, icon: Smile, label: "Good", color: "text-blue-500", bg: "bg-blue-50 border-blue-200" },
  { value: 5, icon: Smile, label: "Excellent", color: "text-emerald-500", bg: "bg-emerald-50 border-emerald-200" },
];

export default function FeedbackPage() {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [service, setService] = useState("");
  const [comment, setComment] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayRating = hoverRating || rating;
  const ratingConf = RATINGS.find(r => r.value === displayRating);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) { setError("Please select a rating"); return; }
    if (!service) { setError("Please select a service"); return; }
    setError(null);
    setSubmitting(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 1200));
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center space-y-5">
          <div className="flex justify-center">
            <div className="p-4 bg-emerald-100 rounded-full">
              <CheckCircle2 className="h-14 w-14 text-emerald-500" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Thank You!</h2>
          <p className="text-gray-600">Your feedback has been submitted. It helps us improve our services for all citizens.</p>
          <div className="flex justify-center gap-1">
            {[1,2,3,4,5].map(s => (
              <Star key={s} className={`h-6 w-6 ${s <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`} />
            ))}
          </div>
          <Button asChild className="w-full bg-[#1a3a6b] hover:bg-[#1a3a6b]/90">
            <a href="/">Back to Home</a>
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1a3a6b] text-white">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl">
              <MessageSquare className="h-8 w-8 text-yellow-300" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Citizen Feedback</h1>
              <p className="text-white/70 text-sm mt-0.5">Rate our services and help us improve</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Star Rating */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border-2 border-gray-100 shadow-md p-6 text-center">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Overall Experience</h2>
            <p className="text-sm text-gray-500 mb-6">How would you rate our municipal services?</p>

            <div className="flex justify-center gap-3 mb-4">
              {[1,2,3,4,5].map(s => (
                <button key={s} type="button"
                  onMouseEnter={() => setHoverRating(s)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(s)}
                  className="transition-transform hover:scale-125 focus:outline-none">
                  <Star className={`h-10 w-10 transition-colors ${s <= displayRating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`} />
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {ratingConf && (
                <motion.div key={ratingConf.value} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 ${ratingConf.bg}`}>
                  <ratingConf.icon className={`h-5 w-5 ${ratingConf.color}`} />
                  <span className={`font-bold text-sm ${ratingConf.color}`}>{ratingConf.label}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Service Selection */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border-2 border-gray-100 shadow-md p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4">Which service are you rating?</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SERVICES.map(s => (
                <button key={s} type="button" onClick={() => setService(s)}
                  className={`px-3 py-2.5 rounded-xl border-2 text-sm font-medium text-left transition-all ${
                    service === s ? "border-[#1a3a6b] bg-[#1a3a6b]/10 text-[#1a3a6b]" : "border-gray-200 text-gray-600 hover:border-[#1a3a6b]/40"
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Quick Reactions */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="bg-white rounded-2xl border-2 border-gray-100 shadow-md p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4">Quick Reactions</h2>
            <div className="flex flex-wrap gap-2">
              {["Fast Response", "Helpful Staff", "Clean Area", "Good Roads", "Regular Water", "Safe Streets",
                "Slow Response", "Needs Improvement", "Poor Maintenance"].map(tag => (
                <Badge key={tag} variant="outline"
                  className="cursor-pointer px-3 py-1.5 text-sm hover:bg-[#1a3a6b] hover:text-white hover:border-[#1a3a6b] transition-all">
                  {tag}
                </Badge>
              ))}
            </div>
          </motion.div>

          {/* Comment */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border-2 border-gray-100 shadow-md p-6 space-y-4">
            <h2 className="text-base font-bold text-gray-900">Your Comments</h2>
            <textarea
              placeholder="Share your experience in detail... What went well? What can be improved?"
              value={comment} onChange={e => setComment(e.target.value)}
              className="w-full min-h-[120px] rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#1a3a6b] transition-colors resize-none"
            />
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">Name (Optional)</Label>
                <Input placeholder="Your name" value={name} onChange={e => setName(e.target.value)}
                  className="border-2 border-gray-200 focus:border-[#1a3a6b]" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">Email (Optional)</Label>
                <Input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)}
                  className="border-2 border-gray-200 focus:border-[#1a3a6b]" />
              </div>
            </div>
          </motion.div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <Button type="submit" disabled={submitting} className="w-full h-12 text-base bg-[#1a3a6b] hover:bg-[#1a3a6b]/90 gap-2 shadow-lg">
            {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            {submitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </form>
      </div>
    </div>
  );
}
