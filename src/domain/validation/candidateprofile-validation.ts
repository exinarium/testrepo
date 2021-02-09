import { LoggingProducer, LogPriority } from 'covidscreener-logging/dist/logging.producer/src/';
import { ResponseStatus } from '../enums/response-status';
import { StatusCode } from '../enums/status-code';
import { Role } from 'covidscreener-authentication-jwt/dist/domain/models/user-role';
import { ObjectID } from 'mongodb';

export class CandidateProfileValidation {
    async validateCreate(request: any, user: any): Promise<any> {
        try {
            let valid = true;
            let returnMessage = '';

            if (!request || !user || !user._id || user._id === '') {
                return {
                    responseId: '',
                    message: 'Request and User Object cannot be empty',
                    status: ResponseStatus.failure,
                    code: StatusCode.badRequest,
                };
            } else {
                if (!request.requestId || request.requestId === '') {
                    returnMessage += '\nThe request id needs to be supplied';
                    valid = false;
                }

                if (!request.firstName || request.firstName === '') {
                    returnMessage += '\nThe candidate first name needs to be supplied';
                    valid = false;
                }

                if (!request.lastName || request.lastName === '') {
                    returnMessage += '\nThe candidate last name needs to be supplied';
                    valid = false;
                }

                if (!request.idNumber || request.idNumber === '') {
                    returnMessage += '\nThe candidate ID number needs to be supplied';
                    valid = false;
                }

                if (!request.telephoneNumber || request.telephoneNumber === '' || request.telephoneNumber.length < 10) {
                    returnMessage += '\nThe candidate telephone number is invalid';
                    valid = false;
                }

                if (request.covid19Consent === undefined) {
                    returnMessage += '\nThe Covid 19 consent value should be supplied';
                    valid = false;
                }

                if (request.marketingConsent === undefined) {
                    returnMessage += '\nThe marketing consent value should be supplied';
                    valid = false;
                }
            }

            if (!valid) {
                return {
                    responseId: '',
                    message: returnMessage,
                    status: ResponseStatus.failure,
                    code: StatusCode.badRequest,
                };
            }

            const response = {
                responseId: '',
                message: 'Validation successful',
                status: ResponseStatus.success,
                code: StatusCode.ok,
            };

            return response;
        } catch (ex) {
            const ERROR_MESSAGE = 'Error during create request validation';
            LoggingProducer.logAsync(ERROR_MESSAGE, ex, LogPriority.high);

            throw ex;
        }
    }

    async validateUpdate(request: any, user: any): Promise<any> {
        try {
            let valid = true;
            let returnMessage = '';

            if (!request || !user || !user._id || user._id === '') {
                return {
                    responseId: '',
                    message: 'Request and User Object cannot be empty',
                    status: ResponseStatus.failure,
                    code: StatusCode.badRequest,
                };
            } else {
                if (!request._id || request._id === '' || !ObjectID.isValid(request._id)) {
                    valid = false;
                    returnMessage = '\n\rThe _id property is not valid';
                }

                if (!request.requestId || request.requestId === '') {
                    returnMessage += '\nThe request id needs to be supplied';
                    valid = false;
                }

                if (!request.firstName || request.firstName === '') {
                    returnMessage += '\nThe candidate first name needs to be supplied';
                    valid = false;
                }

                if (!request.lastName || request.lastName === '') {
                    returnMessage += '\nThe candidate last name needs to be supplied';
                    valid = false;
                }

                if (!request.idNumber || request.idNumber === '') {
                    returnMessage += '\nThe candidate ID number needs to be supplied';
                    valid = false;
                }

                if (!request.telephoneNumber || request.telephoneNumber === '' || request.telephoneNumber.length < 10) {
                    returnMessage += '\nThe candidate telephone number is invalid';
                    valid = false;
                }

                if (request.covid19Consent === undefined) {
                    returnMessage += '\nThe Covid 19 consent value should be supplied';
                    valid = false;
                }

                if (request.marketingConsent === undefined) {
                    returnMessage += '\nThe marketing consent value should be supplied';
                    valid = false;
                }

                if (!request.version || request.version <= 0) {
                    returnMessage += '\nThe object version is not valid';
                    valid = false;
                }
            }

            if (!valid) {
                return {
                    responseId: '',
                    message: returnMessage,
                    status: ResponseStatus.failure,
                    code: StatusCode.badRequest,
                };
            }

            const response = {
                responseId: '',
                message: 'Validation successful',
                status: ResponseStatus.success,
                code: StatusCode.ok,
            };

            return response;
        } catch (ex) {
            const ERROR_MESSAGE = 'Error during create request validation';
            LoggingProducer.logAsync(ERROR_MESSAGE, ex, LogPriority.high);

            throw ex;
        }
    }

