import { colors } from "@cliffy/ansi/colors";
import { Command } from "@cliffy/command";
import { Application } from "@oak/oak/application";
import { Router } from "@oak/oak/router";
import { getDataHtml } from "./html.ts";
import { getMarkdown } from "./markdown.ts";
import { getAdapters } from "./utils.ts";

async function start(verbose: boolean, port: number) {
  // Create a new instance of the Oak router
  const router = new Router();

  const divider = "\n-----------------\n";

  router.get("/(.*)", async (ctx) => {
    try {
      const { data } = await getAdapters(verbose);
      ctx.response.body = getDataHtml(data);
      if (verbose) {
        console.log(divider);
        console.log(getMarkdown(data));
      }
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        !!error &&
        "message" in error &&
        typeof error.message === "string"
      ) {
        ctx.response.body = error.message;
      }
    }
  });

  const app = new Application();
  app.use(router.routes());
  app.use(router.allowedMethods());
  app.listen({ port });

  console.log(divider);

  console.log("Power adapter details server started.");
  console.log(
    `Open ${colors.bold.blue(`http://localhost:${port}`)} in your browser.`
  );

  if (verbose) {
    console.log(divider);

    const { data } = await getAdapters(verbose);
    console.log(getMarkdown(data));
  }
}

await new Command()
  .name("mac-adapter-server")
  .description("Mac power adapter details server.")
  .version("1.0.0")
  .option("-v, --verbose", "Print verbose debug information to the console.", {
    default: false,
  })
  .option("-p, --port <port:number>", "The port number for the local server.", {
    default: 8080,
  })
  .action(async ({ verbose, port }) => await start(verbose, port))
  .parse();
