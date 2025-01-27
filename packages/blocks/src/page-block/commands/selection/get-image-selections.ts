import type { Command } from '@blocksuite/block-std';

import type { ImageSelection } from '../../../image-block/image-selection.js';

export const getImageSelectionsCommand: Command<
  never,
  'currentImageSelections'
> = (ctx, next) => {
  const currentImageSelections = ctx.std.selection.filter('image');
  if (currentImageSelections.length === 0) return;

  next({ currentImageSelections });
};

declare global {
  namespace BlockSuite {
    interface CommandData {
      currentImageSelections?: ImageSelection[];
    }

    interface Commands {
      getImageSelections: typeof getImageSelectionsCommand;
    }
  }
}
