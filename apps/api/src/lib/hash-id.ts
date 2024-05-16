import Hashid from "hashids";

const getHasher = () => {
  return new Hashid("myRand0mS4lt", 8);
};

export const encodeId = (id: string | number): string => {
  if (typeof id === "number") {
    return getHasher().encode([id]);
  }

  return getHasher().encode(id);
};

export const decodeId = (encodedId: string): number => {
  const pieces = encodedId.split("-");
  const hashedId = pieces.length > 1 ? pieces[1] : encodedId;

  if (!hashedId) {
    throw new Error("Could not decode id");
  }

  return getHasher().decode(hashedId).at(0) as number;
};
