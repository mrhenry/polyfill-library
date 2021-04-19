document.elementsFromPoint = document.msElementsFromPoint || function elementsFromPoint(x, y) {
    var stack = [];
    var element = document.elementFromPoint(x, y);

    while (element !== null) {
        stack.push({
            element: element,
            value: element.style.getPropertyValue('pointer-events'),
            priority: element.style.getPropertyPriority('pointer-events')
        });
        /**
         * [...]Note: The elementFromPoint() method does not necessarily return the top-most painted element.
         * For instance, an element can be excluded from being a target for hit testing by using the pointer-events
         * CSS property.[...]
         * https://drafts.csswg.org/cssom-view/#dom-document-elementfrompoint
         */
        element.style.setProperty('pointer-events', 'none', 'important');

        element = element !== document.documentElement
            ? document.elementFromPoint(x, y)
            : null;
    }

    return stack.map(function (entry) {
        // restore its previous value if any
        entry.element.style.setProperty('pointer-events', entry.value, entry.priority);

        return entry.element;
    });
};
