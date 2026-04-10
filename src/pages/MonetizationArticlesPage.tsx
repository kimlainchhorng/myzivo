/**
 * MonetizationArticlesPage — Full creator academy with categorized articles
 * Comprehensive learning resources hub for ZIVO creators
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Search, DollarSign, Crown, Gift, Heart, Star,
  Video, Store, Megaphone, ShieldCheck, Users, Sparkles,
  Lock, BadgeCheck, Settings, Eye, TrendingUp, BookOpen,
  Palette, Music, BarChart3, Target, MessageCircle, Layers,
  Zap, Globe, Camera, Film, Smartphone, Share2, Bell,
  Shield, AlertTriangle, Brain, Lightbulb, Compass, Map,
  PlayCircle, Mic, Layout, PenTool, Wand2, Radio,
} from "lucide-react";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import SEOHead from "@/components/SEOHead";

/* ─── Types ─── */
interface Article {
  title: string;
  description: string;
  views: string;
  icon: typeof Star;
  iconBg: string;
  iconColor: string;
}

interface Section {
  heading: string;
  articles: Article[];
}

/* ─── Tab definitions ─── */
const TABS = [
  { id: "recommended", label: "Recommended" },
  { id: "getting-started", label: "Getting Started on ZIVO" },
  { id: "community", label: "Follow Community Guidelines" },
  { id: "tools", label: "How to Use Our Tools" },
  { id: "engagement", label: "How to Increase Engagement on ZIVO" },
  { id: "monetize", label: "How to Monetize on ZIVO" },
];

/* ─── RECOMMENDED ─── */
const RECOMMENDED_SECTIONS: Section[] = [
  {
    heading: "How to Monetize on ZIVO",
    articles: [
      { title: "Monetizing your content on ZIVO", description: "Ready to start collecting rewards for your creativity? Learn everything about turning views into earnings...", views: "9.2M views", icon: DollarSign, iconBg: "bg-emerald-500/10", iconColor: "text-emerald-500" },
      { title: "Creator Monetization Center", description: "Are you a ZIVO creator looking to turn your passion into profit? Discover the tools at your fingertips...", views: "7.3M views", icon: TrendingUp, iconBg: "bg-blue-500/10", iconColor: "text-blue-500" },
      { title: "How to verify your identity to collect payouts", description: "Maintaining safety on ZIVO is our top priority. Learn how to verify and start earning...", views: "249.8K views", icon: BadgeCheck, iconBg: "bg-indigo-500/10", iconColor: "text-indigo-500" },
      { title: "Getting your rewards from ZIVO", description: "We've made managing your ZIVO rewards simple. Track, withdraw, and manage your creator earnings...", views: "243.6K views", icon: Gift, iconBg: "bg-rose-500/10", iconColor: "text-rose-500" },
    ],
  },
  {
    heading: "Platform Pay",
    articles: [
      { title: "Creator Rewards Program", description: "If you're passionate about crafting high-quality content, the Creator Rewards Program is for you...", views: "14.4M views", icon: Crown, iconBg: "bg-amber-500/10", iconColor: "text-amber-500" },
      { title: "Effect Creator Rewards", description: "Have you ever wondered what ZIVO's Effect Creator Rewards are all about? Discover how to earn...", views: "5.0M views", icon: Sparkles, iconBg: "bg-purple-500/10", iconColor: "text-purple-500" },
      { title: "Winning rewards and boosting your creativity with contests", description: "Whether you're creating film & TV, sport, or lifestyle content, contests can supercharge your reach...", views: "203.1K views", icon: Star, iconBg: "bg-orange-500/10", iconColor: "text-orange-500" },
    ],
  },
  {
    heading: "User Pay",
    articles: [
      { title: "Series", description: "Series allows you to post groups of videos behind a paywall, creating premium episodic content...", views: "310.4K views", icon: Video, iconBg: "bg-purple-500/10", iconColor: "text-purple-500" },
      { title: "Getting started with Subscription", description: "Subscription is your key to unleashing your creativity and fostering deeper audience connections...", views: "7.7M views", icon: Crown, iconBg: "bg-amber-500/10", iconColor: "text-amber-500" },
      { title: "Locked Media monetization", description: "Send exclusive photos and videos as pay-to-unlock content in chat and grow your revenue...", views: "1.2M views", icon: Lock, iconBg: "bg-indigo-500/10", iconColor: "text-indigo-500" },
    ],
  },
  {
    heading: "Branded Content",
    articles: [
      { title: "Creating branded content on ZIVO", description: "Whether you're participating in collaborations or building brand partnerships, learn the essentials...", views: "2.3M views", icon: Megaphone, iconBg: "bg-orange-500/10", iconColor: "text-orange-500" },
      { title: "Creating content brands will want to Spark", description: "Are you looking to land a brand deal and grow your creator business? Here's how to stand out...", views: "80.2K views", icon: Sparkles, iconBg: "bg-pink-500/10", iconColor: "text-pink-500" },
      { title: "Building long-lasting brand partnerships", description: "ZIVO audiences crave authentic content. Learn how to build sustainable brand relationships...", views: "86.6K views", icon: Users, iconBg: "bg-blue-500/10", iconColor: "text-blue-500" },
      { title: "Collecting more rewards through brand tagging and ad authorization", description: "If you want more brands to see your content, learn how to leverage tagging and authorization...", views: "42.4K views", icon: Target, iconBg: "bg-emerald-500/10", iconColor: "text-emerald-500" },
      { title: "Monetize your content with brand deals on ZIVO", description: "If you're a creator, brand deals can help you earn while doing what you love...", views: "6,571 views", icon: DollarSign, iconBg: "bg-emerald-500/10", iconColor: "text-emerald-500" },
      { title: "Understanding Audience Commercial Value in the Creator Rewards", description: "In the Creator Rewards Program, high-quality content that attracts commercial audiences earns more...", views: "66.8K views", icon: BarChart3, iconBg: "bg-blue-500/10", iconColor: "text-blue-500" },
    ],
  },
  {
    heading: "LIVE",
    articles: [
      { title: "Going LIVE!", description: "ZIVO LIVE is where the party's at – it's all about real-time fun, self-expression, and connecting...", views: "5.7M views", icon: Video, iconBg: "bg-red-500/10", iconColor: "text-red-500" },
      { title: "Unlocking LIVE monetization", description: "Get more from your LIVEs! Explore all the ways you can monetize your streams and increase earnings...", views: "5.7M views", icon: DollarSign, iconBg: "bg-emerald-500/10", iconColor: "text-emerald-500" },
      { title: "Scaled LIVE rewards: Supercharging your LIVE journey", description: "We understand the dedication and effort you put into every LIVE session...", views: "544.7K views", icon: TrendingUp, iconBg: "bg-amber-500/10", iconColor: "text-amber-500" },
    ],
  },
  {
    heading: "Shop",
    articles: [
      { title: "ZIVO Shop", description: "With ZIVO Shop, you can drive your audience from content to commerce seamlessly...", views: "6.8M views", icon: Store, iconBg: "bg-emerald-500/10", iconColor: "text-emerald-500" },
    ],
  },
];

