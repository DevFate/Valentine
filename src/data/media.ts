export type MemoryMediaItem = {
  id: string;
  title: string;
  type: "image" | "video";
  src: string;
  alt: string;
  context?: {
    capturedAt?: string;
    location?: string;
    latitude?: number;
    longitude?: number;
    device?: string;
  };
};

export type MemoryFolder = {
  id: string;
  title: string;
  slug: string;
  count: number;
  items: MemoryMediaItem[];
};
