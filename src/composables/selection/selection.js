import { unref } from 'vue'
import SelectionMode from '../../enums/selectionMode.js';

/**
 * Composable dealing with selection handling on an arbitrary node.
 * @param selectionMode A Ref to the selection mode in use for the tree.
 * @returns Methods to deal with selection of an arbitrary node.
 */
export function useSelection(selectionMode) {

  function select(targetNodeModel) {
    unref(targetNodeModel).treeNodeSpec.state.selected = true;
  }

  function deselect(targetNodeModel) {
    unref(targetNodeModel).treeNodeSpec.state.selected = false;
  }

  function setSelected(targetNodeModel, newValue) {
    unref(targetNodeModel).treeNodeSpec.state.selected = newValue;
  }

  /**
   * Handle toggling the selected state for the given node node for Single and Multiple selection modes.
   * Note that for SelectionFollowsFocus mode the selection change is handled by the
   * "model.treeNodeSpec.focusable" watcher method in treeViewNodeSelection.js.
   * @param {Event} event The event that triggered the selection toggle
   */
  function toggleSelected(targetNodeModel) {
    const tns = unref(targetNodeModel).treeNodeSpec;
    if (tns.selectable && [SelectionMode.Single, SelectionMode.Multiple].includes(selectionMode.value)) {
      tns.state.selected = !tns.state.selected;
    }
  }

  function isSelectable(targetNodeModel) {
    return unref(targetNodeModel).treeNodeSpec.selectable === true;
  }

  function isSelected(targetNodeModel) {
    return unref(targetNodeModel).treeNodeSpec.state.selected === true;
  }

  return {
    deselect,
    isSelectable,
    isSelected,
    setSelected,
    select,
    toggleSelected,
  }
}