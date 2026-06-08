export interface CatalogBlock {
  id: string;
  name: string;
}

export interface CatalogCategory {
  id: string;
  name: string;
  blocks: CatalogBlock[];
}

export interface Tile extends CatalogBlock {
  instanceId: string;
}

export interface DragGesture {
  dx: number;
  dy: number;
  vx: number;
  vy: number;
}
