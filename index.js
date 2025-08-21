// enables logging of server errors in the console
let simDiff = -5;
dw.debug = true;
gameLoop();

async function gameLoop() {
  let cycle = dw.get("cycle");
  if (!cycle) {
    cycle = 0;
  }
  cycle++;
  dw.set("cycle", cycle);

  let checkIfStuck = false;
  if(dw.get("path")){
    followPath();
  }
  enterSim();
  if(dw.c.sim){
    let closest = dw.findClosestMonster();
  if (
    closest &&
    dw.c.sim.id === closest.simId &&
    dw.distance(dw.c, closest) < 2
  ) {
    dw.set("mode", "attack");
  } else {
    let tree = dw.findClosestTree();
    if (tree && dw.c.sim.id === tree.simId && dw.distance(dw.c, tree) < 5) {
      gather();
    }
  }
  }
  

  if (cycle % 10 === 0) {
    console.log(cycle);
    checkIfStuck = true;
  } else if (cycle % 10 === 3) {
    manageInventory();
  }

  //TODO store pos and check later if changed, else moveRandom
  switch (dw.get("mode")) {
    case "idle": {
      if (dw.c.hp < dw.c.maxHp / 2 || dw.c.mp < dw.c.maxMp / 4) {
        console.log("Less than half health");
        dw.set("mode", "resting");
      } else {
        dw.set("mode", "attack");
      }
      break;
    }
    case "resting": {
      if (dw.c.hp === dw.c.maxHp && dw.c.mp === dw.c.maxMp) {
        console.log("Ready to Fight!");
        dw.set("mode", "idle");
      }
      await gather();
      break;
    }
    case "attack": {
      if (dw.get("enemyTarget") === null) {
        findEnemy();
      }
      if (checkIfStuck) {
        const last = dw.get("lastPos");
        const current = [Math.floor(dw.c.x), Math.floor(dw.c.y)];
        dw.set("lastPos", current);
        console.log(current);
        if (last[0] === current[0] && last[1] === current[1]) {
          console.log("stuck");
          await moveAtRandom(5);
        } else {
          attack();
        }
      } else {
        attack();
      }
      break;
    }
    default: {
      dw.set("mode", "idle");
    }
  }

  setTimeout(gameLoop, 250);
}
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
/*
    The world consists primarily of areas called sims (simulations). This function ensures your character is always in a sim.
*/
function enterSim() {
  /*
        If your character is already in an unfinished sim, then don't do anything.
    */

  // dw.character represents your character
  // dw.character.sim is the sim your character is currently in
  if (
    dw.character.sim &&
    dw.character.sim.progress !== dw.character.sim.maxProgress
  ) {
    return;
  }

  /*
        To enter a sim, you need to use a world simulator. If none is nearby, you can always kill your character to return to the starting spawn.
    */

  // dw.entities is an array that contains nearby entities such as characters, monsters, and resources
  const worldSimulator = dw.entities.find((entity) => {
    if (entity.typeMd !== "worldSimulator") {
      return;
    }

    // check if the Euclidean distance between your character and the entity is within interact range
    if (dw.distance(dw.character, entity) > dw.constants.INTERACT_RANGE) {
      return;
    }

    return true;
  });

  if (worldSimulator) {
    if (dw.c.professions.woodcutting.level < 3) {
      dw.enterSim(7);
    } else {
      dw.enterSim(dw.character.lvl + simDiff);
      7;
    }
    // you can choose the level of the sim, up to your character's level
  } else {
    // kill your character to return to the starting spawn near the world simulator
    dw.suicide();
  }
}
function moveAtRandom(distance = 20) {
  //TODO if resting, move away from closest monster
  console.log("Moving at Random");
  console.log(`LastRand: ${dw.get("lastRand")}`);
  if(dw.get("lastRand") > 10){
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
function findEnemy() {
  console.log("finding enemy");

  const target = dw.findClosestMonster((e) =>(dw.c.sim && e.simId === dw.c.sim.id));
  if (!target) {
    moveAtRandom();
    return;
  }
  dw.set("enemyTarget", target.id);
}
async function followPath(){
  let path = dw.get("path");
  
  if(path){
    path = JSON.parse(path);
    if(path[0]){
      //console.log(`Path: ${path[0]}`);
      if(Math.floor(dw.c.x)+0.5 === path[0].x && Math.floor(dw.c.y)+0.5 === path[0].y){
        path = path.shift();
        dw.set("path", JSON.stringify(path));
      }
      if(path.length > 0){
        dw.move(path[0].x, path[0].y);
      let resolve = delay(1000);
      return await resolve;
      }
      else{
        dw.set("path", null);
      }
    }else{
      dw.set("path", null);
    }
    
  }
}
async function moveTo(target = null, random = false){
  let path = dw.get("path");
  
  if(path){
    followPath();
  }
  else if (target){
    findPathTo(target, random);
  }
}
function buildPath(start, end, random = false){
  //TODO Add Better Rand gen
  console.log(`Building Path from ${start.x},${start.y}  to  ${end.x},${end.y}`);
  let path = [];
  let currentPos = {x:start.x, y:start.y};
  let done = false;
  let badPos = [];
  let cycle = 0;
  while(!done){
    //console.log(`currentPos : ${currentPos.x}, ${currentPos.y}`);
    cycle ++;
    if(currentPos.x === end.x && currentPos.y === end.y){
      done = true;
      return path;
    }
    let possibleSteps = [
      {x: currentPos.x, y: currentPos.y-1,bad: false},
      {x: currentPos.x-1, y: currentPos.y, bad: false},
      {x: currentPos.x, y: currentPos.y+1, bad: false},
      {x: currentPos.x+1, y: currentPos.y, bad: false}
    ]
    let distance = dw.distance(start, end) + 10;
    let nextStep;
    for(const step of possibleSteps){
      for(let pos of badPos){
        if(step.x === pos.x && step.y === pos.y){
          step.bad = true;
        }
      }
      if(step.bad){
        continue;
      }
      if(dw.getTerrainAt(step.x,step.y,dw.c.z) === 0 && dw.getTerrainAt(step.x,step.y,start.z -1) > 0){
        let dist = dw.distance(end,step);
        if(dist < distance || random){
          distance = dist;
          nextStep = step;
        }
      }
      else{
        step.bad = true;
      }
    }
    if(nextStep){
      //console.log(`Next Step : ${nextStep.x}, ${nextStep.y}`);
      if(path.length > 1){
        if(nextStep === path[path.length - 2]){
          //Path is being repeated
          badPos.push(currentPos);
          currentPos = path[path.length-1];
          continue;
        }
      }
      //setup next step
      path.push(nextStep);
      currentPos = nextStep;
    }
    if(cycle > 250){
      console.log("Buildpath > 250 cycles, exiting...");
      
      done = true;
    }
  }

}
function findPathTo(target, random =false){
  console.log("Finding Path");
  let characterLocation = {x:Math.floor(dw.c.x)+0.5,y:Math.floor(dw.c.y)+0.5,z:Math.floor(dw.c.z)};
  let targetLocation;
  if(target.id){ //if target is an object
    
    targetLocation = {x:Math.floor(target.x)+0.5,y:Math.floor(target.y)+0.5,z:Math.floor(target.z)};
  }
  else{ //if target is coords
    if(target.length === 2){
      target.push(Math.floor(dw.c.z));
    }
    targetLocation = {x:Math.floor(target[0])+0.5, y:Math.floor(target[1])+0.5, z: Math.floor(target[2])+0.5 }
  }
  let path = buildPath(characterLocation, targetLocation);
  dw.set("path", JSON.stringify(path));

  //optimal straight path, then spread out to go around
  
  
}
function attack() {
  try {
    let enemy = dw.findOneEntity((e) => e.id === dw.get("enemyTarget"));
    if (enemy) {
      let skillIndex = 0;
      if(dw.distance(dw.c, enemy) > dw.c.skills[0].stats.range){
        moveTo(enemy);
      }
      
      dw.setTarget(enemy.id);
      if (dw.c.mp < dw.c.skills[0].stats.cost) {
        skillIndex = 1;
      }
      if (!dw.canUseSkill(skillIndex, enemy.id)) {
        return;
      }
      dw.useSkill(skillIndex, enemy.id);
    } else {
      dw.set("enemyTarget", null);
      dw.set("mode", "idle");
    }
  } catch {
    console.log("Error in Attack()");
  }
}
async function gather() {
  const target = dw.findClosestTree(
    (e) => (dw.c.sim && e.simId === dw.c.sim.id) || dw.distance(e, dw.c) < 5
  );
  //console.log(target);
  if (!target) {
    await moveAtRandom(10);
    return;
  } else {
    dw.setTarget(target.id);
    if (dw.distance(dw.c, target) > 1) {
      moveTo(target);
    } else {
      if (dw.isReady(0)) {
        dw.gather(target);
      }
    }
  }
}
function manageInventory() {
  //console.log("Inventory");
  let bag = dw.c.bag;
  for (const item in bag) {
    if (!bag[item]) {
      continue;
    }
    if (bag[item].md === "resource" || bag[item].md === "material") {
      //console.log(`Crafting Material found: ${item.name}`);
    }
    if (bag[item].md === "rawMeat") {
      console.log(item);
      console.log(bag[item].name);
      dw.deleteItem(bag, Number(item));
    }
  }
}
