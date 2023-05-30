import { LastVersion, vLastSetup } from "./helpers/vLast";
import { MapVersions, vMapSetup } from "./helpers/vMap";
import { Map, mapSetup } from "./helpers/map";
import { NextVersion, vNextSetup } from "./helpers/vNext";
import { SchemaVersion, SchemaType } from "./SchemaVersion";
import { SchemaVersionMapType } from "./SchemaVersionController";

export class Item<
	ItemSchema extends ConstructorParameters<SchemaVersionMap[keyof SchemaVersionMap]>[0] & {
		schemaVersion: keyof SchemaVersionMap;
	},
	SchemaVersionClass extends typeof SchemaVersion<SchemaType>,
	SchemaVersionMap extends SchemaVersionMapType<SchemaVersionClass>
> {
	schemaVersion: ItemSchema["schemaVersion"];
	SchemaVersion: InstanceType<SchemaVersionMap[ItemSchema["schemaVersion"]]>;

	constructor(item: ItemSchema, schemaVersionMap: SchemaVersionMap) {
		this.schemaVersion = item.schemaVersion;

		this.SchemaVersion = new schemaVersionMap[item.schemaVersion](item) as InstanceType<SchemaVersionMap[ItemSchema["schemaVersion"]]>;

		this.item = item;

		this.#vNext = vNextSetup<SchemaVersionClass, SchemaVersionMap, ItemSchema["schemaVersion"]>(schemaVersionMap);
		this.#vLast = vLastSetup<SchemaVersionClass, SchemaVersionMap, ItemSchema["schemaVersion"]>(schemaVersionMap);
		this.#vMap = vMapSetup<SchemaVersionClass, SchemaVersionMap, ItemSchema["schemaVersion"]>(schemaVersionMap);
		this.#map = mapSetup<SchemaVersionClass, SchemaVersionMap, ItemSchema["schemaVersion"]>();
	}

	item: ItemSchema;

	#vNext: ReturnType<typeof vNextSetup<SchemaVersionClass, SchemaVersionMap, ItemSchema["schemaVersion"]>>;
	#vLast: ReturnType<typeof vLastSetup<SchemaVersionClass, SchemaVersionMap, ItemSchema["schemaVersion"]>>;
	#vMap: ReturnType<typeof vMapSetup<SchemaVersionClass, SchemaVersionMap, ItemSchema["schemaVersion"]>>;
	#map: ReturnType<typeof mapSetup<SchemaVersionClass, SchemaVersionMap, ItemSchema["schemaVersion"]>>;

	#mapAll = async () => {
		const downMap = await this.#map("down", this.SchemaVersion);
		const upMap = await this.#map("up", this.SchemaVersion);

		return {
			...downMap,
			...upMap,
		} as unknown as {
			[x in ItemSchema["schemaVersion"]]: Map<"down", InstanceType<SchemaVersionMap[x]>> & Map<"up", InstanceType<SchemaVersionMap[x]>>;
		}[ItemSchema["schemaVersion"]];
	};

	#vMapAll = async (): Promise<
		{
			[x in ItemSchema["schemaVersion"]]: MapVersions<"down", InstanceType<SchemaVersionMap[x]>, SchemaVersionClass, SchemaVersionMap> &
				MapVersions<"up", InstanceType<SchemaVersionMap[x]>, SchemaVersionClass, SchemaVersionMap>;
		}[ItemSchema["schemaVersion"]]
	> => {
		const downVMap = await this.#vMap("down", this);
		const upVMap = await this.#vMap("up", this);

		return {
			...downVMap,
			...upVMap,
		} as unknown as {
			[x in ItemSchema["schemaVersion"]]: MapVersions<"down", InstanceType<SchemaVersionMap[x]>, SchemaVersionClass, SchemaVersionMap> &
				MapVersions<"up", InstanceType<SchemaVersionMap[x]>, SchemaVersionClass, SchemaVersionMap>;
		}[ItemSchema["schemaVersion"]];
	};

	get vMin(): Promise<
		{
			[x in ItemSchema["schemaVersion"]]: LastVersion<"down", InstanceType<SchemaVersionMap[x]>, SchemaVersionClass, SchemaVersionMap>;
		}[ItemSchema["schemaVersion"]]
	> {
		return this.#vLast("down", this);
	}

	get vDown(): Promise<
		{
			[x in ItemSchema["schemaVersion"]]: NextVersion<"down", InstanceType<SchemaVersionMap[x]>, SchemaVersionClass, SchemaVersionMap>;
		}[ItemSchema["schemaVersion"]]
	> {
		return this.#vNext("down", this);
	}

	get vUp(): Promise<
		{
			[x in ItemSchema["schemaVersion"]]: NextVersion<"up", InstanceType<SchemaVersionMap[x]>, SchemaVersionClass, SchemaVersionMap>;
		}[ItemSchema["schemaVersion"]]
	> {
		return this.#vNext("up", this);
	}

	get vMax(): Promise<
		{
			[x in ItemSchema["schemaVersion"]]: LastVersion<"up", InstanceType<SchemaVersionMap[x]>, SchemaVersionClass, SchemaVersionMap>;
		}[ItemSchema["schemaVersion"]]
	> {
		return this.#vLast("up", this);
	}

	get itemLatest(): Promise<
		{
			[x in ItemSchema["schemaVersion"]]: LastVersion<"up", InstanceType<SchemaVersionMap[x]>, SchemaVersionClass, SchemaVersionMap>;
		}[ItemSchema["schemaVersion"]]["item"]
	> {
		return this.#vLast("up", this).then((v) => v.item);
	}

	get vMap() {
		return this.#vMapAll();
	}

	get map() {
		return this.#mapAll();
	}

	vAt = async <
		Version extends keyof {
			[x in ItemSchema["schemaVersion"]]: MapVersions<"down", InstanceType<SchemaVersionMap[x]>, SchemaVersionClass, SchemaVersionMap> &
				MapVersions<"up", InstanceType<SchemaVersionMap[x]>, SchemaVersionClass, SchemaVersionMap>;
		}[ItemSchema["schemaVersion"]]
	>(
		version: Version
	) => (await this.vMap)[version];
}
