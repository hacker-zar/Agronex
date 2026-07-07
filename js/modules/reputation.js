"use strict";

function validRating(value) {
  return Number.isFinite(value) && value >= 1 && value <= 5;
}

function average(values) {
  const valid = values.filter((value) => Number.isFinite(value));
  return valid.length ? valid.reduce((sum, value) => sum + value, 0) / valid.length : null;
}

export function weightedReviewCategoryAverage(reviews, reviewedRole, weightsByRole) {
  const weights = weightsByRole[reviewedRole] || {};
  const values = [];
  reviews.forEach((review) => {
    let weightedSum = 0;
    let totalWeight = 0;
    Object.entries(weights).forEach(([key, weight]) => {
      const value = Number(review.categories?.[key]);
      if (!validRating(value)) return;
      weightedSum += value * weight;
      totalWeight += weight;
    });
    if (totalWeight > 0) values.push(weightedSum / totalWeight);
  });
  return average(values);
}

export function responseReputationScore(minutes) {
  if (!Number.isFinite(minutes)) return null;
  if (minutes <= 120) return 100;
  if (minutes <= 720) return 85;
  if (minutes <= 1440) return 70;
  if (minutes <= 2880) return 50;
  return 30;
}

export function calculateReputationScore(reviews, metrics, reviewedRole, averageRating, wouldAgainPercent, weightsByRole) {
  const categoryAverage = weightedReviewCategoryAverage(reviews, reviewedRole, weightsByRole);
  const components = [
    { value: typeof averageRating === "number" ? (averageRating / 5) * 100 : null, weight: 0.24 },
    { value: typeof categoryAverage === "number" ? (categoryAverage / 5) * 100 : null, weight: 0.18 },
    { value: typeof wouldAgainPercent === "number" ? wouldAgainPercent : null, weight: 0.16 },
    { value: Math.min(100, (metrics.completedCount || 0) * 12), weight: 0.12 },
    { value: Math.min(100, reviews.length * 14), weight: 0.08 },
    { value: typeof metrics.acceptanceRate === "number" ? metrics.acceptanceRate : null, weight: 0.09 },
    { value: typeof metrics.cancellationRate === "number" ? Math.max(0, 100 - metrics.cancellationRate) : null, weight: 0.08 },
    { value: responseReputationScore(metrics.averageResponseMinutes), weight: 0.05 },
  ].filter((item) => Number.isFinite(item.value));
  if (!components.length) return null;
  const totalWeight = components.reduce((sum, item) => sum + item.weight, 0);
  return Math.round(components.reduce((sum, item) => sum + item.value * item.weight, 0) / totalWeight);
}
