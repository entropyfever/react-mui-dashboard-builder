import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {createPortal} from 'react-dom';

import {
	Announcements,
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	DragStartEvent,
	DragOverlay,
	DragMoveEvent,
	DragEndEvent,
	DragOverEvent,
	MeasuringStrategy,
	DropAnimation,
	defaultDropAnimation,
	Modifier,
} from '@dnd-kit/core';
import {
	SortableContext,
	arrayMove,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import {
	buildTree,
	getProjection,
	removeChildrenOf,
} from './utilities';
import type {
	FlattenedItem,
	SensorContext,
	TreeItems
} from './types';
import {sortableTreeKeyboardCoordinates} from './keyboardCoordinates';
import {
	TreeItem,
	SortableTreeItem
} from './components';
import {
	useDashboardBuilderClient,
	useTree
} from "../DashboardBuilderProvider";

const adjustTranslate: Modifier = ({transform}) => {
	return {
		...transform,
		y: transform.y - 25,
	};
};


const measuring = {
	droppable: {
		strategy: MeasuringStrategy.Always,
	},
};

const dropAnimation: DropAnimation = {
	...defaultDropAnimation,
	dragSourceOpacity: 0.5,
};

interface Props {
	collapsible?: boolean;
	defaultItems?: TreeItems;
	indentationWidth?: number;
	indicator?: boolean;
	removable?: boolean;
}

interface DefaultProps {
	collapsible: boolean;
	defaultItems: TreeItems;
	indentationWidth: number;
	indicator: boolean;
	removable: boolean;
}

type PropsWithDefaults = Props & DefaultProps;

export const SortableTree: React.FunctionComponent<Props> = function (props) {
	const {
		      collapsible,
		      indicator,
		      indentationWidth,
		      removable,
	      } = props as PropsWithDefaults;

	const client = useDashboardBuilderClient();

	const [root, setRoot] = useTree();

	const [activeId, setActiveId] = useState<string | null>(null);
	const [overId, setOverId] = useState<string | null>(null);
	const [offsetLeft, setOffsetLeft] = useState(0);
	const [currentPosition, setCurrentPosition] = useState<{
		parentId: string | null;
		overId: string;
	} | null>(null);

	const flattenedItems = useMemo(() => {
		const flattenedTree = client.flattenTree();
		const collapsedItems = flattenedTree.reduce<string[]>(
			(acc, {children, collapsed, id}) => {
				return (collapsed && children.length ? [...acc,
				                                        id] : acc);
			},
			[],
		);

		return removeChildrenOf(
			flattenedTree,
			activeId ? [activeId,
			            ...collapsedItems] : collapsedItems,
		);
	}, [activeId, root]);

	const projected = activeId && overId
		? getProjection(
			flattenedItems,
			activeId,
			overId,
			offsetLeft,
			indentationWidth,
		)
		: null;
	const sensorContext: SensorContext = useRef({
		                                            items: flattenedItems,
		                                            offset: offsetLeft,
	                                            });
	const [coordinateGetter] = useState(() => {
		return sortableTreeKeyboardCoordinates(sensorContext, indentationWidth);
	});
	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter,
		}),
	);

	const sortedIds = useMemo(() => {
		return flattenedItems.map(({id}) => {
			return id;
		});
	}, [
		                          flattenedItems,
	                          ]);
	const activeItem = activeId
		? flattenedItems.find(({id}) => {
			return id === activeId;
		})
		: null;

	useEffect(() => {
		sensorContext.current = {
			items: flattenedItems,
			offset: offsetLeft,
		};
	}, [flattenedItems,
	    offsetLeft]);

	const handleDragStart = useCallback(({active: {id: activeDragId}}: DragStartEvent) => {
		setActiveId(activeDragId);
		setOverId(activeDragId);

		const activeDragItem = flattenedItems.find(({id}) => {
			return id === activeDragId;
		});

		if (activeDragItem) {
			setCurrentPosition({
				                   parentId: activeDragItem.parentId,
				                   overId: activeDragId,
			                   });
		}

		document.body.style.setProperty('cursor', 'grabbing');
	}, [setActiveId,
	    setOverId,
	    setCurrentPosition,
	    flattenedItems]);

	const handleDragMove = useCallback(({delta}: DragMoveEvent) => {
		setOffsetLeft(delta.x);
	}, [setOffsetLeft]);

	const handleDragOver = useCallback(({over}: DragOverEvent) => {
		setOverId(over?.id ?? null);
	}, [setOverId]);

	const resetState = useCallback(() => {
		setOverId(null);
		setActiveId(null);
		setOffsetLeft(0);
		setCurrentPosition(null);

		document.body.style.setProperty('cursor', '');
	}, [setOverId,
	    setActiveId,
	    setOffsetLeft,
	    setCurrentPosition,
      root
	]);

	const handleDragEnd = useCallback(({active, over}: DragEndEvent) => {
		resetState();

		if (projected && over) {
			const {depth, parentId} = projected;
			const clonedItems: FlattenedItem[] = JSON.parse(
				JSON.stringify(client.flattenTree()),
			);
			const overIndex = clonedItems.findIndex(({id}) => {
				return id === over.id;
			});
			const activeIndex = clonedItems.findIndex(({id}) => {
				return id === active.id;
			});

			const activeTreeItem = clonedItems[activeIndex];

			clonedItems[activeIndex] = {...activeTreeItem, depth, parentId};

			const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);

			const newRoot = buildTree(sortedItems);

			setRoot(newRoot);
		}
	}, [resetState,
	    projected,
	    root,
	    setRoot]);

	const handleDragCancel = useCallback(() => {
		resetState();
	}, [resetState]);

	function handleRemove(id: string): void {
		client.removeNode(id);
	}

	function handleCollapse(id: string): void {
		client.setNodeProperty(id, "collapsed", (value) => {
			return !value;
		});
	}

	function getMovementAnnouncement(
		eventName: string,
		activeMovementId: string,
		overMovementId?: string,
	): (string | undefined) {
		if (!overMovementId || !projected) {
			return undefined;
		}

		if ('onDragEnd' !== eventName) {
			if (
				currentPosition
				&& projected.parentId === currentPosition.parentId
				&& overMovementId === currentPosition.overId
			) {
				return undefined;
			}
			setCurrentPosition({
				                   parentId: projected.parentId,
				                   overId: overMovementId,
			                   });
		}

		const clonedItems: FlattenedItem[] = JSON.parse(
			JSON.stringify(client.flattenTree()),
		);
		const overIndex = clonedItems.findIndex(({id}) => {
			return id === overId;
		});
		const activeIndex = clonedItems.findIndex(({id}) => {
			return id === activeMovementId;
		});
		const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);

		const previousItem = sortedItems[overIndex - 1];

		let announcement;
		const movedVerb = 'onDragEnd' === eventName ? 'dropped' : 'moved';
		const nestedVerb = 'onDragEnd' === eventName ? 'dropped' : 'nested';

		if (!previousItem) {
			const nextItem = sortedItems[overIndex + 1];
			announcement = `${activeMovementId} was ${movedVerb} before ${nextItem.id}.`;
		} else if (projected.depth > previousItem.depth) {
			announcement = `${activeMovementId} was ${nestedVerb} under ${previousItem.id}.`;
		} else {
			let previousSibling: FlattenedItem | undefined = previousItem;
			while (previousSibling && projected.depth < previousSibling.depth) {
				const {parentId} = previousSibling as FlattenedItem;
				previousSibling = sortedItems.find(({id}) => {
					return id === parentId;
				});
			}

			if (previousSibling) {
				announcement = `${activeMovementId} was ${movedVerb} after ${previousSibling.id}.`;
			}
		}

		return announcement;
	}

	const announcements: Announcements = {
		onDragStart(id) {
			return `Picked up ${id}.`;
		},
		onDragMove(id, oId) {
			return getMovementAnnouncement('onDragMove', id, oId);
		},
		onDragOver(id, oId) {
			return getMovementAnnouncement('onDragOver', id, oId);
		},
		onDragEnd(id, oId) {
			return getMovementAnnouncement('onDragEnd', id, oId);
		},
		onDragCancel(id) {
			return `Moving was cancelled. ${id} was dropped in its original position.`;
		},
	};

	return (
		<DndContext
			announcements={announcements}
			sensors={sensors}
			modifiers={indicator ? [adjustTranslate] : undefined}
			collisionDetection={closestCenter}
			measuring={measuring}
			onDragStart={handleDragStart}
			onDragMove={handleDragMove}
			onDragOver={handleDragOver}
			onDragEnd={handleDragEnd}
			onDragCancel={handleDragCancel}
		>
			<SortableContext items={sortedIds} strategy={verticalListSortingStrategy}>
				{
					flattenedItems
						.filter(({id}) => id !== 'root') // omit root from tree
						.map(({id, children, collapsed, depth}) => {
							return (
								<SortableTreeItem
									key={id}
									id={id}
									value={id}
									depth={id === activeId && projected ? projected.depth - 1 : depth - 1} // minus 1 for depth because root is omitted
									indentationWidth={indentationWidth}
									indicator={indicator}
									collapsed={Boolean(collapsed && children.length)}
									onCollapse={
										collapsible && children.length
											? () => {
												return handleCollapse(id);
											}
											: undefined
									}
									onRemove={removable ? () => {
										return handleRemove(id);
									} : undefined}
								/>
							);
						})
				}
				{
					createPortal(
						<DragOverlay dropAnimation={dropAnimation}>
							{
								activeId && activeItem ? (
									<TreeItem
										depth={activeItem.depth}
										clone
										childCount={client.getChildCountOfNode(activeId) + 1}
										value={activeId}
										indentationWidth={indentationWidth}
									/>
								) : null
							}
						</DragOverlay>,
						document.body,
					)
				}
			</SortableContext>
		</DndContext>
	);
};

SortableTree.defaultProps = {
	collapsible: true,
	indicator: true,
	removable: true,
	indentationWidth: 50,
};

