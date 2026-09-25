import SwiftUI
import UIKit

struct ShareRootView: View {
  @ObservedObject var viewModel: ShareViewModel
  let onClose: () -> Void
  let onOpenIapSettings: () -> Void
  @Environment(\.colorScheme) private var colorScheme

  private var theme: ShareTheme {
    ShareTheme.forScheme(colorScheme)
  }

  var body: some View {
    ZStack {
      LinearGradient(
        colors: [theme.gradientTopColor, theme.gradientBottomColor],
        startPoint: .topLeading,
        endPoint: .bottomTrailing,
      )
      .ignoresSafeArea()

      ScrollView(showsIndicators: false) {
        VStack(alignment: .leading, spacing: 14) {
          header
          pickWordStepCard
          basicMeaningStepCard
          if viewModel.shouldShowRequestDebug {
            requestDebugCard
          }
        }
        .padding(16)
        .background(
          RoundedRectangle(cornerRadius: 24, style: .continuous)
            .fill(theme.containerColor)
            .overlay(
              RoundedRectangle(cornerRadius: 24, style: .continuous)
                .stroke(theme.outlineColor, lineWidth: 1),
            )
        )
        .padding(16)
      }
    }
    .tint(theme.accentColor)
  }

  private var header: some View {
    HStack(alignment: .center, spacing: 10) {
      BrandMark(theme: theme)

      Text("VocOrbit")
        .font(.title2.bold())
        .foregroundStyle(theme.textStrongColor)

      Spacer(minLength: 8)

      Button(action: onClose) {
        Image(systemName: "xmark")
          .font(.system(size: 14, weight: .bold))
          .foregroundStyle(theme.textStrongColor)
          .frame(width: 32, height: 32)
          .background(Circle().fill(theme.closeButtonFillColor))
      }
      .buttonStyle(.plain)
    }
  }

