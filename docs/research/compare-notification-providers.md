# Compare notification providers

Research for [#2](https://github.com/hogwashbazooka/cohort-005-project/issues/2), part of map [#1 Cadence Notifications](https://github.com/hogwashbazooka/cohort-005-project/issues/1).
Gathered 2026-11-11 from official docs and pricing pages. Prices and plan contents change, so check them again before signing up.

**Question:** Which third-party notification providers fit Cadence, which needs an in-app feed (React 19), email, and browser Web Push, plus per-type and per-channel preferences and some mandatory Notifications?

**Candidates:** Knock, Novu, Courier, MagicBell, OneSignal, and SuprSend (added as a strong other).

## Comparison

| | Knock | Novu | Courier | MagicBell | OneSignal |
|---|---|---|---|---|---|
| **In-app feed (React)** | `@knocklabs/react`: `NotificationFeedPopover`, `NotificationIconButton`, `NotificationFeed`, `NotificationCell`, plus the `useNotifications` hook and `@knocklabs/client` for headless use. Badge shows unseen or unread counts. Real-time updates over a socket. [1] | `@novu/react` `<Inbox>` (Bell, Notifications, Preferences). React 18+, and React 19 is supported. Headless hooks in `@novu/react` or `@novu/js`. Unread count and real-time sync. [6] | `@trycourier/courier-react` v9 `<CourierInbox>`, with unread badges, read and archive actions, and real-time sync across devices. Custom UI uses lower-level APIs that the overview page doesn't name. [11] | `@magicbell/react`: `Inbox`, `FloatingInbox`, `UserPreferences`, `WebPushButton`. The page doesn't document headless hooks or the real-time transport. [16] | **No in-app feed for web.** In-app messages are mobile-only ("only available for mobile apps with the OneSignal mobile SDK installed"). An activity feed has to be built yourself. [20] |
| **Email** | Bring your own ESP (SES, Postmark, Resend, SendGrid, SMTP, and more). A "Knock (testing only)" provider is built in. [2] | Bring your own ESP (19 options, including SES, Resend, Postmark, and SMTP). A demo email integration is available for testing. [7] | Bring your own ESP. The Test environment has a testing email provider that only delivers to the signup address. [12] | Bring your own ESP (SES, Mailgun, SendGrid, SMTP, and more). [17] | Built in. Free: 10k sends/mo. Growth: 20k/mo, then $1.50 per 1k. [21] |
| **Web Push** | **No first-party channel.** "Knock does not have a first-party web push channel." Web Push goes through FCM (Firebase SDK, service worker, token stored as channel data), or through OneSignal as a push provider. [3] | Through third parties only (FCM, OneSignal, Pushpad, Pusher Beams, Push Webhook). The docs say nothing about native VAPID. [8] | Through third parties (FCM, OneSignal, MagicBell, Pusher Beams, and others). The overview doesn't confirm browser support. [13] | **Native**: you supply VAPID keys, and the `WebPushButton` uses the Push API with MagicBell's `sw.js` imported into your service worker. [18][16] | **Native and core product.** Free: 10k web push subscribers per send. Growth: $0.004 per web push subscriber. [21] |
| **Preferences and mandatory Notifications** | Per workflow, per category, and per channel type or channel. Unset preferences default to `true`. Mandatory: "Override recipient preferences" on a workflow sends to all its channels regardless of preferences. [4] | Workflow defaults, subscriber global settings, and subscriber per-workflow settings. Mandatory: "Mark as critical" ignores subscriber preferences and hides the workflow from the preferences UI. [9] | Subscription topics that are `OPTED_IN`, `OPTED_OUT`, or `REQUIRED`, with per-topic channel routing. A `REQUIRED` topic always delivers, and the API rejects opt-outs. Hosted preference page available. [14] | Per category × channel, with a `UserPreferences` component. No mandatory or non-opt-out mechanism found in the docs. [16][19] | Segments, tags, and subscription status. No per-type × per-channel preference model found. |
| **Identity and feed auth** | The user ID is your own ID. In enhanced security mode, the backend signs an RS256 JWT (`sub` = user ID) with `signUserToken` from `@knocklabs/node`. The client passes it as `userToken`. Docs: "Production environments should enable enhanced security mode." [5] | `subscriberId` is your own ID. With HMAC on, `subscriberHash = HMAC-SHA256(secretKey, subscriberId)` is computed on the server. Without the hash, the Inbox won't load. [10] | The backend issues a JWT with the Courier API key, and the client calls `courier.shared.signIn({ userId, jwt })`. [11] | The backend signs an HS256 user JWT with the project secret, using claims `user_external_id` and/or `user_email`. [15] | `external_id`. Identity Verification (ES256 JWT) is **not yet supported on the Web SDK**. [22] |
| **Digests and batching** | Batch step with a batch key, fixed or sliding windows (up to 90 days), and a cap of 2–1000 activities. Included on all plans. [23][24] | Digest step grouped by `subscriberId` plus an optional key, with regular or scheduled windows. The maximum window depends on the plan. [25][26] | Digests on subscription topics, with collector and release automations. Releases happen at scheduled times, and each category keeps 10 events. [27] | Not found in the docs. | Not found in the docs. |
| **Node/TS SDK and local dev** | `@knocklabs/node`. Unlimited isolated environments on all plans. Sandbox mode for testing email steps. The CLI pulls and pushes workflows and templates as files and promotes them between environments. [2][24][28] | `@novu/api` (`novu.trigger()`). 2 environments (Dev and Prod) on Free/Pro. Novu Framework runs code-first workflows in your app behind a "Bridge Endpoint". [29][26][30] | `@trycourier/courier`. Production and Test environments, each with its own keys, templates, and logs. A Mock key is Enterprise-only. Billing counts sends from every environment. [12] | `magicbell-js` Browser/Node client. Projects (1 on Free, 5 on Startup). [17][19] | REST API. Not assessed further. |
| **Pricing (small scale)** | Free: 10k messages/mo, unlimited environments, Knock branding. Starter: $250/mo for 50k, then $0.005/msg. [24] | Free: 10k workflow runs/mo, 5 workflows, 3 seats. Pro: from $30/mo for 30k+, then $1.20 per 1k. Team: $250/mo. [26] | Developer: free for 10k sends/mo. Business: $0.005 per send, pay-as-you-go. [31] | Builder: free for 1,000 deliveries/mo, where each channel counts as a delivery. Startup: $249/mo for 50k, then $0.0025. [19] | Free: web push plus 10k emails. Growth: from $19/mo. [21] |
| **Open source or self-host** | No. | Open core: MIT, except the `enterprise/` folder. Community self-hosted edition, with some cloud-only features. [32][33] | No. | No. | No. |
| **Lock-in** | Workflows and templates live in Knock but can be pulled as files with the CLI. Your ESP and FCM accounts stay yours. [28] | Lowest: workflows can live in your code (Framework), and the MIT core can be self-hosted. [30][32] | Templates, automations, and digests are built in Courier's editor and automations. | Medium. | High, and it covers only one channel well. |

**SuprSend** (other): Free tier with 10k notifications/mo and an in-app feed with SuprSend branding. But **user preferences and batching/digest require the Business plan at $250/mo**, which rules it out for Cadence at small scale. [34]

## Findings

1. **No provider covers all three channels natively with preferences and mandatory Notifications on a free tier.** The Web Push-native options (MagicBell, OneSignal) are weak elsewhere. The strong feed and preference platforms (Knock, Novu, Courier) all route Web Push through FCM, OneSignal, or a similar service.
2. **OneSignal is out as the main provider.** It has no in-app feed on web [20] and no Web SDK identity verification [22]. It could still be a downstream Web Push transport behind Knock, Novu, or Courier [3][8][13].
3. **MagicBell** is the only feed-plus-preferences platform with native VAPID Web Push and a ready-made `WebPushButton` [16][18]. But the free tier covers only 1,000 deliveries (each channel counts) [19], and its docs show no mandatory flag and no digests.
4. **Every serious candidate needs its own ESP** (Resend, Postmark, SES, and similar), billed separately [2][7][12][17]. Cadence has to pick an ESP anyway, and set up a sender domain.
5. **Knock** has the most complete small-scale fit. The free plan covers preferences, batching, and unlimited environments [24]. Its React feed is mature [1], it supports a workflow-level preference override for mandatory Notifications [4], and RS256 signed user tokens come with a Node helper [5]. Its CLI makes workflows version-controllable [28]. The price step is steep: free, then $250/mo [24].
6. **Novu** is the best value and has the least lock-in. Pro starts at $30/mo [26], the core is MIT and self-hostable [32], the "critical" flag removes the workflow from preference UIs [9], HMAC auth is simple [10], and React 19 is explicitly supported [6]. The free tier caps workflows at 5 and keeps activity history for 24h [26].
7. **Courier** has the cleanest model for mandatory Notifications (`REQUIRED` topics, where the API rejects opt-outs) [14], plus pay-as-you-go pricing at $0.005 per send [31]. Its digests are schedule-based only, unlike the rolling windows of Knock and Novu, so a "5 questions in an hour" batch is less natural [27].

## Recommendation (not a decision; see #4)

Lead candidate: **Knock**, with **FCM for Web Push** and a separate ESP for email. Runner-up: **Novu**.

Caveats:

- Knock Web Push needs a Firebase project, the Firebase SDK, and a service worker [3]. That adds a Google dependency. Using OneSignal as Knock's push provider is the alternative.
- Knock has no self-host option, and the free → $250/mo jump is large. If cost or lock-in weighs heavily, Novu (Pro $30/mo, MIT core) is the safer pick for similar features.
- Knock's "Override recipient preferences" applies to a whole workflow across all its channels [4]. A Notification that is mandatory on email but optional in-app would need two workflows or a different design.
- Free-tier counts differ: Knock counts messages per channel, Novu counts workflow runs, and MagicBell counts deliveries per channel. Compare them against expected volume.
- Pricing pages were read on 2026-11-11. Check them again before deciding.

## Sources

1. Knock React feed: https://docs.knock.app/in-app-ui/react/feed
2. Knock email providers: https://docs.knock.app/integrations/email/overview
3. Knock push providers: https://docs.knock.app/integrations/push/overview ; Knock web push with FCM: https://docs.knock.app/tutorials/sending-web-push-notifications-with-fcm
4. Knock preferences: https://docs.knock.app/preferences/overview
5. Knock in-app security: https://docs.knock.app/in-app-ui/security-and-authentication
6. Novu Inbox: https://docs.novu.co/platform/inbox/overview
7. Novu email: https://docs.novu.co/platform/integrations/email
8. Novu push: https://docs.novu.co/platform/integrations/push
9. Novu preferences: https://docs.novu.co/platform/concepts/preferences
10. Novu HMAC: https://docs.novu.co/platform/inbox/prepare-for-production
11. Courier Inbox: https://www.courier.com/docs/platform/inbox/inbox-overview
12. Courier environments: https://www.courier.com/docs/platform/workspaces/environments-api-keys
13. Courier push: https://www.courier.com/docs/external-integrations/push/intro
14. Courier preferences: https://www.courier.com/docs/platform/preferences/preferences-overview
15. MagicBell user JWT: https://www.magicbell.com/docs/api/authentication/user
16. MagicBell React: https://www.magicbell.com/docs/libraries/magicbell-react
17. MagicBell docs index: https://www.magicbell.com/docs
18. MagicBell web push: https://www.magicbell.com/docs/channels/web_push
19. MagicBell pricing: https://www.magicbell.com/pricing ; in-app channel: https://www.magicbell.com/docs/channels/in_app
20. OneSignal in-app: https://documentation.onesignal.com/docs/en/in-app-messages-setup
21. OneSignal pricing: https://onesignal.com/pricing
22. OneSignal identity verification: https://documentation.onesignal.com/docs/en/identity-verification
23. Knock batch: https://docs.knock.app/designing-workflows/batch-function
24. Knock pricing: https://knock.app/pricing
25. Novu digest: https://docs.novu.co/platform/workflow/add-and-configure-steps/configure-action-steps/digest
26. Novu pricing: https://novu.co/pricing
27. Courier digests: https://www.courier.com/docs/platform/automations/digest
28. Knock CLI: https://docs.knock.app/developer-tools/knock-cli
29. Novu TypeScript SDK: https://docs.novu.co/platform/sdks/server/typescript
30. Novu Framework: https://docs.novu.co/framework/overview
31. Courier pricing: https://www.courier.com/pricing
32. Novu repo and license: https://github.com/novuhq/novu
33. Novu self-hosting: https://docs.novu.co/community/self-hosting-novu/overview
34. SuprSend pricing: https://www.suprsend.com/pricing