/* ─── GETTING STARTED ─── */
const GETTING_STARTED_SECTIONS: Section[] = [
  {
    heading: "Become a Creator",
    articles: [
      { title: "Navigating ZIVO as a beginner", description: "Welcome to ZIVO! Congratulations on taking the first step in your creative journey...", views: "3.0M views", icon: Star, iconBg: "bg-amber-500/10", iconColor: "text-amber-500" },
      { title: "Getting started on ZIVO", description: "Are you looking for a place where you can share your passion and connect with others?", views: "1.8M views", icon: Users, iconBg: "bg-blue-500/10", iconColor: "text-blue-500" },
      { title: "8 tips for becoming a successful ZIVO creator", description: "Endless laughs, jaw-dropping storytimes, and content that inspires millions...", views: "1.6M views", icon: Sparkles, iconBg: "bg-purple-500/10", iconColor: "text-purple-500" },
      { title: "Kickstarting your ZIVO journey with content ideas", description: "Have you ever watched your favorite creators and wondered how they come up with ideas?", views: "419.6K views", icon: BookOpen, iconBg: "bg-rose-500/10", iconColor: "text-rose-500" },
    ],
  },
  {
    heading: "Account Management",
    articles: [
      { title: "How to personalize your ZIVO profile", description: "Once you've set up your ZIVO account, it's time to make your profile truly yours...", views: "1.1M views", icon: Users, iconBg: "bg-blue-500/10", iconColor: "text-blue-500" },
      { title: "Verification 101: how to get the Blue Check", description: "Ever noticed that little blue check mark next to some profiles? Learn how to get yours...", views: "775.2K views", icon: BadgeCheck, iconBg: "bg-indigo-500/10", iconColor: "text-indigo-500" },
      { title: "Choosing the right account: Business vs. Personal", description: "Joining the ZIVO community can open up a world of possibilities...", views: "1.0M views", icon: Settings, iconBg: "bg-muted", iconColor: "text-muted-foreground" },
      { title: "Troubleshooting issues with Account check", description: "If something's up with your ZIVO account, Account check can help diagnose and fix it...", views: "113.9K views", icon: AlertTriangle, iconBg: "bg-orange-500/10", iconColor: "text-orange-500" },
    ],
  },
];

