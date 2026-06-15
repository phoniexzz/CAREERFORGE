import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/tailor/cover-letter")({
  beforeLoad: () => {
    throw redirect({ to: "/tailor/cv" });
  },
  component: () => null,
});
