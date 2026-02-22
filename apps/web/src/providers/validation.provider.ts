export const validateRegEx = (pattern: string, test?: string) => {
  try {
    const regex = new RegExp(pattern);

    return test ? regex.test(test) : true;
  } catch {
    return false;
  }
};
