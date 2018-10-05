import hasTurns from './abstract/hasTurns';
import Entity from './abstract/Entity';

const Mob = (name, x, y) => {

  let state = Entity(name, x, y);

  state.render = () => {
    const {ctx, pos, size} = state;
    ctx.fillStyle="#c226e2";
    ctx.fillRect(
      state.pos.x * size.width,
      pos.y * size.height,
      size.width,
      size.height
    );
  };

  state.update = (afterTurn) => {
    state.pos.y++;
    afterTurn()
  };

  return Object.assign(state);
};

export default Mob;