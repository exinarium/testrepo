import { ObjectID } from 'mongodb';

export class CandidateProfileDataModel {
    constructor(
        public _id: ObjectID,
        public userId: ObjectID,
        public organizationId: ObjectID,
        public firstName: string,
        public lastName: string,
        public idNumber: string,
        public emailAddress: string,
        public physicalAddress: string,
        public telephoneNumber: string,
        public covid19Consent: boolean,
        public marketingConsent: boolean,
        public username: string,
        public modifiedDate: Date,
        public version: number = 1,
        public isDeleted: boolean = false
    ) {}
}
