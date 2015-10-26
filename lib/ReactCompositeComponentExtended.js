'use strict';

var helperObj = {};

var ReactCompositeComponent = require('react/lib/ReactCompositeComponent');
var ReactComponent = require('react/lib/ReactComponent');
var mountExtensionPoint = ReactCompositeComponent;
var originalMountComponent = ReactCompositeComponent.Mixin.mountComponent;

mountExtensionPoint.Mixin.mountComponent = function(rootID, transaction, context) {
  var call = originalMountComponent.call(this, rootID, transaction, context);
  var instance = this;
  var props = instance._renderedComponent._currentElement.props;
  if (props && props.__cachedStyles) {
    helperObj.associateToMediaQuery(instance);
  }
  return call;
};

module.exports = helperObj;
