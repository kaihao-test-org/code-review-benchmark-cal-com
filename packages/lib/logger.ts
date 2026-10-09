import { Logger } from "tslog";

import { IS_PRODUCTION } from "./constants";

const logger = new Logger({
  minLevel: parseInt(process.env.NEXT_PUBLIC_LOGGER_LEVEL || "4"),
  maskValuesOfKeys: ["password", "passwordConfirmation", "credentials", "credential"],
  prettyLogTimeZone: IS_PRODUCTION ? "UTC" : "local",
  prettyErrorStackTemplate: "  • {{fileName}}\t{{method}}\n\t{{filePathWithLine}}", // default
  prettyErrorTemplate: "\n{{errorName}} {{errorMessage}}\nerror stack:\n{{errorStack}}", // default
  prettyLogTemplate: "{{hh}}:{{MM}}:{{ss}}:{{ms}} [{{logLevelName}}] ", // default with exclusion of `{{filePathWithLine}}`
  stylePrettyLogs: true,
  prettyLogStyles: {
    name: "yellow",
    dateIsoStr: "blue",
  },
});

const pendingLogDrainWrites = new Set<Promise<void>>();
const logDrainUrl = process.env.LOG_DRAIN_URL;

if (logDrainUrl) {
  logger.attachTransport((logObj) => {
    const write = fetch(logDrainUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(logObj),
    })
      .then(() => undefined)
      .catch(() => undefined);

    pendingLogDrainWrites.add(write);
    write.finally(() => pendingLogDrainWrites.delete(write));
  });
}

export const flushLogDrain = async () => {
  await Promise.allSettled(Array.from(pendingLogDrainWrites));
};

export const getServerlessLogger = (prefix: string) =>
  Object.assign(logger.getSubLogger({ prefix: [prefix] }), { flush: flushLogDrain });

export default logger;
