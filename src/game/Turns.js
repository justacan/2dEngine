export default class Turns {
  constructor(entities, getTile) {
    this.entities = entities;
    this.turn = 0;
    this.index = 0;
    this.getTile = getTile;
    // this.wait = false;
  }

  advanceTurn() {
    this.turn++
  }

  actionHandler(action, actor) {
    switch (action.name) {
      case 'MOVE':        
        const moveTile = this.getTile(actor.pos.x + action.dir.x, actor.pos.y + action.dir.y);
        if (!moveTile.canWalk) return false;        
        actor.pos.x += action.dir.x
        actor.pos.y += action.dir.y
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
    console.log("INDEX:", this.index)    
    if (this.index === 0) console.log('your turn')      
  }

}