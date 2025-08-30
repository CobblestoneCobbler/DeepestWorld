import { delay } from "./util.js";
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
    return;
  }
  

  path = JSON.parse(path);
  
  if (path[0] && dw.c.x === path[0].x && dw.c.y === path[0].y) {
    path.shift();
    
  }
  if (path.length === 0) {
      dw.set("path", null);
      return;
    }
  dw.move(path[0].x, path[0].y);
  dw.set("path", JSON.stringify(path));
  return true;
}
export async function moveTo(target = null) {
  followPath().then((data) => {
    if (!data) {
      if (target) {
        findPathTo(target);
      }
    }
  });
}
function buildPath(start, end) {
  console.log("PathFind");
  let safeMode = dw.get("safeMode");
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
    let storedSteps = [];
    for (const step of possibleSteps) {
      if (iterateSteps(step, badPos)) {
        step.bad = true;
        continue;
      }
      if(iterateSteps(step, path)) {
        continue;
      }
      if(safeMode && dw.findAllEntities((e) => {e.simId === dw.c.sim.id && e.threat === 1 && dw.distance(e, step) <4}).length > 0){
        console.log("safeMode and Threat along path");
        continue;
      }
      if (checkStep(step)) {
        storedSteps.push(step);
      }
    }
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
    if (cycle > 250) {
      console.log("Buildpath > 250 cycles, exiting...");
      done = true;
      return path;
    }
  }
}
function buildRandomPath(start, length = 10) {
  console.log("Random PathFind")
  let safeMode = dw.get("safeMode");
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
    if (path.length > length) {
      done = true;
      return path;
    }
    let possibleSteps = [
      { x: currentPos.x, y: currentPos.y - 1, bad: false },
      { x: currentPos.x - 1, y: currentPos.y, bad: false },
      { x: currentPos.x, y: currentPos.y + 1, bad: false },
      { x: currentPos.x + 1, y: currentPos.y, bad: false },
    ];
    let storedSteps = [];
    for (const step of possibleSteps) {
      if (iterateSteps(step, badPos)) {
        step.bad = true;
        continue;
      }
      if (iterateSteps(step, path)) {
        continue;
      }
      if(safeMode && dw.findAllEntities((e) => {e.simId === dw.c.sim.id && e.threat === 1 && dw.distance(e, step) <4}).length > 0){
        console.log("safeMode and Threat along path");
        continue;
      }
      if (checkStep(step)) {
        storedSteps.push(step);
      }

      
    }
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
        const i = path.length - 1;
        currentPos = path[i];
      }
    }
  }
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


//TODO if path extends, try checking every block in between to reduce path