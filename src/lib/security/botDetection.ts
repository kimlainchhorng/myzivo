/**
 * Bot Detection Utilities
 * Client-side heuristics to detect automated traffic
 */

export interface BotDetectionResult {
  isBot: boolean;
  score: number;
  reasons: string[];
  requiresCaptcha: boolean;
}

// Bot detection thresholds
const BOT_THRESHOLD = 50;
const CAPTCHA_THRESHOLD = 70;

/**
 * Detect if current client is likely a bot
 */
export function detectBot(): BotDetectionResult {
  const reasons: string[] = [];
  let score = 0;

  // Check for headless browser indicators
  if (isHeadlessBrowser()) {
    score += 40;
    reasons.push('headless_browser');
  }

  // Check for automation tools
  if (hasAutomationIndicators()) {
    score += 50;
    reasons.push('automation_tools');
  }

  // Check browser features
  const featureScore = checkBrowserFeatures();
  score += featureScore.score;
  reasons.push(...featureScore.reasons);

  // Check timing patterns
  if (hasSuspiciousTiming()) {
    score += 20;
    reasons.push('suspicious_timing');
  }

  // Check mouse/touch behavior (requires event listeners)
  // This is handled separately via useBotDetection hook

  return {
    isBot: score >= BOT_THRESHOLD,
    score: Math.min(score, 100),
    reasons,
    requiresCaptcha: score >= CAPTCHA_THRESHOLD,
  };
}

/**
 * Check for headless browser indicators
 */
function isHeadlessBrowser(): boolean {
  const nav = navigator as Navigator & {
    webdriver?: boolean;
    plugins?: PluginArray;
    languages?: readonly string[];
  };

  // webdriver property
  if (nav.webdriver) return true;

  // No plugins (common in headless)
  if (!nav.plugins || nav.plugins.length === 0) return true;

  // No languages
  if (!nav.languages || nav.languages.length === 0) return true;

  // Chrome headless specific
  if (/HeadlessChrome/.test(navigator.userAgent)) return true;

  return false;
}

/**
 * Check for automation tool indicators
 */
function hasAutomationIndicators(): boolean {
  const win = window as Window & {
    phantom?: unknown;
    __nightmare?: unknown;
    _phantom?: unknown;
    callPhantom?: unknown;
    _selenium?: unknown;
    __webdriver_script_fn?: unknown;
    __driver_evaluate?: unknown;
    __webdriver_evaluate?: unknown;
    __selenium_evaluate?: unknown;
    __fxdriver_evaluate?: unknown;
    __driver_unwrapped?: unknown;
    __webdriver_unwrapped?: unknown;
    __selenium_unwrapped?: unknown;
    __fxdriver_unwrapped?: unknown;
    __webdriver_script_func?: unknown;
    $cdc_asdjflasutopfhvcZLmcfl_?: unknown;
    $chrome_asyncScriptInfo?: unknown;
  };

  const indicators = [
    'phantom',
    '__nightmare',
    '_phantom',
    'callPhantom',
    '_selenium',
    '__webdriver_script_fn',
    '__driver_evaluate',
    '__webdriver_evaluate',
    '__selenium_evaluate',
    '__fxdriver_evaluate',
    '__driver_unwrapped',
    '__webdriver_unwrapped',
    '__selenium_unwrapped',
    '__fxdriver_unwrapped',
    '__webdriver_script_func',
    '$cdc_asdjflasutopfhvcZLmcfl_',
    '$chrome_asyncScriptInfo',
  ];

  for (const prop of indicators) {
    if ((win as unknown as Record<string, unknown>)[prop] !== undefined) {
      return true;
    }
  }

  // Check for CDP (Chrome DevTools Protocol)
  const doc = document as Document & {
    $cdc_asdjflasutopfhvcZLmcfl_?: unknown;
  };
  if (doc.$cdc_asdjflasutopfhvcZLmcfl_) return true;

  return false;
}

/**
 * Check browser feature consistency
 */
function checkBrowserFeatures(): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;

  // Check for inconsistent screen dimensions
  if (window.outerWidth === 0 || window.outerHeight === 0) {
    score += 15;
    reasons.push('zero_dimensions');
  }

  // Check for missing features common in real browsers
  const win = window as Window & { chrome?: unknown };
  if (!win.chrome && /Chrome/.test(navigator.userAgent)) {
    score += 20;
    reasons.push('fake_chrome');
  }

  // Check for notification permission oddities
  if (typeof Notification !== 'undefined' && Notification.permission === 'denied') {
    // This alone isn't suspicious, but combined with other factors...
  }

  // Check for missing history length
  if (history.length <= 1) {
    score += 5;
    reasons.push('no_history');
  }

  // Check user agent for common bot patterns
  const ua = navigator.userAgent.toLowerCase();
  const botPatterns = ['bot', 'crawler', 'spider', 'scraper', 'curl', 'wget', 'python', 'java/'];
  for (const pattern of botPatterns) {
    if (ua.includes(pattern)) {
      score += 30;
      reasons.push('bot_user_agent');
      break;
    }
  }

  return { score, reasons };
}

/**
 * Check for suspicious timing patterns
 */
function hasSuspiciousTiming(): boolean {
  // Check if page load was unusually fast (might indicate prefetch or automation)
  const timing = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  if (timing) {
    const loadTime = timing.loadEventEnd - timing.fetchStart;
    // If page loaded in less than 100ms, suspicious
    if (loadTime > 0 && loadTime < 100) {
      return true;
    }
  }
  return false;
}

/**
 * Get device fingerprint for tracking
 */
export function getDeviceFingerprint(): string {
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || 0,
    navigator.cookieEnabled,
  ];

  // Simple hash
  const str = components.join('|');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

/**
 * Track user interaction to verify human behavior
 */
export class InteractionTracker {
  private mouseMovements = 0;
  private clicks = 0;
  private keyPresses = 0;
  private scrollEvents = 0;
  private touchEvents = 0;
  private startTime = Date.now();

  constructor() {
    if (typeof window !== 'undefined') {
      this.attachListeners();
    }
  }

  private attachListeners() {
    document.addEventListener('mousemove', () => this.mouseMovements++);
    document.addEventListener('click', () => this.clicks++);
    document.addEventListener('keydown', () => this.keyPresses++);
    document.addEventListener('scroll', () => this.scrollEvents++);
    document.addEventListener('touchstart', () => this.touchEvents++);
  }

  getInteractionScore(): number {
    const duration = (Date.now() - this.startTime) / 1000; // seconds
    if (duration < 1) return 0;

    const interactionsPerSecond = 
      (this.mouseMovements + this.clicks + this.keyPresses + this.scrollEvents + this.touchEvents) / duration;

    // Normal human interaction rate
    if (interactionsPerSecond >= 0.1 && interactionsPerSecond <= 50) {
      return 0; // Looks human
    }

    // No interaction is suspicious
    if (interactionsPerSecond < 0.1 && duration > 5) {
      return 30;
    }

    // Too much interaction is also suspicious (automation)
    if (interactionsPerSecond > 50) {
      return 40;
    }

    return 0;
  }

  getStats() {
    return {
      mouseMovements: this.mouseMovements,
      clicks: this.clicks,
      keyPresses: this.keyPresses,
      scrollEvents: this.scrollEvents,
      touchEvents: this.touchEvents,
      duration: (Date.now() - this.startTime) / 1000,
    };
  }
}
