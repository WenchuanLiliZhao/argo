/// <reference types="vite/client" />

declare global {
  interface Window {
    argo?: {
      platform: NodeJS.Platform;
    };
  }
}

export {};
