import { Linking } from "react-native"

import { normalizeOpenableUrl, openLinkInBrowser } from "./openLinkInBrowser"

describe("normalizeOpenableUrl", () => {
  it("adds https to web urls without a scheme", () => {
    expect(normalizeOpenableUrl("www.youtube.com/watch?v=test")).toBe(
      "https://www.youtube.com/watch?v=test",
    )
    expect(normalizeOpenableUrl("youtu.be/test")).toBe("https://youtu.be/test")
  })

  it("keeps existing schemes intact", () => {
    expect(normalizeOpenableUrl("https://youtube.com/watch?v=test")).toBe(
      "https://youtube.com/watch?v=test",
    )
    expect(normalizeOpenableUrl("vocorbit://announcement/test")).toBe(
      "vocorbit://announcement/test",
    )
  })
})

describe("openLinkInBrowser", () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it("opens normalized web urls without checking canOpenURL first", async () => {
    const openURLSpy = jest.spyOn(Linking, "openURL").mockResolvedValue(undefined)
    const canOpenURLSpy = jest.spyOn(Linking, "canOpenURL").mockResolvedValue(true)

    await expect(openLinkInBrowser("youtu.be/test")).resolves.toBe(true)

    expect(openURLSpy).toHaveBeenCalledWith("https://youtu.be/test")
    expect(canOpenURLSpy).not.toHaveBeenCalled()
  })

  it("checks canOpenURL for custom schemes", async () => {
    const openURLSpy = jest.spyOn(Linking, "openURL").mockResolvedValue(undefined)
    const canOpenURLSpy = jest.spyOn(Linking, "canOpenURL").mockResolvedValue(true)

    await expect(openLinkInBrowser("vocorbit://announcement/test")).resolves.toBe(true)

    expect(canOpenURLSpy).toHaveBeenCalledWith("vocorbit://announcement/test")
    expect(openURLSpy).toHaveBeenCalledWith("vocorbit://announcement/test")
  })
})
