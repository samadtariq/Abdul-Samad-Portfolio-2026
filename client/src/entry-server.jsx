import React from "react";
import { renderToString } from "react-dom/server";
import { Site } from "./App.jsx";
import { resolvePage } from "./utils/resolvePage.js";
export function render(data) {
  return {
    page: resolvePage(data),
    body: renderToString(<Site data={data} />),
  };
}
