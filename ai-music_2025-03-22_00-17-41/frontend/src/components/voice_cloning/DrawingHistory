export class DrawingHistory {
  private states: ImageData[] = [];
  private currentIndex = -1;
  private maxStates = 50;

  constructor(private canvas: HTMLCanvasElement) {}

  saveState() {
    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;

    // Remove any states after current index if we're in middle of history
    if (this.currentIndex < this.states.length - 1) {
      this.states = this.states.slice(0, this.currentIndex + 1);
    }

    // Add new state
    const state = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    this.states.push(state);
    this.currentIndex++;

    // Remove oldest state if we exceed max
    if (this.states.length > this.maxStates) {
      this.states.shift();
      this.currentIndex--;
    }
  }

  undo() {
    if (this.currentIndex <= 0) return false;

    this.currentIndex--;
    this.restoreState();
    return true;
  }

  redo() {
    if (this.currentIndex >= this.states.length - 1) return false;

    this.currentIndex++;
    this.restoreState();
    return true;
  }

  private restoreState() {
    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;

    ctx.putImageData(this.states[this.currentIndex], 0, 0);
  }

  clear() {
    this.states = [];
    this.currentIndex = -1;
  }
} 