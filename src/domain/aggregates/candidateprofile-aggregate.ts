import { LoggingProducer, LogPriority } from 'covidscreener-logging/dist/logging.producer/src/';
import { CandidateProfileRepository } from '../repositories/candidateprofile-repository';
import { CandidateProfileValidation } from '../validation/candidateprofile-validation';
import { CandidateProfileMapping } from '../mapping/candidateprofile-mapping';
import { ResponseStatus } from '../enums/response-status';
import { StatusCode } from '../enums/status-code';
import { ObjectID, ObjectId } from 'mongodb';
import { GoogleSheetIntegrationEvent } from 'covidscreener-googlesheetintegration/dist/googlesheetintegration.dto/src';
import { GoogleSheetIntegrationProducer } from 'covidscreener-googlesheetintegration/dist/googlesheetintegration.producer/src'
import { PaymentPlanRepository } from '../repositories/payment-plan-repository';
import { IntegrationTypes } from '../models/integration-types';
import { GoogleIntegration } from '../integrations/google-integration';
import { ActiveCampaignIntegration } from '../integrations/active-campaign-integration';
import { HubspotIntegration } from '../integrations/hubspot-integration';

export class CandidateProfileAggregate {
    constructor(
        private repository: CandidateProfileRepository,
        private validation: CandidateProfileValidation,
        private mapper: CandidateProfileMapping,
        private paymentPlanRepository: PaymentPlanRepository
    ) { }

    async createAsync(request: any, user: any, requestId: string): Promise<any> {
        try {
            const validationResponse = await this.validation.validateCreate(request, user);

            if (validationResponse.status === ResponseStatus.failure) {
                validationResponse.responseId = requestId;
                return validationResponse;
            }

            const model = await this.mapper.mapToModel(request);
            model.organizationId = new ObjectId(user.organization._id);
            model.userId = new ObjectId(user._id);

            const resultModel = await this.repository.createAsync(model, user);

            if (resultModel) {
                const paymentPlan = await this.paymentPlanRepository.getPaymentPlan(user);
                const activeIntegrations = user.activeIntegrations;

                if (paymentPlan && activeIntegrations) {

                    const allowGoogle = await this.paymentPlanRepository.checkPaymentPlan(IntegrationTypes.google, paymentPlan);
                    if (allowGoogle && activeIntegrations.google) {
                        await GoogleIntegration.sendToGoogle(resultModel, user.organizationId);
                    }

                    if (resultModel.marketingConsent) {
                        const allowActiveCampaign = await this.paymentPlanRepository.checkPaymentPlan(IntegrationTypes.activeCampaign, paymentPlan);
                        if (allowActiveCampaign && activeIntegrations.activeCampaign) {
                            await ActiveCampaignIntegration.sendToActiveCampaign(resultModel, user.organizationId, user.activeCampaignTagName);
                        }

                        const allowHubspot = await this.paymentPlanRepository.checkPaymentPlan(IntegrationTypes.hubspot, paymentPlan);
                        if (allowHubspot && activeIntegrations.hubspot) {
                            await HubspotIntegration.sendToHubspot(resultModel, user.organizationId, user.activeCampaignTagName);
                        }
                    }
                }

                const response = {
                    responseId: requestId,
                    message: 'CandidateProfile create request success',
                    status: ResponseStatus.success,
                    code: StatusCode.ok,
                    data: resultModel,
                };

                return response;
            } else {
                const response = {
                    responseId: requestId,
                    message: 'CandidateProfile create request failed',
                    status: ResponseStatus.failure,
                    code: StatusCode.internalServerError,
                };

                return response;
            }
        } catch (ex) {
            const ERROR_MESSAGE = 'Error occurred while executing create aggregation logic in CandidateProfile API';
            LoggingProducer.logAsync(ERROR_MESSAGE, ex, LogPriority.high);

            throw ex;
        }
    }

