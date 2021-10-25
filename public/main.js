const R = 'public';
const $Trait = { width: 100, height: 100, border: 3, border2: 25, };
// const root = E('div')
const root = document.body
var ns = 'http://www.w3.org/2000/svg';
const traitListEl = NS('svg', {
	class: 'trait-list',
	// width: '100px',
	// height: '100px',
	// viewBox: '0 0 100 100',
}).T(root);
const weaponStatsEl = E('div', { class: 'pa weapon-stats' }).T(root);
// const traitList = E('div', { class: 'trait-list', }).T(root);
const tooltipEl = E('div', { class: 'pa tooltip-root format-root' }).T(root);
// document.body.A(root)

const assert = (ok, msg = 'assert failed') => {
	if (!ok) { throw new Error(msg); }
}

let selectedGod = null;
let selectedWeapon = null;
let Extra,
	Inflicts,
	Traits,
	Gods,
	Weapons;
const GodTable = [
	['Athena', 'Aphrodite', 'Artemis', 'Demeter', 'Chaos'],
	['Dionysus', 'Ares', 'Zeus', 'Poseidon', 'Hermes'],
];
const WeaponTable = [
	['SwordWeapon', 'SpearWeapon', 'ShieldWeapon'],
	['BowWeapon', 'FistWeapon', 'GunWeapon'],
];
const RarityTable = ['Common', 'Rare', 'Epic', 'Heroic', 'Legendary', 'Duo'];
const GodRef = {};
let curTraitList = [];
let SelectedRarity = 0;
let FakeStackNum = 1;
const float = v => parseFloat(v).toPrecision(7);
const round = (val, precision) => {
	if (!precision) {
		return Math.round(val);
	}
	precision = Math.pow(10, precision);
	return Math.round(val * precision) / precision;
};
const cloneDeep = q => {
	if (typeof q !== 'object' || q === null) { return q; }
	if (q instanceof Array) {
		return q.map(v => cloneDeep(v));
	}
	let out = {};
	for (const k in q) {
		out[k] = cloneDeep(q[k]);
	}
	return out;
};
const format_value_00 = (q, valueList) => {
	return valueList.map(Value => {
		let out;
		if (typeof Value === 'object') {
			if (Value instanceof Array) { throw 'data error: instanceof Array'; }
			let { type, from, to } = Value;
			if (typeof to === 'undefined') { to = from; }
			let qValue = q.Value;
			out = { from, to };
			if (type === 'multiplier') {
				out = {
					from: qValue * from,
					to: qValue * to,
				};
			}
		} else {
			out = { from: Value, to: Value };
		}
		if (typeof q.ToNearest !== 'undefined') {
			let toNearest = q.ToNearest * 100;
			out.from = Math.floor(out.from / toNearest) * toNearest;
			out.to = Math.floor(out.to / toNearest) * toNearest;
		} else {
			// precision=2 is for ingame values; when we export for tooltip, precision=0
			let precision = (typeof q.DecimalPlaces !== 'undefined' ? q.DecimalPlaces : 0);
			out.from = round(out.from, precision);
			out.to = round(out.to, precision);
		}
		if (out.from === out.to) { out = out.from; }
		return out;
	});
};
const Contains = (arr, ref) => arr.includes(ref);
const TraitUI = { NEW_TRAIT_TOKEN: 'NEW' };
const WeaponData = {
	RangedWeapon: {
		AmmoDropDelay: 16,
	},
};
const MetaUpgradeData = {
	ReloadAmmoMetaUpgrade: {
		BaseValue: 5 - (2 * 1),
	},
};
const print_value = (value, format) => {
	let { increase, percent } = format;
	increase ||= percent;
	let out = '';
	if (increase) {
		out += (value.from >= 0 ? '+' : '');
	}
	out += value.from;
	// if we have IgnoreRarity, then we could have (value.from === value.to)
	if (value.to != null && value.to !== value.from) {
		const newSign = ((value.to >= 0) !== (value.from >= 0));
		if (newSign && percent) { out += '%'; }
		out += '<span style="color: grey;">-</span>';
		if (newSign && increase) {
			out += (value.to >= 0 ? '+' : '-');
		}
		out += value.to;
	}
	if (percent) { out += '%'; }
	return out;
};
window.print_value = print_value;
const format_trait_description = (trait) => {
	trait = ProcessTraitData(trait);
	// let extractedData = GetExtractData(trait);
	// console.log('format_trait_description', trait);
	const reg_text = flags => {
		return new RegExp('\\$(DisplayDelta|Increase|OldTotal|NewTotal|TotalPercentIncrease|PercentIncrease|PercentNewTotal)(\\d+)', flags);
	};
	const reg_g = reg_text('g');
	const reg_match = reg_text('');
	const final_replace = (matchedString, type, idx) => {
		let extractData = trait.ToExtractedData[idx];
		let prop;
		for (const p of trait.Effects) {
			if (p.ExtractValue.includes(extractData)) {
				prop = p;
			}
		}
		let value = trait.Additional[idx];
		let increase = false;
		// increase = /Increase/.test(type);
		if (/Increase/.test(type)) {
			// if (prop.ChangeType === 'Add') { increase = true; }
		}
		let percent = /Percent/.test(type);
		return print_value(value, {
			increase,
			percent,
		});
	};
	const try_replace = (matchedString, type, idx) => {
		// console.log(matchedString, type, idx);
		if (['PercentIncrease', 'PercentNewTotal'].includes(type)) {
			return final_replace(matchedString, type, idx);
		}
		let refValue = trait[type + idx];
		if (!refValue) {
			console.log(refValue, type, idx)
			throw 'TODO?';
		}
		if (typeof refValue !== 'string') {
			return refValue.toString();
		}
		if (refValue === matchedString) {
			return final_replace(matchedString, type, idx);
			// let value = trait[extractedData[idx - 1].ExtractAs];
			// return print_value(value, {
			// 	increase: true,
			// });
		}
		let match = refValue.match(reg_match);
		// console.log({ refValue }, typeof refValue, match)
		if (match) {
			return try_replace(match[0], match[1], match[2]);
		}
		// console.log(refValue);
		throw 'TODO';
		match = refValue.match(/\$(PercentIncrease|PercentNewTotal)(\d+)/);
		if (!match) { throw 'TODO?'; }
		console.log({ refValue, match })
		return final_replace(...match);
		// let tableValue = trait[type][idx];
		// if (!tableValue) { throw 'TODO?'; }
		// if (tableValue === TraitUI.NEW_TRAIT_TOKEN) {
		// 	let value = trait[extractedData[idx - 1].ExtractAs];
		// 	return print_value(value, {
		// 		percent: true,
		// 	});
		// }
		// throw 'TODO?';
	};
	return format(
		trait.Description(trait)
			.replace(/\{Bullet\}(.*)(?:\n)?/g, '<li>$1</li>')
			.replace(reg_g, (_, type, idx) => {
				return try_replace(_, type, idx);
			})
	);
};
const ProcessTraitData = trait => {
	trait = cloneDeep(trait);
	if (trait.Effects && trait.Effects.length > 0) {
		for (let prop of trait.Effects) {
			ProcessTraitProperty(trait, prop);
		}
	}
	SetTraitTextData(trait);
	return trait;
};
const ProcessTraitProperty = (trait, prop) => {
	const numExisting = 0;
	let rarityMultiplier = 1;
	let propertyRarityMultiplier = (rarityMultiplier != null ? rarityMultiplier : 1);
	const crm = prop.CustomRarityMultiplier;
	let rarityData;
	if (crm) {
		if (crm.Legendary != null) {
			rarityData = crm.Legendary;
		} else {
			for (let i = SelectedRarity; i >= 0; --i) {
				const key = RarityTable[i];
				if (crm[key] != null) {
					rarityData = crm[key];
					break;
				}
			}
		}
	}
	prop.rarityData = rarityData || { Multiplier: 1 };

	if (prop.BaseMin != null || prop.BaseValue != null) {
		let newValue = GetProcessedValue_RarityMultiplier(trait, prop);
		prop.ChangeValue = newValue;
		prop.BaseValue = newValue;
		if (prop.ChangeType == null) {
			if (numExisting > 0) {
				prop.ChangeType = "Add";
			} else {
				prop.ChangeType = "Absolute";
			}
		}
	}
	if (typeof prop.ChangeValue !== 'undefined') {
		if (typeof prop.ChangeValue !== 'object') {
			prop.ChangeValue = { from: prop.ChangeValue };
		}
		if (prop.ExtractAs) {
			trait[prop.ExtractAs] = prop.ChangeValue;
		}
	}
	for (const extractData of prop.ExtractValue) {
		const key = extractData.Key;
		if (key) {
			if (typeof prop[key] === 'number') {
				prop[key] = { from: prop[key] };
			}
		}
	}
};
const GetProcessedValue_RarityMultiplier = (trait, prop) => {
	assert(prop.BaseMin != null || prop.BaseValue != null);
	const { rarityData } = prop;
	let value = {};
	let m1, m2, v1, v2;
	if (rarityData.Multiplier != null) {
		m1 = m2 = rarityData.Multiplier;
	} else {
		m1 = rarityData.MinMultiplier;
		m2 = rarityData.MaxMultiplier;
	}
	if (prop.BaseValue != null) {
		v1 = v2 = prop.BaseValue;
	} else {
		v1 = prop.BaseMin;
		v2 = prop.BaseMax;
	}
	value = {
		from: GetProcessedValue(trait, prop, {
			BaseValue: v1,
			RarityMultiplier: m1,
			FakeStackNum,
		}),
	};
	if (m1 !== m2 || v1 !== v2) {
		value.to = GetProcessedValue(trait, prop, {
			BaseValue: v2,
			RarityMultiplier: m2,
			FakeStackNum,
		});
	}
	return value;
};
const GetProcessedValue = (trait, prop, args) => {
	let unit;
	let { BaseValue } = args;

	let numExisting = (args.NumExisting != null ? args.NumExisting : 0);
	let rarityMultiplier = args.RarityMultiplier;

	const TraitMultiplierData = {
		DefaultDiminishingReturnsMultiplier: 0.7,
		DefaultMinMultiplier: 0.1,
	};
	// console.log(prop)
	assert(BaseValue != null);
	rarityMultiplier = (rarityMultiplier != null ? rarityMultiplier : 1);
	if (prop.IgnoreRarity) {
		rarityMultiplier = 1;
	}
	let hasIdentical = (numExisting > 0);

	let depth = 0;
	let depthMultiplier = 1;
	if (prop.DepthMult != null) {
		depthMultiplier = 1 + depth * prop.DepthMult;
	}
	let value = BaseValue * depthMultiplier;
	let baseValue = value;

	if (prop.SourceIsMultiplier) {
		let delta = value - 1;
		value = 1 + delta * rarityMultiplier;
	} else if (prop.SourceIsNegativeMultiplier) {
		let delta = 1 - value * rarityMultiplier;
		value = 1 + delta;
	} else {
		value = value * rarityMultiplier;
	}

	if (!trait.Pom) {
		return ProcessValue(value, prop);
	}

	if (args.FakeStackNum && args.FakeStackNum > 1) {
		value = 0;
		if (prop.SourceIsMultiplier || prop.SourceIsNegativeMultiplier) {
			value = 1;
		}
		if (prop.IdenticalMultiplier != null) {
			let fakeStackNum = args.FakeStackNum - 1;
			for (let i = 0; i <= fakeStackNum; ++i) {
				let diminishingMultiplier = (
					prop.IdenticalMultiplier.DiminishingReturnsMultiplier != null
						? prop.IdenticalMultiplier.DiminishingReturnsMultiplier
						: TraitMultiplierData.DefaultDiminishingReturnsMultiplier
				);
				let totalDiminishingMultiplier = Math.pow(diminishingMultiplier, i - 1);
				let minMultiplier = (
					prop.MinMultiplier != null
						? prop.MinMultiplier
						: TraitMultiplierData.DefaultMinMultiplier
				);
				// [DuplicateMultiplier = -0.6]
				// [i=1] 0.4    [i=2] 0.28    [i=3] 0.196    [i=4] 0.1372
				let totalMultiplier = (1 + prop.IdenticalMultiplier.Value) * totalDiminishingMultiplier;
				totalMultiplier = Math.max(minMultiplier, totalMultiplier);

				if (i === 0) {
					if (prop.SourceIsMultiplier) {
						let delta = baseValue - 1;
						value = 1 + delta * rarityMultiplier;
					} else if (prop.SourceIsNegativeMultiplier) {
						let delta = 1 - baseValue * rarityMultiplier;
						value = 1 + delta;
					} else {
						value = baseValue * rarityMultiplier;
					}
				} else {
					if (prop.SourceIsMultiplier) {
						let delta = baseValue - 1;
						let adjustedValue = delta * totalMultiplier;
						value = value + adjustedValue;
					} else if (prop.SourceIsNegativeMultiplier) {
						let delta = 1 - baseValue * totalMultiplier;
						value = value + delta;
					} else {
						let adjustedValue = baseValue * totalMultiplier;
						value = value + adjustedValue;
					}
				}
				// [DuplicateMultiplier = -0.6; baseValue = 1.5]
				// [i=0] value = baseValue = 1.5
				// [i=1] value += (baseValue - 1) * 0.4 = 1.7
				// [i=2] value += (baseValue - 1) * 0.28 = 1.84
				// [i=3] value += (baseValue - 1) * 0.196 = 1.938
				value = ProcessValue(value, prop);
			}
		} else {
			if (prop.SourceIsMultiplier) {
				value = value + (baseValue - 1) * args.FakeStackNum;
			} else {
				value = value + baseValue * args.FakeStackNum;
			}
		}
	} else {
		if (hasIdentical && prop.IdenticalMultiplier != null) {
			let diminishingMultiplier = (
				prop.IdenticalMultiplier.DiminishingReturnsMultiplier != null
					? prop.IdenticalMultiplier.DiminishingReturnsMultiplier
					: TraitMultiplierData.DefaultDiminishingReturnsMultiplier
			);
			let totalDiminishingMultiplier = Math.pow(diminishingMultiplier, numExisting - 1);
			let minMultiplier = (
				prop.MinMultiplier != null
					? prop.MinMultiplier
					: TraitMultiplierData.DefaultMinMultiplier
			);
			let totalMultiplier = (1 + prop.IdenticalMultiplier.Value) * totalDiminishingMultiplier;
			if (totalMultiplier < minMultiplier) {
				totalMultiplier = minMultiplier;
			}

			if (prop.SourceIsMultiplier) {
				let delta = value - 1;
				let adjustedValue = delta * totalMultiplier;
				value = 1 + adjustedValue
			} else if (prop.SourceIsNegativeMultiplier) {
				let delta = 1 - value * totalMultiplier;
				value = 1 + delta;
			} else {
				let adjustedValue = value * totalMultiplier;
				value = adjustedValue;
			}
		}
	}
	// if (prop.MultipliedByHeroValue) {
	// 	value = value * GetTotalHeroTraitValue(prop.MultipliedByHeroValue, { IsMultiplier = true });
	// }

	// if (prop.ReducedByMetaupgradeValue) {
	// 	let metaupgradeName = prop.ReducedByMetaupgradeValue;
	// 	value = value * (1 - GetNumMetaUpgrades(metaupgradeName) * (MetaUpgradeData[metaupgradeName].ChangeValue - 1));
	// }

	// TODO
	if (unit != null
		&& prop.LifeProperty != null
		&& prop.LuaProperty == "MaxHealth"
		&& unit.MaxHealthMultiplier != null
	) {
		throw 'TODO';
		value = GetMaxHealthUpgradeIncrement(value);
	}

	return ProcessValue(value, prop);
};
const ProcessValue = (value, rampData) => {
	if (rampData.AsInt) {
		value = round(value);
	} else if (rampData.ToNearest) {
		value = Math.floor(value / rampData.ToNearest) * rampData.ToNearest;
	}

	let precision = (rampData.DecimalPlaces == null ? 2 : rampData.DecimalPlaces);
	value = rampData.ToFixed ? value.toFixed(precision) : round(value, precision);
	return value;
};
const ExtractValues = (trait) => {
	if (trait.Effects) {
		for (let prop of trait.Effects) {
			for (const extractData of prop.ExtractValue) {
				ExtractValue(trait, prop, extractData);
			}
		}
	}
};
const ExtractValue = (trait, prop, extractData) => {
	let extractToTable = trait;
	let value = null;
	// TODO ? External
	if (extractData.External && !false) {
		// DebugAssert({Condition = extractData.BaseType ~= null, Text = "Extracting a PercentOfBase value without valid type reference (Projectile, Weapon, or WeaponEffect)" })
		// DebugAssert({Condition = extractData.BaseName ~= null, Text = "Extracting a PercentOfBase value without a name." })
		// DebugAssert({Condition = extractData.BaseProperty ~= null, Text = "Extracting a PercentOfBase value without a property." })
		if (extractData.BaseType == "Projectile") {
			throw 'TODO';
			// value = GetProjectileProperty({ Id = unit.ObjectId, WeaponName = extractData.BaseName, Property = extractData.BaseProperty })
		} else if (extractData.BaseType == "Effect") {
			// throw 'TODO';
			// value = GetEffectDataValue({ WeaponName = extractData.WeaponName, EffectName = extractData.BaseName, Property = extractData.BaseProperty })
			value = GetBaseDataValue({
				Type: "Effect",
				TraitName: extractData.TraitName,
				WeaponName: extractData.WeaponName,
				Name: extractData.BaseName,
				Property: extractData.BaseProperty,
			});
		} else if (extractData.BaseType == "ProjectileBase") {
			value = GetBaseDataValue({
				Type: "Projectile",
				TraitName: extractData.TraitName,
				Name: extractData.BaseName,
				Property: extractData.BaseProperty,
			});
		} else if (extractData.BaseType == "Weapon") {
			throw 'TODO';
			value = GetBaseDataValue({
				Type: extractData.BaseType,
				TraitName: extractData.TraitName,
				Name: extractData.BaseName,
				Property: extractData.BaseProperty,
			});
		} else {
			// DebugAssert({Condition = false, Text = "Trying to find an external value on unsupported type " .. extractData.BaseType})
		}
		value = { from: value };
	} else if (extractData.Format == "EasyModeMultiplier") {
		throw 'TODO';
		value = round((1.0 - CalcEasyModeMultiplier(GameState.EasyModeLevel)) * 100);
	} else if (extractData.Format == "TotalMetaUpgradeChangeValue") {
		throw 'TODO';
		let name = extractData.MetaUpgradeName;
		let numUpgrades = GetNumMetaUpgrades(name);
		let upgradeData = MetaUpgradeData[name];
		value = GetTotalStatChange(upgradeData)
	} else if (extractData.Format == "ExistingAmmoDropDelay") {
		throw 'TODO';
		let ammoDivisor = GetTotalHeroTraitValue("AmmoReclaimTimeDivisor");
		if (ammoDivisor == 0) {
			ammoDivisor = 1;
		}
		value = math.max(0.1, WeaponData.RangedWeapon.AmmoDropDelay / ammoDivisor);
	} else if (extractData.Format == "ExistingAmmoReloadDelay") {
		throw 'TODO';
		let ammoDivisor = GetTotalHeroTraitValue("AmmoReloadTimeDivisor");
		if (ammoDivisor == 0) {
			ammoDivisor = 1;
		}
		value = math.max(0.1, GetBaseAmmoReloadTime() / ammoDivisor);
	} else if (extractData.Format == "ExistingWrathStocks") {
		throw 'TODO';
		// if (not CurrentRun or not CurrentRun.Hero or not CurrentRun.Hero.SuperMeterLimit or not CurrentRun.Hero.SuperCost ){
		// 	value = 1;
		// }else{
		// 	value = CurrentRun.Hero.SuperMeterLimit / CurrentRun.Hero.SuperCost;
		// }
	} else if (extractData.Format == "EXWrathDuration") {
		value = {
			from: prop.SuperDuration.from * prop.MaxDurationMultiplier.from,
		};
	} else {
		if (extractData.Key == null) {
			extractData.Key = "ChangeValue";
		}
		let keyToExtract = extractData.Key;
		if (prop[keyToExtract] == null) {
			// DebugPrint({Text = "Attempting to extract nonexistent key" .. keyToExtract .. " from " .. tostring(extractData.ExtractAs)})
			throw 'TODO';
			return;
		}
		value = prop[keyToExtract];
		if (extractData.Format == "MaxHealth") {
			throw 'TODO';
			value = GetMaxHealthUpgradeIncrement(value)
		}
	}

	// let newValue;
	// if (typeof prop.ChangeValue === 'object') {
	// 	newValue = cloneDeep(prop.ChangeValue);
	// } else {
	// 	newValue = { from: prop.ChangeValue };
	// }
	if (value != null) {
		extractToTable[extractData.ExtractAs] = MyValueFormat(value, mk => {
			return FormatExtractedValue(value[mk], extractData);
		});
	}
};
const MyValueFormat = (value, fn) => {
	let newValue = {
		from: fn('from'),
	};
	if (value.to != null) {
		newValue.to = fn('to');
		if (newValue.from > newValue.to) {
			let to = newValue.to;
			newValue.to = newValue.from;
			newValue.from = to;
		}
	}
	newValue.toString = () => {
		let out = newValue.from.toString();
		if (newValue.to != null) {
			out += '-' + newValue.to.toString();
		}
		return out;
	};
	return newValue;
};
const MyValueInit = (value, init) => {
	let newValue = { from: init };
	if (value.to != null) {
		newValue.to = init;
	}
	return newValue;
};
const ExtractTotalValues = (trait) => {
	let unit;
	let isOnUnit = false; // Contains(unit.Traits, newTraitData);
	let heroHasIdenticalTrait = false; // HeroHasTrait(newTraitData.Name);
	if (trait.ForBoonInfo) {
		heroHasIdenticalTrait = false;
	}
	let extractedData = GetExtractData(trait);
	trait.NewTotals = {};

	// for i, data in pairs(extractedData) do
	for (const i in extractedData) {
		let data = extractedData[i];
		let key = data.ExtractAs;
		// let total = 0;
		let total = MyValueInit(trait[key], 0);
		let incrementedTotal = MyValueInit(trait[key], 0);
		if (data.Format == "NegativePercentDelta") {
			// total = 1;
			total = MyValueInit(total, 1);
			// TODO ?
			// for s, traitData in pairs(CurrentRun.Hero.Traits) do
			// 	if AreTraitsIdentical(traitData, newTraitData) then
			// 		total = total * (1 - traitData[key]/100.0)
			// 	end
			// end
			// trait[data.ExtractAs + "Total"] = FormatExtractedValue(total, data);
			trait[data.ExtractAs + "Total"] = MyValueFormat(total, mk => {
				return FormatExtractedValue(total[mk], data);
			})
			if (!isOnUnit) {
				// incrementedTotal = total * (1 - trait[key] / 100.0);
				// trait[data.ExtractAs + "NewTotal"] = FormatExtractedValue(incrementedTotal, data);
				trait[data.ExtractAs + "NewTotal"] = MyValueFormat(trait[key], mk => {
					let incrementedTotal = total[mk] * (1 - trait[key][mk] / 100.0);
					return FormatExtractedValue(incrementedTotal, data);
				});
			}
		} else if (data.Format == "AmmoDelayDivisor") {
			// throw 'TODO';
			// total = 0;
			// TODO ?
			// for s, traitData in pairs(CurrentRun.Hero.Traits) do
			// 	if traitData.AmmoReclaimTimeDivisor then
			// 		total = total + traitData.AmmoReclaimTimeDivisor
			// 	end
			// end
			if (total.from != 0) {
				// trait[data.ExtractAs + "Total"] = FormatExtractedValue(total, data);
				trait[data.ExtractAs + "Total"] = MyValueFormat(total, mk => {
					return FormatExtractedValue(total[mk], data);
				});
			} else {
				// trait[data.ExtractAs + "Total"] = FormatExtractedValue(1, data);
				trait[data.ExtractAs + "Total"] = {
					from: FormatExtractedValue(1, data),
				};
			}

			if (!isOnUnit) {
				if (trait.AmmoReclaimTimeDivisor) {
					// incrementedTotal = total + trait.AmmoReclaimTimeDivisor;
					incrementedTotal = MyValueFormat(total, mk => {
						return total[mk] + trait.AmmoReclaimTimeDivisor[mk];
					});
				}
				if (incrementedTotal.from != 0) {
					// trait[data.ExtractAs + "NewTotal"] = FormatExtractedValue(incrementedTotal, data);
					trait[data.ExtractAs + "NewTotal"] = MyValueFormat(incrementedTotal, mk => {
						return FormatExtractedValue(incrementedTotal[mk], data);
					});
				}
			}
		} else if (data.Format == "AmmoReloadDivisor") {
			// throw 'TODO';
			// total = 0;
			// TODO ?
			// for s, traitData in pairs(CurrentRun.Hero.Traits) do
			// 	if traitData.AmmoReloadTimeDivisor then
			// 		total = total + traitData.AmmoReloadTimeDivisor
			// 	end
			// end
			if (total.from != 0) {
				// trait[data.ExtractAs + "Total"] = FormatExtractedValue(total, data);
				trait[data.ExtractAs + "Total"] = MyValueFormat(total, mk => {
					return FormatExtractedValue(total[mk], data);
				});
			} else {
				// trait[data.ExtractAs + "Total"] = FormatExtractedValue(1, data);
				trait[data.ExtractAs + "Total"] = {
					from: FormatExtractedValue(1, data),
				};
			}

			if (!isOnUnit) {
				if (trait.AmmoReloadTimeDivisor) {
					incrementedTotal = MyValueFormat(total, mk => {
						return total[mk] + trait.AmmoReloadTimeDivisor[mk];
					});
				}
				if (incrementedTotal.from != 0) {
					// trait[data.ExtractAs + "NewTotal"] = FormatExtractedValue(incrementedTotal, data);
					trait[data.ExtractAs + "NewTotal"] = MyValueFormat(incrementedTotal, mk => {
						return FormatExtractedValue(incrementedTotal[mk], data);
					});
				}
			}
		} else {
			// TODO ?
			// for s, traitData in pairs(CurrentRun.Hero.Traits) do
			// 	if AreTraitsIdentical(traitData, newTraitData) then
			// 		total = total + traitData[key]
			// 	end
			// end
			trait[data.ExtractAs + "Total"] = total;
			if (!isOnUnit) {
				// incrementedTotal = total + trait[key];
				// trait[data.ExtractAs + "NewTotal"] = incrementedTotal;
				trait[data.ExtractAs + "NewTotal"] = MyValueFormat(trait[key], mk => {
					incrementedTotal = total[mk] + trait[key][mk];
					return incrementedTotal;
				});
			}
		}

		if (!isOnUnit) {
			if (!heroHasIdenticalTrait) {
				trait[data.ExtractAs + "TotalPercentIncrease"] = TraitUI.NEW_TRAIT_TOKEN;
			} else {
				throw 'TODO';
				trait[data.ExtractAs + "TotalPercentIncrease"] = round(
					(trait[data.ExtractAs + "NewTotal"] - trait[data.ExtractAs + "Total"])
					/ trait[data.ExtractAs + "Total"]
					* 100
				);
			}
		}
	}
};
const GetBaseDataValue = (() => {
	const process = ref => {
		for (const nameKey in ref) {
			const ent = ref[nameKey];
			for (const k in ent) {
				if (k === 'Effects') {
					process(ent.Effects);
					continue;
				}
				if (typeof ent[k] !== 'object') {
					ent[k] = {
						_: ent[k],
					};
				}
			}
		}
		return ref;
	};
	let ProjectileData = process({
		RangedWeapon: { // derive_from: 1_BaseDamagingProjectile
			Effects: {
				DelayedKnockback: {
					Duration: 0.7,
				},
			},
		},
		// * Athena
		AthenaDeflectingProjectile: {
			DamageRadius: 250,
		},
		AthenaDeflectingBeowulfProjectile: {
			DamageRadius: 300,
		},
		AthenaRushProjectile: {
			DamageRadius: 250,
		},
		// * Ares
		AresProjectile: {
			DamageRadius: {
				_: 150,
				ShieldLoadAmmo_AresRangedTrait: 270,
			},
			TotalFuse: {
				_: 4,
				ShieldLoadAmmo_AresRangedTrait: 0.8,
			},
			Fuse: {
				_: 0.2,
				ShieldLoadAmmo_AresRangedTrait: 0.2,
			},
			Speed: 250,
			AdjustRateAcceleration: -260,
			// MaxAdjustRate: 60, // from Projectile.RangedWeapon?? from what I understood, if you replace Projectile, then previous values are not preserved
		},
		AresRushProjectile: {
			DamageRadius: 120,
			TotalFuse: 1,
			Fuse: 0.2, // DamageInterval
			Speed: 50,
		},
		AresInvisibleAoE: {
			DamageRadius: {
				AresShoutTrait: 150,
			},
		},
		AresRetaliate: {
			DamageRadius: 450,
		},
		// * Aphrodite
		AphroditeProjectile: {
			DamageRadius: 200,
			Range: 200,
		},
		AphroditeBeowulfProjectile: {
			DamageRadius: 400,
		},
		AphroditeRushProjectile: {
			DamageRadius: 230,
			Range: 250,
		},
		// * Demeter
		DemeterRushProjectile: {
			DamageRadius: 120,
			Range: 700,
		},
		DemeterMaxChill: {
			DamageRadius: 640,
		},
		DemeterAmmoWind: {
			DamageRadius: 520,
		},
		DemeterChillKill: {
			DamageRadius: 240,
		},
		DemeterSuper: {
			DamageRadius: 750,
		},
		DemeterMaxSuper: {
			DamageRadius: 1500,
		},
		// * Dionysus
		DionysusLobProjectile: {
			DamageRadius: 400,
			Range: 600,
		},
		DionysusDashProjectile: {
			DamageRadius: 180,
			Fuse: 0.25,
			TotalFuse: 0.75,
		},
		DionysusPlagueWeapon: {
			Range: 300,
		},
		// * Zeus
		ChainLightning: {
			NumJumps: 4,
			JumpRange: 620,
			JumpDamageMultiplier: 0.8,
		},
		LightningStrikeSecondary: {
			DamageRadius: 200,
			Range: 0,
		},
		ZeusProjectile: {
			NumJumps: 5,
			JumpRange: 720,
		},
		ZeusShieldLoadAmmoStrike: {
			DamageRadius: 200, // derive_from: LightningStrikeX
			// Range: 0, // derive_from: LightningStrikeX
			Range: 350, // Powers.lua::ShieldFireClear
		},
		LightningDash: {
			DamageRadius: 200,
			Range: 200, // derive_from: DefaultRushProjectile
		},
		LightningStrikeX: { // *** ZeusShoutTrait
			DamageRadius: 200,
			Range: 400, // ShoutScripts.lua::ZeusShout
		},
		LightningPerfectDash: { // *** PerfectDashBoltTrait
			DamageRadius: 200, // derive_from: LightningDash
			Range: 200, // derive_from: LightningDash
		},
		LightningStrikeRetaliate: { // *** RetaliateWeaponTrait
			DamageRadius: 200, // derive_from: LightningStrikeSecondary
			Range: 0, // derive_from: LightningStrikeSecondary
		},
		LightningStrikeCrit: { // * not used
			DamageRadius: 200, // derive_from: LightningStrikeSecondary
		},
		LightningStrikeImpact: {
			DamageRadius: 200, // derive_from: LightningStrikeSecondary
			Range: 0, // derive_from: LightningStrikeSecondary
		},
		ZeusAmmoProjectile: {
			DamageRadius: 200, // derive_from: LightningStrikeSecondary
			Range: 0, // derive_from: LightningStrikeSecondary
		},
		ZeusDionysusCloudStrike: {
			DamageRadius: 200, // derive_from: ZeusAmmoProjectile
		},
		// * Poseidon
		PoseidonProjectile: {
			DamageRadius: 500,
		},
		PoseidonRushProjectile: {
			DamageRadius: 300,
		},
		PoseidonCollisionBlast: {
			DamageRadius: 430,
		},
		// * Sword
		SwordWeapon: {
			Effects: {
				DamageOverDistance: {
					Cooldown: 0.2,
					// Duration: 3,
				},
				DamageOverTime: {
					Cooldown: 0.5,
					// Duration: 4,
					// MaxStacks: 5,
				},
			},
		},
		ConsecrationField: {
			DamageRadius: 400,
		},
		// * Spear
		SpearWeapon: {
			Effects: {
				SpearWeaponSpinExplosiveChargeWeapon: {
					DamageRadius: 450,
				},
			},
		},
		// * Shield
		ShieldCatchBlast: {
			DamageRadius: 550,
		},
		// * Fists
		FistWeaponLandAreaAttack: {
			DamageRadius: 380,
		},
		// * Rail
		GunGrenadeToss: {
			DamageHigh: 60,
			ReloadTime: 1.5,
			DamageRadius: 400,
		},
		GunBombWeapon: { // lucifer explosion
			DamageRadius: 490,
		},
		GunBombImmolation: { // lucifer radiation
			DamageRadius: 225,
		},
		GunSlowWeapon: {
			DamageRadius: 400,
			Duration: 2,
		},
		GunVulnerabilityWeapon: {
			DamageRadius: 400, // derive_from: GunSlowWeapon
			Duration: 2,
		},
	});
	return args => {
		let {
			Type,
			TraitName = '_',
			WeaponName,
			Name,
			Property,
		} = args;
		let v;
		if (Type === 'Projectile') {
			let prop = ProjectileData[Name][Property];
			if (prop != null) {
				v = prop[TraitName];
				if (v == null) { v = prop._; }
			}
		} else if (Type === 'Effect') {
			let prop = ProjectileData[WeaponName].Effects[Name][Property];
			if (prop != null) {
				v = prop[TraitName];
				// if (v == null) { v = prop._; }
			}
		}
		if (v != null) {
			if (Property === 'AdjustRateAcceleration') {
				// I have no fucking idea what this value means, but it means something to stupid supergiants
				v /= 57.295989280750347475676702630816;
			}
			return v;
		}
		console.log(args)
		throw 'TODO';
	};
})();
const FormatExtractedValue = (value, extractData) => {
	if (extractData.Format != null) {
		if (extractData.Format == "MultiplyByBase") {
			throw 'TODO';
			// DebugAssert({Condition = extractData.BaseType ~= nil, Text = "Extracting a PercentOfBase value without valid type reference (Projectile, Weapon, or WeaponEffect)" })
			// DebugAssert({Condition = extractData.BaseName ~= nil, Text = "Extracting a PercentOfBase value without a name." })
			// DebugAssert({Condition = extractData.BaseProperty ~= nil, Text = "Extracting a PercentOfBase value without a property." })
			// let baseDataValue = GetBaseDataValue({ Type = extractData.BaseType, Name = extractData.BaseName, Property = extractData.BaseProperty });
			value = value * baseDataValue;
		} else if (extractData.Format == "PercentOfBase") {
			// DebugAssert({Condition = extractData.BaseType ~= nil, Text = "Extracting a PercentOfBase value without valid type reference (Projectile, Weapon, or WeaponEffect)" })
			// DebugAssert({Condition = extractData.BaseName ~= nil, Text = "Extracting a PercentOfBase value without a name." })
			// DebugAssert({Condition = extractData.BaseProperty ~= nil, Text = "Extracting a PercentOfBase value without a property." })
			let baseDataValue = GetBaseDataValue({
				TraitName: extractData.TraitName,
				Type: extractData.BaseType,
				Name: extractData.BaseName,
				Property: extractData.BaseProperty,
			});
			value = (value / baseDataValue) * 100;
		} else if (extractData.Format == "Percent") {
			// -- eg 0.5 becomes "50"
			value = value * 100;
		} else if (extractData.Format == "AmmoDelayDivisor") {
			// throw 'TODO';
			// DebugAssert({ Condition = value ~= 0, Text = "A divisor formatted value is zero!" .. value .. " " .. tostring(extractData.Key) })
			value = WeaponData.RangedWeapon.AmmoDropDelay / value;
		} else if (extractData.Format == "AmmoReloadDivisor") {
			// throw 'TODO';
			// DebugAssert({ Condition = value ~= 0, Text = "A divisor formatted value is zero!" .. value .. " " .. tostring(extractData.Key) })
			// value = GetBaseAmmoReloadTime() / value;
			value = MetaUpgradeData.ReloadAmmoMetaUpgrade.BaseValue / value;
		} else if (extractData.Format == "PercentDelta") {
			// -- eg 1.3 becomes "30"
			value = (value - 1) * 100;
		} else if (extractData.Format == "NegativePercentDelta") {
			// -- eg. 0.7 becomes "-30"
			value = (1 - value) * 100;
		} else if (extractData.Format == "PercentHeal") {
			// throw 'TODO';
			// value = value * CalculateHealingMultiplier();
			value = value * 100;
		} else if (extractData.Format == "PercentPlayerHealth" || extractData.Format == "PercentPlayerHealthFountain") {
			throw 'TODO';
			// if CurrentRun.Hero ~= nil then
			// 	local maxLife = CurrentRun.Hero.MaxHealth
			// 	if maxLife == nil then
			// 		return 0
			// 	else
			// 		if extractData.Format == "PercentPlayerHealthFountain" then
			// 			value = value + GetTotalHeroTraitValue( "FountainHealFractionBonus" )
			// 			local healFractionOverride = GetTotalHeroTraitValue("FountainHealFractionOverride") 
			// 			if healFractionOverride > 0 then
			// 				value = healFractionOverride
			// 			end
			// 		end
			// 		value = value * CalculateHealingMultiplier()
			// 		if value > 1 then 
			// 			value = 1 
			// 		end
			// 		value = maxLife * value
			// 	end
			// else
			// 	value = value * 100 .. "%"
			// end
		} else if (extractData.Format == "HealingDrop") {
			throw 'TODO';
			// local baseHealFraction = ConsumableData[extractData.ConsumableName].HealFraction
			// local healingMultiplier = CalculatePositiveHealingMultiplier() + ( value - 1 )
			// healingMultiplier = healingMultiplier * ( 1 - GetNumMetaUpgrades("HealingReductionShrineUpgrade") * ( MetaUpgradeData.HealingReductionShrineUpgrade.ChangeValue - 1 ) )
			// if CurrentRun.Hero ~= nil then
			// 	local maxLife = CurrentRun.Hero.MaxHealth
			// 	if maxLife == nil then
			// 		return 0
			// 	else
			// 		value = maxLife * baseHealFraction
			// 		-- @hack More special casing that probably doesn't belong here and may not always be wanted.  Sorry back at you Alice!
			// 		value = value * healingMultiplier
			// 	end
			// else
			// 	value = value * 100 .. "%"
			// end

		} else if (extractData.Format == "DamageOverTime") {
			throw 'TODO';
			// DebugAssert({Condition = extractData.BaseProperty ~= nil or extractData.BaseValue ~= nil, Text = "Extracting a DamageOverTime value without a property." })
			// local fuse = 1
			// if extractData.BaseValue ~= nil then
			// 	fuse = extractData.BaseValue
			// elseif extractData.WeaponName ~=  nil then
			// 	if extractData.BaseName ~= nil then
			// 		fuse = GetEffectDataValue({ WeaponName = extractData.WeaponName, EffectName = extractData.BaseName, Property = extractData.BaseProperty })
			// 	else
			// 		fuse = GetBaseDataValue({ Type = "Weapon", Name = extractData.WeaponName, Property = extractData.BaseProperty })
			// 	end
			// else
			// 	fuse = GetBaseDataValue({Type = "Projectile", Name = extractData.BaseName, Property = extractData.BaseProperty })
			// end
			// value = value / fuse
		} else if (extractData.Format == "SeekDuration") {
			let deceleration = -1 * GetBaseDataValue({
				TraitName: extractData.TraitName,
				Type: "Projectile",
				Name: extractData.BaseName,
				Property: "AdjustRateAcceleration",
			});
			value = value / deceleration;
		} else if (extractData.Format == "WrathStocks") {
			throw 'TODO';
			value = CalculateSuperMeter() / value;
		}
	}

	let precision = 2;
	if (extractData.DecimalPlaces != null) {
		precision = extractData.DecimalPlaces;
	}
	if (extractData.AbsoluteValue != null) {
		value = Math.abs(value);
	}
	return extractData.ToFixed ? value.toFixed(precision) : round(value, precision);
};
const GetExtractData = trait => {
	if (!trait.Effects) { return []; }
	return trait.Effects.map(prop => prop.ExtractValue).flat();
};
const SetTraitTextData = (trait, args) => {
	args = args || {};

	ExtractValues(trait);
	ExtractTotalValues(trait);

	// if (args.ReplacementTraitData) {
	// 	ExtractValues(args.ReplacementTraitData, args.ReplacementTraitData);
	// 	ExtractTotalValues(args.ReplacementTraitData);
	// 	GameState.InspectData = args.ReplacementTraitData;
	// }

	let extractedData = GetExtractData(trait);
	// -- needs to be ordered properly @alice
	trait.ToExtractedData = [];
	trait.Additional = [];
	trait.OldTotal = [];
	trait.NewTotal = [];
	trait.PercentIncrease = [];
	let extractedIndex = 0;
	// for i, data in pairs(extractedData) do
	for (const i in extractedData) {
		let data = extractedData[i];
		if (data.SkipAutoExtract == null) {
			extractedIndex = extractedIndex + 1;
			let key = data.ExtractAs;
			trait.ToExtractedData[extractedIndex] = data;
			trait.Additional[extractedIndex] = trait[key];
			trait.OldTotal[extractedIndex] = trait[key + "Total"];
			if (args.ReplacementTraitData) {
				trait.OldTotal[extractedIndex] = trait[key];
				trait.NewTotal[extractedIndex] = args.ReplacementTraitData[key];
			} else if (args.OldOnly) {
				trait.NewTotal[extractedIndex] = trait[key + "Total"];
			} else {
				trait.NewTotal[extractedIndex] = trait[key + "NewTotal"];
			}
			trait.PercentIncrease[extractedIndex] = trait[key + "TotalPercentIncrease"];
			trait["DisplayDelta" + extractedIndex] = "$Increase" + extractedIndex;

			if (data.Format != null && Contains(["Percent", "PercentDelta", "NegativePercentDelta", "PercentOfBase", "Divisor"], data.Format)) {
				trait["OldTotal" + extractedIndex] = "$PercentOldTotal" + extractedIndex;
				trait["Increase" + extractedIndex] = "$PercentIncrease" + extractedIndex;
				trait["NewTotal" + extractedIndex] = "$PercentNewTotal" + extractedIndex;
				if (args.OldOnly) {
					trait["NewTotal" + extractedIndex] = "$PercentTotal" + extractedIndex;
					trait["DisplayDelta" + extractedIndex] = "$PercentTotal" + extractedIndex;
				}
			} else {
				trait["Increase" + extractedIndex] = "$Increase" + extractedIndex;
				trait["OldTotal" + extractedIndex] = "$OldTotal" + extractedIndex;
				trait["NewTotal" + extractedIndex] = "$NewTotal" + extractedIndex;
				if (args.OldOnly) {
					trait["NewTotal" + extractedIndex] = "$Total" + extractedIndex;
					trait["DisplayDelta" + extractedIndex] = "$Total" + extractedIndex;
				}
			}

			if (trait[key + "TotalPercentIncrease"] == TraitUI.NEW_TRAIT_TOKEN) {
				trait["TotalPercentIncrease" + extractedIndex] = "$NewTraitPrefix";
			} else {
				trait["TotalPercentIncrease" + extractedIndex] = "$TotalPercentIncrease" + extractedIndex;
			}
		}
	}
};
const TooltipIconReplace = (() => {
	// GiftPointSmall		=> Gift_Small
	// MetaPoint_Small		=> Darkness_Small
	// Health_Small_Tooltip	=> Health_Small
	// GemSmall				=> Gems_Small
	// PoisonIcon			=> PoisonIcon_Small
	// LuciferAmmo_Small	=> LaserAmmo_Small
	let icons = {
		Health_Small: { style: 'height: 0.75em;' },
		HealthUp_Small: { style: 'height: 0.75em;' },
		HealthRestore_Small: {},
		Ammo: { style: 'height: 1.4em; margin: 0 .2em;' },
		Darkness_Small: {},
		Currency_Small: {},
		Gems_Small: {},
		Gift_Small: { style: 'height: 1.3em;' },
		Ammo_Small: {},
		PoisonIcon_Small: {},
		LaserAmmo_Small: {},
		GunAmmo_Small: {},
		RightArrow: { style: 'height: 0.75em; margin: 0 .2em;' },
	};
	const TooltipIconRegex = new RegExp(`{(${Object.keys(icons).join('|')})}`, 'g');
	return (str) => {
		str = str.replace(
			TooltipIconRegex,
			// width: 20px;
			(_, key) => {
				const icon = icons[key];
				const style = icon.style || 'height: 1em;';
				return `<img src="${R}/images/Icon_${key}.png" style="${style}">`;
			}
		);
		return str;
	};
})();
const format = (str, val) => {
	if (typeof val !== 'undefined') {
		let replace;
		if (val instanceof Array) {
			replace = val.map((_, idx) => `n\\[${idx}\\]`);
		}
		else {
			replace = ['n'];
			val = [val];
		}
		val.forEach((v, idx) => {
			const r = replace[idx];
			let from, to;
			if (typeof v === 'object') {
				from = v.from; to = v.to;
			} else {
				from = v; to = v;
			}
			let replaceWith = from + (from === to ? '' : '<span style="color: grey;">—</span>' + to);
			str = str.replace(new RegExp(`%\\+${r}`, 'g'), (from < 0 ? '-' : '+') + replaceWith);
			str = str.replace(new RegExp(`%${r}`, 'g'), replaceWith);
		});
	}
	str = str.replace(/\&\[(.+?)\]/g, '<span class="value" style="color: red;">$1</span>');
	str = str.replace(/\~\[(.+?)\]/g, '<span class="value" style="color: grey;">$1</span>');
	str = str.replace(/\[(.+?)\]/g, '<span class="value" style="color: #73c745;">$1</span>');
	str = TooltipIconReplace(str);
	str = str.replace(/{(.+?)}/g, (_, v) => {
		if (RarityTable.includes(v)) {
			return `<span class="value rarity-${RarityTable.indexOf(v)}">${v}</span>`;
		}
		return `<span class="value" style="color: #fff;">${v}</span>`;
	});
	const strip_esc = esc => (esc || '').substr(esc && esc.length % 2 === 0 ? 2 : 1);
	str = str.replace(/(\\)*\((.+?)\)/g, (_, esc, text) => {
		if (!esc || esc.length % 2 === 0) {
			return `${strip_esc(esc)}<span class="italic">(${text})</span>`;
		}
		return `${strip_esc(esc)}(${text})`;
	});
	str = str.replace(/(\\)*\*(.+?)\*/g, (_, esc, text) => {
		if (!esc || esc.length % 2 === 0) {
			return `${strip_esc(esc)}<span class="italic">${text}</span>`;
		}
		return `${strip_esc(esc)}*${text}*`;
	});
	return str;
};
const format_trait = (key, trait) => {
	let str = trait.DisplayName;
	let color;
	if (trait.WeaponAspect) { color = 'gold'; }
	if (trait.IsKeepsake) { color = 'pink'; }
	if (trait.IsMirror) { color = '#cb83ff'; } // pruple
	if (trait.IsMirrorB) { color = '#ff9000'; } // orange
	if (color) {
		str = `<span style="color: ${color}">${str}</span>`;
	}
	if (trait.Icon) {
		str = `<img src="${R}/images/${trait.Icon}.png">${str}`;
	}
	return str;
};
let CurTooltip = null;
const getScrollbar = () => {
	let root = (document.compatMode == 'BackCompat' ? document.body : document.documentElement);
	// console.log({
	// 	scrollHeight: root.scrollHeight,
	// 	clientHeight: root.clientHeight,
	// 	scrollWidth: root.scrollWidth,
	// 	clientWidth: root.clientWidth,
	// });
	return {
		isVertical: (root.scrollHeight > root.clientHeight),
		isHorizontal: (root.scrollWidth > root.clientWidth),
	};
};
const ShowTooltip = (el, opts) => {
	CurTooltip = [el, opts];
	let { traitKey } = opts;

	tooltipEl.S().h('');
	const { isHorizontal } = getScrollbar();
	const { left, top, width, height } = el.getBoundingClientRect();
	tooltipEl.style.left = (window.scrollX + left + width) + 'px';
	tooltipEl.style.top = (window.scrollY + top) + 'px';
	const trait = Traits[traitKey];
	tooltipEl.A(E('div', { class: 'trait-pom' + (trait.Pom ? '' : ' strike') }, 'Lv. ' + FakeStackNum));
	let rarityClass;
	let RarityLevels = trait.RarityLevels || { Common: { Multiplier: 1 } };
	if (trait.Duo) { rarityClass = 5; }
	else if (!trait.RarityLevels) { rarityClass = 0; }
	else if (RarityLevels.Legendary) { rarityClass = 4; }
	else {
		rarityClass = SelectedRarity;
		if (typeof RarityLevels[RarityTable[SelectedRarity]] === 'undefined') {
			rarityClass += ' strike';
		}
	}
	tooltipEl.A(title = E('div', {
		class: `trait-name rarity-${rarityClass}`,
	}, trait.DisplayName.replace(/([^A-Z\s]+)/g, '<span class="lower">$1</span>')));
	tooltipEl.A(E('div', { class: 'cla' }));
	if (trait.Description) {
		// tooltipEl.A(E('div', { class: 'trait-description' }, format(trait.Description)));
		tooltipEl.A(E('div', { class: 'trait-description' }, format_trait_description(trait)));
	}
	if (trait.Notes && trait.Notes.length > 0) {
		const ul = E('ul', { class: 'trait-notes' });
		tooltipEl.A(ul);
		for (let str of trait.Notes) {
			ul.A(E('li', null, format(str)));
		}
	}
	let right = E('div', { class: 'fr2 tooltip-right' }).T(tooltipEl);
	const getSymbol = (desc, key) => {
		return `<img src="${R}/images/Symbol_${key + (['Hades'].includes(key) ? '' : '')}.png">${desc}`;
	};
	let highlightList = [];
	if (trait.Forbid && trait.Forbid.length > 0) {
		right.A(E('div', { class: 'tooltip-header' }, '<u>Cannot be combined with</u>'));
		right.A(E('div', { class: 'tooltip-subcontent' }, `<ul>${trait.Forbid.map(key => {
			highlightList.push({ key, forbid: true });
			const trait = Traits[key];
			let desc = format_trait(key, trait);
			if (trait.God) {
				desc = getSymbol(desc, trait.God);
			} else if (trait.Duo) {
				desc = getSymbol(desc, trait.Duo[0]);
				desc = getSymbol(desc, trait.Duo[1]);
			}
			return `<li>${desc}</li>`;
		}).join('')}</ul>`));
	}
	if (trait.Required && trait.Required.length > 0) {
		right.A(E('div', { class: 'tooltip-header' }, '<u>Offering Requirements</u>'));
		let inner = E('div', { class: 'tooltip-subcontent' }).T(right);
		for (let q of trait.Required) {
			if (typeof q === 'string') {
				const key = q;
				highlightList.push({ key });
				const trait = Traits[key];
				let desc = format_trait(key, trait);
				inner.A(E('div', null, `<ul><li>${desc}</li></ul>`));
				continue;
			}
			if (q.Slot) {
				inner.A(E('div', { class: 'tooltip-header' }, `<ul>${q.Slot.map(v => `<li>${v}</li>`).join(',')}</ul>`));
				continue;
			}
			let list = q.OneOf || q.List;
			let desc = '';
			if (q.Description) { desc = q.Description; }
			else if (q.OneOf) {
				if (list.length === 1) { desc = 'The Following:'; }
				else { desc = 'One of the Following:'; }
			}
			let mainGod = null;
			for (const key of list) {
				const trait = Traits[key];
				if (mainGod === null) {
					mainGod = trait.God;
				} else if (mainGod !== trait.God) {
					mainGod = null;
					break;
				}
			}
			if (mainGod) {
				desc = getSymbol(desc, mainGod);
			}
			inner.A(E('div', { class: 'tooltip-header' }, desc));
			inner.A(E('div', null, `<ul>${list.map(key => {
				highlightList.push({ key });
				const trait = Traits[key];
				let desc = format_trait(key, trait);
				if (trait.Tier) { desc += ` (${trait.Tier})`; }
				if (!mainGod) {
					if (trait.God) {
						desc = getSymbol(desc, trait.God);
					} else if (trait.Duo) {
						desc = getSymbol(desc, trait.Duo[0]);
						desc = getSymbol(desc, trait.Duo[1]);
					}
				}
				return `<li>${desc}</li>`;
			}).join('')}</ul>`));
		}
	}
	tooltipEl.A(E('div', { class: 'cl' }));
	const box = tooltipEl.getBoundingClientRect();
	let innerHeight = window.innerHeight - 2;
	if (isHorizontal) { innerHeight -= 18; } // 14 for chrome windows
	// console.log({
	// 	top: tooltipEl.style.top,
	// 	innerHeight: window.innerHeight,
	// 	box,
	// })
	if (box.top + box.height > innerHeight) {
		tooltipEl.style.top = (window.scrollY + innerHeight - box.height) + 'px';
	}
	for (const { el } of curTraitList) {
		el.CR('highlight');
		el.CR('highlight-forbid');
	}
	for (const { key, forbid } of highlightList) {
		const q = curTraitList.find(q => q.key === key);
		if (!q) { continue; }
		q.el.CA('highlight' + (forbid ? '-forbid' : ''));
	}
};
const ShowTooltipHelp = (el) => {
	tooltipEl.S().h('');
	tooltipEl.style.left = '0px';
	tooltipEl.style.top = '0px';
	tooltipEl.h(format(`<div class="nowr">
This page is supposed to be viewed at {100%} zoom.<br/>Use {Ctrl}+{MiddleMouseBtn} to adjust zoom.
<li>Use [0-9] to set Pom Lv.</li>
<li>Use {Ctrl}/{Alt}/{Ctrl+Alt} + [0-9] to set bigger Pom Lv.</li>
<li>Use [-]/[+]/[=] to adjust Pom Lv.</li>
<li>Use {Ctrl}/{Alt} + {LeftMouseBtn} to adjust Pom Lv.</li>
<li>Use {LeftMouseBtn} to change Boon {Rarity}.</li>
</div>`));
	const box = tooltipEl.getBoundingClientRect();
	const { left, top, width, height } = el.getBoundingClientRect();
	tooltipEl.style.left = (window.scrollX + left - box.width) + 'px';
	tooltipEl.style.top = (window.scrollY + top) + 'px';
};
const HideTooltip = () => {
	tooltipEl.H();
	CurTooltip = null;
};
const PrintTrait = (key) => {
	if (!key) { return; }
	const trait = Traits[key];
	const { Tier } = trait;
	let { width: w, height: h, border: b } = $Trait;
	let frame = 'Boon_Info';
	// if (trait.Duo) { frame = 'Duo'; }
	// if (frame !== 'Boon_Info') { b = $Trait.border2; }

	const img = NS('image', {
		x: `${b}px`, y: `${b}px`,
		'width': `${w - b * 2}px`,
		'height': `${h - b * 2}px`,
		'clip-path': 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
		'href': `${R}/images/${key}.png`,
	});
	const g = NS('g', {
		class: 'trait-image',
	});
	g.A(img);
	// const $dpos = {
	// 	Duo: { x: 3, y: 3 }
	// };
	// const framex = ($dpos[frame] || { x: 0 }).x;
	// const framey = ($dpos[frame] || { y: 0 }).y;
	g.A(NS('image', {
		// x: `${framex}px`, y: `${framey}px`,
		'width': `${w}px`,
		'height': `${h}px`,
		'clip-path': 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
		'href': `${R}/images/Frame_${frame}.png`,
	}));
	g.A(NS('path', {
		d: `M${w / 2},${b / 2} L${w - b / 2},${h / 2} L${w / 2},${h - b / 2} L${b / 2},${h / 2} Z`,
		// stroke: trait.Duo ? 'green' : Tier === 1 ? 'grey' : Tier === 2 ? 'blue' : Tier === 3 ? 'gold' : 'grey',
		stroke: 'none',
		'stroke-width': b,
		fill: 'none',
	}));
	const el = g;
	el.on('click', e => {
		if (e.ctrlKey || e.altKey) { return; }
		// console.log(key)
		SelectedRarity = (SelectedRarity + 1) % 4;
		ShowTooltip(el, { traitKey: key });
	});
	el.on('mouseenter', e => {
		ShowTooltip(el, { traitKey: key });
	});
	el.on('mouseleave', e => {
		HideTooltip();
		for (const { el } of curTraitList) {
			el.CR('highlight');
			el.CR('highlight-forbid');
		}
	});
	return { key, el };
};
const OutputTraitList = (container, traitList) => {
	let x = 0;
	x = (traitList.length - 1) * 50;
	let y = 0;
	let maxY = 0;
	curTraitList = [];
	// for (let col = 0; col < traitList.length; ++col) {
	for (let col = traitList.length - 1; col >= 0; --col) {
		const vList = traitList[col];
		y = (col % 2 === 0 ? 0 : 50);
		for (let row = 0; row < vList.length; ++row) {
			// for (let row = vList.length - 1; row >= 0; --row) {
			const q = vList[row];
			if (!q) { continue; }
			curTraitList.push(q);
			const { el } = q;
			el.sa('x', x); el.sa('y', y);
			el.sa('transform', `translate(${x}, ${y})`);
			container.A(el);
			y += 100;
		}
		// x += 50;
		x -= 50;
		maxY = Math.max(maxY, y);
	}
	// x += 50;
	x = (traitList.length + 1) * 50;
	y = maxY;
	container.sa('width', `${x}px`);
	container.sa('height', `${y}px`);
	container.sa('viewBox', `0 0 ${x} ${y}`);
};
const PrintTraitList = () => {
	traitListEl.h('');
	let output = [];
	let all, cur, list;
	const maxRows = 5;
	if (selectedGod) {
		const god = Gods[selectedGod];
		output.push([
			PrintTrait(god.Attack),
			PrintTrait(god.Special),
			PrintTrait(god.Cast),
			PrintTrait(god.CastBeowulf),
			PrintTrait(god.Dash),
			PrintTrait(god.Call),
		]);
		if (god.Tier1.length <= maxRows && false) {
			list = [
				god.Tier1,
				god.Tier2,
				god.Tier3,
			];
		} else {
			cur = [];
			list = [cur];
			all = [
				...god.Tier1,
				...god.Tier2,
				...god.Tier3,
			];
			let curTier = Traits[all[0]].Tier;
			for (let i = 0; i < all.length; ++i) {
				const key = all[i];
				if (cur.length === maxRows
					|| Traits[key].Tier !== curTier
				) {
					list.push(cur = []);
					curTier = Traits[key].Tier;
				}
				cur.push(key);
			}
		}
		for (const ll of list) {
			output.push(ll.map(key => PrintTrait(key)));
		}
		if (god.Duo) {
			const list = [];
			for (const duoKey in god.Duo) {
				const key = god.Duo[duoKey];
				list.push(PrintTrait(key));
			}
			while (output.length < 6) {
				output.push([]);
			}
			output.push(list.slice(0, 4));
			output.push(list.slice(4));
		}
	}
	weaponStatsEl.h('');
	if (selectedWeapon) {
		while (output.length < 10) {
			output.push([]);
		}
		const weapon = Weapons[selectedWeapon];
		cur = [];
		list = [cur];
		all = weapon.Upgrades;
		for (let i = 0; i < all.length; ++i) {
			const key = all[i];
			if (cur.length === maxRows) {
				list.push(cur = []);
			}
			cur.push(key);
		}
		for (const ll of list) {
			output.push(ll.map(key => PrintTrait(key)));
		}
		if (weapon.Stats) {
			weaponStatsEl.h(`<table class="format-root">
<tbody>
${weapon.Stats.map(row => {
				let result = '';
				if (typeof row === 'string') {
					result = `<td colspan="4"><h3>${row}</h3></td>`;
				} else if (row[0] instanceof Array) {
					result = `<td colspan="4">
<ul>
${row[0].map(v => `<li>${format(v)}</li>`).join('')}
</ul>
</td>`;
				} else {
					result = row.map(cell => `<td>${format(cell)}</td>`).join('');
				}
				return `<tr>${result}</tr>`;
			}).join('')}
</tbody>
</table>`)
		}
	}
	OutputTraitList(traitListEl, output);
};
const SelectGod = godKey => {
	if (selectedGod) {
		GodRef[selectedGod].el.CR('active')
	}
	selectedGod = godKey;
	GodRef[selectedGod].el.CA('active');
	PrintTraitList();
};
const SelectWeapon = weaponKey => {
	if (selectedWeapon) {
		GodRef[selectedWeapon].el.CR('active')
	}
	selectedWeapon = weaponKey;
	if (weaponKey) {
		GodRef[selectedWeapon].el.CA('active');
	}
	PrintTraitList();
};
const init_traits = () => {
	let list;
	for (const weaponKey in Weapons) {
		const weapon = Weapons[weaponKey];
		for (const traitKey of weapon.Upgrades) {
			const trait = Traits[traitKey];
			if (typeof trait.Pom === 'undefined') { trait.Pom = false; }
		}
	}
	let undefinedTraits = [];
	for (const traitKey in Traits) {
		const trait = Traits[traitKey];
		trait.Key = traitKey;
		const setPom = (typeof trait.Pom === 'undefined');
		if (setPom) { trait.Pom = true; }
		if (list = trait.Effects) {
			for (const prop of list) {
				if (typeof prop.RarityLevels === 'undefined') {
					prop.RarityLevels = cloneDeep(trait.RarityLevels);
				}
				if (typeof prop.CustomRarityMultiplier === 'undefined') {
					prop.CustomRarityMultiplier = cloneDeep(prop.RarityLevels);
					delete prop.RarityLevels;
				}
				if (!(prop.ExtractValue instanceof Array)) {
					prop.ExtractValue = [prop.ExtractValue];
				}
			}
		}
		if (list = trait.Forbid) {
			for (let i = list.length - 1; i >= 0; --i) {
				const key = list[i];
				if (typeof Traits[key] === 'undefined') {
					undefinedTraits.push(key);
					list.splice(i, 1);
					continue;
				}
				if (key === traitKey) {
					list.splice(i, 1);
					if (setPom) { trait.Pom = false; }
				}
			}
		}
		if (list = trait.Required) {
			for (let i = list.length - 1; i >= 0; --i) {
				const q = list[i];
				if (typeof q === 'string') {
					const key = q;
					if (typeof Traits[key] === 'undefined') {
						undefinedTraits.push(key);
						list.splice(i, 1);
						continue;
					}
					if (key === traitKey) {
						list.splice(i, 1);
					}
					continue;
				}
				if (q.Slot) {
					continue;
				}
				let list2 = q.OneOf || q.List;
				for (let i = list2.length - 1; i >= 0; --i) {
					const key = list2[i];
					if (typeof Traits[key] === 'undefined') {
						undefinedTraits.push(key);
						list2.splice(i, 1);
						continue;
					}
					if (key === traitKey) {
						list2.splice(i, 1);
					}
				}
			}
		}
	}
	for (const godKey in Gods) {
		const god = Gods[godKey];
		for (const [list, Tier] of [
			[god.Tier1, 1],
			[god.Tier2, 2],
			[god.Tier3, 3],
		]) {
			for (const key of list) {
				const trait = Traits[key];
				trait.Tier = Tier;
				trait.God = godKey;
				if (typeof trait.RarityLevels === 'undefined') {
					console.error(key, 'undefined RarityLevels');
				}
			}
		}
		for (const key of [
			god.Attack,
			god.Special,
			god.Cast,
			god.CastBeowulf,
			god.Dash,
			god.Call,
		]) {
			if (!key) { continue; }
			const trait = Traits[key];
			trait.God = godKey;
			trait.Tier = 0;
		}
	}
	if (undefinedTraits.length > 0) {
		// console.warn('undefined traits:');
		// undefinedTraits = undefinedTraits.filter((v, idx, self) => (
		// 	self.indexOf(v) === idx
		// ));
		// undefinedTraits.sort();
		// for (const key of undefinedTraits) {
		// 	console.log(key);
		// }
	}
};
const save_selected = (extend) => {
	let selected = JSON.parse(localStorage.getItem('selected') || '{}');
	selected = {
		...selected,
		...extend,
	};
	localStorage.setItem('selected', JSON.stringify(selected));
};
const init_dom = () => {
	document.body.addEventListener('keydown', e => {
		// console.log(e)
		// console.log(e.keyCode)
		let code;
		if (e.keyCode >= 48 && e.keyCode <= 57) { code = e.keyCode - 48; }
		else if (e.keyCode >= 96 && e.keyCode <= 105) { code = e.keyCode - 96; }
		else {
			let match = e.code.match(/^(Digit|Numpad)(\d)$/);
			if (match) {
				code = parseInt(match[2]);
			}
		}
		if (code != null) {
			FakeStackNum = code;
			if (FakeStackNum === 0) { FakeStackNum = 10; }
			if (e.ctrlKey) { FakeStackNum *= 10; }
			if (e.altKey) { FakeStackNum *= 100; }
			CurTooltip && ShowTooltip(...CurTooltip);
			e.preventDefault();
			return;
		}
		if (e.key === '+' || e.key === '-' || e.key === '=') {
			FakeStackNum += (e.key === '-' ? -1 : 1);
			if (FakeStackNum < 1) { FakeStackNum = 1; }
			CurTooltip && ShowTooltip(...CurTooltip);
			e.preventDefault();
			return;
		}
	});
	document.body.addEventListener('click', e => {
		if (!e.ctrlKey && !e.altKey) { return; }
		FakeStackNum += (e.ctrlKey ? 1 : -1);
		if (FakeStackNum < 1) { FakeStackNum = 1; }
		if (CurTooltip) {
			ShowTooltip(...CurTooltip);
		}
	});
	let table, tbody;
	// GODS
	table = E('table', { class: 'pa select-table god-table' }).A(tbody = E('tbody'));
	for (const list of GodTable) {
		let tr = E('tr');
		for (const key of list) {
			const el = E('div', { class: 'select-cont god-cont' })
			const obj = {
				el
			};
			GodRef[key] = obj;
			const img = E('img', { src: `${R}/images/Character_${key}.png` });
			el.A(img);
			el.on('click', function (e) {
				save_selected({ god: key });
				SelectGod(key);
			});
			tr.A(E('td').A(el));
		}
		tbody.A(tr);
	}
	root.A(table);
	// WEAPONS
	table = E('table', { class: 'pa select-table weapon-table' }).A(tbody = E('tbody'));
	for (const list of WeaponTable) {
		let tr = E('tr');
		for (const key of list) {
			if (!key) { continue; }
			const el = E('div', { class: 'select-cont weapon-cont' })
			const obj = {
				el
			};
			GodRef[key] = obj;
			const weapon = Weapons[key];
			const img = E('img', { src: `${R}/images/${key}.png` });
			el.A(img);
			el.on('click', function (e) {
				let wkey = key;
				if (selectedWeapon === wkey) {
					wkey = null;
				}
				save_selected({ weapon: wkey });
				SelectWeapon(wkey);
			});
			tr.A(E('td').A(el));
		}
		tbody.A(tr);
	}
	root.A(table);
	(() => {
		// src: `${R}/images/UnknownButton.png`,
		const outSrc = `${R}/images/PactBiomeRewardUnknown.png`;
		const inSrc = `${R}/images/UnknownSuperReward_Shiny.png`;
		let el = E('img', {
			class: 'pf',
			src: outSrc,
			style: `top: 0; right: 0; width: 40px; border-radius: 50%;`,
		}).on('mouseenter', function (e) {
			this.sa('src', inSrc);
			ShowTooltipHelp(this);
		}).on('mouseleave', function (e) {
			this.sa('src', outSrc);
			HideTooltip();
		});
		document.body.A(el);
	})();
};
const main = async () => {
	const Data = await import('./data.js');
	Extra = Data.Extra; Inflicts = Data.Inflicts;
	Traits = Data.Traits; Gods = Data.Gods; Weapons = Data.Weapons;
	console.log(Gods);
	init_traits();
	init_dom();
	let selected = JSON.parse(localStorage.getItem('selected') || '{}');
	if (selected.god) { SelectGod(selected.god); }
	if (selected.weapon) { SelectWeapon(selected.weapon); }
	// SelectGod('Aphrodite');
	// SelectWeapon('FistWeapon');
};
main();