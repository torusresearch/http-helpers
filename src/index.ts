/* eslint-disable @typescript-eslint/no-throw-literal */
import type { Span, StartSpanOptions } from "@sentry/types";
import merge from "deepmerge";
import logLevel, { levels, LogLevelDesc } from "loglevel";

const log = logLevel.getLogger("http-helpers");
log.setLevel(levels.INFO);

export interface CustomOptions {
  [key: string]: unknown;
  useAPIKey?: boolean;
  isUrlEncodedData?: boolean;
  timeout?: number;
  logTracingHeader?: boolean;
}

export interface Data {}

let apiKey = "torus-default";
let embedHost = "";

// #region API Keys
export const gatewayAuthHeader = "x-api-key";
export const gatewayEmbedHostHeader = "x-embed-host";

interface Sentry {
  startSpan<T>(context: StartSpanOptions, callback: (span: Span) => T): T;
}

let sentry: Sentry | null = null;
const tracingOrigins: string[] = [];
const tracingPaths: string[] = [];

export function enableSentryTracing(_sentry: Sentry, _tracingOrigins: string[], _tracingPaths: string[]) {
  sentry = _sentry;
  tracingOrigins.push(..._tracingOrigins);
  tracingPaths.push(..._tracingPaths);
}

export function setEmbedHost(embedHost_: string): void {
  embedHost = embedHost_;
}

export function clearEmbedHost(): void {
  embedHost = "";
}

export function getEmbedHost(): string {
  return embedHost;
}

export function setAPIKey(apiKey_: string): void {
  apiKey = apiKey_;
}

export function clearAPIKey(): void {
  apiKey = "torus-default";
}

export function getAPIKey(): string {
  return apiKey;
}

// #endregion

export function setLogLevel(level: LogLevelDesc) {
  log.setLevel(level);
}

async function fetchAndTrace(url: string, init: RequestInit): Promise<Response> {
  let _url: URL | null = null;
  try {
    _url = new URL(url);
  } catch (error) {}
  if (sentry && _url && (tracingOrigins.includes(_url.origin) || tracingPaths.includes(_url.pathname))) {
    const result = await sentry.startSpan<Promise<Response>>(
      {
        name: url,
        op: "http.client",
      },
      async () => {
        const response = await fetch(url, init);
        return response;
      }
    );
    return result;
  }

  return fetch(url, init);
}
function getApiKeyHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  if (apiKey) headers[gatewayAuthHeader] = apiKey;
  if (embedHost) headers[gatewayEmbedHostHeader] = embedHost;
  return headers;
}

function debugLogResponse(response: Response) {
  log.info(`Response: ${response.status} ${response.statusText}`);
  log.info(`Url: ${response.url}`);
}

function logTracingHeader(response: Response) {
  const tracingHeader = response.headers.get("x-web3-correlation-id");
  if (tracingHeader) log.info(`Request tracing with traceID = ${tracingHeader}`);
}

export const promiseTimeout = async <T>(ms: number, promise: Promise<T>): Promise<T> => {
  let timeoutFunc: ReturnType<typeof setTimeout> | null = null;
  try {
    const timeout = new Promise<T>((_resolve, reject) => {
      timeoutFunc = setTimeout(() => {
        reject(new Error(`Timed out in ${ms}ms`));
      }, ms);
    });

    const result = await Promise.race<T>([promise, timeout]);
    // promise.race will return the first resolved promise
    // then we clear the timeout
    if (timeoutFunc != null) {
      clearTimeout(timeoutFunc);
    }
    return result;
  } catch (err) {
    // clear the timeout
    if (timeoutFunc != null) {
      clearTimeout(timeoutFunc);
    }
    // rethrow the original error
    throw err;
  }
};

export const get = async <T>(url: string, options_: RequestInit = {}, customOptions: CustomOptions = {}) => {
  const defaultOptions = {
    mode: "cors" as RequestMode,
    headers: {},
  };
  if (customOptions.useAPIKey) {
    defaultOptions.headers = { ...defaultOptions.headers, ...getApiKeyHeaders() };
  }
  options_.method = "GET";
  const options = merge<RequestInit>(defaultOptions, options_);
  const response = await fetchAndTrace(url, options);
  if (response.ok) {
    const responseContentType = response.headers.get("content-type");
    if (responseContentType?.includes("application/json")) {
      return response.json() as Promise<T>;
    }
    return response.text() as Promise<T>;
  }
  debugLogResponse(response);
  throw response;
};

export const post = <T>(url: string, data: Data = {}, options_: RequestInit = {}, customOptions: CustomOptions = {}) => {
  const defaultOptions = {
    mode: "cors" as RequestMode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  };
  if (customOptions.useAPIKey) {
    defaultOptions.headers = { ...defaultOptions.headers, ...getApiKeyHeaders() };
  }
  options_.method = "POST";
  const options = merge(defaultOptions, options_);

  // deep merge changes the structure of form data and url encoded data ,
  // so we should not deepmerge body data
  if (customOptions.isUrlEncodedData) {
    // for multipart request browser/client will add multipart content type
    // along with multipart boundary , so for multipart request send
    // content-type: undefined or send with multipart boundary if already known
    options.body = data as string;
    // If url encoded data, this must not be the content type
    if (options.headers["Content-Type"] === "application/json; charset=utf-8") delete options.headers["Content-Type"];
  } else {
    options.body = JSON.stringify(data);
  }

  return promiseTimeout<T>(
    (customOptions.timeout as number) || 60000,
    fetchAndTrace(url, options).then((response) => {
      if (customOptions.logTracingHeader) {
        logTracingHeader(response);
      }
      if (response.ok) {
        const responseContentType = response.headers.get("content-type");
        if (responseContentType?.includes("application/json")) {
          return response.json() as Promise<T>;
        }
        return response.text() as Promise<T>;
      }
      debugLogResponse(response);
      throw response;
    })
  );
};

