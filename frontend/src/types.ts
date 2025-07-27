export interface SearchResult {
  data: {
    video_id: string;
    start: number;
    end: number;
    confidence: string;
    thumbnail_url: string;
  }[];
}
