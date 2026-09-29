import { createServerFn } from "@tanstack/react-start";
import type { SourceReport } from "@/lib/source-diff.server";

export type { SourcePin, SourceReport } from "@/lib/source-diff.server";

export const checkSource = createServerFn({ method: "POST" })
  .validator((input: unknown) => input)
  .handler(async (): Promise<SourceReport> => {
    const { checkPublishedTable } = await import("@/lib/source-diff.server");
    return checkPublishedTable();
  });
