import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react';
import _, {once} from 'lodash';
import {DashboardBuilderClient} from "./DashboardBuilderClient";
import {TreeItem} from "../SortableTree/types";
import {SpecialNode} from "./TreeClient";


interface IDashboardBuilderContext<T extends TreeItem> {
	dashboardBuilderClient: DashboardBuilderClient<T>
}

const createDashboardBuilderContext = once(<T extends TreeItem,>() => {
	const dashboardBuilderClient = new DashboardBuilderClient<T>({id: 'root', children: []} as unknown as T);
	return createContext<IDashboardBuilderContext<T>>({ dashboardBuilderClient })
});

export const useDashboardBuilderClient = <T extends TreeItem,>(): DashboardBuilderClient<T> => useContext(createDashboardBuilderContext<T>()).dashboardBuilderClient;


export interface DashboardBuilderProviderProps<T extends TreeItem> {
	client: DashboardBuilderClient<T>
	children: React.ReactNode
}

export const DashboardBuilderProvider = function <T extends TreeItem>(props: DashboardBuilderProviderProps<T>): JSX.Element {
	const DashboardBuilderContext = createDashboardBuilderContext<T>();
	const {
		client,
		children
	} = props;

	const dashboardBuilderClient = useRef<DashboardBuilderClient<T>>(client);

	return (
		<DashboardBuilderContext.Provider value={{dashboardBuilderClient: dashboardBuilderClient.current}}>
			{children}
		</DashboardBuilderContext.Provider>
	);
}


export const useTree = function <T extends TreeItem>(): [T | undefined, (args: T | undefined) => void] {

	const dashboardBuilderClient = useDashboardBuilderClient<T>();

	const [root, setRoot] = useState(dashboardBuilderClient.root);

	const onRootChanged = (newRoot) => {
		setRoot(newRoot)
	}

	useEffect(() => {
		dashboardBuilderClient.treeAttach(onRootChanged);

		return () => {
			dashboardBuilderClient.treeDetach(onRootChanged);
		}
	}, [dashboardBuilderClient]);

	const handleSetRoot = (newRoot) => {

		dashboardBuilderClient.root = _.cloneDeep(newRoot);
	}
	return [root, handleSetRoot];
}

interface IPropertySetter<T> {
	<K extends keyof T>(property: K, setter: (value: T[K]) => T[K]): void
}

type NodeHookReturnType<T> = [T | undefined, <K extends keyof T>(property: K, setter: (value: T[K]) => T[K]) => void, (child: T) => void]

export const useNode = function <T extends TreeItem>(nodeId: string | undefined): NodeHookReturnType<T> {

	const dashboardBuilderClient = useDashboardBuilderClient<T>();

	const initialNode = !nodeId ? undefined : dashboardBuilderClient.findNodeDeep(nodeId);

	const [node, setNode] = useState(initialNode as T | undefined);

	useEffect(() => {
		const newNode = !nodeId ? undefined : dashboardBuilderClient.findNodeDeep(nodeId);
		setNode(newNode);
	}, [nodeId])

	const onNodeChanged = useCallback((newNode) => {
		setNode(newNode)
	}, [nodeId]);

	useEffect(() => {
		if (!nodeId){
			return ;
		}
		dashboardBuilderClient.nodeAttach(nodeId, onNodeChanged);
		return () => {
			dashboardBuilderClient.nodeDetach(nodeId, onNodeChanged);
		}
	}, [nodeId, dashboardBuilderClient]);



	const updateNodeProperty = useCallback<IPropertySetter<T>>(
		( property, setter) => {
		if (!nodeId){
			return;
		}
		dashboardBuilderClient.setNodeProperty(nodeId, property, setter);

	}, [nodeId, dashboardBuilderClient] );

	const addChildToNode = useCallback<(child: T) => void>(
		( child) => {
			if (!nodeId){
				return;
			}
			dashboardBuilderClient.addChildToNode(nodeId, child);

		}, [nodeId, dashboardBuilderClient] );

	return [node, updateNodeProperty, addChildToNode];
}

export const useSpecialNode = function <T extends TreeItem>(special: SpecialNode):  NodeHookReturnType<T>  {
	const dashboardBuilderClient = useDashboardBuilderClient<T>();

	const [specialNodeId, setSpecialNodeId] = useState(dashboardBuilderClient.getSpecialNode(special));


	const onSelectedNodeChanged = (id: string | undefined): void => {
		setSpecialNodeId(id)
	}

	useEffect(() => {
		dashboardBuilderClient.specialNodeAttach(special, onSelectedNodeChanged);

		return () => {
			dashboardBuilderClient.specialNodeDetach(special, onSelectedNodeChanged);
		}
	})
	return useNode<T>(specialNodeId);
}

export const useSelectedNode = function <T extends TreeItem>(): NodeHookReturnType<T>  {

	return useSpecialNode<T>('selected')
}

export const useSettingsNode = function <T extends TreeItem> (): NodeHookReturnType<T>  {

	return useSpecialNode<T>('settings')
}
