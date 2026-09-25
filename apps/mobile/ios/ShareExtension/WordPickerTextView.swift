import SwiftUI
import UIKit

struct WordPickerTextView: UIViewRepresentable {
  @Binding var text: String
  @Binding var selectedWord: String
  var textColor: UIColor = .label
  var underlineColor: UIColor = UIColor.systemBlue.withAlphaComponent(0.18)
  var highlightColor: UIColor = UIColor.systemBlue.withAlphaComponent(0.24)

  func makeUIView(context: Context) -> UITextView {
    let textView = UITextView()
    textView.isEditable = false
    textView.isSelectable = false
    textView.isScrollEnabled = true
    textView.backgroundColor = .clear
    textView.font = UIFont.preferredFont(forTextStyle: .body)
    textView.textColor = textColor
    textView.textContainerInset = UIEdgeInsets(top: 12, left: 10, bottom: 12, right: 10)
    textView.textContainer.lineFragmentPadding = 4
    textView.dataDetectorTypes = []
    textView.accessibilityHint = "Tap any word to select it"

    let tapGesture = UITapGestureRecognizer(target: context.coordinator, action: #selector(Coordinator.handleTap(_:)))
    textView.addGestureRecognizer(tapGesture)

    return textView
  }

  func updateUIView(_ uiView: UITextView, context: Context) {
    context.coordinator.parent = self
    uiView.textColor = textColor
    let styleChanged = context.coordinator.applyStyle(
      textColor: textColor,
      underlineColor: underlineColor,
      highlightColor: highlightColor,
    )

    let normalizedSelectedWord = selectedWord.trimmingCharacters(in: .whitespacesAndNewlines)

    if context.coordinator.currentText != text {
      context.coordinator.currentText = text
      context.coordinator.selectedRange = nil
    }

    if normalizedSelectedWord.isEmpty {
      if styleChanged || context.coordinator.selectedRange != nil || uiView.attributedText.length == 0 {
        uiView.attributedText = context.coordinator.attributedText(for: text, highlight: nil)
      }
      context.coordinator.selectedRange = nil
      return
    }

    if let matchedRange = context.coordinator.firstMatchRange(in: text, for: normalizedSelectedWord),
      context.coordinator.selectedRange != matchedRange
    {
      context.coordinator.selectedRange = matchedRange
      uiView.attributedText = context.coordinator.attributedText(for: text, highlight: matchedRange)
      return
    }

    if styleChanged || context.coordinator.selectedRange == nil {
      uiView.attributedText = context.coordinator.attributedText(for: text, highlight: nil)
    }
  }

  func makeCoordinator() -> Coordinator {
    Coordinator(
      parent: self,
      textColor: textColor,
      underlineColor: underlineColor,
      highlightColor: highlightColor,
    )
  }

  final class Coordinator: NSObject {
    var parent: WordPickerTextView
    var selectedRange: NSRange?
    var currentText = ""
    var textColor: UIColor
    var underlineColor: UIColor
    var highlightColor: UIColor

    init(
      parent: WordPickerTextView,
      textColor: UIColor,
      underlineColor: UIColor,
      highlightColor: UIColor,
    ) {
      self.parent = parent
      self.textColor = textColor
      self.underlineColor = underlineColor
      self.highlightColor = highlightColor
    }

    func applyStyle(textColor: UIColor, underlineColor: UIColor, highlightColor: UIColor) -> Bool {
      let didChange =
        !self.textColor.isEqual(textColor) ||
        !self.underlineColor.isEqual(underlineColor) ||
        !self.highlightColor.isEqual(highlightColor)

      self.textColor = textColor
      self.underlineColor = underlineColor
      self.highlightColor = highlightColor
      return didChange
    }

    @objc func handleTap(_ gesture: UITapGestureRecognizer) {
      guard let textView = gesture.view as? UITextView else { return }
      let location = gesture.location(in: textView)
      let index = textView.layoutManager.characterIndex(
        for: location,
        in: textView.textContainer,
        fractionOfDistanceBetweenInsertionPoints: nil,
      )

      guard index < textView.text.count else { return }
      let nsText = textView.text as NSString
      guard let range = selectableWordRange(in: nsText, around: index) else { return }

      let word = nsText.substring(with: range)
      parent.selectedWord = word
      selectedRange = range
      textView.attributedText = attributedText(for: textView.text, highlight: range)
      UISelectionFeedbackGenerator().selectionChanged()
    }

    func attributedText(for text: String, highlight: NSRange?) -> NSAttributedString {
      let paragraphStyle = NSMutableParagraphStyle()
      paragraphStyle.lineSpacing = 4
      paragraphStyle.paragraphSpacing = 4

      let attrs: [NSAttributedString.Key: Any] = [
        .font: UIFont.preferredFont(forTextStyle: .body),
        .foregroundColor: textColor,
        .paragraphStyle: paragraphStyle,
      ]
      let result = NSMutableAttributedString(string: text, attributes: attrs)

      let nsText = text as NSString
      for range in selectableWordRanges(in: text) {
        guard range.location != NSNotFound, NSMaxRange(range) <= nsText.length else { continue }
        result.addAttribute(
          .underlineStyle,
          value: NSUnderlineStyle.single.rawValue,
          range: range,
        )
        result.addAttribute(
          .underlineColor,
          value: underlineColor,
          range: range,
        )
      }

      if let highlight {
        let highlightedFont = UIFontMetrics(forTextStyle: .body).scaledFont(
          for: UIFont.systemFont(ofSize: UIFont.preferredFont(forTextStyle: .body).pointSize, weight: .semibold),
        )
        result.addAttribute(
          .backgroundColor,
          value: highlightColor,
          range: highlight,
        )
        result.addAttribute(.font, value: highlightedFont, range: highlight)
      }
      return result
    }

    func firstMatchRange(in text: String, for word: String) -> NSRange? {
      let nsText = text as NSString
      let escapedWord = NSRegularExpression.escapedPattern(for: word)
      guard let regex = try? NSRegularExpression(
        pattern: "\\b\(escapedWord)\\b",
        options: [.caseInsensitive],
      ) else { return nil }
      return regex.firstMatch(in: text, options: [], range: NSRange(location: 0, length: nsText.length))?.range
    }

    private func selectableWordRanges(in text: String) -> [NSRange] {
      let nsText = text as NSString
      guard let regex = try? NSRegularExpression(
        pattern: "\\b[\\p{L}\\p{N}][\\p{L}\\p{N}'’-]*\\b",
        options: [],
      ) else { return [] }
      return regex.matches(in: text, options: [], range: NSRange(location: 0, length: nsText.length)).map(\.range)
    }

    private func selectableWordRange(in text: NSString, around rawIndex: Int, maxOffset: Int = 6) -> NSRange? {
      let length = text.length
      guard length > 0 else { return nil }
      let index = min(max(rawIndex, 0), max(0, length - 1))

      if isAlphaNumeric(text.character(at: index)) {
        let range = wordRange(in: text, at: index)
        if range.location != NSNotFound, range.length > 0 {
          return range
        }
      }

      for offset in 1...maxOffset {
        let left = index - offset
        if left >= 0, isAlphaNumeric(text.character(at: left)) {
          let range = wordRange(in: text, at: left)
          if range.location != NSNotFound, range.length > 0 {
            return range
          }
        }

        let right = index + offset
        if right < length, isAlphaNumeric(text.character(at: right)) {
          let range = wordRange(in: text, at: right)
          if range.location != NSNotFound, range.length > 0 {
            return range
          }
        }
      }

      return nil
    }

    private func wordRange(in text: NSString, at index: Int) -> NSRange {
      let length = text.length
      guard length > 0, index < length else { return NSRange(location: NSNotFound, length: 0) }

      var start = index
      var end = index

      while start > 0 && isAlphaNumeric(text.character(at: start - 1)) {
        start -= 1
      }
      while end < length && isAlphaNumeric(text.character(at: end)) {
        end += 1
      }

      return NSRange(location: start, length: end - start)
    }

    private func isAlphaNumeric(_ value: unichar) -> Bool {
      guard let scalar = UnicodeScalar(value) else { return false }
      return CharacterSet.alphanumerics.contains(scalar)
    }
  }
}
