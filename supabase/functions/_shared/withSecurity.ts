// withSecurity — composes WAF inspection, correlation ID, structured logger,
// and consistent CORS preflight handling. Drop-in wrapper for edge handlers.
//
// Usage:
//   serve(withSecurity('my-route', async (req, ctx) => { ... }));

import { preflight, err } from './respond.ts';
import { inspectRequest, clientIp } from './waf.ts';
import { newCorrelationId, makeLogger, type Logger } from './logger.ts';
import { recordSecurityEvent } from './audit.ts';

export interface SecurityContext {
  log: Logger;
  correlationId: string;
  ip: string | null;
  userAgent: string | null;
  route: string;
  startedAt: number;
}

export type SecuredHandler = (req: Request, ctx: SecurityContext) => Promise<Response>;

export function withSecurity(route: string, handler: SecuredHandler): (req: Request) => Promise<Response> {
  return async (req: Request) => {
    if (req.method === 'OPTIONS') return preflight(req);

    const correlationId = newCorrelationId(req);
    const ip = clientIp(req);
    const userAgent = req.headers.get('user-agent');
    const log = makeLogger({ correlationId, route, ip, method: req.method });
    const ctx: SecurityContext = { log, correlationId, ip, userAgent, route, startedAt: Date.now() };

    // 1) WAF
    const waf = await inspectRequest(req);
    if (!waf.ok) {
      log.warn('waf_block', { reason: waf.reason });
      // fire-and-forget audit
      recordSecurityEvent({
        eventType: `waf.${waf.reason}`,
        severity: 'warn',
        ip,
        userAgent,
        route,
        blocked: true,
        data: { method: req.method, url: req.url, correlationId },
      }).catch(() => {});
      const res = err(req, 'Request blocked', 400, { correlationId });
      res.headers.set('x-request-id', correlationId);
      return res;
    }

    // 2) Run handler with timing + error capture
    try {
      const res = await handler(req, ctx);
      res.headers.set('x-request-id', correlationId);
      log.info('request_completed', { status: res.status, ms: Date.now() - ctx.startedAt });
      return res;
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      log.error('request_failed', { error: message, ms: Date.now() - ctx.startedAt });
      const res = err(req, 'Internal error', 500, { correlationId });
      res.headers.set('x-request-id', correlationId);
      return res;
    }
  };
}
