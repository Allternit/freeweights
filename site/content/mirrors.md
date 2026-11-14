---
title: Mirrors
nav_label: Mirrors
summary: What a mirror is, what it takes to run one, how to join, what mirror hosts get, and how a volunteer can seed.
updated: 2026-11-14
sections:
  - {id: what-is-a-mirror, title: What a mirror is}
  - {id: requirements, title: Requirements}
  - {id: join, title: How to join}
  - {id: what-you-get, title: What mirror hosts get}
  - {id: seeding, title: Seeding for volunteers}
  - {id: list, title: Mirror list}
  - {id: partners, title: Torrent projects}
---
A mirror carries bytes. Freeweights owns the rules and the registry. Mirrors serve the files, and each file must match the signed manifest.

## What a mirror is {#what-is-a-mirror}

A mirror is a host that stores a copy of model files and serves them over HTTP with the same file names and the same bytes as the manifest. It may also seed a torrent. The host chooses which models to hold and how much. A mirror is listed in the registry and shows up as a Hosted by Allternit source on the models it serves. A local mirror also cuts download time for people near it.

## Requirements {#requirements}

- **Disk.** Enough for the models you choose. You say how many terabytes you offer.
- **Bandwidth.** A stable public connection. You say what you can serve.
- **Sync method.** `rsync`, torrent or web seed. Files must match the sha256 in the signed manifest. A file that does not match is not served.
- **License list only.** You serve only models whose license is on the Freeweights license list. We tell you when a model is removed, and you remove it within 72 hours. You also remove content you are legally required to remove.
- **No tracking, no ads** on served files.
- A contact, a region, and a public URL.

## How to join {#join}

1. Read the mirror agreement and the license list.
2. Confirm your host can meet the capacity and sync method you will list.
3. Send a mirror request to freeweights@allternit.com. The signed agreement comes first.
4. After signing, we add your entry to the registry in a pull request.

The agreement in short:

- Allternit lists you with name, logo, capacity, region and since-date. Listing does not change catalog order.
- No money passes between us. In-kind capacity is logged in the public ledger at the value you state, with your consent.
- Either side may end it with 14 days' written notice, or at once if the other side breaks it.
- No warranty, no exclusivity. You may use the Freeweights name for factual mention only.
- The draft is under counsel review. Governing law is drafted as Minnesota, to be confirmed.

## What mirror hosts get {#what-you-get}

In the Debian style, every mirror is listed on this page: host name, logo, capacity, region and since-date. We show the same fields for sponsors. Your logo links to your site. You can ask to change or remove your listing at any time. You get no say in catalog order, and no one else does either.

## Seeding for volunteers {#seeding}

You do not need a signed agreement to seed. You need a full, verified copy of a file set and a torrent client.

1. Pick a model whose license allows sharing and that has a torrent. Torrents exist only when someone holds the bytes, and none exist yet at Stage 0.
2. Download it and verify it with `fw.py verify` against the signed manifest.
3. Add the torrent or magnet link to a client such as qBittorrent, Transmission or Deluge. Point the client at your verified folder and let it check the files.
4. Leave it running. Torrents made by Freeweights are hybrid v1 and v2 and carry web seeds, so a swarm and an HTTP source help each other.
5. Tell us. A known seeder with a full copy lets us show Community seeded.

Never seed a file you have not verified. Never seed a model that is on the Wanted page because of its license.

## Mirror list {#list}

**No mirrors yet. Be the first.** The registry is empty. This page shows each mirror here once its agreement is signed.

## Torrent projects {#partners}

We want to list the swarms that already exist, not compete with them. These projects are candidates. We have not contacted any of them, and no partnership exists or is claimed: Pirate Face, llama.garden, Noema Atlas, weightless and Academic Torrents. An entry becomes a partner only after a signed agreement and an entry in the registry.