    async updateAsync(request: any, user: any, requestId: string): Promise<any> {
        try {
            const validationResponse = await this.validation.validateUpdate(request, user);

            if (validationResponse.status === ResponseStatus.failure) {
                validationResponse.requestId = requestId;
                return validationResponse;
            }

            const model = await this.mapper.mapToModel(request);
            model.organizationId = new ObjectId(user.organization._id);
            model.userId = new ObjectId(user._id);

            const resultModel = await this.repository.updateAsync(model, user);

            if (resultModel) {

                const paymentPlan = await this.paymentPlanRepository.getPaymentPlan(user);
                const activeIntegrations = user.activeIntegrations;

                if (paymentPlan && activeIntegrations) {

                    const allowGoogle = await this.paymentPlanRepository.checkPaymentPlan(IntegrationTypes.google, paymentPlan);
                    if (allowGoogle && activeIntegrations.google) {
                        await GoogleIntegration.sendToGoogle(resultModel, user.organizationId);
                    }

                    if (resultModel.marketingConsent) {
                        const allowActiveCampaign = await this.paymentPlanRepository.checkPaymentPlan(IntegrationTypes.activeCampaign, paymentPlan);
                        if (allowActiveCampaign && activeIntegrations.activeCampaign) {
                            await ActiveCampaignIntegration.sendToActiveCampaign(resultModel, user.organizationId, user.activeCampaignTagName);
                        }

                        const allowHubspot = await this.paymentPlanRepository.checkPaymentPlan(IntegrationTypes.hubspot, paymentPlan);
                        if (allowHubspot && activeIntegrations.hubspot) {
                            await HubspotIntegration.sendToHubspot(resultModel, user.organizationId, user.activeCampaignTagName);
                        }
                    }
                }

                const response = {
                    responseId: requestId,
                    message: 'CandidateProfile update request success',
                    status: ResponseStatus.success,
                    code: StatusCode.ok,
                    data: resultModel,
                };

                return response;
            } else {
                const response = {
                    responseId: requestId,
                    message: 'CandidateProfile update request failed',
                    status: ResponseStatus.failure,
                    code: StatusCode.internalServerError,
                };

                return response;
            }
        } catch (ex) {
            const ERROR_MESSAGE = 'Error occurred while executing create aggregation logic in CandidateProfile API';
            LoggingProducer.logAsync(ERROR_MESSAGE, ex, LogPriority.high);

            throw ex;
        }
    }

    async deleteAsync(id: string, user: any, requestId: string): Promise<any> {
        try {
            const validationResponse = await this.validation.validateDelete(id, user);

            if (validationResponse.status === ResponseStatus.failure) {
                validationResponse.requestId = requestId;
                return validationResponse;
            }

            const resultModel = await this.repository.deleteAsync(new ObjectID(id), user);

            if (resultModel) {
                const response = {
                    responseId: requestId,
                    message: 'CandidateProfile delete request success',
                    status: ResponseStatus.success,
                    code: StatusCode.ok,
                };

                return response;
            } else {
                const response = {
                    responseId: requestId,
                    message: 'CandidateProfile delete request failed',
                    status: ResponseStatus.failure,
                    code: StatusCode.internalServerError,
                };

                return response;
            }
        } catch (ex) {
            const ERROR_MESSAGE = 'Error occurred while executing delete aggregation logic in CandidateProfile API';
            LoggingProducer.logAsync(ERROR_MESSAGE, ex, LogPriority.high);

            throw ex;
        }
    }

    async undeleteAsync(id: string, user: any, requestId: string): Promise<any> {
        try {
            const validationResponse = await this.validation.validateUndelete(id, user);

            if (validationResponse.status === ResponseStatus.failure) {
                validationResponse.requestId = requestId;
                return validationResponse;
            }

            const resultModel = await this.repository.undeleteAsync(new ObjectID(id), user);

            if (resultModel) {
                const response = {
                    responseId: requestId,
                    message: 'CandidateProfile undelete request success',
                    status: ResponseStatus.success,
                    code: StatusCode.ok,
                };

                return response;
            } else {
                const response = {
                    responseId: requestId,
                    message: 'CandidateProfile undelete request failed',
                    status: ResponseStatus.failure,
                    code: StatusCode.internalServerError,
                };

                return response;
            }
        } catch (ex) {
            const ERROR_MESSAGE = 'Error occurred while executing undelete aggregation logic in CandidateProfile API';
            LoggingProducer.logAsync(ERROR_MESSAGE, ex, LogPriority.high);

            throw ex;
        }
    }

    async lookupAsync(
        id: string,
        searchString: string,
        start: number,
        limit: number,
        user: any,
        requestId: string,
        isAdmin: boolean
    ): Promise<any> {
        try {
            const validationResponse = await this.validation.validateLookup(id, searchString, user);

            if (validationResponse.status === ResponseStatus.failure) {
                validationResponse.requestId = requestId;
                return validationResponse;
            }

            const resultModel = await this.repository.lookupAsync(
                id ? new ObjectID(id) : null,
                searchString && searchString !== '' && searchString !== ' ' ? searchString : '',
                start,
                limit,
                user,
                isAdmin
            );
            const results: any[] = [];

            resultModel.forEach((element) => {
                results.push(this.mapper.mapToModel(element));
            });

            if (results.length > 0) {
                const response = {
                    responseId: requestId,
                    message: 'CandidateProfile lookup request success',
                    status: ResponseStatus.success,
                    code: StatusCode.ok,
                    data: results,
                };

                return response;
            } else {
                const response = {
                    responseId: requestId,
                    message: 'No data could be retrieved',
                    status: ResponseStatus.failure,
                    code: StatusCode.noData,
                };

                return response;
            }
        } catch (ex) {
            const ERROR_MESSAGE = 'Error occurred while executing lookup aggregation logic in CandidateProfile API';
            LoggingProducer.logAsync(ERROR_MESSAGE, ex, LogPriority.high);

            throw ex;
        }
    }
}
