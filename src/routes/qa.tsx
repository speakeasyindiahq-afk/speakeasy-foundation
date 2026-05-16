import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/qa")({
  head: () => ({ meta: [{ title: "Sawal Jawab — Speakeasy India" }] }),
  component: () => <Navigate to="/sawal-jawab" replace />,
});
