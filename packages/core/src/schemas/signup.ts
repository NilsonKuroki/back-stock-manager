import Joi from "joi";

export const signupSchema = Joi.object({
    group: Joi.string(),
    name: Joi.string()
        .min(3)
        .required(),
    mobilePhone: Joi.string()
        .pattern(/^[1-9]{2}9[0-9]{8}$/)
        .required(),
    email: Joi.string()
        .email({ minDomainSegments: 2 })
        .required(),
    document: Joi.string()
        .min(11)
        .required(),
    status: Joi.string()
        .valid("active", "inactive")
        .required()
})