    async validateDelete(id: string, user: any): Promise<any> {
        try {
            let valid = true;
            let returnMessage = '';

            if (!id || id === '' || !user || !user._id || user._id === '') {
                return {
                    responseId: '',
                    message: 'ID and User cannot be empty',
                    status: ResponseStatus.failure,
                    code: StatusCode.badRequest,
                };
            } else {
                if (!ObjectID.isValid(id)) {
                    valid = false;
                    returnMessage = '\n\rThe _id property is not valid';
                }
            }

            if (!valid) {
                return {
                    responseId: '',
                    message: returnMessage,
                    status: ResponseStatus.failure,
                    code: StatusCode.badRequest,
                };
            }

            const response = {
                responseId: '',
                message: 'Validation successful',
                status: ResponseStatus.success,
                code: StatusCode.ok,
            };

            return response;
        } catch (ex) {
            const ERROR_MESSAGE = 'Error during create request validation';
            LoggingProducer.logAsync(ERROR_MESSAGE, ex, LogPriority.high);

            throw ex;
        }
    }

    async validateUndelete(id: string, user: any): Promise<any> {
        try {
            let valid = true;
            let returnMessage = '';

            if (!id || id === '' || !user || !user._id || user._id === '') {
                return {
                    responseId: '',
                    message: 'ID and User cannot be empty',
                    status: ResponseStatus.failure,
                    code: StatusCode.badRequest,
                };
            } else {
                if (!ObjectID.isValid(id)) {
                    valid = false;
                    returnMessage = '\n\rThe _id property is not valid';
                }
            }

            if (!valid) {
                return {
                    responseId: '',
                    message: returnMessage,
                    status: ResponseStatus.failure,
                    code: StatusCode.badRequest,
                };
            }

            const response = {
                responseId: '',
                message: 'Validation successful',
                status: ResponseStatus.success,
                code: StatusCode.ok,
            };

            return response;
        } catch (ex) {
            const ERROR_MESSAGE = 'Error during create request validation';
            LoggingProducer.logAsync(ERROR_MESSAGE, ex, LogPriority.high);

            throw ex;
        }
    }

    async validateLookup(id: string, searchString: string, user: any): Promise<any> {
        try {
            let valid = true;
            let returnMessage = '';

            if (!user || !user._id || user._id === '') {
                return {
                    responseId: '',
                    message: 'User object cannot be empty',
                    status: ResponseStatus.failure,
                    code: StatusCode.badRequest,
                };
            } else {
                if (id && id !== '') {
                    if (!ObjectID.isValid(id)) {
                        valid = false;
                        returnMessage = '\n\rThe _id property is not valid';
                    }
                }
            }

            if (!valid) {
                return {
                    responseId: '',
                    message: returnMessage,
                    status: ResponseStatus.failure,
                    code: StatusCode.badRequest,
                };
            }

            const response = {
                responseId: '',
                message: 'Validation successful',
                status: ResponseStatus.success,
                code: StatusCode.ok,
            };

            return response;
        } catch (ex) {
            const ERROR_MESSAGE = 'Error during create request validation';
            LoggingProducer.logAsync(ERROR_MESSAGE, ex, LogPriority.high);

            throw ex;
        }
    }

    validateEmail(email: any) {
        const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }
}
