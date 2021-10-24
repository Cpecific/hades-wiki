
const Extra = {
	Unblockable: {
		Description: `Unblockable by shield-bearing foes`,
	},
};
const Inflicts = {
	Weak: {
		// Description: `Weak duration: %n Sec.`,
		Description: `For at least {4 Sec.}, victim deals at least [30%] less damage.`,
	},
	Charm: {
		// Description: `Charm Duration: %n Sec.`,
		Description: `For a short time, victim fights for you with greater strength and speed.`,
	},
	Doom: {
		// Description: `Curse Delay: %n Sec.`,
		Description: `After a brief moment, victim takes a burst of damage.`,
	},
	Chill: {
		Description: `For {8 Sec.}, victim is slowed by [4%]. Effect can stack up to {10} times.`,
	},
	Exposed: {
		Description: `For {5 Sec.}, victim takes more damage when struck from behind.`,
	},
	Hangover: {
		Description: `For {4 Sec.}, victim keeps taking damage. Effect can stack up to {5} times.`,
	},
	Rupture: {
		Description: `For {3 Sec.}, victim takes damage while moving.`,
	},
	Jolted: {
		Description: `Victim's next attack self-inflicts lightning damage that harms nearby foes.`,
	},
};
const r = (from, to) => ({ type: 'range', from, to });
const rm = (from, to) => ({ type: 'multiplier', from, to });
const SourceIsMultiplier = true;
const AsInt = true;
const ToFixed = true;
const DuplicateMultiplier = -0.6;
const DuplicateStrongMultiplier = -0.4;
const DuplicateVeryStrongMultiplier = -0.2;
const make_RarityLevels = (Common, Rare, Epic, Heroic, Legendary) => {
	if (typeof Common !== 'undefined') {
		if (!(Common instanceof Array)) { Common = [Common]; }
		Common = {
			MinMultiplier: Common[0],
			MaxMultiplier: Common.length === 1 ? Common[0] : Common[1],
		};
	}
	if (typeof Rare !== 'undefined') {
		if (!(Rare instanceof Array)) { Rare = [Rare]; }
		Rare = {
			MinMultiplier: Rare[0],
			MaxMultiplier: Rare.length === 1 ? Rare[0] : Rare[1],
		};
	}
	if (typeof Epic !== 'undefined') {
		if (!(Epic instanceof Array)) { Epic = [Epic]; }
		Epic = {
			MinMultiplier: Epic[0],
			MaxMultiplier: Epic.length === 1 ? Epic[0] : Epic[1],
		};
	}
	if (typeof Heroic !== 'undefined') {
		if (!(Heroic instanceof Array)) { Heroic = [Heroic]; }
		Heroic = {
			MinMultiplier: Heroic[0],
			MaxMultiplier: Heroic.length === 1 ? Heroic[0] : Heroic[1],
		};
	}
	if (typeof Legendary !== 'undefined') {
		if (!(Legendary instanceof Array)) { Legendary = [Legendary]; }
		Legendary = {
			MinMultiplier: Legendary[0],
			MaxMultiplier: Legendary.length === 1 ? Legendary[0] : Legendary[1],
		};
	}
	return {
		RarityLevels: {
			// CustomRarityMultiplier: {
			Common,
			Rare,
			Epic,
			Heroic,
			Legendary,
		},
	};
};
const rarity_tier1 = make_RarityLevels(1.0, [1.3, 1.5], [1.8, 2.0], [2.3, 2.5]);
const rarity_tier2 = make_RarityLevels(1.0, [1.3, 1.5], [2.0, 2.5], [2.5, 2.7]);
const rarity_tier3 = make_RarityLevels(undefined, undefined, undefined, undefined, 1.0);
const rarity_synergy = make_RarityLevels(undefined, undefined, undefined, undefined, 1.0);
const rarity_chaos = make_RarityLevels(1.0, 1.5, 2.0);
const rarity_10 = make_RarityLevels(1.0, 1.1, 1.2, 1.3);
const rarity_20 = make_RarityLevels(1.0, 1.2, 1.4, 1.6);
const rarity_25 = make_RarityLevels(1.0, 1.25, 1.5, 1.75);
const rarity_30 = make_RarityLevels(1.0, 1.3, 1.6, 1.9);
const rarity_50 = make_RarityLevels(1.0, 1.5, 2.0, 2.5);
const pom = {
	DuplicateMultiplier: {
		// SourceIsMultiplier,
		IdenticalMultiplier: {
			Value: DuplicateMultiplier,
		},
	},
	DuplicateStrongMultiplier: {
		IdenticalMultiplier: {
			Value: DuplicateStrongMultiplier,
		},
	},
	DuplicateVeryStrongMultiplier: {
		IdenticalMultiplier: {
			Value: DuplicateVeryStrongMultiplier,
		},
	},
};
const percent = value => {
	return window.print_value(value, {
		increase: true,
		percent: true,
	});
};
const dname = key => {
	const trait = Traits[key];
	// if (!trait) { console.trace(key, 'undefined trait'); }
	if (!trait) { return; }
	return trait.DisplayName;
};
const pretty_join_array = (arr, sep, maxLength) => {
	let length = 0;
	let output = '';
	for (const v of arr) {
		if (length >= maxLength) {
			length = 0;
			output += '<br/>';
		}
		length += v.length + sep.length;
		output += v + sep;
	}
	output = output.substr(0, output.length - sep.length);
	return output;
};
const Traits = {
	// Zeus
	ZeusWeaponTrait: {
		DisplayName: `Lightning Strike`,
		Description: q => `Your {Attack} emits chain-lightning when you damage a foe.
{Bullet}Lightning Damage: [${q.DisplayDelta1}]
{Bullet}Jumps: [${q.TooltipNumJumps}]
{Bullet}Jump Range: [${q.TooltipJumpRange}]
{Bullet}Jump Damage Multiplier: &[x${q.TooltipJumpDamageMultiplier}]`,
		...make_RarityLevels(1.0, 1.25, 1.50, 2.0),
		// Projectile.ChainLightning
		Effects: [{
			BaseValue: 10,
			AsInt,
			...pom.DuplicateMultiplier,
			ExtractValue: [{
				ExtractAs: "TooltipDamage",
			}, {
				ExtractAs: "TooltipNumJumps",
				External: true,
				BaseType: "ProjectileBase",
				BaseName: "ChainLightning",
				BaseProperty: "NumJumps",
			}, {
				ExtractAs: "TooltipJumpRange",
				External: true,
				BaseType: "ProjectileBase",
				BaseName: "ChainLightning",
				BaseProperty: "JumpRange",
			}, {
				ExtractAs: "TooltipJumpDamageMultiplier",
				External: true,
				BaseType: "ProjectileBase",
				BaseName: "ChainLightning",
				BaseProperty: "JumpDamageMultiplier",
			}],
		}],
	},
	ZeusSecondaryTrait: {
		DisplayName: `Thunder Flourish`,
		Description: q => `Your {Special} causes a lightning bolt to strike nearby foes.
{Bullet}Bolt Damage: [${q.DisplayDelta1}]
{Bullet}Damage Radius: [${q.TooltipDamageRadius}]
{Bullet}Range: [${q.TooltipRange}]`,
		Notes: [
			`Has internal cooldown of {0.2 Sec.} per target.<br/>(all lightning bolt Boons)`,
		],
		...make_RarityLevels(1.0, 1.25, 1.50, 2.0),
		// Projectile.LightningStrikeSecondary
		Effects: [{
			BaseValue: 30,
			...pom.DuplicateMultiplier,
			ExtractValue: [{
				ExtractAs: "TooltipDamage",
			}, {
				ExtractAs: "TooltipDamageRadius",
				External: true,
				TraitName: "ZeusSecondaryTrait",
				BaseType: "ProjectileBase",
				BaseName: "LightningStrikeSecondary",
				BaseProperty: "DamageRadius",
			}, {
				ExtractAs: "TooltipRange",
				External: true,
				TraitName: "ZeusSecondaryTrait",
				BaseType: "ProjectileBase",
				BaseName: "LightningStrikeSecondary",
				BaseProperty: "Range",
			}],
		}],
	},
	ZeusRangedTrait: {
		DisplayName: `Electric Shot`,
		Description: q => `Your {Cast} is a burst of chain-lightning that bounces between foes.
{Bullet}Cast Damage: [${q.DisplayDelta1}]
{Bullet}Jumps: [${q.TooltipNumJumps}]
{Bullet}Jump Range: [${q.TooltipJumpRange}]`,
		...make_RarityLevels(1.0, 1.17, 1.35, 1.50),
		// Projectile.ZeusProjectile
		Effects: [{
			BaseValue: 60,
			...pom.DuplicateMultiplier,
			ExtractValue: [{
				ExtractAs: "TooltipDamage",
			}, {
				ExtractAs: "TooltipNumJumps",
				External: true,
				BaseType: "ProjectileBase",
				BaseName: "ZeusProjectile",
				BaseProperty: "NumJumps",
			}, {
				ExtractAs: "TooltipJumpRange",
				External: true,
				BaseType: "ProjectileBase",
				BaseName: "ZeusProjectile",
				BaseProperty: "JumpRange",
			}],
		}],
		Forbid: ["ShieldLoadAmmoTrait"],
	},
	ShieldLoadAmmo_ZeusRangedTrait: {
		DisplayName: `Thunder Flare`,
		Description: q => `Your {Cast} causes a lightning bolt to strike nearby foes.
{Bullet}Bolt Damage: [${q.DisplayDelta1}]
{Bullet}Damage Radius: [${q.TooltipDamageRadius}]
{Bullet}Range: [${q.TooltipRange}]`,
		...rarity_20,
		// Projectile.ZeusShieldLoadAmmoStrike
		Effects: [{
			BaseValue: 60,
			...pom.DuplicateStrongMultiplier,
			ExtractValue: [{
				ExtractAs: "TooltipDamage",
			}, {
				ExtractAs: "TooltipDamageRadius",
				External: true,
				TraitName: "ShieldLoadAmmo_ZeusRangedTrait",
				BaseType: "ProjectileBase",
				BaseName: "ZeusShieldLoadAmmoStrike",
				BaseProperty: "DamageRadius",
			}, {
				ExtractAs: "TooltipRange",
				External: true,
				TraitName: "ShieldLoadAmmo_ZeusRangedTrait",
				BaseType: "ProjectileBase",
				BaseName: "ZeusShieldLoadAmmoStrike",
				BaseProperty: "Range",
			}],
		}],
		Required: ['ShieldLoadAmmoTrait'],
	},
	ZeusRushTrait: {
		DisplayName: `Thunder Dash`,
		Description: q => `Your {Dash} causes a lightning bolt to strike nearby foes.
{Bullet}Bolt Damage: [${q.DisplayDelta1}]
{Bullet}Damage Radius: [${q.TooltipDamageRadius}]
{Bullet}Range: [${q.TooltipRange}]`,
		...rarity_50,
		// Projectile.LightningDash
		Effects: [{
			BaseValue: 10,
			...pom.DuplicateVeryStrongMultiplier,
			ExtractValue: [{
				ExtractAs: "TooltipDamage",
			}, {
				ExtractAs: "TooltipDamageRadius",
				External: true,
				TraitName: "ZeusRushTrait",
				BaseType: "ProjectileBase",
				BaseName: "LightningDash",
				BaseProperty: "DamageRadius",
			}, {
				ExtractAs: "TooltipRange",
				External: true,
				TraitName: "ZeusRushTrait",
				BaseType: "ProjectileBase",
				BaseName: "LightningDash",
				BaseProperty: "Range",
			}],
		}],
	},
	ZeusShoutTrait: {
		DisplayName: `Zeus' Aid`,
		Description: q => `Your {Call} makes lightning rapidly strike nearby foes for {${q.TooltipSuperDuration} Sec}.
{Bullet}Lightning Damage: [${q.DisplayDelta1}]
{Bullet}Max Gauge Bonus: [${q.TooltipDuration} Sec. Duration]
{Bullet}Damage Radius: [${q.TooltipDamageRadius}]
{Bullet}Range: [${q.TooltipRange}]`,
		...rarity_10,
		// Projectile.LightningStrikeX
		Effects: [{
			BaseValue: 50,
			...pom.DuplicateMultiplier,
			ExtractValue: [{
				ExtractAs: "TooltipDamage",
			}, {
				ExtractAs: "TooltipDamageRadius",
				External: true,
				TraitName: "ZeusShoutTrait",
				BaseType: "ProjectileBase",
				BaseName: "LightningStrikeX",
				BaseProperty: "DamageRadius",
			}, {
				ExtractAs: "TooltipRange",
				External: true,
				TraitName: "ZeusShoutTrait",
				BaseType: "ProjectileBase",
				BaseName: "LightningStrikeX",
				BaseProperty: "Range",
			}],
		}, {
			// Description: `Max Gauge Bonus: [9 Sec. Duration]`,
			SuperDuration: 1.5,
			MaxDurationMultiplier: 6,
			ExtractValue: [{
				Key: "SuperDuration",
				ExtractAs: "TooltipSuperDuration",
			}, {
				Key: "MaxDurationMultiplier",
				ExtractAs: "TooltipDuration",
				Format: "EXWrathDuration",
				DecimalPlaces: 2,
				SkipAutoExtract: true,
			}],
		}],
	},
	RetaliateWeaponTrait: {
		DisplayName: `Heaven's Vengeance`,
		Description: q => `After you take damage, your foe is struck by lightning.
{Bullet}Revenge Damage: [${q.DisplayDelta1}]
{Bullet}Damage Radius: [${q.TooltipDamageRadius}]`,
		...rarity_tier1,
		// Projectile.LightningStrikeRetaliate
		Effects: [{
			BaseValue: 80,
			...pom.DuplicateVeryStrongMultiplier,
			ExtractValue: [{
				ExtractAs: "TooltipDamage",
			}, {
				ExtractAs: "TooltipDamageRadius",
				External: true,
				TraitName: "RetaliateWeaponTrait",
				BaseType: "ProjectileBase",
				BaseName: "LightningStrikeRetaliate",
				BaseProperty: "DamageRadius",
			}],
		}],
	},
	PerfectDashBoltTrait: {
		DisplayName: `Lightning Reflexes`,
		Description: q => `After you {Dash} just before getting hit, a bolt strikes a nearby foe.
{Bullet}Bolt Damage: [${q.DisplayDelta1}]
{Bullet}Damage Radius: [${q.TooltipDamageRadius}]
{Bullet}Range: [${q.TooltipRange}]`,
		...rarity_50,
		// Projectile.LightningPerfectDash
		Effects: [{
			BaseValue: 20,
			MinMultiplier: 0.30,
			IdenticalMultiplier: {
				Value: -0.5,
			},
			ExtractValue: [{
				ExtractAs: "TooltipDamage",
			}, {
				ExtractAs: "TooltipDamageRadius",
				External: true,
				TraitName: "PerfectDashBoltTrait",
				BaseType: "ProjectileBase",
				BaseName: "LightningPerfectDash",
				BaseProperty: "DamageRadius",
			}, {
				ExtractAs: "TooltipRange",
				External: true,
				TraitName: "PerfectDashBoltTrait",
				BaseType: "ProjectileBase",
				BaseName: "LightningPerfectDash",
				BaseProperty: "Range",
			}],
		}],
	},
	ZeusBonusBounceTrait: {
		DisplayName: `Storm Lightning`,
		Description: q => `Your chain-lightning effects bounce more times before expiring.
{Bullet}Chain Lightning Bounces: [+${q.NewTotal1}]
{Bullet}Electric Shot Bounces: [+${q.NewTotal2}]`,
		...make_RarityLevels(1, 2, 3, 4),
		Effects: [{
			BaseValue: 2,
			ChangeType: "Add",
			ExtractValue: {
				ExtractAs: "BonusJumps",
			},
		}, {
			BaseValue: 3,
			ChangeType: "Add",
			ExtractValue: {
				ExtractAs: "BonusJumps_ElectricShot",
			},
		}],
		Required: [{
			OneOf: [
				'ZeusWeaponTrait',
				'ZeusRangedTrait',
			],
		}],
	},
	ZeusBoltAoETrait: {
		DisplayName: `High Voltage`,
		Description: q => `Your lightning bolt effects deal damage in a larger area.
{Bullet}Bolt Area of Effect: [${q.DisplayDelta1}]${[
				// 'ZeusSecondaryTrait',
				// 'ShieldLoadAmmo_ZeusRangedTrait',
				// 'ZeusRushTrait',
				// 'ZeusShoutTrait',
				// 'PerfectDashBoltTrait',
				// // 'CriticalBoltTrait',
				// 'LightningCloudTrait',
				// 'AmmoBoltTrait',
				// 'ImpactBoltTrait',
			].map(v => `\n{Bullet}*${dname(v)}*`).join('')}
{Bullet}*${dname('RetaliateWeaponTrait')}* is not affected.`,
		...rarity_20,
		Effects: [{
			BaseValue: 120,
			ChangeType: "Add",
			...pom.DuplicateMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipAoE",
				Format: "PercentOfBase",
				BaseType: "Projectile",
				BaseName: "LightningStrikeSecondary",
				BaseProperty: "DamageRadius",
			},
			// [{ // * ZeusSecondaryTrait
			// 	ExtractAs: "TooltipAoE",
			// 	Format: "PercentOfBase",
			// 	BaseType: "Projectile",
			// 	BaseName: "LightningStrikeSecondary",
			// 	BaseProperty: "DamageRadius",
			// }, { // * ZeusRushTrait
			// 	ExtractAs: "TooltipAoE",
			// 	Format: "PercentOfBase",
			// 	BaseType: "Projectile",
			// 	BaseName: "LightningDash",
			// 	BaseProperty: "DamageRadius",
			// }, { // * PerfectDashBoltTrait
			// 	ExtractAs: "TooltipAoE",
			// 	Format: "PercentOfBase",
			// 	BaseType: "Projectile",
			// 	BaseName: "LightningPerfectDash",
			// 	BaseProperty: "DamageRadius",
			// }, { // * ZeusShoutTrait
			// 	ExtractAs: "TooltipAoE",
			// 	Format: "PercentOfBase",
			// 	BaseType: "Projectile",
			// 	BaseName: "LightningStrikeX",
			// 	BaseProperty: "DamageRadius",
			// }, { // * CriticalBoltTrait
			// 	ExtractAs: "TooltipAoE",
			// 	Format: "PercentOfBase",
			// 	BaseType: "Projectile",
			// 	BaseName: "LightningStrikeCrit",
			// 	BaseProperty: "DamageRadius",
			// }, { // * ImpactBoltTrait
			// 	ExtractAs: "TooltipAoE",
			// 	Format: "PercentOfBase",
			// 	BaseType: "Projectile",
			// 	BaseName: "LightningStrikeImpact",
			// 	BaseProperty: "DamageRadius",
			// }, { // * AmmoBoltTrait
			// 	ExtractAs: "TooltipAoE",
			// 	Format: "PercentOfBase",
			// 	BaseType: "Projectile",
			// 	BaseName: "ZeusAmmoProjectile", // Weapon.ZeusAmmoWeapon
			// 	BaseProperty: "DamageRadius",
			// }, { // * LightningCloudTrait
			// 	ExtractAs: "TooltipAoE",
			// 	Format: "PercentOfBase",
			// 	BaseType: "Projectile",
			// 	BaseName: "ZeusDionysusCloudStrike",
			// 	BaseProperty: "DamageRadius",
			// }, { // * ShieldLoadAmmo_ZeusRangedTrait
			// 	ExtractAs: "TooltipAoE",
			// 	Format: "PercentOfBase",
			// 	BaseType: "Projectile",
			// 	BaseName: "ZeusShieldLoadAmmoStrike",
			// 	BaseProperty: "DamageRadius",
			// }],
		}],
		Required: [{
			OneOf: [
				'ZeusSecondaryTrait',
				"ShieldLoadAmmo_ZeusRangedTrait",
				'ZeusRushTrait',
				'ZeusShoutTrait',
			],
		}],
	},
	ZeusBonusBoltTrait: {
		DisplayName: `Double Strike`,
		Description: q => `Your lightning bolt effects have a chance to strike twice.
{Bullet}Strike Chance: [${q.DisplayDelta1}]${[
				// 'ZeusSecondaryTrait',
				// 'ShieldLoadAmmo_ZeusRangedTrait',
				// 'ZeusRushTrait', // from_property: BonusBolts (Powers.lua::ZeusDash)
				// 'ZeusShoutTrait', // from_property: BonusBolts (ShoutScripts.lua::ZeusShout)
				// 'PerfectDashBoltTrait', // from_property: BonusBolts (Powers.lua::ZeusPerfectDash)
				// 'RetaliateWeaponTrait',
				// // 'CriticalBoltTrait',
				// 'LightningCloudTrait', // from_property: BonusBolts (TraitScripts.lua::FireAmmoDeathWeapon)
				// // from_property: BonusBolts 
				// // (RoomManager.lua::CheckAmmoDrop -> GetHeroTraitValues("AmmoFieldWeapon"))
				// // (from_property: TraitData.AmmoBoltTrait.AmmoFieldWeapon)
				// // (TraitScripts.lua::FireAmmoWeapon)
				// 'AmmoBoltTrait',
				// 'ImpactBoltTrait',
			].map(v => `\n{Bullet}*${dname(v)}*`).join('')}`,
		...rarity_20,
		Effects: [{
			BaseValue: 0.25,
			ChangeType: "Add",
			...pom.DuplicateMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipChance",
				Format: "Percent",
			},
		}],
		Required: [{
			OneOf: [
				'ZeusSecondaryTrait',
				"ShieldLoadAmmo_ZeusRangedTrait",
				'ZeusRushTrait',
				'ZeusShoutTrait',
			],
		}],
	},
	ZeusLightningDebuff: {
		DisplayName: `Static Discharge`,
		Description: q => `Your lightning effects also make foes {Jolted}.
{Bullet}Jolt Damage: [${q.DisplayDelta1}]`,
		...rarity_tier1,
		Effects: [{
			BaseValue: 60,
			...pom.DuplicateStrongMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipDamage",
			},
		}],
		Inflicts: {
			Jolted: {},
		},
		Required: [{
			OneOf: [
				'ZeusWeaponTrait',
				'ZeusSecondaryTrait',
				'ZeusRangedTrait',
				"ShieldLoadAmmo_ZeusRangedTrait",
				'ZeusRushTrait',
				'ZeusShoutTrait',
				'RetaliateWeaponTrait',
				'PerfectDashBoltTrait',
			],
		}],
	},
	SuperGenerationTrait: {
		DisplayName: `Clouded Judgment`,
		Description: q => `Your {God Gauge} charges up faster when you deal or take damage.
{Bullet}Faster Gauge Gain: [${q.DisplayDelta1}]`,
		...rarity_20,
		Effects: [{
			BaseValue: 1.1,
			SourceIsMultiplier,
			...pom.DuplicateMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipMultiplier",
				Format: "PercentDelta",
			},
		}],
		Required: [{
			OneOf: [
				// RequiredSlottedTrait = "Shout",
				'AphroditeShoutTrait',
				'AresShoutTrait',
				'ArtemisShoutTrait',
				'AthenaShoutTrait',
				'DemeterShoutTrait',
				'DionysusShoutTrait',
				'PoseidonShoutTrait',
				'ZeusShoutTrait',
				'HadesShoutTrait',
			],
		}],
	},
	OnWrathDamageBuffTrait: {
		DisplayName: `Billowing Strength`,
		Description: q => `After using {Call}, you deal more damage for {${q.TooltipDuration} Sec.}
{Bullet}Bonus Damage: [${q.DisplayDelta1}]`,
		...rarity_10,
		Effects: [{
			ChangeValue: 15,
			ChangeType: "Add",
			ExtractValue: {
				ExtractAs: "TooltipDuration",
				SkipAutoExtract: true,
			},
		}, {
			BaseValue: 1.20,
			ChangeType: "Multiply",
			SourceIsMultiplier,
			...pom.DuplicateMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipBonus",
				Format: "PercentDelta",
			},
		}],
		Required: [{
			OneOf: [
				// RequiredSlottedTrait = "Shout",
				'AphroditeShoutTrait',
				'AresShoutTrait',
				'ArtemisShoutTrait',
				'AthenaShoutTrait',
				'DemeterShoutTrait',
				'DionysusShoutTrait',
				'PoseidonShoutTrait',
				'ZeusShoutTrait',
				'HadesShoutTrait',
			],
		}],
	},
	ZeusChargedBoltTrait: {
		DisplayName: `Splitting Bolt`,
		Description: q => `Whenever you strike foes with lightning {Boons}, fire an electric bolt.
{Bullet}Lightning Damage: [${q.NewTotal1}]`,
		Notes: [
			`The additional burst is a slow moving spark.`,
			`Spark Speed: [500]`,
		],
		...rarity_tier3,
		Effects: [{
			BaseValue: 40,
			...pom.DuplicateMultiplier,
			AutoRamp: true,
			ExtractValue: {
				ExtractAs: "TooltipDamage",
			},
			// Bounces: 5,
			// BounceRange: 520,
		}],
		Forbid: ["ZeusChargedBoltTrait"],
		Required: [{
			OneOf: [
				'ZeusBonusBounceTrait',
				'ZeusBoltAoETrait',
				'ZeusBonusBoltTrait',
			],
		}],
	},
	// Poseidon
	PoseidonWeaponTrait: {
		DisplayName: `Tempest Strike`,
		Description: q => `Your {Attack} deals more damage and knocks foes away.
{Bullet}Attack Damage: [${q.DisplayDelta1}]`,
		...rarity_tier1,
		Effects: [{
			BaseValue: 1.30,
			SourceIsMultiplier,
			...pom.DuplicateMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipDamage",
				Format: "PercentDelta",
			},
		}],
	},
	PoseidonSecondaryTrait: {
		DisplayName: `Tempest Flourish`,
		Description: q => `Your {Special} deals more damage and knocks foes away.
{Bullet}Special Damage: [${q.DisplayDelta1}]`,
		...rarity_tier1,
		Effects: [{
			BaseValue: 1.7,
			SourceIsMultiplier,
			...pom.DuplicateMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipDamage",
				Format: "PercentDelta",
			},
		}],
	},
	PoseidonRangedTrait: {
		DisplayName: `Flood Shot`,
		Description: q => `Your {Cast} damages foes in an area and knocks them away.
{Bullet}Cast Damage: [${q.DisplayDelta1}]
{Bullet}Damage Radius: [${q.TooltipDamageRadius}]`,
		...rarity_20,
		Effects: [{
			BaseValue: 60,
			...pom.DuplicateStrongMultiplier,
			ExtractValue: [{
				ExtractAs: "TooltipDamage",
			}, {
				ExtractAs: "TooltipDamageRadius",
				External: true,
				BaseType: "ProjectileBase",
				BaseName: "PoseidonProjectile",
				BaseProperty: "DamageRadius",
			}],
			// ImpactVelocity: 2500,
		}],
		Forbid: ['ShieldLoadAmmoTrait'],
	},
	// ! ONLY VISUAL. Actual trait is always PoseidonRangedTrait
	ShieldLoadAmmo_PoseidonRangedTrait: {
		DisplayName: `Flood Flare`,
		Description: q => `Your {Cast} damages foes around you and knocks them away.
{Bullet}Blast Damage: [${q.DisplayDelta1}]
{Bullet}Blast Radius: [${q.TooltipDamageRadius}]`,
		...rarity_20,
		Effects: [{
			BaseValue: 60,
			...pom.DuplicateStrongMultiplier,
			ExtractValue: [{
				ExtractAs: "TooltipDamage",
			}, {
				ExtractAs: "TooltipDamageRadius",
				External: true,
				BaseType: "ProjectileBase",
				BaseName: "PoseidonProjectile",
				BaseProperty: "DamageRadius",
			}],
		}],
		Required: ['ShieldLoadAmmoTrait'],
	},
	PoseidonRushTrait: {
		DisplayName: `Tidal Dash`,
		Description: q => `Your {Dash} damages foes in an area and knocks them away.
{Bullet}Dash Damage: [${q.DisplayDelta1}]
{Bullet}Damage Radius: [${q.TooltipDamageRadius}]`,
		Notes: [
			// Okay wiki, I will just give you benefit of the doubt
			`Sometimes stuns foes on impact.`,
		],
		...rarity_20,
		Effects: [{
			BaseValue: 35,
			...pom.DuplicateStrongMultiplier,
			ExtractValue: [{
				ExtractAs: "TooltipDamage",
			}, {
				ExtractAs: "TooltipDamageRadius",
				External: true,
				BaseType: "ProjectileBase",
				BaseName: "PoseidonRushProjectile",
				BaseProperty: "DamageRadius",
			}],
			// ImpactVelocity: 2500,
		}],
	},
	PoseidonShoutTrait: {
		DisplayName: `Poseidon's Aid`,
		Description: q => `Your {Call} makes you surge into foes while {Impervious} for {${q.TooltipSuperDuration} Sec.}
{Bullet}Impact Damage: [${q.DisplayDelta1}]
{Bullet}Max Gauge Bonus: [${q.TooltipDuration} Sec.]`,
		...rarity_20,
		Effects: [{
			BaseValue: 250,
			...pom.DuplicateMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipDamage",
			},
			// ImpactVelocity: 3500,
		}, {
			// Description: `Max Gauge Bonus: [7.2 Sec.]`,
			SuperDuration: 1.2,
			MaxDurationMultiplier: 6,
			ExtractValue: [{
				Key: "SuperDuration",
				ExtractAs: "TooltipSuperDuration",
			}, {
				Key: "MaxDurationMultiplier",
				ExtractAs: "TooltipDuration",
				Format: "EXWrathDuration",
				DecimalPlaces: 2,
				SkipAutoExtract: true,
			}],
		}],
	},
	BonusCollisionTrait: {
		DisplayName: `Typhoon's Fury`,
		Description: q => `You deal more damage when slamming foes into barriers.
{Bullet}Slam Damage: [${q.DisplayDelta1}]`,
		Notes: [
			`Will only proc with Boon-enabled knock-away.<br/>Will {not} proc on shield attack, sword lunge, etc.`,
		],
		...rarity_25,
		Effects: [{
			BaseValue: 3.0,
			...pom.DuplicateMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipVulnerability",
				Format: "PercentDelta",
			},
		}],
		Required: [{
			OneOf: [
				'PoseidonWeaponTrait',
				'PoseidonSecondaryTrait',
				'PoseidonRangedTrait',
				// actually VISUAL
				"ShieldLoadAmmo_PoseidonRangedTrait",
				'PoseidonRushTrait',
				'PoseidonShoutTrait',
			],
		}],
	},
	EncounterStartOffenseBuffTrait: {
		DisplayName: `Hydraulic Might`,
		Description: q => `Your {Attack} and {Special} are stronger the first {${q.TooltipDuration} Sec.} in {Encounter\\(s)}.
{Bullet}Initial Damage Bonus: [${q.DisplayDelta1}]`,
		...make_RarityLevels(1.0, 1.25, 1.50, 1.77),
		Effects: [{
			BaseValue: 1.5,
			SourceIsMultiplier,
			IdenticalMultiplier: {
				Value: -0.8,
			},
			ExtractValue: {
				ExtractAs: "TooltipDamage",
				Format: "PercentDelta",
			},
		}, {
			ChangeValue: 10,
			ExtractValue: {
				ExtractAs: "TooltipDuration",
				SkipAutoExtract: true,
			},
		}],
	},
	RoomRewardBonusTrait: {
		DisplayName: `Ocean's Bounty`,
		Description: q => `Any {Gems_Small}, {Darkness_Small} or {Currency_Small} chamber rewards are worth more.
{Bullet}Reward Value: [${q.NewTotal1}]`,
		...rarity_10,
		Effects: [{
			BaseValue: 1.5,
			SourceIsMultiplier,
			...pom.DuplicateMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipPercentIncrease",
				Format: "PercentDelta",
			},
		}],
		Forbid: ["RoomRewardBonusTrait"],
	},
	PoseidonPickedUpMinorLootTrait: { // RandomMinorLootDrop
		DisplayName: `Sunken Treasure`,
		Description: q => `Gain a random assortment of {Gems_Small}, {Darkness_Small}, {Currency_Small} and {HealthRestore_Small}.
{Bullet}Obols: [${q.Money}]
{Bullet}Health: [${q.HealDropMinor}]
{Bullet}Darkness: [${q.RoomRewardMetaPointDrop}]
{Bullet}Gemstone: [${q.GemDrop}]
{Bullet}Chance of Nectar: [${q.GiftDrop}%]
{Bullet}Chance of Diamond: [${q.SuperGemDrop}%]`,
		Pom: false,
		...rarity_30,
		Effects: [{
			BaseMin: 90,
			BaseMax: 90,
			ExtractValue: {
				ExtractAs: "Money",
			},
		}, {
			BaseMin: 3,
			BaseMax: 3,
			ExtractValue: {
				ExtractAs: "HealDropMinor",
			},
		}, {
			BaseMin: 1,
			BaseMax: 1,
			ExtractValue: {
				ExtractAs: "RoomRewardMetaPointDrop",
			},
		}, {
			BaseMin: 2,
			BaseMax: 2,
			ExtractValue: {
				ExtractAs: "GemDrop",
			},
		}, {
			BaseValue: 0.2,
			ExtractValue: {
				ExtractAs: "GiftDrop",
				Format: "Percent",
				// DecimalPlaces: 1,
			},
		}, {
			BaseValue: 0.003,
			DecimalPlaces: 4,
			ExtractValue: {
				ExtractAs: "SuperGemDrop",
				Format: "Percent",
				// DecimalPlaces: 4,
			},
		}],
	},
	SlipperyTrait: {
		DisplayName: `Razor Shoals`,
		Description: q => `Your {Boons} with knock-away effects also {Rupture} foes.
{Bullet}Rupture Damage: [${q.DisplayDelta1}] (every ${q.TooltipSlipperyRate} Sec.)`,
		Notes: [
			`Will only proc with Boon-enabled knock-away.<br/>Will {not} proc on shield attack, sword lunge, etc.`,
		],
		...rarity_50,
		Effects: [{
			BaseValue: 10,
			ChangeType: "Add",
			MinMultiplier: 0.2,
			...pom.DuplicateStrongMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipDamage",
			},
		}, {
			ExtractValue: {
				ExtractAs: "TooltipSlipperyRate",
				SkipAutoExtract: true,
				External: true,
				BaseType: "Effect",
				WeaponName: "SwordWeapon",
				BaseName: "DamageOverDistance",
				BaseProperty: "Cooldown",
				DecimalPlaces: 1,
			},
		}],
		Inflicts: {
			Rupture: {},
		},
		Required: [{
			OneOf: [
				'PoseidonWeaponTrait',
				'PoseidonSecondaryTrait',
				'PoseidonRangedTrait',
				// actually VISUAL
				"ShieldLoadAmmo_PoseidonRangedTrait",
				'PoseidonRushTrait',
				'PoseidonShoutTrait',
			],
		}],
	},
	DefensiveSuperGenerationTrait: {
		DisplayName: `Boiling Point`,
		Description: q => `Your {God Gauge} charges up faster when you take damage.
{Bullet}Faster Gauge Gain When Hit: [${q.DisplayDelta1}]`,
		...rarity_25,
		Effects: [{
			BaseValue: 1.4,
			SourceIsMultiplier,
			...pom.DuplicateMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipMultiplier",
				Format: "PercentDelta",
			},
		}],
		Required: [{
			OneOf: [
				// RequiredSlottedTrait = "Shout",
				'AphroditeShoutTrait',
				'AresShoutTrait',
				'ArtemisShoutTrait',
				'AthenaShoutTrait',
				'DemeterShoutTrait',
				'DionysusShoutTrait',
				'PoseidonShoutTrait',
				'ZeusShoutTrait',
				'HadesShoutTrait',
			],
		}],
	},
	SlamExplosionTrait: {
		DisplayName: `Breaking Wave`,
		Description: q => `Slamming foes into barriers creates a watery blast in the area.
{Bullet}Blast Damage: [${q.DisplayDelta1}]
{Bullet}Blast Radius: [${q.TooltipDamageRadius}]`,
		Notes: [
			`Will work without Boon-enabled knock-away.<br/>{Will proc} with shield attack, sword lunge, etc.`,
		],
		...rarity_50,
		Effects: [{
			BaseValue: 100,
			ChangeType: "Add",
			...pom.DuplicateMultiplier,
			ExtractValue: [{
				ExtractAs: "TooltipDamage",
			}, {
				ExtractAs: "TooltipDamageRadius",
				External: true,
				BaseType: "ProjectileBase",
				BaseName: "PoseidonCollisionBlast",
				BaseProperty: "DamageRadius",
			}],
		}],
		Required: [{
			OneOf: [
				'PoseidonWeaponTrait',
				'PoseidonSecondaryTrait',
				'PoseidonRangedTrait',
				// actually VISUAL
				"ShieldLoadAmmo_PoseidonRangedTrait",
				'PoseidonRushTrait',
				'PoseidonShoutTrait',
			],
		}],
	},
	BossDamageTrait: {
		DisplayName: `Wave Pounding`,
		Description: q => `Your {Boons} with knock-away effects deal bonus damage to {Bosses}.
{Bullet}Knock-Away Damage vs. Bosses: [${q.DisplayDelta1}]`,
		Notes: [
			`Will work without Boon-enabled knock-away.<br/>{Will proc} with shield attack, sword lunge, etc.`,
		],
		...rarity_50,
		Effects: [{
			BaseValue: 1.20,
			SourceIsMultiplier,
			...pom.DuplicateMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipDamage",
				Format: "PercentDelta",
			},
		}],
		Required: [{
			OneOf: [
				'PoseidonWeaponTrait',
				'PoseidonSecondaryTrait',
				'PoseidonRangedTrait',
				// actually VISUAL
				"ShieldLoadAmmo_PoseidonRangedTrait",
				'PoseidonRushTrait',
				'PoseidonShoutTrait',
			],
		}],
	},
	PoseidonShoutDurationTrait: {
		DisplayName: `Rip Current`,
		Description: q => `Your {Call} pulls in foes and the effect lasts longer.
{Bullet}Bonus Duration: [${q.DisplayDelta1} Sec. Duration]`,
		...rarity_25,
		Effects: [{
			BaseValue: 1,
			IdenticalMultiplier: {
				Value: -0.8,
			},
			ExtractValue: {
				ExtractAs: "TooltipDuration",
				DecimalPlaces: 1,
			},
		}],
		Required: [{
			OneOf: [
				'PoseidonShoutTrait',
			],
		}],
	},
	FishingTrait: {
		DisplayName: `Huge Catch`,
		Description: q => `You have a greater chance to find a {Fishing Point} in each {Chamber}.
{Bullet}Fish Spawn Chance: [+${q.TooltipBonus}%]`,
		...rarity_tier3,
		Effects: [{
			ChangeValue: 0.2,
			ExtractValue: {
				ExtractAs: "TooltipBonus",
				Format: "Percent",
			},
		}],
		Forbid: ["FishingTrait"],
		Required: [{
			Description: 'Two of the Following:',
			List: [
				'RoomRewardBonusTrait',
				'PoseidonPickedUpMinorLootTrait', // 'RandomMinorLootDrop',
				'ForcePoseidonBoonTrait',
			],
		}],
	},
	DoubleCollisionTrait: {
		DisplayName: `Second Wave`,
		Description: q => `Your {Boons} with knock-away effects shove foes multiple times.
{Bullet}Bonus Knock-Away Effects: [+1]
{Bullet}Second Knockback Delay: [${q.TooltipDelayedKnockback} Sec.]`,
		Notes: [
			`Will only proc with Boon-enabled knock-away.<br/>Will {not} proc on shield attack, sword lunge, etc.`,
		],
		...rarity_tier3,
		Effects: [{
			ExtractValue: [{
				ExtractAs: "TooltipDelayedKnockback",
				External: true,
				BaseType: "Effect",
				WeaponName: "RangedWeapon",
				BaseName: "DelayedKnockback",
				BaseProperty: "Duration",
			}],
		}],
		Forbid: ["DoubleCollisionTrait"],
		Required: [{
			OneOf: [
				'BonusCollisionTrait',
				'SlamExplosionTrait',
			],
		}, {
			OneOf: [
				'PoseidonWeaponTrait',
				'PoseidonSecondaryTrait',
				'PoseidonRangedTrait',
				// VISUAL
				'ShieldLoadAmmo_PoseidonRangedTrait',
				'PoseidonRushTrait',
				'PoseidonShoutTrait',
			],
		}],
	},
	// Hermes (Pom: false, because LootData.Herme.GotLoot=false, because of GetAllUpgradeableGodTraits)
	HermesWeaponTrait: {
		DisplayName: `Swift Strike`,
		Description: q => `Your {Attack} is faster.
{Bullet}Attack Speed: [${percent(q.TooltipSpeedIncrease)}]`,
		// Notes: [
		// 	`Works in decreasing weapon attack charge time by %n%`,
		// ],
		Pom: false,
		...make_RarityLevels(1.280, 1.140, 1.000, 0.860),
		Effects: [{
			BaseValue: 0.70,
			ExtractValue: {
				ExtractAs: "TooltipSpeedIncrease",
				Format: "NegativePercentDelta",
				DecimalPlaces: 2,
			},
		}],
	},
	HermesSecondaryTrait: {
		DisplayName: `Swift Flourish`,
		Description: q => `Your {Special} is faster.
{Bullet}Special Speed: [${percent(q.TooltipSpeedIncrease)}]`,
		// Notes: [
		// 	`Works in decreasing weapon special charge time by %n%`,
		// ],
		Pom: false,
		...make_RarityLevels(1, 2, 3, 4),
		Effects: [{
			BaseValue: 0.9,
			SourceIsMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipSpeedIncrease",
				Format: "NegativePercentDelta",
				DecimalPlaces: 2,
			},
		}],
		Forbid: ["SwordSecondaryBlinkTrait"],
	},
	RapidCastTrait: {
		DisplayName: `Flurry Cast`,
		Description: q => `Hold {Cast} to fire in rapid succession.
{Bullet}Cast Speed: [${percent(q.TooltipSpeedIncrease)}]`,
		Pom: false,
		...make_RarityLevels(1.00, 0.75, 0.50, 0.25),
		Effects: [{
			BaseValue: 0.8,
			ChangeType: "Multiply",
			ExtractValue: {
				ExtractAs: "TooltipSpeedIncrease",
				Format: "NegativePercentDelta",
			},
		}],
		Forbid: ["RapidCastTrait", "BowLoadAmmoTrait", "ShieldLoadAmmoTrait"],
		Required: ['AmmoMetaUpgrade'],
	},
	RegeneratingSuperTrait: {
		DisplayName: `Quick Favor`,
		Description: q => `Your {God Gauge} charges up automatically.
{Bullet}Auto Gauge Gain: [+1%] (every ${q.TooltipInterval} Sec.)`,
		Pom: false,
		...make_RarityLevels(1, 0.75, 0.5, 0.25),
		Effects: [{
			ChangeValue: 1,
			ExtractValue: {
				ExtractAs: "TooltipSuperAmount",
			},
		}, {
			BaseValue: 2,
			ExtractValue: {
				ExtractAs: "TooltipInterval",
				DecimalPlaces: 2,
			},
		}],
		// ! BUG: the table contains duplicate keys: RequiredFalseTraits
		// Forbid: ["RegeneratingSuperTrait", "HadesShoutTrait"],
		Forbid: ["RegeneratingSuperTrait"],
		Required: [{
			OneOf: [
				// RequiredSlottedTrait = "Shout",
				'AphroditeShoutTrait',
				'AresShoutTrait',
				'ArtemisShoutTrait',
				'AthenaShoutTrait',
				'DemeterShoutTrait',
				'DionysusShoutTrait',
				'PoseidonShoutTrait',
				'ZeusShoutTrait',
				'HadesShoutTrait',
			],
		}],
	},
	RushSpeedBoostTrait: {
		DisplayName: `Hyper Sprint`,
		Description: q => `After you {Dash}, briefly become {Sturdy} and move {${percent(q.TooltipSpeedBoost)}} faster.
{Bullet}Sprint Duration: [${q.TooltipDuration} Sec.]`,
		Pom: false,
		...make_RarityLevels(1.0, 1.2, 1.4, 1.8),
		Effects: [{
			BaseValue: 0.7,
			ChangeType: "Absolute",
			SourceIsMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipDamageReduction",
				Format: "NegativePercentDelta",
			},
		}, {
			BaseValue: 0.5,
			ChangeType: "Absolute",
			ExtractValue: {
				ExtractAs: "TooltipDuration",
				DecimalPlaces: 2,
			},
		}, {
			ChangeValue: 2.0,
			ChangeType: "Absolute",
			SourceIsMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipSpeedBoost",
				Format: "PercentDelta",
			},
		}],
		Forbid: ["RushSpeedBoostTrait"],
	},
	MoveSpeedTrait: {
		DisplayName: `Greater Haste`,
		Description: q => `You move faster.
{Bullet}Move Speed: [${q.TooltipSpeed}%]`,
		Pom: false,
		...make_RarityLevels(1.0, 1.08, 1.17, 1.25),
		Effects: [{
			BaseValue: 1.2,
			ChangeType: "Multiply",
			ExtractValue: {
				ExtractAs: "TooltipSpeed",
				Format: "PercentDelta",
			},
		}],
		Forbid: ["MoveSpeedTrait"],
	},
	RushRallyTrait: {
		DisplayName: `Quick Recovery`,
		Description: q => `After taking damage, quickly {Dash} to recover some {Health_Small} you just lost.
{Bullet}Life Recovered: [${q.TooltipHeal}%] *of damage taken*`,
		Pom: false,
		...make_RarityLevels(0.3, 0.4, 0.5, 0.6),
		Effects: [{
			BaseValue: 1.0,
			ChangeType: "Absolute",
			ExtractValue: {
				ExtractAs: "TooltipHeal",
				Format: "Percent",
			},
		}],
		Forbid: ["RushRallyTrait"],
	},
	DodgeChanceTrait: {
		DisplayName: `Greater Evasion`,
		Description: q => `Whenever you are hit, you have a chance to {Dodge} automatically.
{Bullet}Dodge Chance: [${percent(q.TooltipChance)}]`,
		Pom: false,
		...rarity_50,
		Effects: [{
			BaseValue: 0.10,
			ChangeType: "Add",
			DataValue: false,
			ExtractValue: {
				ExtractAs: "TooltipChance",
				Format: "Percent",
			},
		}],
		Forbid: ["DodgeChanceTrait"],
	},
	BonusDashTrait: {
		DisplayName: `Greatest Reflex`,
		Description: q => `You can {Dash} more times in a row.
{Bullet}Bonus Dash Charges: [+${q.TooltipBonusDashes}]`,
		Pom: false,
		...make_RarityLevels(1, 2, 3, 4),
		Effects: [{
			BaseValue: 1,
			ChangeType: "Add",
			ExtractValue: {
				ExtractAs: "TooltipBonusDashes",
			},
		}],
		Forbid: ["BonusDashTrait"],
	},
	HermesShoutDodge: {
		DisplayName: `Second Wind`,
		Description: q => `After using {Call}, gain {Dodge} chance and move speed for {${q.TooltipDuration} Sec.}
{Bullet}Bonus Dodge Chance & Move Speed: [${q.NewTotal1}]`,
		Pom: false,
		...rarity_10,
		Effects: [{
			BaseValue: 0.3,
			ChangeType: "Add",
			ExtractValue: {
				ExtractAs: "TooltipBonus",
				Format: "Percent",
			},
		}, {
			ChangeValue: 10,
			ChangeType: "Absolute",
			ExtractValue: {
				ExtractAs: "TooltipDuration",
				SkipAutoExtract: true,
			},
		}],
		Forbid: ["HermesShoutDodge"],
		Required: [{
			OneOf: [
				// RequiredSlottedTrait = "Shout",
				'AphroditeShoutTrait',
				'AresShoutTrait',
				'ArtemisShoutTrait',
				'AthenaShoutTrait',
				'DemeterShoutTrait',
				'DionysusShoutTrait',
				'PoseidonShoutTrait',
				'ZeusShoutTrait',
				'HadesShoutTrait',
			],
		}],
	},
	AmmoReclaimTrait: {
		DisplayName: `Quick Reload`,
		Description: q => `Foes drop {Ammo} stuck in them faster.
{Bullet}Drop Time: [${q.DisplayDelta1} Sec.]
{Bullet}*Divide* Current {Ammo} Drop Time by: [${q.TooltipAmmoDivisor}]`,
		Pom: false,
		...make_RarityLevels(2, 3, 4, 5),
		Effects: [{
			// x/3.2=5
			// x=16
			// [5, 3.33, 2.5, 2]
			BaseValue: 1.6,
			ExtractAs: "AmmoReclaimTimeDivisor",
			...pom.DuplicateMultiplier,
			ExtractValue: [{
				ExtractAs: "TooltipAmmo",
				Format: "AmmoDelayDivisor",
				DecimalPlaces: 1.0,
			}, {
				ExtractAs: "TooltipAmmoDivisor",
			}],
		}],
		Forbid: [
			'ShieldLoadAmmoTrait',
			'DemeterRangedTrait',
			'PoseidonAresProjectileTrait',
			'AresRangedTrait',
			'DionysusRangedTrait',
			// VISUAL
			// 'ShieldLoadAmmo_DionysusRangedTrait',
		],
		Required: ['AmmoMetaUpgrade'],
	},
	ChamberGoldTrait: {
		DisplayName: `Side Hustle`,
		Description: q => `Each time you enter a {Chamber}, gain a bit wealth.
{Bullet}Bonus Wealth per Chamber: [+${q.MoneyPerRoom}] {Currency_Small}`,
		Notes: [
			`Not affected by boons that modify wealth gain`,
			`Applies to Temple of Styx mini-chambers`,
		],
		Pom: false,
		...rarity_30,
		Effects: [{
			BaseValue: 10,
			ExtractValue: {
				ExtractAs: "MoneyPerRoom",
			},
		}],
		Forbid: ["ChamberGoldTrait"],
	},
	SpeedDamageTrait: {
		DisplayName: `Rush Delivery`,
		Description: q => `You deal bonus damage based on any bonus move speed.
{Bullet}Bonus Damage from Bonus Speed: [${q.TooltipBonus}%]`,
		Pom: false,
		...rarity_50,
		Effects: [{
			BaseValue: 0.5,
			ExtractValue: {
				ExtractAs: "TooltipBonus",
				Format: "Percent",
			},
		}],
		Forbid: ["SpeedDamageTrait"],
		Required: [{
			OneOf: [
				'MoveSpeedTrait',
				'RushSpeedBoostTrait',
				'FastClearDodgeBonusTrait',
			],
		}],
	},
	AmmoReloadTrait: {
		DisplayName: `Auto Reload`,
		Description: q => `You regenerate {Ammo} faster.
{Bullet}Regeneration Time: [${q.DisplayDelta1} Sec.]
{Bullet}*Divide* Current {Ammo} Regeneration Time by: [${q.TooltipAmmoDivisor}]`,
		Pom: false,
		...make_RarityLevels(1.00, 2.75 / 2.5, 2.75 / 2.25, 2.75 / 2),
		Effects: [{
			// Value: 2.75,
			// Rarity: [2.5, 2.26, 2],
			// x/(3/2.75)=2.75
			// x=3
			BaseValue: 3 / 2.75,
			ExtractAs: "AmmoReloadTimeDivisor",
			ExtractValue: [{
				ExtractAs: "TooltipAmmo",
				Format: "AmmoReloadDivisor",
				DecimalPlaces: 2.0,
			}, {
				ExtractAs: "TooltipAmmoDivisor",
			}],
		}],
		Forbid: ["AmmoReloadTrait"],
		Required: ["ReloadAmmoMetaUpgrade"],
	},
	MagnetismTrait: {
		DisplayName: `Greater Recall`,
		Description: q => `Your {Ammo} return to you automatically.
{Bullet}Bloodstone Return Delay: [0 Sec.]`,
		Pom: false,
		...rarity_tier3,
		Effects: [
			// {
			// 	...rarity_tier3,
			// 	BaseValue: 100.0,
			// 	ChangeType: "Multiply",
			// 	SourceIsMultiplier,
			// 	ExtractValue: {
			// 		ExtractAs: "TooltipMagnetism",
			// 		Format: "PercentDelta",
			// 	},
			// }
		],
		Forbid: ["MagnetismTrait"],
		Required: ['AmmoMetaUpgrade', {
			OneOf: [
				'RapidCastTrait',
				'AmmoReclaimTrait',
				'FastClearDodgeBonusTrait',
			],
		}],
	},
	UnstoredAmmoDamageTrait: {
		DisplayName: `Bad News`,
		Description: q => `Your {Cast} deals bonus damage to foes *without* {Ammo} in them.
{Bullet}First-Shot Damage: [${percent(q.TooltipDamage)}]`,
		Pom: false,
		...rarity_tier3,
		Effects: [{
			ChangeValue: 1.5,
			ExtractValue: {
				ExtractAs: "TooltipDamage",
				Format: "PercentDelta",
			},
		}],
		Forbid: ["UnstoredAmmoDamageTrait", "MagnetismTrait"],
		Required: ['ReloadAmmoMetaUpgrade', {
			OneOf: [
				'AmmoReloadTrait',
				'FastClearDodgeBonusTrait',
			],
		}],
	},
	// Dionysus
	DionysusWeaponTrait: {
		DisplayName: `Drunken Strike`,
		Description: q => `Your {Attack} inflicts {Hangover}.
{Bullet}Hangover Damage: [${q.DisplayDelta1}] (every ${q.TooltipPoisonRate} Sec.)`,
		...rarity_25,
		Effects: [{
			BaseValue: 4,
			ChangeType: "Add",
			MinMultiplier: 0.335,
			AsInt,
			...pom.DuplicateMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipDamage",
			},
		}, {
			ExtractValue: {
				ExtractAs: "TooltipPoisonRate",
				SkipAutoExtract: true,
				External: true,
				BaseType: "Effect",
				WeaponName: "SwordWeapon",
				BaseName: "DamageOverTime",
				BaseProperty: "Cooldown",
				DecimalPlaces: 1,
			},
		}],
		Inflicts: {
			Hangover: {},
		},
	},
	DionysusSecondaryTrait: {
		DisplayName: `Drunken Flourish`,
		Description: q => `Your {Special} inflicts {Hangover}.
{Bullet}Hangover Damage: [${q.DisplayDelta1}] (every ${q.TooltipPoisonRate} Sec.)`,
		...rarity_20,
		Effects: [{
			BaseValue: 5,
			ChangeType: "Add",
			AsInt,
			MinMultiplier: 0.25,
			...pom.DuplicateMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipDamage",
			},
		}, {
			ExtractValue: {
				ExtractAs: "TooltipPoisonRate",
				SkipAutoExtract: true,
				External: true,
				BaseType: "Effect",
				WeaponName: "SwordWeapon",
				BaseName: "DamageOverTime",
				BaseProperty: "Cooldown",
				DecimalPlaces: 1,
			},
		}],
		Inflicts: {
			Hangover: {},
		},
	},
	DionysusRangedTrait: {
		DisplayName: `Trippy Shot`,
		Description: q => `Your {Cast} lobs a large explosive that bursts into {Festive Fog}.
{Bullet}Cast Damage: [${q.DisplayDelta1}]
{Bullet}Damage Radius: [${q.TooltipDamageRadius}]`,
		...rarity_20,
		// Projectile.DionysusLobProjectile
		Effects: [{
			BaseValue: 100,
			AsInt,
			...pom.DuplicateStrongMultiplier,
			ExtractValue: [{
				ExtractAs: "TooltipDamage",
			}, {
				ExtractAs: "TooltipDamageRadius",
				External: true,
				TraitName: "DionysusRangedTrait",
				BaseType: "ProjectileBase",
				BaseName: "DionysusLobProjectile",
				BaseProperty: "DamageRadius",
			}],
			// Duration: 5,
			// StunFrequency: 0.25,
		}],
		Forbid: [
			'BowLoadAmmoTrait',
			'ShieldLoadAmmoTrait',
		],
	},
	// ! ONLY VISUAL. Actual trait is always DionysusRangedTrait
	ShieldLoadAmmo_DionysusRangedTrait: {
		DisplayName: `Trippy Flare`,
		Description: q => `Your {Cast} damages foes around you, leaving behind {Festive Fog}.
{Bullet}Blast Damage: [${q.NewTotal1}]
{Bullet}Damage Radius: [${q.TooltipDamageRadius}]`,
		...rarity_20,
		// Projectile.DionysusLobProjectile
		Effects: [{
			BaseValue: 100,
			AsInt,
			...pom.DuplicateStrongMultiplier,
			ExtractValue: [{
				ExtractAs: "TooltipDamage",
			}, {
				ExtractAs: "TooltipDamageRadius",
				External: true,
				TraitName: "DionysusRangedTrait",
				BaseType: "ProjectileBase",
				BaseName: "DionysusLobProjectile",
				BaseProperty: "DamageRadius",
			}],
		}],
		Required: [{
			OneOf: [
				'BowLoadAmmoTrait',
				'ShieldLoadAmmoTrait',
			],
		}],
	},
	DionysusRushTrait: {
		DisplayName: `Drunken Dash`,
		Description: q => `Your {Dash} causes {Hangover} several times near where you started.
{Bullet}Hangover Damage: [${q.DisplayDelta1}] (every ${q.TooltipPoisonRate} Sec.)
{Bullet}Damage Radius: [${q.TooltipDamageRadius}]`,
		...rarity_50,
		// Projectile.DionysusDashProjectile
		Effects: [{
			BaseValue: 2,
			ChangeType: "Add",
			AsInt,
			MinMultiplier: 0.5,
			IdenticalMultiplier: {
				Value: -0.8,
			},
			ExtractValue: [{
				ExtractAs: "TooltipDamage",
			}, {
				ExtractAs: "TooltipDamageRadius",
				External: true,
				TraitName: "DionysusRushTrait",
				BaseType: "ProjectileBase",
				BaseName: "DionysusDashProjectile",
				BaseProperty: "DamageRadius",
			}],
		}, {
			ExtractValue: {
				ExtractAs: "TooltipPoisonRate",
				SkipAutoExtract: true,
				External: true,
				BaseType: "Effect",
				WeaponName: "SwordWeapon",
				BaseName: "DamageOverTime",
				BaseProperty: "Cooldown",
				DecimalPlaces: 1,
			},
		}],
		Inflicts: {
			Hangover: {},
		},
	},
	DionysusShoutTrait: {
		DisplayName: `Dionysus' Aid`,
		Description: q => `Your {Call} inflicts {Hangover} on foes all around you for {${q.TooltipSuperDuration} Sec.}
{Bullet}Damage: [${q.DisplayDelta1}] (every ${q.TooltipPoisonRate} Sec.)
{Bullet}Max Gauge Bonus: [${q.TooltipDuration} Sec. Duration]`,
		...rarity_10,
		Effects: [{
			BaseValue: 15,
			ChangeType: "Add",
			AsInt,
			MinMultiplier: 0.25,
			...pom.DuplicateMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipDamage",
			},
			// Range: 600,
		}, {
			// Description: `Max Gauge Bonus: [9 Sec. Duration]`,
			SuperDuration: 1.5,
			MaxDurationMultiplier: 6,
			ExtractValue: [{
				Key: "SuperDuration",
				ExtractAs: "TooltipSuperDuration",
			}, {
				Key: "MaxDurationMultiplier",
				ExtractAs: "TooltipDuration",
				Format: "EXWrathDuration",
				DecimalPlaces: 2,
				SkipAutoExtract: true,
			}],
		}, {
			ExtractValue: {
				ExtractAs: "TooltipPoisonRate",
				SkipAutoExtract: true,
				External: true,
				BaseType: "Effect",
				WeaponName: "SwordWeapon",
				BaseName: "DamageOverTime",
				BaseProperty: "Cooldown",
				DecimalPlaces: 1,
			},
		}],
		Inflicts: {
			Hangover: {},
		},
	},
	DoorHealTrait: {
		DisplayName: `After Party`,
		Description: q => `If your {Health_Small} is low after {Encounters}, restore to the threshold.
{Bullet}Life Threshold: [${q.NewTotal[1]}%] {Health_Small}
{Bullet}Condition Applied: &[Lasting Consequences]`,
		// Notes: [
		// 	`Heroic Rarity only obtainable with {Ambrosia Delight} or {Rare Crop}.`,
		// ],
		...make_RarityLevels(1.0, 1.34, 1.67, 2.0),
		Effects: [{
			BaseValue: 0.3,
			// ReducedByMetaupgradeValue: "HealingReductionShrineUpgrade",
			IdenticalMultiplier: {
				DiminishingReturnsMultiplier: 0.4,
				Value: DuplicateMultiplier,
			},
			ExtractValue: {
				ExtractAs: "TooltipHeal",
				Format: "Percent",
			},
		}],
		Forbid: ["DoorHealTrait"],
	},
	LowHealthDefenseTrait: {
		DisplayName: `Positive Outlook`,
		Description: q => `You take less damage while at {${q.TooltipThreshold}%} {Health_Small} or below.
{Bullet}Damage Resistance: [${q.DisplayDelta1}]`,
		...rarity_50,
		Effects: [{
			BaseValue: 0.9,
			MinMultiplier: 0.2,
			SourceIsMultiplier,
			IdenticalMultiplier: {
				Value: -0.5,
			},
			ExtractValue: {
				ExtractAs: "TooltipBonus",
				Format: "NegativePercentDelta",
			},
		}, {
			ChangeValue: 0.4,
			ExtractValue: {
				ExtractAs: "TooltipThreshold",
				Format: "Percent",
				SkipAutoExtract: true,
			},
		}],
	},
	GiftHealthTrait: { // DionysusGiftDrop
		DisplayName: `Premium Vintage`,
		Description: q => `Gain {HealthUp_Small} when you pick up {Gift_Small}. Receive {1} {Gift_Small} now.
{Bullet}Nectar Life Gain: [+${q.NewTotal1}] {HealthUp_Small}`,
		...rarity_25,
		Effects: [{
			BaseValue: 20,
			AsInt,
			MinMultiplier: 0.05,
			...pom.DuplicateMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipHealthConversion",
			},
		}],
		Forbid: ["GiftHealthTrait"],
	},
	FountainDamageBonusTrait: {
		DisplayName: `Strong Drink`,
		Description: q => `Using a {Fountain} restores {${q.TooltipHeal}%} {Health_Small} and gives you bonus damage.
{Bullet}Bonus Damage per Fountain: [${q.DisplayDelta1}]
{Bullet}Condition Applied: &[Lasting Consequences]`,
		...make_RarityLevels(1.0, 1.34, 1.67, 2.0),
		Effects: [{
			BaseValue: 1.03,
			SourceIsMultiplier,
			DecimalPlaces: 2,
			MinMultiplier: 0.1,
			IdenticalMultiplier: {
				Value: -0.8
			},
			ExtractValue: {
				ExtractAs: "TooltipFountainBonus",
				Format: "PercentDelta",
				DecimalPlaces: 1,
			},
		}, {
			ChangeValue: 1,
			ExtractValue: {
				ExtractAs: "TooltipHeal",
				Format: "PercentHeal",
			},
		}],
		Forbid: ["FountainDamageBonusTrait"],
	},
	DionysusPoisonPowerTrait: {
		DisplayName: `Bad Influence`,
		Description: q => `Deal more damage while {${q.TooltipRequiredPoisonedEnemies}} or more foes are {Hangover}-afflicted.
{Bullet}Bonus Damage: [${q.DisplayDelta1}]`,
		...rarity_tier1,
		Effects: [{
			BaseValue: 1.50,
			SourceIsMultiplier,
			...pom.DuplicateMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipBonus",
				Format: "PercentDelta",
			},
		}, {
			ChangeValue: 3,
			ChangeType: "Absolute",
			ExtractValue: {
				ExtractAs: "TooltipRequiredPoisonedEnemies",
				SkipAutoExtract: true,
			},
		}],
		Required: [{
			OneOf: [
				'DionysusWeaponTrait',
				'DionysusSecondaryTrait',
				'DionysusRushTrait',
				'DionysusShoutTrait',
			],
		}],
	},
	DionysusSlowTrait: {
		DisplayName: `Numbing Sensation`,
		Description: q => `Your {Hangover} effects also make foes move slower.
{Bullet}Move Speed Reduction: [${q.DisplayDelta1}]
{Bullet}Slow Duration: [${q.SlowDuration} Sec.]`,
		...make_RarityLevels(1.0, [1.3, 1.5], [2.0, 2.2], 2.5),
		Effects: [{
			BaseValue: 0.85,
			ChangeType: "Multiply",
			MinMultiplier: 0.2,
			SourceIsMultiplier,
			...pom.DuplicateMultiplier,
			ExtractValue: {
				ExtractAs: "InitialSlow",
				Format: "NegativePercentDelta",
			},
		}, {
			ChangeValue: 4,
			ChangeType: "Absolute",
			ExtractValue: {
				ExtractAs: "SlowDuration",
			},
		}],
		Required: [{
			OneOf: [
				'DionysusWeaponTrait',
				'DionysusSecondaryTrait',
				'DionysusRushTrait',
				'DionysusShoutTrait',
			],
		}],
	},
	// TODO still need testing
	DionysusSpreadTrait: {
		// It's very hard to actually verify, given how much shit this boon sucks
		// ??? Hangover Damage: [+4] or [4] ???
		DisplayName: `Peer Pressure`,
		Description: q => `{Hangover}-afflicted foes inflict it on other foes near them every {${q.TooltipSpreadRate} Sec.}
{Bullet}Hangover Damage: [${q.TooltipDamage}] (every ${q.TooltipPoisonRate} Sec.)
{Bullet}Range: [${q.TooltipRange}]
{Bullet}*${dname('DionysusShoutTrait')}* is not affected.`,
		// Probably true, but need testing
		// Notes: [
		// 	`It seems this shitty trait only inflicts it on {1} other foe every {4 Sec.}`,
		// ],
		...rarity_tier1,
		// Projectile.DionysusPlagueWeapon
		Effects: [{
			BaseValue: 4,
			ChangeType: "Add",
			AsInt,
			MinMultiplier: 0.25,
			...pom.DuplicateMultiplier,
			ExtractValue: [{
				ExtractAs: "TooltipDamage",
			}, {
				ExtractAs: "TooltipRange",
				External: true,
				TraitName: "DionysusSpreadTrait",
				BaseType: "ProjectileBase",
				BaseName: "DionysusPlagueWeapon",
				BaseProperty: "Range",
			}],
		}, {
			ChangeValue: 4,
			ExtractValue: {
				ExtractAs: "TooltipSpreadRate",
			},
		}, {
			ExtractValue: {
				ExtractAs: "TooltipPoisonRate",
				SkipAutoExtract: true,
				External: true,
				BaseType: "Effect",
				WeaponName: "SwordWeapon",
				BaseName: "DamageOverTime",
				BaseProperty: "Cooldown",
				DecimalPlaces: 1,
			},
		}],
		Required: [{
			OneOf: [
				'DionysusWeaponTrait',
				'DionysusSecondaryTrait',
				'DionysusRushTrait',
			],
		}],
	},
	DionysusDefenseTrait: {
		DisplayName: `High Tolerance`,
		Description: q => `You take less damage while standing in {Festive Fog}.
{Bullet}Damage Resistance: [${q.DisplayDelta1}]`,
		...rarity_tier2,
		Effects: [{
			BaseMin: 0.85,
			BaseMax: 0.90,
			ChangeType: "Multiply",
			SourceIsMultiplier,
			...pom.DuplicateMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipDamageReduction",
				Format: "NegativePercentDelta",
			},
		}],
		Required: [{
			OneOf: [
				'DionysusRangedTrait',
				// actually VISUAL
				'ShieldLoadAmmo_DionysusRangedTrait',
			],
		}],
	},
	DionysusComboVulnerability: {
		DisplayName: `Black Out`,
		Description: q => `{Hangover}-afflicted foes take bonus damage in {Festive Fog}.
{Bullet}Fog Combo Damage: [${q.DisplayDelta1}]`,
		...rarity_tier3,
		Effects: [{
			BaseValue: 1.6,
			SourceIsMultiplier,
			...pom.DuplicateMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipBonus",
				Format: "PercentDelta",
			},
		}],
		Forbid: ["DionysusComboVulnerability"],
		Required: [{
			OneOf: [
				'DionysusWeaponTrait',
				'DionysusSecondaryTrait',
				'DionysusRushTrait',
				'DionysusShoutTrait',
			],
		}, {
			OneOf: [
				'DionysusRangedTrait',
				// actually VISUAL
				'ShieldLoadAmmo_DionysusRangedTrait',
			],
		}],
	},
	// Demeter
	DemeterWeaponTrait: {
		DisplayName: `Frost Strike`,
		Description: q => `Your {Attack} is stronger and inflicts {Chill}.
{Bullet}Attack Damage: [${q.DisplayDelta1}]`,
		...rarity_tier1,
		Effects: [{
			BaseValue: 1.4,
			SourceIsMultiplier,
			...pom.DuplicateMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipDamage",
				Format: "PercentDelta",
			},
		}],
		Inflicts: {
			Chill: {},
		},
	},
	DemeterSecondaryTrait: {
		DisplayName: `Frost Flourish`,
		Description: q => `Your {Special} is stronger and inflicts {Chill}.
{Bullet}Special Damage: [${q.DisplayDelta1}]`,
		...rarity_tier1,
		Effects: [{
			BaseValue: 1.6,
			SourceIsMultiplier,
			...pom.DuplicateMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipDamage",
				Format: "PercentDelta",
			},
		}],
		Inflicts: {
			Chill: {},
		},
	},
	DemeterRangedTrait: {
		DisplayName: `Crystal Beam`,
		Description: q => `Your {Cast} drops a crystal that fires a beam at foes for {${q.TooltipDuration} Sec.}
{Bullet}Cast Damage: [${q.DisplayDelta1}] (every ${q.TooltipInterval} sec)`,
		...make_RarityLevels(1.0, 1.15, 1.30, 1.45),
		Effects: [{
			BaseValue: 8,
			AsInt,
			MinMultiplier: 0.1,
			IdenticalMultiplier: {
				Value: -0.8,
			},
			ExtractValue: {
				ExtractAs: "TooltipDamage",
			},
		}, {
			ChangeValue: 0.2,
			ExtractValue: {
				SkipAutoExtract: true,
				ExtractAs: "TooltipInterval",
				DecimalPlaces: 1,
			},
		}, {
			ChangeValue: 5,
			ExtractValue: {
				ExtractAs: "TooltipDuration",
			},
		}],
		Forbid: ['ShieldLoadAmmoTrait'],
	},
	ShieldLoadAmmo_DemeterRangedTrait: {
		DisplayName: `Icy Flare`,
		Description: q => `Your {Cast} damages foes around you and inflicts {Chill}.
{Bullet}Blast Damage: [${q.DisplayDelta1}]`,
		...make_RarityLevels(1.0, 1.140, 1.285, 1.430),
		Effects: [{
			BaseValue: 70,
			MinMultiplier: 0.1,
			IdenticalMultiplier: {
				Value: -0.8,
			},
			ExtractValue: {
				ExtractAs: "TooltipDamage",
			},
		}],
		Inflicts: {
			Chill: {},
		},
		Required: ['ShieldLoadAmmoTrait'],
	},
	DemeterRushTrait: {
		DisplayName: `Mistral Dash`,
		Description: q => `Your {Dash} shoots a gust ahead that inflicts {Chill}.
{Bullet}Gust Damage: [${q.DisplayDelta1}]
{Bullet}Damage Radius: [${q.TooltipDamageRadius}]
{Bullet}Range: [${q.TooltipRange}]`,
		Notes: [
			`Gust travels in the same direction you are facing.`,
		],
		...rarity_50,
		// Projectile.DemeterRushProjectile
		Effects: [{
			BaseValue: 15,
			AsInt,
			MinMultiplier: 0.2,
			...pom.DuplicateStrongMultiplier,
			ExtractValue: [{
				ExtractAs: "TooltipDamage"
			}, {
				ExtractAs: "TooltipDamageRadius",
				External: true,
				TraitName: "DemeterRushTrait",
				BaseType: "ProjectileBase",
				BaseName: "DemeterRushProjectile",
				BaseProperty: "DamageRadius",
			}, {
				ExtractAs: "TooltipRange",
				External: true,
				TraitName: "DemeterRushTrait",
				BaseType: "ProjectileBase",
				BaseName: "DemeterRushProjectile",
				BaseProperty: "Range",
			}],
		}],
		Inflicts: {
			Chill: {},
		},
	},
	DemeterShoutTrait: {
		DisplayName: `Demeter's Aid`,
		Description: q => `Your {Call} creates a winter vortex that grows over {${q.TooltipSuperDuration} Sec.}, inflicting {Chill}.
{Bullet}Vortex Damage: [${q.DisplayDelta1}] (every ${q.TooltipInterval} Sec.)
{Bullet}Max Gauge Bonus: [${q.TooltipDuration} Sec. Duration]`,
		...rarity_10,
		Effects: [{
			BaseValue: 10,
			MinMultiplier: 0.2,
			...pom.DuplicateMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipDamage",
			},
		}, {
			ChangeValue: 0.25,
			ExtractValue: {
				ExtractAs: "TooltipInterval",
				SkipAutoExtract: true,
				DecimalPlaces: 2,
			},
		}, {
			MaxDurationMultiplier: 2,
			SuperDuration: 5,
			IsBurst: true,
			ExtractValue: [{
				Key: "SuperDuration",
				ExtractAs: "TooltipSuperDuration",
				SkipAutoExtract: true,
			}, {
				Key: "MaxDurationMultiplier",
				ExtractAs: "TooltipDuration",
				Format: "EXWrathDuration",
				DecimalPlaces: 2,
				SkipAutoExtract: true,
			}],
		}],
		Inflicts: {
			Chill: {},
		},
	},
	DemeterRetaliateTrait: {
		DisplayName: `Frozen Touch`,
		Description: q => `After you take damage, damage and *completely* {Chill} your foe.
{Bullet}Revenge Damage: [${q.DisplayDelta1}]`,
		...rarity_50,
		Effects: [{
			BaseValue: 10,
			...pom.DuplicateVeryStrongMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipDamage",
			},
		}],
		Inflicts: {
			Chill: {},
		},
	},
	HarvestBoonTrait: {
		DisplayName: `Rare Crop`,
		Description: q => `Your {Boons} become {Common}, then gain {Rarity} every {${q.TooltipRoomInterval}} {Encounter\\(s)}.
{Bullet}Random Boons Affected: [${q.TooltipTraitNum}]`,
		// Notes: [
		// 	`This boon cannot be purged or exchange or upgraded via Ambrosia Delight from Eurydice or via poms.`,
		// 	`Once taken, shows which Boons are being cultivated as part of the Boon Description.`,
		// ],
		...make_RarityLevels(1, 2, 3),
		Effects: [{
			BaseValue: 1,
			ExtractValue: {
				ExtractAs: "TooltipTraitNum",
			},
		}, {
			ChangeValue: 3,
			ExtractValue: {
				ExtractAs: "TooltipRoomInterval",
			},
		}],
		Forbid: ["HarvestBoonTrait"],
	},
	ZeroAmmoBonusTrait: {
		DisplayName: `Ravenous Will`,
		Description: q => `When you have no {Ammo}, take {${q.TooltipDefense}%} less damage and deal more.
{Bullet}Damage Bonus: [${q.DisplayDelta1}]`,
		...make_RarityLevels(1, 2, 3, 4),
		Effects: [{
			BaseValue: 1.1,
			SourceIsMultiplier,
			...pom.DuplicateMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipAttack",
				Format: "PercentDelta",
			},
		}, {
			ChangeValue: 0.9,
			ExtractValue: {
				ExtractAs: "TooltipDefense",
				Format: "NegativePercentDelta",
				SkipAutoExtract: true,
			},
		}],
		Forbid: ["ZeroAmmoBonusTrait"],
	},
	HealingPotencyTrait: {
		DisplayName: `Nourished Soul`,
		Description: q => `Any {HealthRestore_Small} effects are more potent. Restore [${q.TooltipHealing}%] {Health_Small} now.
{Bullet}Bonus Restoration: [${q.NewTotal1}]
{Bullet}Condition Applied: &[Lasting Consequences]`,
		...make_RarityLevels(1.0, 1.075, 1.150, 1.225),
		Effects: [{
			BaseValue: 1.3,
			SourceIsMultiplier,
			...pom.DuplicateMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipHealing",
				Format: "PercentDelta",
			}
		}],
		// From ConsumableData.lua: HealingPotencyDrop
		Forbid: ["HealingPotencyTrait"],
	},
	CastNovaTrait: {
		DisplayName: `Snow Burst`,
		Description: q => `Whenever you {Cast}, damage foes around you and inflict {Chill}.
{Bullet}Area Damage: [${q.DisplayDelta1}]
{Bullet}Damage Radius: [${q.TooltipDamageRadius}]`,
		...rarity_25,
		Effects: [{
			BaseValue: 40,
			AsInt,
			...pom.DuplicateMultiplier,
			ExtractValue: [{
				ExtractAs: "TooltipDamage",
			}, {
				ExtractAs: "TooltipDamageRadius",
				External: true,
				TraitName: "CastNovaTrait",
				BaseType: "ProjectileBase",
				BaseName: "DemeterAmmoWind",
				BaseProperty: "DamageRadius",
			}],
		}],
		Inflicts: {
			Chill: {},
		},
	},
	MaximumChillBlast: {
		DisplayName: `Arctic Blast`,
		Description: q => `Applying {${q.TooltipChillStacks}} stacks of {Chill} causes a blast, clearing the effect.
{Bullet}Blast Area Damage: [${q.DisplayDelta1}]
{Bullet}Damage Radius: [${q.TooltipDamageRadius}]`,
		...make_RarityLevels(1.0, 1.125, 1.250, 1.375),
		// Projectile.DemeterMaxChill
		Effects: [{
			BaseValue: 80,
			AsInt,
			...pom.DuplicateMultiplier,
			ExtractValue: [{
				ExtractAs: "TooltipDamage",
			}, {
				ExtractAs: "TooltipDamageRadius",
				External: true,
				TraitName: "MaximumChillBlast",
				BaseType: "ProjectileBase",
				BaseName: "DemeterMaxChill",
				BaseProperty: "DamageRadius",
			}],
		}, {
			ChangeValue: 10,
			ExtractValue: {
				ExtractAs: "TooltipChillStacks",
				SkipAutoExtract: true,
			},
		}],
		Forbid: ["MaximumChillBlast"],
		Required: [{
			OneOf: [
				'DemeterWeaponTrait',
				'DemeterSecondaryTrait',
				"ShieldLoadAmmo_DemeterRangedTrait",
				'DemeterRushTrait',
				'DemeterShoutTrait',
				'CastNovaTrait',
			],
		}],
	},
	MaximumChillBonusSlow: {
		DisplayName: `Killing Freeze`,
		Description: q => `When *all* foes are {Chill}-afflicted, they are [${q.DisplayDelta1}] Slower and Decay.
{Bullet}Decay Damage: [${q.DisplayDelta2}] (every ${q.TooltipTickRate} Sec.)`,
		...rarity_25,
		Effects: [{
			BaseValue: 0.9,
			ChangeType: "Multiply",
			SourceIsMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipSlow",
				Format: "NegativePercentDelta",
			},
		}, {
			BaseValue: 20,
			ChangeType: "Add",
			ExtractValue: {
				ExtractAs: "TooltipDamage",
			},
		}, {
			ChangeValue: 0.5,
			ChangeType: "Absolute",
			ExtractValue: {
				ExtractAs: "TooltipTickRate",
				DecimalPlaces: 1,
			},
		}],
		Forbid: ["MaximumChillBonusSlow"],
		Required: [{
			OneOf: [
				'DemeterWeaponTrait',
				'DemeterSecondaryTrait',
				"ShieldLoadAmmo_DemeterRangedTrait",
				'DemeterRushTrait',
				'DemeterShoutTrait',
				'CastNovaTrait',
			],
		}],
	},
	DemeterRangedBonusTrait: {
		DisplayName: `Glacial Glare`,
		Description: q => `Your {Cast} fires longer and inflicts {Chill}.
{Bullet}Bonus Duration: [${q.DisplayDelta1} Sec.]`,
		...rarity_20,
		Effects: [{
			BaseValue: 2,
			ChangeType: "Add",
			MinMultiplier: 0.5,
			IdenticalMultiplier: {
				Value: -0.5,
			},
			ExtractValue: {
				ExtractAs: "TooltipDuration",
				DecimalPlaces: 2,
			},
		}],
		Inflicts: {
			Chill: {},
		},
		// Forbid: ['ShieldLoadAmmoTrait'],
		Required: [{
			OneOf: [
				'DemeterRangedTrait',
			],
		}],
	},
	InstantChillKill: {
		DisplayName: `Winter Harvest`,
		Description: q => `{Chill}-affected foes shatter at {${q.TooltipDeathThreshold}%} {Health_Small}, inflicting {Chill} nearby.
{Bullet}Shatter Area Damage: [${q.TooltipDamage}]
{Bullet}Damage Radius: [${q.TooltipDamageRadius}]`,
		...rarity_tier3,
		Effects: [{
			BaseValue: 50,
			AsInt,
			...pom.DuplicateMultiplier,
			ExtractValue: [{
				ExtractAs: "TooltipDamage",
			}, {
				ExtractAs: "TooltipDamageRadius",
				External: true,
				TraitName: "InstantChillKill",
				BaseType: "ProjectileBase",
				BaseName: "DemeterChillKill",
				BaseProperty: "DamageRadius",
			}],
		}, {
			ChangeValue: 0.10,
			ExtractValue: {
				ExtractAs: "TooltipDeathThreshold",
				Format: "Percent",
			},
		}],
		Inflicts: {
			Chill: {},
		},
		Forbid: ["InstantChillKill"],
		Required: [{
			Description: 'Two of the Following:',
			List: [
				'ZeroAmmoBonusTrait',
				'MaximumChillBlast',
				'MaximumChillBonusSlow',
			],
		}],
	},
	// Chaos (Pom: false, because LootData.TrialUpgrade.GotLoot=false, because of GetAllUpgradeableGodTraits)
	ChaosBlessingMoneyTrait: {
		DisplayName: `Affluence`,
		Description: q => `Any {Currency_Small} you find is worth [${q.NewTotal1}].`,
		Pom: false,
		...rarity_chaos,
		Effects: [{
			BaseMin: 1.3,
			BaseMax: 1.5,
			ToNearest: 0.05,
			SourceIsMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipMoneyRewardIncrease",
				Format: "PercentDelta",
			},
		}],
	},
	ChaosBlessingBackstabTrait: {
		DisplayName: `Ambush`,
		Description: q => `You deal [${percent(q.TooltipDamageBonus)}] damage striking foes from behind.`,
		Pom: false,
		...rarity_chaos,
		Effects: [{
			BaseMin: 1.6,
			BaseMax: 1.8,
			SourceIsMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipDamageBonus",
				Format: "PercentDelta",
			},
		}],
		Required: ['BackstabMetaUpgrade'],
	},
	ChaosBlessingAlphaStrikeTrait: {
		DisplayName: `Assault`,
		Description: q => `You deal [${percent(q.TooltipDamageBonus)}] damage striking undamaged foes.`,
		Pom: false,
		...rarity_chaos,
		Effects: [{
			BaseMin: 1.3,
			BaseMax: 1.5,
			SourceIsMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipDamageBonus",
				Format: "PercentDelta",
			},
		}],
		Required: ['FirstStrikeMetaUpgrade'],
	},
	ChaosBlessingMetapointTrait: {
		DisplayName: `Eclipse`,
		Description: q => `Any {Darkness_Small} and {Gems_Small} you find are worth [${q.NewTotal1}].`,
		Pom: false,
		...rarity_chaos,
		Effects: [{
			BaseMin: 1.50,
			BaseMax: 1.80,
			SourceIsMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipMetaPointRewardIncrease",
				Format: "PercentDelta",
			},
		}],
	},
	ChaosBlessingBoonRarityTrait: {
		DisplayName: `Favor`,
		Description: q => `Boons have [${q.NewTotal1}] chance to be {Rare} or better.
{Bullet}{Epic} [+10%]; {Legendary} [+10%]`,
		Pom: false,
		...rarity_chaos,
		Effects: [{
			// RareBonus: {
			BaseMin: 0.11,
			BaseMax: 0.20,
			// },
			// EpicBonus: 0.1,
			// LegendaryBonus: 0.1,
			ExtractValue: {
				// Key: "RareBonus",
				ExtractAs: "TooltipBonusChance",
				Format: "Percent",
			},
		}],
	},
	ChaosBlessingSecondaryTrait: {
		DisplayName: `Flourish`,
		Description: q => `Your {Special} deals [${percent(q.TooltipDamageBonus)}] damage.`,
		Pom: false,
		...rarity_chaos,
		Effects: [{
			BaseMin: 1.3,
			BaseMax: 1.6,
			SourceIsMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipDamageBonus",
				Format: "PercentDelta",
			},
		}],
	},
	ChaosBlessingAmmoTrait: {
		DisplayName: `Grasp`,
		Description: q => `You have [+${q.NewTotal1}] {Ammo}.`,
		Pom: false,
		...make_RarityLevels(1, 1, 1),
		Effects: [{
			BaseValue: 1,
			AsInt,
			ChangeType: "Add",
			ExtractValue: {
				ExtractAs: "TooltipCapacity",
			},
		}],
	},
	ChaosBlessingDashAttackTrait: {
		DisplayName: `Lunge`,
		Description: q => `Your {Dash-Strike} deals [${percent(q.TooltipDamageBonus)}] damage.`,
		Pom: false,
		...rarity_chaos,
		Effects: [{
			BaseMin: 1.4,
			BaseMax: 1.6,
			SourceIsMultiplier,
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipDamageBonus",
				Format: "PercentDelta",
			},
		}],
		Forbid: ["GunLoadedGrenadeTrait"],
	},
	ChaosBlessingRangedTrait: {
		DisplayName: `Shot`,
		Description: q => `Your {Cast} deals [${percent(q.TooltipDamageBonus)}] damage.`,
		Pom: false,
		...rarity_chaos,
		Effects: [{
			BaseMin: 1.3,
			BaseMax: 1.4,
			SourceIsMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipDamageBonus",
				Format: "PercentDelta",
			},
		}],
	},
	ChaosBlessingMaxHealthTrait: {
		DisplayName: `Soul`,
		Description: q => `You have [+${q.NewTotal1}] {HealthUp_Small}.`,
		Pom: false,
		...rarity_chaos,
		Effects: [{
			BaseMin: 30,
			BaseMax: 40,
			AsInt,
			ChangeType: "Add",
			ExtractValue: {
				ExtractAs: "TooltipHealth",
			},
		}],
	},
	ChaosBlessingMeleeTrait: {
		DisplayName: `Strike`,
		Description: q => `Your {Attack} deals [${percent(q.TooltipDamageBonus)}] damage.`,
		Pom: false,
		...rarity_chaos,
		Effects: [{
			BaseMin: 1.3,
			BaseMax: 1.4,
			SourceIsMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipDamageBonus",
				Format: "PercentDelta",
			},
		}],
	},
	ChaosBlessingExtraChanceTrait: {
		DisplayName: `Defiance`,
		Description: q => `You have [+1] use of {Death Defiance} (this escape attempt).`,
		Pom: false,
		...rarity_tier3,
		Effects: [],
		Required: [{
			// Description: 'Requires 1 of any other Chaos boon',
			OneOf: [
				'ChaosBlessingMoneyTrait',
				'ChaosBlessingBackstabTrait',
				'ChaosBlessingAlphaStrikeTrait',
				'ChaosBlessingMetapointTrait',
				'ChaosBlessingBoonRarityTrait',
				'ChaosBlessingSecondaryTrait',
				'ChaosBlessingAmmoTrait',
				'ChaosBlessingDashAttackTrait',
				'ChaosBlessingRangedTrait',
				'ChaosBlessingMaxHealthTrait',
				'ChaosBlessingMeleeTrait',
			],
		}],
	},
	// Athena
	AthenaWeaponTrait: {
		DisplayName: `Divine Strike`,
		Description: q => `Your {Attack} is stronger, and can {Deflect}.
{Bullet}Attack Damage: [${q.DisplayDelta1}]`,
		...rarity_tier1,
		Effects: [{
			BaseValue: 1.40,
			SourceIsMultiplier,
			...pom.DuplicateMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipDamage",
				Format: "PercentDelta",
			},
		}],
	},
	AthenaSecondaryTrait: {
		DisplayName: `Divine Flourish`,
		Description: q => `Your {Special} is stronger, and can {Deflect}.
{Bullet}Special Damage: [${q.DisplayDelta1}]`,
		...rarity_tier1,
		Effects: [{
			BaseValue: 1.6,
			SourceIsMultiplier,
			...pom.DuplicateMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipDamage",
				Format: "PercentDelta",
			},
		}],
	},
	AthenaRangedTrait: {
		DisplayName: `Phalanx Shot`,
		Description: q => `Your {Cast} damages foes in a small area, and can {Deflect}.
{Bullet}Cast Damage: [${q.DisplayDelta1}]
{Bullet}Damage Radius: [${q.TooltipDamageRadius}]`,
		...rarity_20,
		// Projectile.AthenaDeflectingProjectile
		Effects: [{
			BaseValue: 85,
			...pom.DuplicateStrongMultiplier,
			ExtractValue: [{
				ExtractAs: "TooltipDamage",
			}, {
				ExtractAs: "TooltipDamageRadius",
				External: true,
				TraitName: "AthenaRangedTrait",
				BaseType: "ProjectileBase",
				BaseName: "AthenaDeflectingProjectile",
				BaseProperty: "DamageRadius",
			}],
		}],
		Forbid: ['ShieldLoadAmmoTrait'],
	},
	ShieldLoadAmmo_AthenaRangedTrait: {
		DisplayName: `Phalanx Flare`,
		Description: q => `Your {Cast} damages foes around you, and can {Deflect}.
{Bullet}Blast Damage: [${q.DisplayDelta1}]
{Bullet}Damage Radius: [${q.TooltipDamageRadius}]`,
		...make_RarityLevels(1.000, 1.125, 1.250, 1.375),
		// Projectile.AthenaDeflectingBeowulfProjectile
		Effects: [{
			BaseValue: 80,
			...pom.DuplicateStrongMultiplier,
			ExtractValue: [{
				ExtractAs: "TooltipDamage",
			}, {
				ExtractAs: "TooltipDamageRadius",
				External: true,
				TraitName: "ShieldLoadAmmo_AthenaRangedTrait",
				BaseType: "ProjectileBase",
				BaseName: "AthenaDeflectingBeowulfProjectile",
				BaseProperty: "DamageRadius",
			}],
		}],
		Required: ['ShieldLoadAmmoTrait'],
	},
	AthenaRushTrait: {
		DisplayName: `Divine Dash`,
		Description: q => `Your {Dash} deals damage and can {Deflect}.
{Bullet}Dash Damage: [${q.DisplayDelta1}]
{Bullet}Damage Radius: [${q.TooltipDamageRadius}]`,
		...rarity_20,
		// Projectile.AthenaRushProjectile
		Effects: [{
			BaseValue: 10,
			AsInt,
			MinMultiplier: 0.2,
			...pom.DuplicateStrongMultiplier,
			ExtractValue: [{
				ExtractAs: "TooltipDamage",
			}, {
				ExtractAs: "TooltipDamageRadius",
				External: true,
				TraitName: "AthenaRushTrait",
				BaseType: "ProjectileBase",
				BaseName: "AthenaRushProjectile",
				BaseProperty: "DamageRadius",
			}],
		}],
	},
	AthenaShoutTrait: {
		DisplayName: `Athena's Aid`,
		Description: q => `Your {Call} briefly makes you {Impervious} and {Deflect} all attacks.
{Bullet}Effect Duration: [${q.DisplayDelta1} Sec.]
{Bullet}Max Gauge Bonus: [${q.TooltipMaxDurationMultiplier}x Duration]`,
		...rarity_10,
		Effects: [{
			BaseValue: 1.5, // SuperDuration
			MinMultiplier: 0.065,
			IdenticalMultiplier: {
				Value: -0.835,
			},
			ExtractValue: {
				ExtractAs: "TooltipDuration",
				DecimalPlaces: 2,
			},
		}, {
			// Description: `Max Gauge Bonus: [x6 Duration]`,
			ChangeValue: 6, // MaxDurationMultiplier
			ExtractValue: {
				ExtractAs: "TooltipMaxDurationMultiplier",
				DecimalPlaces: 2,
				SkipAutoExtract: true,
			},
		}],
	},
	AthenaRetaliateTrait: {
		DisplayName: `Holy Shield`,
		Description: q => `After you take damage, damage foes around you and briefly {Deflect}.
{Bullet}Revenge Damage: [${q.DisplayDelta1}]`,
		...rarity_tier1,
		Effects: [{
			BaseValue: 30,
			...pom.DuplicateVeryStrongMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipDamage",
			},
			// Range: 225,
		}],
	},
	EnemyDamageTrait: {
		DisplayName: `Bronze Skin`,
		Description: q => `Resist damage from foes' attacks.
{Bullet}Reduced Damage From Foes: [${q.DisplayDelta1}]`,
		...rarity_50,
		Effects: [{
			BaseValue: 0.95,
			SourceIsMultiplier,
			MinMultiplier: 0.5,
			IdenticalMultiplier: {
				Value: -0.5,
			},
			ExtractValue: {
				ExtractAs: "TooltipDamageReduction",
				Format: "NegativePercentDelta",
				DecimalPlaces: 1,
			},
		}],
	},
	TrapDamageTrait: {
		DisplayName: `Sure Footing`,
		Description: q => `Resist damage from {Traps}.
{Bullet}Reduced Damage From Traps: [${q.NewTotal1}]`,
		Notes: [
			`Allows the player to walk in<br/>Asphodel's magma without taking<br/>damage for a short amount of time.`,
			`Does not protect against<br/>puddles of magma created by fireballs.`,
		],
		...make_RarityLevels(1.0, 1.25, 1.5, 1.585),
		Effects: [{
			BaseValue: 0.40,
			SourceIsMultiplier,
			...pom.DuplicateMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipDamageReduction",
				Format: "NegativePercentDelta",
			},
		}],
		Forbid: ["TrapDamageTrait"],
	},
	PreloadSuperGenerationTrait: {
		DisplayName: `Proud Bearing`,
		Description: q => `You begin each {Encounter} with your {God Gauge} partly full.
{Bullet}Starting Gauge: [${q.NewTotal1}%]`,
		...make_RarityLevels(1.0, 1.25, 1.50, 2.0),
		Effects: [{
			BaseValue: 20,
			IdenticalMultiplier: {
				Value: -0.5,
			},
			ExtractValue: {
				ExtractAs: "TooltipCriticalSuperGain",
			},
		}],
		Required: [{
			OneOf: [
				// RequiredSlottedTrait = "Shout",
				'AphroditeShoutTrait',
				'AresShoutTrait',
				'ArtemisShoutTrait',
				'AthenaShoutTrait',
				'DemeterShoutTrait',
				'DionysusShoutTrait',
				'PoseidonShoutTrait',
				'ZeusShoutTrait',
				'HadesShoutTrait',
			],
		}],
	},
	AthenaBackstabDebuffTrait: {
		DisplayName: `Blinding Flash`,
		Description: q => `Your abilities that can {Deflect} also make foes {Exposed}.
{Bullet}Bonus Backstab Damage: [${q.DisplayDelta1}]`,
		...rarity_25,
		Effects: [{
			BaseValue: 0.5,
			ChangeType: "Add",
			...pom.DuplicateMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipDamage",
				Format: "Percent",
			},
		}],
		Inflicts: {
			Exposed: {},
		},
		Required: [{
			OneOf: [
				'AthenaWeaponTrait',
				'AthenaSecondaryTrait',
				'AthenaRangedTrait',
				"ShieldLoadAmmo_AthenaRangedTrait",
				'AthenaRushTrait',
			],
		}],
	},
	AthenaShieldTrait: {
		DisplayName: `Brilliant Riposte`,
		Description: q => `When you {Deflect} attacks, it deals more damage.
{Bullet}Deflect Damage: [${q.DisplayDelta1}]`,
		...rarity_tier2,
		Effects: [{
			BaseValue: 1.8,
			SourceIsMultiplier,
			...pom.DuplicateMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipDamageIncrease",
				Format: "PercentDelta",
			},
		}],
		Required: [{
			OneOf: [
				'AthenaWeaponTrait',
				'AthenaSecondaryTrait',
				'AthenaRushTrait',
				'AthenaRetaliateTrait',
			],
		}],
	},
	LastStandDurationTrait: {
		DisplayName: `Deathless Stand`,
		Description: q => `{Death Defiance} makes you {Impervious} longer. Replenish {1} use.
{Bullet}Effect Duration: [${q.NewTotal1} Sec.]`,
		...rarity_25,
		Effects: [{
			BaseValue: 2,
			ChangeType: "Add",
			...pom.DuplicateMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipDuration",
			},
		}],
	},
	LastStandHealTrait: {
		DisplayName: `Last Stand`,
		Description: q => `{Death Defiance} restores more {Health_Small} than usual. Replenish {1} use.
{Bullet}Bonus Restoration: [${q.NewTotal1}]`,
		...rarity_20,
		Effects: [{
			BaseValue: 0.10,
			ExtractValue: {
				ExtractAs: "TooltipHeal",
				Format: "Percent",
			},
		}],
	},
	ShieldHitTrait: {
		DisplayName: `Divine Protection`,
		Description: q => `You have a barrier that negates an instance of damage.
{Bullet}Barrier Refresh Time: [${q.NewTotal1} Sec.]`,
		...rarity_tier3,
		Effects: [{
			ChangeValue: 20,
			ExtractValue: {
				ExtractAs: "TooltipCooldown",
			},
		}],
		Forbid: ["ShieldHitTrait"],
		Required: [{
			OneOf: [
				'AthenaShieldTrait',
			],
		}],
	},
	// Artemis
	ArtemisWeaponTrait: {
		DisplayName: `Deadly Strike`,
		Description: q => `Your {Attack} is stronger, with [${percent(q.TooltipCritChance)}] chance to deal {Critical} damage.
{Bullet}Attack Damage: [${q.DisplayDelta1}]`,
		...rarity_tier1,
		Effects: [{
			BaseValue: 1.2,
			SourceIsMultiplier,
			...pom.DuplicateMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipDamage",
				Format: "PercentDelta",
			},
		}, {
			BaseValue: 0.15,
			MinMultiplier: 0,
			ChangeType: "Add",
			IdenticalMultiplier: {
				Value: -1,
			},
			IgnoreRarity: true,
			ExtractValue: {
				ExtractAs: "TooltipCritChance",
				Format: "Percent",
				SkipAutoExtract: true,
			},
		}],
	},
	ArtemisSecondaryTrait: {
		DisplayName: `Deadly Flourish`,
		Description: q => `Your {Special} is stronger, with [${percent(q.TooltipCritChance)}] chance to deal {Critical} Damage.
{Bullet}Special Damage: [${q.DisplayDelta1}]`,
		...rarity_tier1,
		Effects: [{
			BaseValue: 1.4,
			SourceIsMultiplier,
			...pom.DuplicateMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipDamage",
				Format: "PercentDelta",
			},
		}, {
			BaseValue: 0.20,
			MinMultiplier: 0,
			IgnoreRarity: true,
			ChangeType: "Add",
			IdenticalMultiplier: {
				Value: -1,
			},
			ExtractValue: {
				ExtractAs: "TooltipCritChance",
				Format: "Percent",
				SkipAutoExtract: true,
			},
		}],
	},
	ArtemisRangedTrait: {
		DisplayName: `True Shot`,
		Description: q => `Your {Cast} seeks foes, with a [${percent(q.TooltipCritChance)}] chance to deal {Critical} damage.
{Bullet}Cast Damage: [${q.DisplayDelta1}]`,
		Notes: [
			`Unblockable`,
		],
		...make_RarityLevels(1.0, 1.145, 1.290, 1.435),
		Effects: [{
			BaseValue: 70,
			...pom.DuplicateStrongMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipDamage",
			},
		}, {
			ChangeValue: 0.10,
			ChangeType: "Absolute",
			ExtractValue: {
				ExtractAs: "TooltipCritChance",
				Format: "Percent",
				SkipAutoExtract: true,
			},
		}],
		Forbid: ['ShieldLoadAmmoTrait'],
	},
	ShieldLoadAmmo_ArtemisRangedTrait: {
		DisplayName: `Hunter's Flare`,
		Description: q => `Your {Cast} damages foes around you, with a [${percent(q.TooltipCritChance)}] {Critical} chance.
{Bullet}Blast Damage: [${q.DisplayDelta1}]`,
		Notes: [
			`Unblockable`,
		],
		...make_RarityLevels(1.0, 1.145, 1.290, 1.435),
		Effects: [{
			BaseValue: 55,
			...pom.DuplicateStrongMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipDamage",
			},
			// But in ArtemisRangedTrait it is mentioned that beowulf has DamageRadius: 400,
			// which is probably some old code
			// DamageRadius: 330,
		}, {
			ChangeValue: 0.10,
			ChangeType: "Absolute",
			ExtractValue: {
				ExtractAs: "TooltipCritChance",
				Format: "Percent",
				SkipAutoExtract: true,
			},
		}],
		Required: ['ShieldLoadAmmoTrait'],
	},
	ArtemisRushTrait: {
		DisplayName: `Hunter Dash`,
		Description: q => `Your {Dash-Strike} deals more damage.
{Bullet}Dash-Strike Damage: [${q.DisplayDelta1}]`,
		...rarity_20,
		Effects: [{
			BaseValue: 1.5,
			SourceIsMultiplier,
			IdenticalMultiplier: {
				Value: -0.8,
			},
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipDamageBonus",
				Format: "PercentDelta",
			},
		}],
		Forbid: ['GunLoadedGrenadeTrait'],
	},
	ArtemisShoutTrait: {
		DisplayName: `Artemis' Aid`,
		Description: q => `Your {Call} fires a seeking arrow with [${percent(q.TooltipCritChance)}] {Critical} chance.
{Bullet}Arrow Damage: [${q.DisplayDelta1}]
{Bullet}Max Gauge Bonus - Arrows Fired: [${q.TooltipProjectiles}]`,
		// Unblockable: true,
		// Notes: [
		// 	`Costs 1/5th of the God Gauge per use`,
		// ],
		...rarity_10,
		Effects: [{
			BaseValue: 100,
			...pom.DuplicateMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipDamage",
			},
		}, {
			// Description: `Max Gauge Bonus - Arrows Fired: [10]`,
			ChangeValue: 10,
			ChangeType: "Absolute",
			ExtractValue: {
				ExtractAs: "TooltipProjectiles",
			},
		}, {
			ChangeValue: 0.35,
			ChangeType: "Absolute",
			ExtractValue: {
				ExtractAs: "TooltipCritChance",
				Format: "Percent",
				SkipAutoExtract: true,
			},
		}],
	},
	CritBonusTrait: {
		DisplayName: `Pressure Points`,
		Description: q => `Any damage you deal has a chance to be {Critical}.
{Bullet}Critical Chance: [${q.DisplayDelta1}]`,
		...rarity_50,
		Effects: [{
			BaseValue: 0.02,
			MinMultiplier: 0.333333,
			ChangeType: "Add",
			...pom.DuplicateMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipCritBonus",
				Format: "Percent",
				// ToFixed,
				// DecimalPlaces: 3,
			},
		}],
	},
	ArtemisAmmoExitTrait: {
		DisplayName: `Exit Wounds`,
		Description: q => `Your foes take damage when your {Ammo} stuck in them is dislodged.
{Bullet}Dislodge Damage: [${q.DisplayDelta1}]`,
		...rarity_20,
		Effects: [{
			BaseValue: 100,
			ChangeType: "Add",
			...pom.DuplicateMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipDamage",
			},
		}],
		Forbid: [
			"BlizzardOrbTrait",
			"PoseidonAresProjectileTrait",
			'ShieldLoadAmmoTrait',
			'DemeterRangedTrait',
			'AresRangedTrait',
			'DionysusRangedTrait',
			// VISUAL
			// 'ShieldLoadAmmo_DionysusRangedTrait',
		],
		Required: [{
			OneOf: [
				'AphroditeRangedTrait',
				'ArtemisRangedTrait',
				'AthenaRangedTrait',
				'PoseidonRangedTrait',
				// actually VISUAL
				"ShieldLoadAmmo_PoseidonRangedTrait",
				'ZeusRangedTrait',
			],
		}],
	},
	CriticalBufferMultiplierTrait: {
		DisplayName: `Hide Breaker`,
		Description: q => `Your {Critical} effects deal even more damage to {Armor}.
{Bullet}Critical Damage vs. Armor: [${q.DisplayDelta1}]`,
		...rarity_tier2,
		Effects: [{
			BaseValue: 2,
			SourceIsMultiplier,
			...pom.DuplicateMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipDamageBonus",
				Format: "PercentDelta",
			},
		}],
		Required: [{
			OneOf: [
				'ArtemisWeaponTrait',
				'ArtemisSecondaryTrait',
				'ArtemisRangedTrait',
				'ArtemisShoutTrait',
				'CritBonusTrait',
			],
		}],
	},
	ArtemisCriticalTrait: {
		DisplayName: `Clean Kill`,
		Description: q => `Your {Critical} effects deal even more damage.
{Bullet}Critical Damage: [${q.DisplayDelta1}]`,
		...rarity_50,
		Effects: [{
			BaseValue: 0.15,
			ChangeType: "Add",
			MinMultiplier: 0.2,
			IdenticalMultiplier: {
				Value: -0.34,
			},
			ExtractValue: {
				ExtractAs: "TooltipCritDamageBonus",
				Format: "Percent",
			},
		}],
		Required: [{
			OneOf: [
				'ArtemisWeaponTrait',
				'ArtemisSecondaryTrait',
				'ArtemisRangedTrait',
				'ArtemisShoutTrait',
				'CritBonusTrait',
			],
		}],
	},
	CriticalSuperGenerationTrait: {
		DisplayName: `Hunter Instinct`,
		Description: q => `Your {God Gauge} charges up faster when you deal {Critical} damage.
{Bullet}Added Gauge Gain on Critical: [${q.DisplayDelta1}%]`,
		...rarity_20,
		Effects: [{
			BaseValue: 0.25,
			...pom.DuplicateMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipCriticalSuperGain",
				DecimalPlaces: 2,
			},
		}],
		Required: [{
			OneOf: [
				'ArtemisWeaponTrait',
				'ArtemisSecondaryTrait',
				'ArtemisRangedTrait',
				'CritBonusTrait',
			],
		}],
	},
	CritVulnerabilityTrait: {
		DisplayName: `Hunter's Mark`,
		Description: q => `After you deal {Critical} damage to a foe, a foe near it is {Marked}.
{Bullet}Marked Critical Chance: [${q.DisplayDelta1}]
{Bullet}Range: [${q.TooltipRange}]`,
		...rarity_tier1,
		Effects: [{
			BaseValue: 0.30,
			...pom.DuplicateMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipVulnerability",
				Format: "Percent",
			},
		}, {
			ChangeValue: 1200,
			ExtractValue: {
				ExtractAs: "TooltipRange",
			},
		}],
		Required: [{
			OneOf: [
				'ArtemisWeaponTrait',
				'ArtemisSecondaryTrait',
				'ArtemisRangedTrait',
				'ArtemisShoutTrait',
				'CritBonusTrait',
			],
		}],
	},
	ArtemisSupportingFireTrait: {
		DisplayName: `Support Fire`,
		Description: q => `After you {Cast}, or hit with an {Attack} or {Special}, fire a seeking arrow.
{Bullet}Arrow Damage: [${q.DisplayDelta1}]`,
		...rarity_20,
		Effects: [{
			BaseValue: 10,
			AsInt,
			MinMultiplier: 0.1,
			IdenticalMultiplier: {
				Value: -0.8,
			},
			ExtractValue: {
				ExtractAs: "TooltipDamage",
			},
		}],
		Required: [{
			OneOf: [
				'ArtemisWeaponTrait',
				'ArtemisSecondaryTrait',
				'ArtemisRangedTrait',
				"ShieldLoadAmmo_ArtemisRangedTrait",
				'ArtemisRushTrait',
				'ArtemisShoutTrait',
				'CritBonusTrait',
			],
		}],
	},
	MoreAmmoTrait: {
		DisplayName: `Fully Loaded`,
		Description: q => `Gain extra {Ammo} for your {Cast}.
{Bullet}Max Bloodstones: [${q.DisplayDelta1}] {Ammo_Small}`,
		...rarity_tier3,
		Effects: [{
			BaseValue: 2.0,
			ChangeType: "Add",
			MinMultiplier: 1,
			ExtractValue: {
				ExtractAs: "TooltipCapacity",
			},
		}],
		Forbid: ["MoreAmmoTrait"],
		Required: [{
			Description: 'Two of the Following:',
			List: [
				'ArtemisAmmoExitTrait',
				'CritBonusTrait',
				'ArtemisSupportingFireTrait',
			],
		}],
	},
	// Ares
	AresWeaponTrait: {
		DisplayName: `Curse of Agony`,
		Description: q => `Your {Attack} inflicts {Doom}.
{Bullet}Doom Damage: [${q.DisplayDelta1}]`,
		...rarity_50,
		Effects: [{
			BaseValue: 50,
			AsInt,
			MinMultiplier: 0.025,
			IdenticalMultiplier: {
				Value: -0.4,
			},
			ExtractValue: {
				ExtractAs: "TooltipDamage",
			},
			// Delay: 1.1,
		}],
		Inflicts: {
			Doom: {},
		},
	},
	AresSecondaryTrait: {
		DisplayName: `Curse of Pain`,
		Description: q => `Your {Special} inflicts {Doom}.
{Bullet}Doom Damage: [${q.DisplayDelta1}]`,
		...make_RarityLevels(1.0, 1.34, 1.67, 2.0),
		Effects: [{
			BaseValue: 60,
			IdenticalMultiplier: {
				Value: -0.34,
			},
			ExtractValue: {
				ExtractAs: "TooltipDamage",
			},
			// Delay: 1.1,
		}],
		Inflicts: {
			Doom: {},
		},
	},
	AresRangedTrait: {
		DisplayName: `Slicing Shot`,
		Description: q => `Your {Cast} sends a {Blade Rift} hurtling ahead.
{Bullet}Rift Damage per Hit: [${q.DisplayDelta1}]
{Bullet}Duration: [${q.TooltipTotalFuse} Sec.]
{Bullet}Damage Radius: [${q.TooltipDamageRadius}]
{Bullet}Speed: [${q.TooltipSpeed}]`,
		...rarity_10,
		// Projectile.AresProjectile
		Effects: [{
			BaseValue: 20,
			AsInt,
			MinMultiplier: 0.1,
			IdenticalMultiplier: {
				Value: -0.8,
			},
			ExtractValue: [{
				ExtractAs: "TooltipDamage",
			}, {
				ExtractAs: "TooltipTotalFuse",
				External: true,
				TraitName: "AresRangedTrait",
				BaseType: "ProjectileBase",
				BaseName: "AresProjectile",
				BaseProperty: "TotalFuse",
			}, {
				ExtractAs: "TooltipDamageRadius",
				External: true,
				TraitName: "AresRangedTrait",
				BaseType: "ProjectileBase",
				BaseName: "AresProjectile",
				BaseProperty: "DamageRadius",
			}, {
				ExtractAs: "TooltipSpeed",
				External: true,
				TraitName: "AresRangedTrait",
				BaseType: "ProjectileBase",
				BaseName: "AresProjectile",
				BaseProperty: "Speed",
			}],
			// DamageInterval: 0.2, // Fuse
		}],
		Forbid: ['ShieldLoadAmmoTrait'],
	},
	ShieldLoadAmmo_AresRangedTrait: {
		DisplayName: `Slicing Flare`,
		Description: q => `Your {Cast} sends a large {Blade Rift} hurtling ahead for a brief time.
{Bullet}Rift Damage per Hit: [${q.DisplayDelta1}]
{Bullet}Duration: [${q.TooltipTotalFuse} Sec.]
{Bullet}Damage Radius: [${q.TooltipDamageRadius}]
{Bullet}Speed: [${q.TooltipSpeed}]`,
		...rarity_20,
		// Projectile.AresProjectile
		Effects: [{
			BaseValue: 30,
			AsInt,
			MinMultiplier: 0.05,
			IdenticalMultiplier: {
				Value: -0.8,
			},
			ExtractValue: [{
				ExtractAs: "TooltipDamage",
			}, {
				ExtractAs: "TooltipTotalFuse",
				External: true,
				TraitName: "ShieldLoadAmmo_AresRangedTrait",
				BaseType: "ProjectileBase",
				BaseName: "AresProjectile",
				BaseProperty: "TotalFuse",
			}, {
				ExtractAs: "TooltipDamageRadius",
				External: true,
				TraitName: "ShieldLoadAmmo_AresRangedTrait",
				BaseType: "ProjectileBase",
				BaseName: "AresProjectile",
				BaseProperty: "DamageRadius",
			}, {
				ExtractAs: "TooltipSpeed",
				External: true,
				TraitName: "ShieldLoadAmmo_AresRangedTrait",
				BaseType: "ProjectileBase",
				BaseName: "AresProjectile",
				BaseProperty: "Speed",
			}],
			// DamageInterval: 0.2, // Fuse
		}],
		Required: ['ShieldLoadAmmoTrait'],
	},
	AresRushTrait: {
		DisplayName: `Blade Dash`,
		Description: q => `Your {Dash} creates a {Blade Rift} where you started.
{Bullet}Rift Damage per Hit: [${q.DisplayDelta1}]
{Bullet}Duration: [${q.TooltipTotalFuse} Sec.]
{Bullet}Damage Radius: [${q.TooltipDamageRadius}]
{Bullet}Speed: [${q.TooltipSpeed}]`,
		...rarity_20,
		// Projectile.AresRushProjectile
		Effects: [{
			BaseValue: 10,
			AsInt,
			MinMultiplier: 0.2,
			...pom.DuplicateStrongMultiplier,
			ExtractValue: [{
				ExtractAs: "TooltipDamage",
			}, {
				ExtractAs: "TooltipTotalFuse",
				External: true,
				TraitName: "AresRushTrait",
				BaseType: "ProjectileBase",
				BaseName: "AresRushProjectile",
				BaseProperty: "TotalFuse",
			}, {
				ExtractAs: "TooltipDamageRadius",
				External: true,
				TraitName: "AresRushTrait",
				BaseType: "ProjectileBase",
				BaseName: "AresRushProjectile",
				BaseProperty: "DamageRadius",
			}, {
				ExtractAs: "TooltipSpeed",
				External: true,
				TraitName: "AresRushTrait",
				BaseType: "ProjectileBase",
				BaseName: "AresRushProjectile",
				BaseProperty: "Speed",
			}],
		}],
	},
	AresShoutTrait: {
		DisplayName: `Ares' Aid`,
		Description: q => `Your {Call} turns you into an {Impervious} {Blade Rift} for {${q.TooltipSuperDuration} Sec}.
{Bullet}Rift Damage per Hit: [${q.DisplayDelta1}]
{Bullet}Max Gauge Bonus: [${q.TooltipMaxDuration} Sec. Duration]
{Bullet}Damage Radius: [${q.TooltipDamageRadius}]`,
		...rarity_25,
		// Projectile.AresInvisibleAoE
		Effects: [{
			BaseValue: 30,
			AsInt,
			MinMultiplier: 0.05,
			IdenticalMultiplier: {
				Value: -0.8,
			},
			ExtractValue: [{
				ExtractAs: "TooltipDamage",
			}, {
				ExtractAs: "TooltipDamageRadius",
				External: true,
				TraitName: "AresShoutTrait",
				BaseType: "ProjectileBase",
				BaseName: "AresInvisibleAoE",
				BaseProperty: "DamageRadius",
			}],
		}, {
			// Description: `Max Gauge Bonus: [5 Sec. Duration]`,
			SuperDuration: 1.2,
			MaxDurationMultiplier: 5,
			ExtractValue: [{
				Key: "SuperDuration",
				ExtractAs: "TooltipSuperDuration",
				DecimalPlaces: 1,
			}, {
				Key: "MaxDurationMultiplier",
				// ! BUG: ExWrathDuration
				Format: "EXWrathDuration",
				ExtractAs: "TooltipMaxDuration",
				DecimalPlaces: 1,
				SkipAutoExtract: true,
			}],
		}],
	},
	AresRetaliateTrait: {
		DisplayName: `Curse of Vengeance`,
		Description: q => `After you take damage, inflict {Doom} on surrounding foes.
{Bullet}Doom Damage: [${q.DisplayDelta1}]
{Bullet}Damage Radius: [${q.TooltipDamageRadius}]`,
		...rarity_20,
		// Weapon.AresRetaliate
		// Projectile.AresRetaliate
		Effects: [{
			BaseValue: 100,
			...pom.DuplicateVeryStrongMultiplier,
			ExtractValue: [{
				ExtractAs: "TooltipDamage",
			}, {
				ExtractAs: "TooltipDamageRadius",
				External: true,
				TraitName: "AresRetaliateTrait",
				BaseType: "ProjectileBase",
				BaseName: "AresRetaliate",
				BaseProperty: "DamageRadius",
			}],
			// Delay: 1.1,
		}],
		Inflicts: {
			Doom: {},
		},
	},
	IncreasedDamageTrait: {
		DisplayName: `Urge to Kill`,
		Description: q => `Your {Attack}, {Special}, and {Cast} deal more damage.
{Bullet}Bonus Damage: [${q.DisplayDelta1}]`,
		...rarity_30,
		Effects: [{
			BaseValue: 1.1,
			MinMultiplier: 0.100,
			SourceIsMultiplier,
			IdenticalMultiplier: {
				Value: -0.6,
			},
			ToNearest: 0.01,
			ExtractValue: {
				ExtractAs: "TooltipDamage",
				Format: "PercentDelta",
			},
		}],
	},
	OnEnemyDeathDamageInstanceBuffTrait: {
		DisplayName: `Battle Rage`,
		Description: q => `After slaying a foe, your next {Attack} or {Special} deals more damage.
{Bullet}Damage Bonus: [${q.DisplayDelta1}]`,
		...rarity_50,
		Effects: [{
			BaseValue: 1.00,
			IdenticalMultiplier: {
				Value: -0.7,
			},
			ExtractValue: {
				ExtractAs: "TooltipKillBonus",
				Format: "Percent",
			},
		}],
	},
	LastStandDamageBonusTrait: {
		DisplayName: `Blood Frenzy`,
		Description: q => `After using {Death Defiance}, deal more damage that {Encounter}.
{Bullet}Encounter Bonus Damage: [${q.DisplayDelta1}]`,
		...rarity_50,
		Effects: [{
			BaseValue: 0.15,
			ChangeType: "Add",
			...pom.DuplicateMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipBonus",
				Format: "Percent",
			},
		}],
		Forbid: ["LastStandDamageBonusTrait"],
	},
	AresAoETrait: {
		DisplayName: `Black Metal`,
		// Bonus Area of Effect:
		Description: q => `Your {Blade Rift} effects deal damage in a wider area.
{Bullet}Bonus Area of Effect: [${q.TooltipAoE}]
{Bullet}{Cast} Area of Effect: [${q.DisplayDelta2}]
{Bullet}{Beowulf Cast} Area of Effect: [${q.DisplayDelta3}]
{Bullet}{Dash} Area of Effect: [${q.DisplayDelta4}]
{Bullet}{Shout} Area of Effect: [${q.DisplayDelta5}]`,
		...rarity_10,
		Effects: [{
			BaseValue: 30,
			ChangeType: "Add",
			...pom.DuplicateMultiplier,
			ExtractValue: [{
				ExtractAs: "TooltipAoE",
			}, {
				ExtractAs: "TooltipAoE_AresRangedTrait",
				Format: "PercentOfBase",
				TraitName: "AresRangedTrait",
				BaseType: "Projectile",
				BaseName: "AresProjectile",
				BaseProperty: "DamageRadius",
			}, {
				ExtractAs: "TooltipAoE_ShieldLoadAmmo",
				Format: "PercentOfBase",
				TraitName: "ShieldLoadAmmo_AresRangedTrait",
				BaseType: "Projectile",
				BaseName: "AresProjectile",
				BaseProperty: "DamageRadius",
			}, {
				ExtractAs: "TooltipAoE_AresRushTrait",
				Format: "PercentOfBase",
				TraitName: "AresRushTrait",
				BaseType: "Projectile",
				BaseName: "AresProjectile",
				BaseProperty: "DamageRadius",
			}, {
				ExtractAs: "TooltipAoE_AresShoutTrait",
				Format: "PercentOfBase",
				TraitName: "AresShoutTrait",
				BaseType: "Projectile",
				BaseName: "AresInvisibleAoE",
				BaseProperty: "DamageRadius",
			}],
		}],
		// ! BUG: misspelled RequiresFalseTraits
		// Forbid: ["AresAoETrait"],
		Required: [{
			OneOf: [
				'AresRangedTrait',
				'ShieldLoadAmmo_AresRangedTrait',
				'AresRushTrait',
				'AresShoutTrait',
			],
		}],
	},
	AresDragTrait: {
		DisplayName: `Engulfing Vortex`,
		Description: q => `Your {Blade Rift} effects last longer and pull foes in.
{Bullet}Rift Duration: [+${q.NewTotal1} Sec.]`,
		Notes: [
			`{Ares' Aid} has a stronger pull force.`,
		],
		...rarity_tier1,
		Effects: [{
			BaseValue: 0.2,
			ChangeType: "Add",
			ExtractValue: {
				ExtractAs: "TooltipDuration",
				DecimalPlaces: 1,
			},
		}],
		Forbid: ["AresDragTrait"],
		Required: [{
			OneOf: [
				'AresRangedTrait',
				'ShieldLoadAmmo_AresRangedTrait',
				'AresRushTrait',
				'AresShoutTrait',
			],
		}],
	},
	AresLoadCurseTrait: {
		DisplayName: `Dire Misfortune`,
		Description: q => `Your {Doom} effects deal more damage when applied multiple times.
{Bullet}Bonus Damage per Stack: [${q.NewTotal1}]`,
		...rarity_20,
		Effects: [{
			BaseValue: 10,
			AsInt,
			MinMultiplier: 0.2,
			...pom.DuplicateMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipDamage",
			},
		}],
		Forbid: ["AresLoadCurseTrait"],
		Required: [{
			OneOf: [
				'AresWeaponTrait',
				'AresSecondaryTrait',
			],
		}],
	},
	AresLongCurseTrait: {
		DisplayName: `Impending Doom`,
		Description: q => `Your {Doom} effects deal more damage, but take {+${q.TooltipDelay} Sec.} to activate.
{Bullet}Bonus Doom Damage: [${q.DisplayDelta1}]`,
		...rarity_10,
		Effects: [{
			BaseValue: 1.60,
			ToNearest: 0.05,
			SourceIsMultiplier,
			...pom.DuplicateMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipDamage",
				Format: "PercentDelta",
			},
		}, {
			ChangeValue: 0.5,
			ExtractValue: {
				ExtractAs: "TooltipDelay",
				DecimalPlaces: 1,
				SkipAutoExtract: true,
			},
		}],
		Required: [{
			OneOf: [
				'AresWeaponTrait',
				'AresSecondaryTrait',
				'AresRetaliateTrait',
			],
		}],
	},
	AresCursedRiftTrait: {
		DisplayName: `Vicious Cycle`,
		Description: q => `Your {Blade Rift} effects deal more damage for each consecutive hit.
{Bullet}Damage Increase per Hit: [+${q.TooltipDamage}]`,
		...rarity_tier3,
		Effects: [{
			ChangeValue: 2,
			ChangeType: "Absolute",
			ExtractValue: {
				ExtractAs: "TooltipDamage",
			},
		}],
		Forbid: ["AresCursedRiftTrait"],
		Required: [{
			OneOf: [
				'AresAoETrait',
				'AresDragTrait',
			],
		}],
	},
	// Aphrodite
	AphroditeWeaponTrait: {
		DisplayName: `Heartbreak Strike`,
		Description: q => `Your {Attack} deals more damage and inflicts {Weak}.
{Bullet}Attack Damage: [${q.DisplayDelta1}]`,
		...rarity_tier1,
		Effects: [{
			BaseValue: 1.5,
			SourceIsMultiplier,
			...pom.DuplicateMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipDamage",
				Format: "PercentDelta",
			},
		}],
		Inflicts: {
			Weak: {},
		},
	},
	AphroditeSecondaryTrait: {
		DisplayName: `Heartbreak Flourish`,
		Description: q => `Your {Special} deals more damage and inflicts {Weak}.
{Bullet}Special Damage: [${q.DisplayDelta1}]`,
		...rarity_tier1,
		Effects: [{
			BaseValue: 1.8,
			SourceIsMultiplier,
			...pom.DuplicateMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipDamage",
				Format: "PercentDelta",
			},
		}],
		Inflicts: {
			Weak: {},
		},
	},
	AphroditeRangedTrait: {
		DisplayName: `Crush Shot`,
		Description: q => `Your {Cast} is a wide, short-range blast that inflicts {Weak}.
{Bullet}Cast Damage: [${q.DisplayDelta1}]
{Bullet}Damage Radius: [${q.TooltipDamageRadius}]
{Bullet}Range: [${q.TooltipRange}]`,
		...make_RarityLevels(1.0, 1.11, 1.22, 1.33),
		// Projectile.AphroditeProjectile
		Effects: [{
			BaseValue: 90,
			...pom.DuplicateStrongMultiplier,
			ExtractValue: [{
				ExtractAs: "TooltipDamage",
			}, {
				ExtractAs: "TooltipDamageRadius",
				External: true,
				TraitName: "AphroditeRangedTrait",
				BaseType: "ProjectileBase",
				BaseName: "AphroditeProjectile",
				BaseProperty: "DamageRadius",
			}, {
				ExtractAs: "TooltipRange",
				External: true,
				TraitName: "AphroditeRangedTrait",
				BaseType: "ProjectileBase",
				BaseName: "AphroditeProjectile",
				BaseProperty: "Range",
			}],
		}],
		Inflicts: {
			Weak: {
				Range: 300,
			},
		},
		Forbid: ['ShieldLoadAmmoTrait'],
	},
	ShieldLoadAmmo_AphroditeRangedTrait: {
		DisplayName: `Passion Flare`,
		Description: q => `Your {Cast} damages foes around you and inflicts {Weak}.
{Bullet}Blast Damage: [${q.DisplayDelta1}]
{Bullet}Damage Radius: [${q.TooltipDamageRadius}]`,
		...rarity_20,
		// Projectile.AphroditeBeowulfProjectile
		Effects: [{
			BaseValue: 80,
			...pom.DuplicateStrongMultiplier,
			ExtractValue: [{
				ExtractAs: "TooltipDamage",
			}, {
				ExtractAs: "TooltipDamageRadius",
				External: true,
				TraitName: "ShieldLoadAmmo_AphroditeRangedTrait",
				BaseType: "ProjectileBase",
				BaseName: "AphroditeBeowulfProjectile",
				BaseProperty: "DamageRadius",
			}],
		}],
		Inflicts: {
			Weak: {
				Range: 300,
			},
		},
		Required: ['ShieldLoadAmmoTrait'],
	},
	AphroditeRushTrait: {
		DisplayName: `Passion Dash`,
		Description: q => `Your {Dash} deals damage where you end up, inflicting {Weak}.
{Bullet}Dash Damage: [${q.DisplayDelta1}]
{Bullet}Damage Radius: [${q.TooltipDamageRadius}]`,
		...rarity_20,
		// Projectile.AphroditeRushProjectile
		Effects: [{
			BaseValue: 20,
			AsInt,
			...pom.DuplicateVeryStrongMultiplier,
			ExtractValue: [{
				ExtractAs: "TooltipDamage",
			}, {
				ExtractAs: "TooltipDamageRadius",
				External: true,
				TraitName: "AphroditeRushTrait",
				BaseType: "ProjectileBase",
				BaseName: "AphroditeRushProjectile",
				BaseProperty: "DamageRadius",
			}],
		}],
		Inflicts: {
			Weak: {
				Radius: 180,
			},
		},
	},
	AphroditeShoutTrait: {
		DisplayName: `Aphrodite's Aid`,
		Description: q => `Your {Call} fires a seeking projectile that inflicts {Charm}.
{Bullet}Charm Duration: [${q.DisplayDelta1} Sec.]
{Bullet}Max Gauge Bonus: [${q.TooltipDamage} Damage]`,
		Notes: [
			`The charm projectile pierces foes.`,
		],
		...rarity_10,
		Effects: [{
			BaseValue: 5,
			ChangeType: "Add",
			MinMultiplier: 0.2,
			IdenticalMultiplier: {
				Value: -0.9,
			},
			ExtractValue: {
				ExtractAs: "TooltipDuration",
				DecimalPlaces: 1,
			},
		}, {
			ChangeValue: 2500,
			...pom.DuplicateMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipDamage",
				SkipAutoExtract: true,
			},
		}],
		Inflicts: {
			Charm: {},
		},
	},
	AphroditeDeathTrait: {
		DisplayName: `Dying Lament`,
		Description: q => `When foes are slain, they damage nearby foes and inflict {Weak}.
{Bullet}Death Blast Damage: [${q.DisplayDelta1}]`,
		...rarity_tier1,
		Effects: [{
			BaseValue: 40,
			...pom.DuplicateStrongMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipDamage",
			},
			// Where did wiki get this value?
			// Radius: 200,
		}],
		Inflicts: {
			Weak: {},
		},
	},
	AphroditeRetaliateTrait: {
		DisplayName: `Wave of Despair`,
		Description: q => `After you take damage, damage foes around you and inflict {Weak}.
{Bullet}Revenge Damage: [${q.DisplayDelta1}]`,
		...rarity_25,
		Effects: [{
			BaseValue: 50,
			...pom.DuplicateVeryStrongMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipDamage",
			},
			// Radius: 700,
		}],
		Inflicts: {
			Weak: {},
		},
	},
	ProximityArmorTrait: {
		DisplayName: `Different League`,
		Description: q => `Resist some damage from nearby foes' attacks.
{Bullet}Reduced Damage From Foes: [${q.DisplayDelta1}]
{Bullet}Range: [${q.TooltipRange}]`,
		...rarity_25,
		Effects: [{
			BaseValue: 0.9,
			MinMultiplier: 0.1,
			ToNearest: 0.01,
			SourceIsMultiplier,
			...pom.DuplicateMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipDamageReduction",
				Format: "NegativePercentDelta",
			},
		}, {
			ChangeValue: 400,
			ExtractValue: {
				ExtractAs: "TooltipRange",
			},
		}],
		Inflicts: {
			Weak: {},
		},
	},
	HealthRewardBonusTrait: {
		DisplayName: `Life Affirmation`,
		Description: q => `Any {HealthUp_Small} chamber rewards are worth more.
{Bullet}Bonus Life Gain: [${q.NewTotal1}]`,
		Notes: [
			`This boon does not affect Thanatos encounters or items bought from Charon's shop.`,
		],
		...rarity_20,
		Effects: [{
			BaseValue: 1.3,
			SourceIsMultiplier,
			...pom.DuplicateMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipPercentIncrease",
				Format: "PercentDelta",
			},
		}],
		Forbid: ["HealthRewardBonusTrait"],
	},
	AphroditeDurationTrait: {
		DisplayName: `Empty Inside`,
		Description: q => `Your {Weak} effects have a longer duration.
{Bullet}Weak Duration: [${q.DisplayDelta1} Sec.]`,
		...rarity_50,
		Effects: [{
			BaseValue: 5,
			ChangeType: "Add",
			...pom.DuplicateMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipDuration",
				DecimalPlaces: 1,
			},
		}],
		Required: [{
			OneOf: [
				'AphroditeWeaponTrait',
				'AphroditeSecondaryTrait',
				'AphroditeRangedTrait',
				'ShieldLoadAmmo_AphroditeRangedTrait',
				'AphroditeRushTrait',
			],
		}],
	},
	AphroditeWeakenTrait: {
		DisplayName: `Sweet Surrender`,
		Description: q => `{Weak}-afflicted foes are also more susceptible to damage.
{Bullet}Damage vs. Weak: [${q.DisplayDelta1}]`,
		...rarity_50,
		Effects: [{
			BaseValue: 0.1,
			ChangeType: "Add",
			...pom.DuplicateMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipDamage",
				Format: "Percent",
			},
		}],
		Required: [{
			OneOf: [
				'AphroditeWeaponTrait',
				'AphroditeSecondaryTrait',
				'AphroditeRangedTrait',
				'ShieldLoadAmmo_AphroditeRangedTrait',
				'AphroditeRushTrait',
			],
		}],
	},
	AphroditePotencyTrait: {
		DisplayName: `Broken Resolve`,
		Description: q => `Your {Weak} effects are more potent.
{Bullet}Weak Damage Reduction: [${q.DisplayDelta1}]`,
		...rarity_25,
		Effects: [{
			BaseValue: -0.1,
			ChangeType: "Add",
			...pom.DuplicateMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipModifier",
				DecimalPlaces: 1,
				Format: "Percent",
				AbsoluteValue: true,
			},
		}],
		Forbid: ["AphroditePotencyTrait"],
		Required: [{
			OneOf: [
				'AphroditeWeaponTrait',
				'AphroditeSecondaryTrait',
				'AphroditeRangedTrait',
				'ShieldLoadAmmo_AphroditeRangedTrait',
				'AphroditeRushTrait',
			],
		}],
	},
	AphroditeRangedBonusTrait: {
		DisplayName: `Blown Kiss`,
		// {Bullet}Passion Flare Blast Range: [${percent(q.Tooltip_ShieldLoadAmmo_AphroditeRangedTrait_Range)}]
		Description: q => `Your {Cast} shoots farther and is stronger against undamaged foes.
{Bullet}First-Hit Bonus Damage: [${q.DisplayDelta1}]
{Bullet}Crush Shot Range: [${percent(q.Tooltip_AphroditeRangedTrait_Range)}]`,
		...rarity_50,
		Effects: [{
			BaseValue: 1.5,
			SourceIsMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipDamageBonus",
				Format: "PercentDelta",
			},
		}, {
			ChangeValue: 2,
			ChangeType: "Multiply",
			ExtractValue: {
				ExtractAs: "Tooltip_AphroditeRangedTrait_Range",
				Format: "PercentDelta",
			},
		}, {
			// old code. trait doesn't drop for beowulf
			ChangeValue: 1.3,
			ChangeType: "Multiply",
			ExtractValue: {
				ExtractAs: "Tooltip_ShieldLoadAmmo_AphroditeRangedTrait_Range",
				Format: "PercentDelta",
			},
		}],
		Forbid: [
			"AphroditeRangedBonusTrait",
			"ShieldLoadAmmoTrait",
		],
		Required: [{
			OneOf: [
				'AphroditeRangedTrait',
			],
		}],
	},
	CharmTrait: {
		DisplayName: `Unhealthy Fixation`,
		Description: q => `Your {Weak} effects also have a {${percent(q.TooltipAffectChance)}} chance to {Charm} foes.
{Bullet}Charm Duration: [${q.NewTotal1} Sec.]`,
		...rarity_tier3,
		Effects: [{
			BaseValue: 4,
			ChangeType: "Add",
			ExtractValue: {
				ExtractAs: "TooltipDuration",
			},
		}, {
			ChangeValue: 0.15,
			ExtractValue: {
				ExtractAs: "TooltipAffectChance",
				SkipAutoExtract: true,
				Format: "Percent",
			},
		}],
		Inflicts: {
			Charm: {},
		},
		Forbid: ["CharmTrait"],
		Required: [{
			OneOf: [
				'AphroditeWeaponTrait',
				'AphroditeSecondaryTrait',
				'AphroditeRangedTrait',
				'ShieldLoadAmmo_AphroditeRangedTrait',
				'AphroditeRushTrait',
			],
		}, {
			OneOf: [
				'AphroditePotencyTrait',
				'AphroditeWeakenTrait',
				'AphroditeDurationTrait',
			],
		}],
	},
	// Duo
	// => Aphrodite
	CurseSickTrait: {
		DisplayName: `Curse of Longing`,
		Description: q => `Your {Doom} effects continuously strike {Weak} foes.
{Bullet}Successive Hit Damage: [${q.NewTotal[1]}%]`,
		Duo: ['Ares', 'Aphrodite'],
		...rarity_synergy,
		Effects: [{
			ChangeValue: 0.5,
			ExtractValue: {
				ExtractAs: "TooltipMultiplier",
				Format: "Percent",
			},
		}],
		Forbid: ["CurseSickTrait"],
		Required: [{
			OneOf: [
				'AresWeaponTrait',
				'AresSecondaryTrait',
			],
		}, {
			OneOf: [
				'AphroditeWeaponTrait',
				'AphroditeSecondaryTrait',
				'AphroditeRangedTrait',
				'ShieldLoadAmmo_AphroditeRangedTrait',
				'AphroditeRushTrait',
			],
		}],
	},
	HeartsickCritDamageTrait: {
		DisplayName: `Heart Rend`,
		Description: q => `Your {Critical} effects deal even more damage to {Weak} foes.
{Bullet}Bonus Critical Damage vs. Weak: [${percent(q.TooltipVulnerability)}]`,
		Duo: ['Artemis', 'Aphrodite'],
		...rarity_synergy,
		Effects: [{
			BaseValue: 1.5,
			ExtractValue: {
				ExtractAs: "TooltipVulnerability",
				Format: "Percent",
			},
		}],
		Forbid: ["HeartsickCritDamageTrait"],
		Required: [{
			OneOf: [
				'ArtemisWeaponTrait',
				'ArtemisSecondaryTrait',
				'ArtemisRangedTrait',
				'ShieldLoadAmmo_ArtemisRangedTrait',
			],
		}, {
			OneOf: [
				'AphroditeWeaponTrait',
				'AphroditeSecondaryTrait',
				'AphroditeRangedTrait',
				'ShieldLoadAmmo_AphroditeRangedTrait',
				'AphroditeRushTrait',
			],
		}],
	},
	CastBackstabTrait: {
		DisplayName: `Parting Shot`,
		Description: q => `Your {Cast} gains any bonuses you have for striking foes from behind.
{Bullet}Bonus Backstab Damage: [${q.DisplayDelta1}]`,
		Duo: ['Athena', 'Aphrodite'],
		...rarity_synergy,
		Effects: [{
			BaseValue: 1.35,
			SourceIsMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipDamageBonus",
				Format: "PercentDelta",
			},
		}],
		Forbid: [
			"CastBackstabTrait",
			"DionysusRangedTrait",
			// VISUAL
			// "ShieldLoadAmmo_DionysusRangedTrait",
			"ShieldLoadAmmoTrait",
		],
		Required: [{
			OneOf: [
				'AthenaWeaponTrait',
				'AthenaSecondaryTrait',
				'AthenaRangedTrait',
				'AthenaRushTrait',
				'AthenaShoutTrait',
			],
		}, {
			OneOf: [
				'AphroditeWeaponTrait',
				'AphroditeSecondaryTrait',
				'AphroditeRangedTrait',
				'AphroditeRushTrait',
				'AphroditeShoutTrait',
			],
		}],
	},
	SelfLaserTrait: {
		DisplayName: `Cold Embrace`,
		Description: q => `Your {Cast} crystal fires its beam directly at you for {+${q.TooltipDuration} Sec.}
{Bullet}Bonus Cast Damage: [${percent(q.TooltipDamage)}]`,
		Duo: ['Demeter', 'Aphrodite'],
		...rarity_synergy,
		Effects: [{
			BaseValue: 1.3,
			SourceIsMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipDamage",
				Format: "PercentDelta",
			},
		}, {
			...rarity_synergy,
			BaseValue: 4,
			ChangeType: "Add",
			ExtractValue: {
				ExtractAs: "TooltipDuration",
			},
		}],
		Forbid: ["SelfLaserTrait", "HomingLaserTrait"],
		Required: [{
			OneOf: [
				'DemeterRangedTrait',
			],
		}, {
			OneOf: [
				'AphroditeWeaponTrait',
				'AphroditeSecondaryTrait',
				'AphroditeRushTrait',
				'AphroditeShoutTrait',
			],
		}],
	},
	DionysusAphroditeStackIncreaseTrait: {
		DisplayName: `Low Tolerance`,
		Description: q => `Your {Hangover} effects can stack more times against {Weak} foes.
{Bullet}Max Stacks vs. Weak: [+${q.NewTotal1}]`,
		Duo: ['Dionysus', 'Aphrodite'],
		...rarity_synergy,
		Effects: [{
			BaseValue: 3,
			ChangeType: "Add",
			AsInt,
			MinMultiplier: 0.335,
			ExtractValue: {
				ExtractAs: "TooltipStackBoost",
			},
		}],
		Forbid: ["DionysusAphroditeStackIncreaseTrait"],
		Required: [{
			OneOf: [
				'DionysusWeaponTrait',
				'DionysusSecondaryTrait',
				'DionysusRushTrait',
				'DionysusShoutTrait',
			],
		}, {
			OneOf: [
				'AphroditeWeaponTrait',
				'AphroditeSecondaryTrait',
				"AphroditeRangedTrait",
				'ShieldLoadAmmo_AphroditeRangedTrait',
				'AphroditeRushTrait',
			],
		}],
	},
	ImprovedPomTrait: {
		DisplayName: `Sweet Nectar`,
		Description: q => `Any {Poms of Power} you find are more potent.
{Bullet}Bonus Lv. from Poms: [+${q.PomLevelBonus}]`,
		Duo: ['Poseidon', 'Aphrodite'],
		...rarity_synergy,
		Effects: [{
			ChangeValue: 1,
			ExtractValue: {
				ExtractAs: "PomLevelBonus",
			},
		}],
		Forbid: ["ImprovedPomTrait"],
		Required: [{
			OneOf: [
				'PoseidonWeaponTrait',
				'PoseidonSecondaryTrait',
				'PoseidonRangedTrait',
				// actually VISUAL
				"ShieldLoadAmmo_PoseidonRangedTrait",
				'PoseidonRushTrait',
				'PoseidonShoutTrait',
			],
		}, {
			OneOf: [
				'AphroditeWeaponTrait',
				'AphroditeSecondaryTrait',
				'AphroditeRangedTrait',
				"ShieldLoadAmmo_AphroditeRangedTrait",
				'AphroditeRushTrait',
				'AphroditeShoutTrait',
			],
		}],
	},
	RegeneratingCappedSuperTrait: {
		DisplayName: `Smoldering Air`,
		Description: q => `Your {God Gauge} charges up automatically, but is capped at &[25%].
{Bullet}Auto Gauge Gain: [1%] (every ${q.TooltipInterval} Sec.)`,
		Duo: ['Zeus', 'Aphrodite'],
		...rarity_synergy,
		Effects: [{
			ChangeValue: 1,
			ExtractValue: {
				ExtractAs: "TooltipSuperAmount"
			},
		}, {
			ChangeValue: 0.20,
			ExtractValue: {
				ExtractAs: "TooltipInterval",
				DecimalPlaces: 1,
			},
		}, {
			ChangeValue: 25,
			ExtractValue: {
				ExtractAs: "TooltipCap",
			},
		}],
		Forbid: [
			"RegeneratingCappedSuperTrait",
			"HadesShoutTrait",
		],
		Required: [{ Slot: ['Shout'] }, {
			OneOf: [
				'ZeusWeaponTrait',
				'ZeusSecondaryTrait',
				'ZeusRangedTrait',
				"ShieldLoadAmmo_ZeusRangedTrait",
				'ZeusRushTrait',
				'ZeusShoutTrait',
			],
		}, {
			OneOf: [
				'AphroditeWeaponTrait',
				'AphroditeSecondaryTrait',
				'AphroditeRangedTrait',
				"ShieldLoadAmmo_AphroditeRangedTrait",
				'AphroditeRushTrait',
				'AphroditeShoutTrait',
			],
		}],
	},
	// => Ares
	AresHomingTrait: {
		DisplayName: `Hunting Blades`,
		Description: q => `Your {Cast} creates a faster {Blade Rift} that seeks the nearest foe.
{Bullet}Seek Duration: [${q.NewTotal1} Sec.]`,
		Duo: ['Artemis', 'Ares'],
		...rarity_synergy,
		Effects: [{
			// Description: `Seek Duration: [3.3 Sec.]`,
			// 15/(-x)=3.3
			// x=-15/3.3~=4.5
			BaseValue: 15,
			ChangeType: "Add",
			ExtractValue: {
				ExtractAs: "TooltipSeekPower",
				Format: "SeekDuration",
				// TraitName: "AresRangedTrait",
				BaseName: "AresProjectile",
				DecimalPlaces: 1,
			},
		}],
		Forbid: ["AresHomingTrait", "StationaryRiftTrait", "ShieldLoadAmmoTrait"],
		Required: [{
			OneOf: [
				'AresRangedTrait',
			],
		}, {
			OneOf: [
				'ArtemisWeaponTrait',
				'ArtemisSecondaryTrait',
				'ArtemisRushTrait',
				'ArtemisShoutTrait',
			],
		}],
	},
	TriggerCurseTrait: {
		DisplayName: `Merciful End`,
		Description: q => `Your abilities that can {Deflect} immediately activate {Doom} effects.
{Bullet}Doom Combo Damage: [${q.TooltipDamageBonus}]`,
		Duo: ['Athena', 'Ares'],
		...rarity_synergy,
		Effects: [{
			BaseValue: 40,
			ExtractValue: {
				ExtractAs: "TooltipDamageBonus",
			},
		}],
		Forbid: ["TriggerCurseTrait"],
		Required: [{
			OneOf: [
				'AresWeaponTrait',
				'AresSecondaryTrait',
			],
		}, {
			OneOf: [
				'AthenaWeaponTrait',
				'AthenaSecondaryTrait',
			],
		}],
	},
	StationaryRiftTrait: {
		DisplayName: `Freezing Vortex`,
		Description: q => `Your {Cast} inflicts {Chill}, but is smaller and moves slower.
{Bullet}Speed: &[x${q.TooltipSpeed}]
{Bullet}Blade Rift Size: &[${q.TooltipAoE}%]
{Bullet}Beowulf Rift Size: &[${q.TooltipAoE_ShieldLoadAmmo}%]`,
		Duo: ['Demeter', 'Ares'],
		...rarity_synergy,
		Effects: [{
			ChangeValue: 0.55,
			ChangeType: "Multiply",
			ExtractValue: {
				ExtractAs: "TooltipSpeed",
			},
		}, {
			BaseValue: -23,
			ChangeType: "Add",
			ExtractValue: [{
				ExtractAs: "TooltipAoE",
				Format: "PercentOfBase",
				TraitName: "AresRangedTrait",
				BaseType: "Projectile",
				BaseName: "AresProjectile",
				BaseProperty: "DamageRadius",
			}, {
				ExtractAs: "TooltipAoE_ShieldLoadAmmo",
				Format: "PercentOfBase",
				TraitName: "ShieldLoadAmmo_AresRangedTrait",
				BaseType: "Projectile",
				BaseName: "AresProjectile",
				BaseProperty: "DamageRadius",
			}],
		}],
		Forbid: ["StationaryRiftTrait", "AresHomingTrait"],
		Required: [{
			OneOf: [
				'AresRangedTrait',
				'ShieldLoadAmmo_AresRangedTrait',
			],
		}, {
			OneOf: [
				'DemeterWeaponTrait',
				'DemeterSecondaryTrait',
				'DemeterRushTrait',
				'DemeterShoutTrait',
			],
		}],
	},
	PoisonTickRateTrait: {
		DisplayName: `Curse of Nausea`,
		Description: q => `Your {Hangover} effects deal damage faster.
{Bullet}Hangover Damage Rate: ~[${q.TooltipBaseTickRate} Sec.]{RightArrow}[${q.TooltipTickRate} Sec.]`,
		Duo: ['Dionysus', 'Ares'],
		...rarity_synergy,
		Effects: [{
			ChangeValue: 0.35,
			ChangeType: "Absolute",
			ExtractValue: {
				ExtractAs: "TooltipTickRate",
				DecimalPlaces: 2,
			},
		}, {
			ExtractValue: {
				ExtractAs: "TooltipBaseTickRate",
				SkipAutoExtract: true,
				External: true,
				BaseType: "Effect",
				WeaponName: "SwordWeapon",
				BaseName: "DamageOverTime",
				BaseProperty: "Cooldown",
				DecimalPlaces: 1,
			},
		}],
		Forbid: ["PoisonTickRateTrait"],
		Required: [{
			OneOf: [
				'AresWeaponTrait',
				'AresSecondaryTrait',
				'AresRetaliateTrait',
			]
		}, {
			OneOf: [
				'DionysusWeaponTrait',
				'DionysusSecondaryTrait',
				'DionysusRushTrait',
				'DionysusShoutTrait',
			],
		}],
	},
	PoseidonAresProjectileTrait: {
		DisplayName: `Curse of Drowning`,
		Description: q => `Your {Flood Shot} becomes a pulse that damages foes around you.
{Bullet}Pulses per Cast: [${q.TooltipExplosionCount}]
{Bullet}Damage Radius: &[${q.DisplayDelta2}]`,
		Duo: ['Poseidon', 'Ares'],
		...rarity_synergy,
		Effects: [{
			ChangeValue: 3,
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipExplosionCount",
			},
		}, {
			ChangeValue: 0.65,
			ChangeType: "Multiply",
			ExtractValue: {
				ExtractAs: "TooltipDamageRadius",
				Format: "PercentDelta",
			},
		}],
		Forbid: [
			"PoseidonAresProjectileTrait",
			"BlizzardOrbTrait",
			"ArtemisBonusProjectileTrait",
			"BowLoadAmmoTrait",
		],
		Required: [{
			OneOf: [
				'AresWeaponTrait',
				'AresSecondaryTrait',
				'AresRushTrait',
				'AresShoutTrait',
			],
		}, {
			OneOf: [
				'PoseidonRangedTrait',
				// actually VISUAL
				'ShieldLoadAmmo_PoseidonRangedTrait',
			],
		}],
	},
	AutoRetaliateTrait: {
		DisplayName: `Vengeful Mood`,
		Description: q => `Your Revenge effects sometimes occur without taking damage.
{Bullet}Auto-Revenge Rate: [${q.IntervalData} Sec.]`,
		Duo: ['Zeus', 'Ares'],
		...rarity_synergy,
		Effects: [{
			BaseMin: 3.0,
			BaseMax: 3.0,
			ExtractValue: {
				ExtractAs: "IntervalData",
			},
			// Range: 300
		}],
		Forbid: ["AutoRetaliateTrait"],
		Required: [{
			OneOf: [
				'AresWeaponTrait',
				'AresSecondaryTrait',
				'AresRangedTrait',
				'ShieldLoadAmmo_AresRangedTrait',
				'AresRushTrait',
				'AresShoutTrait',
			],
		}, {
			OneOf: [
				'ZeusWeaponTrait',
				'ZeusSecondaryTrait',
				'ZeusRangedTrait',
				'ShieldLoadAmmo_ZeusRangedTrait',
				'ZeusRushTrait',
				'ZeusShoutTrait',
			],
		}, {
			OneOf: [
				'AphroditeRetaliateTrait',
				'AresRetaliateTrait',
				'AthenaRetaliateTrait',
				'DemeterRetaliateTrait',
				'RetaliateWeaponTrait',
			],
		}],
	},
	// => Artemis
	ArtemisReflectBuffTrait: {
		DisplayName: `Deadly Reversal`,
		Description: q => `After you {Deflect}, briefly gain {${percent(q.TooltipCriticalChance)}} chance to deal {Critical} damage.
{Bullet}Effect Duration: [${q.NewTotal1} Sec.]`,
		Duo: ['Athena', 'Artemis'],
		...rarity_synergy,
		Effects: [{
			BaseValue: 2.0,
			ChangeType: "Add",
			ExtractValue: {
				ExtractAs: "TooltipDuration",
			},
		}, {
			BaseValue: 0.20,
			ExtractValue: {
				ExtractAs: "TooltipCriticalChance",
				Format: "Percent",
			},
		}],
		Forbid: ["ArtemisReflectBuffTrait"],
		Required: [{
			OneOf: [
				'ArtemisWeaponTrait',
				'ArtemisSecondaryTrait',
				'ArtemisRangedTrait',
				'ShieldLoadAmmo_ArtemisRangedTrait',
				'ArtemisShoutTrait',
			],
		}, {
			OneOf: [
				'AthenaWeaponTrait',
				'AthenaSecondaryTrait',
			],
		}],
	},
	HomingLaserTrait: {
		DisplayName: `Crystal Clarity`,
		Description: q => `Your {Cast} is stronger and tracks foes more effectively.
{Bullet}Beam Damage: [${percent(q.TooltipDamage)}]`,
		Duo: ['Demeter', 'Artemis'],
		...rarity_synergy,
		Effects: [{
			BaseValue: 1.1,
			SourceIsMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipDamage",
				Format: "PercentDelta",
			},
		}],
		Forbid: [
			"SelfLaserTrait",
			"HomingLaserTrait",
			"MultiLaserTrait",
		],
		Required: [{
			OneOf: [
				'ArtemisWeaponTrait',
				'ArtemisSecondaryTrait',
				'ArtemisRushTrait',
				'ArtemisShoutTrait',
			],
		}, {
			OneOf: [
				'DemeterRangedTrait',
			],
		}],
	},
	PoisonCritVulnerabilityTrait: {
		DisplayName: `Splitting Headache`,
		Description: q => `{Hangover}-afflicted foes are more likely to take {Critical} damage.
{Bullet}Bonus Critical Chance per {PoisonIcon_Small}: [${percent(q.TooltipCritBonus)}]`,
		Duo: ['Dionysus', 'Artemis'],
		...rarity_synergy,
		Effects: [{
			ChangeValue: 0.015,
			ChangeType: "Absolute",
			ExtractValue: {
				ExtractAs: "TooltipCritBonus",
				Format: "Percent",
				DecimalPlaces: 1,
			},
		}],
		Forbid: ["PoisonCritVulnerabilityTrait"],
		Required: [{
			OneOf: [
				'ArtemisWeaponTrait',
				'ArtemisSecondaryTrait',
				'ArtemisRangedTrait',
				'ArtemisShoutTrait',
			],
		}, {
			OneOf: [
				'DionysusWeaponTrait',
				'DionysusSecondaryTrait',
				'DionysusRushTrait',
				'DionysusShoutTrait',
			],
		}],
	},
	ArtemisBonusProjectileTrait: {
		DisplayName: `Mirage Shot`,
		Description: q => `Your {Cast} fires a second projectile, which deals reduced base damage.
{Bullet}Secondary Shot Damage: [${q.NewTotal[1]}%]`,
		Duo: ['Poseidon', 'Artemis'],
		...rarity_synergy,
		Effects: [{
			BaseValue: 0.30,
			MinMultiplier: 0.05,
			IdenticalMultiplier: {
				Value: -0.75,
			},
			ExtractValue: {
				ExtractAs: "TooltipDamage",
				Format: "Percent",
			},
		}, {
			ChangeValue: 2,
			IdenticalMultiplier: {
				Value: -1,
				MinMultiplier: 0,
			},
			ExtractValue: {
				ExtractAs: "TooltipProjectiles",
				SkipAutoExtract: true,
			},
		}],
		Forbid: ["ArtemisBonusProjectileTrait", "PoseidonAresProjectileTrait"],
		Required: [{
			OneOf: [
				'ArtemisWeaponTrait',
				'ArtemisSecondaryTrait',
				'ArtemisRangedTrait',
				'ShieldLoadAmmo_ArtemisRangedTrait',
				'ArtemisShoutTrait',
			],
		}, {
			OneOf: [
				'PoseidonWeaponTrait',
				'PoseidonSecondaryTrait',
				'PoseidonRangedTrait',
				// actually VISUAL
				'ShieldLoadAmmo_PoseidonRangedTrait',
				'PoseidonRushTrait',
				'PoseidonShoutTrait',
			],
		}],
	},
	AmmoBoltTrait: {
		DisplayName: `Lightning Rod`,
		Description: q => `Your collectible {Ammo} strike nearby foes with lightning every {${q.AmmoFieldWeapon_Interval_Min} Sec.}
{Bullet}Lightning Damage: [${q.DisplayDelta1}]
{Bullet}Damage Radius: [${q.TooltipDamageRadius}]
{Bullet}Range: [${q.TooltipRange}]
{Bullet}Cast pick up Range: &[${q.DisplayDelta4}]`,
		Duo: ['Zeus', 'Artemis'],
		...rarity_synergy,
		// Projectile.ZeusAmmoProjectile
		Effects: [{
			BaseValue: 70,
			ExtractValue: [{
				ExtractAs: "TooltipDamage",
			}, {
				ExtractAs: "TooltipDamageRadius",
				External: true,
				TraitName: "AmmoBoltTrait",
				BaseType: "ProjectileBase",
				BaseName: "ZeusAmmoProjectile",
				BaseProperty: "DamageRadius",
			}],
		}, {
			ChangeValue: 900,
			ExtractValue: {
				ExtractAs: "TooltipRange",
			},
		}, {
			BaseValue: 0.5,
			ChangeType: "Multiply",
			SourceIsMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipMagnetism",
				Format: "PercentDelta",
			},
		}, {
			// Min=1.0,
			// Max=1.0,
			ChangeValue: 1.0,
			ExtractValue: {
				ExtractAs: "AmmoFieldWeapon_Interval_Min",
			},
		}],
		Forbid: ["AmmoBoltTrait"],
		Required: [
			'AmmoMetaUpgrade',
			{
				OneOf: [
					'ArtemisWeaponTrait',
					'ArtemisSecondaryTrait',
					'ArtemisRangedTrait',
					'ShieldLoadAmmo_ArtemisRangedTrait',
					'ArtemisRushTrait',
					'ArtemisShoutTrait',
				],
			}, {
				OneOf: [
					'ZeusWeaponTrait',
					'ZeusSecondaryTrait',
					'ZeusRangedTrait',
					'ShieldLoadAmmo_ZeusRangedTrait',
					'ZeusRushTrait',
					'ZeusShoutTrait',
				],
			}],
	},
	// => Athena
	NoLastStandRegenerationTrait: {
		DisplayName: `Stubborn Roots`,
		Description: q => `If you have no {Death Defiance}, your {Health_Small} slowly recovers.
{Bullet}Life Regeneration During Battle: [${q.TooltipHealAmount}] {HealthRestore_Small} (every ${q.TooltipInterval} Sec.)`,
		Duo: ['Demeter', 'Athena'],
		...rarity_synergy,
		Effects: [{
			ChangeValue: 1,
			ExtractValue: {
				ExtractAs: "TooltipHealAmount",
			},
		}, {
			ChangeValue: 0.8,
			ExtractValue: {
				ExtractAs: "TooltipInterval",
				DecimalPlaces: 1,
			},
		}],
		Forbid: ["NoLastStandRegenerationTrait"],
		Required: [{
			OneOf: [
				'AthenaWeaponTrait',
				'AthenaSecondaryTrait',
				'AthenaRangedTrait',
				'ShieldLoadAmmo_AthenaRangedTrait',
				'AthenaRushTrait',
				'AthenaShoutTrait',
			],
		}, {
			OneOf: [
				'DemeterWeaponTrait',
				'DemeterSecondaryTrait',
				'DemeterRangedTrait',
				'ShieldLoadAmmo_DemeterRangedTrait',
				'DemeterRushTrait',
				'DemeterShoutTrait',
			],
		}],
	},
	SlowProjectileTrait: {
		DisplayName: `Calculated Risk`,
		Description: q => `Your foes' ranged-attack projectiles are slower.
{Bullet}Foe Projectile Speed Reduction: [${percent(q.NewTotal[1])}]`,
		Duo: ['Dionysus', 'Athena'],
		...rarity_synergy,
		Effects: [{
			BaseValue: 0.5,
			SourceIsMultiplier,
			ChangeType: "Multiply",
			ExtractValue: {
				ExtractAs: "ProjectileSpeedDecrease",
				Format: "NegativePercentDelta",
			},
		}],
		Forbid: ["SlowProjectileTrait"],
		Required: [{
			OneOf: [
				'AthenaWeaponTrait',
				'AthenaSecondaryTrait',
				'AthenaRushTrait',
				'AthenaShoutTrait',
			],
		}, {
			OneOf: [
				'DionysusWeaponTrait',
				'DionysusSecondaryTrait',
				'DionysusRushTrait',
				'DionysusShoutTrait',
			],
		}],
	},
	StatusImmunityTrait: {
		DisplayName: `Unshakable Mettle`,
		Description: q => `You cannot be stunned, and resist some damage from {Bosses}.
{Bullet}Boss Damage Reduction: [${percent(q.TooltipDamageReduction)}]`,
		Duo: ['Poseidon', 'Athena'],
		...rarity_synergy,
		Effects: [{
			ChangeValue: 0.90,
			ExtractValue: {
				ExtractAs: "TooltipDamageReduction",
				Format: "NegativePercentDelta",
			},
		}],
		Forbid: ["StatusImmunityTrait"],
		Required: [{
			OneOf: [
				'AthenaWeaponTrait',
				'AthenaSecondaryTrait',
				'AthenaRangedTrait',
				'ShieldLoadAmmo_AthenaRangedTrait',
				'AthenaShoutTrait',
			],
		}, {
			OneOf: [
				'PoseidonWeaponTrait',
				'PoseidonSecondaryTrait',
				'PoseidonRangedTrait',
				// actually VISUAL
				'ShieldLoadAmmo_PoseidonRangedTrait',
				'PoseidonShoutTrait',
			],
		}],
	},
	ReboundingAthenaCastTrait: {
		DisplayName: `Lightning Phalanx`,
		Description: q => `Your Phalanx Shot {Cast} bounces between nearby foes.
{Bullet}Max Bounces: [${q.TooltipBounces}]`,
		Duo: ['Zeus', 'Athena'],
		...rarity_synergy,
		Effects: [{
			ChangeValue: 3,
			ChangeType: "Absolute",
			ExtractValue: {
				ExtractAs: "TooltipBounces",
			},
		}],
		Forbid: ["ReboundingAthenaCastTrait"],
		Required: [{
			OneOf: [
				'AthenaRangedTrait',
			],
		}, {
			OneOf: [
				'ZeusWeaponTrait',
				'ZeusSecondaryTrait',
				'ZeusRushTrait',
				'ZeusShoutTrait',
			],
		}],
	},
	// => Demeter
	IceStrikeArrayTrait: {
		DisplayName: `Ice Wine`,
		Description: q => `Your {Cast} blasts an area with freezing {Festive Fog} that inflicts {Chill}.
{Bullet}Blast Damage: [${percent(q.TooltipDamage)}]
{Bullet}Range: [${q.TooltipRange}]`,
		Duo: ['Dionysus', 'Demeter'],
		...rarity_synergy,
		Effects: [{
			BaseValue: 1.3,
			SourceIsMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipDamage",
				Format: "PercentDelta",
			},
		}, {
			ChangeValue: 100,
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipRange",
			},
		}],
		Forbid: ["IceStrikeArrayTrait", "BlizzardOrbTrait"],
		Required: [{
			OneOf: [
				'DemeterWeaponTrait',
				'DemeterSecondaryTrait',
				'DemeterRushTrait',
				'DemeterShoutTrait',
			],
		}, {
			OneOf: [
				'DionysusRangedTrait',
				// actually VISUAL
				"ShieldLoadAmmo_DionysusRangedTrait",
			],
		}],
	},
	BlizzardOrbTrait: {
		DisplayName: `Blizzard Shot`,
		Description: q => `Your {Cast} moves slowly, piercing foes and firing shards around it.
{Bullet}Shard Damage: [${q.NewTotal1}] (every ${q.TooltipFuse} Sec.)
{Bullet}Damage Radius: [${q.TooltipDamageRadius}]
{Bullet}Projectiles per Cast: [${q.TooltipSpawnCount}]`,
		Duo: ['Poseidon', 'Demeter'],
		...rarity_synergy,
		Effects: [{
			BaseValue: 20,
			ChangeType: "Absolute",
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipDamage",
			},
		}, {
			ChangeValue: 0.5,
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipFuse",
			},
		}, {
			ChangeValue: 2,
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipSpawnCount",
			},
		}, {
			ChangeValue: 100,
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipDamageRadius",
			},
		}],
		Forbid: [
			"BlizzardOrbTrait",
			"PoseidonAresProjectileTrait",
			"IceStrikeArrayTrait",
			"ShieldLoadAmmoTrait",
		],
		Required: [{
			OneOf: [
				'DemeterWeaponTrait',
				'DemeterSecondaryTrait',
				'DemeterRushTrait',
				'DemeterShoutTrait',
			],
		}, {
			OneOf: [
				'PoseidonRangedTrait',
				// VISUAL
				// 'ShieldLoadAmmo_PoseidonRangedTrait',
			],
		}],
	},
	JoltDurationTrait: {
		DisplayName: `Cold Fusion`,
		Description: q => `Your {Jolted} effects do not expire when foes attack.
{Bullet}Jolted Duration: [${q.NewTotal1} Sec.]`,
		Duo: ['Zeus', 'Demeter'],
		...rarity_synergy,
		Effects: [{
			ChangeValue: 10,
			ChangeType: "Absolute",
			ExtractValue: {
				ExtractAs: "TooltipDuration",
			},
		}],
		Forbid: ["JoltDurationTrait"],
		Required: [{
			OneOf: [
				'DemeterWeaponTrait',
				'DemeterSecondaryTrait',
				'DemeterRushTrait',
				'DemeterShoutTrait',
			],
		}, {
			OneOf: [
				'ZeusLightningDebuff',
			],
		}],
	},
	// => Dionysus
	RaritySuperBoost: {
		DisplayName: `Exclusive Access`,
		Description: q => `Any {Boons} you find are more potent.
{Bullet}Minimum Boon Rarity: {Epic}`,
		Notes: [
			`Any action that can upgrade {Rarity}<br/>will upgrade from {Common} to {Epic}<br/>(Rare Crop; Ambrosia Delight)`,
			`This useless {Boon} will not give you {Heroic} {Rarity}.<br/>In fact, you only get {Epic} [+100%] chance.<br/>No increase to {Legendary} (More like "Useless Access")`,
			`*Refreshing Nectar* doesn't actually *increase* {Rarity}.<br/>It has the exact same effects as *Yarn of Ariadne*.<br/>{Rare} [+100%]; {Epic} [+25%]; {Legendary} [+10%]`,
		],
		Duo: ['Poseidon', 'Dionysus'],
		...rarity_synergy,
		Effects: [],
		Forbid: ["RaritySuperBoost"],
		Required: [{
			OneOf: [
				'DionysusWeaponTrait',
				'DionysusSecondaryTrait',
				'DionysusRangedTrait',
				// actually VISUAL
				"ShieldLoadAmmo_DionysusRangedTrait",
				'DionysusRushTrait',
				'DionysusShoutTrait',
			],
		}, {
			OneOf: [
				'PoseidonWeaponTrait',
				'PoseidonSecondaryTrait',
				'PoseidonRangedTrait',
				// actually VISUAL
				"ShieldLoadAmmo_PoseidonRangedTrait",
				'PoseidonRushTrait',
				'PoseidonShoutTrait',
			],
		}],
	},
	LightningCloudTrait: {
		DisplayName: `Scintillating Feast`,
		Description: q => `Your {Festive Fog} effects also deal lightning damage periodically.
{Bullet}Lightning Damage: [${q.DisplayDelta1}]
{Bullet}Damage Radius: [${q.TooltipDamageRadius}]
{Bullet}Strike Interval: [${q.TooltipInterval} Sec.]
{Bullet}Duration: [${q.TooltipDuration} Sec.]`,
		Duo: ['Zeus', 'Dionysus'],
		...rarity_synergy,
		// Projectile.ZeusDionysusCloudStrike
		Effects: [{
			BaseValue: 60,
			ExtractValue: [{
				ExtractAs: "TooltipDamage",
			}, {
				ExtractAs: "TooltipDamageRadius",
				External: true,
				TraitName: "LightningCloudTrait",
				BaseType: "ProjectileBase",
				BaseName: "ZeusDionysusCloudStrike",
				BaseProperty: "DamageRadius",
			}],
		}, {
			ChangeValue: 0.85,
			ExtractValue: {
				ExtractAs: "TooltipInterval",
			},
		}, {
			ChangeValue: 5,
			ExtractValue: {
				ExtractAs: "TooltipDuration",
			},
		}],
		Forbid: ["LightningCloudTrait"],
		Required: [{
			OneOf: [
				'DionysusRangedTrait',
				// VISUAL
				'ShieldLoadAmmo_DionysusRangedTrait',
			],
		}, {
			OneOf: [
				'ZeusWeaponTrait',
				'ZeusSecondaryTrait',
				'ZeusRushTrait',
				'ZeusShoutTrait',
			],
		}],
	},
	// => Poseidon
	ImpactBoltTrait: {
		DisplayName: `Sea Storm`,
		Description: q => `When you knock foes away, they are struck by lightning.
{Bullet}Lightning Damage: [${q.NewTotal1}]
{Bullet}Damage Radius: [${q.TooltipDamageRadius}]`,
		Duo: ['Zeus', 'Poseidon'],
		...rarity_synergy,
		// Projectile.LightningStrikeImpact
		Effects: [{
			BaseValue: 40,
			ExtractValue: [{
				ExtractAs: "TooltipDamage",
			}, {
				ExtractAs: "TooltipDamageRadius",
				External: true,
				TraitName: "ImpactBoltTrait",
				BaseType: "ProjectileBase",
				BaseName: "LightningStrikeImpact",
				BaseProperty: "DamageRadius",
			}],
		}],
		Forbid: ["ImpactBoltTrait"],
		Required: [{
			OneOf: [
				'PoseidonWeaponTrait',
				'PoseidonSecondaryTrait',
				'PoseidonRangedTrait',
				// actually VISUAL
				"ShieldLoadAmmo_PoseidonRangedTrait",
				'PoseidonShoutTrait',
			],
		}, {
			OneOf: [
				'ZeusWeaponTrait',
				'ZeusSecondaryTrait',
				'ZeusRangedTrait',
				"ShieldLoadAmmo_ZeusRangedTrait",
				'ZeusRushTrait',
				'ZeusShoutTrait',
			],
		}],
	},
	// => Hades
	HadesShoutTrait: {
		DisplayName: `Hades' Aid`,
		God: 'Hades',
	},
	// ** Stygian Blade **
	SwordHealthBufferDamageTrait: {
		DisplayName: `Breaching Slash`,
		Description: q => `Your {Attack} deals [${percent(q.TooltipDamageIncrease)}] damage to {Armor}.`,
		Notes: [
			`This upgrade {also} applies to {Dash-Strike}.`,
		],
		Effects: [{
			ChangeValue: 4,
			ExtractValue: {
				ExtractAs: "TooltipDamageIncrease",
				Format: "PercentDelta",
			},
		}],
	},
	SwordCriticalTrait: {
		DisplayName: `Cruel Thrust`,
		// Description: `Your {Thrust} deals [+200%] damage and has a [+40%] {Critical} chance.`,
		Description: q => `Your {Thrust} deals [${percent(q.TooltipDamageIncrease)}] damage and has a [${percent(q.TooltipBonusChance)}] {Critical} chance.`,
		Notes: [
			`Although {Dash-Strike} looks like a thrust, it does not benefit from {Cruel Thrust}`,
		],
		Effects: [{
			ChangeValue: 3.0,
			ExtractValue: {
				ExtractAs: "TooltipDamageIncrease",
				Format: "PercentDelta",
			},
		}, {
			BaseValue: 0.40,
			ExtractValue: {
				ExtractAs: "TooltipBonusChance",
				Format: "Percent",
			},
		}],
		Forbid: [
			"SwordTwoComboTrait",
			"SwordHeavySecondStrikeTrait",
			"SwordConsecrationTrait",
		],
	},
	SwordCursedLifeStealTrait: {
		DisplayName: `Cursed Slash`,
		Description: q => `Your {Attack} restores [${q.TooltipLifesteal}] {Health_Small} per hit, but you have &[-${q.TooltipHealthPenalty}%] {Health_Small}.`,
		Notes: [
			`This upgrade affects all sources of {Health_Small}, including {Centaur Hearts} and {Old Spiked Collar}, meaning that you'll receive &[-60%] health from those too`,
			`{Dash-Strike} does not restore health.`,
			`{Piercing Wave} has no benefit from this upgrade; only melee strikes will restore health.`,
		],
		Effects: [{
			ChangeValue: 2,
			ExtractValue: {
				ExtractAs: "TooltipLifesteal",
			}
		}, {
			ChangeValue: 0.4,
			ExtractValue: {
				ExtractAs: "TooltipHealthPenalty",
				Format: "NegativePercentDelta",
			},
		}],
	},
	SwordBlinkTrait: {
		DisplayName: `Dash Nova`,
		Description: q => `Your {Special} makes you lunge ahead, then become {Sturdy} for [${q.TooltipDuration} Sec.]`,
		Effects: [{
			ChangeValue: 1.0,
			ChangeType: "Absolute",
			ExtractValue: {
				ExtractAs: "TooltipDuration",
				DecimalPlaces: 2,
			},
		}],
	},
	SwordDoubleDashAttackTrait: {
		DisplayName: `Double Edge`,
		Description: q => `Your {Dash-Strike} hits twice and deals [${percent(q.TooltipDamageIncrease)}] damage.`,
		Effects: [{
			ChangeValue: 1.2,
			ExtractValue: {
				ExtractAs: "TooltipDamageIncrease",
				Format: "PercentDelta",
			},
		}],
	},
	SwordSecondaryDoubleAttackTrait: {
		DisplayName: `Double Nova`,
		Description: q => `Your {Special} hits twice, but no longer knocks foes away.`,
	},
	SwordTwoComboTrait: {
		DisplayName: `Flurry Slash`,
		Description: q => `Hold {Attack} to strike rapidly, dealing [${q.TooltipDamage}] base damage per hit.`,
		Effects: [{
			ChangeValue: 25,
			ChangeType: "Absolute",
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipDamage",
			},
		}],
		Forbid: [
			"SwordHeavySecondStrikeTrait",
			"SwordCriticalTrait",
			"SwordThirdStrikeChargeTrait",
			"SwordConsecrationTrait",
		],
	},
	SwordGoldDamageTrait: {
		DisplayName: `Hoarding Slash`,
		Description: q => `Your {Attack} deals bonus damage equal to [${q.TooltipDamage}%] of your current {Currency_Small}.`,
		Notes: [
			`This upgrade {also} applies to {Dash-Strike}`,
		],
		Effects: [{
			ChangeValue: 0.05,
			ExtractValue: {
				ExtractAs: "TooltipDamage",
				Format: "Percent",
			},
		}],
	},
	SwordThrustWaveTrait: {
		DisplayName: `Piercing Wave`,
		Description: q => `Your {Attack} fires a wave that pierces foes, dealing [${q.TooltipDamage}] damage.`,
		Notes: [
			`{Piercing Waves} cannot restore {Health_Small} if used with {Cursed Slash}.`,
			`This upgrade {also} applies to {Dash-Strike}`,
		],
		Effects: [{
			BaseValue: 30,
			ChangeType: "Absolute",
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipDamage",
			},
		}],
	},
	SwordBackstabTrait: {
		DisplayName: `Shadow Slash`,
		Description: q => `Your {Attack} deals [${percent(q.TooltipDamageBonus)}] damage striking foes from behind.`,
		Notes: [
			`This upgrade {does not} apply to {Dash-Strike}`,
		],
		Effects: [{
			ChangeValue: 3,
			ExtractValue: {
				ExtractAs: "TooltipDamageBonus",
				Format: "PercentDelta",
			},
		}],
	},
	SwordSecondaryAreaDamageTrait: {
		DisplayName: `Super Nova`,
		Description: q => `Your {Special} hits a wider area and deals [${percent(q.TooltipDamageIncrease)}] damage.
{Bullet}Damage Radius: [${percent(q.TooltipRadiusIncrease)}]`,
		// Notes: [
		// 	`Increases damage radius by [20%]`,
		// ],
		Effects: [{
			ChangeValue: 1.2,
			ExtractValue: {
				ExtractAs: "TooltipDamageIncrease",
				Format: "PercentDelta",
			},
		}, {
			ChangeValue: 1.2,
			ChangeType: "Multiply",
			ExtractValue: {
				ExtractAs: "TooltipRadiusIncrease",
				Format: "PercentDelta",
			},
		}],
	},
	SwordHeavySecondStrikeTrait: {
		DisplayName: `World Splitter`,
		Description: q => `Your {Attack} becomes a big chop that deals [${q.TooltipDamage}] base damage.`,
		Effects: [{
			ChangeValue: 90,
			ChangeType: "Absolute",
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipDamage",
			},
		}],
		Forbid: [
			"SwordTwoComboTrait",
			"SwordCriticalTrait",
			"SwordConsecrationTrait",
		],
	},
	SwordConsecrationBoostTrait: {
		DisplayName: `Greater Consecration`,
		Description: q => `Your {Holy Excalibur} aura is [${percent(q.TooltipAoE)}] larger; makes foes [${percent(q.TooltipSlowIncrease)}] slower.`,
		// Weapon.ConsecrationField
		// Projectile.ConsecrationField
		Effects: [{
			ChangeValue: 0.90,
			ChangeType: "Multiply",
			ExtractValue: {
				ExtractAs: "TooltipSlowIncrease",
				Format: "NegativePercentDelta",
			},
		}, {
			BaseValue: 178,
			ChangeType: "Add",
			...pom.DuplicateMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipAoE",
				Format: "PercentOfBase",
				BaseType: "Projectile",
				BaseName: "ConsecrationField",
				BaseProperty: "DamageRadius",
			},
		}],
		Required: [
			"SwordConsecrationTrait",
		],
	},
	// ** Shield of Chaos **
	ShieldThrowFastTrait: {
		DisplayName: `Dread Flight`,
		Description: q => `Your {Special} can strike up to [${q.TooltipBounces}] additional foes before returning.`,
		Effects: [{
			ChangeValue: 4.0,
			ChangeType: "Add",
			ExtractValue: {
				ExtractAs: "TooltipBounces",
			},
		}],
		Forbid: [
			"ShieldTwoShieldTrait",
			"ShieldThrowGrindTrait",
			"ShieldThrowSingleTargetTrait",
		],
	},
	ShieldChargeSpeedTrait: {
		DisplayName: `Sudden Rush`,
		Description: q => `Your {Bull Rush} charges up faster.
{Bullet}Charge Time: [x${q.TooltipChargeSpeed}]`,
		Effects: [{
			ChangeValue: 0.5,
			ChangeType: "Multiply",
			ExtractValue: {
				ExtractAs: "TooltipChargeSpeed",
				// Format: "PercentDelta",
			},
		}],
	},
	ShieldBashDamageTrait: {
		DisplayName: `Pulverizing Blow`,
		Description: q => `Your {Attack} hits twice, but does not knock foes away.`,
		Notes: [
			`Only affects {Bash}.<br/>{Dash-Strike} & {Bull Rush} are not affected.`,
		],
	},
	ShieldDashAOETrait: {
		DisplayName: `Dashing Wallop`,
		Description: q => `Your {Dash-Strike} deals [${percent(q.TooltipDamageIncrease)}] damage in a larger area.
{Bullet}Unleash [${q.TooltipDashProjectiles}] Dash-Strike Projectiles around yourself,<br/>that are interpreted as singular attack.
{Bullet}Immunity Window Duration: [${q.TooltipImmunityDuration} Sec.]`,
		Effects: [{
			ChangeValue: 1.5,
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipDamageIncrease",
				Format: "PercentDelta",
			},
		}, {
			ChangeValue: 3,
			ChangeType: "Absolute",
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipDashProjectiles",
			},
		}, {
			ChangeValue: 0.1,
			ChangeType: "Absolute",
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipImmunityDuration",
			},
		}],
	},
	ShieldThrowCatchExplode: {
		DisplayName: `Explosive Return`,
		Description: q => `Your {Special} deals [${q.TooltipDamage}] damage to foes around you when you catch it.
{Bullet}Damage Radius: [${q.TooltipDamageRadius}]`,
		Notes: [
			`{Aspect of Chaos} extra shields don't cause explosion.`,
		],
		Effects: [{
			BaseValue: 50,
			ChangeType: "Absolute",
			ExtractValue: [{
				ExtractAs: "TooltipDamage",
			}, {
				ExtractAs: "TooltipDamageRadius",
				External: true,
				BaseType: "ProjectileBase",
				BaseName: "ShieldCatchBlast",
				BaseProperty: "DamageRadius",
			}],
		}],
	},
	ShieldPerfectRushTrait: {
		DisplayName: `Minotaur Rush`,
		Description: q => `Your {Bull Rush} gains a {Power Rush} that deals [${percent(q.TooltipDamageIncrease)}] damage.
{Bullet}Power Rush Window Duration: [${q.TooltipPerfectChargeWindowDuration} Sec.]`,
		Effects: [{
			ChangeValue: 6.0,
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipDamageIncrease",
				Format: "PercentDelta",
			},
		}, {
			ChangeValue: 0.2,
			ChangeType: "Absolute",
			ExtractValue: {
				ExtractAs: "TooltipPerfectChargeWindowDuration",
			},
		}],
		Forbid: [
			"ShieldRushPunchTrait",
		],
	},
	ShieldChargeHealthBufferTrait: {
		DisplayName: `Breaching Rush`,
		Description: q => `Your {Bull Rush} deals [${percent(q.TooltipDamageBonus)}] damage to {Armor}.`,
		Effects: [{
			ChangeValue: 5,
			ExtractValue: {
				ExtractAs: "TooltipDamageBonus",
				Format: "PercentDelta",
			},
		}],
	},
	ShieldRushProjectileTrait: {
		DisplayName: `Charged Shot`,
		Description: q => `Your {Bull Rush} instead fires a piercing shot that deals [${q.TooltipDamage}] damage.
{Bullet}Bull Rush Range: [${q.DisplayDelta2}]`,
		Notes: [
			`The projectile is also {unblockable}`,
		],
		Effects: [{
			ChangeValue: 80,
			ChangeType: "Absolute",
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipDamage",
			},
		}, {
			ChangeValue: {
				from: 175, // Range
				to: 175 * 5, // ChargeRangeMultiplier
			},
			ExtractValue: {
				ExtractAs: "TooltipRange",
			},
		}],
		Forbid: [
			"ShieldRushPunchTrait",
		],
	},
	ShieldThrowElectiveCharge: {
		DisplayName: `Charged Flight`,
		Description: q => `Hold {Special} to charge your throw for up to [${percent(q.TooltipDamageBonus)}] base damage.`,
		Effects: [{
			ChangeValue: 3,
			ChangeType: "Absolute",
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipDamageBonus",
				Format: "PercentDelta",
			},
		}],
		Forbid: [
			"ShieldThrowSingleTargetTrait",
			"ShieldRushBonusProjectileTrait",
			"ShieldTwoShieldTrait",
			"ShieldThrowRushTrait",
		],
	},
	ShieldThrowEmpowerTrait: {
		DisplayName: `Empowering Flight`,
		Description: q => `After your {Special} hits, your next {${q.TooltipNumHits}} {Attacks} deal [${percent(q.TooltipDamage)}] damage.`,
		// ShieldThrowDamageBonus.Duration = 3 // doesn't actually do anything
		Effects: [{
			BaseValue: 0.8,
			ChangeType: "Add",
			ExtractValue: {
				ExtractAs: "TooltipDamage",
				Format: "Percent",
			},
		}, {
			ChangeValue: 2,
			ExtractValue: {
				ExtractAs: "TooltipNumHits",
			},
		}],
	},
	ShieldThrowRushTrait: {
		DisplayName: `Dashing Flight`,
		Description: q => `During your {Dash}, your {Special} is faster and deals [${percent(q.TooltipDamageIncrease)}] damage.`,
		Notes: [
			`To execute, first use {Dash}, then {Special}. Bonus not applied if you first use {Special} and then {Dash}.`,
		],
		Effects: [{
			ChangeValue: 3,
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipDamageIncrease",
				Format: "PercentDelta",
			},
		}],
		Forbid: [
			"ShieldThrowElectiveCharge",
			"ShieldTwoShieldTrait",
		],
	},
	ShieldBlockEmpowerTrait: {
		DisplayName: `Ferocious Guard`,
		Description: q => `After blocking a foe, gain [${percent(q.TooltipDamage)}] damage and move speed for [${q.TooltipDuration} Sec.]`,
		Effects: [{
			BaseValue: 0.2,
			ChangeType: "Add",
			ExtractValue: {
				ExtractAs: "TooltipDamage",
				Format: "Percent",
			},
		}, {
			ChangeValue: 10,
			ChangeType: "Absolute",
			ExtractValue: {
				ExtractAs: "TooltipDuration",
			},
		}],
	},
	ShieldLoadAmmoBoostTrait: {
		DisplayName: `Unyielding Defense`,
		Description: q => `After using your {Naegling's Board} {Cast}, you are {Sturdy} for [${q.TooltipDuration} Sec.]`,
		Effects: [{
			BaseValue: 3.0,
			ChangeType: "Absolute",
			ExtractValue: {
				ExtractAs: "TooltipDuration",
			},
		}],
		Required: ['ShieldLoadAmmoTrait'],
	},
	// ** Eternal Spear **
	SpearReachAttack: {
		DisplayName: `Extending Jab`,
		Description: q => `Your {Attack} has more range and deals [${percent(q.TooltipDamageBonus)}] damage to distant foes.
{Bullet}Attack Range: [${percent(q.TooltipAttackRange)}]`,
		// Notes: [
		// 	`Increases attack range by [40%]`,
		// ],
		Effects: [{
			BaseValue: 1.4,
			SourceIsMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipDamageBonus",
				Format: "PercentDelta",
			},
		}, {
			ChangeValue: 1.4,
			ChangeType: "Multiply",
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipAttackRange",
				Format: "PercentDelta",
			},
		}],
	},
	SpearThrowBounce: {
		DisplayName: `Chain Skewer`,
		Description: q => `Your {Special} hits up to [${q.TooltipBounces}] foes, dealing [${percent(q.TooltipDamageBonus)}] base damage for each.`,
		Effects: [{
			ChangeValue: 7,
			ChangeType: "Absolute",
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipBounces",
			},
		}, {
			ChangeValue: 1.3,
			ChangeType: "Absolute",
			ExtractValue: {
				ExtractAs: "TooltipDamageBonus",
				Format: "PercentDelta",
			},
		}],
		Forbid: [
			"SpearThrowExplode",
			"SpearSpinTravel",
			"SpearTeleportTrait",
		],
	},
	SpearThrowPenetrate: {
		DisplayName: `Breaching Skewer`,
		Description: q => `Your {Special} deals [${percent(q.TooltipDamageIncrease)}] damage to {Armor}.`,
		Effects: [{
			ChangeValue: 5,
			ExtractValue: {
				ExtractAs: "TooltipDamageIncrease",
				Format: "PercentDelta",
			},
		}],
	},
	SpearThrowCritical: {
		DisplayName: `Vicious Skewer`,
		Description: q => `Your {Special} deals [${percent(q.TooltipDamageIncrease)}] damage; [${percent(q.TooltipCriticalChance)}] {Critical} chance on recovery.`,
		Effects: [{
			ChangeValue: 1.5,
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipDamageIncrease",
				Format: "PercentDelta",
			},
		}, {
			BaseValue: 0.5,
			ChangeType: "Add",
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipCriticalChance",
				Format: "Percent",
			},
		}],
		Forbid: [
			"SpearThrowExplode",
			"SpearSpinTravel",
		],
	},
	SpearThrowExplode: {
		DisplayName: `Exploding Launcher`,
		Description: q => `Your {Special} becomes a shot that deals [${q.TooltipDamage}] base damage in an area.
{Bullet}Reload Time: [${q.TooltipReloadTime} Sec.]
{Bullet}Damage Radius: [${q.TooltipDamageRadius}]`,
		Effects: [{
			ChangeValue: 50,
			ChangeType: "Absolute",
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipDamage",
			},
		}, {
			ChangeValue: 0.4,
			ChangeType: "Absolute",
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipReloadTime",
			},
		}, {
			ChangeValue: 450,
			ChangeType: "Absolute",
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipDamageRadius",
			},
		}],
		Forbid: [
			"SpearThrowCritical",
			"SpearThrowBounce",
			"SpearTeleportTrait",
			"SpearSpinTravel",
		],
	},
	SpearSpinDamageRadius: {
		DisplayName: `Massive Spin`,
		Description: q => `Your {Spin Attack} deals [${percent(q.TooltipDamageIncrease)}] damage and hits a larger area.
{Bullet}Spin Damage Radius: [${percent(q.TooltipDamageRadiusIncrease)}]`,
		// Notes: [
		// 	`Increases damage radius of Spin Attack by [30%]`,
		// ],
		Effects: [{
			ChangeValue: 2.25,
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipDamageIncrease",
				Format: "PercentDelta",
			},
		}, {
			ChangeValue: 1.30,
			ChangeType: "Multiply",
			ExtractValue: {
				ExtractAs: "TooltipDamageRadiusIncrease",
				Format: "PercentDelta",
			},
		}],
		Forbid: [
			"SpearAutoAttack",
		],
	},
	// TODO? ugm, where did wiki get those numbers?
	SpearSpinChargeLevelTime: {
		DisplayName: `Quick Spin`,
		Description: q => `Your {Spin Attack} charges up and recovers much faster.`,
		Notes: [
			// My estimates:
			// Premier:	[0.15; 0.30]
			// 1.21; 2.06; 2.11; 2.20
			//       15;   5;    9
			// 4.08; 4.23; 4.27; 5.06
			//       15;   4;    8
			// SpearSpinDisableFast.DurationFrames = 10 (0.15 Sec? wiki)
			// SpearSpinDisableCancelableFast.DurationFrames = 20 (0.3 Sec? wiki)
			// Wiki: [removed; 0.15; 0.30]
			`New charge timing:
<li>1st stage removed</li>
<li>2nd stage: [0.15 Sec.]</li>
<li>3rd stage: [0.30 Sec.]</li>`,
		],
		Forbid: [
			"SpearAutoAttack",
		],
	},
	SpearAutoAttack: {
		DisplayName: `Flurry Jab`,
		Description: q => `Hold {Attack} to strike rapidly, but you cannot {Spin Attack}.`,
		Forbid: [
			"SpearSpinDamageRadius",
			"SpearSpinChargeLevelTime",
			"SpearSpinTravel",
			"SpearWeaveTrait",
			"SpearSpinChargeAreaDamageTrait",
		],
	},
	SpearThrowElectiveCharge: {
		DisplayName: `Charged Skewer`,
		// {Bullet}Special Range: ${q.DisplayDelta2}
		// {Bullet}Special Range: &[${q.TooltipDamageRangeMinMax.from}%]~[—][+${q.TooltipDamageRangeMinMax.to}%]
		Description: q => `Hold {Special} for up to [${percent(q.TooltipDamageBonus)}] base damage; minimum range reduced.
{Bullet}Charge Time: [${q.TooltipChargeTime} Sec.]
{Bullet}Special Range: &[x${q.TooltipDamageRangeMinMax.from}]~[—][${q.TooltipDamageRangeMinMax.to}]`,
		Effects: [{
			ChangeValue: 3,
			ChangeType: "Absolute",
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipDamageBonus",
				Format: "PercentDelta",
			},
		}, {
			ChangeValue: {
				from: 0.31, // Range: Multiply
				to: 0.31 * 3.34, // ChargeRangeMultiplier: Absolute
			},
			// ChangeType: "Multiply",
			ExtractValue: {
				ExtractAs: "TooltipDamageRangeMinMax",
				// Format: "PercentDelta",
			},
		}, {
			ChangeValue: 0.24,
			ChangeType: "Add",
			ExtractValue: {
				ExtractAs: "TooltipChargeTime",
			},
		}],
		Forbid: [
			"SpearTeleportTrait",
		],
	},
	SpearDashMultiStrike: {
		DisplayName: `Serrated Point`,
		Description: q => `Your {Dash-Strike} hits [${q.TooltipHits}] times, but your {Dash} has &[-${q.TooltipPenalty}%] range.`,
		Effects: [{
			ChangeValue: 3,
			ChangeType: "Absolute",
			ExtractValue: {
				ExtractAs: "TooltipHits",
			},
		}, {
			ChangeValue: 0.75,
			ChangeType: "Multiply",
			ExtractValue: {
				ExtractAs: "TooltipPenalty",
				Format: "NegativePercentDelta",
			},
		}],
	},
	SpearSpinChargeAreaDamageTrait: {
		DisplayName: `Flaring Spin`,
		Description: q => `Charging your {Spin Attack} makes you {Sturdy} and pulse [${q.TooltipDamage}] damage.
{Bullet}Damage Radius: [${q.TooltipDamageRadius}]`,
		Effects: [{
			BaseValue: 40,
			ChangeType: "Absolute",
			ExcludeLinked: true,
			ExtractValue: [{
				ExtractAs: "TooltipDamage",
			}, {
				ExtractAs: "TooltipDamageRadius",
				SkipAutoExtract: true,
				External: true,
				BaseType: "Effect",
				WeaponName: "SpearWeapon",
				BaseName: "SpearWeaponSpinExplosiveChargeWeapon",
				BaseProperty: "DamageRadius",
			}],
		}],
		Forbid: [
			"SpearAutoAttack",
		],
	},
	SpearAttackPhalanxTrait: {
		DisplayName: `Triple Jab`,
		Description: q => `Your {Attack} strikes [3] times in a spread pattern.`,
	},
	SpearSpinTravelDurationTrait: {
		DisplayName: `Winged Serpent`,
		Description: q => `Your {Frost Fair} {Blade Spin} travels for [${percent(q.TooltipDuration)}] longer.`,
		Effects: [{
			ChangeValue: 0.8,
			ExtractValue: {
				ExtractAs: "TooltipDuration",
				Format: "Percent",
			},
		}],
		Required: ['SpearSpinTravel'],
	},
	// ** Heart Seeking Bow **
	BowDoubleShotTrait: {
		DisplayName: `Twin Shot`,
		Description: q => `Your {Attack} fires {2} shots side-by-side, but has reduced range.
{Bullet}Attack Range: &[x${q.TooltipAttackRange}]`,
		Effects: [{
			ChangeValue: 0.65,
			ChangeType: "Multiply",
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipAttackRange",
				// Format: "PercentDelta",
			},
		}],
		Forbid: [
			"BowTripleShotTrait",
			"BowLongRangeDamageTrait",
			"BowDashFanTrait"
		],
	},
	BowLongRangeDamageTrait: {
		DisplayName: `Sniper Shot`,
		Description: q => `Your {Attack} deals [${percent(q.TooltipDamageBonus)}] damage to distant foes.
{Bullet}Range Threshold: [${q.TooltipDistanceThreshold}]`,
		Effects: [{
			BaseValue: 3.0,
			SourceIsMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipDamageBonus",
				Format: "PercentDelta",
			},
		}, {
			ChangeValue: 675,
			ExtractValue: {
				ExtractAs: "TooltipDistanceThreshold",
			},
		}],
		Forbid: ["BowDoubleShotTrait", "BowCloseAttackTrait"],
	},
	BowSlowChargeDamageTrait: {
		DisplayName: `Explosive Shot`,
		Description: q => `Your {Attack} deals [${percent(q.TooltipDamageBonus)}] damage in an area, but charges up slower.
{Bullet}Charge Time: &[x${(q.TooltipChargeTime)}]
{Bullet}Min Charge To Fire: [x${(q.TooltipMinChargeToFire)}]
{Bullet}Damage Radius: [${q.TooltipDamageRadius}]`,
		Effects: [{
			BaseValue: 4,
			SourceIsMultiplier,
			...pom.DuplicateMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipDamageBonus",
				Format: "PercentDelta",
			},
		}, {
			ChangeValue: 2.0,
			ChangeType: "Multiply",
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipChargeTime",
				// Format: "PercentDelta",
				DecimalPlaces: 1,
			},
		}, {
			ChangeValue: 0.5,
			ChangeType: "Multiply",
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipMinChargeToFire",
				// Format: "PercentDelta",
				DecimalPlaces: 1,
			},
		}, {
			ChangeValue: 350,
			ChangeType: "Absolute",
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipDamageRadius",
			},
		}],
		Forbid: ["BowTapFireTrait", "BowChainShotTrait", "BowBeamTrait", "BowDashFanTrait"],
	},
	BowTapFireTrait: {
		DisplayName: `Flurry Shot`,
		Description: q => `Hold {Attack} to shoot rapidly, but you cannot {Power Shot}.
{Bullet}Charge Time: [x${(q.TooltipChargeTime)}]
{Bullet}Min Charge To Fire: [${q.TooltipMinChargeToFire}]
{Bullet}Reload Time: [${q.TooltipReloadTime}]
{Bullet}Clip Size: [${q.TooltipClipSize}]`,
		// Notes: [
		// 	// `(Rama) ChargeTime: [x0.5]`,
		// 	// `ChargeDamageMultiplier: [x0.33]`,
		// ],
		Effects: [{
			ChangeValue: 0.333333,
			ChangeType: "Multiply",
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipChargeTime",
				// Format: "PercentDelta",
				DecimalPlaces: 4,
			},
		}, {
			ChangeValue: 1,
			ChangeType: "Absolute",
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipMinChargeToFire",
				ToFixed,
				DecimalPlaces: 1,
			},
		}, {
			ChangeValue: 0.25,
			ChangeType: "Absolute",
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipReloadTime",
				DecimalPlaces: 2,
			},
		}, {
			ChangeValue: 3,
			ChangeType: "Absolute",
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipClipSize",
			},
		}],
		Forbid: [
			"BowPowerShotTrait", "BowSlowChargeDamageTrait", "BowBeamTrait",
			"BowTransitionTapFireTrait", "BowBondTrait"
		],
	},
	BowPenetrationTrait: {
		DisplayName: `Piercing Volley`,
		Description: q => `Your {Special} pierces foes and deals [${percent(q.TooltipDamageBonus)}] damage to {Armor}.`,
		Effects: [{
			ChangeValue: 5.0,
			ExtractValue: {
				ExtractAs: "TooltipDamageBonus",
				Format: "PercentDelta",
			},
		}],
		Forbid: ["BowBondTrait"],
	},
	BowPowerShotTrait: {
		DisplayName: `Perfect Shot`,
		Description: q => `Your {Power Shot} is easier to execute and deals [${percent(q.TooltipDamageIncrease)}] damage.
{Bullet}Power Shot Window Duration: [x${q.TooltipPerfectChargeWindowDuration}]`,
		// Notes: [
		// 	`PerfectChargeMultiplier: [x2.5]`,
		// 	`PerfectChargeWindowDuration: [x1.6]`,
		// ],
		Effects: [{
			ChangeValue: 2.5,
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipDamageIncrease",
				Format: "PercentDelta",
			},
		}, {
			ChangeValue: 1.6,
			ChangeType: "Multiply",
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipPerfectChargeWindowDuration",
				DecimalPlaces: 1,
			},
		}],
		Forbid: ["BowTapFireTrait", "BowBeamTrait"],
	},
	BowSecondaryBarrageTrait: {
		DisplayName: `Relentless Volley`,
		Description: q => `Your {Special} fires [+${q.TooltipProjectiles}] shots.`,
		Effects: [{
			ChangeValue: 4,
			ChangeType: "Add",
			ExtractValue: {
				ExtractAs: "TooltipProjectiles",
			},
		}],
		Forbid: ["BowSecondaryFocusedFireTrait"],
	},
	BowTripleShotTrait: {
		DisplayName: `Triple Shot`,
		Description: q => `Your {Attack} fires [3] shots in a spread pattern.`,
		Effects: [],
		Forbid: ["BowDoubleShotTrait", "BowDashFanTrait"],
	},
	BowSecondaryFocusedFireTrait: {
		DisplayName: `Charged Volley`,
		// {Bullet}Special Range: [x${q.DisplayDelta3}]
		Description: q => `Hold {Special} for up to [${percent(q.TooltipDamageBonus)}] base damage; minimum range reduced.
{Bullet}Charge Time: [${q.TooltipChargeTime} Sec.]
{Bullet}Special Range: &[x${q.TooltipRange.from}]~[—][${q.TooltipRange.to}]`,
		// Notes: [
		// 	`ChargeTime: [0.6]`,
		// 	`MinChargeToFire: [0.05]`,
		// 	`ChargeRangeMultiplier: [2.0]`,
		// 	`Range: [x0.5]`,
		// ],
		Effects: [{
			ChangeValue: 3.5,
			ChangeType: "Absolute",
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipDamageBonus",
				Format: "PercentDelta",
				DecimalPlaces: 1,
			},
		}, {
			ChangeValue: 0.6,
			ChangeType: "Absolute",
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipChargeTime",
				DecimalPlaces: 1,
			},
		}, {
			ChangeValue: {
				from: 0.5, // Range: Multiply
				to: 0.5 * 2.0, // ChargeRangeMultiplier: Absolute
			},
			ChangeType: "Multiply",
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipRange",
				ToFixed,
				DecimalPlaces: 1,
			},
		}],
		Forbid: ["BowBondTrait", "BowSecondaryBarrageTrait", "BowBeamTrait", "BowMarkHomingTrait"],
	},
	BowChainShotTrait: {
		DisplayName: `Chain Shot`,
		Description: q => `Your {Attack} hits up to [${q.TooltipNumBounces}] foes, dealing [${percent(q.TooltipDamageBonus)}] base damage for each.`,
		Effects: [{
			ChangeValue: 3,
			ChangeType: "Absolute",
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipNumBounces",
			},
		}, {
			ChangeValue: 1.15,
			ChangeType: "Absolute",
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipDamageBonus",
				Format: "PercentDelta",
			},
		}],
		Forbid: ["BowDashFanTrait", "BowSlowChargeDamageTrait"],
	},
	BowCloseAttackTrait: {
		DisplayName: `Point-Blank Shot`,
		// Range Threshold
		Description: q => `Your {Attack} deals [${percent(q.TooltipDamageBonus)}] damage to nearby foes.
{Bullet}Damage Radius: [${q.TooltipProximityThreshold}]`,
		Effects: [{
			BaseValue: 2.5,
			SourceIsMultiplier,
			ExtractValue: {
				ExtractAs: "TooltipDamageBonus",
				Format: "PercentDelta",
			},
		}, {
			ChangeValue: 330,
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipProximityThreshold",
			},
		}],
		Forbid: ["BowLongRangeDamageTrait"],
	},
	BowConsecutiveBarrageTrait: {
		DisplayName: `Point-Blank Shot`,
		Description: q => `Your {Special} deals [+${q.TooltipDamage}] base damage for each consecutive hit to a foe.`,
		Effects: [{
			ChangeValue: 3,
			ChangeType: "Absolute",
			ExtractValue: {
				ExtractAs: "TooltipDamage",
			},
		}],
		Forbid: ["BowBondTrait"],
	},
	BowBondBoostTrait: {
		DisplayName: `Repulse Shot`,
		Description: q => `Your {Celestial Sharanga} {Attack} creates a {Blast Wave} around you.`,
		Forbid: ["BowBondBoostTrait"],
		Required: ['BowBondTrait'],
	},
	// ** Twin Fists **
	FistDashAttackHealthBufferTrait: {
		DisplayName: `Breaching Cross`,
		Description: q => `Your {Dash-Strike} pierces foes and deals [${percent(q.TooltipDamageIncrease)}] damage to {Armor}.`,
		Effects: [{
			ChangeValue: 10,
			ExtractValue: {
				ExtractAs: "TooltipDamageIncrease",
				Format: "PercentDelta",
			},
		}],
	},
	FistAttackFinisherTrait: {
		DisplayName: `Rolling Knuckle`,
		Description: q => `Your {Dash-Strike} deals [+${q.TooltipDamageIncrease}%] damage; added to {Attack} sequence.`,
		Notes: [
			`Performs the Dash-Strike in place without moving Zagreus.`,
			`Allows chaining from one combo immediately to the next.`,
		],
		Effects: [{
			ChangeValue: 1.6,
			ExtractValue: {
				ExtractAs: "TooltipDamageIncrease",
				Format: "PercentDelta",
			},
		}],
		Forbid: [
			"FistChargeAttackTrait",
			"FistHeavyAttackTrait",
			"FistDetonateTrait",
		],
	},
	FistReachAttackTrait: {
		DisplayName: `Long Knuckle`,
		Description: q => `Your {Attack} has more range and deals [${percent(q.TooltipDamageIncrease)}] damage.
{Bullet}Range: [${q.TooltipRange}]`,
		Effects: [{
			ChangeValue: 1.10,
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipDamageIncrease",
				Format: "PercentDelta",
			},
		}, {
			ChangeValue: 650,
			ChangeType: "Absolute",
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipRange",
			},
		}],
		Forbid: [
			"FistDetonateTrait",
		],
	},
	FistKillTrait: {
		DisplayName: `Draining Cutter`,
		Description: q => `Whenever your {Special} slays foes, restore [${q.TooltipHeal}%] {Health_Small}.`,
		Effects: [{
			ChangeValue: 0.02,
			ExtractValue: {
				ExtractAs: "TooltipHeal",
				Format: "Percent",
			},
		}],
	},
	FistConsecutiveAttackTrait: {
		DisplayName: `Concentrated Knuckle`,
		Description: q => `Your {Attack} deals [+${q.TooltipDamage}] base damage for each consecutive hit to a foe.`,
		Notes: [
			`Resets whenever a combo is broken, including after the final hit of a combo,<br/>meaning this lasts for a maximum of [5] attacks.`
		],
		Effects: [{
			ChangeValue: 5,
			ChangeType: "Absolute",
			ExtractValue: {
				ExtractAs: "TooltipDamage",
			},
		}],
	},
	FistDoubleDashSpecialTrait: {
		DisplayName: `Explosive Upper`,
		Description: q => `Your {Dash-Upper} deals [${percent(q.TooltipDamageIncrease)}] damage in an area.
{Bullet}Damage Radius: [${q.TooltipDamageRadius}]`,
		Effects: [{
			ChangeValue: 2.0,
			ExtractValue: {
				ExtractAs: "TooltipDamageIncrease",
				Format: "PercentDelta",
			},
		}, {
			ChangeValue: 450,
			ChangeType: "Absolute",
			ExtractValue: {
				ExtractAs: "TooltipDamageRadius",
			},
		}],
		Forbid: [
			"FistSpecialFireballTrait",
		],
	},
	FistChargeSpecialTrait: {
		// Hmm, I haven't found "for longer range" data
		DisplayName: `Flying Cutter`,
		Description: q => `Hold {Special} for longer range and up to [${percent(q.TooltipDamageBonus)}] base damage.
{Bullet}Charge Time: [${q.TooltipChargeTime} Sec.]`,
		Effects: [{
			ChangeValue: 2.0,
			ChangeType: "Absolute",
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipDamageBonus",
				Format: "PercentDelta",
			},
		}, {
			ChangeValue: 0.4,
			ChangeType: "Absolute",
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipChargeTime",
				DecimalPlaces: 1,
			},
		}],
		Forbid: [
			"FistTeleportSpecialTrait",
			"FistVacuumTrait",
			"FistSpecialFireballTrait",
		],
	},
	FistTeleportSpecialTrait: {
		DisplayName: `Rush Kick`,
		Description: q => `Your {Special} becomes a flying kick that deals [${q.TooltipDamage}] base damage twice.
{Bullet}Charge Time: [${q.TooltipChargeTime} Sec.]
{Bullet}Range: [${q.TooltipRange}]`,
		Notes: [
			`Can cross gaps and low barriers when targeting enemies across them`,
		],
		Effects: [{
			ChangeValue: 40,
			ChangeType: "Absolute",
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipDamage",
			},
		}, {
			ChangeValue: 0.26,
			ChangeType: "Absolute",
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipChargeTime",
				DecimalPlaces: 2,
			},
		}, {
			ChangeValue: 600,
			ChangeType: "Absolute",
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipRange",
			},
		}],
		Forbid: [
			"FistVacuumTrait",
			"FistChargeSpecialTrait",
			"FistSpecialFireballTrait",
		],
	},
	FistSpecialLandTrait: {
		DisplayName: `Quake Cutter`,
		Description: q => `After using your {Special}, deal [${q.TooltipDamage}] damage in an area where you land.
{Bullet}Damage Radius: [${q.TooltipDamageRadius}]`,
		// Projectile.FistWeaponLandAreaAttack
		Effects: [{
			BaseValue: 90,
			ChangeType: "Absolute",
			ExcludeLinked: true,
			ExtractValue: [{
				ExtractAs: "TooltipDamage",
			}, {
				ExtractAs: "TooltipDamageRadius",
				External: true,
				BaseType: "ProjectileBase",
				BaseName: "FistWeaponLandAreaAttack",
				BaseProperty: "DamageRadius",
			}],
		}],
		Forbid: [
			"FistWeaveTrait",
			"FistSpecialFireballTrait",
		],
	},
	FistSpecialFireballTrait: {
		DisplayName: `Kinetic Launcher`,
		Description: q => `Your {Special} becomes a charged shot that deals [${q.TooltipDamage}] base damage.
{Bullet}Damage Radius: [${q.TooltipDamageRadius}]
{Bullet}Charge Time: [${q.TooltipChargeTime} Sec.]
{Bullet}Charge Range: [${q.DisplayDelta7}]
{Bullet}Special Projectiles: &[${q.TooltipNumProjectiles}]
{Bullet}Perfect Charge Window Duration: [${q.TooltipPerfectChargeWindowDuration} Sec.]
{Bullet}Perfect Charge Speed: [${percent(q.TooltipPerfectChargeSpeedMultiplier)}]
{Bullet}Perfect Charge Damage: [${percent(q.TooltipDamageIncrease)}]`,
		Effects: [{
			ChangeValue: 50,
			ChangeType: "Absolute",
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipDamage",
			},
		}, {
			ChangeValue: 180,
			ChangeType: "Absolute",
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipDamageRadius",
			},
		}, {
			ChangeValue: 0.5,
			ChangeType: "Absolute",
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipChargeTime",
				DecimalPlaces: 1,
			},
		}, {
			ChangeValue: -1,
			ChangeType: "Add",
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipNumProjectiles",
			},
		}, {
			ChangeValue: 0.15,
			ChangeType: "Absolute",
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipPerfectChargeWindowDuration",
				DecimalPlaces: 2,
			},
		}, {
			ChangeValue: 2.0,
			ChangeType: "Absolute",
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipPerfectChargeSpeedMultiplier",
				Format: "PercentDelta",
			},
		}, {
			ChangeValue: {
				from: 100, // Range
				to: 100 * 9, // ChargeRangeMultiplier
			},
			ChangeType: "Absolute",
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipRange",
			},
		}, {
			ChangeValue: 1.5, // PerfectChargeMultiplier
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipDamageIncrease",
				Format: "PercentDelta",
			},
		}],
		Forbid: [
			"FistDetonateTrait", // Aspect of Gilgamesh
			"FistTeleportSpecialTrait",
			"FistChargeSpecialTrait",
			"FistVacuumTrait", // Aspect of Talos
			"FistDoubleDashSpecialTrait",
			"FistSpecialLandTrait",
		],
	},
	FistHeavyAttackTrait: {
		DisplayName: `Heavy Knuckle`,
		Description: q => `Your {Attack} becomes a [3]-hit sequence; each deals [${q.TooltipDamage}] base damage.
{Bullet}Charge Time: &[x1.05]; &[x1.05]; &[x1.6]
{Bullet}Cooldown: &[0.5 Sec.]`,
		Effects: [{
			ChangeValue: 40,
			ChangeType: "Absolute",
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipDamage",
			},
		}],
		Forbid: [
			"FistAttackFinisherTrait",
			"FistDetonateTrait",
		],
	},
	FistAttackDefenseTrait: {
		DisplayName: `Colossus Knuckle`,
		Description: q => `While using your {Attack} or {Special}, you are {Sturdy}.`,
	},
	FistDetonateBoostTrait: {
		DisplayName: `Rending Claws`,
		Description: q => `{Maim}-afflicted foes take [${percent(q.TooltipDamage)}] damage and move [${q.TooltipSlowBonus}%] slower.`,
		Effects: [{
			ChangeValue: -0.3,
			ChangeType: "Add",
			ExtractValue: {
				ExtractAs: "TooltipSlowBonus",
				Format: "Percent",
				AbsoluteValue: true,
			},
		}, {
			ChangeValue: 0.25,
			ChangeType: "Add",
			ExtractValue: {
				ExtractAs: "TooltipDamage",
				Format: "Percent",
			},
		}],
		Required: [
			"FistDetonateTrait",
		],
	},
	// ** Adamant Rail **
	GunMinigunTrait: {
		DisplayName: `Flurry Fire`,
		Description: q => `Your {Attack} is faster and more accurate; gain [+${q.TooltipAmmo}] {GunAmmo_Small}.
{Bullet}Attack Cooldown: [x${q.TooltipCooldown}]`,
		// Notes: [
		// 	`Reduce Attack cooldown to [60%]`,
		// ],
		Effects: [{
			ChangeValue: 6,
			ChangeType: "Add",
			ExtractValue: {
				ExtractAs: "TooltipAmmo",
			},
		}, {
			ChangeValue: 0.6,
			ChangeType: "Multiply",
			ExtractValue: {
				ExtractAs: "TooltipCooldown",
				// Format: "NegativePercentDelta",
			},
		}],
		Forbid: [
			"GunInfiniteAmmoTrait",
			"GunShotgunTrait",
			"GunSniperTrait",
			"GunLoadedGrenadeTrait",
		],
	},
	GunChainShotTrait: {
		DisplayName: `Ricochet Fire`,
		Description: q => `Your {Attack} bounces to [+${q.TooltipNumBounces}] additional foe.`,
		Effects: [{
			ChangeValue: 1,
			ChangeType: "Absolute",
			ExtractValue: {
				ExtractAs: "TooltipNumBounces",
			},
		}],
		Forbid: [
			"GunShotgunTrait",
			"GunLoadedGrenadeTrait",
			"GunHomingBulletTrait",
			"GunHeavyBulletTrait",
		],
	},
	GunShotgunTrait: {
		DisplayName: `Spread Fire`,
		Description: q => `Your {Attack} deals [${q.TooltipDamage}] base damage in a short spread; you have &[${q.TooltipAmmo}] {GunAmmo_Small}.
{Bullet}Attack Cooldown: &[x${q.TooltipCooldown}]
{Bullet}Attack Range: &[${q.TooltipRange}]
{Bullet}Can't Walk (After Attack) Duration: &[x${q.TooltipGunDisableCancellable}]
{Bullet}Damage Radius: [${q.TooltipDamageRadius}]`,
		Effects: [{
			ChangeValue: 40,
			ChangeType: "Absolute",
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipDamage",
			},
		}, {
			ChangeValue: -6,
			ChangeType: "Add",
			ExtractValue: {
				ExtractAs: "TooltipAmmo",
			},
		}, {
			ChangeValue: 1.5,
			ChangeType: "Multiply",
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipCooldown",
				// Format: "PercentDelta",
			},
		}, {
			ChangeValue: 1.4,
			ChangeType: "Multiply",
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipGunDisableCancellable",
				// Format: "PercentDelta",
			},
		}, {
			ChangeValue: 170,
			ChangeType: "Absolute",
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipDamageRadius",
			},
		}, {
			ChangeValue: 320,
			ChangeType: "Absolute",
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipRange",
			},
		}],
		Forbid: [
			"GunSniperTrait",
			"GunInfiniteAmmoTrait",
			"GunMinigunTrait",
			"GunConsecutiveFireTrait",
			"GunChainShotTrait",
			"GunLoadedGrenadeTrait",
			"GunHomingBulletTrait",
		],
	},
	GunHeavyBulletTrait: {
		DisplayName: `Explosive Fire`,
		Description: q => `Your {Attack} deals damage in an area and briefly slows foes.
{Bullet}Damage Radius: [${q.TooltipDamageRadius}]`,
		Effects: [{
			ChangeValue: 275,
			ChangeType: "Absolute",
			ExtractValue: {
				ExtractAs: "TooltipDamageRadius",
			},
		}],
		Forbid: [
			"GunArmorPenerationTrait",
			"GunLoadedGrenadeTrait",
			"GunChainShotTrait",
		],
	},
	GunInfiniteAmmoTrait: {
		DisplayName: `Delta Chamber`,
		Description: q => `Your {Attack} is a [3]-round burst; you never have to {Reload}.
{Bullet}Attack Cooldown: [${q.TooltipCooldown} Sec.]
{Bullet}Burst Cooldown: [${q.TooltipClipRegenInterval} Sec.]`,
		// Notes: [
		// 	`Cooldown between each shot: decreased to [0.035 Sec.]`,
		// 	`Cooldown between bursts of fire: [0.5 Sec.]`,
		// ],
		Effects: [{
			ChangeValue: 0.035,
			ChangeType: "Absolute",
			ExtractValue: {
				ExtractAs: "TooltipCooldown",
				DecimalPlaces: 3,
			},
		}, {
			ChangeValue: 0.5,
			ChangeType: "Absolute",
			ExtractValue: {
				ExtractAs: "TooltipClipRegenInterval",
				DecimalPlaces: 1,
			},
		}],
		Forbid: [
			"GunShotgunTrait",
			"GunSniperTrait",
			"GunMinigunTrait",
			"GunConsecutiveFireTrait",
			"GunLoadedGrenadeTrait",
			"GunFinalBulletTrait",
		],
	},
	GunArmorPenerationTrait: {
		DisplayName: `Piercing Fire`,
		Description: q => `Your {Attack} pierces foes and deals [${percent(q.TooltipDamageIncrease)}] damage to {Armor}.`,
		// Notes: [
		// 	`Makes the {Attack} {Unblockable} and {Piercing}`,
		// ],
		Effects: [{
			ChangeValue: 1.5,
			ExtractValue: {
				ExtractAs: "TooltipDamageIncrease",
				Format: "PercentDelta",
			},
		}],
		Forbid: [
			"GunHeavyBulletTrait",
			"GunHomingBulletTrait",
		],
	},
	GunGrenadeFastTrait: {
		DisplayName: `Triple Bomb`,
		Description: q => `You can use your {Special} [${q.TooltipClip}] times in rapid succession.
{Bullet}Special Cooldown: [${q.TooltipClipRegenInterval} Sec.]`,
		Effects: [{
			ChangeValue: 3,
			ChangeType: "Absolute",
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipClip",
			},
		}, {
			ChangeValue: 1.5,
			ChangeType: "Absolute",
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipClipRegenInterval",
				DecimalPlaces: 1,
			},
		}],
		Forbid: [
			"GunGrenadeClusterTrait",
			"GunGrenadeDropTrait",
		],
	},
	GunExplodingSecondaryTrait: {
		DisplayName: `Rocket Bomb`,
		Description: q => `Your {Special} becomes a rocket that deals [${q.TooltipDamage}] base damage.
{Bullet}Range: [${q.TooltipRange}]
{Bullet}Damage Radius: [${q.TooltipDamageRadius}]`,
		Effects: [{
			ChangeValue: 1000,
			ChangeType: "Absolute",
			ExtractValue: {
				ExtractAs: "TooltipRange",
			},
		}, {
			ChangeValue: 360,
			ChangeType: "Absolute",
			ExtractValue: {
				ExtractAs: "TooltipDamageRadius",
			},
		}, {
			ChangeValue: 80,
			ChangeType: "Absolute",
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipDamage",
			},
		}],
		Forbid: [
			"GunGrenadeDropTrait",
			"GunLoadedGrenadeTrait",
		],
	},
	GunSlowGrenade: {
		// LegalOnFireWeapons Projectile.GunGrenadeToss
		DisplayName: `Targeting System`,
		Description: q => `Foes targeted by your {Special} move slower and take [${percent(q.TooltipDamageTaken)}] damage.
{Bullet}Movement Speed: [${percent(q.TooltipSlow)}]
{Bullet}Duration: [${q.TooltipDuration} Sec.]
{Bullet}Vulnerability & Slow Radius: [${q.TooltipDamageRadius}]
{Bullet}*${dname('GunLoadedGrenadeTrait')}* Vulnerability & Slow Radius: &[${percent(q.Tooltip_GunLoadedGrenadeTrait_DamageRadius)}]
{Bullet}*${dname('GunGrenadeDropTrait')}* Vulnerability & Slow Radius: [${percent(q.Tooltip_GunGrenadeDropTrait_DamageRadius)}]
{Bullet}&[BUG]: *${dname('GunLoadedGrenadeTrait')}* doesn't work as you'd expect.<br/>Effect only applies in a moment when grenade touches the ground.<br/>{Igneus Eden Hellfire & Blast} don't reapply the effect.`,
		// Projectile.GunSlowWeapon
		// Projectile.GunVulnerabilityWeapon
		Effects: [{
			ChangeValue: 0.7,
			ChangeType: "Multiply",
			ExtractValue: [{
				ExtractAs: "TooltipSlow",
				Format: "PercentDelta",
			}, {
				ExtractAs: "TooltipDamageRadius",
				External: true,
				BaseType: "ProjectileBase",
				BaseName: "GunVulnerabilityWeapon",
				BaseProperty: "DamageRadius",
			}, {
				ExtractAs: "TooltipDuration",
				External: true,
				BaseType: "ProjectileBase",
				BaseName: "GunVulnerabilityWeapon",
				BaseProperty: "Duration",
			}],
		}, {
			ChangeValue: 0.30,
			ChangeType: "Add",
			ExtractValue: {
				ExtractAs: "TooltipDamageTaken",
				Format: "Percent",
			},
		}, {
			ChangeValue: 0.5,
			ChangeType: "Multiply",
			ExtractValue: {
				ExtractAs: "Tooltip_GunLoadedGrenadeTrait_DamageRadius",
				Format: "PercentDelta",
			},
		}, {
			ChangeValue: 1.5,
			ChangeType: "Multiply",
			ExtractValue: {
				ExtractAs: "Tooltip_GunGrenadeDropTrait_DamageRadius",
				Format: "PercentDelta",
			},
		}],
		Forbid: [
			// ! BUG: LegalOnFireWeapons = { "GunGrenadeToss" },
			// ! but lucifer radiation and explosion are different weapons
			// 'GunLoadedGrenadeTrait',
		],
	},
	GunGrenadeDropTrait: {
		DisplayName: `Hazard Bomb`,
		Description: q => `Your {Special} deals [${percent(q.TooltipDamage)}] base damage in a large area; it can hurt *you*.
{Bullet}Damage Radius: [${percent(q.TooltipDamageRadius)}]
{Bullet}Damage to Zagreus: &[1%]`,
		// Notes: [
		// 	`Increase damage radius to [145%]`,
		// 	`The damage bonus is multiplicative.`,
		// 	`Deals [1%] damage to Zag himself`,
		// ],
		Effects: [{
			ChangeValue: 1.45,
			ChangeType: "Multiply",
			ExtractValue: {
				ExtractAs: "TooltipDamageRadius",
				Format: "PercentDelta",
			},
		}, {
			ChangeValue: 4.0,
			ChangeType: "Multiply",
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipDamage",
				Format: "PercentDelta",
			},
		}],
		Forbid: [
			"GunGrenadeFastTrait",
			"GunGrenadeClusterTrait",
			"GunExplodingSecondaryTrait",
			"GunLoadedGrenadeTrait",
		],
	},
	GunGrenadeClusterTrait: {
		DisplayName: `Cluster Bomb`,
		// Meh, why did those stupid supergiants had to do NegativePercentDelta and then treat it as negative value?
		Description: q => `Your {Special} fires a spread of [${q.TooltipProjectiles}] bombs, but each deals &[-${q.TooltipDamagePenalty}%] damage.
{Bullet}Damage Radius: &[${q.TooltipDamageRadius}]`,
		Notes: [
			`If used with {Rocket Bomb}, [5] rockets are fired in a [150°] spread<br/>over about a second, firing right to left`,
		],
		Effects: [{
			ChangeValue: 5,
			ChangeType: "Absolute",
			ExtractValue: {
				ExtractAs: "TooltipProjectiles",
			},
		}, {
			ChangeValue: 350,
			ChangeType: "Absolute",
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipDamageRadius",
			},
		}, {
			ChangeValue: 0.7,
			ChangeType: "Multiply",
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipDamagePenalty",
				Format: "NegativePercentDelta",
			},
		}],
		Forbid: [
			"GunGrenadeFastTrait",
			"GunGrenadeDropTrait",
			"GunLoadedGrenadeTrait",
		],
	},
	GunHomingBulletTrait: {
		DisplayName: `Seeking Fire`,
		Description: q => `Your {Attack} seeks the nearest foe and deals [${percent(q.TooltipDamageIncrease)}] damage.
{Bullet}Attack Range: [${percent(q.TooltipRange)}]`,
		Effects: [{
			ChangeValue: 1.1,
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipDamageIncrease",
				Format: "PercentDelta",
			},
		}, {
			ChangeValue: 1.15,
			ChangeType: "Multiply",
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipRange",
				Format: "PercentDelta",
			},
		}],
		Forbid: [
			"GunLoadedGrenadeTrait",
			"GunArmorPenerationTrait",
			"GunChainShotTrait",
			"GunShotgunTrait",
		],
	},
	GunLoadedGrenadeLaserTrait: {
		DisplayName: `Concentrated Beam`,
		Description: q => `Your {Igneus Eden} {Attack} damage to a foe ramps up [${percent(q.TooltipDamageIncrease)}] faster.`,
		Effects: [{
			ChangeValue: 0.75 / 0.75,
			ChangeType: "Add",
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipDamageIncrease",
				Format: "Percent",
			},
		}],
		Forbid: ["GunLoadedGrenadeInfiniteAmmoTrait"],
		Required: ["GunLoadedGrenadeTrait"],
	},
	GunLoadedGrenadeSpeedTrait: {
		DisplayName: `Flash Fire`,
		Description: q => `Your {Igneus Eden} {Attack} starts firing [${percent(q.TooltipSpeedIncrease)}] faster with [${percent(q.TooltipRange)}] range.`,
		Effects: [{
			ChangeValue: 0.50,
			ChangeType: "Multiply",
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipSpeedIncrease",
				Format: "NegativePercentDelta",
			},
		}, {
			ChangeValue: 1.15,
			ChangeType: "Multiply",
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipRange",
				Format: "PercentDelta",
			},
		}],
		Required: ["GunLoadedGrenadeTrait"],
	},
	GunLoadedGrenadeWideTrait: {
		DisplayName: `Triple Beam`,
		Description: q => `Your {Igneus Eden} {Attack} fires [${q.TooltipBeams}] beams in a spread pattern.`,
		Effects: [{
			ChangeValue: 3,
			ChangeType: "Absolute",
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipBeams",
			},
		}],
		Required: ["GunLoadedGrenadeTrait"],
	},
	GunLoadedGrenadeInfiniteAmmoTrait: {
		DisplayName: `Eternal Chamber`,
		Description: q => `Your {Igneus Eden} has [∞] {LaserAmmo_Small}, but its damage no longer ramps.`,
		Forbid: ["GunLoadedGrenadeLaserTrait"],
		Required: ["GunLoadedGrenadeTrait"],
	},
	GunLoadedGrenadeBoostTrait: {
		DisplayName: `Greater Inferno`,
		Description: q => `Your {Igneus Eden Hellfire} radiates [${percent(q.TooltipDamage)}] damage in a larger area.
{Bullet}Radiation Damage Radius: [${percent(q.TooltipAoE)}]`,
		Effects: [{
			ChangeValue: 1.50,
			ChangeType: "Multiply",
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipAoE",
				Format: "PercentDelta",
			},
		}, {
			ChangeValue: 2.5,
			ChangeType: "Multiply",
			ExcludeLinked: true,
			ExtractValue: {
				ExtractAs: "TooltipDamage",
				Format: "Percent",
			},
		}],
		Required: ["GunLoadedGrenadeTrait"],
	},
	// Extra
	ForcePoseidonBoonTrait: {
		DisplayName: `Conch Shell`,
		Icon: 'Keepsake_Conch_Shell',
		IsKeepsake: true,
	},
	FastClearDodgeBonusTrait: {
		DisplayName: `Lambent Plume`,
		Icon: 'Keepsake_Lambent_Plume',
		IsKeepsake: true,
	},
	AmmoMetaUpgrade: { // AmmoSupply
		DisplayName: `Infernal Soul`,
		Icon: 'Mirror_Infernal_Soul',
		IsMirror: true,
	},
	ReloadAmmoMetaUpgrade: { // AmmoReload
		DisplayName: `Stygian Soul`,
		Icon: 'Mirror_Stygian_Soul',
		IsMirrorB: true,
	},
	BackstabMetaUpgrade: { // SneakAttack
		DisplayName: `Shadow Presence`,
		Icon: 'Mirror_Shadow_Presence',
		IsMirror: true,
	},
	FirstStrikeMetaUpgrade: {
		DisplayName: `Fiery Presence`,
		Icon: 'Mirror_Fiery_Presence',
		IsMirrorB: true,
	},
	// Aspects
	GunGrenadeSelfEmpowerTrait: {
		DisplayName: `Aspect of Eris`,
		WeaponAspect: true,
	},
	GunManualReloadTrait: {
		DisplayName: `Aspect of Hestia`,
		WeaponAspect: true,
	},
	GunLoadedGrenadeTrait: {
		DisplayName: `Aspect of Lucifer`,
		WeaponAspect: true,
	},
	FistVacuumTrait: {
		DisplayName: `Aspect of Talos`,
		WeaponAspect: true,
	},
	FistWeaveTrait: {
		DisplayName: `Aspect of Demeter`,
		WeaponAspect: true,
	},
	FistDetonateTrait: {
		DisplayName: `Aspect of Gilgamesh`,
		WeaponAspect: true,
	},
	BowMarkHomingTrait: {
		DisplayName: `Aspect of Chiron`,
		WeaponAspect: true,
	},
	BowMarkHomingTrait: {
		DisplayName: `Aspect of Chiron`,
		WeaponAspect: true,
	},
	BowLoadAmmoTrait: {
		DisplayName: `Aspect of Hera`,
		WeaponAspect: true,
	},
	BowBondTrait: {
		DisplayName: `Aspect of Rama`,
		WeaponAspect: true,
	},
	ShieldRushBonusProjectileTrait: {
		DisplayName: `Aspect of Chaos`,
		WeaponAspect: true,
	},
	ShieldTwoShieldTrait: {
		DisplayName: `Aspect of Zeus`,
		WeaponAspect: true,
	},
	ShieldLoadAmmoTrait: {
		DisplayName: `Aspect of Beowulf`,
		WeaponAspect: true,
	},
	SpearTeleportTrait: {
		DisplayName: `Aspect of Achilles`,
		WeaponAspect: true,
	},
	SpearWeaveTrait: {
		DisplayName: `Aspect of Hades`,
		WeaponAspect: true,
	},
	SpearSpinTravel: {
		DisplayName: `Aspect of Guan Yu`,
		WeaponAspect: true,
	},
	SwordCriticalParryTrait: {
		DisplayName: `Aspect of Nemesis`,
		WeaponAspect: true,
	},
	DislodgeAmmoTrait: {
		DisplayName: `Aspect of Poseidon`,
		WeaponAspect: true,
	},
	SwordConsecrationTrait: {
		DisplayName: `Aspect of Arthur`,
		WeaponAspect: true,
	},
	// ExtraExtraExtra
	// [[Outdated Crap]]
	// BowBeamTrait
	// BowDashFanTrait
	// BowTransitionTapFireTrait
	// FistChargeAttackTrait
	// GunConsecutiveFireTrait
	// GunFinalBulletTrait
	// GunSniperTrait
	// MultiLaserTrait
	// ShieldRushPunchTrait
	// ShieldThrowGrindTrait
	// ShieldThrowSingleTargetTrait
	// SwordSecondaryBlinkTrait
	// SwordThirdStrikeChargeTrait
};
const Gods = {
	Aphrodite: {
		Attack: 'AphroditeWeaponTrait',
		Special: 'AphroditeSecondaryTrait',
		Cast: 'AphroditeRangedTrait',
		CastBeowulf: 'ShieldLoadAmmo_AphroditeRangedTrait',
		Dash: 'AphroditeRushTrait',
		Call: 'AphroditeShoutTrait',
		Tier1: [
			'AphroditeDeathTrait',
			'AphroditeRetaliateTrait',
			'HealthRewardBonusTrait',
			'ProximityArmorTrait',
		],
		Tier2: [
			'AphroditeDurationTrait',
			'AphroditePotencyTrait',
			'AphroditeRangedBonusTrait',
			'AphroditeWeakenTrait',
		],
		Tier3: [
			'CharmTrait',
		],
		Duo: {
			Ares: 'CurseSickTrait',
			Artemis: 'HeartsickCritDamageTrait',
			Athena: 'CastBackstabTrait',
			Demeter: 'SelfLaserTrait',
			Dionysus: 'DionysusAphroditeStackIncreaseTrait',
			Poseidon: 'ImprovedPomTrait',
			Zeus: 'RegeneratingCappedSuperTrait',
		},
	},
	Ares: {
		Attack: 'AresWeaponTrait',
		Special: 'AresSecondaryTrait',
		Cast: 'AresRangedTrait',
		CastBeowulf: 'ShieldLoadAmmo_AresRangedTrait',
		Dash: 'AresRushTrait',
		Call: 'AresShoutTrait',
		Tier1: [
			'AresRetaliateTrait',
			'IncreasedDamageTrait',
			'LastStandDamageBonusTrait',
			'OnEnemyDeathDamageInstanceBuffTrait',
		],
		Tier2: [
			'AresAoETrait',
			'AresDragTrait',
			'AresLoadCurseTrait',
			'AresLongCurseTrait',
		],
		Tier3: [
			'AresCursedRiftTrait',
		],
		Duo: {
			Aphrodite: 'CurseSickTrait',
			Artemis: 'AresHomingTrait',
			Athena: 'TriggerCurseTrait',
			Demeter: 'StationaryRiftTrait',
			Dionysus: 'PoisonTickRateTrait',
			Poseidon: 'PoseidonAresProjectileTrait',
			Zeus: 'AutoRetaliateTrait',
		},
	},
	Artemis: {
		Attack: 'ArtemisWeaponTrait',
		Special: 'ArtemisSecondaryTrait',
		Cast: 'ArtemisRangedTrait',
		CastBeowulf: 'ShieldLoadAmmo_ArtemisRangedTrait',
		Dash: 'ArtemisRushTrait',
		Call: 'ArtemisShoutTrait',
		Tier1: [
			'CritBonusTrait',
		],
		Tier2: [
			'ArtemisAmmoExitTrait',
			'ArtemisCriticalTrait',
			'ArtemisSupportingFireTrait',
			'CriticalBufferMultiplierTrait',
			'CriticalSuperGenerationTrait',
			'CritVulnerabilityTrait',
		],
		Tier3: [
			'MoreAmmoTrait',
		],
		Duo: {
			Aphrodite: 'HeartsickCritDamageTrait',
			Ares: 'AresHomingTrait',
			Athena: 'ArtemisReflectBuffTrait',
			Demeter: 'HomingLaserTrait',
			Dionysus: 'PoisonCritVulnerabilityTrait',
			Poseidon: 'ArtemisBonusProjectileTrait',
			Zeus: 'AmmoBoltTrait',
		},
	},
	Athena: {
		Attack: 'AthenaWeaponTrait',
		Special: 'AthenaSecondaryTrait',
		Cast: 'AthenaRangedTrait',
		CastBeowulf: 'ShieldLoadAmmo_AthenaRangedTrait',
		Dash: 'AthenaRushTrait',
		Call: 'AthenaShoutTrait',
		Tier1: [
			'AthenaRetaliateTrait',
			'EnemyDamageTrait',
			'TrapDamageTrait',
		],
		Tier2: [
			'LastStandDurationTrait',
			'LastStandHealTrait',
			'PreloadSuperGenerationTrait',
			'AthenaBackstabDebuffTrait',
			'AthenaShieldTrait',
		],
		Tier3: [
			'ShieldHitTrait',
		],
		Duo: {
			Aphrodite: 'CastBackstabTrait',
			Ares: 'TriggerCurseTrait',
			Artemis: 'ArtemisReflectBuffTrait',
			Demeter: 'NoLastStandRegenerationTrait',
			Dionysus: 'SlowProjectileTrait',
			Poseidon: 'StatusImmunityTrait',
			Zeus: 'ReboundingAthenaCastTrait',
		},
	},
	Demeter: {
		Attack: 'DemeterWeaponTrait',
		Special: 'DemeterSecondaryTrait',
		Cast: 'DemeterRangedTrait',
		CastBeowulf: 'ShieldLoadAmmo_DemeterRangedTrait',
		Dash: 'DemeterRushTrait',
		Call: 'DemeterShoutTrait',
		Tier1: [
			'DemeterRetaliateTrait',
			'HarvestBoonTrait',
			'HealingPotencyTrait',
			'ZeroAmmoBonusTrait',
		],
		Tier2: [
			'CastNovaTrait',
			'DemeterRangedBonusTrait',
			'MaximumChillBlast',
			'MaximumChillBonusSlow',
		],
		Tier3: [
			'InstantChillKill',
		],
		Duo: {
			Aphrodite: 'SelfLaserTrait',
			Ares: 'StationaryRiftTrait',
			Artemis: 'HomingLaserTrait',
			Athena: 'NoLastStandRegenerationTrait',
			Dionysus: 'IceStrikeArrayTrait',
			Poseidon: 'BlizzardOrbTrait',
			Zeus: 'JoltDurationTrait',
		},
	},
	Dionysus: {
		Attack: 'DionysusWeaponTrait',
		Special: 'DionysusSecondaryTrait',
		Cast: 'DionysusRangedTrait',
		CastBeowulf: 'ShieldLoadAmmo_DionysusRangedTrait',
		Dash: 'DionysusRushTrait',
		Call: 'DionysusShoutTrait',
		Tier1: [
			'GiftHealthTrait',
			'DoorHealTrait',
			'FountainDamageBonusTrait',
			'LowHealthDefenseTrait',
		],
		Tier2: [
			'DionysusDefenseTrait',
			'DionysusPoisonPowerTrait',
			'DionysusSlowTrait',
			'DionysusSpreadTrait',
		],
		Tier3: [
			'DionysusComboVulnerability',
		],
		Duo: {
			Aphrodite: 'DionysusAphroditeStackIncreaseTrait',
			Ares: 'PoisonTickRateTrait',
			Artemis: 'PoisonCritVulnerabilityTrait',
			Athena: 'SlowProjectileTrait',
			Demeter: 'IceStrikeArrayTrait',
			Poseidon: 'RaritySuperBoost',
			Zeus: 'LightningCloudTrait',
		},
	},
	Poseidon: {
		Attack: 'PoseidonWeaponTrait',
		Special: 'PoseidonSecondaryTrait',
		Cast: 'PoseidonRangedTrait',
		CastBeowulf: 'ShieldLoadAmmo_PoseidonRangedTrait',
		Dash: 'PoseidonRushTrait',
		Call: 'PoseidonShoutTrait',
		Tier1: [
			'DefensiveSuperGenerationTrait',
			'EncounterStartOffenseBuffTrait',
			'PoseidonPickedUpMinorLootTrait', // 'RandomMinorLootDrop',
			'RoomRewardBonusTrait',
		],
		Tier2: [
			'BonusCollisionTrait',
			'BossDamageTrait',
			'PoseidonShoutDurationTrait',
			'SlamExplosionTrait',
			'SlipperyTrait',
		],
		Tier3: [
			'DoubleCollisionTrait',
			'FishingTrait',
		],
		Duo: {
			Aphrodite: 'ImprovedPomTrait',
			Ares: 'PoseidonAresProjectileTrait',
			Artemis: 'ArtemisBonusProjectileTrait',
			Athena: 'StatusImmunityTrait',
			Demeter: 'BlizzardOrbTrait',
			Dionysus: 'RaritySuperBoost',
			Zeus: 'ImpactBoltTrait',
		},
	},
	Zeus: {
		Attack: 'ZeusWeaponTrait',
		Special: 'ZeusSecondaryTrait',
		Cast: 'ZeusRangedTrait',
		CastBeowulf: 'ShieldLoadAmmo_ZeusRangedTrait',
		Dash: 'ZeusRushTrait',
		Call: 'ZeusShoutTrait',
		Tier1: [
			'PerfectDashBoltTrait',
			'RetaliateWeaponTrait',
		],
		Tier2: [
			'OnWrathDamageBuffTrait',
			'SuperGenerationTrait',
			'ZeusBoltAoETrait',
			'ZeusBonusBoltTrait',
			'ZeusBonusBounceTrait',
			'ZeusLightningDebuff',
		],
		Tier3: [
			'ZeusChargedBoltTrait',
		],
		Duo: {
			Aphrodite: 'RegeneratingCappedSuperTrait',
			Ares: 'AutoRetaliateTrait',
			Artemis: 'AmmoBoltTrait',
			Athena: 'ReboundingAthenaCastTrait',
			Demeter: 'JoltDurationTrait',
			Dionysus: 'LightningCloudTrait',
			Poseidon: 'ImpactBoltTrait',
		},
	},
	Hermes: {
		Tier1: [
			'HermesWeaponTrait',
			'HermesSecondaryTrait',
			'RapidCastTrait',
			'RegeneratingSuperTrait',
			'RushSpeedBoostTrait',
			'MoveSpeedTrait',
			'RushRallyTrait',
			'DodgeChanceTrait',
			'BonusDashTrait',
			'HermesShoutDodge',
			'AmmoReclaimTrait',
			'ChamberGoldTrait',
			'SpeedDamageTrait',
			'AmmoReloadTrait',
		],
		Tier2: [],
		Tier3: [
			'MagnetismTrait',
			'UnstoredAmmoDamageTrait',
		],
	},
	Chaos: {
		Tier1: [
			'ChaosBlessingMoneyTrait',
			'ChaosBlessingBackstabTrait',
			'ChaosBlessingAlphaStrikeTrait',
			'ChaosBlessingMetapointTrait',
			'ChaosBlessingBoonRarityTrait',
			'ChaosBlessingSecondaryTrait',
			'ChaosBlessingAmmoTrait',
			'ChaosBlessingDashAttackTrait',
			'ChaosBlessingRangedTrait',
			'ChaosBlessingMaxHealthTrait',
			'ChaosBlessingMeleeTrait',
		],
		Tier2: [],
		Tier3: [
			'ChaosBlessingExtraChanceTrait',
		],
	},
};
const Weapons = {
	SwordWeapon: {
		Stats: [
			['Strike', 'Press {Attack} button to Strike.', '[20] Damage', ''],
			[
				'Combo',
				'Press {Attack} > {Attack} > {Attack} for Combo.',
				`Strike: [20] Damage<br/>
Chop: [25] Damage<br/>
Thrust: [30] Damage`,
				'Thrust: {Knockback}'
			],
			['Dash-Strike', 'Press {Attack} quickly after {Dashing}.', '[30] Damage', 'Thrust: {Knockback}'],
			['Nova Smash', 'Press {Special} to Nova Smash.', '[50] Damage', 'Cannot {Backstab}<br/>{Knockback}'],
			'Aspect of Arthur',
			['Heavy Slash', 'Press {Attack} button to Strike.', '[60] Damage', ''],
			[
				'Combo',
				`Press {Attack} > {Attack} > {Attack} for Combo. Each subsequent strike has increased windup time.<br/>
* {Dashes} can be performed between the {Attack} inputs without interrupting the combo`,
				'[60] / [80] / [200] Damage',
				''
			],
			['Dash-Strike', 'Press {Attack} quickly after {Dashing}.', '[50] Damage', ''],
			[
				'Hallowed Ground',
				`Press {Special} button to use {Hallowed Ground}, creating a static aura that gives you damage reduction, disables traps, and slows the speed of enemy projectiles.<br/>
* Duration of aura is [8 Sec.]`,
				'[70] Damage',
				`Cannot {Backstab}<br/>
{Knockback}<br/>
Create aura`
			],
			[
				'Nova Smash',
				'Press {Special} button during {Hallowed Ground}.',
				'[70] Damage',
				`Cannot {Backstab}<br/>
{Knockback}`
			],
		],
		Upgrades: [
			'SwordHealthBufferDamageTrait',
			'SwordCriticalTrait',
			'SwordCursedLifeStealTrait',
			'SwordBlinkTrait',
			'SwordDoubleDashAttackTrait',
			'SwordSecondaryDoubleAttackTrait',
			'SwordTwoComboTrait',
			'SwordGoldDamageTrait',
			'SwordThrustWaveTrait',
			'SwordBackstabTrait',
			'SwordSecondaryAreaDamageTrait',
			'SwordHeavySecondStrikeTrait',
			'SwordConsecrationBoostTrait',
		],
	},
	SpearWeapon: {
		Stats: [
			['Strike', 'Press {Attack} button to Strike.', '[25] Damage', ''],
			['Combo', 'Press {Attack} > {Attack} > {Attack} for Combo.', '1st Strike: [25] Damage<br/>2nd / 3rd Strike: [30] Damage'],
			['Dash-Strike', 'Press {Attack} button quickly after {Dash}', '[20] Damage', ''],
			[
				'Spin Attack',
				'Hold {Attack} to charge; release to Spin Attack.',
				// My estimates:
				// Premier:	[0.5; 0.83; 1.5]
				// 1.28; 2.13; 2.23; 3.13
				//       15;   10;   20;
				// it can either be: [0.5; 0.8; 1.4] or [0.5; 0.83; 1.5]
				// SpearWeaponSpin.ChargeTime = 0.26
				// SpearSpinDisable.DurationFrames = 20 (0.3 Sec? wiki)
				// SpearSpinDisableCancelable.DurationFrames = 80 (1.2 Sec? wiki)
				`Damage / Radius / Charge Time<br/>
1st Charge: [30] / [210] / [0.5]<br/>
2nd Charge: [50] / [350] / [0.8]<br/>
Max Charge: [100] / [500] / [1.4]`,
				`Cannot {Backstab}`,
			],
			[
				'Throw',
				'Press {Special} to Throw. After thrown, press {Special} or {Attack} to recall.',
				'Throw/Return: [25] Damage',
				`<li>Range: [850]</li>
<li>Zagreus cannot {Attack} before the spear is recalled</li>`,
			],
			'Aspect of Guan Yu Moveset',
			['Strike', 'Press {Attack} button to strike.', '[40] Damage', ''],
			[
				'Combo',
				'Press {Attack} > {Attack} > {Attack} for Combo.',
				`1st strike: [40] Damage<br/>
2nd strike: [60] Damage<br/>
3rd strike: [100] Damage`,
				'',
			],
			['Dash-Strike', 'Press {Attack} button quickly after {Dash}', '[30] Damage', ''],
			['Serpent Slash',
				'Hold Attack to charge. Release Attack to send out a spinning blade that moves forward.',
				`1st charge: [20] Damage / [0.5s]<br/>
2nd charge: [30] Damage / [0.5s]<br/>
Max charge: [50] Damage / [0.5s]`,
				`<li>Heals Zagreus [1] {Health_Small} / hit</li>
<li>Spinning blade bounces off walls and pillars, {pierce}</li>`,
			]
		],
		Upgrades: [
			'SpearReachAttack',
			'SpearThrowBounce',
			'SpearThrowPenetrate',
			'SpearThrowCritical',
			'SpearThrowExplode',
			'SpearSpinDamageRadius',
			'SpearSpinChargeLevelTime',
			'SpearAutoAttack',
			'SpearThrowElectiveCharge',
			'SpearDashMultiStrike',
			'SpearSpinChargeAreaDamageTrait',
			'SpearAttackPhalanxTrait',
			'SpearSpinTravelDurationTrait',
		],
	},
	ShieldWeapon: {
		Stats: [
			['Bash', 'Press Attack button to Strike.', '[25] Damage', 'Knockback'],
			[
				'Bull Rush',
				'Hold {Attack} to Defend.<br/>Release to {Bull Rush}.',
				'Partial Charge: [20-39] Damage<br/>Max Charge: [40] Damage',
				'Defend<br/>Rush'
			],
			['Throw', 'Press {Special} to Throw.', '[15] Damage', 'After a throw, Zagreus cannot {Attack} / {Special} until the shield returns to him'],
			'Aspect of Beowulf',
			['Heavy Bash', 'Press {Attack} button to Strike.', '[40] Damage', '{Knockback}'],
			['Bull Rush', 'Hold {Attack} to Defend.<br/>Release to {Bull Rush}.', 'Any Charge: [50] Damage', ''],
			[
				'Dragon Rush',
				'Press {Cast} to Load {Ammo_Small}<br/>Hold {Attack} to Defend<br/>Release to {Dragon Rush}',
				'~[50-][100] Damage<br/>[50] Cast Damage (each {Ammo_Small})',
				''
			],
			['Heavy Throw', 'Press {Special} to Throw.', '[45] Damage', 'After a throw, Zagreus cannot {Attack} / {Special} until the shield returns to him'],
		],
		Upgrades: [
			'ShieldThrowFastTrait',
			'ShieldChargeSpeedTrait',
			'ShieldBashDamageTrait',
			'ShieldDashAOETrait',
			'ShieldThrowCatchExplode',
			'ShieldPerfectRushTrait',
			'ShieldChargeHealthBufferTrait',
			'ShieldRushProjectileTrait',
			'ShieldThrowElectiveCharge',
			'ShieldThrowEmpowerTrait',
			'ShieldThrowRushTrait',
			'ShieldBlockEmpowerTrait',
			'ShieldLoadAmmoBoostTrait',
		],
	},
	BowWeapon: {
		Stats: [
			['Fire', 'Hold {Attack} to Fire.', '[20] to [60] Damage', '{Pierce}'],
			['Dash-Strike', 'First {Attack} after {Dash} will charge faster but deal less damage.', '[20] to [40] Damage', '{Pierce}'],
			['Volley Fire', 'Press {Special} to {Volley Fire}, releasing [9] Arrows in a wide arc.', '[10] Damage each', ''],
			['Power Shot', 'Release {Attack} while flashing to {Power Shot}.', '[70] (or [50]) Damage', '{Pierce}'],
			'Aspect of Rama',
			['Fire', 'Hold {Attack} to Fire.', '[25] to [120] Damage', '{Pierce}'],
			['Dash-Strike', 'First {Attack} after {Dash} will charge faster but deal less damage.', '[25] to [80] Damage', '{Pierce}'],
			['Volley Fire', 'Press {Special} to {Volley Fire}, releasing [3] ricocheting Arrows in a narrow cone.', '[5] Damage each', '{Shared Suffering}'],
			[
				'Power Shot',
				`Release {Attack} while flashing to {Power Shot}.<br/>
{Power Shots} on {Dash-Strike} deal less damage.`,
				`[175] Damage<br/>
Dash-Strike: [125] Damage`,
				'{Pierce}'
			],
			[[
				`ChargeTime: &[x2.1]`,
				`MinChargeToFire: [0.13]`,
				`ChargeDamageMultiplier: [x2]`,
				`PerfectChargeDamageMultiplier: [x1.25]`,
				`ChargeRangeMultiplier: [x1.15]`,
			]]
		],
		Upgrades: [
			'BowDoubleShotTrait',
			'BowLongRangeDamageTrait',
			'BowSlowChargeDamageTrait',
			'BowTapFireTrait',
			'BowPenetrationTrait',
			'BowPowerShotTrait',
			'BowSecondaryBarrageTrait',
			'BowTripleShotTrait',
			'BowSecondaryFocusedFireTrait',
			'BowChainShotTrait',
			'BowCloseAttackTrait',
			'BowConsecutiveBarrageTrait',
			'BowBondBoostTrait',
		],
	},
	FistWeapon: {
		Stats: [
			['Pummel', 'Hold {Attack} for a sequence of attacks', '[15] Damage each', 'Up to 5 hits before there is a pause and the sequence starts over'],
			['Rising Cutter', 'Press {Special} for Rising Cutter.', '[30] Damage per hit', 'Hits 2 times.'],
			['Dash-Strike', 'Press {Attack} while {Dashing}.', '[25] Damage', ''],
			['Dash-Upper', 'Press {Special} while {Dashing}.', '[40] Damage', ''],
			'Aspect of Gilgamesh',
			['Swipe', 'Hold {Attack} for a sequence of attacks.', '[60] Damage each', 'Up to [5] hits before there is a pause and the sequence starts over'],
			['Rising Cutter', 'Press {Special} for Rising Cutter', '[30] Damage per hit', 'Hits [2] times'],
			['Dash-Strike', 'Press {Attack} while {Dashing}.', '[20] Damage', ''],
			['Dash-Upper', 'Press {Special} while {Dashing}.', '[40] Damage', '{Maims} foes'],
		],
		Upgrades: [
			'FistDashAttackHealthBufferTrait',
			'FistAttackFinisherTrait',
			'FistReachAttackTrait',
			'FistKillTrait',
			'FistConsecutiveAttackTrait',
			'FistDoubleDashSpecialTrait',
			'FistChargeSpecialTrait',
			'FistTeleportSpecialTrait',
			'FistSpecialLandTrait',
			'FistSpecialFireballTrait',
			'FistHeavyAttackTrait',
			'FistAttackDefenseTrait',
			'FistDetonateBoostTrait',
		],
	},
	GunWeapon: {
		Stats: [
			['Fire', 'Hold {Attack} button to Fire (or press rapidly).', '[10] Damage', 'Range: [710]'],
			['Dash-Strike', 'Press {Attack} right after {Dash} to fire [1] shot at a higher fire rate.', '[10] Damage', `{Hestia's Empowered Shot} still has significant fire delay.`],
			['Reload', 'Press {Right Stick}/{R} to {Reload}.', '', ''],
			[
				'Bombard',
				'Press {Special} to Bombard.',
				`[60] Damage<br/>Damage radius: [400]`,
				`Cannot {Backstab}`
			],
			'Aspect of Lucifer',
			[
				'Beam Attack',
				'Hold {Attack} button to Fire.',
				`[10] Damage; [+0.75] per tick<br/>
[370] Damage for [20] Ammo Clip<br/>
Charge Time: [0.3 Sec.]`,
				`Range: [692]<br/>
Beam is not interrupted while {Dashing}`,
			],
			[
				'Hellfire',
				'Press {Special} to Bombard.',
				`[20] Damage per Second<br/>
Damage radius: [225]<br/>
<hr>
Detonate: ~[50-][100] Damage<br/>
Damage radius: [490]`,
				`<li>Cannot {Backstab}</li>
<li>Small orb pulses boon effects in circle around itself while dormant.</li>
<li>Detonates from any damage caused to it by you, by enemies, or by its own pulsing boon effects causing area damage (e.g. lightning strike) to nearby enemies.</li>
<li>Maximum 3 orbs deployed at one time. If a 4th Hellfire is deployed, the 1st orb deployed will detonate.</li>`
			]
		],
		Upgrades: [
			'GunMinigunTrait',
			'GunChainShotTrait',
			'GunShotgunTrait',
			'GunHeavyBulletTrait',
			'GunInfiniteAmmoTrait',
			'GunArmorPenerationTrait',
			'GunGrenadeFastTrait',
			'GunExplodingSecondaryTrait',
			'GunSlowGrenade',
			'GunGrenadeDropTrait',
			'GunGrenadeClusterTrait',
			'GunHomingBulletTrait',
			'GunLoadedGrenadeLaserTrait',
			'GunLoadedGrenadeSpeedTrait',
			'GunLoadedGrenadeWideTrait',
			'GunLoadedGrenadeInfiniteAmmoTrait',
			'GunLoadedGrenadeBoostTrait',
		],
	},
};
export {
	Extra,
	Inflicts,
	Traits,
	Gods,
	Weapons,
};