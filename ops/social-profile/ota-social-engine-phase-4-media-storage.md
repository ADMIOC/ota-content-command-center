# OTA Social Engine Phase 4 Media Storage

## Status

Completed on 2026-06-30.

Phase 4 moves the Social Engine beyond metadata-only media records. Operators can now upload actual media and proof files through the app, and the backend stores them under a durable local media path with metadata, public URLs, profile linkage, and audit events.

## Storage Decision

Phase 4 uses local filesystem storage first:

```text
data/media-assets/
```

This path is ignored by git. It is suitable for local operator buildout and validation. Google Drive or cloud object storage can become the long-term storage adapter later without changing the app workflow.

## What Phase 4 Added

| Area | Implementation |
| --- | --- |
| Media storage helper | `server/mediaStorage.mjs` |
| Asset upload route | `POST /api/profiles/:profileId/assets/upload` |
| Evidence upload route | `POST /api/profiles/:profileId/evidence/upload` |
| Public file serving | `/media-assets/...` |
| Upload controls | Step 2 Media Asset Library and Step 3 Evidence Vault |
| Metadata detection | MIME type, file size, stored filename, public URL, storage path, image width, and image height |
| Video handling | Video files can be stored; duration detection is marked pending |
| Audit trail | Upload routes record backend audit events |

## Folder Structure

Uploaded files are stored by brand, platform, and asset type.

```text
data/media-assets/{brand-slug}/{platform-key}/{asset-type}/{timestamp}-{safe-file-name}
```

Example:

```text
data/media-assets/otap/youtube/avatar/1782855824807-ota-phase4-upload-test.png
```

Public URL example:

```text
/media-assets/otap/youtube/avatar/1782855824807-ota-phase4-upload-test.png
```

## Asset Types

| Asset Type | Use |
| --- | --- |
| `avatar` | Profile image or channel picture |
| `banner` | Header image, cover image, or channel banner |
| `thumbnail` | Thumbnail or cover template |
| `video` | Intro, trailer, launch, or short-form video asset |
| `screenshot` | Account, profile, admin, or connector screenshot |
| `document` | Other supporting file |
| `evidence` | Proof file uploaded through Evidence Vault |

## Metadata Captured

| Field | Meaning |
| --- | --- |
| `assetName` or `title` | Operator-facing record name |
| `originalName` | Original uploaded filename |
| `storedFileName` | Sanitized stored filename |
| `fileName` | Original display filename |
| `storagePath` | Relative path inside the media store |
| `publicUrl` | Local browser-accessible media URL |
| `mimeType` | Uploaded file MIME type |
| `fileSizeBytes` | Uploaded file size |
| `width` | Image width when readable |
| `height` | Image height when readable |
| `durationSeconds` | Reserved for future video duration detection |
| `approvalState` | Review state for asset records |
| `usageContext` | How the asset should be used in the profile construct |

## Operator Workflow

1. Select the brand and platform profile.
2. Use Step 2 Media Asset Library to upload profile images, banners, thumbnails, videos, screenshots, or other media.
3. Use Step 3 Evidence Vault to upload non-secret proof files.
4. Review the stored asset card for file size, dimensions, description, and public file link.
5. Approve or replace assets in later workflow phases as needed.

## Backend Rules

| Rule | Behavior |
| --- | --- |
| No source-control storage | `data/media-assets/` is ignored by git. |
| No browser localStorage media | Files are uploaded to the backend and written to disk. |
| No plaintext secrets | Upload routes still reject plaintext streaming credential fields. |
| Image dimensions | PNG, JPEG, WebP, and GIF dimensions are detected when possible. |
| Video duration | Video files are stored, with duration detection marked pending. |
| Profile linkage | Avatar uploads update `profileImageAsset`; banner uploads update `bannerAsset`. |
| Audit events | Every upload records a media or evidence audit event. |

## Verification

| Check | Result |
| --- | --- |
| `npm run build` | Passed |
| `GET /api/health` | Passed with `phase: 4` and local filesystem media mode |
| Asset upload route | Passed |
| Evidence upload route | Passed |
| Image dimension detection | Passed with PNG `1 x 1` smoke test |
| Public media URL | Passed with HTTP `200 OK` |
| App state reset after smoke test | Passed |

## Remaining Storage Work

| Future Work | Phase |
| --- | --- |
| Google Drive or cloud object-storage adapter | Later storage hardening |
| Video duration extraction | Phase 4 hardening or later |
| Asset approval workflow controls | Phase 7 or platform buildout |
| Notion asset-row writeback | Live Notion sync phase |
| CDN/public delivery policy | Production deployment phase |
