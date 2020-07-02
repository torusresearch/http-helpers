import loglevel from 'loglevel'
export function getAPIKey(): string;
export function setAPIKey(apiKey_: string)
export function clearAPIKey()
export function promiseTimeout<T>(ms:Number, promise: Promise<T>): Promise<T>
export const log: loglevel.Logger

interface CustomOptions {
    useAPIKey?: boolean;
    isUrlEncodedData?: boolean;
    timeout?: Number;
}
interface Data {}
export function get<T>(url: RequestInfo, options?: RequestInit, customOptions?: CustomOptions): Promise<T>;
export function post<T>(url: RequestInfo, data?: Data, options?: RequestInit, customOptions?: CustomOptions): Promise<T>;
export function patch<T>(url: RequestInfo, data?: Data, options?: RequestInit, customOptions?: CustomOptions): Promise<T>;
export function remove<T>(url: RequestInfo, data?: Data, options?: RequestInit, customOptions?: CustomOptions): Promise<T>;
interface RPCParams {}
export function generateJsonRPCObject(method: string, params: RPCParams)
export function promiseRace(url: string, options?: RequestInit, timeout?: Number)

export {}
