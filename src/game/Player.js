import KeyHandler from "./KeyHandler";
import Entity from "./abstract/Entity";

import Move from './actions/move'

class Player extends Entity {
  constructor(name, x, y) {
    super("Player", x, y, true);
    this.viewRadius = 8;
    this.keyLock = false;
    this.keyHandler = new KeyHandler();
    this.keyHandler.startEventHandler();
  }

  getAction() {
    if (this.action) {
      return this.action;
    }
    this.update();    
  }

  update(afterTurn) {
    if (this.keyLock) return false;

    const keys = this.keyHandler.getPressed();

    switch (true) {
      case keys.right:
        this.action = Move('east');
        break;
      case keys.left:        
        this.action = Move('west');
        break;
      case keys.up:
        this.action = Move('north');        
        break;
      case keys.down:
        this.action = Move('south');        
        break;
    }

    if (Object.values(keys).some(e => e)) {
      // this.keyLock = true;
      // setTimeout(() => {this.keyLock = false}, 0);
    }

  };

  render() {    
    const {ctx, pos, size} = this;
    ctx.fillStyle="#FF0000";
    ctx.fillRect(
      pos.x * size.width,
      pos.y * size.height,
      size.width,
      size.height
    );
  }
}

export default Player;