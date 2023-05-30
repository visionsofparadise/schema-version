import { SchemaVersionMapType } from "../SchemaVersionController";
import { Item } from "../Item";
import { DirectionType, SchemaType, SchemaVersion } from "../SchemaVersion";

export type NextVersion<
	Direction extends DirectionType,
	CurrentSchemaVersion extends SchemaVersion,
	SchemaVersionClass extends typeof SchemaVersion<SchemaType>,
	SchemaVersionMap extends SchemaVersionMapType<SchemaVersionClass>
> = CurrentSchemaVersion[Direction] extends () => infer NextSchemaVersion | Promise<infer NextSchemaVersion>
	? NextSchemaVersion extends SchemaVersion
		? Item<NextSchemaVersion["item"], SchemaVersionClass, SchemaVersionMap>
		: undefined
	: undefined;

export const vNextSetup = <
	SchemaVersionClass extends typeof SchemaVersion<SchemaType>,
	SchemaVersionMap extends SchemaVersionMapType<SchemaVersionClass>,
	InitialSchemaVersions extends keyof SchemaVersionMap
>(
	schemaVersionMap: SchemaVersionMap
) => {
	type NextReturn<Direction extends DirectionType> = {
		[x in InitialSchemaVersions]: NextVersion<Direction, InstanceType<SchemaVersionMap[x]>, SchemaVersionClass, SchemaVersionMap>;
	}[InitialSchemaVersions];

	const vNext: <Direction extends DirectionType>(
		direction: Direction,
		currentItem: Item<
			ConstructorParameters<SchemaVersionMap[keyof SchemaVersionMap]>[0] & {
				schemaVersion: keyof SchemaVersionMap;
			},
			SchemaVersionClass,
			SchemaVersionMap
		>
	) => Promise<NextReturn<Direction>> = async (direction, currentItem) => {
		const converter = currentItem.SchemaVersion[direction];

		if (converter) {
			const nextSchemaVersion = await converter();

			const nextItem = new Item(nextSchemaVersion["item"], schemaVersionMap);

			return nextItem as unknown as NextReturn<typeof direction>;
		} else {
			return undefined as unknown as NextReturn<typeof direction>;
		}
	};

	return vNext;
};