/* ─── COMMUNITY GUIDELINES ─── */
const COMMUNITY_SECTIONS: Section[] = [
  {
    heading: "Understand the Rules",
    articles: [
      { title: "Community Guidelines", description: "ZIVO is where people discover things they love. Understanding our guidelines helps keep it safe...", views: "2.3M views", icon: ShieldCheck, iconBg: "bg-emerald-500/10", iconColor: "text-emerald-500" },
      { title: "Creator code of conduct", description: "It's our priority to maintain a safe and welcoming environment for everyone on ZIVO...", views: "1.9M views", icon: Heart, iconBg: "bg-rose-500/10", iconColor: "text-rose-500" },
      { title: "Understanding ZIVO's Originality Policy", description: "At ZIVO, we're all about inspiring creativity and original content creation...", views: "371.6K views", icon: Sparkles, iconBg: "bg-purple-500/10", iconColor: "text-purple-500" },
      { title: "Understanding ZIVO's policy on regulated goods and commercial activities", description: "ZIVO is a place to share and learn about products, but certain rules apply...", views: "14.1K views", icon: Store, iconBg: "bg-emerald-500/10", iconColor: "text-emerald-500" },
      { title: "Understanding ZIVO's policy on sensitive and mature themes", description: "ZIVO welcomes a range of content, from educational to entertainment, with clear boundaries...", views: "13.8K views", icon: Eye, iconBg: "bg-amber-500/10", iconColor: "text-amber-500" },
      { title: "Understanding ZIVO's policy on safety and civility", description: "Feeling safe and respected is important to everyone. Learn how we enforce this...", views: "13.7K views", icon: Shield, iconBg: "bg-blue-500/10", iconColor: "text-blue-500" },
      { title: "Understanding ZIVO's policy on integrity and authenticity", description: "ZIVO is all about having authentic experiences and genuine connections...", views: "9,398 views", icon: BadgeCheck, iconBg: "bg-indigo-500/10", iconColor: "text-indigo-500" },
      { title: "Understanding ZIVO's policy on privacy and security", description: "Keeping your personal information safe is our top priority...", views: "5,873 views", icon: Lock, iconBg: "bg-indigo-500/10", iconColor: "text-indigo-500" },
      { title: "Understanding ZIVO's account policy", description: "We want everyone to have a safe and positive experience on ZIVO...", views: "10.6K views", icon: Settings, iconBg: "bg-muted", iconColor: "text-muted-foreground" },
      { title: "Understanding ZIVO's policy on mental and behavioral health", description: "We care deeply about your well-being. This policy covers mental health content...", views: "8.2K views", icon: Brain, iconBg: "bg-pink-500/10", iconColor: "text-pink-500" },
    ],
  },
  {
    heading: "Community Safety",
    articles: [
      { title: "AI-generated content label", description: "Our platform is built on creativity and authenticity. Learn about our AI content labeling policy...", views: "392.4K views", icon: Wand2, iconBg: "bg-purple-500/10", iconColor: "text-purple-500" },
      { title: "Supporting your mental health", description: "On ZIVO, we're doing what we can to ensure your experience supports your well-being...", views: "238.8K views", icon: Heart, iconBg: "bg-rose-500/10", iconColor: "text-rose-500" },
      { title: "Keeping your account safe and secure", description: "Your security on ZIVO is important to us. Here's how to protect your account...", views: "263.6K views", icon: Shield, iconBg: "bg-emerald-500/10", iconColor: "text-emerald-500" },
      { title: "Navigating ZIVO's policies on political ads", description: "At ZIVO, we want to empower you to stay informed while maintaining a safe environment...", views: "294.1K views", icon: Globe, iconBg: "bg-blue-500/10", iconColor: "text-blue-500" },
      { title: "Reporting and appealing impersonation claims", description: "Your authenticity is what makes ZIVO special. Learn how to report impersonation...", views: "106.1K views", icon: AlertTriangle, iconBg: "bg-red-500/10", iconColor: "text-red-500" },
      { title: "Capturing more creative automotive content with our driving policy", description: "If you make automotive content, you'll want to know about our updated driving policy...", views: "17.1K views", icon: Camera, iconBg: "bg-amber-500/10", iconColor: "text-amber-500" },
    ],
  },
  {
    heading: "How ZIVO Works",
    articles: [
      { title: "Understanding the Recommendation System", description: "Ever wondered why your ZIVO feed seems to know exactly what you like? Here's how it works...", views: "719.6K views", icon: Compass, iconBg: "bg-blue-500/10", iconColor: "text-blue-500" },
      { title: "Moderation and Appeals", description: "At ZIVO, our mission is to inspire creativity while keeping our community safe...", views: "652.3K views", icon: ShieldCheck, iconBg: "bg-emerald-500/10", iconColor: "text-emerald-500" },
      { title: "Why is your video not getting recommended on the For You feed?", description: "The For You feed is the heart of ZIVO. If your content isn't showing up, here's why...", views: "357.7K views", icon: Eye, iconBg: "bg-purple-500/10", iconColor: "text-purple-500" },
      { title: "Appealing a muted video", description: "Have you ever had a sound go missing from your video? Learn how to appeal...", views: "79.3K views", icon: Music, iconBg: "bg-pink-500/10", iconColor: "text-pink-500" },
      { title: "Keeping your account in good standing", description: "Your account health affects your reach. Learn how to maintain good standing...", views: "145.2K views", icon: Star, iconBg: "bg-amber-500/10", iconColor: "text-amber-500" },
    ],
  },
];

