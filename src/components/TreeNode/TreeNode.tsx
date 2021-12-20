import React from 'react';
import './treeNode.scss';
import {
	ReactFCRegistered,
	useDashboardBuilderClient,
	useNode
} from "../DashboardBuilderProvider";
import {
	Grid,
	MenuItem,
	Paper,
	Select,
} from "@mui/material";
import {styled} from "@mui/system";
import {TreeItem} from "../SortableTree/types";
import {StylableTreeItem} from "../StyleEditor";


const Item = styled(Paper)(({theme, sx}) => {
	return {
		padding: theme.spacing(0),
		textAlign: 'center',
		width: '100%',
		minHeight: '100px',
		height: (sx && sx.height) ? sx.height : '100px',
	};
});


export interface ITreeNodeProps {
	nodeId: string
}

export type TreeItemWithComponent = TreeItem & StylableTreeItem & {
	registeredComponent?: ReactFCRegistered
}

export const TreeNode: React.FunctionComponent<ITreeNodeProps> = (props) => {

	const [treeNode,] = useNode<TreeItemWithComponent>(props.nodeId);

	const client = useDashboardBuilderClient();

	if (!treeNode) {
		return null;
	}

	if (treeNode.children.length === 0) {
		const {registeredComponent, styleProps} = treeNode;
		const {component: Component} = registeredComponent ? registeredComponent : {component: () => <p>a</p>};
		return <Grid item {...styleProps}>
			<Item>
				{Component && <Component/>}
			</Item>
		</Grid>;
	}

	return <Grid container item columnSpacing={1}>
		{
			treeNode.children.map(({id}) => {
				return <TreeNode key={id} nodeId={id}/>;
			})
		}
	</Grid>;

};
