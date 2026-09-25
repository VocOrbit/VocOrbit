import { Elysia } from "elysia";
import type { WordInsightPublicContract } from "../public-contract";
import { createWordInsightExplainRoutes } from "./explain-routes";
import { createWordInsightJobRoutes } from "./job-routes";
import { createWordInsightLearningItemGroupRoutes } from "./learning-item-group-routes";
import { createWordInsightLearningItemRoutes } from "./learning-item-routes";
import type { WordInsightRouteOptions } from "./route-shared";

export function createWordInsightRoutes(
  wordInsight: WordInsightPublicContract,
  options: WordInsightRouteOptions = {},
) {
  return new Elysia({
    name: "word-insight-routes",
  })
    .use(createWordInsightJobRoutes(wordInsight, options))
    .use(createWordInsightLearningItemGroupRoutes(wordInsight, options))
    .use(createWordInsightLearningItemRoutes(wordInsight, options))
    .use(createWordInsightExplainRoutes(wordInsight, options));
}
