export interface BaexBridge {
  call<T>(method: string, ...args: any[]): Promise<T>;
  on(event: string, callback: (data: any) => void): void;
}
