import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/matchmaker/$jobSlug")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/matchmaker",
      search: { selected: params.jobSlug },
    });
  },
});
