export function manageInventory() {
  //TODO Get rid of underleveled meat
  
  //Resource Tab
  moveItemsToInventory(dw.c.bankTabs[0], (item) => {
    if (item.name.includes("Plank") || item.name.includes("Essence")) {
      return true;
    }
    return false;
  });
  //Skill Tab
  moveItemsToInventory(dw.c.bankTabs[1], (item) => {
    if (item.md.includes("Skill")) {
      return true;
    }
    return false;
  });
  
}
export function moveItemsToInventory(inventory, cb = null) {
  let bag = dw.c.bag;
  for (let i in bag) {
    if (!bag[i]) {
      continue;
    }
    if (cb) {
      if (cb(bag[i])) {
        dw.moveItem(bag, Number(i), inventory);
      }
    } else {
      dw.moveItem(bag, Number(i), inventory);
    }
  }
}
export function findItem(inventory, cb) {
  for (let i in inventory) {
    if (!inventory[i]) {
      continue;
    }
    if (cb(inventory[i])) {
      return Number(i);
    }
  }
  return null;
}
function getItemRating(item) {
  if(item.tags.has("armor")){
    //its Armor, boots head shoulders body !! Sheild is also
  }
  else if(item.tags.has("accessory")){
    //its trinket like, Amulet, ring 1 and ring 2 belt
  }
  else if(item.typeMd === "weapon"){
    //its a weapon
    //TODO Do all weapons have baseMod of physDmg
    let basePower = 43;

  }

}

//BaseMods, ItemLVL, Mods(Magic)? CMods?, IMods?
function getModValues(bMods,level,  mMods = null, cMods = null, iMods = null){
  let values = {};
  for(const mod of Object.keys(bMods)){
    getSingleModValue(mod,bMods[mod], level);
  }

}
function getSingleModValue(name, val, level){
  switch(name){
    case "physDmg":{
      return val * level;
    }
    default:{
      console.log(`Missing Def of ${name}`);
      return null;
    }
  }
}