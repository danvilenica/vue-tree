import { expect, describe, it, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import TreeViewNode from './TreeViewNode.vue';
import { generateNodes } from '../../tests/data/node-generator.js';
import SelectionMode from '../enums/selectionMode';

const getDefaultPropsData = function () {
  return {
    ariaKeyMap: {},
    initialModel: generateNodes(['ces'])[0],
    modelDefaults: {},
    depth: 0,
    treeId: 'tree-id',
    initialRadioGroupValues: {},
    isMounted: false,
    selectionMode: SelectionMode.Multiple
  }
};

function createWrapper(customPropsData, slotsData) {
  return mount(TreeViewNode, {
    sync: false,
    props: customPropsData || getDefaultPropsData(),
    slots: slotsData
  });
}

describe('TreeViewNode.vue', () => {

  let wrapper = null;

  afterEach(() => {
    wrapper = null;
  });

  describe('when given a title in the model data for a text node', () => {

    beforeEach(() => {
      wrapper = createWrapper({
        ariaKeyMap: {},
        depth: 0,
        initialModel: { id: 'my-node', label: 'My Node', treeNodeSpec: { title: 'My Title' } },
        modelDefaults: {},
        treeId: 'tree-id',
        initialRadioGroupValues: {},
        isMounted: false
      });
    });

    it('should have a title attribute on the node\'s text', () => {
      let elem = wrapper.find(`.grtvn-self-text`).element;
      expect(elem.getAttribute('title')).to.equal('My Title');
    });
  });

  describe('when given a title in the model data for an input node', () => {

    beforeEach(() => {
      let data = getDefaultPropsData();
      data.initialModel.treeNodeSpec.title = 'My Title';

      wrapper = createWrapper(data);
    });

    it('should have a title attribute on the node\'s label', () => {
      let elem = wrapper.find(`.grtvn-self-label`).element;
      expect(elem.getAttribute('title')).to.equal('My Title');
    });
  });

  describe('when generating element IDs', () => {

    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('should have a nodeId made of the tree ID and the model[idPropName] property', () => {
      expect(wrapper.vm.nodeId).to.equal(wrapper.vm.treeId + '-' + wrapper.vm.model.id);
    });

    it('should have an expanderId made of the node ID and -exp', () => {
      expect(wrapper.vm.expanderId).to.equal(wrapper.vm.nodeId + '-exp');
    });

    describe('and the node has an input', () => {

      it('should have an inputId made of the node ID and -input', () => {
        expect(wrapper.vm.inputId).to.equal(wrapper.vm.nodeId + '-input');
      });
    });
  });

  describe('when there is not an addChildCallback method', () => {

    let addChildButton = null;

    beforeEach(() => {
      wrapper = createWrapper({
        ariaKeyMap: {},
        initialModel: generateNodes(['es'])[0],
        modelDefaults: {},
        depth: 0,
        treeId: 'tree',
        initialRadioGroupValues: {},
        isMounted: false
      });

      addChildButton = wrapper.find('#' + wrapper.vm.nodeId + '-add-child');
    });

    it('should not include an add button', async () => {
      expect(addChildButton.exists()).to.be.false;
    });
  });

  describe('when there is an addChildCallback method in the model', () => {

    let addChildButton = null;

    beforeEach(() => {
      let addChildCallback = () => {
        return Promise.resolve(null);
      };

      wrapper = createWrapper({
        ariaKeyMap: {},
        initialModel: generateNodes(['esa'], '', addChildCallback)[0],
        modelDefaults: {},
        depth: 0,
        treeId: 'tree',
        initialRadioGroupValues: {},
        isMounted: false
      });

      addChildButton = wrapper.find('#' + wrapper.vm.nodeId + '-add-child');
    });

    it('should include an add button', async () => {
      expect(addChildButton.exists()).to.be.true;
    });
  });

  describe('when there is an addChildCallback method in the model defaults', () => {

    let addChildButton = null;

    beforeEach(() => {
      let addChildCallback = () => {
        return Promise.resolve(null);
      };

      wrapper = createWrapper({
        ariaKeyMap: {},
        initialModel: generateNodes(['esa'])[0],
        modelDefaults: { addChildCallback },
        depth: 0,
        treeId: 'tree',
        initialRadioGroupValues: {},
        isMounted: false
      });

      addChildButton = wrapper.find('#' + wrapper.vm.nodeId + '-add-child');
    });

    it('should include an add button', async () => {
      expect(addChildButton.exists()).to.be.true;
    });
  });

  describe('when a node\'s model is disabled', () => {

    beforeEach(() => {
      let initialModel = generateNodes(['ces!'])[0];

      wrapper = createWrapper({
        ariaKeyMap: {},
        initialModel,
        modelDefaults: {},
        depth: 0,
        treeId: 'tree',
        initialRadioGroupValues: {},
        isMounted: false
      });
    });

    it('should have a disabled input', () => {
      let input = wrapper.find('#' + wrapper.vm.inputId);
      expect(input.element.disabled).to.be.true;
    });
  });

  describe('when a node\'s model is not disabled', () => {

    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('should have an enabled input', () => {
      let input = wrapper.find('#' + wrapper.vm.inputId);
      expect(input.element.disabled).to.be.false;
    });
  });

  describe('when a node\'s model is expandable', () => {

    describe('and the model has children', () => {

      beforeEach(() => {

        let initialModel = generateNodes(['es', ['es']])[0];

        wrapper = createWrapper({
          ariaKeyMap: {},
          initialModel,
          modelDefaults: {},
          depth: 0,
          treeId: 'tree',
          initialRadioGroupValues: {},
          isMounted: false
        });
      });

      it('should have an expander', () => {
        let target = wrapper.find('.grtvn-self-expander');
        expect(target.exists()).to.be.true;
      });

      describe('and the model is not expanded', () => {

        it('should have an aria-expanded attribute set to false', () => {
          let target = wrapper.find('.grtvn[aria-expanded="false"]');
          expect(target.exists()).to.be.true;
        });

        it('should have an aria-hidden attribute set to true on the child list', () => {
          let target = wrapper.find('.grtvn-children[aria-hidden="true"]');
          expect(target.exists()).to.be.true;
        });

        it('should have an aria-expanded attribute value of false', () => {
          expect(wrapper.vm.$refs.nodeElement.attributes['aria-expanded'].value).to.equal('false');
        });
      });

      describe('and the model is expanded', () => {

        beforeEach(() => {

          let initialModel = generateNodes(['Es', ['es']])[0];

          wrapper = createWrapper({
            ariaKeyMap: {},
            initialModel,
            modelDefaults: {},
            depth: 0,
            treeId: 'tree',
            initialRadioGroupValues: {},
            isMounted: false
          });
        });

        it('should have an aria-expanded attribute set to true', () => {
          let target = wrapper.find('.grtvn[aria-expanded="true"]');
          expect(target.exists()).to.be.true;
        });

        it('should have an aria-hidden attribute set to false on the child list', () => {
          let target = wrapper.find('.grtvn-children[aria-hidden="false"]');
          expect(target.exists()).to.be.true;
        });

        it('should have an aria-expanded attribute value of true', () => {
          expect(wrapper.vm.$refs.nodeElement.attributes['aria-expanded'].value).to.equal('true');
        });
      });
    });

    describe('and the model does not have children', () => {

      beforeEach(() => {

        let initialModel = generateNodes(['es'])[0];

        wrapper = createWrapper({
          ariaKeyMap: {},
          initialModel,
          modelDefaults: {},
          depth: 0,
          treeId: 'tree',
          initialRadioGroupValues: {},
          isMounted: false
        });
      });

      it('should not have an expander', () => {
        let target = wrapper.find('.grtvn-self-expander');
        expect(target.exists()).to.be.false;
      });
    });
  });

  describe('when a node\'s model is not expandable', () => {

    beforeEach(() => {

      let initialModel = generateNodes(['s', ['es']])[0];

      wrapper = createWrapper({
        ariaKeyMap: {},
        initialModel,
        modelDefaults: {},
        depth: 0,
        treeId: 'tree',
        initialRadioGroupValues: {},
        isMounted: false
      });
    });

    it('should not have an expander', () => {
      let target = wrapper.find('.grtvn-self-expander');
      expect(target.exists()).to.be.false;
    });

    it('should not have an aria-expanded attribute', () => {
      expect(wrapper.vm.$refs.nodeElement.attributes['aria-expanded']).to.be.undefined;
    });
  });

  describe('when selectionMode is null', () => {

    beforeEach(() => {

      let initialModel = generateNodes(['S'])[0];

      wrapper = createWrapper({
        ariaKeyMap: {},
        initialModel,
        modelDefaults: {},
        depth: 0,
        treeId: 'tree',
        initialRadioGroupValues: {},
        selectionMode: SelectionMode.None,
        isMounted: false
      });
    });

    it('should not have an aria-selected attribute', () => {
      expect(wrapper.vm.$refs.nodeElement.attributes['aria-selected']).to.be.undefined;
    });
  });

  describe('when model.selectable is false', () => {

    beforeEach(() => {

      let initialModel = generateNodes([''])[0];

      wrapper = createWrapper({
        ariaKeyMap: {},
        initialModel,
        modelDefaults: {},
        depth: 0,
        treeId: 'tree',
        initialRadioGroupValues: {},
        selectionMode: SelectionMode.Multiple,
        isMounted: false
      });
    });

    it('should not have an aria-selected attribute', () => {
      expect(wrapper.vm.$refs.nodeElement.attributes['aria-selected']).to.be.undefined;
    });
  });

  describe('when selectionMode is single', () => {

    describe('and the node is selected', () => {

      beforeEach(() => {

        let initialModel = generateNodes(['S'])[0];

        wrapper = createWrapper({
          ariaKeyMap: {},
          initialModel,
          modelDefaults: {},
          depth: 0,
          treeId: 'tree',
          initialRadioGroupValues: {},
          selectionMode: SelectionMode.Single,
          isMounted: false
        });
      });

      it('should have an aria-selected attribute of true', () => {
        expect(wrapper.vm.$refs.nodeElement.attributes['aria-selected'].value).to.equal('true');
      });
    });

    describe('and the node is not selected', () => {

      beforeEach(() => {

        let initialModel = generateNodes(['s'])[0];

        wrapper = createWrapper({
          ariaKeyMap: {},
          initialModel,
          modelDefaults: {},
          depth: 0,
          treeId: 'tree',
          initialRadioGroupValues: {},
          selectionMode: SelectionMode.Single,
          isMounted: false
        });
      });

      it('should not have an aria-selected attribute', () => {
        expect(wrapper.vm.$refs.nodeElement.attributes['aria-selected']).to.be.undefined;
      });
    });
  });

  describe('when selectionMode is selectionFollowsFocus', () => {

    describe('and the node is selected', () => {

      beforeEach(() => {

        let initialModel = generateNodes(['S'])[0];

        wrapper = createWrapper({
          ariaKeyMap: {},
          initialModel,
          modelDefaults: {},
          depth: 0,
          treeId: 'tree',
          initialRadioGroupValues: {},
          selectionMode: SelectionMode.SelectionFollowsFocus,
          isMounted: false
        });
      });

      it('should have an aria-selected attribute of true', () => {
        expect(wrapper.vm.$refs.nodeElement.attributes['aria-selected'].value).to.equal('true');
      });
    });

    describe('and the node is not selected', () => {

      beforeEach(async () => {

        let initialModel = generateNodes(['s'])[0];

        wrapper = createWrapper({
          ariaKeyMap: {},
          initialModel,
          modelDefaults: {},
          depth: 0,
          treeId: 'tree',
          initialRadioGroupValues: {},
          selectionMode: SelectionMode.SelectionFollowsFocus,
          isMounted: false
        });

        await wrapper.vm.$nextTick();
      });

      it('should not have an aria-selected attribute', () => {
        expect(wrapper.vm.$refs.nodeElement.attributes['aria-selected']).to.be.undefined;
      });
    });
  });

  describe('when selectionMode is multiple', () => {

    describe('and the node is selected', () => {

      beforeEach(() => {

        let initialModel = generateNodes(['S'])[0];

        wrapper = createWrapper({
          ariaKeyMap: {},
          initialModel,
          modelDefaults: {},
          depth: 0,
          treeId: 'tree',
          initialRadioGroupValues: {},
          selectionMode: SelectionMode.Multiple,
          isMounted: false
        });
      });

      it('should have an aria-selected attribute of true', () => {
        expect(wrapper.vm.$refs.nodeElement.attributes['aria-selected'].value).to.equal('true');
      });
    });

    describe('and the node is not selected', () => {

      beforeEach(() => {

        let initialModel = generateNodes(['s'])[0];

        wrapper = createWrapper({
          ariaKeyMap: {},
          initialModel,
          modelDefaults: {},
          depth: 0,
          treeId: 'tree',
          initialRadioGroupValues: {},
          selectionMode: SelectionMode.Multiple,
          isMounted: false
        });
      });

      it('should have an aria-selected attribute of false', () => {
        expect(wrapper.vm.$refs.nodeElement.attributes['aria-selected'].value).to.equal('false');
      });
    });
  });

  describe('when the node\'s selected state changes', () => {

    beforeEach(async () => {
      wrapper = createWrapper();
      wrapper.vm.model.treeNodeSpec.state.selected = true;
      await wrapper.vm.$nextTick();
    });

    it('should emit the treeNodeSelectedChange event', () => {
      expect(wrapper.emitted().treeNodeSelectedChange).to.be.an('array').that.has.length(1);
    });
  });

  describe('when idProperty is specified', () => {

    beforeEach(async () => {
      wrapper = createWrapper();
      wrapper.vm.model.treeNodeSpec.idProperty = 'label';
      await wrapper.vm.$nextTick();
    });

    it('should have an idPropName matching the idProperty', () => {
      expect(wrapper.vm.idPropName).to.equal('label');
    });

    it('should have a nodeId made of the tree ID and the model[idPropName] property', () => {
      expect(wrapper.vm.nodeId).to.equal(wrapper.vm.treeId + '-' + wrapper.vm.model.label);
    });
  });

  describe('when idProperty is not specified', () => {

    beforeEach(async () => {
      wrapper = createWrapper();
      wrapper.vm.model.treeNodeSpec.idProperty = null;
      await wrapper.vm.$nextTick();
    });

    it('should have an idPropName of id', () => {
      expect(wrapper.vm.idPropName).to.equal('id');
    });

    it('should have a nodeId made of the tree ID and the model.id property', () => {
      expect(wrapper.vm.nodeId).to.equal(wrapper.vm.treeId + '-' + wrapper.vm.model.id);
    });
  });

  describe('when the model does not have a property that matches idProperty', () => {

    beforeEach(async () => {

      vi.spyOn(console, 'error').mockImplementation(() => { });

      wrapper = createWrapper({
        ariaKeyMap: {},
        depth: 0,
        treeId: 'tree',
        initialModel: { badid: 'asf', label: 'asdf' },
        modelDefaults: {},
        initialRadioGroupValues: {},
        isMounted: false
      });
    });

    it('should log an error', () => {
      expect(console.error.mock.calls[0][0])
        .to.equal('initialModel id is required and must be a number or string. Expected prop id to exist on the model.');
    });
  });

  describe('when labelProperty is specified', () => {

    beforeEach(async () => {
      wrapper = createWrapper();
      wrapper.vm.model.treeNodeSpec.labelProperty = 'id';
      await wrapper.vm.$nextTick();
    });

    it('should have a labelPropName matching the labelProperty', () => {
      expect(wrapper.vm.labelPropName).to.equal('id');
    });

    it('should have a label of the  model[labelPropName] property', () => {
      expect(wrapper.text()).to.equal(wrapper.vm.model.id + '');
    });
  });

  describe('when labelProperty is not specified', () => {

    beforeEach(async () => {
      wrapper = createWrapper();
      wrapper.vm.model.treeNodeSpec.labelProperty = null;
      await wrapper.vm.$nextTick();
    });

    it('should have a labelPropName of label', () => {
      expect(wrapper.vm.labelPropName).to.equal('label');
    });

    it('should have a label of the  model.label property', () => {
      expect(wrapper.text()).to.equal(wrapper.vm.model.label + '');
    });
  });

  describe('when the model does not have a property that matches labelProperty', () => {

    beforeEach(async () => {

      vi.spyOn(console, 'error').mockImplementation(() => { });

      wrapper = createWrapper({
        ariaKeyMap: {},
        depth: 0,
        treeId: 'tree',
        initialModel: { id: 'asf', badlabel: 'asdf' },
        modelDefaults: {},
        initialRadioGroupValues: {},
        isMounted: false
      });
    });

    it('should log an error', () => {
      expect(console.error.mock.calls[0][0])
        .to.equal('initialModel label is required and must be a string. Expected prop label to exist on the model.');
    });
  });

  describe('when childrenProperty is specified', () => {

    beforeEach(async () => {
      let defaultProps = getDefaultPropsData();
      wrapper = createWrapper(Object.assign(defaultProps, {
        initialModel: generateNodes(['sf', ['s', 's']])[0]
      }));
      wrapper.vm.model.treeNodeSpec.childrenProperty = 'children';
      await wrapper.vm.$nextTick();
    });

    it('should have a children property of the expected values', () => {
      expect(wrapper.vm.model.children.length).to.equal(2);
    });
  });
});
