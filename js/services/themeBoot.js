"use strict";

import { storageService } from "./storageService.js";

document.documentElement.dataset.theme = storageService.getString("nexudrive_mvp_theme", "normal");
