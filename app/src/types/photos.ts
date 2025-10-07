export interface APIMember {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export interface APIPhotoBase {
  url: string;
  width: number;
  height: number;
  position: number;
  centerX: number;
  centerY: number;
}

export interface APIPhoto extends APIPhotoBase {
  id: string;
  memberId: number;
}


