import {v4 as uuid} from 'uuid';

export class DashboardBuilderClient {

	private readonly _clientId: string;

	constructor() {
		this._clientId = uuid();
	}


	get clientId(): string {
		return this._clientId;
	}
}
