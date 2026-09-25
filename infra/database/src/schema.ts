import { sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey(),
    email: text("email").notNull().unique(),
    name: text("name").notNull(),
    role: text("role").notNull().default("user"),
    homeRegion: text("home_region").notNull().default("eu"),
    shardId: integer("shard_id").notNull().default(0),
    homeRegionAssignedAt: timestamp("home_region_assigned_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    referralCode: text("referral_code").notNull().unique(),
    referredByUserId: uuid("referred_by_user_id").references((): AnyPgColumn => users.id, {
      onDelete: "set null",
    }),
    referredAt: timestamp("referred_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    referralCodeIdx: uniqueIndex("users_referral_code_uidx").on(table.referralCode),
    referredByIdx: index("users_referred_by_idx").on(table.referredByUserId, table.referredAt),
    homeRegionShardIdx: index("users_home_region_shard_idx").on(table.homeRegion, table.shardId),
  }),
);

export const outboxEvents = pgTable(
  "outbox_events",
  {
    id: uuid("id").primaryKey(),
    eventName: text("event_name").notNull(),
    aggregateType: text("aggregate_type").notNull(),
    aggregateId: text("aggregate_id").notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    attempt: integer("attempt").notNull().default(0),
    availableAt: timestamp("available_at", { withTimezone: true }).notNull().defaultNow(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    lastError: text("last_error"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    pendingIdx: index("outbox_events_pending_idx").on(
      table.publishedAt,
      table.availableAt,
      table.createdAt,
    ),
  }),
);

export const authIdentities = pgTable(
  "auth_identities",
  {
    id: uuid("id").primaryKey(),
    provider: text("provider").notNull(),
    subject: text("subject").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    emailVerified: boolean("email_verified").notNull().default(false),
    signInProvider: text("sign_in_provider").notNull(),
    rawClaims: jsonb("raw_claims").$type<Record<string, unknown>>().notNull(),
    lastSignInAt: timestamp("last_sign_in_at", { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    providerSubjectUniq: uniqueIndex("auth_identities_provider_subject_uidx").on(
      table.provider,
      table.subject,
    ),
    userProviderUniq: uniqueIndex("auth_identities_user_provider_uidx").on(
      table.userId,
      table.provider,
    ),
    userIdx: index("auth_identities_user_idx").on(table.userId),
  }),
);

export const authSessions = pgTable(
  "auth_sessions",
  {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    subject: text("subject").notNull(),
    signInProvider: text("sign_in_provider").notNull(),
    emailVerified: boolean("email_verified").notNull().default(false),
    refreshTokenHash: text("refresh_token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index("auth_sessions_user_idx").on(table.userId),
    expiresIdx: index("auth_sessions_expires_idx").on(table.expiresAt),
    revokedIdx: index("auth_sessions_revoked_idx").on(table.revokedAt),
  }),
);

export const userLanguagePreferences = pgTable("user_language_preferences", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  l1Language: text("l1_language").notNull().default("en-gb"),
  l2Language: text("l2_language").notNull().default("es"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const appAnnouncements = pgTable(
  "app_announcements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    level: text("level").notNull().default("info"),
    title: text("title").notNull(),
    body: text("body").notNull(),
    ctaLabel: text("cta_label"),
    ctaUrl: text("cta_url"),
    deepLink: text("deep_link"),
    rewardCreditType: text("reward_credit_type"),
    rewardAmount: integer("reward_amount"),
    rewardRequirementType: text("reward_requirement_type"),
    rewardRequirementCount: integer("reward_requirement_count"),
    isActive: boolean("is_active").notNull().default(true),
    startsAt: timestamp("starts_at", { withTimezone: true }),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    activeWindowIdx: index("app_announcements_active_window_idx").on(
      table.isActive,
      table.startsAt,
      table.endsAt,
      table.createdAt,
    ),
    createdAtIdx: index("app_announcements_created_at_idx").on(table.createdAt),
  }),
);

export const appTutorialVideos = pgTable(
  "app_tutorial_videos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    screen: text("screen").notNull(),
    placement: text("placement").notNull(),
    locale: text("locale").notNull().default("en"),
    title: text("title").notNull(),
    description: text("description"),
    youtubeUrl: text("youtube_url").notNull(),
    thumbnailUrl: text("thumbnail_url"),
    durationSeconds: integer("duration_seconds"),
    platform: text("platform").notNull().default("all"),
    priority: integer("priority").notNull().default(100),
    minAppVersion: text("min_app_version"),
    maxAppVersion: text("max_app_version"),
    isActive: boolean("is_active").notNull().default(true),
    startsAt: timestamp("starts_at", { withTimezone: true }),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    slugIdx: uniqueIndex("app_tutorial_videos_slug_uidx").on(table.slug),
    filtersIdx: index("app_tutorial_videos_filters_idx").on(
      table.isActive,
      table.locale,
      table.screen,
      table.placement,
      table.platform,
      table.priority,
    ),
    activeWindowIdx: index("app_tutorial_videos_active_window_idx").on(
      table.isActive,
      table.startsAt,
      table.endsAt,
      table.priority,
    ),
  }),
);

