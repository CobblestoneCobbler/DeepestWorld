export function manageInventory() {
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
            //console.log(item);
            //console.log(bag[item].name);
            //dw.deleteItem(bag, Number(item));
        }
    }
}
//moveItemsToInventory(dw.c.bankTabs[1], ())
export function moveItemsToInventory(inventory, cb = null) {
    let bag = dw.c.bag;
    for (let i in bag) {
        if (!bag[i]) {
            continue;
        }
        if (cb) {
        //Use this function
            if (cb(bag[i])) {
            dw.moveItem(bag, Number(i), inventory);
            }
        } else {
            dw.moveItem(bag, Number(i), inventory);
        }
    }
}
export function findItem(inventory,cb){
    for(let i in inventory){
        if(!inventory[i]){
            continue;
        }
        if(cb(inventory[i])){
            return Number(i);
        }
    }
    return;
}
function getItemRating(item) {}
