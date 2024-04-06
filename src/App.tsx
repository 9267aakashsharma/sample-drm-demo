import React, { useCallback, useEffect, useState } from "react";
import Player from "video.js/dist/types/player";

import { getLessonVideoToken } from "./api";
import { defaultVideoJsOptions } from "./components/DrmPlayer/constants";

const VideoPlayer = React.lazy(
  () => import("./components/DrmPlayer/DrmPlayer")
);

function App() {
  const [token, setToken] = useState();

  const fetchLessonToken = useCallback(async () => {
    try {
      const { data, status } = await getLessonVideoToken({
        // NOTE: payload of this api may differ based on your server implementation which will talk to the DRM service to provide you with the token
        contentId: "", // TODO: add your content id here (each video will have a unique content id)
        token: "", // TODO: add your authorized token here
      });

      if (data && data.token && status === 200) {
        setToken(data.token);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  const handlePlay = (player: Player) => {
    console.log("Player is playing", player);
  };

  useEffect(() => {
    fetchLessonToken();
  }, [fetchLessonToken]);

  return (
    <>
      <h1>DRM sample video</h1>
      {token ? (
        <div className="w-2/3">
          <VideoPlayer
            options={{
              ...defaultVideoJsOptions,
              text: "This is a DRM protected video",
            }}
            onPlay={handlePlay}
            src={{
              type: "application/dash+xml",
              url: "", // TODO: add your encrypted DRM video url here (format should be mpd, m3u8 etc)
              token,
              poster: "", // TODO: (optional) add link to video thumbnail
            }}
            animationInterval={false}
          />
        </div>
      ) : (
        <p>loading...</p>
      )}
    </>
  );
}

export default App;
