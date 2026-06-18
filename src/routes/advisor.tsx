import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/advisor")({
  component: AdvisorLayout,
});

function AdvisorLayout() {
  return <Outlet />;
}
