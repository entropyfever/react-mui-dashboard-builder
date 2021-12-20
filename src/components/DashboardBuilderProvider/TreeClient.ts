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
import _ from "lodash";

export type SpecialNode = 'selected' | 'settings';

export class TreeClient<T extends TreeItem> {


	private readonly _clientId: string;
	private _root: T | undefined;

	private treeSubject: Subject<T | undefined>;
	private nodesSubject: Map<string, Subject<T | undefined>>;

	private specialNodeMap: Map<SpecialNode, string | undefined>; // 'selected' => 'nodeId'
	private specialNodeSubject: Map<SpecialNode, Subject<string | undefined>>;

	constructor(root: T | undefined) {

		this._clientId = uuid();
		this._root = undefined;
		this.treeSubject = new Subject();
		this.nodesSubject = new Map();
		this.specialNodeMap = new Map();
		this.specialNodeSubject = new Map();
		this.root = root;
	}

	public addChildToNode(nodeId: string, child: T): void{
		this.setNodeProperty(nodeId, 'children', (prev) => {
			prev.push(child);
			return _.cloneDeep(prev);
		})
	}

	get selectedNodeId(): string | undefined {
		return this.getSpecialNode('selected')
	}

	public setSelectedNode(nodeId: string): void{
		this.setSpecialNode('selected', nodeId);
	}

	public clearSelectedNode(): void{
		this.clearSpecialNode('selected');
	}

	public toggleSelectedNode(nodeId: string): void {
		if (this.getSpecialNode('selected') === nodeId){
			return this.clearSelectedNode();
		}
		return this.setSelectedNode(nodeId);
	}

	public setSpecialNode(special: SpecialNode, nodeId: string): void {
		this.specialNodeMap.set(special, nodeId);
		this.treeNotify();
	}

	public clearSpecialNode(special: SpecialNode): void {
		// TODO: fix this beacause the I cannot notify the emptiness
		// this.specialNodeMap.delete(special);
		this.specialNodeMap.set(special, undefined);
		this.treeNotify();
	}

	public getSpecialNode(special: SpecialNode): string | undefined {
		return this.specialNodeMap.get(special);
	}

	get settingsNodeId(): string | undefined {
		return this.getSpecialNode('settings');
	}

	public setSettingsNode(nodeId: string): void{
		this.setSpecialNode('settings', nodeId);
	}

	public specialNodeAttach(special: SpecialNode, o: (args: string | undefined) => void): void{
		if (!this.specialNodeSubject.has(special)){
			this.specialNodeSubject.set(special, new Subject());
		}
		const specialNodeSubject = this.specialNodeSubject.get(special);
		if (!specialNodeSubject){
			throw new Error('I just set you');
		}
		specialNodeSubject.attach(o);
	}

	public specialNodeDetach(special: SpecialNode, o: (args: string | undefined) => void): void{
		const specialNodeSubject = this.specialNodeSubject.get(special);
		if (!specialNodeSubject){
			throw new Error('Trying to detach from non existing subject');
		}
		specialNodeSubject.detach(o);

		// TODO: fix this beacause the I cannot notify the emptiness
		/*
		if (specialNodeSubject.isEmpty()){
			this.nodesSubject.delete(special);
		}
		 */
	}

	public treeAttach(o: (args: T | undefined) => void): void{
		this.treeSubject.attach(o);
	}

	public treeDetach(o: (args: T | undefined) => void): void{
		this.treeSubject.detach(o);
	}


	public specialNodeNotify(special: SpecialNode): void{
		const specialNodeSubject = this.specialNodeSubject.get(special);
		if (!specialNodeSubject){
			return;
		}

		const nodeId = this.specialNodeMap.get(special);
		specialNodeSubject.notify(nodeId);
	}

	public treeNotify(): void{
		Array.from(this.specialNodeMap.keys()).map((special) => {
			this.specialNodeNotify(special)
		})
		if (!this.root){
			this.treeSubject.notify(undefined);
			Array.from(this.nodesSubject.keys()).map((nodeId) => {
				this.nodeNotify(nodeId);
			})
			return;

		}
		this.treeSubject.notify( _.cloneDeep(this.root));

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
		// TODO: fix this beacause the I cannot notify the emptiness
		/*
		if (nodeSubject.isEmpty()){
			this.nodesSubject.delete(nodeId);
		}

		 */
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
		nodeSubject.notify( _.cloneDeep(newNode));
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

		if (this.selectedNodeId === nodeId){
			this.clearSelectedNode();
		}

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


