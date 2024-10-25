import { Span, StartSpanOptions } from "@sentry/types";
import logLevel, { levels } from "loglevel";
import { afterEach, beforeEach, describe, expect, it, Mock, vi } from "vitest";

import * as httpHelpers from "../src/index";

interface Sentry {
  startSpan<T>(context: StartSpanOptions, callback: (span: Span) => T): T;
}

// Mock fetch
global.fetch = vi.fn();
const log = logLevel.getLogger("http-helpers");

const mockResponse = (status = 200, data = {}, contentType = "application/json") => {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
    headers: new Headers({ "content-type": contentType }),
  };
};

describe("HTTP Helpers", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    httpHelpers.clearAPIKey();
    httpHelpers.clearEmbedHost();
  });

  describe("API Key and Embed Host", () => {
    it("should set and get API key", () => {
      httpHelpers.setAPIKey("test-api-key");
      expect(httpHelpers.getAPIKey()).toBe("test-api-key");
    });

    it("should clear API key", () => {
      httpHelpers.setAPIKey("test-api-key");
      httpHelpers.clearAPIKey();
      expect(httpHelpers.getAPIKey()).toBe("torus-default");
    });

    it("should set and get embed host", () => {
      httpHelpers.setEmbedHost("test-embed-host");
      expect(httpHelpers.getEmbedHost()).toBe("test-embed-host");
    });

    it("should clear embed host", () => {
      httpHelpers.setEmbedHost("test-embed-host");
      httpHelpers.clearEmbedHost();
      expect(httpHelpers.getEmbedHost()).toBe("");
    });
  });

  describe("setLogLevel", () => {
    it("should set log level", () => {
      httpHelpers.setLogLevel(levels.ERROR);
      expect(log.getLevel()).toBe(levels.ERROR);
    });
  });

  describe("HTTP Methods", () => {
    describe("get", () => {
      it("should make a GET request", async () => {
        const mockData = { test: "data" };
        (global.fetch as Mock).mockResolvedValue(mockResponse(200, mockData));

        const result = await httpHelpers.get("https://api.example.com/data");
        expect(result).toEqual(mockData);
        expect(global.fetch).toHaveBeenCalledWith("https://api.example.com/data", expect.objectContaining({ method: "GET" }));
      });
    });

    describe("post", () => {
      it("should make a POST request", async () => {
        const mockData = { test: "data" };
        const postData = { postKey: "postValue" };
        (global.fetch as Mock).mockResolvedValue(mockResponse(200, mockData));

        const result = await httpHelpers.post("https://api.example.com/data", postData);
        expect(result).toEqual(mockData);
        expect(global.fetch).toHaveBeenCalledWith(
          "https://api.example.com/data",
          expect.objectContaining({
            method: "POST",
            body: JSON.stringify(postData),
          })
        );
      });
    });

    describe("patch", () => {
      it("should make a PATCH request", async () => {
        const mockData = { test: "data" };
        const patchData = { patchKey: "patchValue" };
        (global.fetch as Mock).mockResolvedValue(mockResponse(200, mockData));

        const result = await httpHelpers.patch("https://api.example.com/data", patchData);
        expect(result).toEqual(mockData);
        expect(global.fetch).toHaveBeenCalledWith(
          "https://api.example.com/data",
          expect.objectContaining({
            method: "PATCH",
            body: JSON.stringify(patchData),
          })
        );
      });
    });

    describe("put", () => {
      it("should make a PUT request", async () => {
        const mockData = { test: "data" };
        const putData = { putKey: "putValue" };
        (global.fetch as Mock).mockResolvedValue(mockResponse(200, mockData));

        const result = await httpHelpers.put("https://api.example.com/data", putData);
        expect(result).toEqual(mockData);
        expect(global.fetch).toHaveBeenCalledWith(
          "https://api.example.com/data",
          expect.objectContaining({
            method: "PUT",
            body: JSON.stringify(putData),
          })
        );
      });
    });

    describe("remove", () => {
      it("should make a DELETE request", async () => {
        const mockData = { test: "data" };
        const deleteData = { deleteKey: "deleteValue" };
        (global.fetch as Mock).mockResolvedValue(mockResponse(200, mockData));

        const result = await httpHelpers.remove("https://api.example.com/data", deleteData);
        expect(result).toEqual(mockData);
        expect(global.fetch).toHaveBeenCalledWith(
          "https://api.example.com/data",
          expect.objectContaining({
            method: "DELETE",
            body: JSON.stringify(deleteData),
          })
        );
      });
    });

    // Add tests for error handling
    it("should throw an error for non-OK responses", async () => {
      (global.fetch as Mock).mockResolvedValue(mockResponse(404, { error: "Not Found" }));

      await expect(httpHelpers.get("https://api.example.com/data")).rejects.toThrow();
    });

    it("should handle non-JSON responses", async () => {
      const textResponse = "Plain text response";
      (global.fetch as Mock).mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(textResponse),
        headers: new Headers({ "content-type": "text/plain" }),
      });

      const result = await httpHelpers.get("https://api.example.com/data");
      expect(result).toBe(textResponse);
    });

    it("should use API key when useAPIKey option is true", async () => {
      httpHelpers.setAPIKey("test-api-key");
      (global.fetch as Mock).mockResolvedValue(mockResponse(200, {}));

      await httpHelpers.get("https://api.example.com/data", {}, { useAPIKey: true });
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.example.com/data",
        expect.objectContaining({
          headers: expect.objectContaining({
            "x-api-key": "test-api-key",
          }),
        })
      );
    });

    it("should handle URL encoded data", async () => {
      const urlEncodedData = "key1=value1&key2=value2";
      (global.fetch as Mock).mockResolvedValue(mockResponse(200, {}));

      await httpHelpers.post("https://api.example.com/data", urlEncodedData, {}, { isUrlEncodedData: true });
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.example.com/data",
        expect.objectContaining({
          body: urlEncodedData,
          headers: expect.not.objectContaining({
            "Content-Type": "application/json; charset=utf-8",
          }),
        })
      );
    });
  });

  describe("generateJsonRPCObject", () => {
    it("should generate a JSON-RPC object", () => {
      const method = "testMethod";
      const params = { key: "value" };
      const result = httpHelpers.generateJsonRPCObject(method, params);
      expect(result).toEqual({
        jsonrpc: "2.0",
        method,
        id: 10,
        params,
      });
    });
  });

  describe("promiseRace", () => {
    it("should resolve when the request completes before timeout", async () => {
      const mockData = { test: "data" };
      (global.fetch as Mock).mockResolvedValue(mockResponse(200, mockData));

      const result = await httpHelpers.promiseRace("https://api.example.com/data", {}, 1000);
      expect(result).toEqual(mockData);
    });

    it("should reject when the request times out", async () => {
      (global.fetch as Mock).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(resolve, 2000);
          })
      );

      await expect(httpHelpers.promiseRace("https://api.example.com/data", {}, 100)).rejects.toThrow("timed out");
    });

    it("should use the default timeout of 60000ms if not specified", async () => {
      vi.useFakeTimers();
      const mockData = { test: "data" };
      (global.fetch as Mock).mockResolvedValue(mockResponse(200, mockData));

      const promise = httpHelpers.promiseRace("https://api.example.com/data", {});
      vi.advanceTimersByTime(59999);
      await expect(promise).resolves.toEqual(mockData);

      vi.useRealTimers();
    });
  });

  describe("Sentry tracing", () => {
    it("should enable Sentry tracing", async () => {
      const mockSentry = {
        startSpan: vi.fn().mockImplementation((_, callback) => callback({ setTag: vi.fn() })),
      };
      const origins = ["https://example.com"];
      const paths = ["/api"];

      httpHelpers.enableSentryTracing(mockSentry as Sentry, origins, paths);

      (global.fetch as Mock).mockResolvedValue(mockResponse(200, {}));
      await httpHelpers.get("https://example.com/api/data");

      expect(mockSentry.startSpan).toHaveBeenCalled();
    });

    it("should not use Sentry tracing for non-matching origins", async () => {
      const mockSentry = {
        startSpan: vi.fn().mockImplementation((_, callback) => callback({ setTag: vi.fn() })),
      };
      const origins = ["https://example.com"];
      const paths = ["/api"];

      httpHelpers.enableSentryTracing(mockSentry as Sentry, origins, paths);

      (global.fetch as Mock).mockResolvedValue(mockResponse(200, {}));
      await httpHelpers.get("https://other-domain.com/api/data");

      expect(mockSentry.startSpan).not.toHaveBeenCalled();
    });
  });

  describe("promiseTimeout", () => {
    it("should resolve when the promise completes before timeout", async () => {
      const mockPromise = new Promise((resolve) => {
        setTimeout(() => resolve("success"), 100);
      });
      const result = await httpHelpers.promiseTimeout(200, mockPromise);
      expect(result).toBe("success");
    });

    it("should reject when the promise times out", async () => {
      const mockPromise = new Promise((resolve) => {
        setTimeout(() => resolve("success"), 200);
      });
      await expect(httpHelpers.promiseTimeout(100, mockPromise)).rejects.toThrow("Timed out in 100ms");
    });
  });
});
