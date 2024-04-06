export const defaultVideoJsOptions = {
  controls: true,
  autoplay: false,
  playbackRates: [0.5, 1, 1.25, 1.5, 1.75, 2],
  controlBar: {
    pictureInPictureToggle: false,
  },
  preload: "metadata",
  fluid: false,
  aspectRatio: "16:9",
  sources: [],
  text: "" as string,
} as const;
