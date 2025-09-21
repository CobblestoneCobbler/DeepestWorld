import { findItem } from "./inventoryManagement.js";
import { delay } from "./util.js";

const craftingArray = [{profession:"woodworking", recipes:[{input:"Log",output:"Plank",rate:[1,1],type:54}]},
                        {profession:"cooking", recipes:[{input:"Raw Meat",output:"Cooked Meat",rate:[1,1], type:136}]}]
export async function goCrafting(){

    
    let craftsLeft = false;
    for(const p of craftingArray){
        const lvl = Math.floor(dw.c.professions[p.profession].lvl /10) *10;
        const professionNum = dw.c.professions[p.profession].profession;
        const response = await craft(p.recipes[0], lvl, professionNum);
        if(response){
            craftsLeft = true;
        }
    }
    return craftsLeft;
}

async function craft(recipe,level,professionNum){
    let item = findItem(dw.c.bag,(item)=>item.name === recipe.input);
    if(item){
        let amount = dw.c.bag[item].n;
        dw.craft({type:recipe.type, lvl:level, num:-1, profession: professionNum, r:dw.c.bag[item].r})
        await delay(amount * 2000);
        return true;
    }
    else{
        return null;
    }
}