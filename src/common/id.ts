import { nanoid } from 'nanoid';

export default function id(prefix: string): string {
  return `${prefix}_${nanoid()}`;
}
