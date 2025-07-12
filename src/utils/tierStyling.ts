// src/utils/tierStyling.ts - Create this new file
export const getTierStyling = (tier: string) => {
  switch (tier) {
    case "ESSENTIAL":
      return {
        gradientColors: ["#3B82F6", "#60A5FA", "#93C5FD"], // Blue gradient
        textColor: "#1E40AF",
        borderColor: "#3B82F6",
        badgeText: "💎 Essential",
        badgeGradient: ["#2563EB", "#3B82F6"],
      };
    case "PREMIUM":
      return {
        gradientColors: ["#C0C0C0", "#E5E5E5", "#F8F8FF"], // Silver gradient
        textColor: "#4B5563",
        borderColor: "#C0C0C0",
        badgeText: "🥈 Premium",
        badgeGradient: ["#6B7280", "#9CA3AF"],
      };
    case "VIP":
      return {
        gradientColors: ["#FFD700", "#FFA500", "#FFFF99"], // Gold gradient
        textColor: "#B8860B",
        borderColor: "#FFD700",
        badgeText: "🥇 VIP",
        badgeGradient: ["#D97706", "#F59E0B"],
      };
    default: // FREE
      return {
        gradientColors: ["#FFFFFF", "#F9FAFB", "#FFFFFF"], // White/light gray
        textColor: "#374151",
        borderColor: "#E5E7EB",
        badgeText: "🆓 Free",
        badgeGradient: ["#6B7280", "#9CA3AF"],
      };
  }
};
