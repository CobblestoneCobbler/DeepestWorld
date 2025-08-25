export function parseMessage(msg) {
  if (msg.includes("TargetId")) {
    let id = msg.slice(9);
    //console.log(`id:  '${id}'`);
    dw.set("enemyTarget", Number(id));
    dw.set("mode", "attack");
  }
}
