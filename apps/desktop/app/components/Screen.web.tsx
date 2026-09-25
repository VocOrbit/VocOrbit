import { ReactNode, useEffect, useRef, useState } from "react"
import {
  KeyboardAvoidingView,
  KeyboardAvoidingViewProps,
  LayoutChangeEvent,
  Platform,
  ScrollView,
  ScrollViewProps,
  StyleProp,
  useWindowDimensions,
  View,
  ViewStyle,
} from "react-native"
import { useScrollToTop } from "@react-navigation/native"

import { useAppTheme } from "@/theme/context"
import { $styles } from "@/theme/styles"
import { resolveTabletContentMaxWidth } from "@/utils/layout"
import { ExtendedEdge, useSafeAreaInsetsStyle } from "@/utils/useSafeAreaInsetsStyle"

export const DEFAULT_BOTTOM_OFFSET = 50

type SystemBarStyle = "light" | "dark" | "auto"
type SystemBarsProps = Record<string, never>

interface BaseScreenProps {
  children?: ReactNode
  style?: StyleProp<ViewStyle>
  contentContainerStyle?: StyleProp<ViewStyle>
  safeAreaEdges?: ExtendedEdge[]
  backgroundColor?: string
  systemBarStyle?: SystemBarStyle
  keyboardOffset?: number
  keyboardBottomOffset?: number
  SystemBarsProps?: SystemBarsProps
  KeyboardAvoidingViewProps?: KeyboardAvoidingViewProps
  scrollToTopOnChangeKey?: string | number
  enableTabletContentConstraint?: boolean
  tabletContentMaxWidth?: number
}

interface FixedScreenProps extends BaseScreenProps {
  preset?: "fixed"
}

interface ScrollScreenProps extends BaseScreenProps {
  preset?: "scroll"
  keyboardShouldPersistTaps?: "handled" | "always" | "never"
  ScrollViewProps?: ScrollViewProps
}

interface AutoScreenProps extends Omit<ScrollScreenProps, "preset"> {
  preset?: "auto"
  scrollEnabledToggleThreshold?: { percent?: number; point?: number }
}

export type ScreenProps = ScrollScreenProps | FixedScreenProps | AutoScreenProps

type ScreenPreset = "fixed" | "scroll" | "auto"
type ScreenInternalProps = ScreenProps & {
  contentConstraintStyle?: StyleProp<ViewStyle>
}

function isNonScrolling(preset?: ScreenPreset) {
  return !preset || preset === "fixed"
}

function useAutoPreset(props: AutoScreenProps): {
  scrollEnabled: boolean
  onContentSizeChange: (w: number, h: number) => void
  onLayout: (e: LayoutChangeEvent) => void
} {
  const { preset, scrollEnabledToggleThreshold } = props
  const { percent = 0.92, point = 0 } = scrollEnabledToggleThreshold || {}

  const scrollViewHeight = useRef<null | number>(null)
  const scrollViewContentHeight = useRef<null | number>(null)
  const [scrollEnabled, setScrollEnabled] = useState(true)

  function updateScrollState() {
    if (scrollViewHeight.current === null || scrollViewContentHeight.current === null) return

    const contentFitsScreen = point
      ? scrollViewContentHeight.current < scrollViewHeight.current - point
      : scrollViewContentHeight.current < scrollViewHeight.current * percent

    if (scrollEnabled && contentFitsScreen) setScrollEnabled(false)
    if (!scrollEnabled && !contentFitsScreen) setScrollEnabled(true)
  }

  function onContentSizeChange(_w: number, h: number) {
    scrollViewContentHeight.current = h
    updateScrollState()
  }

  function onLayout(e: LayoutChangeEvent) {
    scrollViewHeight.current = e.nativeEvent.layout.height
    updateScrollState()
  }

  if (preset === "auto") updateScrollState()

  return {
    scrollEnabled: preset === "auto" ? scrollEnabled : true,
    onContentSizeChange,
    onLayout,
  }
}

function ScreenWithoutScrolling(props: ScreenInternalProps) {
  const { style, contentContainerStyle, children, preset, contentConstraintStyle } = props
  return (
    <View style={[$outerStyle, style]}>
      <View
        style={[
          $innerStyle,
          contentConstraintStyle,
          preset === "fixed" && $justifyFlexEnd,
          contentContainerStyle,
        ]}
      >
        {children}
      </View>
    </View>
  )
}

function ScreenWithScrolling(props: ScreenInternalProps) {
  const {
    children,
    keyboardShouldPersistTaps = "handled",
    scrollToTopOnChangeKey,
    contentContainerStyle,
    ScrollViewProps,
    style,
    contentConstraintStyle,
  } = props as ScreenInternalProps & ScrollScreenProps

  const ref = useRef<ScrollView>(null)
  const { scrollEnabled, onContentSizeChange, onLayout } = useAutoPreset(props as AutoScreenProps)

  useScrollToTop(ref)

  useEffect(() => {
    if (scrollToTopOnChangeKey === undefined) return
    ref.current?.scrollTo({ y: 0, animated: true })
  }, [scrollToTopOnChangeKey])

  return (
    <ScrollView
      {...{ keyboardShouldPersistTaps, scrollEnabled, ref }}
      {...ScrollViewProps}
      onLayout={(e) => {
        onLayout(e)
        ScrollViewProps?.onLayout?.(e)
      }}
      onContentSizeChange={(w, h) => {
        onContentSizeChange(w, h)
        ScrollViewProps?.onContentSizeChange?.(w, h)
      }}
      style={[$outerStyle, ScrollViewProps?.style, style]}
      contentContainerStyle={[
        $innerStyle,
        contentConstraintStyle,
        ScrollViewProps?.contentContainerStyle,
        contentContainerStyle,
      ]}
    >
      {children}
    </ScrollView>
  )
}

export function Screen(props: ScreenProps) {
  const {
    theme: { colors },
  } = useAppTheme()
  const {
    backgroundColor,
    KeyboardAvoidingViewProps,
    keyboardOffset = 0,
    safeAreaEdges,
    style,
    enableTabletContentConstraint = true,
    tabletContentMaxWidth,
  } = props
  const $containerInsets = useSafeAreaInsetsStyle(safeAreaEdges)
  const { width: windowWidth } = useWindowDimensions()
  const constrainedMaxWidth =
    enableTabletContentConstraint === false
      ? undefined
      : tabletContentMaxWidth ?? resolveTabletContentMaxWidth(windowWidth)
  const contentConstraintStyle =
    constrainedMaxWidth !== undefined
      ? ({
          width: "100%",
          maxWidth: constrainedMaxWidth,
          alignSelf: "center",
        } satisfies ViewStyle)
      : undefined

  return (
    <View
      style={[
        $styles.flex1,
        backgroundColor && { backgroundColor },
        $containerInsets,
        style,
      ]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={keyboardOffset}
        style={$styles.flex1}
        {...KeyboardAvoidingViewProps}
      >
        {isNonScrolling(props.preset) ? (
          <ScreenWithoutScrolling {...props} contentConstraintStyle={contentConstraintStyle} />
        ) : (
          <ScreenWithScrolling {...props} contentConstraintStyle={contentConstraintStyle} />
        )}
      </KeyboardAvoidingView>
    </View>
  )
}

const $outerStyle: ViewStyle = {
  flex: 1,
}

const $innerStyle: ViewStyle = {
  flexGrow: 1,
  width: "100%",
}

const $justifyFlexEnd: ViewStyle = {
  justifyContent: "flex-end",
}
