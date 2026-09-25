import { Elysia } from "elysia";
import { ok } from "../../../../packages/core/src/http/response";
import type { AppMetaPublicContract } from "../public-contract";
import {
  type AppMetaRouteOptions,
  parseLimit,
  resolveAuthz,
  resolvePlatform,
  resolveRequestUser,
  resolveRouteDetail,
} from "./route-shared";
import {
  announcementIdParamsSchema,
  appAnnouncementsQuerySchema,
  appBootstrapQuerySchema,
  appTutorialVideosQuerySchema,
  createAnnouncementBodySchema,
  createTutorialVideoBodySchema,
} from "./schemas";

export function createAppMetaRoutes(
  appMeta: AppMetaPublicContract,
  options: AppMetaRouteOptions = {},
) {
  return new Elysia({
    name: "app-meta-routes",
    detail: resolveRouteDetail(options),
  })
    .get(
      "/app/bootstrap",
      async (context) => {
        const user = resolveRequestUser(context, options.requiresAuth === true);
        const result = await appMeta.getBootstrap({
          userId: user.id,
          platform: resolvePlatform(context),
          appVersion: context.query.appVersion,
        });
        return ok(result);
      },
      {
        query: appBootstrapQuerySchema,
        detail: {
          summary: "Get app bootstrap data (update policy + announcements summary)",
        },
      },
    )
    .get(
      "/app/tutorial-videos",
      async (context) => {
        resolveRequestUser(context, options.requiresAuth === true);
        const result = await appMeta.listTutorialVideos({
          locale: context.query.locale,
          screen: context.query.screen,
          placement: context.query.placement,
          platform: context.query.platform,
          appVersion: context.query.appVersion,
          limit: parseLimit(context.query.limit),
        });
        return ok(result);
      },
      {
        query: appTutorialVideosQuerySchema,
        detail: {
          summary: "List active tutorial videos for app screens and placements",
        },
      },
    )
    .post(
      "/app/tutorial-videos",
      async (context) => {
        const authz = resolveAuthz(context, options.requiresAuth === true);
        authz?.requireAdminOr404();
        const created = await appMeta.createTutorialVideo(context.body);
        return ok(created);
      },
      {
        body: createTutorialVideoBodySchema,
        detail: {
          summary: "Create tutorial video (admin only)",
        },
      },
    )
    .get(
      "/app/announcements",
      async (context) => {
        const user = resolveRequestUser(context, options.requiresAuth === true);
        const result = await appMeta.listAnnouncements({
          userId: user.id,
          limit: parseLimit(context.query.limit),
        });
        return ok(result);
      },
      {
        query: appAnnouncementsQuerySchema,
        detail: {
          summary: "List active announcements for current user",
        },
      },
    )
    .post(
      "/app/announcements/:id/read",
      async (context) => {
        const user = resolveRequestUser(context, options.requiresAuth === true);
        const result = await appMeta.markAnnouncementRead({
          userId: user.id,
          announcementId: context.params.id,
        });
        return ok(result);
      },
      {
        params: announcementIdParamsSchema,
        detail: {
          summary: "Mark one announcement as read",
        },
      },
    )
    .post(
      "/app/announcements/:id/claim",
      async (context) => {
        const user = resolveRequestUser(context, options.requiresAuth === true);
        const result = await appMeta.claimAnnouncementReward({
          userId: user.id,
          announcementId: context.params.id,
        });
        return ok(result);
      },
      {
        params: announcementIdParamsSchema,
        detail: {
          summary: "Claim one-time announcement reward for current user",
        },
      },
    )
    .post(
      "/app/announcements/read-all",
      async (context) => {
        const user = resolveRequestUser(context, options.requiresAuth === true);
        const result = await appMeta.markAllAnnouncementsRead({
          userId: user.id,
        });
        return ok(result);
      },
      {
        detail: {
          summary: "Mark all active announcements as read",
        },
      },
    )
    .post(
      "/app/announcements",
      async (context) => {
        const authz = resolveAuthz(context, options.requiresAuth === true);
        authz?.requireAdminOr404();
        const created = await appMeta.createAnnouncement(context.body);
        return ok(created);
      },
      {
        body: createAnnouncementBodySchema,
        detail: {
          summary: "Create announcement (admin only)",
        },
      },
    );
}
