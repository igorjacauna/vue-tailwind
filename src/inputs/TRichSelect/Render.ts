import { CreateElement, VNode, VNodeChildren } from 'vue';
import TRichSelectInterface from '@/types/TRichSelect';
import NormalizedOptions from '@/types/NormalizedOptions';
import NormalizedOption from '@/types/NormalizedOption';

export default class TRichSelectRender {
  createElement: CreateElement

  component: TRichSelectInterface

  constructor(createElement: CreateElement, component: TRichSelectInterface) {
    this.createElement = createElement;
    this.component = component;
  }

  render(): VNode {
    return this.createWrapper();
  }

  /**
   * Div that wrapps the whole component
   */
  createWrapper() {
    return this.createElement(
      'div',
      {
        ref: 'wrapper',
        class: this.component.getElementCssClass('wrapper'),
      },
      [
        this.createSelectButtonWrapper(),
        this.createDropdown(),
      ],
    );
  }

  /**
   * Div that wraps the button that is used as a select box
   */
  createSelectButtonWrapper() {
    return this.createElement(
      'div',
      {
        ref: 'buttonWrapper',
        class: this.component.getElementCssClass('buttonWrapper'),
      },
      [
        this.createSelectButton(),
      ],
    );
  }

  /**
   * The button that is used a select box
   */
  createSelectButton() {
    return this.createElement(
      'button',
      {
        ref: 'selectButton',
        attrs: {
          type: 'button',
        },
        class: this.component.getElementCssClass('selectButton'),
        on: {
          click: this.component.clickHandler,
          focus: this.component.focusHandler,
          keydown: (e: KeyboardEvent) => {
            // Down
            if (e.keyCode === 40) {
              this.component.arrowDownHandler(e);
            // Up
            } else if (e.keyCode === 38) {
              this.component.arrowUpHandler(e);
            // Enter
            } else if (e.keyCode === 13) {
              this.component.enterHandler(e);
            }
          },
          blur: (e: FocusEvent) => {
            if (!this.component.hideSearchBox) {
              return;
            }

            this.component.blurHandler(e);
          },
          mousedown: (e: MouseEvent) => {
            e.preventDefault();
          },
        },
      },
      this.component.value,
    );
  }

  /**
   * Div that wraps the search box
   */
  createSearchBoxWrapper() {
    return this.createElement(
      'div',
      {
        ref: 'searchWrapper',
        class: this.component.getElementCssClass('searchWrapper'),
      },
      [
        this.createSearchBox(),
      ],
    );
  }

  /**
   * Filter search box
   */
  createSearchBox() {
    return this.createElement(
      'input',
      {
        ref: 'searchBox',
        class: this.component.getElementCssClass('searchBox'),
        domProps: {
          value: this.component.query,
        },
        attrs: {
          placeholder: this.component.searchBoxPlaceholder,
        },
        on: {
          keydown: (e: KeyboardEvent) => {
            // Down
            if (e.keyCode === 40) {
              this.component.arrowDownHandler(e);
            // Up
            } else if (e.keyCode === 38) {
              this.component.arrowUpHandler(e);
            // Enter
            } else if (e.keyCode === 13) {
              this.component.enterHandler(e);
            }
          },
          blur: this.component.blurHandler,
          input: this.component.searchInputHandler,
        },
      },
    );
  }

  /**
   * The div used as dropdown with the options and the search box
   */
  createDropdown() {
    const subElements = [];

    if (!this.component.hideSearchBox) {
      subElements.push(this.createSearchBoxWrapper());
    }

    if (!this.component.filteredOptions.length) {
      subElements.push(this.createDropdownFeedback(this.component.noResultsLabel));
    } else {
      subElements.push(this.createOptionsList());
    }

    return this.createElement(
      'div',
      {
        ref: 'dropdown',
        class: this.component.getElementCssClass('dropdown'),
        style: {
          display: !this.component.show ? 'none' : undefined,
        },
      },
      subElements,
    );
  }

  /**
   * Options list wrapper
   */
  createOptionsList() {
    return this.createElement(
      'ul',
      {
        ref: 'optionsList',
        attrs: {
          tabindex: -1,
        },
        class: this.component.getElementCssClass('optionsList'),
        style: {
          maxHeight: this.component.normalizedHeight,
        },
      },
      this.createOptions(),
    );
  }

  /**
   * Dropdown feedback
   * @param text
   */
  createDropdownFeedback(text: string) {
    return this.createElement(
      'div',
      {
        ref: 'dropdownFeedback',
        class: this.component.getElementCssClass('dropdownFeedback'),
      },
      text,
    );
  }

  /**
   * List of options
   */
  createOptions(): VNode[] {
    const options: NormalizedOptions = this.component.filteredOptions;
    return options
      .map((option: NormalizedOption, index) => this.createOption(option, index));
  }

  /**
   * Builds an option element
   * @param option
   * @param index
   */
  createOption(
    option: NormalizedOption,
    index: number,
  ): VNode {
    const isSelected = this.component.optionIsSelected(option);
    const isHighlighted = this.component.highlighted === index;

    let className;

    if (isHighlighted && isSelected) {
      className = this.component.getElementCssClass('selectedHighlightedOption');
    } else if (isHighlighted) {
      className = this.component.getElementCssClass('highlightedOption');
    } else if (isSelected) {
      className = this.component.getElementCssClass('selectedOption');
    } else {
      className = this.component.getElementCssClass('option');
    }

    return this.createElement(
      'li',
      {
        ref: 'option',
        class: className,
        on: {
          mouseover: () => {
            this.component.highlighted = index;
          },
          mouseleave: () => {
            this.component.highlighted = null;
          },
          mousedown: (e: MouseEvent) => {
            e.preventDefault();
          },
          click: (e: MouseEvent) => {
            e.preventDefault();

            this.component.selectOption(option);
          },
        },
      },
      [
        this.createOptionContent(option, isSelected),
      ],
    );
  }

  createOptionContent(option: NormalizedOption, isSelected: boolean): VNode {
    const subElements = [
      this.createOptionLabel(option),
    ];

    if (isSelected) {
      subElements.push(this.createOptionSelectedIcon());
    }

    return this.createElement(
      'div',
      {
        ref: 'optionContent',
        class: this.component.getElementCssClass('optionContent'),
      },
      subElements,
    );
  }

  createOptionLabel(option: NormalizedOption): VNode {
    return this.createElement(
      'span',
      {
        ref: 'optionLabel',
        class: this.component.getElementCssClass('optionLabel'),
      },
      option.text as VNodeChildren,
    );
  }

  createOptionSelectedIcon(): VNode {
    return this.createElement(
      'svg',
      {
        ref: 'selectedIcon',
        attrs: {
          fill: 'currentColor',
          xmlns: 'http://www.w3.org/2000/svg',
          viewBox: '0 0 20 20',
        },
        class: this.component.getElementCssClass('selectedIcon'),
      },
      [
        this.createElement('polygon', {
          attrs: {
            points: '0 11 2 9 7 14 18 3 20 5 7 18',
          },
        }),
      ],
    );
  }
}