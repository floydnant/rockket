import * as Joi from 'joi'

export const configValidationSchema = Joi.object({
    PORT: Joi.number().default(3000),
    DATABASE_URL: Joi.string().required(),
    JWT_SECRET: Joi.string().required(),

    // APP_CONTEXT: Joi.allow('Development', 'Review', 'Staging', 'Production').only().default('Development'),
    RAILWAY_ENVIRONMENT: Joi.string().default('Development'),
    APPLICATIONINSIGHTS_CONNECTION_STRING: Joi.string(),

    TESTING_ENV: Joi.string().default('false'),
})
