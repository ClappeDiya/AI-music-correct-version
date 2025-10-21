export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  canvas: HTMLCanvasElement;
  opacity: number;
}

export class LayerManager {
  private layers: Layer[] = [];
  private activeLayerId: string | null = null;

  constructor(private width: number, private height: number) {
    // Create default layer
    this.addLayer("Background");
  }

  addLayer(name: string): Layer {
    const canvas = document.createElement('canvas');
    canvas.width = this.width;
    canvas.height = this.height;

    const layer: Layer = {
      id: crypto.randomUUID(),
      name,
      visible: true,
      locked: false,
      canvas,
      opacity: 1,
    };

    this.layers.push(layer);
    this.activeLayerId = layer.id;
    return layer;
  }

  getLayer(id: string): Layer | undefined {
    return this.layers.find(layer => layer.id === id);
  }

  getActiveLayer(): Layer | undefined {
    return this.layers.find(layer => layer.id === this.activeLayerId);
  }

  setActiveLayer(id: string) {
    const layer = this.getLayer(id);
    if (layer && !layer.locked) {
      this.activeLayerId = id;
    }
  }

  toggleLayerVisibility(id: string) {
    const layer = this.getLayer(id);
    if (layer) {
      layer.visible = !layer.visible;
    }
  }

  setLayerOpacity(id: string, opacity: number) {
    const layer = this.getLayer(id);
    if (layer) {
      layer.opacity = Math.max(0, Math.min(1, opacity));
    }
  }

  moveLayer(id: string, direction: 'up' | 'down') {
    const index = this.layers.findIndex(layer => layer.id === id);
    if (index === -1) return;

    if (direction === 'up' && index < this.layers.length - 1) {
      [this.layers[index], this.layers[index + 1]] = [this.layers[index + 1], this.layers[index]];
    } else if (direction === 'down' && index > 0) {
      [this.layers[index], this.layers[index - 1]] = [this.layers[index - 1], this.layers[index]];
    }
  }

  deleteLayer(id: string) {
    const index = this.layers.findIndex(layer => layer.id === id);
    if (index === -1 || this.layers.length === 1) return;

    this.layers.splice(index, 1);
    if (this.activeLayerId === id) {
      this.activeLayerId = this.layers[this.layers.length - 1].id;
    }
  }

  composeLayers(targetCanvas: HTMLCanvasElement) {
    const ctx = targetCanvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, this.width, this.height);

    this.layers.forEach(layer => {
      if (!layer.visible) return;

      ctx.globalAlpha = layer.opacity;
      ctx.drawImage(layer.canvas, 0, 0);
    });

    ctx.globalAlpha = 1;
  }
} 