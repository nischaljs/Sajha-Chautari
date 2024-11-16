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

export interface User {
  id: string;
  nickname: string;
  avatarId: string | null;
  role: 'Admin' | 'Creator' | 'User';
  position?: Position;
  avatar?: {
    imageUrl: string | null;
  };
}

export interface Position {
  x: number;
  y: number;
}

export interface Element {
  id: string;
  name: string;
  width: number;
  height: number;
  imageUrl: string;
  static: boolean;
}

export interface SpaceElement {
  id: string;
  x: number;
  y: number;
  element: Element;
}

export interface Map {
  id: string;
  width: number;
  height: number;
  name: string;
  dropX: number;
  dropY: number;
  thumbnail: string;
  mapElements: MapElement[];
}

export interface MapElement {
  id: string;
  x: number;
  y: number;
  element: Element;
}

export interface SpaceDetailsResponse {
  id: string;
  name: string;
  capacity: number;
  elements: SpaceElement[];
  map: Map;
  creator: User;
  users: User[];
}


export interface GameState {
  users: {
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
  }[];
  position: Position;
  connected: boolean;
  error: string;
  map: Map | null;
  elements: SpaceElement[];
  spaceDetails: SpaceDetailsResponse | null;
  currentUserId: string;
}

export interface SocketResponse<T> {
  success: boolean;
  error?: string;
  data?: T;
}