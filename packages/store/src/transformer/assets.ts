import { assertExists } from '@blocksuite/global/utils';
import { Buffer } from 'buffer';

import type { BlobManager } from '../index.js';
import { sha } from '../persistence/blob/utils.js';

type AssetsManagerConfig = {
  blobs: BlobManager;
};

const blobToBuffer = async (blob: Blob) => {
  return Buffer.from(await blob.arrayBuffer());
};

export class AssetsManager {
  private readonly _assetsMap = new Map<string, Blob>();
  private readonly _blobs: BlobManager;

  constructor(options: AssetsManagerConfig) {
    this._blobs = options.blobs;
  }

  cleanup() {
    this._assetsMap.clear();
  }

  async readFromBlob(blobId: string) {
    const blob = await this._blobs.get(blobId);
    assertExists(blob, `Blob ${blobId} not found in blob manager`);

    this._assetsMap.set(blobId, blob);
  }

  async writeToBlob(blobId: string) {
    const blob = this._assetsMap.get(blobId);
    assertExists(blob);

    const exists = (await this._blobs.get(blobId)) !== null;
    if (exists) {
      throw new Error(`Blob ${blobId} already exists in blob manager`);
    }

    await this._blobs.set(blob, blobId);
  }

  async readFromSnapshot<T = unknown>(snapshotId: string) {
    const snapshot = this._assetsMap.get(snapshotId);
    assertExists(snapshot);
    const buffer = await blobToBuffer(snapshot);
    const json = new TextDecoder().decode(buffer);
    return JSON.parse(json) as T;
  }

  async writeSnapshot<T = unknown>(snapshot: T) {
    const json = JSON.stringify(snapshot);
    const bytes = new TextEncoder().encode(json);
    const blob = new Blob([bytes], {
      type: 'application/json;charset=utf-8',
    });

    const key = await sha(await blob.arrayBuffer());
    this._assetsMap.set(key, blob);

    return key;
  }
}