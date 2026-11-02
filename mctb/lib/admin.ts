export function isAdmin(req: Request): boolean {
  const token = process.env.ADMIN_TOKEN;
  return !!token && req.headers.get("x-admin-token") === token;
}

export function unauthorized() {
  return Response.json({ error: "unauthorized" }, { status: 401 });
}
