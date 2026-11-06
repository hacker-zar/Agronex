export type PendingReservation = { status?: string; category?: string; action?: string; updatedAt?: string; createdAt?: string };
export function pendingActionForReservation(reservation: PendingReservation | null, context: { isRequester?: boolean; isOwner?: boolean; pendingReschedule?: unknown; rescheduleRequestedByCurrentUser?: boolean } = {}) {
  if (!reservation || ["rejected", "cancelled"].includes(reservation.status ?? "")) return null;
  if (context.pendingReschedule) return (context.isRequester || context.isOwner) && !context.rescheduleRequestedByCurrentUser ? "Revisar cambio de fecha" : null;
  if (reservation.status === "pending" && context.isOwner && !context.isRequester) return "Responder solicitud";
  if (reservation.status === "schedule_counter" && context.isRequester) return "Responder propuesta de horario";
  if (reservation.status === "original_kept" && context.isOwner && !context.isRequester) return "Confirmar horario original";
  if (reservation.status === "accepted" && context.isOwner && !context.isRequester) return "Iniciar trabajo";
  if (reservation.status === "working" && context.isOwner && !context.isRequester) return "Actualizar operación";
  return null;
}
export function sortPendingItems(items: PendingReservation[]) { const actionOrder: Record<string, number> = { "Responder solicitud": 0, "Responder propuesta de horario": 1, "Confirmar horario original": 1, "Revisar cambio de fecha": 2, "Iniciar trabajo": 3, "Actualizar operación": 4 }; return [...items].sort((a, b) => { const category: Record<string, number> = { received: 0, initiated: 1 }; const categoryDifference = (category[a.category ?? ""] ?? 2) - (category[b.category ?? ""] ?? 2); if (categoryDifference) return categoryDifference; const actionDifference = (actionOrder[a.action ?? ""] ?? 9) - (actionOrder[b.action ?? ""] ?? 9); if (actionDifference) return actionDifference; return (Date.parse(b.updatedAt ?? b.createdAt ?? "") || 0) - (Date.parse(a.updatedAt ?? a.createdAt ?? "") || 0); }); }
