export type VersionNameType = PropertyKey;

export type DirectionType = "up" | "down";

export type SchemaType<VersionName extends VersionNameType = VersionNameType> = { schemaVersion: VersionName };

export class SchemaVersion<Schema extends SchemaType = SchemaType> {
	schemaVersion: Schema["schemaVersion"];

	up?: () => SchemaVersion | Promise<SchemaVersion>;
	down?: () => SchemaVersion | Promise<SchemaVersion>;

	constructor(item: Schema) {
		this.schemaVersion = item.schemaVersion;
		this.item = item;
	}

	item: Schema;
}
