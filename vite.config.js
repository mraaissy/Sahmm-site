import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Domaine personnalisé (www.sahmm.ma) : le site est servi à la racine,
// donc base doit rester "/" — ne pas remettre "/nom-du-depot/" ici.
export default defineConfig({
  plugins: [react()],
  base: "/",
});
