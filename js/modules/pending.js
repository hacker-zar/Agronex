"use strict";

export function pendingActionForReservation(reservation, {
  isRequester = false,
  isOwner = false,
  pendingReschedule = null,
  rescheduleRequestedByCurrentUser = false,
} = {}) {
  if (!reservation || ["rejected", "cancelled"].includes(reservation.status)) return null;

  if (pendingReschedule) {
    if ((isRequester || isOwner) && !rescheduleRequestedByCurrentUser) return "Revisar cambio de fecha";
    return null;
  }

  if (reservation.status === "pending" && isOwner && !isRequester) return "Responder solicitud";
  if (reservation.status === "schedule_counter" && isRequester) return "Responder propuesta de horario";
  if (reservation.status === "original_kept" && isOwner && !isRequester) return "Confirmar horario original";

  if (reservation.status === "accepted" && isOwner && !isRequester) return "Iniciar trabajo";
  if (reservation.status === "working" && isOwner && !isRequester) return "Actualizar operación";
  return null;
}

export function sortPendingItems(items) {
  const actionOrder = {
    "Responder solicitud": 0,
    "Responder propuesta de horario": 1,
    "Confirmar horario original": 1,
    "Revisar cambio de fecha": 2,
    "Iniciar trabajo": 3,
    "Actualizar operación": 4,
  };
  return [...items].sort((a, b) => {
    const categoryOrder = { received: 0, initiated: 1 };
    const categoryDifference = (categoryOrder[a.category] ?? 2) - (categoryOrder[b.category] ?? 2);
    if (categoryDifference) return categoryDifference;
    const actionDifference = (actionOrder[a.action] ?? 9) - (actionOrder[b.action] ?? 9);
    if (actionDifference) return actionDifference;
    const aTime = Date.parse(a.updatedAt || a.createdAt || "") || 0;
    const bTime = Date.parse(b.updatedAt || b.createdAt || "") || 0;
    return bTime - aTime;
  });
}
