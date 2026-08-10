import dns from "node:dns";
import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./utils/logger.util";

// This ISP resolves Neon's AWS ap-southeast-1 hostname to a broken/blackholed
// IPv6 route, so Node's default "try AAAA first" DNS order made every DB
// connection attempt hang for minutes before ever falling back to the IPv4
// address that actually works. Forcing IPv4-first fixes it at the source
// instead of retrying around a connection that was never going to succeed in
// time.
dns.setDefaultResultOrder("ipv4first");

const app = createApp();

app.listen(env.PORT, () => {
  logger.info(`Barangay Catarman backend listening on port ${env.PORT} (${env.NODE_ENV})`);
});

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled promise rejection", reason);
});
