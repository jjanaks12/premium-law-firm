import { Request } from "express";

export const getFullFileUrl = (req: Request, url: string | null | undefined): string | null => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  
  const protocol = (req.headers["x-forwarded-proto"] as string) || (req.secure ? "https" : "http");
  const host = req.get("host") || `localhost:${process.env.PORT || 4000}`;
  return `${protocol}://${host}${url}`;
};

export const formatResourceUrl = (req: Request, resource: any) => {
  if (resource && resource.url) {
    return {
      ...resource,
      url: getFullFileUrl(req, resource.url),
    };
  }
  return resource;
};

export const formatUserAvatarUrl = (req: Request, user: any) => {
  if (user) {
    const formattedUser = { ...user };
    if (formattedUser.avatar) {
      formattedUser.avatar = formatResourceUrl(req, formattedUser.avatar);
    }
    return formattedUser;
  }
  return user;
};
