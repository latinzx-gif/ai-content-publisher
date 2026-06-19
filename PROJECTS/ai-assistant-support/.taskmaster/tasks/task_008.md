# Task ID: 8

**Title:** F8 — Linear Webhook Close-Loop Notify

**Status:** pending

**Dependencies:** 6, 7

**Priority:** high

**Description:** On Linear Done push resolution Flex to reporter from [resolution] comment

**Details:**

POST /api/linear/webhook. Update ticket resolved. notify_at tracking.

**Test Strategy:**

Mark Done in Linear triggers LINE Flex within 1 min
