import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/tailor/export")({
  beforeLoad: () => {
    throw redirect({ to: "/tailor/readiness" });
  },
  component: () => null,
});
