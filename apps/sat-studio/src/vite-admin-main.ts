import { mount } from "svelte";
import SatAdminShell from "./admin/SatAdminShell.svelte";
import "./vite.css";

const target = document.getElementById("sat-vite-admin-root");

if (!target) {
  throw new Error("Missing #sat-vite-admin-root");
}

mount(SatAdminShell, { target });
