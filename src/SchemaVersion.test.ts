import { TestSchemaV1, TestSchemaV2, TestSchemaV3 } from "./SchemaVersion.dev";

it("converts v1 to v2 as expected", () => {
	const item1 = new TestSchemaV1({
		firstName: "firstName",
		common: "common",
		type: "1",
		schemaVersion: 1,
	});

	const item2 = item1.up();

	expect(item2.item).toStrictEqual({
		firstName: "firstName",
		lastName: "lastName",
		common: "common",
		type: 1,
		schemaVersion: 2,
	});
});

it("converts v2 to v3 as expected", async () => {
	expect.assertions(1);

	const item2 = new TestSchemaV2({
		firstName: "firstName",
		lastName: "lastName",
		common: "common",
		type: 1,
		schemaVersion: 2,
	});

	const item3 = await item2.up();

	expect(item3.item).toStrictEqual({
		fullName: "firstName lastName",
		common: "common",
		type: 1,
		schemaVersion: 3,
	});
});

it("converts v3 to v2 as expected", async () => {
	expect.assertions(1);

	const item3 = new TestSchemaV3({
		fullName: "firstName lastName",
		common: "common",
		type: 1,
		schemaVersion: 3,
	});

	const item2 = await item3.down();

	expect(item2.item).toStrictEqual({
		firstName: "firstName",
		lastName: "lastName",
		common: "common",
		type: 1,
		schemaVersion: 2,
	});
});

it("converts v2 to v1 as expected", () => {
	const item2 = new TestSchemaV2({
		firstName: "firstName",
		lastName: "lastName",
		common: "common",
		type: 1,
		schemaVersion: 2,
	});

	const item1 = item2.down();

	expect(item1.item).toStrictEqual({
		firstName: "firstName",
		common: "common",
		type: "1",
		schemaVersion: 1,
	});
});
