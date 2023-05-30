import { TestSchema } from "./SchemaVersion.dev";
import { testSchema } from "./SchemaVersionController.dev";
import { A } from "ts-toolbelt";

it("returns vUp", async () => {
	const item1 = new testSchema.Item({
		schemaVersion: 1,
		common: "common",
		type: "1",
		firstName: "firstName",
	});

	const item2 = await item1.vUp;

	const versionCheck: A.Equals<(typeof item2)["schemaVersion"], 2> = 1;
	const itemCheck: A.Equals<(typeof item2)["item"], TestSchema.V2> = 1;

	if (versionCheck && itemCheck) {
	}

	expect(item2.item).toStrictEqual({
		firstName: "firstName",
		lastName: "lastName",
		common: "common",
		type: 1,
		schemaVersion: 2,
	});
});

it("returns vDown", async () => {
	const item3 = new testSchema.Item({
		fullName: "firstName lastName",
		common: "common",
		type: 1,
		schemaVersion: 3,
	});

	const item2 = await item3.vDown;

	const versionCheck: A.Equals<(typeof item2)["schemaVersion"], 2> = 1;
	const itemCheck: A.Equals<(typeof item2)["item"], TestSchema.V2> = 1;

	if (versionCheck && itemCheck) {
	}

	expect(item2.item).toStrictEqual({
		firstName: "firstName",
		lastName: "lastName",
		common: "common",
		type: 1,
		schemaVersion: 2,
	});
});

it("returns vMax", async () => {
	const item1 = new testSchema.Item({
		schemaVersion: 1,
		common: "common",
		type: "1",
		firstName: "firstName",
	});

	const item3 = await item1.vMax;

	const versionCheck: A.Equals<(typeof item3)["schemaVersion"], 3> = 1;
	const itemCheck: A.Equals<(typeof item3)["item"], TestSchema.V3> = 1;

	if (versionCheck && itemCheck) {
	}

	expect(item3.item).toStrictEqual({
		fullName: "firstName lastName",
		common: "common",
		type: 1,
		schemaVersion: 3,
	});
});

it("returns vMin", async () => {
	const item3 = new testSchema.Item({
		fullName: "firstName lastName",
		common: "common",
		type: 1,
		schemaVersion: 3,
	});

	const item1 = await item3.vMin;

	const versionCheck: A.Equals<(typeof item1)["schemaVersion"], 1> = 1;
	const itemCheck: A.Equals<(typeof item1)["item"], TestSchema.V1> = 1;

	if (versionCheck && itemCheck) {
	}

	expect(item1.item).toStrictEqual({
		schemaVersion: 1,
		common: "common",
		type: "1",
		firstName: "firstName",
	});
});

it("returns vAt", async () => {
	const item3 = new testSchema.Item({
		fullName: "firstName lastName",
		common: "common",
		type: 1,
		schemaVersion: 3,
	});

	const item1 = await item3.vAt(1);

	const versionCheck: A.Equals<(typeof item1)["schemaVersion"], 1> = 1;
	const itemCheck: A.Equals<(typeof item1)["item"], TestSchema.V1> = 1;

	if (versionCheck && itemCheck) {
	}

	expect(item1.item).toStrictEqual({
		schemaVersion: 1,
		common: "common",
		type: "1",
		firstName: "firstName",
	});
});

it("returns itemMap", async () => {
	const item2 = new testSchema.Item({
		firstName: "firstName",
		lastName: "lastName",
		common: "common",
		type: 1,
		schemaVersion: 2,
	});

	const itemMap = await item2.map;

	const versionCheck1: A.Equals<(typeof itemMap)[1]["schemaVersion"], 1> = 1;
	const versionCheck2: A.Equals<(typeof itemMap)[3]["schemaVersion"], 3> = 1;

	if (versionCheck1 && versionCheck2) {
	}

	expect(itemMap).toStrictEqual({
		[1]: {
			schemaVersion: 1,
			common: "common",
			type: "1",
			firstName: "firstName",
		},
		[2]: {
			firstName: "firstName",
			lastName: "lastName",
			common: "common",
			type: 1,
			schemaVersion: 2,
		},
		[3]: {
			fullName: "firstName lastName",
			common: "common",
			type: 1,
			schemaVersion: 3,
		},
	});
});

it("returns itemLatest", async () => {
	const item1 = new testSchema.Item({
		schemaVersion: 1,
		common: "common",
		type: "1",
		firstName: "firstName",
	});

	const itemLatest = await item1.itemLatest;

	const versionCheck: A.Equals<(typeof itemLatest)["schemaVersion"], 3> = 1;
	const itemCheck: A.Equals<typeof itemLatest, TestSchema.V3> = 1;

	if (versionCheck && itemCheck) {
	}

	expect(itemLatest).toStrictEqual({
		fullName: "firstName lastName",
		common: "common",
		type: 1,
		schemaVersion: 3,
	});
});

it("gives correct types for ambiguous version", async () => {
	const mapItem = async (itemData: TestSchema.V1 | TestSchema.V2 | TestSchema.V3) => {
		const item = new testSchema.Item(itemData);

		const versionCheck: A.Equals<(typeof item)["schemaVersion"], 1 | 2 | 3> = 1;
		const itemCheck: A.Equals<(typeof item)["item"], TestSchema.V1 | TestSchema.V2 | TestSchema.V3> = 1;

		const upItem = await item.vMax;

		const versionCheck2: A.Equals<(typeof upItem)["schemaVersion"], 3> = 1;
		const itemCheck2: A.Equals<(typeof upItem)["item"], TestSchema.V3> = 1;

		const downItem = await item.vMin;

		const versionCheck3: A.Equals<(typeof downItem)["schemaVersion"], 1> = 1;
		const itemCheck3: A.Equals<(typeof downItem)["item"], TestSchema.V1> = 1;

		if (versionCheck && itemCheck && versionCheck2 && itemCheck2 && versionCheck3 && itemCheck3) {
		}

		return item.map;
	};

	const itemMap = await mapItem({
		fullName: "firstName lastName",
		common: "common",
		type: 1,
		schemaVersion: 3,
	});

	expect(itemMap).toStrictEqual({
		[1]: {
			schemaVersion: 1,
			common: "common",
			type: "1",
			firstName: "firstName",
		},
		[2]: {
			firstName: "firstName",
			lastName: "lastName",
			common: "common",
			type: 1,
			schemaVersion: 2,
		},
		[3]: {
			fullName: "firstName lastName",
			common: "common",
			type: 1,
			schemaVersion: 3,
		},
	});
});
