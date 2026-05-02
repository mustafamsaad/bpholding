import crypto from "node:crypto";
import ImageKit, { type ClientOptions } from "@imagekit/nodejs";

/**
 * Server-only ImageKit client (used for server-side uploads, deletions,
 * and asset management from the admin dashboard / route handlers).
 *
 * Required env vars:
 *  - IMAGEKIT_PRIVATE_KEY                  (server only — never expose)
 *  - IMAGEKIT_PUBLIC_KEY                   (used by the browser uploader)
 *  - NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT     (used by `next/image` and the browser uploader)
 */
export function getImageKit() {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("Missing IMAGEKIT_PRIVATE_KEY environment variable.");
  }
  const options: ClientOptions = { privateKey };
  return new ImageKit(options);
}

export type ImageKitUploadAuth = {
  token: string;
  expire: number;
  signature: string;
  publicKey: string;
};

/**
 * Generates short-lived upload-auth parameters consumed by the browser
 * uploader (see ImageKit "Client-side upload" auth flow).
 *
 * Algorithm: HMAC-SHA1(privateKey, token + expire)
 */
export function generateImageKitUploadAuth(): ImageKitUploadAuth {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
  if (!privateKey || !publicKey) {
    throw new Error(
      "Missing IMAGEKIT_PRIVATE_KEY or IMAGEKIT_PUBLIC_KEY environment variables.",
    );
  }

  const token = crypto.randomUUID();
  // Default expiry: 30 minutes from now (in seconds, per ImageKit spec).
  const expire = Math.floor(Date.now() / 1000) + 60 * 30;
  const signature = crypto
    .createHmac("sha1", privateKey)
    .update(token + expire)
    .digest("hex");

  return { token, expire, signature, publicKey };
}
