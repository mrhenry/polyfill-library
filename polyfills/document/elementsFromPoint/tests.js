/* eslint-env mocha, browser */
// eslint-disable-next-line no-unused-vars
/* globals proclaim */

describe('document.elementsFromPoint', function () {
    it('returns all the elements at the specified coordinates', function() {
        var container = document.body.appendChild(document.createElement('div'));
        var p = container.appendChild(document.createElement('p'));

        p.innerText = 'Some text';

        var elements = document.elementsFromPoint(30, 20);
        elements = [].map.call(elements, function(e) {
            return e.tagName.toLowerCase();
        });
        proclaim.deepStrictEqual(elements, ['p', 'div', 'body', 'html']);
    });

    it('should not change pointer-events property if set', function() {
        var expectedValue = 'all';
        var expectedPriority = 'important';
        var container = document.body.appendChild(document.createElement('div'));

        var p = container.appendChild(document.createElement('p'));
        p.innerText = 'Some text';
        p.style.setProperty('pointer-events', expectedValue, expectedPriority);

        document.elementsFromPoint(30, 20);

        var propertyValue = p.style.getPropertyValue('pointer-events');
        var propertyPriority = p.style.getPropertyPriority('pointer-events');

        proclaim.strictEqual(propertyValue, expectedValue);
        proclaim.strictEqual(propertyPriority, expectedPriority);

        propertyValue = container.style.getPropertyValue('pointer-events');
        propertyPriority = container.style.getPropertyPriority('pointer-events');
        proclaim.strictEqual(propertyValue, '');
        proclaim.strictEqual(propertyPriority, '');
    });
});
