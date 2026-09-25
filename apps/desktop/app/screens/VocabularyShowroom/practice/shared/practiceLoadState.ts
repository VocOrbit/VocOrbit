import { translate } from "@/i18n/translate"
import type { GeneralApiProblem } from "@/services/api/apiProblem"

export type PracticeLoadAction = "retry" | "login" | "iap" | "showroom"

export type PracticeLoadUiState = {
  title: string
  message: string
  action: PracticeLoadAction
  actionLabel: string
}

export function resolvePracticeLoadUiState(problem?: GeneralApiProblem): PracticeLoadUiState {
  if (!problem) {
    return {
      title: translate("vocabulary:practiceHub.loadState.noQuestions.title"),
      message: translate("vocabulary:practiceHub.loadState.noQuestions.message"),
      action: "showroom",
      actionLabel: translate("vocabulary:practiceHub.loadState.noQuestions.actionLabel"),
    }
  }

  if (problem.kind === "unauthorized") {
    return {
      title: translate("vocabulary:practiceHub.loadState.unauthorized.title"),
      message: translate("vocabulary:practiceHub.loadState.unauthorized.message"),
      action: "login",
      actionLabel: translate("vocabulary:practiceHub.loadState.unauthorized.actionLabel"),
    }
  }

  if (problem.kind === "forbidden") {
    return {
      title: translate("vocabulary:practiceHub.loadState.forbidden.title"),
      message: translate("vocabulary:practiceHub.loadState.forbidden.message"),
      action: "iap",
      actionLabel: translate("vocabulary:practiceHub.loadState.forbidden.actionLabel"),
    }
  }

  if (problem.kind === "rejected") {
    return {
      title: translate("vocabulary:practiceHub.loadState.rejected.title"),
      message: translate("vocabulary:practiceHub.loadState.rejected.message"),
      action: "showroom",
      actionLabel: translate("vocabulary:practiceHub.loadState.rejected.actionLabel"),
    }
  }

  if (
    problem.kind === "cannot-connect" ||
    problem.kind === "timeout" ||
    problem.kind === "server" ||
    problem.kind === "unknown"
  ) {
    return {
      title: translate("vocabulary:practiceHub.loadState.server.title"),
      message: translate("vocabulary:practiceHub.loadState.server.message"),
      action: "retry",
      actionLabel: translate("vocabulary:practiceHub.loadState.server.actionLabel"),
    }
  }

  return {
    title: translate("vocabulary:practiceHub.loadState.generic.title"),
    message: translate("vocabulary:practiceHub.loadState.generic.message"),
    action: "retry",
    actionLabel: translate("vocabulary:practiceHub.loadState.generic.actionLabel"),
  }
}
