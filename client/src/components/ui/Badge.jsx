import React from "react";
import { text } from "../../utils/text.js";

export function Badge({ children }) {
  return <span className="badge">{text(children)}</span>;
}
