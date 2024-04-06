import React, { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import VideoJs from "video.js";

// NOTE: import all videojs plugins
import "videojs-hotkeys";
import "videojs-contrib-eme";
import "videojs-http-source-selector";
import "videojs-contrib-quality-levels";

import {
  checkBrowser,
  checkSupportedDRM,
  pallyconDrmConfig,
} from "./pallycon-helper";
import Watermark from "./Watermark";
import Player from "video.js/dist/types/player";
import { defaultVideoJsOptions } from "./constants";
import { SubtitleTrack, VideoJsOptions, VideoSrc } from "./player.types";

import "./player.css";
import "video.js/dist/video-js.css";

const DrmPlayer = ({
  src,
  onPlay = () => {},
  onReady = () => {},
  animationInterval = false,
  options = defaultVideoJsOptions,
}: {
  src: VideoSrc;
  options: VideoJsOptions;
  animationInterval?: boolean;
  onPlay?: (player: Player) => void;
  onReady?: (player: Player) => void;
}) => {
  const watermarkAdded = useRef(false);
  const playerRef = useRef<Player | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const observerRef = useRef<MutationObserver | null>(null);

  const { url, type, token, poster, tracks } = src;

  function onRemoveWatermark(
    element: HTMLElement,
    onDetachCallback: () => void
  ) {
    const observer = (observerRef.current = new MutationObserver(function (
      mutations
    ) {
      mutations.forEach(function (mutationRecord) {
        if (
          // @ts-expect-error NOTE: using this to evade typescript error, since types are not properly defined for mutation observer
          mutationRecord?.target?.id === "videojs-watermark-1" ||
          // @ts-expect-error NOTE: using this to evade typescript error, since types are not properly defined for mutation observer
          mutationRecord?.addedNodes?.[0]?.id ===
            "__web-inspector-hide-shortcut-style__"
        ) {
          observer.disconnect();
          onDetachCallback();
        }
      });

      function isDetached(el: HTMLElement | ParentNode) {
        if (el.parentNode === document) {
          return false;
        } else if (el.parentNode === null) {
          return true;
        } else {
          return isDetached(el.parentNode);
        }
      }

      if (isDetached(element)) {
        observer.disconnect();
        onDetachCallback();
      }
    }));

    observer.observe(document, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style"],
    });
  }

  const onVideoPlay = useCallback(() => {
    if (!playerRef.current) return;
    if (onPlay) onPlay(playerRef.current);

    if (
      options &&
      options?.text &&
      !watermarkAdded.current &&
      options?.text.length > 0
    ) {
      watermarkAdded.current = true;
      playerRef.current.addChild("Watermark", {
        text: options?.text,
        className: animationInterval ? "twinkle" : null,
      });

      if (options && options?.text && options?.text.length > 0) {
        const watermark = document.getElementById("videojs-watermark-1");
        if (watermark)
          onRemoveWatermark(watermark, () => {
            if (videoRef.current) window.location.reload();
          });
      }
    }
  }, [onPlay, options, animationInterval]);

  const initializeDrmAndPlugins = useCallback(
    async (drmType: string) => {
      const player = playerRef.current;
      if (!player || !drmType || !url || !type || !token) return;
      const { licenseUri, fairplayCertUri } = pallyconDrmConfig;

      player.ready(function () {
        checkBrowser();
        let playerConfig;
        if ("FairPlay" === drmType) {
          playerConfig = {
            src: url,
            type,
            keySystems: {
              "com.apple.fps.1_0": {
                certificateUri: fairplayCertUri,
                licenseUri: licenseUri,
                certificateHeaders: {
                  "pallycon-customdata-v2": token,
                },
              },
            },
            emeHeaders: {
              "pallycon-customdata-v2": token,
            },
          };
        } else if ("PlayReady" === drmType) {
          playerConfig = {
            type,
            src: url,
            keySystems: {
              "com.microsoft.playready": licenseUri,
            },
            emeHeaders: {
              "pallycon-customdata-v2": token,
            },
          };
        } else if ("Widevine" === drmType) {
          playerConfig = {
            type,
            src: url,
            keySystems: {
              "com.widevine.alpha": licenseUri,
            },
            emeHeaders: {
              "pallycon-customdata-v2": token,
            },
          };
        } else {
          console.error("No DRM supported in this browser");
          return;
        }
        // NOTE: Executing all Video.js plugins
        // @ts-expect-error NOTE: player eme exists but it is not added to Videojs types yet, It is part of videojs-contrib-eme plugin
        if (player.eme instanceof Function) player.eme();
        // @ts-expect-error NOTE: player qualityLevels exists but it is not added to Videojs types yet, It is part of videojs-contrib-quality-levels plugin
        if (player.qualityLevels) player.qualityLevels();
        // @ts-expect-error NOTE: player httpSourceSelector exists but it is not added to Videojs types yet, It is part of videojs-http-source-selector plugin
        if (player.httpSourceSelector) player.httpSourceSelector();

        player.src(playerConfig);
        player.poster(poster || "");

        // @ts-expect-error NOTE: player textTracks exists, see more at - https://videojs.com/guides/text-tracks/
        player.textTracks()?.tracks_?.forEach((track: SubtitleTrack) => {
          player.removeRemoteTextTrack(track);
        });

        if (tracks) {
          tracks.forEach((track) => {
            player.addRemoteTextTrack(track);
          });
        }

        player.load();
      });
    },
    [url, type, token, poster, tracks]
  );

  const playVideo = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;

    player.on("play", onVideoPlay);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    player.on("contextmenu", (e: any) => {
      e.preventDefault();
    });

    player.on("fullscreenchange", () => {
      const isFullscreen = player.isFullscreen();
      if (!isFullscreen) {
        setTimeout(() => {
          videoRef.current?.scrollIntoView({ behavior: "auto" });
        }, 1000);
      }
    });
  }, [onVideoPlay]);

  useLayoutEffect(() => {
    let player: Player;
    if (playerRef.current) {
      player = playerRef.current;
      checkSupportedDRM().then(async (drmType) => {
        try {
          checkBrowser();
          await initializeDrmAndPlugins(drmType);
          onReady && onReady(player);
          playVideo();
        } catch (e) {
          // console.error(e);
        }
      });
    } else {
      if (!videoRef.current) return;
      checkSupportedDRM().then(async (drmType) => {
        // NOTE: Un-comment this to enable debugging
        // VideoJs.log.level("debug");

        if (!videoRef.current) return;
        if (options && options?.text && options?.text.length > 0)
          VideoJs.registerComponent("Watermark", Watermark);
        player = playerRef.current = VideoJs(
          videoRef.current,
          options,
          async () => {
            try {
              await initializeDrmAndPlugins(drmType);
              // @ts-expect-error NOTE: player hotkeys exists but it is not added to Videojs types yet, It is part of videojs-hotkeys plugin
              player.hotkeys({
                volumeStep: 0.1,
                seekStep: 10,
                enableModifiersForNumbers: false, // Disable using modifier keys for seeking by numbers
                enableInactiveFocus: false, // Prevent hotkeys from triggering when the player is not in focus
                enableVolumeScroll: false,
              });

              onReady && onReady(player);
              playVideo();
            } catch (e) {
              console.error(e);
            }
          }
        );
      });
    }
  }, [options, onReady, initializeDrmAndPlugins, onVideoPlay, playVideo]);

  useEffect(() => {
    const player = playerRef.current;
    return () => {
      if (player) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, [playerRef]);

  useEffect(() => {
    return () => {
      observerRef.current?.disconnect?.();
      observerRef.current = null;
    };
  }, [observerRef]);

  return (
    <div data-vjs-player>
      <video
        ref={videoRef}
        poster={poster}
        className="video-js vjs-default-skin vjs-big-play-centered"
        controls
      />
    </div>
  );
};

const MemoizedDrmPlayer = React.memo(DrmPlayer, (prev, next) => {
  const rerenderNeeded =
    prev.src.url === next.src.url &&
    prev.src.token === next.src.token &&
    prev.options === next.options;

  return rerenderNeeded;
});

export default MemoizedDrmPlayer;
