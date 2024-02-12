import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common'
import { ZodValidationException } from 'nestjs-zod'

/**
 * Exception filter which catches all ZodValidationExceptions (usually from pipes/guards)
 * and returns a standardised response.
 */
@Catch(ZodValidationException)
export class ZodValidationExceptionFilter implements ExceptionFilter {
    catch(zodException: ZodValidationException, host: ArgumentsHost) {
        const zodIssues = zodException.getZodError().issues
        const issueMessages = zodIssues
            .map(issue => {
                requiredScope: if (issue.message == 'Required') {
                    const subject = issue.path.at(-1)?.toString()
                    if (!subject) break requiredScope

                    return `${subject[0].toUpperCase() + subject.substring(1)} is required`
                }

                return issue.message
            })
            .sort((a, b) => b.length - a.length)

        // @TODO: This needs to be a unified response
        const responseBody = {
            message: issueMessages,
            validationIssues: zodIssues,
        }

        host.switchToHttp().getResponse().status(400).json(responseBody)
    }
}
