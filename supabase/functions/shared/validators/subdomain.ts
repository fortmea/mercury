import { SupabaseClient } from "jsr:@supabase/supabase-js@2";
import { Filter } from "npm:bad-words";
import { reservedDomains } from "./reserved.ts";
const subdomainRegExp = new RegExp(
  "[A-Za-z0-9](?:[A-Za-z0-9\-]{0,61}[A-Za-z0-9])?",
);
const pointsToRegExp = new RegExp(
  "([a-z0-9A-Z]\.)*[a-z0-9-]+\.([a-z0-9]{2,24})+(\.co\.([a-z0-9]{2,24})|\.([a-z0-9]{2,24}))*",
);

const ipAddressRegExp = new RegExp(
  "^(?:2[0-4][0-9]|25[0-5]|1?[0-9]?[0-9])\\.(?:2[0-4][0-9]|25[0-5]|1?[0-9]?[0-9])\\.(?:2[0-4][0-9]|25[0-5]|1?[0-9]?[0-9])\\.(?:2[0-4][0-9]|25[0-5]|1?[0-9]?[0-9])$",
  "gm",
);

export async function validateSubDomain(
  name: string,
  pointsTo: string,
  supabaseClient: SupabaseClient,
  type: number,
): Promise<boolean> {
  const subdomain = name.split(".e-um.dev.br")[0];
  const profanityFilter = new Filter();
  reservedDomains.forEach((value) => {
    profanityFilter.addWords(value);
  });

  const { data, error } = await supabaseClient.from(
    "records",
  ).select(
    "*",
  ).eq(
    "name",
    name,
  ).limit(1);
  let pointsToValid = false;
  if (type == 1) {
    pointsToValid = pointsTo.match(pointsToRegExp)?.[0] == pointsTo;
  } else {
    pointsToValid = pointsTo.match(ipAddressRegExp)?.[0] == pointsTo;
  }

  const valid = (!profanityFilter.isProfane(subdomain) && data?.length == 0) &&
    error == null &&
    name.match(subdomainRegExp)?.[0] == name.split(".")[0] &&
    pointsToValid == true;
  return valid;
}
