import type { Metadata } from "next";
import MoodAnalyzer from "./MoodAnalyzer";

export const metadata: Metadata = {
  title: "AI-Insights",
};

export default function Page() {
  return <MoodAnalyzer />;
}