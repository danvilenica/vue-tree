import { expect, describe, it, beforeEach, vi } from 'vitest';
import { ref } from 'vue';
import { useTreeViewSelection } from './treeViewSelection.js';
import { generateNodes } from 'tests/data/node-generator.js';
import SelectionMode from '../../enums/selectionMode.js';

describe('treeViewSelection.js', () => {

  describe('when selectionMode changes to selectionFollowsFocus', () => {

    let nodes;

    beforeEach(() => {
      nodes = generateNodes(['Ecsf', ['ecS', 'ecs'], 'ecs']);
      const selectionMode = ref(SelectionMode.Single);
      const focusableNodeModel = ref(nodes[0]);
      const emit = vi.fn();
      useTreeViewSelection(ref(nodes), selectionMode, focusableNodeModel, emit);

      selectionMode.value = SelectionMode.SelectionFollowsFocus;
    });

    it('should select the focused node', () => {
      expect(nodes[0].treeNodeSpec.state.selected).to.be.true;
    });

    it('should deselect the previously selected node', () => {
      expect(nodes[0].children[0].treeNodeSpec.state.selected).to.be.false;
    });
  });
});