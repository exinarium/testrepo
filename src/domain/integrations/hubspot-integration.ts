import { ObjectID } from "mongodb";
import { HubspotIntegrationEvent, ResponseStatus } from 'covidscreener-hubspotintegration/dist/hubspotintegration.dto/src';
import { HubspotIntegrationProducer } from 'covidscreener-hubspotintegration/dist/hubspotintegration.producer/src';

export class HubspotIntegration {

    static async sendToHubspot(resultModel: any, organizationId: string, activeCampaignTagName: string): Promise<boolean> {

        const hubspotEvent = new HubspotIntegrationEvent<any>(
            new ObjectID(),
            new Date(),
            'HubspotIntegrationEvent',
            {
                firstName: resultModel?.firstName ? resultModel?.firstName?.toString() : '',
                lastName: resultModel?.lastName ? resultModel?.lastName?.toString() : '',
                email: resultModel?.emailAddress ? resultModel?.emailAddress?.toString() : '',
                phone: resultModel?.telephoneNumber ? resultModel?.telephoneNumber?.toString() : '',
                organizationId,
                activeCampaignTagName
            },
            1,
            true
        );

        const result = await new HubspotIntegrationProducer().produceAsync(hubspotEvent);
        return result.status === ResponseStatus.success;
    }
}