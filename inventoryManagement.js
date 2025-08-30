export function manageInventory() {
  //TODO Get rid of underleveled meat

  let bag = dw.c.bag;
  for (const item in bag) {
    if (!bag[item]) {
      continue;
    }
    if (bag[item].md === "resource" || bag[item].md === "material") {
      //console.log(`Crafting Material found: ${item.name}`);
    }
    if (bag[item].md === "rawMeat") {
      //console.log(item);
      //console.log(bag[item].name);
      //dw.deleteItem(bag, Number(item));
    }
  }
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
    let basePower = 43 + item.baseMods.physDmg * item.lvl;

  }

}
