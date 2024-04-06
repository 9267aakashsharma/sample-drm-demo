import { defaultVideoJsOptions } from "./constants";

export interface SubtitleTrack {
  kind: "captions";
  label: string;
  srclang: string;
  src: string;
  type: string;
  default: string;
}

export interface VideoSrc {
  url: string;
  type: string;
  token: string;
  poster: string;
  tracks?: SubtitleTrack[];
}

export type VideoJsOptions = typeof defaultVideoJsOptions;
