/* eslint-env mocha, browser */
// eslint-disable-next-line no-unused-vars
/* globals proclaim */

describe('document.elementsFromPoint', function () {
    function getElementCenter(el) {
        var elBounds = el.getBoundingClientRect();

        var x = elBounds.left + elBounds.width / 2;
        var y = elBounds.top + elBounds.height / 2;

        return [x, y];
    }

    function mapToTagName(elements) {
        var elementTagNames = [];
        for (var i = 0; i < elements.length; i++) {
            elementTagNames.push(elements[i].tagName.toLowerCase());
        }

        return elementTagNames;
    }

    it('returns all the elements at the specified coordinates', function() {
        var container = document.body.appendChild(document.createElement('div'));
        var p = container.appendChild(document.createElement('p'));

        p.textContent = 'Some text';

        var center = getElementCenter(p);

        var elements = mapToTagName(document.elementsFromPoint(center[0], center[1]));
        proclaim.deepStrictEqual(elements, ['p', 'div', 'body', 'html']);
        proclaim.deepStrictEqual(elements, ['p', 'div', 'body', 'html']);
    });

    it('should not change pointer-events property if set', function() {
        var expectedValue = 'all';
        var expectedPriority = 'important';
        var container = document.body.appendChild(document.createElement('div'));

        var p = container.appendChild(document.createElement('p'));
        p.style.setProperty('pointer-events', expectedValue, expectedPriority);
        p.textContent = 'Some text';

        var center = getElementCenter(p);

        document.elementsFromPoint(center[0], center[1]);

        var propertyValue = p.style.getPropertyValue('pointer-events');
        var propertyPriority = p.style.getPropertyPriority('pointer-events');

        proclaim.strictEqual(propertyValue, expectedValue);
        proclaim.strictEqual(propertyPriority, expectedPriority);

        propertyValue = container.style.getPropertyValue('pointer-events');
        propertyPriority = container.style.getPropertyPriority('pointer-events');

        // It may be null or empty string on some browsers
        proclaim.notOk(propertyValue);
        proclaim.notOk(propertyPriority);
    });
});
