"use strict";

export function operationVisibleForStatus(status) {
  return ["accepted", "working", "done"].includes(status);
}
