"use strict";

export function offerHasPendingRequests(pendingCount) {
  return Number(pendingCount || 0) > 0;
}
