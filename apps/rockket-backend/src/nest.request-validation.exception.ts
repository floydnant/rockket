// import { HttpStatus, appendMessage } from '@1k5/ts-commons';
// import { NestException } from './nest.base.exception';
// import { RequestValidationExceptionCode } from './nest.exception-codes';

// export abstract class RequestValidationException extends NestException {
//   declare code: RequestValidationExceptionCode;

//   constructor(
//     code: RequestValidationExceptionCode,
//     status: HttpStatus,
//     message?: string
//   ) {
//     super(code, status, message);
//   }
// }

// /**
//  * Thrown when a Zod validation (via `ZodValidationPipe` or `ZodGuard`) fails.
//  */
// export class SyntacticRequestValidationException extends RequestValidationException {
//   override validationIssues: object[];

//   constructor(validationIssues: object[], message?: string) {
//     super(
//       RequestValidationExceptionCode.SYNTACTIC,
//       HttpStatus.BAD_REQUEST,
//       SyntacticRequestValidationException.name + appendMessage(message)
//     );
//     this.validationIssues = validationIssues;
//   }
// }

// /**
//  * Thrown when a request passes Zod validation, but is semantically invalid.
//  */
// export class SemanticRequestValidationException extends RequestValidationException {
//   constructor(message?: string) {
//     super(
//       RequestValidationExceptionCode.SEMANTIC,
//       HttpStatus.UNPROCESSABLE_ENTITY,
//       SemanticRequestValidationException.name + appendMessage(message)
//     );
//   }
// }
