/* eslint-disable */
/**
 * Generated server utilities for Convex backend functions.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import {
  ActionBuilder,
  HttpActionBuilder,
  MutationBuilder,
  QueryBuilder,
  GenericActionCtx,
  GenericMutationCtx,
  GenericQueryCtx,
  GenericDatabaseReader,
  GenericDatabaseWriter,
} from "convex/server";
import type { DataModel } from "./dataModel.js";

/**
 * Define a query in this Convex app's public API.
 */
export declare const query: QueryBuilder<DataModel, "public">;

/**
 * Define a mutation in this Convex app's public API.
 */
export declare const mutation: MutationBuilder<DataModel, "public">;

/**
 * Define an action in this Convex app's public API.
 */
export declare const action: ActionBuilder<DataModel, "public">;

/**
 * Define an HTTP action in this Convex app's public API.
 */
export declare const httpAction: HttpActionBuilder;

/**
 * A type for the Convex query context.
 */
export type QueryCtx = GenericQueryCtx<DataModel>;

/**
 * A type for the Convex mutation context.
 */
export type MutationCtx = GenericMutationCtx<DataModel>;

/**
 * A type for the Convex action context.
 */
export type ActionCtx = GenericActionCtx<DataModel>;

/**
 * A type for the Convex database reader.
 */
export type DatabaseReader = GenericDatabaseReader<DataModel>;

/**
 * A type for the Convex database writer.
 */
export type DatabaseWriter = GenericDatabaseWriter<DataModel>;
