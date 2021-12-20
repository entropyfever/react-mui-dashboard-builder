import React, {
  useMemo,
  useState
} from 'react';
import './styleEditor.scss';
import {useSelectedNode} from "../DashboardBuilderProvider";
import {
  Box,
} from "@mui/system";
import {
  Grid,
  GridDirection,
  MenuItem,
  Select,
  Slider,
  SliderProps
} from "@mui/material";
import {
  DefaultComponentProps,
} from "@mui/material/OverridableComponent";
import {
  GridSize,
  GridTypeMap
} from "@mui/material/Grid/Grid";
import {TreeItem} from "../SortableTree/types";
import _ from "lodash";

export interface StyleEditorProps {
}

export interface StyleProps
  extends DefaultComponentProps<GridTypeMap> {
}

export interface StylableTreeItem
  extends TreeItem {
  styleProps?: StyleProps
}

interface IDelayedSlider extends SliderProps {
  wait?: number
}

const DelayedSlider: React.FunctionComponent<IDelayedSlider> = function (props) {
  const [value, setValue] = useState(props.value);

  const handleChange = useMemo(() => {
    return _.debounce(props.onChange ? props.onChange : () => null, props.wait)
  }, [props.onChange, props.wait]);

  return <Slider
    {...props}
    value={value}
    onChange={(e, v, t) => {
     setValue(v);
     handleChange(e, v, t);
    }}
  />

}

export const StyleEditor: React.FC<StyleEditorProps> = ({children}) => {

  const [selectedNode, setSelectedNodeProperty] = useSelectedNode<StylableTreeItem>();

  if (!selectedNode) {
    return null;
  }

  const {styleProps} = selectedNode;

  const {
          xs,
          md,
          rowSpacing,
          columnSpacing,
          direction,
          alignItems,
          justifyContent,
          height,
        } = {
    xs: 12,
    md: 12,
    rowSpacing: 0,
    columnSpacing: 0,
    direction: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    height: 100,
    ...styleProps,
  } as StyleProps;

  function handleStyleChange<T extends StyleProps, K extends keyof T>(property: K, value: T[K]) {
    setSelectedNodeProperty('styleProps', (prevStyleProps) => {
      return {
        ...prevStyleProps,
        [property]: value
      };
    });
  }

  /*
  const createDebounceMap = function <T extends StyleProps, K extends keyof T>() {
    const debounceMap = new Map<K, (property: K, value: T[K]) => void>();
    return function (property: K, value: T[K]) {
      if (!debounceMap.has(property)){
        debounceMap.set(property, _.debounce<(property: K, value: T[K]) => void>(handleStyleChange, 1000, { trailing: true }));
      }
      const fn = debounceMap.get(property);
      if (!fn){
        throw new Error('Are you kidding me ?');
      }
      fn(property, value);
    }
  }

  const handleStyleChange = createDebounceMap();
   */


  const directionOptions = [
    'row',
    'column',
  ];

  const alignItemsOptions = [
    'flex-start',
    'flex-end',
    'center',
    'stretch'
  ];

  const justifyContentOptions = [
    'flex-start',
    'center',
    'space-between',
    'space-around',
    'space-evenly',
    'stretch',
    'flex-end',
  ];

  return (
    <Box sx={{padding: '0 24px'}}>
      {JSON.stringify(styleProps)}
      <Grid/>
      <div style={{width: '100%'}}>
        <p>Height</p>
        <DelayedSlider
          size='small'
          value={height as number}
          aria-label='Small'
          valueLabelDisplay='auto'
          max={1000}
          min={100}
          step={8}
          wait={200}
          onChange={(e, v) => {
            return handleStyleChange('height', v);
          }}
        />
      </div>
      <div style={{width: '100%'}}>
        <p>Mobile width</p>
        <DelayedSlider
          size='small'
          value={xs as number}
          aria-label='Small'
          valueLabelDisplay='auto'
          max={12}
          min={1}
          wait={200}
          onChange={(e, v) => {
            if (!(typeof v === "number")) {
              throw new Error('TODO: fix this');
            }
            return handleStyleChange('xs', v as GridSize);
          }}
        />
      </div>
      <div style={{width: '100%'}}>
        <p>Desktop width</p>
        <DelayedSlider
          size='small'
          value={md as number}
          aria-label='Small'
          valueLabelDisplay='auto'
          max={12}
          min={1}
          wait={200}
          onChange={(e, v) => {
            return handleStyleChange('md', v as GridSize);
          }}
        />
      </div>
      <div style={{width: '100%'}}>
        <p>Row Spacing</p>
        <DelayedSlider
          size='small'
          value={rowSpacing as number}
          aria-label='Small'
          valueLabelDisplay='auto'
          max={6}
          min={0}
          wait={200}
          onChange={(e, v) => {
            return handleStyleChange('rowSpacing', v);
          }}
        />
      </div>
      <div style={{width: '100%'}}>
        <p>Column Spacing</p>
        <DelayedSlider
          size='small'
          value={columnSpacing as number}
          aria-label='Small'
          valueLabelDisplay='auto'
          max={6}
          min={0}
          wait={200}
          onChange={(e, v) => {
            return handleStyleChange('columnSpacing', v);
          }}
        />
      </div>
      <div style={{width: '100%'}}>
        <p>Direction</p>
        <Select
          value={direction}
          label='Direction'
          onChange={(e) => {
            return handleStyleChange('direction', e.target.value as GridDirection);
          }}
        >
          {
            directionOptions.map((o) => {
              return <MenuItem key={o} value={o}>{o}</MenuItem>;
            })
          }
        </Select>
      </div>
      <div style={{width: '100%'}}>
        <p>Align Items</p>
        <Select
          value={alignItems}
          label='Justify Content'
          onChange={(e) => {
            return handleStyleChange('alignItems', e.target.value);
          }}
        >
          {
            alignItemsOptions.map((o) => {
              return <MenuItem key={o} value={o}>{o}</MenuItem>;
            })
          }
        </Select>
      </div>
      <div style={{width: '100%'}}>
        <p>Justify Content</p>
        <Select
          value={justifyContent}
          label='Justify Content'
          onChange={(e) => {
            return handleStyleChange('justifyContent', e.target.value);
          }}
        >
          {
            justifyContentOptions.map((o) => {
              return <MenuItem key={o} value={o}>{o}</MenuItem>;
            })
          }
        </Select>
      </div>
    </Box>
  );
};
