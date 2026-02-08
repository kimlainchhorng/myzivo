

# Update Google Maps API Key in Supabase Secrets

## What Needs to Be Done

You've provided the new Google Maps API key:
```
AIzaSyCopQIlsMaRJhK6evC6G5XUMgrRvQFioAE
```

I'll update both secrets that use this key:

| Secret Name | Purpose |
|-------------|---------|
| `GOOGLE_MAPS_API_KEY` | Used by Edge Functions (maps-autocomplete, maps-place-details, maps-route, maps-api-key) |
| `VITE_GOOGLE_MAPS_API_KEY` | Used by the frontend React app for client-side map rendering |

## Steps

1. Update `GOOGLE_MAPS_API_KEY` secret with the new key
2. Update `VITE_GOOGLE_MAPS_API_KEY` secret with the new key
3. Test the Rides page to confirm the map loads correctly

## Reminder: Domain Restrictions

Make sure this API key has the following website restrictions in Google Cloud Console:

- `*.lovableproject.com/*`
- `*.lovable.app/*`  
- `https://hizovo.com/*`
- `https://www.hizovo.com/*`

