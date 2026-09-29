import { createFileRoute } from "@tanstack/react-router";
import { OversightApp } from "@/components/oversight-app";

export const Route = createFileRoute("/")({
  component: OversightApp,
});

