# schema-version

A utility for managing data schema versions. Allows you to migrate between versions, migrate to latest version, and provide version maps for backwards compatibility.

The use case that inspired the library was managing items in a noSQL database that could be in the shape of various versions of their schema, migrating those items to the latest versions and providing backwards compatibility through the version map feature.

-  Supports async upgrade/downgrade migrations
-  Typescript support
-  Lightweight, no dependencies

## Usage

### Defining Schema Versions

-  Extend the SchemaVersion class to define and version and it's migration (up/down) methods.
-  Typically an initial version will only have an up migration, latest version will only have a down migration, and between methods will have both up and down migrations.
-  Use the SchemaVersionController to link the SchemaVersions together.

```js
export namespace User {
 export interface V1 {
  firstName: string;
  type: string;
  common: string;
  schemaVersion: 1; // schemaVersion attribute is required in each schema
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

export class UserV1 extends SchemaVersion<User.V1> {
 up = () => {
  return new UserV2({
   ...this.item,
   lastName: "lastName",
   type: parseInt(this.item.type),
   schemaVersion: 2,
  });
 };
}

export class UserV2 extends SchemaVersion<User.V2> {
 down = () => {
  return new UserV1({
   firstName: this.item.firstName,
   type: String(this.item.type),
   common: this.item.common,
   schemaVersion: 1,
  });
 };

 up = async () => {
  await setTimeout(1000); // Simulating async

  return new UserV3({
   fullName: this.item.firstName + " " + this.item.lastName,
   type: this.item.type,
   common: this.item.common,
   schemaVersion: 3,
  });
 };
}

export class UserV3 extends SchemaVersion<User.V3> {
 down = async () => {
  const [firstName, lastName] = this.item.fullName.split(" ");

  await setTimeout(1000); // Simulating async

  return new UserV2({
   firstName,
   lastName,
   type: this.item.type,
   common: this.item.common,
   schemaVersion: 2,
  });
 };
}

export const User = new SchemaVersionController({
 [1]: UserV1,
 [2]: UserV2,
 [3]: UserV3,
});
```

### Using Version Item Methods

```js
const v1 = new User.Item({
	firstName: "firstName",
	type: "1",
	common: "common",
	schemaVersion: 1,
});

const itemData = v1.item; // returns the item data

const itemDataLatest = await v1.itemLatest; // returns the item data migrated to latest version (v3)

const itemDataMap = await v1.map; // returns the item data migrated to all versions and mapped by schemaVersion attribute

const v2 = await v1.vUp; // Migrated to schemaVersion 2

const v1_2 = await v2.vDown; // Migrated back to schemaVersion 1

const v3 = await v1.vMax; // Migrated through to schemaVersion 3

const v1_3 = await v3.vMin; // Migrated back through to schemaVersion 1

const vMap = await v1.vMap; // Returns a map of version items
```