export const appAnnouncementReads = pgTable(
  "app_announcement_reads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    announcementId: uuid("announcement_id")
      .notNull()
      .references(() => appAnnouncements.id, { onDelete: "cascade" }),
    readAt: timestamp("read_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    pk: uniqueIndex("app_announcement_reads_user_announcement_uidx").on(
      table.userId,
      table.announcementId,
    ),
    userReadIdx: index("app_announcement_reads_user_read_idx").on(table.userId, table.readAt),
    announcementIdx: index("app_announcement_reads_announcement_idx").on(table.announcementId),
  }),
);

export const appAnnouncementRewardClaims = pgTable(
  "app_announcement_reward_claims",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    announcementId: uuid("announcement_id")
      .notNull()
      .references(() => appAnnouncements.id, { onDelete: "cascade" }),
    creditType: text("credit_type").notNull(),
    amount: integer("amount").notNull(),
    claimedAt: timestamp("claimed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    pk: uniqueIndex("app_announcement_reward_claims_user_announcement_uidx").on(
      table.userId,
      table.announcementId,
    ),
    userClaimedIdx: index("app_announcement_reward_claims_user_claimed_idx").on(
      table.userId,
      table.claimedAt,
    ),
    announcementIdx: index("app_announcement_reward_claims_announcement_idx").on(
      table.announcementId,
    ),
  }),
);

export const userCredits = pgTable("user_credits", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  freeBasic: integer("free_basic").notNull().default(10),
  freeAdvanced: integer("free_advanced").notNull().default(3),
  paidBasic: integer("paid_basic").notNull().default(0),
  paidAdvanced: integer("paid_advanced").notNull().default(0),
  paidBasicCap: integer("paid_basic_cap").notNull().default(200),
  paidAdvancedCap: integer("paid_advanced_cap").notNull().default(100),
  monthlyPaidBasicTopup: integer("monthly_paid_basic_topup").notNull().default(0),
  monthlyPaidAdvancedTopup: integer("monthly_paid_advanced_topup").notNull().default(0),
  nextMonthlyTopupAt: timestamp("next_monthly_topup_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const purchases = pgTable(
  "purchases",
  {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    store: text("store").notNull(),
    sku: text("sku").notNull(),
    status: text("status").notNull(),
    purchaseToken: text("purchase_token").notNull(),
    originalTransactionId: text("original_transaction_id"),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    lastEventId: text("last_event_id"),
    monthlyPaidBasicTopup: integer("monthly_paid_basic_topup").notNull().default(0),
    monthlyPaidAdvancedTopup: integer("monthly_paid_advanced_topup").notNull().default(0),
    paidBasicCap: integer("paid_basic_cap").notNull().default(0),
    paidAdvancedCap: integer("paid_advanced_cap").notNull().default(0),
    rawPayload: jsonb("raw_payload").$type<Record<string, unknown>>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    tokenUniq: uniqueIndex("purchases_store_token_uidx").on(table.store, table.purchaseToken),
    userIdx: index("purchases_user_idx").on(table.userId),
    statusIdx: index("purchases_status_idx").on(table.status),
    expiresIdx: index("purchases_expires_idx").on(table.expiresAt),
  }),
);

export const billingEvents = pgTable(
  "billing_events",
  {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    store: text("store").notNull(),
    eventId: text("event_id").notNull(),
    source: text("source").notNull(),
    purchaseToken: text("purchase_token").notNull(),
    status: text("status").notNull(),
    rawPayload: jsonb("raw_payload").$type<Record<string, unknown>>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    uniqStoreEvent: uniqueIndex("billing_events_store_event_uidx").on(table.store, table.eventId),
    userIdx: index("billing_events_user_idx").on(table.userId),
    tokenIdx: index("billing_events_token_idx").on(table.store, table.purchaseToken),
  }),
);

