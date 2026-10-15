/**
 * Teaching dial-plan simulator.
 * The trace follows rules Cisco documents for Webex Calling locations, dial plans,
 * premises PSTN, and emergency calling. It is not the Control Hub routing engine.
 * Precedence among internal extensions, routing prefixes, and dial-plan patterns
 * is called out in the trace as a lab model.
 */

export const DIAL_CITES = {
  org: "https://help.webex.com/en-us/article/njvdjf2/Configure-Webex-Calling-for-your-organization",
  trunks: "https://help.webex.com/en-us/article/n0xb944/Configure-trunks,-route-groups,-and-dial-plans-for-Webex-Calling",
  workflow: "https://help.webex.com/article/32gfts/Webex-Calling-Configuration-Workflow",
  e911: "https://help.webex.com/en-us/article/av6oo3",
  wxcc: "https://help.webex.com/en-us/article/2dputx/Set-up-voice-channels-for-Webex-Contact-Center",
};

const DEFAULTS = {
  dialed: "",
  extensionLength: 4,
  externalDigit: "9",
  locationName: "Richmond",
  routingPrefix: "21",
  otherLocations: [{ name: "Austin", prefix: "22", extensionLength: 4 }],
  patterns: [{ pattern: "+1804555XXXX", route: "Trunk LGW-Richmond" }],
  pstn: "lgw",
  origin: "webex-user",
  trunkCount: 1,
  emergencyProvider: "redsky",
  emergencyEnabled: true,
};

export function sampleDialInput() {
  return {
    dialed: "918045551234",
    extensionLength: DEFAULTS.extensionLength,
    externalDigit: DEFAULTS.externalDigit,
    locationName: DEFAULTS.locationName,
    routingPrefix: DEFAULTS.routingPrefix,
    otherLocations: DEFAULTS.otherLocations.map((row) => ({ ...row })),
    patterns: DEFAULTS.patterns.map((row) => ({ ...row })),
    pstn: "lgw",
    origin: "webex-user",
    trunkCount: 1,
    emergencyProvider: "redsky",
    emergencyEnabled: true,
  };
}

export function matchPattern(number, pattern) {
  if (number.length !== pattern.length) return false;
  for (let i = 0; i < pattern.length; i += 1) {
    const token = pattern[i];
    const char = number[i];
    if (token === "X" || token === "x") {
      if (!/\d/.test(char)) return false;
    } else if (token !== char) return false;
  }
  return true;
}

function digitsOnly(value) {
  return /^\d+$/.test(value);
}

function normalizeUsExample(value) {
  if (value.startsWith("+")) {
    return { value, note: "Already in a + form. Left unchanged." };
  }
  if (digitsOnly(value) && value.length === 11 && value.startsWith("1")) {
    return { value: `+${value}`, note: "US teaching example: an 11-digit number starting with 1 is shown as +E.164." };
  }
  if (digitsOnly(value) && value.length === 10) {
    return { value: `+1${value}`, note: "US teaching example: a 10-digit number is shown as +1. This is not a worldwide Webex rule." };
  }
  return { value, note: "No US teaching normalization applied. International habits depend on the location dialing settings." };
}

function isEmergency(value) {
  return value === "911" || value === "933";
}

/**
 * @param {Partial<typeof DEFAULTS>} raw
 */
