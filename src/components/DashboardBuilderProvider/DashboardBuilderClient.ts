import {TreeClient} from "./TreeClient";
import {TreeItem} from "../SortableTree/types";
import React from "react";


export type ReactFCRegistered = {
	_id: string
	component: React.FunctionComponent
	displayName: string
}
export class DashboardBuilderClient<T extends TreeItem> extends TreeClient<T> {

	private readonly _registeredComponents: ReactFCRegistered[]
	private _defaultRegisteredComponent: ReactFCRegistered;

	constructor(root: T | undefined) {
		super(root);
		this._registeredComponents = [];
		this._defaultRegisteredComponent = {
			_id: 'default',
			component: () => null,
			displayName: 'Default'
		};
	}

	public registerComponent(c: ReactFCRegistered): DashboardBuilderClient<T> {
		this._registeredComponents.push(c);
		return this;
	}

	public setDefaultRegisteredComponent(id: string): DashboardBuilderClient<T> {
		const rrc = this.registeredComponents.find((r) => r._id === id);
		if (!rrc){
			throw new Error(`Unable to find registered component with id ${id}. Did you forget to register it ?`);
		}
		this._defaultRegisteredComponent = rrc;
		return this;
	}


	get defaultRegisteredComponent(): ReactFCRegistered {
		return this._defaultRegisteredComponent;
	}

	get registeredComponents(): ReactFCRegistered[] {
		return this._registeredComponents;
	}

}
