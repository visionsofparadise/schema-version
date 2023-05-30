import { SchemaType, SchemaVersion } from './SchemaVersion';
import { Item } from './Item';

export type SchemaVersionMapType<
	SchemaVersionClass extends typeof SchemaVersion<SchemaType> = typeof SchemaVersion<SchemaType>
> = {
	[x: PropertyKey]: SchemaVersionClass;
};

export class SchemaVersionController<
	SchemaVersionClass extends typeof SchemaVersion<SchemaType>,
	SchemaVersionMap extends SchemaVersionMapType<SchemaVersionClass>
> {
	constructor(public schemaVersionMap: SchemaVersionMap) {}

	get Item() {
		const schemaVersionMap = this.schemaVersionMap;

		return class SchemaVersionControllerItem<
			ItemSchema extends ConstructorParameters<SchemaVersionMap[keyof SchemaVersionMap]>[0] & {
				schemaVersion: keyof SchemaVersionMap;
			}
		> extends Item<ItemSchema, SchemaVersionClass, SchemaVersionMap> {
			constructor(item: ItemSchema) {
				super(item, schemaVersionMap);
			}
		};
	}
}
