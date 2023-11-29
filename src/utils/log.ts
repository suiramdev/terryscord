import { Logger, ILogObj } from "tslog";
import { createStream } from "rotating-file-stream";

const stream = createStream("./data/tslog.log", {
    size: "10M", // rotate every 10 MegaBytes written
    interval: "1d", // rotate daily
    compress: "gzip", // compress rotated files
});

export const logger: Logger<ILogObj> = new Logger({ type: "pretty" });
logger.attachTransport((logObject) => {
    stream.write(JSON.stringify(logObject) + "\n");
});
