import Mob from './Mob';
import Player from './Player'
import Turns from './Turns';
import Dungeon from './Dungeon';

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
    this.Dungeon;
    this.gui = new GUI(this.canvas, this.ctx);

  }

  clearScreen() {
    this.ctx.clearRect(0,0,this.canvas.width, this.canvas.height);
  }

  load() {

    let tt = [];

    this.Dungeon = new Dungeon(this.canvas, this.ctx);   
    // this.map.mapSize(50, 50);
    this.Dungeon.generate();
    // this.map.testGenerate();

    const firstRoom = this.Dungeon.rooms[0];

    const player = new Player('Player', firstRoom.center.x, firstRoom.center.y);
    player.registerCanvas(this.canvas, this.ctx);    

    
    this.Dungeon.getMask(player)
    this.Dungeon.updateMask(player);
    
    tt.push(player);

    for (let i = 1; i < 5; i++) {
      const room = this.Dungeon.rooms[i];
      let m = new Mob('Yolo', room.center.x, room.center.y);
      m.registerCanvas(this.canvas, this.ctx);
      tt.push(m);
    }
    

    this.turnTakers = new Turns(tt, this.Dungeon);

    requestAnimationFrame(() => this.loop())
  }

  loop() {
    this.clearScreen();

    this.time.now = Date.now();
    const delta = (this.time.now - this.time.then) / 1000;
    this.time.then = this.time.now;
    const player = this.turnTakers.entities[0];
    this.Dungeon.render();
    this.Dungeon.getMask(player);
    this.Dungeon.updateMask(player);
    this.Dungeon.renderMask();

    
    this.turnTakers.entities.forEach(tt => {
      tt.update();
    })
    this.turnTakers.update();
    for (let tt of this.turnTakers.entities) {
      if (tt === player) {
        tt.render();
        continue;
      }
      if (_.find(player.canSee, e => e.x === tt.pos.x && e.y === tt.pos.y))  {
        tt.render();
      }
      
    }

    this.gui.render();
    

    requestAnimationFrame(() => this.loop());
  }

}

export default (canvas, ctx) => {
  return new Game(canvas, ctx);
}