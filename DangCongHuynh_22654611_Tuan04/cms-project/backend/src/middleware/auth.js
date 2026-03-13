export function attachRole(req, _res, next) {
  req.role = req.headers["x-role"] || "user";
  next();
}

export function requireAdmin(req, res, next) {
  if (req.role !== "admin") {
    return res.status(403).json({
      message: "Forbidden: admin role required",
    });
  }

  return next();
}
