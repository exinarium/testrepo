import mongodb, { ObjectID, FilterQuery, ObjectId } from 'mongodb';
import { CandidateProfileDataModel } from '../models/candidateprofile-datamodel';
import { Config } from '../config/config';
import { LoggingProducer, LogPriority } from 'covidscreener-logging/dist/logging.producer/src/';
import { AuditLogProducer } from 'covidscreener-auditlog/dist';
import { AuditLogEvent } from 'covidscreener-auditlog/dist/auditlog.dto/src';

export class CandidateProfileRepository {
    constructor(private config: Config) { }

    async createAsync(model: CandidateProfileDataModel, user: any): Promise<CandidateProfileDataModel> {
        let dataContext: mongodb.MongoClient;

        try {
            const connectionString = this.config.databaseConfig.connectionString;

            if (connectionString === undefined || connectionString === '') {
                throw new Error('Connection string cannot be null or empty');
            }

            dataContext = await new mongodb.MongoClient(connectionString, { useUnifiedTopology: true }).connect();

            const collection = dataContext
                .db(this.config.databaseConfig.databaseName)
                .collection(this.config.databaseConfig.collectionName);

            model._id = undefined;
            model.version = 1;
            model.isDeleted = false;
            model.username = user.name;
            model.modifiedDate = new Date();

            const organizationCollection = dataContext.db('Users').collection('Organization');

            const paymentPlanCollection = dataContext.db('Users').collection('PaymentPlans');

            const profileCount = await collection.count({
                organizationId: new ObjectID(user.organizationId),
                isDeleted: false,
            });

            const organization = await organizationCollection.findOne({ _id: new ObjectID(user.organizationId) });
            const paymentPlan = await paymentPlanCollection.findOne({ planNumber: organization.paymentPlan });

            if (profileCount >= paymentPlan.maxProfiles) {
                throw new Error(
                    'You have already created the maximum amount of profiles. Please upgrade your plan to continue or delete unused profiles'
                );
            }

            const existingRecord = await collection
                .findOne({
                    idNumber: model.idNumber,
                    organizationId: new ObjectId(user.organization._id),
                });

            if (existingRecord) {
                throw new Error(
                    'The profile for this ID Number already exists. Please use the existing profile instead'
                );
            }

            const result = await collection.insertOne(model);

            model._id = result.insertedId;

            const event: AuditLogEvent<CandidateProfileDataModel> = {
                objectId: new ObjectID(),
                eventName: 'CandidateProfileCreatedEvent',
                version: model.version,
                data: model,
                producedAt: new Date(),
                module: 2,
            };

            await new AuditLogProducer().produceAsync(event);

        } catch (ex) {
            const ERROR_MESSAGE = 'Error in CandidateProfile while doing a database operation';
            LoggingProducer.logAsync(ERROR_MESSAGE, ex, LogPriority.high);

            throw ex;
        } finally {
            await dataContext?.close();
        }

        return model;
    }

    async updateAsync(model: CandidateProfileDataModel, user: any): Promise<CandidateProfileDataModel> {
        let dataContext: mongodb.MongoClient;

        try {
            const connectionString = this.config.databaseConfig.connectionString;

            if (connectionString === undefined || connectionString === '') {
                throw new Error('Connection string cannot be null or empty');
            }

            dataContext = await new mongodb.MongoClient(connectionString, { useUnifiedTopology: true }).connect();

            const collection = dataContext
                .db(this.config.databaseConfig.databaseName)
                .collection(this.config.databaseConfig.collectionName);

            if (!model._id) {
                throw new Error('Model ID cannot be null when it is an update request');
            }

            const existingRecord = await collection
                .find({
                    _id: new ObjectId(model._id),
                    organizationId: new ObjectId(user.organization._id),
                    isDeleted: false
                })
                .toArray();

            if (!existingRecord || !existingRecord[0]?.version) {
                throw new Error('Record does not exist in database or the record has been deleted');
            }

            if (existingRecord[0]?.version > model.version) {
                throw new Error('Conflict detected, version out of date');
            }

            model.version++;
            model.username = user.name;
            model.modifiedDate = new Date();

            await collection.updateOne(
                { _id: new ObjectId(model._id) },
                {
                    $set: {
                        firstName: model.firstName,
                        lastName: model.lastName,
                        emailAddress: model.emailAddress,
                        physicalAddress: model.physicalAddress,
                        telephoneNumber: model.telephoneNumber,
                        covid19Consent: model.covid19Consent,
                        marketingConsent: model.marketingConsent,
                        version: model.version,
                        username: model.username,
                        modifiedDate: model.modifiedDate
                    },
                }
            );

            const event: AuditLogEvent<CandidateProfileDataModel> = {
                objectId: new ObjectID(),
                eventName: 'CandidateProfileUpdatedEvent',
                version: model.version,
                data: model,
                producedAt: new Date(),
                module: 2,
            };

            await new AuditLogProducer().produceAsync(event);

        } catch (ex) {
            const ERROR_MESSAGE = 'Error in CandidateProfile while doing a database operation';
            LoggingProducer.logAsync(ERROR_MESSAGE, ex, LogPriority.high);

            throw ex;
        } finally {
            await dataContext?.close();
        }

        return model;
    }

