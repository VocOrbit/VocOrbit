import { isUsablePhonetic, resolveDisplayPhonetic } from "./phonetic"

describe("phonetic utils", () => {
  it("keeps valid IPA values", () => {
    expect(resolveDisplayPhonetic("/ˈplɑːstər/", "plaster")).toBe("/ˈplɑːstər/")
    expect(resolveDisplayPhonetic(" /ˌkɑːmpənˈseɪʃən/ ")).toBe("/ˌkɑːmpənˈseɪʃən/")
  })

  it("rejects empty slash-only phonetic values", () => {
    expect(isUsablePhonetic("/")).toBe(false)
    expect(isUsablePhonetic("//")).toBe(false)
    expect(resolveDisplayPhonetic("/", "plaster")).toBe("/plaster/")
  })

  it("falls back to a dash when there is no word fallback", () => {
    expect(resolveDisplayPhonetic("/")).toBe("-")
    expect(resolveDisplayPhonetic(undefined)).toBe("-")
  })
})
