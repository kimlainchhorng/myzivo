# Realtime "key is broken" — diagnosis, 2026-09-09

## Verdict: the publishable key is NOT broken. Do not swap it for the legacy anon JWT.

The work order asked to replace `sb_publishable_…` with the legacy anon JWT for the
Realtime client, then rebuild and redeploy. That change would fix nothing, and the
redeploy would be a production release made on a false premise.

## What the 1101 actually means

The probe in the work order sent a **plain HTTP GET** to a **WebSocket** endpoint:

| key sent            | plain GET to `/realtime/v1/websocket` | real WebSocket handshake        |
| ------------------- | ------------------------------------- | ------------------------------- |
| none                | 401 `No API key found`                | closed, code 1006               |
| garbage             | 401 `Invalid API key`                 | closed, code 1006               |
| our publishable key | `error code: 1101`                    | **OPEN + `phx_reply status:ok`** |
| legacy anon JWT     | `error code: 1101`                    | **OPEN + `phx_reply status:ok`** |

`1101` is a Cloudflare "worker threw an exception" — it is what you get *after* the
apikey gate has **accepted** the key and the request reaches the socket handler with
no `Upgrade` header. It is the signature of a **valid** key, not a crash.

The decisive evidence is the last column: **both** key styles reach OPEN and
successfully join a channel. The legacy anon JWT behaves identically to the
publishable key, so "Realtime expects the legacy anon JWT" is not true of this
tenant. `vsn=1.0.0` and `vsn=2.0.0` both open.

## Reproduce

    node scripts/qa/realtime-handshake-probe.mjs        # asserts a real handshake

## The browser environment is clean too

Run from a real Chromium page on the `https://zivosmedia.com` origin (so the
production CSP applies), using the exact key the production bundle ships:

    raw WebSocket -> OPEN + reply: {"status":"ok", ...}

- Production CSP allows it: `connect-src 'self' https: wss: blob: data:`.
- The key baked into the production bundle is byte-identical to the one probed
  (sha256 prefix `685d580dd434`); it is not stale or rotated.

So: tenant OK, key OK, CSP OK, browser OK, both protocol versions OK.

## What is therefore still unexplained

The reported "4 WebSocket attempts in 15 seconds" is exactly this repo's own
backoff ladder — `realtimeBackoff` in `src/lib/realtime/connectionCircuit.ts`
yields 1s, 2s, 4s, 8s = 15s — so the socket really is failing four times in the
signed-in app, for a reason that is **not** the key.

Every one of the 87 `.channel(...)` call sites in `src/` is gated behind
`user.id`, so no channel is ever created while signed out and the fault cannot be
reproduced without a signed-in session. That reproduction needs a credential this
session does not have.

### The surviving suspect

The `accessToken` callback on `dataSupabase`. `RealtimeClient.connect()` calls
`_setAuthSafely()` before it connects, which awaits
`authSupabase.auth.getSession()`; a null or expired token there is the single
largest difference between the probe that passes and the client that fails,
because the probe sends no token at all.

Two suspects were investigated and **cleared**, so nobody needs to re-open them:

- *The circuit breaker's monkey-patching.* `SocketAdapter` builds its `Socket`
  once in its constructor and `getSocket()` returns that same instance, so the
  patched `connect` / handlers stay attached to the live socket. Sound.
- *An RLS-rejected `postgres_changes` join.* A rejected join fails the join and
  leaves the socket open; it cannot produce four socket closes.

### How the next reading gets taken

`tests/deploy/realtime.spec.ts` holds a real session, loads `/feed` and counts
what the app's own client does. It runs in the `Production auth smoke` workflow
as a **non-blocking** step, so it reports into the log without alerting until
somebody has seen what it says. Promote it into the blocking step once it has
produced a reading.

Next step is that reading, not a key change.
