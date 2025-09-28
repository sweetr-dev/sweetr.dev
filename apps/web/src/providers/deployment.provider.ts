export const formatDeploymentVersion = (version: string) => {
  if (version.includes(".") || version.startsWith("v")) return version;

  return version.substring(0, 7);
};