    async deleteAsync(id: ObjectID, user: any): Promise<boolean> {
        let dataContext: mongodb.MongoClient;
        let result: any;

        try {
            const connectionString = this.config.databaseConfig.connectionString;

            if (connectionString === undefined || connectionString === '') {
                throw new Error('Connection string cannot be null or empty');
            }

            dataContext = await new mongodb.MongoClient(connectionString, { useUnifiedTopology: true }).connect();

            const collection = dataContext
                .db(this.config.databaseConfig.databaseName)
                .collection(this.config.databaseConfig.collectionName);

            if (!id) {
                throw new Error('Model ID cannot be null when it is an delete request');
            }

            const existingRecord = await collection
                .find({
                    _id: new ObjectId(id),
                    organizationId: new ObjectId(user.organization._id),
                })
                .toArray();

            if (!existingRecord || !existingRecord[0]) {
                throw new Error('Record does not exist in database');
            }

            existingRecord[0].isDeleted = true;
            existingRecord[0].version++;

            result = await collection.updateOne(
                { _id: new ObjectId(id) },
                {
                    $set: {
                        isDeleted: true,
                        version: existingRecord[0].version,
                        modifiedDate: new Date(),
                        username: user.name
                    }
                }
            );

            const event: AuditLogEvent<CandidateProfileDataModel> = {
                objectId: new ObjectID(),
                eventName: 'CandidateProfileDeletedEvent',
                version: existingRecord[0].version,
                data: existingRecord[0],
                producedAt: new Date(),
                module: 2,
            };

            await new AuditLogProducer().produceAsync(event);

        } catch (ex) {
            const ERROR_MESSAGE = 'Error in CandidateProfile while doing a database operation';
            LoggingProducer.logAsync(ERROR_MESSAGE, ex, LogPriority.high);

            throw ex;
        } finally {
            await dataContext?.close();
        }

        return result?.modifiedCount > 0;
    }

