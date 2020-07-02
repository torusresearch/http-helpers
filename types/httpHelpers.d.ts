export as namespace HttpHelpers
declare function getAPIKey(): string;
declare function setAPIKey(a: string)
declare function clearAPIKey()
declare function promiseTimeout<T>(ms:Number, promise: Promise<T>): Promise<T>
interface CustomOptions {
    useAPIKey?: boolean;
    isUrlEncodedData?: boolean;
    timeout?: Number;
}
interface Data {}
declare function get(url: RequestInfo, options?: RequestInit, customOptions?: CustomOptions): Promise<Response>;
declare function post(url: RequestInfo, data?: Data, options?: RequestInit, customOptions?: CustomOptions): Promise<Response>;
declare function patch(url: RequestInfo, data?: Data, options?: RequestInit, customOptions?: CustomOptions): Promise<Response>;
declare function remove(url: RequestInfo, data?: Data, options?: RequestInit, customOptions?: CustomOptions): Promise<Response>;
interface RPCParams {}
declare function generateJsonRPCObject(method: string, params: RPCParams)
declare function promiseRace(url: string, options?: RequestInit, timeout?: Number)

export {}
