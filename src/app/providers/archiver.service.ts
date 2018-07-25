import { Injectable } from '@angular/core';
import * as archiver from 'archiver';
import { Archiver } from 'archiver';
import * as decompress from 'decompress';

const COMPRESSION_LEVEL = 9;

@Injectable()
export class ArchiveService {
  constructor() {}

  async decompress(
    input: string | Buffer,
    output?: string | decompress.DecompressOptions,
    opts?: decompress.DecompressOptions
  ): Promise<decompress.File[]> {
    return decompress(input, output);
  }

  archive(): Archiver {
    return archiver('zip', {
      zlib: { level: COMPRESSION_LEVEL }
    });
  }
}
