import { delay } from "./util.js";

//TODO add move mode to stop having the main loop figure it out
//This will include (Direct, random, kite)

//TODO add safety checks to following to prevent monster from wandering onto an already "safe" path

export function moveAtRandom(distance = 10) {
  //TODO if resting, move away from closest monster
  followPath().then((data) => {
    if (!data) {
      console.log("Moving at Random");
      dw.set("path", JSON.stringify(buildRandomPath({ x: dw.c.x, y: dw.c.y },distance)));
    }
  });
}
export async function followPath() {
  let path = dw.get("path");
  if (!path) {
    return "no path";
  }
  path = JSON.parse(path);
  if (path[0] && dw.c.x === path[0].x && dw.c.y === path[0].y) {
    path.shift();
  }
  if (path.length === 0) {
      dw.set("path", null);
      return "no path";
    }
  dw.move(path[0].x, path[0].y);
  dw.set("path", JSON.stringify(path));
  return true;
}
export async function moveTo(target) {
  if(!target.id){
    console.log("No target id");
    return;
  }
  if(dw.distance(dw.c, target) < 2){
    dw.move(target.x, target.y);
    return;
  }
  if(target.id && target.id !== dw.get("pathTarget")){
    console.log("Kicking path");
    dw.set("path", null);
    dw.set("pathTarget", target.id);
  }
  followPath().then((data) => {
    if (data === "no path") {
      console.log("new path");
      findPathTo(target);
    }
  });
}
export function kite(target, minDist, maxDist){
    //TODO make a build path with cb as goal for reusability
}
export function checkLOS(){
  let currentPos = {x:dw.c.x, y:dw.c.y};
  const angle = Math.atan2(dw.c.dy, dw.c.dx);
  for(let i = 0; i< dw.c.skills[0].stats.range * 4; i++){
    if(checkStep(currentPos) === false){
      return "NO LOS";
    }
    currentPos.x += (Math.cos(angle))/4;
    currentPos.y += (Math.sin(angle))/4;
  }
  console.log("LOS True");
  return true;
}
function buildPath(start, end) {
  console.log("PathFind");
  let path = [];
  let currentPos = {
    x: Math.floor(start.x) + 0.5,
    y: Math.floor(start.y) + 0.5,
  };
  let done = false;
  let badPos = [];
  let cycle = 0;
  while (!done) {
    //console.log(`currentPos : ${currentPos.x}, ${currentPos.y}`);
    cycle++;
    let storedSteps = testPossibleSteps(currentPos,path,badPos);

    if (storedSteps.length > 0) {
      let distance = 200;
      let selectedStep;
      for(const step of storedSteps){
        let currentDistance = dw.distance(step, end);
        if(currentDistance < distance){
          distance = currentDistance;
          selectedStep = step;
        }
      }
      path.push({x:selectedStep.x, y: selectedStep.y});
      currentPos = {x:selectedStep.x, y: selectedStep.y};
    }
    else{
      if(path.length > 1){
        path.pop();
        currentPos = path[path.length-1];
      }
    }
    if (cycle > 10000) {
      console.log("Build path > 10000 cycles, exiting...");
      done = true;
    }
    if (currentPos.x === end.x && currentPos.y === end.y) {
      done = true;
    }
  }

  return smoothCorners(path);
}
function buildRandomPath(start, length = 10) {
  console.log("Random PathFind")
  let path = [];
  let currentPos = {
    x: Math.floor(start.x) + 0.5,
    y: Math.floor(start.y) + 0.5,
  };
  let done = false;
  let badPos = [];
  let cycle = 0;
  while (!done) {
    cycle++;
    let storedSteps = testPossibleSteps(currentPos,path,badPos);
    if (storedSteps.length > 0) {
      const random =
        storedSteps[Math.floor(Math.random() * storedSteps.length)];
      path.push({ x: random.x, y: random.y });
      currentPos = { x: random.x, y: random.y };
    } else {
      badPos.push[currentPos];
      if (path.length === 0) {
        console.log("Am I boxed in?");
        return path;
      } else {
        path.pop();
        currentPos = path[path.length - 1];
      }
    }
    if (path.length >= length || cycle > 10000) {
      done = true;
    }
  }

  return smoothCorners(path);
}
function testPossibleSteps(pos, path, badPos){
  let safeMode = dw.get("safeMode");
  let possibleSteps = [
      { x: pos.x, y: pos.y - 1, bad: false },
      { x: pos.x - 1, y: pos.y, bad: false },
      { x: pos.x, y: pos.y + 1, bad: false },
      { x: pos.x + 1, y: pos.y, bad: false },
    ];
  let storedSteps = [];
  for (const step of possibleSteps) {
    if (iterateSteps(step, badPos) || iterateSteps(step, path)) {
      continue;
    }
    if(safeMode && dw.findAllEntities((e) => {e.simId === dw.c.sim.id && e.threat === 1 && dw.distance(e, step) <5}).length > 0){
      continue;
    }
    if (checkStep(step)) {
      storedSteps.push(step);
    }
  }
  return storedSteps;
}
function checkStep(step) {
  return (
    dw.getTerrainAt(step.x, step.y, dw.c.z) === 0 &&
    dw.getTerrainAt(step.x, step.y, dw.c.z - 1) > 0
  );
}
function iterateSteps(step, array) {
  for (const pos of array) {
    if (step.x === pos.x && step.y === pos.y) {
      return true;
    }
  }
  return false;
}

function findPathTo(target) {
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

function smoothCorners(path){
  let newPath = [];
  let skipNext = false;
  for(let i = 0; i < path.length -2; i++){
    if(skipNext){
      skipNext = false;
    }else{
      newPath.push(path[i]);
    }
    const xDiff = path[i+2].x - path[i].x;
    if( xDiff <= 1 && xDiff >= -1 ) {
      const yDiff = path[i+2].y - path[i].y;
      if( yDiff <= 1 && yDiff >= -1 ){
        //Is a 1 away corner
        if(checkStep({x:path[i].x + xDiff, y:path[i].y}) && checkStep({x:path[i].x, y:path[i].y + yDiff})){
          skipNext = true;
        }

      }
    }

  }
  return newPath;
}

//TODO if path extends, try checking every block in between to reduce path