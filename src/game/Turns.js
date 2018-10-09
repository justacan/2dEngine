export default class Turns {
  constructor(entities, Dungeon) {
    this.entities = entities;
    this.turn = 0;
    this.index = 0;
    this.Dungeon = Dungeon;
    // this.wait = false;
  }

  advanceTurn() {
    this.turn++
  }

  actionHandler(action, actor) {
    switch (action.name) {
      case 'MOVE':        
        const moveTile = this.Dungeon.map.getCell(actor.pos.x + action.dir.x, actor.pos.y + action.dir.y);

        if (!moveTile.value.canWalk) {
          this.nextTurn();
          return false;
        };

        if (moveTile.value.type === 'door' && !moveTile.value.open) {
          console.log('Opening Door')
          this.Dungeon.setDoor(moveTile, 'open');
        } else {
          actor.pos.x += action.dir.x;
          actor.pos.y += action.dir.y;
        }

        if (actor.isPlayer) {
          // this.Dungeon.updateMask(actor)
        }

        return true;
    }

  }

  update() {    
    const actor = this.entities[this.index];    
    const action = actor.getAction()    
    // console.log(actor.name, action)
    if ( action ) {      
      actor.clearAction();
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