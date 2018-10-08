
const directions = {
    north: {x: 0, y: -1},
    south: {x: 0, y: 1},
    east: {x: 1, y: 0},
    west: {x: -1, y: 0},
}

export default (direction) => {
    return {name: "MOVE", dir: directions[direction]}
}