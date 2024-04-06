import axios from "axios";

const baseUrl = import.meta.env.VITE_SERVER_URL;

export const getLessonVideoToken = ({
  contentId,
  token,
}: {
  contentId: string;
  token: string;
}) => {
  return axios.post(
    `${baseUrl}api/media_convert/v1/get_pallycon_token`, // NOTE: this can be different, based on how you implement your backend API
    {
      content_id: contentId,
    },
    {
      headers: {
        Authorization: token,
        platform: "web",
      },
    }
  );
};
