export const forwardQueryParameters = (destination: URL) => {
  const currentUrl = new URL(window.location.href);

  // Forward query parameters
  for (const [key, value] of currentUrl.searchParams) {
    destination.searchParams.set(key, value);
  }

  return destination;
};