/* ─── HOW TO USE OUR TOOLS ─── */
const TOOLS_SECTIONS: Section[] = [
  {
    heading: "Equip Your Creation",
    articles: [
      { title: "Unleashing creative potential by using longer video tools", description: "We've got some awesome features on ZIVO that let you go beyond short-form content...", views: "623.6K views", icon: Film, iconBg: "bg-purple-500/10", iconColor: "text-purple-500" },
      { title: "Shooting in landscape on ZIVO", description: "For horizontal content, viewers can now enjoy a full-screen experience on ZIVO...", views: "878.9K views", icon: Smartphone, iconBg: "bg-blue-500/10", iconColor: "text-blue-500" },
      { title: "Reaching your content goals with ZIVO Studio Web", description: "You already know how easy it is to access ZIVO Studio. Now discover even more tools...", views: "829.8K views", icon: Layout, iconBg: "bg-indigo-500/10", iconColor: "text-indigo-500" },
      { title: "Creating Playlists to get more views", description: "Looking for another way to get more views? Playlists can organize your content for binge-watching...", views: "2.1M views", icon: Layers, iconBg: "bg-emerald-500/10", iconColor: "text-emerald-500" },
      { title: "Leveling up your content with ZIVO Studio In-app", description: "Say hello to your new bestie: ZIVO Studio In-app makes creating polished content effortless...", views: "1.5M views", icon: Sparkles, iconBg: "bg-pink-500/10", iconColor: "text-pink-500" },
      { title: "Unleashing your creativity with the ZIVO Studio app", description: "Whether you're a seasoned creator, a new creator, or a business looking to grow...", views: "319.2K views", icon: PenTool, iconBg: "bg-rose-500/10", iconColor: "text-rose-500" },
      { title: "Advancing your content creation with ZIVO's AI creative suite", description: "Get ready to supercharge your content creation with AI-powered tools...", views: "19.1K views", icon: Wand2, iconBg: "bg-purple-500/10", iconColor: "text-purple-500" },
      { title: "Using Creator Search in the ZIVO Studio App", description: "Want to give your videos more potential? Creator Search helps you find trending topics...", views: "69.3K views", icon: Search, iconBg: "bg-blue-500/10", iconColor: "text-blue-500" },
      { title: "Introducing Creation inspirations", description: "Ever get stuck coming up with new content ideas? Creation inspirations is here to help...", views: "62.3K views", icon: Lightbulb, iconBg: "bg-amber-500/10", iconColor: "text-amber-500" },
      { title: "Staying on top of what's popular with Trending Topics", description: "Do you want to know what's trending on ZIVO right now? Stay ahead of the curve...", views: "37.5K views", icon: TrendingUp, iconBg: "bg-red-500/10", iconColor: "text-red-500" },
    ],
  },
  {
    heading: "Get Insight",
    articles: [
      { title: "Introducing ZIVO analytics", description: "ZIVO analytics helps you unlock lots of useful insights about your content performance...", views: "504.4K views", icon: BarChart3, iconBg: "bg-blue-500/10", iconColor: "text-blue-500" },
      { title: "Using analytics as a tool to improve video performance", description: "You need more than imagination if you want your videos to reach more people...", views: "63.6K views", icon: TrendingUp, iconBg: "bg-emerald-500/10", iconColor: "text-emerald-500" },
      { title: "Creator Search Insights", description: "Meet Creator Search Insights, your go-to tool for understanding what your audience searches for...", views: "2.0M views", icon: Search, iconBg: "bg-purple-500/10", iconColor: "text-purple-500" },
      { title: "Positioning your content for discovery: why Search Analytics matters", description: "More and more users are relying on ZIVO Search to discover content. Here's how to optimize...", views: "455.1K views", icon: Compass, iconBg: "bg-amber-500/10", iconColor: "text-amber-500" },
      { title: "Getting discovered with Search: Your questions answered", description: "What sets ZIVO apart is being able to discover authentic, relatable content through Search...", views: "113.6K views", icon: Eye, iconBg: "bg-blue-500/10", iconColor: "text-blue-500" },
      { title: "Finding Creator Search Insights", description: "Looking for ideas to get more eyes on your content? Creator Search Insights shows you the way...", views: "674.0K views", icon: Target, iconBg: "bg-red-500/10", iconColor: "text-red-500" },
      { title: "Understanding the Detail Page within Creator Search Insights", description: "ZIVO's Creator Search Insights tool opens up a world of data to optimize your strategy...", views: "235.5K views", icon: BarChart3, iconBg: "bg-indigo-500/10", iconColor: "text-indigo-500" },
      { title: "Raising your Search ratings with the Content gap tab", description: "Ever used the Search tool on ZIVO but felt like something was missing? The Content gap tab helps...", views: "38.3K views", icon: TrendingUp, iconBg: "bg-emerald-500/10", iconColor: "text-emerald-500" },
      { title: "Sharpening your strategy with Creator Assistant", description: "ZIVO's Creator Assistant is your very own AI-powered coach for content strategy...", views: "23.9K views", icon: Wand2, iconBg: "bg-purple-500/10", iconColor: "text-purple-500" },
      { title: "Repurposing longer content easily with Smart Split", description: "Are you a long-form content creator looking to expand your reach? Smart Split does it for you...", views: "26.5K views", icon: Film, iconBg: "bg-pink-500/10", iconColor: "text-pink-500" },
      { title: "Working smarter (not harder!) with AI Outline", description: "Creator Search Insights helps you spot trends. AI Outline takes it further with smart outlines...", views: "64.9K views", icon: Brain, iconBg: "bg-amber-500/10", iconColor: "text-amber-500" },
      { title: "Supercharge your ZIVO Shop strategy with Creator Search Insights", description: "ZIVO's explosive growth in e-commerce means creators can now leverage search data for sales...", views: "176.5K views", icon: Store, iconBg: "bg-emerald-500/10", iconColor: "text-emerald-500" },
    ],
  },
  {
    heading: "Enhance Your Video",
    articles: [
      { title: "Editing in-app like a pro", description: "Crazy visual effects, insanely smooth transitions, and eye-catching text overlays...", views: "553.4K views", icon: Palette, iconBg: "bg-pink-500/10", iconColor: "text-pink-500" },
      { title: "The importance of sound", description: "Let's talk about a game-changer for your ZIVO content: sound. Music and audio effects matter...", views: "171.0K views", icon: Music, iconBg: "bg-amber-500/10", iconColor: "text-amber-500" },
      { title: "Staying trendy with ZIVO templates", description: "We've made it easier than ever to jump on trends. Templates let you create viral content fast...", views: "38.4K views", icon: Layers, iconBg: "bg-purple-500/10", iconColor: "text-purple-500" },
      { title: "Turning up the volume and your engagement with Unlimited Music", description: "Adding music is key to creating more engaging content. Unlimited Music gives you access to millions...", views: "4.2M views", icon: Radio, iconBg: "bg-red-500/10", iconColor: "text-red-500" },
      { title: "Streamlining your ticket sales on ZIVO", description: "At ZIVO, we're all about bringing people together. Now you can sell event tickets directly...", views: "15.8K views", icon: Star, iconBg: "bg-amber-500/10", iconColor: "text-amber-500" },
      { title: "Turning your content into a trip with ZIVO's location feature", description: "Adding locations to your content can increase discovery and help viewers find you...", views: "30.5K views", icon: Map, iconBg: "bg-emerald-500/10", iconColor: "text-emerald-500" },
      { title: "Finding the perfect film and TV clips with ZIVO's Content library", description: "Save time and energy sourcing clips for your reaction and commentary videos...", views: "30.4K views", icon: Film, iconBg: "bg-blue-500/10", iconColor: "text-blue-500" },
    ],
  },
  {
    heading: "Promoting Your Video",
    articles: [
      { title: "Accelerating your growth with Promote", description: "With Promote, growing on ZIVO is easier than ever. Boost your best content to reach new audiences...", views: "77.4K views", icon: Megaphone, iconBg: "bg-orange-500/10", iconColor: "text-orange-500" },
      { title: "Setting up your Promote campaign", description: "Ready to watch your video views and followers skyrocket? Here's how to set up Promote...", views: "43.7K views", icon: Target, iconBg: "bg-blue-500/10", iconColor: "text-blue-500" },
      { title: "Discovering your perfect Promote strategy", description: "Ready to become a Promote pro? We walk you through proven strategies for maximum ROI...", views: "88.7K views", icon: Lightbulb, iconBg: "bg-amber-500/10", iconColor: "text-amber-500" },
      { title: "Answering your Promote FAQs", description: "Now that you've gotten started with Promote, you might have some questions. We've got answers...", views: "52.1K views", icon: MessageCircle, iconBg: "bg-purple-500/10", iconColor: "text-purple-500" },
    ],
  },
  {
    heading: "Manage Content Efficiently",
    articles: [
      { title: "Staying on top of your messages with Creator Inbox", description: "Want to make sure you catch every fan message, brand inquiry, and collaboration request?", views: "37.7K views", icon: MessageCircle, iconBg: "bg-blue-500/10", iconColor: "text-blue-500" },
    ],
  },
  {
    heading: "Interactive Features",
    articles: [
      { title: "Making a difference with ZIVO's Donation feature", description: "With great power comes great fundraising potential! Use Donations to support causes you care about...", views: "15.2K views", icon: Heart, iconBg: "bg-rose-500/10", iconColor: "text-rose-500" },
      { title: "Capturing your spontaneous moments with ZIVO Stories", description: "ZIVO is all about storytelling, but Stories let you share raw, unfiltered moments...", views: "25.5K views", icon: Camera, iconBg: "bg-amber-500/10", iconColor: "text-amber-500" },
      { title: "Flip Story: ZIVO's interactive stories feature", description: "Flip Story, exclusively on ZIVO Stories, is an interactive way to engage your audience...", views: "63.9K views", icon: PlayCircle, iconBg: "bg-purple-500/10", iconColor: "text-purple-500" },
      { title: "Engaging your followers with the bulletin board feature", description: "The bulletin board feature is a fun and interactive way to communicate with your community...", views: "19.9K views", icon: Bell, iconBg: "bg-emerald-500/10", iconColor: "text-emerald-500" },
    ],
  },
];

