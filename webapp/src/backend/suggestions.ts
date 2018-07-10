import escapeRegExp from "lodash-es/escapeRegExp";

import { CollectionName } from "@/model/models";
import { MongoClient } from "./mongo";

interface SuggestResult {
  _id: string;
  values: string[];
}

export type SuggestionProvider = (t: string) => Promise<string[]>;

export function suggestCounties(prefix: string): Promise<string[]> {
  return getAggregation<SuggestResult>(CollectionName.Property, "counties", { re: `^${escapeRegExp(prefix)}` })
    .map(o => o.values)
    .defaultIfEmpty([])
    .take(1);
}
