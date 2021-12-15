import React, {
  createContext,
  useContext,
  useRef,
} from 'react';
import {DashboardBuilderClient} from "./DashboardBuilderClient";

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