/* ─── ENGAGEMENT ─── */
const ENGAGEMENT_SECTIONS: Section[] = [
  {
    heading: "Unlocking High-Quality Content",
    articles: [
      { title: "Creating high-quality videos on ZIVO", description: "Guess what? ZIVO users are totally hooked on stunning, high-quality video content...", views: "1.5M views", icon: Camera, iconBg: "bg-blue-500/10", iconColor: "text-blue-500" },
      { title: "8 tips for becoming a successful ZIVO creator", description: "Endless laughs, jaw-dropping storytimes, and content that inspires millions of people...", views: "1.6M views", icon: Sparkles, iconBg: "bg-purple-500/10", iconColor: "text-purple-500" },
      { title: "Creating captivating content with great storytelling", description: "Storytime! There's nothing better than a great story that keeps your audience hooked...", views: "144.1K views", icon: BookOpen, iconBg: "bg-rose-500/10", iconColor: "text-rose-500" },
      { title: "Showcasing your expertise with specialized content", description: "You know how it feels like every time you share something you're passionate about...", views: "152.6K views", icon: Star, iconBg: "bg-amber-500/10", iconColor: "text-amber-500" },
      { title: "Elements of a ZIVO video", description: "A ZIVO video may seem simple, but the elements that go into making one stand out matter...", views: "320.2K views", icon: Film, iconBg: "bg-indigo-500/10", iconColor: "text-indigo-500" },
      { title: "Understanding and engaging your audience", description: "One important aspect of being a creator is knowing who your audience is and what they want...", views: "261.9K views", icon: Users, iconBg: "bg-emerald-500/10", iconColor: "text-emerald-500" },
      { title: "Filming high-quality videos to wow your viewers", description: "Ready to wow viewers with your content creation skills? Here's how to film like a pro...", views: "694.9K views", icon: Camera, iconBg: "bg-blue-500/10", iconColor: "text-blue-500" },
      { title: "Filming high-quality content on the go", description: "Whether you're capturing behind-the-scenes moments or creating content while traveling...", views: "6,457 views", icon: Smartphone, iconBg: "bg-pink-500/10", iconColor: "text-pink-500" },
      { title: "High-quality longer video content strategy", description: "Anyone can create standout longer video content with the right strategy and approach...", views: "1.0M views", icon: Film, iconBg: "bg-purple-500/10", iconColor: "text-purple-500" },
      { title: "Filming 101: Thinking like a director", description: "Ready to reach red-carpet-level status with your content? Think like a director...", views: "234.0K views", icon: Video, iconBg: "bg-red-500/10", iconColor: "text-red-500" },
      { title: "Filming 102: Creating interest through cinematography", description: "Cinematography is the art of using special camera techniques to create visual impact...", views: "33.7K views", icon: Camera, iconBg: "bg-amber-500/10", iconColor: "text-amber-500" },
      { title: "Audio 102: Soundproofing made easy", description: "Want to create content that turns heads? Start with crystal-clear audio and soundproofing...", views: "244.0K views", icon: Mic, iconBg: "bg-blue-500/10", iconColor: "text-blue-500" },
      { title: "Building a thriving community on ZIVO", description: "Being a creator on ZIVO is so much more than just posting videos. Build your tribe...", views: "180.8K views", icon: Users, iconBg: "bg-emerald-500/10", iconColor: "text-emerald-500" },
      { title: "Getting creative with color in your content", description: "Color Theory suggests that certain colors can evoke specific emotions in your audience...", views: "49.6K views", icon: Palette, iconBg: "bg-pink-500/10", iconColor: "text-pink-500" },
      { title: "Enhancing your videos with special effects", description: "Special effects can take your videos from good to unforgettable. Learn the best techniques...", views: "180.1K views", icon: Wand2, iconBg: "bg-purple-500/10", iconColor: "text-purple-500" },
      { title: "Audio 101: Recording audio like a pro", description: "You know your followers love hearing every word you say. Here's how to record great audio...", views: "141.1K views", icon: Mic, iconBg: "bg-amber-500/10", iconColor: "text-amber-500" },
      { title: "Lighting 101 - Crafting content that dazzles", description: "You can't say camera and action without great lighting. Master the basics of lighting...", views: "97.1K views", icon: Lightbulb, iconBg: "bg-amber-500/10", iconColor: "text-amber-500" },
    ],
  },
  {
    heading: "Making Editing Professional",
    articles: [
      { title: "Creating well-crafted content with editing tools", description: "Creating awesome videos is now easier than ever with professional editing tools...", views: "141.8K views", icon: PenTool, iconBg: "bg-pink-500/10", iconColor: "text-pink-500" },
      { title: "Creating more engaging content with these editing tricks", description: "High-quality long form videos are having a moment. Learn pro editing techniques...", views: "175.7K views", icon: Film, iconBg: "bg-purple-500/10", iconColor: "text-purple-500" },
      { title: "Optimizing your video layout to get more rewards", description: "Posting well-crafted content that keeps viewers watching is key to earning more rewards...", views: "43.2K views", icon: Layout, iconBg: "bg-red-500/10", iconColor: "text-red-500" },
    ],
  },
  {
    heading: "Creating Film & TV Content",
    articles: [
      { title: "Creating awesome Film & TV content", description: "Love watching the latest movies or TV shows? Turn your passion into engaging content...", views: "993.2K views", icon: Film, iconBg: "bg-indigo-500/10", iconColor: "text-indigo-500" },
      { title: "Mastering Film & TV narrative content with these 3 tips", description: "Film & TV narrative content is buzzing on ZIVO. Here's how to master it...", views: "136.5K views", icon: BookOpen, iconBg: "bg-amber-500/10", iconColor: "text-amber-500" },
      { title: "Elevate your Film & TV commentary content with these 4 tips", description: "Want to feel like a Hollywood insider? Create engaging commentary content...", views: "150.8K views", icon: MessageCircle, iconBg: "bg-blue-500/10", iconColor: "text-blue-500" },
      { title: "Becoming a Film & TV edits expert with these best practices", description: "Edits are an extremely popular type of content. Master the art of fan edits...", views: "256.5K views", icon: PenTool, iconBg: "bg-purple-500/10", iconColor: "text-purple-500" },
      { title: "Creating unforgettable Film & TV reaction content with best practices", description: "Reaction videos allow you to capture that genuine moment of surprise and emotion...", views: "111.8K views", icon: PlayCircle, iconBg: "bg-red-500/10", iconColor: "text-red-500" },
      { title: "Crafting buzzworthy Film & TV entertainment news content", description: "Join the conversation by sharing engaging entertainment news and pop culture updates...", views: "112.6K views", icon: Megaphone, iconBg: "bg-orange-500/10", iconColor: "text-orange-500" },
      { title: "Dress up your Film & TV cosplay content with these best practices", description: "Cosplay is a creative way to embody the characters you love from movies and TV shows...", views: "1,546 views", icon: Star, iconBg: "bg-pink-500/10", iconColor: "text-pink-500" },
    ],
  },
  {
    heading: "Master your Content Category",
    articles: [
      { title: "Creating winning sports content on ZIVO", description: "If you're an athlete, coach, commentator, or just a fan, sports content is your arena...", views: "130.4K views", icon: Star, iconBg: "bg-emerald-500/10", iconColor: "text-emerald-500" },
      { title: "Turning your passion into ZIVO success with learning content", description: "Learning content is booming on ZIVO! From tutorials to deep dives, education is entertainment...", views: "22.6K views", icon: BookOpen, iconBg: "bg-blue-500/10", iconColor: "text-blue-500" },
      { title: "Shifting your ZIVO journey into high gear with automotive content", description: "ZIVO's hot new trend is automotive content. Car reviews, mods, and road trips are taking off...", views: "17.2K views", icon: Compass, iconBg: "bg-indigo-500/10", iconColor: "text-indigo-500" },
      { title: "Repurposing your high-quality automotive content for ZIVO", description: "Are you already an automotive expert posting on other platforms? Here's how to adapt for ZIVO...", views: "24.9K views", icon: Video, iconBg: "bg-purple-500/10", iconColor: "text-purple-500" },
      { title: "What is the STEM feed?", description: "The STEM feed is a dedicated space where science, technology, engineering, and math content shines...", views: "119.3K views", icon: Lightbulb, iconBg: "bg-amber-500/10", iconColor: "text-amber-500" },
      { title: "Creating content for the STEM feed", description: "Whether you're a math whiz explaining equations or a scientist doing experiments, the STEM feed awaits...", views: "85.2K views", icon: Brain, iconBg: "bg-pink-500/10", iconColor: "text-pink-500" },
      { title: "Creating food content that makes mouths water", description: "Food content is one of the most popular niches on ZIVO. Learn to make your recipes go viral...", views: "342.7K views", icon: Star, iconBg: "bg-orange-500/10", iconColor: "text-orange-500" },
      { title: "Travel content that inspires wanderlust", description: "Take your audience on a journey. Travel content on ZIVO connects cultures and sparks adventure...", views: "267.8K views", icon: Globe, iconBg: "bg-emerald-500/10", iconColor: "text-emerald-500" },
      { title: "Building your fitness and wellness community", description: "From workout routines to mental health tips, wellness content helps millions live better lives...", views: "198.4K views", icon: Heart, iconBg: "bg-rose-500/10", iconColor: "text-rose-500" },
      { title: "Fashion and beauty content that stands out", description: "ZIVO is the runway for fashion and beauty creators. Learn how to showcase your unique style...", views: "455.1K views", icon: Sparkles, iconBg: "bg-pink-500/10", iconColor: "text-pink-500" },
      { title: "Gaming content creation masterclass", description: "Level up your gaming content with tips on streaming, highlights, and building a gamer community...", views: "521.3K views", icon: PlayCircle, iconBg: "bg-purple-500/10", iconColor: "text-purple-500" },
      { title: "Music and performance content on ZIVO", description: "Whether you're a singer, instrumentalist, or DJ, ZIVO is your stage. Reach millions of fans...", views: "389.6K views", icon: Music, iconBg: "bg-red-500/10", iconColor: "text-red-500" },
    ],
  },
  {
    heading: "Account Health and Traffic Sources",
    articles: [
      { title: "Driving video traffic: The For You feed", description: "On ZIVO, traffic is actually a good thing! Learn how the For You feed works for discovery...", views: "84.9K views", icon: TrendingUp, iconBg: "bg-emerald-500/10", iconColor: "text-emerald-500" },
      { title: "Driving video traffic: Search", description: "On ZIVO, traffic is actually a good thing! Learn how to optimize your content for Search...", views: "91.9K views", icon: Search, iconBg: "bg-blue-500/10", iconColor: "text-blue-500" },
      { title: "Maximize your video traffic: Profile", description: "On ZIVO, traffic is actually a good thing! Optimize your profile to drive more views...", views: "50.0K views", icon: Users, iconBg: "bg-purple-500/10", iconColor: "text-purple-500" },
      { title: "Troubleshooting issues with Account check", description: "If something's up with your ZIVO account, Account check can help diagnose and fix issues...", views: "113.9K views", icon: AlertTriangle, iconBg: "bg-orange-500/10", iconColor: "text-orange-500" },
    ],
  },
  {
    heading: "Content Strategy",
    articles: [
      { title: "How to create engaging short-form content", description: "Master the art of short-form video content that captivates your audience from the first second...", views: "4.2M views", icon: Video, iconBg: "bg-purple-500/10", iconColor: "text-purple-500" },
      { title: "Writing captions that convert", description: "A great caption can be the difference between a scroll-past and a follow. Here's how...", views: "1.8M views", icon: PenTool, iconBg: "bg-pink-500/10", iconColor: "text-pink-500" },
      { title: "Using hashtags effectively on ZIVO", description: "Hashtags are still one of the most powerful discovery tools. Learn the right strategy...", views: "3.1M views", icon: TrendingUp, iconBg: "bg-emerald-500/10", iconColor: "text-emerald-500" },
      { title: "Creating a content calendar that works", description: "Consistency is key to growth. Learn how to plan and maintain a sustainable content schedule...", views: "1.2M views", icon: BookOpen, iconBg: "bg-amber-500/10", iconColor: "text-amber-500" },
      { title: "Leveraging trends without losing your voice", description: "Trends can boost your reach, but staying authentic is crucial. Here's how to balance both...", views: "956K views", icon: Compass, iconBg: "bg-indigo-500/10", iconColor: "text-indigo-500" },
      { title: "Optimizing your posting schedule", description: "Timing is everything. Learn the best times to post on ZIVO for maximum engagement...", views: "2.4M views", icon: Star, iconBg: "bg-blue-500/10", iconColor: "text-blue-500" },
    ],
  },
  {
    heading: "Community Building",
    articles: [
      { title: "Building a loyal community on ZIVO", description: "Followers are great, but a community is better. Learn how to foster genuine connections...", views: "2.7M views", icon: Users, iconBg: "bg-blue-500/10", iconColor: "text-blue-500" },
      { title: "Responding to comments like a pro", description: "Engagement goes both ways. Learn how to interact with your audience to build loyalty...", views: "845K views", icon: MessageCircle, iconBg: "bg-purple-500/10", iconColor: "text-purple-500" },
      { title: "Using LIVE to deepen audience connection", description: "LIVE streaming is one of the most powerful tools for building real relationships with fans...", views: "1.5M views", icon: Radio, iconBg: "bg-red-500/10", iconColor: "text-red-500" },
      { title: "Cross-promoting your ZIVO content on other platforms", description: "Maximize your reach by sharing your ZIVO content across multiple social platforms...", views: "678K views", icon: Share2, iconBg: "bg-emerald-500/10", iconColor: "text-emerald-500" },
    ],
  },
];