export const patch = async <T>(url: string, data: Data = {}, options_: RequestInit = {}, customOptions: CustomOptions = {}) => {
  const defaultOptions = {
    mode: "cors" as RequestMode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  };
  // for multipart request browser/client will add multipart content type
  // along with multipart boundary , so for multipart request send
  // content-type: undefined or send with multipart boundary if already known
  if (customOptions.useAPIKey) {
    defaultOptions.headers = { ...defaultOptions.headers, ...getApiKeyHeaders() };
  }
  options_.method = "PATCH";
  const options = merge(defaultOptions, options_);
  // deep merge changes the structure of form data and url encoded data ,
  // so we should not deepmerge body data
  if (customOptions.isUrlEncodedData) {
    // for multipart request browser/client will add multipart content type
    // along with multipart boundary , so for multipart request send
    // content-type: undefined or send with multipart boundary if already known
    options.body = data as string;
    // If url encoded data, this must not be the content type
    if (options.headers["Content-Type"] === "application/json; charset=utf-8") delete options.headers["Content-Type"];
  } else {
    options.body = JSON.stringify(data);
  }
  const response = await fetchAndTrace(url, options);
  if (response.ok) {
    const responseContentType = response.headers.get("content-type");
    if (responseContentType?.includes("application/json")) {
      return response.json() as Promise<T>;
    }
    return response.text() as Promise<T>;
  }
  debugLogResponse(response);
  throw response;
};

export const put = async <T>(url: string, data: Data = {}, options_: RequestInit = {}, customOptions: CustomOptions = {}) => {
  const defaultOptions = {
    mode: "cors" as RequestMode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  };
  // for multipart request browser/client will add multipart content type
  // along with multipart boundary , so for multipart request send
  // content-type: undefined or send with multipart boundary if already known
  if (customOptions.useAPIKey) {
    defaultOptions.headers = { ...defaultOptions.headers, ...getApiKeyHeaders() };
  }
  options_.method = "PUT";
  const options = merge(defaultOptions, options_);
  // deep merge changes the structure of form data and url encoded data ,
  // so we should not deepmerge body data
  if (customOptions.isUrlEncodedData) {
    // for multipart request browser/client will add multipart content type
    // along with multipart boundary , so for multipart request send
    // content-type: undefined or send with multipart boundary if already known
    options.body = data as string;
    // If url encoded data, this must not be the content type
    if (options.headers["Content-Type"] === "application/json; charset=utf-8") delete options.headers["Content-Type"];
  } else {
    options.body = JSON.stringify(data);
  }
  const response = await fetchAndTrace(url, options);
  if (response.ok) {
    const responseContentType = response.headers.get("content-type");
    if (responseContentType?.includes("application/json")) {
      return response.json() as Promise<T>;
    }
    return response.text() as Promise<T>;
  }
  debugLogResponse(response);
  throw response;
};

export const remove = async <T>(url: string, data: Data = {}, options_: RequestInit = {}, customOptions: CustomOptions = {}) => {
  const defaultOptions = {
    mode: "cors" as RequestMode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  };
  // for multipart request browser/client will add multipart content type
  // along with multipart boundary , so for multipart request send
  // content-type: undefined or send with multipart boundary if already known
  if (customOptions.useAPIKey) {
    defaultOptions.headers = { ...defaultOptions.headers, ...getApiKeyHeaders() };
  }
  options_.method = "DELETE";
  const options = merge(defaultOptions, options_);
  if (customOptions.isUrlEncodedData) {
    // for multipart request browser/client will add multipart content type
    // along with multipart boundary , so for multipart request send
    // content-type: undefined or send with multipart boundary if already known
    options.body = data as string;
    // If url encoded data, this must not be the content type
    if (options.headers["Content-Type"] === "application/json; charset=utf-8") delete options.headers["Content-Type"];
  } else {
    options.body = JSON.stringify(data);
  }
  const response = await fetchAndTrace(url, options);
  if (response.ok) {
    const responseContentType = response.headers.get("content-type");
    if (responseContentType?.includes("application/json")) {
      return response.json() as Promise<T>;
    }
    return response.text() as Promise<T>;
  }
  debugLogResponse(response);
  throw response;
};

export const generateJsonRPCObject = (method: string, parameters: unknown) => ({
  jsonrpc: "2.0",
  method,
  id: 10,
  params: parameters,
});

export const promiseRace = <T>(url: string, options: RequestInit, timeout = 60000) =>
  Promise.race([
    get<T>(url, options),
    new Promise<T>((_resolve, reject) => {
      setTimeout(() => {
        reject(new Error("timed out"));
      }, timeout);
    }),
  ]);
