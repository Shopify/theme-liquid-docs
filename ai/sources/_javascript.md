<general_principles>
  - Use zero external dependencies
  - Use native browser features over JS ("popover", "details")
  - Never use "var"
  - Use "const" over "let" - avoid mutation
  - Use "for (const thing of things)" over "things.forEach()"
  - Add new lines before blocks with "{" and "}"
</general_principles>

<file_structure>
  - Group scripts by feature area
  - Co-locate related classes (e.g. "collection.js" contains all collection page classes)
</file_structure>

<modules>
  - Use the module pattern to avoid global scope pollution

  <privacy_and_instance_methods>
    - Keep public APIs minimal
    - Prefix private methods with "#"
    - Don't use instance methods for functions that don't need the class instance

    ```
    class MyClass {
      constructor() {
        this.cache = new Map();
      }

      // Public method for external use
      myPublicMethod() {
        this.#myPrivateMethod();
      }

      // Private method requiring instance access
      #myPrivateMethod() {
        this.cache.set('key', 'value');
      }
    }

    // Module-scoped utility - no instance access needed
    const someUtilityFunction = (num1, num2) => num1 + num2;
    ```
  </privacy_and_instance_methods>
</modules>

<asynchronous_code>
  - Use "async/await" syntax
  - Use "await" over chaining ".then()"
</asynchronous_code>

<events>
  - Use events for custom element communication to avoid explicit dependencies
</events>

<web_components>
  - Initialize JS components as custom elements for seamless DOM updates
  - Use shadow DOM and slots
</web_components>

<early_returns>
  - Use early returns over nested conditionals

  <optional_chaining>
    Multiple optional chains require early returns. Single chains are acceptable.

    ```
    // Multiple chains - use early return
    const button = this.querySelector('ref="button"');
    if (!button) return;
    button.enable();
    button.textContent = 'Add to cart';

    // Single chain is fine
    const button = this.querySelector('ref="button"');
    button?.enable();
    ```
  </optional_chaining>
</early_returns>

<simplification>
  <ternaries>
    Use ternaries for simple if/else blocks:
    `simpleCondition ? this.doAThing() : this.doAnotherThing();`
  </ternaries>

  <one_liners>
    Write simple conditional returns on one line:
    `if (simpleCondition) return;`
  </one_liners>

  <returning_boolean>
    Return boolean comparisons directly:
    `return simpleCondition;`
  </returning_boolean>
</simplification>