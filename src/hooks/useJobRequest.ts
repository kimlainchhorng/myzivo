/** Job request stub */
export type JobType = string;
export type JobStatus = string;

export function useJobRequest() {
  return { createJob: async () => {}, isCreating: false, activeJob: null, isLoading: false };
}
export function useJobStatus(_jobId?: string) {
  return { job: null, isLoading: false };
}
export function useCreateJob() {
  return { create: async () => {}, isCreating: false };
}
export function useJobRealtime(_jobId?: string) {
  return { job: null };
}
export async function dispatchJob(_jobId: string) {}
export async function cancelJob(_jobId: string) {}
