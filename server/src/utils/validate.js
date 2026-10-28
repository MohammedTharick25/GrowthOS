export function validate(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse({ body: req.body, params: req.params, query: req.query });
    if (!result.success) {
      const fields = result.error.issues
        .filter((issue) => issue.path[0] === 'body' && issue.path.length > 1)
        .map((issue) => ({ field: String(issue.path[1]), message: issue.message }));
      return next(Object.assign(new Error(result.error.issues[0]?.message || 'Invalid request.'), { statusCode: 422, fields }));
    }
    req.validated = result.data; next();
  };
}
