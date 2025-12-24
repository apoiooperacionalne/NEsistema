import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/NEsistema/", // NOME DO TEU REPOSITÓRIO NO GITHUB
});
