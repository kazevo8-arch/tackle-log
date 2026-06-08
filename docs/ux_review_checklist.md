# UX Review Checklist

## Purpose

This checklist is used during design review and device testing before implementation is expanded.

The goal is not to judge completeness.

The goal is to confirm that the MVP supports this behavior:

- The user wants to use the setup that worked last time.

## Core Validation Questions

1. Can the user start using the app within one minute on first launch?
2. Can the user reach Add Catch from Home within two taps?
3. Can a catch be saved within 30 seconds?
4. Can the user move naturally from Performance to setup reuse?
5. Is the interface readable for users in their 60s to 70s?

## First Launch Review

- Is the first screen focused only on creating one minimal setup?
- Are only `setup name` and `rod name` required?
- Can the user finish first setup creation without confusion?
- Does the app move directly to Home after first setup creation?
- Is the user protected from being forced to register all gear?

## Home Review

- When a setup exists, is `Add Catch` the most visually prominent action?
- When no setup exists, is `Choose Today's Setup` the first and clearest action?
- Are the setup summary values visible at a glance?
- Are there no more than three main actions on the screen?
- Is the bottom navigation easy to reach one-handed?

## Today's Setup Review

- Can the user understand each setup card in under three seconds?
- Do the cards emphasize selection rather than management?
- Are the visible fields limited to photo, name, three main gear items, count, max size, and last used date?
- Are edit actions absent from this screen?
- Can the user choose a setup with one obvious button press?

## Add Catch Review

- Is Add Catch a single-screen flow?
- If no setup is selected, does the app redirect to Today's Setup without an error dead-end?
- Are species buttons easy to tap one-handed?
- Are size presets more useful than free numeric entry in practice?
- Are `-1` and `+1` easy to use without accidental taps?
- Can the user save even with optional fields left empty?
- Is the save action easy to find near the bottom?

## Performance Review

- Does the screen feel like a reuse tool instead of a stats dashboard?
- Are the sections shown in the intended order?
- Are rows easy to scan as rankings?
- Is the `Use Again` action obvious for top setups?
- Are graphs absent?

## Setup Detail Review

- Does the screen explain why the setup is worth reusing?
- Are total catches and max size visible before secondary details?
- Is the gear list easy to read?
- Is `Use This Setup Again` the strongest action on the screen?

## Gear Detail Review

- Can the user quickly tell whether this gear performs well?
- Is the most-used setup visible?
- Is recent catch history short and readable?
- Does the primary action lead back toward setup reuse?

## Accessibility And Layout Review

- Minimum text size is at least `18px`
- Primary buttons are `64px` to `72px` high
- Tap targets are at least `48px`
- Critical actions are not icon-only
- Important actions sit near the lower half of the screen
- The UI works in portrait smartphone layout only
- The interface remains readable without pinch zoom

## Product Success Signals

During review sessions or prototype testing, observe:

- How often users choose a setup
- How often users add catches
- Whether users open Performance after adding catches
- Whether users press `Use This Setup Again`
- Whether users press a reuse button after viewing performance
- Whether users add another catch after switching to a reused setup

## Fail Conditions

The MVP should be reconsidered if users mainly behave like this:

- They only use the app as a generic catch memo
- They ignore Performance
- They do not reuse setups
- They feel setup selection is slower than memory or habit
- They see no value in logging because it does not change future choice
