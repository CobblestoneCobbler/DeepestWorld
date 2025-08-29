// enables logging of server errors in the console
import { moveTo, moveAtRandom, followPath } from "./movement.js";
import {
  findItem,
  manageInventory,
  moveItemsToInventory,
} from "./inventoryManagement.js";
import { parseMessage, sendMessage } from "./messageParsing.js";

let simDiff = -3;
dw.debug = true;
let samsName = "Samsplatz";
dw.on("whisperChat", (data) => parseMessage(data.message));
//Switch to this vvvv
dw.on("partyChat", (data)=> parseMessage(data.message));

//initial requirements
dw.set("partyTimeout", 100);
gameLoop();

async function gameLoop() {
  let cycle = dw.get("cycle");
  if (!cycle) {
    cycle = 0;
  }
  cycle++;
  dw.set("cycle", cycle);
  let party = (dw.c.party.length > 0);

  await followPath();
  let returning = false;
  if (dw.c.sim) {
    let closest = dw.findClosestMonster();
    if (
      closest &&
      dw.c.sim.id === closest.simId &&
      dw.distance(dw.c, closest) < dw.c.skills[0].stats.range &&
      (closest.threat === 1 || closest.bad === 1)
    ) {
      dw.set("path", null);
      dw.set("mode", "attack");
      if (dw.get("enemyTarget") === null) {
        sendMessage(`TargetId: ${closest.id}`);
      }
      dw.set("enemyTarget", closest.id);
    } else {
      let tree = dw.findClosestTree();
      if (tree && dw.c.sim.id === tree.simId && dw.distance(dw.c, tree) < 3) {
        gather();
      }
    }
    if(party){
      let member = dw.findOneEntity((e) => e.id === dw.c.party[0].id);
      if (member && dw.distance(member, dw.c) > 5) {
        console.log("Return to Party");
        returning = true;
        moveTo(member);
      }
    }
  }
  await followPath();

  enterSim();

  if (cycle % 10 === 0) {
    console.log(cycle);
    if (!party) {
      dw.partyInvite("Samsplatz").then((data) => console.log(data));
    }

    const last = dw.get("lastPos");
    const current = [Math.floor(dw.c.x), Math.floor(dw.c.y)];
    dw.set("lastPos", current);
    console.log(current);

    if (last[0] === current[0] && last[1] === current[1]) {
      console.log("stuck");
      dw.set("path", null);
    }
  } else if (cycle % 10 === 3) {
    moveItemsToInventory(dw.c.bankTabs[1], (item) => {
      if (item.md.includes("Skill")) {
        return true;
      }
      return false;
    });
  }
  else if (cycle %10 === 5){
    if(dw.c.party.length === 0){
      let timeout = dw.get("partyTimeout");
      timeout --;
      if(timeout === 0){
        dw.set("targetSim", null);
      }
    }else{
      dw.set("partyTimeout", 100);
    }
  }

  //TODO store pos and check later if changed, else moveRandom
  switch (dw.get("mode")) {
    case "idle": {
      if (dw.c.hp < dw.c.maxHp / 2 || dw.c.mp < dw.c.maxMp / 4) {
        console.log("Less than half health");
        let meatIndex = findItem(
          dw.c.bag,
          (item) => item.name === "Cooked Meat"
        );
        if (meatIndex) {
          dw.useConsumable(meatIndex);
        }
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
      if (dw.get("enemyTarget") === null && !returning) {
        if(party){
          moveAtRandom(2);
        }
        else{
          if(findEnemy()){
            attack();
          }
          else{
            moveAtRandom(3);
          }
        }
      }
      attack();
      break;
    }
    default: {
      dw.set("mode", "idle");
    }
  }

  setTimeout(gameLoop, 250);
}

function enterSim() {
  /*
        If your character is already in an unfinished sim, then don't do anything.
    */

  if (
    dw.character.sim &&
    dw.character.sim.progress !== dw.character.sim.maxProgress
  ) {
    return;
  }

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
    dw.set("path", null);
    if (dw.c.party.length > 0) {
      let level = dw.get("targetSim");
      if(!level){
        level = dw.character.lvl + simDiff;
        sendMessage("SimLevel");
      }
      dw.enterSim(level);
    } else if (dw.c.professions.woodcutting.level < 3) {
      dw.enterSim(7);
    } else if (dw.c.professions.cooking.level < 10) {
      dw.enterSim(9);
    } else {
      dw.enterSim(dw.character.lvl + simDiff);
    }
  } else {
    dw.suicide();
  }
}

function findEnemy() {
  console.log("finding enemy");
  const target = dw.findClosestMonster(
    (e) => dw.c.sim && e.simId === dw.c.sim.id
  );
  if (!target) {
    return;
  }
  dw.set("enemyTarget", target.id);
  return true;
}

function attack() {
  //TODO LOS

  try {
    let enemy = dw.findOneEntity((e) => e.id === dw.get("enemyTarget"));
    if (enemy) {
      let skillIndex = 0;
      if (dw.distance(dw.c, enemy) > dw.c.skills[0].stats.range) {
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
  if (!target) {
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
