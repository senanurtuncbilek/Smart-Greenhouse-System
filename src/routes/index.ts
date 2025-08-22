import { Router } from "express";
import fs from "fs";
import path from "path";

const router = Router();

(async () => {
  const routes = fs.readdirSync(__dirname);

  for (let route of routes) {
    const isRouteTs = route.endsWith(".ts") && route !== "index.ts";
    const isRouteJs = route.endsWith(".js") && route !== "index.js";
    if (isRouteTs || isRouteJs) {
      const fullPath = path.join(__dirname, route);
      const loaded = await import(fullPath);
      const routerExport = loaded.default ?? loaded;

      if (
        typeof routerExport === "function" ||
        typeof routerExport.handle === "function"
      ) {
        const routePath = "/" + route.replace(/\.(ts|js)$/i, "");
        router.use(routePath, routerExport);
        console.log("✔ Route loaded:", route);
      } else {
        console.warn("Invalid route file (not an Express Router):", route);
      }
    }
  }
})();

export default router;
