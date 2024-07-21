import { fileURLToPath } from 'url';
import { dirname } from 'path';

export const getFilename = () => fileURLToPath(import.meta.url);
export const getDirname = () =>  dirname(getFilename());