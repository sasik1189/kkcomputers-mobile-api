import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

interface VerifyMobile {
  mobile: string;
}

interface UserRegistration {
  name: string;
  mobile: string;
  email: string;
  password: string;
  shopName: string;
  otp: string;
}

interface UserLogin {
  identifier: string;
  password: string;
}

interface GoogleLogin {
  userId: string;
  name: string;
  email: string;
  token: string;
}

const verifyMobileSchema = Joi.object<VerifyMobile>({
  mobile: Joi.string()
    .pattern(/^[0-9]{10}$/) // Adjust regex based on your country's format
    .required()
    .messages({ 'string.pattern.base': 'Mobile must be a valid phone number' }),
});

const registrationSchema = Joi.object<UserRegistration>({
  name: Joi.string()
    .min(3)
    .max(50)
    .required()
    .messages({ 'string.min': 'Name must be at least 3 characters long' }),

  mobile: Joi.string()
    .pattern(/^[0-9]{10}$/) // Adjust regex based on your country's format
    .required()
    .messages({ 'string.pattern.base': 'Mobile must be a valid phone number' }),

  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required(),
  password: Joi.string().min(6).required(),

  shopName: Joi.string().min(2).required(),

  otp: Joi.string()
    .pattern(/^[0-9]{4}$/) // Adjust regex based on your country's format
    .required()
    .messages({ 'string.pattern.base': 'OTP is invalid' }),
});

const loginSchema = Joi.object<UserLogin>({
  identifier: Joi.alternatives()
    .try(
      // Validate as Email
      Joi.string()
        .email({ tlds: { allow: false } })
        .required(),
      // Validate as Phone Number (e.g., 10 digits)
      Joi.string().pattern(new RegExp('^[0-9]{10}$')).required()
    )
    .required()
    .messages({
      'alternatives.match': 'Invalid email or mobile',
    }),
  password: Joi.string().min(6).required(),
});

const googleLoginSchema = Joi.object<GoogleLogin>({
  name: Joi.string().required().messages({
    'any.required': 'Invalid request.',
  }),
  userId: Joi.string().required().messages({
    'any.required': 'Invalid request.',
  }),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'any.required': 'Invalid request.',
    }),
});

export const validateMobile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error, value } = verifyMobileSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    res.status(400);
    res.json({
      message: error.details.map((err) => err.message),
    });
  } else {
    next();
  }
};

export const validateRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error, value } = registrationSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    res.status(400);
    res.json({
      message: error.details.map((err) => err.message),
    });
  } else {
    next();
  }
};

export const validateLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error, value } = loginSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    res.status(400);
    res.json({
      message: error.details.map((err) => err.message),
    });
  } else {
    next();
  }
};

export const validateGoogleLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error, value } = googleLoginSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    res.status(400);
    res.json({
      message: error.details.map((err) => err.message),
    });
  } else {
    next();
  }
};
