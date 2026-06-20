import { Stack } from "expo-router";

export default function RootLayout() {
  return (
  <Stack screenOptions={{ animation: "slide_from_left" }} />
  //<Stack screenOptions={{ headerShown: false }} />
);
}
