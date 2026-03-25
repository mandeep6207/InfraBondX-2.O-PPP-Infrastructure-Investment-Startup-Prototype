import { apiGet, apiPost } from "./api";

function adminToken() {
  return localStorage.getItem("token") || "";
}

// ── Projects ──────────────────────────────────────────────────────────────────

export async function adminGetProjects(status?: string) {
  const qs = status ? `?status=${status}` : "";
  return apiGet(`/admin/projects${qs}`, adminToken());
}

export async function adminGetProjectDetails(projectId: number) {
  return apiGet(`/admin/projects/${projectId}/details`, adminToken());
}

export async function adminUpdateProjectStatus(
  projectId: number,
  status: "ACTIVE" | "FROZEN" | "PENDING" | "COMPLETED" | "FAILED"
) {
  return apiPost(`/admin/projects/${projectId}/status`, { status }, adminToken());
}

export async function adminGetProjectDocuments(projectId: number) {
  return apiGet(`/admin/projects/${projectId}/documents`, adminToken());
}

// ── Milestones ────────────────────────────────────────────────────────────────

export async function adminReleaseMilestoneFunds(milestoneId: number) {
  return apiPost(`/admin/milestones/${milestoneId}/release`, {}, adminToken());
}

// ── Refund ────────────────────────────────────────────────────────────────────

export async function adminRefundProject(projectId: number) {
  return apiPost(`/admin/projects/${projectId}/refund`, {}, adminToken());
}

// ── Fraud ─────────────────────────────────────────────────────────────────────

export async function adminGetFraudAlerts() {
  return apiGet("/admin/fraud-alerts", adminToken());
}

export async function adminGetProjectPreview(projectId: number) {
  return apiGet(`/admin/projects/${projectId}/preview`, adminToken());
}

export async function adminGetRevenue() {
  return apiGet("/admin/revenue", adminToken());
}

export const getPlatformStats = () =>
  apiGet("/admin/platform-stats", adminToken());
