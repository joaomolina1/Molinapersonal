import { emptyResponse } from "@lib/api/context";
import { optionalEnvValue } from "@lib/env";

export async function GET(request: Request) {
  const secret = optionalEnvValue(process.env.CRON_SECRET);
  const auth = request.headers.get("authorization");
  if (secret && auth !== `Bearer ${secret}`) {
    return emptyResponse(401);
  }
  // TODO: refresh iCal imports
  return emptyResponse(200);
}
