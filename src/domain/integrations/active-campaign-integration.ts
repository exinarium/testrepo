import { ObjectID } from "mongodb";
import { ActiveCampaignIntegrationEvent, ResponseStatus } from 'covidscreener-activecampaignintegration/dist/activecampaignintegration.dto/src';
import { ActiveCampaignIntegrationProducer } from 'covidscreener-activecampaignintegration/dist/activecampaignintegration.producer/src';

export class ActiveCampaignIntegration {

    static async sendToActiveCampaign(resultModel: any, organizationId: string, activeCampaignTagName: string): Promise<boolean> {

        const activeCampaignEvent = new ActiveCampaignIntegrationEvent<any>(
            new ObjectID(),
            new Date(),
            'ActiveCampaignIntegrationEvent',
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

        const result = await new ActiveCampaignIntegrationProducer().produceAsync(activeCampaignEvent);
        return result.status === ResponseStatus.success;
    }
}