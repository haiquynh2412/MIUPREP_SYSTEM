import "./vite.css";
import { mount } from "svelte";
import SatParentShell from "./parent/SatParentShell.svelte";

const target = document.getElementById("app");

if (!target) {
  throw new Error("Missing #app root for SAT Studio parent app");
}

mount(SatParentShell, { target });
