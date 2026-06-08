# Data Model

## Overview

The MVP stores only the minimum data needed to support setup reuse.

The database must model:

- A reusable setup
- Gear contained in the setup
- A catch attached to the setup
- Lightweight derived performance values

`SetStats` is not stored as a table. It is computed from `Catch` records when needed.

## Entities

## Set

Represents a reusable fishing setup.

Fields:

- `id`
- `name`
- `photo_path`
- `created_at`
- `updated_at`

Validation:

- Required: `name`
- Optional: `photo_path`

Notes:

- This is the main unit of reuse in the product
- The currently selected setup is referenced by UI state, not by a separate table in MVP

## Gear

Represents one gear item.

Fields:

- `id`
- `type`
- `name`
- `photo_path`
- `created_at`

Validation:

- Required: `type`
- Required: `name`
- Optional: `photo_path`

Examples of `type`:

- `rod`
- `reel`
- `line`
- `lure`
- `fly`
- `hook_bait`
- `other`

## SetGear

Links gear to a setup.

Fields:

- `id`
- `set_id`
- `gear_id`
- `role`

Validation:

- Required: `set_id`
- Required: `gear_id`
- Required: `role`

Allowed `role` values:

- `rod`
- `reel`
- `line`
- `lure`
- `fly`
- `hook_bait`
- `other`

Notes:

- `type` describes the gear item itself
- `role` describes how the item functions inside a setup
- MVP screens only need the main visible roles, but the model stays flexible

## Catch

Represents a recorded result tied to a setup.

Fields:

- `id`
- `set_id`
- `species`
- `size_cm`
- `primary_gear_id`
- `photo_path`
- `place_name`
- `caught_at`
- `created_at`

Validation:

- Required: `set_id`
- Required: `caught_at`
- Optional: `species`
- Optional: `size_cm`
- Optional: `primary_gear_id`
- Optional: `photo_path`
- Optional: `place_name`

Notes:

- `set_id` is the key product link
- `primary_gear_id` points to the lure, fly, bait, or equivalent gear that produced the catch
- Rod, reel, and line are inferred from the selected setup

## Relationships

```text
Set 1 --- N SetGear N --- 1 Gear
Set 1 --- N Catch
Gear 1 --- N Catch (via primary_gear_id, optional)
```

## Derived Values

`SetStats` is not persisted. It is derived from `Catch`.

Derived fields for a setup:

- `total_catches`
- `max_size`
- `favorite_species`
- `favorite_place`
- `last_used_at`

Suggested aggregation rules:

- `total_catches`: count of catches for the setup
- `max_size`: maximum `size_cm`, ignoring null
- `favorite_species`: most frequent non-null `species`
- `favorite_place`: most frequent non-null `place_name`
- `last_used_at`: latest `caught_at`

## Query Requirements

The model must support these MVP queries:

- List setups ranked by catch count
- List setups ranked by max size
- List lures ranked by catch count
- Show largest fish per rod
- Show best month for a gear item
- Show recent catches for a gear item
- Show all gear included in a setup
- Reuse a setup as today's setup

## Recommended Client-Side State

The UI should keep one lightweight client-side value for current context:

- `current_set_id`

This does not need a dedicated database table in MVP.

It can be stored in app state and mirrored to local storage or IndexedDB app settings later if needed.

## Non-Goals For MVP

These are intentionally excluded from the model for now:

- GPS coordinates
- River entity table
- Area entity table
- Weather records
- Notifications
- Social data
- Comments
- Followers
- Ranking sharing
