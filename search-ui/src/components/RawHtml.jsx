import React from "react";

/**
 * Turn a raw string representing HTML code into a collection of HTML elements.
 *
 * This uses the technique described by this StackOverflow answer: https://stackoverflow.com/a/35385518
 *
 * @param {String} rawHtml - A raw string representing HTML code. It can be one element or multiple sibling elements.
 * @return {NodeList} a collection of HTML elements
 */
function htmlStringToElements(rawHtml) {
    const template = document.createElement('template');
    template.innerHTML = rawHtml;
    return template.content.childNodes;
}

/**
 * Turn an HTML element into a React element.
 *
 * This code is taken from my own example project: https://github.com/dgroomes/react-playground/blob/8a340e766d6f79be8a33d2581ec21137e8f7ab56/raw-html/src/RawHtmlToReactExample.jsx#L27
 *
 * This uses a recursive algorithm. For illustrative purposes it logs to the console.
 *
 * @param {Element} el
 * @param {function} textNodeHandler - An optional transformer function. Turns a text node into a React element.
 * @return {Array<ReactElement | string | null>}
 */
function elementToReact(el, textNodeHandler) {
    const tagName = el.tagName?.toLowerCase(); // Note: 'React.createElement' prefers lowercase tag names for HTML elements.
    const childNodes = Array.from(el.childNodes);
    if (childNodes.length > 0) {
        const childElementsOrStrings = childNodes
            .flatMap(childNode => elementToReact(childNode, textNodeHandler))
            .filter(el => {
                // In the edge case that we found an unsupported node type, we'll just filter it out.
                return el !== null
            });
        let reactElement = React.createElement(tagName, null, ...childElementsOrStrings);
        return [reactElement];
    } else {
        // This is a "bottom out" point. The recursion stops here. The element is either a text node, a comment node,
        // and maybe some other types. I'm not totally sure. Reference the docs to understand the different node
        // types: https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
        // For simplicity, let's only support text nodes.
        const nodeType = el.nodeType;
        if (nodeType === Node.TEXT_NODE) {
            let textContent = el.textContent;
            if (textNodeHandler) {
                return textNodeHandler(textContent);
            }
            return [textContent];
        } else {
            console.warn(`Unsupported node type: ${nodeType}. Consider improving this function to support this type`);
            return [null];
        }
    }
}

/**
 * Turn raw HTML into a React element. Optionally, include a 'textNodeHandler' function to further transform a text node
 * into more elements (to support highlighting the search results.)
 *
 * The raw HTML (a string) should be given as a child property.
 * @return {React.ReactElement}
 */
export function RawHtml(props) {
    const children = React.Children.toArray(props.children);
    let textNodeHandler;
    if ('textNodeHandler' in props) {
        textNodeHandler = props.textNodeHandler;
    } else {
        textNodeHandler = null;
    }
    const numberOfChildren = children.length;
    if (numberOfChildren === 0) {
        console.error("Expected to find exactly one child element to the 'RawHtml' element but found none.")
        return <></>;
    }
    if (numberOfChildren > 1) {
        console.error(`Expected to find exactly one child element to the 'RawHtml' element but found ${numberOfChildren}.`)
        return <></>;
    }

    const rawHtml = children[0];
    const htmlElements = htmlStringToElements(rawHtml);
    const htmlElementsArray = Array.from(htmlElements);
    const reactElements = htmlElementsArray.map(el => elementToReact(el, textNodeHandler));

    return (<>
        {reactElements}
    </>);
}
