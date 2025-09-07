export function getCombatRating(entity) {
	if (entity.md === "monster") {
		getMonsterRating(entity);
	}
}
function getMyRating() {
	let myStats = dw.c.stats;
}
function getMonsterRating(entity) {
	let hp = entity.stats.life;
	//assume only one skill atm
	let skill = entity.skills[0].stats;
	let dmg =
		skill.physDmg +
		skill.fireDmg +
		skill.coldDmg +
		skill.elecDmg +
		skill.acidDmg;
	let critDmg = dmg * skill.critMult;
}
