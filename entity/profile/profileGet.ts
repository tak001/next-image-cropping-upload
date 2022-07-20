// TODO: ちゃんとした設計にする
export interface StrongArea {
  code: string;
  name: string;
}

export interface Specialty {
  code: string;
  name: string;
}

export interface ProfileResponse {
  specialist: {
    id: string;
    name: string;
    introduction: string;
    counsellingTime: string;
    visitableArea: string;
    imagePath: string;
    strongAreas: StrongArea[];
    specialty: Specialty;
  };
}
