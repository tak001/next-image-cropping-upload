import { ProfileResponse } from "entity/profile/profileImagePost";
import baseHttpClient from "infrastructure/httpClient";

export const useProfileImageNew = () => {
  const profileImageNewHandler = async (formData: FormData) => {
    // TODO: ちゃんとした設計にする
    const response = await baseHttpClient.post<ProfileResponse>(
      `/api/image`,
      formData,
      {
        headers: {
          "content-type": "multipart/form-data",
        },
      }
    );

    return response?.data;
  };

  return {
    profileImageNewHandler,
  };
};
