'use strict';

var applyStyles        = require('./applyStyles');

var ReactUpdates       = require('react/lib/ReactUpdates');
var enqueueForceUpdate = require('react/lib/ReactUpdateQueue').enqueueForceUpdate;

var matchMedia = null;
if (typeof window !== 'undefined' && !window.__ReactStyle__) {
  matchMedia = window.matchMedia;
}

function recalcMediaQueryStyles(registeredMediaQueries) {
  for (var i = 0, l = registeredMediaQueries.length; i < l; i++) {
    var registeredMediaQuery = registeredMediaQueries[i];
    var matchesQuery = matchMedia(registeredMediaQuery.query).matches;
    var isActive = registeredMediaQuery.isActive;
    if ((matchesQuery && !isActive) || (!matchesQuery && isActive)) {
      recalcMediaQueryStyle(registeredMediaQuery, registeredMediaQueries);
    }
  }
}

function recalcMediaQueryStyle(registeredMediaQuery, registeredMediaQueries) {
  var applyMediaQueries = require('./applyMediaQueries');

  registeredMediaQuery.isActive = !registeredMediaQuery.isActive;
  var compiledStyleSheet = applyMediaQueries(registeredMediaQueries, registeredMediaQuery.stylesheet, false);
  var elements = registeredMediaQuery.elements;
  var i, l;
  for (i = 0, l = elements.length; i < l; i++) {
    var element = elements[i];
    recalcElementStyles(registeredMediaQuery, element, compiledStyleSheet);
  }

  var styleNames = registeredMediaQuery.styleNames;
  for (i = 0, l = styleNames.length; i < l; i++) {
    var styleName = styleNames[i];
    registeredMediaQuery.compiled[styleName] = compiledStyleSheet[styleName];
  }
}

function recalcElementStyles(registeredMediaQuery, element, newCompiledStyleSheet) {
  var styleSheetNames = registeredMediaQuery.styleNames;
  var oldCompiledStyleSheet = registeredMediaQuery.compiled;
  var oldElementStyles = element._renderedComponent._currentElement.props.__cachedStyles;
  var newElementStyles = [];
  for (var i = 0, l = oldElementStyles.length; i < l; i++) {
    var oldElementStyle = oldElementStyles[i];
    _setElementStyles(
      newElementStyles,
      i,
      oldElementStyle,
      styleSheetNames,
      oldCompiledStyleSheet,
      newCompiledStyleSheet);
  }
  var newProps = {};

  applyStyles(newProps, newElementStyles, 0);

  console.info('Want to set property:', newProps.style);

  var instance = element;


  element._processProps({
    style : newProps.style,
    __cachedStyles: newElementStyles
  });

  //element._renderedComponent._currentElement

  setChildElementStyles(element, styleSheetNames, oldCompiledStyleSheet, newCompiledStyleSheet);


  //console.info('testing: ', newProps.style, element._renderedComponent;
  element._instance.forceUpdate();
}

function setChildElementStyles(element, styleSheetNames, oldCompiledStyleSheet, newCompiledStyleSheet) {
  var children = element._currentElement.props.children;
  if (children) {
    for (var i = 0, l = children.length; i < l; i++) {
      var child = children[i];
      if (child.props && child.props.styles) {
        var newChildStyles = [];
        var childStyles = child.props.styles;
        for (var childStyleIndex = 0, childStylesLength = childStyles.length; childStyleIndex < childStylesLength; childStyleIndex++) {
          var childStyle = childStyles[childStyleIndex];
          _setElementStyles(
            newChildStyles,
            childStyleIndex,
            childStyle,
            styleSheetNames,
            oldCompiledStyleSheet,
            newCompiledStyleSheet
          );
        }
        if ("production" !== process.env.NODE_ENV) {
          if (child._store.originalProps) {
            child._store.originalProps.styles = newChildStyles;
          }
          else {
            child._store.props.styles = newChildStyles;
          }
        }
        child.props.styles = newChildStyles;
      }
    }
  }
}

function _setElementStyles(elementStyles, j, elementStyle, styleSheetNames, oldCompiledStyleSheet, newCompiledStyleSheet) {
  elementStyles[j] = elementStyle;
  if (!elementStyle) {
    return;
  }
  for (var i = 0, l = styleSheetNames.length; i < l; i++) {
    var styleName = styleSheetNames[i];
    var oldCompiledStyle = oldCompiledStyleSheet[styleName];
    var newCompiledStyle = newCompiledStyleSheet[styleName];
    if (oldCompiledStyle === elementStyle) {
      elementStyles[j] = newCompiledStyle;
    }
  }
}

module.exports = recalcMediaQueryStyles;
