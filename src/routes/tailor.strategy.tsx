import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/tailor/strategy")({
  beforeLoad: () => {
    throw redirect({ to: "/tailor" });
  },
  component: () => null,
});
