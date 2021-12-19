import {v4 as uuid} from 'uuid';
import {
	FlattenedItem,
	TreeItem,
} from "../SortableTree/types";
import {
	findItemDeep,
	flattenTree,
	getChildCount,
	removeItem,
	setProperty
} from "../SortableTree/utilities";
import {Subject} from "./Subject";


export class TreeClient<T extends TreeItem> {

	private readonly _clientId: string;
	private _root: T | undefined;

	private treeSubject: Subject<T | undefined>;
	private nodesSubject: Map<string, Subject<T | undefined>>;

	constructor() {

		this._clientId = uuid();
		this._root = undefined;
		this.treeSubject = new Subject();
		this.nodesSubject = new Map();

		const initialRootChildren: TreeItem[] = [
			{
				id: 'Home',
				children: [],
			},
			{
				id: 'Collections',
				children: [
					{ id: 'Spring', children: [] },
					{ id: 'Summer', children: [] },
					{ id: 'Fall', children: [] },
					{ id: 'Winter', children: [] },
				],
			},
			{
				id: 'About Us',
				children: [],
			},
			{
				id: 'My Account',
				children: [
					{ id: 'Addresses', children: [] },
					{ id: 'Order History', children: [] },
				],
			},
		];

		this.root = {
			id: 'root',
			children: initialRootChildren
		} as T

	}

	public treeAttach(o: (args: T | undefined) => void): void{
		this.treeSubject.attach(o);
	}

	public treeDetach(o: (args: T | undefined) => void): void{
		this.treeSubject.detach(o);
	}

	public treeNotify(): void{
		if (!this.root){
			this.treeSubject.notify(undefined);
			Array.from(this.nodesSubject.keys()).map((nodeId) => {
				this.nodeNotify(nodeId);
			})
			return;
		}
		this.treeSubject.notify( { ...this.root});
		this.flattenTree().forEach((node) => {
			this.nodeNotify(node.id);
		})
	}

	public nodeAttach(nodeId: string, o: (args: T | undefined) => void): void{
		if (!this.nodesSubject.has(nodeId)){
			this.nodesSubject.set(nodeId, new Subject());
		}
		const nodeSubject = this.nodesSubject.get(nodeId);
		if (!nodeSubject){
			throw new Error('I just set you');
		}
		nodeSubject.attach(o);
	}

	public nodeDetach(nodeId: string, o: (args: T | undefined) => void): void{
		const nodeSubject = this.nodesSubject.get(nodeId);
		if (!nodeSubject){
			throw new Error('Trying to detach from non existing subject');
		}
		nodeSubject.detach(o);
		if (nodeSubject.isEmpty()){
			this.nodesSubject.delete(nodeId);
		}
	}

	public nodeNotify(nodeId: string): void{
		const nodeSubject = this.nodesSubject.get(nodeId);
		if (!nodeSubject){
			return;
		}
		const newNode = this.findNodeDeep(nodeId);
		if (!newNode){
			nodeSubject.notify(undefined);
			return;
		}
		nodeSubject.notify( { ...newNode});
	}

	get clientId(): string {
		return this._clientId;
	}

	get root(): T | undefined {
		return this._root;
	}

	set root(value: T | undefined) {
		this._root = value;
		this.treeNotify();
	}

	public findNodeDeep(nodeId: string): T | undefined {
		if (!this.root){
			return undefined;
		}

		return findItemDeep([this.root], nodeId);
	}

	public removeNode(nodeId: string): void {
		if (!this.root){
			return undefined;
		}
		[this.root] = removeItem([this.root], nodeId);

		this.treeNotify();
	}

	public setNodeProperty<K extends keyof T>(nodeId: string, property: K, setter: (_value: T[K]) => T[K]): void{
		if (!this.root){
			return undefined;
		}
		[this.root] = setProperty([ this.root ], nodeId, property, setter);
	}

	public getChildCountOfNode(nodeId: string): number{
		if (!this.root){
			return 0;
		}
		return getChildCount([this.root], nodeId);
	}

	public flattenTree(): (T & FlattenedItem)[]{
		if (!this.root){
			return [];
		}
		return flattenTree([this.root]);
	}


}


