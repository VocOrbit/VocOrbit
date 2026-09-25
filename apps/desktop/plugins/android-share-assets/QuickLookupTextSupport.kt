package com.vocorbit

import java.util.Locale

data class QuickLookupWordMatch(
  val label: String,
  val normalized: String,
  val start: Int,
  val end: Int,
)

object QuickLookupTextSupport {
  private val wordRegex = Regex("\\b[\\p{L}\\p{N}][\\p{L}\\p{N}'’-]*\\b")

  fun normalizeText(value: String?): String {
    return value
      ?.replace("\\s+".toRegex(), " ")
      ?.trim()
      .orEmpty()
  }

  fun normalizeSelectedWord(value: String?): String? {
    return value
      ?.trim()
      ?.lowercase(Locale.US)
      ?.takeIf { normalized -> normalized.isNotEmpty() }
  }

  fun extractWordMatches(text: String): List<QuickLookupWordMatch> {
    val normalizedText = normalizeText(text)
    if (normalizedText.isEmpty()) return emptyList()

    return wordRegex.findAll(normalizedText).map { match ->
      QuickLookupWordMatch(
        label = match.value,
        normalized = match.value.lowercase(Locale.US),
        start = match.range.first,
        end = match.range.last + 1,
      )
    }.toList()
  }

  fun extractUniqueWords(text: String, limit: Int): List<QuickLookupWordMatch> {
    if (limit <= 0) return emptyList()

    val words = mutableListOf<QuickLookupWordMatch>()
    val seen = mutableSetOf<String>()
    for (match in extractWordMatches(text)) {
      if (!seen.add(match.normalized)) continue
      words.add(match)
      if (words.size >= limit) break
    }
    return words
  }

  fun buildContextSnippet(
    text: String,
    selectedWord: String,
    maxLength: Int,
  ): String {
    val normalizedText = normalizeText(text)
    if (normalizedText.length <= maxLength) return normalizedText

    val match = Regex(Regex.escape(selectedWord), RegexOption.IGNORE_CASE).find(normalizedText)
    if (match == null) {
      return normalizedText.take(maxLength).trim().let { snippet ->
        if (snippet.length == normalizedText.length) snippet else "$snippet..."
      }
    }

    val center = match.range.first + ((match.range.last - match.range.first) / 2)
    var start = center - (maxLength / 2)
    if (start < 0) start = 0

    var end = start + maxLength
    if (end > normalizedText.length) {
      end = normalizedText.length
      start = (end - maxLength).coerceAtLeast(0)
    }

    val snippet = normalizedText.substring(start, end).trim()
    val prefix = if (start > 0) "..." else ""
    val suffix = if (end < normalizedText.length) "..." else ""
    return "$prefix$snippet$suffix"
  }
}
