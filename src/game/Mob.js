import Entity from './abstract/Entity';
import Move from './actions/move';
import _ from 'lodash'

const dirs = ['north', 'east', 'south', 'west'];

class Mob extends Entity {

  constructor(name, x, y){
    super(name, x, y);
    this.viewRadius = 8;
    this.playerPos = {x: 0, y: 0}
  }

  registerPlayerPos(posObj) {
    this.playerPos = posObj;
  }

  getAction() {    
    if (this.action) {
      return this.action;
    }
  }

  clearAction() {
    this.action = false;
  }

  update() {    
    // console.log(this.pos, this.playerPos)
    this.action = {name: 'LOCATE_PLAYER'}
    // this.action = Move(_.sample(dirs));
  }

  render() {
    const {ctx, pos, size} = this;
    ctx.fillStyle="#c226e2";
    ctx.fillRect(
      pos.x * size.width,
      pos.y * size.height,
      size.width,
      size.height
    );
  };
}




  

  

  


export default Mob;