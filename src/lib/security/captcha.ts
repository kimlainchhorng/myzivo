/**
 * CAPTCHA Integration
 * Uses hCaptcha for bot protection
 */

// hCaptcha site key from environment
const HCAPTCHA_SITE_KEY = 'your-hcaptcha-site-key'; // Replace with env variable

export interface CaptchaResult {
  success: boolean;
  token?: string;
  error?: string;
}

/**
 * Load hCaptcha script dynamically
 */
export function loadCaptchaScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as unknown as Record<string, unknown>).hcaptcha) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.hcaptcha.com/1/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load hCaptcha'));
    document.head.appendChild(script);
  });
}

/**
 * Render hCaptcha widget
 */
export function renderCaptcha(
  containerId: string,
  siteKey?: string,
  options?: {
    theme?: 'light' | 'dark';
    size?: 'normal' | 'compact' | 'invisible';
    callback?: (token: string) => void;
    'expired-callback'?: () => void;
    'error-callback'?: (error: unknown) => void;
  }
): Promise<string> {
  return new Promise((resolve, reject) => {
    const hcaptcha = (window as unknown as Record<string, { render: (id: string, opts: unknown) => string }>).hcaptcha;
    
    if (!hcaptcha) {
      reject(new Error('hCaptcha not loaded'));
      return;
    }

    try {
      const widgetId = hcaptcha.render(containerId, {
        sitekey: siteKey || HCAPTCHA_SITE_KEY,
        theme: options?.theme || 'dark',
        size: options?.size || 'normal',
        callback: (token: string) => {
          options?.callback?.(token);
          resolve(token);
        },
        'expired-callback': options?.['expired-callback'],
        'error-callback': options?.['error-callback'],
      });
      resolve(widgetId);
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * Get captcha response token
 */
export function getCaptchaResponse(widgetId?: string): string | null {
  const hcaptcha = (window as unknown as Record<string, { getResponse: (id?: string) => string }>).hcaptcha;
  if (!hcaptcha) return null;
  
  try {
    return hcaptcha.getResponse(widgetId) || null;
  } catch {
    return null;
  }
}

/**
 * Reset captcha widget
 */
export function resetCaptcha(widgetId?: string): void {
  const hcaptcha = (window as unknown as Record<string, { reset: (id?: string) => void }>).hcaptcha;
  if (hcaptcha) {
    try {
      hcaptcha.reset(widgetId);
    } catch (e) {
      console.error('[Captcha] Reset error:', e);
    }
  }
}

/**
 * Execute invisible captcha
 */
export function executeCaptcha(widgetId?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hcaptcha = (window as unknown as Record<string, { execute: (id?: string, opts?: unknown) => Promise<{ response: string }> }>).hcaptcha;
    
    if (!hcaptcha) {
      reject(new Error('hCaptcha not loaded'));
      return;
    }

    try {
      hcaptcha.execute(widgetId, { async: true })
        .then((result) => resolve(result.response))
        .catch(reject);
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * Check if captcha is required based on security settings
 */
export function isCaptchaRequired(): boolean {
  try {
    const settings = localStorage.getItem('hizovo-security-settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      return parsed.captchaEnabled === true;
    }
  } catch {
    // Default to false if settings not found
  }
  return false;
}

/**
 * Get hCaptcha site key from settings
 */
export function getCaptchaSiteKey(): string {
  try {
    const settings = localStorage.getItem('hizovo-security-settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      return parsed.captchaSiteKey || HCAPTCHA_SITE_KEY;
    }
  } catch {
    // Use default
  }
  return HCAPTCHA_SITE_KEY;
}