export const billingCreditCycles = pgTable(
  "billing_credit_cycles",
  {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    store: text("store").notNull(),
    purchaseToken: text("purchase_token").notNull(),
    creditType: text("credit_type").notNull(),
    cycleKey: text("cycle_key").notNull(),
    eventId: text("event_id").notNull(),
    amount: integer("amount").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    uniqCycle: uniqueIndex("billing_credit_cycles_token_type_cycle_uidx").on(
      table.store,
      table.purchaseToken,
      table.creditType,
      table.cycleKey,
    ),
    userIdx: index("billing_credit_cycles_user_idx").on(table.userId),
    tokenIdx: index("billing_credit_cycles_token_idx").on(table.store, table.purchaseToken),
  }),
);

export const creditLedger = pgTable(
  "credit_ledger",
  {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    reason: text("reason").notNull(),
    creditType: text("credit_type").notNull(),
    amount: integer("amount").notNull(),
    mode: text("mode").notNull(),
    requestId: text("request_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index("credit_ledger_user_idx").on(table.userId),
    requestIdx: index("credit_ledger_request_idx").on(table.requestId),
  }),
);

export const lookups = pgTable(
  "lookups",
  {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    requestId: text("request_id").notNull(),
    mode: text("mode").notNull(),
    vocab: text("vocab").notNull(),
    sentence: text("sentence").notNull(),
    sourceLang: text("source_lang").notNull(),
    targetLang: text("target_lang").notNull(),
    aiProvider: text("ai_provider").notNull(),
    aiModel: text("ai_model").notNull(),
    responseSummary: jsonb("response_summary").$type<{
      meaning: string;
      shortExplanation: string;
      confidence: number;
    }>(),
    responsePayload: jsonb("response_payload").$type<Record<string, unknown>>(),
    latencyMs: integer("latency_ms").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index("lookups_user_idx").on(table.userId),
    requestUniq: uniqueIndex("lookups_user_request_uidx").on(table.userId, table.requestId),
    createdAtIdx: index("lookups_created_at_idx").on(table.createdAt),
  }),
);

export const learningItems = pgTable(
  "learning_items",
  {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lemma: text("lemma").notNull(),
    vocab: text("vocab").notNull(),
    sourceLang: text("source_lang").notNull(),
    targetLang: text("target_lang").notNull(),
    status: text("status").notNull().default("active"),
    encounterCount: integer("encounter_count").notNull().default(1),
    lastSeenMode: text("last_seen_mode").notNull(),
    lastMeaning: text("last_meaning").notNull(),
    targetMeaning: text("target_meaning").notNull(),
    phonetic: text("phonetic"),
    definitionL2: text("definition_l2").notNull(),
    isFavorite: boolean("is_favorite").notNull().default(false),
    favoritedAt: timestamp("favorited_at", { withTimezone: true }),
    latestLookupId: uuid("latest_lookup_id").references(() => lookups.id, { onDelete: "set null" }),
    lastLookupAt: timestamp("last_lookup_at", { withTimezone: true }).notNull().defaultNow(),
    learnedAt: timestamp("learned_at", { withTimezone: true }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index("learning_items_user_idx").on(table.userId),
    userStatusIdx: index("learning_items_user_status_idx").on(table.userId, table.status),
    userLookupIdx: index("learning_items_user_lookup_idx").on(table.userId, table.lastLookupAt),
    userFavoriteIdx: index("learning_items_user_favorite_idx").on(
      table.userId,
      table.isFavorite,
      table.lastLookupAt,
    ),
    latestLookupIdx: index("learning_items_latest_lookup_idx").on(table.latestLookupId),
    uniqueLemmaIdx: uniqueIndex("learning_items_user_lemma_lang_uidx").on(
      table.userId,
      table.lemma,
      table.sourceLang,
      table.targetLang,
    ),
  }),
);

export const learningItemGroups = pgTable(
  "learning_item_groups",
  {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index("learning_item_groups_user_idx").on(table.userId, table.createdAt),
    userNameUniq: uniqueIndex("learning_item_groups_user_name_uidx").on(table.userId, table.name),
  }),
);

