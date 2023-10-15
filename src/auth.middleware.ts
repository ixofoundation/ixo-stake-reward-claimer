import { Request, Response, NextFunction } from 'express';

export function authorization(req: Request, res: Response, next: NextFunction) {
  if (req.get('Authorization') === process.env.AUTHORIZATION) {
    next();
    return;
  }
  res.status(401).send('Authorization Failed');
  return;
}
