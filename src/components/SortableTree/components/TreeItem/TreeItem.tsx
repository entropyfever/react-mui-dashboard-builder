import React, {
	forwardRef,
	HTMLAttributes
} from 'react';
import classNames from 'classnames';

import './TreeItem.scss';
import {
	Handle,
	Action,
	Remove
} from '../Item/components';
import {ActionProps} from '../Item/components/Action';

const collapseIcon = (
	<svg width='10' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 70 41'>
		<path
			d='M30.76 39.2402C31.885 40.3638 33.41 40.995 35 40.995C36.59 40.995 38.115 40.3638 39.24 39.2402L68.24 10.2402C69.2998 9.10284 69.8768 7.59846 69.8494 6.04406C69.822 4.48965 69.1923 3.00657 68.093 1.90726C66.9937 0.807959 65.5106 0.178263 63.9562 0.150837C62.4018 0.123411 60.8974 0.700397 59.76 1.76024L35 26.5102L10.24 1.76024C9.10259 0.700397 7.59822 0.123411 6.04381 0.150837C4.4894 0.178263 3.00632 0.807959 1.90702 1.90726C0.807714 3.00657 0.178019 4.48965 0.150593 6.04406C0.123167 7.59846 0.700153 9.10284 1.75999 10.2402L30.76 39.2402Z'/>
	</svg>
);

const gearIcon = (
	<svg width='20' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
		<path d="M416.3 256c0-21 13.1-38.9 31.7-46.1-4.9-20.5-13-39.7-23.7-57.1-6.4 2.8-13.2 4.3-20.1 4.3-12.6 0-25.2-4.8-34.9-14.4-14.9-14.9-18.2-36.8-10.2-55-17.3-10.7-36.6-18.8-57-23.7C295 82.5 277 95.7 256 95.7S217 82.5 209.9 64c-20.5 4.9-39.7 13-57.1 23.7 8.1 18.1 4.7 40.1-10.2 55-9.6 9.6-22.3 14.4-34.9 14.4-6.9 0-13.7-1.4-20.1-4.3C77 170.3 68.9 189.5 64 210c18.5 7.1 31.7 25 31.7 46.1 0 21-13.1 38.9-31.6 46.1 4.9 20.5 13 39.7 23.7 57.1 6.4-2.8 13.2-4.2 20-4.2 12.6 0 25.2 4.8 34.9 14.4 14.8 14.8 18.2 36.8 10.2 54.9 17.4 10.7 36.7 18.8 57.1 23.7 7.1-18.5 25-31.6 46-31.6s38.9 13.1 46 31.6c20.5-4.9 39.7-13 57.1-23.7-8-18.1-4.6-40 10.2-54.9 9.6-9.6 22.2-14.4 34.9-14.4 6.8 0 13.7 1.4 20 4.2 10.7-17.4 18.8-36.7 23.7-57.1-18.4-7.2-31.6-25.1-31.6-46.2zm-159.4 79.9c-44.3 0-80-35.9-80-80s35.7-80 80-80 80 35.9 80 80-35.7 80-80 80z"/>
	</svg>
);

export interface Props
	extends HTMLAttributes<HTMLLIElement> {
	childCount?: number;
	clone?: boolean;
	selected?: boolean;
	collapsed?: boolean;
	isLeaf?: boolean;
	depth: number;
	disableInteraction?: boolean;
	disableSelection?: boolean;
	ghost?: boolean;
	handleProps?: ActionProps;
	indicator?: boolean;
	indentationWidth: number;
	value: string;

	onCollapse?(): void;

	onRemove?(): void;

	onSelect?(): void;

	onSettings?(): void;

	wrapperRef?(_node: HTMLLIElement): void;
}

export const TreeItem = forwardRef<HTMLDivElement, Props>(
	(
		{
			childCount,
			clone,
			depth,
			disableSelection,
			disableInteraction,
			ghost,
			handleProps,
			indentationWidth,
			indicator,
			collapsed,
			isLeaf,
			selected,
			onCollapse,
			onSettings,
			onSelect,
			onRemove,
			style,
			value,
			wrapperRef,
			...props
		},
		ref,
	) => {
		return (
			<li
				className={classNames(
					'Wrapper',
					clone && 'clone',
					ghost && 'ghost',
					indicator && 'indicator',
					disableSelection && 'disableSelection',
					disableInteraction && 'disableInteraction',
				)}
				ref={wrapperRef}
				style={
					{
						'--spacing': `${indentationWidth * depth}px`,
					} as React.CSSProperties
				}
				{...props}
			>
				<div
					className={classNames('TreeItem', selected && 'selected')}
					ref={ref}
					style={style}
					onClick={() => onSelect && onSelect()}
				>
					<Handle {...handleProps} />
					{onCollapse && (
						<Action
							onClick={(e) => {
								e.stopPropagation();
								onCollapse();
							}}
							className={classNames(
								'Collapse',
								collapsed && 'collapsed',
							)}
						>
							{collapseIcon}
						</Action>
					)}
					<span className={'Text'} style={{fontWeight: isLeaf ? 'bold' : 'normal'}}>{value}</span>
					{onSettings && <Action
						onClick={(e) => {
							e.stopPropagation();
							onSettings();
						}}
						className={classNames(
							'Gear',
						)}
					>
						{gearIcon}
					</Action>}
					{!clone && onRemove && <Remove onClick={onRemove}/>}
					{clone && childCount && 1 < childCount ? (
						<span className={'Count'}>{childCount}</span>
					) : null}
				</div>
			</li>
		);
	},
);
