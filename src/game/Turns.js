import Move from './actions/move';

function handleMove(actor, action) {

}

export default class Turns {
  constructor(entities, Dungeon) {
    this.entities = entities;
    this.turn = 0;
    this.index = 0;
    this.Dungeon = Dungeon;
    this.player = this.entities[0];
    // this.wait = false;
  }

  advanceTurn() {
    this.turn++
  }

  actionHandler(action, actor) {
    if (actor.name === 'Player') console.log(actor.name, action.name)
    switch (action.name) {
      case 'LOCATE_PLAYER':
      this.nextTurn();
      return false;
      const path = this.Dungeon.map.findPath(actor.pos.x, actor.pos.y, this.player.pos.x, this.player.pos.y);      
      if (path.length) {
        const x = path[0].x - actor.pos.x;
        const y = path[0].y - actor.pos.y
        this.action = Move({x, y})
      } else {
        return true;
        // actor.action = {name: 'SKIP'};
      }
        
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
        
      case 'SKIP': return true;
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