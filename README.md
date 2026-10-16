# Webex Lab Free University

A static study site for Cisco Webex Control Hub, Webex Calling, Webex Contact Center, Dedicated Instance, devices, meetings-adjacent firewall notes, and migration. It opens from the repository root, uses relative paths, and does not call Webex.

The written curriculum is the CypherWebex Canon: 8 tracks and 63 rooms. The older practice console (dial plan, flow designer, Control Hub walkthrough, 3D topology) is preserved under `archive/webex-lab-v1/campus/`.

## Run it

```bash
npm start
```

Open [http://127.0.0.1:8741/](http://127.0.0.1:8741/). `npm run verify` checks that local links resolve, the port diagrams and cheat sheets exist, and the chrome does not contain an email address.

The only outbound brand links in the app chrome, the about block, and this file are the CypherMonkey Labs website at https://cyphermonkeylabs.com , the GitHub organization at https://github.com/CypherMonkeyLabs , and Linktree at https://linktr.ee/cyphermonkey . Contact goes to the website contact section, https://cyphermonkeylabs.com/#contact . The reusable header, menu, bot, footer, and tour are described in [docs/KIT.md](docs/KIT.md).

GitHub Pages can publish this branch from `/`. There is no build step for reading. `npm run build:university` regenerates the atlas diagrams, cheat sheets, and play-lab page.

## What is on the front door

- Rooms for Control Hub, Calling, multi-tenant contact center, Contact Center Enterprise, Dedicated Instance, migrations, SIP, and flows.
- [Mastery map](mastery.html) from fundamentals through career evidence.
- [Ecosystem atlas](ecosystem-atlas.html) for Calling, Contact Center, Meetings, Devices, Control Hub, WFM, recording, E911, analytics, and AI agents.
- [Ports and protocols](ports.html), checked against the Webex Calling port reference on 2026-10-15.
- [Play lab](play.html): port match, flow map, call-flow sandbox, daily question, badges, share card. Arrow keys up, up, down, down, left, right, left, right, then b, a, unlock a local badge.
- [Cheat Codes](downloads.html): HTML, SVG, PDF, and PNG sheets, a 36-card flashcard deck, and `downloads/webex-university-offline.zip`.
- Themes: Aurora, Futuristic, Gaming, Neon, Sunset, and Light. CypherMonkey sits in the corner and changes face on a timer.

## License

MIT for the code. CC BY-NC-SA 4.0 for the university content. The archived console keeps CC BY 4.0. Cisco names are trademarks of their owners. This lab is not a Cisco product and it does not change a live tenant.
