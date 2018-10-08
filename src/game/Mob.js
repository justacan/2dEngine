import Entity from './abstract/Entity';
import Move from './actions/move';
import _ from 'lodash'

const dirs = ['north', 'east', 'south', 'west'];

class Mob extends Entity {

  getAction() {    
    if (this.action) {
      return this.action;
    }
    this.action = Move(_.sample(dirs))
    
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