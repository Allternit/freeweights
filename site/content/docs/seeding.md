---
title: Seeding
nav_label: Seeding
summary: How to seed a model so others can get it from you, and what makes a seed count.
group: Help
order: 8
updated: 2026-11-14
sections:
  - {id: why, title: Why seed}
  - {id: before, title: Before you start}
  - {id: steps, title: Steps}
  - {id: web-seeds, title: Web seeds}
  - {id: counts, title: What counts as Community seeded}
  - {id: stop, title: Stopping}
---
Seeding means keeping a full copy online so others can download from you. It keeps models open when a publisher removes them.

## Why seed {#why}

When the publisher removes a model, the From source badge fails and the model moves to Wanted. A seeder with a full verified copy can bring it back as Community seeded, if the license allows sharing.

## Before you start {#before}

- Check the license on the model page. If `redistribution` is `no`, do not seed it.
- Check the Wanted page: a model refused for its license must not be seeded through us.
- Have the disk space and a connection you can leave on.
- Torrents exist only when someone holds the bytes. At Stage 0 none exist yet. Anyone who holds a full copy can make the first one.

## Steps {#steps}

1. Download the model and verify it with `fw.py verify` against the signed manifest.
2. Get the torrent file or magnet link from the model page (when one exists).
3. Open it in a client such as qBittorrent, Transmission or Deluge.
4. Choose your verified folder as the save location. The client checks the files and starts seeding.
5. Leave it running.

To make a torrent from your copy, use hybrid v1 and v2 hashes, include the file list in the manifest order, and add web seeds. Send us the infohash and we check it against the manifest before listing.

## Web seeds {#web-seeds}

A web seed is an HTTP source inside a torrent. The client takes pieces from the swarm and from the web seed. Freeweights torrents list the Freeweights resolve URL and registered mirrors as web seeds. If you run a web server with the files, tell us. A mirror is the formal version of this. See Mirrors.

## What counts as Community seeded {#counts}

At least one known seeder holds a full copy. We check by tracker scrape or a partner project's interface, when the model is read. If no seeder is found, the badge is dropped. We never show it by default.

## Stopping {#stop}

You can stop at any time. There is no contract for a volunteer seed.
