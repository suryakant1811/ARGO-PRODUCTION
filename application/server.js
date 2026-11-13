import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT) || 3000;
const dist = path.join(__dirname, "dist");

app.use(express.static(dist));

app.listen(port, "0.0.0.0", () => {
  console.log(`Northline listening on ${port}`);
});
