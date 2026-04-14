import type { Position } from '../common/types.ts';
import type { Bonus } from './Bonus.ts';
import {
	BabyVictor,
	BredHellisNothing,
	Heal,
	ShootThemAll,
	MyLittleVictor,
	Invincibility,
	SuperHeal,
	CriticalHeal,
	xpDown,
	BigXpdDown,
	xpUp,
	bigXpUp,
} from './Boost.ts';

export function GenerateBonus(position: Position): Bonus {
	const num = Math.random() * 100;
	if (num < 1) return new BredHellisNothing(position);
	if (num < 12) return new xpDown(position);
	if (num < 15) return new SuperHeal(position);
	if (num < 18) return new BigXpdDown(position);
	if (num < 28) return new Invincibility(position);
	if (num < 35) return new MyLittleVictor(position);
	if (num < 40) return new ShootThemAll(position);
	if (num < 50) return new BabyVictor(position);
	if (num < 70) return new xpUp(position);
	if (num < 76) return new CriticalHeal(position);
	if (num < 80) return new bigXpUp(position);
	return new Heal(position);
}
