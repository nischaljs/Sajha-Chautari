export interface User {
    id: string;
    email: string;
    nickname: string;
    avatarId?: string;
    position?: {
      x: number;
      y: number;
    };
    avatar?: {
      id: string;
      imageUrl?: string;
      name?: string;
    };
  }