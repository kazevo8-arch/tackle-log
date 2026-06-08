# Remaining Issues

## Current State

The MVP is implemented to a UX review level with the six required screens and local persistence.

The following items are intentionally left for later phases.

## Technical Limits

- Storage uses local browser storage for speed of implementation and review, not IndexedDB yet
- PWA manifest is minimal and has no final icon assets
- Service worker caches only the core files
- Product metrics are stored locally only and are not exportable

## Product Gaps Intentionally Deferred

- No GPS
- No maps
- No river or area management
- No weather
- No SNS
- No community
- No AI features
- No notifications
- No charts
- No cloud sync

## UX Gaps To Review

- Add Catch currently omits place input in the UI, so place rankings mainly reflect existing records
- Setup management supports adding gear inside Setup Detail, but not renaming setups or removing gear
- The app is optimized for smartphone portrait review and not for tablet or desktop workflows
- Screenshot raster capture was not reliable in this environment, so review captures are stored as SVG reference screens
- Reuse behavior is now tracked locally, but there is still no review dashboard for those counters inside the UI
