import { Item } from "../Item";
import { SchemaVersion, DirectionType, SchemaType } from "../SchemaVersion";
import { SchemaVersionMapType } from "../SchemaVersionController";

export type LastVersion<
	Direction extends DirectionType,
	CurrentSchemaVersion extends SchemaVersion,
	SchemaVersionClass extends typeof SchemaVersion<SchemaType>,
	SchemaVersionMap extends SchemaVersionMapType<SchemaVersionClass>
> = CurrentSchemaVersion[Direction] extends () => infer NextSchemaVersion | Promise<infer NextSchemaVersion>
	? NextSchemaVersion extends SchemaVersion
		? LastVersion<Direction, NextSchemaVersion, SchemaVersionClass, SchemaVersionMap>
		: Item<CurrentSchemaVersion["item"], SchemaVersionClass, SchemaVersionMap>
	: Item<CurrentSchemaVersion["item"], SchemaVersionClass, SchemaVersionMap>;

export const vLastSetup = <
	SchemaVersionClass extends typeof SchemaVersion<SchemaType>,
	SchemaVersionMap extends SchemaVersionMapType<SchemaVersionClass>,
	InitialSchemaVersions extends keyof SchemaVersionMap
>(
	schemaVersionMap: SchemaVersionMap
) => {
	type LastReturn<Direction extends DirectionType> = {
		[x in InitialSchemaVersions]: LastVersion<Direction, InstanceType<SchemaVersionMap[x]>, SchemaVersionClass, SchemaVersionMap>;
	}[InitialSchemaVersions];

	const vLast: <Direction extends DirectionType>(
		direction: Direction,
		currentItem: Item<
			ConstructorParameters<SchemaVersionMap[keyof SchemaVersionMap]>[0] & {
				schemaVersion: keyof SchemaVersionMap;
			},
			SchemaVersionClass,
			SchemaVersionMap
		>
	) => Promise<LastReturn<Direction>> = async (direction, currentItem) => {
		const converter = currentItem.SchemaVersion[direction];

		if (converter) {
			const nextSchemaVersion = await converter();

			const nextItem = new Item(nextSchemaVersion["item"], schemaVersionMap);

			return vLast(direction, nextItem);
		} else {
			return currentItem as LastReturn<typeof direction>;
		}
	};

	return vLast;
};
