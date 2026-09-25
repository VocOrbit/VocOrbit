import { Reactotron } from "./ReactotronClient"

const reactotron = Reactotron.configure({
  name: require("../../package.json").name,
}).connect()

console.tron = reactotron

declare global {
  interface Console {
    tron: typeof reactotron
  }
}
