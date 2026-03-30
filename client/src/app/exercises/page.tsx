import { Metadata } from "next";
import ExerciseClient from "./ExercisesClient";

export const metadata: Metadata = {
  title: "Calm Exercises",
};

export default function Page() {
  return <ExerciseClient />;
}