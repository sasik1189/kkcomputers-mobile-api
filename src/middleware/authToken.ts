import { Request, Response, NextFunction } from 'express';
// import jwt from 'jsonwebtoken';
// import config from '../env_variables_config/config';
import { UserModel } from '../endpoint/models/user.row.model';

const userModel = new UserModel();
//middleware
export const verifyAuthToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check authorization header validate
    const authorizationHeader = req.headers.authorization;
    const token = authorizationHeader ? authorizationHeader.split(' ')[1] : '';
    const userId = await userModel.getUserToken(token);
    if (userId == null) {
      return res.status(401).json({
        message: 'Sorry invalid token',
      });
    }
    req.body.userId = userId;
    // const decoded = jwt.verify(token, `${config.tokenSecret}`);
    next();
  } catch (error) {
    //invalid authentication
    res.status(401);
    res.json({
      message: 'Sorry invalid token',
    });
  }
};
