export default class Turns {
  constructor(entities, map) {
    this.entities = entities;
    this.turn = 0;
    this.index = 0;
    this.map = map;
    // this.wait = false;
  }

  advanceTurn() {
    this.turn++
  }

  actionHandler(action, actor) {
    switch (action.name) {
      case 'MOVE':        
        const moveTile = this.map.getTile(actor.pos.x + action.dir.x, actor.pos.y + action.dir.y);
        if (!moveTile.canWalk) return false;

        if (moveTile.type === 'door' && !moveTile.open) {
          console.log('Opening Door')
          this.map.setDoor(moveTile, 'open');
        } else {
          actor.pos.x += action.dir.x;
          actor.pos.y += action.dir.y;
        }

        if (actor.isPlayer) {
          this.map.updateMask(actor.pos.x, actor.pos.y)
        }

        return true;
    }

  }

  update() {    
    const actor = this.entities[this.index];    
    const action = actor.getAction()
    if ( action ) {      
      actor.action = false;
      const success = this.actionHandler(action, actor);      
      if (success) {
        this.nextTurn();
      }      
    }
    
  }

  nextTurn() {
    this.turn++;
    this.index = (this.index + 1) % (this.entities.length)
    // console.log("INDEX:", this.index)
    // if (this.index === 0) console.log('your turn')
  }

}