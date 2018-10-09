import Mob from './Mob';
import Player from './Player'
import Turns from './Turns';
import Map from './Dungeon';

class GUI {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.startX = 801
  }

  render() {
    const {ctx} = this;
    ctx.strokeStyle="#ff0800"
    ctx.beginPath();
    ctx.moveTo(this.startX,0);
    ctx.lineTo(this.startX,this.canvas.height);
    ctx.stroke();
  }
}

class Game {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.time = {
      now: Date.now(),
      then: Date.now()
    };
    this.turnTakers;
    this.map;
    this.gui = new GUI(this.canvas, this.ctx);

  }

  clearScreen() {
    this.ctx.clearRect(0,0,this.canvas.width, this.canvas.height);
  }

  load() {

    let tt = [];

    this.map = new Map(this.canvas, this.ctx);   
    // this.map.mapSize(50, 50);
    this.map.generate();
    // this.map.testGenerate();



    const firstRoom = this.map.rooms[0];

    const player = new Player('Player', firstRoom.center.x, firstRoom.center.y);
    player.registerCanvas(this.canvas, this.ctx);    

    tt.push(player);
    this.map.updateMask(player);

    for (let i = 1; i < 5; i++) {
      const room = this.map.rooms[i];
      let m = new Mob('Yolo', room.center.x, room.center.y);
      m.registerCanvas(this.canvas, this.ctx);
      tt.push(m);
    }
    

    this.turnTakers = new Turns(tt, this.map);

    requestAnimationFrame(() => this.loop())
  }

  setPixel(x, y, toWhat) {
    this.map[y][x] = toWhat
  }

  loop() {
    this.clearScreen();

    this.time.now = Date.now();
    const delta = (this.time.now - this.time.then) / 1000;
    this.time.then = this.time.now;

    this.map.render();

    // this.grid();

    // this.line(
    //   this.turnTakers.entities[0].pos.x,
    //   this.turnTakers.entities[0].pos.y,
    //   this.turnTakers.entities[1].pos.x,
    //   this.turnTakers.entities[1].pos.y
    // );
    //
    this.turnTakers.update();
    this.turnTakers.entities.forEach(tt => {
      tt.render();
    });

    this.gui.render();
    this.map.renderMask();

    requestAnimationFrame(() => this.loop());
  }

}

export default (canvas, ctx) => {
  return new Game(canvas, ctx);
}