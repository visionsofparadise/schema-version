import { Item } from "../Item";
import { DirectionType, SchemaType, SchemaVersion } from "../SchemaVersion";
import { SchemaVersionMapType } from "../SchemaVersionController";

export type MapVersions<
	Direction extends DirectionType,
	CurrentSchemaVersion extends SchemaVersion,
	SchemaVersionClass extends typeof SchemaVersion<SchemaType>,
	SchemaVersionMap extends SchemaVersionMapType<SchemaVersionClass>
> = CurrentSchemaVersion[Direction] extends () => infer NextSchemaVersion | Promise<infer NextSchemaVersion>
	? NextSchemaVersion extends SchemaVersion
		? {
				[x in CurrentSchemaVersion["schemaVersion"]]: Item<CurrentSchemaVersion["item"], SchemaVersionClass, SchemaVersionMap>;
		  } & MapVersions<Direction, NextSchemaVersion, SchemaVersionClass, SchemaVersionMap>
		: {
				[x in CurrentSchemaVersion["schemaVersion"]]: Item<CurrentSchemaVersion["item"], SchemaVersionClass, SchemaVersionMap>;
		  }
	: {
			[x in CurrentSchemaVersion["schemaVersion"]]: Item<CurrentSchemaVersion["item"], SchemaVersionClass, SchemaVersionMap>;
	  };

export const vMapSetup = <
	SchemaVersionClass extends typeof SchemaVersion<SchemaType>,
	SchemaVersionMap extends SchemaVersionMapType<SchemaVersionClass>,
	InitialSchemaVersions extends keyof SchemaVersionMap
>(
	schemaVersionMap: SchemaVersionMap
) => {
	type MapReturn<Direction extends DirectionType> = {
		[x in InitialSchemaVersions]: MapVersions<Direction, InstanceType<SchemaVersionMap[x]>, SchemaVersionClass, SchemaVersionMap>;
	}[InitialSchemaVersions];

	const vMap: <Direction extends DirectionType>(
		direction: Direction,
		currentItem: Item<
			ConstructorParameters<SchemaVersionMap[keyof SchemaVersionMap]>[0] & {
				schemaVersion: keyof SchemaVersionMap;
			},
			SchemaVersionClass,
			SchemaVersionMap
		>
	) => Promise<MapReturn<Direction>> = async (direction, currentItem) => {
		const converter = currentItem.SchemaVersion[direction];

		if (converter) {
			const nextSchemaVersion = await converter();

			const nextItem = new Item(nextSchemaVersion["item"], schemaVersionMap);

			const nextVMap = await vMap(direction, nextItem);

			return {
				[currentItem.schemaVersion]: currentItem,
				...nextVMap,
			};
		} else {
			return { [currentItem.schemaVersion]: currentItem } as MapReturn<typeof direction>;
		}
	};

	return vMap;
};
