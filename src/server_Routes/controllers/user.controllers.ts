import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../../endpoint/models/user.row.model';
import jwt from 'jsonwebtoken';
import config from '../../env_variables_config/config';
import bcrypt from 'bcrypt';
import { Twilio } from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const twilioClient = new Twilio(accountSid, authToken);

//instance from the UserModel class
const userModel = new UserModel();

function getRandomFourDigitString() {
  const randomNumber = Math.floor(Math.random() * 10000);
  return `${randomNumber}`.padStart(4, '0');
}

export const verifyMobile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const checkPhone = await userModel.checkPhone(req.body);

    if (checkPhone != null) {
      res.status(400);
      res.json({
        message: [checkPhone],
      });
    } else {
      const randomFourDigit = getRandomFourDigitString();
      const message = await twilioClient.messages.create({
        body: `Your OTP is ${randomFourDigit} to verify your mobile - KK Computers `,
        from: '+919789475030',
        to: '+919942811589',
        // to: `+91${req.body.mobile}`,
      });
      console.log(message.sid);

      await userModel.insertOtp(req.body.mobile, randomFourDigit);

      res.json({
        data: { otp: randomFourDigit },
        message: 'done.. sent OTP',
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500);
    res.json({
      message: String(error),
    });
  }
};

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
      const checkOtp = await userModel.checkOtp(req.body.mobile, req.body.otp);
      if (checkOtp) {
        res.status(400);
        res.json({
          message: [checkOtp],
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
    const user = await userModel.getUser(req.body.userId as unknown as string);
    if (user == null) {
      return res.status(404).json({
        message: 'User token not found',
      });
    }
    res.json({
      data: user,
      message: 'done.. user recieved',
    });
  } catch (error) {
    console.log(error);
    res.status(500);
    res.json({
      message: String(error),
    });
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
      delete user.password;
      const time = new Date();
      const token = jwt.sign(
        { user, time: time.toISOString() },
        `${config.tokenSecret}`
      );

      await userModel.saveLoginToken(user.userId, token);
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
    console.log(error);
    return res.status(500).json({
      message: String(error),
    });
  }
};
