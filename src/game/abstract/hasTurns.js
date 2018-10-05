export default (state) => {
  state.turn = 0;
  return {
    resetTurn: () => (state.turn = 0),
    startTurn: () => (state.turn = 1),
    endTurn: () => (state.turn = 2)
  };
};