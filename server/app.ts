import next from "next";
import { initApp } from "./server";

const port = parseInt(process.env.PORT!, 10) || 3000;
const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });

nextApp.prepare().then(async () => {
  const { httpServer, server } = await initApp();
  const nextHandler = nextApp.getRequestHandler();

  server.all("*", (req, res) => {
    return nextHandler(req, res);
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