/* ─── MONETIZE TAB ─── */
const MONETIZE_SECTIONS: Section[] = [
  {
    heading: "Platform Pay",
    articles: [
      { title: "Creator Rewards Program", description: "If you're passionate about crafting high-quality content, the Creator Rewards Program is for you...", views: "14.4M views", icon: Crown, iconBg: "bg-amber-500/10", iconColor: "text-amber-500" },
      { title: "Effect Creator Rewards", description: "Have you ever wondered what ZIVO's Effect Creator Rewards are all about? Discover how to earn...", views: "5.0M views", icon: Sparkles, iconBg: "bg-purple-500/10", iconColor: "text-purple-500" },
      { title: "Winning rewards and boosting your creativity with ZIVO post contests", description: "Whether you're creating film & TV, sport, or lifestyle content, contests can supercharge your reach...", views: "203.1K views", icon: Star, iconBg: "bg-orange-500/10", iconColor: "text-orange-500" },
    ],
  },
  {
    heading: "User Pay",
    articles: [
      { title: "Series", description: "Series allows you to post groups of videos behind a paywall, creating premium episodic content...", views: "310.4K views", icon: Video, iconBg: "bg-purple-500/10", iconColor: "text-purple-500" },
      { title: "Getting started with Subscription", description: "Subscription is your key to unleashing your creativity and fostering deeper audience connections...", views: "7.7M views", icon: Crown, iconBg: "bg-amber-500/10", iconColor: "text-amber-500" },
      { title: "Locked Media monetization", description: "Send exclusive photos and videos as pay-to-unlock content in chat and grow your revenue...", views: "1.2M views", icon: Lock, iconBg: "bg-indigo-500/10", iconColor: "text-indigo-500" },
    ],
  },
  {
    heading: "Branded content",
    articles: [
      { title: "Creating branded content on ZIVO", description: "Whether you're participating in collaborations or building brand partnerships, learn the essentials...", views: "2.3M views", icon: Megaphone, iconBg: "bg-orange-500/10", iconColor: "text-orange-500" },
      { title: "Creating content brands will want to Spark", description: "Are you looking to land a brand deal and grow your creator business? Here's how to stand out...", views: "80.2K views", icon: Sparkles, iconBg: "bg-pink-500/10", iconColor: "text-pink-500" },
      { title: "Building long-lasting brand partnerships", description: "ZIVO audiences crave authentic content. Learn how to build sustainable brand relationships...", views: "86.7K views", icon: Users, iconBg: "bg-blue-500/10", iconColor: "text-blue-500" },
      { title: "Collecting more rewards through brand tagging and Spark Ad authorization", description: "If you want more brands to see your content, learn how to leverage tagging and authorization...", views: "42.4K views", icon: Target, iconBg: "bg-emerald-500/10", iconColor: "text-emerald-500" },
      { title: "Monetize your content with brand deals on ZIVO", description: "If you're a creator, brand deals can help you earn while doing what you love...", views: "6,577 views", icon: DollarSign, iconBg: "bg-emerald-500/10", iconColor: "text-emerald-500" },
      { title: "Understanding Audience Commercial Value in the Creator Rewards", description: "In the Creator Rewards Program, high-quality content that attracts commercial audiences earns more...", views: "66.8K views", icon: BarChart3, iconBg: "bg-blue-500/10", iconColor: "text-blue-500" },
    ],
  },
  {
    heading: "LIVE",
    articles: [
      { title: "Going LIVE!", description: "ZIVO LIVE is where the party's at – it's all about real-time fun, self-expression, and connecting...", views: "5.7M views", icon: Video, iconBg: "bg-red-500/10", iconColor: "text-red-500" },
      { title: "Unlocking LIVE monetization", description: "Get more from your LIVEs! Explore all the ways you can monetize your streams and increase earnings...", views: "5.7M views", icon: DollarSign, iconBg: "bg-emerald-500/10", iconColor: "text-emerald-500" },
      { title: "Scaled LIVE rewards: Supercharging your LIVE journey", description: "We understand the dedication and effort you put into every LIVE session...", views: "544.7K views", icon: TrendingUp, iconBg: "bg-amber-500/10", iconColor: "text-amber-500" },
    ],
  },
  {
    heading: "Shop",
    articles: [
      { title: "Shop", description: "With ZIVO Shop, you can drive your audience from content to commerce seamlessly...", views: "6.8M views", icon: Store, iconBg: "bg-emerald-500/10", iconColor: "text-emerald-500" },
    ],
  },
  {
    heading: "Payouts & Verification",
    articles: [
      { title: "How to verify your identity to collect payouts", description: "Maintaining safety on ZIVO is our top priority. Learn how to verify and start earning...", views: "249.8K views", icon: BadgeCheck, iconBg: "bg-indigo-500/10", iconColor: "text-indigo-500" },
      { title: "Getting your rewards from ZIVO", description: "We've made managing your ZIVO rewards simple. Track, withdraw, and manage your earnings...", views: "243.6K views", icon: Gift, iconBg: "bg-rose-500/10", iconColor: "text-rose-500" },
      { title: "Tax information for ZIVO creators", description: "Understanding your tax obligations as a creator is important. Here's what you need to know...", views: "189.3K views", icon: DollarSign, iconBg: "bg-emerald-500/10", iconColor: "text-emerald-500" },
    ],
  },
];

