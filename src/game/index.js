import Mob from './Mob';
import Player from './Player'
import Turns from './Turns';
import Map from './Dungeon';






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

    this.map = new Map(this.canvas, this.ctx);
    // this.map.registerCanvas(this.canvas, this.ctx);
    this.map.generate();

    requestAnimationFrame(() => this.loop())
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

    requestAnimationFrame(() => this.loop());
  }

}

export default (canvas, ctx) => {
  return new Game(canvas, ctx);
}