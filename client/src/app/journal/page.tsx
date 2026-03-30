import type { Metadata } from "next";
import JournalClient from "./JournalClient";

export const metadata: Metadata = {
  title: "Journal",
};

export default function Page() {
  return <JournalClient />;
}