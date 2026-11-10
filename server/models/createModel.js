import mongoose from "mongoose";
import { definitions } from "../config/schema.js";
function field(spec) {
  let result;
  if (spec.bsonType === "object") {
    result = {
      type: new mongoose.Schema(properties(spec), {
        _id: false,
        strict: "throw",
      }),
      default: undefined,
    };
  } else if (spec.bsonType === "array") {
    result = { type: [field(spec.items)], default: undefined };
  } else {
    const types = {
      string: String,
      objectId: mongoose.Schema.Types.ObjectId,
      date: Date,
      bool: Boolean,
      int: Number,
    };
    result = {
      type: Array.isArray(spec.bsonType) ? Number : types[spec.bsonType],
    };
    if (!result.type)
      throw new Error(`Unsupported BSON type: ${spec.bsonType}`);
  }
  if (spec.enum) result.enum = spec.enum;
  if (spec.pattern) result.match = new RegExp(spec.pattern);
  if (spec.maxLength !== undefined) result.maxlength = spec.maxLength;
  if (spec.minLength !== undefined) result.minlength = spec.minLength;
  if (spec.minimum !== undefined) result.min = spec.minimum;
  if (spec.maximum !== undefined) result.max = spec.maximum;
  if (spec.bsonType === "int")
    result.validate = {
      validator: Number.isInteger,
      message: "Must be an integer",
    };
  return result;
}
function properties(spec) {
  return Object.fromEntries(
    Object.entries(spec.properties)
      .filter(([key]) => key !== "_id")
      .map(([key, value]) => [
        key,
        { ...field(value), required: spec.required?.includes(key) ?? false },
      ]),
  );
}

export function createModel(name) {
  const definition = definitions[name];
  const schema = new mongoose.Schema(
    properties(definition.validator.$jsonSchema),
    {
      collection: name,
      timestamps: true,
      versionKey: false,
      strict: "throw",
      autoIndex: false,
      autoCreate: false,
    },
  );
  schema.path("createdAt").default(Date.now);
  schema.path("updatedAt").default(Date.now);
  for (const { key, ...options } of definition.indexes)
    schema.index(key, options);
  if (name === "admins") schema.path("passwordHash").select(false);
  if (name === "admin_sessions") schema.path("tokenHash").select(false);
  return mongoose.models[name] ?? mongoose.model(name, schema);
}
