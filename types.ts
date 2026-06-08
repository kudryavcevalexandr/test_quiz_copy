export interface BlockItem {
  id: string;
  title: string;
}

export interface Category {
  id: string;
  title: string;
  items: BlockItem[];
}

export interface Tile extends BlockItem {
  instanceId: string;
}

export interface DragGesture {
  dx: number;
  dy: number;
  vx: number;
  vy: number;
}
