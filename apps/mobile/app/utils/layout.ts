export const TABLET_WIDTH_BREAKPOINT = 768
export const LARGE_TABLET_WIDTH_BREAKPOINT = 1180

const DEFAULT_TABLET_CONTENT_MAX_WIDTH = 860
const DEFAULT_LARGE_TABLET_CONTENT_MAX_WIDTH = 980
const TABLET_HORIZONTAL_GUTTER = 24
const LARGE_TABLET_HORIZONTAL_GUTTER = 32

type ResolveTabletContentMaxWidthOptions = {
  preferredMaxWidth?: number
}

export function isTabletViewport(viewportWidth: number): boolean {
  return Number.isFinite(viewportWidth) && viewportWidth >= TABLET_WIDTH_BREAKPOINT
}

export function resolveTabletContentMaxWidth(
  viewportWidth: number,
  options: ResolveTabletContentMaxWidthOptions = {},
): number | undefined {
  if (!isTabletViewport(viewportWidth)) return undefined

  const isLargeTablet = viewportWidth >= LARGE_TABLET_WIDTH_BREAKPOINT
  const fallbackMaxWidth = isLargeTablet
    ? DEFAULT_LARGE_TABLET_CONTENT_MAX_WIDTH
    : DEFAULT_TABLET_CONTENT_MAX_WIDTH
  const preferredMaxWidth = options.preferredMaxWidth ?? fallbackMaxWidth
  const gutter = isLargeTablet ? LARGE_TABLET_HORIZONTAL_GUTTER : TABLET_HORIZONTAL_GUTTER
  const viewportConstrainedMaxWidth = Math.max(0, viewportWidth - gutter * 2)

  return Math.max(0, Math.min(preferredMaxWidth, viewportConstrainedMaxWidth))
}

export function resolveConstrainedContentWidth(
  viewportWidth: number,
  options: ResolveTabletContentMaxWidthOptions = {},
): number {
  return resolveTabletContentMaxWidth(viewportWidth, options) ?? viewportWidth
}
