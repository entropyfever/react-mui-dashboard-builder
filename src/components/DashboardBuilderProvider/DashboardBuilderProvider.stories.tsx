import React from 'react';
import { storiesOf } from '@storybook/react';

import {
	DashboardBuilderClient,
	DashboardBuilderProvider,
	useNode
} from "../DashboardBuilderProvider";
import {TreeItem} from "../SortableTree/types";
import {SortableTree} from "../SortableTree";

interface ExtendedTreeItem extends TreeItem{
	test: boolean
}

const TreeNode = (props: {nodeId: string}) => {

	const [node] = useNode<ExtendedTreeItem>(props.nodeId);

	return <p>{JSON.stringify(node)}</p>
}

storiesOf('DashboardBuilderProvider', module)
	.add('useNode', () => {
		const c = new DashboardBuilderClient<ExtendedTreeItem>();
		return <DashboardBuilderProvider client={c} >
			<TreeNode nodeId={'Collections'} />
			<SortableTree collapsible indicator removable />
		</DashboardBuilderProvider>
	})
