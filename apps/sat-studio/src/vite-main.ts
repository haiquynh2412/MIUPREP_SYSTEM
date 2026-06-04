import { mount } from "svelte";
import SatStudentShell from "./student/SatStudentShell.svelte";
import "./vite.css";

const target = document.getElementById("sat-vite-root");

if (!target) {
  throw new Error("Missing #sat-vite-root");
}

mount(SatStudentShell, { target });
