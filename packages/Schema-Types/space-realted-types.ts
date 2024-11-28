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
    users: User[];
  }
  
  export interface User {
    id: string;
    email: string;
    nickname: string;
    avatarId?: string;
    lastMoveTimestamp?: number;
    role?: 'Admin' | 'Creator' | 'User';
    position?: Position;
    avatar?: {
      id: string;
      imageUrl?: string;
      name?: string;
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
  
  export interface SpaceElements extends Element {
    x: number;
    y: number;
  }
  
  export interface GameMap {
    id: string;
    width: number;
    height: number;
    name: string;
    dropX: number;
    dropY: number;
    thumbnail: string;
    mapElements: MapElement[];
  }
  
  export interface MapElement extends Element {
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
    map: GameMap;
    creator: User;
    users: User[];
  }
  
  export interface GameState {
    users: User[];
    position: Position;
    connected: boolean;
    error: string;
    map: GameMap | null;
    elements: SpaceElements[];
    spaceDetails: SpaceDetailsResponse | null;
    currentUserId: string;
  }
  
  export interface SocketResponse<T> {
    success: boolean;
    error?: string;
    data?: T;
  }
  

  
  export interface Element {
    id: string;
    name: string;
    imageUrl: string;
    width: number;
    height: number;
    static: boolean;
}

export interface MapElement {
    element: Element;
    elementId: string;
    id: string;
    mapId: string;
    x: number;
    y: number;
}

export interface CanvasItem {
    id?: string;
    unique_elemID: string;
    elementId?: string;
    element: Element;
    position: { x: number; y: number };
    width: number;
    height: number;
}