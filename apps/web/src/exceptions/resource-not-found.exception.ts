export class ResourceNotFound extends Error {
  name = "ResourceNotFound";
  message = "Resource not found.";
  status = 404;
}
