export function parseMessage(msg) {
  if (msg.includes("TargetId")) {
    let id = msg.slice(9);
    //console.log(`id:  '${id}'`);
    dw.set("enemyTarget", Number(id));
    dw.set("mode", "attack");
  }
  else if(msg.include("SimLevel")){
    let level = msg.slice(10); //"targetSim: lvl"
    dw.set("targetSim",Number(level));
  }
}
export function sendMessage(msg){
  dw.emit("talkParty", {m: msg});
}