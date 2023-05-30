import { TestSchemaV1, TestSchemaV2, TestSchemaV3 } from "./SchemaVersion.dev";
import { SchemaVersionController } from "./SchemaVersionController";

export const testSchema = new SchemaVersionController({
	[1]: TestSchemaV1,
	[2]: TestSchemaV2,
	[3]: TestSchemaV3,
});
