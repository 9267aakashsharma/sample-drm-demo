import VideoJs from "video.js";
import Player from "video.js/dist/types/player";

// Get the Component base class from Video.js
const Component = VideoJs.getComponent("Component");

class Watermark extends Component {
  // The constructor of a component receives two arguments: the
  // player it will be associated with and an object of options.
  constructor(
    player: Player,
    options: {
      text: string;
      className?: string;
    } = {
      text: "",
      className: "",
    }
  ) {
    // It is important to invoke the superclass before anything else,
    // to get all the features of components out of the box!
    super(player, options);

    // If a `text` option was passed in, update the text content of
    // the component.
    if (options) {
      this.updateTextContent(options.text, options.className);
    }
  }

  // The `createEl` function of a component creates its DOM element.
  createEl() {
    return VideoJs.dom.createEl("div", {
      // Prefixing classes of elements within a player with "vjs-"
      // is a convention used in Video.js.
      className: "vjs-title-bar noselect",
      id: "videojs-watermark-1",
    });
  }

  // This function could be called at any time to update the text
  // contents of the component.
  updateTextContent(text: string, className?: string) {
    // Use Video.js utility DOM methods to manipulate the content
    // of the component's element.
    if (className && typeof className === "string")
      this.el().classList.add(className);
    VideoJs.dom.emptyEl(this.el());
    VideoJs.dom.appendContent(this.el(), text);
  }
}

export default Watermark;