  private var pickWordStepCard: some View {
    CardView {
      VStack(alignment: .leading, spacing: 12) {
        Text("1. Choose a word")
          .font(.headline)
          .foregroundStyle(theme.textStrongColor)

        if viewModel.paragraph.isEmpty {
          Text("No text found. Share a paragraph or sentence to start.")
            .font(.subheadline)
            .foregroundStyle(theme.textMutedColor)
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.vertical, 4)
        } else {
          contextSelectionPanel
        }

        Button {
          viewModel.fetchBasicInsight()
        } label: {
          Group {
            if viewModel.isLoading {
              HStack(spacing: 8) {
                ProgressView()
                  .progressViewStyle(.circular)
                Text("Getting meaning...")
                  .foregroundStyle(theme.accentTextColor)
              }
              .frame(maxWidth: .infinity)
            } else {
              Label(viewModel.primaryActionTitle(), systemImage: "sparkles")
                .frame(maxWidth: .infinity)
            }
          }
        }
        .buttonStyle(
          SharePrimaryButtonStyle(
            theme: theme,
            isEnabled: viewModel.canFetchInsight && !viewModel.isLoading,
          ),
        )
        .disabled(!viewModel.canFetchInsight)
      }
    }
  }

  private var selectedWordRow: some View {
    HStack(spacing: 8) {
      if viewModel.selectedWord.isEmpty {
        Label("Tap any word. Tapping near a word also selects it.", systemImage: "hand.tap")
          .font(.caption)
          .foregroundStyle(theme.textMutedColor)
      } else {
        Text("Selected:")
          .font(.caption)
          .foregroundStyle(theme.textMutedColor)
        WordChip(text: viewModel.selectedWord)
      }

      Spacer(minLength: 8)

      if !viewModel.selectedWord.isEmpty {
        Button("Clear") {
          viewModel.clearSelection()
        }
        .font(.caption.weight(.medium))
        .foregroundStyle(theme.linkColor)
      }
    }
  }

  private var contextSelectionPanel: some View {
    VStack(alignment: .leading, spacing: 10) {
      HStack(spacing: 8) {
        Text("Context")
          .font(.caption.weight(.medium))
          .foregroundStyle(theme.textMutedColor)

        Spacer(minLength: 8)

        Label("Tap words", systemImage: "hand.tap")
          .font(.caption2.weight(.semibold))
          .foregroundStyle(theme.linkColor)
          .padding(.horizontal, 8)
          .padding(.vertical, 4)
          .background(
            Capsule()
              .fill(theme.accentSoftColor)
          )
      }

      WordPickerTextView(
        text: $viewModel.paragraph,
        selectedWord: $viewModel.selectedWord,
        textColor: theme.textStrong,
        underlineColor: theme.accent.withAlphaComponent(0.28),
        highlightColor: theme.accent.withAlphaComponent(0.24),
      )
        .frame(minHeight: 138, maxHeight: 210)
        .background(
          RoundedRectangle(cornerRadius: 10, style: .continuous)
            .fill(theme.inputColor)
        )
        .overlay(
          RoundedRectangle(cornerRadius: 10, style: .continuous)
            .stroke(
              viewModel.selectedWord.isEmpty ? theme.outlineColor : theme.accentColor,
              lineWidth: viewModel.selectedWord.isEmpty ? 1 : 2
            )
        )

      selectedWordRow
    }
    .padding(10)
    .background(
      RoundedRectangle(cornerRadius: 10, style: .continuous)
        .fill(theme.panelColor)
    )
  }

  @ViewBuilder
  private var basicMeaningStepCard: some View {
    switch viewModel.insightState {
    case .loading:
      CardView {
        VStack(alignment: .leading, spacing: 10) {
          HStack {
            Text("2. Basic meaning")
              .font(.headline)
              .foregroundStyle(theme.textStrongColor)
            Spacer()
            ProgressView()
          }

          Text("Looking up the best meaning in this exact context...")
            .font(.subheadline)
            .foregroundStyle(theme.textMutedColor)
        }
      }

    case .failure:
      CardView {
        VStack(alignment: .leading, spacing: 10) {
          Text("2. Basic meaning")
            .font(.headline)
            .foregroundStyle(theme.textStrongColor)

          if viewModel.requiresSignIn {
            Text("Sign in required")
              .font(.subheadline.weight(.semibold))
              .foregroundStyle(theme.textStrongColor)

            Text("Please open the VocOrbit app manually, sign in, then return and try sharing again.")
              .font(.subheadline)
              .foregroundStyle(theme.textMutedColor)
          } else if viewModel.hasInsufficientCredits {
            Text("Insufficient basic credits")
              .font(.subheadline.weight(.semibold))
              .foregroundStyle(theme.textStrongColor)

            Text("You are out of basic credits. Open app settings to continue with an IAP plan.")
              .font(.subheadline)
              .foregroundStyle(theme.textMutedColor)

            Button("Open app settings") {
              onOpenIapSettings()
            }
            .buttonStyle(.borderedProminent)
          } else {
            Text(viewModel.errorMessage ?? "Request failed.")
              .font(.subheadline)
              .foregroundStyle(theme.textMutedColor)

            Button("Retry") {
              viewModel.retry()
            }
            .buttonStyle(.bordered)
          }
        }
      }

    case .success:
      if let insight = viewModel.insight {
        CardView {
          VStack(alignment: .leading, spacing: 10) {
            Text("2. Basic meaning")
              .font(.headline)
              .foregroundStyle(theme.textStrongColor)

            HStack(spacing: 8) {
              WordChip(text: insight.word)
              if !insight.partOfSpeech.isEmpty {
                StatusBadge(text: insight.partOfSpeech)
              }
            }

            Text(viewModel.basicMeaningText())
              .font(.title3.weight(.semibold))
              .foregroundStyle(theme.textStrongColor)

            if let contextSense = viewModel.contextMeaningText(), !contextSense.isEmpty {
              Text("Meaning in context")
                .font(.caption.weight(.medium))
                .foregroundStyle(theme.textMutedColor)

              Text(contextSense)
                .font(.subheadline)
                .foregroundStyle(theme.textMutedColor)
            }

            if let whyUsed = viewModel.whyUsedText(), !whyUsed.isEmpty {
              Divider()

              Text("Why this word here")
                .font(.caption.weight(.medium))
                .foregroundStyle(theme.textMutedColor)

              Text(whyUsed)
                .font(.subheadline)
                .foregroundStyle(theme.textStrongColor)
            }
          }
        }
      }

    case .idle:
      CardView {
        VStack(alignment: .leading, spacing: 10) {
          Text("2. Basic meaning")
            .font(.headline)
            .foregroundStyle(theme.textStrongColor)

          Text("After you pick a word and tap the button, its quick meaning appears here.")
            .font(.subheadline)
            .foregroundStyle(theme.textMutedColor)
        }
      }
    }
  }

  private var requestDebugCard: some View {
    CardView {
      VStack(alignment: .leading, spacing: 8) {
        Text("Debug request destination")
          .font(.caption.weight(.semibold))
          .foregroundStyle(theme.textMutedColor)

        Text(viewModel.requestDebugText)
          .font(.system(.caption2, design: .monospaced))
          .foregroundStyle(theme.textMutedColor)
          .textSelection(.enabled)
      }
    }
  }

}

