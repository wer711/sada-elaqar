export {};

declare global {
  interface Window {
    sada?: {
      track: (name: string, props?: {
        label?: string;
        category?: string;
        value?: number;
        metadata?: Record<string, unknown>;
      }) => void;
      page: (path?: string) => void;
      setVisitor: (props: Record<string, unknown>) => void;
    };
    sadaConfig?: {
      endpoint?: string;
      debug?: boolean;
      autoPageviews?: boolean;
      autoClicks?: boolean;
      disabled?: boolean;
    };
  }
}
