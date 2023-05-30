import { DirectionType, SchemaType, SchemaVersion } from "../SchemaVersion";
import { SchemaVersionMapType } from "../SchemaVersionController";

export type Map<Direction extends DirectionType, CurrentSchemaVersion extends SchemaVersion> = CurrentSchemaVersion[Direction] extends () => infer NextSchemaVersion | Promise<infer NextSchemaVersion>
	? NextSchemaVersion extends SchemaVersion
		? {
				[x in CurrentSchemaVersion["schemaVersion"]]: CurrentSchemaVersion["item"];
		  } & Map<Direction, NextSchemaVersion>
		: {
				[x in CurrentSchemaVersion["schemaVersion"]]: CurrentSchemaVersion["item"];
		  }
	: {
			[x in CurrentSchemaVersion["schemaVersion"]]: CurrentSchemaVersion["item"];
	  };

export const mapSetup = <
	SchemaVersionClass extends typeof SchemaVersion<SchemaType>,
	SchemaVersionMap extends SchemaVersionMapType<SchemaVersionClass>,
	InitialSchemaVersions extends keyof SchemaVersionMap
>() => {
	type MapDataReturn<Direction extends DirectionType> = {
		[x in InitialSchemaVersions]: Map<Direction, InstanceType<SchemaVersionMap[x]>>;
	}[InitialSchemaVersions];

	const map = async <Direction extends DirectionType>(direction: Direction, currentSchemaVersion: SchemaVersion): Promise<MapDataReturn<Direction>> => {
		const converter = currentSchemaVersion[direction];

		if (converter) {
			const nextSchemaVersion = await converter();

			const nextMap = await map(direction, nextSchemaVersion);

			return {
				[currentSchemaVersion.schemaVersion]: currentSchemaVersion.item,
				...nextMap,
			};
		} else {
			return { [currentSchemaVersion.schemaVersion]: currentSchemaVersion.item } as MapDataReturn<Direction>;
		}
	};

	return map;
};
