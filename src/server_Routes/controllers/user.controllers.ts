import { Request, Response, NextFunction } from 'express';
import { UserModel, User } from '../../endpoint/models/user.row.model';
import jwt from 'jsonwebtoken';
import config from '../../env_variables_config/config';
import bcrypt from 'bcrypt';

//instance from the UserModel class
const userModel = new UserModel();

//create a user
export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const checkMailOrPhone = await userModel.checkMailOrPhone(req.body);

    if (checkMailOrPhone != '') {
      res.status(400);
      res.json({
        message: [checkMailOrPhone],
      });
    } else {
      const user = await userModel.create(req.body);
      //token to be stored on the frontend and can be used for future authorizations with the API
      const token = jwt.sign({ user }, `${config.tokenSecret}`);
      //Pass back the token so that the client can store the token & use it for future HTTP requests

      res.json({
        data: token,
        message: 'done.. user created',
      });
    }
  } catch (error) {
    res.status(500);
    res.json({
      message: String(error),
    });
  }
};

//Select all users
export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await userModel.getAllUsers();
    res.json({
      data: user,
      message: 'done.. recieved all users',
    });
  } catch (error) {
    next(error);
  }
};

//Select a specific user
export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await userModel.getUser(req.params.id as unknown as number);
    res.json({
      data: user,
      message: 'done.. user recieved',
    });
  } catch (error) {
    next(error);
  }
};

//delete user
export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await userModel.deleteUser(req.params.id as unknown as number);
    res.json({
      data: user,
      message: 'done.. user deleted',
    });
  } catch (error) {
    next(error);
  }
};

//authenticate
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await userModel.authenticate(
      req.body.identifier,
      req.body.password
    );
    const token = jwt.sign({ user }, `${config.tokenSecret}`);
    if (!user) {
      return res.status(401).json({
        message: ['Email or mobile not not found. Please signup'],
      });
    }
    if (!user.password) {
      return res.status(401).json({
        message: ['Invalid password'],
      });
    }
    if (
      bcrypt.compareSync(
        (req.body.password + config.pepper) as string,
        user.password
      )
    ) {
      return res.json({
        data: {
          userId: user.userId,
          name: user.name,
          shopName: user.shopName,
          token: token,
        },
        message: 'login successfully',
      });
    } else {
      return res.status(401).json({
        message: ['Incorrect password'],
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: String(error),
    });
  }
};
