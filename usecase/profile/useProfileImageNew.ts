import { ProfileResponse } from "entity/profile/profileImagePost";
import baseHttpClient from "infrastructure/httpClient";

export const useProfileImageNew = () => {
  const profileImageNewHandler = async (formData: FormData) => {
    // TODO: 簡易的なレイヤーのためちゃんとした設計にする
    const response = await baseHttpClient.post<ProfileResponse>(
      `/api/image-delete`,
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