struct CardView<Content: View>: View {
  let content: Content
  @Environment(\.colorScheme) private var colorScheme

  private var theme: ShareTheme {
    ShareTheme.forScheme(colorScheme)
  }

  init(@ViewBuilder content: () -> Content) {
    self.content = content()
  }

  var body: some View {
    content
      .padding(12)
      .background(
        RoundedRectangle(cornerRadius: 12, style: .continuous)
          .fill(theme.cardColor)
          .overlay(
            RoundedRectangle(cornerRadius: 12, style: .continuous)
              .stroke(theme.outlineColor, lineWidth: 1),
          )
          .shadow(color: theme.shadowColor, radius: colorScheme == .dark ? 10 : 6, x: 0, y: 2)
      )
  }
}

struct StatusBadge: View {
  let text: String
  @Environment(\.colorScheme) private var colorScheme

  private var theme: ShareTheme {
    ShareTheme.forScheme(colorScheme)
  }

  var body: some View {
    Text(text)
      .font(.caption)
      .foregroundStyle(theme.textMutedColor)
      .lineLimit(1)
      .truncationMode(.tail)
      .padding(.horizontal, 8)
      .padding(.vertical, 4)
      .background(Capsule().fill(theme.panelColor))
  }
}

struct WordChip: View {
  let text: String
  @Environment(\.colorScheme) private var colorScheme

  private var theme: ShareTheme {
    ShareTheme.forScheme(colorScheme)
  }

  var body: some View {
    Text(text)
      .font(.subheadline.weight(.semibold))
      .foregroundStyle(theme.textStrongColor)
      .padding(.horizontal, 12)
      .padding(.vertical, 6)
      .background(Capsule().fill(theme.accentSoftColor))
  }
}

private struct BrandMark: View {
  let theme: ShareTheme

  var body: some View {
    Group {
      if let logo = UIImage(named: "app-icon-ios") {
        Image(uiImage: logo)
          .resizable()
          .scaledToFill()
      } else {
        ZStack {
          Circle()
            .fill(theme.accentColor)
          Circle()
            .stroke(theme.accentPressedColor.opacity(0.42), lineWidth: 2)
            .padding(3)
          Image(systemName: "sparkles")
            .font(.system(size: 11, weight: .semibold))
            .foregroundStyle(theme.accentTextColor)
        }
      }
    }
    .frame(width: 28, height: 28)
    .clipShape(Circle())
    .overlay(Circle().stroke(theme.outlineColor, lineWidth: 1))
  }
}

private struct SharePrimaryButtonStyle: ButtonStyle {
  let theme: ShareTheme
  let isEnabled: Bool

  func makeBody(configuration: Configuration) -> some View {
    configuration.label
      .font(.headline)
      .foregroundStyle(theme.accentTextColor.opacity(isEnabled ? 1 : 0.64))
      .padding(.vertical, 12)
      .padding(.horizontal, 14)
      .background(
        Capsule()
          .fill(
            isEnabled
              ? (configuration.isPressed ? theme.accentPressedColor : theme.accentColor)
              : theme.accentColor.opacity(0.5),
          )
      )
      .overlay(
        Capsule()
          .stroke(theme.outlineColor.opacity(isEnabled ? 0.7 : 0.25), lineWidth: 1),
      )
      .animation(.easeOut(duration: 0.14), value: configuration.isPressed)
  }
}