export const learningItemGroupMembers = pgTable(
  "learning_item_group_members",
  {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    groupId: uuid("group_id")
      .notNull()
      .references(() => learningItemGroups.id, { onDelete: "cascade" }),
    itemId: uuid("item_id")
      .notNull()
      .references(() => learningItems.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    groupItemUniq: uniqueIndex("learning_item_group_members_group_item_uidx").on(
      table.groupId,
      table.itemId,
    ),
    userGroupIdx: index("learning_item_group_members_user_group_idx").on(
      table.userId,
      table.groupId,
    ),
    userItemIdx: index("learning_item_group_members_user_item_idx").on(table.userId, table.itemId),
  }),
);

export const wordInsightReports = pgTable(
  "word_insight_reports",
  {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    itemId: uuid("item_id")
      .notNull()
      .references(() => learningItems.id, { onDelete: "cascade" }),
    lookupId: uuid("lookup_id").references(() => lookups.id, { onDelete: "set null" }),
    message: text("message").notNull(),
    status: text("status").notNull().default("open"),
    snapshot: jsonb("snapshot")
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index("word_insight_reports_user_idx").on(table.userId),
    itemIdx: index("word_insight_reports_item_idx").on(table.itemId),
    statusIdx: index("word_insight_reports_status_idx").on(table.status, table.createdAt),
  }),
);

export const wordInsightJobs = pgTable(
  "word_insight_jobs",
  {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    requestId: text("request_id").notNull(),
    status: text("status").notNull().default("queued"),
    homeRegion: text("home_region").notNull().default("eu"),
    shardId: integer("shard_id").notNull().default(0),
    claimedByRegion: text("claimed_by_region"),
    claimedByWorker: text("claimed_by_worker"),
    inputPayload: jsonb("input_payload").$type<Record<string, unknown>>().notNull(),
    contextPayload: jsonb("context_payload").$type<Record<string, unknown>>().notNull(),
    resultPayload: jsonb("result_payload").$type<Record<string, unknown>>(),
    errorCode: text("error_code"),
    errorMessage: text("error_message"),
    attempt: integer("attempt").notNull().default(0),
    startedAt: timestamp("started_at", { withTimezone: true }),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    requestUniq: uniqueIndex("word_insight_jobs_request_uidx").on(table.userId, table.requestId),
    userStatusIdx: index("word_insight_jobs_user_status_idx").on(table.userId, table.status),
    queueIdx: index("word_insight_jobs_queue_idx").on(
      table.status,
      table.homeRegion,
      table.shardId,
      table.createdAt,
    ),
  }),
);

export const exerciseSessions = pgTable(
  "exercise_sessions",
  {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    mode: text("mode").notNull(),
    status: text("status").notNull().default("active"),
    totalQuestions: integer("total_questions").notNull(),
    requiredTodayQuestions: integer("required_today_questions").notNull().default(0),
    questionTypes: jsonb("question_types").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    timezoneOffsetMinutes: integer("timezone_offset_minutes").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (table) => ({
    userStatusIdx: index("exercise_sessions_user_status_idx").on(table.userId, table.status),
    userCreatedIdx: index("exercise_sessions_user_created_idx").on(table.userId, table.createdAt),
  }),
);

export const exerciseQuestions = pgTable(
  "exercise_questions",
  {
    id: uuid("id").primaryKey(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => exerciseSessions.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    orderNo: integer("order_no").notNull(),
    type: text("type").notNull(),
    itemId: uuid("item_id").references(() => learningItems.id, { onDelete: "set null" }),
    prompt: text("prompt").notNull(),
    options: jsonb("options").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    correctAnswer: text("correct_answer").notNull(),
    explanation: text("explanation"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    sessionOrderUniq: uniqueIndex("exercise_questions_session_order_uidx").on(
      table.sessionId,
      table.orderNo,
    ),
    sessionIdx: index("exercise_questions_session_idx").on(table.sessionId),
    userIdx: index("exercise_questions_user_idx").on(table.userId),
  }),
);

export const exerciseAnswers = pgTable(
  "exercise_answers",
  {
    id: uuid("id").primaryKey(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => exerciseSessions.id, { onDelete: "cascade" }),
    questionId: uuid("question_id")
      .notNull()
      .references(() => exerciseQuestions.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    answer: text("answer").notNull(),
    isCorrect: boolean("is_correct").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    questionUniq: uniqueIndex("exercise_answers_question_uidx").on(table.questionId),
    sessionIdx: index("exercise_answers_session_idx").on(table.sessionId),
    userIdx: index("exercise_answers_user_idx").on(table.userId),
  }),
);
