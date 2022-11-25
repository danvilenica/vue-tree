import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';
import { useTreeViewNodeFocus } from './treeViewNodeFocus.js';
import { generateNodes } from 'tests/data/node-generator.js';
import TreeEvent from '../../enums/event.js';

describe('treeViewNodeFocus.js', () => {

  let nodeElement = null;

  beforeEach(() => {
    // Create an element to use as the node element
    nodeElement = document.createElement('input')
    document.body.appendChild(nodeElement);
  });

  afterEach(() => {
    document.body.removeChild(nodeElement);
  });

  describe('when handling a focus change', () => {

    let nodes;
    let emit;

    beforeEach(async () => {
      // Calling the use sets up the watcher
      nodes = generateNodes(['ecsf', 'eCs']);
      emit = vi.fn();
      let isMounted = ref(true);
      let nodeRef = ref(nodes[1]);
      useTreeViewNodeFocus(nodeRef, ref(nodeElement), emit, isMounted);
      nodeRef.value.treeNodeSpec.focusable = true;
    });

    it('should emit the treeNodeAriaFocusableChange event', () => {
      expect(emit).toHaveBeenCalledWith(TreeEvent.FocusableChange, nodes[1]);
    });

    it('should focus the node element', () => {
      expect(nodeElement).to.equal(document.activeElement);
    });
  });
});