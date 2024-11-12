export interface Space {
    id: string;
    name: string;
    description?: string;
    capacity: number;
    creator: {
      id: string;
      email: string;
      nickname: string;
    };
    map: {
      thumbnail: string;
    };
    users: any[];
  }