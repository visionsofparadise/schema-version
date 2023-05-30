import { SchemaVersion } from "./SchemaVersion";
import { setTimeout } from "timers/promises";

export namespace TestSchema {
	export interface V1 {
		firstName: string;
		type: string;
		common: string;
		schemaVersion: 1;
	}

	export interface V2 {
		firstName: string;
		lastName: string;
		type: number;
		common: string;
		schemaVersion: 2;
	}

	export interface V3 {
		fullName: string;
		type: number;
		common: string;
		schemaVersion: 3;
	}
}

export class TestSchemaV1 extends SchemaVersion<TestSchema.V1> {
	up = () => {
		return new TestSchemaV2({
			...this.item,
			lastName: "lastName",
			type: parseInt(this.item.type),
			schemaVersion: 2,
		});
	};
}

export class TestSchemaV2 extends SchemaVersion<TestSchema.V2> {
	down = () => {
		return new TestSchemaV1({
			firstName: this.item.firstName,
			type: String(this.item.type),
			common: this.item.common,
			schemaVersion: 1,
		});
	};

	up = async () => {
		await setTimeout(1000);

		return new TestSchemaV3({
			fullName: this.item.firstName + " " + this.item.lastName,
			type: this.item.type,
			common: this.item.common,
			schemaVersion: 3,
		});
	};
}

export class TestSchemaV3 extends SchemaVersion<TestSchema.V3> {
	down = async () => {
		const [firstName, lastName] = this.item.fullName.split(" ");

		await setTimeout(1000);

		return new TestSchemaV2({
			firstName,
			lastName,
			type: this.item.type,
			common: this.item.common,
			schemaVersion: 2,
		});
	};
}
