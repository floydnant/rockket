import * as Joi from 'joi'

export const configValidationSchema = Joi.object({
    PORT: Joi.number().default(3000),
    DATABASE_URL: Joi.string().required(),
    JWT_SECRET: Joi.string().required(),

    RAILWAY_ENVIRONMENT: Joi.string().default('Development'),
    APPLICATIONINSIGHTS_CONNECTION_STRING: Joi.string(),
    ENABLE_DEV_INSIGHTS: Joi.string().default('false'),

    TESTING_ENV: Joi.string().default('false'),
})
