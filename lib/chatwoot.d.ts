export {};

declare global {
  interface Window {
    chatwootSettings?: {
      hideMessageBubble?: boolean;
      position?: 'left' | 'right';
      locale?: string;
      type?: 'standard' | 'expanded_bubble';
      darkMode?: 'light' | 'dark' | 'auto';
      [key: string]: any;
    };
    chatwootSDK?: {
      run: (config: { websiteToken: string; baseUrl: string }) => void;
      setUser: (
        identifier: string,
        data: {
          name?: string;
          email?: string;
          avatar_url?: string;
          identifier_hash?: string;
          [key: string]: any;
        }
      ) => void;
      setCustomAttributes: (attributes: Record<string, any>) => void;
      deleteCustomAttribute: (key: string) => void;
      logout: () => void;
    };
    __chatwootScriptLoaded?: boolean;
  }
}
