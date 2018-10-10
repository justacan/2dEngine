import Mob from './Mob';
import Player from './Player'
import Turns from './Turns';
import Dungeon from './Dungeon';

import config from './config';

const getDistance = ( x1, y1, x2, y2 ) => {	
	let 	xs = x2 - x1;
  let ys = y2 - y1;			
	xs *= xs;
	ys *= ys;	 
	return Math.sqrt( xs + ys );
};

class Effect {
  constructor(x, y) {
    
    this.x = x;
    this.y = y;        
    this.startSize = 10;    
    this.endSize = 250;    
    this.size = this.startSize;
    this.frameCount = 0;
    this.index = 1;
    this.delta = 0
  }

  update(delta) {    
    this.size = this.size + delta * 150
    this.delta += delta;    
  }

  render(ctx) {    
    const {x, y, size, endSize} = this;
    const {tileSize} = config;           
    
    if (size > endSize) return false;

    ctx.strokeStyle='#ef4a13'
    ctx.lineWidth = 1      

    const spacing = 25

    for (let i = 1; i < 4; i++) {
      ctx.strokeRect(
        x * tileSize - (size / 2) + (tileSize/2) - (i * spacing / 2), 
        y * tileSize - (size / 2) + (tileSize/2) - (i * spacing / 2), 
        size + (i * spacing),
        size + (i * spacing)
      );

    }

    return true;
    
  }
}

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
    this.effects = [];
    this.gui = new GUI(this.canvas, this.ctx);

  }

  clearScreen() {
    this.ctx.clearRect(0,0,this.canvas.width, this.canvas.height);
  }

  addEffect(x, y) {
    this.effects.push(new Effect(x, y))
  }

  load() {

    let tt = [];

    this.Dungeon = new Dungeon(this);   
    // this.map.mapSize(50, 50);
    this.Dungeon.generate();
    // this.map.testGenerate();

    const firstRoom = this.Dungeon.rooms[0];

    const player = new Player('Player', firstRoom.center.x, firstRoom.center.y);
    player.registerCanvas(this.canvas, this.ctx);  
    player.registerDungeon(this.Dungeon);

    
    this.Dungeon.getMask(player)
    this.Dungeon.updateMask(player);
    
    tt.push(player);

    for (let i = 0; i < this.Dungeon.rooms.length; i++) {
      if (i === 0) continue;
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
    // this.Dungeon.getMask(player);
    this.Dungeon.updateMask(player);
    this.Dungeon.renderMask();

    this.effects.forEach((e, i, a) => {
      e.update(delta);
      const stillGoing = e.render(this.ctx);
      if (!stillGoing) a.splice(i, 1);
    });
    
    
    this.turnTakers.entities.forEach(tt => {
      this.Dungeon.getMask(tt);      
      tt.update();
    })

    this.turnTakers.update();

    for (let tt of this.turnTakers.entities) {
      if (tt === player) {
        tt.render();
        continue;
      }
      if (getDistance(player.pos.x, player.pos.y, tt.pos.x, tt.pos.y) > player.viewRadius) continue;
      if (_.find(player.canSee, e => e.x === tt.pos.x && e.y === tt.pos.y))  {
        tt.render();
      }      
    }

    // this.test(player, this.ctx);
    // this.gui.render();
    
    requestAnimationFrame(() => this.loop());
  }

  test(player, ctx) {
    const {tileSize} = config;
    const {x,y} = player.pos;    
    const size = 60;
    const spacing = 25;    

    ctx.strokeStyle='#ef4a13'
    ctx.lineWidth = 1;

    for (let i = 1; i < 4; i++) {
      ctx.strokeRect(
        x * tileSize - (size / 2) + (tileSize/2) - (i * spacing / 2), 
        y * tileSize - (size / 2) + (tileSize/2) - (i * spacing / 2), 
        size + (i * spacing),
        size + (i * spacing)
      );
    }   

  }

}

export default (canvas, ctx) => {
  return new Game(canvas, ctx);
}