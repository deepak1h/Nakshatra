import app from "./app";
import { log } from "./vite";

const port = parseInt(process.env.PORT || "5000", 10);

app.listen(port, "0.0.0.0", () => {
  log(`serving on port ${port}`);
});
