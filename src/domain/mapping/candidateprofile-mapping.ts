import { CandidateProfileDataModel } from '../models/candidateprofile-datamodel';

export class CandidateProfileMapping {
    mapToModel(request: any): Promise<CandidateProfileDataModel> {
        return request;
    }
}