/* ─── Tab data map ─── */
const TAB_DATA: Record<string, { hero?: { title: string; description: string }; sections: Section[]; subtabs?: string[] }> = {
  recommended: {
    hero: { title: "How to Monetize on ZIVO", description: "Explore opportunities to get rewarded on ZIVO." },
    subtabs: ["Overview", "Creator Rewards Program", "Subscription"],
    sections: RECOMMENDED_SECTIONS,
  },
  "getting-started": {
    hero: { title: "Getting Started on ZIVO", description: "Everything you need to create a ZIVO account and set up your profile." },
    sections: GETTING_STARTED_SECTIONS,
  },
  community: {
    hero: { title: "Follow Community Guidelines", description: "Understand the rules and standards for using ZIVO to build a safe and trustworthy community together." },
    sections: COMMUNITY_SECTIONS,
  },
  tools: {
    hero: { title: "How to Use Our Tools", description: "Make full use of features available on the app and the web to grow and engage with your audience." },
    sections: TOOLS_SECTIONS,
  },
  engagement: {
    hero: { title: "How to Increase Engagement on ZIVO", description: "Get expert advice and tips to make your posts stand out." },
    sections: ENGAGEMENT_SECTIONS,
  },
  monetize: {
    hero: { title: "How to Monetize on ZIVO", description: "Turn your creativity into income. Explore all the ways to earn on ZIVO." },
    sections: MONETIZE_SECTIONS,
  },
};

