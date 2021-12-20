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
		height: '100%',
	};
});


export interface ITreeNodeProps {
	nodeId: string
}

export type DashboardItem = TreeItem & StylableTreeItem & {
	registeredComponent?: ReactFCRegistered
}


const WidgetSelector = (
	props: { nodeId: string}
) => {
	const client = useDashboardBuilderClient();

	const [node, updateNodeProperty] = useNode<DashboardItem>(props.nodeId);

	if (!node) {
		return null;
	}

	const {registeredComponent} = node;

	if (registeredComponent){
		throw new Error('You may assign a widget once. Don\'t use WidgetSelector when node has a registeredComponent')
	}

	return <Select
			value={ registeredComponent ? registeredComponent : client.defaultRegisteredComponent }
			label='Select widget'
			onChange={ (e) => { return updateNodeProperty('registeredComponent', () => {
				return client.registeredComponents.find((r) => r._id === e.target.value);
			}); } }
		>
			{
				client.registeredComponents.map((o) => {
					return <MenuItem key={ o._id } value={ o._id }>
						{o.displayName}
					</MenuItem>;
				})
			}
		</Select>
}

export const TreeNode: React.FunctionComponent<ITreeNodeProps> = (props) => {

	const [node,] = useNode<DashboardItem>(props.nodeId);

	const client = useDashboardBuilderClient();

	if (!node) {
		return null;
	}

	const {styleProps} = node;

	if (node.isLeaf) {
		const {registeredComponent} = node;

		if (!registeredComponent){
			return <Grid container item {...styleProps} xs={12}>
					<Item>
						<WidgetSelector nodeId={props.nodeId} />
					</Item>
			</Grid>;
		}

		/**
		 * TODO: find a way to retrieve a component, not from the node, but from the client's registeredComponents
		 * do not use the state of the node to retrieve the component
		 * rather retrieve it from the runtime;
		 * also keep in mind that a user might want to use different components when on edit mode and when on actual mode
		 * so use _id to find the wanted component at client's runtime
		 *
		 */

		const foundComponent = client.registeredComponents.find((rc) => rc._id === registeredComponent._id);

		if (!foundComponent){
			throw new Error('Invalid state');
		}
		const {component: Component} = foundComponent;

		const ForceRerenderComponent = () => <Component />;

		// TODO: add style property to styleProps (and replace hardcoded height with something more sophisticated)
		return <Grid container item {...styleProps} xs={12} style={{height: '100%'}}>
				<Item>
					<ForceRerenderComponent/>
				</Item>
		</Grid>;
	}


	if (node.children.length === 0){
		if (node.id === 'root'){
			return null // TODO: Add a nice component here
		}
		return <Grid container item {...styleProps}>
			<Item />
		</Grid>
	}

	return <Grid id={node.id} container item {...styleProps}>
		{
			node.children.map(({id}) => {
				return <TreeNode key={id} nodeId={id}/>;
			})
		}
	</Grid>;

};
