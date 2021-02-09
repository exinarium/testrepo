import { GoogleSheetIntegrationEvent, ResponseStatus } from "covidscreener-googlesheetintegration/dist/googlesheetintegration.dto/src";
import { ObjectID } from "mongodb";
import { GoogleSheetIntegrationProducer } from "covidscreener-googlesheetintegration/dist/googlesheetintegration.producer/src";
import { DateTimeFormatter } from "../utilities/date-time-formatter";

export class GoogleIntegration {

    static async sendToGoogle(resultModel: any, organizationId: string): Promise<boolean> {

        const googlesheetEvent = new GoogleSheetIntegrationEvent<any>(
            new ObjectID(),
            new Date(),
            'GoogleSheetIntegrationEvent',
            {
                sheetName: 'Contacts',
                values: [
                    resultModel?._id ? resultModel?._id : '',
                    resultModel?.firstName ? resultModel?.firstName?.toString() : '',
                    resultModel?.lastName ? resultModel?.lastName?.toString() : '',
                    resultModel?.idNumber ? resultModel?.idNumber?.toString() : '',
                    resultModel?.telephoneNumber ? resultModel?.telephoneNumber?.toString() : '',
                    resultModel?.emailAddress ? resultModel?.emailAddress?.toString() : '',
                    resultModel?.physicalAddress ? resultModel?.physicalAddress?.toString() : '',
                    resultModel?.marketingConsent ? 'Yes' : 'No',
                    resultModel?.covid19Consent ? 'Yes' : 'No',
                    resultModel?.username ? resultModel?.username?.toString() : '',
                    resultModel?.modifiedDate ? DateTimeFormatter.formatDateTime(new Date(resultModel.modifiedDate)) : '',
                ],
                organizationId
            },
            1,
            true
        );

        const result = await new GoogleSheetIntegrationProducer().produceAsync(googlesheetEvent);
        return result.status === ResponseStatus.success;
    }
}