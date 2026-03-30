import { Metadata } from "next";
import Dashboard from "./DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function Page() {
  return <Dashboard />;
}