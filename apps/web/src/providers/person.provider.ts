export const getFirstName = (name: string) => {
  const pieces = name.split(" ");

  return `${pieces[0]}`;
};

export const getAbbreviatedName = (name: string) => {
  const pieces = name.split(" ");

  return `${pieces[0]}${pieces[1] ? " " + pieces[1][0] + "." : ""}`;
};
