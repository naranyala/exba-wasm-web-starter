export interface ExbaBridge {
  call<T>(method: string, ...args: any[]): Promise<T>;
  on(event: string, callback: (data: any) => void): void;
}
