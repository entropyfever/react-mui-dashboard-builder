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


export class TreeClient<T extends TreeItem = TreeItem> {

	private readonly _clientId: string;
	private _root: T | undefined;

	private itemsSubject: Subject<T | undefined>;

	constructor() {
		this._clientId = uuid();
		this._root = undefined;
		this.itemsSubject = new Subject();

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

	public treeAttach(o: (args: T) => void): void{
		this.itemsSubject.attach(o);
	}

	public treeDetach(o: (args: T) => void): void{
		this.itemsSubject.detach(o);
	}

	public treeNotify(): void{
		if (!this.root){
			this.itemsSubject.notify(undefined);
			return;
		}
		this.itemsSubject.notify( { ...this.root});
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

	public findItemDeep(itemId: string): T | undefined {
		if (!this.root){
			return undefined;
		}

		return findItemDeep<T>([this.root], itemId);
	}

	public removeItem(itemId: string): void {
		if (!this.root){
			return undefined;
		}
		[this.root] = removeItem<T>([this.root], itemId);

		this.treeNotify();
	}

	public setItemProperty<K extends keyof T>(itemId: string, property: K, setter: (_value: T[K]) => T[K]): void{
		if (!this.root){
			return undefined;
		}
		[this.root] = setProperty<T, K>([this.root], itemId, property, setter);

		console.log(this.root);
		this.treeNotify();
	}

	public getChildCountOfItem(itemId: string): number{
		if (!this.root){
			return 0;
		}
		return getChildCount<T>([this.root], itemId);
	}

	public flattenTree(): (T & FlattenedItem)[]{
		if (!this.root){
			return [];
		}
		return flattenTree<T>([this.root]);
	}


}


