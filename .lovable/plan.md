## Fix Autofill Issues on AutoZonePro

The screenshot shows two real issues with the in-app browser autofill:

### 1. Username + placeholder overlap ("Kimlain" stacked on "Username *")
AutoZonePro uses a **floating-label** input. Our autofill sets `el.value` and dispatches `input`/`change`, but the floating label only lifts on `focus` / `blur`. Result: the value renders behind the placeholder text.

**Fix:** in the injected `setVal()`, additionally call `el.focus()` → dispatch events → `el.blur()` so the host site's label-lift logic runs. Also dispatch `keyup` for sites that listen to it.

### 2. Console error: `Cannot set property attributeName of MutationRecord (getter only)`
Our `MutationObserver` re-applies credentials on every DOM change. When AutoZone's own scripts run after our `input`/`change` events, our observer fires again, and the host site's code (which reuses `MutationRecord` objects in some patterns) collides — triggering the read-only setter error and a feedback loop.

**Fix:**
- Add an `applying` re-entry guard so `applyCreds()` cannot recurse.
- Skip refilling fields whose value is already correct (avoids redundant events).
- Only react to mutations that have `addedNodes` (real DOM additions, like the password step appearing) — ignore attribute/character mutations.
- Debounce the observer callback (150ms) so a burst of mutations triggers one refill, not dozens.
- Observe `document.body` (not `document.documentElement`) to reduce noise from `<html>`/`<head>` attribute churn.

### Technical Details

**File:** `supabase/functions/supplier-proxy/index.ts` — replace the autofill block (lines ~236–277) with the hardened version:

```js
var pendingCreds = null;
var applying = false;
function setVal(el, val){
  try {
    var setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), 'value')?.set;
    if (setter) setter.call(el, val); else el.value = val;
    try { el.focus({ preventScroll: true }); } catch(_){}
    el.dispatchEvent(new Event('input',  { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.dispatchEvent(new Event('keyup',  { bubbles: true }));
    try { el.blur(); } catch(_){}
  } catch(e){}
}
function applyCreds(creds){
  if (!creds || applying) return false;
  applying = true;
  var filled = 0;
  try {
    document.querySelectorAll('input').forEach(function(el){
      if (el.disabled || el.readOnly || el.type === 'hidden') return;
      var hint = ((el.name||'')+' '+(el.id||'')+' '+(el.autocomplete||'')+' '+(el.placeholder||'')+' '+(el.type||'')).toLowerCase();
      if (el.type === 'password' && creds.password && el.value !== creds.password) {
        setVal(el, creds.password); filled++;
      } else if (creds.username && el.type !== 'password' &&
                 (el.type === 'email' || /user|email|login|account|signin|userid/.test(hint))) {
        if (!el.value) { setVal(el, creds.username); filled++; }
      }
    });
  } finally { applying = false; }
  return filled > 0;
}
// Debounced, additions-only observer for the 2-step password screen.
var moTimer = null;
new MutationObserver(function(records){
  if (!pendingCreds || applying) return;
  if (!records.some(function(r){ return r.addedNodes && r.addedNodes.length; })) return;
  clearTimeout(moTimer);
  moTimer = setTimeout(function(){ applyCreds(pendingCreds); }, 150);
}).observe(document.body || document.documentElement, { childList: true, subtree: true });
```

After the change, redeploy the `supplier-proxy` edge function.

### Out of Scope
- Fixing AutoZonePro's own internal scripts (we only control our injected code).
- Per-supplier custom fill selectors — generic input matching is sufficient for now.
