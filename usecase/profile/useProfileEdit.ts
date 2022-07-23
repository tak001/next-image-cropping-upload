import baseHttpClient from "infrastructure/httpClient";
import { ProfileEditFormInput } from "components/profile/edit/types/form";
import { ProfileRequest, ProfileResponse } from "entity/profile/profilePut";

export const useProfileEdit = () => {
  const profileEditHandler = async (data: ProfileEditFormInput) => {
    const request: ProfileRequest = {
      introduction: data.introduction,
      counsellingTime: data.counsellingTime,
      visitableArea: data.visitableArea,
      strongAreaCodes: data.strongAreaCodes,
    };
    // TODO: ちゃんとした設計にする
    const response = await baseHttpClient.put<ProfileResponse>(
      `/api/profile`,
      request
    );

    return response?.data;
  };

  return {
    profileEditHandler,
  };
};
