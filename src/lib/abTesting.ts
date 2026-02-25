/** A/B testing stub */
export function getUserVariant(_experimentId: string): { id: string } | null {
  return null;
}

export function trackABEvent(_experimentId: string, _variantId: string, _event: string, _data?: Record<string, any>): void {}
