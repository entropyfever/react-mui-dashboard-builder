import React, {
	createContext,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react';
import {DashboardBuilderClient} from "./DashboardBuilderClient";
import {TreeItem} from "../SortableTree/types";

interface IDashboardBuilderContext {
	dashboardBuilderClient: DashboardBuilderClient
}

const initialDashboardBuilderClient = new DashboardBuilderClient();


const DashboardBuilderContext = createContext<IDashboardBuilderContext>(
	{
		dashboardBuilderClient: initialDashboardBuilderClient
	}
);


export interface DashboardBuilderProviderProps {
	client: DashboardBuilderClient
	children: React.ReactNode
}

export const DashboardBuilderProvider: React.FunctionComponent<DashboardBuilderProviderProps> = function (
	{
		client,
		children,
	}) {

	const dashboardBuilderClient = useRef<DashboardBuilderClient>(client);

	return (
		<DashboardBuilderContext.Provider value={{dashboardBuilderClient: dashboardBuilderClient.current}}>
			{children}
		</DashboardBuilderContext.Provider>
	);
};

export const useDashboardBuilderClient = (): DashboardBuilderClient => {
  const {
    dashboardBuilderClient
  } = useContext(DashboardBuilderContext);

  return dashboardBuilderClient;
}

export const useTree = (): [TreeItem | undefined, (args: TreeItem | undefined) => void] => {
	const {
		dashboardBuilderClient
	} = useContext(DashboardBuilderContext);

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

