/* file:// mirror of data/media.json. HTTP pages read the JSON directly.
   Keep this assignment in sync when media.json changes. */
window.CANON_MEDIA = {
  "T1-R01": [
    {
      "type": "image",
      "src": "assets/media/T1-R01/hero.svg",
      "title": "Control Hub Foundations",
      "caption": "Original illustration of the organization boundary. Control Hub is the console for users, roles, locations, services, and devices.",
      "section": "hdr"
    },
    {
      "type": "svg",
      "src": "assets/media/T1-R01/arch.svg",
      "title": "What sits inside one organization",
      "caption": "Control Hub is the documented dashboard. Sister technologies sit beside the org; this room does not configure them.",
      "section": "map"
    },
    {
      "type": "flow",
      "src": "assets/media/T1-R01/flow-provision.svg",
      "title": "One admin change, end to end",
      "caption": "Accepting terms creates the organization. The activation email is the sign-in identity used to set the administrator password.",
      "section": "flow"
    },
    {
      "type": "flow",
      "src": "assets/media/T1-R01/flow-role.svg",
      "title": "From a person with no rights",
      "caption": "People you add start with no administrative privileges. A full administrator assigns prebuilt roles.",
      "section": "core"
    },
    {
      "type": "video",
      "src": "assets/media/T1-R01/explainer.svg",
      "title": "How an organization becomes manageable",
      "caption": "Loop of the first Control Hub path: create the org, then grant a role that was not there at the start.",
      "section": "eco"
    }
  ],
  "T1-R02": [
    {
      "type": "image",
      "src": "assets/media/T1-R02/hero.svg",
      "title": "Identity and Directory Sync",
      "caption": "Original illustration of two identity paths into one cloud uid.",
      "section": "hdr"
    },
    {
      "type": "svg",
      "src": "assets/media/T1-R02/arch.svg",
      "title": "Where identity is born",
      "caption": "Three provisioning paths still resolve to one uid. Sister products are neighbors, not sync targets in this room.",
      "section": "map"
    },
    {
      "type": "flow",
      "src": "assets/media/T1-R02/flow-dirsync.svg",
      "title": "From a domain account to a cloud uid",
      "caption": "Directory Connector is one Windows instance per Active Directory domain. A dry run belongs before a live sync.",
      "section": "flow"
    },
    {
      "type": "flow",
      "src": "assets/media/T1-R02/flow-sso.svg",
      "title": "Two SSO mappings",
      "caption": "Org SSO and Partner SSO do not map the same attribute.",
      "section": "core"
    },
    {
      "type": "video",
      "src": "assets/media/T1-R02/explainer.svg",
      "title": "Pick the path before you name the attribute",
      "caption": "Directory Connector, SCIM, and the two SSO mappings are different doors into the same uid.",
      "section": "eco"
    }
  ],
  "T1-R03": [
    {
      "type": "image",
      "src": "assets/media/T1-R03/hero.svg",
      "title": "Licensing and Subscriptions",
      "caption": "Original illustration of automatic license assignment, and the Calling case that still waits.",
      "section": "hdr"
    },
    {
      "type": "svg",
      "src": "assets/media/T1-R03/arch.svg",
      "title": "Where a license is decided",
      "caption": "The template grants services. Calling still has a number step this room separates from the grant.",
      "section": "map"
    },
    {
      "type": "flow",
      "src": "assets/media/T1-R03/flow-template.svg",
      "title": "Automatic assignment",
      "caption": "Automatic assignments grant Calling, Meetings, Messaging, and Contact Center when a person is added.",
      "section": "flow"
    },
    {
      "type": "flow",
      "src": "assets/media/T1-R03/flow-calling.svg",
      "title": "How a Calling license gets a number",
      "caption": "A Calling license is not the same moment as a usable number. The location still has to place the number.",
      "section": "core"
    },
    {
      "type": "video",
      "src": "assets/media/T1-R03/explainer.svg",
      "title": "Template first, then the Calling exception",
      "caption": "A license typed at creation skips the template. Calling still waits on a number.",
      "section": "eco"
    }
  ],
  "T1-R04": [
    {
      "type": "image",
      "src": "assets/media/T1-R04/hero.svg",
      "title": "Locations and Sites",
      "caption": "Original illustration of one physical address anchoring users and workspaces.",
      "section": "hdr"
    },
    {
      "type": "svg",
      "src": "assets/media/T1-R04/arch.svg",
      "title": "One address, then the objects that live there",
      "caption": "The address is the anchor. Changing it is not a casual edit; the room treats the location as the Calling container.",
      "section": "map"
    },
    {
      "type": "flow",
      "src": "assets/media/T1-R04/flow-address.svg",
      "title": "From an address to a Calling tab",
      "caption": "Webex generates a Location ID. A user and a workspace each belong to one location.",
      "section": "flow"
    },
    {
      "type": "flow",
      "src": "assets/media/T1-R04/flow-objects.svg",
      "title": "What may live at one location",
      "caption": "Users and workspaces are both fenced to a single location.",
      "section": "core"
    },
    {
      "type": "video",
      "src": "assets/media/T1-R04/explainer.svg",
      "title": "The address is the anchor",
      "caption": "Do not treat a user as free to float across locations.",
      "section": "eco"
    }
  ],
  "T1-R05": [
    {
      "type": "image",
      "src": "assets/media/T1-R05/hero.svg",
      "title": "Admin Roles and Partner Admin",
      "caption": "Original illustration of the role fence: organization admins and location administrators are not the same grant.",
      "section": "hdr"
    },
    {
      "type": "svg",
      "src": "assets/media/T1-R05/arch.svg",
      "title": "Who can change the organization",
      "caption": "The matrix is the org role. The location fence is a narrower grant.",
      "section": "map"
    },
    {
      "type": "flow",
      "src": "assets/media/T1-R05/flow-role.svg",
      "title": "From no rights to a usable role",
      "caption": "Partner setup makes that administrator the full administrator. Later roles are assigned in the user summary.",
      "section": "flow"
    },
    {
      "type": "flow",
      "src": "assets/media/T1-R05/flow-group.svg",
      "title": "Roles on a group",
      "caption": "A full administrator can assign roles to Webex groups. The room names a cap of 20 roles on that path.",
      "section": "core"
    },
    {
      "type": "video",
      "src": "assets/media/T1-R05/explainer.svg",
      "title": "Assign, then wait for the session",
      "caption": "A saved role is not instantly usable. The room allows up to 10 minutes.",
      "section": "eco"
    }
  ],
  "T1-R06": [
    {
      "type": "image",
      "src": "assets/media/T1-R06/hero.svg",
      "title": "Analytics and Troubleshooting",
      "caption": "Original illustration of three clocks that must not be mixed.",
      "section": "hdr"
    },
    {
      "type": "svg",
      "src": "assets/media/T1-R06/arch.svg",
      "title": "Three evidence stores",
      "caption": "Troubleshooting, analytics, and client logs answer different questions because they keep different clocks.",
      "section": "map"
    },
    {
      "type": "flow",
      "src": "assets/media/T1-R06/flow-complaint.svg",
      "title": "From a complaint to a file",
      "caption": "Pick the store whose clock matches the question before you search.",
      "section": "flow"
    },
    {
      "type": "flow",
      "src": "assets/media/T1-R06/flow-clocks.svg",
      "title": "Three clocks",
      "caption": "Mixing these windows is how a ticket goes looking in the wrong store.",
      "section": "core"
    },
    {
      "type": "video",
      "src": "assets/media/T1-R06/explainer.svg",
      "title": "Name the clock before the search",
      "caption": "A missing call in analytics is not the same fact as a missing call in the 21-day troubleshooting view.",
      "section": "eco"
    }
  ],
  "T1-R07": [
    {
      "type": "image",
      "src": "assets/media/T1-R07/hero.svg",
      "title": "Data Residency and Security",
      "caption": "Original illustration of a country choice that permanently sets the GEO for users and keys.",
      "section": "hdr"
    },
    {
      "type": "svg",
      "src": "assets/media/T1-R07/arch.svg",
      "title": "Three residency decisions, one Account page",
      "caption": "Residency is per service. The country click is not a later toggle.",
      "section": "map"
    },
    {
      "type": "flow",
      "src": "assets/media/T1-R07/flow-geo.svg",
      "title": "From country selection to the Account page",
      "caption": "The country you select while provisioning permanently sets the GEO for users and encryption keys.",
      "section": "flow"
    },
    {
      "type": "flow",
      "src": "assets/media/T1-R07/flow-region.svg",
      "title": "Identity stays in region",
      "caption": "Authentication requests are processed in the region. Key requests are created and served from that residency.",
      "section": "core"
    },
    {
      "type": "video",
      "src": "assets/media/T1-R07/explainer.svg",
      "title": "The country click is the one you cannot undo",
      "caption": "Do not teach a later move between GEO locations. The room says Webex does not currently support it.",
      "section": "eco"
    }
  ],
  "T2-R01": [
    {
      "type": "image",
      "src": "assets/media/T2-R01/hero.svg",
      "title": "Calling Architecture Overview",
      "caption": "Original illustration of endpoints registering to multi-tenant Webex Calling, with the local gateway as the premises bridge.",
      "section": "hdr"
    },
    {
      "type": "svg",
      "src": "assets/media/T2-R01/arch.svg",
      "title": "Cloud registration, premises bridge",
      "caption": "The local gateway is the bridge. It is not the registrar for the phones.",
      "section": "map"
    },
    {
      "type": "flow",
      "src": "assets/media/T2-R01/flow-register.svg",
      "title": "Endpoint registration",
      "caption": "In the Unified CM migration guide, endpoints register to multi-tenant Webex Calling. The local gateway is not that registrar.",
      "section": "flow"
    },
    {
      "type": "flow",
      "src": "assets/media/T2-R01/flow-plan.svg",
      "title": "From plan data to a registered gateway",
      "caption": "Prepare the inventory, the location worksheet, directory, then first-time calling setup.",
      "section": "core"
    },
    {
      "type": "video",
      "src": "assets/media/T2-R01/explainer.svg",
      "title": "Phones register to the cloud",
      "caption": "Say multi-tenant Webex Calling when that is the guide's meaning. Dedicated Instance is a different track.",
      "section": "eco"
    }
  ],
  "T2-R02": [
    {
      "type": "image",
      "src": "assets/media/T2-R02/hero.svg",
      "title": "Local Gateway and PSTN Options",
      "caption": "Original illustration of the premises gateway between a carrier and Webex Calling.",
      "section": "hdr"
    },
    {
      "type": "svg",
      "src": "assets/media/T2-R02/arch.svg",
      "title": "Three ways a call reaches the PSTN",
      "caption": "Each location has one PSTN option. You may mix options across locations.",
      "section": "map"
    },
    {
      "type": "flow",
      "src": "assets/media/T2-R02/flow-inbound.svg",
      "title": "Inbound PSTN through a Local Gateway",
      "caption": "Premises PSTN arrives at the Local Gateway, then Webex Calling, then the user. Signaling to Webex Calling is SIP over TLS. Media is SRTP.",
      "section": "flow"
    },
    {
      "type": "flow",
      "src": "assets/media/T2-R02/flow-choices.svg",
      "title": "One location, one PSTN option",
      "caption": "Cisco documents three PSTN choices. Each location has one. Locations in the same org may differ.",
      "section": "core"
    },
    {
      "type": "flow",
      "src": "assets/media/T2-R02/flow-sip.svg",
      "title": "Study ladder for a Local Gateway dialog",
      "caption": "A study drawing of INVITE, 100, 180, 200, and ACK across PSTN, Local Gateway, and Webex Calling. Not a captured trace.",
      "section": "config"
    },
    {
      "type": "video",
      "src": "assets/media/T2-R02/explainer.svg",
      "title": "The gateway is not the registrar",
      "caption": "Registration-based trunks stop at 250 concurrent calls and CUBE only. Certificate-based trunks are the larger, multi-device model.",
      "section": "eco"
    }
  ],
  "T2-R03": [
    {
      "type": "image",
      "src": "assets/media/T2-R03/hero.svg",
      "title": "Dial Plans, PSTN and Routing",
      "caption": "Original illustration of a short extension leaving the cloud through a route group.",
      "section": "hdr"
    },
    {
      "type": "svg",
      "src": "assets/media/T2-R03/arch.svg",
      "title": "From a digit string to a trunk",
      "caption": "Enterprise dial plans are global. The pattern language has two wildcards the room treats as illegal in this context.",
      "section": "map"
    },
    {
      "type": "flow",
      "src": "assets/media/T2-R03/flow-extension.svg",
      "title": "How a short extension leaves the cloud",
      "caption": "Internal dialing is set on the organization. The location adds a unique prefix. The route group points at trunks.",
      "section": "flow"
    },
    {
      "type": "flow",
      "src": "assets/media/T2-R03/flow-dialplan.svg",
      "title": "Global dial plan",
      "caption": "A dial plan is global and has one routing choice: a trunk or a route group.",
      "section": "core"
    },
    {
      "type": "video",
      "src": "assets/media/T2-R03/explainer.svg",
      "title": "Digits, then the route group",
      "caption": "Add trunks before you expect the route group to have somewhere to send the call.",
      "section": "eco"
    }
  ],
  "T2-R04": [
    {
      "type": "image",
      "src": "assets/media/T2-R04/hero.svg",
      "title": "Devices and Provisioning",
      "caption": "Original illustration of a phone joining by MAC address or by activation code.",
      "section": "hdr"
    },
    {
      "type": "svg",
      "src": "assets/media/T2-R04/arch.svg",
      "title": "Two ways onto the cloud",
      "caption": "A blank MAC generates the code. The code lifetime depends on the device family.",
      "section": "map"
    },
    {
      "type": "flow",
      "src": "assets/media/T2-R04/flow-code.svg",
      "title": "From a blank MAC to a registered phone",
      "caption": "Copy, email, or print the 16 digits. MPP codes last 30 days. Room device codes last 7 days.",
      "section": "flow"
    },
    {
      "type": "flow",
      "src": "assets/media/T2-R04/flow-claim.svg",
      "title": "Two claim methods",
      "caption": "CSV device types the room names are IP, WEBEX, and WEBEX_CALLING.",
      "section": "core"
    },
    {
      "type": "video",
      "src": "assets/media/T2-R04/explainer.svg",
      "title": "MAC or code, then the phone registers",
      "caption": "Do not swap the MPP and Room code lifetimes.",
      "section": "eco"
    }
  ],
  "T2-R05": [
    {
      "type": "image",
      "src": "assets/media/T2-R05/hero.svg",
      "title": "Call Features",
      "caption": "Original illustration of Calling features under Services, Calling, Features. These are not contact-center queues.",
      "section": "hdr"
    },
    {
      "type": "svg",
      "src": "assets/media/T2-R05/arch.svg",
      "title": "Five objects under Calling features",
      "caption": "Hunt groups, call queues, auto attendants, call pickup, and feature access codes are location features. A contact-center queue is a different product.",
      "section": "map"
    },
    {
      "type": "flow",
      "src": "assets/media/T2-R05/flow-aa.svg",
      "title": "From a feature card to a member",
      "caption": "When a hunt group or a call queue sends a call to an agent, that agent's call forwarding does not apply.",
      "section": "flow"
    },
    {
      "type": "flow",
      "src": "assets/media/T2-R05/flow-fac.svg",
      "title": "Hunt group busy codes",
      "caption": "Only an administrator enables hunt group busy, unless agents are allowed to use the FAC codes.",
      "section": "core"
    },
    {
      "type": "video",
      "src": "assets/media/T2-R05/explainer.svg",
      "title": "Calling features are not contact-center queues",
      "caption": "Call-queue size is 250. The article says not to set calls in queue to 0, because incoming calls are then not allowed.",
      "section": "eco"
    }
  ],
  "T2-R06": [
    {
      "type": "image",
      "src": "assets/media/T2-R06/hero.svg",
      "title": "Calling Security and Compliance",
      "caption": "Original illustration of transport security, opportunistic end-to-end encryption, and the 933 test.",
      "section": "hdr"
    },
    {
      "type": "svg",
      "src": "assets/media/T2-R06/arch.svg",
      "title": "What protects a call",
      "caption": "TLS, SRTP, and Calling E2EE do not stack into one switch. Recording processes media, so E2EE stays off when a recording is required.",
      "section": "map"
    },
    {
      "type": "flow",
      "src": "assets/media/T2-R06/flow-tls.svg",
      "title": "Transport before encryption claims",
      "caption": "Confirm TLS 1.2 or 1.3 and AES_CM_128_HMAC_SHA1_80 before you talk about end-to-end encryption.",
      "section": "flow"
    },
    {
      "type": "flow",
      "src": "assets/media/T2-R06/flow-e911.svg",
      "title": "Decide in the room's order",
      "caption": "PSTN, premises trunks, conferences, recording, auto attendant, voice portal, shared lines, and virtual lines are named E2EE exclusions. A 933 call tests email generation and does not alert public safety.",
      "section": "core"
    },
    {
      "type": "video",
      "src": "assets/media/T2-R06/explainer.svg",
      "title": "Three locks, and they do not stack",
      "caption": "Calling E2EE is enabled under Services, Calling, Settings, on the Webex App tab. It is not the same switch as SRTP.",
      "section": "eco"
    }
  ],
  "T2-R07": [
    {
      "type": "image",
      "src": "assets/media/T2-R07/hero.svg",
      "title": "Survivability Gateway",
      "caption": "Original illustration of phones that normally register to the cloud and fall back to a local survivability gateway.",
      "section": "hdr"
    },
    {
      "type": "svg",
      "src": "assets/media/T2-R07/arch.svg",
      "title": "Active mode, then the local gateway",
      "caption": "Survivability is a registration fallback. It is not a second full Calling feature set.",
      "section": "map"
    },
    {
      "type": "flow",
      "src": "assets/media/T2-R07/flow-active.svg",
      "title": "Active registration",
      "caption": "In Active mode, endpoints register to the Webex cloud.",
      "section": "flow"
    },
    {
      "type": "flow",
      "src": "assets/media/T2-R07/flow-survive.svg",
      "title": "When the cloud path fails",
      "caption": "Endpoints register to a Survivability Gateway on the local network and keep basic calling, then return to the cloud.",
      "section": "core"
    },
    {
      "type": "video",
      "src": "assets/media/T2-R07/explainer.svg",
      "title": "Fallback registration, then return",
      "caption": "Do not describe the survivability gateway as the everyday registrar.",
      "section": "eco"
    }
  ],
  "T2-R08": [
    {
      "type": "image",
      "src": "assets/media/T2-R08/hero.svg",
      "title": "Calling Analytics and CDR",
      "caption": "Original illustration of two grains: a KPI call and a call-leg row.",
      "section": "hdr"
    },
    {
      "type": "svg",
      "src": "assets/media/T2-R08/arch.svg",
      "title": "Where a Calling number is born",
      "caption": "A KPI call is not the same object as a call-leg row. Read the grain before you quote the number.",
      "section": "map"
    },
    {
      "type": "flow",
      "src": "assets/media/T2-R08/flow-read.svg",
      "title": "Read a Calling report in order",
      "caption": "Open Calling historical data, pick a range of at most 3 months, then separate the KPI call from the leg rows.",
      "section": "flow"
    },
    {
      "type": "flow",
      "src": "assets/media/T2-R08/flow-rows.svg",
      "title": "How many rows",
      "caption": "Two rows if both users are registered. One terminating row if the caller is PSTN.",
      "section": "core"
    },
    {
      "type": "video",
      "src": "assets/media/T2-R08/explainer.svg",
      "title": "One dashboard, two grains",
      "caption": "Do not quote a KPI total as if it were a count of call-leg rows.",
      "section": "eco"
    }
  ],
  "T3-R01": [
    {
      "type": "image",
      "src": "assets/media/T3-R01/hero.svg",
      "title": "WxCC Multi-tenant Overview",
      "caption": "Original illustration of the multi-tenant contact center, which is not the Enterprise product that inherits UCCE.",
      "section": "hdr"
    },
    {
      "type": "svg",
      "src": "assets/media/T3-R01/arch.svg",
      "title": "From a phone number to an agent",
      "caption": "Name the product before you name the boxes. Webex Contact Center Enterprise is T4, not this picture.",
      "section": "map"
    },
    {
      "type": "flow",
      "src": "assets/media/T3-R01/flow-voice.svg",
      "title": "One inbound voice contact",
      "caption": "A telephony contact enters at the entry point, takes the flow the strategy selects, waits on a queue, and reaches an agent.",
      "section": "flow"
    },
    {
      "type": "flow",
      "src": "assets/media/T3-R01/flow-names.svg",
      "title": "Two products that share a nickname",
      "caption": "If the paperwork says Webex Contact Center without Enterprise, stay on this track.",
      "section": "core"
    },
    {
      "type": "video",
      "src": "assets/media/T3-R01/explainer.svg",
      "title": "Name the product before the boxes",
      "caption": "This track is the cloud contact center. It does not inherit the UCCE router.",
      "section": "eco"
    }
  ],
  "T3-R02": [
    {
      "type": "image",
      "src": "assets/media/T3-R02/hero.svg",
      "title": "Tenant Provisioning and Setup",
      "caption": "Original illustration of the setup wizard. The country of operation is the click you cannot undo.",
      "section": "hdr"
    },
    {
      "type": "svg",
      "src": "assets/media/T3-R02/arch.svg",
      "title": "What the wizard actually locks",
      "caption": "The country click is permanent for the tenant. Voice and digital setup come after that lock.",
      "section": "map"
    },
    {
      "type": "flow",
      "src": "assets/media/T3-R02/flow-wizard.svg",
      "title": "From the order to a tenant",
      "caption": "Review licenses, set the SIP address, confirm country and time zone, then Common Edge.",
      "section": "flow"
    },
    {
      "type": "flow",
      "src": "assets/media/T3-R02/flow-sip.svg",
      "title": "SIP name, then the edge",
      "caption": "Modify the SIP name if needed before you leave that step. Telephony next is Common Edge.",
      "section": "core"
    },
    {
      "type": "video",
      "src": "assets/media/T3-R02/explainer.svg",
      "title": "The country click is the one you cannot undo",
      "caption": "Do not teach a later country change as if the wizard allowed one.",
      "section": "eco"
    }
  ],
  "T3-R03": [
    {
      "type": "image",
      "src": "assets/media/T3-R03/hero.svg",
      "title": "Entry Points, Queues and Routing",
      "caption": "Original illustration of a telephony number entering through a routing strategy into a flow and a queue.",
      "section": "hdr"
    },
    {
      "type": "svg",
      "src": "assets/media/T3-R03/arch.svg",
      "title": "From number to agent",
      "caption": "Messaging and social flows are chosen in Webex Connect. This picture is the telephony routing layer.",
      "section": "map"
    },
    {
      "type": "flow",
      "src": "assets/media/T3-R03/flow-contact.svg",
      "title": "One telephony contact",
      "caption": "The entry point is the ingress. The flow is attached through a routing strategy. The queue picks an allowed agent.",
      "section": "flow"
    },
    {
      "type": "flow",
      "src": "assets/media/T3-R03/flow-strategy.svg",
      "title": "What a routing strategy is allowed to name",
      "caption": "A routing strategy is a window. The article still supports existing strategies and points you at Business Hours.",
      "section": "core"
    },
    {
      "type": "video",
      "src": "assets/media/T3-R03/explainer.svg",
      "title": "The strategy is a window, not the queue",
      "caption": "Team-assignment queues expand through call distribution groups. Agent-assignment queues name agents directly, up to 1000.",
      "section": "eco"
    }
  ],
  "T3-R04": [
    {
      "type": "image",
      "src": "assets/media/T3-R04/hero.svg",
      "title": "Agent Desktop and Supervisor",
      "caption": "Original illustration of a browser desktop: sign in, pick a team, then take a call a supervisor can monitor.",
      "section": "hdr"
    },
    {
      "type": "svg",
      "src": "assets/media/T3-R04/arch.svg",
      "title": "Sign-in, team, then a monitored call",
      "caption": "Agent Desktop is a browser. The supervisor path is listen first, barge only after that.",
      "section": "map"
    },
    {
      "type": "flow",
      "src": "assets/media/T3-R04/flow-signin.svg",
      "title": "From browser to a team",
      "caption": "The agent picks Desktop, Extension, or Dial Number, then a team. Default DN can be locked read-only.",
      "section": "flow"
    },
    {
      "type": "flow",
      "src": "assets/media/T3-R04/flow-barge.svg",
      "title": "From listen to barge",
      "caption": "Barge joins as a participant only after listen. Not during consult.",
      "section": "core"
    },
    {
      "type": "video",
      "src": "assets/media/T3-R04/explainer.svg",
      "title": "Listen, then barge",
      "caption": "Do not draw barge as a first click. The article requires listen first, and not during consult.",
      "section": "eco"
    }
  ],
  "T3-R05": [
    {
      "type": "image",
      "src": "assets/media/T3-R05/hero.svg",
      "title": "Voice Options",
      "caption": "Original illustration of the split between how the tenant reaches the PSTN and how the agent hears the contact.",
      "section": "hdr"
    },
    {
      "type": "svg",
      "src": "assets/media/T3-R05/arch.svg",
      "title": "PSTN choice and agent choice",
      "caption": "PSTN is one choice. The agent path is another. An existing Webex Calling subscription is used to connect voice into the contact center as well.",
      "section": "map"
    },
    {
      "type": "flow",
      "src": "assets/media/T3-R05/flow-pstn.svg",
      "title": "Choose PSTN, then the agent, then the login target",
      "caption": "Calls are routed into Webex Contact Center using Webex Calling PSTN services. The article says this allows routing without a separate Webex Calling subscription on older wording; new subscriptions include those PSTN services.",
      "section": "flow"
    },
    {
      "type": "flow",
      "src": "assets/media/T3-R05/flow-login.svg",
      "title": "Where the agent answers",
      "caption": "Extension match unlocks device choice. Map a DN on the entry point, not the location main number, for Webex Calling.",
      "section": "core"
    },
    {
      "type": "video",
      "src": "assets/media/T3-R05/explainer.svg",
      "title": "PSTN is one choice. The agent path is another.",
      "caption": "Do not collapse the agent's WebRTC login into the tenant's PSTN product.",
      "section": "eco"
    }
  ],
  "T3-R06": [
    {
      "type": "image",
      "src": "assets/media/T3-R06/hero.svg",
      "title": "Digital Channels",
      "caption": "Original illustration of digital channels arriving through Webex Connect and Webex Engage.",
      "section": "hdr"
    },
    {
      "type": "svg",
      "src": "assets/media/T3-R06/arch.svg",
      "title": "The order the channel article prints",
      "caption": "Six channels, two consoles, one ordering rule: provision, authorize, then the contact path.",
      "section": "map"
    },
    {
      "type": "flow",
      "src": "assets/media/T3-R06/flow-order.svg",
      "title": "Provision, authorize, then the contact path",
      "caption": "Admins sync inside a 7-day window. Authorize the nodes before you create channels.",
      "section": "flow"
    },
    {
      "type": "flow",
      "src": "assets/media/T3-R06/flow-channels.svg",
      "title": "Channels the article names",
      "caption": "Email's asset is the Control Hub exception. The others are social or messaging assets in the documented sequence.",
      "section": "core"
    },
    {
      "type": "video",
      "src": "assets/media/T3-R06/explainer.svg",
      "title": "Six channels, two consoles",
      "caption": "Do not start with the channel tile. The article authorizes the nodes first.",
      "section": "eco"
    }
  ],
  "T3-R07": [
    {
      "type": "image",
      "src": "assets/media/T3-R07/hero.svg",
      "title": "Analyzer and Reporting",
      "caption": "Original illustration of Analyzer clocks that must stay apart.",
      "section": "hdr"
    },
    {
      "type": "svg",
      "src": "assets/media/T3-R07/arch.svg",
      "title": "Where a number is born",
      "caption": "Two products and four clocks. Read a number without mixing the clock that produced it.",
      "section": "map"
    },
    {
      "type": "flow",
      "src": "assets/media/T3-R07/flow-number.svg",
      "title": "Read a number without mixing clocks",
      "caption": "Name the surface before you quote the value: real-time, historical, the desktop widget, or an AI Assistant report.",
      "section": "flow"
    },
    {
      "type": "flow",
      "src": "assets/media/T3-R07/flow-clocks.svg",
      "title": "Four places a contact-center number can be born",
      "caption": "The desktop widget does not share the historical session's clock.",
      "section": "core"
    },
    {
      "type": "video",
      "src": "assets/media/T3-R07/explainer.svg",
      "title": "Two products, four clocks",
      "caption": "A real-time tile and a historical total are not two measurements of the same grain.",
      "section": "eco"
    }
  ],
  "T3-R08": [
    {
      "type": "image",
      "src": "assets/media/T3-R08/hero.svg",
      "title": "Supervisor Experience",
      "caption": "Original illustration of a supervisor moving from a landing page to listen, then barge.",
      "section": "hdr"
    },
    {
      "type": "svg",
      "src": "assets/media/T3-R08/arch.svg",
      "title": "From sign-in to a barge",
      "caption": "Scheduled listening is a different action from an ad-hoc barge. The room keeps those sentences apart.",
      "section": "map"
    },
    {
      "type": "flow",
      "src": "assets/media/T3-R08/flow-barge.svg",
      "title": "From sign-in to a barge",
      "caption": "Find the call on the active interactions tab. Listen to one agent. Barge only after that, and not during consult.",
      "section": "flow"
    },
    {
      "type": "flow",
      "src": "assets/media/T3-R08/flow-landing.svg",
      "title": "Two landing-page sentences",
      "caption": "The landing page depends on which sentence and which role. Do not teach one home for every supervisor.",
      "section": "core"
    },
    {
      "type": "video",
      "src": "assets/media/T3-R08/explainer.svg",
      "title": "Listen before you join",
      "caption": "Scheduled listening is not the same click as barge on the active tab.",
      "section": "eco"
    }
  ],
  "T3-R09": [
    {
      "type": "image",
      "src": "assets/media/T3-R09/hero.svg",
      "title": "WFO and AI Features",
      "caption": "Original illustration of an AI Quality Management add-on that is not the same order as WFO Basic.",
      "section": "hdr"
    },
    {
      "type": "svg",
      "src": "assets/media/T3-R09/arch.svg",
      "title": "SKU, scope, then the flow edit",
      "caption": "Read the scope column before you click Save. Sentiment, Auto CSAT, and real-time transcription are also part of the AI Assistant SKU.",
      "section": "map"
    },
    {
      "type": "flow",
      "src": "assets/media/T3-R09/flow-qm.svg",
      "title": "Buy, scope, then publish",
      "caption": "The all-queue transcription path adds Start Media Stream on AgentAnswered, then you publish. Specific queues are a different path.",
      "section": "flow"
    },
    {
      "type": "flow",
      "src": "assets/media/T3-R09/flow-scope.svg",
      "title": "Enablement scope is not one switch",
      "caption": "Evaluation and Speech Analytics and Coaching Insights are organization scope. Sentiment and real-time transcription are queue scope. Auto CSAT is agent scope.",
      "section": "core"
    },
    {
      "type": "video",
      "src": "assets/media/T3-R09/explainer.svg",
      "title": "The AI SKU is not WFO Basic",
      "caption": "AgentAnswered plus Start Media Stream is the all-queue transcription path, not the specific-queue path.",
      "section": "eco"
    }
  ],
  "T4-R01": [
    {
      "type": "image",
      "src": "assets/media/T4-R01/hero.svg",
      "title": "WxCC Enterprise Overview",
      "caption": "Original illustration of five deployment names that are not one stack.",
      "section": "hdr"
    },
    {
      "type": "svg",
      "src": "assets/media/T4-R01/arch.svg",
      "title": "Five names, not one stack",
      "caption": "If the paperwork says Webex Contact Center without Enterprise, stop and open T3.",
      "section": "map"
    },
    {
      "type": "flow",
      "src": "assets/media/T4-R01/flow-name.svg",
      "title": "Name the product before the project",
      "caption": "Quick Deployment's as little as 10 days assumes no customizations. Custom work goes through A2Q.",
      "section": "flow"
    },
    {
      "type": "flow",
      "src": "assets/media/T4-R01/flow-names.svg",
      "title": "Five names",
      "caption": "Quick Deployment is an offer on Webex CCE. Dedicated Instance coexistence is an example, not the product.",
      "section": "core"
    },
    {
      "type": "video",
      "src": "assets/media/T4-R01/explainer.svg",
      "title": "Five names, not one stack",
      "caption": "Do not connect an existing on-premises contact center in that initial Quick Deployment. The page says not to.",
      "section": "eco"
    }
  ],
  "T4-R02": [
    {
      "type": "image",
      "src": "assets/media/T4-R02/hero.svg",
      "title": "Core Components",
      "caption": "Original illustration of the Unified CCE component set from the 15.0(1) serviceability chapter.",
      "section": "hdr"
    },
    {
      "type": "svg",
      "src": "assets/media/T4-R02/arch.svg",
      "title": "The 15.0(1) component set",
      "caption": "There is no single-server implementation. Duplex does not mean both sides are active for every component.",
      "section": "map"
    },
    {
      "type": "flow",
      "src": "assets/media/T4-R02/flow-inward.svg",
      "title": "Status and requests move inward",
      "caption": "The peripheral talks to a PIM. OPC normalizes events. The Router decides. The Logger stores. The HDS feeds CUIC.",
      "section": "flow"
    },
    {
      "type": "flow",
      "src": "assets/media/T4-R02/flow-duplex.svg",
      "title": "Duplex is not active-active everywhere",
      "caption": "Sides exist for redundancy. The PG hot-standby model is one active PG controlling the peripheral.",
      "section": "core"
    },
    {
      "type": "video",
      "src": "assets/media/T4-R02/explainer.svg",
      "title": "Requests move inward",
      "caption": "Unified CCE integrates only with the Cisco Unified Communications Manager IP PBX, in the sentence the serviceability guide states.",
      "section": "eco"
    }
  ],
  "T4-R03": [
    {
      "type": "image",
      "src": "assets/media/T4-R03/hero.svg",
      "title": "Call Flow Through WxCCE",
      "caption": "Original illustration of a route request moving from the routing client to a label the peripheral can deliver.",
      "section": "hdr"
    },
    {
      "type": "svg",
      "src": "assets/media/T4-R03/arch.svg",
      "title": "The route request the configuration guide prints",
      "caption": "Three independent systems work together: the routing client, the system software, and the peripheral.",
      "section": "map"
    },
    {
      "type": "flow",
      "src": "assets/media/T4-R03/flow-route.svg",
      "title": "Nine ideas, drawn as the path you can defend",
      "caption": "A routing request carries the dialed number, the calling line ID, and caller-entered digits. The script returns a target or a label.",
      "section": "flow"
    },
    {
      "type": "flow",
      "src": "assets/media/T4-R03/flow-cvp.svg",
      "title": "Send to VRU, two legs",
      "caption": "SendToVRU is Type 10. The room separates the switch leg and the VRU leg. Voice and signaling are not the same line.",
      "section": "core"
    },
    {
      "type": "video",
      "src": "assets/media/T4-R03/explainer.svg",
      "title": "Call type, script, route, label",
      "caption": "A peripheral is an ACD, a PBX, or Unified CM. The routing client delivers the label.",
      "section": "eco"
    }
  ],
  "T4-R04": [
    {
      "type": "image",
      "src": "assets/media/T4-R04/hero.svg",
      "title": "Scripting and ICM Routing",
      "caption": "Original illustration of a scheduled script that must not play VRU treatment before Send To VRU.",
      "section": "hdr"
    },
    {
      "type": "svg",
      "src": "assets/media/T4-R04/arch.svg",
      "title": "Schedule the script, then give the VRU something to play",
      "caption": "Run External Script, Play, Menu, Collect Data, or Queue before Send To VRU implies a Send To VRU for several VRU types.",
      "section": "map"
    },
    {
      "type": "flow",
      "src": "assets/media/T4-R04/flow-script.svg",
      "title": "Schedule, then the VRU",
      "caption": "If Run External Script fails, test Call.VRUStatus. Avoid later nodes on that failure branch when the status says the VRU is down.",
      "section": "flow"
    },
    {
      "type": "flow",
      "src": "assets/media/T4-R04/flow-vru.svg",
      "title": "VRUStatus changes the branch",
      "caption": "The guide says 2 means the VRU is likely not functioning. Later nodes on that failure branch should be avoided.",
      "section": "core"
    },
    {
      "type": "video",
      "src": "assets/media/T4-R04/explainer.svg",
      "title": "Send to the VRU before you play",
      "caption": "A sample the room cites queues to three skill groups and plays an announcement on a timer while the caller waits.",
      "section": "eco"
    }
  ],
  "T4-R05": [
    {
      "type": "image",
      "src": "assets/media/T4-R05/hero.svg",
      "title": "CVP and VXML IVR",
      "caption": "Original illustration of a VXML Server that can exist without a Call Server, and the deployments that add one.",
      "section": "hdr"
    },
    {
      "type": "svg",
      "src": "assets/media/T4-R05/arch.svg",
      "title": "VXML Server beside the call",
      "caption": "The VXML Server can be installed without the Call Server. Reporting changes that picture.",
      "section": "map"
    },
    {
      "type": "flow",
      "src": "assets/media/T4-R05/flow-vxml.svg",
      "title": "From a call to a VoiceXML page",
      "caption": "Comprehensive combines Call Director using SIP and VRU-Only treatment.",
      "section": "flow"
    },
    {
      "type": "flow",
      "src": "assets/media/T4-R05/flow-deploy.svg",
      "title": "Three deployment shapes the guide separates",
      "caption": "Standalone with reporting adds a Call Server and a Reporting Server. Basic and Advanced ports are a different axis.",
      "section": "core"
    },
    {
      "type": "video",
      "src": "assets/media/T4-R05/explainer.svg",
      "title": "Name the deployment before the feature",
      "caption": "Basic ports play wav files and collect DTMF. Do not promise ASR on a basic port.",
      "section": "eco"
    }
  ],
  "T4-R06": [
    {
      "type": "image",
      "src": "assets/media/T4-R06/hero.svg",
      "title": "Finesse Desktop and Gadgets",
      "caption": "Original illustration of gadgets living inside one Finesse desktop.",
      "section": "hdr"
    },
    {
      "type": "svg",
      "src": "assets/media/T4-R06/arch.svg",
      "title": "One desktop, many gadgets",
      "caption": "The gadget still has to authenticate to a third-party service itself. Shindig proxies the call; it does not log the gadget in.",
      "section": "map"
    },
    {
      "type": "flow",
      "src": "assets/media/T4-R06/flow-gadget.svg",
      "title": "A gadget call leaves the desktop",
      "caption": "REST calls from a gadget to an external service are proxied through Shindig.",
      "section": "flow"
    },
    {
      "type": "flow",
      "src": "assets/media/T4-R06/flow-layout.svg",
      "title": "The layout has two roles",
      "caption": "A supervisor tab is added under the Supervisor tag. It does not appear for the Agent role.",
      "section": "core"
    },
    {
      "type": "video",
      "src": "assets/media/T4-R06/explainer.svg",
      "title": "The proxy is not the login",
      "caption": "Finesse misses failover detection after three missed CTI heartbeats.",
      "section": "eco"
    }
  ],
  "T4-R07": [
    {
      "type": "image",
      "src": "assets/media/T4-R07/hero.svg",
      "title": "Reporting with CUIC",
      "caption": "Original illustration of CUIC template families. Import a family only when that option is deployed.",
      "section": "hdr"
    },
    {
      "type": "svg",
      "src": "assets/media/T4-R07/arch.svg",
      "title": "Import the template the deployment actually has",
      "caption": "Contact Sharing templates and Admin Security templates are further families. They are not the everyday agent report.",
      "section": "map"
    },
    {
      "type": "flow",
      "src": "assets/media/T4-R07/flow-import.svg",
      "title": "Choose the template family",
      "caption": "All Fields templates expose database fields and are the base for custom reports.",
      "section": "flow"
    },
    {
      "type": "flow",
      "src": "assets/media/T4-R07/flow-optional.svg",
      "title": "Import only when the option exists",
      "caption": "Outbound templates need Outbound Option. Customer Collaboration Platform templates need that platform.",
      "section": "core"
    },
    {
      "type": "video",
      "src": "assets/media/T4-R07/explainer.svg",
      "title": "Do not import a template for an option you do not run",
      "caption": "Precision-queue data belongs on the All Fields base, not on a guessed stock tile.",
      "section": "eco"
    }
  ],
  "T4-R08": [
    {
      "type": "image",
      "src": "assets/media/T4-R08/hero.svg",
      "title": "Sizing and HA",
      "caption": "Original illustration of two sides that exist for redundancy, not for load balancing.",
      "section": "hdr"
    },
    {
      "type": "svg",
      "src": "assets/media/T4-R08/arch.svg",
      "title": "Redundancy, majority, and the caps",
      "caption": "During a failure the surviving Router takes the call midstream without user intervention.",
      "section": "map"
    },
    {
      "type": "flow",
      "src": "assets/media/T4-R08/flow-split.svg",
      "title": "From a private-network break to a restored logger",
      "caption": "A router without majority goes idle and its logger shuts down. The router with majority continues.",
      "section": "flow"
    },
    {
      "type": "flow",
      "src": "assets/media/T4-R08/flow-active.svg",
      "title": "What is allowed to be active",
      "caption": "The two sides are for redundancy, not load balancing. The PG model is hot standby.",
      "section": "core"
    },
    {
      "type": "video",
      "src": "assets/media/T4-R08/explainer.svg",
      "title": "Redundancy is not load balancing",
      "caption": "Do not split traffic across Side A and Side B as if both were active for the same PG.",
      "section": "eco"
    }
  ],
  "T4-R09": [
    {
      "type": "image",
      "src": "assets/media/T4-R09/hero.svg",
      "title": "Classroom Index",
      "caption": "Original illustration of an index that points at rooms already written, instead of inventing a second component story.",
      "section": "hdr"
    },
    {
      "type": "svg",
      "src": "assets/media/T4-R09/arch.svg",
      "title": "Where the classroom topics already live",
      "caption": "Use the written Canon rooms for CVP, Finesse, CUIC, and sizing. This index points at them.",
      "section": "map"
    },
    {
      "type": "flow",
      "src": "assets/media/T4-R09/flow-index.svg",
      "title": "From a question to the room that already answers it",
      "caption": "Component, call-flow, and scripting questions point at the chapter that already states them.",
      "section": "flow"
    },
    {
      "type": "flow",
      "src": "assets/media/T4-R09/flow-boxes.svg",
      "title": "The four boxes the index is willing to name",
      "caption": "A Router and Logger on one side are often called a side. The PG is the telephony speaker. Script Editor lives on the Administration and Data Server.",
      "section": "core"
    },
    {
      "type": "video",
      "src": "assets/media/T4-R09/explainer.svg",
      "title": "Point at the chapter. Do not invent a second stack.",
      "caption": "This room is an index. It does not add a product feature the other T4 rooms do not already state.",
      "section": "eco"
    }
  ],
  "T4-R10": [
    {
      "type": "image",
      "src": "assets/media/T4-R10/hero.svg",
      "title": "Hybrid and Cloud-connected",
      "caption": "Original illustration of hybrid notes that must be read with their dates.",
      "section": "hdr"
    },
    {
      "type": "svg",
      "src": "assets/media/T4-R10/arch.svg",
      "title": "From a what's-new line to the page you configure",
      "caption": "Hybrid IVR with Dialogflow CX keeps some nodes on premises. OTP is the published example.",
      "section": "map"
    },
    {
      "type": "flow",
      "src": "assets/media/T4-R10/flow-hybrid.svg",
      "title": "From a what's-new line to the configurator",
      "caption": "Stop at the March 2022 names unless you open the partner guide. The CX bot can play a static partial response for up to 30 seconds.",
      "section": "flow"
    },
    {
      "type": "flow",
      "src": "assets/media/T4-R10/flow-limits.svg",
      "title": "Limits that ride with the announcement",
      "caption": "VPN-less Finesse does not support FIPPA and does not support multiple devices reaching the desktop through NAT.",
      "section": "core"
    },
    {
      "type": "video",
      "src": "assets/media/T4-R10/explainer.svg",
      "title": "Read the restriction with the announcement",
      "caption": "Bandwidth figures from the March 2022 note stay on that note. Do not promote them to a current design limit without the partner guide.",
      "section": "eco"
    }
  ],
  "T5-R01": [
    {
      "type": "image",
      "src": "assets/media/T5-R01/hero.svg",
      "title": "What Dedicated Instance Is",
      "caption": "Original illustration of Dedicated Instance as a hosted UC application set, sized by the Dedicated Instance team.",
      "section": "hdr"
    },
    {
      "type": "svg",
      "src": "assets/media/T5-R01/arch.svg",
      "title": "Sizing is not your old cluster size",
      "caption": "Knowledge Workers and Common Area devices captured in the wizard determine how many call-processing nodes Cisco deploys.",
      "section": "map"
    },
    {
      "type": "flow",
      "src": "assets/media/T5-R01/flow-activate.svg",
      "title": "From the wizard to a cluster",
      "caption": "Sizing is a function of the Dedicated Instance team, not of the old on-premises cluster size.",
      "section": "flow"
    },
    {
      "type": "flow",
      "src": "assets/media/T5-R01/flow-subnets.svg",
      "title": "Who provides the subnets",
      "caption": "Cisco-provided subnets support only up to three clusters in a region.",
      "section": "core"
    },
    {
      "type": "video",
      "src": "assets/media/T5-R01/explainer.svg",
      "title": "The old cluster size is not the input",
      "caption": "Do not tell a customer to copy the on-premises node count into the wizard.",
      "section": "eco"
    }
  ],
  "T5-R02": [
    {
      "type": "image",
      "src": "assets/media/T5-R02/hero.svg",
      "title": "DI Architecture and Peering",
      "caption": "Original illustration of a region activation that is permanent, and peering that uses Webex ASN 13445.",
      "section": "hdr"
    },
    {
      "type": "svg",
      "src": "assets/media/T5-R02/arch.svg",
      "title": "Activation, applications, peering",
      "caption": "There are no new EMEA deployments. Choose EU or UK. IM and Presence and optional SME are named on the access article.",
      "section": "map"
    },
    {
      "type": "flow",
      "src": "assets/media/T5-R02/flow-region.svg",
      "title": "Activate a region, then peer",
      "caption": "Your peering subnet is a public prefix you advertise. The Webex side is ASN 13445.",
      "section": "flow"
    },
    {
      "type": "flow",
      "src": "assets/media/T5-R02/flow-apps.svg",
      "title": "What activation deploys",
      "caption": "Emergency Responder is named only in AMER. IM and Presence and optional SME are additional names on the access article.",
      "section": "core"
    },
    {
      "type": "video",
      "src": "assets/media/T5-R02/explainer.svg",
      "title": "The first voice domain sticks",
      "caption": "Do not draw a new EMEA region. The room says choose EU or UK.",
      "section": "eco"
    }
  ],
  "T5-R03": [
    {
      "type": "image",
      "src": "assets/media/T5-R03/hero.svg",
      "title": "Connectivity Options",
      "caption": "Original illustration of three contracts into the same Dedicated Instance region.",
      "section": "hdr"
    },
    {
      "type": "svg",
      "src": "assets/media/T5-R03/arch.svg",
      "title": "Three ways into a region",
      "caption": "Virtual Connect bandwidth is 250 Mbps per tunnel. The two tunnels are active/active when healthy.",
      "section": "map"
    },
    {
      "type": "flow",
      "src": "assets/media/T5-R03/flow-order.svg",
      "title": "From an active region to a tested path",
      "caption": "Activate the region before a Partner Connect or Virtual Connect peering request.",
      "section": "flow"
    },
    {
      "type": "flow",
      "src": "assets/media/T5-R03/flow-three.svg",
      "title": "Three contracts",
      "caption": "Partner Connect is a private aggregation. Virtual Connect is an internet VPN. Edge Connect is private peering.",
      "section": "core"
    },
    {
      "type": "video",
      "src": "assets/media/T5-R03/explainer.svg",
      "title": "Same region, three contracts",
      "caption": "Each Virtual Connect order in a region is two tunnels, one toward each redundant data center.",
      "section": "eco"
    }
  ],
  "T5-R04": [
    {
      "type": "image",
      "src": "assets/media/T5-R04/hero.svg",
      "title": "DI Admin and Operations",
      "caption": "Original illustration of who owns a Dedicated Instance fault.",
      "section": "hdr"
    },
    {
      "type": "svg",
      "src": "assets/media/T5-R04/arch.svg",
      "title": "From a fault to the right owner",
      "caption": "R does the work. A signs off. C is two-way. I is one-way. Cisco resolves non-configuration issues on a widespread fault and restores clusters.",
      "section": "map"
    },
    {
      "type": "flow",
      "src": "assets/media/T5-R04/flow-owner.svg",
      "title": "From a fault to the right owner",
      "caption": "A widespread issue is 100 percent of a UC cluster, or more than one cluster. Less than that is non-widespread.",
      "section": "flow"
    },
    {
      "type": "flow",
      "src": "assets/media/T5-R04/flow-raci.svg",
      "title": "Who moves",
      "caption": "Cisco restores clusters for widespread non-configuration issues. A smaller issue is the customer or partner's configuration.",
      "section": "core"
    },
    {
      "type": "video",
      "src": "assets/media/T5-R04/explainer.svg",
      "title": "Name the scope before you page Cisco",
      "caption": "A restart of a UC server or service is a notification, not a silent reboot.",
      "section": "eco"
    }
  ],
  "T5-R05": [
    {
      "type": "image",
      "src": "assets/media/T5-R05/hero.svg",
      "title": "DI and Webex Calling Coexistence",
      "caption": "Original illustration of two call controls joined by trunks Cisco already created.",
      "section": "hdr"
    },
    {
      "type": "svg",
      "src": "assets/media/T5-R05/arch.svg",
      "title": "Two call controls, one backbone trunk",
      "caption": "Service activation does not finish the dial plan. You still incorporate the elements into both dial plans. Add an E.164 main number before calls work.",
      "section": "map"
    },
    {
      "type": "flow",
      "src": "assets/media/T5-R05/flow-cross.svg",
      "title": "From activation to a cross-platform call",
      "caption": "Choose the WXC-DI route group on the default location. A main number is required before calls. Later still blocks calls.",
      "section": "flow"
    },
    {
      "type": "flow",
      "src": "assets/media/T5-R05/flow-leave.svg",
      "title": "Leave the prebuilt objects alone",
      "caption": "Registration trunks are the old path for some customers. The default certificate trunks are the objects this article tells you not to delete.",
      "section": "core"
    },
    {
      "type": "video",
      "src": "assets/media/T5-R05/explainer.svg",
      "title": "Prebuilt is not finished",
      "caption": "You are advised not to modify or delete the preconfigured interoperability dial-plan elements.",
      "section": "eco"
    }
  ],
  "T5-R06": [
    {
      "type": "image",
      "src": "assets/media/T5-R06/hero.svg",
      "title": "DI Migration Path",
      "caption": "Original illustration of seven gates. The assistant assesses. It does not migrate the cluster.",
      "section": "hdr"
    },
    {
      "type": "svg",
      "src": "assets/media/T5-R06/arch.svg",
      "title": "Seven gates, one cutover",
      "caption": "No impact during initiation, discovery, and planning. Direct impact at go live.",
      "section": "map"
    },
    {
      "type": "flow",
      "src": "assets/media/T5-R06/flow-gates.svg",
      "title": "Seven gates",
      "caption": "Each phase has entry and exit criteria. The assistant's tile shows only if Setup Assist is enabled.",
      "section": "flow"
    },
    {
      "type": "flow",
      "src": "assets/media/T5-R06/flow-assist.svg",
      "title": "Ready to migrate is not the move",
      "caption": "The assistant gathers source data and compares on-premises Unified CM with Dedicated Instance. Customers work with a partner tool to complete the migration.",
      "section": "core"
    },
    {
      "type": "video",
      "src": "assets/media/T5-R06/explainer.svg",
      "title": "The assistant is not the migrator",
      "caption": "Source status moves to In Progress, then you download the report after approval.",
      "section": "eco"
    }
  ],
  "T6-R01": [
    {
      "type": "image",
      "src": "assets/media/T6-R01/hero.svg",
      "title": "2,000-seat Cutover",
      "caption": "Original illustration of a Canon planning scenario. Two thousand seats is the exercise, not a Cisco limit.",
      "section": "hdr"
    },
    {
      "type": "svg",
      "src": "assets/media/T6-R01/arch.svg",
      "title": "Two migrations, one scenario",
      "caption": "The seat count is the exercise, not a Cisco limit. Rebuild beside the old estate.",
      "section": "map"
    },
    {
      "type": "flow",
      "src": "assets/media/T6-R01/flow-calling.svg",
      "title": "Calling half of the scenario",
      "caption": "Keep CUCM closest-match out of the Webex pattern engine. List what you will rebuild.",
      "section": "flow"
    },
    {
      "type": "flow",
      "src": "assets/media/T6-R01/flow-cc.svg",
      "title": "Contact-center half of the scenario",
      "caption": "List UCCE dialed numbers, call types, skill groups, and scripts as names you will rebuild, not as objects a tool will convert.",
      "section": "core"
    },
    {
      "type": "video",
      "src": "assets/media/T6-R01/explainer.svg",
      "title": "Rebuild beside the old estate",
      "caption": "Do not promise a tool that converts ICM scripts. The room says you rebuild those names.",
      "section": "eco"
    }
  ],
  "T6-R02": [
    {
      "type": "image",
      "src": "assets/media/T6-R02/hero.svg",
      "title": "CUCM to Webex Calling",
      "caption": "Original illustration of a phased move that leaves users on both platforms for a while.",
      "section": "hdr"
    },
    {
      "type": "svg",
      "src": "assets/media/T6-R02/arch.svg",
      "title": "Two platforms during the phase",
      "caption": "The documented path is Unified CM to multi-tenant Webex Calling. It is a PPDIO project, not a lift-and-shift.",
      "section": "map"
    },
    {
      "type": "flow",
      "src": "assets/media/T6-R02/flow-order.svg",
      "title": "Order of the move",
      "caption": "Unsupported phones, a complex dial plan, highly granular classes of service, and a contact center that is not moving are reasons the requirements may say to stay.",
      "section": "flow"
    },
    {
      "type": "flow",
      "src": "assets/media/T6-R02/flow-jabber.svg",
      "title": "Jabber is its own decision",
      "caption": "Small populations can move the client and calling together. Larger populations should move the soft client first.",
      "section": "core"
    },
    {
      "type": "video",
      "src": "assets/media/T6-R02/explainer.svg",
      "title": "Phased means both dial plans stay true",
      "caption": "Every group change updates Unified CM, Webex Calling, and the Local Gateway.",
      "section": "eco"
    }
  ],
  "T6-R03": [
    {
      "type": "image",
      "src": "assets/media/T6-R03/hero.svg",
      "title": "Migration Tools",
      "caption": "Original illustration of three tool families. Insights can run before you have the destination org.",
      "section": "hdr"
    },
    {
      "type": "svg",
      "src": "assets/media/T6-R03/arch.svg",
      "title": "Three tool families",
      "caption": "Feature-tool upload limits: Unified CM tar 350 MB, Unity call-handler zip 2 GB.",
      "section": "map"
    },
    {
      "type": "flow",
      "src": "assets/media/T6-R03/flow-tar.svg",
      "title": "From a tar to a phone job",
      "caption": "Use the shared-line report and the hunt, queue, park, and pickup report to see who must move together.",
      "section": "flow"
    },
    {
      "type": "flow",
      "src": "assets/media/T6-R03/flow-tools.svg",
      "title": "Three ways onto multi-tenant Calling",
      "caption": "Control Hub tools, certified migration providers, and Webex Setup Assist are the three families the room separates.",
      "section": "core"
    },
    {
      "type": "video",
      "src": "assets/media/T6-R03/explainer.svg",
      "title": "Upload the tar before you argue about the destination",
      "caption": "Migration Insights does not need the destination customer org.",
      "section": "eco"
    }
  ],
  "T6-R04": [
    {
      "type": "image",
      "src": "assets/media/T6-R04/hero.svg",
      "title": "UCCE and PCCE to WxCC",
      "caption": "Original illustration of three published moves that must not be collapsed into one weekend.",
      "section": "hdr"
    },
    {
      "type": "svg",
      "src": "assets/media/T6-R04/arch.svg",
      "title": "Three published moves, then the gap",
      "caption": "Read the source product first. Mixing CCX, WxCC 1.0, and the CCE portal is how a plan targets the wrong logger.",
      "section": "map"
    },
    {
      "type": "flow",
      "src": "assets/media/T6-R04/flow-ccx.svg",
      "title": "What the CCX article actually moves",
      "caption": "Run the jar with -extract. Import CSVs in the printed order. Split files above 5000 rows.",
      "section": "flow"
    },
    {
      "type": "flow",
      "src": "assets/media/T6-R04/flow-three.svg",
      "title": "Three published moves",
      "caption": "Legacy routing strategies are not copied. Queues and teams are separate steps. Audio files stay behind on the CCE tool.",
      "section": "core"
    },
    {
      "type": "video",
      "src": "assets/media/T6-R04/explainer.svg",
      "title": "Three moves, not one sentence",
      "caption": "On the CCE tenant tool, entering 1 for a class deletes that class on the target and copies the source.",
      "section": "eco"
    }
  ],
  "T6-R05": [
    {
      "type": "image",
      "src": "assets/media/T6-R05/hero.svg",
      "title": "Third-party PBX and CC",
      "caption": "Original illustration of a premises PBX reaching Webex Contact Center through a Local Gateway. No vendor runbook is drawn.",
      "section": "hdr"
    },
    {
      "type": "svg",
      "src": "assets/media/T6-R05/arch.svg",
      "title": "Where a non-Cisco source actually lands",
      "caption": "Cisco names a third-party PBX as a Dedicated Instance source it has covered, and third-party phones as a provisioning case. It does not print an Avaya, Genesys, or NICE procedure.",
      "section": "map"
    },
    {
      "type": "flow",
      "src": "assets/media/T6-R05/flow-agent.svg",
      "title": "From a premises agent to Webex Contact Center",
      "caption": "International format sends a globalized number. The agent destination has to be reachable.",
      "section": "flow"
    },
    {
      "type": "flow",
      "src": "assets/media/T6-R05/flow-blank.svg",
      "title": "What Cisco printed, and what it left blank",
      "caption": "Do not fill the blank with a vendor cutover. The printed path is the number, the SBC, and a reachable agent destination.",
      "section": "core"
    },
    {
      "type": "video",
      "src": "assets/media/T6-R05/explainer.svg",
      "title": "Stay on the path Cisco printed",
      "caption": "A Teams client still needs the Local Gateway pattern to match when that is the agent destination the article describes.",
      "section": "eco"
    }
  ],
  "T6-R06": [
    {
      "type": "image",
      "src": "assets/media/T6-R06/hero.svg",
      "title": "Number Porting and Cutover",
      "caption": "Original illustration of a port from the losing carrier through Control Hub to the winning carrier.",
      "section": "hdr"
    },
    {
      "type": "svg",
      "src": "assets/media/T6-R06/arch.svg",
      "title": "Losing carrier, Control Hub, winning carrier",
      "caption": "For Cisco Calling Plans, Control Hub holds the order, the letter of agency, and the day-of checks. Numbers show provisioned and stay inactive until FOC activation.",
      "section": "map"
    },
    {
      "type": "flow",
      "src": "assets/media/T6-R06/flow-port.svg",
      "title": "From a draft to a verified port",
      "caption": "Issues found while creating the draft go to PTS. After FOC, wait 15 or 30 minutes as the article's verification window states before you call the test done.",
      "section": "flow"
    },
    {
      "type": "flow",
      "src": "assets/media/T6-R06/flow-loa.svg",
      "title": "Study sequence of a Calling Plan port",
      "caption": "A study sequence of the port, not a carrier's internal messages. FOC is the losing carrier's response. Activation is the winning carrier.",
      "section": "config"
    },
    {
      "type": "video",
      "src": "assets/media/T6-R06/explainer.svg",
      "title": "The draft is the portability test",
      "caption": "Numbers can show provisioned and still be inactive until the FOC activation.",
      "section": "eco"
    }
  ],
  "T6-R07": [
    {
      "type": "image",
      "src": "assets/media/T6-R07/hero.svg",
      "title": "Coexistence and Interop",
      "caption": "Original illustration of two call controls sharing one trunk that must not loop.",
      "section": "hdr"
    },
    {
      "type": "svg",
      "src": "assets/media/T6-R07/arch.svg",
      "title": "Two call controls, one trunk that must not loop",
      "caption": "A Local Gateway does not split a shared feature. Call queues and the users who depend on them move in the same batch.",
      "section": "map"
    },
    {
      "type": "flow",
      "src": "assets/media/T6-R07/flow-batch.svg",
      "title": "One range moves",
      "caption": "Put Webex Calling +E.164 patterns in their own partition. Keep that partition out of the Local Gateway trunk's inbound calling search space.",
      "section": "flow"
    },
    {
      "type": "flow",
      "src": "assets/media/T6-R07/flow-together.svg",
      "title": "What must move in one batch",
      "caption": "Dedicated Instance interop trunks are the other coexistence. They are certificate trunks Cisco prebuilt. Do not redesign them here.",
      "section": "core"
    },
    {
      "type": "video",
      "src": "assets/media/T6-R07/explainer.svg",
      "title": "Both sides stay routable",
      "caption": "The loop is a search-space mistake: the trunk CSS includes the partition that points back at the trunk.",
      "section": "eco"
    }
  ],
  "T6-R08": [
    {
      "type": "image",
      "src": "assets/media/T6-R08/hero.svg",
      "title": "Post-migration Validation",
      "caption": "Original illustration of a pilot, a subset test, and only then an empty rack.",
      "section": "hdr"
    },
    {
      "type": "svg",
      "src": "assets/media/T6-R08/arch.svg",
      "title": "What remains, then what you delete",
      "caption": "After everyone has moved, Unified CM's remaining job can be transit between the PSTN and Webex. Do not power it off because the users are gone.",
      "section": "map"
    },
    {
      "type": "flow",
      "src": "assets/media/T6-R08/flow-pilot.svg",
      "title": "From a pilot to an empty rack",
      "caption": "Test queues and hunts if they moved. Port all trunk numbers with the partner, then verify both directions.",
      "section": "flow"
    },
    {
      "type": "flow",
      "src": "assets/media/T6-R08/flow-remain.svg",
      "title": "What you delete, and what you might keep",
      "caption": "Deprovision the test location after Cloud Connect validation. The old platform is not automatically idle.",
      "section": "core"
    },
    {
      "type": "video",
      "src": "assets/media/T6-R08/explainer.svg",
      "title": "Test the batch, then retire the platform",
      "caption": "Do not treat an empty user list as proof the trunks are idle.",
      "section": "eco"
    }
  ],
  "T7-R01": [
    {
      "type": "image",
      "src": "assets/media/T7-R01/hero.svg",
      "title": "SIP Fundamentals for Webex",
      "caption": "Original illustration of two call legs on a Local Gateway: toward Webex Calling, and toward the PSTN.",
      "section": "hdr"
    },
    {
      "type": "svg",
      "src": "assets/media/T7-R01/arch.svg",
      "title": "Two call legs",
      "caption": "This room is the dial peer and the debug. Sample registrar passwords from the configuration guide are not copied.",
      "section": "map"
    },
    {
      "type": "flow",
      "src": "assets/media/T7-R01/flow-ladder.svg",
      "title": "INVITE, 100, 180, 200, ACK",
      "caption": "A study ladder of a normal dialog. Webex Calling speaks SIP over TLS to the Local Gateway. This is not a captured trace.",
      "section": "flow"
    },
    {
      "type": "flow",
      "src": "assets/media/T7-R01/flow-legs.svg",
      "title": "One inbound Webex call, then one outbound PSTN call",
      "caption": "The inbound dial peer matches the leg from Webex. The outbound dial peer matches the leg to the PSTN. Media toward Webex is SRTP.",
      "section": "core"
    },
    {
      "type": "video",
      "src": "assets/media/T7-R01/explainer.svg",
      "title": "Two legs, two dial peers",
      "caption": "Config Validation applies to registration-based trunks. Do not point it at a certificate trunk.",
      "section": "eco"
    }
  ],
  "T7-R02": [
    {
      "type": "image",
      "src": "assets/media/T7-R02/hero.svg",
      "title": "CUBE Deep Dive",
      "caption": "Original illustration of a called number rewritten on a dial peer before the outbound match.",
      "section": "hdr"
    },
    {
      "type": "svg",
      "src": "assets/media/T7-R02/arch.svg",
      "title": "Where a number changes",
      "caption": "Normalize on the dial peer, then match. The high-CPU signature is a separate symptom from a wrong translation.",
      "section": "map"
    },
    {
      "type": "flow",
      "src": "assets/media/T7-R02/flow-rewrite.svg",
      "title": "One rewritten called number",
      "caption": "Write the rule, test one number, bind it in a profile, then apply that profile on the peer that must change.",
      "section": "flow"
    },
    {
      "type": "flow",
      "src": "assets/media/T7-R02/flow-where.svg",
      "title": "Which peer wears the profile",
      "caption": "Use translation-profile incoming only if the inbound leg is what must change. Outgoing belongs on the outbound peer.",
      "section": "core"
    },
    {
      "type": "video",
      "src": "assets/media/T7-R02/explainer.svg",
      "title": "Prove the rule before you bind it",
      "caption": "Sample passwords from the IOS XE guide are not in this drawing.",
      "section": "eco"
    }
  ],
  "T7-R03": [
    {
      "type": "image",
      "src": "assets/media/T7-R03/hero.svg",
      "title": "Codecs, Media and NAT",
      "caption": "Original illustration of an optimized media path, and the recording case that skips it.",
      "section": "hdr"
    },
    {
      "type": "svg",
      "src": "assets/media/T7-R03/arch.svg",
      "title": "Direct media is conditional",
      "caption": "Four ICE phases, then the port table. SIP ALG is a recommendation the room marks re-check.",
      "section": "map"
    },
    {
      "type": "flow",
      "src": "assets/media/T7-R03/flow-ice.svg",
      "title": "One optimized call",
      "caption": "Candidates are exchanged over SIP. Connectivity checks pick a path. A reinvite sends media on that path.",
      "section": "flow"
    },
    {
      "type": "flow",
      "src": "assets/media/T7-R03/flow-skip.svg",
      "title": "When the shortcut does not apply",
      "caption": "Local Gateway media uses UDP source ports 8000\u201348199 toward the listed destinations. Signaling still needs the internet.",
      "section": "core"
    },
    {
      "type": "video",
      "src": "assets/media/T7-R03/explainer.svg",
      "title": "ICE is a path. G.711 is the codec list.",
      "caption": "An active internet connection is always required to route calls, even when media is optimized.",
      "section": "eco"
    }
  ],
  "T7-R04": [
    {
      "type": "image",
      "src": "assets/media/T7-R04/hero.svg",
      "title": "SIP Trunk Design",
      "caption": "Original illustration of a route group: same priority load-balances, lower priority waits.",
      "section": "hdr"
    },
    {
      "type": "svg",
      "src": "assets/media/T7-R04/arch.svg",
      "title": "How a route group fails over",
      "caption": "Trunk status is online, offline, impaired, or unknown, and the page updates every 3 minutes.",
      "section": "map"
    },
    {
      "type": "flow",
      "src": "assets/media/T7-R04/flow-rg.svg",
      "title": "From trunk to route group",
      "caption": "Online means every Webex Calling edge proxy reached the Local Gateway. Impaired means at least one proxy did not.",
      "section": "flow"
    },
    {
      "type": "flow",
      "src": "assets/media/T7-R04/flow-status.svg",
      "title": "Four status words",
      "caption": "Error 6 is an FQDN missing from the certificate CN or SAN. Strip the port off the name you compare.",
      "section": "core"
    },
    {
      "type": "video",
      "src": "assets/media/T7-R04/explainer.svg",
      "title": "Ten trunks, two priorities, one FQDN",
      "caption": "Do not put the port in the name you compare with the certificate.",
      "section": "eco"
    }
  ],
  "T7-R05": [
    {
      "type": "image",
      "src": "assets/media/T7-R05/hero.svg",
      "title": "Queue Theory for Contact Center",
      "caption": "Original illustration of selection patterns. There is no Erlang formula in the product articles.",
      "section": "hdr"
    },
    {
      "type": "svg",
      "src": "assets/media/T7-R05/arch.svg",
      "title": "Who is eligible, then who is picked",
      "caption": "An offer on any media drops the Longest Available position for every channel. A small race can offer two contacts because the architecture is distributed.",
      "section": "map"
    },
    {
      "type": "flow",
      "src": "assets/media/T7-R05/flow-pick.svg",
      "title": "One contact, one pattern",
      "caption": "Skill-based selection filters first, then applies the pattern. Non-skill Longest Available skips the skill filter.",
      "section": "flow"
    },
    {
      "type": "flow",
      "src": "assets/media/T7-R05/flow-patterns.svg",
      "title": "What the pattern actually changes",
      "caption": "The Labs page Erlang model is a Canon study model. It is not Webex estimated wait.",
      "section": "core"
    },
    {
      "type": "video",
      "src": "assets/media/T7-R05/explainer.svg",
      "title": "Four patterns, and no Erlang formula",
      "caption": "Do not teach the textbook Erlang model as Webex estimated wait.",
      "section": "eco"
    }
  ],
  "T7-R06": [
    {
      "type": "image",
      "src": "assets/media/T7-R06/hero.svg",
      "title": "Routing Strategies Compared",
      "caption": "Original illustration of Calling objects beside a contact-center queue. Same words, different objects.",
      "section": "hdr"
    },
    {
      "type": "svg",
      "src": "assets/media/T7-R06/arch.svg",
      "title": "Four Calling objects, then a contact-center queue",
      "caption": "Only the call queue adds callers to a queue. Only the auto attendant provides IVR. A shared line group is the fourth Calling object in the comparison.",
      "section": "map"
    },
    {
      "type": "flow",
      "src": "assets/media/T7-R06/flow-objects.svg",
      "title": "Pick the object before the pattern",
      "caption": "A call queue and a hunt group say an auto attendant can be used as the IVR. The contact-center queue is not one of those four.",
      "section": "flow"
    },
    {
      "type": "flow",
      "src": "assets/media/T7-R06/flow-ivr.svg",
      "title": "Where the IVR is allowed to sit",
      "caption": "Hunt groups and call queues can name an auto attendant as the IVR. The hunt group note says not based on skills.",
      "section": "core"
    },
    {
      "type": "video",
      "src": "assets/media/T7-R06/explainer.svg",
      "title": "Same words, different objects",
      "caption": "Do not configure a Webex Contact Center queue when the design asked for a Calling call queue.",
      "section": "eco"
    }
  ],
  "T7-R07": [
    {
      "type": "image",
      "src": "assets/media/T7-R07/hero.svg",
      "title": "SIP Trace Reading Lab",
      "caption": "Original illustration of the lab order. It does not invent a ladder.",
      "section": "hdr"
    },
    {
      "type": "svg",
      "src": "assets/media/T7-R07/arch.svg",
      "title": "Which console answers which question",
      "caption": "Start in Verify Call Routing. Open the media tools when a media session exists. Do not start from a guessed ladder.",
      "section": "map"
    },
    {
      "type": "flow",
      "src": "assets/media/T7-R07/flow-lab.svg",
      "title": "Order of the lab",
      "caption": "Name the user, open the location PSTN connection, read the numbers, then open the dial plan if the destination is on premises.",
      "section": "flow"
    },
    {
      "type": "flow",
      "src": "assets/media/T7-R07/flow-console.svg",
      "title": "Which console",
      "caption": "Contact-center outbound premises calls use the voice article's Calling, Call Routing path. That is not the same tile as a user dial plan miss.",
      "section": "core"
    },
    {
      "type": "video",
      "src": "assets/media/T7-R07/explainer.svg",
      "title": "Read the console the symptom points at",
      "caption": "This lab does not draw an INVITE ladder. The room says not to invent one.",
      "section": "eco"
    }
  ],
  "T8-R01": [
    {
      "type": "image",
      "src": "assets/media/T8-R01/hero.svg",
      "title": "Flow Designer Essentials",
      "caption": "Original illustration of a main flow. Start Flow cannot be deleted.",
      "section": "hdr"
    },
    {
      "type": "svg",
      "src": "assets/media/T8-R01/arch.svg",
      "title": "Main flow, then events",
      "caption": "Get Queue Info before you promise a wait. Success needs EWT and PIQ both positive. EWT of -1 with a valid PIQ is Insufficient Information.",
      "section": "map"
    },
    {
      "type": "flow",
      "src": "assets/media/T8-R01/flow-queue.svg",
      "title": "A queue treatment you can defend",
      "caption": "Open flows from Services, Contact Center, Flows, or from Customer Experience, Flows.",
      "section": "flow"
    },
    {
      "type": "flow",
      "src": "assets/media/T8-R01/flow-ewt.svg",
      "title": "What Get Queue Info is allowed to say",
      "caption": "A team-based queue whose flow assigns skills plans on EWT -1. Do not announce a calculated wait.",
      "section": "core"
    },
    {
      "type": "video",
      "src": "assets/media/T8-R01/explainer.svg",
      "title": "Publish stays dark until the errors are gone",
      "caption": "DNIS on a transfer to an entry point is presented as NewPhoneContact.DNIS.",
      "section": "eco"
    }
  ],
  "T8-R02": [
    {
      "type": "image",
      "src": "assets/media/T8-R02/hero.svg",
      "title": "Flow Design Patterns",
      "caption": "Original illustration of four patterns. None of them is a product object named VIP.",
      "section": "hdr"
    },
    {
      "type": "svg",
      "src": "assets/media/T8-R02/arch.svg",
      "title": "Where each pattern lives",
      "caption": "Move a courtesy callback only when you accept the end of the new queue, no skills, and default priority.",
      "section": "map"
    },
    {
      "type": "flow",
      "src": "assets/media/T8-R02/flow-callback.svg",
      "title": "Courtesy callback that keeps place",
      "caption": "Keep the original queue if the contact should hold its place.",
      "section": "flow"
    },
    {
      "type": "flow",
      "src": "assets/media/T8-R02/flow-patterns.svg",
      "title": "Four patterns, four homes",
      "caption": "For a scheduled callback, add the Disconnect the article recommends immediately after the activity.",
      "section": "core"
    },
    {
      "type": "video",
      "src": "assets/media/T8-R02/explainer.svg",
      "title": "VIP is not an object",
      "caption": "At the scheduled time a new interaction follows that entry point's flow.",
      "section": "eco"
    }
  ],
  "T8-R03": [
    {
      "type": "image",
      "src": "assets/media/T8-R03/hero.svg",
      "title": "APIs, Webhooks and Connect",
      "caption": "Original illustration of Webex Connect: a service, two webhook directions, and a task.",
      "section": "hdr"
    },
    {
      "type": "svg",
      "src": "assets/media/T8-R03/arch.svg",
      "title": "A service, two webhook directions, one task",
      "caption": "Assets are created in the Connect portal, in Control Hub for Email and Chat, or through Developer Portal APIs.",
      "section": "map"
    },
    {
      "type": "flow",
      "src": "assets/media/T8-R03/flow-in.svg",
      "title": "From an inbound message to a person",
      "caption": "An inbound webhook starts a flow. The flow's task is what reaches a person or another system.",
      "section": "flow"
    },
    {
      "type": "flow",
      "src": "assets/media/T8-R03/flow-hooks.svg",
      "title": "Two webhook directions",
      "caption": "Outbound webhooks carry receipts and incoming messages. They do not start the flow.",
      "section": "core"
    },
    {
      "type": "video",
      "src": "assets/media/T8-R03/explainer.svg",
      "title": "Name the editor before you name the API",
      "caption": "Connect lists SMS, RCS, WhatsApp, Push, Live Chat, Email, Voice, MMS, Apple Messages, and Messenger among its channels.",
      "section": "eco"
    }
  ],
  "T8-R04": [
    {
      "type": "image",
      "src": "assets/media/T8-R04/hero.svg",
      "title": "CRM Integrations",
      "caption": "Original illustration of three Version 2 connectors. Each one launches the desktop inside that CRM.",
      "section": "hdr"
    },
    {
      "type": "svg",
      "src": "assets/media/T8-R04/arch.svg",
      "title": "Three consoles, one exclusion",
      "caption": "The three articles share the chat-and-email exclusion. Do not draw digital chat through the voice connector.",
      "section": "map"
    },
    {
      "type": "flow",
      "src": "assets/media/T8-R04/flow-install.svg",
      "title": "Order of operations",
      "caption": "Confirm the CRM edition and UI before you download a package. Salesforce imports the call-center XML after the package.",
      "section": "flow"
    },
    {
      "type": "flow",
      "src": "assets/media/T8-R04/flow-three.svg",
      "title": "Three consoles",
      "caption": "On-premises Dynamics is unsupported. Legacy ServiceNow workspace is unsupported starting with Xanadu.",
      "section": "core"
    },
    {
      "type": "video",
      "src": "assets/media/T8-R04/explainer.svg",
      "title": "Chat and email are not this connector",
      "caption": "WebRTC browser support differs by CRM. Read the article for that console before you name Edge or Firefox.",
      "section": "eco"
    }
  ],
  "T8-R05": [
    {
      "type": "image",
      "src": "assets/media/T8-R05/hero.svg",
      "title": "AI in Webex Contact Center",
      "caption": "Original illustration of two products that share the word AI.",
      "section": "hdr"
    },
    {
      "type": "svg",
      "src": "assets/media/T8-R05/arch.svg",
      "title": "Assistant beside the agent",
      "caption": "Autonomous voice is limited to specific customers. Do not upload PCI, PII, or PHI into a knowledge base.",
      "section": "map"
    },
    {
      "type": "flow",
      "src": "assets/media/T8-R05/flow-attach.svg",
      "title": "Attach an agent without renaming it",
      "caption": "Voice uses Virtual Agent V2. Choose Webex AI Agent Scripted or Webex AI Agent Autonomous, then a published agent.",
      "section": "flow"
    },
    {
      "type": "flow",
      "src": "assets/media/T8-R05/flow-two.svg",
      "title": "Two products",
      "caption": "Mid-call summaries are only for direct agent-to-agent consults and transfers. Queues and entry points are not that path.",
      "section": "core"
    },
    {
      "type": "video",
      "src": "assets/media/T8-R05/explainer.svg",
      "title": "Do not rename one product as the other",
      "caption": "Global_Language overrides language only when it was set earlier in the flow.",
      "section": "eco"
    }
  ],
  "T8-R06": [
    {
      "type": "image",
      "src": "assets/media/T8-R06/hero.svg",
      "title": "Troubleshooting Methodology",
      "caption": "Original illustration of a failed call read after it ends, then the hop, then the gateway.",
      "section": "hdr"
    },
    {
      "type": "svg",
      "src": "assets/media/T8-R06/arch.svg",
      "title": "Role, search, hop, gateway",
      "caption": "Quality grades for Webex Calling are Poor, Good, or None. The view cannot necessarily provide the root cause.",
      "section": "map"
    },
    {
      "type": "flow",
      "src": "assets/media/T8-R06/flow-call.svg",
      "title": "One failed call",
      "caption": "Search keys are email, phone number, MAC, call ID, and correlation ID. Stitch segments with the correlation ID, then open the hop.",
      "section": "flow"
    },
    {
      "type": "flow",
      "src": "assets/media/T8-R06/flow-gateway.svg",
      "title": "When the hop is a gateway",
      "caption": "Trunk status updates every 3 minutes. Errors 2, 6, 11, and 12 are shown only when all edge proxy nodes have the issue.",
      "section": "core"
    },
    {
      "type": "video",
      "src": "assets/media/T8-R06/explainer.svg",
      "title": "After the call ends, then the hop",
      "caption": "Meetings and Call on Webex are not graded the way Webex Calling calls are graded.",
      "section": "eco"
    }
  ],
  "T8-R07": [
    {
      "type": "image",
      "src": "assets/media/T8-R07/hero.svg",
      "title": "Logs and Tools",
      "caption": "Original illustration of an export, then a phone problem report.",
      "section": "hdr"
    },
    {
      "type": "svg",
      "src": "assets/media/T8-R07/arch.svg",
      "title": "From the call row to a file",
      "caption": "Network debug is for the whole network, and only while you are diagnosing. Applying some DECT changes can restart bases.",
      "section": "map"
    },
    {
      "type": "flow",
      "src": "assets/media/T8-R07/flow-export.svg",
      "title": "Export, then the device log",
      "caption": "The call has to have ended before it is on the list you export.",
      "section": "flow"
    },
    {
      "type": "flow",
      "src": "assets/media/T8-R07/flow-dect.svg",
      "title": "DECT is not the MPP button",
      "caption": "DECT logs are SIP plus handset, stored under the base device ID. Network debug covers the whole network.",
      "section": "core"
    },
    {
      "type": "video",
      "src": "assets/media/T8-R07/explainer.svg",
      "title": "One hundred rows, then a PRT",
      "caption": "Do not leave network debug on after the diagnosis.",
      "section": "eco"
    }
  ],
  "T8-R08": [
    {
      "type": "image",
      "src": "assets/media/T8-R08/hero.svg",
      "title": "Latest Features Radar",
      "caption": "Original illustration of a radar that only shows sentences still dated on the pages opened October 14, 2026.",
      "section": "hdr"
    },
    {
      "type": "svg",
      "src": "assets/media/T8-R08/arch.svg",
      "title": "Calling page, contact-center page, device note",
      "caption": "Personalized AI Routing is quoted only as what its page says it can help do. This room is not a roadmap.",
      "section": "map"
    },
    {
      "type": "flow",
      "src": "assets/media/T8-R08/flow-read.svg",
      "title": "Read the restriction with the announcement",
      "caption": "On October 7, toll-free and non-geographic numbers were listed for twelve countries. The Calling Plan restrictions are narrower.",
      "section": "flow"
    },
    {
      "type": "flow",
      "src": "assets/media/T8-R08/flow-dates.svg",
      "title": "Sentences with dates still on the page",
      "caption": "You cannot assign toll-free or restricted non-geographic numbers to a user, workspace, or virtual line.",
      "section": "core"
    },
    {
      "type": "video",
      "src": "assets/media/T8-R08/explainer.svg",
      "title": "Only the pages opened on October 14",
      "caption": "A what's-new line without its restriction is half the sentence.",
      "section": "eco"
    }
  ],
  "T1": [
    {
      "type": "flow",
      "src": "assets/media/T1/flow-map.svg",
      "title": "Control Hub & Platform Foundations track flow",
      "caption": "Reading order on this Canon track page, from the first room to the last. A Canon sequence, not a Cisco-mandated path.",
      "section": "track-hero"
    }
  ],
  "T2": [
    {
      "type": "flow",
      "src": "assets/media/T2/flow-map.svg",
      "title": "Webex Calling track flow",
      "caption": "Reading order on this Canon track page, from the first room to the last. A Canon sequence, not a Cisco-mandated path.",
      "section": "track-hero"
    }
  ],
  "T3": [
    {
      "type": "flow",
      "src": "assets/media/T3/flow-map.svg",
      "title": "Webex Contact Center (Multi-tenant) track flow",
      "caption": "Reading order on this Canon track page, from the first room to the last. A Canon sequence, not a Cisco-mandated path.",
      "section": "track-hero"
    }
  ],
  "T4": [
    {
      "type": "flow",
      "src": "assets/media/T4/flow-map.svg",
      "title": "Webex Contact Center Enterprise track flow",
      "caption": "Reading order on this Canon track page, from the first room to the last. A Canon sequence, not a Cisco-mandated path.",
      "section": "track-hero"
    }
  ],
  "T5": [
    {
      "type": "flow",
      "src": "assets/media/T5/flow-map.svg",
      "title": "Dedicated Instance track flow",
      "caption": "Reading order on this Canon track page, from the first room to the last. A Canon sequence, not a Cisco-mandated path.",
      "section": "track-hero"
    }
  ],
  "T6": [
    {
      "type": "flow",
      "src": "assets/media/T6/flow-map.svg",
      "title": "Migrations track flow",
      "caption": "Reading order on this Canon track page, from the first room to the last. A Canon sequence, not a Cisco-mandated path.",
      "section": "track-hero"
    }
  ],
  "T7": [
    {
      "type": "flow",
      "src": "assets/media/T7/flow-map.svg",
      "title": "SIP, Routing & Queues track flow",
      "caption": "Reading order on this Canon track page, from the first room to the last. A Canon sequence, not a Cisco-mandated path.",
      "section": "track-hero"
    }
  ],
  "T8": [
    {
      "type": "flow",
      "src": "assets/media/T8/flow-map.svg",
      "title": "Flows, Integrations, Troubleshooting & Latest track flow",
      "caption": "Reading order on this Canon track page, from the first room to the last. A Canon sequence, not a Cisco-mandated path.",
      "section": "track-hero"
    }
  ]
};
