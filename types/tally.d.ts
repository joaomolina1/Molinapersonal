declare global {
  interface Window {
    Tally?: {
      loadEmbeds: () => void;
      openPopup: (
        formId: string,
        options?: {
          key?: string; // This is used as a unique identifier used for the "Show only once" and "Don't show after submit" functionality
          layout?: "default" | "modal";
          width?: number;
          alignLeft?: boolean;
          hideTitle?: boolean;
          overlay?: boolean;
          emoji?: {
            text: string;
            animation:
              | "none"
              | "wave"
              | "tada"
              | "heart-beat"
              | "spin"
              | "flash"
              | "bounce"
              | "rubber-band"
              | "head-shake";
          };
          autoClose?: number; // in milliseconds
          showOnce?: boolean;
          doNotShowAfterSubmit?: boolean;
          customFormUrl?: string; // when you want to load the form via it's custom domain URL
          hiddenFields?: {
            [key: string]: any;
          };
          onOpen?: () => void;
          onClose?: () => void;
          onPageView?: (page: number) => void;
          onSubmit?: (payload: SubmissionPayload) => void;
        }
      ) => void;
    };
  }
}

export {};
