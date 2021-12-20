import React from 'react';
import { storiesOf } from '@storybook/react';

import {
	DashboardBuilderClient,
	DashboardBuilderProvider,
	useDashboardBuilderClient,
	useNode,
	useSelectedNode,
} from "../DashboardBuilderProvider";
import {SortableTree} from "../SortableTree";
import {DashboardPreview} from "../DashboardPreview";
import {v4 as uuid} from 'uuid';
import {
	StylableTreeItem,
	StyleEditor
} from "../StyleEditor";

const TreeNode = (props: {nodeId: string}) => {

	const [node] = useNode(props.nodeId);

	return <p>{JSON.stringify(node)}</p>
}

const SelectedNode = () => {

	const [node] = useSelectedNode();

	return <p>{JSON.stringify(node)}</p>
}

const AddNodeToRoot = () => {

	const [, , addChild] = useNode<StylableTreeItem>('root');

	return <button type={'submit'} onClick={() => {
		return addChild({
			id: uuid(),
			children: [],
			isLeaf: false,
			styleProps: {
				xs: 12,
				md: 12,
				rowSpacing: 0,
				columnSpacing: 0,
				direction: 'row',
				alignItems: 'flex-start',
				justifyContent: 'flex-start',
			}
		})
	}}>
		Add Layout
	</button>
}

const AddLeafToRoot = () => {

	const [, , addChild] = useNode('root');

	return <button type={'submit'} onClick={() => {
		return addChild({
			                id: uuid(),
			                children: [],
			                isLeaf: true
		                })
	}}>
		Add widget
	</button>
}

const Map = () => {
	return <div style={{height: '100%', width: '100%', backgroundColor: 'red'}}>Map</div>
}

const Chart = () => {
	return <p>Chart</p>
}

const CopyPaste = () => {

	const client = useDashboardBuilderClient();

	const clipboardDashboard = async () => {
		const str = client.exportDashboardToJSONFormat();
		await navigator.clipboard.writeText(str);
	};

	const pasteDashboard = async () => {
		navigator.clipboard.readText().then((data) => {
			client.importDashboardFromJSONFormat(JSON.parse(data));
		});
	};

	return <div>
		<button type={'submit'} onClick={() => clipboardDashboard()}>
			Copy
		</button>
		<button type={'submit'} onClick={() => pasteDashboard()}>
			Paste
		</button>
	</div>
}

storiesOf('DashboardBuilderProvider', module)
	.add('useNode', () => {
		const c = new DashboardBuilderClient({id: 'root', children: [], isLeaf: false});

		return <DashboardBuilderProvider client={c} >
			<TreeNode nodeId={'Collections'} />
			<SortableTree collapsible indicator removable />
		</DashboardBuilderProvider>
	})
	.add('Dashboard Preview', () => {
		const c = new DashboardBuilderClient({id: 'root', children: [], isLeaf: false});

		c
			.registerComponent({_id: 'map', displayName: 'Map', component: Map })
			.registerComponent({_id: 'chart', displayName: 'Chart', component: Chart })
			.setDefaultRegisteredComponent('chart')

		return <DashboardBuilderProvider client={c} >
			<DashboardPreview />
			<CopyPaste />
			<AddNodeToRoot />
			<AddLeafToRoot />
			<SelectedNode />
			<SortableTree collapsible indicator removable />
			<StyleEditor />
		</DashboardBuilderProvider>
	})
