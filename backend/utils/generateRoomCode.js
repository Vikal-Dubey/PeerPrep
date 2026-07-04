import { customAlphabet } from "nanoid";

// Excludes ambiguous chars (0/O, 1/l/I) for readability
const nanoid = customAlphabet("23456789abcdefghjkmnpqrstuvwxyz", 4);

export const generateRoomCode = () => {
  return `${nanoid()}-${nanoid()}-${nanoid()}`; // e.g. "xk3f-9qp2-mv7t"
};