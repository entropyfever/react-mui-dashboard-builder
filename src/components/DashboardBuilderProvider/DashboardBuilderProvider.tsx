import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react';
import { once } from 'lodash';
import {DashboardBuilderClient} from "./DashboardBuilderClient";
import {TreeItem} from "../SortableTree/types";


interface IDashboardBuilderContext<T extends TreeItem> {
	dashboardBuilderClient: DashboardBuilderClient<T>
}

const createDashboardBuilderContext = once(<T extends TreeItem,>() => {
	const dashboardBuilderClient = new DashboardBuilderClient<T>();
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
		dashboardBuilderClient.root = { ...newRoot};
	}
	return [root, handleSetRoot];
}

interface IPropertySetter<T> {
	<K extends keyof T>(property: K, setter: (value: T[K]) => T[K]): void
}

export const useNode = function <T extends TreeItem>(nodeId: string | undefined): [T | undefined, <K extends keyof T>(property: K, setter: (value: T[K]) => T[K]) => void] {

	const dashboardBuilderClient = useDashboardBuilderClient<T>();

	const initialNode = !nodeId ? undefined : dashboardBuilderClient.findNodeDeep(nodeId);

	const [node, setNode] = useState(initialNode as T | undefined);

	const onNodeChanged = (newNode) => {
		setNode(newNode)
	}

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

	return [node, updateNodeProperty];
}




