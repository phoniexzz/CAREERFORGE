import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/tailor/match")({
  beforeLoad: () => {
    throw redirect({
      to: "/matchmaker",
      search: { selected: undefined },
    });
  },
  component: () => null,
});
