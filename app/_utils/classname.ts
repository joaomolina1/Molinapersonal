import cn, { Argument } from "classnames";

type BemArgument = string | Record<string, any>;

function bem(
  baseClass: string,
  modifiers?: BemArgument,
  additionalClasses?: Argument,
) {
  const finalClasses = [baseClass];

  if (modifiers) {
    if (typeof modifiers === "string") {
      finalClasses.push(`${baseClass}--${modifiers}`);
    } else {
      Object.entries(modifiers).forEach(([modifier, value]) => {
        if (typeof value === "string" || typeof value === "number") {
          finalClasses.push(`${baseClass}--${modifier}-${value}`);
        } else if (value) {
          finalClasses.push(`${baseClass}--${modifier}`);
        }
      });
    }
  }

  return cn(finalClasses.join(" "), additionalClasses);
}

/**
 * @typedef {Object} BemClasses
 * @property {Function} block Generate block class with its modifiers
 * @property {Function} element Generate an element class derived from the block, with its modifiers
 */

/**
 * Utility function for BEM classes
 * Will return two functions that will allow to create all derived
 * classes from the given main class
 * @param mainClass Class from which to derives all the other
 * @returns {BemClasses} The two utility functions
 *
 * @example const { block, element } = createBEMClasses('component-class');
 */
export function createBEMClasses(mainClass: string) {
  /**
   * Generate an element class derived from the block, with its modifiers
   * @param name Element name to be prepended to the main class
   * @param modifiers Modifiers to apply to the element
   * @param additionalClasses Additional classes to add to the element
   *
   * @example element('sth', { prop: value }) => 'component-class__sth component-class__sth--prop-value'
   */
  const element = (
    name: string,
    modifiers?: BemArgument,
    additionalClasses?: Argument,
  ) => bem(`${mainClass}__${name}`, modifiers, additionalClasses);

  /**
   * Generate block class with its modifiers
   * @param modifiers Modifiers to apply to the main class
   * @param additionalClasses Additional classes to add to the main class
   *
   * @example block({ prop: value }) => 'component-class component-class--prop-value'
   */
  const block = (modifiers?: BemArgument, additionalClasses?: Argument) =>
    bem(mainClass, modifiers, additionalClasses);

  return {
    mainClass,
    block,
    element,
  };
}
