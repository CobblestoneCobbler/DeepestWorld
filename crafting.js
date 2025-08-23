import { findItem } from "./inventoryManagement.js";

const craftingArray = [{profession:"woodworking", recipes:[{input:"Log",output:"Plank",rate:[1,1]}]}]
export function goCrafting(){
    for(const p of craftingArray){
        const lvl = dw.c.professions[p.profession].lvl;
        craft(p.recipes[0]);
    }
}

function craft(recipe){
    if(findItem(dw.c.bag,(item)=>item.name === recipe.input)){
        dw.craft({type:54, lvl:1, num:-1, profession: 6})
    }
}