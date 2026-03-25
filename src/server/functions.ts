import { createServerFn } from "@tanstack/react-start";
import { filterJobs, getStats, type FilterParams } from "~/data/jobs";

export const getJobsFn = createServerFn({ method: "GET" })
  .validator((data: FilterParams) => data)
  .handler(async ({ data }) => filterJobs(data));

export const getStatsFn = createServerFn({ method: "GET" })
  .handler(async () => getStats());
