const browser = "Non-DRM browser";
let drmType = "No DRM";

export const pallyconDrmConfig = {
  browser,
  drmType,
  licenseUri: import.meta.env.VITE_LICENSE_URI,
  widevineToken: import.meta.env.VITE_WIDEVINE_TOKEN,
  playreadyToken: import.meta.env.VITE_PLAYREADY_TOKEN,
  fairplayToken: import.meta.env.VITE_FAIRPLAY_TOKEN,
  fairplayCertUri: import.meta.env.VITE_FAIRPLAY_CERT_URI,
  fairplayCertDerUri: import.meta.env.VITE_FAIRPLAY_CERT_DER_URI,
};

// NOTE: Detect the browser and set proper DRM type
export function checkBrowser() {
  const name = navigator.appName;
  let agent: string | RegExpExecArray | null =
      navigator.userAgent.toLowerCase(),
    browser;

  if (
    name === "Microsoft Internet Explorer" ||
    agent.indexOf("trident") > -1 ||
    agent.indexOf("edge/") > -1
  ) {
    browser = "ie";
    if (name === "Microsoft Internet Explorer") {
      // IE old version (IE 10 or Lower)
      agent = /msie ([0-9]{1,}[0-9]{0,})/.exec(agent);
      // browser += parseInt(agent[1]);
    } else if (agent.indexOf("edge/") > -1) {
      // Edge
      browser = "Edge";
    }
  } else if (agent.indexOf("safari") > -1) {
    // Chrome or Safari
    if (agent.indexOf("opr") > -1) {
      // Opera
      browser = "Opera";
    } else if (agent.indexOf("whale") > -1) {
      // Chrome
      browser = "Whale";
    } else if (agent.indexOf("edg/") > -1 || agent.indexOf("Edge/") > -1) {
      // Chrome
      browser = "Edge";
    } else if (agent.indexOf("chrome") > -1) {
      // Chrome
      browser = "Chrome";
    } else {
      // Safari
      browser = "Safari";
    }
  } else if (agent.indexOf("firefox") > -1) {
    // Firefox
    browser = "firefox";
  }

  // The below three lines are for the sample code only. May need to be removed.
  const result = "Running in " + browser + ". " + drmType + " supported.";
  console.log(result);

  return browser;
}

// checks which DRM is supported by the browser
export async function checkSupportedDRM() {
  const config = [
    {
      initDataTypes: ["cenc"],
      audioCapabilities: [
        {
          contentType: 'audio/mp4;codecs="mp4a.40.2"',
          robustness: "SW_SECURE_CRYPTO",
        },
      ],
      videoCapabilities: [
        {
          contentType: 'video/mp4;codecs="avc1.42E01E"',
          robustness: "SW_SECURE_CRYPTO",
        },
      ],
    },
  ];

  const drm = {
    Widevine: {
      name: "Widevine",
      mediaKey: "com.widevine.alpha",
    },
    PlayReady: {
      name: "PlayReady",
      mediaKey: "com.microsoft.playready",
    },
    FairPlay: {
      name: "FairPlay",
      mediaKey: "com.apple.fps.1_0",
    },
  };

  let supportedDRMType = "";
  for (const key in drm) {
    try {
      await navigator
        // @ts-expect-error NOTE: evading typescript to allow keys as strings
        .requestMediaKeySystemAccess?.(drm[key].mediaKey, config)
        // eslint-disable-next-line no-loop-func
        .then(() => {
          // @ts-expect-error NOTE: evading typescript to allow keys as strings
          supportedDRMType = drm[key].name;
        })
        .catch((e) => {
          console.error(e);
        });
    } catch (e) {
      console.error(e);
    }
    drmType = supportedDRMType;
  }

  console.log("Supported DRM type: " + supportedDRMType);
  return supportedDRMType;
}
