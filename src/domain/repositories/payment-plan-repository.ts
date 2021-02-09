import { IntegrationTypes } from "../models/integration-types";
import mongodb, { ObjectID } from 'mongodb';
import { Config } from "../config/config";
import { LoggingProducer, LogPriority } from "covidscreener-logging/dist/logging.producer/src";

export class PaymentPlanRepository {

    constructor(private config: Config) { }

    async checkPaymentPlan(integrationType: IntegrationTypes, paymentPlan: any) {

        let result = false;

        if (integrationType === IntegrationTypes.google) {

            if (paymentPlan.allowGoogleIntegration) {
                result = true;
            }
        } else if (integrationType === IntegrationTypes.activeCampaign) {

            if (paymentPlan.allowActiveCampaignIntegration) {
                result = true;
            }
        } else if (integrationType === IntegrationTypes.hubspot) {

            if (paymentPlan.allowHubspotIntegration) {
                result = true;
            }
        }

        return result;
    }

    async getPaymentPlan(user: any): Promise<any> {
        let dataContext: mongodb.MongoClient;
        let result = false;
        let organization: any;

        try {
            const connectionString = this.config.databaseConfig.connectionString;

            if (connectionString === undefined || connectionString === '') {
                throw new Error('Connection string cannot be null or empty');
            }

            dataContext = await new mongodb.MongoClient(connectionString, { useUnifiedTopology: true }).connect();

            const collection = dataContext
                .db('Users')
                .collection('Organization');

            organization = await collection.findOne({
                _id: new ObjectID(user.organizationId)
            });

            if (!organization) {
                throw new Error('Organization not found');
            }

            const paymentPlanCollection = dataContext.db('Users').collection('PaymentPlans');
            result = await paymentPlanCollection.findOne({ planNumber: organization?.paymentPlan });
        } catch (ex) {

            const ERROR_MESSAGE = 'Error in ContactProfileApi while retrieving payment plan';
            LoggingProducer.logAsync(ERROR_MESSAGE, ex, LogPriority.high);

            throw ex;
        } finally {

            await dataContext.close();
        }

        return result;
    }
}