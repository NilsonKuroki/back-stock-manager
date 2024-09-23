import Joi from "joi";

export const signinSchema = Joi.object({
    username: Joi.string()
        .min(4)
        .required(),
    password: Joi.string()
        .min(4)
        .required(),
})