# Screen Design

## Overview

This document fixes the screen structure, visible fields, and transitions for the MVP.

The app supports only portrait smartphone use.

## Screen List

Priority A screens:

1. Home
2. Today's Setup
3. Add Catch
4. Performance
5. Setup Detail
6. Gear Detail

## Global Navigation

Bottom navigation contains four destinations:

- Home
- Setup
- Add
- Performance

Behavior rules:

- `Add` should be visually strongest
- If the user taps `Add` with no selected setup, route to Today's Setup
- Critical actions should be placed close to the bottom

## Transition Map

```text
First Launch
-> Create Minimal Setup
-> Home

Home
-> Add Catch
-> Performance
-> Today's Setup

Today's Setup
-> Use This Setup
-> Home

Performance
-> Setup Detail
-> Gear Detail

Setup Detail
-> Use This Setup Again
-> Home

Gear Detail
-> View Setups Using This Gear
-> Setup Detail
```

## 1. Home

### Purpose

- Let the user start recording immediately
- Show whether a setup is active
- Provide the shortest path to Add Catch

### State A: Setup Selected

Visible fields:

- Best recent reuse candidate
- Current setup name
- Total catches
- Max size
- Last used date

Primary actions:

1. Add Catch
2. View Performance
3. Change Setup

Suggested wireframe:

```text
+----------------------------------+
| Tackle Performance Log           |
|                                  |
| Best recent setup                |
| Last time: 42 cm                |
| [ Use This Setup Again ]         |
|                                  |
| Current setup                    |
| Stream Bait Setup                |
| Total catches: 18               |
| Max size: 42 cm                 |
| Last used: 2026-06-08           |
|                                  |
| [ Add Catch ]                    |
| [ View Performance ]             |
| [ Change Setup ]                 |
+----------------------------------+
| Home | Setup | Add | Performance |
+----------------------------------+
```

### State B: No Setup Selected

Visible fields:

- Setup missing message
- Shortcut list of recent setups if available

Primary action:

1. Choose Today's Setup

Suggested wireframe:

```text
+----------------------------------+
| Tackle Performance Log           |
|                                  |
| Choose your setup for today      |
|                                  |
| [ Choose Today's Setup ]         |
|                                  |
| Recent setups                    |
| Stream Bait Setup                |
| Fly #3                           |
+----------------------------------+
| Home | Setup | Add | Performance |
+----------------------------------+
```

## 2. Today's Setup

### Purpose

- Help the user pick a known setup as fast as possible

### Card Content

- Photo
- Setup name
- Three primary gear items
- Total catches
- Max size
- Last used date

### Card Action

- Use This Setup

### Hidden On This Screen

- Edit
- Long memo
- Detailed settings

Suggested wireframe:

```text
+----------------------------------+
| Choose Today's Setup             |
|                                  |
| [photo] Stream Bait Setup        |
| Rod / Reel / Lure                |
| Catches: 18  Max: 42 cm          |
| Last used: 2026-06-08            |
| [ Use This Setup ]               |
|                                  |
| [photo] Fly #3                   |
| Rod / Line / Fly                 |
| Catches: 11  Max: 31 cm          |
| Last used: 2026-05-30            |
| [ Use This Setup ]               |
+----------------------------------+
| Home | Setup | Add | Performance |
+----------------------------------+
```

## 3. Add Catch

### Purpose

- Complete a catch entry in 10 to 30 seconds

### Rules

- Single screen only
- `set_id` and `caught_at` required
- Everything else optional
- If no setup is selected, redirect to Today's Setup

### Visible Fields

- Species quick buttons
- Size quick buttons
- Size stepper
- Primary gear selector
- Photo picker

Suggested wireframe:

```text
+----------------------------------+
| Add Catch                        |
|                                  |
| Species                          |
| [ Yamame ] [ Iwana ]             |
| [ Rainbow ] [ Other ]            |
|                                  |
| Size                             |
| [20] [25] [30] [35] [40]         |
| [ -1 ]   32 cm   [ +1 ]          |
|                                  |
| Gear used                        |
| [ Shiden 4g ]                    |
| [ Change ]                       |
|                                  |
| Photo                            |
| [ Add Photo ]                    |
|                                  |
| [ Save Catch ]                   |
+----------------------------------+
| Home | Setup | Add | Performance |
+----------------------------------+
```

## 4. Performance

### Purpose

- Turn logged results into immediate setup reuse decisions

### Section Order

1. Reuse candidates
2. Best-performing lures
3. Largest fish by rod
4. Performance by place

### Display Style

- Ranking rows
- Counts
- Max size
- Last used date

Suggested wireframe:

```text
+----------------------------------+
| Performance                      |
|                                  |
| Reuse candidates                 |
| Stream Bait Setup 18 / 42 cm     |
| [ Use Again ]                    |
| Fly #3            11 / 31 cm     |
| [ Use Again ]                    |
|                                  |
| Best-performing lures            |
| Shiden 4g        12 / 42 cm      |
| AR-S             8 / 31 cm       |
|                                  |
| Largest fish by rod              |
| Kawasemi 48UL   42 cm            |
|                                  |
| Performance by place             |
| Ayusawa River    14 / 42 cm      |
+----------------------------------+
| Home | Setup | Add | Performance |
+----------------------------------+
```

## 5. Setup Detail

### Purpose

- Confirm why the setup performs
- Let the user reuse it immediately

### Visible Fields

- Max size
- Recent catches
- Total catches
- Favorite species
- Favorite place
- Gear list

### Gear Categories

- Rod
- Reel
- Line
- Lure

### Primary Action

- Use This Setup Again

Suggested wireframe:

```text
+----------------------------------+
| Stream Bait Setup                |
|                                  |
| Total catches: 18               |
| Max size: 42 cm                 |
| Favorite species: Rainbow       |
| Favorite place: Ayusawa River   |
|                                  |
| Gear                             |
| Rod: Kawasemi 48UL              |
| Reel: Abu 2500C                 |
| Line: PE 0.6                    |
| Lure: Shiden 4g                 |
|                                  |
| [ Use This Setup Again ]         |
+----------------------------------+
| Home | Setup | Add | Performance |
+----------------------------------+
```

## 6. Gear Detail

### Purpose

- Show whether a specific piece of gear earns continued use

### Visible Fields

- Catch count
- Max size
- Best month
- Most-used setup
- Recent catches

### Primary Action

- View Setups Using This Gear

Suggested wireframe:

```text
+----------------------------------+
| Shiden 4g                        |
|                                  |
| Catch count: 12                 |
| Max size: 42 cm                 |
| Best month: June                |
| Most-used setup: Stream Bait    |
|                                  |
| Recent catches                   |
| 2026-06-08 Rainbow 32 cm        |
| 2026-06-01 Yamame 24 cm         |
|                                  |
| [ View Setups Using This Gear ]  |
+----------------------------------+
| Home | Setup | Add | Performance |
+----------------------------------+
```

## Interaction Constraints

- Minimum text size: `18px`
- Primary button height: `64px` to `72px`
- Minimum tap target: `48px`
- Maximum primary actions per screen: `3`
- No icon-only primary controls
- Important actions should be near the bottom half of the screen
