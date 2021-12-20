import React from 'react';
import { storiesOf } from '@storybook/react';

import {
	DashboardBuilderClient,
	DashboardBuilderProvider,
	useNode,
} from "../DashboardBuilderProvider";
import {SortableTree} from "../SortableTree";
import {DashboardPreview} from "../DashboardPreview";
import {v4 as uuid} from 'uuid';
import {StyleEditor} from "../StyleEditor";

const TreeNode = (props: {nodeId: string}) => {

	const [node] = useNode(props.nodeId);

	return <p>{JSON.stringify(node)}</p>
}

const AddNodeToRoot = () => {

	const [, , addChild] = useNode('root');

	return <button type={'submit'} onClick={() => {
		return addChild({
			id: uuid(),
			children: [],
			isLeaf: false
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
	return <p>Map</p>
}

const Chart = () => {
	return <p>Chart</p>
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
			<StyleEditor />
			<DashboardPreview />
			<AddNodeToRoot />
			<AddLeafToRoot />
			<SortableTree collapsible indicator removable />
		</DashboardBuilderProvider>
	})
