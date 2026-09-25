import type { AppBootstrap, AppPlatform, AppUpdateStatus } from "../domain/app-meta";
import type { AppMetaRepo } from "../ports/app-meta-repo";

export type AppUpdatePolicy = {
  minimumSupportedVersion?: string;
  latestVersion?: string;
  storeUrl?: string;
};

export type AppBootstrapConfig = {
  ios: AppUpdatePolicy;
  android: AppUpdatePolicy;
  updateTitle?: string;
  updateMessage?: string;
};

function normalizeVersion(value: string | undefined): number[] {
  if (!value) return [];
  const normalized = value.trim();
  if (!normalized) return [];
  const mainPart = normalized.split("-")[0]?.split("+")[0]?.trim() ?? "";
  if (!mainPart) return [];
  const parts = mainPart.split(".");
  const numbers: number[] = [];
  for (const part of parts) {
    const numeric = Number.parseInt(part.replace(/[^0-9]/g, ""), 10);
    if (!Number.isFinite(numeric)) {
      numbers.push(0);
      continue;
    }
    numbers.push(Math.max(0, numeric));
  }
  return numbers;
}

function compareVersions(a: string | undefined, b: string | undefined): number {
  const partsA = normalizeVersion(a);
  const partsB = normalizeVersion(b);
  const maxLength = Math.max(partsA.length, partsB.length);
  for (let i = 0; i < maxLength; i += 1) {
    const va = partsA[i] ?? 0;
    const vb = partsB[i] ?? 0;
    if (va > vb) return 1;
    if (va < vb) return -1;
  }
  return 0;
}

function resolveUpdateStatus(input: {
  currentVersion?: string;
  minimumSupportedVersion?: string;
  latestVersion?: string;
}): AppUpdateStatus {
  const { currentVersion, minimumSupportedVersion, latestVersion } = input;
  if (!currentVersion) return "none";
  if (minimumSupportedVersion && compareVersions(currentVersion, minimumSupportedVersion) < 0) {
    return "required";
  }
  if (latestVersion && compareVersions(currentVersion, latestVersion) < 0) {
    return "recommended";
  }
  return "none";
}

export async function getBootstrap(
  repo: AppMetaRepo,
  config: AppBootstrapConfig,
  input: {
    userId: string;
    platform: AppPlatform;
    appVersion?: string;
  },
): Promise<AppBootstrap> {
  const summary = await repo.getAnnouncementsSummary(input.userId);
  const policy = input.platform === "android" ? config.android : config.ios;
  const updateStatus = resolveUpdateStatus({
    currentVersion: input.appVersion,
    minimumSupportedVersion: policy.minimumSupportedVersion,
    latestVersion: policy.latestVersion,
  });

  return {
    serverTime: new Date().toISOString(),
    update: {
      platform: input.platform,
      currentVersion: input.appVersion,
      latestVersion: policy.latestVersion,
      minimumSupportedVersion: policy.minimumSupportedVersion,
      status: updateStatus,
      title: updateStatus === "none" ? undefined : config.updateTitle,
      message: updateStatus === "none" ? undefined : config.updateMessage,
      storeUrl: updateStatus === "none" ? undefined : policy.storeUrl,
    },
    announcements: summary,
  };
}
