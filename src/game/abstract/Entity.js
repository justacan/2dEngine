const width = 16;
const height = 16;

export default class Entity {
  constructor(name = 'Unnamed', x = 0, y = 0, isPlayer = false) {
    this.name = name;
    this.pos = {x,y};
    this.isPlayer = isPlayer
    this.size = {width, height};
    this.action = false;
    this.canSee = [];
    this.canvas;
    this.ctx;
    this.Dungeon;
  }

  registerCanvas(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
  }

  registerDungeon(Dungeon) {
    this.Dungeon = Dungeon;
  }

  getAction() {}
  update() {}
  render() {}  
}