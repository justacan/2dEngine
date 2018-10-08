const width = 16;
const height = 16;

export default class Entity {
  constructor(name = 'Unnamed', x = 0, y = 0) {
    this.name = name;
    this.pos = {x,y};
    this.size = {width, height};
    this.action = false;
    this.canvas;
    this.ctx;
  }

  registerCanvas(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
  }

  getAction() {}
  update() {}
  render() {}  
}