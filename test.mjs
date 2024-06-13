import * as Sentry from "@sentry/node";

import { get, enableSentryTracing } from "./dist/lib.cjs/index.js";

new Sentry.init({
    dsn: 'add_sentry_dsn_here',
})

enableSentryTracing(Sentry, [], []);


const getData = async () => { 
    const data = await get("https://api-passwordless.web3auth.io/api/v3/auth/health");
    console.log(data);
    throw new Error("Test Error");
}

getData();