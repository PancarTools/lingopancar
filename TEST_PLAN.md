# Review Feature Test Plan

## Overview
This document outlines the test cases for the review tracking feature to ensure no regressions when marking cards during study sessions.

## Test Cases

### 1. Card Review Tracking
- **Test**: Increment reviewCount when card is marked
  - Initial reviewCount: 0
  - After marking: 1
  - Expected: reviewCount increments by 1

- **Test**: Update lastReviewedAt timestamp on mark
  - Initial lastReviewedAt: undefined
  - After marking: current timestamp
  - Expected: lastReviewedAt is set to current time

- **Test**: Handle multiple reviews correctly
  - Mark card 3 times sequentially
  - Expected: reviewCount goes from 0 → 1 → 2 → 3

### 2. Card Data Integrity
- **Test**: Preserve card data when updating review stats
  - Update only reviewCount and lastReviewedAt
  - Expected: All other card properties remain unchanged
    - id, userId, deckId, prefix, main, suffix, meaning, description, examples, createdAt

- **Test**: Use "main" field instead of "word"
  - Card interface should have "main" property
  - Card interface should NOT have "word" property
  - Expected: All components reference card.main

### 3. Review Statistics Display
- **Test**: Display review count correctly
  - Card with reviewCount: 5
  - Expected: UI shows "Reviews: 5"

- **Test**: Display last reviewed date when available
  - Card with lastReviewedAt: timestamp from 1 day ago
  - Expected: UI shows formatted date string

- **Test**: Handle missing lastReviewedAt gracefully
  - Card with lastReviewedAt: undefined
  - Expected: UI doesn't display "Last reviewed" line

### 4. Firebase Service Integration
- **Test**: updateCard uses user-scoped path
  - Call: updateCard(userId, cardId, {reviewCount: 1, lastReviewedAt: now})
  - Expected: Firebase path is `users/{userId}/cards/{cardId}`

- **Test**: updateCard includes updatedAt timestamp
  - Call: updateCard(userId, cardId, updates)
  - Expected: updatedAt is automatically set to current time

### 5. ReviewMode Component
- **Test**: Mark & Next button calls handleMarkAndNext
  - Click "Mark & Next" button
  - Expected: updateCard is called with current card

- **Test**: ReviewMode receives userId prop
  - ReviewMode component requires userId
  - Expected: userId is passed from Dashboard

- **Test**: Navigation after marking
  - Mark card and click "Mark & Next"
  - Expected: Move to next card (or exit if last card)

## Running Tests

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests with UI
npm run test:ui

# Run specific test file
npm test -- review-feature.test.ts
```

## Test Coverage Goals

- ✅ Card review tracking logic
- ✅ Data integrity during updates
- ✅ Field naming (main vs word)
- ✅ Review statistics display
- ✅ Firebase integration paths
- ✅ Component prop passing
- ✅ Navigation flow

## Regression Prevention

These tests ensure that:
1. reviewCount increments correctly on each mark
2. lastReviewedAt is updated to current timestamp
3. Card data is not corrupted during updates
4. "main" field is used consistently (not "word")
5. Firebase user-scoped paths are correct
6. UI displays review stats accurately
7. Navigation works correctly in review mode
