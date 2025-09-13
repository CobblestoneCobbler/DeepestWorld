export function getCombatRating(entity) {
	if (entity.md === "monster") {
		getMonsterRating(entity);
	}
}
function getMyRating() {
	let myStats = dw.c.stats;
}
function getMonsterRating(entity) {
	let hp = entity.maxHp + entity.maxShield;
	let dmg = entity.stats.maxDmg;
	let dr = entity.stats.dr;

	let hitsToKill = Math.ceil(hp/((dw.c.skills[0].stats.physDmg)* (1-dr)));
	let hitsToDie = Math.floor(dw.c.hp / (dmg * (1 - dw.c.stats.dr)));


	// return [time to kill, dps(against me), hazardlvl(0 less than half time, 1 close win, 2 close loss, 3 Loss)]

	//assume only one skill atm
	//let skill = entity.skills[0].stats;
	//let dmg = skill.physDmg + skill.fireDmg + skill.coldDmg + skill.elecDmg + skill.acidDmg;
	//let critDmg = dmg * skill.critMult;
}

export function findEnemy(){
	let targets = dw.findEntities((e)=> dw.c.sim.id === e.simId);
	if(targets){
		//Combat rating
		//Grouping? if group, group combat rating ++ with multi by 1+ group size

	}
}