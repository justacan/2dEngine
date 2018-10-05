import Mob from './Mob';
import Player from './Player'
import Dungeon from './Dungeon';

class Turns {
  constructor(entities) {
    this.entities = entities;
    this.turn = 0;
    this.index = 0;
    // this.wait = false;
  }

  advanceTurn() {
    this.turn++
  }

  update() {
    // if (this.wait) return false;
    this.entities[this.index].update(() => this.afterTurn());
  }

  afterTurn() {

    this.index++;
    // this.wait = false;

    if (this.index >= this.entities.length) {
      this.index = 0;
      console.log('your turn')
      this.turn++;
      return;
    }

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
    this.map = [];

  }

  clearScreen() {
    this.ctx.clearRect(0,0,this.canvas.width, this.canvas.height);
  }

  load() {

    let tt = []

    const player = Player('Player', 10, 10);
    player.registerCanvas(this.canvas, this.ctx);

    let m = Mob('Yolo', 2, 2);
    m.registerCanvas(this.canvas, this.ctx);

    tt.push(player);
    tt.push(m);

    this.turnTakers = new Turns(tt);

    // this.makeGrid();
    const d = new Dungeon();
    d.Generate();
    this.map = d.map;
    console.log(this.map)

    requestAnimationFrame(() => this.loop())
  }

  //7a4207
  makeGrid() {
    this.map = [];

    const width = this.canvas.width / 16;
    const height = this.canvas.height / 16;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (!this.map[y]) {this.map[y] = []}
        this.map[y][x] = ( Math.round(Math.random() * 100 + 1) > 90 ) ? 1 : 0 ;
      }
    }
    console.log(this.map)
  }

  line(x0, y0, x1, y1){
   var dx = Math.abs(x1-x0);
   var dy = Math.abs(y1-y0);
   var sx = (x0 < x1) ? 1 : -1;
   var sy = (y0 < y1) ? 1 : -1;
   var err = dx-dy;

   while(true){
     this.setPixel(x0,y0, 4);  // Do what you need to for this

     if ((x0==x1) && (y0==y1)) break;
     var e2 = 2*err;
     if (e2 >-dy){ err -= dy; x0  += sx; }
     if (e2 < dx){ err += dx; y0  += sy; }
   }
  }

  setPixel(x, y, toWhat) {
    this.map[y][x] = toWhat
  }

  grid() {

    const width = this.canvas.width / 16;
    const height = this.canvas.height / 16;
    const size = 16;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (this.map[y][x] === 1 ) {
          this.ctx.fillStyle="#7a4207";
          this.ctx.fillRect(x * size,y * size,size,size);
        }
        if (this.map[y][x] === 2 ) {
          this.ctx.fillStyle="#1449ce";
          this.ctx.fillRect(x * size,y * size,size,size);
        }
        if (this.map[y][x] === 4 ) {
          this.ctx.fillStyle="#f2da02";
          this.ctx.fillRect(x * size,y * size,size,size);
        }
        if (this.map[y][x] === 0 ) {
          continue;
          this.ctx.strokeStyle="#266ee2";
          this.ctx.lineWidth=1;
          this.ctx.strokeRect(x * size,y * size,size,size);
        }

      }
    }



  }

  loop() {
    this.clearScreen();

    this.time.now = Date.now();
    const delta = (this.time.now - this.time.then) / 1000;
    this.time.then = this.time.now;

    this.grid();

    this.line(
      this.turnTakers.entities[0].pos.x,
      this.turnTakers.entities[0].pos.y,
      this.turnTakers.entities[1].pos.x,
      this.turnTakers.entities[1].pos.y
    );

    this.turnTakers.update();
    this.turnTakers.entities.forEach(tt => {
      tt.render();
    });

    requestAnimationFrame(() => this.loop());
  }

}

export default (canvas, ctx) => {
  return new Game(canvas, ctx);
}