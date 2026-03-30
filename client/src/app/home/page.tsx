import { Metadata } from "next";
import Home from "./HomeClient";

export const metadata: Metadata = {
  title: "Home",
};

export default function Page() {
  return <Home />;
}