export default function MonetizationArticlesPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("recommended");
  const tabData = TAB_DATA[activeTab];

  return (
    <div className="min-h-dvh bg-background pb-24">
      <SEOHead title="Articles – ZIVO Creator Academy" description="Learn how to monetize, grow, and create on ZIVO." />

      {/* Header */}
      <div className="sticky top-0 safe-area-top z-30 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-muted/50 touch-manipulation">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-base font-bold flex-1 text-center">Articles</h1>
          <button className="p-2 -mr-2 rounded-full hover:bg-muted/50 touch-manipulation">
            <Search className="h-5 w-5" />
          </button>
        </div>

        {/* Top Tabs */}
        <div className="flex overflow-x-auto no-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 px-4 py-2.5 text-[13px] font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="px-4 py-5"
        >
          {/* Hero */}
          {tabData.hero && (
            <div className="mb-5">
              <h2 className="text-2xl font-bold leading-tight mb-2">{tabData.hero.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{tabData.hero.description}</p>

              {/* Subtabs */}
              {tabData.subtabs && (
                <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar">
                  {tabData.subtabs.map((sub, i) => (
                    <span
                      key={sub}
                      className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold ${
                        i === 0
                          ? "bg-foreground text-background"
                          : "bg-muted/60 text-muted-foreground"
                      }`}
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sections */}
          <div className="space-y-6">
            {tabData.sections.map((section) => (
              <div key={section.heading}>
                <h3 className="font-bold text-base mb-3">{section.heading}</h3>
                <div className="rounded-2xl border border-border/40 bg-card overflow-hidden divide-y divide-border/30">
                  {section.articles.map((article, ai) => (
                    <motion.button
                      key={article.title}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: ai * 0.02 }}
                      onClick={() => navigate(`/monetization/articles/${article.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "")}`)}
                      className="w-full flex items-start gap-3 p-4 text-left touch-manipulation active:bg-muted/20 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[13px] leading-snug mb-1">{article.title}</p>
                        <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{article.description}</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1.5">{article.views}</p>
                      </div>
                      <div className={`w-16 h-16 rounded-xl ${article.iconBg} shrink-0 flex items-center justify-center`}>
                        <article.icon className={`w-6 h-6 ${article.iconColor}`} />
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <ZivoMobileNav />
    </div>
  );
}
