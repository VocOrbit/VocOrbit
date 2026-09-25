import { FC, useEffect } from "react"

import { translate } from "@/i18n/translate"
import type { AppStackScreenProps } from "@/navigators/navigationTypes"
import { hasSelectedHomeRegion, readSelectedHomeRegion } from "@/services/region/homeRegion"

import { LoginView } from "./LoginView"
import { useLoginViewModel } from "./useLoginViewModel"

type LoginScreenProps = AppStackScreenProps<"Login">

export const LoginScreen: FC<LoginScreenProps> = ({ navigation }) => {
  useEffect(() => {
    if (hasSelectedHomeRegion()) return
    navigation.reset({
      index: 0,
      routes: [{ name: "RegionSelection" }],
    })
  }, [navigation])

  const viewModel = useLoginViewModel()
  const selectedRegion = readSelectedHomeRegion()
  const selectedRegionLabel = selectedRegion
    ? `${selectedRegion.emoji} ${selectedRegion.title}`
    : translate("loginScreen:regionNotSelected")

  return (
    <LoginView
      {...viewModel}
      selectedRegionLabel={selectedRegionLabel}
      onOpenRegion={() => navigation.navigate("RegionSelection")}
    />
  )
}
