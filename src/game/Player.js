import KeyHandler from "./KeyHandler";
import Entity from "./abstract/Entity";


const Player = (name, x, y) => {
  let state = Entity(name, x, y);

  state.keyLock = false;

  const keyHandler = new KeyHandler();
  keyHandler.startEventHandler();
  state.keyHandler = keyHandler;

  state.render = () => {
    const {ctx, pos, size} = state;
    ctx.fillStyle="#FF0000";
    ctx.fillRect(
      pos.x * size.width,
      pos.y * size.height,
      size.width,
      size.height
    );
  };

  state.update = (afterTurn) => {

    if (state.keyLock) return false;

    const keys = state.keyHandler.getPressed();
    switch (true) {
      case keys.right:
        state.pos.x++;
        break;
      case keys.left:
        state.pos.x--;
        // afterTurn();
        break;
      case keys.up:
        state.pos.y--;
        // afterTurn();
        break;
      case keys.down:
        state.pos.y++;
        // afterTurn();
        break;
    }

    if (Object.values(keys).some(e => e)) {
      state.keyLock = true;
      setTimeout(() => {state.keyLock = false}, 150);
      afterTurn();
    }

  };

  return Object.assign(state)
};

//   update(canvas, ctx, delta) {
//
//
//     if (state.keyLock && Object.values(keys).every(e => !e)) {
//       state.keyLock = false;
//     }
//
//     if (state.keyLock) return false;
//

//   }

export default Player;