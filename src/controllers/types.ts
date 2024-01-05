import {Buffer} from "buffer";

export interface ImagesResponse {
  typeImage: string;
  result?: Buffer;
  error?: [number, string];
}