private struct ShareTheme {
  let gradientTop: UIColor
  let gradientBottom: UIColor
  let container: UIColor
  let card: UIColor
  let panel: UIColor
  let input: UIColor
  let textStrong: UIColor
  let textMuted: UIColor
  let accent: UIColor
  let accentPressed: UIColor
  let accentText: UIColor
  let accentSoft: UIColor
  let outline: UIColor
  let closeButtonFill: UIColor
  let shadow: UIColor
  let link: UIColor

  var gradientTopColor: Color { Color(uiColor: gradientTop) }
  var gradientBottomColor: Color { Color(uiColor: gradientBottom) }
  var containerColor: Color { Color(uiColor: container) }
  var cardColor: Color { Color(uiColor: card) }
  var panelColor: Color { Color(uiColor: panel) }
  var inputColor: Color { Color(uiColor: input) }
  var textStrongColor: Color { Color(uiColor: textStrong) }
  var textMutedColor: Color { Color(uiColor: textMuted) }
  var accentColor: Color { Color(uiColor: accent) }
  var accentPressedColor: Color { Color(uiColor: accentPressed) }
  var accentTextColor: Color { Color(uiColor: accentText) }
  var accentSoftColor: Color { Color(uiColor: accentSoft) }
  var outlineColor: Color { Color(uiColor: outline) }
  var closeButtonFillColor: Color { Color(uiColor: closeButtonFill) }
  var shadowColor: Color { Color(uiColor: shadow) }
  var linkColor: Color { Color(uiColor: link) }

  static func forScheme(_ colorScheme: ColorScheme) -> ShareTheme {
    if colorScheme == .dark {
      return ShareTheme(
        gradientTop: UIColor(hex: "141918"),
        gradientBottom: UIColor(hex: "1C2321"),
        container: UIColor(hex: "1C2321"),
        card: UIColor(hex: "171D1C"),
        panel: UIColor(hex: "24302D"),
        input: UIColor(hex: "1C2321"),
        textStrong: UIColor(hex: "EEF1EC"),
        textMuted: UIColor(hex: "BAC5BC"),
        accent: UIColor(hex: "A8C5AB"),
        accentPressed: UIColor(hex: "90B095"),
        accentText: UIColor(hex: "18201E"),
        accentSoft: UIColor(hex: "2B3533"),
        outline: UIColor(hex: "E7E5D0", alpha: 0.18),
        closeButtonFill: UIColor(hex: "24302D"),
        shadow: UIColor(hex: "000000", alpha: 0.42),
        link: UIColor(hex: "A8C5AB"),
      )
    }

    return ShareTheme(
      gradientTop: UIColor(hex: "F3F3F1"),
      gradientBottom: UIColor(hex: "ECEFE9"),
      container: UIColor(hex: "FBFBF9"),
      card: UIColor(hex: "ECEFE9"),
      panel: UIColor(hex: "E1E4DC"),
      input: UIColor(hex: "FBFBF9"),
      textStrong: UIColor(hex: "252A29"),
      textMuted: UIColor(hex: "6D7773"),
      accent: UIColor(hex: "90B095"),
      accentPressed: UIColor(hex: "789A81"),
      accentText: UIColor(hex: "1E2321"),
      accentSoft: UIColor(hex: "E2EEE4"),
      outline: UIColor(hex: "46504D", alpha: 0.14),
      closeButtonFill: UIColor(hex: "E1E4DC"),
      shadow: UIColor(hex: "252A29", alpha: 0.12),
      link: UIColor(hex: "789A81"),
    )
  }
}

private extension UIColor {
  convenience init(hex: String, alpha: CGFloat = 1.0) {
    var normalized = hex.trimmingCharacters(in: .whitespacesAndNewlines).uppercased()
    if normalized.hasPrefix("#") {
      normalized.removeFirst()
    }
    if normalized.count == 3 {
      normalized = normalized.map { "\($0)\($0)" }.joined()
    }
    if normalized.count != 6 {
      self.init(white: 0.5, alpha: alpha)
      return
    }

    var rgbValue: UInt64 = 0
    Scanner(string: normalized).scanHexInt64(&rgbValue)

    self.init(
      red: CGFloat((rgbValue & 0xFF0000) >> 16) / 255,
      green: CGFloat((rgbValue & 0x00FF00) >> 8) / 255,
      blue: CGFloat(rgbValue & 0x0000FF) / 255,
      alpha: alpha,
    )
  }
}
