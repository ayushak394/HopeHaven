import { Metadata } from "next";
import Settings from "./SettingsClient";

export const metadata: Metadata = {
  title: "Settings",
};

export default function Page() {
  return <Settings />;
}
