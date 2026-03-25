export type RewardVerificationPayload = {
  user_name: string;
  project_name: string;
  reward_type: string;
  points: number;
  location: string;
  valid_till: string;
  reward_id: number;
  description?: string;
};

export function formatDateOnly(value?: string | Date | null): string {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleString("en-IN", { month: "short" });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

export function getValidTill(grantedAt?: string): string {
  if (!grantedAt) return "-";
  const base = new Date(grantedAt);
  if (Number.isNaN(base.getTime())) return "-";
  const valid = new Date(base);
  valid.setFullYear(valid.getFullYear() + 3);
  return formatDateOnly(valid);
}

export function getRewardTypeLabel(rewardType: string): "Utility" | "Civic" | "Toll" {
  const normalized = String(rewardType || "").toUpperCase();
  if (normalized.includes("TOLL")) return "Toll";
  if (normalized.includes("UTILITY") || normalized.includes("ENERGY") || normalized.includes("HEALTH")) {
    return "Utility";
  }
  return "Civic";
}

export function toRewardVerificationPayload(input: {
  user_name: string;
  project_name: string;
  reward_type: string;
  points: number;
  location: string;
  valid_till: string;
  reward_id: number;
  description?: string;
}): RewardVerificationPayload {
  return {
    user_name: input.user_name,
    project_name: input.project_name,
    reward_type: input.reward_type,
    points: Number(input.points || 0),
    location: input.location || "-",
    valid_till: input.valid_till,
    reward_id: Number(input.reward_id || 0),
    description: input.description,
  };
}

export function encodeRewardPayload(payload: RewardVerificationPayload): string {
  return JSON.stringify({
    user_name: payload.user_name,
    project_name: payload.project_name,
    reward_type: payload.reward_type,
    points: payload.points,
    location: payload.location,
    valid_till: payload.valid_till,
    reward_id: payload.reward_id,
  });
}

export function parseRewardPayload(raw?: string | null): RewardVerificationPayload | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;

    return {
      user_name: String(parsed.user_name || "-"),
      project_name: String(parsed.project_name || "-"),
      reward_type: String(parsed.reward_type || "CIVIC_REWARD"),
      points: Number(parsed.points || 0),
      location: String(parsed.location || "-"),
      valid_till: String(parsed.valid_till || "-"),
      reward_id: Number(parsed.reward_id || 0),
      description: parsed.description ? String(parsed.description) : undefined,
    };
  } catch {
    return null;
  }
}