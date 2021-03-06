import {
  closestCorners,
  getViewRect,
  KeyboardCode,
  KeyboardCoordinateGetter,
} from '@dnd-kit/core';

import type { SensorContext } from './types';
import { getProjection } from './utilities';

const directions: string[] = [
  KeyboardCode.Down,
  KeyboardCode.Right,
  KeyboardCode.Up,
  KeyboardCode.Left,
];

const horizontal: string[] = [ KeyboardCode.Left, KeyboardCode.Right ];

export const sortableTreeKeyboardCoordinates: (
  _context: SensorContext,
  _indentationWidth: number
) => KeyboardCoordinateGetter = (context, indentationWidth) => {
  return (
    event,
    {
      active,
      currentCoordinates,
      context: { over, translatedRect, droppableContainers },
    },
  ) => {
    if (directions.includes(event.code)) {
      event.preventDefault();

      if (!translatedRect) {
        return undefined;
      }

      const {
        current: { items, offset },
      } = context;

      if (horizontal.includes(event.code) && over?.id) {
        const { depth, maxDepth, minDepth } = getProjection(
          items,
          active,
          over.id,
          offset,
          indentationWidth,
        );

        switch (event.code) {
          case KeyboardCode.Left:
            if (depth > minDepth) {
              return {
                ...currentCoordinates,
                x: currentCoordinates.x - indentationWidth,
              };
            }
            break;
          case KeyboardCode.Right:
            if (depth < maxDepth) {
              return {
                ...currentCoordinates,
                x: currentCoordinates.x + indentationWidth,
              };
            }
            break;
          default:
            break;
        }

        return undefined;
      }

      /* eslint-disable  @typescript-eslint/no-explicit-any */
      const layoutRects: any[] = [];

      const overRect = over?.id
        ? droppableContainers.get(over.id)?.rect.current
        : undefined;

      Object.entries(droppableContainers).forEach(([ id, container ]) => {
        if (container?.disabled || !overRect) {
          return;
        }

        const rect = container?.rect.current;

        if (!rect) {
          return;
        }

        switch (event.code) {
          case KeyboardCode.Down:
            if (overRect.offsetTop < rect.offsetTop) {
              layoutRects.push([ id, rect ]);
            }
            break;
          case KeyboardCode.Up:
            if (overRect.offsetTop > rect.offsetTop) {
              layoutRects.push([ id, rect ]);
            }
            break;
          default:
            break;
        }
      });

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const closestId = closestCorners(layoutRects, translatedRect);
      // const closestId = closestCorners({ active: translatedRect, droppableContainers: layoutRects });

      if (closestId && over?.id) {
        const newNode = droppableContainers.get(closestId)?.node.current;
        const activeNodeRect = droppableContainers.get(active)?.rect.current;

        if (newNode && activeNodeRect) {
          const newRect = getViewRect(newNode);
          const newItem = items.find(({ id }) => { return id === closestId; });
          const activeItem = items.find(({ id }) => { return id === active; });

          if (newItem && activeItem) {
            const { depth } = getProjection(
              items,
              active,
              closestId,
              (newItem.depth - activeItem.depth) * indentationWidth,
              indentationWidth,
            );
            const offs = newRect.offsetTop > activeNodeRect.offsetTop
              ? Math.abs(activeNodeRect.height - newRect.height)
              : 0;

            const newCoordinates = {
              x: newRect.left + depth * indentationWidth,
              y: newRect.top + offs,
            };

            return newCoordinates;
          }
        }
      }
    }

    return undefined;
  };
};
