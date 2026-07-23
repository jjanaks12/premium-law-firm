import "dotenv/config";
import { App } from "./app.js";
import { env } from "./config/env.js";

const app = new App().getApp();

app.listen(env.PORT, () => {
  console.log(`🚀 Server running at http://localhost:${env.PORT}`);
  console.log(`   Environment: ${env.NODE_ENV}`);
});
