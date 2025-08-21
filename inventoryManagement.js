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
            console.log(item);
            console.log(bag[item].name);
            dw.deleteItem(bag, Number(item));
        }
    }
}