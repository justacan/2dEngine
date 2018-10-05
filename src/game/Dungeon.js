import AABB from "./AABB";

function getRandomArbitrary(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

const addPadding = (room, padding = 1) => {
  const {x, y, width, height} = room;
  return {
    x: x - padding,
    y: y - padding,
    width: width + padding,
    height: height + padding
  }
};

class Map {
  constructor(canvas, ctx) {
    this.map = [];
    this.rooms = [];
    this.canvas = canvas;
    this.ctx = ctx;
    this.tileSize = 16;
    this.width = this.canvas.width / this.tileSize;
    this.height = this.canvas.height / this.tileSize;
  }

  registerCanvas(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
  }

  iterate(func) {
    const {width, height} = this;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        func(x, y);
      }
    }
  }

  findClosestRoom(room) {
    let closest = null;
    for (let iRoom of this.rooms) {
      // if (room.center.x === iRoom.center.x && room.center.y === iRoom.center.y) continue;
      if (room === iRoom) continue;
      if (iRoom.connected.includes(room)) continue;
      if (!closest) closest = iRoom;

      const ax = Math.abs(room.center.x - iRoom.center.x);
      const ay = Math.abs(room.center.y - iRoom.center.y);

      const bx = Math.abs(room.center.x - closest.center.x);
      const by = Math.abs(room.center.y - closest.center.y);

      if ( (ax+ay) < (bx+by) ) {
        closest = iRoom;
      }
    }
    return closest;
  }

  placeRoom() {
    const x = getRandomArbitrary(0, this.width);
    const y = getRandomArbitrary(0, this.height);
    const width = getRandomArbitrary(5, 10);
    const height = getRandomArbitrary(5, 10);

    // Out of bounds check
    if ((y + height) > this.height) return false;
    if ((x + width) > this.width) return false;

    // Overlap check
    for (let room of this.rooms) {
      if ( AABB(addPadding({x, y, width, height}), addPadding(room))) return false;
    }

    // Apply room to map
    for (let iY = y; iY < y + height; iY++) {
      for (let iX = x; iX < x + width; iX++) {
        if (iY === y || iX === x || iY === y + height - 1 || iX === x + width - 1) {
          this.setTile(iX, iY, 2);
        } else {
          this.setTile(iX, iY, 1);
        }

      }
    }

    // Save room to be checked for overlap
    this.rooms.push({x, y, width, height, connected: []});
    console.log("Room Placed!")

  }

  setTile(x, y, value) {
    this.map[y][x] = value;
  }

  findPathBetweenRooms(room1, room2) {
    let pathCursor = {x: room1.center.x, y: room1.center.y};
    while(true) {

      if (pathCursor.x < room2.center.x) {
        pathCursor.x++;
      } else if (pathCursor.x > room2.center.x) {
        pathCursor.x--;
      } else if (pathCursor.y < room2.center.y) {
        pathCursor.y++;
      } else if (pathCursor.y > room2.center.y) {
        pathCursor.y--;
      }

      this.setTile(pathCursor.x, pathCursor.y, 5)
      if (pathCursor.x === room2.center.x && pathCursor.y === room2.center.y) return true;
    }

  }

  connectRooms(room1, room2) {
    if (!room1.connected) room1.connected = [];
    if (!room2.connected) room2.connected = [];
    room1.connected.push(room2);
    room2.connected.push(room1);
  }

  generate() {
    this.iterate((x, y) => {
      if (!this.map[y]) this.map[y] = []
      this.setTile(x, y, 0);
    });
    console.log('Map Zeroed')

    for (let i = 0;i < 1000; i++) {
      this.placeRoom();
    }

    for (let room of this.rooms) {
      let x = Math.floor(room.width / 2) + room.x;
      let y = Math.floor(room.height / 2) + room.y;
      room.center = {x, y};
      this.setTile(x, y, 4)
    }

    for (let room of this.rooms) {
      const closest = this.findClosestRoom(room);
      this.findPathBetweenRooms(room, closest);
      this.connectRooms(room, closest);
    }






    // console.log(this.map);
  }

  render() {
    const {width, height, tileSize} = this;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (this.map[y][x] === 1 ) {
          this.ctx.fillStyle="#7a4207";
          this.ctx.fillRect(x * tileSize,y * tileSize,tileSize,tileSize);
        }
        if (this.map[y][x] === 2 ) {
          this.ctx.fillStyle="#1449ce";
          this.ctx.fillRect(x * tileSize,y * tileSize,tileSize,tileSize);
        }
        if (this.map[y][x] === 4 ) {
          this.ctx.fillStyle="#f2da02";
          this.ctx.fillRect(x * tileSize,y * tileSize,tileSize,tileSize);
        }
        if (this.map[y][x] === 5) {
          this.ctx.fillStyle="#1d6d2a";
          this.ctx.fillRect(x * tileSize,y * tileSize,tileSize,tileSize);
        }


      }
    }
  }
}

export default Map;