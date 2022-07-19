export interface ProfileRequest {
  introduction: string;
  counsellingTime: string;
  visitableArea: string;
  strongAreaCodes: string[];
}

export interface ProfileResponse {
  message: string;
}
