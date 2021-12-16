import React from 'react';
import { storiesOf } from '@storybook/react';
import {SortableTree} from "./SortableTree";

storiesOf('SortableTree', module)
	.add('All features', () => <SortableTree collapsible indicator removable />)
