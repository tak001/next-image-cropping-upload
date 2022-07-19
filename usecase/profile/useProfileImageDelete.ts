import { ProfileResponse } from "entity/profile/profileImageDelete";
import baseHttpClient from "infrastructure/httpClient";

export const useProfileImageDelete = () => {
  const profileImageDeleteHandler = async () => {
    const response = await baseHttpClient.delete<ProfileResponse>(
      `/api/image`
    );

    return response?.data;
  };

  return {
    profileImageDeleteHandler,
  };
};
