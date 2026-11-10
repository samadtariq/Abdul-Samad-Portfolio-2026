import React from "react";
import { hydrateRoot, createRoot } from "react-dom/client";
import { Site } from "./App.jsx";
import { AdminApp } from "./admin/AdminApp.jsx";
const data = JSON.parse(document.getElementById("initial-data").textContent);
if (data.admin)
  createRoot(document.getElementById("root")).render(
    <AdminApp initial={data} />,
  );
else hydrateRoot(document.getElementById("root"), <Site data={data} />);

import "./styles/style.css";
