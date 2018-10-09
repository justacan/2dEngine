import AABB from "./AABB";

import { astar } from './lib/astar';

import config from './config'

const {mapWidth, mapHeight, tileSize} = config;

import MapObject from './MapObject';

function getRandomArbitrary(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

const addPadding = (room, padding = 1) => {
  const { x, y, width, height } = room;
  return {
    x: x - padding,
    y: y - padding,
    width: width + padding,
    height: height + padding
  }
};

// Tile Types
const Floor = () => {
  return {
    type: 'floor',
    weight: 1,
    fillStyle: '#303638',
    canWalk: true,
    canSeeThrough: true
  }
}

const Wall = () => {
  return {
    type: 'wall',
    weight: 5,
    fillStyle: '#aab4b7',
    canWalk: false,
    canSeeThrough: false
  }
}

const WallCorner = () => {
  return {
    type: 'wall',
    weight: 0,
    fillStyle: '#aab4b7',
    // fillStyle: '#09b2e5',
    canWalk: false,
    canSeeThrough: false
  }
}

const Void = () => {
  return {
    type: 'void',
    weight: 1,
    fillStyle: '#000000',
    canWalk: false
  }
}

const Door = () => {
  return {
    type: 'door',
    weight: 1,
    fillStyle: '#603f2b',
    strokeStyle: '#603f2b',
    renderStyle: 'fill',
    open: false,
    canWalk: true,
    canSeeThrough: false
  }
};

const LineTest = () => {
  return {
    weight: 1,
    fillStyle: '#eadc10',
    canWalk: true
  }
}


class Dungeon {
  constructor(game) {
    this.map = new MapObject(mapWidth, mapHeight, Void());    
    this.mask = new MapObject(mapWidth, mapHeight, 1);
    this.rooms = [];
    this.roomCounter = 0;
    this.game = game;
    this.canvas = game.canvas;
    this.ctx = game.ctx;
  } 

  findClosestRoom(room, filtered = false) {
    let closest = null;
    const rooms = filtered || this.rooms
    for (let iRoom of rooms) {
      if (room === iRoom) continue;
      if (iRoom.connected.includes(room)) continue;
      if (!closest) closest = iRoom;

      const ax = Math.abs(room.center.x - iRoom.center.x);
      const ay = Math.abs(room.center.y - iRoom.center.y);

      const bx = Math.abs(room.center.x - closest.center.x);
      const by = Math.abs(room.center.y - closest.center.y);

      if ((ax + ay) < (bx + by)) {
        closest = iRoom;
      }
    }
    return closest;
  }

  placeRoom(_x, _y, _width, _height) {
    const x = _x || getRandomArbitrary(1, mapWidth - 1);
    const y = _y || getRandomArbitrary(1, mapHeight - 1);
    const width = _width || getRandomArbitrary(config.minRoomWidth, config.maxRoomWidth);
    const height = _height || getRandomArbitrary(config.minRoomHeight, config.maxRoomHeight);

    // Out of bounds check
    if ((y + height + 1) > mapHeight) return false;
    if ((x + width + 1) > mapWidth) return false;

    // Overlap check
    for (let room of this.rooms) {
      if (AABB(addPadding({ x, y, width, height }), addPadding(room))) return false;
    }

    // Apply room to map
    for (let iY = y; iY < y + height; iY++) {
      for (let iX = x; iX < x + width; iX++) {
        if (iY === y || iX === x || iY === y + height - 1 || iX === x + width - 1) {
          this.map.setCell(iX, iY, Wall());          
        } else {
          this.map.setCell(iX, iY, Floor());          
        }
        if (iX === x && iY === y) this.map.setCell(iX, iY, WallCorner())
        if (iX === x + width - 1 && iY === y) this.map.setCell(iX, iY, WallCorner())
        if (iX === x && iY === y + height - 1) this.map.setCell(iX, iY, WallCorner())
        if (iX === x + width - 1 && iY === y + height - 1) this.map.setCell(iX, iY, WallCorner())

      }
    }

    // Save room to be checked for overlap
    this.rooms.push({ index: this.roomCounter, x, y, width, height, connected: []});
    this.roomCounter++;
    console.log("Room Placed!")

  }
  
  connectRooms(room1, room2) {
    if (!room1.connected) room1.connected = [];
    if (!room2.connected) room2.connected = [];
    room1.connected.push(room2);
    room2.connected.push(room1);
  }

  findRoomCenters() {
    for (let room of this.rooms) {
      let x = Math.floor(room.width / 2) + room.x;
      let y = Math.floor(room.height / 2) + room.y;
      room.center = { x, y };
    }
  }

  generate() {    

    for (let i = 0; i < config.roomCreationAttempts; i++) {
      this.placeRoom();
    }

    this.findRoomCenters(); 

    for (let room of this.rooms) {
      const graphWithWeight = this.map.makeGraph();      
      const closest = this.findClosestRoom(room);
      const start = graphWithWeight.grid[room.center.x][room.center.y];
      const end = graphWithWeight.grid[closest.center.x][closest.center.y];
      const resultWithWeight = astar.search(graphWithWeight, start, end);
      for (let res of resultWithWeight) {
        this.map.setCell(res.x, res.y, Floor())
      }
      this.connectRooms(room, closest);      
    }    

    // Fix Islands
    while (true) {
      let areConnected = [];
      let notConnected = [];
      const firstRoom = this.rooms[0];
      for (let room of this.rooms) {        
        const graph = this.map.makeGraph(true);
        const start = graph.grid[firstRoom.center.x][firstRoom.center.y];
        const end = graph.grid[room.center.x][room.center.y];
        const results = astar.search(graph, start, end);
        if (results.length) areConnected.push(room)        
      }

      areConnected.unshift(firstRoom)
      notConnected = this.rooms.filter(e => !areConnected.includes(e))

      console.log('areConnected:', areConnected.length);
      console.log('notConnected:', notConnected.length);
      console.log('rooms', this.rooms.length)

      if (areConnected.length === this.rooms.length) {
        console.log("ALL CONNECTED");
        break;
      }      
      
      console.log("Fixing Island!");

      try {
        const firstUp = notConnected.pop();      
        if (!firstUp) break;
        const graphWithWeight = this.map.makeGraph();
        const closest = this.findClosestRoom(firstUp, areConnected);
        const start = graphWithWeight.grid[firstUp.center.x][firstUp.center.y];
        const end = graphWithWeight.grid[closest.center.x][closest.center.y];
        const resultWithWeight = astar.search(graphWithWeight, start, end);
        for (let res of resultWithWeight) {
          this.map.setCell(res.x, res.y, Floor())
        }
        this.connectRooms(firstUp, closest);
      } catch (e) {        
        console.log("BROKE")
        console.log(e)
        break;        
      }
    }    

    this.map.iterate(cellObject => {
      const {x, y, value} = cellObject;
      if (value.type === 'floor') {        
        for(let _x = x-1; _x <= x+1; _x++) {
          for(let _y = y-1; _y <= y+1; _y++) {
            const ce = this.map.getCell(_x, _y);            
            if (!ce) continue;
            if (ce.value.type === 'void') {              
              this.map.setCell(ce.x, ce.y, Wall());
            }
          }
        }        
      }
    })

    // make doors
    for (let room of this.rooms) {
      for (let y = room.y; y < room.height + room.y; y++) {
        for (let x = room.x; x < room.width + room.x; x++) {
          if (x === room.x || y === room.y || x === room.width + room.x - 1 || y === room.height + room.y - 1) {
            if (this.map.getCell(x, y).value.type === 'floor') {
              this.map.setCell(x, y, Door());
            }
            
          }
        }
      }     
    }
  }

  render() {
    this.map.iterate((cellObject) => {
      const { x, y, value } = cellObject;
      this.ctx.strokeStyle = value.strokeStyle;
      this.ctx.fillStyle = value.fillStyle;
      if (value.renderStyle && value.renderStyle === 'stroke') {
        this.ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize)
      } else {
        this.ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
      }
    });
  }

  line(x0, y0, x1, y1) {
    let dx = Math.abs(x1-x0);
    let dy = Math.abs(y1-y0);
    let sx = (x0 < x1) ? 1 : -1;
    let sy = (y0 < y1) ? 1 : -1;
    let err = dx-dy;

    while(true) {
      const tile = this.map.getCell(x0, y0);
      if (!tile) continue;
      if (!tile.value.canSeeThrough) return {x: x0, y: y0};

      if ((x0 === x1) && (y0 === y1)) break;
      let e2 = 2*err;
      if (e2 >-dy){ err -= dy; x0 += sx; }
      if (e2 < dx){ err += dx; y0 += sy; }
    }
    return true;
  }

  getMask(actorObj) {
    const radius = actorObj.viewRadius;
    const actorX = actorObj.pos.x;
    const actorY = actorObj.pos.y;
    const canSee = [];

    for (let y = actorY + -(radius); y <= actorY + (radius); y++) {
      for (let x = actorX + -(radius); x <= actorX + (radius); x++) {
        const res = this.line(actorX, actorY, x, y);        
        if(res === true) canSee.push({x, y})
        if (res.x && res.y) canSee.push({x: res.x, y: res.y});
      }
    }
    actorObj.canSee = canSee;
  }

  updateMask(playerObj) {    

    // set half bright everywhere that has be uncovered
    this.mask.iterate((cellObject) => {      
      if (cellObject.value === 0) this.mask.setCellByIndex(cellObject.index, .5);      
    });

    playerObj.canSee.forEach(e => {
      this.mask.setCell(e.x, e.y, 0);
    })

    // set full bright everywhere seen
    // for (let y = playerY + -(radius); y <= playerY + (radius); y++) {
      // for (let x = playerX + -(radius); x <= playerX + (radius); x++) {
        // const res = this.line(playerX, playerY, x, y);        
        // if(res === true) this.mask.setCell(x, y, 0);
        // if (res.x && res.y) this.mask.setCell(res.x, res.y, 0);
      // }
    // }

    

    // playerObj.canSee = 

  }


  setDoor(door, mode) {       
    if (mode === 'open') {
      door.value.open = true;
      door.value.canSeeThrough = true;
      door.value.renderStyle = 'stroke'
      this.game.addEffect(door.x, door.y);
    }
    if (mode === 'closed') {
      door.value.open = false;
      door.value.canSeeThrough = false;
      door.value.renderStyle = 'fill'
    }
  }

  renderMask() {
    this.mask.iterate((cellObject) => {
        const {x, y, value} = cellObject;
        this.ctx.fillStyle = `rgba(0,0,0,${value})`;
        this.ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
    });
  }
}

export default Dungeon;