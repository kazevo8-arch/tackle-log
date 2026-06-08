# Fishing Gear Performance Log MVP Spec

## Purpose

This MVP is not a fishing catch log app.

Its purpose is to validate one core behavior:

- The user wants to reuse the same setup next time because it previously produced results.

The product is a personal toolbook for recalling and reusing effective fishing setups.

## Core Value To Validate

The MVP should answer this question:

- After checking performance, does the user feel "I want to use that setup again next time"?

It does not need to validate:

- Social sharing
- Community engagement
- Mapping
- GPS logging
- Weather analysis
- AI recommendations

## Core User Flow

Primary flow:

```text
First launch
-> Create minimal setup
-> Home
-> Add catch
-> Performance
-> Use this setup again
```

Supporting flow 1:

```text
Home
-> Today's Setup
-> Use this setup
-> Home
-> Add catch
```

Supporting flow 2:

```text
Performance
-> Setup Detail
-> Use this setup again
-> Home
```

## Scope

Implemented in MVP:

- Home
- Today's Setup
- Add Catch
- Performance
- Setup Detail
- Gear Detail

Excluded from MVP:

- Trip list
- River management
- Area management
- GPS
- Maps
- Weather
- SNS
- Community
- AI analysis
- Notifications
- Graphs
- Shared rankings

## Product Principles

- Smartphone portrait only
- One-handed use
- Readable for users in their 60s to 70s
- Large buttons and large text
- Fast setup selection
- Fast catch entry
- Performance shown for reuse, not analysis depth
- No icon-only critical actions

## Home Screen Rules

When a setup is selected, show:

- Current setup name
- Total catches
- Max size
- Last used date

Primary actions:

1. Add Catch
2. View Performance
3. Change Setup

When no setup is selected:

- Show "Choose Today's Setup" alone at the top as the first action

## Today's Setup Rules

Each setup card shows:

- Photo
- Setup name
- Three primary gear items
- Total catches
- Max size
- Last used date

Each setup card supports one main action:

- Use This Setup

Do not show on this screen:

- Edit actions
- Detailed settings
- Long memo text

This screen exists to optimize selection speed.

## Add Catch Rules

The Add Catch screen is single-screen only.

Input fields:

- Species
- Size
- Primary lure/fly/bait
- Photo

Required fields:

- `set_id`
- `caught_at`

Optional fields:

- `species`
- `size_cm`
- `primary_gear_id`
- `photo_path`
- `place_name`

If no setup is currently selected:

- Redirect to Today's Setup instead of showing an error

### Size Input

Use large preset buttons:

- 20
- 25
- 30
- 35
- 40

Also provide:

- `-1`
- `+1`

Numeric keypad entry is out of scope for MVP.

## Performance Screen Rules

The Performance screen is a reuse screen, not an analysis tool.

Sections appear in this order:

1. Best-performing setups
2. Best-performing lures
3. Largest fish by rod
4. Performance by place

Display style:

- Numbers
- Counts
- Max size
- Last used date
- Rankings

Do not use graphs in MVP.

## Setup Detail Rules

Show:

- Total catches
- Max size
- Favorite species
- Favorite place
- Setup gear list

Gear list categories:

- Rod
- Reel
- Line
- Lure

Primary action:

- Use This Setup Again

## Gear Detail Rules

Show:

- Catch count
- Max size
- Best month
- Most-used setup
- Recent catch history

Primary action:

- View Setups Using This Gear

## First Launch Rules

Do not force full gear registration.

Required first-launch inputs:

- Setup name
- Rod name

First-launch flow:

```text
Create your first setup
-> Enter setup name
-> Enter rod name
-> Start
-> Home
```

Reel, line, and lure are added later.

## Success Criteria

Track these product signals:

- Setup selection count
- Add Catch count
- Performance screen views
- "Use This Setup Again" click count

The MVP succeeds if users think:

- "I want to use the setup that worked last time"

and not merely:

- "I want to log a catch"