export function simulateDial(raw) {
  const input = {
    ...DEFAULTS,
    ...raw,
    otherLocations: raw?.otherLocations || DEFAULTS.otherLocations,
    patterns: raw?.patterns || DEFAULTS.patterns,
  };
  const trace = [];
  const push = (rule, detail, cite) => trace.push({ rule, detail, cite });
  const dialed = String(input.dialed || "").trim().replace(/[\s()-]/g, "");
  const warnings = [];

  if (!dialed) {
    return {
      ok: false,
      route: "No route",
      normalized: "",
      warnings,
      trace: [{ rule: "Input", detail: "Enter a dialed string.", cite: DIAL_CITES.org }],
    };
  }

  push("Input", `Dialed string "${dialed}" from ${input.origin === "premises-pbx" ? "a premises PBX user" : "a Webex Calling user"} at ${input.locationName}.`, DIAL_CITES.org);

  const external = String(input.externalDigit || "");
  let national = dialed;
  if (external && dialed.startsWith(external) && dialed.length > external.length) {
    const rest = dialed.slice(external.length);
    if (isEmergency(rest) || rest.length >= Number(input.extensionLength)) {
      national = rest;
      push(
        "External dial digit",
        `Stripped the location external dialing digit "${external}". Remainder: ${national}.`,
        DIAL_CITES.org,
      );
    }
  }

  if (isEmergency(dialed) || isEmergency(national)) {
    const code = isEmergency(dialed) ? dialed : national;
    if (input.emergencyEnabled) {
      const provider = input.emergencyProvider === "intrado" ? "Intrado" : "RedSky";
      push(
        "Emergency",
        `${code} is treated as an emergency or 933 test call. This location is enabled for enhanced emergency calling, so the lab routes it to ${provider} rather than the ordinary PSTN dial plan.`,
        DIAL_CITES.e911,
      );
      return {
        ok: true,
        route: `${provider} enhanced emergency`,
        normalized: code,
        warnings,
        trace,
        emergency: true,
      };
    }
    push(
      "Emergency",
      `${code} is an emergency or 933 test pattern, but enhanced emergency calling is not enabled for this location. The lab sends it on the location PSTN path. International locations in Cisco's emergency calling article continue to use PSTN for emergency calling.`,
      DIAL_CITES.e911,
    );
    return {
      ok: true,
      route: `Location PSTN (${pstnLabel(input.pstn)}) emergency`,
      normalized: code,
      warnings,
      trace,
      emergency: true,
    };
  }

  const extLen = Number(input.extensionLength) || 0;
  if (extLen > 0 && digitsOnly(national) && national.length === extLen) {
    push(
      "Internal extension",
      `${national} matches this location's extension length (${extLen}), so the lab keeps it inside ${input.locationName}.`,
      DIAL_CITES.org,
    );
    return finishInternal(trace, warnings, `${input.locationName} extension ${national}`, national, input);
  }

  for (const site of input.otherLocations) {
    const prefix = String(site.prefix || "");
    const len = Number(site.extensionLength) || extLen;
    if (prefix && national.startsWith(prefix)) {
      const rest = national.slice(prefix.length);
      if (digitsOnly(rest) && rest.length === len) {
        push(
          "Routing prefix",
          `${national} starts with routing prefix ${prefix} for ${site.name}, and the remainder ${rest} matches that location's extension length.`,
          DIAL_CITES.org,
        );
        return finishInternal(trace, warnings, `${site.name} extension ${rest}`, national, input);
      }
    }
  }

  const normalized = normalizeUsExample(national);
  push("Normalize", normalized.note, DIAL_CITES.workflow);

  for (const row of input.patterns) {
    if (!row.pattern) continue;
    if (matchPattern(normalized.value, row.pattern)) {
      push(
        "Dial plan",
        `${normalized.value} matches dial pattern ${row.pattern}. Cisco documents that a dial plan names the trunk or route group used when a pattern matches. This pattern's routing choice is ${row.route}.`,
        DIAL_CITES.trunks,
      );
      return finishRoute(trace, warnings, row.route, normalized.value, input, false);
    }
  }

  push(
    "Dial plan",
    "No configured dial pattern matched. Cisco documents that Webex Calling sends calls that do not match Webex Calling destinations to the local gateway when premises PSTN is in use. Cloud PSTN is the path for Webex Calling users when that is the location's PSTN connection.",
    input.pstn === "lgw" ? DIAL_CITES.workflow : DIAL_CITES.trunks,
  );

  if (input.pstn === "lgw") {
    return finishRoute(trace, warnings, "Location local gateway (unmatched destination)", normalized.value, input, true);
  }
  return finishRoute(trace, warnings, `Cloud PSTN (${pstnLabel(input.pstn)})`, normalized.value, input, true);
}

function finishInternal(trace, warnings, route, normalized, input) {
  if (Number(input.trunkCount) > 1 && input.pstn === "lgw") {
    warnings.push("This location is set to premises PSTN with more than one trunk. Cisco documents that you cannot choose more than one trunk for a location with premises-based PSTN.");
  }
  return { ok: true, route, normalized, warnings, trace, emergency: false };
}

function finishRoute(trace, warnings, route, normalized, input, cloudDefault) {
  const wantsCloud = input.pstn !== "lgw" && cloudDefault;
  if (input.origin === "premises-pbx" && wantsCloud) {
    trace.push({
      rule: "Premises origin",
      detail: "Blocked. Cisco documents that calls originating from premises users cannot access cloud PSTN (Cisco PSTN or Cloud Connected PSTN). Cloud PSTN provides PSTN access for Webex Calling users.",
      cite: DIAL_CITES.trunks,
    });
    return { ok: false, route: "Blocked: premises user to cloud PSTN", normalized, warnings, trace, emergency: false };
  }
  if (input.pstn === "lgw" && Number(input.trunkCount) > 1) {
    warnings.push("Cisco documents that you cannot choose more than one trunk for a location with premises-based PSTN. The same trunk may be selected for multiple locations.");
    trace.push({
      rule: "Trunk limit",
      detail: warnings[warnings.length - 1],
      cite: DIAL_CITES.org,
    });
  }
  if (input.pstn === "lgw") {
    trace.push({
      rule: "Local gateway",
      detail: "Premises-based PSTN uses a local gateway trunk. Control Hub provides parameters that are mapped onto the gateway, such as a Cisco CUBE.",
      cite: DIAL_CITES.org,
    });
  }
  return { ok: true, route, normalized, warnings, trace, emergency: false };
}

function pstnLabel(pstn) {
  if (pstn === "cisco") return "Cisco Calling Plan";
  if (pstn === "ccp") return "Cloud Connected PSTN";
  return "Local Gateway";
}