    async undeleteAsync(id: ObjectID, user: any): Promise<boolean> {
        let dataContext: mongodb.MongoClient;
        let result: any;

        try {
            const connectionString = this.config.databaseConfig.connectionString;

            if (connectionString === undefined || connectionString === '') {
                throw new Error('Connection string cannot be null or empty');
            }

            dataContext = await new mongodb.MongoClient(connectionString, { useUnifiedTopology: true }).connect();

            const collection = dataContext
                .db(this.config.databaseConfig.databaseName)
                .collection(this.config.databaseConfig.collectionName);

            if (!id) {
                throw new Error('Model ID cannot be null when it is an delete request');
            }

            const organizationCollection = dataContext.db('Users').collection('Organization');

            const paymentPlanCollection = dataContext.db('Users').collection('PaymentPlans');

            const profileCount = await collection.count({
                organizationId: new ObjectID(user.organizationId),
                isDeleted: false,
            });

            const organization = await organizationCollection.findOne({ _id: new ObjectID(user.organizationId) });
            const paymentPlan = await paymentPlanCollection.findOne({ planNumber: organization.paymentPlan });

            if (profileCount >= paymentPlan.maxProfiles) {
                throw new Error(
                    'You have already created the maximum amount of profiles. Please upgrade your plan to continue or delete unused profiles'
                );
            }

            const existingRecord = await collection
                .find({
                    _id: new ObjectId(id),
                    organizationId: new ObjectId(user.organization._id),
                })
                .toArray();

            if (!existingRecord || !existingRecord[0]) {
                throw new Error('Record does not exist in database');
            }

            existingRecord[0].isDeleted = false;
            existingRecord[0].version++;

            result = await collection.updateOne(
                { _id: new ObjectId(id) },
                {
                    $set: {
                        isDeleted: false,
                        version: existingRecord[0].version,
                        modifiedDate: new Date(),
                        username: user.name
                    }
                }
            );

            const event: AuditLogEvent<CandidateProfileDataModel> = {
                objectId: new ObjectID(),
                eventName: 'CandidateProfileUndeletedEvent',
                version: existingRecord[0].version,
                data: existingRecord[0],
                producedAt: new Date(),
                module: 2,
            };

            await new AuditLogProducer().produceAsync(event);

        } catch (ex) {
            const ERROR_MESSAGE = 'Error in CandidateProfile while doing a database operation';
            LoggingProducer.logAsync(ERROR_MESSAGE, ex, LogPriority.high);

            throw ex;
        } finally {
            await dataContext?.close();
        }

        return result?.modifiedCount > 0;
    }

    async lookupAsync(
        id: ObjectID,
        searchString: string,
        start: number,
        limit: number,
        user: any,
        isAdmin: boolean
    ): Promise<CandidateProfileDataModel[]> {
        let dataContext: mongodb.MongoClient;
        let existingRecords: any;

        try {
            const connectionString = this.config.databaseConfig.connectionString;

            if (connectionString === undefined || connectionString === '') {
                throw new Error('Connection string cannot be null or empty');
            }

            dataContext = await new mongodb.MongoClient(connectionString, { useUnifiedTopology: true }).connect();

            const collection = dataContext
                .db(this.config.databaseConfig.databaseName)
                .collection(this.config.databaseConfig.collectionName);

            existingRecords = [];

            if (id) {
                existingRecords = await collection
                    .find({
                        _id: new ObjectId(id),
                        organizationId: new ObjectId(user.organization._id),
                        isDeleted: false,
                    })
                    .project({})
                    .sort({ lastName: 1, firstName: 1 })
                    .skip(start)
                    .limit(limit)
                    .toArray();
            } else {
                if (user.isAdminUser && isAdmin && (searchString === '' || searchString === undefined)) {
                    existingRecords = await collection
                        .find({})
                        .filter({
                            $and: [
                                {
                                    organizationId: new ObjectId(user.organization._id)
                                },
                                {
                                    isDeleted: false
                                }
                            ],
                        })
                        .project({})
                        .sort({ lastName: 1, firstName: 1 })
                        .skip(start)
                        .limit(limit)
                        .toArray();
                } else if (user.isAdminUser && !isAdmin && (searchString === '' || searchString === undefined)) {
                    existingRecords = await collection
                        .find({})
                        .filter({
                            $and: [
                                {
                                    userId: new ObjectId(user._id)
                                },
                                {
                                    isDeleted: false
                                }
                            ],
                        })
                        .project({})
                        .sort({ lastName: 1, firstName: 1 })
                        .skip(start)
                        .limit(limit)
                        .toArray();
                } else {
                    existingRecords = await collection
                        .find({})
                        .filter({
                            $and: [
                                {
                                    organizationId: new ObjectId(user.organization._id)
                                },
                                {
                                    idNumber: searchString
                                },
                            ],
                        })
                        .project({})
                        .sort({ lastName: 1, firstName: 1 })
                        .skip(start)
                        .limit(limit)
                        .toArray();
                }
            }
        } catch (ex) {
            const ERROR_MESSAGE = 'Error in CandidateProfile while doing a database operation';
            LoggingProducer.logAsync(ERROR_MESSAGE, ex, LogPriority.high);

            throw ex;
        } finally {
            await dataContext?.close();
        }

        return existingRecords;
    }
}
