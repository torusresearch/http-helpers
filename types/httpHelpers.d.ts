export function getAPIKey(): string;
export function setAPIKey(a: string)
export function clearAPIKey()
export function promiseTimeout<T>(ms:Number, promise: Promise<T>): Promise<T>
interface CustomOptions {
    useAPIKey?: boolean;
    isUrlEncodedData?: boolean;
    timeout?: Number;
}
interface Data {}
export function get(url: RequestInfo, options?: RequestInit, customOptions?: CustomOptions): Promise<Response>;
export function post(url: RequestInfo, data?: Data, options?: RequestInit, customOptions?: CustomOptions): Promise<Response>;
export function patch(url: RequestInfo, data?: Data, options?: RequestInit, customOptions?: CustomOptions): Promise<Response>;
export function remove(url: RequestInfo, data?: Data, options?: RequestInit, customOptions?: CustomOptions): Promise<Response>;
interface RPCParams {}
export function generateJsonRPCObject(method: string, params: RPCParams)
export function promiseRace(url: string, options?: RequestInit, timeout?: Number)

export {}
