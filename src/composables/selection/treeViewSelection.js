import { computed, unref, watch } from 'vue'
import { useTraversal } from '../treeViewTraversal.js'
import { useSelection } from './selection.js';
import SelectionMode from '../../enums/selectionMode.js';
import TreeEvent from '../../enums/event';

/**
 * Composable dealing with selection handling at the top level of the tree view.
 * @param treeModel A Ref to the top level model of the tree
 * @param selectionMode A Ref to the selection mode in use for the tree.
 * @param focusableNodeModel A Ref to the currently focusable node model for the tree
 * @param emit The TreeView's emit function, used to emit selection events on the tree's behalf
 * @returns Methods to deal with tree view level selection
 */
export function useTreeViewSelection(treeModel, selectionMode, focusableNodeModel, emit) {

  const { depthFirstTraverse } = useTraversal(treeModel);
  const { deselect, isSelectable, isSelected, select } = useSelection(selectionMode);

  watch(selectionMode, enforceSelectionMode);

  watch(focusableNodeModel, (node) => {
    if (unref(selectionMode) === SelectionMode.SelectionFollowsFocus) {
      exclusivelySelectNode(node);
    }
});

  /**
   * @returns The value for the tree's aria-multiselectable attribute
   */
  const ariaMultiselectable = computed(() => {
    // If there's no selectionMode, return null so aria-multiselectable isn't included.
    // Otherwise, return either true or false as the attribute's value.
    return selectionMode.value === SelectionMode.None ? null : selectionMode.value === SelectionMode.Multiple;
  });

  /**
   * Enforce single selection mode by deselecting anything except
   * the first (by depth-first) selected node.
   */
  function enforceSingleSelectionMode() {
    // For single selection mode, only allow one selected node.
    if (unref(selectionMode) === SelectionMode.Single) {
      let alreadyFoundSelected = false;
      depthFirstTraverse((node) => {
        if (node.treeNodeSpec.state && isSelected(node)) {
          if (alreadyFoundSelected) {
            deselect(node);
          }
          else {
            alreadyFoundSelected = true;
          }
        }
      });
    }
  }

  /**
   * Enforces the selection mode for the tree, ensuring only the expected
   * node or nodes are selected.
   * @param {SelectionMode} mode The selection mode to enforce
   */
  function enforceSelectionMode(mode) {
    if (mode === SelectionMode.Single) {
      enforceSingleSelectionMode();
    }
    else if (mode === SelectionMode.SelectionFollowsFocus) {
      // Make sure the actual focusable item is selected if the mode changes, and deselect all others
      depthFirstTraverse((node) => {
        let idPropName = node.treeNodeSpec.idProperty;
        let focusableIdPropName = focusableNodeModel.value.treeNodeSpec.idProperty;
        if (node[idPropName] === focusableNodeModel.value[focusableIdPropName]) {
          if (isSelectable(node)) {
            select(node);
          }
        }
        else if (isSelected(node)) {
          deselect(node);
        }
      });
    }
  }

  /**
   * For single selection mode, unselect any other selected node.
   * For selectionFollowsFocus mode for TreeView, selection state is handled in
   * the focus watcher in treeViewNodeSelection.js.
   * In all cases this emits treeNodeSelectedChange for the node parameter.
   * @param node {TreeViewNode} The node for which selection changed
   */
  function handleNodeSelectedChange(node) {
    if (unref(selectionMode) === SelectionMode.Single && isSelected(node)) {
      exclusivelySelectNode(node);
    }
    emit(TreeEvent.SelectedChange, node);
  }

  function exclusivelySelectNode(node) {
    depthFirstTraverse((current) => {
      if (isSelected(current) && current.id !== node.id) {
        deselect(current);
        return false;
      }
      return true;
    });
  }

  return {
    ariaMultiselectable,
    enforceSelectionMode,
    enforceSingleSelectionMode,
    handleNodeSelectedChange,
  }
}