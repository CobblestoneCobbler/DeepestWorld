import { delay } from "./util.js";
export function moveAtRandom(distance = 20) {
    //TODO if resting, move away from closest monster
    console.log("Moving at Random");
    console.log(`LastRand: ${dw.get("lastRand")}`);
    if(dw.get("lastRand") > 5 || !dw.get("path")){
        dw.set("path", null);
        let randomMoves = [
            dw.c.x + Math.floor(Math.random() * distance) - Math.floor(distance / 2),
            dw.c.y + Math.floor(Math.random() * distance) - Math.floor(distance / 2),
        ];
        dw.set("lastRand", 0);
        moveTo(randomMoves);
    }
    else{
        moveTo();
        dw.set("lastRand", dw.get("lastRand")+1);
    }
    }
export async function followPath(){
    let path = dw.get("path");

  if (path) {
    path = JSON.parse(path);
    if (path[0]) {
      //console.log(`Path: ${path[0]}`);
      if (
        Math.floor(dw.c.x) + 0.5 === path[0].x &&
        Math.floor(dw.c.y) + 0.5 === path[0].y
      ) {
        path = path.shift();
        dw.set("path", JSON.stringify(path));
      }
      if (path.length > 0) {
        dw.move(path[0].x, path[0].y);
        let resolve = delay(1000);
        return await resolve;
      } else {
        dw.set("path", null);
      }
    } else {
      dw.set("path", null);
    }
  }
}
export async function moveTo(target = null, random = false) {
  let path = dw.get("path");

  if (path) {
    followPath();
  } else if (target) {
    findPathTo(target);
  }
}
function buildPath(start, end, random = false) {
  //TODO Add Better Rand gen
  console.log(
    `Building Path from ${start.x},${start.y}  to  ${end.x},${end.y}`
  );
  let path = [];
  let currentPos = { x: start.x, y: start.y };
  let done = false;
  let badPos = [];
  let cycle = 0;
  while (!done) {
    //console.log(`currentPos : ${currentPos.x}, ${currentPos.y}`);
    cycle++;
    if (currentPos.x === end.x && currentPos.y === end.y) {
      done = true;
      return path;
    }
    let possibleSteps = [
      { x: currentPos.x, y: currentPos.y - 1, bad: false },
      { x: currentPos.x - 1, y: currentPos.y, bad: false },
      { x: currentPos.x, y: currentPos.y + 1, bad: false },
      { x: currentPos.x + 1, y: currentPos.y, bad: false },
    ];
    let distance = dw.distance(start, end) + 10;
    let nextStep;
    for (const step of possibleSteps) {
      for (let pos of badPos) {
        if (step.x === pos.x && step.y === pos.y) {
          step.bad = true;
        }
      }
      if (step.bad) {
        continue;
      }
      if (checkStep(step)) {
        let dist = dw.distance(end, step);
        if (dist < distance || random) {
          distance = dist;
          nextStep = step;
        }
      } else {
        step.bad = true;
      }
    }
    if (nextStep) {
      //console.log(`Next Step : ${nextStep.x}, ${nextStep.y}`);
      if (path.length > 1) {
        if (nextStep === path[path.length - 2]) {
          //Path is being repeated
          badPos.push(currentPos);
          currentPos = path[path.length - 1];
          continue;
        }
      }
      //setup next step
      path.push(nextStep);
      currentPos = nextStep;
    }
    if (cycle > 250) {
      console.log("Buildpath > 250 cycles, exiting...");

      done = true;
    }
  }
}
function buildRandomPath(start) {
  let path = [];
  let currentPos = { x: start.x, y: start.y };
  let done = false;
  let badPos = [];
  let cycle = 0;
  while (!done) {
    cycle++;
    if (path.length > 10) {
      done = true;
      return path;
    }
  }
}
function checkStep(step) {
  return (
    dw.getTerrainAt(step.x, step.y, dw.c.z) === 0 &&
    dw.getTerrainAt(step.x, step.y, dw.c.z - 1) > 0
  );
}

function findPathTo(target) {
  console.log("Finding Path");
  let characterLocation = {
    x: Math.floor(dw.c.x) + 0.5,
    y: Math.floor(dw.c.y) + 0.5,
    z: Math.floor(dw.c.z),
  };
  let targetLocation;
  if (target.id) {
    //if target is an object
    targetLocation = {
      x: Math.floor(target.x) + 0.5,
      y: Math.floor(target.y) + 0.5,
      z: Math.floor(target.z),
    };
  } else {
    //if target is coords
    if (target.length === 2) {
      target.push(Math.floor(dw.c.z));
    }
    targetLocation = {
      x: Math.floor(target[0]) + 0.5,
      y: Math.floor(target[1]) + 0.5,
      z: Math.floor(target[2]) + 0.5,
    };
  }
  let path = buildPath(characterLocation, targetLocation);
  dw.set("path", JSON.stringify(path));

  //optimal straight path, then spread out to go around
}
