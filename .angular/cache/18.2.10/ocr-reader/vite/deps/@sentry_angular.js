import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  ResolveEnd,
  Router
} from "./chunk-LCF2DSZ5.js";
import {
  HttpErrorResponse
} from "./chunk-HATUIYFX.js";
import {
  Directive,
  Inject,
  Injectable,
  Input,
  NgModule,
  Subscription,
  VERSION,
  filter,
  setClassMetadata,
  tap,
  ɵɵdefineDirective,
  ɵɵdefineInjectable,
  ɵɵdefineInjector,
  ɵɵdefineNgModule,
  ɵɵinject
} from "./chunk-ER2UJ62S.js";
import {
  __async,
  __objRest,
  __spreadProps,
  __spreadValues
} from "./chunk-BJWEDLTQ.js";

// node_modules/@sentry/utils/build/esm/is.js
var objectToString = Object.prototype.toString;
function isError(wat) {
  switch (objectToString.call(wat)) {
    case "[object Error]":
    case "[object Exception]":
    case "[object DOMException]":
    case "[object WebAssembly.Exception]":
      return true;
    default:
      return isInstanceOf(wat, Error);
  }
}
function isBuiltin(wat, className) {
  return objectToString.call(wat) === `[object ${className}]`;
}
function isErrorEvent(wat) {
  return isBuiltin(wat, "ErrorEvent");
}
function isDOMError(wat) {
  return isBuiltin(wat, "DOMError");
}
function isDOMException(wat) {
  return isBuiltin(wat, "DOMException");
}
function isString(wat) {
  return isBuiltin(wat, "String");
}
function isParameterizedString(wat) {
  return typeof wat === "object" && wat !== null && "__sentry_template_string__" in wat && "__sentry_template_values__" in wat;
}
function isPrimitive(wat) {
  return wat === null || isParameterizedString(wat) || typeof wat !== "object" && typeof wat !== "function";
}
function isPlainObject(wat) {
  return isBuiltin(wat, "Object");
}
function isEvent(wat) {
  return typeof Event !== "undefined" && isInstanceOf(wat, Event);
}
function isElement(wat) {
  return typeof Element !== "undefined" && isInstanceOf(wat, Element);
}
function isRegExp(wat) {
  return isBuiltin(wat, "RegExp");
}
function isThenable(wat) {
  return Boolean(wat && wat.then && typeof wat.then === "function");
}
function isSyntheticEvent(wat) {
  return isPlainObject(wat) && "nativeEvent" in wat && "preventDefault" in wat && "stopPropagation" in wat;
}
function isInstanceOf(wat, base) {
  try {
    return wat instanceof base;
  } catch (_e) {
    return false;
  }
}
function isVueViewModel(wat) {
  return !!(typeof wat === "object" && wat !== null && (wat.__isVue || wat._isVue));
}

// node_modules/@sentry/utils/build/esm/string.js
function truncate(str, max = 0) {
  if (typeof str !== "string" || max === 0) {
    return str;
  }
  return str.length <= max ? str : `${str.slice(0, max)}...`;
}
function snipLine(line, colno) {
  let newLine = line;
  const lineLength = newLine.length;
  if (lineLength <= 150) {
    return newLine;
  }
  if (colno > lineLength) {
    colno = lineLength;
  }
  let start = Math.max(colno - 60, 0);
  if (start < 5) {
    start = 0;
  }
  let end = Math.min(start + 140, lineLength);
  if (end > lineLength - 5) {
    end = lineLength;
  }
  if (end === lineLength) {
    start = Math.max(end - 140, 0);
  }
  newLine = newLine.slice(start, end);
  if (start > 0) {
    newLine = `'{snip} ${newLine}`;
  }
  if (end < lineLength) {
    newLine += " {snip}";
  }
  return newLine;
}
function safeJoin(input, delimiter) {
  if (!Array.isArray(input)) {
    return "";
  }
  const output = [];
  for (let i2 = 0; i2 < input.length; i2++) {
    const value = input[i2];
    try {
      if (isVueViewModel(value)) {
        output.push("[VueViewModel]");
      } else {
        output.push(String(value));
      }
    } catch (e3) {
      output.push("[value cannot be serialized]");
    }
  }
  return output.join(delimiter);
}
function isMatchingPattern(value, pattern, requireExactStringMatch = false) {
  if (!isString(value)) {
    return false;
  }
  if (isRegExp(pattern)) {
    return pattern.test(value);
  }
  if (isString(pattern)) {
    return requireExactStringMatch ? value === pattern : value.includes(pattern);
  }
  return false;
}
function stringMatchesSomePattern(testString, patterns = [], requireExactStringMatch = false) {
  return patterns.some((pattern) => isMatchingPattern(testString, pattern, requireExactStringMatch));
}

// node_modules/@sentry/utils/build/esm/aggregate-errors.js
function applyAggregateErrorsToEvent(exceptionFromErrorImplementation, parser, maxValueLimit = 250, key, limit, event, hint) {
  if (!event.exception || !event.exception.values || !hint || !isInstanceOf(hint.originalException, Error)) {
    return;
  }
  const originalException = event.exception.values.length > 0 ? event.exception.values[event.exception.values.length - 1] : void 0;
  if (originalException) {
    event.exception.values = truncateAggregateExceptions(aggregateExceptionsFromError(exceptionFromErrorImplementation, parser, limit, hint.originalException, key, event.exception.values, originalException, 0), maxValueLimit);
  }
}
function aggregateExceptionsFromError(exceptionFromErrorImplementation, parser, limit, error, key, prevExceptions, exception, exceptionId) {
  if (prevExceptions.length >= limit + 1) {
    return prevExceptions;
  }
  let newExceptions = [...prevExceptions];
  if (isInstanceOf(error[key], Error)) {
    applyExceptionGroupFieldsForParentException(exception, exceptionId);
    const newException = exceptionFromErrorImplementation(parser, error[key]);
    const newExceptionId = newExceptions.length;
    applyExceptionGroupFieldsForChildException(newException, key, newExceptionId, exceptionId);
    newExceptions = aggregateExceptionsFromError(exceptionFromErrorImplementation, parser, limit, error[key], key, [newException, ...newExceptions], newException, newExceptionId);
  }
  if (Array.isArray(error.errors)) {
    error.errors.forEach((childError, i2) => {
      if (isInstanceOf(childError, Error)) {
        applyExceptionGroupFieldsForParentException(exception, exceptionId);
        const newException = exceptionFromErrorImplementation(parser, childError);
        const newExceptionId = newExceptions.length;
        applyExceptionGroupFieldsForChildException(newException, `errors[${i2}]`, newExceptionId, exceptionId);
        newExceptions = aggregateExceptionsFromError(exceptionFromErrorImplementation, parser, limit, childError, key, [newException, ...newExceptions], newException, newExceptionId);
      }
    });
  }
  return newExceptions;
}
function applyExceptionGroupFieldsForParentException(exception, exceptionId) {
  exception.mechanism = exception.mechanism || {
    type: "generic",
    handled: true
  };
  exception.mechanism = __spreadProps(__spreadValues(__spreadValues({}, exception.mechanism), exception.type === "AggregateError" && {
    is_exception_group: true
  }), {
    exception_id: exceptionId
  });
}
function applyExceptionGroupFieldsForChildException(exception, source, exceptionId, parentId) {
  exception.mechanism = exception.mechanism || {
    type: "generic",
    handled: true
  };
  exception.mechanism = __spreadProps(__spreadValues({}, exception.mechanism), {
    type: "chained",
    source,
    exception_id: exceptionId,
    parent_id: parentId
  });
}
function truncateAggregateExceptions(exceptions, maxValueLength) {
  return exceptions.map((exception) => {
    if (exception.value) {
      exception.value = truncate(exception.value, maxValueLength);
    }
    return exception;
  });
}

// node_modules/@sentry/utils/build/esm/breadcrumb-log-level.js
function getBreadcrumbLogLevelFromHttpStatusCode(statusCode) {
  if (statusCode === void 0) {
    return void 0;
  } else if (statusCode >= 400 && statusCode < 500) {
    return "warning";
  } else if (statusCode >= 500) {
    return "error";
  } else {
    return void 0;
  }
}

// node_modules/@sentry/utils/build/esm/version.js
var SDK_VERSION = "8.35.0";

// node_modules/@sentry/utils/build/esm/worldwide.js
var GLOBAL_OBJ = globalThis;
function getGlobalSingleton(name, creator, obj) {
  const gbl = obj || GLOBAL_OBJ;
  const __SENTRY__ = gbl.__SENTRY__ = gbl.__SENTRY__ || {};
  const versionedCarrier = __SENTRY__[SDK_VERSION] = __SENTRY__[SDK_VERSION] || {};
  return versionedCarrier[name] || (versionedCarrier[name] = creator());
}

// node_modules/@sentry/utils/build/esm/browser.js
var WINDOW = GLOBAL_OBJ;
var DEFAULT_MAX_STRING_LENGTH = 80;
function htmlTreeAsString(elem, options = {}) {
  if (!elem) {
    return "<unknown>";
  }
  try {
    let currentElem = elem;
    const MAX_TRAVERSE_HEIGHT = 5;
    const out = [];
    let height = 0;
    let len = 0;
    const separator = " > ";
    const sepLength = separator.length;
    let nextStr;
    const keyAttrs = Array.isArray(options) ? options : options.keyAttrs;
    const maxStringLength = !Array.isArray(options) && options.maxStringLength || DEFAULT_MAX_STRING_LENGTH;
    while (currentElem && height++ < MAX_TRAVERSE_HEIGHT) {
      nextStr = _htmlElementAsString(currentElem, keyAttrs);
      if (nextStr === "html" || height > 1 && len + out.length * sepLength + nextStr.length >= maxStringLength) {
        break;
      }
      out.push(nextStr);
      len += nextStr.length;
      currentElem = currentElem.parentNode;
    }
    return out.reverse().join(separator);
  } catch (_oO) {
    return "<unknown>";
  }
}
function _htmlElementAsString(el, keyAttrs) {
  const elem = el;
  const out = [];
  if (!elem || !elem.tagName) {
    return "";
  }
  if (WINDOW.HTMLElement) {
    if (elem instanceof HTMLElement && elem.dataset) {
      if (elem.dataset["sentryComponent"]) {
        return elem.dataset["sentryComponent"];
      }
      if (elem.dataset["sentryElement"]) {
        return elem.dataset["sentryElement"];
      }
    }
  }
  out.push(elem.tagName.toLowerCase());
  const keyAttrPairs = keyAttrs && keyAttrs.length ? keyAttrs.filter((keyAttr) => elem.getAttribute(keyAttr)).map((keyAttr) => [keyAttr, elem.getAttribute(keyAttr)]) : null;
  if (keyAttrPairs && keyAttrPairs.length) {
    keyAttrPairs.forEach((keyAttrPair) => {
      out.push(`[${keyAttrPair[0]}="${keyAttrPair[1]}"]`);
    });
  } else {
    if (elem.id) {
      out.push(`#${elem.id}`);
    }
    const className = elem.className;
    if (className && isString(className)) {
      const classes = className.split(/\s+/);
      for (const c2 of classes) {
        out.push(`.${c2}`);
      }
    }
  }
  const allowedAttrs = ["aria-label", "type", "name", "title", "alt"];
  for (const k2 of allowedAttrs) {
    const attr = elem.getAttribute(k2);
    if (attr) {
      out.push(`[${k2}="${attr}"]`);
    }
  }
  return out.join("");
}
function getLocationHref() {
  try {
    return WINDOW.document.location.href;
  } catch (oO) {
    return "";
  }
}
function getDomElement(selector) {
  if (WINDOW.document && WINDOW.document.querySelector) {
    return WINDOW.document.querySelector(selector);
  }
  return null;
}
function getComponentName(elem) {
  if (!WINDOW.HTMLElement) {
    return null;
  }
  let currentElem = elem;
  const MAX_TRAVERSE_HEIGHT = 5;
  for (let i2 = 0; i2 < MAX_TRAVERSE_HEIGHT; i2++) {
    if (!currentElem) {
      return null;
    }
    if (currentElem instanceof HTMLElement) {
      if (currentElem.dataset["sentryComponent"]) {
        return currentElem.dataset["sentryComponent"];
      }
      if (currentElem.dataset["sentryElement"]) {
        return currentElem.dataset["sentryElement"];
      }
    }
    currentElem = currentElem.parentNode;
  }
  return null;
}

// node_modules/@sentry/utils/build/esm/debug-build.js
var DEBUG_BUILD = typeof __SENTRY_DEBUG__ === "undefined" || __SENTRY_DEBUG__;

// node_modules/@sentry/utils/build/esm/logger.js
var PREFIX = "Sentry Logger ";
var CONSOLE_LEVELS = ["debug", "info", "warn", "error", "log", "assert", "trace"];
var originalConsoleMethods = {};
function consoleSandbox(callback) {
  if (!("console" in GLOBAL_OBJ)) {
    return callback();
  }
  const console2 = GLOBAL_OBJ.console;
  const wrappedFuncs = {};
  const wrappedLevels = Object.keys(originalConsoleMethods);
  wrappedLevels.forEach((level) => {
    const originalConsoleMethod = originalConsoleMethods[level];
    wrappedFuncs[level] = console2[level];
    console2[level] = originalConsoleMethod;
  });
  try {
    return callback();
  } finally {
    wrappedLevels.forEach((level) => {
      console2[level] = wrappedFuncs[level];
    });
  }
}
function makeLogger() {
  let enabled = false;
  const logger3 = {
    enable: () => {
      enabled = true;
    },
    disable: () => {
      enabled = false;
    },
    isEnabled: () => enabled
  };
  if (DEBUG_BUILD) {
    CONSOLE_LEVELS.forEach((name) => {
      logger3[name] = (...args) => {
        if (enabled) {
          consoleSandbox(() => {
            GLOBAL_OBJ.console[name](`${PREFIX}[${name}]:`, ...args);
          });
        }
      };
    });
  } else {
    CONSOLE_LEVELS.forEach((name) => {
      logger3[name] = () => void 0;
    });
  }
  return logger3;
}
var logger = getGlobalSingleton("logger", makeLogger);

// node_modules/@sentry/utils/build/esm/dsn.js
var DSN_REGEX = /^(?:(\w+):)\/\/(?:(\w+)(?::(\w+)?)?@)([\w.-]+)(?::(\d+))?\/(.+)/;
function isValidProtocol(protocol) {
  return protocol === "http" || protocol === "https";
}
function dsnToString(dsn, withPassword = false) {
  const {
    host,
    path,
    pass,
    port,
    projectId,
    protocol,
    publicKey
  } = dsn;
  return `${protocol}://${publicKey}${withPassword && pass ? `:${pass}` : ""}@${host}${port ? `:${port}` : ""}/${path ? `${path}/` : path}${projectId}`;
}
function dsnFromString(str) {
  const match = DSN_REGEX.exec(str);
  if (!match) {
    consoleSandbox(() => {
      console.error(`Invalid Sentry Dsn: ${str}`);
    });
    return void 0;
  }
  const [protocol, publicKey, pass = "", host = "", port = "", lastPath = ""] = match.slice(1);
  let path = "";
  let projectId = lastPath;
  const split = projectId.split("/");
  if (split.length > 1) {
    path = split.slice(0, -1).join("/");
    projectId = split.pop();
  }
  if (projectId) {
    const projectMatch = projectId.match(/^\d+/);
    if (projectMatch) {
      projectId = projectMatch[0];
    }
  }
  return dsnFromComponents({
    host,
    pass,
    path,
    projectId,
    port,
    protocol,
    publicKey
  });
}
function dsnFromComponents(components) {
  return {
    protocol: components.protocol,
    publicKey: components.publicKey || "",
    pass: components.pass || "",
    host: components.host,
    port: components.port || "",
    path: components.path || "",
    projectId: components.projectId
  };
}
function validateDsn(dsn) {
  if (!DEBUG_BUILD) {
    return true;
  }
  const {
    port,
    projectId,
    protocol
  } = dsn;
  const requiredComponents = ["protocol", "publicKey", "host", "projectId"];
  const hasMissingRequiredComponent = requiredComponents.find((component) => {
    if (!dsn[component]) {
      logger.error(`Invalid Sentry Dsn: ${component} missing`);
      return true;
    }
    return false;
  });
  if (hasMissingRequiredComponent) {
    return false;
  }
  if (!projectId.match(/^\d+$/)) {
    logger.error(`Invalid Sentry Dsn: Invalid projectId ${projectId}`);
    return false;
  }
  if (!isValidProtocol(protocol)) {
    logger.error(`Invalid Sentry Dsn: Invalid protocol ${protocol}`);
    return false;
  }
  if (port && isNaN(parseInt(port, 10))) {
    logger.error(`Invalid Sentry Dsn: Invalid port ${port}`);
    return false;
  }
  return true;
}
function makeDsn(from) {
  const components = typeof from === "string" ? dsnFromString(from) : dsnFromComponents(from);
  if (!components || !validateDsn(components)) {
    return void 0;
  }
  return components;
}

// node_modules/@sentry/utils/build/esm/error.js
var SentryError = class extends Error {
  /** Display name of this error instance. */
  constructor(message, logLevel = "warn") {
    super(message);
    this.message = message;
    this.name = new.target.prototype.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
    this.logLevel = logLevel;
  }
};

// node_modules/@sentry/utils/build/esm/object.js
function fill(source, name, replacementFactory) {
  if (!(name in source)) {
    return;
  }
  const original = source[name];
  const wrapped = replacementFactory(original);
  if (typeof wrapped === "function") {
    markFunctionWrapped(wrapped, original);
  }
  source[name] = wrapped;
}
function addNonEnumerableProperty(obj, name, value) {
  try {
    Object.defineProperty(obj, name, {
      // enumerable: false, // the default, so we can save on bundle size by not explicitly setting it
      value,
      writable: true,
      configurable: true
    });
  } catch (o_O) {
    DEBUG_BUILD && logger.log(`Failed to add non-enumerable property "${name}" to object`, obj);
  }
}
function markFunctionWrapped(wrapped, original) {
  try {
    const proto = original.prototype || {};
    wrapped.prototype = original.prototype = proto;
    addNonEnumerableProperty(wrapped, "__sentry_original__", original);
  } catch (o_O) {
  }
}
function getOriginalFunction(func) {
  return func.__sentry_original__;
}
function urlEncode(object) {
  return Object.keys(object).map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(object[key])}`).join("&");
}
function convertToPlainObject(value) {
  if (isError(value)) {
    return __spreadValues({
      message: value.message,
      name: value.name,
      stack: value.stack
    }, getOwnProperties(value));
  } else if (isEvent(value)) {
    const newObj = __spreadValues({
      type: value.type,
      target: serializeEventTarget(value.target),
      currentTarget: serializeEventTarget(value.currentTarget)
    }, getOwnProperties(value));
    if (typeof CustomEvent !== "undefined" && isInstanceOf(value, CustomEvent)) {
      newObj.detail = value.detail;
    }
    return newObj;
  } else {
    return value;
  }
}
function serializeEventTarget(target) {
  try {
    return isElement(target) ? htmlTreeAsString(target) : Object.prototype.toString.call(target);
  } catch (_oO) {
    return "<unknown>";
  }
}
function getOwnProperties(obj) {
  if (typeof obj === "object" && obj !== null) {
    const extractedProps = {};
    for (const property in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, property)) {
        extractedProps[property] = obj[property];
      }
    }
    return extractedProps;
  } else {
    return {};
  }
}
function extractExceptionKeysForMessage(exception, maxLength = 40) {
  const keys2 = Object.keys(convertToPlainObject(exception));
  keys2.sort();
  const firstKey = keys2[0];
  if (!firstKey) {
    return "[object has no keys]";
  }
  if (firstKey.length >= maxLength) {
    return truncate(firstKey, maxLength);
  }
  for (let includedKeys = keys2.length; includedKeys > 0; includedKeys--) {
    const serialized = keys2.slice(0, includedKeys).join(", ");
    if (serialized.length > maxLength) {
      continue;
    }
    if (includedKeys === keys2.length) {
      return serialized;
    }
    return truncate(serialized, maxLength);
  }
  return "";
}
function dropUndefinedKeys(inputValue) {
  const memoizationMap = /* @__PURE__ */ new Map();
  return _dropUndefinedKeys(inputValue, memoizationMap);
}
function _dropUndefinedKeys(inputValue, memoizationMap) {
  if (isPojo(inputValue)) {
    const memoVal = memoizationMap.get(inputValue);
    if (memoVal !== void 0) {
      return memoVal;
    }
    const returnValue = {};
    memoizationMap.set(inputValue, returnValue);
    for (const key of Object.getOwnPropertyNames(inputValue)) {
      if (typeof inputValue[key] !== "undefined") {
        returnValue[key] = _dropUndefinedKeys(inputValue[key], memoizationMap);
      }
    }
    return returnValue;
  }
  if (Array.isArray(inputValue)) {
    const memoVal = memoizationMap.get(inputValue);
    if (memoVal !== void 0) {
      return memoVal;
    }
    const returnValue = [];
    memoizationMap.set(inputValue, returnValue);
    inputValue.forEach((item) => {
      returnValue.push(_dropUndefinedKeys(item, memoizationMap));
    });
    return returnValue;
  }
  return inputValue;
}
function isPojo(input) {
  if (!isPlainObject(input)) {
    return false;
  }
  try {
    const name = Object.getPrototypeOf(input).constructor.name;
    return !name || name === "Object";
  } catch (e3) {
    return true;
  }
}

// node_modules/@sentry/utils/build/esm/stacktrace.js
var STACKTRACE_FRAME_LIMIT = 50;
var UNKNOWN_FUNCTION = "?";
var WEBPACK_ERROR_REGEXP = /\(error: (.*)\)/;
var STRIP_FRAME_REGEXP = /captureMessage|captureException/;
function createStackParser(...parsers) {
  const sortedParsers = parsers.sort((a2, b2) => a2[0] - b2[0]).map((p2) => p2[1]);
  return (stack, skipFirstLines = 0, framesToPop = 0) => {
    const frames = [];
    const lines = stack.split("\n");
    for (let i2 = skipFirstLines; i2 < lines.length; i2++) {
      const line = lines[i2];
      if (line.length > 1024) {
        continue;
      }
      const cleanedLine = WEBPACK_ERROR_REGEXP.test(line) ? line.replace(WEBPACK_ERROR_REGEXP, "$1") : line;
      if (cleanedLine.match(/\S*Error: /)) {
        continue;
      }
      for (const parser of sortedParsers) {
        const frame = parser(cleanedLine);
        if (frame) {
          frames.push(frame);
          break;
        }
      }
      if (frames.length >= STACKTRACE_FRAME_LIMIT + framesToPop) {
        break;
      }
    }
    return stripSentryFramesAndReverse(frames.slice(framesToPop));
  };
}
function stackParserFromStackParserOptions(stackParser) {
  if (Array.isArray(stackParser)) {
    return createStackParser(...stackParser);
  }
  return stackParser;
}
function stripSentryFramesAndReverse(stack) {
  if (!stack.length) {
    return [];
  }
  const localStack = Array.from(stack);
  if (/sentryWrapped/.test(getLastStackFrame(localStack).function || "")) {
    localStack.pop();
  }
  localStack.reverse();
  if (STRIP_FRAME_REGEXP.test(getLastStackFrame(localStack).function || "")) {
    localStack.pop();
    if (STRIP_FRAME_REGEXP.test(getLastStackFrame(localStack).function || "")) {
      localStack.pop();
    }
  }
  return localStack.slice(0, STACKTRACE_FRAME_LIMIT).map((frame) => __spreadProps(__spreadValues({}, frame), {
    filename: frame.filename || getLastStackFrame(localStack).filename,
    function: frame.function || UNKNOWN_FUNCTION
  }));
}
function getLastStackFrame(arr) {
  return arr[arr.length - 1] || {};
}
var defaultFunctionName = "<anonymous>";
function getFunctionName(fn) {
  try {
    if (!fn || typeof fn !== "function") {
      return defaultFunctionName;
    }
    return fn.name || defaultFunctionName;
  } catch (e3) {
    return defaultFunctionName;
  }
}
function getFramesFromEvent(event) {
  const exception = event.exception;
  if (exception) {
    const frames = [];
    try {
      exception.values.forEach((value) => {
        if (value.stacktrace.frames) {
          frames.push(...value.stacktrace.frames);
        }
      });
      return frames;
    } catch (_oO) {
      return void 0;
    }
  }
  return void 0;
}

// node_modules/@sentry/utils/build/esm/instrument/handlers.js
var handlers = {};
var instrumented = {};
function addHandler(type, handler) {
  handlers[type] = handlers[type] || [];
  handlers[type].push(handler);
}
function maybeInstrument(type, instrumentFn) {
  if (!instrumented[type]) {
    instrumentFn();
    instrumented[type] = true;
  }
}
function triggerHandlers(type, data) {
  const typeHandlers = type && handlers[type];
  if (!typeHandlers) {
    return;
  }
  for (const handler of typeHandlers) {
    try {
      handler(data);
    } catch (e3) {
      DEBUG_BUILD && logger.error(`Error while triggering instrumentation handler.
Type: ${type}
Name: ${getFunctionName(handler)}
Error:`, e3);
    }
  }
}

// node_modules/@sentry/utils/build/esm/instrument/console.js
function addConsoleInstrumentationHandler(handler) {
  const type = "console";
  addHandler(type, handler);
  maybeInstrument(type, instrumentConsole);
}
function instrumentConsole() {
  if (!("console" in GLOBAL_OBJ)) {
    return;
  }
  CONSOLE_LEVELS.forEach(function(level) {
    if (!(level in GLOBAL_OBJ.console)) {
      return;
    }
    fill(GLOBAL_OBJ.console, level, function(originalConsoleMethod) {
      originalConsoleMethods[level] = originalConsoleMethod;
      return function(...args) {
        const handlerData = {
          args,
          level
        };
        triggerHandlers("console", handlerData);
        const log = originalConsoleMethods[level];
        log && log.apply(GLOBAL_OBJ.console, args);
      };
    });
  });
}

// node_modules/@sentry/utils/build/esm/supports.js
var WINDOW2 = GLOBAL_OBJ;
function supportsFetch() {
  if (!("fetch" in WINDOW2)) {
    return false;
  }
  try {
    new Headers();
    new Request("http://www.example.com");
    new Response();
    return true;
  } catch (e3) {
    return false;
  }
}
function isNativeFunction(func) {
  return func && /^function\s+\w+\(\)\s+\{\s+\[native code\]\s+\}$/.test(func.toString());
}
function supportsNativeFetch() {
  if (typeof EdgeRuntime === "string") {
    return true;
  }
  if (!supportsFetch()) {
    return false;
  }
  if (isNativeFunction(WINDOW2.fetch)) {
    return true;
  }
  let result = false;
  const doc = WINDOW2.document;
  if (doc && typeof doc.createElement === "function") {
    try {
      const sandbox = doc.createElement("iframe");
      sandbox.hidden = true;
      doc.head.appendChild(sandbox);
      if (sandbox.contentWindow && sandbox.contentWindow.fetch) {
        result = isNativeFunction(sandbox.contentWindow.fetch);
      }
      doc.head.removeChild(sandbox);
    } catch (err) {
      DEBUG_BUILD && logger.warn("Could not create sandbox iframe for pure fetch check, bailing to window.fetch: ", err);
    }
  }
  return result;
}
function supportsReportingObserver() {
  return "ReportingObserver" in WINDOW2;
}

// node_modules/@sentry/utils/build/esm/time.js
var ONE_SECOND_IN_MS = 1e3;
function dateTimestampInSeconds() {
  return Date.now() / ONE_SECOND_IN_MS;
}
function createUnixTimestampInSecondsFunc() {
  const {
    performance: performance2
  } = GLOBAL_OBJ;
  if (!performance2 || !performance2.now) {
    return dateTimestampInSeconds;
  }
  const approxStartingTimeOrigin = Date.now() - performance2.now();
  const timeOrigin = performance2.timeOrigin == void 0 ? approxStartingTimeOrigin : performance2.timeOrigin;
  return () => {
    return (timeOrigin + performance2.now()) / ONE_SECOND_IN_MS;
  };
}
var timestampInSeconds = createUnixTimestampInSecondsFunc();
var _browserPerformanceTimeOriginMode;
var browserPerformanceTimeOrigin = (() => {
  const {
    performance: performance2
  } = GLOBAL_OBJ;
  if (!performance2 || !performance2.now) {
    _browserPerformanceTimeOriginMode = "none";
    return void 0;
  }
  const threshold = 3600 * 1e3;
  const performanceNow = performance2.now();
  const dateNow = Date.now();
  const timeOriginDelta = performance2.timeOrigin ? Math.abs(performance2.timeOrigin + performanceNow - dateNow) : threshold;
  const timeOriginIsReliable = timeOriginDelta < threshold;
  const navigationStart = performance2.timing && performance2.timing.navigationStart;
  const hasNavigationStart = typeof navigationStart === "number";
  const navigationStartDelta = hasNavigationStart ? Math.abs(navigationStart + performanceNow - dateNow) : threshold;
  const navigationStartIsReliable = navigationStartDelta < threshold;
  if (timeOriginIsReliable || navigationStartIsReliable) {
    if (timeOriginDelta <= navigationStartDelta) {
      _browserPerformanceTimeOriginMode = "timeOrigin";
      return performance2.timeOrigin;
    } else {
      _browserPerformanceTimeOriginMode = "navigationStart";
      return navigationStart;
    }
  }
  _browserPerformanceTimeOriginMode = "dateNow";
  return dateNow;
})();

// node_modules/@sentry/utils/build/esm/instrument/fetch.js
function addFetchInstrumentationHandler(handler, skipNativeFetchCheck) {
  const type = "fetch";
  addHandler(type, handler);
  maybeInstrument(type, () => instrumentFetch(void 0, skipNativeFetchCheck));
}
function addFetchEndInstrumentationHandler(handler) {
  const type = "fetch-body-resolved";
  addHandler(type, handler);
  maybeInstrument(type, () => instrumentFetch(streamHandler));
}
function instrumentFetch(onFetchResolved, skipNativeFetchCheck = false) {
  if (skipNativeFetchCheck && !supportsNativeFetch()) {
    return;
  }
  fill(GLOBAL_OBJ, "fetch", function(originalFetch) {
    return function(...args) {
      const {
        method,
        url
      } = parseFetchArgs(args);
      const handlerData = {
        args,
        fetchData: {
          method,
          url
        },
        startTimestamp: timestampInSeconds() * 1e3
      };
      if (!onFetchResolved) {
        triggerHandlers("fetch", __spreadValues({}, handlerData));
      }
      const virtualStackTrace = new Error().stack;
      return originalFetch.apply(GLOBAL_OBJ, args).then((response) => __async(this, null, function* () {
        if (onFetchResolved) {
          onFetchResolved(response);
        } else {
          triggerHandlers("fetch", __spreadProps(__spreadValues({}, handlerData), {
            endTimestamp: timestampInSeconds() * 1e3,
            response
          }));
        }
        return response;
      }), (error) => {
        triggerHandlers("fetch", __spreadProps(__spreadValues({}, handlerData), {
          endTimestamp: timestampInSeconds() * 1e3,
          error
        }));
        if (isError(error) && error.stack === void 0) {
          error.stack = virtualStackTrace;
          addNonEnumerableProperty(error, "framesToPop", 1);
        }
        throw error;
      });
    };
  });
}
function resolveResponse(res, onFinishedResolving) {
  return __async(this, null, function* () {
    if (res && res.body) {
      const body = res.body;
      const responseReader = body.getReader();
      const maxFetchDurationTimeout = setTimeout(
        () => {
          body.cancel().then(null, () => {
          });
        },
        90 * 1e3
        // 90s
      );
      let readingActive = true;
      while (readingActive) {
        let chunkTimeout;
        try {
          chunkTimeout = setTimeout(() => {
            body.cancel().then(null, () => {
            });
          }, 5e3);
          const {
            done
          } = yield responseReader.read();
          clearTimeout(chunkTimeout);
          if (done) {
            onFinishedResolving();
            readingActive = false;
          }
        } catch (error) {
          readingActive = false;
        } finally {
          clearTimeout(chunkTimeout);
        }
      }
      clearTimeout(maxFetchDurationTimeout);
      responseReader.releaseLock();
      body.cancel().then(null, () => {
      });
    }
  });
}
function streamHandler(response) {
  let clonedResponseForResolving;
  try {
    clonedResponseForResolving = response.clone();
  } catch (e3) {
    return;
  }
  resolveResponse(clonedResponseForResolving, () => {
    triggerHandlers("fetch-body-resolved", {
      endTimestamp: timestampInSeconds() * 1e3,
      response
    });
  });
}
function hasProp(obj, prop) {
  return !!obj && typeof obj === "object" && !!obj[prop];
}
function getUrlFromResource(resource) {
  if (typeof resource === "string") {
    return resource;
  }
  if (!resource) {
    return "";
  }
  if (hasProp(resource, "url")) {
    return resource.url;
  }
  if (resource.toString) {
    return resource.toString();
  }
  return "";
}
function parseFetchArgs(fetchArgs) {
  if (fetchArgs.length === 0) {
    return {
      method: "GET",
      url: ""
    };
  }
  if (fetchArgs.length === 2) {
    const [url, options] = fetchArgs;
    return {
      url: getUrlFromResource(url),
      method: hasProp(options, "method") ? String(options.method).toUpperCase() : "GET"
    };
  }
  const arg = fetchArgs[0];
  return {
    url: getUrlFromResource(arg),
    method: hasProp(arg, "method") ? String(arg.method).toUpperCase() : "GET"
  };
}

// node_modules/@sentry/utils/build/esm/instrument/globalError.js
var _oldOnErrorHandler = null;
function addGlobalErrorInstrumentationHandler(handler) {
  const type = "error";
  addHandler(type, handler);
  maybeInstrument(type, instrumentError);
}
function instrumentError() {
  _oldOnErrorHandler = GLOBAL_OBJ.onerror;
  GLOBAL_OBJ.onerror = function(msg, url, line, column, error) {
    const handlerData = {
      column,
      error,
      line,
      msg,
      url
    };
    triggerHandlers("error", handlerData);
    if (_oldOnErrorHandler && !_oldOnErrorHandler.__SENTRY_LOADER__) {
      return _oldOnErrorHandler.apply(this, arguments);
    }
    return false;
  };
  GLOBAL_OBJ.onerror.__SENTRY_INSTRUMENTED__ = true;
}

// node_modules/@sentry/utils/build/esm/instrument/globalUnhandledRejection.js
var _oldOnUnhandledRejectionHandler = null;
function addGlobalUnhandledRejectionInstrumentationHandler(handler) {
  const type = "unhandledrejection";
  addHandler(type, handler);
  maybeInstrument(type, instrumentUnhandledRejection);
}
function instrumentUnhandledRejection() {
  _oldOnUnhandledRejectionHandler = GLOBAL_OBJ.onunhandledrejection;
  GLOBAL_OBJ.onunhandledrejection = function(e3) {
    const handlerData = e3;
    triggerHandlers("unhandledrejection", handlerData);
    if (_oldOnUnhandledRejectionHandler && !_oldOnUnhandledRejectionHandler.__SENTRY_LOADER__) {
      return _oldOnUnhandledRejectionHandler.apply(this, arguments);
    }
    return true;
  };
  GLOBAL_OBJ.onunhandledrejection.__SENTRY_INSTRUMENTED__ = true;
}

// node_modules/@sentry/utils/build/esm/env.js
function isBrowserBundle() {
  return typeof __SENTRY_BROWSER_BUNDLE__ !== "undefined" && !!__SENTRY_BROWSER_BUNDLE__;
}
function getSDKSource() {
  return "npm";
}

// node_modules/@sentry/utils/build/esm/node.js
function isNodeEnv() {
  return !isBrowserBundle() && Object.prototype.toString.call(typeof process !== "undefined" ? process : 0) === "[object process]";
}

// node_modules/@sentry/utils/build/esm/isBrowser.js
function isBrowser() {
  return typeof window !== "undefined" && (!isNodeEnv() || isElectronNodeRenderer());
}
function isElectronNodeRenderer() {
  return (
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    GLOBAL_OBJ.process !== void 0 && GLOBAL_OBJ.process.type === "renderer"
  );
}

// node_modules/@sentry/utils/build/esm/memo.js
function memoBuilder() {
  const hasWeakSet = typeof WeakSet === "function";
  const inner = hasWeakSet ? /* @__PURE__ */ new WeakSet() : [];
  function memoize(obj) {
    if (hasWeakSet) {
      if (inner.has(obj)) {
        return true;
      }
      inner.add(obj);
      return false;
    }
    for (let i2 = 0; i2 < inner.length; i2++) {
      const value = inner[i2];
      if (value === obj) {
        return true;
      }
    }
    inner.push(obj);
    return false;
  }
  function unmemoize(obj) {
    if (hasWeakSet) {
      inner.delete(obj);
    } else {
      for (let i2 = 0; i2 < inner.length; i2++) {
        if (inner[i2] === obj) {
          inner.splice(i2, 1);
          break;
        }
      }
    }
  }
  return [memoize, unmemoize];
}

// node_modules/@sentry/utils/build/esm/misc.js
function uuid4() {
  const gbl = GLOBAL_OBJ;
  const crypto = gbl.crypto || gbl.msCrypto;
  let getRandomByte = () => Math.random() * 16;
  try {
    if (crypto && crypto.randomUUID) {
      return crypto.randomUUID().replace(/-/g, "");
    }
    if (crypto && crypto.getRandomValues) {
      getRandomByte = () => {
        const typedArray = new Uint8Array(1);
        crypto.getRandomValues(typedArray);
        return typedArray[0];
      };
    }
  } catch (_2) {
  }
  return ("10000000100040008000" + 1e11).replace(/[018]/g, (c2) => (
    // eslint-disable-next-line no-bitwise
    (c2 ^ (getRandomByte() & 15) >> c2 / 4).toString(16)
  ));
}
function getFirstException(event) {
  return event.exception && event.exception.values ? event.exception.values[0] : void 0;
}
function getEventDescription(event) {
  const {
    message,
    event_id: eventId
  } = event;
  if (message) {
    return message;
  }
  const firstException = getFirstException(event);
  if (firstException) {
    if (firstException.type && firstException.value) {
      return `${firstException.type}: ${firstException.value}`;
    }
    return firstException.type || firstException.value || eventId || "<unknown>";
  }
  return eventId || "<unknown>";
}
function addExceptionTypeValue(event, value, type) {
  const exception = event.exception = event.exception || {};
  const values = exception.values = exception.values || [];
  const firstException = values[0] = values[0] || {};
  if (!firstException.value) {
    firstException.value = value || "";
  }
  if (!firstException.type) {
    firstException.type = type || "Error";
  }
}
function addExceptionMechanism(event, newMechanism) {
  const firstException = getFirstException(event);
  if (!firstException) {
    return;
  }
  const defaultMechanism = {
    type: "generic",
    handled: true
  };
  const currentMechanism = firstException.mechanism;
  firstException.mechanism = __spreadValues(__spreadValues(__spreadValues({}, defaultMechanism), currentMechanism), newMechanism);
  if (newMechanism && "data" in newMechanism) {
    const mergedData = __spreadValues(__spreadValues({}, currentMechanism && currentMechanism.data), newMechanism.data);
    firstException.mechanism.data = mergedData;
  }
}
function addContextToFrame(lines, frame, linesOfContext = 5) {
  if (frame.lineno === void 0) {
    return;
  }
  const maxLines = lines.length;
  const sourceLine = Math.max(Math.min(maxLines - 1, frame.lineno - 1), 0);
  frame.pre_context = lines.slice(Math.max(0, sourceLine - linesOfContext), sourceLine).map((line) => snipLine(line, 0));
  const lineIndex = Math.min(maxLines - 1, sourceLine);
  frame.context_line = snipLine(lines[lineIndex], frame.colno || 0);
  frame.post_context = lines.slice(Math.min(sourceLine + 1, maxLines), sourceLine + 1 + linesOfContext).map((line) => snipLine(line, 0));
}
function checkOrSetAlreadyCaught(exception) {
  if (exception && exception.__sentry_captured__) {
    return true;
  }
  try {
    addNonEnumerableProperty(exception, "__sentry_captured__", true);
  } catch (err) {
  }
  return false;
}
function arrayify(maybeArray) {
  return Array.isArray(maybeArray) ? maybeArray : [maybeArray];
}

// node_modules/@sentry/utils/build/esm/normalize.js
function normalize(input, depth = 100, maxProperties = Infinity) {
  try {
    return visit("", input, depth, maxProperties);
  } catch (err) {
    return {
      ERROR: `**non-serializable** (${err})`
    };
  }
}
function normalizeToSize(object, depth = 3, maxSize = 100 * 1024) {
  const normalized = normalize(object, depth);
  if (jsonSize(normalized) > maxSize) {
    return normalizeToSize(object, depth - 1, maxSize);
  }
  return normalized;
}
function visit(key, value, depth = Infinity, maxProperties = Infinity, memo = memoBuilder()) {
  const [memoize, unmemoize] = memo;
  if (value == null || // this matches null and undefined -> eqeq not eqeqeq
  ["boolean", "string"].includes(typeof value) || typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  const stringified = stringifyValue(key, value);
  if (!stringified.startsWith("[object ")) {
    return stringified;
  }
  if (value["__sentry_skip_normalization__"]) {
    return value;
  }
  const remainingDepth = typeof value["__sentry_override_normalization_depth__"] === "number" ? value["__sentry_override_normalization_depth__"] : depth;
  if (remainingDepth === 0) {
    return stringified.replace("object ", "");
  }
  if (memoize(value)) {
    return "[Circular ~]";
  }
  const valueWithToJSON = value;
  if (valueWithToJSON && typeof valueWithToJSON.toJSON === "function") {
    try {
      const jsonValue = valueWithToJSON.toJSON();
      return visit("", jsonValue, remainingDepth - 1, maxProperties, memo);
    } catch (err) {
    }
  }
  const normalized = Array.isArray(value) ? [] : {};
  let numAdded = 0;
  const visitable = convertToPlainObject(value);
  for (const visitKey in visitable) {
    if (!Object.prototype.hasOwnProperty.call(visitable, visitKey)) {
      continue;
    }
    if (numAdded >= maxProperties) {
      normalized[visitKey] = "[MaxProperties ~]";
      break;
    }
    const visitValue = visitable[visitKey];
    normalized[visitKey] = visit(visitKey, visitValue, remainingDepth - 1, maxProperties, memo);
    numAdded++;
  }
  unmemoize(value);
  return normalized;
}
function stringifyValue(key, value) {
  try {
    if (key === "domain" && value && typeof value === "object" && value._events) {
      return "[Domain]";
    }
    if (key === "domainEmitter") {
      return "[DomainEmitter]";
    }
    if (typeof global !== "undefined" && value === global) {
      return "[Global]";
    }
    if (typeof window !== "undefined" && value === window) {
      return "[Window]";
    }
    if (typeof document !== "undefined" && value === document) {
      return "[Document]";
    }
    if (isVueViewModel(value)) {
      return "[VueViewModel]";
    }
    if (isSyntheticEvent(value)) {
      return "[SyntheticEvent]";
    }
    if (typeof value === "number" && !Number.isFinite(value)) {
      return `[${value}]`;
    }
    if (typeof value === "function") {
      return `[Function: ${getFunctionName(value)}]`;
    }
    if (typeof value === "symbol") {
      return `[${String(value)}]`;
    }
    if (typeof value === "bigint") {
      return `[BigInt: ${String(value)}]`;
    }
    const objName = getConstructorName(value);
    if (/^HTML(\w*)Element$/.test(objName)) {
      return `[HTMLElement: ${objName}]`;
    }
    return `[object ${objName}]`;
  } catch (err) {
    return `**non-serializable** (${err})`;
  }
}
function getConstructorName(value) {
  const prototype = Object.getPrototypeOf(value);
  return prototype ? prototype.constructor.name : "null prototype";
}
function utf8Length(value) {
  return ~-encodeURI(value).split(/%..|./).length;
}
function jsonSize(value) {
  return utf8Length(JSON.stringify(value));
}

// node_modules/@sentry/utils/build/esm/path.js
function normalizeArray(parts, allowAboveRoot) {
  let up = 0;
  for (let i2 = parts.length - 1; i2 >= 0; i2--) {
    const last = parts[i2];
    if (last === ".") {
      parts.splice(i2, 1);
    } else if (last === "..") {
      parts.splice(i2, 1);
      up++;
    } else if (up) {
      parts.splice(i2, 1);
      up--;
    }
  }
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift("..");
    }
  }
  return parts;
}
var splitPathRe = /^(\S+:\\|\/?)([\s\S]*?)((?:\.{1,2}|[^/\\]+?|)(\.[^./\\]*|))(?:[/\\]*)$/;
function splitPath(filename) {
  const truncated = filename.length > 1024 ? `<truncated>${filename.slice(-1024)}` : filename;
  const parts = splitPathRe.exec(truncated);
  return parts ? parts.slice(1) : [];
}
function resolve(...args) {
  let resolvedPath = "";
  let resolvedAbsolute = false;
  for (let i2 = args.length - 1; i2 >= -1 && !resolvedAbsolute; i2--) {
    const path = i2 >= 0 ? args[i2] : "/";
    if (!path) {
      continue;
    }
    resolvedPath = `${path}/${resolvedPath}`;
    resolvedAbsolute = path.charAt(0) === "/";
  }
  resolvedPath = normalizeArray(resolvedPath.split("/").filter((p2) => !!p2), !resolvedAbsolute).join("/");
  return (resolvedAbsolute ? "/" : "") + resolvedPath || ".";
}
function trim(arr) {
  let start = 0;
  for (; start < arr.length; start++) {
    if (arr[start] !== "") {
      break;
    }
  }
  let end = arr.length - 1;
  for (; end >= 0; end--) {
    if (arr[end] !== "") {
      break;
    }
  }
  if (start > end) {
    return [];
  }
  return arr.slice(start, end - start + 1);
}
function relative(from, to) {
  from = resolve(from).slice(1);
  to = resolve(to).slice(1);
  const fromParts = trim(from.split("/"));
  const toParts = trim(to.split("/"));
  const length = Math.min(fromParts.length, toParts.length);
  let samePartsLength = length;
  for (let i2 = 0; i2 < length; i2++) {
    if (fromParts[i2] !== toParts[i2]) {
      samePartsLength = i2;
      break;
    }
  }
  let outputParts = [];
  for (let i2 = samePartsLength; i2 < fromParts.length; i2++) {
    outputParts.push("..");
  }
  outputParts = outputParts.concat(toParts.slice(samePartsLength));
  return outputParts.join("/");
}
function basename(path, ext) {
  let f2 = splitPath(path)[2] || "";
  if (ext && f2.slice(ext.length * -1) === ext) {
    f2 = f2.slice(0, f2.length - ext.length);
  }
  return f2;
}

// node_modules/@sentry/utils/build/esm/syncpromise.js
var States;
(function(States2) {
  const PENDING = 0;
  States2[States2["PENDING"] = PENDING] = "PENDING";
  const RESOLVED = 1;
  States2[States2["RESOLVED"] = RESOLVED] = "RESOLVED";
  const REJECTED = 2;
  States2[States2["REJECTED"] = REJECTED] = "REJECTED";
})(States || (States = {}));
function resolvedSyncPromise(value) {
  return new SyncPromise((resolve2) => {
    resolve2(value);
  });
}
function rejectedSyncPromise(reason) {
  return new SyncPromise((_2, reject) => {
    reject(reason);
  });
}
var SyncPromise = class _SyncPromise {
  constructor(executor) {
    _SyncPromise.prototype.__init.call(this);
    _SyncPromise.prototype.__init2.call(this);
    _SyncPromise.prototype.__init3.call(this);
    _SyncPromise.prototype.__init4.call(this);
    this._state = States.PENDING;
    this._handlers = [];
    try {
      executor(this._resolve, this._reject);
    } catch (e3) {
      this._reject(e3);
    }
  }
  /** JSDoc */
  then(onfulfilled, onrejected) {
    return new _SyncPromise((resolve2, reject) => {
      this._handlers.push([false, (result) => {
        if (!onfulfilled) {
          resolve2(result);
        } else {
          try {
            resolve2(onfulfilled(result));
          } catch (e3) {
            reject(e3);
          }
        }
      }, (reason) => {
        if (!onrejected) {
          reject(reason);
        } else {
          try {
            resolve2(onrejected(reason));
          } catch (e3) {
            reject(e3);
          }
        }
      }]);
      this._executeHandlers();
    });
  }
  /** JSDoc */
  catch(onrejected) {
    return this.then((val) => val, onrejected);
  }
  /** JSDoc */
  finally(onfinally) {
    return new _SyncPromise((resolve2, reject) => {
      let val;
      let isRejected;
      return this.then((value) => {
        isRejected = false;
        val = value;
        if (onfinally) {
          onfinally();
        }
      }, (reason) => {
        isRejected = true;
        val = reason;
        if (onfinally) {
          onfinally();
        }
      }).then(() => {
        if (isRejected) {
          reject(val);
          return;
        }
        resolve2(val);
      });
    });
  }
  /** JSDoc */
  __init() {
    this._resolve = (value) => {
      this._setResult(States.RESOLVED, value);
    };
  }
  /** JSDoc */
  __init2() {
    this._reject = (reason) => {
      this._setResult(States.REJECTED, reason);
    };
  }
  /** JSDoc */
  __init3() {
    this._setResult = (state, value) => {
      if (this._state !== States.PENDING) {
        return;
      }
      if (isThenable(value)) {
        void value.then(this._resolve, this._reject);
        return;
      }
      this._state = state;
      this._value = value;
      this._executeHandlers();
    };
  }
  /** JSDoc */
  __init4() {
    this._executeHandlers = () => {
      if (this._state === States.PENDING) {
        return;
      }
      const cachedHandlers = this._handlers.slice();
      this._handlers = [];
      cachedHandlers.forEach((handler) => {
        if (handler[0]) {
          return;
        }
        if (this._state === States.RESOLVED) {
          handler[1](this._value);
        }
        if (this._state === States.REJECTED) {
          handler[2](this._value);
        }
        handler[0] = true;
      });
    };
  }
};

// node_modules/@sentry/utils/build/esm/promisebuffer.js
function makePromiseBuffer(limit) {
  const buffer = [];
  function isReady() {
    return limit === void 0 || buffer.length < limit;
  }
  function remove(task) {
    return buffer.splice(buffer.indexOf(task), 1)[0] || Promise.resolve(void 0);
  }
  function add(taskProducer) {
    if (!isReady()) {
      return rejectedSyncPromise(new SentryError("Not adding Promise because buffer limit was reached."));
    }
    const task = taskProducer();
    if (buffer.indexOf(task) === -1) {
      buffer.push(task);
    }
    void task.then(() => remove(task)).then(null, () => remove(task).then(null, () => {
    }));
    return task;
  }
  function drain(timeout) {
    return new SyncPromise((resolve2, reject) => {
      let counter = buffer.length;
      if (!counter) {
        return resolve2(true);
      }
      const capturedSetTimeout = setTimeout(() => {
        if (timeout && timeout > 0) {
          resolve2(false);
        }
      }, timeout);
      buffer.forEach((item) => {
        void resolvedSyncPromise(item).then(() => {
          if (!--counter) {
            clearTimeout(capturedSetTimeout);
            resolve2(true);
          }
        }, reject);
      });
    });
  }
  return {
    $: buffer,
    add,
    drain
  };
}

// node_modules/@sentry/utils/build/esm/cookie.js
function parseCookie(str) {
  const obj = {};
  let index = 0;
  while (index < str.length) {
    const eqIdx = str.indexOf("=", index);
    if (eqIdx === -1) {
      break;
    }
    let endIdx = str.indexOf(";", index);
    if (endIdx === -1) {
      endIdx = str.length;
    } else if (endIdx < eqIdx) {
      index = str.lastIndexOf(";", eqIdx - 1) + 1;
      continue;
    }
    const key = str.slice(index, eqIdx).trim();
    if (void 0 === obj[key]) {
      let val = str.slice(eqIdx + 1, endIdx).trim();
      if (val.charCodeAt(0) === 34) {
        val = val.slice(1, -1);
      }
      try {
        obj[key] = val.indexOf("%") !== -1 ? decodeURIComponent(val) : val;
      } catch (e3) {
        obj[key] = val;
      }
    }
    index = endIdx + 1;
  }
  return obj;
}

// node_modules/@sentry/utils/build/esm/url.js
function parseUrl(url) {
  if (!url) {
    return {};
  }
  const match = url.match(/^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?$/);
  if (!match) {
    return {};
  }
  const query = match[6] || "";
  const fragment = match[8] || "";
  return {
    host: match[4],
    path: match[5],
    protocol: match[2],
    search: query,
    hash: fragment,
    relative: match[5] + query + fragment
    // everything minus origin
  };
}
function stripUrlQueryAndFragment(urlPath) {
  return urlPath.split(/[?#]/, 1)[0];
}

// node_modules/@sentry/utils/build/esm/vendor/getIpAddress.js
var ipHeaderNames = ["X-Client-IP", "X-Forwarded-For", "Fly-Client-IP", "CF-Connecting-IP", "Fastly-Client-Ip", "True-Client-Ip", "X-Real-IP", "X-Cluster-Client-IP", "X-Forwarded", "Forwarded-For", "Forwarded", "X-Vercel-Forwarded-For"];
function getClientIPAddress(headers) {
  const headerValues = ipHeaderNames.map((headerName) => {
    const rawValue = headers[headerName];
    const value = Array.isArray(rawValue) ? rawValue.join(";") : rawValue;
    if (headerName === "Forwarded") {
      return parseForwardedHeader(value);
    }
    return value && value.split(",").map((v2) => v2.trim());
  });
  const flattenedHeaderValues = headerValues.reduce((acc, val) => {
    if (!val) {
      return acc;
    }
    return acc.concat(val);
  }, []);
  const ipAddress = flattenedHeaderValues.find((ip) => ip !== null && isIP(ip));
  return ipAddress || null;
}
function parseForwardedHeader(value) {
  if (!value) {
    return null;
  }
  for (const part of value.split(";")) {
    if (part.startsWith("for=")) {
      return part.slice(4);
    }
  }
  return null;
}
function isIP(str) {
  const regex = /(?:^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}$)|(?:^(?:(?:[a-fA-F\d]{1,4}:){7}(?:[a-fA-F\d]{1,4}|:)|(?:[a-fA-F\d]{1,4}:){6}(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|:[a-fA-F\d]{1,4}|:)|(?:[a-fA-F\d]{1,4}:){5}(?::(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,2}|:)|(?:[a-fA-F\d]{1,4}:){4}(?:(?::[a-fA-F\d]{1,4}){0,1}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,3}|:)|(?:[a-fA-F\d]{1,4}:){3}(?:(?::[a-fA-F\d]{1,4}){0,2}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,4}|:)|(?:[a-fA-F\d]{1,4}:){2}(?:(?::[a-fA-F\d]{1,4}){0,3}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,5}|:)|(?:[a-fA-F\d]{1,4}:){1}(?:(?::[a-fA-F\d]{1,4}){0,4}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,6}|:)|(?::(?:(?::[a-fA-F\d]{1,4}){0,5}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,7}|:)))(?:%[0-9a-zA-Z]{1,})?$)/;
  return regex.test(str);
}

// node_modules/@sentry/utils/build/esm/requestdata.js
var DEFAULT_INCLUDES = {
  ip: false,
  request: true,
  transaction: true,
  user: true
};
var DEFAULT_REQUEST_INCLUDES = ["cookies", "data", "headers", "method", "query_string", "url"];
var DEFAULT_USER_INCLUDES = ["id", "username", "email"];
function extractPathForTransaction(req, options = {}) {
  const method = req.method && req.method.toUpperCase();
  let path = "";
  let source = "url";
  if (options.customRoute || req.route) {
    path = options.customRoute || `${req.baseUrl || ""}${req.route && req.route.path}`;
    source = "route";
  } else if (req.originalUrl || req.url) {
    path = stripUrlQueryAndFragment(req.originalUrl || req.url || "");
  }
  let name = "";
  if (options.method && method) {
    name += method;
  }
  if (options.method && options.path) {
    name += " ";
  }
  if (options.path && path) {
    name += path;
  }
  return [name, source];
}
function extractTransaction(req, type) {
  switch (type) {
    case "path": {
      return extractPathForTransaction(req, {
        path: true
      })[0];
    }
    case "handler": {
      return req.route && req.route.stack && req.route.stack[0] && req.route.stack[0].name || "<anonymous>";
    }
    case "methodPath":
    default: {
      const customRoute = req._reconstructedRoute ? req._reconstructedRoute : void 0;
      return extractPathForTransaction(req, {
        path: true,
        method: true,
        customRoute
      })[0];
    }
  }
}
function extractUserData(user, keys2) {
  const extractedUser = {};
  const attributes = Array.isArray(keys2) ? keys2 : DEFAULT_USER_INCLUDES;
  attributes.forEach((key) => {
    if (user && key in user) {
      extractedUser[key] = user[key];
    }
  });
  return extractedUser;
}
function extractRequestData(req, options = {}) {
  const {
    include = DEFAULT_REQUEST_INCLUDES
  } = options;
  const requestData = {};
  const headers = req.headers || {};
  const method = req.method;
  const host = headers.host || req.hostname || req.host || "<no host>";
  const protocol = req.protocol === "https" || req.socket && req.socket.encrypted ? "https" : "http";
  const originalUrl = req.originalUrl || req.url || "";
  const absoluteUrl = originalUrl.startsWith(protocol) ? originalUrl : `${protocol}://${host}${originalUrl}`;
  include.forEach((key) => {
    switch (key) {
      case "headers": {
        requestData.headers = headers;
        if (!include.includes("cookies")) {
          delete requestData.headers.cookie;
        }
        if (!include.includes("ip")) {
          ipHeaderNames.forEach((ipHeaderName) => {
            delete requestData.headers[ipHeaderName];
          });
        }
        break;
      }
      case "method": {
        requestData.method = method;
        break;
      }
      case "url": {
        requestData.url = absoluteUrl;
        break;
      }
      case "cookies": {
        requestData.cookies = // TODO (v8 / #5257): We're only sending the empty object for backwards compatibility, so the last bit can
        // come off in v8
        req.cookies || headers.cookie && parseCookie(headers.cookie) || {};
        break;
      }
      case "query_string": {
        requestData.query_string = extractQueryParams(req);
        break;
      }
      case "data": {
        if (method === "GET" || method === "HEAD") {
          break;
        }
        if (req.body !== void 0) {
          requestData.data = isString(req.body) ? req.body : JSON.stringify(normalize(req.body));
        }
        break;
      }
      default: {
        if ({}.hasOwnProperty.call(req, key)) {
          requestData[key] = req[key];
        }
      }
    }
  });
  return requestData;
}
function addRequestDataToEvent(event, req, options) {
  const include = __spreadValues(__spreadValues({}, DEFAULT_INCLUDES), options && options.include);
  if (include.request) {
    const includeRequest = Array.isArray(include.request) ? [...include.request] : [...DEFAULT_REQUEST_INCLUDES];
    if (include.ip) {
      includeRequest.push("ip");
    }
    const extractedRequestData = extractRequestData(req, {
      include: includeRequest
    });
    event.request = __spreadValues(__spreadValues({}, event.request), extractedRequestData);
  }
  if (include.user) {
    const extractedUser = req.user && isPlainObject(req.user) ? extractUserData(req.user, include.user) : {};
    if (Object.keys(extractedUser).length) {
      event.user = __spreadValues(__spreadValues({}, event.user), extractedUser);
    }
  }
  if (include.ip) {
    const ip = req.headers && getClientIPAddress(req.headers) || req.ip || req.socket && req.socket.remoteAddress;
    if (ip) {
      event.user = __spreadProps(__spreadValues({}, event.user), {
        ip_address: ip
      });
    }
  }
  if (include.transaction && !event.transaction && event.type === "transaction") {
    event.transaction = extractTransaction(req, include.transaction);
  }
  return event;
}
function extractQueryParams(req) {
  let originalUrl = req.originalUrl || req.url || "";
  if (!originalUrl) {
    return;
  }
  if (originalUrl.startsWith("/")) {
    originalUrl = `http://dogs.are.great${originalUrl}`;
  }
  try {
    const queryParams = req.query || new URL(originalUrl).search.slice(1);
    return queryParams.length ? queryParams : void 0;
  } catch (e22) {
    return void 0;
  }
}

// node_modules/@sentry/utils/build/esm/severity.js
var validSeverityLevels = ["fatal", "error", "warning", "log", "info", "debug"];
function severityLevelFromString(level) {
  return level === "warn" ? "warning" : validSeverityLevels.includes(level) ? level : "log";
}

// node_modules/@sentry/utils/build/esm/baggage.js
var BAGGAGE_HEADER_NAME = "baggage";
var SENTRY_BAGGAGE_KEY_PREFIX = "sentry-";
var SENTRY_BAGGAGE_KEY_PREFIX_REGEX = /^sentry-/;
var MAX_BAGGAGE_STRING_LENGTH = 8192;
function baggageHeaderToDynamicSamplingContext(baggageHeader) {
  const baggageObject = parseBaggageHeader(baggageHeader);
  if (!baggageObject) {
    return void 0;
  }
  const dynamicSamplingContext = Object.entries(baggageObject).reduce((acc, [key, value]) => {
    if (key.match(SENTRY_BAGGAGE_KEY_PREFIX_REGEX)) {
      const nonPrefixedKey = key.slice(SENTRY_BAGGAGE_KEY_PREFIX.length);
      acc[nonPrefixedKey] = value;
    }
    return acc;
  }, {});
  if (Object.keys(dynamicSamplingContext).length > 0) {
    return dynamicSamplingContext;
  } else {
    return void 0;
  }
}
function dynamicSamplingContextToSentryBaggageHeader(dynamicSamplingContext) {
  if (!dynamicSamplingContext) {
    return void 0;
  }
  const sentryPrefixedDSC = Object.entries(dynamicSamplingContext).reduce((acc, [dscKey, dscValue]) => {
    if (dscValue) {
      acc[`${SENTRY_BAGGAGE_KEY_PREFIX}${dscKey}`] = dscValue;
    }
    return acc;
  }, {});
  return objectToBaggageHeader(sentryPrefixedDSC);
}
function parseBaggageHeader(baggageHeader) {
  if (!baggageHeader || !isString(baggageHeader) && !Array.isArray(baggageHeader)) {
    return void 0;
  }
  if (Array.isArray(baggageHeader)) {
    return baggageHeader.reduce((acc, curr) => {
      const currBaggageObject = baggageHeaderToObject(curr);
      Object.entries(currBaggageObject).forEach(([key, value]) => {
        acc[key] = value;
      });
      return acc;
    }, {});
  }
  return baggageHeaderToObject(baggageHeader);
}
function baggageHeaderToObject(baggageHeader) {
  return baggageHeader.split(",").map((baggageEntry) => baggageEntry.split("=").map((keyOrValue) => decodeURIComponent(keyOrValue.trim()))).reduce((acc, [key, value]) => {
    if (key && value) {
      acc[key] = value;
    }
    return acc;
  }, {});
}
function objectToBaggageHeader(object) {
  if (Object.keys(object).length === 0) {
    return void 0;
  }
  return Object.entries(object).reduce((baggageHeader, [objectKey, objectValue], currentIndex) => {
    const baggageEntry = `${encodeURIComponent(objectKey)}=${encodeURIComponent(objectValue)}`;
    const newBaggageHeader = currentIndex === 0 ? baggageEntry : `${baggageHeader},${baggageEntry}`;
    if (newBaggageHeader.length > MAX_BAGGAGE_STRING_LENGTH) {
      DEBUG_BUILD && logger.warn(`Not adding key: ${objectKey} with val: ${objectValue} to baggage header due to exceeding baggage size limits.`);
      return baggageHeader;
    } else {
      return newBaggageHeader;
    }
  }, "");
}

// node_modules/@sentry/utils/build/esm/tracing.js
var TRACEPARENT_REGEXP = new RegExp("^[ \\t]*([0-9a-f]{32})?-?([0-9a-f]{16})?-?([01])?[ \\t]*$");
function extractTraceparentData(traceparent) {
  if (!traceparent) {
    return void 0;
  }
  const matches = traceparent.match(TRACEPARENT_REGEXP);
  if (!matches) {
    return void 0;
  }
  let parentSampled;
  if (matches[3] === "1") {
    parentSampled = true;
  } else if (matches[3] === "0") {
    parentSampled = false;
  }
  return {
    traceId: matches[1],
    parentSampled,
    parentSpanId: matches[2]
  };
}
function propagationContextFromHeaders(sentryTrace, baggage) {
  const traceparentData = extractTraceparentData(sentryTrace);
  const dynamicSamplingContext = baggageHeaderToDynamicSamplingContext(baggage);
  const {
    traceId,
    parentSpanId,
    parentSampled
  } = traceparentData || {};
  if (!traceparentData) {
    return {
      traceId: traceId || uuid4(),
      spanId: uuid4().substring(16)
    };
  } else {
    return {
      traceId: traceId || uuid4(),
      parentSpanId: parentSpanId || uuid4().substring(16),
      spanId: uuid4().substring(16),
      sampled: parentSampled,
      dsc: dynamicSamplingContext || {}
      // If we have traceparent data but no DSC it means we are not head of trace and we must freeze it
    };
  }
}
function generateSentryTraceHeader(traceId = uuid4(), spanId = uuid4().substring(16), sampled) {
  let sampledString = "";
  if (sampled !== void 0) {
    sampledString = sampled ? "-1" : "-0";
  }
  return `${traceId}-${spanId}${sampledString}`;
}

// node_modules/@sentry/utils/build/esm/envelope.js
function createEnvelope(headers, items = []) {
  return [headers, items];
}
function addItemToEnvelope(envelope, newItem) {
  const [headers, items] = envelope;
  return [headers, [...items, newItem]];
}
function forEachEnvelopeItem(envelope, callback) {
  const envelopeItems = envelope[1];
  for (const envelopeItem of envelopeItems) {
    const envelopeItemType = envelopeItem[0].type;
    const result = callback(envelopeItem, envelopeItemType);
    if (result) {
      return true;
    }
  }
  return false;
}
function envelopeContainsItemType(envelope, types) {
  return forEachEnvelopeItem(envelope, (_2, type) => types.includes(type));
}
function encodeUTF8(input) {
  return GLOBAL_OBJ.__SENTRY__ && GLOBAL_OBJ.__SENTRY__.encodePolyfill ? GLOBAL_OBJ.__SENTRY__.encodePolyfill(input) : new TextEncoder().encode(input);
}
function decodeUTF8(input) {
  return GLOBAL_OBJ.__SENTRY__ && GLOBAL_OBJ.__SENTRY__.decodePolyfill ? GLOBAL_OBJ.__SENTRY__.decodePolyfill(input) : new TextDecoder().decode(input);
}
function serializeEnvelope(envelope) {
  const [envHeaders, items] = envelope;
  let parts = JSON.stringify(envHeaders);
  function append(next) {
    if (typeof parts === "string") {
      parts = typeof next === "string" ? parts + next : [encodeUTF8(parts), next];
    } else {
      parts.push(typeof next === "string" ? encodeUTF8(next) : next);
    }
  }
  for (const item of items) {
    const [itemHeaders, payload] = item;
    append(`
${JSON.stringify(itemHeaders)}
`);
    if (typeof payload === "string" || payload instanceof Uint8Array) {
      append(payload);
    } else {
      let stringifiedPayload;
      try {
        stringifiedPayload = JSON.stringify(payload);
      } catch (e3) {
        stringifiedPayload = JSON.stringify(normalize(payload));
      }
      append(stringifiedPayload);
    }
  }
  return typeof parts === "string" ? parts : concatBuffers(parts);
}
function concatBuffers(buffers) {
  const totalLength = buffers.reduce((acc, buf) => acc + buf.length, 0);
  const merged = new Uint8Array(totalLength);
  let offset = 0;
  for (const buffer of buffers) {
    merged.set(buffer, offset);
    offset += buffer.length;
  }
  return merged;
}
function parseEnvelope(env) {
  let buffer = typeof env === "string" ? encodeUTF8(env) : env;
  function readBinary(length) {
    const bin = buffer.subarray(0, length);
    buffer = buffer.subarray(length + 1);
    return bin;
  }
  function readJson() {
    let i2 = buffer.indexOf(10);
    if (i2 < 0) {
      i2 = buffer.length;
    }
    return JSON.parse(decodeUTF8(readBinary(i2)));
  }
  const envelopeHeader = readJson();
  const items = [];
  while (buffer.length) {
    const itemHeader = readJson();
    const binaryLength = typeof itemHeader.length === "number" ? itemHeader.length : void 0;
    items.push([itemHeader, binaryLength ? readBinary(binaryLength) : readJson()]);
  }
  return [envelopeHeader, items];
}
function createSpanEnvelopeItem(spanJson) {
  const spanHeaders = {
    type: "span"
  };
  return [spanHeaders, spanJson];
}
function createAttachmentEnvelopeItem(attachment) {
  const buffer = typeof attachment.data === "string" ? encodeUTF8(attachment.data) : attachment.data;
  return [dropUndefinedKeys({
    type: "attachment",
    length: buffer.length,
    filename: attachment.filename,
    content_type: attachment.contentType,
    attachment_type: attachment.attachmentType
  }), buffer];
}
var ITEM_TYPE_TO_DATA_CATEGORY_MAP = {
  session: "session",
  sessions: "session",
  attachment: "attachment",
  transaction: "transaction",
  event: "error",
  client_report: "internal",
  user_report: "default",
  profile: "profile",
  profile_chunk: "profile",
  replay_event: "replay",
  replay_recording: "replay",
  check_in: "monitor",
  feedback: "feedback",
  span: "span",
  statsd: "metric_bucket"
};
function envelopeItemTypeToDataCategory(type) {
  return ITEM_TYPE_TO_DATA_CATEGORY_MAP[type];
}
function getSdkMetadataForEnvelopeHeader(metadataOrEvent) {
  if (!metadataOrEvent || !metadataOrEvent.sdk) {
    return;
  }
  const {
    name,
    version
  } = metadataOrEvent.sdk;
  return {
    name,
    version
  };
}
function createEventEnvelopeHeaders(event, sdkInfo, tunnel, dsn) {
  const dynamicSamplingContext = event.sdkProcessingMetadata && event.sdkProcessingMetadata.dynamicSamplingContext;
  return __spreadValues(__spreadValues(__spreadValues({
    event_id: event.event_id,
    sent_at: (/* @__PURE__ */ new Date()).toISOString()
  }, sdkInfo && {
    sdk: sdkInfo
  }), !!tunnel && dsn && {
    dsn: dsnToString(dsn)
  }), dynamicSamplingContext && {
    trace: dropUndefinedKeys(__spreadValues({}, dynamicSamplingContext))
  });
}

// node_modules/@sentry/utils/build/esm/clientreport.js
function createClientReportEnvelope(discarded_events, dsn, timestamp) {
  const clientReportItem = [{
    type: "client_report"
  }, {
    timestamp: timestamp || dateTimestampInSeconds(),
    discarded_events
  }];
  return createEnvelope(dsn ? {
    dsn
  } : {}, [clientReportItem]);
}

// node_modules/@sentry/utils/build/esm/ratelimit.js
var DEFAULT_RETRY_AFTER = 60 * 1e3;
function parseRetryAfterHeader(header, now = Date.now()) {
  const headerDelay = parseInt(`${header}`, 10);
  if (!isNaN(headerDelay)) {
    return headerDelay * 1e3;
  }
  const headerDate = Date.parse(`${header}`);
  if (!isNaN(headerDate)) {
    return headerDate - now;
  }
  return DEFAULT_RETRY_AFTER;
}
function disabledUntil(limits, dataCategory) {
  return limits[dataCategory] || limits.all || 0;
}
function isRateLimited(limits, dataCategory, now = Date.now()) {
  return disabledUntil(limits, dataCategory) > now;
}
function updateRateLimits(limits, {
  statusCode,
  headers
}, now = Date.now()) {
  const updatedRateLimits = __spreadValues({}, limits);
  const rateLimitHeader = headers && headers["x-sentry-rate-limits"];
  const retryAfterHeader = headers && headers["retry-after"];
  if (rateLimitHeader) {
    for (const limit of rateLimitHeader.trim().split(",")) {
      const [retryAfter, categories, , , namespaces] = limit.split(":", 5);
      const headerDelay = parseInt(retryAfter, 10);
      const delay = (!isNaN(headerDelay) ? headerDelay : 60) * 1e3;
      if (!categories) {
        updatedRateLimits.all = now + delay;
      } else {
        for (const category of categories.split(";")) {
          if (category === "metric_bucket") {
            if (!namespaces || namespaces.split(";").includes("custom")) {
              updatedRateLimits[category] = now + delay;
            }
          } else {
            updatedRateLimits[category] = now + delay;
          }
        }
      }
    }
  } else if (retryAfterHeader) {
    updatedRateLimits.all = now + parseRetryAfterHeader(retryAfterHeader, now);
  } else if (statusCode === 429) {
    updatedRateLimits.all = now + 60 * 1e3;
  }
  return updatedRateLimits;
}

// node_modules/@sentry/utils/build/esm/eventbuilder.js
function parseStackFrames(stackParser, error) {
  return stackParser(error.stack || "", 1);
}
function exceptionFromError(stackParser, error) {
  const exception = {
    type: error.name || error.constructor.name,
    value: error.message
  };
  const frames = parseStackFrames(stackParser, error);
  if (frames.length) {
    exception.stacktrace = {
      frames
    };
  }
  return exception;
}

// node_modules/@sentry/utils/build/esm/buildPolyfills/_nullishCoalesce.js
function _nullishCoalesce(lhs, rhsFn) {
  return lhs != null ? lhs : rhsFn();
}

// node_modules/@sentry/utils/build/esm/buildPolyfills/_optionalChain.js
function _optionalChain(ops) {
  let lastAccessLHS = void 0;
  let value = ops[0];
  let i2 = 1;
  while (i2 < ops.length) {
    const op = ops[i2];
    const fn = ops[i2 + 1];
    i2 += 2;
    if ((op === "optionalAccess" || op === "optionalCall") && value == null) {
      return;
    }
    if (op === "access" || op === "optionalAccess") {
      lastAccessLHS = value;
      value = fn(value);
    } else if (op === "call" || op === "optionalCall") {
      value = fn((...args) => value.call(lastAccessLHS, ...args));
      lastAccessLHS = void 0;
    }
  }
  return value;
}

// node_modules/@sentry/utils/build/esm/propagationContext.js
function generatePropagationContext() {
  return {
    traceId: uuid4(),
    spanId: uuid4().substring(16)
  };
}

// node_modules/@sentry/utils/build/esm/vendor/supportsHistory.js
var WINDOW3 = GLOBAL_OBJ;
function supportsHistory() {
  const chromeVar = WINDOW3.chrome;
  const isChromePackagedApp = chromeVar && chromeVar.app && chromeVar.app.runtime;
  const hasHistoryApi = "history" in WINDOW3 && !!WINDOW3.history.pushState && !!WINDOW3.history.replaceState;
  return !isChromePackagedApp && hasHistoryApi;
}

// node_modules/@sentry/core/build/esm/debug-build.js
var DEBUG_BUILD2 = typeof __SENTRY_DEBUG__ === "undefined" || __SENTRY_DEBUG__;

// node_modules/@sentry/core/build/esm/carrier.js
function getMainCarrier() {
  getSentryCarrier(GLOBAL_OBJ);
  return GLOBAL_OBJ;
}
function getSentryCarrier(carrier) {
  const __SENTRY__ = carrier.__SENTRY__ = carrier.__SENTRY__ || {};
  __SENTRY__.version = __SENTRY__.version || SDK_VERSION;
  return __SENTRY__[SDK_VERSION] = __SENTRY__[SDK_VERSION] || {};
}

// node_modules/@sentry/core/build/esm/session.js
function makeSession(context) {
  const startingTime = timestampInSeconds();
  const session = {
    sid: uuid4(),
    init: true,
    timestamp: startingTime,
    started: startingTime,
    duration: 0,
    status: "ok",
    errors: 0,
    ignoreDuration: false,
    toJSON: () => sessionToJSON(session)
  };
  if (context) {
    updateSession(session, context);
  }
  return session;
}
function updateSession(session, context = {}) {
  if (context.user) {
    if (!session.ipAddress && context.user.ip_address) {
      session.ipAddress = context.user.ip_address;
    }
    if (!session.did && !context.did) {
      session.did = context.user.id || context.user.email || context.user.username;
    }
  }
  session.timestamp = context.timestamp || timestampInSeconds();
  if (context.abnormal_mechanism) {
    session.abnormal_mechanism = context.abnormal_mechanism;
  }
  if (context.ignoreDuration) {
    session.ignoreDuration = context.ignoreDuration;
  }
  if (context.sid) {
    session.sid = context.sid.length === 32 ? context.sid : uuid4();
  }
  if (context.init !== void 0) {
    session.init = context.init;
  }
  if (!session.did && context.did) {
    session.did = `${context.did}`;
  }
  if (typeof context.started === "number") {
    session.started = context.started;
  }
  if (session.ignoreDuration) {
    session.duration = void 0;
  } else if (typeof context.duration === "number") {
    session.duration = context.duration;
  } else {
    const duration = session.timestamp - session.started;
    session.duration = duration >= 0 ? duration : 0;
  }
  if (context.release) {
    session.release = context.release;
  }
  if (context.environment) {
    session.environment = context.environment;
  }
  if (!session.ipAddress && context.ipAddress) {
    session.ipAddress = context.ipAddress;
  }
  if (!session.userAgent && context.userAgent) {
    session.userAgent = context.userAgent;
  }
  if (typeof context.errors === "number") {
    session.errors = context.errors;
  }
  if (context.status) {
    session.status = context.status;
  }
}
function closeSession(session, status) {
  let context = {};
  if (status) {
    context = {
      status
    };
  } else if (session.status === "ok") {
    context = {
      status: "exited"
    };
  }
  updateSession(session, context);
}
function sessionToJSON(session) {
  return dropUndefinedKeys({
    sid: `${session.sid}`,
    init: session.init,
    // Make sure that sec is converted to ms for date constructor
    started: new Date(session.started * 1e3).toISOString(),
    timestamp: new Date(session.timestamp * 1e3).toISOString(),
    status: session.status,
    errors: session.errors,
    did: typeof session.did === "number" || typeof session.did === "string" ? `${session.did}` : void 0,
    duration: session.duration,
    abnormal_mechanism: session.abnormal_mechanism,
    attrs: {
      release: session.release,
      environment: session.environment,
      ip_address: session.ipAddress,
      user_agent: session.userAgent
    }
  });
}

// node_modules/@sentry/core/build/esm/utils/spanOnScope.js
var SCOPE_SPAN_FIELD = "_sentrySpan";
function _setSpanForScope(scope, span) {
  if (span) {
    addNonEnumerableProperty(scope, SCOPE_SPAN_FIELD, span);
  } else {
    delete scope[SCOPE_SPAN_FIELD];
  }
}
function _getSpanForScope(scope) {
  return scope[SCOPE_SPAN_FIELD];
}

// node_modules/@sentry/core/build/esm/scope.js
var DEFAULT_MAX_BREADCRUMBS = 100;
var ScopeClass = class _ScopeClass {
  /** Flag if notifying is happening. */
  /** Callback for client to receive scope changes. */
  /** Callback list that will be called during event processing. */
  /** Array of breadcrumbs. */
  /** User */
  /** Tags */
  /** Extra */
  /** Contexts */
  /** Attachments */
  /** Propagation Context for distributed tracing */
  /**
   * A place to stash data which is needed at some point in the SDK's event processing pipeline but which shouldn't get
   * sent to Sentry
   */
  /** Fingerprint */
  /** Severity */
  /**
   * Transaction Name
   *
   * IMPORTANT: The transaction name on the scope has nothing to do with root spans/transaction objects.
   * It's purpose is to assign a transaction to the scope that's added to non-transaction events.
   */
  /** Session */
  /** Request Mode Session Status */
  /** The client on this scope */
  /** Contains the last event id of a captured event.  */
  // NOTE: Any field which gets added here should get added not only to the constructor but also to the `clone` method.
  constructor() {
    this._notifyingListeners = false;
    this._scopeListeners = [];
    this._eventProcessors = [];
    this._breadcrumbs = [];
    this._attachments = [];
    this._user = {};
    this._tags = {};
    this._extra = {};
    this._contexts = {};
    this._sdkProcessingMetadata = {};
    this._propagationContext = generatePropagationContext();
  }
  /**
   * @inheritDoc
   */
  clone() {
    const newScope = new _ScopeClass();
    newScope._breadcrumbs = [...this._breadcrumbs];
    newScope._tags = __spreadValues({}, this._tags);
    newScope._extra = __spreadValues({}, this._extra);
    newScope._contexts = __spreadValues({}, this._contexts);
    newScope._user = this._user;
    newScope._level = this._level;
    newScope._session = this._session;
    newScope._transactionName = this._transactionName;
    newScope._fingerprint = this._fingerprint;
    newScope._eventProcessors = [...this._eventProcessors];
    newScope._requestSession = this._requestSession;
    newScope._attachments = [...this._attachments];
    newScope._sdkProcessingMetadata = __spreadValues({}, this._sdkProcessingMetadata);
    newScope._propagationContext = __spreadValues({}, this._propagationContext);
    newScope._client = this._client;
    newScope._lastEventId = this._lastEventId;
    _setSpanForScope(newScope, _getSpanForScope(this));
    return newScope;
  }
  /**
   * @inheritDoc
   */
  setClient(client) {
    this._client = client;
  }
  /**
   * @inheritDoc
   */
  setLastEventId(lastEventId2) {
    this._lastEventId = lastEventId2;
  }
  /**
   * @inheritDoc
   */
  getClient() {
    return this._client;
  }
  /**
   * @inheritDoc
   */
  lastEventId() {
    return this._lastEventId;
  }
  /**
   * @inheritDoc
   */
  addScopeListener(callback) {
    this._scopeListeners.push(callback);
  }
  /**
   * @inheritDoc
   */
  addEventProcessor(callback) {
    this._eventProcessors.push(callback);
    return this;
  }
  /**
   * @inheritDoc
   */
  setUser(user) {
    this._user = user || {
      email: void 0,
      id: void 0,
      ip_address: void 0,
      username: void 0
    };
    if (this._session) {
      updateSession(this._session, {
        user
      });
    }
    this._notifyScopeListeners();
    return this;
  }
  /**
   * @inheritDoc
   */
  getUser() {
    return this._user;
  }
  /**
   * @inheritDoc
   */
  getRequestSession() {
    return this._requestSession;
  }
  /**
   * @inheritDoc
   */
  setRequestSession(requestSession) {
    this._requestSession = requestSession;
    return this;
  }
  /**
   * @inheritDoc
   */
  setTags(tags) {
    this._tags = __spreadValues(__spreadValues({}, this._tags), tags);
    this._notifyScopeListeners();
    return this;
  }
  /**
   * @inheritDoc
   */
  setTag(key, value) {
    this._tags = __spreadProps(__spreadValues({}, this._tags), {
      [key]: value
    });
    this._notifyScopeListeners();
    return this;
  }
  /**
   * @inheritDoc
   */
  setExtras(extras) {
    this._extra = __spreadValues(__spreadValues({}, this._extra), extras);
    this._notifyScopeListeners();
    return this;
  }
  /**
   * @inheritDoc
   */
  setExtra(key, extra) {
    this._extra = __spreadProps(__spreadValues({}, this._extra), {
      [key]: extra
    });
    this._notifyScopeListeners();
    return this;
  }
  /**
   * @inheritDoc
   */
  setFingerprint(fingerprint) {
    this._fingerprint = fingerprint;
    this._notifyScopeListeners();
    return this;
  }
  /**
   * @inheritDoc
   */
  setLevel(level) {
    this._level = level;
    this._notifyScopeListeners();
    return this;
  }
  /**
   * @inheritDoc
   */
  setTransactionName(name) {
    this._transactionName = name;
    this._notifyScopeListeners();
    return this;
  }
  /**
   * @inheritDoc
   */
  setContext(key, context) {
    if (context === null) {
      delete this._contexts[key];
    } else {
      this._contexts[key] = context;
    }
    this._notifyScopeListeners();
    return this;
  }
  /**
   * @inheritDoc
   */
  setSession(session) {
    if (!session) {
      delete this._session;
    } else {
      this._session = session;
    }
    this._notifyScopeListeners();
    return this;
  }
  /**
   * @inheritDoc
   */
  getSession() {
    return this._session;
  }
  /**
   * @inheritDoc
   */
  update(captureContext) {
    if (!captureContext) {
      return this;
    }
    const scopeToMerge = typeof captureContext === "function" ? captureContext(this) : captureContext;
    const [scopeInstance, requestSession] = scopeToMerge instanceof Scope ? [scopeToMerge.getScopeData(), scopeToMerge.getRequestSession()] : isPlainObject(scopeToMerge) ? [captureContext, captureContext.requestSession] : [];
    const {
      tags,
      extra,
      user,
      contexts,
      level,
      fingerprint = [],
      propagationContext
    } = scopeInstance || {};
    this._tags = __spreadValues(__spreadValues({}, this._tags), tags);
    this._extra = __spreadValues(__spreadValues({}, this._extra), extra);
    this._contexts = __spreadValues(__spreadValues({}, this._contexts), contexts);
    if (user && Object.keys(user).length) {
      this._user = user;
    }
    if (level) {
      this._level = level;
    }
    if (fingerprint.length) {
      this._fingerprint = fingerprint;
    }
    if (propagationContext) {
      this._propagationContext = propagationContext;
    }
    if (requestSession) {
      this._requestSession = requestSession;
    }
    return this;
  }
  /**
   * @inheritDoc
   */
  clear() {
    this._breadcrumbs = [];
    this._tags = {};
    this._extra = {};
    this._user = {};
    this._contexts = {};
    this._level = void 0;
    this._transactionName = void 0;
    this._fingerprint = void 0;
    this._requestSession = void 0;
    this._session = void 0;
    _setSpanForScope(this, void 0);
    this._attachments = [];
    this._propagationContext = generatePropagationContext();
    this._notifyScopeListeners();
    return this;
  }
  /**
   * @inheritDoc
   */
  addBreadcrumb(breadcrumb, maxBreadcrumbs) {
    const maxCrumbs = typeof maxBreadcrumbs === "number" ? maxBreadcrumbs : DEFAULT_MAX_BREADCRUMBS;
    if (maxCrumbs <= 0) {
      return this;
    }
    const mergedBreadcrumb = __spreadValues({
      timestamp: dateTimestampInSeconds()
    }, breadcrumb);
    const breadcrumbs = this._breadcrumbs;
    breadcrumbs.push(mergedBreadcrumb);
    this._breadcrumbs = breadcrumbs.length > maxCrumbs ? breadcrumbs.slice(-maxCrumbs) : breadcrumbs;
    this._notifyScopeListeners();
    return this;
  }
  /**
   * @inheritDoc
   */
  getLastBreadcrumb() {
    return this._breadcrumbs[this._breadcrumbs.length - 1];
  }
  /**
   * @inheritDoc
   */
  clearBreadcrumbs() {
    this._breadcrumbs = [];
    this._notifyScopeListeners();
    return this;
  }
  /**
   * @inheritDoc
   */
  addAttachment(attachment) {
    this._attachments.push(attachment);
    return this;
  }
  /**
   * @inheritDoc
   */
  clearAttachments() {
    this._attachments = [];
    return this;
  }
  /** @inheritDoc */
  getScopeData() {
    return {
      breadcrumbs: this._breadcrumbs,
      attachments: this._attachments,
      contexts: this._contexts,
      tags: this._tags,
      extra: this._extra,
      user: this._user,
      level: this._level,
      fingerprint: this._fingerprint || [],
      eventProcessors: this._eventProcessors,
      propagationContext: this._propagationContext,
      sdkProcessingMetadata: this._sdkProcessingMetadata,
      transactionName: this._transactionName,
      span: _getSpanForScope(this)
    };
  }
  /**
   * @inheritDoc
   */
  setSDKProcessingMetadata(newData) {
    this._sdkProcessingMetadata = __spreadValues(__spreadValues({}, this._sdkProcessingMetadata), newData);
    return this;
  }
  /**
   * @inheritDoc
   */
  setPropagationContext(context) {
    this._propagationContext = context;
    return this;
  }
  /**
   * @inheritDoc
   */
  getPropagationContext() {
    return this._propagationContext;
  }
  /**
   * @inheritDoc
   */
  captureException(exception, hint) {
    const eventId = hint && hint.event_id ? hint.event_id : uuid4();
    if (!this._client) {
      logger.warn("No client configured on scope - will not capture exception!");
      return eventId;
    }
    const syntheticException = new Error("Sentry syntheticException");
    this._client.captureException(exception, __spreadProps(__spreadValues({
      originalException: exception,
      syntheticException
    }, hint), {
      event_id: eventId
    }), this);
    return eventId;
  }
  /**
   * @inheritDoc
   */
  captureMessage(message, level, hint) {
    const eventId = hint && hint.event_id ? hint.event_id : uuid4();
    if (!this._client) {
      logger.warn("No client configured on scope - will not capture message!");
      return eventId;
    }
    const syntheticException = new Error(message);
    this._client.captureMessage(message, level, __spreadProps(__spreadValues({
      originalException: message,
      syntheticException
    }, hint), {
      event_id: eventId
    }), this);
    return eventId;
  }
  /**
   * @inheritDoc
   */
  captureEvent(event, hint) {
    const eventId = hint && hint.event_id ? hint.event_id : uuid4();
    if (!this._client) {
      logger.warn("No client configured on scope - will not capture event!");
      return eventId;
    }
    this._client.captureEvent(event, __spreadProps(__spreadValues({}, hint), {
      event_id: eventId
    }), this);
    return eventId;
  }
  /**
   * This will be called on every set call.
   */
  _notifyScopeListeners() {
    if (!this._notifyingListeners) {
      this._notifyingListeners = true;
      this._scopeListeners.forEach((callback) => {
        callback(this);
      });
      this._notifyingListeners = false;
    }
  }
};
var Scope = ScopeClass;

// node_modules/@sentry/core/build/esm/defaultScopes.js
function getDefaultCurrentScope() {
  return getGlobalSingleton("defaultCurrentScope", () => new Scope());
}
function getDefaultIsolationScope() {
  return getGlobalSingleton("defaultIsolationScope", () => new Scope());
}

// node_modules/@sentry/core/build/esm/asyncContext/stackStrategy.js
var AsyncContextStack = class {
  constructor(scope, isolationScope) {
    let assignedScope;
    if (!scope) {
      assignedScope = new Scope();
    } else {
      assignedScope = scope;
    }
    let assignedIsolationScope;
    if (!isolationScope) {
      assignedIsolationScope = new Scope();
    } else {
      assignedIsolationScope = isolationScope;
    }
    this._stack = [{
      scope: assignedScope
    }];
    this._isolationScope = assignedIsolationScope;
  }
  /**
   * Fork a scope for the stack.
   */
  withScope(callback) {
    const scope = this._pushScope();
    let maybePromiseResult;
    try {
      maybePromiseResult = callback(scope);
    } catch (e3) {
      this._popScope();
      throw e3;
    }
    if (isThenable(maybePromiseResult)) {
      return maybePromiseResult.then((res) => {
        this._popScope();
        return res;
      }, (e3) => {
        this._popScope();
        throw e3;
      });
    }
    this._popScope();
    return maybePromiseResult;
  }
  /**
   * Get the client of the stack.
   */
  getClient() {
    return this.getStackTop().client;
  }
  /**
   * Returns the scope of the top stack.
   */
  getScope() {
    return this.getStackTop().scope;
  }
  /**
   * Get the isolation scope for the stack.
   */
  getIsolationScope() {
    return this._isolationScope;
  }
  /**
   * Returns the topmost scope layer in the order domain > local > process.
   */
  getStackTop() {
    return this._stack[this._stack.length - 1];
  }
  /**
   * Push a scope to the stack.
   */
  _pushScope() {
    const scope = this.getScope().clone();
    this._stack.push({
      client: this.getClient(),
      scope
    });
    return scope;
  }
  /**
   * Pop a scope from the stack.
   */
  _popScope() {
    if (this._stack.length <= 1) return false;
    return !!this._stack.pop();
  }
};
function getAsyncContextStack() {
  const registry = getMainCarrier();
  const sentry = getSentryCarrier(registry);
  return sentry.stack = sentry.stack || new AsyncContextStack(getDefaultCurrentScope(), getDefaultIsolationScope());
}
function withScope(callback) {
  return getAsyncContextStack().withScope(callback);
}
function withSetScope(scope, callback) {
  const stack = getAsyncContextStack();
  return stack.withScope(() => {
    stack.getStackTop().scope = scope;
    return callback(scope);
  });
}
function withIsolationScope(callback) {
  return getAsyncContextStack().withScope(() => {
    return callback(getAsyncContextStack().getIsolationScope());
  });
}
function getStackAsyncContextStrategy() {
  return {
    withIsolationScope,
    withScope,
    withSetScope,
    withSetIsolationScope: (_isolationScope, callback) => {
      return withIsolationScope(callback);
    },
    getCurrentScope: () => getAsyncContextStack().getScope(),
    getIsolationScope: () => getAsyncContextStack().getIsolationScope()
  };
}

// node_modules/@sentry/core/build/esm/asyncContext/index.js
function getAsyncContextStrategy(carrier) {
  const sentry = getSentryCarrier(carrier);
  if (sentry.acs) {
    return sentry.acs;
  }
  return getStackAsyncContextStrategy();
}

// node_modules/@sentry/core/build/esm/currentScopes.js
function getCurrentScope() {
  const carrier = getMainCarrier();
  const acs = getAsyncContextStrategy(carrier);
  return acs.getCurrentScope();
}
function getIsolationScope() {
  const carrier = getMainCarrier();
  const acs = getAsyncContextStrategy(carrier);
  return acs.getIsolationScope();
}
function getGlobalScope() {
  return getGlobalSingleton("globalScope", () => new Scope());
}
function withScope2(...rest) {
  const carrier = getMainCarrier();
  const acs = getAsyncContextStrategy(carrier);
  if (rest.length === 2) {
    const [scope, callback] = rest;
    if (!scope) {
      return acs.withScope(callback);
    }
    return acs.withSetScope(scope, callback);
  }
  return acs.withScope(rest[0]);
}
function withIsolationScope2(...rest) {
  const carrier = getMainCarrier();
  const acs = getAsyncContextStrategy(carrier);
  if (rest.length === 2) {
    const [isolationScope, callback] = rest;
    if (!isolationScope) {
      return acs.withIsolationScope(callback);
    }
    return acs.withSetIsolationScope(isolationScope, callback);
  }
  return acs.withIsolationScope(rest[0]);
}
function getClient() {
  return getCurrentScope().getClient();
}

// node_modules/@sentry/core/build/esm/metrics/metric-summary.js
var METRICS_SPAN_FIELD = "_sentryMetrics";
function getMetricSummaryJsonForSpan(span) {
  const storage = span[METRICS_SPAN_FIELD];
  if (!storage) {
    return void 0;
  }
  const output = {};
  for (const [, [exportKey, summary]] of storage) {
    const arr = output[exportKey] || (output[exportKey] = []);
    arr.push(dropUndefinedKeys(summary));
  }
  return output;
}
function updateMetricSummaryOnSpan(span, metricType, sanitizedName, value, unit, tags, bucketKey) {
  const existingStorage = span[METRICS_SPAN_FIELD];
  const storage = existingStorage || (span[METRICS_SPAN_FIELD] = /* @__PURE__ */ new Map());
  const exportKey = `${metricType}:${sanitizedName}@${unit}`;
  const bucketItem = storage.get(bucketKey);
  if (bucketItem) {
    const [, summary] = bucketItem;
    storage.set(bucketKey, [exportKey, {
      min: Math.min(summary.min, value),
      max: Math.max(summary.max, value),
      count: summary.count += 1,
      sum: summary.sum += value,
      tags: summary.tags
    }]);
  } else {
    storage.set(bucketKey, [exportKey, {
      min: value,
      max: value,
      count: 1,
      sum: value,
      tags
    }]);
  }
}

// node_modules/@sentry/core/build/esm/semanticAttributes.js
var SEMANTIC_ATTRIBUTE_SENTRY_SOURCE = "sentry.source";
var SEMANTIC_ATTRIBUTE_SENTRY_SAMPLE_RATE = "sentry.sample_rate";
var SEMANTIC_ATTRIBUTE_SENTRY_OP = "sentry.op";
var SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN = "sentry.origin";
var SEMANTIC_ATTRIBUTE_SENTRY_IDLE_SPAN_FINISH_REASON = "sentry.idle_span_finish_reason";
var SEMANTIC_ATTRIBUTE_SENTRY_MEASUREMENT_UNIT = "sentry.measurement_unit";
var SEMANTIC_ATTRIBUTE_SENTRY_MEASUREMENT_VALUE = "sentry.measurement_value";
var SEMANTIC_ATTRIBUTE_PROFILE_ID = "sentry.profile_id";
var SEMANTIC_ATTRIBUTE_EXCLUSIVE_TIME = "sentry.exclusive_time";

// node_modules/@sentry/core/build/esm/tracing/spanstatus.js
var SPAN_STATUS_UNSET = 0;
var SPAN_STATUS_OK = 1;
var SPAN_STATUS_ERROR = 2;
function getSpanStatusFromHttpCode(httpStatus) {
  if (httpStatus < 400 && httpStatus >= 100) {
    return {
      code: SPAN_STATUS_OK
    };
  }
  if (httpStatus >= 400 && httpStatus < 500) {
    switch (httpStatus) {
      case 401:
        return {
          code: SPAN_STATUS_ERROR,
          message: "unauthenticated"
        };
      case 403:
        return {
          code: SPAN_STATUS_ERROR,
          message: "permission_denied"
        };
      case 404:
        return {
          code: SPAN_STATUS_ERROR,
          message: "not_found"
        };
      case 409:
        return {
          code: SPAN_STATUS_ERROR,
          message: "already_exists"
        };
      case 413:
        return {
          code: SPAN_STATUS_ERROR,
          message: "failed_precondition"
        };
      case 429:
        return {
          code: SPAN_STATUS_ERROR,
          message: "resource_exhausted"
        };
      case 499:
        return {
          code: SPAN_STATUS_ERROR,
          message: "cancelled"
        };
      default:
        return {
          code: SPAN_STATUS_ERROR,
          message: "invalid_argument"
        };
    }
  }
  if (httpStatus >= 500 && httpStatus < 600) {
    switch (httpStatus) {
      case 501:
        return {
          code: SPAN_STATUS_ERROR,
          message: "unimplemented"
        };
      case 503:
        return {
          code: SPAN_STATUS_ERROR,
          message: "unavailable"
        };
      case 504:
        return {
          code: SPAN_STATUS_ERROR,
          message: "deadline_exceeded"
        };
      default:
        return {
          code: SPAN_STATUS_ERROR,
          message: "internal_error"
        };
    }
  }
  return {
    code: SPAN_STATUS_ERROR,
    message: "unknown_error"
  };
}
function setHttpStatus(span, httpStatus) {
  span.setAttribute("http.response.status_code", httpStatus);
  const spanStatus = getSpanStatusFromHttpCode(httpStatus);
  if (spanStatus.message !== "unknown_error") {
    span.setStatus(spanStatus);
  }
}

// node_modules/@sentry/core/build/esm/utils/spanUtils.js
var TRACE_FLAG_NONE = 0;
var TRACE_FLAG_SAMPLED = 1;
function spanToTransactionTraceContext(span) {
  const {
    spanId: span_id,
    traceId: trace_id
  } = span.spanContext();
  const {
    data,
    op,
    parent_span_id,
    status,
    origin
  } = spanToJSON(span);
  return dropUndefinedKeys({
    parent_span_id,
    span_id,
    trace_id,
    data,
    op,
    status,
    origin
  });
}
function spanToTraceContext(span) {
  const {
    spanId: span_id,
    traceId: trace_id
  } = span.spanContext();
  const {
    parent_span_id
  } = spanToJSON(span);
  return dropUndefinedKeys({
    parent_span_id,
    span_id,
    trace_id
  });
}
function spanToTraceHeader(span) {
  const {
    traceId,
    spanId
  } = span.spanContext();
  const sampled = spanIsSampled(span);
  return generateSentryTraceHeader(traceId, spanId, sampled);
}
function spanTimeInputToSeconds(input) {
  if (typeof input === "number") {
    return ensureTimestampInSeconds(input);
  }
  if (Array.isArray(input)) {
    return input[0] + input[1] / 1e9;
  }
  if (input instanceof Date) {
    return ensureTimestampInSeconds(input.getTime());
  }
  return timestampInSeconds();
}
function ensureTimestampInSeconds(timestamp) {
  const isMs = timestamp > 9999999999;
  return isMs ? timestamp / 1e3 : timestamp;
}
function spanToJSON(span) {
  if (spanIsSentrySpan(span)) {
    return span.getSpanJSON();
  }
  try {
    const {
      spanId: span_id,
      traceId: trace_id
    } = span.spanContext();
    if (spanIsOpenTelemetrySdkTraceBaseSpan(span)) {
      const {
        attributes,
        startTime,
        name,
        endTime,
        parentSpanId,
        status
      } = span;
      return dropUndefinedKeys({
        span_id,
        trace_id,
        data: attributes,
        description: name,
        parent_span_id: parentSpanId,
        start_timestamp: spanTimeInputToSeconds(startTime),
        // This is [0,0] by default in OTEL, in which case we want to interpret this as no end time
        timestamp: spanTimeInputToSeconds(endTime) || void 0,
        status: getStatusMessage(status),
        op: attributes[SEMANTIC_ATTRIBUTE_SENTRY_OP],
        origin: attributes[SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN],
        _metrics_summary: getMetricSummaryJsonForSpan(span)
      });
    }
    return {
      span_id,
      trace_id
    };
  } catch (e3) {
    return {};
  }
}
function spanIsOpenTelemetrySdkTraceBaseSpan(span) {
  const castSpan = span;
  return !!castSpan.attributes && !!castSpan.startTime && !!castSpan.name && !!castSpan.endTime && !!castSpan.status;
}
function spanIsSentrySpan(span) {
  return typeof span.getSpanJSON === "function";
}
function spanIsSampled(span) {
  const {
    traceFlags
  } = span.spanContext();
  return traceFlags === TRACE_FLAG_SAMPLED;
}
function getStatusMessage(status) {
  if (!status || status.code === SPAN_STATUS_UNSET) {
    return void 0;
  }
  if (status.code === SPAN_STATUS_OK) {
    return "ok";
  }
  return status.message || "unknown_error";
}
var CHILD_SPANS_FIELD = "_sentryChildSpans";
var ROOT_SPAN_FIELD = "_sentryRootSpan";
function addChildSpanToSpan(span, childSpan) {
  const rootSpan = span[ROOT_SPAN_FIELD] || span;
  addNonEnumerableProperty(childSpan, ROOT_SPAN_FIELD, rootSpan);
  if (span[CHILD_SPANS_FIELD]) {
    span[CHILD_SPANS_FIELD].add(childSpan);
  } else {
    addNonEnumerableProperty(span, CHILD_SPANS_FIELD, /* @__PURE__ */ new Set([childSpan]));
  }
}
function removeChildSpanFromSpan(span, childSpan) {
  if (span[CHILD_SPANS_FIELD]) {
    span[CHILD_SPANS_FIELD].delete(childSpan);
  }
}
function getSpanDescendants(span) {
  const resultSet = /* @__PURE__ */ new Set();
  function addSpanChildren(span2) {
    if (resultSet.has(span2)) {
      return;
    } else if (spanIsSampled(span2)) {
      resultSet.add(span2);
      const childSpans = span2[CHILD_SPANS_FIELD] ? Array.from(span2[CHILD_SPANS_FIELD]) : [];
      for (const childSpan of childSpans) {
        addSpanChildren(childSpan);
      }
    }
  }
  addSpanChildren(span);
  return Array.from(resultSet);
}
function getRootSpan(span) {
  return span[ROOT_SPAN_FIELD] || span;
}
function getActiveSpan() {
  const carrier = getMainCarrier();
  const acs = getAsyncContextStrategy(carrier);
  if (acs.getActiveSpan) {
    return acs.getActiveSpan();
  }
  return _getSpanForScope(getCurrentScope());
}
function updateMetricSummaryOnActiveSpan(metricType, sanitizedName, value, unit, tags, bucketKey) {
  const span = getActiveSpan();
  if (span) {
    updateMetricSummaryOnSpan(span, metricType, sanitizedName, value, unit, tags, bucketKey);
  }
}

// node_modules/@sentry/core/build/esm/tracing/errors.js
var errorsInstrumented = false;
function registerSpanErrorInstrumentation() {
  if (errorsInstrumented) {
    return;
  }
  errorsInstrumented = true;
  addGlobalErrorInstrumentationHandler(errorCallback);
  addGlobalUnhandledRejectionInstrumentationHandler(errorCallback);
}
function errorCallback() {
  const activeSpan = getActiveSpan();
  const rootSpan = activeSpan && getRootSpan(activeSpan);
  if (rootSpan) {
    const message = "internal_error";
    DEBUG_BUILD2 && logger.log(`[Tracing] Root span: ${message} -> Global error occured`);
    rootSpan.setStatus({
      code: SPAN_STATUS_ERROR,
      message
    });
  }
}
errorCallback.tag = "sentry_tracingErrorCallback";

// node_modules/@sentry/core/build/esm/tracing/utils.js
var SCOPE_ON_START_SPAN_FIELD = "_sentryScope";
var ISOLATION_SCOPE_ON_START_SPAN_FIELD = "_sentryIsolationScope";
function setCapturedScopesOnSpan(span, scope, isolationScope) {
  if (span) {
    addNonEnumerableProperty(span, ISOLATION_SCOPE_ON_START_SPAN_FIELD, isolationScope);
    addNonEnumerableProperty(span, SCOPE_ON_START_SPAN_FIELD, scope);
  }
}
function getCapturedScopesOnSpan(span) {
  return {
    scope: span[SCOPE_ON_START_SPAN_FIELD],
    isolationScope: span[ISOLATION_SCOPE_ON_START_SPAN_FIELD]
  };
}

// node_modules/@sentry/core/build/esm/tracing/hubextensions.js
function addTracingExtensions() {
  registerSpanErrorInstrumentation();
}

// node_modules/@sentry/core/build/esm/utils/hasTracingEnabled.js
function hasTracingEnabled(maybeOptions) {
  if (typeof __SENTRY_TRACING__ === "boolean" && !__SENTRY_TRACING__) {
    return false;
  }
  const client = getClient();
  const options = maybeOptions || client && client.getOptions();
  return !!options && (options.enableTracing || "tracesSampleRate" in options || "tracesSampler" in options);
}

// node_modules/@sentry/core/build/esm/tracing/sentryNonRecordingSpan.js
var SentryNonRecordingSpan = class {
  constructor(spanContext = {}) {
    this._traceId = spanContext.traceId || uuid4();
    this._spanId = spanContext.spanId || uuid4().substring(16);
  }
  /** @inheritdoc */
  spanContext() {
    return {
      spanId: this._spanId,
      traceId: this._traceId,
      traceFlags: TRACE_FLAG_NONE
    };
  }
  /** @inheritdoc */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  end(_timestamp) {
  }
  /** @inheritdoc */
  setAttribute(_key, _value) {
    return this;
  }
  /** @inheritdoc */
  setAttributes(_values) {
    return this;
  }
  /** @inheritdoc */
  setStatus(_status) {
    return this;
  }
  /** @inheritdoc */
  updateName(_name) {
    return this;
  }
  /** @inheritdoc */
  isRecording() {
    return false;
  }
  /** @inheritdoc */
  addEvent(_name, _attributesOrStartTime, _startTime) {
    return this;
  }
  /**
   * This should generally not be used,
   * but we need it for being comliant with the OTEL Span interface.
   *
   * @hidden
   * @internal
   */
  addLink(_link) {
    return this;
  }
  /**
   * This should generally not be used,
   * but we need it for being comliant with the OTEL Span interface.
   *
   * @hidden
   * @internal
   */
  addLinks(_links) {
    return this;
  }
  /**
   * This should generally not be used,
   * but we need it for being comliant with the OTEL Span interface.
   *
   * @hidden
   * @internal
   */
  recordException(_exception, _time) {
  }
};

// node_modules/@sentry/core/build/esm/utils/handleCallbackErrors.js
function handleCallbackErrors(fn, onError, onFinally = () => {
}) {
  let maybePromiseResult;
  try {
    maybePromiseResult = fn();
  } catch (e3) {
    onError(e3);
    onFinally();
    throw e3;
  }
  return maybeHandlePromiseRejection(maybePromiseResult, onError, onFinally);
}
function maybeHandlePromiseRejection(value, onError, onFinally) {
  if (isThenable(value)) {
    return value.then((res) => {
      onFinally();
      return res;
    }, (e3) => {
      onError(e3);
      onFinally();
      throw e3;
    });
  }
  onFinally();
  return value;
}

// node_modules/@sentry/core/build/esm/constants.js
var DEFAULT_ENVIRONMENT = "production";

// node_modules/@sentry/core/build/esm/tracing/dynamicSamplingContext.js
var FROZEN_DSC_FIELD = "_frozenDsc";
function freezeDscOnSpan(span, dsc) {
  const spanWithMaybeDsc = span;
  addNonEnumerableProperty(spanWithMaybeDsc, FROZEN_DSC_FIELD, dsc);
}
function getDynamicSamplingContextFromClient(trace_id, client) {
  const options = client.getOptions();
  const {
    publicKey: public_key
  } = client.getDsn() || {};
  const dsc = dropUndefinedKeys({
    environment: options.environment || DEFAULT_ENVIRONMENT,
    release: options.release,
    public_key,
    trace_id
  });
  client.emit("createDsc", dsc);
  return dsc;
}
function getDynamicSamplingContextFromSpan(span) {
  const client = getClient();
  if (!client) {
    return {};
  }
  const dsc = getDynamicSamplingContextFromClient(spanToJSON(span).trace_id || "", client);
  const rootSpan = getRootSpan(span);
  const frozenDsc = rootSpan[FROZEN_DSC_FIELD];
  if (frozenDsc) {
    return frozenDsc;
  }
  const traceState = rootSpan.spanContext().traceState;
  const traceStateDsc = traceState && traceState.get("sentry.dsc");
  const dscOnTraceState = traceStateDsc && baggageHeaderToDynamicSamplingContext(traceStateDsc);
  if (dscOnTraceState) {
    return dscOnTraceState;
  }
  const jsonSpan = spanToJSON(rootSpan);
  const attributes = jsonSpan.data || {};
  const maybeSampleRate = attributes[SEMANTIC_ATTRIBUTE_SENTRY_SAMPLE_RATE];
  if (maybeSampleRate != null) {
    dsc.sample_rate = `${maybeSampleRate}`;
  }
  const source = attributes[SEMANTIC_ATTRIBUTE_SENTRY_SOURCE];
  const name = jsonSpan.description;
  if (source !== "url" && name) {
    dsc.transaction = name;
  }
  if (hasTracingEnabled()) {
    dsc.sampled = String(spanIsSampled(rootSpan));
  }
  client.emit("createDsc", dsc, rootSpan);
  return dsc;
}
function spanToBaggageHeader(span) {
  const dsc = getDynamicSamplingContextFromSpan(span);
  return dynamicSamplingContextToSentryBaggageHeader(dsc);
}

// node_modules/@sentry/core/build/esm/tracing/logSpans.js
function logSpanStart(span) {
  if (!DEBUG_BUILD2) return;
  const {
    description = "< unknown name >",
    op = "< unknown op >",
    parent_span_id: parentSpanId
  } = spanToJSON(span);
  const {
    spanId
  } = span.spanContext();
  const sampled = spanIsSampled(span);
  const rootSpan = getRootSpan(span);
  const isRootSpan = rootSpan === span;
  const header = `[Tracing] Starting ${sampled ? "sampled" : "unsampled"} ${isRootSpan ? "root " : ""}span`;
  const infoParts = [`op: ${op}`, `name: ${description}`, `ID: ${spanId}`];
  if (parentSpanId) {
    infoParts.push(`parent ID: ${parentSpanId}`);
  }
  if (!isRootSpan) {
    const {
      op: op2,
      description: description2
    } = spanToJSON(rootSpan);
    infoParts.push(`root ID: ${rootSpan.spanContext().spanId}`);
    if (op2) {
      infoParts.push(`root op: ${op2}`);
    }
    if (description2) {
      infoParts.push(`root description: ${description2}`);
    }
  }
  logger.log(`${header}
  ${infoParts.join("\n  ")}`);
}
function logSpanEnd(span) {
  if (!DEBUG_BUILD2) return;
  const {
    description = "< unknown name >",
    op = "< unknown op >"
  } = spanToJSON(span);
  const {
    spanId
  } = span.spanContext();
  const rootSpan = getRootSpan(span);
  const isRootSpan = rootSpan === span;
  const msg = `[Tracing] Finishing "${op}" ${isRootSpan ? "root " : ""}span "${description}" with ID ${spanId}`;
  logger.log(msg);
}

// node_modules/@sentry/core/build/esm/utils/parseSampleRate.js
function parseSampleRate(sampleRate) {
  if (typeof sampleRate === "boolean") {
    return Number(sampleRate);
  }
  const rate = typeof sampleRate === "string" ? parseFloat(sampleRate) : sampleRate;
  if (typeof rate !== "number" || isNaN(rate) || rate < 0 || rate > 1) {
    DEBUG_BUILD2 && logger.warn(`[Tracing] Given sample rate is invalid. Sample rate must be a boolean or a number between 0 and 1. Got ${JSON.stringify(sampleRate)} of type ${JSON.stringify(typeof sampleRate)}.`);
    return void 0;
  }
  return rate;
}

// node_modules/@sentry/core/build/esm/tracing/sampling.js
function sampleSpan(options, samplingContext) {
  if (!hasTracingEnabled(options)) {
    return [false];
  }
  let sampleRate;
  if (typeof options.tracesSampler === "function") {
    sampleRate = options.tracesSampler(samplingContext);
  } else if (samplingContext.parentSampled !== void 0) {
    sampleRate = samplingContext.parentSampled;
  } else if (typeof options.tracesSampleRate !== "undefined") {
    sampleRate = options.tracesSampleRate;
  } else {
    sampleRate = 1;
  }
  const parsedSampleRate = parseSampleRate(sampleRate);
  if (parsedSampleRate === void 0) {
    DEBUG_BUILD2 && logger.warn("[Tracing] Discarding transaction because of invalid sample rate.");
    return [false];
  }
  if (!parsedSampleRate) {
    DEBUG_BUILD2 && logger.log(`[Tracing] Discarding transaction because ${typeof options.tracesSampler === "function" ? "tracesSampler returned 0 or false" : "a negative sampling decision was inherited or tracesSampleRate is set to 0"}`);
    return [false, parsedSampleRate];
  }
  const shouldSample = Math.random() < parsedSampleRate;
  if (!shouldSample) {
    DEBUG_BUILD2 && logger.log(`[Tracing] Discarding transaction because it's not included in the random sample (sampling rate = ${Number(sampleRate)})`);
    return [false, parsedSampleRate];
  }
  return [true, parsedSampleRate];
}

// node_modules/@sentry/core/build/esm/envelope.js
function enhanceEventWithSdkInfo(event, sdkInfo) {
  if (!sdkInfo) {
    return event;
  }
  event.sdk = event.sdk || {};
  event.sdk.name = event.sdk.name || sdkInfo.name;
  event.sdk.version = event.sdk.version || sdkInfo.version;
  event.sdk.integrations = [...event.sdk.integrations || [], ...sdkInfo.integrations || []];
  event.sdk.packages = [...event.sdk.packages || [], ...sdkInfo.packages || []];
  return event;
}
function createSessionEnvelope(session, dsn, metadata, tunnel) {
  const sdkInfo = getSdkMetadataForEnvelopeHeader(metadata);
  const envelopeHeaders = __spreadValues(__spreadValues({
    sent_at: (/* @__PURE__ */ new Date()).toISOString()
  }, sdkInfo && {
    sdk: sdkInfo
  }), !!tunnel && dsn && {
    dsn: dsnToString(dsn)
  });
  const envelopeItem = "aggregates" in session ? [{
    type: "sessions"
  }, session] : [{
    type: "session"
  }, session.toJSON()];
  return createEnvelope(envelopeHeaders, [envelopeItem]);
}
function createEventEnvelope(event, dsn, metadata, tunnel) {
  const sdkInfo = getSdkMetadataForEnvelopeHeader(metadata);
  const eventType = event.type && event.type !== "replay_event" ? event.type : "event";
  enhanceEventWithSdkInfo(event, metadata && metadata.sdk);
  const envelopeHeaders = createEventEnvelopeHeaders(event, sdkInfo, tunnel, dsn);
  delete event.sdkProcessingMetadata;
  const eventItem = [{
    type: eventType
  }, event];
  return createEnvelope(envelopeHeaders, [eventItem]);
}
function createSpanEnvelope(spans, client) {
  function dscHasRequiredProps(dsc2) {
    return !!dsc2.trace_id && !!dsc2.public_key;
  }
  const dsc = getDynamicSamplingContextFromSpan(spans[0]);
  const dsn = client && client.getDsn();
  const tunnel = client && client.getOptions().tunnel;
  const headers = __spreadValues(__spreadValues({
    sent_at: (/* @__PURE__ */ new Date()).toISOString()
  }, dscHasRequiredProps(dsc) && {
    trace: dsc
  }), !!tunnel && dsn && {
    dsn: dsnToString(dsn)
  });
  const beforeSendSpan = client && client.getOptions().beforeSendSpan;
  const convertToSpanJSON = beforeSendSpan ? (span) => beforeSendSpan(spanToJSON(span)) : (span) => spanToJSON(span);
  const items = [];
  for (const span of spans) {
    const spanJson = convertToSpanJSON(span);
    if (spanJson) {
      items.push(createSpanEnvelopeItem(spanJson));
    }
  }
  return createEnvelope(headers, items);
}

// node_modules/@sentry/core/build/esm/tracing/measurement.js
function setMeasurement(name, value, unit, activeSpan = getActiveSpan()) {
  const rootSpan = activeSpan && getRootSpan(activeSpan);
  if (rootSpan) {
    rootSpan.addEvent(name, {
      [SEMANTIC_ATTRIBUTE_SENTRY_MEASUREMENT_VALUE]: value,
      [SEMANTIC_ATTRIBUTE_SENTRY_MEASUREMENT_UNIT]: unit
    });
  }
}
function timedEventsToMeasurements(events) {
  if (!events || events.length === 0) {
    return void 0;
  }
  const measurements = {};
  events.forEach((event) => {
    const attributes = event.attributes || {};
    const unit = attributes[SEMANTIC_ATTRIBUTE_SENTRY_MEASUREMENT_UNIT];
    const value = attributes[SEMANTIC_ATTRIBUTE_SENTRY_MEASUREMENT_VALUE];
    if (typeof unit === "string" && typeof value === "number") {
      measurements[event.name] = {
        value,
        unit
      };
    }
  });
  return measurements;
}

// node_modules/@sentry/core/build/esm/tracing/sentrySpan.js
var MAX_SPAN_COUNT = 1e3;
var SentrySpan = class {
  /** Epoch timestamp in seconds when the span started. */
  /** Epoch timestamp in seconds when the span ended. */
  /** Internal keeper of the status */
  /** The timed events added to this span. */
  /** if true, treat span as a standalone span (not part of a transaction) */
  /**
   * You should never call the constructor manually, always use `Sentry.startSpan()`
   * or other span methods.
   * @internal
   * @hideconstructor
   * @hidden
   */
  constructor(spanContext = {}) {
    this._traceId = spanContext.traceId || uuid4();
    this._spanId = spanContext.spanId || uuid4().substring(16);
    this._startTime = spanContext.startTimestamp || timestampInSeconds();
    this._attributes = {};
    this.setAttributes(__spreadValues({
      [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "manual",
      [SEMANTIC_ATTRIBUTE_SENTRY_OP]: spanContext.op
    }, spanContext.attributes));
    this._name = spanContext.name;
    if (spanContext.parentSpanId) {
      this._parentSpanId = spanContext.parentSpanId;
    }
    if ("sampled" in spanContext) {
      this._sampled = spanContext.sampled;
    }
    if (spanContext.endTimestamp) {
      this._endTime = spanContext.endTimestamp;
    }
    this._events = [];
    this._isStandaloneSpan = spanContext.isStandalone;
    if (this._endTime) {
      this._onSpanEnded();
    }
  }
  /**
   * This should generally not be used,
   * but it is needed for being compliant with the OTEL Span interface.
   *
   * @hidden
   * @internal
   */
  addLink(_link) {
    return this;
  }
  /**
   * This should generally not be used,
   * but it is needed for being compliant with the OTEL Span interface.
   *
   * @hidden
   * @internal
   */
  addLinks(_links) {
    return this;
  }
  /**
   * This should generally not be used,
   * but it is needed for being compliant with the OTEL Span interface.
   *
   * @hidden
   * @internal
   */
  recordException(_exception, _time) {
  }
  /** @inheritdoc */
  spanContext() {
    const {
      _spanId: spanId,
      _traceId: traceId,
      _sampled: sampled
    } = this;
    return {
      spanId,
      traceId,
      traceFlags: sampled ? TRACE_FLAG_SAMPLED : TRACE_FLAG_NONE
    };
  }
  /** @inheritdoc */
  setAttribute(key, value) {
    if (value === void 0) {
      delete this._attributes[key];
    } else {
      this._attributes[key] = value;
    }
    return this;
  }
  /** @inheritdoc */
  setAttributes(attributes) {
    Object.keys(attributes).forEach((key) => this.setAttribute(key, attributes[key]));
    return this;
  }
  /**
   * This should generally not be used,
   * but we need it for browser tracing where we want to adjust the start time afterwards.
   * USE THIS WITH CAUTION!
   *
   * @hidden
   * @internal
   */
  updateStartTime(timeInput) {
    this._startTime = spanTimeInputToSeconds(timeInput);
  }
  /**
   * @inheritDoc
   */
  setStatus(value) {
    this._status = value;
    return this;
  }
  /**
   * @inheritDoc
   */
  updateName(name) {
    this._name = name;
    return this;
  }
  /** @inheritdoc */
  end(endTimestamp) {
    if (this._endTime) {
      return;
    }
    this._endTime = spanTimeInputToSeconds(endTimestamp);
    logSpanEnd(this);
    this._onSpanEnded();
  }
  /**
   * Get JSON representation of this span.
   *
   * @hidden
   * @internal This method is purely for internal purposes and should not be used outside
   * of SDK code. If you need to get a JSON representation of a span,
   * use `spanToJSON(span)` instead.
   */
  getSpanJSON() {
    return dropUndefinedKeys({
      data: this._attributes,
      description: this._name,
      op: this._attributes[SEMANTIC_ATTRIBUTE_SENTRY_OP],
      parent_span_id: this._parentSpanId,
      span_id: this._spanId,
      start_timestamp: this._startTime,
      status: getStatusMessage(this._status),
      timestamp: this._endTime,
      trace_id: this._traceId,
      origin: this._attributes[SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN],
      _metrics_summary: getMetricSummaryJsonForSpan(this),
      profile_id: this._attributes[SEMANTIC_ATTRIBUTE_PROFILE_ID],
      exclusive_time: this._attributes[SEMANTIC_ATTRIBUTE_EXCLUSIVE_TIME],
      measurements: timedEventsToMeasurements(this._events),
      is_segment: this._isStandaloneSpan && getRootSpan(this) === this || void 0,
      segment_id: this._isStandaloneSpan ? getRootSpan(this).spanContext().spanId : void 0
    });
  }
  /** @inheritdoc */
  isRecording() {
    return !this._endTime && !!this._sampled;
  }
  /**
   * @inheritdoc
   */
  addEvent(name, attributesOrStartTime, startTime) {
    DEBUG_BUILD2 && logger.log("[Tracing] Adding an event to span:", name);
    const time = isSpanTimeInput(attributesOrStartTime) ? attributesOrStartTime : startTime || timestampInSeconds();
    const attributes = isSpanTimeInput(attributesOrStartTime) ? {} : attributesOrStartTime || {};
    const event = {
      name,
      time: spanTimeInputToSeconds(time),
      attributes
    };
    this._events.push(event);
    return this;
  }
  /**
   * This method should generally not be used,
   * but for now we need a way to publicly check if the `_isStandaloneSpan` flag is set.
   * USE THIS WITH CAUTION!
   * @internal
   * @hidden
   * @experimental
   */
  isStandaloneSpan() {
    return !!this._isStandaloneSpan;
  }
  /** Emit `spanEnd` when the span is ended. */
  _onSpanEnded() {
    const client = getClient();
    if (client) {
      client.emit("spanEnd", this);
    }
    const isSegmentSpan = this._isStandaloneSpan || this === getRootSpan(this);
    if (!isSegmentSpan) {
      return;
    }
    if (this._isStandaloneSpan) {
      if (this._sampled) {
        sendSpanEnvelope(createSpanEnvelope([this], client));
      } else {
        DEBUG_BUILD2 && logger.log("[Tracing] Discarding standalone span because its trace was not chosen to be sampled.");
        if (client) {
          client.recordDroppedEvent("sample_rate", "span");
        }
      }
      return;
    }
    const transactionEvent = this._convertSpanToTransaction();
    if (transactionEvent) {
      const scope = getCapturedScopesOnSpan(this).scope || getCurrentScope();
      scope.captureEvent(transactionEvent);
    }
  }
  /**
   * Finish the transaction & prepare the event to send to Sentry.
   */
  _convertSpanToTransaction() {
    if (!isFullFinishedSpan(spanToJSON(this))) {
      return void 0;
    }
    if (!this._name) {
      DEBUG_BUILD2 && logger.warn("Transaction has no name, falling back to `<unlabeled transaction>`.");
      this._name = "<unlabeled transaction>";
    }
    const {
      scope: capturedSpanScope,
      isolationScope: capturedSpanIsolationScope
    } = getCapturedScopesOnSpan(this);
    const scope = capturedSpanScope || getCurrentScope();
    const client = scope.getClient() || getClient();
    if (this._sampled !== true) {
      DEBUG_BUILD2 && logger.log("[Tracing] Discarding transaction because its trace was not chosen to be sampled.");
      if (client) {
        client.recordDroppedEvent("sample_rate", "transaction");
      }
      return void 0;
    }
    const finishedSpans = getSpanDescendants(this).filter((span) => span !== this && !isStandaloneSpan(span));
    const spans = finishedSpans.map((span) => spanToJSON(span)).filter(isFullFinishedSpan);
    const source = this._attributes[SEMANTIC_ATTRIBUTE_SENTRY_SOURCE];
    const transaction = __spreadValues({
      contexts: {
        trace: spanToTransactionTraceContext(this)
      },
      spans: (
        // spans.sort() mutates the array, but `spans` is already a copy so we can safely do this here
        // we do not use spans anymore after this point
        spans.length > MAX_SPAN_COUNT ? spans.sort((a2, b2) => a2.start_timestamp - b2.start_timestamp).slice(0, MAX_SPAN_COUNT) : spans
      ),
      start_timestamp: this._startTime,
      timestamp: this._endTime,
      transaction: this._name,
      type: "transaction",
      sdkProcessingMetadata: __spreadValues({
        capturedSpanScope,
        capturedSpanIsolationScope
      }, dropUndefinedKeys({
        dynamicSamplingContext: getDynamicSamplingContextFromSpan(this)
      })),
      _metrics_summary: getMetricSummaryJsonForSpan(this)
    }, source && {
      transaction_info: {
        source
      }
    });
    const measurements = timedEventsToMeasurements(this._events);
    const hasMeasurements = measurements && Object.keys(measurements).length;
    if (hasMeasurements) {
      DEBUG_BUILD2 && logger.log("[Measurements] Adding measurements to transaction event", JSON.stringify(measurements, void 0, 2));
      transaction.measurements = measurements;
    }
    return transaction;
  }
};
function isSpanTimeInput(value) {
  return value && typeof value === "number" || value instanceof Date || Array.isArray(value);
}
function isFullFinishedSpan(input) {
  return !!input.start_timestamp && !!input.timestamp && !!input.span_id && !!input.trace_id;
}
function isStandaloneSpan(span) {
  return span instanceof SentrySpan && span.isStandaloneSpan();
}
function sendSpanEnvelope(envelope) {
  const client = getClient();
  if (!client) {
    return;
  }
  const spanItems = envelope[1];
  if (!spanItems || spanItems.length === 0) {
    client.recordDroppedEvent("before_send", "span");
    return;
  }
  const transport = client.getTransport();
  if (transport) {
    transport.send(envelope).then(null, (reason) => {
      DEBUG_BUILD2 && logger.error("Error while sending span:", reason);
    });
  }
}

// node_modules/@sentry/core/build/esm/tracing/trace.js
var SUPPRESS_TRACING_KEY = "__SENTRY_SUPPRESS_TRACING__";
function startSpan(options, callback) {
  const acs = getAcs();
  if (acs.startSpan) {
    return acs.startSpan(options, callback);
  }
  const spanArguments = parseSentrySpanArguments(options);
  const {
    forceTransaction,
    parentSpan: customParentSpan
  } = options;
  return withScope2(options.scope, () => {
    const wrapper = getActiveSpanWrapper(customParentSpan);
    return wrapper(() => {
      const scope = getCurrentScope();
      const parentSpan = getParentSpan(scope);
      const shouldSkipSpan = options.onlyIfParent && !parentSpan;
      const activeSpan = shouldSkipSpan ? new SentryNonRecordingSpan() : createChildOrRootSpan({
        parentSpan,
        spanArguments,
        forceTransaction,
        scope
      });
      _setSpanForScope(scope, activeSpan);
      return handleCallbackErrors(() => callback(activeSpan), () => {
        const {
          status
        } = spanToJSON(activeSpan);
        if (activeSpan.isRecording() && (!status || status === "ok")) {
          activeSpan.setStatus({
            code: SPAN_STATUS_ERROR,
            message: "internal_error"
          });
        }
      }, () => activeSpan.end());
    });
  });
}
function startSpanManual(options, callback) {
  const acs = getAcs();
  if (acs.startSpanManual) {
    return acs.startSpanManual(options, callback);
  }
  const spanArguments = parseSentrySpanArguments(options);
  const {
    forceTransaction,
    parentSpan: customParentSpan
  } = options;
  return withScope2(options.scope, () => {
    const wrapper = getActiveSpanWrapper(customParentSpan);
    return wrapper(() => {
      const scope = getCurrentScope();
      const parentSpan = getParentSpan(scope);
      const shouldSkipSpan = options.onlyIfParent && !parentSpan;
      const activeSpan = shouldSkipSpan ? new SentryNonRecordingSpan() : createChildOrRootSpan({
        parentSpan,
        spanArguments,
        forceTransaction,
        scope
      });
      _setSpanForScope(scope, activeSpan);
      function finishAndSetSpan() {
        activeSpan.end();
      }
      return handleCallbackErrors(() => callback(activeSpan, finishAndSetSpan), () => {
        const {
          status
        } = spanToJSON(activeSpan);
        if (activeSpan.isRecording() && (!status || status === "ok")) {
          activeSpan.setStatus({
            code: SPAN_STATUS_ERROR,
            message: "internal_error"
          });
        }
      });
    });
  });
}
function startInactiveSpan(options) {
  const acs = getAcs();
  if (acs.startInactiveSpan) {
    return acs.startInactiveSpan(options);
  }
  const spanArguments = parseSentrySpanArguments(options);
  const {
    forceTransaction,
    parentSpan: customParentSpan
  } = options;
  const wrapper = options.scope ? (callback) => withScope2(options.scope, callback) : customParentSpan !== void 0 ? (callback) => withActiveSpan(customParentSpan, callback) : (callback) => callback();
  return wrapper(() => {
    const scope = getCurrentScope();
    const parentSpan = getParentSpan(scope);
    const shouldSkipSpan = options.onlyIfParent && !parentSpan;
    if (shouldSkipSpan) {
      return new SentryNonRecordingSpan();
    }
    return createChildOrRootSpan({
      parentSpan,
      spanArguments,
      forceTransaction,
      scope
    });
  });
}
var continueTrace = ({
  sentryTrace,
  baggage
}, callback) => {
  return withScope2((scope) => {
    const propagationContext = propagationContextFromHeaders(sentryTrace, baggage);
    scope.setPropagationContext(propagationContext);
    return callback();
  });
};
function withActiveSpan(span, callback) {
  const acs = getAcs();
  if (acs.withActiveSpan) {
    return acs.withActiveSpan(span, callback);
  }
  return withScope2((scope) => {
    _setSpanForScope(scope, span || void 0);
    return callback(scope);
  });
}
function suppressTracing(callback) {
  const acs = getAcs();
  if (acs.suppressTracing) {
    return acs.suppressTracing(callback);
  }
  return withScope2((scope) => {
    scope.setSDKProcessingMetadata({
      [SUPPRESS_TRACING_KEY]: true
    });
    return callback();
  });
}
function startNewTrace(callback) {
  return withScope2((scope) => {
    scope.setPropagationContext(generatePropagationContext());
    DEBUG_BUILD2 && logger.info(`Starting a new trace with id ${scope.getPropagationContext().traceId}`);
    return withActiveSpan(null, callback);
  });
}
function createChildOrRootSpan({
  parentSpan,
  spanArguments,
  forceTransaction,
  scope
}) {
  if (!hasTracingEnabled()) {
    return new SentryNonRecordingSpan();
  }
  const isolationScope = getIsolationScope();
  let span;
  if (parentSpan && !forceTransaction) {
    span = _startChildSpan(parentSpan, scope, spanArguments);
    addChildSpanToSpan(parentSpan, span);
  } else if (parentSpan) {
    const dsc = getDynamicSamplingContextFromSpan(parentSpan);
    const {
      traceId,
      spanId: parentSpanId
    } = parentSpan.spanContext();
    const parentSampled = spanIsSampled(parentSpan);
    span = _startRootSpan(__spreadValues({
      traceId,
      parentSpanId
    }, spanArguments), scope, parentSampled);
    freezeDscOnSpan(span, dsc);
  } else {
    const {
      traceId,
      dsc,
      parentSpanId,
      sampled: parentSampled
    } = __spreadValues(__spreadValues({}, isolationScope.getPropagationContext()), scope.getPropagationContext());
    span = _startRootSpan(__spreadValues({
      traceId,
      parentSpanId
    }, spanArguments), scope, parentSampled);
    if (dsc) {
      freezeDscOnSpan(span, dsc);
    }
  }
  logSpanStart(span);
  setCapturedScopesOnSpan(span, scope, isolationScope);
  return span;
}
function parseSentrySpanArguments(options) {
  const exp = options.experimental || {};
  const initialCtx = __spreadValues({
    isStandalone: exp.standalone
  }, options);
  if (options.startTime) {
    const ctx = __spreadValues({}, initialCtx);
    ctx.startTimestamp = spanTimeInputToSeconds(options.startTime);
    delete ctx.startTime;
    return ctx;
  }
  return initialCtx;
}
function getAcs() {
  const carrier = getMainCarrier();
  return getAsyncContextStrategy(carrier);
}
function _startRootSpan(spanArguments, scope, parentSampled) {
  const client = getClient();
  const options = client && client.getOptions() || {};
  const {
    name = "",
    attributes
  } = spanArguments;
  const [sampled, sampleRate] = scope.getScopeData().sdkProcessingMetadata[SUPPRESS_TRACING_KEY] ? [false] : sampleSpan(options, {
    name,
    parentSampled,
    attributes,
    transactionContext: {
      name,
      parentSampled
    }
  });
  const rootSpan = new SentrySpan(__spreadProps(__spreadValues({}, spanArguments), {
    attributes: __spreadValues({
      [SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: "custom"
    }, spanArguments.attributes),
    sampled
  }));
  if (sampleRate !== void 0) {
    rootSpan.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_SAMPLE_RATE, sampleRate);
  }
  if (client) {
    client.emit("spanStart", rootSpan);
  }
  return rootSpan;
}
function _startChildSpan(parentSpan, scope, spanArguments) {
  const {
    spanId,
    traceId
  } = parentSpan.spanContext();
  const sampled = scope.getScopeData().sdkProcessingMetadata[SUPPRESS_TRACING_KEY] ? false : spanIsSampled(parentSpan);
  const childSpan = sampled ? new SentrySpan(__spreadProps(__spreadValues({}, spanArguments), {
    parentSpanId: spanId,
    traceId,
    sampled
  })) : new SentryNonRecordingSpan({
    traceId
  });
  addChildSpanToSpan(parentSpan, childSpan);
  const client = getClient();
  if (client) {
    client.emit("spanStart", childSpan);
    if (spanArguments.endTimestamp) {
      client.emit("spanEnd", childSpan);
    }
  }
  return childSpan;
}
function getParentSpan(scope) {
  const span = _getSpanForScope(scope);
  if (!span) {
    return void 0;
  }
  const client = getClient();
  const options = client ? client.getOptions() : {};
  if (options.parentSpanIsAlwaysRootSpan) {
    return getRootSpan(span);
  }
  return span;
}
function getActiveSpanWrapper(parentSpan) {
  return parentSpan !== void 0 ? (callback) => {
    return withActiveSpan(parentSpan, callback);
  } : (callback) => callback();
}

// node_modules/@sentry/core/build/esm/tracing/idleSpan.js
var TRACING_DEFAULTS = {
  idleTimeout: 1e3,
  finalTimeout: 3e4,
  childSpanTimeout: 15e3
};
var FINISH_REASON_HEARTBEAT_FAILED = "heartbeatFailed";
var FINISH_REASON_IDLE_TIMEOUT = "idleTimeout";
var FINISH_REASON_FINAL_TIMEOUT = "finalTimeout";
var FINISH_REASON_EXTERNAL_FINISH = "externalFinish";
function startIdleSpan(startSpanOptions, options = {}) {
  const activities = /* @__PURE__ */ new Map();
  let _finished = false;
  let _idleTimeoutID;
  let _finishReason = FINISH_REASON_EXTERNAL_FINISH;
  let _autoFinishAllowed = !options.disableAutoFinish;
  const _cleanupHooks = [];
  const {
    idleTimeout = TRACING_DEFAULTS.idleTimeout,
    finalTimeout = TRACING_DEFAULTS.finalTimeout,
    childSpanTimeout = TRACING_DEFAULTS.childSpanTimeout,
    beforeSpanEnd
  } = options;
  const client = getClient();
  if (!client || !hasTracingEnabled()) {
    return new SentryNonRecordingSpan();
  }
  const scope = getCurrentScope();
  const previousActiveSpan = getActiveSpan();
  const span = _startIdleSpan(startSpanOptions);
  span.end = new Proxy(span.end, {
    apply(target, thisArg, args) {
      if (beforeSpanEnd) {
        beforeSpanEnd(span);
      }
      const [definedEndTimestamp, ...rest] = args;
      const timestamp = definedEndTimestamp || timestampInSeconds();
      const spanEndTimestamp = spanTimeInputToSeconds(timestamp);
      const spans = getSpanDescendants(span).filter((child) => child !== span);
      if (!spans.length) {
        onIdleSpanEnded(spanEndTimestamp);
        return Reflect.apply(target, thisArg, [spanEndTimestamp, ...rest]);
      }
      const childEndTimestamps = spans.map((span2) => spanToJSON(span2).timestamp).filter((timestamp2) => !!timestamp2);
      const latestSpanEndTimestamp = childEndTimestamps.length ? Math.max(...childEndTimestamps) : void 0;
      const spanStartTimestamp = spanToJSON(span).start_timestamp;
      const endTimestamp = Math.min(spanStartTimestamp ? spanStartTimestamp + finalTimeout / 1e3 : Infinity, Math.max(spanStartTimestamp || -Infinity, Math.min(spanEndTimestamp, latestSpanEndTimestamp || Infinity)));
      onIdleSpanEnded(endTimestamp);
      return Reflect.apply(target, thisArg, [endTimestamp, ...rest]);
    }
  });
  function _cancelIdleTimeout() {
    if (_idleTimeoutID) {
      clearTimeout(_idleTimeoutID);
      _idleTimeoutID = void 0;
    }
  }
  function _restartIdleTimeout(endTimestamp) {
    _cancelIdleTimeout();
    _idleTimeoutID = setTimeout(() => {
      if (!_finished && activities.size === 0 && _autoFinishAllowed) {
        _finishReason = FINISH_REASON_IDLE_TIMEOUT;
        span.end(endTimestamp);
      }
    }, idleTimeout);
  }
  function _restartChildSpanTimeout(endTimestamp) {
    _idleTimeoutID = setTimeout(() => {
      if (!_finished && _autoFinishAllowed) {
        _finishReason = FINISH_REASON_HEARTBEAT_FAILED;
        span.end(endTimestamp);
      }
    }, childSpanTimeout);
  }
  function _pushActivity(spanId) {
    _cancelIdleTimeout();
    activities.set(spanId, true);
    const endTimestamp = timestampInSeconds();
    _restartChildSpanTimeout(endTimestamp + childSpanTimeout / 1e3);
  }
  function _popActivity(spanId) {
    if (activities.has(spanId)) {
      activities.delete(spanId);
    }
    if (activities.size === 0) {
      const endTimestamp = timestampInSeconds();
      _restartIdleTimeout(endTimestamp + idleTimeout / 1e3);
    }
  }
  function onIdleSpanEnded(endTimestamp) {
    _finished = true;
    activities.clear();
    _cleanupHooks.forEach((cleanup) => cleanup());
    _setSpanForScope(scope, previousActiveSpan);
    const spanJSON = spanToJSON(span);
    const {
      start_timestamp: startTimestamp
    } = spanJSON;
    if (!startTimestamp) {
      return;
    }
    const attributes = spanJSON.data || {};
    if (!attributes[SEMANTIC_ATTRIBUTE_SENTRY_IDLE_SPAN_FINISH_REASON]) {
      span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_IDLE_SPAN_FINISH_REASON, _finishReason);
    }
    logger.log(`[Tracing] Idle span "${spanJSON.op}" finished`);
    const childSpans = getSpanDescendants(span).filter((child) => child !== span);
    let discardedSpans = 0;
    childSpans.forEach((childSpan) => {
      if (childSpan.isRecording()) {
        childSpan.setStatus({
          code: SPAN_STATUS_ERROR,
          message: "cancelled"
        });
        childSpan.end(endTimestamp);
        DEBUG_BUILD2 && logger.log("[Tracing] Cancelling span since span ended early", JSON.stringify(childSpan, void 0, 2));
      }
      const childSpanJSON = spanToJSON(childSpan);
      const {
        timestamp: childEndTimestamp = 0,
        start_timestamp: childStartTimestamp = 0
      } = childSpanJSON;
      const spanStartedBeforeIdleSpanEnd = childStartTimestamp <= endTimestamp;
      const timeoutWithMarginOfError = (finalTimeout + idleTimeout) / 1e3;
      const spanEndedBeforeFinalTimeout = childEndTimestamp - childStartTimestamp <= timeoutWithMarginOfError;
      if (DEBUG_BUILD2) {
        const stringifiedSpan = JSON.stringify(childSpan, void 0, 2);
        if (!spanStartedBeforeIdleSpanEnd) {
          logger.log("[Tracing] Discarding span since it happened after idle span was finished", stringifiedSpan);
        } else if (!spanEndedBeforeFinalTimeout) {
          logger.log("[Tracing] Discarding span since it finished after idle span final timeout", stringifiedSpan);
        }
      }
      if (!spanEndedBeforeFinalTimeout || !spanStartedBeforeIdleSpanEnd) {
        removeChildSpanFromSpan(span, childSpan);
        discardedSpans++;
      }
    });
    if (discardedSpans > 0) {
      span.setAttribute("sentry.idle_span_discarded_spans", discardedSpans);
    }
  }
  _cleanupHooks.push(client.on("spanStart", (startedSpan) => {
    if (_finished || startedSpan === span || !!spanToJSON(startedSpan).timestamp) {
      return;
    }
    const allSpans = getSpanDescendants(span);
    if (allSpans.includes(startedSpan)) {
      _pushActivity(startedSpan.spanContext().spanId);
    }
  }));
  _cleanupHooks.push(client.on("spanEnd", (endedSpan) => {
    if (_finished) {
      return;
    }
    _popActivity(endedSpan.spanContext().spanId);
  }));
  _cleanupHooks.push(client.on("idleSpanEnableAutoFinish", (spanToAllowAutoFinish) => {
    if (spanToAllowAutoFinish === span) {
      _autoFinishAllowed = true;
      _restartIdleTimeout();
      if (activities.size) {
        _restartChildSpanTimeout();
      }
    }
  }));
  if (!options.disableAutoFinish) {
    _restartIdleTimeout();
  }
  setTimeout(() => {
    if (!_finished) {
      span.setStatus({
        code: SPAN_STATUS_ERROR,
        message: "deadline_exceeded"
      });
      _finishReason = FINISH_REASON_FINAL_TIMEOUT;
      span.end();
    }
  }, finalTimeout);
  return span;
}
function _startIdleSpan(options) {
  const span = startInactiveSpan(options);
  _setSpanForScope(getCurrentScope(), span);
  DEBUG_BUILD2 && logger.log("[Tracing] Started span is an idle span");
  return span;
}

// node_modules/@sentry/core/build/esm/eventProcessors.js
function notifyEventProcessors(processors, event, hint, index = 0) {
  return new SyncPromise((resolve2, reject) => {
    const processor = processors[index];
    if (event === null || typeof processor !== "function") {
      resolve2(event);
    } else {
      const result = processor(__spreadValues({}, event), hint);
      DEBUG_BUILD2 && processor.id && result === null && logger.log(`Event processor "${processor.id}" dropped event`);
      if (isThenable(result)) {
        void result.then((final) => notifyEventProcessors(processors, final, hint, index + 1).then(resolve2)).then(null, reject);
      } else {
        void notifyEventProcessors(processors, result, hint, index + 1).then(resolve2).then(null, reject);
      }
    }
  });
}

// node_modules/@sentry/core/build/esm/utils/applyScopeDataToEvent.js
function applyScopeDataToEvent(event, data) {
  const {
    fingerprint,
    span,
    breadcrumbs,
    sdkProcessingMetadata
  } = data;
  applyDataToEvent(event, data);
  if (span) {
    applySpanToEvent(event, span);
  }
  applyFingerprintToEvent(event, fingerprint);
  applyBreadcrumbsToEvent(event, breadcrumbs);
  applySdkMetadataToEvent(event, sdkProcessingMetadata);
}
function mergeScopeData(data, mergeData) {
  const {
    extra,
    tags,
    user,
    contexts,
    level,
    sdkProcessingMetadata,
    breadcrumbs,
    fingerprint,
    eventProcessors,
    attachments,
    propagationContext,
    transactionName,
    span
  } = mergeData;
  mergeAndOverwriteScopeData(data, "extra", extra);
  mergeAndOverwriteScopeData(data, "tags", tags);
  mergeAndOverwriteScopeData(data, "user", user);
  mergeAndOverwriteScopeData(data, "contexts", contexts);
  mergeAndOverwriteScopeData(data, "sdkProcessingMetadata", sdkProcessingMetadata);
  if (level) {
    data.level = level;
  }
  if (transactionName) {
    data.transactionName = transactionName;
  }
  if (span) {
    data.span = span;
  }
  if (breadcrumbs.length) {
    data.breadcrumbs = [...data.breadcrumbs, ...breadcrumbs];
  }
  if (fingerprint.length) {
    data.fingerprint = [...data.fingerprint, ...fingerprint];
  }
  if (eventProcessors.length) {
    data.eventProcessors = [...data.eventProcessors, ...eventProcessors];
  }
  if (attachments.length) {
    data.attachments = [...data.attachments, ...attachments];
  }
  data.propagationContext = __spreadValues(__spreadValues({}, data.propagationContext), propagationContext);
}
function mergeAndOverwriteScopeData(data, prop, mergeVal) {
  if (mergeVal && Object.keys(mergeVal).length) {
    data[prop] = __spreadValues({}, data[prop]);
    for (const key in mergeVal) {
      if (Object.prototype.hasOwnProperty.call(mergeVal, key)) {
        data[prop][key] = mergeVal[key];
      }
    }
  }
}
function applyDataToEvent(event, data) {
  const {
    extra,
    tags,
    user,
    contexts,
    level,
    transactionName
  } = data;
  const cleanedExtra = dropUndefinedKeys(extra);
  if (cleanedExtra && Object.keys(cleanedExtra).length) {
    event.extra = __spreadValues(__spreadValues({}, cleanedExtra), event.extra);
  }
  const cleanedTags = dropUndefinedKeys(tags);
  if (cleanedTags && Object.keys(cleanedTags).length) {
    event.tags = __spreadValues(__spreadValues({}, cleanedTags), event.tags);
  }
  const cleanedUser = dropUndefinedKeys(user);
  if (cleanedUser && Object.keys(cleanedUser).length) {
    event.user = __spreadValues(__spreadValues({}, cleanedUser), event.user);
  }
  const cleanedContexts = dropUndefinedKeys(contexts);
  if (cleanedContexts && Object.keys(cleanedContexts).length) {
    event.contexts = __spreadValues(__spreadValues({}, cleanedContexts), event.contexts);
  }
  if (level) {
    event.level = level;
  }
  if (transactionName && event.type !== "transaction") {
    event.transaction = transactionName;
  }
}
function applyBreadcrumbsToEvent(event, breadcrumbs) {
  const mergedBreadcrumbs = [...event.breadcrumbs || [], ...breadcrumbs];
  event.breadcrumbs = mergedBreadcrumbs.length ? mergedBreadcrumbs : void 0;
}
function applySdkMetadataToEvent(event, sdkProcessingMetadata) {
  event.sdkProcessingMetadata = __spreadValues(__spreadValues({}, event.sdkProcessingMetadata), sdkProcessingMetadata);
}
function applySpanToEvent(event, span) {
  event.contexts = __spreadValues({
    trace: spanToTraceContext(span)
  }, event.contexts);
  event.sdkProcessingMetadata = __spreadValues({
    dynamicSamplingContext: getDynamicSamplingContextFromSpan(span)
  }, event.sdkProcessingMetadata);
  const rootSpan = getRootSpan(span);
  const transactionName = spanToJSON(rootSpan).description;
  if (transactionName && !event.transaction && event.type === "transaction") {
    event.transaction = transactionName;
  }
}
function applyFingerprintToEvent(event, fingerprint) {
  event.fingerprint = event.fingerprint ? arrayify(event.fingerprint) : [];
  if (fingerprint) {
    event.fingerprint = event.fingerprint.concat(fingerprint);
  }
  if (event.fingerprint && !event.fingerprint.length) {
    delete event.fingerprint;
  }
}

// node_modules/@sentry/core/build/esm/utils/prepareEvent.js
function prepareEvent(options, event, hint, scope, client, isolationScope) {
  const {
    normalizeDepth = 3,
    normalizeMaxBreadth = 1e3
  } = options;
  const prepared = __spreadProps(__spreadValues({}, event), {
    event_id: event.event_id || hint.event_id || uuid4(),
    timestamp: event.timestamp || dateTimestampInSeconds()
  });
  const integrations = hint.integrations || options.integrations.map((i2) => i2.name);
  applyClientOptions(prepared, options);
  applyIntegrationsMetadata(prepared, integrations);
  if (client) {
    client.emit("applyFrameMetadata", event);
  }
  if (event.type === void 0) {
    applyDebugIds(prepared, options.stackParser);
  }
  const finalScope = getFinalScope(scope, hint.captureContext);
  if (hint.mechanism) {
    addExceptionMechanism(prepared, hint.mechanism);
  }
  const clientEventProcessors = client ? client.getEventProcessors() : [];
  const data = getGlobalScope().getScopeData();
  if (isolationScope) {
    const isolationData = isolationScope.getScopeData();
    mergeScopeData(data, isolationData);
  }
  if (finalScope) {
    const finalScopeData = finalScope.getScopeData();
    mergeScopeData(data, finalScopeData);
  }
  const attachments = [...hint.attachments || [], ...data.attachments];
  if (attachments.length) {
    hint.attachments = attachments;
  }
  applyScopeDataToEvent(prepared, data);
  const eventProcessors = [
    ...clientEventProcessors,
    // Run scope event processors _after_ all other processors
    ...data.eventProcessors
  ];
  const result = notifyEventProcessors(eventProcessors, prepared, hint);
  return result.then((evt) => {
    if (evt) {
      applyDebugMeta(evt);
    }
    if (typeof normalizeDepth === "number" && normalizeDepth > 0) {
      return normalizeEvent(evt, normalizeDepth, normalizeMaxBreadth);
    }
    return evt;
  });
}
function applyClientOptions(event, options) {
  const {
    environment,
    release,
    dist,
    maxValueLength = 250
  } = options;
  if (!("environment" in event)) {
    event.environment = "environment" in options ? environment : DEFAULT_ENVIRONMENT;
  }
  if (event.release === void 0 && release !== void 0) {
    event.release = release;
  }
  if (event.dist === void 0 && dist !== void 0) {
    event.dist = dist;
  }
  if (event.message) {
    event.message = truncate(event.message, maxValueLength);
  }
  const exception = event.exception && event.exception.values && event.exception.values[0];
  if (exception && exception.value) {
    exception.value = truncate(exception.value, maxValueLength);
  }
  const request = event.request;
  if (request && request.url) {
    request.url = truncate(request.url, maxValueLength);
  }
}
var debugIdStackParserCache = /* @__PURE__ */ new WeakMap();
function applyDebugIds(event, stackParser) {
  const debugIdMap = GLOBAL_OBJ._sentryDebugIds;
  if (!debugIdMap) {
    return;
  }
  let debugIdStackFramesCache;
  const cachedDebugIdStackFrameCache = debugIdStackParserCache.get(stackParser);
  if (cachedDebugIdStackFrameCache) {
    debugIdStackFramesCache = cachedDebugIdStackFrameCache;
  } else {
    debugIdStackFramesCache = /* @__PURE__ */ new Map();
    debugIdStackParserCache.set(stackParser, debugIdStackFramesCache);
  }
  const filenameDebugIdMap = Object.entries(debugIdMap).reduce((acc, [debugIdStackTrace, debugIdValue]) => {
    let parsedStack;
    const cachedParsedStack = debugIdStackFramesCache.get(debugIdStackTrace);
    if (cachedParsedStack) {
      parsedStack = cachedParsedStack;
    } else {
      parsedStack = stackParser(debugIdStackTrace);
      debugIdStackFramesCache.set(debugIdStackTrace, parsedStack);
    }
    for (let i2 = parsedStack.length - 1; i2 >= 0; i2--) {
      const stackFrame = parsedStack[i2];
      if (stackFrame.filename) {
        acc[stackFrame.filename] = debugIdValue;
        break;
      }
    }
    return acc;
  }, {});
  try {
    event.exception.values.forEach((exception) => {
      exception.stacktrace.frames.forEach((frame) => {
        if (frame.filename) {
          frame.debug_id = filenameDebugIdMap[frame.filename];
        }
      });
    });
  } catch (e3) {
  }
}
function applyDebugMeta(event) {
  const filenameDebugIdMap = {};
  try {
    event.exception.values.forEach((exception) => {
      exception.stacktrace.frames.forEach((frame) => {
        if (frame.debug_id) {
          if (frame.abs_path) {
            filenameDebugIdMap[frame.abs_path] = frame.debug_id;
          } else if (frame.filename) {
            filenameDebugIdMap[frame.filename] = frame.debug_id;
          }
          delete frame.debug_id;
        }
      });
    });
  } catch (e3) {
  }
  if (Object.keys(filenameDebugIdMap).length === 0) {
    return;
  }
  event.debug_meta = event.debug_meta || {};
  event.debug_meta.images = event.debug_meta.images || [];
  const images = event.debug_meta.images;
  Object.entries(filenameDebugIdMap).forEach(([filename, debug_id]) => {
    images.push({
      type: "sourcemap",
      code_file: filename,
      debug_id
    });
  });
}
function applyIntegrationsMetadata(event, integrationNames) {
  if (integrationNames.length > 0) {
    event.sdk = event.sdk || {};
    event.sdk.integrations = [...event.sdk.integrations || [], ...integrationNames];
  }
}
function normalizeEvent(event, depth, maxBreadth) {
  if (!event) {
    return null;
  }
  const normalized = __spreadValues(__spreadValues(__spreadValues(__spreadValues(__spreadValues({}, event), event.breadcrumbs && {
    breadcrumbs: event.breadcrumbs.map((b2) => __spreadValues(__spreadValues({}, b2), b2.data && {
      data: normalize(b2.data, depth, maxBreadth)
    }))
  }), event.user && {
    user: normalize(event.user, depth, maxBreadth)
  }), event.contexts && {
    contexts: normalize(event.contexts, depth, maxBreadth)
  }), event.extra && {
    extra: normalize(event.extra, depth, maxBreadth)
  });
  if (event.contexts && event.contexts.trace && normalized.contexts) {
    normalized.contexts.trace = event.contexts.trace;
    if (event.contexts.trace.data) {
      normalized.contexts.trace.data = normalize(event.contexts.trace.data, depth, maxBreadth);
    }
  }
  if (event.spans) {
    normalized.spans = event.spans.map((span) => {
      return __spreadValues(__spreadValues({}, span), span.data && {
        data: normalize(span.data, depth, maxBreadth)
      });
    });
  }
  return normalized;
}
function getFinalScope(scope, captureContext) {
  if (!captureContext) {
    return scope;
  }
  const finalScope = scope ? scope.clone() : new Scope();
  finalScope.update(captureContext);
  return finalScope;
}
function parseEventHintOrCaptureContext(hint) {
  if (!hint) {
    return void 0;
  }
  if (hintIsScopeOrFunction(hint)) {
    return {
      captureContext: hint
    };
  }
  if (hintIsScopeContext(hint)) {
    return {
      captureContext: hint
    };
  }
  return hint;
}
function hintIsScopeOrFunction(hint) {
  return hint instanceof Scope || typeof hint === "function";
}
var captureContextKeys = ["user", "level", "extra", "contexts", "tags", "fingerprint", "requestSession", "propagationContext"];
function hintIsScopeContext(hint) {
  return Object.keys(hint).some((key) => captureContextKeys.includes(key));
}

// node_modules/@sentry/core/build/esm/exports.js
function captureException(exception, hint) {
  return getCurrentScope().captureException(exception, parseEventHintOrCaptureContext(hint));
}
function captureMessage(message, captureContext) {
  const level = typeof captureContext === "string" ? captureContext : void 0;
  const context = typeof captureContext !== "string" ? {
    captureContext
  } : void 0;
  return getCurrentScope().captureMessage(message, level, context);
}
function captureEvent(event, hint) {
  return getCurrentScope().captureEvent(event, hint);
}
function setContext(name, context) {
  getIsolationScope().setContext(name, context);
}
function setExtras(extras) {
  getIsolationScope().setExtras(extras);
}
function setExtra(key, extra) {
  getIsolationScope().setExtra(key, extra);
}
function setTags(tags) {
  getIsolationScope().setTags(tags);
}
function setTag(key, value) {
  getIsolationScope().setTag(key, value);
}
function setUser(user) {
  getIsolationScope().setUser(user);
}
function lastEventId() {
  return getIsolationScope().lastEventId();
}
function flush(timeout) {
  return __async(this, null, function* () {
    const client = getClient();
    if (client) {
      return client.flush(timeout);
    }
    DEBUG_BUILD2 && logger.warn("Cannot flush events. No client defined.");
    return Promise.resolve(false);
  });
}
function close(timeout) {
  return __async(this, null, function* () {
    const client = getClient();
    if (client) {
      return client.close(timeout);
    }
    DEBUG_BUILD2 && logger.warn("Cannot flush events and disable SDK. No client defined.");
    return Promise.resolve(false);
  });
}
function isInitialized() {
  return !!getClient();
}
function addEventProcessor(callback) {
  getIsolationScope().addEventProcessor(callback);
}
function startSession(context) {
  const client = getClient();
  const isolationScope = getIsolationScope();
  const currentScope = getCurrentScope();
  const {
    release,
    environment = DEFAULT_ENVIRONMENT
  } = client && client.getOptions() || {};
  const {
    userAgent
  } = GLOBAL_OBJ.navigator || {};
  const session = makeSession(__spreadValues(__spreadValues({
    release,
    environment,
    user: currentScope.getUser() || isolationScope.getUser()
  }, userAgent && {
    userAgent
  }), context));
  const currentSession = isolationScope.getSession();
  if (currentSession && currentSession.status === "ok") {
    updateSession(currentSession, {
      status: "exited"
    });
  }
  endSession();
  isolationScope.setSession(session);
  currentScope.setSession(session);
  return session;
}
function endSession() {
  const isolationScope = getIsolationScope();
  const currentScope = getCurrentScope();
  const session = currentScope.getSession() || isolationScope.getSession();
  if (session) {
    closeSession(session);
  }
  _sendSessionUpdate();
  isolationScope.setSession();
  currentScope.setSession();
}
function _sendSessionUpdate() {
  const isolationScope = getIsolationScope();
  const currentScope = getCurrentScope();
  const client = getClient();
  const session = currentScope.getSession() || isolationScope.getSession();
  if (session && client) {
    client.captureSession(session);
  }
}
function captureSession(end = false) {
  if (end) {
    endSession();
    return;
  }
  _sendSessionUpdate();
}

// node_modules/@sentry/core/build/esm/api.js
var SENTRY_API_VERSION = "7";
function getBaseApiEndpoint(dsn) {
  const protocol = dsn.protocol ? `${dsn.protocol}:` : "";
  const port = dsn.port ? `:${dsn.port}` : "";
  return `${protocol}//${dsn.host}${port}${dsn.path ? `/${dsn.path}` : ""}/api/`;
}
function _getIngestEndpoint(dsn) {
  return `${getBaseApiEndpoint(dsn)}${dsn.projectId}/envelope/`;
}
function _encodedAuth(dsn, sdkInfo) {
  return urlEncode(__spreadValues({
    // We send only the minimum set of required information. See
    // https://github.com/getsentry/sentry-javascript/issues/2572.
    sentry_key: dsn.publicKey,
    sentry_version: SENTRY_API_VERSION
  }, sdkInfo && {
    sentry_client: `${sdkInfo.name}/${sdkInfo.version}`
  }));
}
function getEnvelopeEndpointWithUrlEncodedAuth(dsn, tunnel, sdkInfo) {
  return tunnel ? tunnel : `${_getIngestEndpoint(dsn)}?${_encodedAuth(dsn, sdkInfo)}`;
}
function getReportDialogEndpoint(dsnLike, dialogOptions) {
  const dsn = makeDsn(dsnLike);
  if (!dsn) {
    return "";
  }
  const endpoint = `${getBaseApiEndpoint(dsn)}embed/error-page/`;
  let encodedOptions = `dsn=${dsnToString(dsn)}`;
  for (const key in dialogOptions) {
    if (key === "dsn") {
      continue;
    }
    if (key === "onClose") {
      continue;
    }
    if (key === "user") {
      const user = dialogOptions.user;
      if (!user) {
        continue;
      }
      if (user.name) {
        encodedOptions += `&name=${encodeURIComponent(user.name)}`;
      }
      if (user.email) {
        encodedOptions += `&email=${encodeURIComponent(user.email)}`;
      }
    } else {
      encodedOptions += `&${encodeURIComponent(key)}=${encodeURIComponent(dialogOptions[key])}`;
    }
  }
  return `${endpoint}?${encodedOptions}`;
}

// node_modules/@sentry/core/build/esm/integration.js
var installedIntegrations = [];
function filterDuplicates(integrations) {
  const integrationsByName = {};
  integrations.forEach((currentInstance) => {
    const {
      name
    } = currentInstance;
    const existingInstance = integrationsByName[name];
    if (existingInstance && !existingInstance.isDefaultInstance && currentInstance.isDefaultInstance) {
      return;
    }
    integrationsByName[name] = currentInstance;
  });
  return Object.values(integrationsByName);
}
function getIntegrationsToSetup(options) {
  const defaultIntegrations = options.defaultIntegrations || [];
  const userIntegrations = options.integrations;
  defaultIntegrations.forEach((integration) => {
    integration.isDefaultInstance = true;
  });
  let integrations;
  if (Array.isArray(userIntegrations)) {
    integrations = [...defaultIntegrations, ...userIntegrations];
  } else if (typeof userIntegrations === "function") {
    integrations = arrayify(userIntegrations(defaultIntegrations));
  } else {
    integrations = defaultIntegrations;
  }
  const finalIntegrations = filterDuplicates(integrations);
  const debugIndex = finalIntegrations.findIndex((integration) => integration.name === "Debug");
  if (debugIndex > -1) {
    const [debugInstance] = finalIntegrations.splice(debugIndex, 1);
    finalIntegrations.push(debugInstance);
  }
  return finalIntegrations;
}
function setupIntegrations(client, integrations) {
  const integrationIndex = {};
  integrations.forEach((integration) => {
    if (integration) {
      setupIntegration(client, integration, integrationIndex);
    }
  });
  return integrationIndex;
}
function afterSetupIntegrations(client, integrations) {
  for (const integration of integrations) {
    if (integration && integration.afterAllSetup) {
      integration.afterAllSetup(client);
    }
  }
}
function setupIntegration(client, integration, integrationIndex) {
  if (integrationIndex[integration.name]) {
    DEBUG_BUILD2 && logger.log(`Integration skipped because it was already installed: ${integration.name}`);
    return;
  }
  integrationIndex[integration.name] = integration;
  if (installedIntegrations.indexOf(integration.name) === -1 && typeof integration.setupOnce === "function") {
    integration.setupOnce();
    installedIntegrations.push(integration.name);
  }
  if (integration.setup && typeof integration.setup === "function") {
    integration.setup(client);
  }
  if (typeof integration.preprocessEvent === "function") {
    const callback = integration.preprocessEvent.bind(integration);
    client.on("preprocessEvent", (event, hint) => callback(event, hint, client));
  }
  if (typeof integration.processEvent === "function") {
    const callback = integration.processEvent.bind(integration);
    const processor = Object.assign((event, hint) => callback(event, hint, client), {
      id: integration.name
    });
    client.addEventProcessor(processor);
  }
  DEBUG_BUILD2 && logger.log(`Integration installed: ${integration.name}`);
}
function addIntegration(integration) {
  const client = getClient();
  if (!client) {
    DEBUG_BUILD2 && logger.warn(`Cannot add integration "${integration.name}" because no SDK Client is available.`);
    return;
  }
  client.addIntegration(integration);
}
function defineIntegration(fn) {
  return fn;
}

// node_modules/@sentry/core/build/esm/baseclient.js
var ALREADY_SEEN_ERROR = "Not capturing exception because it's already been captured.";
var BaseClient = class {
  /** Options passed to the SDK. */
  /** The client Dsn, if specified in options. Without this Dsn, the SDK will be disabled. */
  /** Array of set up integrations. */
  /** Number of calls being processed */
  /** Holds flushable  */
  // eslint-disable-next-line @typescript-eslint/ban-types
  /**
   * Initializes this client instance.
   *
   * @param options Options for the client.
   */
  constructor(options) {
    this._options = options;
    this._integrations = {};
    this._numProcessing = 0;
    this._outcomes = {};
    this._hooks = {};
    this._eventProcessors = [];
    if (options.dsn) {
      this._dsn = makeDsn(options.dsn);
    } else {
      DEBUG_BUILD2 && logger.warn("No DSN provided, client will not send events.");
    }
    if (this._dsn) {
      const url = getEnvelopeEndpointWithUrlEncodedAuth(this._dsn, options.tunnel, options._metadata ? options._metadata.sdk : void 0);
      this._transport = options.transport(__spreadProps(__spreadValues({
        tunnel: this._options.tunnel,
        recordDroppedEvent: this.recordDroppedEvent.bind(this)
      }, options.transportOptions), {
        url
      }));
    }
  }
  /**
   * @inheritDoc
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  captureException(exception, hint, scope) {
    const eventId = uuid4();
    if (checkOrSetAlreadyCaught(exception)) {
      DEBUG_BUILD2 && logger.log(ALREADY_SEEN_ERROR);
      return eventId;
    }
    const hintWithEventId = __spreadValues({
      event_id: eventId
    }, hint);
    this._process(this.eventFromException(exception, hintWithEventId).then((event) => this._captureEvent(event, hintWithEventId, scope)));
    return hintWithEventId.event_id;
  }
  /**
   * @inheritDoc
   */
  captureMessage(message, level, hint, currentScope) {
    const hintWithEventId = __spreadValues({
      event_id: uuid4()
    }, hint);
    const eventMessage = isParameterizedString(message) ? message : String(message);
    const promisedEvent = isPrimitive(message) ? this.eventFromMessage(eventMessage, level, hintWithEventId) : this.eventFromException(message, hintWithEventId);
    this._process(promisedEvent.then((event) => this._captureEvent(event, hintWithEventId, currentScope)));
    return hintWithEventId.event_id;
  }
  /**
   * @inheritDoc
   */
  captureEvent(event, hint, currentScope) {
    const eventId = uuid4();
    if (hint && hint.originalException && checkOrSetAlreadyCaught(hint.originalException)) {
      DEBUG_BUILD2 && logger.log(ALREADY_SEEN_ERROR);
      return eventId;
    }
    const hintWithEventId = __spreadValues({
      event_id: eventId
    }, hint);
    const sdkProcessingMetadata = event.sdkProcessingMetadata || {};
    const capturedSpanScope = sdkProcessingMetadata.capturedSpanScope;
    this._process(this._captureEvent(event, hintWithEventId, capturedSpanScope || currentScope));
    return hintWithEventId.event_id;
  }
  /**
   * @inheritDoc
   */
  captureSession(session) {
    if (!(typeof session.release === "string")) {
      DEBUG_BUILD2 && logger.warn("Discarded session because of missing or non-string release");
    } else {
      this.sendSession(session);
      updateSession(session, {
        init: false
      });
    }
  }
  /**
   * @inheritDoc
   */
  getDsn() {
    return this._dsn;
  }
  /**
   * @inheritDoc
   */
  getOptions() {
    return this._options;
  }
  /**
   * @see SdkMetadata in @sentry/types
   *
   * @return The metadata of the SDK
   */
  getSdkMetadata() {
    return this._options._metadata;
  }
  /**
   * @inheritDoc
   */
  getTransport() {
    return this._transport;
  }
  /**
   * @inheritDoc
   */
  flush(timeout) {
    const transport = this._transport;
    if (transport) {
      this.emit("flush");
      return this._isClientDoneProcessing(timeout).then((clientFinished) => {
        return transport.flush(timeout).then((transportFlushed) => clientFinished && transportFlushed);
      });
    } else {
      return resolvedSyncPromise(true);
    }
  }
  /**
   * @inheritDoc
   */
  close(timeout) {
    return this.flush(timeout).then((result) => {
      this.getOptions().enabled = false;
      this.emit("close");
      return result;
    });
  }
  /** Get all installed event processors. */
  getEventProcessors() {
    return this._eventProcessors;
  }
  /** @inheritDoc */
  addEventProcessor(eventProcessor) {
    this._eventProcessors.push(eventProcessor);
  }
  /** @inheritdoc */
  init() {
    if (this._isEnabled() || // Force integrations to be setup even if no DSN was set when we have
    // Spotlight enabled. This is particularly important for browser as we
    // don't support the `spotlight` option there and rely on the users
    // adding the `spotlightBrowserIntegration()` to their integrations which
    // wouldn't get initialized with the check below when there's no DSN set.
    this._options.integrations.some(({
      name
    }) => name.startsWith("Spotlight"))) {
      this._setupIntegrations();
    }
  }
  /**
   * Gets an installed integration by its name.
   *
   * @returns The installed integration or `undefined` if no integration with that `name` was installed.
   */
  getIntegrationByName(integrationName) {
    return this._integrations[integrationName];
  }
  /**
   * @inheritDoc
   */
  addIntegration(integration) {
    const isAlreadyInstalled = this._integrations[integration.name];
    setupIntegration(this, integration, this._integrations);
    if (!isAlreadyInstalled) {
      afterSetupIntegrations(this, [integration]);
    }
  }
  /**
   * @inheritDoc
   */
  sendEvent(event, hint = {}) {
    this.emit("beforeSendEvent", event, hint);
    let env = createEventEnvelope(event, this._dsn, this._options._metadata, this._options.tunnel);
    for (const attachment of hint.attachments || []) {
      env = addItemToEnvelope(env, createAttachmentEnvelopeItem(attachment));
    }
    const promise = this.sendEnvelope(env);
    if (promise) {
      promise.then((sendResponse) => this.emit("afterSendEvent", event, sendResponse), null);
    }
  }
  /**
   * @inheritDoc
   */
  sendSession(session) {
    const env = createSessionEnvelope(session, this._dsn, this._options._metadata, this._options.tunnel);
    this.sendEnvelope(env);
  }
  /**
   * @inheritDoc
   */
  recordDroppedEvent(reason, category, eventOrCount) {
    if (this._options.sendClientReports) {
      const count = typeof eventOrCount === "number" ? eventOrCount : 1;
      const key = `${reason}:${category}`;
      DEBUG_BUILD2 && logger.log(`Recording outcome: "${key}"${count > 1 ? ` (${count} times)` : ""}`);
      this._outcomes[key] = (this._outcomes[key] || 0) + count;
    }
  }
  // Keep on() & emit() signatures in sync with types' client.ts interface
  /* eslint-disable @typescript-eslint/unified-signatures */
  /** @inheritdoc */
  /** @inheritdoc */
  on(hook, callback) {
    const hooks2 = this._hooks[hook] = this._hooks[hook] || [];
    hooks2.push(callback);
    return () => {
      const cbIndex = hooks2.indexOf(callback);
      if (cbIndex > -1) {
        hooks2.splice(cbIndex, 1);
      }
    };
  }
  /** @inheritdoc */
  /** @inheritdoc */
  emit(hook, ...rest) {
    const callbacks = this._hooks[hook];
    if (callbacks) {
      callbacks.forEach((callback) => callback(...rest));
    }
  }
  /**
   * @inheritdoc
   */
  sendEnvelope(envelope) {
    this.emit("beforeEnvelope", envelope);
    if (this._isEnabled() && this._transport) {
      return this._transport.send(envelope).then(null, (reason) => {
        DEBUG_BUILD2 && logger.error("Error while sending event:", reason);
        return reason;
      });
    }
    DEBUG_BUILD2 && logger.error("Transport disabled");
    return resolvedSyncPromise({});
  }
  /* eslint-enable @typescript-eslint/unified-signatures */
  /** Setup integrations for this client. */
  _setupIntegrations() {
    const {
      integrations
    } = this._options;
    this._integrations = setupIntegrations(this, integrations);
    afterSetupIntegrations(this, integrations);
  }
  /** Updates existing session based on the provided event */
  _updateSessionFromEvent(session, event) {
    let crashed = false;
    let errored = false;
    const exceptions = event.exception && event.exception.values;
    if (exceptions) {
      errored = true;
      for (const ex of exceptions) {
        const mechanism = ex.mechanism;
        if (mechanism && mechanism.handled === false) {
          crashed = true;
          break;
        }
      }
    }
    const sessionNonTerminal = session.status === "ok";
    const shouldUpdateAndSend = sessionNonTerminal && session.errors === 0 || sessionNonTerminal && crashed;
    if (shouldUpdateAndSend) {
      updateSession(session, __spreadProps(__spreadValues({}, crashed && {
        status: "crashed"
      }), {
        errors: session.errors || Number(errored || crashed)
      }));
      this.captureSession(session);
    }
  }
  /**
   * Determine if the client is finished processing. Returns a promise because it will wait `timeout` ms before saying
   * "no" (resolving to `false`) in order to give the client a chance to potentially finish first.
   *
   * @param timeout The time, in ms, after which to resolve to `false` if the client is still busy. Passing `0` (or not
   * passing anything) will make the promise wait as long as it takes for processing to finish before resolving to
   * `true`.
   * @returns A promise which will resolve to `true` if processing is already done or finishes before the timeout, and
   * `false` otherwise
   */
  _isClientDoneProcessing(timeout) {
    return new SyncPromise((resolve2) => {
      let ticked = 0;
      const tick = 1;
      const interval = setInterval(() => {
        if (this._numProcessing == 0) {
          clearInterval(interval);
          resolve2(true);
        } else {
          ticked += tick;
          if (timeout && ticked >= timeout) {
            clearInterval(interval);
            resolve2(false);
          }
        }
      }, tick);
    });
  }
  /** Determines whether this SDK is enabled and a transport is present. */
  _isEnabled() {
    return this.getOptions().enabled !== false && this._transport !== void 0;
  }
  /**
   * Adds common information to events.
   *
   * The information includes release and environment from `options`,
   * breadcrumbs and context (extra, tags and user) from the scope.
   *
   * Information that is already present in the event is never overwritten. For
   * nested objects, such as the context, keys are merged.
   *
   * @param event The original event.
   * @param hint May contain additional information about the original exception.
   * @param currentScope A scope containing event metadata.
   * @returns A new event with more information.
   */
  _prepareEvent(event, hint, currentScope, isolationScope = getIsolationScope()) {
    const options = this.getOptions();
    const integrations = Object.keys(this._integrations);
    if (!hint.integrations && integrations.length > 0) {
      hint.integrations = integrations;
    }
    this.emit("preprocessEvent", event, hint);
    if (!event.type) {
      isolationScope.setLastEventId(event.event_id || hint.event_id);
    }
    return prepareEvent(options, event, hint, currentScope, this, isolationScope).then((evt) => {
      if (evt === null) {
        return evt;
      }
      const propagationContext = __spreadValues(__spreadValues({}, isolationScope.getPropagationContext()), currentScope ? currentScope.getPropagationContext() : void 0);
      const trace = evt.contexts && evt.contexts.trace;
      if (!trace && propagationContext) {
        const {
          traceId: trace_id,
          spanId,
          parentSpanId,
          dsc
        } = propagationContext;
        evt.contexts = __spreadValues({
          trace: dropUndefinedKeys({
            trace_id,
            span_id: spanId,
            parent_span_id: parentSpanId
          })
        }, evt.contexts);
        const dynamicSamplingContext = dsc ? dsc : getDynamicSamplingContextFromClient(trace_id, this);
        evt.sdkProcessingMetadata = __spreadValues({
          dynamicSamplingContext
        }, evt.sdkProcessingMetadata);
      }
      return evt;
    });
  }
  /**
   * Processes the event and logs an error in case of rejection
   * @param event
   * @param hint
   * @param scope
   */
  _captureEvent(event, hint = {}, scope) {
    return this._processEvent(event, hint, scope).then((finalEvent) => {
      return finalEvent.event_id;
    }, (reason) => {
      if (DEBUG_BUILD2) {
        const sentryError = reason;
        if (sentryError.logLevel === "log") {
          logger.log(sentryError.message);
        } else {
          logger.warn(sentryError);
        }
      }
      return void 0;
    });
  }
  /**
   * Processes an event (either error or message) and sends it to Sentry.
   *
   * This also adds breadcrumbs and context information to the event. However,
   * platform specific meta data (such as the User's IP address) must be added
   * by the SDK implementor.
   *
   *
   * @param event The event to send to Sentry.
   * @param hint May contain additional information about the original exception.
   * @param currentScope A scope containing event metadata.
   * @returns A SyncPromise that resolves with the event or rejects in case event was/will not be send.
   */
  _processEvent(event, hint, currentScope) {
    const options = this.getOptions();
    const {
      sampleRate
    } = options;
    const isTransaction = isTransactionEvent(event);
    const isError2 = isErrorEvent2(event);
    const eventType = event.type || "error";
    const beforeSendLabel = `before send for type \`${eventType}\``;
    const parsedSampleRate = typeof sampleRate === "undefined" ? void 0 : parseSampleRate(sampleRate);
    if (isError2 && typeof parsedSampleRate === "number" && Math.random() > parsedSampleRate) {
      this.recordDroppedEvent("sample_rate", "error", event);
      return rejectedSyncPromise(new SentryError(`Discarding event because it's not included in the random sample (sampling rate = ${sampleRate})`, "log"));
    }
    const dataCategory = eventType === "replay_event" ? "replay" : eventType;
    const sdkProcessingMetadata = event.sdkProcessingMetadata || {};
    const capturedSpanIsolationScope = sdkProcessingMetadata.capturedSpanIsolationScope;
    return this._prepareEvent(event, hint, currentScope, capturedSpanIsolationScope).then((prepared) => {
      if (prepared === null) {
        this.recordDroppedEvent("event_processor", dataCategory, event);
        throw new SentryError("An event processor returned `null`, will not send event.", "log");
      }
      const isInternalException = hint.data && hint.data.__sentry__ === true;
      if (isInternalException) {
        return prepared;
      }
      const result = processBeforeSend(this, options, prepared, hint);
      return _validateBeforeSendResult(result, beforeSendLabel);
    }).then((processedEvent) => {
      if (processedEvent === null) {
        this.recordDroppedEvent("before_send", dataCategory, event);
        if (isTransaction) {
          const spans = event.spans || [];
          const spanCount = 1 + spans.length;
          this.recordDroppedEvent("before_send", "span", spanCount);
        }
        throw new SentryError(`${beforeSendLabel} returned \`null\`, will not send event.`, "log");
      }
      const session = currentScope && currentScope.getSession();
      if (!isTransaction && session) {
        this._updateSessionFromEvent(session, processedEvent);
      }
      if (isTransaction) {
        const spanCountBefore = processedEvent.sdkProcessingMetadata && processedEvent.sdkProcessingMetadata.spanCountBeforeProcessing || 0;
        const spanCountAfter = processedEvent.spans ? processedEvent.spans.length : 0;
        const droppedSpanCount = spanCountBefore - spanCountAfter;
        if (droppedSpanCount > 0) {
          this.recordDroppedEvent("before_send", "span", droppedSpanCount);
        }
      }
      const transactionInfo = processedEvent.transaction_info;
      if (isTransaction && transactionInfo && processedEvent.transaction !== event.transaction) {
        const source = "custom";
        processedEvent.transaction_info = __spreadProps(__spreadValues({}, transactionInfo), {
          source
        });
      }
      this.sendEvent(processedEvent, hint);
      return processedEvent;
    }).then(null, (reason) => {
      if (reason instanceof SentryError) {
        throw reason;
      }
      this.captureException(reason, {
        data: {
          __sentry__: true
        },
        originalException: reason
      });
      throw new SentryError(`Event processing pipeline threw an error, original event will not be sent. Details have been sent as a new event.
Reason: ${reason}`);
    });
  }
  /**
   * Occupies the client with processing and event
   */
  _process(promise) {
    this._numProcessing++;
    void promise.then((value) => {
      this._numProcessing--;
      return value;
    }, (reason) => {
      this._numProcessing--;
      return reason;
    });
  }
  /**
   * Clears outcomes on this client and returns them.
   */
  _clearOutcomes() {
    const outcomes = this._outcomes;
    this._outcomes = {};
    return Object.entries(outcomes).map(([key, quantity]) => {
      const [reason, category] = key.split(":");
      return {
        reason,
        category,
        quantity
      };
    });
  }
  /**
   * Sends client reports as an envelope.
   */
  _flushOutcomes() {
    DEBUG_BUILD2 && logger.log("Flushing outcomes...");
    const outcomes = this._clearOutcomes();
    if (outcomes.length === 0) {
      DEBUG_BUILD2 && logger.log("No outcomes to send");
      return;
    }
    if (!this._dsn) {
      DEBUG_BUILD2 && logger.log("No dsn provided, will not send outcomes");
      return;
    }
    DEBUG_BUILD2 && logger.log("Sending outcomes:", outcomes);
    const envelope = createClientReportEnvelope(outcomes, this._options.tunnel && dsnToString(this._dsn));
    this.sendEnvelope(envelope);
  }
  /**
   * @inheritDoc
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
};
function _validateBeforeSendResult(beforeSendResult, beforeSendLabel) {
  const invalidValueError = `${beforeSendLabel} must return \`null\` or a valid event.`;
  if (isThenable(beforeSendResult)) {
    return beforeSendResult.then((event) => {
      if (!isPlainObject(event) && event !== null) {
        throw new SentryError(invalidValueError);
      }
      return event;
    }, (e3) => {
      throw new SentryError(`${beforeSendLabel} rejected with ${e3}`);
    });
  } else if (!isPlainObject(beforeSendResult) && beforeSendResult !== null) {
    throw new SentryError(invalidValueError);
  }
  return beforeSendResult;
}
function processBeforeSend(client, options, event, hint) {
  const {
    beforeSend,
    beforeSendTransaction,
    beforeSendSpan
  } = options;
  if (isErrorEvent2(event) && beforeSend) {
    return beforeSend(event, hint);
  }
  if (isTransactionEvent(event)) {
    if (event.spans && beforeSendSpan) {
      const processedSpans = [];
      for (const span of event.spans) {
        const processedSpan = beforeSendSpan(span);
        if (processedSpan) {
          processedSpans.push(processedSpan);
        } else {
          client.recordDroppedEvent("before_send", "span");
        }
      }
      event.spans = processedSpans;
    }
    if (beforeSendTransaction) {
      if (event.spans) {
        const spanCountBefore = event.spans.length;
        event.sdkProcessingMetadata = __spreadProps(__spreadValues({}, event.sdkProcessingMetadata), {
          spanCountBeforeProcessing: spanCountBefore
        });
      }
      return beforeSendTransaction(event, hint);
    }
  }
  return event;
}
function isErrorEvent2(event) {
  return event.type === void 0;
}
function isTransactionEvent(event) {
  return event.type === "transaction";
}

// node_modules/@sentry/core/build/esm/sdk.js
function initAndBind(clientClass, options) {
  if (options.debug === true) {
    if (DEBUG_BUILD2) {
      logger.enable();
    } else {
      consoleSandbox(() => {
        console.warn("[Sentry] Cannot initialize SDK with `debug` option using a non-debug bundle.");
      });
    }
  }
  const scope = getCurrentScope();
  scope.update(options.initialScope);
  const client = new clientClass(options);
  setCurrentClient(client);
  client.init();
  return client;
}
function setCurrentClient(client) {
  getCurrentScope().setClient(client);
}

// node_modules/@sentry/core/build/esm/transports/base.js
var DEFAULT_TRANSPORT_BUFFER_SIZE = 64;
function createTransport(options, makeRequest, buffer = makePromiseBuffer(options.bufferSize || DEFAULT_TRANSPORT_BUFFER_SIZE)) {
  let rateLimits = {};
  const flush2 = (timeout) => buffer.drain(timeout);
  function send(envelope) {
    const filteredEnvelopeItems = [];
    forEachEnvelopeItem(envelope, (item, type) => {
      const dataCategory = envelopeItemTypeToDataCategory(type);
      if (isRateLimited(rateLimits, dataCategory)) {
        const event = getEventForEnvelopeItem(item, type);
        options.recordDroppedEvent("ratelimit_backoff", dataCategory, event);
      } else {
        filteredEnvelopeItems.push(item);
      }
    });
    if (filteredEnvelopeItems.length === 0) {
      return resolvedSyncPromise({});
    }
    const filteredEnvelope = createEnvelope(envelope[0], filteredEnvelopeItems);
    const recordEnvelopeLoss = (reason) => {
      forEachEnvelopeItem(filteredEnvelope, (item, type) => {
        const event = getEventForEnvelopeItem(item, type);
        options.recordDroppedEvent(reason, envelopeItemTypeToDataCategory(type), event);
      });
    };
    const requestTask = () => makeRequest({
      body: serializeEnvelope(filteredEnvelope)
    }).then((response) => {
      if (response.statusCode !== void 0 && (response.statusCode < 200 || response.statusCode >= 300)) {
        DEBUG_BUILD2 && logger.warn(`Sentry responded with status code ${response.statusCode} to sent event.`);
      }
      rateLimits = updateRateLimits(rateLimits, response);
      return response;
    }, (error) => {
      recordEnvelopeLoss("network_error");
      throw error;
    });
    return buffer.add(requestTask).then((result) => result, (error) => {
      if (error instanceof SentryError) {
        DEBUG_BUILD2 && logger.error("Skipped sending event because buffer is full.");
        recordEnvelopeLoss("queue_overflow");
        return resolvedSyncPromise({});
      } else {
        throw error;
      }
    });
  }
  return {
    send,
    flush: flush2
  };
}
function getEventForEnvelopeItem(item, type) {
  if (type !== "event" && type !== "transaction") {
    return void 0;
  }
  return Array.isArray(item) ? item[1] : void 0;
}

// node_modules/@sentry/core/build/esm/transports/offline.js
var MIN_DELAY = 100;
var START_DELAY = 5e3;
var MAX_DELAY = 36e5;
function makeOfflineTransport(createTransport2) {
  function log(...args) {
    DEBUG_BUILD2 && logger.info("[Offline]:", ...args);
  }
  return (options) => {
    const transport = createTransport2(options);
    if (!options.createStore) {
      throw new Error("No `createStore` function was provided");
    }
    const store = options.createStore(options);
    let retryDelay = START_DELAY;
    let flushTimer;
    function shouldQueue(env, error, retryDelay2) {
      if (envelopeContainsItemType(env, ["client_report"])) {
        return false;
      }
      if (options.shouldStore) {
        return options.shouldStore(env, error, retryDelay2);
      }
      return true;
    }
    function flushIn(delay) {
      if (flushTimer) {
        clearTimeout(flushTimer);
      }
      flushTimer = setTimeout(() => __async(this, null, function* () {
        flushTimer = void 0;
        const found = yield store.shift();
        if (found) {
          log("Attempting to send previously queued event");
          found[0].sent_at = (/* @__PURE__ */ new Date()).toISOString();
          void send(found, true).catch((e3) => {
            log("Failed to retry sending", e3);
          });
        }
      }), delay);
      if (typeof flushTimer !== "number" && flushTimer.unref) {
        flushTimer.unref();
      }
    }
    function flushWithBackOff() {
      if (flushTimer) {
        return;
      }
      flushIn(retryDelay);
      retryDelay = Math.min(retryDelay * 2, MAX_DELAY);
    }
    function send(envelope, isRetry = false) {
      return __async(this, null, function* () {
        if (!isRetry && envelopeContainsItemType(envelope, ["replay_event", "replay_recording"])) {
          yield store.push(envelope);
          flushIn(MIN_DELAY);
          return {};
        }
        try {
          const result = yield transport.send(envelope);
          let delay = MIN_DELAY;
          if (result) {
            if (result.headers && result.headers["retry-after"]) {
              delay = parseRetryAfterHeader(result.headers["retry-after"]);
            } else if (result.headers && result.headers["x-sentry-rate-limits"]) {
              delay = 6e4;
            } else if ((result.statusCode || 0) >= 400) {
              return result;
            }
          }
          flushIn(delay);
          retryDelay = START_DELAY;
          return result;
        } catch (e3) {
          if (yield shouldQueue(envelope, e3, retryDelay)) {
            if (isRetry) {
              yield store.unshift(envelope);
            } else {
              yield store.push(envelope);
            }
            flushWithBackOff();
            log("Error sending. Event queued.", e3);
            return {};
          } else {
            throw e3;
          }
        }
      });
    }
    if (options.flushAtStartup) {
      flushWithBackOff();
    }
    return {
      send,
      flush: (t3) => transport.flush(t3)
    };
  };
}

// node_modules/@sentry/core/build/esm/transports/multiplexed.js
function eventFromEnvelope(env, types) {
  let event;
  forEachEnvelopeItem(env, (item, type) => {
    if (types.includes(type)) {
      event = Array.isArray(item) ? item[1] : void 0;
    }
    return !!event;
  });
  return event;
}
function makeOverrideReleaseTransport(createTransport2, release) {
  return (options) => {
    const transport = createTransport2(options);
    return __spreadProps(__spreadValues({}, transport), {
      send: (envelope) => __async(this, null, function* () {
        const event = eventFromEnvelope(envelope, ["event", "transaction", "profile", "replay_event"]);
        if (event) {
          event.release = release;
        }
        return transport.send(envelope);
      })
    });
  };
}
function overrideDsn(envelope, dsn) {
  return createEnvelope(dsn ? __spreadProps(__spreadValues({}, envelope[0]), {
    dsn
  }) : envelope[0], envelope[1]);
}
function makeMultiplexedTransport(createTransport2, matcher) {
  return (options) => {
    const fallbackTransport = createTransport2(options);
    const otherTransports = /* @__PURE__ */ new Map();
    function getTransport(dsn, release) {
      const key = release ? `${dsn}:${release}` : dsn;
      let transport = otherTransports.get(key);
      if (!transport) {
        const validatedDsn = dsnFromString(dsn);
        if (!validatedDsn) {
          return void 0;
        }
        const url = getEnvelopeEndpointWithUrlEncodedAuth(validatedDsn, options.tunnel);
        transport = release ? makeOverrideReleaseTransport(createTransport2, release)(__spreadProps(__spreadValues({}, options), {
          url
        })) : createTransport2(__spreadProps(__spreadValues({}, options), {
          url
        }));
        otherTransports.set(key, transport);
      }
      return [dsn, transport];
    }
    function send(envelope) {
      return __async(this, null, function* () {
        function getEvent(types) {
          const eventTypes = types && types.length ? types : ["event"];
          return eventFromEnvelope(envelope, eventTypes);
        }
        const transports = matcher({
          envelope,
          getEvent
        }).map((result) => {
          if (typeof result === "string") {
            return getTransport(result, void 0);
          } else {
            return getTransport(result.dsn, result.release);
          }
        }).filter((t3) => !!t3);
        const transportsWithFallback = transports.length ? transports : [["", fallbackTransport]];
        const results = yield Promise.all(transportsWithFallback.map(([dsn, transport]) => transport.send(overrideDsn(envelope, dsn))));
        return results[0];
      });
    }
    function flush2(timeout) {
      return __async(this, null, function* () {
        const allTransports = [...otherTransports.values(), fallbackTransport];
        const results = yield Promise.all(allTransports.map((transport) => transport.flush(timeout)));
        return results.every((r4) => r4);
      });
    }
    return {
      send,
      flush: flush2
    };
  };
}

// node_modules/@sentry/core/build/esm/utils/isSentryRequestUrl.js
function isSentryRequestUrl(url, client) {
  const dsn = client && client.getDsn();
  const tunnel = client && client.getOptions().tunnel;
  return checkDsn(url, dsn) || checkTunnel(url, tunnel);
}
function checkTunnel(url, tunnel) {
  if (!tunnel) {
    return false;
  }
  return removeTrailingSlash(url) === removeTrailingSlash(tunnel);
}
function checkDsn(url, dsn) {
  return dsn ? url.includes(dsn.host) : false;
}
function removeTrailingSlash(str) {
  return str[str.length - 1] === "/" ? str.slice(0, -1) : str;
}

// node_modules/@sentry/core/build/esm/utils/parameterize.js
function parameterize(strings, ...values) {
  const formatted = new String(String.raw(strings, ...values));
  formatted.__sentry_template_string__ = strings.join("\0").replace(/%/g, "%%").replace(/\0/g, "%s");
  formatted.__sentry_template_values__ = values;
  return formatted;
}

// node_modules/@sentry/core/build/esm/utils/sdkMetadata.js
function applySdkMetadata(options, name, names = [name], source = "npm") {
  const metadata = options._metadata || {};
  if (!metadata.sdk) {
    metadata.sdk = {
      name: `sentry.javascript.${name}`,
      packages: names.map((name2) => ({
        name: `${source}:@sentry/${name2}`,
        version: SDK_VERSION
      })),
      version: SDK_VERSION
    };
  }
  options._metadata = metadata;
}

// node_modules/@sentry/core/build/esm/breadcrumbs.js
var DEFAULT_BREADCRUMBS = 100;
function addBreadcrumb(breadcrumb, hint) {
  const client = getClient();
  const isolationScope = getIsolationScope();
  if (!client) return;
  const {
    beforeBreadcrumb = null,
    maxBreadcrumbs = DEFAULT_BREADCRUMBS
  } = client.getOptions();
  if (maxBreadcrumbs <= 0) return;
  const timestamp = dateTimestampInSeconds();
  const mergedBreadcrumb = __spreadValues({
    timestamp
  }, breadcrumb);
  const finalBreadcrumb = beforeBreadcrumb ? consoleSandbox(() => beforeBreadcrumb(mergedBreadcrumb, hint)) : mergedBreadcrumb;
  if (finalBreadcrumb === null) return;
  if (client.emit) {
    client.emit("beforeAddBreadcrumb", finalBreadcrumb, hint);
  }
  isolationScope.addBreadcrumb(finalBreadcrumb, maxBreadcrumbs);
}

// node_modules/@sentry/core/build/esm/integrations/functiontostring.js
var originalFunctionToString;
var INTEGRATION_NAME = "FunctionToString";
var SETUP_CLIENTS = /* @__PURE__ */ new WeakMap();
var _functionToStringIntegration = () => {
  return {
    name: INTEGRATION_NAME,
    setupOnce() {
      originalFunctionToString = Function.prototype.toString;
      try {
        Function.prototype.toString = function(...args) {
          const originalFunction = getOriginalFunction(this);
          const context = SETUP_CLIENTS.has(getClient()) && originalFunction !== void 0 ? originalFunction : this;
          return originalFunctionToString.apply(context, args);
        };
      } catch (e3) {
      }
    },
    setup(client) {
      SETUP_CLIENTS.set(client, true);
    }
  };
};
var functionToStringIntegration = defineIntegration(_functionToStringIntegration);

// node_modules/@sentry/core/build/esm/integrations/inboundfilters.js
var DEFAULT_IGNORE_ERRORS = [
  /^Script error\.?$/,
  /^Javascript error: Script error\.? on line 0$/,
  /^ResizeObserver loop completed with undelivered notifications.$/,
  // The browser logs this when a ResizeObserver handler takes a bit longer. Usually this is not an actual issue though. It indicates slowness.
  /^Cannot redefine property: googletag$/,
  // This is thrown when google tag manager is used in combination with an ad blocker
  "undefined is not an object (evaluating 'a.L')",
  // Random error that happens but not actionable or noticeable to end-users.
  `can't redefine non-configurable property "solana"`,
  // Probably a browser extension or custom browser (Brave) throwing this error
  "vv().getRestrictions is not a function. (In 'vv().getRestrictions(1,a)', 'vv().getRestrictions' is undefined)",
  // Error thrown by GTM, seemingly not affecting end-users
  "Can't find variable: _AutofillCallbackHandler"
  // Unactionable error in instagram webview https://developers.facebook.com/community/threads/320013549791141/
];
var INTEGRATION_NAME2 = "InboundFilters";
var _inboundFiltersIntegration = (options = {}) => {
  return {
    name: INTEGRATION_NAME2,
    processEvent(event, _hint, client) {
      const clientOptions = client.getOptions();
      const mergedOptions = _mergeOptions(options, clientOptions);
      return _shouldDropEvent(event, mergedOptions) ? null : event;
    }
  };
};
var inboundFiltersIntegration = defineIntegration(_inboundFiltersIntegration);
function _mergeOptions(internalOptions = {}, clientOptions = {}) {
  return {
    allowUrls: [...internalOptions.allowUrls || [], ...clientOptions.allowUrls || []],
    denyUrls: [...internalOptions.denyUrls || [], ...clientOptions.denyUrls || []],
    ignoreErrors: [...internalOptions.ignoreErrors || [], ...clientOptions.ignoreErrors || [], ...internalOptions.disableErrorDefaults ? [] : DEFAULT_IGNORE_ERRORS],
    ignoreTransactions: [...internalOptions.ignoreTransactions || [], ...clientOptions.ignoreTransactions || []],
    ignoreInternal: internalOptions.ignoreInternal !== void 0 ? internalOptions.ignoreInternal : true
  };
}
function _shouldDropEvent(event, options) {
  if (options.ignoreInternal && _isSentryError(event)) {
    DEBUG_BUILD2 && logger.warn(`Event dropped due to being internal Sentry Error.
Event: ${getEventDescription(event)}`);
    return true;
  }
  if (_isIgnoredError(event, options.ignoreErrors)) {
    DEBUG_BUILD2 && logger.warn(`Event dropped due to being matched by \`ignoreErrors\` option.
Event: ${getEventDescription(event)}`);
    return true;
  }
  if (_isUselessError(event)) {
    DEBUG_BUILD2 && logger.warn(`Event dropped due to not having an error message, error type or stacktrace.
Event: ${getEventDescription(event)}`);
    return true;
  }
  if (_isIgnoredTransaction(event, options.ignoreTransactions)) {
    DEBUG_BUILD2 && logger.warn(`Event dropped due to being matched by \`ignoreTransactions\` option.
Event: ${getEventDescription(event)}`);
    return true;
  }
  if (_isDeniedUrl(event, options.denyUrls)) {
    DEBUG_BUILD2 && logger.warn(`Event dropped due to being matched by \`denyUrls\` option.
Event: ${getEventDescription(event)}.
Url: ${_getEventFilterUrl(event)}`);
    return true;
  }
  if (!_isAllowedUrl(event, options.allowUrls)) {
    DEBUG_BUILD2 && logger.warn(`Event dropped due to not being matched by \`allowUrls\` option.
Event: ${getEventDescription(event)}.
Url: ${_getEventFilterUrl(event)}`);
    return true;
  }
  return false;
}
function _isIgnoredError(event, ignoreErrors) {
  if (event.type || !ignoreErrors || !ignoreErrors.length) {
    return false;
  }
  return _getPossibleEventMessages(event).some((message) => stringMatchesSomePattern(message, ignoreErrors));
}
function _isIgnoredTransaction(event, ignoreTransactions) {
  if (event.type !== "transaction" || !ignoreTransactions || !ignoreTransactions.length) {
    return false;
  }
  const name = event.transaction;
  return name ? stringMatchesSomePattern(name, ignoreTransactions) : false;
}
function _isDeniedUrl(event, denyUrls) {
  if (!denyUrls || !denyUrls.length) {
    return false;
  }
  const url = _getEventFilterUrl(event);
  return !url ? false : stringMatchesSomePattern(url, denyUrls);
}
function _isAllowedUrl(event, allowUrls) {
  if (!allowUrls || !allowUrls.length) {
    return true;
  }
  const url = _getEventFilterUrl(event);
  return !url ? true : stringMatchesSomePattern(url, allowUrls);
}
function _getPossibleEventMessages(event) {
  const possibleMessages = [];
  if (event.message) {
    possibleMessages.push(event.message);
  }
  let lastException;
  try {
    lastException = event.exception.values[event.exception.values.length - 1];
  } catch (e3) {
  }
  if (lastException) {
    if (lastException.value) {
      possibleMessages.push(lastException.value);
      if (lastException.type) {
        possibleMessages.push(`${lastException.type}: ${lastException.value}`);
      }
    }
  }
  return possibleMessages;
}
function _isSentryError(event) {
  try {
    return event.exception.values[0].type === "SentryError";
  } catch (e3) {
  }
  return false;
}
function _getLastValidUrl(frames = []) {
  for (let i2 = frames.length - 1; i2 >= 0; i2--) {
    const frame = frames[i2];
    if (frame && frame.filename !== "<anonymous>" && frame.filename !== "[native code]") {
      return frame.filename || null;
    }
  }
  return null;
}
function _getEventFilterUrl(event) {
  try {
    let frames;
    try {
      frames = event.exception.values[0].stacktrace.frames;
    } catch (e3) {
    }
    return frames ? _getLastValidUrl(frames) : null;
  } catch (oO) {
    DEBUG_BUILD2 && logger.error(`Cannot extract url for event ${getEventDescription(event)}`);
    return null;
  }
}
function _isUselessError(event) {
  if (event.type) {
    return false;
  }
  if (!event.exception || !event.exception.values || event.exception.values.length === 0) {
    return false;
  }
  return (
    // No top-level message
    !event.message && // There are no exception values that have a stacktrace, a non-generic-Error type or value
    !event.exception.values.some((value) => value.stacktrace || value.type && value.type !== "Error" || value.value)
  );
}

// node_modules/@sentry/core/build/esm/integrations/linkederrors.js
var DEFAULT_KEY = "cause";
var DEFAULT_LIMIT = 5;
var INTEGRATION_NAME3 = "LinkedErrors";
var _linkedErrorsIntegration = (options = {}) => {
  const limit = options.limit || DEFAULT_LIMIT;
  const key = options.key || DEFAULT_KEY;
  return {
    name: INTEGRATION_NAME3,
    preprocessEvent(event, hint, client) {
      const options2 = client.getOptions();
      applyAggregateErrorsToEvent(exceptionFromError, options2.stackParser, options2.maxValueLength, key, limit, event, hint);
    }
  };
};
var linkedErrorsIntegration = defineIntegration(_linkedErrorsIntegration);

// node_modules/@sentry/core/build/esm/metadata.js
var filenameMetadataMap = /* @__PURE__ */ new Map();
var parsedStacks = /* @__PURE__ */ new Set();
function ensureMetadataStacksAreParsed(parser) {
  if (!GLOBAL_OBJ._sentryModuleMetadata) {
    return;
  }
  for (const stack of Object.keys(GLOBAL_OBJ._sentryModuleMetadata)) {
    const metadata = GLOBAL_OBJ._sentryModuleMetadata[stack];
    if (parsedStacks.has(stack)) {
      continue;
    }
    parsedStacks.add(stack);
    const frames = parser(stack);
    for (const frame of frames.reverse()) {
      if (frame.filename) {
        filenameMetadataMap.set(frame.filename, metadata);
        break;
      }
    }
  }
}
function getMetadataForUrl(parser, filename) {
  ensureMetadataStacksAreParsed(parser);
  return filenameMetadataMap.get(filename);
}
function addMetadataToStackFrames(parser, event) {
  try {
    event.exception.values.forEach((exception) => {
      if (!exception.stacktrace) {
        return;
      }
      for (const frame of exception.stacktrace.frames || []) {
        if (!frame.filename || frame.module_metadata) {
          continue;
        }
        const metadata = getMetadataForUrl(parser, frame.filename);
        if (metadata) {
          frame.module_metadata = metadata;
        }
      }
    });
  } catch (_2) {
  }
}
function stripMetadataFromStackFrames(event) {
  try {
    event.exception.values.forEach((exception) => {
      if (!exception.stacktrace) {
        return;
      }
      for (const frame of exception.stacktrace.frames || []) {
        delete frame.module_metadata;
      }
    });
  } catch (_2) {
  }
}

// node_modules/@sentry/core/build/esm/integrations/metadata.js
var moduleMetadataIntegration = defineIntegration(() => {
  return {
    name: "ModuleMetadata",
    setup(client) {
      client.on("beforeEnvelope", (envelope) => {
        forEachEnvelopeItem(envelope, (item, type) => {
          if (type === "event") {
            const event = Array.isArray(item) ? item[1] : void 0;
            if (event) {
              stripMetadataFromStackFrames(event);
              item[1] = event;
            }
          }
        });
      });
      client.on("applyFrameMetadata", (event) => {
        if (event.type) {
          return;
        }
        const stackParser = client.getOptions().stackParser;
        addMetadataToStackFrames(stackParser, event);
      });
    }
  };
});

// node_modules/@sentry/core/build/esm/integrations/requestdata.js
var DEFAULT_OPTIONS = {
  include: {
    cookies: true,
    data: true,
    headers: true,
    ip: false,
    query_string: true,
    url: true,
    user: {
      id: true,
      username: true,
      email: true
    }
  },
  transactionNamingScheme: "methodPath"
};
var INTEGRATION_NAME4 = "RequestData";
var _requestDataIntegration = (options = {}) => {
  const _options = __spreadProps(__spreadValues(__spreadValues({}, DEFAULT_OPTIONS), options), {
    include: __spreadProps(__spreadValues(__spreadValues({}, DEFAULT_OPTIONS.include), options.include), {
      user: options.include && typeof options.include.user === "boolean" ? options.include.user : __spreadValues(__spreadValues({}, DEFAULT_OPTIONS.include.user), (options.include || {}).user)
    })
  });
  return {
    name: INTEGRATION_NAME4,
    processEvent(event) {
      const {
        sdkProcessingMetadata = {}
      } = event;
      const req = sdkProcessingMetadata.request;
      if (!req) {
        return event;
      }
      const addRequestDataOptions = convertReqDataIntegrationOptsToAddReqDataOpts(_options);
      return addRequestDataToEvent(event, req, addRequestDataOptions);
    }
  };
};
var requestDataIntegration = defineIntegration(_requestDataIntegration);
function convertReqDataIntegrationOptsToAddReqDataOpts(integrationOptions) {
  const {
    transactionNamingScheme,
    include: _a
  } = integrationOptions, _b = _a, {
    ip,
    user
  } = _b, requestOptions = __objRest(_b, [
    "ip",
    "user"
  ]);
  const requestIncludeKeys = ["method"];
  for (const [key, value] of Object.entries(requestOptions)) {
    if (value) {
      requestIncludeKeys.push(key);
    }
  }
  let addReqDataUserOpt;
  if (user === void 0) {
    addReqDataUserOpt = true;
  } else if (typeof user === "boolean") {
    addReqDataUserOpt = user;
  } else {
    const userIncludeKeys = [];
    for (const [key, value] of Object.entries(user)) {
      if (value) {
        userIncludeKeys.push(key);
      }
    }
    addReqDataUserOpt = userIncludeKeys;
  }
  return {
    include: {
      ip,
      user: addReqDataUserOpt,
      request: requestIncludeKeys.length !== 0 ? requestIncludeKeys : void 0,
      transaction: transactionNamingScheme
    }
  };
}

// node_modules/@sentry/core/build/esm/integrations/captureconsole.js
var INTEGRATION_NAME5 = "CaptureConsole";
var _captureConsoleIntegration = (options = {}) => {
  const levels = options.levels || CONSOLE_LEVELS;
  return {
    name: INTEGRATION_NAME5,
    setup(client) {
      if (!("console" in GLOBAL_OBJ)) {
        return;
      }
      addConsoleInstrumentationHandler(({
        args,
        level
      }) => {
        if (getClient() !== client || !levels.includes(level)) {
          return;
        }
        consoleHandler(args, level);
      });
    }
  };
};
var captureConsoleIntegration = defineIntegration(_captureConsoleIntegration);
function consoleHandler(args, level) {
  const captureContext = {
    level: severityLevelFromString(level),
    extra: {
      arguments: args
    }
  };
  withScope2((scope) => {
    scope.addEventProcessor((event) => {
      event.logger = "console";
      addExceptionMechanism(event, {
        handled: false,
        type: "console"
      });
      return event;
    });
    if (level === "assert") {
      if (!args[0]) {
        const message2 = `Assertion failed: ${safeJoin(args.slice(1), " ") || "console.assert"}`;
        scope.setExtra("arguments", args.slice(1));
        captureMessage(message2, captureContext);
      }
      return;
    }
    const error = args.find((arg) => arg instanceof Error);
    if (error) {
      captureException(error, captureContext);
      return;
    }
    const message = safeJoin(args, " ");
    captureMessage(message, captureContext);
  });
}

// node_modules/@sentry/core/build/esm/integrations/debug.js
var INTEGRATION_NAME6 = "Debug";
var _debugIntegration = (options = {}) => {
  const _options = __spreadValues({
    debugger: false,
    stringify: false
  }, options);
  return {
    name: INTEGRATION_NAME6,
    setup(client) {
      client.on("beforeSendEvent", (event, hint) => {
        if (_options.debugger) {
          debugger;
        }
        consoleSandbox(() => {
          if (_options.stringify) {
            console.log(JSON.stringify(event, null, 2));
            if (hint && Object.keys(hint).length) {
              console.log(JSON.stringify(hint, null, 2));
            }
          } else {
            console.log(event);
            if (hint && Object.keys(hint).length) {
              console.log(hint);
            }
          }
        });
      });
    }
  };
};
var debugIntegration = defineIntegration(_debugIntegration);

// node_modules/@sentry/core/build/esm/integrations/dedupe.js
var INTEGRATION_NAME7 = "Dedupe";
var _dedupeIntegration = () => {
  let previousEvent;
  return {
    name: INTEGRATION_NAME7,
    processEvent(currentEvent) {
      if (currentEvent.type) {
        return currentEvent;
      }
      try {
        if (_shouldDropEvent2(currentEvent, previousEvent)) {
          DEBUG_BUILD2 && logger.warn("Event dropped due to being a duplicate of previously captured event.");
          return null;
        }
      } catch (_oO) {
      }
      return previousEvent = currentEvent;
    }
  };
};
var dedupeIntegration = defineIntegration(_dedupeIntegration);
function _shouldDropEvent2(currentEvent, previousEvent) {
  if (!previousEvent) {
    return false;
  }
  if (_isSameMessageEvent(currentEvent, previousEvent)) {
    return true;
  }
  if (_isSameExceptionEvent(currentEvent, previousEvent)) {
    return true;
  }
  return false;
}
function _isSameMessageEvent(currentEvent, previousEvent) {
  const currentMessage = currentEvent.message;
  const previousMessage = previousEvent.message;
  if (!currentMessage && !previousMessage) {
    return false;
  }
  if (currentMessage && !previousMessage || !currentMessage && previousMessage) {
    return false;
  }
  if (currentMessage !== previousMessage) {
    return false;
  }
  if (!_isSameFingerprint(currentEvent, previousEvent)) {
    return false;
  }
  if (!_isSameStacktrace(currentEvent, previousEvent)) {
    return false;
  }
  return true;
}
function _isSameExceptionEvent(currentEvent, previousEvent) {
  const previousException = _getExceptionFromEvent(previousEvent);
  const currentException = _getExceptionFromEvent(currentEvent);
  if (!previousException || !currentException) {
    return false;
  }
  if (previousException.type !== currentException.type || previousException.value !== currentException.value) {
    return false;
  }
  if (!_isSameFingerprint(currentEvent, previousEvent)) {
    return false;
  }
  if (!_isSameStacktrace(currentEvent, previousEvent)) {
    return false;
  }
  return true;
}
function _isSameStacktrace(currentEvent, previousEvent) {
  let currentFrames = getFramesFromEvent(currentEvent);
  let previousFrames = getFramesFromEvent(previousEvent);
  if (!currentFrames && !previousFrames) {
    return true;
  }
  if (currentFrames && !previousFrames || !currentFrames && previousFrames) {
    return false;
  }
  currentFrames = currentFrames;
  previousFrames = previousFrames;
  if (previousFrames.length !== currentFrames.length) {
    return false;
  }
  for (let i2 = 0; i2 < previousFrames.length; i2++) {
    const frameA = previousFrames[i2];
    const frameB = currentFrames[i2];
    if (frameA.filename !== frameB.filename || frameA.lineno !== frameB.lineno || frameA.colno !== frameB.colno || frameA.function !== frameB.function) {
      return false;
    }
  }
  return true;
}
function _isSameFingerprint(currentEvent, previousEvent) {
  let currentFingerprint = currentEvent.fingerprint;
  let previousFingerprint = previousEvent.fingerprint;
  if (!currentFingerprint && !previousFingerprint) {
    return true;
  }
  if (currentFingerprint && !previousFingerprint || !currentFingerprint && previousFingerprint) {
    return false;
  }
  currentFingerprint = currentFingerprint;
  previousFingerprint = previousFingerprint;
  try {
    return !!(currentFingerprint.join("") === previousFingerprint.join(""));
  } catch (_oO) {
    return false;
  }
}
function _getExceptionFromEvent(event) {
  return event.exception && event.exception.values && event.exception.values[0];
}

// node_modules/@sentry/core/build/esm/integrations/extraerrordata.js
var INTEGRATION_NAME8 = "ExtraErrorData";
var _extraErrorDataIntegration = (options = {}) => {
  const {
    depth = 3,
    captureErrorCause = true
  } = options;
  return {
    name: INTEGRATION_NAME8,
    processEvent(event, hint, client) {
      const {
        maxValueLength = 250
      } = client.getOptions();
      return _enhanceEventWithErrorData(event, hint, depth, captureErrorCause, maxValueLength);
    }
  };
};
var extraErrorDataIntegration = defineIntegration(_extraErrorDataIntegration);
function _enhanceEventWithErrorData(event, hint = {}, depth, captureErrorCause, maxValueLength) {
  if (!hint.originalException || !isError(hint.originalException)) {
    return event;
  }
  const exceptionName = hint.originalException.name || hint.originalException.constructor.name;
  const errorData = _extractErrorData(hint.originalException, captureErrorCause, maxValueLength);
  if (errorData) {
    const contexts = __spreadValues({}, event.contexts);
    const normalizedErrorData = normalize(errorData, depth);
    if (isPlainObject(normalizedErrorData)) {
      addNonEnumerableProperty(normalizedErrorData, "__sentry_skip_normalization__", true);
      contexts[exceptionName] = normalizedErrorData;
    }
    return __spreadProps(__spreadValues({}, event), {
      contexts
    });
  }
  return event;
}
function _extractErrorData(error, captureErrorCause, maxValueLength) {
  try {
    const nativeKeys = ["name", "message", "stack", "line", "column", "fileName", "lineNumber", "columnNumber", "toJSON"];
    const extraErrorInfo = {};
    for (const key of Object.keys(error)) {
      if (nativeKeys.indexOf(key) !== -1) {
        continue;
      }
      const value = error[key];
      extraErrorInfo[key] = isError(value) || typeof value === "string" ? truncate(`${value}`, maxValueLength) : value;
    }
    if (captureErrorCause && error.cause !== void 0) {
      extraErrorInfo.cause = isError(error.cause) ? error.cause.toString() : error.cause;
    }
    if (typeof error.toJSON === "function") {
      const serializedError = error.toJSON();
      for (const key of Object.keys(serializedError)) {
        const value = serializedError[key];
        extraErrorInfo[key] = isError(value) ? value.toString() : value;
      }
    }
    return extraErrorInfo;
  } catch (oO) {
    DEBUG_BUILD2 && logger.error("Unable to extract extra data from the Error object:", oO);
  }
  return null;
}

// node_modules/@sentry/core/build/esm/integrations/rewriteframes.js
var INTEGRATION_NAME9 = "RewriteFrames";
var rewriteFramesIntegration = defineIntegration((options = {}) => {
  const root = options.root;
  const prefix = options.prefix || "app:///";
  const isBrowser2 = "window" in GLOBAL_OBJ && GLOBAL_OBJ.window !== void 0;
  const iteratee = options.iteratee || generateIteratee({
    isBrowser: isBrowser2,
    root,
    prefix
  });
  function _processExceptionsEvent(event) {
    try {
      return __spreadProps(__spreadValues({}, event), {
        exception: __spreadProps(__spreadValues({}, event.exception), {
          // The check for this is performed inside `process` call itself, safe to skip here
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          values: event.exception.values.map((value) => __spreadValues(__spreadValues({}, value), value.stacktrace && {
            stacktrace: _processStacktrace(value.stacktrace)
          }))
        })
      });
    } catch (_oO) {
      return event;
    }
  }
  function _processStacktrace(stacktrace) {
    return __spreadProps(__spreadValues({}, stacktrace), {
      frames: stacktrace && stacktrace.frames && stacktrace.frames.map((f2) => iteratee(f2))
    });
  }
  return {
    name: INTEGRATION_NAME9,
    processEvent(originalEvent) {
      let processedEvent = originalEvent;
      if (originalEvent.exception && Array.isArray(originalEvent.exception.values)) {
        processedEvent = _processExceptionsEvent(processedEvent);
      }
      return processedEvent;
    }
  };
});
function generateIteratee({
  isBrowser: isBrowser2,
  root,
  prefix
}) {
  return (frame) => {
    if (!frame.filename) {
      return frame;
    }
    const isWindowsFrame = /^[a-zA-Z]:\\/.test(frame.filename) || // or the presence of a backslash without a forward slash (which are not allowed on Windows)
    frame.filename.includes("\\") && !frame.filename.includes("/");
    const startsWithSlash = /^\//.test(frame.filename);
    if (isBrowser2) {
      if (root) {
        const oldFilename = frame.filename;
        if (oldFilename.indexOf(root) === 0) {
          frame.filename = oldFilename.replace(root, prefix);
        }
      }
    } else {
      if (isWindowsFrame || startsWithSlash) {
        const filename = isWindowsFrame ? frame.filename.replace(/^[a-zA-Z]:/, "").replace(/\\/g, "/") : frame.filename;
        const base = root ? relative(root, filename) : basename(filename);
        frame.filename = `${prefix}${base}`;
      }
    }
    return frame;
  };
}

// node_modules/@sentry/core/build/esm/integrations/sessiontiming.js
var INTEGRATION_NAME10 = "SessionTiming";
var _sessionTimingIntegration = () => {
  const startTime = timestampInSeconds() * 1e3;
  return {
    name: INTEGRATION_NAME10,
    processEvent(event) {
      const now = timestampInSeconds() * 1e3;
      return __spreadProps(__spreadValues({}, event), {
        extra: __spreadProps(__spreadValues({}, event.extra), {
          ["session:start"]: startTime,
          ["session:duration"]: now - startTime,
          ["session:end"]: now
        })
      });
    }
  };
};
var sessionTimingIntegration = defineIntegration(_sessionTimingIntegration);

// node_modules/@sentry/core/build/esm/integrations/zoderrors.js
var DEFAULT_LIMIT2 = 10;
var INTEGRATION_NAME11 = "ZodErrors";
function originalExceptionIsZodError(originalException) {
  return isError(originalException) && originalException.name === "ZodError" && Array.isArray(originalException.errors);
}
function formatIssueTitle(issue) {
  return __spreadProps(__spreadValues({}, issue), {
    path: "path" in issue && Array.isArray(issue.path) ? issue.path.join(".") : void 0,
    keys: "keys" in issue ? JSON.stringify(issue.keys) : void 0,
    unionErrors: "unionErrors" in issue ? JSON.stringify(issue.unionErrors) : void 0
  });
}
function formatIssueMessage(zodError) {
  const errorKeyMap = /* @__PURE__ */ new Set();
  for (const iss of zodError.issues) {
    if (iss.path && iss.path[0]) {
      errorKeyMap.add(iss.path[0]);
    }
  }
  const errorKeys = Array.from(errorKeyMap);
  return `Failed to validate keys: ${truncate(errorKeys.join(", "), 100)}`;
}
function applyZodErrorsToEvent(limit, event, hint) {
  if (!event.exception || !event.exception.values || !hint || !hint.originalException || !originalExceptionIsZodError(hint.originalException) || hint.originalException.issues.length === 0) {
    return event;
  }
  return __spreadProps(__spreadValues({}, event), {
    exception: __spreadProps(__spreadValues({}, event.exception), {
      values: [__spreadProps(__spreadValues({}, event.exception.values[0]), {
        value: formatIssueMessage(hint.originalException)
      }), ...event.exception.values.slice(1)]
    }),
    extra: __spreadProps(__spreadValues({}, event.extra), {
      "zoderror.issues": hint.originalException.errors.slice(0, limit).map(formatIssueTitle)
    })
  });
}
var _zodErrorsIntegration = (options = {}) => {
  const limit = options.limit || DEFAULT_LIMIT2;
  return {
    name: INTEGRATION_NAME11,
    processEvent(originalEvent, hint) {
      const processedEvent = applyZodErrorsToEvent(limit, originalEvent, hint);
      return processedEvent;
    }
  };
};
var zodErrorsIntegration = defineIntegration(_zodErrorsIntegration);

// node_modules/@sentry/core/build/esm/integrations/third-party-errors-filter.js
var thirdPartyErrorFilterIntegration = defineIntegration((options) => {
  return {
    name: "ThirdPartyErrorsFilter",
    setup(client) {
      client.on("beforeEnvelope", (envelope) => {
        forEachEnvelopeItem(envelope, (item, type) => {
          if (type === "event") {
            const event = Array.isArray(item) ? item[1] : void 0;
            if (event) {
              stripMetadataFromStackFrames(event);
              item[1] = event;
            }
          }
        });
      });
      client.on("applyFrameMetadata", (event) => {
        if (event.type) {
          return;
        }
        const stackParser = client.getOptions().stackParser;
        addMetadataToStackFrames(stackParser, event);
      });
    },
    processEvent(event) {
      const frameKeys = getBundleKeysForAllFramesWithFilenames(event);
      if (frameKeys) {
        const arrayMethod = options.behaviour === "drop-error-if-contains-third-party-frames" || options.behaviour === "apply-tag-if-contains-third-party-frames" ? "some" : "every";
        const behaviourApplies = frameKeys[arrayMethod]((keys2) => !keys2.some((key) => options.filterKeys.includes(key)));
        if (behaviourApplies) {
          const shouldDrop = options.behaviour === "drop-error-if-contains-third-party-frames" || options.behaviour === "drop-error-if-exclusively-contains-third-party-frames";
          if (shouldDrop) {
            return null;
          } else {
            event.tags = __spreadProps(__spreadValues({}, event.tags), {
              third_party_code: true
            });
          }
        }
      }
      return event;
    }
  };
});
function getBundleKeysForAllFramesWithFilenames(event) {
  const frames = getFramesFromEvent(event);
  if (!frames) {
    return void 0;
  }
  return frames.filter((frame) => !!frame.filename).map((frame) => {
    if (frame.module_metadata) {
      return Object.keys(frame.module_metadata).filter((key) => key.startsWith(BUNDLER_PLUGIN_APP_KEY_PREFIX)).map((key) => key.slice(BUNDLER_PLUGIN_APP_KEY_PREFIX.length));
    }
    return [];
  });
}
var BUNDLER_PLUGIN_APP_KEY_PREFIX = "_sentryBundlerPluginAppKey:";

// node_modules/@sentry/core/build/esm/metrics/constants.js
var COUNTER_METRIC_TYPE = "c";
var GAUGE_METRIC_TYPE = "g";
var SET_METRIC_TYPE = "s";
var DISTRIBUTION_METRIC_TYPE = "d";
var DEFAULT_BROWSER_FLUSH_INTERVAL = 5e3;

// node_modules/@sentry/core/build/esm/metrics/exports.js
function getMetricsAggregatorForClient(client, Aggregator) {
  const globalMetricsAggregators = getGlobalSingleton("globalMetricsAggregators", () => /* @__PURE__ */ new WeakMap());
  const aggregator = globalMetricsAggregators.get(client);
  if (aggregator) {
    return aggregator;
  }
  const newAggregator = new Aggregator(client);
  client.on("flush", () => newAggregator.flush());
  client.on("close", () => newAggregator.close());
  globalMetricsAggregators.set(client, newAggregator);
  return newAggregator;
}
function addToMetricsAggregator(Aggregator, metricType, name, value, data = {}) {
  const client = data.client || getClient();
  if (!client) {
    return;
  }
  const span = getActiveSpan();
  const rootSpan = span ? getRootSpan(span) : void 0;
  const transactionName = rootSpan && spanToJSON(rootSpan).description;
  const {
    unit,
    tags,
    timestamp
  } = data;
  const {
    release,
    environment
  } = client.getOptions();
  const metricTags = {};
  if (release) {
    metricTags.release = release;
  }
  if (environment) {
    metricTags.environment = environment;
  }
  if (transactionName) {
    metricTags.transaction = transactionName;
  }
  DEBUG_BUILD2 && logger.log(`Adding value of ${value} to ${metricType} metric ${name}`);
  const aggregator = getMetricsAggregatorForClient(client, Aggregator);
  aggregator.add(metricType, name, value, unit, __spreadValues(__spreadValues({}, metricTags), tags), timestamp);
}
function increment(aggregator, name, value = 1, data) {
  addToMetricsAggregator(aggregator, COUNTER_METRIC_TYPE, name, ensureNumber(value), data);
}
function distribution(aggregator, name, value, data) {
  addToMetricsAggregator(aggregator, DISTRIBUTION_METRIC_TYPE, name, ensureNumber(value), data);
}
function timing(aggregator, name, value, unit = "second", data) {
  if (typeof value === "function") {
    const startTime = timestampInSeconds();
    return startSpanManual({
      op: "metrics.timing",
      name,
      startTime,
      onlyIfParent: true
    }, (span) => {
      return handleCallbackErrors(() => value(), () => {
      }, () => {
        const endTime = timestampInSeconds();
        const timeDiff = endTime - startTime;
        distribution(aggregator, name, timeDiff, __spreadProps(__spreadValues({}, data), {
          unit: "second"
        }));
        span.end(endTime);
      });
    });
  }
  distribution(aggregator, name, value, __spreadProps(__spreadValues({}, data), {
    unit
  }));
}
function set(aggregator, name, value, data) {
  addToMetricsAggregator(aggregator, SET_METRIC_TYPE, name, value, data);
}
function gauge(aggregator, name, value, data) {
  addToMetricsAggregator(aggregator, GAUGE_METRIC_TYPE, name, ensureNumber(value), data);
}
var metrics = {
  increment,
  distribution,
  set,
  gauge,
  timing,
  /**
   * @ignore This is for internal use only.
   */
  getMetricsAggregatorForClient
};
function ensureNumber(number) {
  return typeof number === "string" ? parseInt(number) : number;
}

// node_modules/@sentry/core/build/esm/metrics/utils.js
function getBucketKey(metricType, name, unit, tags) {
  const stringifiedTags = Object.entries(dropUndefinedKeys(tags)).sort((a2, b2) => a2[0].localeCompare(b2[0]));
  return `${metricType}${name}${unit}${stringifiedTags}`;
}
function simpleHash(s2) {
  let rv = 0;
  for (let i2 = 0; i2 < s2.length; i2++) {
    const c2 = s2.charCodeAt(i2);
    rv = (rv << 5) - rv + c2;
    rv &= rv;
  }
  return rv >>> 0;
}
function serializeMetricBuckets(metricBucketItems) {
  let out = "";
  for (const item of metricBucketItems) {
    const tagEntries = Object.entries(item.tags);
    const maybeTags = tagEntries.length > 0 ? `|#${tagEntries.map(([key, value]) => `${key}:${value}`).join(",")}` : "";
    out += `${item.name}@${item.unit}:${item.metric}|${item.metricType}${maybeTags}|T${item.timestamp}
`;
  }
  return out;
}
function sanitizeUnit(unit) {
  return unit.replace(/[^\w]+/gi, "_");
}
function sanitizeMetricKey(key) {
  return key.replace(/[^\w\-.]+/gi, "_");
}
function sanitizeTagKey(key) {
  return key.replace(/[^\w\-./]+/gi, "");
}
var tagValueReplacements = [["\n", "\\n"], ["\r", "\\r"], ["	", "\\t"], ["\\", "\\\\"], ["|", "\\u{7c}"], [",", "\\u{2c}"]];
function getCharOrReplacement(input) {
  for (const [search, replacement] of tagValueReplacements) {
    if (input === search) {
      return replacement;
    }
  }
  return input;
}
function sanitizeTagValue(value) {
  return [...value].reduce((acc, char) => acc + getCharOrReplacement(char), "");
}
function sanitizeTags(unsanitizedTags) {
  const tags = {};
  for (const key in unsanitizedTags) {
    if (Object.prototype.hasOwnProperty.call(unsanitizedTags, key)) {
      const sanitizedKey = sanitizeTagKey(key);
      tags[sanitizedKey] = sanitizeTagValue(String(unsanitizedTags[key]));
    }
  }
  return tags;
}

// node_modules/@sentry/core/build/esm/metrics/envelope.js
function captureAggregateMetrics(client, metricBucketItems) {
  logger.log(`Flushing aggregated metrics, number of metrics: ${metricBucketItems.length}`);
  const dsn = client.getDsn();
  const metadata = client.getSdkMetadata();
  const tunnel = client.getOptions().tunnel;
  const metricsEnvelope = createMetricEnvelope(metricBucketItems, dsn, metadata, tunnel);
  client.sendEnvelope(metricsEnvelope);
}
function createMetricEnvelope(metricBucketItems, dsn, metadata, tunnel) {
  const headers = {
    sent_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  if (metadata && metadata.sdk) {
    headers.sdk = {
      name: metadata.sdk.name,
      version: metadata.sdk.version
    };
  }
  if (!!tunnel && dsn) {
    headers.dsn = dsnToString(dsn);
  }
  const item = createMetricEnvelopeItem(metricBucketItems);
  return createEnvelope(headers, [item]);
}
function createMetricEnvelopeItem(metricBucketItems) {
  const payload = serializeMetricBuckets(metricBucketItems);
  const metricHeaders = {
    type: "statsd",
    length: payload.length
  };
  return [metricHeaders, payload];
}

// node_modules/@sentry/core/build/esm/metrics/instance.js
var CounterMetric = class {
  constructor(_value) {
    this._value = _value;
  }
  /** @inheritDoc */
  get weight() {
    return 1;
  }
  /** @inheritdoc */
  add(value) {
    this._value += value;
  }
  /** @inheritdoc */
  toString() {
    return `${this._value}`;
  }
};
var GaugeMetric = class {
  constructor(value) {
    this._last = value;
    this._min = value;
    this._max = value;
    this._sum = value;
    this._count = 1;
  }
  /** @inheritDoc */
  get weight() {
    return 5;
  }
  /** @inheritdoc */
  add(value) {
    this._last = value;
    if (value < this._min) {
      this._min = value;
    }
    if (value > this._max) {
      this._max = value;
    }
    this._sum += value;
    this._count++;
  }
  /** @inheritdoc */
  toString() {
    return `${this._last}:${this._min}:${this._max}:${this._sum}:${this._count}`;
  }
};
var DistributionMetric = class {
  constructor(first) {
    this._value = [first];
  }
  /** @inheritDoc */
  get weight() {
    return this._value.length;
  }
  /** @inheritdoc */
  add(value) {
    this._value.push(value);
  }
  /** @inheritdoc */
  toString() {
    return this._value.join(":");
  }
};
var SetMetric = class {
  constructor(first) {
    this.first = first;
    this._value = /* @__PURE__ */ new Set([first]);
  }
  /** @inheritDoc */
  get weight() {
    return this._value.size;
  }
  /** @inheritdoc */
  add(value) {
    this._value.add(value);
  }
  /** @inheritdoc */
  toString() {
    return Array.from(this._value).map((val) => typeof val === "string" ? simpleHash(val) : val).join(":");
  }
};
var METRIC_MAP = {
  [COUNTER_METRIC_TYPE]: CounterMetric,
  [GAUGE_METRIC_TYPE]: GaugeMetric,
  [DISTRIBUTION_METRIC_TYPE]: DistributionMetric,
  [SET_METRIC_TYPE]: SetMetric
};

// node_modules/@sentry/core/build/esm/metrics/browser-aggregator.js
var BrowserMetricsAggregator = class {
  // TODO(@anonrig): Use FinalizationRegistry to have a proper way of flushing the buckets
  // when the aggregator is garbage collected.
  // Ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/FinalizationRegistry
  constructor(_client) {
    this._client = _client;
    this._buckets = /* @__PURE__ */ new Map();
    this._interval = setInterval(() => this.flush(), DEFAULT_BROWSER_FLUSH_INTERVAL);
  }
  /**
   * @inheritDoc
   */
  add(metricType, unsanitizedName, value, unsanitizedUnit = "none", unsanitizedTags = {}, maybeFloatTimestamp = timestampInSeconds()) {
    const timestamp = Math.floor(maybeFloatTimestamp);
    const name = sanitizeMetricKey(unsanitizedName);
    const tags = sanitizeTags(unsanitizedTags);
    const unit = sanitizeUnit(unsanitizedUnit);
    const bucketKey = getBucketKey(metricType, name, unit, tags);
    let bucketItem = this._buckets.get(bucketKey);
    const previousWeight = bucketItem && metricType === SET_METRIC_TYPE ? bucketItem.metric.weight : 0;
    if (bucketItem) {
      bucketItem.metric.add(value);
      if (bucketItem.timestamp < timestamp) {
        bucketItem.timestamp = timestamp;
      }
    } else {
      bucketItem = {
        // @ts-expect-error we don't need to narrow down the type of value here, saves bundle size.
        metric: new METRIC_MAP[metricType](value),
        timestamp,
        metricType,
        name,
        unit,
        tags
      };
      this._buckets.set(bucketKey, bucketItem);
    }
    const val = typeof value === "string" ? bucketItem.metric.weight - previousWeight : value;
    updateMetricSummaryOnActiveSpan(metricType, name, val, unit, unsanitizedTags, bucketKey);
  }
  /**
   * @inheritDoc
   */
  flush() {
    if (this._buckets.size === 0) {
      return;
    }
    const metricBuckets = Array.from(this._buckets.values());
    captureAggregateMetrics(this._client, metricBuckets);
    this._buckets.clear();
  }
  /**
   * @inheritDoc
   */
  close() {
    clearInterval(this._interval);
    this.flush();
  }
};

// node_modules/@sentry/core/build/esm/fetch.js
function instrumentFetchRequest(handlerData, shouldCreateSpan, shouldAttachHeaders2, spans, spanOrigin = "auto.http.browser") {
  if (!handlerData.fetchData) {
    return void 0;
  }
  const shouldCreateSpanResult = hasTracingEnabled() && shouldCreateSpan(handlerData.fetchData.url);
  if (handlerData.endTimestamp && shouldCreateSpanResult) {
    const spanId = handlerData.fetchData.__span;
    if (!spanId) return;
    const span2 = spans[spanId];
    if (span2) {
      endSpan(span2, handlerData);
      delete spans[spanId];
    }
    return void 0;
  }
  const scope = getCurrentScope();
  const client = getClient();
  const {
    method,
    url
  } = handlerData.fetchData;
  const fullUrl = getFullURL(url);
  const host = fullUrl ? parseUrl(fullUrl).host : void 0;
  const hasParent = !!getActiveSpan();
  const span = shouldCreateSpanResult && hasParent ? startInactiveSpan({
    name: `${method} ${url}`,
    attributes: {
      url,
      type: "fetch",
      "http.method": method,
      "http.url": fullUrl,
      "server.address": host,
      [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: spanOrigin,
      [SEMANTIC_ATTRIBUTE_SENTRY_OP]: "http.client"
    }
  }) : new SentryNonRecordingSpan();
  handlerData.fetchData.__span = span.spanContext().spanId;
  spans[span.spanContext().spanId] = span;
  if (shouldAttachHeaders2(handlerData.fetchData.url) && client) {
    const request = handlerData.args[0];
    handlerData.args[1] = handlerData.args[1] || {};
    const options = handlerData.args[1];
    options.headers = addTracingHeadersToFetchRequest(
      request,
      client,
      scope,
      options,
      // If performance is disabled (TWP) or there's no active root span (pageload/navigation/interaction),
      // we do not want to use the span as base for the trace headers,
      // which means that the headers will be generated from the scope and the sampling decision is deferred
      hasTracingEnabled() && hasParent ? span : void 0
    );
  }
  return span;
}
function addTracingHeadersToFetchRequest(request, client, scope, fetchOptionsObj, span) {
  const isolationScope = getIsolationScope();
  const {
    traceId,
    spanId,
    sampled,
    dsc
  } = __spreadValues(__spreadValues({}, isolationScope.getPropagationContext()), scope.getPropagationContext());
  const sentryTraceHeader = span ? spanToTraceHeader(span) : generateSentryTraceHeader(traceId, spanId, sampled);
  const sentryBaggageHeader = dynamicSamplingContextToSentryBaggageHeader(dsc || (span ? getDynamicSamplingContextFromSpan(span) : getDynamicSamplingContextFromClient(traceId, client)));
  const headers = fetchOptionsObj.headers || (typeof Request !== "undefined" && isInstanceOf(request, Request) ? request.headers : void 0);
  if (!headers) {
    return {
      "sentry-trace": sentryTraceHeader,
      baggage: sentryBaggageHeader
    };
  } else if (typeof Headers !== "undefined" && isInstanceOf(headers, Headers)) {
    const newHeaders = new Headers(headers);
    newHeaders.set("sentry-trace", sentryTraceHeader);
    if (sentryBaggageHeader) {
      const prevBaggageHeader = newHeaders.get(BAGGAGE_HEADER_NAME);
      if (prevBaggageHeader) {
        const prevHeaderStrippedFromSentryBaggage = stripBaggageHeaderOfSentryBaggageValues(prevBaggageHeader);
        newHeaders.set(
          BAGGAGE_HEADER_NAME,
          // If there are non-sentry entries (i.e. if the stripped string is non-empty/truthy) combine the stripped header and sentry baggage header
          // otherwise just set the sentry baggage header
          prevHeaderStrippedFromSentryBaggage ? `${prevHeaderStrippedFromSentryBaggage},${sentryBaggageHeader}` : sentryBaggageHeader
        );
      } else {
        newHeaders.set(BAGGAGE_HEADER_NAME, sentryBaggageHeader);
      }
    }
    return newHeaders;
  } else if (Array.isArray(headers)) {
    const newHeaders = [
      ...headers.filter((header) => {
        return !(Array.isArray(header) && header[0] === "sentry-trace");
      }).map((header) => {
        if (Array.isArray(header) && header[0] === BAGGAGE_HEADER_NAME && typeof header[1] === "string") {
          const [headerName, headerValue, ...rest] = header;
          return [headerName, stripBaggageHeaderOfSentryBaggageValues(headerValue), ...rest];
        } else {
          return header;
        }
      }),
      // Attach the new sentry-trace header
      ["sentry-trace", sentryTraceHeader]
    ];
    if (sentryBaggageHeader) {
      newHeaders.push([BAGGAGE_HEADER_NAME, sentryBaggageHeader]);
    }
    return newHeaders;
  } else {
    const existingBaggageHeader = "baggage" in headers ? headers.baggage : void 0;
    let newBaggageHeaders = [];
    if (Array.isArray(existingBaggageHeader)) {
      newBaggageHeaders = existingBaggageHeader.map((headerItem) => typeof headerItem === "string" ? stripBaggageHeaderOfSentryBaggageValues(headerItem) : headerItem).filter((headerItem) => headerItem === "");
    } else if (existingBaggageHeader) {
      newBaggageHeaders.push(stripBaggageHeaderOfSentryBaggageValues(existingBaggageHeader));
    }
    if (sentryBaggageHeader) {
      newBaggageHeaders.push(sentryBaggageHeader);
    }
    return __spreadProps(__spreadValues({}, headers), {
      "sentry-trace": sentryTraceHeader,
      baggage: newBaggageHeaders.length > 0 ? newBaggageHeaders.join(",") : void 0
    });
  }
}
function getFullURL(url) {
  try {
    const parsed = new URL(url);
    return parsed.href;
  } catch (e3) {
    return void 0;
  }
}
function endSpan(span, handlerData) {
  if (handlerData.response) {
    setHttpStatus(span, handlerData.response.status);
    const contentLength = handlerData.response && handlerData.response.headers && handlerData.response.headers.get("content-length");
    if (contentLength) {
      const contentLengthNum = parseInt(contentLength);
      if (contentLengthNum > 0) {
        span.setAttribute("http.response_content_length", contentLengthNum);
      }
    }
  } else if (handlerData.error) {
    span.setStatus({
      code: SPAN_STATUS_ERROR,
      message: "internal_error"
    });
  }
  span.end();
}
function stripBaggageHeaderOfSentryBaggageValues(baggageHeader) {
  return baggageHeader.split(",").filter((baggageEntry) => !baggageEntry.split("=")[0].startsWith(SENTRY_BAGGAGE_KEY_PREFIX)).join(",");
}

// node_modules/@sentry/core/build/esm/feedback.js
function captureFeedback(params, hint = {}, scope = getCurrentScope()) {
  const {
    message,
    name,
    email,
    url,
    source,
    associatedEventId,
    tags
  } = params;
  const feedbackEvent = {
    contexts: {
      feedback: dropUndefinedKeys({
        contact_email: email,
        name,
        message,
        url,
        source,
        associated_event_id: associatedEventId
      })
    },
    type: "feedback",
    level: "info",
    tags
  };
  const client = scope && scope.getClient() || getClient();
  if (client) {
    client.emit("beforeSendFeedback", feedbackEvent, hint);
  }
  const eventId = scope.captureEvent(feedbackEvent, hint);
  return eventId;
}

// node_modules/@sentry/core/build/esm/getCurrentHubShim.js
function getCurrentHubShim() {
  return {
    bindClient(client) {
      const scope = getCurrentScope();
      scope.setClient(client);
    },
    withScope: withScope2,
    getClient: () => getClient(),
    getScope: getCurrentScope,
    getIsolationScope,
    captureException: (exception, hint) => {
      return getCurrentScope().captureException(exception, hint);
    },
    captureMessage: (message, level, hint) => {
      return getCurrentScope().captureMessage(message, level, hint);
    },
    captureEvent,
    addBreadcrumb,
    setUser,
    setTags,
    setTag,
    setExtra,
    setExtras,
    setContext,
    getIntegration(integration) {
      const client = getClient();
      return client && client.getIntegrationByName(integration.id) || null;
    },
    startSession,
    endSession,
    captureSession(end) {
      if (end) {
        return endSession();
      }
      _sendSessionUpdate2();
    }
  };
}
var getCurrentHub = getCurrentHubShim;
function _sendSessionUpdate2() {
  const scope = getCurrentScope();
  const client = getClient();
  const session = scope.getSession();
  if (client && session) {
    client.captureSession(session);
  }
}

// node_modules/@sentry/browser/build/npm/esm/helpers.js
var WINDOW4 = GLOBAL_OBJ;
var ignoreOnError = 0;
function shouldIgnoreOnError() {
  return ignoreOnError > 0;
}
function ignoreNextOnError() {
  ignoreOnError++;
  setTimeout(() => {
    ignoreOnError--;
  });
}
function wrap(fn, options = {}, before) {
  if (typeof fn !== "function") {
    return fn;
  }
  try {
    const wrapper = fn.__sentry_wrapped__;
    if (wrapper) {
      if (typeof wrapper === "function") {
        return wrapper;
      } else {
        return fn;
      }
    }
    if (getOriginalFunction(fn)) {
      return fn;
    }
  } catch (e3) {
    return fn;
  }
  const sentryWrapped = function() {
    const args = Array.prototype.slice.call(arguments);
    try {
      if (before && typeof before === "function") {
        before.apply(this, arguments);
      }
      const wrappedArguments = args.map((arg) => wrap(arg, options));
      return fn.apply(this, wrappedArguments);
    } catch (ex) {
      ignoreNextOnError();
      withScope2((scope) => {
        scope.addEventProcessor((event) => {
          if (options.mechanism) {
            addExceptionTypeValue(event, void 0, void 0);
            addExceptionMechanism(event, options.mechanism);
          }
          event.extra = __spreadProps(__spreadValues({}, event.extra), {
            arguments: args
          });
          return event;
        });
        captureException(ex);
      });
      throw ex;
    }
  };
  try {
    for (const property in fn) {
      if (Object.prototype.hasOwnProperty.call(fn, property)) {
        sentryWrapped[property] = fn[property];
      }
    }
  } catch (_oO) {
  }
  markFunctionWrapped(sentryWrapped, fn);
  addNonEnumerableProperty(fn, "__sentry_wrapped__", sentryWrapped);
  try {
    const descriptor = Object.getOwnPropertyDescriptor(sentryWrapped, "name");
    if (descriptor.configurable) {
      Object.defineProperty(sentryWrapped, "name", {
        get() {
          return fn.name;
        }
      });
    }
  } catch (_oO) {
  }
  return sentryWrapped;
}

// node_modules/@sentry/browser/build/npm/esm/debug-build.js
var DEBUG_BUILD3 = typeof __SENTRY_DEBUG__ === "undefined" || __SENTRY_DEBUG__;

// node_modules/@sentry/browser/build/npm/esm/eventbuilder.js
function exceptionFromError2(stackParser, ex) {
  const frames = parseStackFrames2(stackParser, ex);
  const exception = {
    type: extractType(ex),
    value: extractMessage(ex)
  };
  if (frames.length) {
    exception.stacktrace = {
      frames
    };
  }
  if (exception.type === void 0 && exception.value === "") {
    exception.value = "Unrecoverable error caught";
  }
  return exception;
}
function eventFromPlainObject(stackParser, exception, syntheticException, isUnhandledRejection) {
  const client = getClient();
  const normalizeDepth = client && client.getOptions().normalizeDepth;
  const errorFromProp = getErrorPropertyFromObject(exception);
  const extra = {
    __serialized__: normalizeToSize(exception, normalizeDepth)
  };
  if (errorFromProp) {
    return {
      exception: {
        values: [exceptionFromError2(stackParser, errorFromProp)]
      },
      extra
    };
  }
  const event = {
    exception: {
      values: [{
        type: isEvent(exception) ? exception.constructor.name : isUnhandledRejection ? "UnhandledRejection" : "Error",
        value: getNonErrorObjectExceptionValue(exception, {
          isUnhandledRejection
        })
      }]
    },
    extra
  };
  if (syntheticException) {
    const frames = parseStackFrames2(stackParser, syntheticException);
    if (frames.length) {
      event.exception.values[0].stacktrace = {
        frames
      };
    }
  }
  return event;
}
function eventFromError(stackParser, ex) {
  return {
    exception: {
      values: [exceptionFromError2(stackParser, ex)]
    }
  };
}
function parseStackFrames2(stackParser, ex) {
  const stacktrace = ex.stacktrace || ex.stack || "";
  const skipLines = getSkipFirstStackStringLines(ex);
  const framesToPop = getPopFirstTopFrames(ex);
  try {
    return stackParser(stacktrace, skipLines, framesToPop);
  } catch (e3) {
  }
  return [];
}
var reactMinifiedRegexp = /Minified React error #\d+;/i;
function getSkipFirstStackStringLines(ex) {
  if (ex && reactMinifiedRegexp.test(ex.message)) {
    return 1;
  }
  return 0;
}
function getPopFirstTopFrames(ex) {
  if (typeof ex.framesToPop === "number") {
    return ex.framesToPop;
  }
  return 0;
}
function isWebAssemblyException(exception) {
  if (typeof WebAssembly !== "undefined" && typeof WebAssembly.Exception !== "undefined") {
    return exception instanceof WebAssembly.Exception;
  } else {
    return false;
  }
}
function extractType(ex) {
  const name = ex && ex.name;
  if (!name && isWebAssemblyException(ex)) {
    const hasTypeInMessage = ex.message && Array.isArray(ex.message) && ex.message.length == 2;
    return hasTypeInMessage ? ex.message[0] : "WebAssembly.Exception";
  }
  return name;
}
function extractMessage(ex) {
  const message = ex && ex.message;
  if (!message) {
    return "No error message";
  }
  if (message.error && typeof message.error.message === "string") {
    return message.error.message;
  }
  if (isWebAssemblyException(ex) && Array.isArray(ex.message) && ex.message.length == 2) {
    return ex.message[1];
  }
  return message;
}
function eventFromException(stackParser, exception, hint, attachStacktrace) {
  const syntheticException = hint && hint.syntheticException || void 0;
  const event = eventFromUnknownInput2(stackParser, exception, syntheticException, attachStacktrace);
  addExceptionMechanism(event);
  event.level = "error";
  if (hint && hint.event_id) {
    event.event_id = hint.event_id;
  }
  return resolvedSyncPromise(event);
}
function eventFromMessage2(stackParser, message, level = "info", hint, attachStacktrace) {
  const syntheticException = hint && hint.syntheticException || void 0;
  const event = eventFromString(stackParser, message, syntheticException, attachStacktrace);
  event.level = level;
  if (hint && hint.event_id) {
    event.event_id = hint.event_id;
  }
  return resolvedSyncPromise(event);
}
function eventFromUnknownInput2(stackParser, exception, syntheticException, attachStacktrace, isUnhandledRejection) {
  let event;
  if (isErrorEvent(exception) && exception.error) {
    const errorEvent = exception;
    return eventFromError(stackParser, errorEvent.error);
  }
  if (isDOMError(exception) || isDOMException(exception)) {
    const domException = exception;
    if ("stack" in exception) {
      event = eventFromError(stackParser, exception);
    } else {
      const name = domException.name || (isDOMError(domException) ? "DOMError" : "DOMException");
      const message = domException.message ? `${name}: ${domException.message}` : name;
      event = eventFromString(stackParser, message, syntheticException, attachStacktrace);
      addExceptionTypeValue(event, message);
    }
    if ("code" in domException) {
      event.tags = __spreadProps(__spreadValues({}, event.tags), {
        "DOMException.code": `${domException.code}`
      });
    }
    return event;
  }
  if (isError(exception)) {
    return eventFromError(stackParser, exception);
  }
  if (isPlainObject(exception) || isEvent(exception)) {
    const objectException = exception;
    event = eventFromPlainObject(stackParser, objectException, syntheticException, isUnhandledRejection);
    addExceptionMechanism(event, {
      synthetic: true
    });
    return event;
  }
  event = eventFromString(stackParser, exception, syntheticException, attachStacktrace);
  addExceptionTypeValue(event, `${exception}`, void 0);
  addExceptionMechanism(event, {
    synthetic: true
  });
  return event;
}
function eventFromString(stackParser, message, syntheticException, attachStacktrace) {
  const event = {};
  if (attachStacktrace && syntheticException) {
    const frames = parseStackFrames2(stackParser, syntheticException);
    if (frames.length) {
      event.exception = {
        values: [{
          value: message,
          stacktrace: {
            frames
          }
        }]
      };
    }
  }
  if (isParameterizedString(message)) {
    const {
      __sentry_template_string__,
      __sentry_template_values__
    } = message;
    event.logentry = {
      message: __sentry_template_string__,
      params: __sentry_template_values__
    };
    return event;
  }
  event.message = message;
  return event;
}
function getNonErrorObjectExceptionValue(exception, {
  isUnhandledRejection
}) {
  const keys2 = extractExceptionKeysForMessage(exception);
  const captureType = isUnhandledRejection ? "promise rejection" : "exception";
  if (isErrorEvent(exception)) {
    return `Event \`ErrorEvent\` captured as ${captureType} with message \`${exception.message}\``;
  }
  if (isEvent(exception)) {
    const className = getObjectClassName(exception);
    return `Event \`${className}\` (type=${exception.type}) captured as ${captureType}`;
  }
  return `Object captured as ${captureType} with keys: ${keys2}`;
}
function getObjectClassName(obj) {
  try {
    const prototype = Object.getPrototypeOf(obj);
    return prototype ? prototype.constructor.name : void 0;
  } catch (e3) {
  }
}
function getErrorPropertyFromObject(obj) {
  for (const prop in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, prop)) {
      const value = obj[prop];
      if (value instanceof Error) {
        return value;
      }
    }
  }
  return void 0;
}

// node_modules/@sentry/browser/build/npm/esm/userfeedback.js
function createUserFeedbackEnvelope(feedback, {
  metadata,
  tunnel,
  dsn
}) {
  const headers = __spreadValues(__spreadValues({
    event_id: feedback.event_id,
    sent_at: (/* @__PURE__ */ new Date()).toISOString()
  }, metadata && metadata.sdk && {
    sdk: {
      name: metadata.sdk.name,
      version: metadata.sdk.version
    }
  }), !!tunnel && !!dsn && {
    dsn: dsnToString(dsn)
  });
  const item = createUserFeedbackEnvelopeItem(feedback);
  return createEnvelope(headers, [item]);
}
function createUserFeedbackEnvelopeItem(feedback) {
  const feedbackHeaders = {
    type: "user_report"
  };
  return [feedbackHeaders, feedback];
}

// node_modules/@sentry/browser/build/npm/esm/client.js
var BrowserClient = class extends BaseClient {
  /**
   * Creates a new Browser SDK instance.
   *
   * @param options Configuration options for this SDK.
   */
  constructor(options) {
    const opts = __spreadValues({
      // We default this to true, as it is the safer scenario
      parentSpanIsAlwaysRootSpan: true
    }, options);
    const sdkSource = WINDOW4.SENTRY_SDK_SOURCE || getSDKSource();
    applySdkMetadata(opts, "browser", ["browser"], sdkSource);
    super(opts);
    if (opts.sendClientReports && WINDOW4.document) {
      WINDOW4.document.addEventListener("visibilitychange", () => {
        if (WINDOW4.document.visibilityState === "hidden") {
          this._flushOutcomes();
        }
      });
    }
  }
  /**
   * @inheritDoc
   */
  eventFromException(exception, hint) {
    return eventFromException(this._options.stackParser, exception, hint, this._options.attachStacktrace);
  }
  /**
   * @inheritDoc
   */
  eventFromMessage(message, level = "info", hint) {
    return eventFromMessage2(this._options.stackParser, message, level, hint, this._options.attachStacktrace);
  }
  /**
   * Sends user feedback to Sentry.
   *
   * @deprecated Use `captureFeedback` instead.
   */
  captureUserFeedback(feedback) {
    if (!this._isEnabled()) {
      DEBUG_BUILD3 && logger.warn("SDK not enabled, will not capture user feedback.");
      return;
    }
    const envelope = createUserFeedbackEnvelope(feedback, {
      metadata: this.getSdkMetadata(),
      dsn: this.getDsn(),
      tunnel: this.getOptions().tunnel
    });
    this.sendEnvelope(envelope);
  }
  /**
   * @inheritDoc
   */
  _prepareEvent(event, hint, scope) {
    event.platform = event.platform || "javascript";
    return super._prepareEvent(event, hint, scope);
  }
};

// node_modules/@sentry-internal/browser-utils/build/esm/debug-build.js
var DEBUG_BUILD4 = typeof __SENTRY_DEBUG__ === "undefined" || __SENTRY_DEBUG__;

// node_modules/@sentry-internal/browser-utils/build/esm/metrics/web-vitals/lib/bindReporter.js
var getRating = (value, thresholds) => {
  if (value > thresholds[1]) {
    return "poor";
  }
  if (value > thresholds[0]) {
    return "needs-improvement";
  }
  return "good";
};
var bindReporter = (callback, metric, thresholds, reportAllChanges) => {
  let prevValue;
  let delta;
  return (forceReport) => {
    if (metric.value >= 0) {
      if (forceReport || reportAllChanges) {
        delta = metric.value - (prevValue || 0);
        if (delta || prevValue === void 0) {
          prevValue = metric.value;
          metric.delta = delta;
          metric.rating = getRating(metric.value, thresholds);
          callback(metric);
        }
      }
    }
  };
};

// node_modules/@sentry-internal/browser-utils/build/esm/types.js
var WINDOW5 = GLOBAL_OBJ;

// node_modules/@sentry-internal/browser-utils/build/esm/metrics/web-vitals/lib/generateUniqueID.js
var generateUniqueID = () => {
  return `v3-${Date.now()}-${Math.floor(Math.random() * (9e12 - 1)) + 1e12}`;
};

// node_modules/@sentry-internal/browser-utils/build/esm/metrics/web-vitals/lib/getNavigationEntry.js
var getNavigationEntry = () => {
  return WINDOW5.performance && performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
};

// node_modules/@sentry-internal/browser-utils/build/esm/metrics/web-vitals/lib/getActivationStart.js
var getActivationStart = () => {
  const navEntry = getNavigationEntry();
  return navEntry && navEntry.activationStart || 0;
};

// node_modules/@sentry-internal/browser-utils/build/esm/metrics/web-vitals/lib/initMetric.js
var initMetric = (name, value) => {
  const navEntry = getNavigationEntry();
  let navigationType = "navigate";
  if (navEntry) {
    if (WINDOW5.document && WINDOW5.document.prerendering || getActivationStart() > 0) {
      navigationType = "prerender";
    } else if (WINDOW5.document && WINDOW5.document.wasDiscarded) {
      navigationType = "restore";
    } else if (navEntry.type) {
      navigationType = navEntry.type.replace(/_/g, "-");
    }
  }
  const entries = [];
  return {
    name,
    value: typeof value === "undefined" ? -1 : value,
    rating: "good",
    // If needed, will be updated when reported. `const` to keep the type from widening to `string`.
    delta: 0,
    entries,
    id: generateUniqueID(),
    navigationType
  };
};

// node_modules/@sentry-internal/browser-utils/build/esm/metrics/web-vitals/lib/observe.js
var observe = (type, callback, opts) => {
  try {
    if (PerformanceObserver.supportedEntryTypes.includes(type)) {
      const po2 = new PerformanceObserver((list) => {
        Promise.resolve().then(() => {
          callback(list.getEntries());
        });
      });
      po2.observe(Object.assign({
        type,
        buffered: true
      }, opts || {}));
      return po2;
    }
  } catch (e3) {
  }
  return;
};

// node_modules/@sentry-internal/browser-utils/build/esm/metrics/web-vitals/lib/onHidden.js
var onHidden = (cb) => {
  const onHiddenOrPageHide = (event) => {
    if (event.type === "pagehide" || WINDOW5.document && WINDOW5.document.visibilityState === "hidden") {
      cb(event);
    }
  };
  if (WINDOW5.document) {
    addEventListener("visibilitychange", onHiddenOrPageHide, true);
    addEventListener("pagehide", onHiddenOrPageHide, true);
  }
};

// node_modules/@sentry-internal/browser-utils/build/esm/metrics/web-vitals/lib/runOnce.js
var runOnce = (cb) => {
  let called = false;
  return (arg) => {
    if (!called) {
      cb(arg);
      called = true;
    }
  };
};

// node_modules/@sentry-internal/browser-utils/build/esm/metrics/web-vitals/lib/getVisibilityWatcher.js
var firstHiddenTime = -1;
var initHiddenTime = () => {
  firstHiddenTime = WINDOW5.document.visibilityState === "hidden" && !WINDOW5.document.prerendering ? 0 : Infinity;
};
var onVisibilityUpdate = (event) => {
  if (WINDOW5.document.visibilityState === "hidden" && firstHiddenTime > -1) {
    firstHiddenTime = event.type === "visibilitychange" ? event.timeStamp : 0;
    removeEventListener("visibilitychange", onVisibilityUpdate, true);
    removeEventListener("prerenderingchange", onVisibilityUpdate, true);
  }
};
var addChangeListeners = () => {
  addEventListener("visibilitychange", onVisibilityUpdate, true);
  addEventListener("prerenderingchange", onVisibilityUpdate, true);
};
var getVisibilityWatcher = () => {
  if (WINDOW5.document && firstHiddenTime < 0) {
    initHiddenTime();
    addChangeListeners();
  }
  return {
    get firstHiddenTime() {
      return firstHiddenTime;
    }
  };
};

// node_modules/@sentry-internal/browser-utils/build/esm/metrics/web-vitals/lib/whenActivated.js
var whenActivated = (callback) => {
  if (WINDOW5.document && WINDOW5.document.prerendering) {
    addEventListener("prerenderingchange", () => callback(), true);
  } else {
    callback();
  }
};

// node_modules/@sentry-internal/browser-utils/build/esm/metrics/web-vitals/onFCP.js
var FCPThresholds = [1800, 3e3];
var onFCP = (onReport, opts = {}) => {
  whenActivated(() => {
    const visibilityWatcher = getVisibilityWatcher();
    const metric = initMetric("FCP");
    let report;
    const handleEntries = (entries) => {
      entries.forEach((entry) => {
        if (entry.name === "first-contentful-paint") {
          po2.disconnect();
          if (entry.startTime < visibilityWatcher.firstHiddenTime) {
            metric.value = Math.max(entry.startTime - getActivationStart(), 0);
            metric.entries.push(entry);
            report(true);
          }
        }
      });
    };
    const po2 = observe("paint", handleEntries);
    if (po2) {
      report = bindReporter(onReport, metric, FCPThresholds, opts.reportAllChanges);
    }
  });
};

// node_modules/@sentry-internal/browser-utils/build/esm/metrics/web-vitals/getCLS.js
var CLSThresholds = [0.1, 0.25];
var onCLS = (onReport, opts = {}) => {
  onFCP(runOnce(() => {
    const metric = initMetric("CLS", 0);
    let report;
    let sessionValue = 0;
    let sessionEntries = [];
    const handleEntries = (entries) => {
      entries.forEach((entry) => {
        if (!entry.hadRecentInput) {
          const firstSessionEntry = sessionEntries[0];
          const lastSessionEntry = sessionEntries[sessionEntries.length - 1];
          if (sessionValue && firstSessionEntry && lastSessionEntry && entry.startTime - lastSessionEntry.startTime < 1e3 && entry.startTime - firstSessionEntry.startTime < 5e3) {
            sessionValue += entry.value;
            sessionEntries.push(entry);
          } else {
            sessionValue = entry.value;
            sessionEntries = [entry];
          }
        }
      });
      if (sessionValue > metric.value) {
        metric.value = sessionValue;
        metric.entries = sessionEntries;
        report();
      }
    };
    const po2 = observe("layout-shift", handleEntries);
    if (po2) {
      report = bindReporter(onReport, metric, CLSThresholds, opts.reportAllChanges);
      onHidden(() => {
        handleEntries(po2.takeRecords());
        report(true);
      });
      setTimeout(report, 0);
    }
  }));
};

// node_modules/@sentry-internal/browser-utils/build/esm/metrics/web-vitals/getFID.js
var FIDThresholds = [100, 300];
var onFID = (onReport, opts = {}) => {
  whenActivated(() => {
    const visibilityWatcher = getVisibilityWatcher();
    const metric = initMetric("FID");
    let report;
    const handleEntry = (entry) => {
      if (entry.startTime < visibilityWatcher.firstHiddenTime) {
        metric.value = entry.processingStart - entry.startTime;
        metric.entries.push(entry);
        report(true);
      }
    };
    const handleEntries = (entries) => {
      entries.forEach(handleEntry);
    };
    const po2 = observe("first-input", handleEntries);
    report = bindReporter(onReport, metric, FIDThresholds, opts.reportAllChanges);
    if (po2) {
      onHidden(runOnce(() => {
        handleEntries(po2.takeRecords());
        po2.disconnect();
      }));
    }
  });
};

// node_modules/@sentry-internal/browser-utils/build/esm/metrics/web-vitals/lib/polyfills/interactionCountPolyfill.js
var interactionCountEstimate = 0;
var minKnownInteractionId = Infinity;
var maxKnownInteractionId = 0;
var updateEstimate = (entries) => {
  entries.forEach((e3) => {
    if (e3.interactionId) {
      minKnownInteractionId = Math.min(minKnownInteractionId, e3.interactionId);
      maxKnownInteractionId = Math.max(maxKnownInteractionId, e3.interactionId);
      interactionCountEstimate = maxKnownInteractionId ? (maxKnownInteractionId - minKnownInteractionId) / 7 + 1 : 0;
    }
  });
};
var po;
var getInteractionCount = () => {
  return po ? interactionCountEstimate : performance.interactionCount || 0;
};
var initInteractionCountPolyfill = () => {
  if ("interactionCount" in performance || po) return;
  po = observe("event", updateEstimate, {
    type: "event",
    buffered: true,
    durationThreshold: 0
  });
};

// node_modules/@sentry-internal/browser-utils/build/esm/metrics/web-vitals/getINP.js
var INPThresholds = [200, 500];
var prevInteractionCount = 0;
var getInteractionCountForNavigation = () => {
  return getInteractionCount() - prevInteractionCount;
};
var MAX_INTERACTIONS_TO_CONSIDER = 10;
var longestInteractionList = [];
var longestInteractionMap = {};
var processEntry = (entry) => {
  const minLongestInteraction = longestInteractionList[longestInteractionList.length - 1];
  const existingInteraction = longestInteractionMap[entry.interactionId];
  if (existingInteraction || longestInteractionList.length < MAX_INTERACTIONS_TO_CONSIDER || minLongestInteraction && entry.duration > minLongestInteraction.latency) {
    if (existingInteraction) {
      existingInteraction.entries.push(entry);
      existingInteraction.latency = Math.max(existingInteraction.latency, entry.duration);
    } else {
      const interaction = {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        id: entry.interactionId,
        latency: entry.duration,
        entries: [entry]
      };
      longestInteractionMap[interaction.id] = interaction;
      longestInteractionList.push(interaction);
    }
    longestInteractionList.sort((a2, b2) => b2.latency - a2.latency);
    longestInteractionList.splice(MAX_INTERACTIONS_TO_CONSIDER).forEach((i2) => {
      delete longestInteractionMap[i2.id];
    });
  }
};
var estimateP98LongestInteraction = () => {
  const candidateInteractionIndex = Math.min(longestInteractionList.length - 1, Math.floor(getInteractionCountForNavigation() / 50));
  return longestInteractionList[candidateInteractionIndex];
};
var onINP = (onReport, opts = {}) => {
  whenActivated(() => {
    initInteractionCountPolyfill();
    const metric = initMetric("INP");
    let report;
    const handleEntries = (entries) => {
      entries.forEach((entry) => {
        if (entry.interactionId) {
          processEntry(entry);
        }
        if (entry.entryType === "first-input") {
          const noMatchingEntry = !longestInteractionList.some((interaction) => {
            return interaction.entries.some((prevEntry) => {
              return entry.duration === prevEntry.duration && entry.startTime === prevEntry.startTime;
            });
          });
          if (noMatchingEntry) {
            processEntry(entry);
          }
        }
      });
      const inp = estimateP98LongestInteraction();
      if (inp && inp.latency !== metric.value) {
        metric.value = inp.latency;
        metric.entries = inp.entries;
        report();
      }
    };
    const po2 = observe("event", handleEntries, {
      // Event Timing entries have their durations rounded to the nearest 8ms,
      // so a duration of 40ms would be any event that spans 2.5 or more frames
      // at 60Hz. This threshold is chosen to strike a balance between usefulness
      // and performance. Running this callback for any interaction that spans
      // just one or two frames is likely not worth the insight that could be
      // gained.
      durationThreshold: opts.durationThreshold != null ? opts.durationThreshold : 40
    });
    report = bindReporter(onReport, metric, INPThresholds, opts.reportAllChanges);
    if (po2) {
      if ("PerformanceEventTiming" in WINDOW5 && "interactionId" in PerformanceEventTiming.prototype) {
        po2.observe({
          type: "first-input",
          buffered: true
        });
      }
      onHidden(() => {
        handleEntries(po2.takeRecords());
        if (metric.value < 0 && getInteractionCountForNavigation() > 0) {
          metric.value = 0;
          metric.entries = [];
        }
        report(true);
      });
    }
  });
};

// node_modules/@sentry-internal/browser-utils/build/esm/metrics/web-vitals/getLCP.js
var LCPThresholds = [2500, 4e3];
var reportedMetricIDs = {};
var onLCP = (onReport, opts = {}) => {
  whenActivated(() => {
    const visibilityWatcher = getVisibilityWatcher();
    const metric = initMetric("LCP");
    let report;
    const handleEntries = (entries) => {
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        if (lastEntry.startTime < visibilityWatcher.firstHiddenTime) {
          metric.value = Math.max(lastEntry.startTime - getActivationStart(), 0);
          metric.entries = [lastEntry];
          report();
        }
      }
    };
    const po2 = observe("largest-contentful-paint", handleEntries);
    if (po2) {
      report = bindReporter(onReport, metric, LCPThresholds, opts.reportAllChanges);
      const stopListening = runOnce(() => {
        if (!reportedMetricIDs[metric.id]) {
          handleEntries(po2.takeRecords());
          po2.disconnect();
          reportedMetricIDs[metric.id] = true;
          report(true);
        }
      });
      ["keydown", "click"].forEach((type) => {
        if (WINDOW5.document) {
          addEventListener(type, () => setTimeout(stopListening, 0), true);
        }
      });
      onHidden(stopListening);
    }
  });
};

// node_modules/@sentry-internal/browser-utils/build/esm/metrics/web-vitals/onTTFB.js
var TTFBThresholds = [800, 1800];
var whenReady = (callback) => {
  if (WINDOW5.document && WINDOW5.document.prerendering) {
    whenActivated(() => whenReady(callback));
  } else if (WINDOW5.document && WINDOW5.document.readyState !== "complete") {
    addEventListener("load", () => whenReady(callback), true);
  } else {
    setTimeout(callback, 0);
  }
};
var onTTFB = (onReport, opts = {}) => {
  const metric = initMetric("TTFB");
  const report = bindReporter(onReport, metric, TTFBThresholds, opts.reportAllChanges);
  whenReady(() => {
    const navEntry = getNavigationEntry();
    if (navEntry) {
      const responseStart = navEntry.responseStart;
      if (responseStart <= 0 || responseStart > performance.now()) return;
      metric.value = Math.max(responseStart - getActivationStart(), 0);
      metric.entries = [navEntry];
      report(true);
    }
  });
};

// node_modules/@sentry-internal/browser-utils/build/esm/metrics/instrument.js
var handlers2 = {};
var instrumented2 = {};
var _previousCls;
var _previousFid;
var _previousLcp;
var _previousTtfb;
var _previousInp;
function addClsInstrumentationHandler(callback, stopOnCallback = false) {
  return addMetricObserver("cls", callback, instrumentCls, _previousCls, stopOnCallback);
}
function addLcpInstrumentationHandler(callback, stopOnCallback = false) {
  return addMetricObserver("lcp", callback, instrumentLcp, _previousLcp, stopOnCallback);
}
function addFidInstrumentationHandler(callback) {
  return addMetricObserver("fid", callback, instrumentFid, _previousFid);
}
function addTtfbInstrumentationHandler(callback) {
  return addMetricObserver("ttfb", callback, instrumentTtfb, _previousTtfb);
}
function addInpInstrumentationHandler(callback) {
  return addMetricObserver("inp", callback, instrumentInp, _previousInp);
}
function addPerformanceInstrumentationHandler(type, callback) {
  addHandler2(type, callback);
  if (!instrumented2[type]) {
    instrumentPerformanceObserver(type);
    instrumented2[type] = true;
  }
  return getCleanupCallback(type, callback);
}
function triggerHandlers2(type, data) {
  const typeHandlers = handlers2[type];
  if (!typeHandlers || !typeHandlers.length) {
    return;
  }
  for (const handler of typeHandlers) {
    try {
      handler(data);
    } catch (e3) {
      DEBUG_BUILD4 && logger.error(`Error while triggering instrumentation handler.
Type: ${type}
Name: ${getFunctionName(handler)}
Error:`, e3);
    }
  }
}
function instrumentCls() {
  return onCLS(
    (metric) => {
      triggerHandlers2("cls", {
        metric
      });
      _previousCls = metric;
    },
    // We want the callback to be called whenever the CLS value updates.
    // By default, the callback is only called when the tab goes to the background.
    {
      reportAllChanges: true
    }
  );
}
function instrumentFid() {
  return onFID((metric) => {
    triggerHandlers2("fid", {
      metric
    });
    _previousFid = metric;
  });
}
function instrumentLcp() {
  return onLCP(
    (metric) => {
      triggerHandlers2("lcp", {
        metric
      });
      _previousLcp = metric;
    },
    // We want the callback to be called whenever the LCP value updates.
    // By default, the callback is only called when the tab goes to the background.
    {
      reportAllChanges: true
    }
  );
}
function instrumentTtfb() {
  return onTTFB((metric) => {
    triggerHandlers2("ttfb", {
      metric
    });
    _previousTtfb = metric;
  });
}
function instrumentInp() {
  return onINP((metric) => {
    triggerHandlers2("inp", {
      metric
    });
    _previousInp = metric;
  });
}
function addMetricObserver(type, callback, instrumentFn, previousValue, stopOnCallback = false) {
  addHandler2(type, callback);
  let stopListening;
  if (!instrumented2[type]) {
    stopListening = instrumentFn();
    instrumented2[type] = true;
  }
  if (previousValue) {
    callback({
      metric: previousValue
    });
  }
  return getCleanupCallback(type, callback, stopOnCallback ? stopListening : void 0);
}
function instrumentPerformanceObserver(type) {
  const options = {};
  if (type === "event") {
    options.durationThreshold = 0;
  }
  observe(type, (entries) => {
    triggerHandlers2(type, {
      entries
    });
  }, options);
}
function addHandler2(type, handler) {
  handlers2[type] = handlers2[type] || [];
  handlers2[type].push(handler);
}
function getCleanupCallback(type, callback, stopListening) {
  return () => {
    if (stopListening) {
      stopListening();
    }
    const typeHandlers = handlers2[type];
    if (!typeHandlers) {
      return;
    }
    const index = typeHandlers.indexOf(callback);
    if (index !== -1) {
      typeHandlers.splice(index, 1);
    }
  };
}
function isPerformanceEventTiming(entry) {
  return "duration" in entry;
}

// node_modules/@sentry-internal/browser-utils/build/esm/metrics/utils.js
function isMeasurementValue(value) {
  return typeof value === "number" && isFinite(value);
}
function startAndEndSpan(parentSpan, startTimeInSeconds, endTime, _a) {
  var ctx = __objRest(_a, []);
  const parentStartTime = spanToJSON(parentSpan).start_timestamp;
  if (parentStartTime && parentStartTime > startTimeInSeconds) {
    if (typeof parentSpan.updateStartTime === "function") {
      parentSpan.updateStartTime(startTimeInSeconds);
    }
  }
  return withActiveSpan(parentSpan, () => {
    const span = startInactiveSpan(__spreadValues({
      startTime: startTimeInSeconds
    }, ctx));
    if (span) {
      span.end(endTime);
    }
    return span;
  });
}
function startStandaloneWebVitalSpan(options) {
  const client = getClient();
  if (!client) {
    return;
  }
  const {
    name,
    transaction,
    attributes: passedAttributes,
    startTime
  } = options;
  const {
    release,
    environment
  } = client.getOptions();
  const replay = client.getIntegrationByName("Replay");
  const replayId = replay && replay.getReplayId();
  const scope = getCurrentScope();
  const user = scope.getUser();
  const userDisplay = user !== void 0 ? user.email || user.id || user.ip_address : void 0;
  let profileId;
  try {
    profileId = scope.getScopeData().contexts.profile.profile_id;
  } catch (e3) {
  }
  const attributes = __spreadValues({
    release,
    environment,
    user: userDisplay || void 0,
    profile_id: profileId || void 0,
    replay_id: replayId || void 0,
    transaction,
    // Web vital score calculation relies on the user agent to account for different
    // browsers setting different thresholds for what is considered a good/meh/bad value.
    // For example: Chrome vs. Chrome Mobile
    "user_agent.original": WINDOW5.navigator && WINDOW5.navigator.userAgent
  }, passedAttributes);
  return startInactiveSpan({
    name,
    attributes,
    startTime,
    experimental: {
      standalone: true
    }
  });
}
function getBrowserPerformanceAPI() {
  return WINDOW5 && WINDOW5.addEventListener && WINDOW5.performance;
}
function msToSec(time) {
  return time / 1e3;
}

// node_modules/@sentry-internal/browser-utils/build/esm/metrics/cls.js
function trackClsAsStandaloneSpan() {
  let standaloneCLsValue = 0;
  let standaloneClsEntry;
  let pageloadSpanId;
  if (!supportsLayoutShift()) {
    return;
  }
  let sentSpan = false;
  function _collectClsOnce() {
    if (sentSpan) {
      return;
    }
    sentSpan = true;
    if (pageloadSpanId) {
      sendStandaloneClsSpan(standaloneCLsValue, standaloneClsEntry, pageloadSpanId);
    }
    cleanupClsHandler();
  }
  const cleanupClsHandler = addClsInstrumentationHandler(({
    metric
  }) => {
    const entry = metric.entries[metric.entries.length - 1];
    if (!entry) {
      return;
    }
    standaloneCLsValue = metric.value;
    standaloneClsEntry = entry;
  }, true);
  onHidden(() => {
    _collectClsOnce();
  });
  setTimeout(() => {
    const client = getClient();
    const unsubscribeStartNavigation = _optionalChain([client, "optionalAccess", (_2) => _2.on, "call", (_2) => _2("startNavigationSpan", () => {
      _collectClsOnce();
      unsubscribeStartNavigation && unsubscribeStartNavigation();
    })]);
    const activeSpan = getActiveSpan();
    const rootSpan = activeSpan && getRootSpan(activeSpan);
    const spanJSON = rootSpan && spanToJSON(rootSpan);
    if (spanJSON && spanJSON.op === "pageload") {
      pageloadSpanId = rootSpan.spanContext().spanId;
    }
  }, 0);
}
function sendStandaloneClsSpan(clsValue, entry, pageloadSpanId) {
  DEBUG_BUILD4 && logger.log(`Sending CLS span (${clsValue})`);
  const startTime = msToSec((browserPerformanceTimeOrigin || 0) + (_optionalChain([entry, "optionalAccess", (_3) => _3.startTime]) || 0));
  const routeName = getCurrentScope().getScopeData().transactionName;
  const name = entry ? htmlTreeAsString(_optionalChain([entry, "access", (_4) => _4.sources, "access", (_5) => _5[0], "optionalAccess", (_6) => _6.node])) : "Layout shift";
  const attributes = dropUndefinedKeys({
    [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.http.browser.cls",
    [SEMANTIC_ATTRIBUTE_SENTRY_OP]: "ui.webvital.cls",
    [SEMANTIC_ATTRIBUTE_EXCLUSIVE_TIME]: _optionalChain([entry, "optionalAccess", (_7) => _7.duration]) || 0,
    // attach the pageload span id to the CLS span so that we can link them in the UI
    "sentry.pageload.span_id": pageloadSpanId
  });
  const span = startStandaloneWebVitalSpan({
    name,
    transaction: routeName,
    attributes,
    startTime
  });
  _optionalChain([span, "optionalAccess", (_8) => _8.addEvent, "call", (_9) => _9("cls", {
    [SEMANTIC_ATTRIBUTE_SENTRY_MEASUREMENT_UNIT]: "",
    [SEMANTIC_ATTRIBUTE_SENTRY_MEASUREMENT_VALUE]: clsValue
  })]);
  _optionalChain([span, "optionalAccess", (_10) => _10.end, "call", (_11) => _11(startTime)]);
}
function supportsLayoutShift() {
  try {
    return _optionalChain([PerformanceObserver, "access", (_12) => _12.supportedEntryTypes, "optionalAccess", (_13) => _13.includes, "call", (_14) => _14("layout-shift")]);
  } catch (e3) {
    return false;
  }
}

// node_modules/@sentry-internal/browser-utils/build/esm/metrics/browserMetrics.js
var MAX_INT_AS_BYTES = 2147483647;
var _performanceCursor = 0;
var _measurements = {};
var _lcpEntry;
var _clsEntry;
function startTrackingWebVitals({
  recordClsStandaloneSpans
}) {
  const performance2 = getBrowserPerformanceAPI();
  if (performance2 && browserPerformanceTimeOrigin) {
    if (performance2.mark) {
      WINDOW5.performance.mark("sentry-tracing-init");
    }
    const fidCleanupCallback = _trackFID();
    const lcpCleanupCallback = _trackLCP();
    const ttfbCleanupCallback = _trackTtfb();
    const clsCleanupCallback = recordClsStandaloneSpans ? trackClsAsStandaloneSpan() : _trackCLS();
    return () => {
      fidCleanupCallback();
      lcpCleanupCallback();
      ttfbCleanupCallback();
      clsCleanupCallback && clsCleanupCallback();
    };
  }
  return () => void 0;
}
function startTrackingLongTasks() {
  addPerformanceInstrumentationHandler("longtask", ({
    entries
  }) => {
    if (!getActiveSpan()) {
      return;
    }
    for (const entry of entries) {
      const startTime = msToSec(browserPerformanceTimeOrigin + entry.startTime);
      const duration = msToSec(entry.duration);
      const span = startInactiveSpan({
        name: "Main UI thread blocked",
        op: "ui.long-task",
        startTime,
        attributes: {
          [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.ui.browser.metrics"
        }
      });
      if (span) {
        span.end(startTime + duration);
      }
    }
  });
}
function startTrackingLongAnimationFrames() {
  const observer = new PerformanceObserver((list) => {
    if (!getActiveSpan()) {
      return;
    }
    for (const entry of list.getEntries()) {
      if (!entry.scripts[0]) {
        continue;
      }
      const startTime = msToSec(browserPerformanceTimeOrigin + entry.startTime);
      const duration = msToSec(entry.duration);
      const attributes = {
        [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.ui.browser.metrics"
      };
      const initialScript = entry.scripts[0];
      const {
        invoker,
        invokerType,
        sourceURL,
        sourceFunctionName,
        sourceCharPosition
      } = initialScript;
      attributes["browser.script.invoker"] = invoker;
      attributes["browser.script.invoker_type"] = invokerType;
      if (sourceURL) {
        attributes["code.filepath"] = sourceURL;
      }
      if (sourceFunctionName) {
        attributes["code.function"] = sourceFunctionName;
      }
      if (sourceCharPosition !== -1) {
        attributes["browser.script.source_char_position"] = sourceCharPosition;
      }
      const span = startInactiveSpan({
        name: "Main UI thread blocked",
        op: "ui.long-animation-frame",
        startTime,
        attributes
      });
      if (span) {
        span.end(startTime + duration);
      }
    }
  });
  observer.observe({
    type: "long-animation-frame",
    buffered: true
  });
}
function startTrackingInteractions() {
  addPerformanceInstrumentationHandler("event", ({
    entries
  }) => {
    if (!getActiveSpan()) {
      return;
    }
    for (const entry of entries) {
      if (entry.name === "click") {
        const startTime = msToSec(browserPerformanceTimeOrigin + entry.startTime);
        const duration = msToSec(entry.duration);
        const spanOptions = {
          name: htmlTreeAsString(entry.target),
          op: `ui.interaction.${entry.name}`,
          startTime,
          attributes: {
            [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.ui.browser.metrics"
          }
        };
        const componentName = getComponentName(entry.target);
        if (componentName) {
          spanOptions.attributes["ui.component_name"] = componentName;
        }
        const span = startInactiveSpan(spanOptions);
        if (span) {
          span.end(startTime + duration);
        }
      }
    }
  });
}
function _trackCLS() {
  return addClsInstrumentationHandler(({
    metric
  }) => {
    const entry = metric.entries[metric.entries.length - 1];
    if (!entry) {
      return;
    }
    DEBUG_BUILD4 && logger.log(`[Measurements] Adding CLS ${metric.value}`);
    _measurements["cls"] = {
      value: metric.value,
      unit: ""
    };
    _clsEntry = entry;
  }, true);
}
function _trackLCP() {
  return addLcpInstrumentationHandler(({
    metric
  }) => {
    const entry = metric.entries[metric.entries.length - 1];
    if (!entry) {
      return;
    }
    DEBUG_BUILD4 && logger.log("[Measurements] Adding LCP");
    _measurements["lcp"] = {
      value: metric.value,
      unit: "millisecond"
    };
    _lcpEntry = entry;
  }, true);
}
function _trackFID() {
  return addFidInstrumentationHandler(({
    metric
  }) => {
    const entry = metric.entries[metric.entries.length - 1];
    if (!entry) {
      return;
    }
    const timeOrigin = msToSec(browserPerformanceTimeOrigin);
    const startTime = msToSec(entry.startTime);
    DEBUG_BUILD4 && logger.log("[Measurements] Adding FID");
    _measurements["fid"] = {
      value: metric.value,
      unit: "millisecond"
    };
    _measurements["mark.fid"] = {
      value: timeOrigin + startTime,
      unit: "second"
    };
  });
}
function _trackTtfb() {
  return addTtfbInstrumentationHandler(({
    metric
  }) => {
    const entry = metric.entries[metric.entries.length - 1];
    if (!entry) {
      return;
    }
    DEBUG_BUILD4 && logger.log("[Measurements] Adding TTFB");
    _measurements["ttfb"] = {
      value: metric.value,
      unit: "millisecond"
    };
  });
}
function addPerformanceEntries(span, options) {
  const performance2 = getBrowserPerformanceAPI();
  if (!performance2 || !WINDOW5.performance.getEntries || !browserPerformanceTimeOrigin) {
    return;
  }
  DEBUG_BUILD4 && logger.log("[Tracing] Adding & adjusting spans using Performance API");
  const timeOrigin = msToSec(browserPerformanceTimeOrigin);
  const performanceEntries = performance2.getEntries();
  const {
    op,
    start_timestamp: transactionStartTime
  } = spanToJSON(span);
  performanceEntries.slice(_performanceCursor).forEach((entry) => {
    const startTime = msToSec(entry.startTime);
    const duration = msToSec(
      // Inexplicably, Chrome sometimes emits a negative duration. We need to work around this.
      // There is a SO post attempting to explain this, but it leaves one with open questions: https://stackoverflow.com/questions/23191918/peformance-getentries-and-negative-duration-display
      // The way we clamp the value is probably not accurate, since we have observed this happen for things that may take a while to load, like for example the replay worker.
      // TODO: Investigate why this happens and how to properly mitigate. For now, this is a workaround to prevent transactions being dropped due to negative duration spans.
      Math.max(0, entry.duration)
    );
    if (op === "navigation" && transactionStartTime && timeOrigin + startTime < transactionStartTime) {
      return;
    }
    switch (entry.entryType) {
      case "navigation": {
        _addNavigationSpans(span, entry, timeOrigin);
        break;
      }
      case "mark":
      case "paint":
      case "measure": {
        _addMeasureSpans(span, entry, startTime, duration, timeOrigin);
        const firstHidden = getVisibilityWatcher();
        const shouldRecord = entry.startTime < firstHidden.firstHiddenTime;
        if (entry.name === "first-paint" && shouldRecord) {
          DEBUG_BUILD4 && logger.log("[Measurements] Adding FP");
          _measurements["fp"] = {
            value: entry.startTime,
            unit: "millisecond"
          };
        }
        if (entry.name === "first-contentful-paint" && shouldRecord) {
          DEBUG_BUILD4 && logger.log("[Measurements] Adding FCP");
          _measurements["fcp"] = {
            value: entry.startTime,
            unit: "millisecond"
          };
        }
        break;
      }
      case "resource": {
        _addResourceSpans(span, entry, entry.name, startTime, duration, timeOrigin);
        break;
      }
    }
  });
  _performanceCursor = Math.max(performanceEntries.length - 1, 0);
  _trackNavigator(span);
  if (op === "pageload") {
    _addTtfbRequestTimeToMeasurements(_measurements);
    const fidMark = _measurements["mark.fid"];
    if (fidMark && _measurements["fid"]) {
      startAndEndSpan(span, fidMark.value, fidMark.value + msToSec(_measurements["fid"].value), {
        name: "first input delay",
        op: "ui.action",
        attributes: {
          [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.ui.browser.metrics"
        }
      });
      delete _measurements["mark.fid"];
    }
    if (!("fcp" in _measurements) || !options.recordClsOnPageloadSpan) {
      delete _measurements.cls;
    }
    Object.entries(_measurements).forEach(([measurementName, measurement]) => {
      setMeasurement(measurementName, measurement.value, measurement.unit);
    });
    span.setAttribute("performance.timeOrigin", timeOrigin);
    span.setAttribute("performance.activationStart", getActivationStart());
    _setWebVitalAttributes(span);
  }
  _lcpEntry = void 0;
  _clsEntry = void 0;
  _measurements = {};
}
function _addMeasureSpans(span, entry, startTime, duration, timeOrigin) {
  const navEntry = getNavigationEntry();
  const requestTime = msToSec(navEntry ? navEntry.requestStart : 0);
  const measureStartTimestamp = timeOrigin + Math.max(startTime, requestTime);
  const startTimeStamp = timeOrigin + startTime;
  const measureEndTimestamp = startTimeStamp + duration;
  const attributes = {
    [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.resource.browser.metrics"
  };
  if (measureStartTimestamp !== startTimeStamp) {
    attributes["sentry.browser.measure_happened_before_request"] = true;
    attributes["sentry.browser.measure_start_time"] = measureStartTimestamp;
  }
  startAndEndSpan(span, measureStartTimestamp, measureEndTimestamp, {
    name: entry.name,
    op: entry.entryType,
    attributes
  });
  return measureStartTimestamp;
}
function _addNavigationSpans(span, entry, timeOrigin) {
  ["unloadEvent", "redirect", "domContentLoadedEvent", "loadEvent", "connect"].forEach((event) => {
    _addPerformanceNavigationTiming(span, entry, event, timeOrigin);
  });
  _addPerformanceNavigationTiming(span, entry, "secureConnection", timeOrigin, "TLS/SSL", "connectEnd");
  _addPerformanceNavigationTiming(span, entry, "fetch", timeOrigin, "cache", "domainLookupStart");
  _addPerformanceNavigationTiming(span, entry, "domainLookup", timeOrigin, "DNS");
  _addRequest(span, entry, timeOrigin);
}
function _addPerformanceNavigationTiming(span, entry, event, timeOrigin, name, eventEnd) {
  const end = eventEnd ? entry[eventEnd] : entry[`${event}End`];
  const start = entry[`${event}Start`];
  if (!start || !end) {
    return;
  }
  startAndEndSpan(span, timeOrigin + msToSec(start), timeOrigin + msToSec(end), {
    op: `browser.${name || event}`,
    name: entry.name,
    attributes: {
      [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.ui.browser.metrics"
    }
  });
}
function _addRequest(span, entry, timeOrigin) {
  const requestStartTimestamp = timeOrigin + msToSec(entry.requestStart);
  const responseEndTimestamp = timeOrigin + msToSec(entry.responseEnd);
  const responseStartTimestamp = timeOrigin + msToSec(entry.responseStart);
  if (entry.responseEnd) {
    startAndEndSpan(span, requestStartTimestamp, responseEndTimestamp, {
      op: "browser.request",
      name: entry.name,
      attributes: {
        [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.ui.browser.metrics"
      }
    });
    startAndEndSpan(span, responseStartTimestamp, responseEndTimestamp, {
      op: "browser.response",
      name: entry.name,
      attributes: {
        [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.ui.browser.metrics"
      }
    });
  }
}
function _addResourceSpans(span, entry, resourceUrl, startTime, duration, timeOrigin) {
  if (entry.initiatorType === "xmlhttprequest" || entry.initiatorType === "fetch") {
    return;
  }
  const parsedUrl = parseUrl(resourceUrl);
  const attributes = {
    [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.resource.browser.metrics"
  };
  setResourceEntrySizeData(attributes, entry, "transferSize", "http.response_transfer_size");
  setResourceEntrySizeData(attributes, entry, "encodedBodySize", "http.response_content_length");
  setResourceEntrySizeData(attributes, entry, "decodedBodySize", "http.decoded_response_content_length");
  if ("renderBlockingStatus" in entry) {
    attributes["resource.render_blocking_status"] = entry.renderBlockingStatus;
  }
  if (parsedUrl.protocol) {
    attributes["url.scheme"] = parsedUrl.protocol.split(":").pop();
  }
  if (parsedUrl.host) {
    attributes["server.address"] = parsedUrl.host;
  }
  attributes["url.same_origin"] = resourceUrl.includes(WINDOW5.location.origin);
  const startTimestamp = timeOrigin + startTime;
  const endTimestamp = startTimestamp + duration;
  startAndEndSpan(span, startTimestamp, endTimestamp, {
    name: resourceUrl.replace(WINDOW5.location.origin, ""),
    op: entry.initiatorType ? `resource.${entry.initiatorType}` : "resource.other",
    attributes
  });
}
function _trackNavigator(span) {
  const navigator = WINDOW5.navigator;
  if (!navigator) {
    return;
  }
  const connection = navigator.connection;
  if (connection) {
    if (connection.effectiveType) {
      span.setAttribute("effectiveConnectionType", connection.effectiveType);
    }
    if (connection.type) {
      span.setAttribute("connectionType", connection.type);
    }
    if (isMeasurementValue(connection.rtt)) {
      _measurements["connection.rtt"] = {
        value: connection.rtt,
        unit: "millisecond"
      };
    }
  }
  if (isMeasurementValue(navigator.deviceMemory)) {
    span.setAttribute("deviceMemory", `${navigator.deviceMemory} GB`);
  }
  if (isMeasurementValue(navigator.hardwareConcurrency)) {
    span.setAttribute("hardwareConcurrency", String(navigator.hardwareConcurrency));
  }
}
function _setWebVitalAttributes(span) {
  if (_lcpEntry) {
    DEBUG_BUILD4 && logger.log("[Measurements] Adding LCP Data");
    if (_lcpEntry.element) {
      span.setAttribute("lcp.element", htmlTreeAsString(_lcpEntry.element));
    }
    if (_lcpEntry.id) {
      span.setAttribute("lcp.id", _lcpEntry.id);
    }
    if (_lcpEntry.url) {
      span.setAttribute("lcp.url", _lcpEntry.url.trim().slice(0, 200));
    }
    span.setAttribute("lcp.size", _lcpEntry.size);
  }
  if (_clsEntry && _clsEntry.sources) {
    DEBUG_BUILD4 && logger.log("[Measurements] Adding CLS Data");
    _clsEntry.sources.forEach((source, index) => span.setAttribute(`cls.source.${index + 1}`, htmlTreeAsString(source.node)));
  }
}
function setResourceEntrySizeData(attributes, entry, key, dataKey) {
  const entryVal = entry[key];
  if (entryVal != null && entryVal < MAX_INT_AS_BYTES) {
    attributes[dataKey] = entryVal;
  }
}
function _addTtfbRequestTimeToMeasurements(_measurements2) {
  const navEntry = getNavigationEntry();
  if (!navEntry) {
    return;
  }
  const {
    responseStart,
    requestStart
  } = navEntry;
  if (requestStart <= responseStart) {
    DEBUG_BUILD4 && logger.log("[Measurements] Adding TTFB Request Time");
    _measurements2["ttfb.requestTime"] = {
      value: responseStart - requestStart,
      unit: "millisecond"
    };
  }
}

// node_modules/@sentry-internal/browser-utils/build/esm/instrument/dom.js
var DEBOUNCE_DURATION = 1e3;
var debounceTimerID;
var lastCapturedEventType;
var lastCapturedEventTargetId;
function addClickKeypressInstrumentationHandler(handler) {
  const type = "dom";
  addHandler(type, handler);
  maybeInstrument(type, instrumentDOM);
}
function instrumentDOM() {
  if (!WINDOW5.document) {
    return;
  }
  const triggerDOMHandler = triggerHandlers.bind(null, "dom");
  const globalDOMEventHandler = makeDOMEventHandler(triggerDOMHandler, true);
  WINDOW5.document.addEventListener("click", globalDOMEventHandler, false);
  WINDOW5.document.addEventListener("keypress", globalDOMEventHandler, false);
  ["EventTarget", "Node"].forEach((target) => {
    const proto = WINDOW5[target] && WINDOW5[target].prototype;
    if (!proto || !proto.hasOwnProperty || !proto.hasOwnProperty("addEventListener")) {
      return;
    }
    fill(proto, "addEventListener", function(originalAddEventListener) {
      return function(type, listener, options) {
        if (type === "click" || type == "keypress") {
          try {
            const el = this;
            const handlers4 = el.__sentry_instrumentation_handlers__ = el.__sentry_instrumentation_handlers__ || {};
            const handlerForType = handlers4[type] = handlers4[type] || {
              refCount: 0
            };
            if (!handlerForType.handler) {
              const handler = makeDOMEventHandler(triggerDOMHandler);
              handlerForType.handler = handler;
              originalAddEventListener.call(this, type, handler, options);
            }
            handlerForType.refCount++;
          } catch (e3) {
          }
        }
        return originalAddEventListener.call(this, type, listener, options);
      };
    });
    fill(proto, "removeEventListener", function(originalRemoveEventListener) {
      return function(type, listener, options) {
        if (type === "click" || type == "keypress") {
          try {
            const el = this;
            const handlers4 = el.__sentry_instrumentation_handlers__ || {};
            const handlerForType = handlers4[type];
            if (handlerForType) {
              handlerForType.refCount--;
              if (handlerForType.refCount <= 0) {
                originalRemoveEventListener.call(this, type, handlerForType.handler, options);
                handlerForType.handler = void 0;
                delete handlers4[type];
              }
              if (Object.keys(handlers4).length === 0) {
                delete el.__sentry_instrumentation_handlers__;
              }
            }
          } catch (e3) {
          }
        }
        return originalRemoveEventListener.call(this, type, listener, options);
      };
    });
  });
}
function isSimilarToLastCapturedEvent(event) {
  if (event.type !== lastCapturedEventType) {
    return false;
  }
  try {
    if (!event.target || event.target._sentryId !== lastCapturedEventTargetId) {
      return false;
    }
  } catch (e3) {
  }
  return true;
}
function shouldSkipDOMEvent(eventType, target) {
  if (eventType !== "keypress") {
    return false;
  }
  if (!target || !target.tagName) {
    return true;
  }
  if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
    return false;
  }
  return true;
}
function makeDOMEventHandler(handler, globalListener = false) {
  return (event) => {
    if (!event || event["_sentryCaptured"]) {
      return;
    }
    const target = getEventTarget(event);
    if (shouldSkipDOMEvent(event.type, target)) {
      return;
    }
    addNonEnumerableProperty(event, "_sentryCaptured", true);
    if (target && !target._sentryId) {
      addNonEnumerableProperty(target, "_sentryId", uuid4());
    }
    const name = event.type === "keypress" ? "input" : event.type;
    if (!isSimilarToLastCapturedEvent(event)) {
      const handlerData = {
        event,
        name,
        global: globalListener
      };
      handler(handlerData);
      lastCapturedEventType = event.type;
      lastCapturedEventTargetId = target ? target._sentryId : void 0;
    }
    clearTimeout(debounceTimerID);
    debounceTimerID = WINDOW5.setTimeout(() => {
      lastCapturedEventTargetId = void 0;
      lastCapturedEventType = void 0;
    }, DEBOUNCE_DURATION);
  };
}
function getEventTarget(event) {
  try {
    return event.target;
  } catch (e3) {
    return null;
  }
}

// node_modules/@sentry-internal/browser-utils/build/esm/instrument/history.js
var lastHref;
function addHistoryInstrumentationHandler(handler) {
  const type = "history";
  addHandler(type, handler);
  maybeInstrument(type, instrumentHistory);
}
function instrumentHistory() {
  if (!supportsHistory()) {
    return;
  }
  const oldOnPopState = WINDOW5.onpopstate;
  WINDOW5.onpopstate = function(...args) {
    const to = WINDOW5.location.href;
    const from = lastHref;
    lastHref = to;
    const handlerData = {
      from,
      to
    };
    triggerHandlers("history", handlerData);
    if (oldOnPopState) {
      try {
        return oldOnPopState.apply(this, args);
      } catch (_oO) {
      }
    }
  };
  function historyReplacementFunction(originalHistoryFunction) {
    return function(...args) {
      const url = args.length > 2 ? args[2] : void 0;
      if (url) {
        const from = lastHref;
        const to = String(url);
        lastHref = to;
        const handlerData = {
          from,
          to
        };
        triggerHandlers("history", handlerData);
      }
      return originalHistoryFunction.apply(this, args);
    };
  }
  fill(WINDOW5.history, "pushState", historyReplacementFunction);
  fill(WINDOW5.history, "replaceState", historyReplacementFunction);
}

// node_modules/@sentry-internal/browser-utils/build/esm/getNativeImplementation.js
var cachedImplementations = {};
function getNativeImplementation(name) {
  const cached = cachedImplementations[name];
  if (cached) {
    return cached;
  }
  let impl = WINDOW5[name];
  if (isNativeFunction(impl)) {
    return cachedImplementations[name] = impl.bind(WINDOW5);
  }
  const document2 = WINDOW5.document;
  if (document2 && typeof document2.createElement === "function") {
    try {
      const sandbox = document2.createElement("iframe");
      sandbox.hidden = true;
      document2.head.appendChild(sandbox);
      const contentWindow = sandbox.contentWindow;
      if (contentWindow && contentWindow[name]) {
        impl = contentWindow[name];
      }
      document2.head.removeChild(sandbox);
    } catch (e3) {
      DEBUG_BUILD4 && logger.warn(`Could not create sandbox iframe for ${name} check, bailing to window.${name}: `, e3);
    }
  }
  if (!impl) {
    return impl;
  }
  return cachedImplementations[name] = impl.bind(WINDOW5);
}
function clearCachedImplementation(name) {
  cachedImplementations[name] = void 0;
}
function setTimeout2(...rest) {
  return getNativeImplementation("setTimeout")(...rest);
}

// node_modules/@sentry-internal/browser-utils/build/esm/instrument/xhr.js
var SENTRY_XHR_DATA_KEY = "__sentry_xhr_v3__";
function addXhrInstrumentationHandler(handler) {
  const type = "xhr";
  addHandler(type, handler);
  maybeInstrument(type, instrumentXHR);
}
function instrumentXHR() {
  if (!WINDOW5.XMLHttpRequest) {
    return;
  }
  const xhrproto = XMLHttpRequest.prototype;
  xhrproto.open = new Proxy(xhrproto.open, {
    apply(originalOpen, xhrOpenThisArg, xhrOpenArgArray) {
      const startTimestamp = timestampInSeconds() * 1e3;
      const method = isString(xhrOpenArgArray[0]) ? xhrOpenArgArray[0].toUpperCase() : void 0;
      const url = parseUrl2(xhrOpenArgArray[1]);
      if (!method || !url) {
        return originalOpen.apply(xhrOpenThisArg, xhrOpenArgArray);
      }
      xhrOpenThisArg[SENTRY_XHR_DATA_KEY] = {
        method,
        url,
        request_headers: {}
      };
      if (method === "POST" && url.match(/sentry_key/)) {
        xhrOpenThisArg.__sentry_own_request__ = true;
      }
      const onreadystatechangeHandler = () => {
        const xhrInfo = xhrOpenThisArg[SENTRY_XHR_DATA_KEY];
        if (!xhrInfo) {
          return;
        }
        if (xhrOpenThisArg.readyState === 4) {
          try {
            xhrInfo.status_code = xhrOpenThisArg.status;
          } catch (e3) {
          }
          const handlerData = {
            endTimestamp: timestampInSeconds() * 1e3,
            startTimestamp,
            xhr: xhrOpenThisArg
          };
          triggerHandlers("xhr", handlerData);
        }
      };
      if ("onreadystatechange" in xhrOpenThisArg && typeof xhrOpenThisArg.onreadystatechange === "function") {
        xhrOpenThisArg.onreadystatechange = new Proxy(xhrOpenThisArg.onreadystatechange, {
          apply(originalOnreadystatechange, onreadystatechangeThisArg, onreadystatechangeArgArray) {
            onreadystatechangeHandler();
            return originalOnreadystatechange.apply(onreadystatechangeThisArg, onreadystatechangeArgArray);
          }
        });
      } else {
        xhrOpenThisArg.addEventListener("readystatechange", onreadystatechangeHandler);
      }
      xhrOpenThisArg.setRequestHeader = new Proxy(xhrOpenThisArg.setRequestHeader, {
        apply(originalSetRequestHeader, setRequestHeaderThisArg, setRequestHeaderArgArray) {
          const [header, value] = setRequestHeaderArgArray;
          const xhrInfo = setRequestHeaderThisArg[SENTRY_XHR_DATA_KEY];
          if (xhrInfo && isString(header) && isString(value)) {
            xhrInfo.request_headers[header.toLowerCase()] = value;
          }
          return originalSetRequestHeader.apply(setRequestHeaderThisArg, setRequestHeaderArgArray);
        }
      });
      return originalOpen.apply(xhrOpenThisArg, xhrOpenArgArray);
    }
  });
  xhrproto.send = new Proxy(xhrproto.send, {
    apply(originalSend, sendThisArg, sendArgArray) {
      const sentryXhrData = sendThisArg[SENTRY_XHR_DATA_KEY];
      if (!sentryXhrData) {
        return originalSend.apply(sendThisArg, sendArgArray);
      }
      if (sendArgArray[0] !== void 0) {
        sentryXhrData.body = sendArgArray[0];
      }
      const handlerData = {
        startTimestamp: timestampInSeconds() * 1e3,
        xhr: sendThisArg
      };
      triggerHandlers("xhr", handlerData);
      return originalSend.apply(sendThisArg, sendArgArray);
    }
  });
}
function parseUrl2(url) {
  if (isString(url)) {
    return url;
  }
  try {
    return url.toString();
  } catch (e22) {
  }
  return void 0;
}

// node_modules/@sentry-internal/browser-utils/build/esm/metrics/inp.js
var LAST_INTERACTIONS = [];
var INTERACTIONS_SPAN_MAP = /* @__PURE__ */ new Map();
function startTrackingINP() {
  const performance2 = getBrowserPerformanceAPI();
  if (performance2 && browserPerformanceTimeOrigin) {
    const inpCallback = _trackINP();
    return () => {
      inpCallback();
    };
  }
  return () => void 0;
}
var INP_ENTRY_MAP = {
  click: "click",
  pointerdown: "click",
  pointerup: "click",
  mousedown: "click",
  mouseup: "click",
  touchstart: "click",
  touchend: "click",
  mouseover: "hover",
  mouseout: "hover",
  mouseenter: "hover",
  mouseleave: "hover",
  pointerover: "hover",
  pointerout: "hover",
  pointerenter: "hover",
  pointerleave: "hover",
  dragstart: "drag",
  dragend: "drag",
  drag: "drag",
  dragenter: "drag",
  dragleave: "drag",
  dragover: "drag",
  drop: "drag",
  keydown: "press",
  keyup: "press",
  keypress: "press",
  input: "press"
};
function _trackINP() {
  return addInpInstrumentationHandler(({
    metric
  }) => {
    if (metric.value == void 0) {
      return;
    }
    const entry = metric.entries.find((entry2) => entry2.duration === metric.value && INP_ENTRY_MAP[entry2.name]);
    if (!entry) {
      return;
    }
    const {
      interactionId
    } = entry;
    const interactionType = INP_ENTRY_MAP[entry.name];
    const startTime = msToSec(browserPerformanceTimeOrigin + entry.startTime);
    const duration = msToSec(metric.value);
    const activeSpan = getActiveSpan();
    const rootSpan = activeSpan ? getRootSpan(activeSpan) : void 0;
    const cachedSpan = interactionId != null ? INTERACTIONS_SPAN_MAP.get(interactionId) : void 0;
    const spanToUse = cachedSpan || rootSpan;
    const routeName = spanToUse ? spanToJSON(spanToUse).description : getCurrentScope().getScopeData().transactionName;
    const name = htmlTreeAsString(entry.target);
    const attributes = dropUndefinedKeys({
      [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.http.browser.inp",
      [SEMANTIC_ATTRIBUTE_SENTRY_OP]: `ui.interaction.${interactionType}`,
      [SEMANTIC_ATTRIBUTE_EXCLUSIVE_TIME]: entry.duration
    });
    const span = startStandaloneWebVitalSpan({
      name,
      transaction: routeName,
      attributes,
      startTime
    });
    _optionalChain([span, "optionalAccess", (_2) => _2.addEvent, "call", (_2) => _2("inp", {
      [SEMANTIC_ATTRIBUTE_SENTRY_MEASUREMENT_UNIT]: "millisecond",
      [SEMANTIC_ATTRIBUTE_SENTRY_MEASUREMENT_VALUE]: metric.value
    })]);
    _optionalChain([span, "optionalAccess", (_3) => _3.end, "call", (_4) => _4(startTime + duration)]);
  });
}
function registerInpInteractionListener(_latestRoute) {
  const handleEntries = ({
    entries
  }) => {
    const activeSpan = getActiveSpan();
    const activeRootSpan = activeSpan && getRootSpan(activeSpan);
    entries.forEach((entry) => {
      if (!isPerformanceEventTiming(entry) || !activeRootSpan) {
        return;
      }
      const interactionId = entry.interactionId;
      if (interactionId == null) {
        return;
      }
      if (INTERACTIONS_SPAN_MAP.has(interactionId)) {
        return;
      }
      if (LAST_INTERACTIONS.length > 10) {
        const last = LAST_INTERACTIONS.shift();
        INTERACTIONS_SPAN_MAP.delete(last);
      }
      LAST_INTERACTIONS.push(interactionId);
      INTERACTIONS_SPAN_MAP.set(interactionId, activeRootSpan);
    });
  };
  addPerformanceInstrumentationHandler("event", handleEntries);
  addPerformanceInstrumentationHandler("first-input", handleEntries);
}

// node_modules/@sentry/browser/build/npm/esm/transports/fetch.js
function makeFetchTransport(options, nativeFetch = getNativeImplementation("fetch")) {
  let pendingBodySize = 0;
  let pendingCount = 0;
  function makeRequest(request) {
    const requestSize = request.body.length;
    pendingBodySize += requestSize;
    pendingCount++;
    const requestOptions = __spreadValues({
      body: request.body,
      method: "POST",
      referrerPolicy: "origin",
      headers: options.headers,
      // Outgoing requests are usually cancelled when navigating to a different page, causing a "TypeError: Failed to
      // fetch" error and sending a "network_error" client-outcome - in Chrome, the request status shows "(cancelled)".
      // The `keepalive` flag keeps outgoing requests alive, even when switching pages. We want this since we're
      // frequently sending events right before the user is switching pages (eg. whenfinishing navigation transactions).
      // Gotchas:
      // - `keepalive` isn't supported by Firefox
      // - As per spec (https://fetch.spec.whatwg.org/#http-network-or-cache-fetch):
      //   If the sum of contentLength and inflightKeepaliveBytes is greater than 64 kibibytes, then return a network error.
      //   We will therefore only activate the flag when we're below that limit.
      // There is also a limit of requests that can be open at the same time, so we also limit this to 15
      // See https://github.com/getsentry/sentry-javascript/pull/7553 for details
      keepalive: pendingBodySize <= 6e4 && pendingCount < 15
    }, options.fetchOptions);
    if (!nativeFetch) {
      clearCachedImplementation("fetch");
      return rejectedSyncPromise("No fetch implementation available");
    }
    try {
      return nativeFetch(options.url, requestOptions).then((response) => {
        pendingBodySize -= requestSize;
        pendingCount--;
        return {
          statusCode: response.status,
          headers: {
            "x-sentry-rate-limits": response.headers.get("X-Sentry-Rate-Limits"),
            "retry-after": response.headers.get("Retry-After")
          }
        };
      });
    } catch (e3) {
      clearCachedImplementation("fetch");
      pendingBodySize -= requestSize;
      pendingCount--;
      return rejectedSyncPromise(e3);
    }
  }
  return createTransport(options, makeRequest);
}

// node_modules/@sentry/browser/build/npm/esm/stack-parsers.js
var OPERA10_PRIORITY = 10;
var OPERA11_PRIORITY = 20;
var CHROME_PRIORITY = 30;
var WINJS_PRIORITY = 40;
var GECKO_PRIORITY = 50;
function createFrame(filename, func, lineno, colno) {
  const frame = {
    filename,
    function: func === "<anonymous>" ? UNKNOWN_FUNCTION : func,
    in_app: true
    // All browser frames are considered in_app
  };
  if (lineno !== void 0) {
    frame.lineno = lineno;
  }
  if (colno !== void 0) {
    frame.colno = colno;
  }
  return frame;
}
var chromeRegexNoFnName = /^\s*at (\S+?)(?::(\d+))(?::(\d+))\s*$/i;
var chromeRegex = /^\s*at (?:(.+?\)(?: \[.+\])?|.*?) ?\((?:address at )?)?(?:async )?((?:<anonymous>|[-a-z]+:|.*bundle|\/)?.*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i;
var chromeEvalRegex = /\((\S*)(?::(\d+))(?::(\d+))\)/;
var chromeStackParserFn = (line) => {
  const noFnParts = chromeRegexNoFnName.exec(line);
  if (noFnParts) {
    const [, filename, line2, col] = noFnParts;
    return createFrame(filename, UNKNOWN_FUNCTION, +line2, +col);
  }
  const parts = chromeRegex.exec(line);
  if (parts) {
    const isEval = parts[2] && parts[2].indexOf("eval") === 0;
    if (isEval) {
      const subMatch = chromeEvalRegex.exec(parts[2]);
      if (subMatch) {
        parts[2] = subMatch[1];
        parts[3] = subMatch[2];
        parts[4] = subMatch[3];
      }
    }
    const [func, filename] = extractSafariExtensionDetails(parts[1] || UNKNOWN_FUNCTION, parts[2]);
    return createFrame(filename, func, parts[3] ? +parts[3] : void 0, parts[4] ? +parts[4] : void 0);
  }
  return;
};
var chromeStackLineParser = [CHROME_PRIORITY, chromeStackParserFn];
var geckoREgex = /^\s*(.*?)(?:\((.*?)\))?(?:^|@)?((?:[-a-z]+)?:\/.*?|\[native code\]|[^@]*(?:bundle|\d+\.js)|\/[\w\-. /=]+)(?::(\d+))?(?::(\d+))?\s*$/i;
var geckoEvalRegex = /(\S+) line (\d+)(?: > eval line \d+)* > eval/i;
var gecko = (line) => {
  const parts = geckoREgex.exec(line);
  if (parts) {
    const isEval = parts[3] && parts[3].indexOf(" > eval") > -1;
    if (isEval) {
      const subMatch = geckoEvalRegex.exec(parts[3]);
      if (subMatch) {
        parts[1] = parts[1] || "eval";
        parts[3] = subMatch[1];
        parts[4] = subMatch[2];
        parts[5] = "";
      }
    }
    let filename = parts[3];
    let func = parts[1] || UNKNOWN_FUNCTION;
    [func, filename] = extractSafariExtensionDetails(func, filename);
    return createFrame(filename, func, parts[4] ? +parts[4] : void 0, parts[5] ? +parts[5] : void 0);
  }
  return;
};
var geckoStackLineParser = [GECKO_PRIORITY, gecko];
var winjsRegex = /^\s*at (?:((?:\[object object\])?.+) )?\(?((?:[-a-z]+):.*?):(\d+)(?::(\d+))?\)?\s*$/i;
var winjs = (line) => {
  const parts = winjsRegex.exec(line);
  return parts ? createFrame(parts[2], parts[1] || UNKNOWN_FUNCTION, +parts[3], parts[4] ? +parts[4] : void 0) : void 0;
};
var winjsStackLineParser = [WINJS_PRIORITY, winjs];
var opera10Regex = / line (\d+).*script (?:in )?(\S+)(?:: in function (\S+))?$/i;
var opera10 = (line) => {
  const parts = opera10Regex.exec(line);
  return parts ? createFrame(parts[2], parts[3] || UNKNOWN_FUNCTION, +parts[1]) : void 0;
};
var opera10StackLineParser = [OPERA10_PRIORITY, opera10];
var opera11Regex = / line (\d+), column (\d+)\s*(?:in (?:<anonymous function: ([^>]+)>|([^)]+))\(.*\))? in (.*):\s*$/i;
var opera11 = (line) => {
  const parts = opera11Regex.exec(line);
  return parts ? createFrame(parts[5], parts[3] || parts[4] || UNKNOWN_FUNCTION, +parts[1], +parts[2]) : void 0;
};
var opera11StackLineParser = [OPERA11_PRIORITY, opera11];
var defaultStackLineParsers = [chromeStackLineParser, geckoStackLineParser];
var defaultStackParser = createStackParser(...defaultStackLineParsers);
var extractSafariExtensionDetails = (func, filename) => {
  const isSafariExtension = func.indexOf("safari-extension") !== -1;
  const isSafariWebExtension = func.indexOf("safari-web-extension") !== -1;
  return isSafariExtension || isSafariWebExtension ? [func.indexOf("@") !== -1 ? func.split("@")[0] : UNKNOWN_FUNCTION, isSafariExtension ? `safari-extension:${filename}` : `safari-web-extension:${filename}`] : [func, filename];
};

// node_modules/@sentry/browser/build/npm/esm/integrations/breadcrumbs.js
var MAX_ALLOWED_STRING_LENGTH = 1024;
var INTEGRATION_NAME12 = "Breadcrumbs";
var _breadcrumbsIntegration = (options = {}) => {
  const _options = __spreadValues({
    console: true,
    dom: true,
    fetch: true,
    history: true,
    sentry: true,
    xhr: true
  }, options);
  return {
    name: INTEGRATION_NAME12,
    setup(client) {
      if (_options.console) {
        addConsoleInstrumentationHandler(_getConsoleBreadcrumbHandler(client));
      }
      if (_options.dom) {
        addClickKeypressInstrumentationHandler(_getDomBreadcrumbHandler(client, _options.dom));
      }
      if (_options.xhr) {
        addXhrInstrumentationHandler(_getXhrBreadcrumbHandler(client));
      }
      if (_options.fetch) {
        addFetchInstrumentationHandler(_getFetchBreadcrumbHandler(client));
      }
      if (_options.history) {
        addHistoryInstrumentationHandler(_getHistoryBreadcrumbHandler(client));
      }
      if (_options.sentry) {
        client.on("beforeSendEvent", _getSentryBreadcrumbHandler(client));
      }
    }
  };
};
var breadcrumbsIntegration = defineIntegration(_breadcrumbsIntegration);
function _getSentryBreadcrumbHandler(client) {
  return function addSentryBreadcrumb(event) {
    if (getClient() !== client) {
      return;
    }
    addBreadcrumb({
      category: `sentry.${event.type === "transaction" ? "transaction" : "event"}`,
      event_id: event.event_id,
      level: event.level,
      message: getEventDescription(event)
    }, {
      event
    });
  };
}
function _getDomBreadcrumbHandler(client, dom) {
  return function _innerDomBreadcrumb(handlerData) {
    if (getClient() !== client) {
      return;
    }
    let target;
    let componentName;
    let keyAttrs = typeof dom === "object" ? dom.serializeAttribute : void 0;
    let maxStringLength = typeof dom === "object" && typeof dom.maxStringLength === "number" ? dom.maxStringLength : void 0;
    if (maxStringLength && maxStringLength > MAX_ALLOWED_STRING_LENGTH) {
      DEBUG_BUILD3 && logger.warn(`\`dom.maxStringLength\` cannot exceed ${MAX_ALLOWED_STRING_LENGTH}, but a value of ${maxStringLength} was configured. Sentry will use ${MAX_ALLOWED_STRING_LENGTH} instead.`);
      maxStringLength = MAX_ALLOWED_STRING_LENGTH;
    }
    if (typeof keyAttrs === "string") {
      keyAttrs = [keyAttrs];
    }
    try {
      const event = handlerData.event;
      const element = _isEvent(event) ? event.target : event;
      target = htmlTreeAsString(element, {
        keyAttrs,
        maxStringLength
      });
      componentName = getComponentName(element);
    } catch (e3) {
      target = "<unknown>";
    }
    if (target.length === 0) {
      return;
    }
    const breadcrumb = {
      category: `ui.${handlerData.name}`,
      message: target
    };
    if (componentName) {
      breadcrumb.data = {
        "ui.component_name": componentName
      };
    }
    addBreadcrumb(breadcrumb, {
      event: handlerData.event,
      name: handlerData.name,
      global: handlerData.global
    });
  };
}
function _getConsoleBreadcrumbHandler(client) {
  return function _consoleBreadcrumb(handlerData) {
    if (getClient() !== client) {
      return;
    }
    const breadcrumb = {
      category: "console",
      data: {
        arguments: handlerData.args,
        logger: "console"
      },
      level: severityLevelFromString(handlerData.level),
      message: safeJoin(handlerData.args, " ")
    };
    if (handlerData.level === "assert") {
      if (handlerData.args[0] === false) {
        breadcrumb.message = `Assertion failed: ${safeJoin(handlerData.args.slice(1), " ") || "console.assert"}`;
        breadcrumb.data.arguments = handlerData.args.slice(1);
      } else {
        return;
      }
    }
    addBreadcrumb(breadcrumb, {
      input: handlerData.args,
      level: handlerData.level
    });
  };
}
function _getXhrBreadcrumbHandler(client) {
  return function _xhrBreadcrumb(handlerData) {
    if (getClient() !== client) {
      return;
    }
    const {
      startTimestamp,
      endTimestamp
    } = handlerData;
    const sentryXhrData = handlerData.xhr[SENTRY_XHR_DATA_KEY];
    if (!startTimestamp || !endTimestamp || !sentryXhrData) {
      return;
    }
    const {
      method,
      url,
      status_code,
      body
    } = sentryXhrData;
    const data = {
      method,
      url,
      status_code
    };
    const hint = {
      xhr: handlerData.xhr,
      input: body,
      startTimestamp,
      endTimestamp
    };
    const level = getBreadcrumbLogLevelFromHttpStatusCode(status_code);
    addBreadcrumb({
      category: "xhr",
      data,
      type: "http",
      level
    }, hint);
  };
}
function _getFetchBreadcrumbHandler(client) {
  return function _fetchBreadcrumb(handlerData) {
    if (getClient() !== client) {
      return;
    }
    const {
      startTimestamp,
      endTimestamp
    } = handlerData;
    if (!endTimestamp) {
      return;
    }
    if (handlerData.fetchData.url.match(/sentry_key/) && handlerData.fetchData.method === "POST") {
      return;
    }
    if (handlerData.error) {
      const data = handlerData.fetchData;
      const hint = {
        data: handlerData.error,
        input: handlerData.args,
        startTimestamp,
        endTimestamp
      };
      addBreadcrumb({
        category: "fetch",
        data,
        level: "error",
        type: "http"
      }, hint);
    } else {
      const response = handlerData.response;
      const data = __spreadProps(__spreadValues({}, handlerData.fetchData), {
        status_code: response && response.status
      });
      const hint = {
        input: handlerData.args,
        response,
        startTimestamp,
        endTimestamp
      };
      const level = getBreadcrumbLogLevelFromHttpStatusCode(data.status_code);
      addBreadcrumb({
        category: "fetch",
        data,
        type: "http",
        level
      }, hint);
    }
  };
}
function _getHistoryBreadcrumbHandler(client) {
  return function _historyBreadcrumb(handlerData) {
    if (getClient() !== client) {
      return;
    }
    let from = handlerData.from;
    let to = handlerData.to;
    const parsedLoc = parseUrl(WINDOW4.location.href);
    let parsedFrom = from ? parseUrl(from) : void 0;
    const parsedTo = parseUrl(to);
    if (!parsedFrom || !parsedFrom.path) {
      parsedFrom = parsedLoc;
    }
    if (parsedLoc.protocol === parsedTo.protocol && parsedLoc.host === parsedTo.host) {
      to = parsedTo.relative;
    }
    if (parsedLoc.protocol === parsedFrom.protocol && parsedLoc.host === parsedFrom.host) {
      from = parsedFrom.relative;
    }
    addBreadcrumb({
      category: "navigation",
      data: {
        from,
        to
      }
    });
  };
}
function _isEvent(event) {
  return !!event && !!event.target;
}

// node_modules/@sentry/browser/build/npm/esm/integrations/browserapierrors.js
var DEFAULT_EVENT_TARGET = ["EventTarget", "Window", "Node", "ApplicationCache", "AudioTrackList", "BroadcastChannel", "ChannelMergerNode", "CryptoOperation", "EventSource", "FileReader", "HTMLUnknownElement", "IDBDatabase", "IDBRequest", "IDBTransaction", "KeyOperation", "MediaController", "MessagePort", "ModalWindow", "Notification", "SVGElementInstance", "Screen", "SharedWorker", "TextTrack", "TextTrackCue", "TextTrackList", "WebSocket", "WebSocketWorker", "Worker", "XMLHttpRequest", "XMLHttpRequestEventTarget", "XMLHttpRequestUpload"];
var INTEGRATION_NAME13 = "BrowserApiErrors";
var _browserApiErrorsIntegration = (options = {}) => {
  const _options = __spreadValues({
    XMLHttpRequest: true,
    eventTarget: true,
    requestAnimationFrame: true,
    setInterval: true,
    setTimeout: true
  }, options);
  return {
    name: INTEGRATION_NAME13,
    // TODO: This currently only works for the first client this is setup
    // We may want to adjust this to check for client etc.
    setupOnce() {
      if (_options.setTimeout) {
        fill(WINDOW4, "setTimeout", _wrapTimeFunction);
      }
      if (_options.setInterval) {
        fill(WINDOW4, "setInterval", _wrapTimeFunction);
      }
      if (_options.requestAnimationFrame) {
        fill(WINDOW4, "requestAnimationFrame", _wrapRAF);
      }
      if (_options.XMLHttpRequest && "XMLHttpRequest" in WINDOW4) {
        fill(XMLHttpRequest.prototype, "send", _wrapXHR);
      }
      const eventTargetOption = _options.eventTarget;
      if (eventTargetOption) {
        const eventTarget = Array.isArray(eventTargetOption) ? eventTargetOption : DEFAULT_EVENT_TARGET;
        eventTarget.forEach(_wrapEventTarget);
      }
    }
  };
};
var browserApiErrorsIntegration = defineIntegration(_browserApiErrorsIntegration);
function _wrapTimeFunction(original) {
  return function(...args) {
    const originalCallback = args[0];
    args[0] = wrap(originalCallback, {
      mechanism: {
        data: {
          function: getFunctionName(original)
        },
        handled: false,
        type: "instrument"
      }
    });
    return original.apply(this, args);
  };
}
function _wrapRAF(original) {
  return function(callback) {
    return original.apply(this, [wrap(callback, {
      mechanism: {
        data: {
          function: "requestAnimationFrame",
          handler: getFunctionName(original)
        },
        handled: false,
        type: "instrument"
      }
    })]);
  };
}
function _wrapXHR(originalSend) {
  return function(...args) {
    const xhr = this;
    const xmlHttpRequestProps = ["onload", "onerror", "onprogress", "onreadystatechange"];
    xmlHttpRequestProps.forEach((prop) => {
      if (prop in xhr && typeof xhr[prop] === "function") {
        fill(xhr, prop, function(original) {
          const wrapOptions = {
            mechanism: {
              data: {
                function: prop,
                handler: getFunctionName(original)
              },
              handled: false,
              type: "instrument"
            }
          };
          const originalFunction = getOriginalFunction(original);
          if (originalFunction) {
            wrapOptions.mechanism.data.handler = getFunctionName(originalFunction);
          }
          return wrap(original, wrapOptions);
        });
      }
    });
    return originalSend.apply(this, args);
  };
}
function _wrapEventTarget(target) {
  const globalObject = WINDOW4;
  const proto = globalObject[target] && globalObject[target].prototype;
  if (!proto || !proto.hasOwnProperty || !proto.hasOwnProperty("addEventListener")) {
    return;
  }
  fill(proto, "addEventListener", function(original) {
    return function(eventName, fn, options) {
      try {
        if (typeof fn.handleEvent === "function") {
          fn.handleEvent = wrap(fn.handleEvent, {
            mechanism: {
              data: {
                function: "handleEvent",
                handler: getFunctionName(fn),
                target
              },
              handled: false,
              type: "instrument"
            }
          });
        }
      } catch (err) {
      }
      return original.apply(this, [
        eventName,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        wrap(fn, {
          mechanism: {
            data: {
              function: "addEventListener",
              handler: getFunctionName(fn),
              target
            },
            handled: false,
            type: "instrument"
          }
        }),
        options
      ]);
    };
  });
  fill(proto, "removeEventListener", function(originalRemoveEventListener) {
    return function(eventName, fn, options) {
      const wrappedEventHandler = fn;
      try {
        const originalEventHandler = wrappedEventHandler && wrappedEventHandler.__sentry_wrapped__;
        if (originalEventHandler) {
          originalRemoveEventListener.call(this, eventName, originalEventHandler, options);
        }
      } catch (e3) {
      }
      return originalRemoveEventListener.call(this, eventName, wrappedEventHandler, options);
    };
  });
}

// node_modules/@sentry/browser/build/npm/esm/integrations/globalhandlers.js
var INTEGRATION_NAME14 = "GlobalHandlers";
var _globalHandlersIntegration = (options = {}) => {
  const _options = __spreadValues({
    onerror: true,
    onunhandledrejection: true
  }, options);
  return {
    name: INTEGRATION_NAME14,
    setupOnce() {
      Error.stackTraceLimit = 50;
    },
    setup(client) {
      if (_options.onerror) {
        _installGlobalOnErrorHandler(client);
        globalHandlerLog("onerror");
      }
      if (_options.onunhandledrejection) {
        _installGlobalOnUnhandledRejectionHandler(client);
        globalHandlerLog("onunhandledrejection");
      }
    }
  };
};
var globalHandlersIntegration = defineIntegration(_globalHandlersIntegration);
function _installGlobalOnErrorHandler(client) {
  addGlobalErrorInstrumentationHandler((data) => {
    const {
      stackParser,
      attachStacktrace
    } = getOptions();
    if (getClient() !== client || shouldIgnoreOnError()) {
      return;
    }
    const {
      msg,
      url,
      line,
      column,
      error
    } = data;
    const event = _enhanceEventWithInitialFrame(eventFromUnknownInput2(stackParser, error || msg, void 0, attachStacktrace, false), url, line, column);
    event.level = "error";
    captureEvent(event, {
      originalException: error,
      mechanism: {
        handled: false,
        type: "onerror"
      }
    });
  });
}
function _installGlobalOnUnhandledRejectionHandler(client) {
  addGlobalUnhandledRejectionInstrumentationHandler((e3) => {
    const {
      stackParser,
      attachStacktrace
    } = getOptions();
    if (getClient() !== client || shouldIgnoreOnError()) {
      return;
    }
    const error = _getUnhandledRejectionError(e3);
    const event = isPrimitive(error) ? _eventFromRejectionWithPrimitive(error) : eventFromUnknownInput2(stackParser, error, void 0, attachStacktrace, true);
    event.level = "error";
    captureEvent(event, {
      originalException: error,
      mechanism: {
        handled: false,
        type: "onunhandledrejection"
      }
    });
  });
}
function _getUnhandledRejectionError(error) {
  if (isPrimitive(error)) {
    return error;
  }
  try {
    if ("reason" in error) {
      return error.reason;
    }
    if ("detail" in error && "reason" in error.detail) {
      return error.detail.reason;
    }
  } catch (e22) {
  }
  return error;
}
function _eventFromRejectionWithPrimitive(reason) {
  return {
    exception: {
      values: [{
        type: "UnhandledRejection",
        // String() is needed because the Primitive type includes symbols (which can't be automatically stringified)
        value: `Non-Error promise rejection captured with value: ${String(reason)}`
      }]
    }
  };
}
function _enhanceEventWithInitialFrame(event, url, line, column) {
  const e3 = event.exception = event.exception || {};
  const ev = e3.values = e3.values || [];
  const ev0 = ev[0] = ev[0] || {};
  const ev0s = ev0.stacktrace = ev0.stacktrace || {};
  const ev0sf = ev0s.frames = ev0s.frames || [];
  const colno = isNaN(parseInt(column, 10)) ? void 0 : column;
  const lineno = isNaN(parseInt(line, 10)) ? void 0 : line;
  const filename = isString(url) && url.length > 0 ? url : getLocationHref();
  if (ev0sf.length === 0) {
    ev0sf.push({
      colno,
      filename,
      function: UNKNOWN_FUNCTION,
      in_app: true,
      lineno
    });
  }
  return event;
}
function globalHandlerLog(type) {
  DEBUG_BUILD3 && logger.log(`Global Handler attached: ${type}`);
}
function getOptions() {
  const client = getClient();
  const options = client && client.getOptions() || {
    stackParser: () => [],
    attachStacktrace: false
  };
  return options;
}

// node_modules/@sentry/browser/build/npm/esm/integrations/httpcontext.js
var httpContextIntegration = defineIntegration(() => {
  return {
    name: "HttpContext",
    preprocessEvent(event) {
      if (!WINDOW4.navigator && !WINDOW4.location && !WINDOW4.document) {
        return;
      }
      const url = event.request && event.request.url || WINDOW4.location && WINDOW4.location.href;
      const {
        referrer
      } = WINDOW4.document || {};
      const {
        userAgent
      } = WINDOW4.navigator || {};
      const headers = __spreadValues(__spreadValues(__spreadValues({}, event.request && event.request.headers), referrer && {
        Referer: referrer
      }), userAgent && {
        "User-Agent": userAgent
      });
      const request = __spreadProps(__spreadValues(__spreadValues({}, event.request), url && {
        url
      }), {
        headers
      });
      event.request = request;
    }
  };
});

// node_modules/@sentry/browser/build/npm/esm/integrations/linkederrors.js
var DEFAULT_KEY2 = "cause";
var DEFAULT_LIMIT3 = 5;
var INTEGRATION_NAME15 = "LinkedErrors";
var _linkedErrorsIntegration2 = (options = {}) => {
  const limit = options.limit || DEFAULT_LIMIT3;
  const key = options.key || DEFAULT_KEY2;
  return {
    name: INTEGRATION_NAME15,
    preprocessEvent(event, hint, client) {
      const options2 = client.getOptions();
      applyAggregateErrorsToEvent(
        // This differs from the LinkedErrors integration in core by using a different exceptionFromError function
        exceptionFromError2,
        options2.stackParser,
        options2.maxValueLength,
        key,
        limit,
        event,
        hint
      );
    }
  };
};
var linkedErrorsIntegration2 = defineIntegration(_linkedErrorsIntegration2);

// node_modules/@sentry/browser/build/npm/esm/sdk.js
function getDefaultIntegrations(_options) {
  return [inboundFiltersIntegration(), functionToStringIntegration(), browserApiErrorsIntegration(), breadcrumbsIntegration(), globalHandlersIntegration(), linkedErrorsIntegration2(), dedupeIntegration(), httpContextIntegration()];
}
function applyDefaultOptions(optionsArg = {}) {
  const defaultOptions = {
    defaultIntegrations: getDefaultIntegrations(),
    release: typeof __SENTRY_RELEASE__ === "string" ? __SENTRY_RELEASE__ : WINDOW4.SENTRY_RELEASE && WINDOW4.SENTRY_RELEASE.id ? WINDOW4.SENTRY_RELEASE.id : void 0,
    autoSessionTracking: true,
    sendClientReports: true
  };
  if (optionsArg.defaultIntegrations == null) {
    delete optionsArg.defaultIntegrations;
  }
  return __spreadValues(__spreadValues({}, defaultOptions), optionsArg);
}
function shouldShowBrowserExtensionError() {
  const windowWithMaybeExtension = typeof WINDOW4.window !== "undefined" && WINDOW4;
  if (!windowWithMaybeExtension) {
    return false;
  }
  const extensionKey = windowWithMaybeExtension.chrome ? "chrome" : "browser";
  const extensionObject = windowWithMaybeExtension[extensionKey];
  const runtimeId = extensionObject && extensionObject.runtime && extensionObject.runtime.id;
  const href = WINDOW4.location && WINDOW4.location.href || "";
  const extensionProtocols = ["chrome-extension:", "moz-extension:", "ms-browser-extension:", "safari-web-extension:"];
  const isDedicatedExtensionPage = !!runtimeId && WINDOW4 === WINDOW4.top && extensionProtocols.some((protocol) => href.startsWith(`${protocol}//`));
  const isNWjs = typeof windowWithMaybeExtension.nw !== "undefined";
  return !!runtimeId && !isDedicatedExtensionPage && !isNWjs;
}
function init(browserOptions = {}) {
  const options = applyDefaultOptions(browserOptions);
  if (shouldShowBrowserExtensionError()) {
    consoleSandbox(() => {
      console.error("[Sentry] You cannot run Sentry this way in a browser extension, check: https://docs.sentry.io/platforms/javascript/best-practices/browser-extensions/");
    });
    return;
  }
  if (DEBUG_BUILD3) {
    if (!supportsFetch()) {
      logger.warn("No Fetch API detected. The Sentry SDK requires a Fetch API compatible environment to send events. Please add a Fetch API polyfill.");
    }
  }
  const clientOptions = __spreadProps(__spreadValues({}, options), {
    stackParser: stackParserFromStackParserOptions(options.stackParser || defaultStackParser),
    integrations: getIntegrationsToSetup(options),
    transport: options.transport || makeFetchTransport
  });
  const client = initAndBind(BrowserClient, clientOptions);
  if (options.autoSessionTracking) {
    startSessionTracking();
  }
  return client;
}
function showReportDialog(options = {}) {
  if (!WINDOW4.document) {
    DEBUG_BUILD3 && logger.error("Global document not defined in showReportDialog call");
    return;
  }
  const scope = getCurrentScope();
  const client = scope.getClient();
  const dsn = client && client.getDsn();
  if (!dsn) {
    DEBUG_BUILD3 && logger.error("DSN not configured for showReportDialog call");
    return;
  }
  if (scope) {
    options.user = __spreadValues(__spreadValues({}, scope.getUser()), options.user);
  }
  if (!options.eventId) {
    const eventId = lastEventId();
    if (eventId) {
      options.eventId = eventId;
    }
  }
  const script = WINDOW4.document.createElement("script");
  script.async = true;
  script.crossOrigin = "anonymous";
  script.src = getReportDialogEndpoint(dsn, options);
  if (options.onLoad) {
    script.onload = options.onLoad;
  }
  const {
    onClose
  } = options;
  if (onClose) {
    const reportDialogClosedMessageHandler = (event) => {
      if (event.data === "__sentry_reportdialog_closed__") {
        try {
          onClose();
        } finally {
          WINDOW4.removeEventListener("message", reportDialogClosedMessageHandler);
        }
      }
    };
    WINDOW4.addEventListener("message", reportDialogClosedMessageHandler);
  }
  const injectionPoint = WINDOW4.document.head || WINDOW4.document.body;
  if (injectionPoint) {
    injectionPoint.appendChild(script);
  } else {
    DEBUG_BUILD3 && logger.error("Not injecting report dialog. No injection point found in HTML");
  }
}
function forceLoad() {
}
function onLoad(callback) {
  callback();
}
function startSessionTracking() {
  if (typeof WINDOW4.document === "undefined") {
    DEBUG_BUILD3 && logger.warn("Session tracking in non-browser environment with @sentry/browser is not supported.");
    return;
  }
  startSession({
    ignoreDuration: true
  });
  captureSession();
  addHistoryInstrumentationHandler(({
    from,
    to
  }) => {
    if (from !== void 0 && from !== to) {
      startSession({
        ignoreDuration: true
      });
      captureSession();
    }
  });
}
function captureUserFeedback(feedback) {
  const client = getClient();
  if (client) {
    client.captureUserFeedback(feedback);
  }
}

// node_modules/@sentry/browser/build/npm/esm/utils/lazyLoadIntegration.js
var LazyLoadableIntegrations = {
  replayIntegration: "replay",
  replayCanvasIntegration: "replay-canvas",
  feedbackIntegration: "feedback",
  feedbackModalIntegration: "feedback-modal",
  feedbackScreenshotIntegration: "feedback-screenshot",
  captureConsoleIntegration: "captureconsole",
  contextLinesIntegration: "contextlines",
  linkedErrorsIntegration: "linkederrors",
  debugIntegration: "debug",
  dedupeIntegration: "dedupe",
  extraErrorDataIntegration: "extraerrordata",
  httpClientIntegration: "httpclient",
  reportingObserverIntegration: "reportingobserver",
  rewriteFramesIntegration: "rewriteframes",
  sessionTimingIntegration: "sessiontiming",
  browserProfilingIntegration: "browserprofiling"
};
var WindowWithMaybeIntegration = WINDOW4;
function lazyLoadIntegration(name, scriptNonce) {
  return __async(this, null, function* () {
    const bundle = LazyLoadableIntegrations[name];
    const sentryOnWindow = WindowWithMaybeIntegration.Sentry = WindowWithMaybeIntegration.Sentry || {};
    if (!bundle) {
      throw new Error(`Cannot lazy load integration: ${name}`);
    }
    const existing = sentryOnWindow[name];
    if (typeof existing === "function" && !("_isShim" in existing)) {
      return existing;
    }
    const url = getScriptURL(bundle);
    const script = WINDOW4.document.createElement("script");
    script.src = url;
    script.crossOrigin = "anonymous";
    script.referrerPolicy = "origin";
    if (scriptNonce) {
      script.setAttribute("nonce", scriptNonce);
    }
    const waitForLoad = new Promise((resolve2, reject) => {
      script.addEventListener("load", () => resolve2());
      script.addEventListener("error", reject);
    });
    const currentScript = WINDOW4.document.currentScript;
    const parent = WINDOW4.document.body || WINDOW4.document.head || currentScript && currentScript.parentElement;
    if (parent) {
      parent.appendChild(script);
    } else {
      throw new Error(`Could not find parent element to insert lazy-loaded ${name} script`);
    }
    try {
      yield waitForLoad;
    } catch (e3) {
      throw new Error(`Error when loading integration: ${name}`);
    }
    const integrationFn = sentryOnWindow[name];
    if (typeof integrationFn !== "function") {
      throw new Error(`Could not load integration: ${name}`);
    }
    return integrationFn;
  });
}
function getScriptURL(bundle) {
  const client = getClient();
  const options = client && client.getOptions();
  const baseURL = options && options.cdnBaseUrl || "https://browser.sentry-cdn.com";
  return new URL(`/${SDK_VERSION}/${bundle}.min.js`, baseURL).toString();
}

// node_modules/@sentry/browser/build/npm/esm/integrations/reportingobserver.js
var WINDOW6 = GLOBAL_OBJ;
var INTEGRATION_NAME16 = "ReportingObserver";
var SETUP_CLIENTS2 = /* @__PURE__ */ new WeakMap();
var _reportingObserverIntegration = (options = {}) => {
  const types = options.types || ["crash", "deprecation", "intervention"];
  function handler(reports) {
    if (!SETUP_CLIENTS2.has(getClient())) {
      return;
    }
    for (const report of reports) {
      withScope2((scope) => {
        scope.setExtra("url", report.url);
        const label = `ReportingObserver [${report.type}]`;
        let details = "No details available";
        if (report.body) {
          const plainBody = {};
          for (const prop in report.body) {
            plainBody[prop] = report.body[prop];
          }
          scope.setExtra("body", plainBody);
          if (report.type === "crash") {
            const body = report.body;
            details = [body.crashId || "", body.reason || ""].join(" ").trim() || details;
          } else {
            const body = report.body;
            details = body.message || details;
          }
        }
        captureMessage(`${label}: ${details}`);
      });
    }
  }
  return {
    name: INTEGRATION_NAME16,
    setupOnce() {
      if (!supportsReportingObserver()) {
        return;
      }
      const observer = new WINDOW6.ReportingObserver(handler, {
        buffered: true,
        types
      });
      observer.observe();
    },
    setup(client) {
      SETUP_CLIENTS2.set(client, true);
    }
  };
};
var reportingObserverIntegration = defineIntegration(_reportingObserverIntegration);

// node_modules/@sentry/browser/build/npm/esm/integrations/httpclient.js
var INTEGRATION_NAME17 = "HttpClient";
var _httpClientIntegration = (options = {}) => {
  const _options = __spreadValues({
    failedRequestStatusCodes: [[500, 599]],
    failedRequestTargets: [/.*/]
  }, options);
  return {
    name: INTEGRATION_NAME17,
    setup(client) {
      _wrapFetch(client, _options);
      _wrapXHR2(client, _options);
    }
  };
};
var httpClientIntegration = defineIntegration(_httpClientIntegration);
function _fetchResponseHandler(options, requestInfo, response, requestInit) {
  if (_shouldCaptureResponse(options, response.status, response.url)) {
    const request = _getRequest(requestInfo, requestInit);
    let requestHeaders, responseHeaders, requestCookies, responseCookies;
    if (_shouldSendDefaultPii()) {
      [requestHeaders, requestCookies] = _parseCookieHeaders("Cookie", request);
      [responseHeaders, responseCookies] = _parseCookieHeaders("Set-Cookie", response);
    }
    const event = _createEvent({
      url: request.url,
      method: request.method,
      status: response.status,
      requestHeaders,
      responseHeaders,
      requestCookies,
      responseCookies
    });
    captureEvent(event);
  }
}
function _parseCookieHeaders(cookieHeader, obj) {
  const headers = _extractFetchHeaders(obj.headers);
  let cookies;
  try {
    const cookieString = headers[cookieHeader] || headers[cookieHeader.toLowerCase()] || void 0;
    if (cookieString) {
      cookies = _parseCookieString(cookieString);
    }
  } catch (e3) {
    DEBUG_BUILD3 && logger.log(`Could not extract cookies from header ${cookieHeader}`);
  }
  return [headers, cookies];
}
function _xhrResponseHandler(options, xhr, method, headers) {
  if (_shouldCaptureResponse(options, xhr.status, xhr.responseURL)) {
    let requestHeaders, responseCookies, responseHeaders;
    if (_shouldSendDefaultPii()) {
      try {
        const cookieString = xhr.getResponseHeader("Set-Cookie") || xhr.getResponseHeader("set-cookie") || void 0;
        if (cookieString) {
          responseCookies = _parseCookieString(cookieString);
        }
      } catch (e3) {
        DEBUG_BUILD3 && logger.log("Could not extract cookies from response headers");
      }
      try {
        responseHeaders = _getXHRResponseHeaders(xhr);
      } catch (e3) {
        DEBUG_BUILD3 && logger.log("Could not extract headers from response");
      }
      requestHeaders = headers;
    }
    const event = _createEvent({
      url: xhr.responseURL,
      method,
      status: xhr.status,
      requestHeaders,
      // Can't access request cookies from XHR
      responseHeaders,
      responseCookies
    });
    captureEvent(event);
  }
}
function _getResponseSizeFromHeaders(headers) {
  if (headers) {
    const contentLength = headers["Content-Length"] || headers["content-length"];
    if (contentLength) {
      return parseInt(contentLength, 10);
    }
  }
  return void 0;
}
function _parseCookieString(cookieString) {
  return cookieString.split("; ").reduce((acc, cookie) => {
    const [key, value] = cookie.split("=");
    if (key && value) {
      acc[key] = value;
    }
    return acc;
  }, {});
}
function _extractFetchHeaders(headers) {
  const result = {};
  headers.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}
function _getXHRResponseHeaders(xhr) {
  const headers = xhr.getAllResponseHeaders();
  if (!headers) {
    return {};
  }
  return headers.split("\r\n").reduce((acc, line) => {
    const [key, value] = line.split(": ");
    if (key && value) {
      acc[key] = value;
    }
    return acc;
  }, {});
}
function _isInGivenRequestTargets(failedRequestTargets, target) {
  return failedRequestTargets.some((givenRequestTarget) => {
    if (typeof givenRequestTarget === "string") {
      return target.includes(givenRequestTarget);
    }
    return givenRequestTarget.test(target);
  });
}
function _isInGivenStatusRanges(failedRequestStatusCodes, status) {
  return failedRequestStatusCodes.some((range) => {
    if (typeof range === "number") {
      return range === status;
    }
    return status >= range[0] && status <= range[1];
  });
}
function _wrapFetch(client, options) {
  if (!supportsNativeFetch()) {
    return;
  }
  addFetchInstrumentationHandler((handlerData) => {
    if (getClient() !== client) {
      return;
    }
    const {
      response,
      args
    } = handlerData;
    const [requestInfo, requestInit] = args;
    if (!response) {
      return;
    }
    _fetchResponseHandler(options, requestInfo, response, requestInit);
  });
}
function _wrapXHR2(client, options) {
  if (!("XMLHttpRequest" in GLOBAL_OBJ)) {
    return;
  }
  addXhrInstrumentationHandler((handlerData) => {
    if (getClient() !== client) {
      return;
    }
    const xhr = handlerData.xhr;
    const sentryXhrData = xhr[SENTRY_XHR_DATA_KEY];
    if (!sentryXhrData) {
      return;
    }
    const {
      method,
      request_headers: headers
    } = sentryXhrData;
    try {
      _xhrResponseHandler(options, xhr, method, headers);
    } catch (e3) {
      DEBUG_BUILD3 && logger.warn("Error while extracting response event form XHR response", e3);
    }
  });
}
function _shouldCaptureResponse(options, status, url) {
  return _isInGivenStatusRanges(options.failedRequestStatusCodes, status) && _isInGivenRequestTargets(options.failedRequestTargets, url) && !isSentryRequestUrl(url, getClient());
}
function _createEvent(data) {
  const message = `HTTP Client Error with status code: ${data.status}`;
  const event = {
    message,
    exception: {
      values: [{
        type: "Error",
        value: message
      }]
    },
    request: {
      url: data.url,
      method: data.method,
      headers: data.requestHeaders,
      cookies: data.requestCookies
    },
    contexts: {
      response: {
        status_code: data.status,
        headers: data.responseHeaders,
        cookies: data.responseCookies,
        body_size: _getResponseSizeFromHeaders(data.responseHeaders)
      }
    }
  };
  addExceptionMechanism(event, {
    type: "http.client",
    handled: false
  });
  return event;
}
function _getRequest(requestInfo, requestInit) {
  if (!requestInit && requestInfo instanceof Request) {
    return requestInfo;
  }
  if (requestInfo instanceof Request && requestInfo.bodyUsed) {
    return requestInfo;
  }
  return new Request(requestInfo, requestInit);
}
function _shouldSendDefaultPii() {
  const client = getClient();
  return client ? Boolean(client.getOptions().sendDefaultPii) : false;
}

// node_modules/@sentry/browser/build/npm/esm/integrations/contextlines.js
var WINDOW7 = GLOBAL_OBJ;
var DEFAULT_LINES_OF_CONTEXT = 7;
var INTEGRATION_NAME18 = "ContextLines";
var _contextLinesIntegration = (options = {}) => {
  const contextLines = options.frameContextLines != null ? options.frameContextLines : DEFAULT_LINES_OF_CONTEXT;
  return {
    name: INTEGRATION_NAME18,
    processEvent(event) {
      return addSourceContext(event, contextLines);
    }
  };
};
var contextLinesIntegration = defineIntegration(_contextLinesIntegration);
function addSourceContext(event, contextLines) {
  const doc = WINDOW7.document;
  const htmlFilename = WINDOW7.location && stripUrlQueryAndFragment(WINDOW7.location.href);
  if (!doc || !htmlFilename) {
    return event;
  }
  const exceptions = event.exception && event.exception.values;
  if (!exceptions || !exceptions.length) {
    return event;
  }
  const html = doc.documentElement.innerHTML;
  if (!html) {
    return event;
  }
  const htmlLines = ["<!DOCTYPE html>", "<html>", ...html.split("\n"), "</html>"];
  exceptions.forEach((exception) => {
    const stacktrace = exception.stacktrace;
    if (stacktrace && stacktrace.frames) {
      stacktrace.frames = stacktrace.frames.map((frame) => applySourceContextToFrame(frame, htmlLines, htmlFilename, contextLines));
    }
  });
  return event;
}
function applySourceContextToFrame(frame, htmlLines, htmlFilename, linesOfContext) {
  if (frame.filename !== htmlFilename || !frame.lineno || !htmlLines.length) {
    return frame;
  }
  addContextToFrame(htmlLines, frame, linesOfContext);
  return frame;
}

// node_modules/@sentry-internal/replay/build/npm/esm/index.js
var WINDOW8 = GLOBAL_OBJ;
var REPLAY_SESSION_KEY = "sentryReplaySession";
var REPLAY_EVENT_NAME = "replay_event";
var UNABLE_TO_SEND_REPLAY = "Unable to send Replay";
var SESSION_IDLE_PAUSE_DURATION = 3e5;
var SESSION_IDLE_EXPIRE_DURATION = 9e5;
var DEFAULT_FLUSH_MIN_DELAY = 5e3;
var DEFAULT_FLUSH_MAX_DELAY = 5500;
var BUFFER_CHECKOUT_TIME = 6e4;
var RETRY_BASE_INTERVAL = 5e3;
var RETRY_MAX_COUNT = 3;
var NETWORK_BODY_MAX_SIZE = 15e4;
var CONSOLE_ARG_MAX_SIZE = 5e3;
var SLOW_CLICK_THRESHOLD = 3e3;
var SLOW_CLICK_SCROLL_TIMEOUT = 300;
var REPLAY_MAX_EVENT_BUFFER_SIZE = 2e7;
var MIN_REPLAY_DURATION = 4999;
var MIN_REPLAY_DURATION_LIMIT = 15e3;
var MAX_REPLAY_DURATION = 36e5;
function _nullishCoalesce$1(lhs, rhsFn) {
  if (lhs != null) {
    return lhs;
  } else {
    return rhsFn();
  }
}
function _optionalChain$5(ops) {
  let lastAccessLHS = void 0;
  let value = ops[0];
  let i2 = 1;
  while (i2 < ops.length) {
    const op = ops[i2];
    const fn = ops[i2 + 1];
    i2 += 2;
    if ((op === "optionalAccess" || op === "optionalCall") && value == null) {
      return void 0;
    }
    if (op === "access" || op === "optionalAccess") {
      lastAccessLHS = value;
      value = fn(value);
    } else if (op === "call" || op === "optionalCall") {
      value = fn((...args) => value.call(lastAccessLHS, ...args));
      lastAccessLHS = void 0;
    }
  }
  return value;
}
var NodeType$1;
(function(NodeType3) {
  NodeType3[NodeType3["Document"] = 0] = "Document";
  NodeType3[NodeType3["DocumentType"] = 1] = "DocumentType";
  NodeType3[NodeType3["Element"] = 2] = "Element";
  NodeType3[NodeType3["Text"] = 3] = "Text";
  NodeType3[NodeType3["CDATA"] = 4] = "CDATA";
  NodeType3[NodeType3["Comment"] = 5] = "Comment";
})(NodeType$1 || (NodeType$1 = {}));
function isElement$1(n2) {
  return n2.nodeType === n2.ELEMENT_NODE;
}
function isShadowRoot(n2) {
  const host = _optionalChain$5([n2, "optionalAccess", (_2) => _2.host]);
  return Boolean(_optionalChain$5([host, "optionalAccess", (_2) => _2.shadowRoot]) === n2);
}
function isNativeShadowDom(shadowRoot) {
  return Object.prototype.toString.call(shadowRoot) === "[object ShadowRoot]";
}
function fixBrowserCompatibilityIssuesInCSS(cssText) {
  if (cssText.includes(" background-clip: text;") && !cssText.includes(" -webkit-background-clip: text;")) {
    cssText = cssText.replace(/\sbackground-clip:\s*text;/g, " -webkit-background-clip: text; background-clip: text;");
  }
  return cssText;
}
function escapeImportStatement(rule) {
  const {
    cssText
  } = rule;
  if (cssText.split('"').length < 3) return cssText;
  const statement = ["@import", `url(${JSON.stringify(rule.href)})`];
  if (rule.layerName === "") {
    statement.push(`layer`);
  } else if (rule.layerName) {
    statement.push(`layer(${rule.layerName})`);
  }
  if (rule.supportsText) {
    statement.push(`supports(${rule.supportsText})`);
  }
  if (rule.media.length) {
    statement.push(rule.media.mediaText);
  }
  return statement.join(" ") + ";";
}
function stringifyStylesheet(s2) {
  try {
    const rules = s2.rules || s2.cssRules;
    return rules ? fixBrowserCompatibilityIssuesInCSS(Array.from(rules, stringifyRule).join("")) : null;
  } catch (error) {
    return null;
  }
}
function stringifyRule(rule) {
  let importStringified;
  if (isCSSImportRule(rule)) {
    try {
      importStringified = stringifyStylesheet(rule.styleSheet) || escapeImportStatement(rule);
    } catch (error) {
    }
  } else if (isCSSStyleRule(rule) && rule.selectorText.includes(":")) {
    return fixSafariColons(rule.cssText);
  }
  return importStringified || rule.cssText;
}
function fixSafariColons(cssStringified) {
  const regex = /(\[(?:[\w-]+)[^\\])(:(?:[\w-]+)\])/gm;
  return cssStringified.replace(regex, "$1\\$2");
}
function isCSSImportRule(rule) {
  return "styleSheet" in rule;
}
function isCSSStyleRule(rule) {
  return "selectorText" in rule;
}
var Mirror = class {
  constructor() {
    this.idNodeMap = /* @__PURE__ */ new Map();
    this.nodeMetaMap = /* @__PURE__ */ new WeakMap();
  }
  getId(n2) {
    if (!n2) return -1;
    const id = _optionalChain$5([this, "access", (_3) => _3.getMeta, "call", (_4) => _4(n2), "optionalAccess", (_5) => _5.id]);
    return _nullishCoalesce$1(id, () => -1);
  }
  getNode(id) {
    return this.idNodeMap.get(id) || null;
  }
  getIds() {
    return Array.from(this.idNodeMap.keys());
  }
  getMeta(n2) {
    return this.nodeMetaMap.get(n2) || null;
  }
  removeNodeFromMap(n2) {
    const id = this.getId(n2);
    this.idNodeMap.delete(id);
    if (n2.childNodes) {
      n2.childNodes.forEach((childNode) => this.removeNodeFromMap(childNode));
    }
  }
  has(id) {
    return this.idNodeMap.has(id);
  }
  hasNode(node2) {
    return this.nodeMetaMap.has(node2);
  }
  add(n2, meta) {
    const id = meta.id;
    this.idNodeMap.set(id, n2);
    this.nodeMetaMap.set(n2, meta);
  }
  replace(id, n2) {
    const oldNode = this.getNode(id);
    if (oldNode) {
      const meta = this.nodeMetaMap.get(oldNode);
      if (meta) this.nodeMetaMap.set(n2, meta);
    }
    this.idNodeMap.set(id, n2);
  }
  reset() {
    this.idNodeMap = /* @__PURE__ */ new Map();
    this.nodeMetaMap = /* @__PURE__ */ new WeakMap();
  }
};
function createMirror() {
  return new Mirror();
}
function shouldMaskInput({
  maskInputOptions,
  tagName,
  type
}) {
  if (tagName === "OPTION") {
    tagName = "SELECT";
  }
  return Boolean(maskInputOptions[tagName.toLowerCase()] || type && maskInputOptions[type] || type === "password" || tagName === "INPUT" && !type && maskInputOptions["text"]);
}
function maskInputValue({
  isMasked,
  element,
  value,
  maskInputFn
}) {
  let text = value || "";
  if (!isMasked) {
    return text;
  }
  if (maskInputFn) {
    text = maskInputFn(text, element);
  }
  return "*".repeat(text.length);
}
function toLowerCase(str) {
  return str.toLowerCase();
}
function toUpperCase(str) {
  return str.toUpperCase();
}
var ORIGINAL_ATTRIBUTE_NAME = "__rrweb_original__";
function is2DCanvasBlank(canvas) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return true;
  const chunkSize = 50;
  for (let x2 = 0; x2 < canvas.width; x2 += chunkSize) {
    for (let y2 = 0; y2 < canvas.height; y2 += chunkSize) {
      const getImageData = ctx.getImageData;
      const originalGetImageData = ORIGINAL_ATTRIBUTE_NAME in getImageData ? getImageData[ORIGINAL_ATTRIBUTE_NAME] : getImageData;
      const pixelBuffer = new Uint32Array(originalGetImageData.call(ctx, x2, y2, Math.min(chunkSize, canvas.width - x2), Math.min(chunkSize, canvas.height - y2)).data.buffer);
      if (pixelBuffer.some((pixel) => pixel !== 0)) return false;
    }
  }
  return true;
}
function getInputType(element) {
  const type = element.type;
  return element.hasAttribute("data-rr-is-password") ? "password" : type ? toLowerCase(type) : null;
}
function getInputValue(el, tagName, type) {
  if (tagName === "INPUT" && (type === "radio" || type === "checkbox")) {
    return el.getAttribute("value") || "";
  }
  return el.value;
}
function extractFileExtension(path, baseURL) {
  let url;
  try {
    url = new URL(path, _nullishCoalesce$1(baseURL, () => window.location.href));
  } catch (err) {
    return null;
  }
  const regex = /\.([0-9a-z]+)(?:$)/i;
  const match = url.pathname.match(regex);
  return _nullishCoalesce$1(_optionalChain$5([match, "optionalAccess", (_6) => _6[1]]), () => null);
}
var cachedImplementations$1 = {};
function getImplementation$1(name) {
  const cached = cachedImplementations$1[name];
  if (cached) {
    return cached;
  }
  const document2 = window.document;
  let impl = window[name];
  if (document2 && typeof document2.createElement === "function") {
    try {
      const sandbox = document2.createElement("iframe");
      sandbox.hidden = true;
      document2.head.appendChild(sandbox);
      const contentWindow = sandbox.contentWindow;
      if (contentWindow && contentWindow[name]) {
        impl = contentWindow[name];
      }
      document2.head.removeChild(sandbox);
    } catch (e3) {
    }
  }
  return cachedImplementations$1[name] = impl.bind(window);
}
function setTimeout$2(...rest) {
  return getImplementation$1("setTimeout")(...rest);
}
function clearTimeout$2(...rest) {
  return getImplementation$1("clearTimeout")(...rest);
}
var _id = 1;
var tagNameRegex = new RegExp("[^a-z0-9-_:]");
var IGNORED_NODE = -2;
function genId() {
  return _id++;
}
function getValidTagName(element) {
  if (element instanceof HTMLFormElement) {
    return "form";
  }
  const processedTagName = toLowerCase(element.tagName);
  if (tagNameRegex.test(processedTagName)) {
    return "div";
  }
  return processedTagName;
}
function extractOrigin(url) {
  let origin = "";
  if (url.indexOf("//") > -1) {
    origin = url.split("/").slice(0, 3).join("/");
  } else {
    origin = url.split("/")[0];
  }
  origin = origin.split("?")[0];
  return origin;
}
var canvasService;
var canvasCtx;
var URL_IN_CSS_REF = /url\((?:(')([^']*)'|(")(.*?)"|([^)]*))\)/gm;
var URL_PROTOCOL_MATCH = /^(?:[a-z+]+:)?\/\//i;
var URL_WWW_MATCH = /^www\..*/i;
var DATA_URI = /^(data:)([^,]*),(.*)/i;
function absoluteToStylesheet(cssText, href) {
  return (cssText || "").replace(URL_IN_CSS_REF, (origin, quote1, path1, quote2, path2, path3) => {
    const filePath = path1 || path2 || path3;
    const maybeQuote = quote1 || quote2 || "";
    if (!filePath) {
      return origin;
    }
    if (URL_PROTOCOL_MATCH.test(filePath) || URL_WWW_MATCH.test(filePath)) {
      return `url(${maybeQuote}${filePath}${maybeQuote})`;
    }
    if (DATA_URI.test(filePath)) {
      return `url(${maybeQuote}${filePath}${maybeQuote})`;
    }
    if (filePath[0] === "/") {
      return `url(${maybeQuote}${extractOrigin(href) + filePath}${maybeQuote})`;
    }
    const stack = href.split("/");
    const parts = filePath.split("/");
    stack.pop();
    for (const part of parts) {
      if (part === ".") {
        continue;
      } else if (part === "..") {
        stack.pop();
      } else {
        stack.push(part);
      }
    }
    return `url(${maybeQuote}${stack.join("/")}${maybeQuote})`;
  });
}
var SRCSET_NOT_SPACES = /^[^ \t\n\r\u000c]+/;
var SRCSET_COMMAS_OR_SPACES = /^[, \t\n\r\u000c]+/;
function getAbsoluteSrcsetString(doc, attributeValue) {
  if (attributeValue.trim() === "") {
    return attributeValue;
  }
  let pos = 0;
  function collectCharacters(regEx) {
    let chars2;
    const match = regEx.exec(attributeValue.substring(pos));
    if (match) {
      chars2 = match[0];
      pos += chars2.length;
      return chars2;
    }
    return "";
  }
  const output = [];
  while (true) {
    collectCharacters(SRCSET_COMMAS_OR_SPACES);
    if (pos >= attributeValue.length) {
      break;
    }
    let url = collectCharacters(SRCSET_NOT_SPACES);
    if (url.slice(-1) === ",") {
      url = absoluteToDoc(doc, url.substring(0, url.length - 1));
      output.push(url);
    } else {
      let descriptorsStr = "";
      url = absoluteToDoc(doc, url);
      let inParens = false;
      while (true) {
        const c2 = attributeValue.charAt(pos);
        if (c2 === "") {
          output.push((url + descriptorsStr).trim());
          break;
        } else if (!inParens) {
          if (c2 === ",") {
            pos += 1;
            output.push((url + descriptorsStr).trim());
            break;
          } else if (c2 === "(") {
            inParens = true;
          }
        } else {
          if (c2 === ")") {
            inParens = false;
          }
        }
        descriptorsStr += c2;
        pos += 1;
      }
    }
  }
  return output.join(", ");
}
var cachedDocument = /* @__PURE__ */ new WeakMap();
function absoluteToDoc(doc, attributeValue) {
  if (!attributeValue || attributeValue.trim() === "") {
    return attributeValue;
  }
  return getHref(doc, attributeValue);
}
function isSVGElement(el) {
  return Boolean(el.tagName === "svg" || el.ownerSVGElement);
}
function getHref(doc, customHref) {
  let a2 = cachedDocument.get(doc);
  if (!a2) {
    a2 = doc.createElement("a");
    cachedDocument.set(doc, a2);
  }
  if (!customHref) {
    customHref = "";
  } else if (customHref.startsWith("blob:") || customHref.startsWith("data:")) {
    return customHref;
  }
  a2.setAttribute("href", customHref);
  return a2.href;
}
function transformAttribute(doc, tagName, name, value, element, maskAttributeFn) {
  if (!value) {
    return value;
  }
  if (name === "src" || name === "href" && !(tagName === "use" && value[0] === "#")) {
    return absoluteToDoc(doc, value);
  } else if (name === "xlink:href" && value[0] !== "#") {
    return absoluteToDoc(doc, value);
  } else if (name === "background" && (tagName === "table" || tagName === "td" || tagName === "th")) {
    return absoluteToDoc(doc, value);
  } else if (name === "srcset") {
    return getAbsoluteSrcsetString(doc, value);
  } else if (name === "style") {
    return absoluteToStylesheet(value, getHref(doc));
  } else if (tagName === "object" && name === "data") {
    return absoluteToDoc(doc, value);
  }
  if (typeof maskAttributeFn === "function") {
    return maskAttributeFn(name, value, element);
  }
  return value;
}
function ignoreAttribute(tagName, name, _value) {
  return (tagName === "video" || tagName === "audio") && name === "autoplay";
}
function _isBlockedElement(element, blockClass, blockSelector, unblockSelector) {
  try {
    if (unblockSelector && element.matches(unblockSelector)) {
      return false;
    }
    if (typeof blockClass === "string") {
      if (element.classList.contains(blockClass)) {
        return true;
      }
    } else {
      for (let eIndex = element.classList.length; eIndex--; ) {
        const className = element.classList[eIndex];
        if (blockClass.test(className)) {
          return true;
        }
      }
    }
    if (blockSelector) {
      return element.matches(blockSelector);
    }
  } catch (e3) {
  }
  return false;
}
function elementClassMatchesRegex(el, regex) {
  for (let eIndex = el.classList.length; eIndex--; ) {
    const className = el.classList[eIndex];
    if (regex.test(className)) {
      return true;
    }
  }
  return false;
}
function distanceToMatch(node2, matchPredicate, limit = Infinity, distance = 0) {
  if (!node2) return -1;
  if (node2.nodeType !== node2.ELEMENT_NODE) return -1;
  if (distance > limit) return -1;
  if (matchPredicate(node2)) return distance;
  return distanceToMatch(node2.parentNode, matchPredicate, limit, distance + 1);
}
function createMatchPredicate(className, selector) {
  return (node2) => {
    const el = node2;
    if (el === null) return false;
    try {
      if (className) {
        if (typeof className === "string") {
          if (el.matches(`.${className}`)) return true;
        } else if (elementClassMatchesRegex(el, className)) {
          return true;
        }
      }
      if (selector && el.matches(selector)) return true;
      return false;
    } catch (e22) {
      return false;
    }
  };
}
function needMaskingText(node2, maskTextClass, maskTextSelector, unmaskTextClass, unmaskTextSelector, maskAllText) {
  try {
    const el = node2.nodeType === node2.ELEMENT_NODE ? node2 : node2.parentElement;
    if (el === null) return false;
    if (el.tagName === "INPUT") {
      const autocomplete = el.getAttribute("autocomplete");
      const disallowedAutocompleteValues = ["current-password", "new-password", "cc-number", "cc-exp", "cc-exp-month", "cc-exp-year", "cc-csc"];
      if (disallowedAutocompleteValues.includes(autocomplete)) {
        return true;
      }
    }
    let maskDistance = -1;
    let unmaskDistance = -1;
    if (maskAllText) {
      unmaskDistance = distanceToMatch(el, createMatchPredicate(unmaskTextClass, unmaskTextSelector));
      if (unmaskDistance < 0) {
        return true;
      }
      maskDistance = distanceToMatch(el, createMatchPredicate(maskTextClass, maskTextSelector), unmaskDistance >= 0 ? unmaskDistance : Infinity);
    } else {
      maskDistance = distanceToMatch(el, createMatchPredicate(maskTextClass, maskTextSelector));
      if (maskDistance < 0) {
        return false;
      }
      unmaskDistance = distanceToMatch(el, createMatchPredicate(unmaskTextClass, unmaskTextSelector), maskDistance >= 0 ? maskDistance : Infinity);
    }
    return maskDistance >= 0 ? unmaskDistance >= 0 ? maskDistance <= unmaskDistance : true : unmaskDistance >= 0 ? false : !!maskAllText;
  } catch (e3) {
  }
  return !!maskAllText;
}
function onceIframeLoaded(iframeEl, listener, iframeLoadTimeout) {
  const win = iframeEl.contentWindow;
  if (!win) {
    return;
  }
  let fired = false;
  let readyState;
  try {
    readyState = win.document.readyState;
  } catch (error) {
    return;
  }
  if (readyState !== "complete") {
    const timer = setTimeout$2(() => {
      if (!fired) {
        listener();
        fired = true;
      }
    }, iframeLoadTimeout);
    iframeEl.addEventListener("load", () => {
      clearTimeout$2(timer);
      fired = true;
      listener();
    });
    return;
  }
  const blankUrl = "about:blank";
  if (win.location.href !== blankUrl || iframeEl.src === blankUrl || iframeEl.src === "") {
    setTimeout$2(listener, 0);
    return iframeEl.addEventListener("load", listener);
  }
  iframeEl.addEventListener("load", listener);
}
function onceStylesheetLoaded(link, listener, styleSheetLoadTimeout) {
  let fired = false;
  let styleSheetLoaded;
  try {
    styleSheetLoaded = link.sheet;
  } catch (error) {
    return;
  }
  if (styleSheetLoaded) return;
  const timer = setTimeout$2(() => {
    if (!fired) {
      listener();
      fired = true;
    }
  }, styleSheetLoadTimeout);
  link.addEventListener("load", () => {
    clearTimeout$2(timer);
    fired = true;
    listener();
  });
}
function serializeNode(n2, options) {
  const {
    doc,
    mirror: mirror2,
    blockClass,
    blockSelector,
    unblockSelector,
    maskAllText,
    maskAttributeFn,
    maskTextClass,
    unmaskTextClass,
    maskTextSelector,
    unmaskTextSelector,
    inlineStylesheet,
    maskInputOptions = {},
    maskTextFn,
    maskInputFn,
    dataURLOptions = {},
    inlineImages,
    recordCanvas,
    keepIframeSrcFn,
    newlyAddedElement = false
  } = options;
  const rootId = getRootId(doc, mirror2);
  switch (n2.nodeType) {
    case n2.DOCUMENT_NODE:
      if (n2.compatMode !== "CSS1Compat") {
        return {
          type: NodeType$1.Document,
          childNodes: [],
          compatMode: n2.compatMode
        };
      } else {
        return {
          type: NodeType$1.Document,
          childNodes: []
        };
      }
    case n2.DOCUMENT_TYPE_NODE:
      return {
        type: NodeType$1.DocumentType,
        name: n2.name,
        publicId: n2.publicId,
        systemId: n2.systemId,
        rootId
      };
    case n2.ELEMENT_NODE:
      return serializeElementNode(n2, {
        doc,
        blockClass,
        blockSelector,
        unblockSelector,
        inlineStylesheet,
        maskAttributeFn,
        maskInputOptions,
        maskInputFn,
        dataURLOptions,
        inlineImages,
        recordCanvas,
        keepIframeSrcFn,
        newlyAddedElement,
        rootId,
        maskAllText,
        maskTextClass,
        unmaskTextClass,
        maskTextSelector,
        unmaskTextSelector
      });
    case n2.TEXT_NODE:
      return serializeTextNode(n2, {
        doc,
        maskAllText,
        maskTextClass,
        unmaskTextClass,
        maskTextSelector,
        unmaskTextSelector,
        maskTextFn,
        maskInputOptions,
        maskInputFn,
        rootId
      });
    case n2.CDATA_SECTION_NODE:
      return {
        type: NodeType$1.CDATA,
        textContent: "",
        rootId
      };
    case n2.COMMENT_NODE:
      return {
        type: NodeType$1.Comment,
        textContent: n2.textContent || "",
        rootId
      };
    default:
      return false;
  }
}
function getRootId(doc, mirror2) {
  if (!mirror2.hasNode(doc)) return void 0;
  const docId = mirror2.getId(doc);
  return docId === 1 ? void 0 : docId;
}
function serializeTextNode(n2, options) {
  const {
    maskAllText,
    maskTextClass,
    unmaskTextClass,
    maskTextSelector,
    unmaskTextSelector,
    maskTextFn,
    maskInputOptions,
    maskInputFn,
    rootId
  } = options;
  const parentTagName = n2.parentNode && n2.parentNode.tagName;
  let textContent = n2.textContent;
  const isStyle = parentTagName === "STYLE" ? true : void 0;
  const isScript = parentTagName === "SCRIPT" ? true : void 0;
  const isTextarea = parentTagName === "TEXTAREA" ? true : void 0;
  if (isStyle && textContent) {
    try {
      if (n2.nextSibling || n2.previousSibling) {
      } else if (_optionalChain$5([n2, "access", (_7) => _7.parentNode, "access", (_8) => _8.sheet, "optionalAccess", (_9) => _9.cssRules])) {
        textContent = stringifyStylesheet(n2.parentNode.sheet);
      }
    } catch (err) {
      console.warn(`Cannot get CSS styles from text's parentNode. Error: ${err}`, n2);
    }
    textContent = absoluteToStylesheet(textContent, getHref(options.doc));
  }
  if (isScript) {
    textContent = "SCRIPT_PLACEHOLDER";
  }
  const forceMask = needMaskingText(n2, maskTextClass, maskTextSelector, unmaskTextClass, unmaskTextSelector, maskAllText);
  if (!isStyle && !isScript && !isTextarea && textContent && forceMask) {
    textContent = maskTextFn ? maskTextFn(textContent, n2.parentElement) : textContent.replace(/[\S]/g, "*");
  }
  if (isTextarea && textContent && (maskInputOptions.textarea || forceMask)) {
    textContent = maskInputFn ? maskInputFn(textContent, n2.parentNode) : textContent.replace(/[\S]/g, "*");
  }
  if (parentTagName === "OPTION" && textContent) {
    const isInputMasked = shouldMaskInput({
      type: null,
      tagName: parentTagName,
      maskInputOptions
    });
    textContent = maskInputValue({
      isMasked: needMaskingText(n2, maskTextClass, maskTextSelector, unmaskTextClass, unmaskTextSelector, isInputMasked),
      element: n2,
      value: textContent,
      maskInputFn
    });
  }
  return {
    type: NodeType$1.Text,
    textContent: textContent || "",
    isStyle,
    rootId
  };
}
function serializeElementNode(n2, options) {
  const {
    doc,
    blockClass,
    blockSelector,
    unblockSelector,
    inlineStylesheet,
    maskInputOptions = {},
    maskAttributeFn,
    maskInputFn,
    dataURLOptions = {},
    inlineImages,
    recordCanvas,
    keepIframeSrcFn,
    newlyAddedElement = false,
    rootId,
    maskAllText,
    maskTextClass,
    unmaskTextClass,
    maskTextSelector,
    unmaskTextSelector
  } = options;
  const needBlock = _isBlockedElement(n2, blockClass, blockSelector, unblockSelector);
  const tagName = getValidTagName(n2);
  let attributes = {};
  const len = n2.attributes.length;
  for (let i2 = 0; i2 < len; i2++) {
    const attr = n2.attributes[i2];
    if (attr.name && !ignoreAttribute(tagName, attr.name, attr.value)) {
      attributes[attr.name] = transformAttribute(doc, tagName, toLowerCase(attr.name), attr.value, n2, maskAttributeFn);
    }
  }
  if (tagName === "link" && inlineStylesheet) {
    const stylesheet = Array.from(doc.styleSheets).find((s2) => {
      return s2.href === n2.href;
    });
    let cssText = null;
    if (stylesheet) {
      cssText = stringifyStylesheet(stylesheet);
    }
    if (cssText) {
      delete attributes.rel;
      delete attributes.href;
      attributes._cssText = absoluteToStylesheet(cssText, stylesheet.href);
    }
  }
  if (tagName === "style" && n2.sheet && !(n2.innerText || n2.textContent || "").trim().length) {
    const cssText = stringifyStylesheet(n2.sheet);
    if (cssText) {
      attributes._cssText = absoluteToStylesheet(cssText, getHref(doc));
    }
  }
  if (tagName === "input" || tagName === "textarea" || tagName === "select" || tagName === "option") {
    const el = n2;
    const type = getInputType(el);
    const value = getInputValue(el, toUpperCase(tagName), type);
    const checked = el.checked;
    if (type !== "submit" && type !== "button" && value) {
      const forceMask = needMaskingText(el, maskTextClass, maskTextSelector, unmaskTextClass, unmaskTextSelector, shouldMaskInput({
        type,
        tagName: toUpperCase(tagName),
        maskInputOptions
      }));
      attributes.value = maskInputValue({
        isMasked: forceMask,
        element: el,
        value,
        maskInputFn
      });
    }
    if (checked) {
      attributes.checked = checked;
    }
  }
  if (tagName === "option") {
    if (n2.selected && !maskInputOptions["select"]) {
      attributes.selected = true;
    } else {
      delete attributes.selected;
    }
  }
  if (tagName === "canvas" && recordCanvas) {
    if (n2.__context === "2d") {
      if (!is2DCanvasBlank(n2)) {
        attributes.rr_dataURL = n2.toDataURL(dataURLOptions.type, dataURLOptions.quality);
      }
    } else if (!("__context" in n2)) {
      const canvasDataURL = n2.toDataURL(dataURLOptions.type, dataURLOptions.quality);
      const blankCanvas = doc.createElement("canvas");
      blankCanvas.width = n2.width;
      blankCanvas.height = n2.height;
      const blankCanvasDataURL = blankCanvas.toDataURL(dataURLOptions.type, dataURLOptions.quality);
      if (canvasDataURL !== blankCanvasDataURL) {
        attributes.rr_dataURL = canvasDataURL;
      }
    }
  }
  if (tagName === "img" && inlineImages) {
    if (!canvasService) {
      canvasService = doc.createElement("canvas");
      canvasCtx = canvasService.getContext("2d");
    }
    const image = n2;
    const imageSrc = image.currentSrc || image.getAttribute("src") || "<unknown-src>";
    const priorCrossOrigin = image.crossOrigin;
    const recordInlineImage = () => {
      image.removeEventListener("load", recordInlineImage);
      try {
        canvasService.width = image.naturalWidth;
        canvasService.height = image.naturalHeight;
        canvasCtx.drawImage(image, 0, 0);
        attributes.rr_dataURL = canvasService.toDataURL(dataURLOptions.type, dataURLOptions.quality);
      } catch (err) {
        if (image.crossOrigin !== "anonymous") {
          image.crossOrigin = "anonymous";
          if (image.complete && image.naturalWidth !== 0) recordInlineImage();
          else image.addEventListener("load", recordInlineImage);
          return;
        } else {
          console.warn(`Cannot inline img src=${imageSrc}! Error: ${err}`);
        }
      }
      if (image.crossOrigin === "anonymous") {
        priorCrossOrigin ? attributes.crossOrigin = priorCrossOrigin : image.removeAttribute("crossorigin");
      }
    };
    if (image.complete && image.naturalWidth !== 0) recordInlineImage();
    else image.addEventListener("load", recordInlineImage);
  }
  if (tagName === "audio" || tagName === "video") {
    attributes.rr_mediaState = n2.paused ? "paused" : "played";
    attributes.rr_mediaCurrentTime = n2.currentTime;
  }
  if (!newlyAddedElement) {
    if (n2.scrollLeft) {
      attributes.rr_scrollLeft = n2.scrollLeft;
    }
    if (n2.scrollTop) {
      attributes.rr_scrollTop = n2.scrollTop;
    }
  }
  if (needBlock) {
    const {
      width,
      height
    } = n2.getBoundingClientRect();
    attributes = {
      class: attributes.class,
      rr_width: `${width}px`,
      rr_height: `${height}px`
    };
  }
  if (tagName === "iframe" && !keepIframeSrcFn(attributes.src)) {
    if (!needBlock && !n2.contentDocument) {
      attributes.rr_src = attributes.src;
    }
    delete attributes.src;
  }
  let isCustomElement;
  try {
    if (customElements.get(tagName)) isCustomElement = true;
  } catch (e3) {
  }
  return {
    type: NodeType$1.Element,
    tagName,
    attributes,
    childNodes: [],
    isSVG: isSVGElement(n2) || void 0,
    needBlock,
    rootId,
    isCustom: isCustomElement
  };
}
function lowerIfExists(maybeAttr) {
  if (maybeAttr === void 0 || maybeAttr === null) {
    return "";
  } else {
    return maybeAttr.toLowerCase();
  }
}
function slimDOMExcluded(sn, slimDOMOptions) {
  if (slimDOMOptions.comment && sn.type === NodeType$1.Comment) {
    return true;
  } else if (sn.type === NodeType$1.Element) {
    if (slimDOMOptions.script && (sn.tagName === "script" || sn.tagName === "link" && (sn.attributes.rel === "preload" || sn.attributes.rel === "modulepreload") && sn.attributes.as === "script" || sn.tagName === "link" && sn.attributes.rel === "prefetch" && typeof sn.attributes.href === "string" && extractFileExtension(sn.attributes.href) === "js")) {
      return true;
    } else if (slimDOMOptions.headFavicon && (sn.tagName === "link" && sn.attributes.rel === "shortcut icon" || sn.tagName === "meta" && (lowerIfExists(sn.attributes.name).match(/^msapplication-tile(image|color)$/) || lowerIfExists(sn.attributes.name) === "application-name" || lowerIfExists(sn.attributes.rel) === "icon" || lowerIfExists(sn.attributes.rel) === "apple-touch-icon" || lowerIfExists(sn.attributes.rel) === "shortcut icon"))) {
      return true;
    } else if (sn.tagName === "meta") {
      if (slimDOMOptions.headMetaDescKeywords && lowerIfExists(sn.attributes.name).match(/^description|keywords$/)) {
        return true;
      } else if (slimDOMOptions.headMetaSocial && (lowerIfExists(sn.attributes.property).match(/^(og|twitter|fb):/) || lowerIfExists(sn.attributes.name).match(/^(og|twitter):/) || lowerIfExists(sn.attributes.name) === "pinterest")) {
        return true;
      } else if (slimDOMOptions.headMetaRobots && (lowerIfExists(sn.attributes.name) === "robots" || lowerIfExists(sn.attributes.name) === "googlebot" || lowerIfExists(sn.attributes.name) === "bingbot")) {
        return true;
      } else if (slimDOMOptions.headMetaHttpEquiv && sn.attributes["http-equiv"] !== void 0) {
        return true;
      } else if (slimDOMOptions.headMetaAuthorship && (lowerIfExists(sn.attributes.name) === "author" || lowerIfExists(sn.attributes.name) === "generator" || lowerIfExists(sn.attributes.name) === "framework" || lowerIfExists(sn.attributes.name) === "publisher" || lowerIfExists(sn.attributes.name) === "progid" || lowerIfExists(sn.attributes.property).match(/^article:/) || lowerIfExists(sn.attributes.property).match(/^product:/))) {
        return true;
      } else if (slimDOMOptions.headMetaVerification && (lowerIfExists(sn.attributes.name) === "google-site-verification" || lowerIfExists(sn.attributes.name) === "yandex-verification" || lowerIfExists(sn.attributes.name) === "csrf-token" || lowerIfExists(sn.attributes.name) === "p:domain_verify" || lowerIfExists(sn.attributes.name) === "verify-v1" || lowerIfExists(sn.attributes.name) === "verification" || lowerIfExists(sn.attributes.name) === "shopify-checkout-api-token")) {
        return true;
      }
    }
  }
  return false;
}
function serializeNodeWithId(n2, options) {
  const {
    doc,
    mirror: mirror2,
    blockClass,
    blockSelector,
    unblockSelector,
    maskAllText,
    maskTextClass,
    unmaskTextClass,
    maskTextSelector,
    unmaskTextSelector,
    skipChild = false,
    inlineStylesheet = true,
    maskInputOptions = {},
    maskAttributeFn,
    maskTextFn,
    maskInputFn,
    slimDOMOptions,
    dataURLOptions = {},
    inlineImages = false,
    recordCanvas = false,
    onSerialize,
    onIframeLoad,
    iframeLoadTimeout = 5e3,
    onStylesheetLoad,
    stylesheetLoadTimeout = 5e3,
    keepIframeSrcFn = () => false,
    newlyAddedElement = false
  } = options;
  let {
    preserveWhiteSpace = true
  } = options;
  const _serializedNode = serializeNode(n2, {
    doc,
    mirror: mirror2,
    blockClass,
    blockSelector,
    maskAllText,
    unblockSelector,
    maskTextClass,
    unmaskTextClass,
    maskTextSelector,
    unmaskTextSelector,
    inlineStylesheet,
    maskInputOptions,
    maskAttributeFn,
    maskTextFn,
    maskInputFn,
    dataURLOptions,
    inlineImages,
    recordCanvas,
    keepIframeSrcFn,
    newlyAddedElement
  });
  if (!_serializedNode) {
    console.warn(n2, "not serialized");
    return null;
  }
  let id;
  if (mirror2.hasNode(n2)) {
    id = mirror2.getId(n2);
  } else if (slimDOMExcluded(_serializedNode, slimDOMOptions) || !preserveWhiteSpace && _serializedNode.type === NodeType$1.Text && !_serializedNode.isStyle && !_serializedNode.textContent.replace(/^\s+|\s+$/gm, "").length) {
    id = IGNORED_NODE;
  } else {
    id = genId();
  }
  const serializedNode = Object.assign(_serializedNode, {
    id
  });
  mirror2.add(n2, serializedNode);
  if (id === IGNORED_NODE) {
    return null;
  }
  if (onSerialize) {
    onSerialize(n2);
  }
  let recordChild = !skipChild;
  if (serializedNode.type === NodeType$1.Element) {
    recordChild = recordChild && !serializedNode.needBlock;
    delete serializedNode.needBlock;
    const shadowRoot = n2.shadowRoot;
    if (shadowRoot && isNativeShadowDom(shadowRoot)) serializedNode.isShadowHost = true;
  }
  if ((serializedNode.type === NodeType$1.Document || serializedNode.type === NodeType$1.Element) && recordChild) {
    if (slimDOMOptions.headWhitespace && serializedNode.type === NodeType$1.Element && serializedNode.tagName === "head") {
      preserveWhiteSpace = false;
    }
    const bypassOptions = {
      doc,
      mirror: mirror2,
      blockClass,
      blockSelector,
      maskAllText,
      unblockSelector,
      maskTextClass,
      unmaskTextClass,
      maskTextSelector,
      unmaskTextSelector,
      skipChild,
      inlineStylesheet,
      maskInputOptions,
      maskAttributeFn,
      maskTextFn,
      maskInputFn,
      slimDOMOptions,
      dataURLOptions,
      inlineImages,
      recordCanvas,
      preserveWhiteSpace,
      onSerialize,
      onIframeLoad,
      iframeLoadTimeout,
      onStylesheetLoad,
      stylesheetLoadTimeout,
      keepIframeSrcFn
    };
    for (const childN of Array.from(n2.childNodes)) {
      const serializedChildNode = serializeNodeWithId(childN, bypassOptions);
      if (serializedChildNode) {
        serializedNode.childNodes.push(serializedChildNode);
      }
    }
    if (isElement$1(n2) && n2.shadowRoot) {
      for (const childN of Array.from(n2.shadowRoot.childNodes)) {
        const serializedChildNode = serializeNodeWithId(childN, bypassOptions);
        if (serializedChildNode) {
          isNativeShadowDom(n2.shadowRoot) && (serializedChildNode.isShadow = true);
          serializedNode.childNodes.push(serializedChildNode);
        }
      }
    }
  }
  if (n2.parentNode && isShadowRoot(n2.parentNode) && isNativeShadowDom(n2.parentNode)) {
    serializedNode.isShadow = true;
  }
  if (serializedNode.type === NodeType$1.Element && serializedNode.tagName === "iframe") {
    onceIframeLoaded(n2, () => {
      const iframeDoc = n2.contentDocument;
      if (iframeDoc && onIframeLoad) {
        const serializedIframeNode = serializeNodeWithId(iframeDoc, {
          doc: iframeDoc,
          mirror: mirror2,
          blockClass,
          blockSelector,
          unblockSelector,
          maskAllText,
          maskTextClass,
          unmaskTextClass,
          maskTextSelector,
          unmaskTextSelector,
          skipChild: false,
          inlineStylesheet,
          maskInputOptions,
          maskAttributeFn,
          maskTextFn,
          maskInputFn,
          slimDOMOptions,
          dataURLOptions,
          inlineImages,
          recordCanvas,
          preserveWhiteSpace,
          onSerialize,
          onIframeLoad,
          iframeLoadTimeout,
          onStylesheetLoad,
          stylesheetLoadTimeout,
          keepIframeSrcFn
        });
        if (serializedIframeNode) {
          onIframeLoad(n2, serializedIframeNode);
        }
      }
    }, iframeLoadTimeout);
  }
  if (serializedNode.type === NodeType$1.Element && serializedNode.tagName === "link" && typeof serializedNode.attributes.rel === "string" && (serializedNode.attributes.rel === "stylesheet" || serializedNode.attributes.rel === "preload" && typeof serializedNode.attributes.href === "string" && extractFileExtension(serializedNode.attributes.href) === "css")) {
    onceStylesheetLoaded(n2, () => {
      if (onStylesheetLoad) {
        const serializedLinkNode = serializeNodeWithId(n2, {
          doc,
          mirror: mirror2,
          blockClass,
          blockSelector,
          unblockSelector,
          maskAllText,
          maskTextClass,
          unmaskTextClass,
          maskTextSelector,
          unmaskTextSelector,
          skipChild: false,
          inlineStylesheet,
          maskInputOptions,
          maskAttributeFn,
          maskTextFn,
          maskInputFn,
          slimDOMOptions,
          dataURLOptions,
          inlineImages,
          recordCanvas,
          preserveWhiteSpace,
          onSerialize,
          onIframeLoad,
          iframeLoadTimeout,
          onStylesheetLoad,
          stylesheetLoadTimeout,
          keepIframeSrcFn
        });
        if (serializedLinkNode) {
          onStylesheetLoad(n2, serializedLinkNode);
        }
      }
    }, stylesheetLoadTimeout);
  }
  return serializedNode;
}
function snapshot(n2, options) {
  const {
    mirror: mirror2 = new Mirror(),
    blockClass = "rr-block",
    blockSelector = null,
    unblockSelector = null,
    maskAllText = false,
    maskTextClass = "rr-mask",
    unmaskTextClass = null,
    maskTextSelector = null,
    unmaskTextSelector = null,
    inlineStylesheet = true,
    inlineImages = false,
    recordCanvas = false,
    maskAllInputs = false,
    maskAttributeFn,
    maskTextFn,
    maskInputFn,
    slimDOM = false,
    dataURLOptions,
    preserveWhiteSpace,
    onSerialize,
    onIframeLoad,
    iframeLoadTimeout,
    onStylesheetLoad,
    stylesheetLoadTimeout,
    keepIframeSrcFn = () => false
  } = options || {};
  const maskInputOptions = maskAllInputs === true ? {
    color: true,
    date: true,
    "datetime-local": true,
    email: true,
    month: true,
    number: true,
    range: true,
    search: true,
    tel: true,
    text: true,
    time: true,
    url: true,
    week: true,
    textarea: true,
    select: true
  } : maskAllInputs === false ? {} : maskAllInputs;
  const slimDOMOptions = slimDOM === true || slimDOM === "all" ? {
    script: true,
    comment: true,
    headFavicon: true,
    headWhitespace: true,
    headMetaDescKeywords: slimDOM === "all",
    headMetaSocial: true,
    headMetaRobots: true,
    headMetaHttpEquiv: true,
    headMetaAuthorship: true,
    headMetaVerification: true
  } : slimDOM === false ? {} : slimDOM;
  return serializeNodeWithId(n2, {
    doc: n2,
    mirror: mirror2,
    blockClass,
    blockSelector,
    unblockSelector,
    maskAllText,
    maskTextClass,
    unmaskTextClass,
    maskTextSelector,
    unmaskTextSelector,
    skipChild: false,
    inlineStylesheet,
    maskInputOptions,
    maskAttributeFn,
    maskTextFn,
    maskInputFn,
    slimDOMOptions,
    dataURLOptions,
    inlineImages,
    recordCanvas,
    preserveWhiteSpace,
    onSerialize,
    onIframeLoad,
    iframeLoadTimeout,
    onStylesheetLoad,
    stylesheetLoadTimeout,
    keepIframeSrcFn,
    newlyAddedElement: false
  });
}
function _optionalChain$4(ops) {
  let lastAccessLHS = void 0;
  let value = ops[0];
  let i2 = 1;
  while (i2 < ops.length) {
    const op = ops[i2];
    const fn = ops[i2 + 1];
    i2 += 2;
    if ((op === "optionalAccess" || op === "optionalCall") && value == null) {
      return void 0;
    }
    if (op === "access" || op === "optionalAccess") {
      lastAccessLHS = value;
      value = fn(value);
    } else if (op === "call" || op === "optionalCall") {
      value = fn((...args) => value.call(lastAccessLHS, ...args));
      lastAccessLHS = void 0;
    }
  }
  return value;
}
function on(type, fn, target = document) {
  const options = {
    capture: true,
    passive: true
  };
  target.addEventListener(type, fn, options);
  return () => target.removeEventListener(type, fn, options);
}
var DEPARTED_MIRROR_ACCESS_WARNING = "Please stop import mirror directly. Instead of that,\r\nnow you can use replayer.getMirror() to access the mirror instance of a replayer,\r\nor you can use record.mirror to access the mirror instance during recording.";
var _mirror = {
  map: {},
  getId() {
    console.error(DEPARTED_MIRROR_ACCESS_WARNING);
    return -1;
  },
  getNode() {
    console.error(DEPARTED_MIRROR_ACCESS_WARNING);
    return null;
  },
  removeNodeFromMap() {
    console.error(DEPARTED_MIRROR_ACCESS_WARNING);
  },
  has() {
    console.error(DEPARTED_MIRROR_ACCESS_WARNING);
    return false;
  },
  reset() {
    console.error(DEPARTED_MIRROR_ACCESS_WARNING);
  }
};
if (typeof window !== "undefined" && window.Proxy && window.Reflect) {
  _mirror = new Proxy(_mirror, {
    get(target, prop, receiver) {
      if (prop === "map") {
        console.error(DEPARTED_MIRROR_ACCESS_WARNING);
      }
      return Reflect.get(target, prop, receiver);
    }
  });
}
function throttle$1(func, wait, options = {}) {
  let timeout = null;
  let previous = 0;
  return function(...args) {
    const now = Date.now();
    if (!previous && options.leading === false) {
      previous = now;
    }
    const remaining = wait - (now - previous);
    const context = this;
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout$1(timeout);
        timeout = null;
      }
      previous = now;
      func.apply(context, args);
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout$1(() => {
        previous = options.leading === false ? 0 : Date.now();
        timeout = null;
        func.apply(context, args);
      }, remaining);
    }
  };
}
function hookSetter(target, key, d2, isRevoked, win = window) {
  const original = win.Object.getOwnPropertyDescriptor(target, key);
  win.Object.defineProperty(target, key, isRevoked ? d2 : {
    set(value) {
      setTimeout$1(() => {
        d2.set.call(this, value);
      }, 0);
      if (original && original.set) {
        original.set.call(this, value);
      }
    }
  });
  return () => hookSetter(target, key, original || {}, true);
}
function patch(source, name, replacement) {
  try {
    if (!(name in source)) {
      return () => {
      };
    }
    const original = source[name];
    const wrapped = replacement(original);
    if (typeof wrapped === "function") {
      wrapped.prototype = wrapped.prototype || {};
      Object.defineProperties(wrapped, {
        __rrweb_original__: {
          enumerable: false,
          value: original
        }
      });
    }
    source[name] = wrapped;
    return () => {
      source[name] = original;
    };
  } catch (e22) {
    return () => {
    };
  }
}
var nowTimestamp = Date.now;
if (!/[1-9][0-9]{12}/.test(Date.now().toString())) {
  nowTimestamp = () => (/* @__PURE__ */ new Date()).getTime();
}
function getWindowScroll(win) {
  const doc = win.document;
  return {
    left: doc.scrollingElement ? doc.scrollingElement.scrollLeft : win.pageXOffset !== void 0 ? win.pageXOffset : _optionalChain$4([doc, "optionalAccess", (_2) => _2.documentElement, "access", (_2) => _2.scrollLeft]) || _optionalChain$4([doc, "optionalAccess", (_3) => _3.body, "optionalAccess", (_4) => _4.parentElement, "optionalAccess", (_5) => _5.scrollLeft]) || _optionalChain$4([doc, "optionalAccess", (_6) => _6.body, "optionalAccess", (_7) => _7.scrollLeft]) || 0,
    top: doc.scrollingElement ? doc.scrollingElement.scrollTop : win.pageYOffset !== void 0 ? win.pageYOffset : _optionalChain$4([doc, "optionalAccess", (_8) => _8.documentElement, "access", (_9) => _9.scrollTop]) || _optionalChain$4([doc, "optionalAccess", (_10) => _10.body, "optionalAccess", (_11) => _11.parentElement, "optionalAccess", (_12) => _12.scrollTop]) || _optionalChain$4([doc, "optionalAccess", (_13) => _13.body, "optionalAccess", (_14) => _14.scrollTop]) || 0
  };
}
function getWindowHeight() {
  return window.innerHeight || document.documentElement && document.documentElement.clientHeight || document.body && document.body.clientHeight;
}
function getWindowWidth() {
  return window.innerWidth || document.documentElement && document.documentElement.clientWidth || document.body && document.body.clientWidth;
}
function closestElementOfNode(node2) {
  if (!node2) {
    return null;
  }
  const el = node2.nodeType === node2.ELEMENT_NODE ? node2 : node2.parentElement;
  return el;
}
function isBlocked(node2, blockClass, blockSelector, unblockSelector, checkAncestors) {
  if (!node2) {
    return false;
  }
  const el = closestElementOfNode(node2);
  if (!el) {
    return false;
  }
  const blockedPredicate = createMatchPredicate(blockClass, blockSelector);
  if (!checkAncestors) {
    const isUnblocked = unblockSelector && el.matches(unblockSelector);
    return blockedPredicate(el) && !isUnblocked;
  }
  const blockDistance = distanceToMatch(el, blockedPredicate);
  let unblockDistance = -1;
  if (blockDistance < 0) {
    return false;
  }
  if (unblockSelector) {
    unblockDistance = distanceToMatch(el, createMatchPredicate(null, unblockSelector));
  }
  if (blockDistance > -1 && unblockDistance < 0) {
    return true;
  }
  return blockDistance < unblockDistance;
}
function isSerialized(n2, mirror2) {
  return mirror2.getId(n2) !== -1;
}
function isIgnored(n2, mirror2) {
  return mirror2.getId(n2) === IGNORED_NODE;
}
function isAncestorRemoved(target, mirror2) {
  if (isShadowRoot(target)) {
    return false;
  }
  const id = mirror2.getId(target);
  if (!mirror2.has(id)) {
    return true;
  }
  if (target.parentNode && target.parentNode.nodeType === target.DOCUMENT_NODE) {
    return false;
  }
  if (!target.parentNode) {
    return true;
  }
  return isAncestorRemoved(target.parentNode, mirror2);
}
function legacy_isTouchEvent(event) {
  return Boolean(event.changedTouches);
}
function polyfill(win = window) {
  if ("NodeList" in win && !win.NodeList.prototype.forEach) {
    win.NodeList.prototype.forEach = Array.prototype.forEach;
  }
  if ("DOMTokenList" in win && !win.DOMTokenList.prototype.forEach) {
    win.DOMTokenList.prototype.forEach = Array.prototype.forEach;
  }
  if (!Node.prototype.contains) {
    Node.prototype.contains = (...args) => {
      let node2 = args[0];
      if (!(0 in args)) {
        throw new TypeError("1 argument is required");
      }
      do {
        if (this === node2) {
          return true;
        }
      } while (node2 = node2 && node2.parentNode);
      return false;
    };
  }
}
function isSerializedIframe(n2, mirror2) {
  return Boolean(n2.nodeName === "IFRAME" && mirror2.getMeta(n2));
}
function isSerializedStylesheet(n2, mirror2) {
  return Boolean(n2.nodeName === "LINK" && n2.nodeType === n2.ELEMENT_NODE && n2.getAttribute && n2.getAttribute("rel") === "stylesheet" && mirror2.getMeta(n2));
}
function hasShadowRoot(n2) {
  return Boolean(_optionalChain$4([n2, "optionalAccess", (_18) => _18.shadowRoot]));
}
var StyleSheetMirror = class {
  constructor() {
    this.id = 1;
    this.styleIDMap = /* @__PURE__ */ new WeakMap();
    this.idStyleMap = /* @__PURE__ */ new Map();
  }
  getId(stylesheet) {
    return _nullishCoalesce(this.styleIDMap.get(stylesheet), () => -1);
  }
  has(stylesheet) {
    return this.styleIDMap.has(stylesheet);
  }
  add(stylesheet, id) {
    if (this.has(stylesheet)) return this.getId(stylesheet);
    let newId;
    if (id === void 0) {
      newId = this.id++;
    } else newId = id;
    this.styleIDMap.set(stylesheet, newId);
    this.idStyleMap.set(newId, stylesheet);
    return newId;
  }
  getStyle(id) {
    return this.idStyleMap.get(id) || null;
  }
  reset() {
    this.styleIDMap = /* @__PURE__ */ new WeakMap();
    this.idStyleMap = /* @__PURE__ */ new Map();
    this.id = 1;
  }
  generateId() {
    return this.id++;
  }
};
function getShadowHost(n2) {
  let shadowHost = null;
  if (_optionalChain$4([n2, "access", (_19) => _19.getRootNode, "optionalCall", (_20) => _20(), "optionalAccess", (_21) => _21.nodeType]) === Node.DOCUMENT_FRAGMENT_NODE && n2.getRootNode().host) shadowHost = n2.getRootNode().host;
  return shadowHost;
}
function getRootShadowHost(n2) {
  let rootShadowHost = n2;
  let shadowHost;
  while (shadowHost = getShadowHost(rootShadowHost)) rootShadowHost = shadowHost;
  return rootShadowHost;
}
function shadowHostInDom(n2) {
  const doc = n2.ownerDocument;
  if (!doc) return false;
  const shadowHost = getRootShadowHost(n2);
  return doc.contains(shadowHost);
}
function inDom(n2) {
  const doc = n2.ownerDocument;
  if (!doc) return false;
  return doc.contains(n2) || shadowHostInDom(n2);
}
var cachedImplementations2 = {};
function getImplementation(name) {
  const cached = cachedImplementations2[name];
  if (cached) {
    return cached;
  }
  const document2 = window.document;
  let impl = window[name];
  if (document2 && typeof document2.createElement === "function") {
    try {
      const sandbox = document2.createElement("iframe");
      sandbox.hidden = true;
      document2.head.appendChild(sandbox);
      const contentWindow = sandbox.contentWindow;
      if (contentWindow && contentWindow[name]) {
        impl = contentWindow[name];
      }
      document2.head.removeChild(sandbox);
    } catch (e3) {
    }
  }
  return cachedImplementations2[name] = impl.bind(window);
}
function onRequestAnimationFrame(...rest) {
  return getImplementation("requestAnimationFrame")(...rest);
}
function setTimeout$1(...rest) {
  return getImplementation("setTimeout")(...rest);
}
function clearTimeout$1(...rest) {
  return getImplementation("clearTimeout")(...rest);
}
var EventType = ((EventType2) => {
  EventType2[EventType2["DomContentLoaded"] = 0] = "DomContentLoaded";
  EventType2[EventType2["Load"] = 1] = "Load";
  EventType2[EventType2["FullSnapshot"] = 2] = "FullSnapshot";
  EventType2[EventType2["IncrementalSnapshot"] = 3] = "IncrementalSnapshot";
  EventType2[EventType2["Meta"] = 4] = "Meta";
  EventType2[EventType2["Custom"] = 5] = "Custom";
  EventType2[EventType2["Plugin"] = 6] = "Plugin";
  return EventType2;
})(EventType || {});
var IncrementalSource = ((IncrementalSource2) => {
  IncrementalSource2[IncrementalSource2["Mutation"] = 0] = "Mutation";
  IncrementalSource2[IncrementalSource2["MouseMove"] = 1] = "MouseMove";
  IncrementalSource2[IncrementalSource2["MouseInteraction"] = 2] = "MouseInteraction";
  IncrementalSource2[IncrementalSource2["Scroll"] = 3] = "Scroll";
  IncrementalSource2[IncrementalSource2["ViewportResize"] = 4] = "ViewportResize";
  IncrementalSource2[IncrementalSource2["Input"] = 5] = "Input";
  IncrementalSource2[IncrementalSource2["TouchMove"] = 6] = "TouchMove";
  IncrementalSource2[IncrementalSource2["MediaInteraction"] = 7] = "MediaInteraction";
  IncrementalSource2[IncrementalSource2["StyleSheetRule"] = 8] = "StyleSheetRule";
  IncrementalSource2[IncrementalSource2["CanvasMutation"] = 9] = "CanvasMutation";
  IncrementalSource2[IncrementalSource2["Font"] = 10] = "Font";
  IncrementalSource2[IncrementalSource2["Log"] = 11] = "Log";
  IncrementalSource2[IncrementalSource2["Drag"] = 12] = "Drag";
  IncrementalSource2[IncrementalSource2["StyleDeclaration"] = 13] = "StyleDeclaration";
  IncrementalSource2[IncrementalSource2["Selection"] = 14] = "Selection";
  IncrementalSource2[IncrementalSource2["AdoptedStyleSheet"] = 15] = "AdoptedStyleSheet";
  IncrementalSource2[IncrementalSource2["CustomElement"] = 16] = "CustomElement";
  return IncrementalSource2;
})(IncrementalSource || {});
var MouseInteractions = ((MouseInteractions2) => {
  MouseInteractions2[MouseInteractions2["MouseUp"] = 0] = "MouseUp";
  MouseInteractions2[MouseInteractions2["MouseDown"] = 1] = "MouseDown";
  MouseInteractions2[MouseInteractions2["Click"] = 2] = "Click";
  MouseInteractions2[MouseInteractions2["ContextMenu"] = 3] = "ContextMenu";
  MouseInteractions2[MouseInteractions2["DblClick"] = 4] = "DblClick";
  MouseInteractions2[MouseInteractions2["Focus"] = 5] = "Focus";
  MouseInteractions2[MouseInteractions2["Blur"] = 6] = "Blur";
  MouseInteractions2[MouseInteractions2["TouchStart"] = 7] = "TouchStart";
  MouseInteractions2[MouseInteractions2["TouchMove_Departed"] = 8] = "TouchMove_Departed";
  MouseInteractions2[MouseInteractions2["TouchEnd"] = 9] = "TouchEnd";
  MouseInteractions2[MouseInteractions2["TouchCancel"] = 10] = "TouchCancel";
  return MouseInteractions2;
})(MouseInteractions || {});
var PointerTypes = ((PointerTypes2) => {
  PointerTypes2[PointerTypes2["Mouse"] = 0] = "Mouse";
  PointerTypes2[PointerTypes2["Pen"] = 1] = "Pen";
  PointerTypes2[PointerTypes2["Touch"] = 2] = "Touch";
  return PointerTypes2;
})(PointerTypes || {});
function _optionalChain$3(ops) {
  let lastAccessLHS = void 0;
  let value = ops[0];
  let i2 = 1;
  while (i2 < ops.length) {
    const op = ops[i2];
    const fn = ops[i2 + 1];
    i2 += 2;
    if ((op === "optionalAccess" || op === "optionalCall") && value == null) {
      return void 0;
    }
    if (op === "access" || op === "optionalAccess") {
      lastAccessLHS = value;
      value = fn(value);
    } else if (op === "call" || op === "optionalCall") {
      value = fn((...args) => value.call(lastAccessLHS, ...args));
      lastAccessLHS = void 0;
    }
  }
  return value;
}
function isNodeInLinkedList(n2) {
  return "__ln" in n2;
}
var DoubleLinkedList = class {
  constructor() {
    this.length = 0;
    this.head = null;
    this.tail = null;
  }
  get(position) {
    if (position >= this.length) {
      throw new Error("Position outside of list range");
    }
    let current = this.head;
    for (let index = 0; index < position; index++) {
      current = _optionalChain$3([current, "optionalAccess", (_2) => _2.next]) || null;
    }
    return current;
  }
  addNode(n2) {
    const node2 = {
      value: n2,
      previous: null,
      next: null
    };
    n2.__ln = node2;
    if (n2.previousSibling && isNodeInLinkedList(n2.previousSibling)) {
      const current = n2.previousSibling.__ln.next;
      node2.next = current;
      node2.previous = n2.previousSibling.__ln;
      n2.previousSibling.__ln.next = node2;
      if (current) {
        current.previous = node2;
      }
    } else if (n2.nextSibling && isNodeInLinkedList(n2.nextSibling) && n2.nextSibling.__ln.previous) {
      const current = n2.nextSibling.__ln.previous;
      node2.previous = current;
      node2.next = n2.nextSibling.__ln;
      n2.nextSibling.__ln.previous = node2;
      if (current) {
        current.next = node2;
      }
    } else {
      if (this.head) {
        this.head.previous = node2;
      }
      node2.next = this.head;
      this.head = node2;
    }
    if (node2.next === null) {
      this.tail = node2;
    }
    this.length++;
  }
  removeNode(n2) {
    const current = n2.__ln;
    if (!this.head) {
      return;
    }
    if (!current.previous) {
      this.head = current.next;
      if (this.head) {
        this.head.previous = null;
      } else {
        this.tail = null;
      }
    } else {
      current.previous.next = current.next;
      if (current.next) {
        current.next.previous = current.previous;
      } else {
        this.tail = current.previous;
      }
    }
    if (n2.__ln) {
      delete n2.__ln;
    }
    this.length--;
  }
};
var moveKey = (id, parentId) => `${id}@${parentId}`;
var MutationBuffer = class {
  constructor() {
    this.frozen = false;
    this.locked = false;
    this.texts = [];
    this.attributes = [];
    this.attributeMap = /* @__PURE__ */ new WeakMap();
    this.removes = [];
    this.mapRemoves = [];
    this.movedMap = {};
    this.addedSet = /* @__PURE__ */ new Set();
    this.movedSet = /* @__PURE__ */ new Set();
    this.droppedSet = /* @__PURE__ */ new Set();
    this.processMutations = (mutations) => {
      mutations.forEach(this.processMutation);
      this.emit();
    };
    this.emit = () => {
      if (this.frozen || this.locked) {
        return;
      }
      const adds = [];
      const addedIds = /* @__PURE__ */ new Set();
      const addList = new DoubleLinkedList();
      const getNextId = (n2) => {
        let ns = n2;
        let nextId = IGNORED_NODE;
        while (nextId === IGNORED_NODE) {
          ns = ns && ns.nextSibling;
          nextId = ns && this.mirror.getId(ns);
        }
        return nextId;
      };
      const pushAdd = (n2) => {
        if (!n2.parentNode || !inDom(n2)) {
          return;
        }
        const parentId = isShadowRoot(n2.parentNode) ? this.mirror.getId(getShadowHost(n2)) : this.mirror.getId(n2.parentNode);
        const nextId = getNextId(n2);
        if (parentId === -1 || nextId === -1) {
          return addList.addNode(n2);
        }
        const sn = serializeNodeWithId(n2, {
          doc: this.doc,
          mirror: this.mirror,
          blockClass: this.blockClass,
          blockSelector: this.blockSelector,
          maskAllText: this.maskAllText,
          unblockSelector: this.unblockSelector,
          maskTextClass: this.maskTextClass,
          unmaskTextClass: this.unmaskTextClass,
          maskTextSelector: this.maskTextSelector,
          unmaskTextSelector: this.unmaskTextSelector,
          skipChild: true,
          newlyAddedElement: true,
          inlineStylesheet: this.inlineStylesheet,
          maskInputOptions: this.maskInputOptions,
          maskAttributeFn: this.maskAttributeFn,
          maskTextFn: this.maskTextFn,
          maskInputFn: this.maskInputFn,
          slimDOMOptions: this.slimDOMOptions,
          dataURLOptions: this.dataURLOptions,
          recordCanvas: this.recordCanvas,
          inlineImages: this.inlineImages,
          onSerialize: (currentN) => {
            if (isSerializedIframe(currentN, this.mirror) && !isBlocked(currentN, this.blockClass, this.blockSelector, this.unblockSelector, false)) {
              this.iframeManager.addIframe(currentN);
            }
            if (isSerializedStylesheet(currentN, this.mirror)) {
              this.stylesheetManager.trackLinkElement(currentN);
            }
            if (hasShadowRoot(n2)) {
              this.shadowDomManager.addShadowRoot(n2.shadowRoot, this.doc);
            }
          },
          onIframeLoad: (iframe, childSn) => {
            if (isBlocked(iframe, this.blockClass, this.blockSelector, this.unblockSelector, false)) {
              return;
            }
            this.iframeManager.attachIframe(iframe, childSn);
            if (iframe.contentWindow) {
              this.canvasManager.addWindow(iframe.contentWindow);
            }
            this.shadowDomManager.observeAttachShadow(iframe);
          },
          onStylesheetLoad: (link, childSn) => {
            this.stylesheetManager.attachLinkElement(link, childSn);
          }
        });
        if (sn) {
          adds.push({
            parentId,
            nextId,
            node: sn
          });
          addedIds.add(sn.id);
        }
      };
      while (this.mapRemoves.length) {
        this.mirror.removeNodeFromMap(this.mapRemoves.shift());
      }
      for (const n2 of this.movedSet) {
        if (isParentRemoved(this.removes, n2, this.mirror) && !this.movedSet.has(n2.parentNode)) {
          continue;
        }
        pushAdd(n2);
      }
      for (const n2 of this.addedSet) {
        if (!isAncestorInSet(this.droppedSet, n2) && !isParentRemoved(this.removes, n2, this.mirror)) {
          pushAdd(n2);
        } else if (isAncestorInSet(this.movedSet, n2)) {
          pushAdd(n2);
        } else {
          this.droppedSet.add(n2);
        }
      }
      let candidate = null;
      while (addList.length) {
        let node2 = null;
        if (candidate) {
          const parentId = this.mirror.getId(candidate.value.parentNode);
          const nextId = getNextId(candidate.value);
          if (parentId !== -1 && nextId !== -1) {
            node2 = candidate;
          }
        }
        if (!node2) {
          let tailNode = addList.tail;
          while (tailNode) {
            const _node = tailNode;
            tailNode = tailNode.previous;
            if (_node) {
              const parentId = this.mirror.getId(_node.value.parentNode);
              const nextId = getNextId(_node.value);
              if (nextId === -1) continue;
              else if (parentId !== -1) {
                node2 = _node;
                break;
              } else {
                const unhandledNode = _node.value;
                if (unhandledNode.parentNode && unhandledNode.parentNode.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
                  const shadowHost = unhandledNode.parentNode.host;
                  const parentId2 = this.mirror.getId(shadowHost);
                  if (parentId2 !== -1) {
                    node2 = _node;
                    break;
                  }
                }
              }
            }
          }
        }
        if (!node2) {
          while (addList.head) {
            addList.removeNode(addList.head.value);
          }
          break;
        }
        candidate = node2.previous;
        addList.removeNode(node2.value);
        pushAdd(node2.value);
      }
      const payload = {
        texts: this.texts.map((text) => ({
          id: this.mirror.getId(text.node),
          value: text.value
        })).filter((text) => !addedIds.has(text.id)).filter((text) => this.mirror.has(text.id)),
        attributes: this.attributes.map((attribute) => {
          const {
            attributes
          } = attribute;
          if (typeof attributes.style === "string") {
            const diffAsStr = JSON.stringify(attribute.styleDiff);
            const unchangedAsStr = JSON.stringify(attribute._unchangedStyles);
            if (diffAsStr.length < attributes.style.length) {
              if ((diffAsStr + unchangedAsStr).split("var(").length === attributes.style.split("var(").length) {
                attributes.style = attribute.styleDiff;
              }
            }
          }
          return {
            id: this.mirror.getId(attribute.node),
            attributes
          };
        }).filter((attribute) => !addedIds.has(attribute.id)).filter((attribute) => this.mirror.has(attribute.id)),
        removes: this.removes,
        adds
      };
      if (!payload.texts.length && !payload.attributes.length && !payload.removes.length && !payload.adds.length) {
        return;
      }
      this.texts = [];
      this.attributes = [];
      this.attributeMap = /* @__PURE__ */ new WeakMap();
      this.removes = [];
      this.addedSet = /* @__PURE__ */ new Set();
      this.movedSet = /* @__PURE__ */ new Set();
      this.droppedSet = /* @__PURE__ */ new Set();
      this.movedMap = {};
      this.mutationCb(payload);
    };
    this.processMutation = (m2) => {
      if (isIgnored(m2.target, this.mirror)) {
        return;
      }
      switch (m2.type) {
        case "characterData": {
          const value = m2.target.textContent;
          if (!isBlocked(m2.target, this.blockClass, this.blockSelector, this.unblockSelector, false) && value !== m2.oldValue) {
            this.texts.push({
              value: needMaskingText(m2.target, this.maskTextClass, this.maskTextSelector, this.unmaskTextClass, this.unmaskTextSelector, this.maskAllText) && value ? this.maskTextFn ? this.maskTextFn(value, closestElementOfNode(m2.target)) : value.replace(/[\S]/g, "*") : value,
              node: m2.target
            });
          }
          break;
        }
        case "attributes": {
          const target = m2.target;
          let attributeName = m2.attributeName;
          let value = m2.target.getAttribute(attributeName);
          if (attributeName === "value") {
            const type = getInputType(target);
            const tagName = target.tagName;
            value = getInputValue(target, tagName, type);
            const isInputMasked = shouldMaskInput({
              maskInputOptions: this.maskInputOptions,
              tagName,
              type
            });
            const forceMask = needMaskingText(m2.target, this.maskTextClass, this.maskTextSelector, this.unmaskTextClass, this.unmaskTextSelector, isInputMasked);
            value = maskInputValue({
              isMasked: forceMask,
              element: target,
              value,
              maskInputFn: this.maskInputFn
            });
          }
          if (isBlocked(m2.target, this.blockClass, this.blockSelector, this.unblockSelector, false) || value === m2.oldValue) {
            return;
          }
          let item = this.attributeMap.get(m2.target);
          if (target.tagName === "IFRAME" && attributeName === "src" && !this.keepIframeSrcFn(value)) {
            if (!target.contentDocument) {
              attributeName = "rr_src";
            } else {
              return;
            }
          }
          if (!item) {
            item = {
              node: m2.target,
              attributes: {},
              styleDiff: {},
              _unchangedStyles: {}
            };
            this.attributes.push(item);
            this.attributeMap.set(m2.target, item);
          }
          if (attributeName === "type" && target.tagName === "INPUT" && (m2.oldValue || "").toLowerCase() === "password") {
            target.setAttribute("data-rr-is-password", "true");
          }
          if (!ignoreAttribute(target.tagName, attributeName)) {
            item.attributes[attributeName] = transformAttribute(this.doc, toLowerCase(target.tagName), toLowerCase(attributeName), value, target, this.maskAttributeFn);
            if (attributeName === "style") {
              if (!this.unattachedDoc) {
                try {
                  this.unattachedDoc = document.implementation.createHTMLDocument();
                } catch (e3) {
                  this.unattachedDoc = this.doc;
                }
              }
              const old = this.unattachedDoc.createElement("span");
              if (m2.oldValue) {
                old.setAttribute("style", m2.oldValue);
              }
              for (const pname of Array.from(target.style)) {
                const newValue = target.style.getPropertyValue(pname);
                const newPriority = target.style.getPropertyPriority(pname);
                if (newValue !== old.style.getPropertyValue(pname) || newPriority !== old.style.getPropertyPriority(pname)) {
                  if (newPriority === "") {
                    item.styleDiff[pname] = newValue;
                  } else {
                    item.styleDiff[pname] = [newValue, newPriority];
                  }
                } else {
                  item._unchangedStyles[pname] = [newValue, newPriority];
                }
              }
              for (const pname of Array.from(old.style)) {
                if (target.style.getPropertyValue(pname) === "") {
                  item.styleDiff[pname] = false;
                }
              }
            }
          }
          break;
        }
        case "childList": {
          if (isBlocked(m2.target, this.blockClass, this.blockSelector, this.unblockSelector, true)) {
            return;
          }
          m2.addedNodes.forEach((n2) => this.genAdds(n2, m2.target));
          m2.removedNodes.forEach((n2) => {
            const nodeId = this.mirror.getId(n2);
            const parentId = isShadowRoot(m2.target) ? this.mirror.getId(m2.target.host) : this.mirror.getId(m2.target);
            if (isBlocked(m2.target, this.blockClass, this.blockSelector, this.unblockSelector, false) || isIgnored(n2, this.mirror) || !isSerialized(n2, this.mirror)) {
              return;
            }
            if (this.addedSet.has(n2)) {
              deepDelete(this.addedSet, n2);
              this.droppedSet.add(n2);
            } else if (this.addedSet.has(m2.target) && nodeId === -1) ;
            else if (isAncestorRemoved(m2.target, this.mirror)) ;
            else if (this.movedSet.has(n2) && this.movedMap[moveKey(nodeId, parentId)]) {
              deepDelete(this.movedSet, n2);
            } else {
              this.removes.push({
                parentId,
                id: nodeId,
                isShadow: isShadowRoot(m2.target) && isNativeShadowDom(m2.target) ? true : void 0
              });
            }
            this.mapRemoves.push(n2);
          });
          break;
        }
      }
    };
    this.genAdds = (n2, target) => {
      if (this.processedNodeManager.inOtherBuffer(n2, this)) return;
      if (this.addedSet.has(n2) || this.movedSet.has(n2)) return;
      if (this.mirror.hasNode(n2)) {
        if (isIgnored(n2, this.mirror)) {
          return;
        }
        this.movedSet.add(n2);
        let targetId = null;
        if (target && this.mirror.hasNode(target)) {
          targetId = this.mirror.getId(target);
        }
        if (targetId && targetId !== -1) {
          this.movedMap[moveKey(this.mirror.getId(n2), targetId)] = true;
        }
      } else {
        this.addedSet.add(n2);
        this.droppedSet.delete(n2);
      }
      if (!isBlocked(n2, this.blockClass, this.blockSelector, this.unblockSelector, false)) {
        n2.childNodes.forEach((childN) => this.genAdds(childN));
        if (hasShadowRoot(n2)) {
          n2.shadowRoot.childNodes.forEach((childN) => {
            this.processedNodeManager.add(childN, this);
            this.genAdds(childN, n2);
          });
        }
      }
    };
  }
  init(options) {
    ["mutationCb", "blockClass", "blockSelector", "unblockSelector", "maskAllText", "maskTextClass", "unmaskTextClass", "maskTextSelector", "unmaskTextSelector", "inlineStylesheet", "maskInputOptions", "maskAttributeFn", "maskTextFn", "maskInputFn", "keepIframeSrcFn", "recordCanvas", "inlineImages", "slimDOMOptions", "dataURLOptions", "doc", "mirror", "iframeManager", "stylesheetManager", "shadowDomManager", "canvasManager", "processedNodeManager"].forEach((key) => {
      this[key] = options[key];
    });
  }
  freeze() {
    this.frozen = true;
    this.canvasManager.freeze();
  }
  unfreeze() {
    this.frozen = false;
    this.canvasManager.unfreeze();
    this.emit();
  }
  isFrozen() {
    return this.frozen;
  }
  lock() {
    this.locked = true;
    this.canvasManager.lock();
  }
  unlock() {
    this.locked = false;
    this.canvasManager.unlock();
    this.emit();
  }
  reset() {
    this.shadowDomManager.reset();
    this.canvasManager.reset();
  }
};
function deepDelete(addsSet, n2) {
  addsSet.delete(n2);
  n2.childNodes.forEach((childN) => deepDelete(addsSet, childN));
}
function isParentRemoved(removes, n2, mirror2) {
  if (removes.length === 0) return false;
  return _isParentRemoved(removes, n2, mirror2);
}
function _isParentRemoved(removes, n2, mirror2) {
  let node2 = n2.parentNode;
  while (node2) {
    const parentId = mirror2.getId(node2);
    if (removes.some((r4) => r4.id === parentId)) {
      return true;
    }
    node2 = node2.parentNode;
  }
  return false;
}
function isAncestorInSet(set3, n2) {
  if (set3.size === 0) return false;
  return _isAncestorInSet(set3, n2);
}
function _isAncestorInSet(set3, n2) {
  const {
    parentNode
  } = n2;
  if (!parentNode) {
    return false;
  }
  if (set3.has(parentNode)) {
    return true;
  }
  return _isAncestorInSet(set3, parentNode);
}
var errorHandler;
function registerErrorHandler(handler) {
  errorHandler = handler;
}
function unregisterErrorHandler() {
  errorHandler = void 0;
}
var callbackWrapper = (cb) => {
  if (!errorHandler) {
    return cb;
  }
  const rrwebWrapped = (...rest) => {
    try {
      return cb(...rest);
    } catch (error) {
      if (errorHandler && errorHandler(error) === true) {
        return () => {
        };
      }
      throw error;
    }
  };
  return rrwebWrapped;
};
function _optionalChain$2(ops) {
  let lastAccessLHS = void 0;
  let value = ops[0];
  let i2 = 1;
  while (i2 < ops.length) {
    const op = ops[i2];
    const fn = ops[i2 + 1];
    i2 += 2;
    if ((op === "optionalAccess" || op === "optionalCall") && value == null) {
      return void 0;
    }
    if (op === "access" || op === "optionalAccess") {
      lastAccessLHS = value;
      value = fn(value);
    } else if (op === "call" || op === "optionalCall") {
      value = fn((...args) => value.call(lastAccessLHS, ...args));
      lastAccessLHS = void 0;
    }
  }
  return value;
}
var mutationBuffers = [];
function getEventTarget2(event) {
  try {
    if ("composedPath" in event) {
      const path = event.composedPath();
      if (path.length) {
        return path[0];
      }
    } else if ("path" in event && event.path.length) {
      return event.path[0];
    }
  } catch (e22) {
  }
  return event && event.target;
}
function initMutationObserver(options, rootEl) {
  const mutationBuffer = new MutationBuffer();
  mutationBuffers.push(mutationBuffer);
  mutationBuffer.init(options);
  let mutationObserverCtor = window.MutationObserver || window.__rrMutationObserver;
  const angularZoneSymbol = _optionalChain$2([window, "optionalAccess", (_2) => _2.Zone, "optionalAccess", (_2) => _2.__symbol__, "optionalCall", (_3) => _3("MutationObserver")]);
  if (angularZoneSymbol && window[angularZoneSymbol]) {
    mutationObserverCtor = window[angularZoneSymbol];
  }
  const observer = new mutationObserverCtor(callbackWrapper((mutations) => {
    if (options.onMutation && options.onMutation(mutations) === false) {
      return;
    }
    mutationBuffer.processMutations.bind(mutationBuffer)(mutations);
  }));
  observer.observe(rootEl, {
    attributes: true,
    attributeOldValue: true,
    characterData: true,
    characterDataOldValue: true,
    childList: true,
    subtree: true
  });
  return observer;
}
function initMoveObserver({
  mousemoveCb,
  sampling,
  doc,
  mirror: mirror2
}) {
  if (sampling.mousemove === false) {
    return () => {
    };
  }
  const threshold = typeof sampling.mousemove === "number" ? sampling.mousemove : 50;
  const callbackThreshold = typeof sampling.mousemoveCallback === "number" ? sampling.mousemoveCallback : 500;
  let positions = [];
  let timeBaseline;
  const wrappedCb = throttle$1(callbackWrapper((source) => {
    const totalOffset = Date.now() - timeBaseline;
    mousemoveCb(positions.map((p2) => {
      p2.timeOffset -= totalOffset;
      return p2;
    }), source);
    positions = [];
    timeBaseline = null;
  }), callbackThreshold);
  const updatePosition = callbackWrapper(throttle$1(callbackWrapper((evt) => {
    const target = getEventTarget2(evt);
    const {
      clientX,
      clientY
    } = legacy_isTouchEvent(evt) ? evt.changedTouches[0] : evt;
    if (!timeBaseline) {
      timeBaseline = nowTimestamp();
    }
    positions.push({
      x: clientX,
      y: clientY,
      id: mirror2.getId(target),
      timeOffset: nowTimestamp() - timeBaseline
    });
    wrappedCb(typeof DragEvent !== "undefined" && evt instanceof DragEvent ? IncrementalSource.Drag : evt instanceof MouseEvent ? IncrementalSource.MouseMove : IncrementalSource.TouchMove);
  }), threshold, {
    trailing: false
  }));
  const handlers4 = [on("mousemove", updatePosition, doc), on("touchmove", updatePosition, doc), on("drag", updatePosition, doc)];
  return callbackWrapper(() => {
    handlers4.forEach((h2) => h2());
  });
}
function initMouseInteractionObserver({
  mouseInteractionCb,
  doc,
  mirror: mirror2,
  blockClass,
  blockSelector,
  unblockSelector,
  sampling
}) {
  if (sampling.mouseInteraction === false) {
    return () => {
    };
  }
  const disableMap = sampling.mouseInteraction === true || sampling.mouseInteraction === void 0 ? {} : sampling.mouseInteraction;
  const handlers4 = [];
  let currentPointerType = null;
  const getHandler = (eventKey) => {
    return (event) => {
      const target = getEventTarget2(event);
      if (isBlocked(target, blockClass, blockSelector, unblockSelector, true)) {
        return;
      }
      let pointerType = null;
      let thisEventKey = eventKey;
      if ("pointerType" in event) {
        switch (event.pointerType) {
          case "mouse":
            pointerType = PointerTypes.Mouse;
            break;
          case "touch":
            pointerType = PointerTypes.Touch;
            break;
          case "pen":
            pointerType = PointerTypes.Pen;
            break;
        }
        if (pointerType === PointerTypes.Touch) {
          if (MouseInteractions[eventKey] === MouseInteractions.MouseDown) {
            thisEventKey = "TouchStart";
          } else if (MouseInteractions[eventKey] === MouseInteractions.MouseUp) {
            thisEventKey = "TouchEnd";
          }
        } else if (pointerType === PointerTypes.Pen) ;
      } else if (legacy_isTouchEvent(event)) {
        pointerType = PointerTypes.Touch;
      }
      if (pointerType !== null) {
        currentPointerType = pointerType;
        if (thisEventKey.startsWith("Touch") && pointerType === PointerTypes.Touch || thisEventKey.startsWith("Mouse") && pointerType === PointerTypes.Mouse) {
          pointerType = null;
        }
      } else if (MouseInteractions[eventKey] === MouseInteractions.Click) {
        pointerType = currentPointerType;
        currentPointerType = null;
      }
      const e3 = legacy_isTouchEvent(event) ? event.changedTouches[0] : event;
      if (!e3) {
        return;
      }
      const id = mirror2.getId(target);
      const {
        clientX,
        clientY
      } = e3;
      callbackWrapper(mouseInteractionCb)(__spreadValues({
        type: MouseInteractions[thisEventKey],
        id,
        x: clientX,
        y: clientY
      }, pointerType !== null && {
        pointerType
      }));
    };
  };
  Object.keys(MouseInteractions).filter((key) => Number.isNaN(Number(key)) && !key.endsWith("_Departed") && disableMap[key] !== false).forEach((eventKey) => {
    let eventName = toLowerCase(eventKey);
    const handler = getHandler(eventKey);
    if (window.PointerEvent) {
      switch (MouseInteractions[eventKey]) {
        case MouseInteractions.MouseDown:
        case MouseInteractions.MouseUp:
          eventName = eventName.replace("mouse", "pointer");
          break;
        case MouseInteractions.TouchStart:
        case MouseInteractions.TouchEnd:
          return;
      }
    }
    handlers4.push(on(eventName, handler, doc));
  });
  return callbackWrapper(() => {
    handlers4.forEach((h2) => h2());
  });
}
function initScrollObserver({
  scrollCb,
  doc,
  mirror: mirror2,
  blockClass,
  blockSelector,
  unblockSelector,
  sampling
}) {
  const updatePosition = callbackWrapper(throttle$1(callbackWrapper((evt) => {
    const target = getEventTarget2(evt);
    if (!target || isBlocked(target, blockClass, blockSelector, unblockSelector, true)) {
      return;
    }
    const id = mirror2.getId(target);
    if (target === doc && doc.defaultView) {
      const scrollLeftTop = getWindowScroll(doc.defaultView);
      scrollCb({
        id,
        x: scrollLeftTop.left,
        y: scrollLeftTop.top
      });
    } else {
      scrollCb({
        id,
        x: target.scrollLeft,
        y: target.scrollTop
      });
    }
  }), sampling.scroll || 100));
  return on("scroll", updatePosition, doc);
}
function initViewportResizeObserver({
  viewportResizeCb
}, {
  win
}) {
  let lastH = -1;
  let lastW = -1;
  const updateDimension = callbackWrapper(throttle$1(callbackWrapper(() => {
    const height = getWindowHeight();
    const width = getWindowWidth();
    if (lastH !== height || lastW !== width) {
      viewportResizeCb({
        width: Number(width),
        height: Number(height)
      });
      lastH = height;
      lastW = width;
    }
  }), 200));
  return on("resize", updateDimension, win);
}
var INPUT_TAGS = ["INPUT", "TEXTAREA", "SELECT"];
var lastInputValueMap = /* @__PURE__ */ new WeakMap();
function initInputObserver({
  inputCb,
  doc,
  mirror: mirror2,
  blockClass,
  blockSelector,
  unblockSelector,
  ignoreClass,
  ignoreSelector,
  maskInputOptions,
  maskInputFn,
  sampling,
  userTriggeredOnInput,
  maskTextClass,
  unmaskTextClass,
  maskTextSelector,
  unmaskTextSelector
}) {
  function eventHandler(event) {
    let target = getEventTarget2(event);
    const userTriggered = event.isTrusted;
    const tagName = target && toUpperCase(target.tagName);
    if (tagName === "OPTION") target = target.parentElement;
    if (!target || !tagName || INPUT_TAGS.indexOf(tagName) < 0 || isBlocked(target, blockClass, blockSelector, unblockSelector, true)) {
      return;
    }
    const el = target;
    if (el.classList.contains(ignoreClass) || ignoreSelector && el.matches(ignoreSelector)) {
      return;
    }
    const type = getInputType(target);
    let text = getInputValue(el, tagName, type);
    let isChecked = false;
    const isInputMasked = shouldMaskInput({
      maskInputOptions,
      tagName,
      type
    });
    const forceMask = needMaskingText(target, maskTextClass, maskTextSelector, unmaskTextClass, unmaskTextSelector, isInputMasked);
    if (type === "radio" || type === "checkbox") {
      isChecked = target.checked;
    }
    text = maskInputValue({
      isMasked: forceMask,
      element: target,
      value: text,
      maskInputFn
    });
    cbWithDedup(target, userTriggeredOnInput ? {
      text,
      isChecked,
      userTriggered
    } : {
      text,
      isChecked
    });
    const name = target.name;
    if (type === "radio" && name && isChecked) {
      doc.querySelectorAll(`input[type="radio"][name="${name}"]`).forEach((el2) => {
        if (el2 !== target) {
          const text2 = maskInputValue({
            isMasked: forceMask,
            element: el2,
            value: getInputValue(el2, tagName, type),
            maskInputFn
          });
          cbWithDedup(el2, userTriggeredOnInput ? {
            text: text2,
            isChecked: !isChecked,
            userTriggered: false
          } : {
            text: text2,
            isChecked: !isChecked
          });
        }
      });
    }
  }
  function cbWithDedup(target, v2) {
    const lastInputValue = lastInputValueMap.get(target);
    if (!lastInputValue || lastInputValue.text !== v2.text || lastInputValue.isChecked !== v2.isChecked) {
      lastInputValueMap.set(target, v2);
      const id = mirror2.getId(target);
      callbackWrapper(inputCb)(__spreadProps(__spreadValues({}, v2), {
        id
      }));
    }
  }
  const events = sampling.input === "last" ? ["change"] : ["input", "change"];
  const handlers4 = events.map((eventName) => on(eventName, callbackWrapper(eventHandler), doc));
  const currentWindow = doc.defaultView;
  if (!currentWindow) {
    return () => {
      handlers4.forEach((h2) => h2());
    };
  }
  const propertyDescriptor = currentWindow.Object.getOwnPropertyDescriptor(currentWindow.HTMLInputElement.prototype, "value");
  const hookProperties = [[currentWindow.HTMLInputElement.prototype, "value"], [currentWindow.HTMLInputElement.prototype, "checked"], [currentWindow.HTMLSelectElement.prototype, "value"], [currentWindow.HTMLTextAreaElement.prototype, "value"], [currentWindow.HTMLSelectElement.prototype, "selectedIndex"], [currentWindow.HTMLOptionElement.prototype, "selected"]];
  if (propertyDescriptor && propertyDescriptor.set) {
    handlers4.push(...hookProperties.map((p2) => hookSetter(p2[0], p2[1], {
      set() {
        callbackWrapper(eventHandler)({
          target: this,
          isTrusted: false
        });
      }
    }, false, currentWindow)));
  }
  return callbackWrapper(() => {
    handlers4.forEach((h2) => h2());
  });
}
function getNestedCSSRulePositions(rule) {
  const positions = [];
  function recurse(childRule, pos) {
    if (hasNestedCSSRule("CSSGroupingRule") && childRule.parentRule instanceof CSSGroupingRule || hasNestedCSSRule("CSSMediaRule") && childRule.parentRule instanceof CSSMediaRule || hasNestedCSSRule("CSSSupportsRule") && childRule.parentRule instanceof CSSSupportsRule || hasNestedCSSRule("CSSConditionRule") && childRule.parentRule instanceof CSSConditionRule) {
      const rules = Array.from(childRule.parentRule.cssRules);
      const index = rules.indexOf(childRule);
      pos.unshift(index);
    } else if (childRule.parentStyleSheet) {
      const rules = Array.from(childRule.parentStyleSheet.cssRules);
      const index = rules.indexOf(childRule);
      pos.unshift(index);
    }
    return pos;
  }
  return recurse(rule, positions);
}
function getIdAndStyleId(sheet, mirror2, styleMirror) {
  let id, styleId;
  if (!sheet) return {};
  if (sheet.ownerNode) id = mirror2.getId(sheet.ownerNode);
  else styleId = styleMirror.getId(sheet);
  return {
    styleId,
    id
  };
}
function initStyleSheetObserver({
  styleSheetRuleCb,
  mirror: mirror2,
  stylesheetManager
}, {
  win
}) {
  if (!win.CSSStyleSheet || !win.CSSStyleSheet.prototype) {
    return () => {
    };
  }
  const insertRule = win.CSSStyleSheet.prototype.insertRule;
  win.CSSStyleSheet.prototype.insertRule = new Proxy(insertRule, {
    apply: callbackWrapper((target, thisArg, argumentsList) => {
      const [rule, index] = argumentsList;
      const {
        id,
        styleId
      } = getIdAndStyleId(thisArg, mirror2, stylesheetManager.styleMirror);
      if (id && id !== -1 || styleId && styleId !== -1) {
        styleSheetRuleCb({
          id,
          styleId,
          adds: [{
            rule,
            index
          }]
        });
      }
      return target.apply(thisArg, argumentsList);
    })
  });
  const deleteRule = win.CSSStyleSheet.prototype.deleteRule;
  win.CSSStyleSheet.prototype.deleteRule = new Proxy(deleteRule, {
    apply: callbackWrapper((target, thisArg, argumentsList) => {
      const [index] = argumentsList;
      const {
        id,
        styleId
      } = getIdAndStyleId(thisArg, mirror2, stylesheetManager.styleMirror);
      if (id && id !== -1 || styleId && styleId !== -1) {
        styleSheetRuleCb({
          id,
          styleId,
          removes: [{
            index
          }]
        });
      }
      return target.apply(thisArg, argumentsList);
    })
  });
  let replace;
  if (win.CSSStyleSheet.prototype.replace) {
    replace = win.CSSStyleSheet.prototype.replace;
    win.CSSStyleSheet.prototype.replace = new Proxy(replace, {
      apply: callbackWrapper((target, thisArg, argumentsList) => {
        const [text] = argumentsList;
        const {
          id,
          styleId
        } = getIdAndStyleId(thisArg, mirror2, stylesheetManager.styleMirror);
        if (id && id !== -1 || styleId && styleId !== -1) {
          styleSheetRuleCb({
            id,
            styleId,
            replace: text
          });
        }
        return target.apply(thisArg, argumentsList);
      })
    });
  }
  let replaceSync;
  if (win.CSSStyleSheet.prototype.replaceSync) {
    replaceSync = win.CSSStyleSheet.prototype.replaceSync;
    win.CSSStyleSheet.prototype.replaceSync = new Proxy(replaceSync, {
      apply: callbackWrapper((target, thisArg, argumentsList) => {
        const [text] = argumentsList;
        const {
          id,
          styleId
        } = getIdAndStyleId(thisArg, mirror2, stylesheetManager.styleMirror);
        if (id && id !== -1 || styleId && styleId !== -1) {
          styleSheetRuleCb({
            id,
            styleId,
            replaceSync: text
          });
        }
        return target.apply(thisArg, argumentsList);
      })
    });
  }
  const supportedNestedCSSRuleTypes = {};
  if (canMonkeyPatchNestedCSSRule("CSSGroupingRule")) {
    supportedNestedCSSRuleTypes.CSSGroupingRule = win.CSSGroupingRule;
  } else {
    if (canMonkeyPatchNestedCSSRule("CSSMediaRule")) {
      supportedNestedCSSRuleTypes.CSSMediaRule = win.CSSMediaRule;
    }
    if (canMonkeyPatchNestedCSSRule("CSSConditionRule")) {
      supportedNestedCSSRuleTypes.CSSConditionRule = win.CSSConditionRule;
    }
    if (canMonkeyPatchNestedCSSRule("CSSSupportsRule")) {
      supportedNestedCSSRuleTypes.CSSSupportsRule = win.CSSSupportsRule;
    }
  }
  const unmodifiedFunctions = {};
  Object.entries(supportedNestedCSSRuleTypes).forEach(([typeKey, type]) => {
    unmodifiedFunctions[typeKey] = {
      insertRule: type.prototype.insertRule,
      deleteRule: type.prototype.deleteRule
    };
    type.prototype.insertRule = new Proxy(unmodifiedFunctions[typeKey].insertRule, {
      apply: callbackWrapper((target, thisArg, argumentsList) => {
        const [rule, index] = argumentsList;
        const {
          id,
          styleId
        } = getIdAndStyleId(thisArg.parentStyleSheet, mirror2, stylesheetManager.styleMirror);
        if (id && id !== -1 || styleId && styleId !== -1) {
          styleSheetRuleCb({
            id,
            styleId,
            adds: [{
              rule,
              index: [...getNestedCSSRulePositions(thisArg), index || 0]
            }]
          });
        }
        return target.apply(thisArg, argumentsList);
      })
    });
    type.prototype.deleteRule = new Proxy(unmodifiedFunctions[typeKey].deleteRule, {
      apply: callbackWrapper((target, thisArg, argumentsList) => {
        const [index] = argumentsList;
        const {
          id,
          styleId
        } = getIdAndStyleId(thisArg.parentStyleSheet, mirror2, stylesheetManager.styleMirror);
        if (id && id !== -1 || styleId && styleId !== -1) {
          styleSheetRuleCb({
            id,
            styleId,
            removes: [{
              index: [...getNestedCSSRulePositions(thisArg), index]
            }]
          });
        }
        return target.apply(thisArg, argumentsList);
      })
    });
  });
  return callbackWrapper(() => {
    win.CSSStyleSheet.prototype.insertRule = insertRule;
    win.CSSStyleSheet.prototype.deleteRule = deleteRule;
    replace && (win.CSSStyleSheet.prototype.replace = replace);
    replaceSync && (win.CSSStyleSheet.prototype.replaceSync = replaceSync);
    Object.entries(supportedNestedCSSRuleTypes).forEach(([typeKey, type]) => {
      type.prototype.insertRule = unmodifiedFunctions[typeKey].insertRule;
      type.prototype.deleteRule = unmodifiedFunctions[typeKey].deleteRule;
    });
  });
}
function initAdoptedStyleSheetObserver({
  mirror: mirror2,
  stylesheetManager
}, host) {
  let hostId = null;
  if (host.nodeName === "#document") hostId = mirror2.getId(host);
  else hostId = mirror2.getId(host.host);
  const patchTarget = host.nodeName === "#document" ? _optionalChain$2([host, "access", (_4) => _4.defaultView, "optionalAccess", (_5) => _5.Document]) : _optionalChain$2([host, "access", (_6) => _6.ownerDocument, "optionalAccess", (_7) => _7.defaultView, "optionalAccess", (_8) => _8.ShadowRoot]);
  const originalPropertyDescriptor = _optionalChain$2([patchTarget, "optionalAccess", (_9) => _9.prototype]) ? Object.getOwnPropertyDescriptor(_optionalChain$2([patchTarget, "optionalAccess", (_10) => _10.prototype]), "adoptedStyleSheets") : void 0;
  if (hostId === null || hostId === -1 || !patchTarget || !originalPropertyDescriptor) return () => {
  };
  Object.defineProperty(host, "adoptedStyleSheets", {
    configurable: originalPropertyDescriptor.configurable,
    enumerable: originalPropertyDescriptor.enumerable,
    get() {
      return _optionalChain$2([originalPropertyDescriptor, "access", (_11) => _11.get, "optionalAccess", (_12) => _12.call, "call", (_13) => _13(this)]);
    },
    set(sheets) {
      const result = _optionalChain$2([originalPropertyDescriptor, "access", (_14) => _14.set, "optionalAccess", (_15) => _15.call, "call", (_16) => _16(this, sheets)]);
      if (hostId !== null && hostId !== -1) {
        try {
          stylesheetManager.adoptStyleSheets(sheets, hostId);
        } catch (e3) {
        }
      }
      return result;
    }
  });
  return callbackWrapper(() => {
    Object.defineProperty(host, "adoptedStyleSheets", {
      configurable: originalPropertyDescriptor.configurable,
      enumerable: originalPropertyDescriptor.enumerable,
      get: originalPropertyDescriptor.get,
      set: originalPropertyDescriptor.set
    });
  });
}
function initStyleDeclarationObserver({
  styleDeclarationCb,
  mirror: mirror2,
  ignoreCSSAttributes,
  stylesheetManager
}, {
  win
}) {
  const setProperty = win.CSSStyleDeclaration.prototype.setProperty;
  win.CSSStyleDeclaration.prototype.setProperty = new Proxy(setProperty, {
    apply: callbackWrapper((target, thisArg, argumentsList) => {
      const [property, value, priority] = argumentsList;
      if (ignoreCSSAttributes.has(property)) {
        return setProperty.apply(thisArg, [property, value, priority]);
      }
      const {
        id,
        styleId
      } = getIdAndStyleId(_optionalChain$2([thisArg, "access", (_17) => _17.parentRule, "optionalAccess", (_18) => _18.parentStyleSheet]), mirror2, stylesheetManager.styleMirror);
      if (id && id !== -1 || styleId && styleId !== -1) {
        styleDeclarationCb({
          id,
          styleId,
          set: {
            property,
            value,
            priority
          },
          index: getNestedCSSRulePositions(thisArg.parentRule)
        });
      }
      return target.apply(thisArg, argumentsList);
    })
  });
  const removeProperty = win.CSSStyleDeclaration.prototype.removeProperty;
  win.CSSStyleDeclaration.prototype.removeProperty = new Proxy(removeProperty, {
    apply: callbackWrapper((target, thisArg, argumentsList) => {
      const [property] = argumentsList;
      if (ignoreCSSAttributes.has(property)) {
        return removeProperty.apply(thisArg, [property]);
      }
      const {
        id,
        styleId
      } = getIdAndStyleId(_optionalChain$2([thisArg, "access", (_19) => _19.parentRule, "optionalAccess", (_20) => _20.parentStyleSheet]), mirror2, stylesheetManager.styleMirror);
      if (id && id !== -1 || styleId && styleId !== -1) {
        styleDeclarationCb({
          id,
          styleId,
          remove: {
            property
          },
          index: getNestedCSSRulePositions(thisArg.parentRule)
        });
      }
      return target.apply(thisArg, argumentsList);
    })
  });
  return callbackWrapper(() => {
    win.CSSStyleDeclaration.prototype.setProperty = setProperty;
    win.CSSStyleDeclaration.prototype.removeProperty = removeProperty;
  });
}
function initMediaInteractionObserver({
  mediaInteractionCb,
  blockClass,
  blockSelector,
  unblockSelector,
  mirror: mirror2,
  sampling,
  doc
}) {
  const handler = callbackWrapper((type) => throttle$1(callbackWrapper((event) => {
    const target = getEventTarget2(event);
    if (!target || isBlocked(target, blockClass, blockSelector, unblockSelector, true)) {
      return;
    }
    const {
      currentTime,
      volume,
      muted,
      playbackRate
    } = target;
    mediaInteractionCb({
      type,
      id: mirror2.getId(target),
      currentTime,
      volume,
      muted,
      playbackRate
    });
  }), sampling.media || 500));
  const handlers4 = [on("play", handler(0), doc), on("pause", handler(1), doc), on("seeked", handler(2), doc), on("volumechange", handler(3), doc), on("ratechange", handler(4), doc)];
  return callbackWrapper(() => {
    handlers4.forEach((h2) => h2());
  });
}
function initFontObserver({
  fontCb,
  doc
}) {
  const win = doc.defaultView;
  if (!win) {
    return () => {
    };
  }
  const handlers4 = [];
  const fontMap = /* @__PURE__ */ new WeakMap();
  const originalFontFace = win.FontFace;
  win.FontFace = function FontFace(family, source, descriptors) {
    const fontFace = new originalFontFace(family, source, descriptors);
    fontMap.set(fontFace, {
      family,
      buffer: typeof source !== "string",
      descriptors,
      fontSource: typeof source === "string" ? source : JSON.stringify(Array.from(new Uint8Array(source)))
    });
    return fontFace;
  };
  const restoreHandler = patch(doc.fonts, "add", function(original) {
    return function(fontFace) {
      setTimeout$1(callbackWrapper(() => {
        const p2 = fontMap.get(fontFace);
        if (p2) {
          fontCb(p2);
          fontMap.delete(fontFace);
        }
      }), 0);
      return original.apply(this, [fontFace]);
    };
  });
  handlers4.push(() => {
    win.FontFace = originalFontFace;
  });
  handlers4.push(restoreHandler);
  return callbackWrapper(() => {
    handlers4.forEach((h2) => h2());
  });
}
function initSelectionObserver(param) {
  const {
    doc,
    mirror: mirror2,
    blockClass,
    blockSelector,
    unblockSelector,
    selectionCb
  } = param;
  let collapsed = true;
  const updateSelection = callbackWrapper(() => {
    const selection = doc.getSelection();
    if (!selection || collapsed && _optionalChain$2([selection, "optionalAccess", (_21) => _21.isCollapsed])) return;
    collapsed = selection.isCollapsed || false;
    const ranges = [];
    const count = selection.rangeCount || 0;
    for (let i2 = 0; i2 < count; i2++) {
      const range = selection.getRangeAt(i2);
      const {
        startContainer,
        startOffset,
        endContainer,
        endOffset
      } = range;
      const blocked = isBlocked(startContainer, blockClass, blockSelector, unblockSelector, true) || isBlocked(endContainer, blockClass, blockSelector, unblockSelector, true);
      if (blocked) continue;
      ranges.push({
        start: mirror2.getId(startContainer),
        startOffset,
        end: mirror2.getId(endContainer),
        endOffset
      });
    }
    selectionCb({
      ranges
    });
  });
  updateSelection();
  return on("selectionchange", updateSelection);
}
function initCustomElementObserver({
  doc,
  customElementCb
}) {
  const win = doc.defaultView;
  if (!win || !win.customElements) return () => {
  };
  const restoreHandler = patch(win.customElements, "define", function(original) {
    return function(name, constructor, options) {
      try {
        customElementCb({
          define: {
            name
          }
        });
      } catch (e3) {
      }
      return original.apply(this, [name, constructor, options]);
    };
  });
  return restoreHandler;
}
function initObservers(o2, _hooks = {}) {
  const currentWindow = o2.doc.defaultView;
  if (!currentWindow) {
    return () => {
    };
  }
  let mutationObserver;
  if (o2.recordDOM) {
    mutationObserver = initMutationObserver(o2, o2.doc);
  }
  const mousemoveHandler = initMoveObserver(o2);
  const mouseInteractionHandler = initMouseInteractionObserver(o2);
  const scrollHandler = initScrollObserver(o2);
  const viewportResizeHandler = initViewportResizeObserver(o2, {
    win: currentWindow
  });
  const inputHandler = initInputObserver(o2);
  const mediaInteractionHandler = initMediaInteractionObserver(o2);
  let styleSheetObserver = () => {
  };
  let adoptedStyleSheetObserver = () => {
  };
  let styleDeclarationObserver = () => {
  };
  let fontObserver = () => {
  };
  if (o2.recordDOM) {
    styleSheetObserver = initStyleSheetObserver(o2, {
      win: currentWindow
    });
    adoptedStyleSheetObserver = initAdoptedStyleSheetObserver(o2, o2.doc);
    styleDeclarationObserver = initStyleDeclarationObserver(o2, {
      win: currentWindow
    });
    if (o2.collectFonts) {
      fontObserver = initFontObserver(o2);
    }
  }
  const selectionObserver = initSelectionObserver(o2);
  const customElementObserver = initCustomElementObserver(o2);
  const pluginHandlers = [];
  for (const plugin of o2.plugins) {
    pluginHandlers.push(plugin.observer(plugin.callback, currentWindow, plugin.options));
  }
  return callbackWrapper(() => {
    mutationBuffers.forEach((b2) => b2.reset());
    _optionalChain$2([mutationObserver, "optionalAccess", (_22) => _22.disconnect, "call", (_23) => _23()]);
    mousemoveHandler();
    mouseInteractionHandler();
    scrollHandler();
    viewportResizeHandler();
    inputHandler();
    mediaInteractionHandler();
    styleSheetObserver();
    adoptedStyleSheetObserver();
    styleDeclarationObserver();
    fontObserver();
    selectionObserver();
    customElementObserver();
    pluginHandlers.forEach((h2) => h2());
  });
}
function hasNestedCSSRule(prop) {
  return typeof window[prop] !== "undefined";
}
function canMonkeyPatchNestedCSSRule(prop) {
  return Boolean(typeof window[prop] !== "undefined" && window[prop].prototype && "insertRule" in window[prop].prototype && "deleteRule" in window[prop].prototype);
}
var CrossOriginIframeMirror = class {
  constructor(generateIdFn) {
    this.generateIdFn = generateIdFn;
    this.iframeIdToRemoteIdMap = /* @__PURE__ */ new WeakMap();
    this.iframeRemoteIdToIdMap = /* @__PURE__ */ new WeakMap();
  }
  getId(iframe, remoteId, idToRemoteMap, remoteToIdMap) {
    const idToRemoteIdMap = idToRemoteMap || this.getIdToRemoteIdMap(iframe);
    const remoteIdToIdMap = remoteToIdMap || this.getRemoteIdToIdMap(iframe);
    let id = idToRemoteIdMap.get(remoteId);
    if (!id) {
      id = this.generateIdFn();
      idToRemoteIdMap.set(remoteId, id);
      remoteIdToIdMap.set(id, remoteId);
    }
    return id;
  }
  getIds(iframe, remoteId) {
    const idToRemoteIdMap = this.getIdToRemoteIdMap(iframe);
    const remoteIdToIdMap = this.getRemoteIdToIdMap(iframe);
    return remoteId.map((id) => this.getId(iframe, id, idToRemoteIdMap, remoteIdToIdMap));
  }
  getRemoteId(iframe, id, map) {
    const remoteIdToIdMap = map || this.getRemoteIdToIdMap(iframe);
    if (typeof id !== "number") return id;
    const remoteId = remoteIdToIdMap.get(id);
    if (!remoteId) return -1;
    return remoteId;
  }
  getRemoteIds(iframe, ids) {
    const remoteIdToIdMap = this.getRemoteIdToIdMap(iframe);
    return ids.map((id) => this.getRemoteId(iframe, id, remoteIdToIdMap));
  }
  reset(iframe) {
    if (!iframe) {
      this.iframeIdToRemoteIdMap = /* @__PURE__ */ new WeakMap();
      this.iframeRemoteIdToIdMap = /* @__PURE__ */ new WeakMap();
      return;
    }
    this.iframeIdToRemoteIdMap.delete(iframe);
    this.iframeRemoteIdToIdMap.delete(iframe);
  }
  getIdToRemoteIdMap(iframe) {
    let idToRemoteIdMap = this.iframeIdToRemoteIdMap.get(iframe);
    if (!idToRemoteIdMap) {
      idToRemoteIdMap = /* @__PURE__ */ new Map();
      this.iframeIdToRemoteIdMap.set(iframe, idToRemoteIdMap);
    }
    return idToRemoteIdMap;
  }
  getRemoteIdToIdMap(iframe) {
    let remoteIdToIdMap = this.iframeRemoteIdToIdMap.get(iframe);
    if (!remoteIdToIdMap) {
      remoteIdToIdMap = /* @__PURE__ */ new Map();
      this.iframeRemoteIdToIdMap.set(iframe, remoteIdToIdMap);
    }
    return remoteIdToIdMap;
  }
};
function _optionalChain$1(ops) {
  let lastAccessLHS = void 0;
  let value = ops[0];
  let i2 = 1;
  while (i2 < ops.length) {
    const op = ops[i2];
    const fn = ops[i2 + 1];
    i2 += 2;
    if ((op === "optionalAccess" || op === "optionalCall") && value == null) {
      return void 0;
    }
    if (op === "access" || op === "optionalAccess") {
      lastAccessLHS = value;
      value = fn(value);
    } else if (op === "call" || op === "optionalCall") {
      value = fn((...args) => value.call(lastAccessLHS, ...args));
      lastAccessLHS = void 0;
    }
  }
  return value;
}
var IframeManagerNoop = class {
  constructor() {
    this.crossOriginIframeMirror = new CrossOriginIframeMirror(genId);
    this.crossOriginIframeRootIdMap = /* @__PURE__ */ new WeakMap();
  }
  addIframe() {
  }
  addLoadListener() {
  }
  attachIframe() {
  }
};
var IframeManager = class {
  constructor(options) {
    this.iframes = /* @__PURE__ */ new WeakMap();
    this.crossOriginIframeMap = /* @__PURE__ */ new WeakMap();
    this.crossOriginIframeMirror = new CrossOriginIframeMirror(genId);
    this.crossOriginIframeRootIdMap = /* @__PURE__ */ new WeakMap();
    this.mutationCb = options.mutationCb;
    this.wrappedEmit = options.wrappedEmit;
    this.stylesheetManager = options.stylesheetManager;
    this.recordCrossOriginIframes = options.recordCrossOriginIframes;
    this.crossOriginIframeStyleMirror = new CrossOriginIframeMirror(this.stylesheetManager.styleMirror.generateId.bind(this.stylesheetManager.styleMirror));
    this.mirror = options.mirror;
    if (this.recordCrossOriginIframes) {
      window.addEventListener("message", this.handleMessage.bind(this));
    }
  }
  addIframe(iframeEl) {
    this.iframes.set(iframeEl, true);
    if (iframeEl.contentWindow) this.crossOriginIframeMap.set(iframeEl.contentWindow, iframeEl);
  }
  addLoadListener(cb) {
    this.loadListener = cb;
  }
  attachIframe(iframeEl, childSn) {
    this.mutationCb({
      adds: [{
        parentId: this.mirror.getId(iframeEl),
        nextId: null,
        node: childSn
      }],
      removes: [],
      texts: [],
      attributes: [],
      isAttachIframe: true
    });
    _optionalChain$1([this, "access", (_2) => _2.loadListener, "optionalCall", (_2) => _2(iframeEl)]);
    if (iframeEl.contentDocument && iframeEl.contentDocument.adoptedStyleSheets && iframeEl.contentDocument.adoptedStyleSheets.length > 0) this.stylesheetManager.adoptStyleSheets(iframeEl.contentDocument.adoptedStyleSheets, this.mirror.getId(iframeEl.contentDocument));
  }
  handleMessage(message) {
    const crossOriginMessageEvent = message;
    if (crossOriginMessageEvent.data.type !== "rrweb" || crossOriginMessageEvent.origin !== crossOriginMessageEvent.data.origin) return;
    const iframeSourceWindow = message.source;
    if (!iframeSourceWindow) return;
    const iframeEl = this.crossOriginIframeMap.get(message.source);
    if (!iframeEl) return;
    const transformedEvent = this.transformCrossOriginEvent(iframeEl, crossOriginMessageEvent.data.event);
    if (transformedEvent) this.wrappedEmit(transformedEvent, crossOriginMessageEvent.data.isCheckout);
  }
  transformCrossOriginEvent(iframeEl, e3) {
    switch (e3.type) {
      case EventType.FullSnapshot: {
        this.crossOriginIframeMirror.reset(iframeEl);
        this.crossOriginIframeStyleMirror.reset(iframeEl);
        this.replaceIdOnNode(e3.data.node, iframeEl);
        const rootId = e3.data.node.id;
        this.crossOriginIframeRootIdMap.set(iframeEl, rootId);
        this.patchRootIdOnNode(e3.data.node, rootId);
        return {
          timestamp: e3.timestamp,
          type: EventType.IncrementalSnapshot,
          data: {
            source: IncrementalSource.Mutation,
            adds: [{
              parentId: this.mirror.getId(iframeEl),
              nextId: null,
              node: e3.data.node
            }],
            removes: [],
            texts: [],
            attributes: [],
            isAttachIframe: true
          }
        };
      }
      case EventType.Meta:
      case EventType.Load:
      case EventType.DomContentLoaded: {
        return false;
      }
      case EventType.Plugin: {
        return e3;
      }
      case EventType.Custom: {
        this.replaceIds(e3.data.payload, iframeEl, ["id", "parentId", "previousId", "nextId"]);
        return e3;
      }
      case EventType.IncrementalSnapshot: {
        switch (e3.data.source) {
          case IncrementalSource.Mutation: {
            e3.data.adds.forEach((n2) => {
              this.replaceIds(n2, iframeEl, ["parentId", "nextId", "previousId"]);
              this.replaceIdOnNode(n2.node, iframeEl);
              const rootId = this.crossOriginIframeRootIdMap.get(iframeEl);
              rootId && this.patchRootIdOnNode(n2.node, rootId);
            });
            e3.data.removes.forEach((n2) => {
              this.replaceIds(n2, iframeEl, ["parentId", "id"]);
            });
            e3.data.attributes.forEach((n2) => {
              this.replaceIds(n2, iframeEl, ["id"]);
            });
            e3.data.texts.forEach((n2) => {
              this.replaceIds(n2, iframeEl, ["id"]);
            });
            return e3;
          }
          case IncrementalSource.Drag:
          case IncrementalSource.TouchMove:
          case IncrementalSource.MouseMove: {
            e3.data.positions.forEach((p2) => {
              this.replaceIds(p2, iframeEl, ["id"]);
            });
            return e3;
          }
          case IncrementalSource.ViewportResize: {
            return false;
          }
          case IncrementalSource.MediaInteraction:
          case IncrementalSource.MouseInteraction:
          case IncrementalSource.Scroll:
          case IncrementalSource.CanvasMutation:
          case IncrementalSource.Input: {
            this.replaceIds(e3.data, iframeEl, ["id"]);
            return e3;
          }
          case IncrementalSource.StyleSheetRule:
          case IncrementalSource.StyleDeclaration: {
            this.replaceIds(e3.data, iframeEl, ["id"]);
            this.replaceStyleIds(e3.data, iframeEl, ["styleId"]);
            return e3;
          }
          case IncrementalSource.Font: {
            return e3;
          }
          case IncrementalSource.Selection: {
            e3.data.ranges.forEach((range) => {
              this.replaceIds(range, iframeEl, ["start", "end"]);
            });
            return e3;
          }
          case IncrementalSource.AdoptedStyleSheet: {
            this.replaceIds(e3.data, iframeEl, ["id"]);
            this.replaceStyleIds(e3.data, iframeEl, ["styleIds"]);
            _optionalChain$1([e3, "access", (_3) => _3.data, "access", (_4) => _4.styles, "optionalAccess", (_5) => _5.forEach, "call", (_6) => _6((style) => {
              this.replaceStyleIds(style, iframeEl, ["styleId"]);
            })]);
            return e3;
          }
        }
      }
    }
    return false;
  }
  replace(iframeMirror, obj, iframeEl, keys2) {
    for (const key of keys2) {
      if (!Array.isArray(obj[key]) && typeof obj[key] !== "number") continue;
      if (Array.isArray(obj[key])) {
        obj[key] = iframeMirror.getIds(iframeEl, obj[key]);
      } else {
        obj[key] = iframeMirror.getId(iframeEl, obj[key]);
      }
    }
    return obj;
  }
  replaceIds(obj, iframeEl, keys2) {
    return this.replace(this.crossOriginIframeMirror, obj, iframeEl, keys2);
  }
  replaceStyleIds(obj, iframeEl, keys2) {
    return this.replace(this.crossOriginIframeStyleMirror, obj, iframeEl, keys2);
  }
  replaceIdOnNode(node2, iframeEl) {
    this.replaceIds(node2, iframeEl, ["id", "rootId"]);
    if ("childNodes" in node2) {
      node2.childNodes.forEach((child) => {
        this.replaceIdOnNode(child, iframeEl);
      });
    }
  }
  patchRootIdOnNode(node2, rootId) {
    if (node2.type !== NodeType$1.Document && !node2.rootId) node2.rootId = rootId;
    if ("childNodes" in node2) {
      node2.childNodes.forEach((child) => {
        this.patchRootIdOnNode(child, rootId);
      });
    }
  }
};
var ShadowDomManagerNoop = class {
  init() {
  }
  addShadowRoot() {
  }
  observeAttachShadow() {
  }
  reset() {
  }
};
var ShadowDomManager = class {
  constructor(options) {
    this.shadowDoms = /* @__PURE__ */ new WeakSet();
    this.restoreHandlers = [];
    this.mutationCb = options.mutationCb;
    this.scrollCb = options.scrollCb;
    this.bypassOptions = options.bypassOptions;
    this.mirror = options.mirror;
    this.init();
  }
  init() {
    this.reset();
    this.patchAttachShadow(Element, document);
  }
  addShadowRoot(shadowRoot, doc) {
    if (!isNativeShadowDom(shadowRoot)) return;
    if (this.shadowDoms.has(shadowRoot)) return;
    this.shadowDoms.add(shadowRoot);
    this.bypassOptions.canvasManager.addShadowRoot(shadowRoot);
    const observer = initMutationObserver(__spreadProps(__spreadValues({}, this.bypassOptions), {
      doc,
      mutationCb: this.mutationCb,
      mirror: this.mirror,
      shadowDomManager: this
    }), shadowRoot);
    this.restoreHandlers.push(() => observer.disconnect());
    this.restoreHandlers.push(initScrollObserver(__spreadProps(__spreadValues({}, this.bypassOptions), {
      scrollCb: this.scrollCb,
      doc: shadowRoot,
      mirror: this.mirror
    })));
    setTimeout$1(() => {
      if (shadowRoot.adoptedStyleSheets && shadowRoot.adoptedStyleSheets.length > 0) this.bypassOptions.stylesheetManager.adoptStyleSheets(shadowRoot.adoptedStyleSheets, this.mirror.getId(shadowRoot.host));
      this.restoreHandlers.push(initAdoptedStyleSheetObserver({
        mirror: this.mirror,
        stylesheetManager: this.bypassOptions.stylesheetManager
      }, shadowRoot));
    }, 0);
  }
  observeAttachShadow(iframeElement) {
    if (!iframeElement.contentWindow || !iframeElement.contentDocument) return;
    this.patchAttachShadow(iframeElement.contentWindow.Element, iframeElement.contentDocument);
  }
  patchAttachShadow(element, doc) {
    const manager = this;
    this.restoreHandlers.push(patch(element.prototype, "attachShadow", function(original) {
      return function(option) {
        const shadowRoot = original.call(this, option);
        if (this.shadowRoot && inDom(this)) manager.addShadowRoot(this.shadowRoot, doc);
        return shadowRoot;
      };
    }));
  }
  reset() {
    this.restoreHandlers.forEach((handler) => {
      try {
        handler();
      } catch (e3) {
      }
    });
    this.restoreHandlers = [];
    this.shadowDoms = /* @__PURE__ */ new WeakSet();
    this.bypassOptions.canvasManager.resetShadowRoots();
  }
};
var CanvasManagerNoop = class {
  reset() {
  }
  freeze() {
  }
  unfreeze() {
  }
  lock() {
  }
  unlock() {
  }
  snapshot() {
  }
  addWindow() {
  }
  addShadowRoot() {
  }
  resetShadowRoots() {
  }
};
var StylesheetManager = class {
  constructor(options) {
    this.trackedLinkElements = /* @__PURE__ */ new WeakSet();
    this.styleMirror = new StyleSheetMirror();
    this.mutationCb = options.mutationCb;
    this.adoptedStyleSheetCb = options.adoptedStyleSheetCb;
  }
  attachLinkElement(linkEl, childSn) {
    if ("_cssText" in childSn.attributes) this.mutationCb({
      adds: [],
      removes: [],
      texts: [],
      attributes: [{
        id: childSn.id,
        attributes: childSn.attributes
      }]
    });
    this.trackLinkElement(linkEl);
  }
  trackLinkElement(linkEl) {
    if (this.trackedLinkElements.has(linkEl)) return;
    this.trackedLinkElements.add(linkEl);
    this.trackStylesheetInLinkElement(linkEl);
  }
  adoptStyleSheets(sheets, hostId) {
    if (sheets.length === 0) return;
    const adoptedStyleSheetData = {
      id: hostId,
      styleIds: []
    };
    const styles = [];
    for (const sheet of sheets) {
      let styleId;
      if (!this.styleMirror.has(sheet)) {
        styleId = this.styleMirror.add(sheet);
        styles.push({
          styleId,
          rules: Array.from(sheet.rules || CSSRule, (r4, index) => ({
            rule: stringifyRule(r4),
            index
          }))
        });
      } else styleId = this.styleMirror.getId(sheet);
      adoptedStyleSheetData.styleIds.push(styleId);
    }
    if (styles.length > 0) adoptedStyleSheetData.styles = styles;
    this.adoptedStyleSheetCb(adoptedStyleSheetData);
  }
  reset() {
    this.styleMirror.reset();
    this.trackedLinkElements = /* @__PURE__ */ new WeakSet();
  }
  trackStylesheetInLinkElement(linkEl) {
  }
};
var ProcessedNodeManager = class {
  constructor() {
    this.nodeMap = /* @__PURE__ */ new WeakMap();
    this.active = false;
  }
  inOtherBuffer(node2, thisBuffer) {
    const buffers = this.nodeMap.get(node2);
    return buffers && Array.from(buffers).some((buffer) => buffer !== thisBuffer);
  }
  add(node2, buffer) {
    if (!this.active) {
      this.active = true;
      onRequestAnimationFrame(() => {
        this.nodeMap = /* @__PURE__ */ new WeakMap();
        this.active = false;
      });
    }
    this.nodeMap.set(node2, (this.nodeMap.get(node2) || /* @__PURE__ */ new Set()).add(buffer));
  }
  destroy() {
  }
};
var wrappedEmit;
var _takeFullSnapshot;
try {
  if (Array.from([1], (x2) => x2 * 2)[0] !== 2) {
    const cleanFrame = document.createElement("iframe");
    document.body.appendChild(cleanFrame);
    Array.from = _optionalChain([cleanFrame, "access", (_2) => _2.contentWindow, "optionalAccess", (_2) => _2.Array, "access", (_3) => _3.from]) || Array.from;
    document.body.removeChild(cleanFrame);
  }
} catch (err) {
  console.debug("Unable to override Array.from", err);
}
var mirror = createMirror();
function record(options = {}) {
  const {
    emit,
    checkoutEveryNms,
    checkoutEveryNth,
    blockClass = "rr-block",
    blockSelector = null,
    unblockSelector = null,
    ignoreClass = "rr-ignore",
    ignoreSelector = null,
    maskAllText = false,
    maskTextClass = "rr-mask",
    unmaskTextClass = null,
    maskTextSelector = null,
    unmaskTextSelector = null,
    inlineStylesheet = true,
    maskAllInputs,
    maskInputOptions: _maskInputOptions,
    slimDOMOptions: _slimDOMOptions,
    maskAttributeFn,
    maskInputFn,
    maskTextFn,
    maxCanvasSize = null,
    packFn,
    sampling = {},
    dataURLOptions = {},
    mousemoveWait,
    recordDOM = true,
    recordCanvas = false,
    recordCrossOriginIframes = false,
    recordAfter = options.recordAfter === "DOMContentLoaded" ? options.recordAfter : "load",
    userTriggeredOnInput = false,
    collectFonts = false,
    inlineImages = false,
    plugins,
    keepIframeSrcFn = () => false,
    ignoreCSSAttributes = /* @__PURE__ */ new Set([]),
    errorHandler: errorHandler3,
    onMutation,
    getCanvasManager
  } = options;
  registerErrorHandler(errorHandler3);
  const inEmittingFrame = recordCrossOriginIframes ? window.parent === window : true;
  let passEmitsToParent = false;
  if (!inEmittingFrame) {
    try {
      if (window.parent.document) {
        passEmitsToParent = false;
      }
    } catch (e3) {
      passEmitsToParent = true;
    }
  }
  if (inEmittingFrame && !emit) {
    throw new Error("emit function is required");
  }
  if (!inEmittingFrame && !passEmitsToParent) {
    return () => {
    };
  }
  if (mousemoveWait !== void 0 && sampling.mousemove === void 0) {
    sampling.mousemove = mousemoveWait;
  }
  mirror.reset();
  const maskInputOptions = maskAllInputs === true ? {
    color: true,
    date: true,
    "datetime-local": true,
    email: true,
    month: true,
    number: true,
    range: true,
    search: true,
    tel: true,
    text: true,
    time: true,
    url: true,
    week: true,
    textarea: true,
    select: true,
    radio: true,
    checkbox: true
  } : _maskInputOptions !== void 0 ? _maskInputOptions : {};
  const slimDOMOptions = _slimDOMOptions === true || _slimDOMOptions === "all" ? {
    script: true,
    comment: true,
    headFavicon: true,
    headWhitespace: true,
    headMetaSocial: true,
    headMetaRobots: true,
    headMetaHttpEquiv: true,
    headMetaVerification: true,
    headMetaAuthorship: _slimDOMOptions === "all",
    headMetaDescKeywords: _slimDOMOptions === "all"
  } : _slimDOMOptions ? _slimDOMOptions : {};
  polyfill();
  let lastFullSnapshotEvent;
  let incrementalSnapshotCount = 0;
  const eventProcessor = (e3) => {
    for (const plugin of plugins || []) {
      if (plugin.eventProcessor) {
        e3 = plugin.eventProcessor(e3);
      }
    }
    if (packFn && !passEmitsToParent) {
      e3 = packFn(e3);
    }
    return e3;
  };
  wrappedEmit = (r4, isCheckout) => {
    const e3 = r4;
    e3.timestamp = nowTimestamp();
    if (_optionalChain([mutationBuffers, "access", (_4) => _4[0], "optionalAccess", (_5) => _5.isFrozen, "call", (_6) => _6()]) && e3.type !== EventType.FullSnapshot && !(e3.type === EventType.IncrementalSnapshot && e3.data.source === IncrementalSource.Mutation)) {
      mutationBuffers.forEach((buf) => buf.unfreeze());
    }
    if (inEmittingFrame) {
      _optionalChain([emit, "optionalCall", (_7) => _7(eventProcessor(e3), isCheckout)]);
    } else if (passEmitsToParent) {
      const message = {
        type: "rrweb",
        event: eventProcessor(e3),
        origin: window.location.origin,
        isCheckout
      };
      window.parent.postMessage(message, "*");
    }
    if (e3.type === EventType.FullSnapshot) {
      lastFullSnapshotEvent = e3;
      incrementalSnapshotCount = 0;
    } else if (e3.type === EventType.IncrementalSnapshot) {
      if (e3.data.source === IncrementalSource.Mutation && e3.data.isAttachIframe) {
        return;
      }
      incrementalSnapshotCount++;
      const exceedCount = checkoutEveryNth && incrementalSnapshotCount >= checkoutEveryNth;
      const exceedTime = checkoutEveryNms && lastFullSnapshotEvent && e3.timestamp - lastFullSnapshotEvent.timestamp > checkoutEveryNms;
      if (exceedCount || exceedTime) {
        takeFullSnapshot2(true);
      }
    }
  };
  const wrappedMutationEmit = (m2) => {
    wrappedEmit({
      type: EventType.IncrementalSnapshot,
      data: __spreadValues({
        source: IncrementalSource.Mutation
      }, m2)
    });
  };
  const wrappedScrollEmit = (p2) => wrappedEmit({
    type: EventType.IncrementalSnapshot,
    data: __spreadValues({
      source: IncrementalSource.Scroll
    }, p2)
  });
  const wrappedCanvasMutationEmit = (p2) => wrappedEmit({
    type: EventType.IncrementalSnapshot,
    data: __spreadValues({
      source: IncrementalSource.CanvasMutation
    }, p2)
  });
  const wrappedAdoptedStyleSheetEmit = (a2) => wrappedEmit({
    type: EventType.IncrementalSnapshot,
    data: __spreadValues({
      source: IncrementalSource.AdoptedStyleSheet
    }, a2)
  });
  const stylesheetManager = new StylesheetManager({
    mutationCb: wrappedMutationEmit,
    adoptedStyleSheetCb: wrappedAdoptedStyleSheetEmit
  });
  const iframeManager = typeof __RRWEB_EXCLUDE_IFRAME__ === "boolean" && __RRWEB_EXCLUDE_IFRAME__ ? new IframeManagerNoop() : new IframeManager({
    mirror,
    mutationCb: wrappedMutationEmit,
    stylesheetManager,
    recordCrossOriginIframes,
    wrappedEmit
  });
  for (const plugin of plugins || []) {
    if (plugin.getMirror) plugin.getMirror({
      nodeMirror: mirror,
      crossOriginIframeMirror: iframeManager.crossOriginIframeMirror,
      crossOriginIframeStyleMirror: iframeManager.crossOriginIframeStyleMirror
    });
  }
  const processedNodeManager = new ProcessedNodeManager();
  const canvasManager = _getCanvasManager(getCanvasManager, {
    mirror,
    win: window,
    mutationCb: (p2) => wrappedEmit({
      type: EventType.IncrementalSnapshot,
      data: __spreadValues({
        source: IncrementalSource.CanvasMutation
      }, p2)
    }),
    recordCanvas,
    blockClass,
    blockSelector,
    unblockSelector,
    maxCanvasSize,
    sampling: sampling["canvas"],
    dataURLOptions,
    errorHandler: errorHandler3
  });
  const shadowDomManager = typeof __RRWEB_EXCLUDE_SHADOW_DOM__ === "boolean" && __RRWEB_EXCLUDE_SHADOW_DOM__ ? new ShadowDomManagerNoop() : new ShadowDomManager({
    mutationCb: wrappedMutationEmit,
    scrollCb: wrappedScrollEmit,
    bypassOptions: {
      onMutation,
      blockClass,
      blockSelector,
      unblockSelector,
      maskAllText,
      maskTextClass,
      unmaskTextClass,
      maskTextSelector,
      unmaskTextSelector,
      inlineStylesheet,
      maskInputOptions,
      dataURLOptions,
      maskAttributeFn,
      maskTextFn,
      maskInputFn,
      recordCanvas,
      inlineImages,
      sampling,
      slimDOMOptions,
      iframeManager,
      stylesheetManager,
      canvasManager,
      keepIframeSrcFn,
      processedNodeManager
    },
    mirror
  });
  const takeFullSnapshot2 = (isCheckout = false) => {
    if (!recordDOM) {
      return;
    }
    wrappedEmit({
      type: EventType.Meta,
      data: {
        href: window.location.href,
        width: getWindowWidth(),
        height: getWindowHeight()
      }
    }, isCheckout);
    stylesheetManager.reset();
    shadowDomManager.init();
    mutationBuffers.forEach((buf) => buf.lock());
    const node2 = snapshot(document, {
      mirror,
      blockClass,
      blockSelector,
      unblockSelector,
      maskAllText,
      maskTextClass,
      unmaskTextClass,
      maskTextSelector,
      unmaskTextSelector,
      inlineStylesheet,
      maskAllInputs: maskInputOptions,
      maskAttributeFn,
      maskInputFn,
      maskTextFn,
      slimDOM: slimDOMOptions,
      dataURLOptions,
      recordCanvas,
      inlineImages,
      onSerialize: (n2) => {
        if (isSerializedIframe(n2, mirror)) {
          iframeManager.addIframe(n2);
        }
        if (isSerializedStylesheet(n2, mirror)) {
          stylesheetManager.trackLinkElement(n2);
        }
        if (hasShadowRoot(n2)) {
          shadowDomManager.addShadowRoot(n2.shadowRoot, document);
        }
      },
      onIframeLoad: (iframe, childSn) => {
        iframeManager.attachIframe(iframe, childSn);
        if (iframe.contentWindow) {
          canvasManager.addWindow(iframe.contentWindow);
        }
        shadowDomManager.observeAttachShadow(iframe);
      },
      onStylesheetLoad: (linkEl, childSn) => {
        stylesheetManager.attachLinkElement(linkEl, childSn);
      },
      keepIframeSrcFn
    });
    if (!node2) {
      return console.warn("Failed to snapshot the document");
    }
    wrappedEmit({
      type: EventType.FullSnapshot,
      data: {
        node: node2,
        initialOffset: getWindowScroll(window)
      }
    });
    mutationBuffers.forEach((buf) => buf.unlock());
    if (document.adoptedStyleSheets && document.adoptedStyleSheets.length > 0) stylesheetManager.adoptStyleSheets(document.adoptedStyleSheets, mirror.getId(document));
  };
  _takeFullSnapshot = takeFullSnapshot2;
  try {
    const handlers4 = [];
    const observe2 = (doc) => {
      return callbackWrapper(initObservers)({
        onMutation,
        mutationCb: wrappedMutationEmit,
        mousemoveCb: (positions, source) => wrappedEmit({
          type: EventType.IncrementalSnapshot,
          data: {
            source,
            positions
          }
        }),
        mouseInteractionCb: (d2) => wrappedEmit({
          type: EventType.IncrementalSnapshot,
          data: __spreadValues({
            source: IncrementalSource.MouseInteraction
          }, d2)
        }),
        scrollCb: wrappedScrollEmit,
        viewportResizeCb: (d2) => wrappedEmit({
          type: EventType.IncrementalSnapshot,
          data: __spreadValues({
            source: IncrementalSource.ViewportResize
          }, d2)
        }),
        inputCb: (v2) => wrappedEmit({
          type: EventType.IncrementalSnapshot,
          data: __spreadValues({
            source: IncrementalSource.Input
          }, v2)
        }),
        mediaInteractionCb: (p2) => wrappedEmit({
          type: EventType.IncrementalSnapshot,
          data: __spreadValues({
            source: IncrementalSource.MediaInteraction
          }, p2)
        }),
        styleSheetRuleCb: (r4) => wrappedEmit({
          type: EventType.IncrementalSnapshot,
          data: __spreadValues({
            source: IncrementalSource.StyleSheetRule
          }, r4)
        }),
        styleDeclarationCb: (r4) => wrappedEmit({
          type: EventType.IncrementalSnapshot,
          data: __spreadValues({
            source: IncrementalSource.StyleDeclaration
          }, r4)
        }),
        canvasMutationCb: wrappedCanvasMutationEmit,
        fontCb: (p2) => wrappedEmit({
          type: EventType.IncrementalSnapshot,
          data: __spreadValues({
            source: IncrementalSource.Font
          }, p2)
        }),
        selectionCb: (p2) => {
          wrappedEmit({
            type: EventType.IncrementalSnapshot,
            data: __spreadValues({
              source: IncrementalSource.Selection
            }, p2)
          });
        },
        customElementCb: (c2) => {
          wrappedEmit({
            type: EventType.IncrementalSnapshot,
            data: __spreadValues({
              source: IncrementalSource.CustomElement
            }, c2)
          });
        },
        blockClass,
        ignoreClass,
        ignoreSelector,
        maskAllText,
        maskTextClass,
        unmaskTextClass,
        maskTextSelector,
        unmaskTextSelector,
        maskInputOptions,
        inlineStylesheet,
        sampling,
        recordDOM,
        recordCanvas,
        inlineImages,
        userTriggeredOnInput,
        collectFonts,
        doc,
        maskAttributeFn,
        maskInputFn,
        maskTextFn,
        keepIframeSrcFn,
        blockSelector,
        unblockSelector,
        slimDOMOptions,
        dataURLOptions,
        mirror,
        iframeManager,
        stylesheetManager,
        shadowDomManager,
        processedNodeManager,
        canvasManager,
        ignoreCSSAttributes,
        plugins: _optionalChain([plugins, "optionalAccess", (_8) => _8.filter, "call", (_9) => _9((p2) => p2.observer), "optionalAccess", (_10) => _10.map, "call", (_11) => _11((p2) => ({
          observer: p2.observer,
          options: p2.options,
          callback: (payload) => wrappedEmit({
            type: EventType.Plugin,
            data: {
              plugin: p2.name,
              payload
            }
          })
        }))]) || []
      }, {});
    };
    iframeManager.addLoadListener((iframeEl) => {
      try {
        handlers4.push(observe2(iframeEl.contentDocument));
      } catch (error) {
        console.warn(error);
      }
    });
    const init3 = () => {
      takeFullSnapshot2();
      handlers4.push(observe2(document));
    };
    if (document.readyState === "interactive" || document.readyState === "complete") {
      init3();
    } else {
      handlers4.push(on("DOMContentLoaded", () => {
        wrappedEmit({
          type: EventType.DomContentLoaded,
          data: {}
        });
        if (recordAfter === "DOMContentLoaded") init3();
      }));
      handlers4.push(on("load", () => {
        wrappedEmit({
          type: EventType.Load,
          data: {}
        });
        if (recordAfter === "load") init3();
      }, window));
    }
    return () => {
      handlers4.forEach((h2) => h2());
      processedNodeManager.destroy();
      _takeFullSnapshot = void 0;
      unregisterErrorHandler();
    };
  } catch (error) {
    console.warn(error);
  }
}
function takeFullSnapshot(isCheckout) {
  if (!_takeFullSnapshot) {
    throw new Error("please take full snapshot after start recording");
  }
  _takeFullSnapshot(isCheckout);
}
record.mirror = mirror;
record.takeFullSnapshot = takeFullSnapshot;
function _getCanvasManager(getCanvasManagerFn, options) {
  try {
    return getCanvasManagerFn ? getCanvasManagerFn(options) : new CanvasManagerNoop();
  } catch (e22) {
    console.warn("Unable to initialize CanvasManager");
    return new CanvasManagerNoop();
  }
}
var DEBUG_BUILD5 = typeof __SENTRY_DEBUG__ === "undefined" || __SENTRY_DEBUG__;
var CONSOLE_LEVELS2 = ["info", "warn", "error", "log"];
var PREFIX2 = "[Replay] ";
function _addBreadcrumb(message, level = "info") {
  addBreadcrumb({
    category: "console",
    data: {
      logger: "replay"
    },
    level,
    message: `${PREFIX2}${message}`
  }, {
    level
  });
}
function makeReplayLogger() {
  let _capture = false;
  let _trace = false;
  const _logger = {
    exception: () => void 0,
    infoTick: () => void 0,
    setConfig: (opts) => {
      _capture = opts.captureExceptions;
      _trace = opts.traceInternals;
    }
  };
  if (DEBUG_BUILD5) {
    CONSOLE_LEVELS2.forEach((name) => {
      _logger[name] = (...args) => {
        logger[name](PREFIX2, ...args);
        if (_trace) {
          _addBreadcrumb(args.join(""), severityLevelFromString(name));
        }
      };
    });
    _logger.exception = (error, ...message) => {
      if (message.length && _logger.error) {
        _logger.error(...message);
      }
      logger.error(PREFIX2, error);
      if (_capture) {
        captureException(error);
      } else if (_trace) {
        _addBreadcrumb(error, "error");
      }
    };
    _logger.infoTick = (...args) => {
      logger.info(PREFIX2, ...args);
      if (_trace) {
        setTimeout(() => _addBreadcrumb(args[0]), 0);
      }
    };
  } else {
    CONSOLE_LEVELS2.forEach((name) => {
      _logger[name] = () => void 0;
    });
  }
  return _logger;
}
var logger2 = makeReplayLogger();
var ReplayEventTypeIncrementalSnapshot = 3;
var ReplayEventTypeCustom = 5;
function timestampToMs(timestamp) {
  const isMs = timestamp > 9999999999;
  return isMs ? timestamp : timestamp * 1e3;
}
function timestampToS(timestamp) {
  const isMs = timestamp > 9999999999;
  return isMs ? timestamp / 1e3 : timestamp;
}
function addBreadcrumbEvent(replay, breadcrumb) {
  if (breadcrumb.category === "sentry.transaction") {
    return;
  }
  if (["ui.click", "ui.input"].includes(breadcrumb.category)) {
    replay.triggerUserActivity();
  } else {
    replay.checkAndHandleExpiredSession();
  }
  replay.addUpdate(() => {
    replay.throttledAddEvent({
      type: EventType.Custom,
      // TODO: We were converting from ms to seconds for breadcrumbs, spans,
      // but maybe we should just keep them as milliseconds
      timestamp: (breadcrumb.timestamp || 0) * 1e3,
      data: {
        tag: "breadcrumb",
        // normalize to max. 10 depth and 1_000 properties per object
        payload: normalize(breadcrumb, 10, 1e3)
      }
    });
    return breadcrumb.category === "console";
  });
}
var INTERACTIVE_SELECTOR = "button,a";
function getClosestInteractive(element) {
  const closestInteractive = element.closest(INTERACTIVE_SELECTOR);
  return closestInteractive || element;
}
function getClickTargetNode(event) {
  const target = getTargetNode(event);
  if (!target || !(target instanceof Element)) {
    return target;
  }
  return getClosestInteractive(target);
}
function getTargetNode(event) {
  if (isEventWithTarget(event)) {
    return event.target;
  }
  return event;
}
function isEventWithTarget(event) {
  return typeof event === "object" && !!event && "target" in event;
}
var handlers3;
function onWindowOpen(cb) {
  if (!handlers3) {
    handlers3 = [];
    monkeyPatchWindowOpen();
  }
  handlers3.push(cb);
  return () => {
    const pos = handlers3 ? handlers3.indexOf(cb) : -1;
    if (pos > -1) {
      handlers3.splice(pos, 1);
    }
  };
}
function monkeyPatchWindowOpen() {
  fill(WINDOW8, "open", function(originalWindowOpen) {
    return function(...args) {
      if (handlers3) {
        try {
          handlers3.forEach((handler) => handler());
        } catch (e3) {
        }
      }
      return originalWindowOpen.apply(WINDOW8, args);
    };
  });
}
var IncrementalMutationSources = /* @__PURE__ */ new Set([IncrementalSource.Mutation, IncrementalSource.StyleSheetRule, IncrementalSource.StyleDeclaration, IncrementalSource.AdoptedStyleSheet, IncrementalSource.CanvasMutation, IncrementalSource.Selection, IncrementalSource.MediaInteraction]);
function handleClick(clickDetector, clickBreadcrumb, node2) {
  clickDetector.handleClick(clickBreadcrumb, node2);
}
var ClickDetector = class {
  // protected for testing
  constructor(replay, slowClickConfig, _addBreadcrumbEvent = addBreadcrumbEvent) {
    this._lastMutation = 0;
    this._lastScroll = 0;
    this._clicks = [];
    this._timeout = slowClickConfig.timeout / 1e3;
    this._threshold = slowClickConfig.threshold / 1e3;
    this._scollTimeout = slowClickConfig.scrollTimeout / 1e3;
    this._replay = replay;
    this._ignoreSelector = slowClickConfig.ignoreSelector;
    this._addBreadcrumbEvent = _addBreadcrumbEvent;
  }
  /** Register click detection handlers on mutation or scroll. */
  addListeners() {
    const cleanupWindowOpen = onWindowOpen(() => {
      this._lastMutation = nowInSeconds();
    });
    this._teardown = () => {
      cleanupWindowOpen();
      this._clicks = [];
      this._lastMutation = 0;
      this._lastScroll = 0;
    };
  }
  /** Clean up listeners. */
  removeListeners() {
    if (this._teardown) {
      this._teardown();
    }
    if (this._checkClickTimeout) {
      clearTimeout(this._checkClickTimeout);
    }
  }
  /** @inheritDoc */
  handleClick(breadcrumb, node2) {
    if (ignoreElement(node2, this._ignoreSelector) || !isClickBreadcrumb(breadcrumb)) {
      return;
    }
    const newClick = {
      timestamp: timestampToS(breadcrumb.timestamp),
      clickBreadcrumb: breadcrumb,
      // Set this to 0 so we know it originates from the click breadcrumb
      clickCount: 0,
      node: node2
    };
    if (this._clicks.some((click) => click.node === newClick.node && Math.abs(click.timestamp - newClick.timestamp) < 1)) {
      return;
    }
    this._clicks.push(newClick);
    if (this._clicks.length === 1) {
      this._scheduleCheckClicks();
    }
  }
  /** @inheritDoc */
  registerMutation(timestamp = Date.now()) {
    this._lastMutation = timestampToS(timestamp);
  }
  /** @inheritDoc */
  registerScroll(timestamp = Date.now()) {
    this._lastScroll = timestampToS(timestamp);
  }
  /** @inheritDoc */
  registerClick(element) {
    const node2 = getClosestInteractive(element);
    this._handleMultiClick(node2);
  }
  /** Count multiple clicks on elements. */
  _handleMultiClick(node2) {
    this._getClicks(node2).forEach((click) => {
      click.clickCount++;
    });
  }
  /** Get all pending clicks for a given node. */
  _getClicks(node2) {
    return this._clicks.filter((click) => click.node === node2);
  }
  /** Check the clicks that happened. */
  _checkClicks() {
    const timedOutClicks = [];
    const now = nowInSeconds();
    this._clicks.forEach((click) => {
      if (!click.mutationAfter && this._lastMutation) {
        click.mutationAfter = click.timestamp <= this._lastMutation ? this._lastMutation - click.timestamp : void 0;
      }
      if (!click.scrollAfter && this._lastScroll) {
        click.scrollAfter = click.timestamp <= this._lastScroll ? this._lastScroll - click.timestamp : void 0;
      }
      if (click.timestamp + this._timeout <= now) {
        timedOutClicks.push(click);
      }
    });
    for (const click of timedOutClicks) {
      const pos = this._clicks.indexOf(click);
      if (pos > -1) {
        this._generateBreadcrumbs(click);
        this._clicks.splice(pos, 1);
      }
    }
    if (this._clicks.length) {
      this._scheduleCheckClicks();
    }
  }
  /** Generate matching breadcrumb(s) for the click. */
  _generateBreadcrumbs(click) {
    const replay = this._replay;
    const hadScroll = click.scrollAfter && click.scrollAfter <= this._scollTimeout;
    const hadMutation = click.mutationAfter && click.mutationAfter <= this._threshold;
    const isSlowClick = !hadScroll && !hadMutation;
    const {
      clickCount,
      clickBreadcrumb
    } = click;
    if (isSlowClick) {
      const timeAfterClickMs = Math.min(click.mutationAfter || this._timeout, this._timeout) * 1e3;
      const endReason = timeAfterClickMs < this._timeout * 1e3 ? "mutation" : "timeout";
      const breadcrumb = {
        type: "default",
        message: clickBreadcrumb.message,
        timestamp: clickBreadcrumb.timestamp,
        category: "ui.slowClickDetected",
        data: __spreadProps(__spreadValues({}, clickBreadcrumb.data), {
          url: WINDOW8.location.href,
          route: replay.getCurrentRoute(),
          timeAfterClickMs,
          endReason,
          // If clickCount === 0, it means multiClick was not correctly captured here
          // - we still want to send 1 in this case
          clickCount: clickCount || 1
        })
      };
      this._addBreadcrumbEvent(replay, breadcrumb);
      return;
    }
    if (clickCount > 1) {
      const breadcrumb = {
        type: "default",
        message: clickBreadcrumb.message,
        timestamp: clickBreadcrumb.timestamp,
        category: "ui.multiClick",
        data: __spreadProps(__spreadValues({}, clickBreadcrumb.data), {
          url: WINDOW8.location.href,
          route: replay.getCurrentRoute(),
          clickCount,
          metric: true
        })
      };
      this._addBreadcrumbEvent(replay, breadcrumb);
    }
  }
  /** Schedule to check current clicks. */
  _scheduleCheckClicks() {
    if (this._checkClickTimeout) {
      clearTimeout(this._checkClickTimeout);
    }
    this._checkClickTimeout = setTimeout2(() => this._checkClicks(), 1e3);
  }
};
var SLOW_CLICK_TAGS = ["A", "BUTTON", "INPUT"];
function ignoreElement(node2, ignoreSelector) {
  if (!SLOW_CLICK_TAGS.includes(node2.tagName)) {
    return true;
  }
  if (node2.tagName === "INPUT" && !["submit", "button"].includes(node2.getAttribute("type") || "")) {
    return true;
  }
  if (node2.tagName === "A" && (node2.hasAttribute("download") || node2.hasAttribute("target") && node2.getAttribute("target") !== "_self")) {
    return true;
  }
  if (ignoreSelector && node2.matches(ignoreSelector)) {
    return true;
  }
  return false;
}
function isClickBreadcrumb(breadcrumb) {
  return !!(breadcrumb.data && typeof breadcrumb.data.nodeId === "number" && breadcrumb.timestamp);
}
function nowInSeconds() {
  return Date.now() / 1e3;
}
function updateClickDetectorForRecordingEvent(clickDetector, event) {
  try {
    if (!isIncrementalEvent(event)) {
      return;
    }
    const {
      source
    } = event.data;
    if (IncrementalMutationSources.has(source)) {
      clickDetector.registerMutation(event.timestamp);
    }
    if (source === IncrementalSource.Scroll) {
      clickDetector.registerScroll(event.timestamp);
    }
    if (isIncrementalMouseInteraction(event)) {
      const {
        type,
        id
      } = event.data;
      const node2 = record.mirror.getNode(id);
      if (node2 instanceof HTMLElement && type === MouseInteractions.Click) {
        clickDetector.registerClick(node2);
      }
    }
  } catch (e3) {
  }
}
function isIncrementalEvent(event) {
  return event.type === ReplayEventTypeIncrementalSnapshot;
}
function isIncrementalMouseInteraction(event) {
  return event.data.source === IncrementalSource.MouseInteraction;
}
function createBreadcrumb(breadcrumb) {
  return __spreadValues({
    timestamp: Date.now() / 1e3,
    type: "default"
  }, breadcrumb);
}
var NodeType;
(function(NodeType3) {
  NodeType3[NodeType3["Document"] = 0] = "Document";
  NodeType3[NodeType3["DocumentType"] = 1] = "DocumentType";
  NodeType3[NodeType3["Element"] = 2] = "Element";
  NodeType3[NodeType3["Text"] = 3] = "Text";
  NodeType3[NodeType3["CDATA"] = 4] = "CDATA";
  NodeType3[NodeType3["Comment"] = 5] = "Comment";
})(NodeType || (NodeType = {}));
var ATTRIBUTES_TO_RECORD = /* @__PURE__ */ new Set(["id", "class", "aria-label", "role", "name", "alt", "title", "data-test-id", "data-testid", "disabled", "aria-disabled", "data-sentry-component"]);
function getAttributesToRecord(attributes) {
  const obj = {};
  if (!attributes["data-sentry-component"] && attributes["data-sentry-element"]) {
    attributes["data-sentry-component"] = attributes["data-sentry-element"];
  }
  for (const key in attributes) {
    if (ATTRIBUTES_TO_RECORD.has(key)) {
      let normalizedKey = key;
      if (key === "data-testid" || key === "data-test-id") {
        normalizedKey = "testId";
      }
      obj[normalizedKey] = attributes[key];
    }
  }
  return obj;
}
var handleDomListener = (replay) => {
  return (handlerData) => {
    if (!replay.isEnabled()) {
      return;
    }
    const result = handleDom(handlerData);
    if (!result) {
      return;
    }
    const isClick = handlerData.name === "click";
    const event = isClick ? handlerData.event : void 0;
    if (isClick && replay.clickDetector && event && event.target && !event.altKey && !event.metaKey && !event.ctrlKey && !event.shiftKey) {
      handleClick(replay.clickDetector, result, getClickTargetNode(handlerData.event));
    }
    addBreadcrumbEvent(replay, result);
  };
};
function getBaseDomBreadcrumb(target, message) {
  const nodeId = record.mirror.getId(target);
  const node2 = nodeId && record.mirror.getNode(nodeId);
  const meta = node2 && record.mirror.getMeta(node2);
  const element = meta && isElement2(meta) ? meta : null;
  return {
    message,
    data: element ? {
      nodeId,
      node: {
        id: nodeId,
        tagName: element.tagName,
        textContent: Array.from(element.childNodes).map((node3) => node3.type === NodeType.Text && node3.textContent).filter(Boolean).map((text) => text.trim()).join(""),
        attributes: getAttributesToRecord(element.attributes)
      }
    } : {}
  };
}
function handleDom(handlerData) {
  const {
    target,
    message
  } = getDomTarget(handlerData);
  return createBreadcrumb(__spreadValues({
    category: `ui.${handlerData.name}`
  }, getBaseDomBreadcrumb(target, message)));
}
function getDomTarget(handlerData) {
  const isClick = handlerData.name === "click";
  let message;
  let target = null;
  try {
    target = isClick ? getClickTargetNode(handlerData.event) : getTargetNode(handlerData.event);
    message = htmlTreeAsString(target, {
      maxStringLength: 200
    }) || "<unknown>";
  } catch (e3) {
    message = "<unknown>";
  }
  return {
    target,
    message
  };
}
function isElement2(node2) {
  return node2.type === NodeType.Element;
}
function handleKeyboardEvent(replay, event) {
  if (!replay.isEnabled()) {
    return;
  }
  replay.updateUserActivity();
  const breadcrumb = getKeyboardBreadcrumb(event);
  if (!breadcrumb) {
    return;
  }
  addBreadcrumbEvent(replay, breadcrumb);
}
function getKeyboardBreadcrumb(event) {
  const {
    metaKey,
    shiftKey,
    ctrlKey,
    altKey,
    key,
    target
  } = event;
  if (!target || isInputElement(target) || !key) {
    return null;
  }
  const hasModifierKey = metaKey || ctrlKey || altKey;
  const isCharacterKey = key.length === 1;
  if (!hasModifierKey && isCharacterKey) {
    return null;
  }
  const message = htmlTreeAsString(target, {
    maxStringLength: 200
  }) || "<unknown>";
  const baseBreadcrumb = getBaseDomBreadcrumb(target, message);
  return createBreadcrumb({
    category: "ui.keyDown",
    message,
    data: __spreadProps(__spreadValues({}, baseBreadcrumb.data), {
      metaKey,
      shiftKey,
      ctrlKey,
      altKey,
      key
    })
  });
}
function isInputElement(target) {
  return target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
}
var ENTRY_TYPES = {
  // @ts-expect-error TODO: entry type does not fit the create* functions entry type
  resource: createResourceEntry,
  paint: createPaintEntry,
  // @ts-expect-error TODO: entry type does not fit the create* functions entry type
  navigation: createNavigationEntry
};
function webVitalHandler(getter, replay) {
  return ({
    metric
  }) => void replay.replayPerformanceEntries.push(getter(metric));
}
function createPerformanceEntries(entries) {
  return entries.map(createPerformanceEntry).filter(Boolean);
}
function createPerformanceEntry(entry) {
  const entryType = ENTRY_TYPES[entry.entryType];
  if (!entryType) {
    return null;
  }
  return entryType(entry);
}
function getAbsoluteTime(time) {
  return ((browserPerformanceTimeOrigin || WINDOW8.performance.timeOrigin) + time) / 1e3;
}
function createPaintEntry(entry) {
  const {
    duration,
    entryType,
    name,
    startTime
  } = entry;
  const start = getAbsoluteTime(startTime);
  return {
    type: entryType,
    name,
    start,
    end: start + duration,
    data: void 0
  };
}
function createNavigationEntry(entry) {
  const {
    entryType,
    name,
    decodedBodySize,
    duration,
    domComplete,
    encodedBodySize,
    domContentLoadedEventStart,
    domContentLoadedEventEnd,
    domInteractive,
    loadEventStart,
    loadEventEnd,
    redirectCount,
    startTime,
    transferSize,
    type
  } = entry;
  if (duration === 0) {
    return null;
  }
  return {
    type: `${entryType}.${type}`,
    start: getAbsoluteTime(startTime),
    end: getAbsoluteTime(domComplete),
    name,
    data: {
      size: transferSize,
      decodedBodySize,
      encodedBodySize,
      duration,
      domInteractive,
      domContentLoadedEventStart,
      domContentLoadedEventEnd,
      loadEventStart,
      loadEventEnd,
      domComplete,
      redirectCount
    }
  };
}
function createResourceEntry(entry) {
  const {
    entryType,
    initiatorType,
    name,
    responseEnd,
    startTime,
    decodedBodySize,
    encodedBodySize,
    responseStatus,
    transferSize
  } = entry;
  if (["fetch", "xmlhttprequest"].includes(initiatorType)) {
    return null;
  }
  return {
    type: `${entryType}.${initiatorType}`,
    start: getAbsoluteTime(startTime),
    end: getAbsoluteTime(responseEnd),
    name,
    data: {
      size: transferSize,
      statusCode: responseStatus,
      decodedBodySize,
      encodedBodySize
    }
  };
}
function getLargestContentfulPaint(metric) {
  const lastEntry = metric.entries[metric.entries.length - 1];
  const node2 = lastEntry && lastEntry.element ? [lastEntry.element] : void 0;
  return getWebVital(metric, "largest-contentful-paint", node2);
}
function isLayoutShift(entry) {
  return entry.sources !== void 0;
}
function getCumulativeLayoutShift(metric) {
  const layoutShifts = [];
  const nodes = [];
  for (const entry of metric.entries) {
    if (isLayoutShift(entry)) {
      const nodeIds = [];
      for (const source of entry.sources) {
        if (source.node) {
          nodes.push(source.node);
          const nodeId = record.mirror.getId(source.node);
          if (nodeId) {
            nodeIds.push(nodeId);
          }
        }
      }
      layoutShifts.push({
        value: entry.value,
        nodeIds: nodeIds.length ? nodeIds : void 0
      });
    }
  }
  return getWebVital(metric, "cumulative-layout-shift", nodes, layoutShifts);
}
function getFirstInputDelay(metric) {
  const lastEntry = metric.entries[metric.entries.length - 1];
  const node2 = lastEntry && lastEntry.target ? [lastEntry.target] : void 0;
  return getWebVital(metric, "first-input-delay", node2);
}
function getInteractionToNextPaint(metric) {
  const lastEntry = metric.entries[metric.entries.length - 1];
  const node2 = lastEntry && lastEntry.target ? [lastEntry.target] : void 0;
  return getWebVital(metric, "interaction-to-next-paint", node2);
}
function getWebVital(metric, name, nodes, attributions) {
  const value = metric.value;
  const rating = metric.rating;
  const end = getAbsoluteTime(value);
  return {
    type: "web-vital",
    name,
    start: end,
    end,
    data: {
      value,
      size: value,
      rating,
      nodeIds: nodes ? nodes.map((node2) => record.mirror.getId(node2)) : void 0,
      attributions
    }
  };
}
function setupPerformanceObserver(replay) {
  function addPerformanceEntry(entry) {
    if (!replay.performanceEntries.includes(entry)) {
      replay.performanceEntries.push(entry);
    }
  }
  function onEntries({
    entries
  }) {
    entries.forEach(addPerformanceEntry);
  }
  const clearCallbacks = [];
  ["navigation", "paint", "resource"].forEach((type) => {
    clearCallbacks.push(addPerformanceInstrumentationHandler(type, onEntries));
  });
  clearCallbacks.push(addLcpInstrumentationHandler(webVitalHandler(getLargestContentfulPaint, replay)), addClsInstrumentationHandler(webVitalHandler(getCumulativeLayoutShift, replay)), addFidInstrumentationHandler(webVitalHandler(getFirstInputDelay, replay)), addInpInstrumentationHandler(webVitalHandler(getInteractionToNextPaint, replay)));
  return () => {
    clearCallbacks.forEach((clearCallback) => clearCallback());
  };
}
var r = `var t=Uint8Array,n=Uint16Array,r=Int32Array,e=new t([0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0,0]),i=new t([0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,0,0]),a=new t([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]),s=function(t,e){for(var i=new n(31),a=0;a<31;++a)i[a]=e+=1<<t[a-1];var s=new r(i[30]);for(a=1;a<30;++a)for(var o=i[a];o<i[a+1];++o)s[o]=o-i[a]<<5|a;return{b:i,r:s}},o=s(e,2),f=o.b,h=o.r;f[28]=258,h[258]=28;for(var l=s(i,0).r,u=new n(32768),c=0;c<32768;++c){var v=(43690&c)>>1|(21845&c)<<1;v=(61680&(v=(52428&v)>>2|(13107&v)<<2))>>4|(3855&v)<<4,u[c]=((65280&v)>>8|(255&v)<<8)>>1}var d=function(t,r,e){for(var i=t.length,a=0,s=new n(r);a<i;++a)t[a]&&++s[t[a]-1];var o,f=new n(r);for(a=1;a<r;++a)f[a]=f[a-1]+s[a-1]<<1;if(e){o=new n(1<<r);var h=15-r;for(a=0;a<i;++a)if(t[a])for(var l=a<<4|t[a],c=r-t[a],v=f[t[a]-1]++<<c,d=v|(1<<c)-1;v<=d;++v)o[u[v]>>h]=l}else for(o=new n(i),a=0;a<i;++a)t[a]&&(o[a]=u[f[t[a]-1]++]>>15-t[a]);return o},g=new t(288);for(c=0;c<144;++c)g[c]=8;for(c=144;c<256;++c)g[c]=9;for(c=256;c<280;++c)g[c]=7;for(c=280;c<288;++c)g[c]=8;var w=new t(32);for(c=0;c<32;++c)w[c]=5;var p=d(g,9,0),y=d(w,5,0),m=function(t){return(t+7)/8|0},b=function(n,r,e){return(null==r||r<0)&&(r=0),(null==e||e>n.length)&&(e=n.length),new t(n.subarray(r,e))},M=["unexpected EOF","invalid block type","invalid length/literal","invalid distance","stream finished","no stream handler",,"no callback","invalid UTF-8 data","extra field too long","date not in range 1980-2099","filename too long","stream finishing","invalid zip data"],E=function(t,n,r){var e=new Error(n||M[t]);if(e.code=t,Error.captureStackTrace&&Error.captureStackTrace(e,E),!r)throw e;return e},z=function(t,n,r){r<<=7&n;var e=n/8|0;t[e]|=r,t[e+1]|=r>>8},A=function(t,n,r){r<<=7&n;var e=n/8|0;t[e]|=r,t[e+1]|=r>>8,t[e+2]|=r>>16},_=function(r,e){for(var i=[],a=0;a<r.length;++a)r[a]&&i.push({s:a,f:r[a]});var s=i.length,o=i.slice();if(!s)return{t:F,l:0};if(1==s){var f=new t(i[0].s+1);return f[i[0].s]=1,{t:f,l:1}}i.sort((function(t,n){return t.f-n.f})),i.push({s:-1,f:25001});var h=i[0],l=i[1],u=0,c=1,v=2;for(i[0]={s:-1,f:h.f+l.f,l:h,r:l};c!=s-1;)h=i[i[u].f<i[v].f?u++:v++],l=i[u!=c&&i[u].f<i[v].f?u++:v++],i[c++]={s:-1,f:h.f+l.f,l:h,r:l};var d=o[0].s;for(a=1;a<s;++a)o[a].s>d&&(d=o[a].s);var g=new n(d+1),w=x(i[c-1],g,0);if(w>e){a=0;var p=0,y=w-e,m=1<<y;for(o.sort((function(t,n){return g[n.s]-g[t.s]||t.f-n.f}));a<s;++a){var b=o[a].s;if(!(g[b]>e))break;p+=m-(1<<w-g[b]),g[b]=e}for(p>>=y;p>0;){var M=o[a].s;g[M]<e?p-=1<<e-g[M]++-1:++a}for(;a>=0&&p;--a){var E=o[a].s;g[E]==e&&(--g[E],++p)}w=e}return{t:new t(g),l:w}},x=function(t,n,r){return-1==t.s?Math.max(x(t.l,n,r+1),x(t.r,n,r+1)):n[t.s]=r},D=function(t){for(var r=t.length;r&&!t[--r];);for(var e=new n(++r),i=0,a=t[0],s=1,o=function(t){e[i++]=t},f=1;f<=r;++f)if(t[f]==a&&f!=r)++s;else{if(!a&&s>2){for(;s>138;s-=138)o(32754);s>2&&(o(s>10?s-11<<5|28690:s-3<<5|12305),s=0)}else if(s>3){for(o(a),--s;s>6;s-=6)o(8304);s>2&&(o(s-3<<5|8208),s=0)}for(;s--;)o(a);s=1,a=t[f]}return{c:e.subarray(0,i),n:r}},T=function(t,n){for(var r=0,e=0;e<n.length;++e)r+=t[e]*n[e];return r},k=function(t,n,r){var e=r.length,i=m(n+2);t[i]=255&e,t[i+1]=e>>8,t[i+2]=255^t[i],t[i+3]=255^t[i+1];for(var a=0;a<e;++a)t[i+a+4]=r[a];return 8*(i+4+e)},C=function(t,r,s,o,f,h,l,u,c,v,m){z(r,m++,s),++f[256];for(var b=_(f,15),M=b.t,E=b.l,x=_(h,15),C=x.t,U=x.l,F=D(M),I=F.c,S=F.n,L=D(C),O=L.c,j=L.n,q=new n(19),B=0;B<I.length;++B)++q[31&I[B]];for(B=0;B<O.length;++B)++q[31&O[B]];for(var G=_(q,7),H=G.t,J=G.l,K=19;K>4&&!H[a[K-1]];--K);var N,P,Q,R,V=v+5<<3,W=T(f,g)+T(h,w)+l,X=T(f,M)+T(h,C)+l+14+3*K+T(q,H)+2*q[16]+3*q[17]+7*q[18];if(c>=0&&V<=W&&V<=X)return k(r,m,t.subarray(c,c+v));if(z(r,m,1+(X<W)),m+=2,X<W){N=d(M,E,0),P=M,Q=d(C,U,0),R=C;var Y=d(H,J,0);z(r,m,S-257),z(r,m+5,j-1),z(r,m+10,K-4),m+=14;for(B=0;B<K;++B)z(r,m+3*B,H[a[B]]);m+=3*K;for(var Z=[I,O],$=0;$<2;++$){var tt=Z[$];for(B=0;B<tt.length;++B){var nt=31&tt[B];z(r,m,Y[nt]),m+=H[nt],nt>15&&(z(r,m,tt[B]>>5&127),m+=tt[B]>>12)}}}else N=p,P=g,Q=y,R=w;for(B=0;B<u;++B){var rt=o[B];if(rt>255){A(r,m,N[(nt=rt>>18&31)+257]),m+=P[nt+257],nt>7&&(z(r,m,rt>>23&31),m+=e[nt]);var et=31&rt;A(r,m,Q[et]),m+=R[et],et>3&&(A(r,m,rt>>5&8191),m+=i[et])}else A(r,m,N[rt]),m+=P[rt]}return A(r,m,N[256]),m+P[256]},U=new r([65540,131080,131088,131104,262176,1048704,1048832,2114560,2117632]),F=new t(0),I=function(){for(var t=new Int32Array(256),n=0;n<256;++n){for(var r=n,e=9;--e;)r=(1&r&&-306674912)^r>>>1;t[n]=r}return t}(),S=function(){var t=-1;return{p:function(n){for(var r=t,e=0;e<n.length;++e)r=I[255&r^n[e]]^r>>>8;t=r},d:function(){return~t}}},L=function(){var t=1,n=0;return{p:function(r){for(var e=t,i=n,a=0|r.length,s=0;s!=a;){for(var o=Math.min(s+2655,a);s<o;++s)i+=e+=r[s];e=(65535&e)+15*(e>>16),i=(65535&i)+15*(i>>16)}t=e,n=i},d:function(){return(255&(t%=65521))<<24|(65280&t)<<8|(255&(n%=65521))<<8|n>>8}}},O=function(a,s,o,f,u){if(!u&&(u={l:1},s.dictionary)){var c=s.dictionary.subarray(-32768),v=new t(c.length+a.length);v.set(c),v.set(a,c.length),a=v,u.w=c.length}return function(a,s,o,f,u,c){var v=c.z||a.length,d=new t(f+v+5*(1+Math.ceil(v/7e3))+u),g=d.subarray(f,d.length-u),w=c.l,p=7&(c.r||0);if(s){p&&(g[0]=c.r>>3);for(var y=U[s-1],M=y>>13,E=8191&y,z=(1<<o)-1,A=c.p||new n(32768),_=c.h||new n(z+1),x=Math.ceil(o/3),D=2*x,T=function(t){return(a[t]^a[t+1]<<x^a[t+2]<<D)&z},F=new r(25e3),I=new n(288),S=new n(32),L=0,O=0,j=c.i||0,q=0,B=c.w||0,G=0;j+2<v;++j){var H=T(j),J=32767&j,K=_[H];if(A[J]=K,_[H]=J,B<=j){var N=v-j;if((L>7e3||q>24576)&&(N>423||!w)){p=C(a,g,0,F,I,S,O,q,G,j-G,p),q=L=O=0,G=j;for(var P=0;P<286;++P)I[P]=0;for(P=0;P<30;++P)S[P]=0}var Q=2,R=0,V=E,W=J-K&32767;if(N>2&&H==T(j-W))for(var X=Math.min(M,N)-1,Y=Math.min(32767,j),Z=Math.min(258,N);W<=Y&&--V&&J!=K;){if(a[j+Q]==a[j+Q-W]){for(var $=0;$<Z&&a[j+$]==a[j+$-W];++$);if($>Q){if(Q=$,R=W,$>X)break;var tt=Math.min(W,$-2),nt=0;for(P=0;P<tt;++P){var rt=j-W+P&32767,et=rt-A[rt]&32767;et>nt&&(nt=et,K=rt)}}}W+=(J=K)-(K=A[J])&32767}if(R){F[q++]=268435456|h[Q]<<18|l[R];var it=31&h[Q],at=31&l[R];O+=e[it]+i[at],++I[257+it],++S[at],B=j+Q,++L}else F[q++]=a[j],++I[a[j]]}}for(j=Math.max(j,B);j<v;++j)F[q++]=a[j],++I[a[j]];p=C(a,g,w,F,I,S,O,q,G,j-G,p),w||(c.r=7&p|g[p/8|0]<<3,p-=7,c.h=_,c.p=A,c.i=j,c.w=B)}else{for(j=c.w||0;j<v+w;j+=65535){var st=j+65535;st>=v&&(g[p/8|0]=w,st=v),p=k(g,p+1,a.subarray(j,st))}c.i=v}return b(d,0,f+m(p)+u)}(a,null==s.level?6:s.level,null==s.mem?Math.ceil(1.5*Math.max(8,Math.min(13,Math.log(a.length)))):12+s.mem,o,f,u)},j=function(t,n,r){for(;r;++n)t[n]=r,r>>>=8},q=function(t,n){var r=n.filename;if(t[0]=31,t[1]=139,t[2]=8,t[8]=n.level<2?4:9==n.level?2:0,t[9]=3,0!=n.mtime&&j(t,4,Math.floor(new Date(n.mtime||Date.now())/1e3)),r){t[3]=8;for(var e=0;e<=r.length;++e)t[e+10]=r.charCodeAt(e)}},B=function(t){return 10+(t.filename?t.filename.length+1:0)},G=function(){function n(n,r){if("function"==typeof n&&(r=n,n={}),this.ondata=r,this.o=n||{},this.s={l:0,i:32768,w:32768,z:32768},this.b=new t(98304),this.o.dictionary){var e=this.o.dictionary.subarray(-32768);this.b.set(e,32768-e.length),this.s.i=32768-e.length}}return n.prototype.p=function(t,n){this.ondata(O(t,this.o,0,0,this.s),n)},n.prototype.push=function(n,r){this.ondata||E(5),this.s.l&&E(4);var e=n.length+this.s.z;if(e>this.b.length){if(e>2*this.b.length-32768){var i=new t(-32768&e);i.set(this.b.subarray(0,this.s.z)),this.b=i}var a=this.b.length-this.s.z;a&&(this.b.set(n.subarray(0,a),this.s.z),this.s.z=this.b.length,this.p(this.b,!1)),this.b.set(this.b.subarray(-32768)),this.b.set(n.subarray(a),32768),this.s.z=n.length-a+32768,this.s.i=32766,this.s.w=32768}else this.b.set(n,this.s.z),this.s.z+=n.length;this.s.l=1&r,(this.s.z>this.s.w+8191||r)&&(this.p(this.b,r||!1),this.s.w=this.s.i,this.s.i-=2)},n}();var H=function(){function t(t,n){this.c=L(),this.v=1,G.call(this,t,n)}return t.prototype.push=function(t,n){this.c.p(t),G.prototype.push.call(this,t,n)},t.prototype.p=function(t,n){var r=O(t,this.o,this.v&&(this.o.dictionary?6:2),n&&4,this.s);this.v&&(function(t,n){var r=n.level,e=0==r?0:r<6?1:9==r?3:2;if(t[0]=120,t[1]=e<<6|(n.dictionary&&32),t[1]|=31-(t[0]<<8|t[1])%31,n.dictionary){var i=L();i.p(n.dictionary),j(t,2,i.d())}}(r,this.o),this.v=0),n&&j(r,r.length-4,this.c.d()),this.ondata(r,n)},t}(),J="undefined"!=typeof TextEncoder&&new TextEncoder,K="undefined"!=typeof TextDecoder&&new TextDecoder;try{K.decode(F,{stream:!0})}catch(t){}var N=function(){function t(t){this.ondata=t}return t.prototype.push=function(t,n){this.ondata||E(5),this.d&&E(4),this.ondata(P(t),this.d=n||!1)},t}();function P(n,r){if(r){for(var e=new t(n.length),i=0;i<n.length;++i)e[i]=n.charCodeAt(i);return e}if(J)return J.encode(n);var a=n.length,s=new t(n.length+(n.length>>1)),o=0,f=function(t){s[o++]=t};for(i=0;i<a;++i){if(o+5>s.length){var h=new t(o+8+(a-i<<1));h.set(s),s=h}var l=n.charCodeAt(i);l<128||r?f(l):l<2048?(f(192|l>>6),f(128|63&l)):l>55295&&l<57344?(f(240|(l=65536+(1047552&l)|1023&n.charCodeAt(++i))>>18),f(128|l>>12&63),f(128|l>>6&63),f(128|63&l)):(f(224|l>>12),f(128|l>>6&63),f(128|63&l))}return b(s,0,o)}function Q(t){return function(t,n){n||(n={});var r=S(),e=t.length;r.p(t);var i=O(t,n,B(n),8),a=i.length;return q(i,n),j(i,a-8,r.d()),j(i,a-4,e),i}(P(t))}const R=new class{constructor(){this._init()}clear(){this._init()}addEvent(t){if(!t)throw new Error("Adding invalid event");const n=this._hasEvents?",":"";this.stream.push(n+t),this._hasEvents=!0}finish(){this.stream.push("]",!0);const t=function(t){let n=0;for(const r of t)n+=r.length;const r=new Uint8Array(n);for(let n=0,e=0,i=t.length;n<i;n++){const i=t[n];r.set(i,e),e+=i.length}return r}(this._deflatedData);return this._init(),t}_init(){this._hasEvents=!1,this._deflatedData=[],this.deflate=new H,this.deflate.ondata=(t,n)=>{this._deflatedData.push(t)},this.stream=new N(((t,n)=>{this.deflate.push(t,n)})),this.stream.push("[")}},V={clear:()=>{R.clear()},addEvent:t=>R.addEvent(t),finish:()=>R.finish(),compress:t=>Q(t)};addEventListener("message",(function(t){const n=t.data.method,r=t.data.id,e=t.data.arg;if(n in V&&"function"==typeof V[n])try{const t=V[n](e);postMessage({id:r,method:n,success:!0,response:t})}catch(t){postMessage({id:r,method:n,success:!1,response:t.message}),console.error(t)}})),postMessage({id:void 0,method:"init",success:!0,response:void 0});`;
function e() {
  const e3 = new Blob([r]);
  return URL.createObjectURL(e3);
}
var EventBufferSizeExceededError = class extends Error {
  constructor() {
    super(`Event buffer exceeded maximum size of ${REPLAY_MAX_EVENT_BUFFER_SIZE}.`);
  }
};
var EventBufferArray = class {
  /** All the events that are buffered to be sent. */
  /** @inheritdoc */
  constructor() {
    this.events = [];
    this._totalSize = 0;
    this.hasCheckout = false;
  }
  /** @inheritdoc */
  get hasEvents() {
    return this.events.length > 0;
  }
  /** @inheritdoc */
  get type() {
    return "sync";
  }
  /** @inheritdoc */
  destroy() {
    this.events = [];
  }
  /** @inheritdoc */
  addEvent(event) {
    return __async(this, null, function* () {
      const eventSize = JSON.stringify(event).length;
      this._totalSize += eventSize;
      if (this._totalSize > REPLAY_MAX_EVENT_BUFFER_SIZE) {
        throw new EventBufferSizeExceededError();
      }
      this.events.push(event);
    });
  }
  /** @inheritdoc */
  finish() {
    return new Promise((resolve2) => {
      const eventsRet = this.events;
      this.clear();
      resolve2(JSON.stringify(eventsRet));
    });
  }
  /** @inheritdoc */
  clear() {
    this.events = [];
    this._totalSize = 0;
    this.hasCheckout = false;
  }
  /** @inheritdoc */
  getEarliestTimestamp() {
    const timestamp = this.events.map((event) => event.timestamp).sort()[0];
    if (!timestamp) {
      return null;
    }
    return timestampToMs(timestamp);
  }
};
var WorkerHandler = class {
  constructor(worker) {
    this._worker = worker;
    this._id = 0;
  }
  /**
   * Ensure the worker is ready (or not).
   * This will either resolve when the worker is ready, or reject if an error occured.
   */
  ensureReady() {
    if (this._ensureReadyPromise) {
      return this._ensureReadyPromise;
    }
    this._ensureReadyPromise = new Promise((resolve2, reject) => {
      this._worker.addEventListener("message", ({
        data
      }) => {
        if (data.success) {
          resolve2();
        } else {
          reject();
        }
      }, {
        once: true
      });
      this._worker.addEventListener("error", (error) => {
        reject(error);
      }, {
        once: true
      });
    });
    return this._ensureReadyPromise;
  }
  /**
   * Destroy the worker.
   */
  destroy() {
    DEBUG_BUILD5 && logger2.info("Destroying compression worker");
    this._worker.terminate();
  }
  /**
   * Post message to worker and wait for response before resolving promise.
   */
  postMessage(method, arg) {
    const id = this._getAndIncrementId();
    return new Promise((resolve2, reject) => {
      const listener = ({
        data
      }) => {
        const response = data;
        if (response.method !== method) {
          return;
        }
        if (response.id !== id) {
          return;
        }
        this._worker.removeEventListener("message", listener);
        if (!response.success) {
          DEBUG_BUILD5 && logger2.error("Error in compression worker: ", response.response);
          reject(new Error("Error in compression worker"));
          return;
        }
        resolve2(response.response);
      };
      this._worker.addEventListener("message", listener);
      this._worker.postMessage({
        id,
        method,
        arg
      });
    });
  }
  /** Get the current ID and increment it for the next call. */
  _getAndIncrementId() {
    return this._id++;
  }
};
var EventBufferCompressionWorker = class {
  /** @inheritdoc */
  constructor(worker) {
    this._worker = new WorkerHandler(worker);
    this._earliestTimestamp = null;
    this._totalSize = 0;
    this.hasCheckout = false;
  }
  /** @inheritdoc */
  get hasEvents() {
    return !!this._earliestTimestamp;
  }
  /** @inheritdoc */
  get type() {
    return "worker";
  }
  /**
   * Ensure the worker is ready (or not).
   * This will either resolve when the worker is ready, or reject if an error occured.
   */
  ensureReady() {
    return this._worker.ensureReady();
  }
  /**
   * Destroy the event buffer.
   */
  destroy() {
    this._worker.destroy();
  }
  /**
   * Add an event to the event buffer.
   *
   * Returns true if event was successfuly received and processed by worker.
   */
  addEvent(event) {
    const timestamp = timestampToMs(event.timestamp);
    if (!this._earliestTimestamp || timestamp < this._earliestTimestamp) {
      this._earliestTimestamp = timestamp;
    }
    const data = JSON.stringify(event);
    this._totalSize += data.length;
    if (this._totalSize > REPLAY_MAX_EVENT_BUFFER_SIZE) {
      return Promise.reject(new EventBufferSizeExceededError());
    }
    return this._sendEventToWorker(data);
  }
  /**
   * Finish the event buffer and return the compressed data.
   */
  finish() {
    return this._finishRequest();
  }
  /** @inheritdoc */
  clear() {
    this._earliestTimestamp = null;
    this._totalSize = 0;
    this.hasCheckout = false;
    this._worker.postMessage("clear").then(null, (e3) => {
      DEBUG_BUILD5 && logger2.exception(e3, 'Sending "clear" message to worker failed', e3);
    });
  }
  /** @inheritdoc */
  getEarliestTimestamp() {
    return this._earliestTimestamp;
  }
  /**
   * Send the event to the worker.
   */
  _sendEventToWorker(data) {
    return this._worker.postMessage("addEvent", data);
  }
  /**
   * Finish the request and return the compressed data from the worker.
   */
  _finishRequest() {
    return __async(this, null, function* () {
      const response = yield this._worker.postMessage("finish");
      this._earliestTimestamp = null;
      this._totalSize = 0;
      return response;
    });
  }
};
var EventBufferProxy = class {
  constructor(worker) {
    this._fallback = new EventBufferArray();
    this._compression = new EventBufferCompressionWorker(worker);
    this._used = this._fallback;
    this._ensureWorkerIsLoadedPromise = this._ensureWorkerIsLoaded();
  }
  /** @inheritdoc */
  get type() {
    return this._used.type;
  }
  /** @inheritDoc */
  get hasEvents() {
    return this._used.hasEvents;
  }
  /** @inheritdoc */
  get hasCheckout() {
    return this._used.hasCheckout;
  }
  /** @inheritdoc */
  set hasCheckout(value) {
    this._used.hasCheckout = value;
  }
  /** @inheritDoc */
  destroy() {
    this._fallback.destroy();
    this._compression.destroy();
  }
  /** @inheritdoc */
  clear() {
    return this._used.clear();
  }
  /** @inheritdoc */
  getEarliestTimestamp() {
    return this._used.getEarliestTimestamp();
  }
  /**
   * Add an event to the event buffer.
   *
   * Returns true if event was successfully added.
   */
  addEvent(event) {
    return this._used.addEvent(event);
  }
  /** @inheritDoc */
  finish() {
    return __async(this, null, function* () {
      yield this.ensureWorkerIsLoaded();
      return this._used.finish();
    });
  }
  /** Ensure the worker has loaded. */
  ensureWorkerIsLoaded() {
    return this._ensureWorkerIsLoadedPromise;
  }
  /** Actually check if the worker has been loaded. */
  _ensureWorkerIsLoaded() {
    return __async(this, null, function* () {
      try {
        yield this._compression.ensureReady();
      } catch (error) {
        DEBUG_BUILD5 && logger2.exception(error, "Failed to load the compression worker, falling back to simple buffer");
        return;
      }
      yield this._switchToCompressionWorker();
    });
  }
  /** Switch the used buffer to the compression worker. */
  _switchToCompressionWorker() {
    return __async(this, null, function* () {
      const {
        events,
        hasCheckout
      } = this._fallback;
      const addEventPromises = [];
      for (const event of events) {
        addEventPromises.push(this._compression.addEvent(event));
      }
      this._compression.hasCheckout = hasCheckout;
      this._used = this._compression;
      try {
        yield Promise.all(addEventPromises);
        this._fallback.clear();
      } catch (error) {
        DEBUG_BUILD5 && logger2.exception(error, "Failed to add events when switching buffers.");
      }
    });
  }
};
function createEventBuffer({
  useCompression,
  workerUrl: customWorkerUrl
}) {
  if (useCompression && // eslint-disable-next-line no-restricted-globals
  window.Worker) {
    const worker = _loadWorker(customWorkerUrl);
    if (worker) {
      return worker;
    }
  }
  DEBUG_BUILD5 && logger2.info("Using simple buffer");
  return new EventBufferArray();
}
function _loadWorker(customWorkerUrl) {
  try {
    const workerUrl = customWorkerUrl || _getWorkerUrl();
    if (!workerUrl) {
      return;
    }
    DEBUG_BUILD5 && logger2.info(`Using compression worker${customWorkerUrl ? ` from ${customWorkerUrl}` : ""}`);
    const worker = new Worker(workerUrl);
    return new EventBufferProxy(worker);
  } catch (error) {
    DEBUG_BUILD5 && logger2.exception(error, "Failed to create compression worker");
  }
}
function _getWorkerUrl() {
  if (typeof __SENTRY_EXCLUDE_REPLAY_WORKER__ === "undefined" || !__SENTRY_EXCLUDE_REPLAY_WORKER__) {
    return e();
  }
  return "";
}
function hasSessionStorage() {
  try {
    return "sessionStorage" in WINDOW8 && !!WINDOW8.sessionStorage;
  } catch (e3) {
    return false;
  }
}
function clearSession(replay) {
  deleteSession();
  replay.session = void 0;
}
function deleteSession() {
  if (!hasSessionStorage()) {
    return;
  }
  try {
    WINDOW8.sessionStorage.removeItem(REPLAY_SESSION_KEY);
  } catch (e3) {
  }
}
function isSampled(sampleRate) {
  if (sampleRate === void 0) {
    return false;
  }
  return Math.random() < sampleRate;
}
function makeSession2(session) {
  const now = Date.now();
  const id = session.id || uuid4();
  const started = session.started || now;
  const lastActivity = session.lastActivity || now;
  const segmentId = session.segmentId || 0;
  const sampled = session.sampled;
  const previousSessionId = session.previousSessionId;
  return {
    id,
    started,
    lastActivity,
    segmentId,
    sampled,
    previousSessionId
  };
}
function saveSession(session) {
  if (!hasSessionStorage()) {
    return;
  }
  try {
    WINDOW8.sessionStorage.setItem(REPLAY_SESSION_KEY, JSON.stringify(session));
  } catch (e3) {
  }
}
function getSessionSampleType(sessionSampleRate, allowBuffering) {
  return isSampled(sessionSampleRate) ? "session" : allowBuffering ? "buffer" : false;
}
function createSession({
  sessionSampleRate,
  allowBuffering,
  stickySession = false
}, {
  previousSessionId
} = {}) {
  const sampled = getSessionSampleType(sessionSampleRate, allowBuffering);
  const session = makeSession2({
    sampled,
    previousSessionId
  });
  if (stickySession) {
    saveSession(session);
  }
  return session;
}
function fetchSession() {
  if (!hasSessionStorage()) {
    return null;
  }
  try {
    const sessionStringFromStorage = WINDOW8.sessionStorage.getItem(REPLAY_SESSION_KEY);
    if (!sessionStringFromStorage) {
      return null;
    }
    const sessionObj = JSON.parse(sessionStringFromStorage);
    DEBUG_BUILD5 && logger2.infoTick("Loading existing session");
    return makeSession2(sessionObj);
  } catch (e3) {
    return null;
  }
}
function isExpired(initialTime, expiry, targetTime = +/* @__PURE__ */ new Date()) {
  if (initialTime === null || expiry === void 0 || expiry < 0) {
    return true;
  }
  if (expiry === 0) {
    return false;
  }
  return initialTime + expiry <= targetTime;
}
function isSessionExpired(session, {
  maxReplayDuration,
  sessionIdleExpire,
  targetTime = Date.now()
}) {
  return (
    // First, check that maximum session length has not been exceeded
    isExpired(session.started, maxReplayDuration, targetTime) || // check that the idle timeout has not been exceeded (i.e. user has
    // performed an action within the last `sessionIdleExpire` ms)
    isExpired(session.lastActivity, sessionIdleExpire, targetTime)
  );
}
function shouldRefreshSession(session, {
  sessionIdleExpire,
  maxReplayDuration
}) {
  if (!isSessionExpired(session, {
    sessionIdleExpire,
    maxReplayDuration
  })) {
    return false;
  }
  if (session.sampled === "buffer" && session.segmentId === 0) {
    return false;
  }
  return true;
}
function loadOrCreateSession({
  sessionIdleExpire,
  maxReplayDuration,
  previousSessionId
}, sessionOptions) {
  const existingSession = sessionOptions.stickySession && fetchSession();
  if (!existingSession) {
    DEBUG_BUILD5 && logger2.infoTick("Creating new session");
    return createSession(sessionOptions, {
      previousSessionId
    });
  }
  if (!shouldRefreshSession(existingSession, {
    sessionIdleExpire,
    maxReplayDuration
  })) {
    return existingSession;
  }
  DEBUG_BUILD5 && logger2.infoTick("Session in sessionStorage is expired, creating new one...");
  return createSession(sessionOptions, {
    previousSessionId: existingSession.id
  });
}
function isCustomEvent(event) {
  return event.type === EventType.Custom;
}
function addEventSync(replay, event, isCheckout) {
  if (!shouldAddEvent(replay, event)) {
    return false;
  }
  _addEvent(replay, event, isCheckout);
  return true;
}
function addEvent(replay, event, isCheckout) {
  if (!shouldAddEvent(replay, event)) {
    return Promise.resolve(null);
  }
  return _addEvent(replay, event, isCheckout);
}
function _addEvent(replay, event, isCheckout) {
  return __async(this, null, function* () {
    if (!replay.eventBuffer) {
      return null;
    }
    try {
      if (isCheckout && replay.recordingMode === "buffer") {
        replay.eventBuffer.clear();
      }
      if (isCheckout) {
        replay.eventBuffer.hasCheckout = true;
      }
      const replayOptions = replay.getOptions();
      const eventAfterPossibleCallback = maybeApplyCallback(event, replayOptions.beforeAddRecordingEvent);
      if (!eventAfterPossibleCallback) {
        return;
      }
      return yield replay.eventBuffer.addEvent(eventAfterPossibleCallback);
    } catch (error) {
      const reason = error && error instanceof EventBufferSizeExceededError ? "addEventSizeExceeded" : "addEvent";
      replay.handleException(error);
      yield replay.stop({
        reason
      });
      const client = getClient();
      if (client) {
        client.recordDroppedEvent("internal_sdk_error", "replay");
      }
    }
  });
}
function shouldAddEvent(replay, event) {
  if (!replay.eventBuffer || replay.isPaused() || !replay.isEnabled()) {
    return false;
  }
  const timestampInMs = timestampToMs(event.timestamp);
  if (timestampInMs + replay.timeouts.sessionIdlePause < Date.now()) {
    return false;
  }
  if (timestampInMs > replay.getContext().initialTimestamp + replay.getOptions().maxReplayDuration) {
    DEBUG_BUILD5 && logger2.infoTick(`Skipping event with timestamp ${timestampInMs} because it is after maxReplayDuration`);
    return false;
  }
  return true;
}
function maybeApplyCallback(event, callback) {
  try {
    if (typeof callback === "function" && isCustomEvent(event)) {
      return callback(event);
    }
  } catch (error) {
    DEBUG_BUILD5 && logger2.exception(error, "An error occured in the `beforeAddRecordingEvent` callback, skipping the event...");
    return null;
  }
  return event;
}
function isErrorEvent3(event) {
  return !event.type;
}
function isTransactionEvent2(event) {
  return event.type === "transaction";
}
function isReplayEvent(event) {
  return event.type === "replay_event";
}
function isFeedbackEvent(event) {
  return event.type === "feedback";
}
function handleAfterSendEvent(replay) {
  return (event, sendResponse) => {
    if (!replay.isEnabled() || !isErrorEvent3(event) && !isTransactionEvent2(event)) {
      return;
    }
    const statusCode = sendResponse && sendResponse.statusCode;
    if (!statusCode || statusCode < 200 || statusCode >= 300) {
      return;
    }
    if (isTransactionEvent2(event)) {
      handleTransactionEvent(replay, event);
      return;
    }
    handleErrorEvent(replay, event);
  };
}
function handleTransactionEvent(replay, event) {
  const replayContext = replay.getContext();
  if (event.contexts && event.contexts.trace && event.contexts.trace.trace_id && replayContext.traceIds.size < 100) {
    replayContext.traceIds.add(event.contexts.trace.trace_id);
  }
}
function handleErrorEvent(replay, event) {
  const replayContext = replay.getContext();
  if (event.event_id && replayContext.errorIds.size < 100) {
    replayContext.errorIds.add(event.event_id);
  }
  if (replay.recordingMode !== "buffer" || !event.tags || !event.tags.replayId) {
    return;
  }
  const {
    beforeErrorSampling
  } = replay.getOptions();
  if (typeof beforeErrorSampling === "function" && !beforeErrorSampling(event)) {
    return;
  }
  setTimeout2(() => __async(this, null, function* () {
    try {
      yield replay.sendBufferedReplayOrFlush();
    } catch (err) {
      replay.handleException(err);
    }
  }));
}
function handleBeforeSendEvent(replay) {
  return (event) => {
    if (!replay.isEnabled() || !isErrorEvent3(event)) {
      return;
    }
    handleHydrationError(replay, event);
  };
}
function handleHydrationError(replay, event) {
  const exceptionValue = event.exception && event.exception.values && event.exception.values[0] && event.exception.values[0].value;
  if (typeof exceptionValue !== "string") {
    return;
  }
  if (
    // Only matches errors in production builds of react-dom
    // Example https://reactjs.org/docs/error-decoder.html?invariant=423
    // With newer React versions, the messages changed to a different website https://react.dev/errors/418
    exceptionValue.match(/(reactjs\.org\/docs\/error-decoder\.html\?invariant=|react\.dev\/errors\/)(418|419|422|423|425)/) || // Development builds of react-dom
    // Error 1: Hydration failed because the initial UI does not match what was rendered on the server.
    // Error 2: Text content does not match server-rendered HTML. Warning: Text content did not match.
    exceptionValue.match(/(does not match server-rendered HTML|Hydration failed because)/i)
  ) {
    const breadcrumb = createBreadcrumb({
      category: "replay.hydrate-error",
      data: {
        url: getLocationHref()
      }
    });
    addBreadcrumbEvent(replay, breadcrumb);
  }
}
function handleBreadcrumbs(replay) {
  const client = getClient();
  if (!client) {
    return;
  }
  client.on("beforeAddBreadcrumb", (breadcrumb) => beforeAddBreadcrumb(replay, breadcrumb));
}
function beforeAddBreadcrumb(replay, breadcrumb) {
  if (!replay.isEnabled() || !isBreadcrumbWithCategory(breadcrumb)) {
    return;
  }
  const result = normalizeBreadcrumb(breadcrumb);
  if (result) {
    addBreadcrumbEvent(replay, result);
  }
}
function normalizeBreadcrumb(breadcrumb) {
  if (!isBreadcrumbWithCategory(breadcrumb) || [
    // fetch & xhr are handled separately,in handleNetworkBreadcrumbs
    "fetch",
    "xhr",
    // These two are breadcrumbs for emitted sentry events, we don't care about them
    "sentry.event",
    "sentry.transaction"
  ].includes(breadcrumb.category) || // We capture UI breadcrumbs separately
  breadcrumb.category.startsWith("ui.")) {
    return null;
  }
  if (breadcrumb.category === "console") {
    return normalizeConsoleBreadcrumb(breadcrumb);
  }
  return createBreadcrumb(breadcrumb);
}
function normalizeConsoleBreadcrumb(breadcrumb) {
  const args = breadcrumb.data && breadcrumb.data.arguments;
  if (!Array.isArray(args) || args.length === 0) {
    return createBreadcrumb(breadcrumb);
  }
  let isTruncated = false;
  const normalizedArgs = args.map((arg) => {
    if (!arg) {
      return arg;
    }
    if (typeof arg === "string") {
      if (arg.length > CONSOLE_ARG_MAX_SIZE) {
        isTruncated = true;
        return `${arg.slice(0, CONSOLE_ARG_MAX_SIZE)}…`;
      }
      return arg;
    }
    if (typeof arg === "object") {
      try {
        const normalizedArg = normalize(arg, 7);
        const stringified = JSON.stringify(normalizedArg);
        if (stringified.length > CONSOLE_ARG_MAX_SIZE) {
          isTruncated = true;
          return `${JSON.stringify(normalizedArg, null, 2).slice(0, CONSOLE_ARG_MAX_SIZE)}…`;
        }
        return normalizedArg;
      } catch (e3) {
      }
    }
    return arg;
  });
  return createBreadcrumb(__spreadProps(__spreadValues({}, breadcrumb), {
    data: __spreadValues(__spreadProps(__spreadValues({}, breadcrumb.data), {
      arguments: normalizedArgs
    }), isTruncated ? {
      _meta: {
        warnings: ["CONSOLE_ARG_TRUNCATED"]
      }
    } : {})
  }));
}
function isBreadcrumbWithCategory(breadcrumb) {
  return !!breadcrumb.category;
}
function isRrwebError(event, hint) {
  if (event.type || !event.exception || !event.exception.values || !event.exception.values.length) {
    return false;
  }
  if (hint.originalException && hint.originalException.__rrweb__) {
    return true;
  }
  return false;
}
function addFeedbackBreadcrumb(replay, event) {
  replay.triggerUserActivity();
  replay.addUpdate(() => {
    if (!event.timestamp) {
      return true;
    }
    replay.throttledAddEvent({
      type: EventType.Custom,
      timestamp: event.timestamp * 1e3,
      data: {
        tag: "breadcrumb",
        payload: {
          timestamp: event.timestamp,
          type: "default",
          category: "sentry.feedback",
          data: {
            feedbackId: event.event_id
          }
        }
      }
    });
    return false;
  });
}
function shouldSampleForBufferEvent(replay, event) {
  if (replay.recordingMode !== "buffer") {
    return false;
  }
  if (event.message === UNABLE_TO_SEND_REPLAY) {
    return false;
  }
  if (!event.exception || event.type) {
    return false;
  }
  return isSampled(replay.getOptions().errorSampleRate);
}
function handleGlobalEventListener(replay) {
  return Object.assign((event, hint) => {
    if (!replay.isEnabled() || replay.isPaused()) {
      return event;
    }
    if (isReplayEvent(event)) {
      delete event.breadcrumbs;
      return event;
    }
    if (!isErrorEvent3(event) && !isTransactionEvent2(event) && !isFeedbackEvent(event)) {
      return event;
    }
    const isSessionActive = replay.checkAndHandleExpiredSession();
    if (!isSessionActive) {
      return event;
    }
    if (isFeedbackEvent(event)) {
      replay.flush();
      event.contexts.feedback.replay_id = replay.getSessionId();
      addFeedbackBreadcrumb(replay, event);
      return event;
    }
    if (isRrwebError(event, hint) && !replay.getOptions()._experiments.captureExceptions) {
      DEBUG_BUILD5 && logger2.log("Ignoring error from rrweb internals", event);
      return null;
    }
    const isErrorEventSampled = shouldSampleForBufferEvent(replay, event);
    const shouldTagReplayId = isErrorEventSampled || replay.recordingMode === "session";
    if (shouldTagReplayId) {
      event.tags = __spreadProps(__spreadValues({}, event.tags), {
        replayId: replay.getSessionId()
      });
    }
    return event;
  }, {
    id: "Replay"
  });
}
function createPerformanceSpans(replay, entries) {
  return entries.map(({
    type,
    start,
    end,
    name,
    data
  }) => {
    const response = replay.throttledAddEvent({
      type: EventType.Custom,
      timestamp: start,
      data: {
        tag: "performanceSpan",
        payload: {
          op: type,
          description: name,
          startTimestamp: start,
          endTimestamp: end,
          data
        }
      }
    });
    return typeof response === "string" ? Promise.resolve(null) : response;
  });
}
function handleHistory(handlerData) {
  const {
    from,
    to
  } = handlerData;
  const now = Date.now() / 1e3;
  return {
    type: "navigation.push",
    start: now,
    end: now,
    name: to,
    data: {
      previous: from
    }
  };
}
function handleHistorySpanListener(replay) {
  return (handlerData) => {
    if (!replay.isEnabled()) {
      return;
    }
    const result = handleHistory(handlerData);
    if (result === null) {
      return;
    }
    replay.getContext().urls.push(result.name);
    replay.triggerUserActivity();
    replay.addUpdate(() => {
      createPerformanceSpans(replay, [result]);
      return false;
    });
  };
}
function shouldFilterRequest(replay, url) {
  if (DEBUG_BUILD5 && replay.getOptions()._experiments.traceInternals) {
    return false;
  }
  return isSentryRequestUrl(url, getClient());
}
function addNetworkBreadcrumb(replay, result) {
  if (!replay.isEnabled()) {
    return;
  }
  if (result === null) {
    return;
  }
  if (shouldFilterRequest(replay, result.name)) {
    return;
  }
  replay.addUpdate(() => {
    createPerformanceSpans(replay, [result]);
    return true;
  });
}
function getBodySize(body) {
  if (!body) {
    return void 0;
  }
  const textEncoder = new TextEncoder();
  try {
    if (typeof body === "string") {
      return textEncoder.encode(body).length;
    }
    if (body instanceof URLSearchParams) {
      return textEncoder.encode(body.toString()).length;
    }
    if (body instanceof FormData) {
      const formDataStr = _serializeFormData(body);
      return textEncoder.encode(formDataStr).length;
    }
    if (body instanceof Blob) {
      return body.size;
    }
    if (body instanceof ArrayBuffer) {
      return body.byteLength;
    }
  } catch (e3) {
  }
  return void 0;
}
function parseContentLengthHeader(header) {
  if (!header) {
    return void 0;
  }
  const size = parseInt(header, 10);
  return isNaN(size) ? void 0 : size;
}
function getBodyString(body) {
  try {
    if (typeof body === "string") {
      return [body];
    }
    if (body instanceof URLSearchParams) {
      return [body.toString()];
    }
    if (body instanceof FormData) {
      return [_serializeFormData(body)];
    }
    if (!body) {
      return [void 0];
    }
  } catch (error) {
    DEBUG_BUILD5 && logger2.exception(error, "Failed to serialize body", body);
    return [void 0, "BODY_PARSE_ERROR"];
  }
  DEBUG_BUILD5 && logger2.info("Skipping network body because of body type", body);
  return [void 0, "UNPARSEABLE_BODY_TYPE"];
}
function mergeWarning(info, warning) {
  if (!info) {
    return {
      headers: {},
      size: void 0,
      _meta: {
        warnings: [warning]
      }
    };
  }
  const newMeta = __spreadValues({}, info._meta);
  const existingWarnings = newMeta.warnings || [];
  newMeta.warnings = [...existingWarnings, warning];
  info._meta = newMeta;
  return info;
}
function makeNetworkReplayBreadcrumb(type, data) {
  if (!data) {
    return null;
  }
  const {
    startTimestamp,
    endTimestamp,
    url,
    method,
    statusCode,
    request,
    response
  } = data;
  const result = {
    type,
    start: startTimestamp / 1e3,
    end: endTimestamp / 1e3,
    name: url,
    data: dropUndefinedKeys({
      method,
      statusCode,
      request,
      response
    })
  };
  return result;
}
function buildSkippedNetworkRequestOrResponse(bodySize) {
  return {
    headers: {},
    size: bodySize,
    _meta: {
      warnings: ["URL_SKIPPED"]
    }
  };
}
function buildNetworkRequestOrResponse(headers, bodySize, body) {
  if (!bodySize && Object.keys(headers).length === 0) {
    return void 0;
  }
  if (!bodySize) {
    return {
      headers
    };
  }
  if (!body) {
    return {
      headers,
      size: bodySize
    };
  }
  const info = {
    headers,
    size: bodySize
  };
  const {
    body: normalizedBody,
    warnings
  } = normalizeNetworkBody(body);
  info.body = normalizedBody;
  if (warnings && warnings.length > 0) {
    info._meta = {
      warnings
    };
  }
  return info;
}
function getAllowedHeaders(headers, allowedHeaders) {
  return Object.entries(headers).reduce((filteredHeaders, [key, value]) => {
    const normalizedKey = key.toLowerCase();
    if (allowedHeaders.includes(normalizedKey) && headers[key]) {
      filteredHeaders[normalizedKey] = value;
    }
    return filteredHeaders;
  }, {});
}
function _serializeFormData(formData) {
  return new URLSearchParams(formData).toString();
}
function normalizeNetworkBody(body) {
  if (!body || typeof body !== "string") {
    return {
      body
    };
  }
  const exceedsSizeLimit = body.length > NETWORK_BODY_MAX_SIZE;
  const isProbablyJson = _strIsProbablyJson(body);
  if (exceedsSizeLimit) {
    const truncatedBody = body.slice(0, NETWORK_BODY_MAX_SIZE);
    if (isProbablyJson) {
      return {
        body: truncatedBody,
        warnings: ["MAYBE_JSON_TRUNCATED"]
      };
    }
    return {
      body: `${truncatedBody}…`,
      warnings: ["TEXT_TRUNCATED"]
    };
  }
  if (isProbablyJson) {
    try {
      const jsonBody = JSON.parse(body);
      return {
        body: jsonBody
      };
    } catch (e22) {
    }
  }
  return {
    body
  };
}
function _strIsProbablyJson(str) {
  const first = str[0];
  const last = str[str.length - 1];
  return first === "[" && last === "]" || first === "{" && last === "}";
}
function urlMatches(url, urls) {
  const fullUrl = getFullUrl(url);
  return stringMatchesSomePattern(fullUrl, urls);
}
function getFullUrl(url, baseURI = WINDOW8.document.baseURI) {
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith(WINDOW8.location.origin)) {
    return url;
  }
  const fixedUrl = new URL(url, baseURI);
  if (fixedUrl.origin !== new URL(baseURI).origin) {
    return url;
  }
  const fullUrl = fixedUrl.href;
  if (!url.endsWith("/") && fullUrl.endsWith("/")) {
    return fullUrl.slice(0, -1);
  }
  return fullUrl;
}
function captureFetchBreadcrumbToReplay(breadcrumb, hint, options) {
  return __async(this, null, function* () {
    try {
      const data = yield _prepareFetchData(breadcrumb, hint, options);
      const result = makeNetworkReplayBreadcrumb("resource.fetch", data);
      addNetworkBreadcrumb(options.replay, result);
    } catch (error) {
      DEBUG_BUILD5 && logger2.exception(error, "Failed to capture fetch breadcrumb");
    }
  });
}
function enrichFetchBreadcrumb(breadcrumb, hint) {
  const {
    input,
    response
  } = hint;
  const body = input ? _getFetchRequestArgBody(input) : void 0;
  const reqSize = getBodySize(body);
  const resSize = response ? parseContentLengthHeader(response.headers.get("content-length")) : void 0;
  if (reqSize !== void 0) {
    breadcrumb.data.request_body_size = reqSize;
  }
  if (resSize !== void 0) {
    breadcrumb.data.response_body_size = resSize;
  }
}
function _prepareFetchData(breadcrumb, hint, options) {
  return __async(this, null, function* () {
    const now = Date.now();
    const {
      startTimestamp = now,
      endTimestamp = now
    } = hint;
    const {
      url,
      method,
      status_code: statusCode = 0,
      request_body_size: requestBodySize,
      response_body_size: responseBodySize
    } = breadcrumb.data;
    const captureDetails = urlMatches(url, options.networkDetailAllowUrls) && !urlMatches(url, options.networkDetailDenyUrls);
    const request = captureDetails ? _getRequestInfo(options, hint.input, requestBodySize) : buildSkippedNetworkRequestOrResponse(requestBodySize);
    const response = yield _getResponseInfo(captureDetails, options, hint.response, responseBodySize);
    return {
      startTimestamp,
      endTimestamp,
      url,
      method,
      statusCode,
      request,
      response
    };
  });
}
function _getRequestInfo({
  networkCaptureBodies,
  networkRequestHeaders
}, input, requestBodySize) {
  const headers = input ? getRequestHeaders(input, networkRequestHeaders) : {};
  if (!networkCaptureBodies) {
    return buildNetworkRequestOrResponse(headers, requestBodySize, void 0);
  }
  const requestBody = _getFetchRequestArgBody(input);
  const [bodyStr, warning] = getBodyString(requestBody);
  const data = buildNetworkRequestOrResponse(headers, requestBodySize, bodyStr);
  if (warning) {
    return mergeWarning(data, warning);
  }
  return data;
}
function _getResponseInfo(_0, _1, _2, _3) {
  return __async(this, arguments, function* (captureDetails, {
    networkCaptureBodies,
    networkResponseHeaders
  }, response, responseBodySize) {
    if (!captureDetails && responseBodySize !== void 0) {
      return buildSkippedNetworkRequestOrResponse(responseBodySize);
    }
    const headers = response ? getAllHeaders(response.headers, networkResponseHeaders) : {};
    if (!response || !networkCaptureBodies && responseBodySize !== void 0) {
      return buildNetworkRequestOrResponse(headers, responseBodySize, void 0);
    }
    const [bodyText, warning] = yield _parseFetchResponseBody(response);
    const result = getResponseData(bodyText, {
      networkCaptureBodies,
      responseBodySize,
      captureDetails,
      headers
    });
    if (warning) {
      return mergeWarning(result, warning);
    }
    return result;
  });
}
function getResponseData(bodyText, {
  networkCaptureBodies,
  responseBodySize,
  captureDetails,
  headers
}) {
  try {
    const size = bodyText && bodyText.length && responseBodySize === void 0 ? getBodySize(bodyText) : responseBodySize;
    if (!captureDetails) {
      return buildSkippedNetworkRequestOrResponse(size);
    }
    if (networkCaptureBodies) {
      return buildNetworkRequestOrResponse(headers, size, bodyText);
    }
    return buildNetworkRequestOrResponse(headers, size, void 0);
  } catch (error) {
    DEBUG_BUILD5 && logger2.exception(error, "Failed to serialize response body");
    return buildNetworkRequestOrResponse(headers, responseBodySize, void 0);
  }
}
function _parseFetchResponseBody(response) {
  return __async(this, null, function* () {
    const res = _tryCloneResponse(response);
    if (!res) {
      return [void 0, "BODY_PARSE_ERROR"];
    }
    try {
      const text = yield _tryGetResponseText(res);
      return [text];
    } catch (error) {
      if (error instanceof Error && error.message.indexOf("Timeout") > -1) {
        DEBUG_BUILD5 && logger2.warn("Parsing text body from response timed out");
        return [void 0, "BODY_PARSE_TIMEOUT"];
      }
      DEBUG_BUILD5 && logger2.exception(error, "Failed to get text body from response");
      return [void 0, "BODY_PARSE_ERROR"];
    }
  });
}
function _getFetchRequestArgBody(fetchArgs = []) {
  if (fetchArgs.length !== 2 || typeof fetchArgs[1] !== "object") {
    return void 0;
  }
  return fetchArgs[1].body;
}
function getAllHeaders(headers, allowedHeaders) {
  const allHeaders = {};
  allowedHeaders.forEach((header) => {
    if (headers.get(header)) {
      allHeaders[header] = headers.get(header);
    }
  });
  return allHeaders;
}
function getRequestHeaders(fetchArgs, allowedHeaders) {
  if (fetchArgs.length === 1 && typeof fetchArgs[0] !== "string") {
    return getHeadersFromOptions(fetchArgs[0], allowedHeaders);
  }
  if (fetchArgs.length === 2) {
    return getHeadersFromOptions(fetchArgs[1], allowedHeaders);
  }
  return {};
}
function getHeadersFromOptions(input, allowedHeaders) {
  if (!input) {
    return {};
  }
  const headers = input.headers;
  if (!headers) {
    return {};
  }
  if (headers instanceof Headers) {
    return getAllHeaders(headers, allowedHeaders);
  }
  if (Array.isArray(headers)) {
    return {};
  }
  return getAllowedHeaders(headers, allowedHeaders);
}
function _tryCloneResponse(response) {
  try {
    return response.clone();
  } catch (error) {
    DEBUG_BUILD5 && logger2.exception(error, "Failed to clone response body");
  }
}
function _tryGetResponseText(response) {
  return new Promise((resolve2, reject) => {
    const timeout = setTimeout2(() => reject(new Error("Timeout while trying to read response body")), 500);
    _getResponseText(response).then((txt) => resolve2(txt), (reason) => reject(reason)).finally(() => clearTimeout(timeout));
  });
}
function _getResponseText(response) {
  return __async(this, null, function* () {
    return yield response.text();
  });
}
function captureXhrBreadcrumbToReplay(breadcrumb, hint, options) {
  return __async(this, null, function* () {
    try {
      const data = _prepareXhrData(breadcrumb, hint, options);
      const result = makeNetworkReplayBreadcrumb("resource.xhr", data);
      addNetworkBreadcrumb(options.replay, result);
    } catch (error) {
      DEBUG_BUILD5 && logger2.exception(error, "Failed to capture xhr breadcrumb");
    }
  });
}
function enrichXhrBreadcrumb(breadcrumb, hint) {
  const {
    xhr,
    input
  } = hint;
  if (!xhr) {
    return;
  }
  const reqSize = getBodySize(input);
  const resSize = xhr.getResponseHeader("content-length") ? parseContentLengthHeader(xhr.getResponseHeader("content-length")) : _getBodySize(xhr.response, xhr.responseType);
  if (reqSize !== void 0) {
    breadcrumb.data.request_body_size = reqSize;
  }
  if (resSize !== void 0) {
    breadcrumb.data.response_body_size = resSize;
  }
}
function _prepareXhrData(breadcrumb, hint, options) {
  const now = Date.now();
  const {
    startTimestamp = now,
    endTimestamp = now,
    input,
    xhr
  } = hint;
  const {
    url,
    method,
    status_code: statusCode = 0,
    request_body_size: requestBodySize,
    response_body_size: responseBodySize
  } = breadcrumb.data;
  if (!url) {
    return null;
  }
  if (!xhr || !urlMatches(url, options.networkDetailAllowUrls) || urlMatches(url, options.networkDetailDenyUrls)) {
    const request2 = buildSkippedNetworkRequestOrResponse(requestBodySize);
    const response2 = buildSkippedNetworkRequestOrResponse(responseBodySize);
    return {
      startTimestamp,
      endTimestamp,
      url,
      method,
      statusCode,
      request: request2,
      response: response2
    };
  }
  const xhrInfo = xhr[SENTRY_XHR_DATA_KEY];
  const networkRequestHeaders = xhrInfo ? getAllowedHeaders(xhrInfo.request_headers, options.networkRequestHeaders) : {};
  const networkResponseHeaders = getAllowedHeaders(getResponseHeaders(xhr), options.networkResponseHeaders);
  const [requestBody, requestWarning] = options.networkCaptureBodies ? getBodyString(input) : [void 0];
  const [responseBody, responseWarning] = options.networkCaptureBodies ? _getXhrResponseBody(xhr) : [void 0];
  const request = buildNetworkRequestOrResponse(networkRequestHeaders, requestBodySize, requestBody);
  const response = buildNetworkRequestOrResponse(networkResponseHeaders, responseBodySize, responseBody);
  return {
    startTimestamp,
    endTimestamp,
    url,
    method,
    statusCode,
    request: requestWarning ? mergeWarning(request, requestWarning) : request,
    response: responseWarning ? mergeWarning(response, responseWarning) : response
  };
}
function getResponseHeaders(xhr) {
  const headers = xhr.getAllResponseHeaders();
  if (!headers) {
    return {};
  }
  return headers.split("\r\n").reduce((acc, line) => {
    const [key, value] = line.split(": ");
    if (value) {
      acc[key.toLowerCase()] = value;
    }
    return acc;
  }, {});
}
function _getXhrResponseBody(xhr) {
  const errors = [];
  try {
    return [xhr.responseText];
  } catch (e3) {
    errors.push(e3);
  }
  try {
    return _parseXhrResponse(xhr.response, xhr.responseType);
  } catch (e3) {
    errors.push(e3);
  }
  DEBUG_BUILD5 && logger2.warn("Failed to get xhr response body", ...errors);
  return [void 0];
}
function _parseXhrResponse(body, responseType) {
  try {
    if (typeof body === "string") {
      return [body];
    }
    if (body instanceof Document) {
      return [body.body.outerHTML];
    }
    if (responseType === "json" && body && typeof body === "object") {
      return [JSON.stringify(body)];
    }
    if (!body) {
      return [void 0];
    }
  } catch (error) {
    DEBUG_BUILD5 && logger2.exception(error, "Failed to serialize body", body);
    return [void 0, "BODY_PARSE_ERROR"];
  }
  DEBUG_BUILD5 && logger2.info("Skipping network body because of body type", body);
  return [void 0, "UNPARSEABLE_BODY_TYPE"];
}
function _getBodySize(body, responseType) {
  try {
    const bodyStr = responseType === "json" && body && typeof body === "object" ? JSON.stringify(body) : body;
    return getBodySize(bodyStr);
  } catch (e22) {
    return void 0;
  }
}
function handleNetworkBreadcrumbs(replay) {
  const client = getClient();
  try {
    const {
      networkDetailAllowUrls,
      networkDetailDenyUrls,
      networkCaptureBodies,
      networkRequestHeaders,
      networkResponseHeaders
    } = replay.getOptions();
    const options = {
      replay,
      networkDetailAllowUrls,
      networkDetailDenyUrls,
      networkCaptureBodies,
      networkRequestHeaders,
      networkResponseHeaders
    };
    if (client) {
      client.on("beforeAddBreadcrumb", (breadcrumb, hint) => beforeAddNetworkBreadcrumb(options, breadcrumb, hint));
    }
  } catch (e22) {
  }
}
function beforeAddNetworkBreadcrumb(options, breadcrumb, hint) {
  if (!breadcrumb.data) {
    return;
  }
  try {
    if (_isXhrBreadcrumb(breadcrumb) && _isXhrHint(hint)) {
      enrichXhrBreadcrumb(breadcrumb, hint);
      captureXhrBreadcrumbToReplay(breadcrumb, hint, options);
    }
    if (_isFetchBreadcrumb(breadcrumb) && _isFetchHint(hint)) {
      enrichFetchBreadcrumb(breadcrumb, hint);
      captureFetchBreadcrumbToReplay(breadcrumb, hint, options);
    }
  } catch (e3) {
    DEBUG_BUILD5 && logger2.exception(e3, "Error when enriching network breadcrumb");
  }
}
function _isXhrBreadcrumb(breadcrumb) {
  return breadcrumb.category === "xhr";
}
function _isFetchBreadcrumb(breadcrumb) {
  return breadcrumb.category === "fetch";
}
function _isXhrHint(hint) {
  return hint && hint.xhr;
}
function _isFetchHint(hint) {
  return hint && hint.response;
}
function addGlobalListeners(replay) {
  const client = getClient();
  addClickKeypressInstrumentationHandler(handleDomListener(replay));
  addHistoryInstrumentationHandler(handleHistorySpanListener(replay));
  handleBreadcrumbs(replay);
  handleNetworkBreadcrumbs(replay);
  const eventProcessor = handleGlobalEventListener(replay);
  addEventProcessor(eventProcessor);
  if (client) {
    client.on("beforeSendEvent", handleBeforeSendEvent(replay));
    client.on("afterSendEvent", handleAfterSendEvent(replay));
    client.on("createDsc", (dsc) => {
      const replayId = replay.getSessionId();
      if (replayId && replay.isEnabled() && replay.recordingMode === "session") {
        const isSessionActive = replay.checkAndHandleExpiredSession();
        if (isSessionActive) {
          dsc.replay_id = replayId;
        }
      }
    });
    client.on("spanStart", (span) => {
      replay.lastActiveSpan = span;
    });
    client.on("spanEnd", (span) => {
      replay.lastActiveSpan = span;
    });
    client.on("beforeSendFeedback", (feedbackEvent, options) => {
      const replayId = replay.getSessionId();
      if (options && options.includeReplay && replay.isEnabled() && replayId) {
        if (feedbackEvent.contexts && feedbackEvent.contexts.feedback) {
          feedbackEvent.contexts.feedback.replay_id = replayId;
        }
      }
    });
  }
}
function addMemoryEntry(replay) {
  return __async(this, null, function* () {
    try {
      return Promise.all(createPerformanceSpans(replay, [
        // @ts-expect-error memory doesn't exist on type Performance as the API is non-standard (we check that it exists above)
        createMemoryEntry(WINDOW8.performance.memory)
      ]));
    } catch (error) {
      return [];
    }
  });
}
function createMemoryEntry(memoryEntry) {
  const {
    jsHeapSizeLimit,
    totalJSHeapSize,
    usedJSHeapSize
  } = memoryEntry;
  const time = Date.now() / 1e3;
  return {
    type: "memory",
    name: "memory",
    start: time,
    end: time,
    data: {
      memory: {
        jsHeapSizeLimit,
        totalJSHeapSize,
        usedJSHeapSize
      }
    }
  };
}
function debounce(func, wait, options) {
  let callbackReturnValue;
  let timerId;
  let maxTimerId;
  const maxWait = options && options.maxWait ? Math.max(options.maxWait, wait) : 0;
  function invokeFunc() {
    cancelTimers();
    callbackReturnValue = func();
    return callbackReturnValue;
  }
  function cancelTimers() {
    timerId !== void 0 && clearTimeout(timerId);
    maxTimerId !== void 0 && clearTimeout(maxTimerId);
    timerId = maxTimerId = void 0;
  }
  function flush2() {
    if (timerId !== void 0 || maxTimerId !== void 0) {
      return invokeFunc();
    }
    return callbackReturnValue;
  }
  function debounced() {
    if (timerId) {
      clearTimeout(timerId);
    }
    timerId = setTimeout2(invokeFunc, wait);
    if (maxWait && maxTimerId === void 0) {
      maxTimerId = setTimeout2(invokeFunc, maxWait);
    }
    return callbackReturnValue;
  }
  debounced.cancel = cancelTimers;
  debounced.flush = flush2;
  return debounced;
}
function getHandleRecordingEmit(replay) {
  let hadFirstEvent = false;
  return (event, _isCheckout) => {
    if (!replay.checkAndHandleExpiredSession()) {
      DEBUG_BUILD5 && logger2.warn("Received replay event after session expired.");
      return;
    }
    const isCheckout = _isCheckout || !hadFirstEvent;
    hadFirstEvent = true;
    if (replay.clickDetector) {
      updateClickDetectorForRecordingEvent(replay.clickDetector, event);
    }
    replay.addUpdate(() => {
      if (replay.recordingMode === "buffer" && isCheckout) {
        replay.setInitialState();
      }
      if (!addEventSync(replay, event, isCheckout)) {
        return true;
      }
      if (!isCheckout) {
        return false;
      }
      const session = replay.session;
      addSettingsEvent(replay, isCheckout);
      if (replay.recordingMode === "buffer" && session && replay.eventBuffer) {
        const earliestEvent = replay.eventBuffer.getEarliestTimestamp();
        if (earliestEvent) {
          DEBUG_BUILD5 && logger2.info(`Updating session start time to earliest event in buffer to ${new Date(earliestEvent)}`);
          session.started = earliestEvent;
          if (replay.getOptions().stickySession) {
            saveSession(session);
          }
        }
      }
      if (session && session.previousSessionId) {
        return true;
      }
      if (replay.recordingMode === "session") {
        void replay.flush();
      }
      return true;
    });
  };
}
function createOptionsEvent(replay) {
  const options = replay.getOptions();
  return {
    type: EventType.Custom,
    timestamp: Date.now(),
    data: {
      tag: "options",
      payload: {
        shouldRecordCanvas: replay.isRecordingCanvas(),
        sessionSampleRate: options.sessionSampleRate,
        errorSampleRate: options.errorSampleRate,
        useCompressionOption: options.useCompression,
        blockAllMedia: options.blockAllMedia,
        maskAllText: options.maskAllText,
        maskAllInputs: options.maskAllInputs,
        useCompression: replay.eventBuffer ? replay.eventBuffer.type === "worker" : false,
        networkDetailHasUrls: options.networkDetailAllowUrls.length > 0,
        networkCaptureBodies: options.networkCaptureBodies,
        networkRequestHasHeaders: options.networkRequestHeaders.length > 0,
        networkResponseHasHeaders: options.networkResponseHeaders.length > 0
      }
    }
  };
}
function addSettingsEvent(replay, isCheckout) {
  if (!isCheckout || !replay.session || replay.session.segmentId !== 0) {
    return;
  }
  addEventSync(replay, createOptionsEvent(replay), false);
}
function resetReplayIdOnDynamicSamplingContext() {
  const dsc = getCurrentScope().getPropagationContext().dsc;
  if (dsc) {
    delete dsc.replay_id;
  }
  const activeSpan = getActiveSpan();
  if (activeSpan) {
    const dsc2 = getDynamicSamplingContextFromSpan(activeSpan);
    delete dsc2.replay_id;
  }
}
function createReplayEnvelope(replayEvent, recordingData, dsn, tunnel) {
  return createEnvelope(createEventEnvelopeHeaders(replayEvent, getSdkMetadataForEnvelopeHeader(replayEvent), tunnel, dsn), [[{
    type: "replay_event"
  }, replayEvent], [{
    type: "replay_recording",
    // If string then we need to encode to UTF8, otherwise will have
    // wrong size. TextEncoder has similar browser support to
    // MutationObserver, although it does not accept IE11.
    length: typeof recordingData === "string" ? new TextEncoder().encode(recordingData).length : recordingData.length
  }, recordingData]]);
}
function prepareRecordingData({
  recordingData,
  headers
}) {
  let payloadWithSequence;
  const replayHeaders = `${JSON.stringify(headers)}
`;
  if (typeof recordingData === "string") {
    payloadWithSequence = `${replayHeaders}${recordingData}`;
  } else {
    const enc = new TextEncoder();
    const sequence = enc.encode(replayHeaders);
    payloadWithSequence = new Uint8Array(sequence.length + recordingData.length);
    payloadWithSequence.set(sequence);
    payloadWithSequence.set(recordingData, sequence.length);
  }
  return payloadWithSequence;
}
function prepareReplayEvent(_0) {
  return __async(this, arguments, function* ({
    client,
    scope,
    replayId: event_id,
    event
  }) {
    const integrations = typeof client._integrations === "object" && client._integrations !== null && !Array.isArray(client._integrations) ? Object.keys(client._integrations) : void 0;
    const eventHint = {
      event_id,
      integrations
    };
    client.emit("preprocessEvent", event, eventHint);
    const preparedEvent = yield prepareEvent(client.getOptions(), event, eventHint, scope, client, getIsolationScope());
    if (!preparedEvent) {
      return null;
    }
    preparedEvent.platform = preparedEvent.platform || "javascript";
    const metadata = client.getSdkMetadata();
    const {
      name,
      version
    } = metadata && metadata.sdk || {};
    preparedEvent.sdk = __spreadProps(__spreadValues({}, preparedEvent.sdk), {
      name: name || "sentry.javascript.unknown",
      version: version || "0.0.0"
    });
    return preparedEvent;
  });
}
function sendReplayRequest(_0) {
  return __async(this, arguments, function* ({
    recordingData,
    replayId,
    segmentId: segment_id,
    eventContext,
    timestamp,
    session
  }) {
    const preparedRecordingData = prepareRecordingData({
      recordingData,
      headers: {
        segment_id
      }
    });
    const {
      urls,
      errorIds,
      traceIds,
      initialTimestamp
    } = eventContext;
    const client = getClient();
    const scope = getCurrentScope();
    const transport = client && client.getTransport();
    const dsn = client && client.getDsn();
    if (!client || !transport || !dsn || !session.sampled) {
      return resolvedSyncPromise({});
    }
    const baseEvent = {
      type: REPLAY_EVENT_NAME,
      replay_start_timestamp: initialTimestamp / 1e3,
      timestamp: timestamp / 1e3,
      error_ids: errorIds,
      trace_ids: traceIds,
      urls,
      replay_id: replayId,
      segment_id,
      replay_type: session.sampled
    };
    const replayEvent = yield prepareReplayEvent({
      scope,
      client,
      replayId,
      event: baseEvent
    });
    if (!replayEvent) {
      client.recordDroppedEvent("event_processor", "replay", baseEvent);
      DEBUG_BUILD5 && logger2.info("An event processor returned `null`, will not send event.");
      return resolvedSyncPromise({});
    }
    delete replayEvent.sdkProcessingMetadata;
    const envelope = createReplayEnvelope(replayEvent, preparedRecordingData, dsn, client.getOptions().tunnel);
    let response;
    try {
      response = yield transport.send(envelope);
    } catch (err) {
      const error = new Error(UNABLE_TO_SEND_REPLAY);
      try {
        error.cause = err;
      } catch (e3) {
      }
      throw error;
    }
    if (typeof response.statusCode === "number" && (response.statusCode < 200 || response.statusCode >= 300)) {
      throw new TransportStatusCodeError(response.statusCode);
    }
    const rateLimits = updateRateLimits({}, response);
    if (isRateLimited(rateLimits, "replay")) {
      throw new RateLimitError(rateLimits);
    }
    return response;
  });
}
var TransportStatusCodeError = class extends Error {
  constructor(statusCode) {
    super(`Transport returned status code ${statusCode}`);
  }
};
var RateLimitError = class extends Error {
  constructor(rateLimits) {
    super("Rate limit hit");
    this.rateLimits = rateLimits;
  }
};
function sendReplay(_0) {
  return __async(this, arguments, function* (replayData, retryConfig = {
    count: 0,
    interval: RETRY_BASE_INTERVAL
  }) {
    const {
      recordingData,
      onError
    } = replayData;
    if (!recordingData.length) {
      return;
    }
    try {
      yield sendReplayRequest(replayData);
      return true;
    } catch (err) {
      if (err instanceof TransportStatusCodeError || err instanceof RateLimitError) {
        throw err;
      }
      setContext("Replays", {
        _retryCount: retryConfig.count
      });
      if (onError) {
        onError(err);
      }
      if (retryConfig.count >= RETRY_MAX_COUNT) {
        const error = new Error(`${UNABLE_TO_SEND_REPLAY} - max retries exceeded`);
        try {
          error.cause = err;
        } catch (e3) {
        }
        throw error;
      }
      retryConfig.interval *= ++retryConfig.count;
      return new Promise((resolve2, reject) => {
        setTimeout2(() => __async(this, null, function* () {
          try {
            yield sendReplay(replayData, retryConfig);
            resolve2(true);
          } catch (err2) {
            reject(err2);
          }
        }), retryConfig.interval);
      });
    }
  });
}
var THROTTLED = "__THROTTLED";
var SKIPPED = "__SKIPPED";
function throttle(fn, maxCount, durationSeconds) {
  const counter = /* @__PURE__ */ new Map();
  const _cleanup = (now) => {
    const threshold = now - durationSeconds;
    counter.forEach((_value, key) => {
      if (key < threshold) {
        counter.delete(key);
      }
    });
  };
  const _getTotalCount = () => {
    return [...counter.values()].reduce((a2, b2) => a2 + b2, 0);
  };
  let isThrottled = false;
  return (...rest) => {
    const now = Math.floor(Date.now() / 1e3);
    _cleanup(now);
    if (_getTotalCount() >= maxCount) {
      const wasThrottled = isThrottled;
      isThrottled = true;
      return wasThrottled ? SKIPPED : THROTTLED;
    }
    isThrottled = false;
    const count = counter.get(now) || 0;
    counter.set(now, count + 1);
    return fn(...rest);
  };
}
var ReplayContainer = class _ReplayContainer {
  /**
   * Recording can happen in one of three modes:
   *   - session: Record the whole session, sending it continuously
   *   - buffer: Always keep the last 60s of recording, requires:
   *     - having replaysOnErrorSampleRate > 0 to capture replay when an error occurs
   *     - or calling `flush()` to send the replay
   */
  /**
   * The current or last active span.
   * This is only available when performance is enabled.
   */
  /**
   * These are here so we can overwrite them in tests etc.
   * @hidden
   */
  /** The replay has to be manually started, because no sample rate (neither session or error) was provided. */
  /**
   * Options to pass to `rrweb.record()`
   */
  /**
   * Timestamp of the last user activity. This lives across sessions.
   */
  /**
   * Is the integration currently active?
   */
  /**
   * Paused is a state where:
   * - DOM Recording is not listening at all
   * - Nothing will be added to event buffer (e.g. core SDK events)
   */
  /**
   * Have we attached listeners to the core SDK?
   * Note we have to track this as there is no way to remove instrumentation handlers.
   */
  /**
   * Function to stop recording
   */
  /**
   * Internal use for canvas recording options
   */
  constructor({
    options,
    recordingOptions
  }) {
    _ReplayContainer.prototype.__init.call(this);
    _ReplayContainer.prototype.__init2.call(this);
    _ReplayContainer.prototype.__init3.call(this);
    _ReplayContainer.prototype.__init4.call(this);
    _ReplayContainer.prototype.__init5.call(this);
    _ReplayContainer.prototype.__init6.call(this);
    this.eventBuffer = null;
    this.performanceEntries = [];
    this.replayPerformanceEntries = [];
    this.recordingMode = "session";
    this.timeouts = {
      sessionIdlePause: SESSION_IDLE_PAUSE_DURATION,
      sessionIdleExpire: SESSION_IDLE_EXPIRE_DURATION
    };
    this._lastActivity = Date.now();
    this._isEnabled = false;
    this._isPaused = false;
    this._requiresManualStart = false;
    this._hasInitializedCoreListeners = false;
    this._context = {
      errorIds: /* @__PURE__ */ new Set(),
      traceIds: /* @__PURE__ */ new Set(),
      urls: [],
      initialTimestamp: Date.now(),
      initialUrl: ""
    };
    this._recordingOptions = recordingOptions;
    this._options = options;
    this._debouncedFlush = debounce(() => this._flush(), this._options.flushMinDelay, {
      maxWait: this._options.flushMaxDelay
    });
    this._throttledAddEvent = throttle(
      (event, isCheckout) => addEvent(this, event, isCheckout),
      // Max 300 events...
      300,
      // ... per 5s
      5
    );
    const {
      slowClickTimeout,
      slowClickIgnoreSelectors
    } = this.getOptions();
    const slowClickConfig = slowClickTimeout ? {
      threshold: Math.min(SLOW_CLICK_THRESHOLD, slowClickTimeout),
      timeout: slowClickTimeout,
      scrollTimeout: SLOW_CLICK_SCROLL_TIMEOUT,
      ignoreSelector: slowClickIgnoreSelectors ? slowClickIgnoreSelectors.join(",") : ""
    } : void 0;
    if (slowClickConfig) {
      this.clickDetector = new ClickDetector(this, slowClickConfig);
    }
    if (DEBUG_BUILD5) {
      const experiments = options._experiments;
      logger2.setConfig({
        captureExceptions: !!experiments.captureExceptions,
        traceInternals: !!experiments.traceInternals
      });
    }
  }
  /** Get the event context. */
  getContext() {
    return this._context;
  }
  /** If recording is currently enabled. */
  isEnabled() {
    return this._isEnabled;
  }
  /** If recording is currently paused. */
  isPaused() {
    return this._isPaused;
  }
  /**
   * Determine if canvas recording is enabled
   */
  isRecordingCanvas() {
    return Boolean(this._canvas);
  }
  /** Get the replay integration options. */
  getOptions() {
    return this._options;
  }
  /** A wrapper to conditionally capture exceptions. */
  handleException(error) {
    DEBUG_BUILD5 && logger2.exception(error);
    if (this._options.onError) {
      this._options.onError(error);
    }
  }
  /**
   * Initializes the plugin based on sampling configuration. Should not be
   * called outside of constructor.
   */
  initializeSampling(previousSessionId) {
    const {
      errorSampleRate,
      sessionSampleRate
    } = this._options;
    const requiresManualStart = errorSampleRate <= 0 && sessionSampleRate <= 0;
    this._requiresManualStart = requiresManualStart;
    if (requiresManualStart) {
      return;
    }
    this._initializeSessionForSampling(previousSessionId);
    if (!this.session) {
      DEBUG_BUILD5 && logger2.exception(new Error("Unable to initialize and create session"));
      return;
    }
    if (this.session.sampled === false) {
      return;
    }
    this.recordingMode = this.session.sampled === "buffer" && this.session.segmentId === 0 ? "buffer" : "session";
    DEBUG_BUILD5 && logger2.infoTick(`Starting replay in ${this.recordingMode} mode`);
    this._initializeRecording();
  }
  /**
   * Start a replay regardless of sampling rate. Calling this will always
   * create a new session. Will log a message if replay is already in progress.
   *
   * Creates or loads a session, attaches listeners to varying events (DOM,
   * _performanceObserver, Recording, Sentry SDK, etc)
   */
  start() {
    if (this._isEnabled && this.recordingMode === "session") {
      DEBUG_BUILD5 && logger2.info("Recording is already in progress");
      return;
    }
    if (this._isEnabled && this.recordingMode === "buffer") {
      DEBUG_BUILD5 && logger2.info("Buffering is in progress, call `flush()` to save the replay");
      return;
    }
    DEBUG_BUILD5 && logger2.infoTick("Starting replay in session mode");
    this._updateUserActivity();
    const session = loadOrCreateSession({
      maxReplayDuration: this._options.maxReplayDuration,
      sessionIdleExpire: this.timeouts.sessionIdleExpire
    }, {
      stickySession: this._options.stickySession,
      // This is intentional: create a new session-based replay when calling `start()`
      sessionSampleRate: 1,
      allowBuffering: false
    });
    this.session = session;
    this._initializeRecording();
  }
  /**
   * Start replay buffering. Buffers until `flush()` is called or, if
   * `replaysOnErrorSampleRate` > 0, an error occurs.
   */
  startBuffering() {
    if (this._isEnabled) {
      DEBUG_BUILD5 && logger2.info("Buffering is in progress, call `flush()` to save the replay");
      return;
    }
    DEBUG_BUILD5 && logger2.infoTick("Starting replay in buffer mode");
    const session = loadOrCreateSession({
      sessionIdleExpire: this.timeouts.sessionIdleExpire,
      maxReplayDuration: this._options.maxReplayDuration
    }, {
      stickySession: this._options.stickySession,
      sessionSampleRate: 0,
      allowBuffering: true
    });
    this.session = session;
    this.recordingMode = "buffer";
    this._initializeRecording();
  }
  /**
   * Start recording.
   *
   * Note that this will cause a new DOM checkout
   */
  startRecording() {
    try {
      const canvasOptions = this._canvas;
      this._stopRecording = record(__spreadValues(__spreadProps(__spreadValues(__spreadValues({}, this._recordingOptions), this.recordingMode === "buffer" ? {
        checkoutEveryNms: BUFFER_CHECKOUT_TIME
      } : (
        // Otherwise, use experimental option w/ min checkout time of 6 minutes
        // This is to improve playback seeking as there could potentially be
        // less mutations to process in the worse cases.
        //
        // checkout by "N" events is probably ideal, but means we have less
        // control about the number of checkouts we make (which generally
        // increases replay size)
        this._options._experiments.continuousCheckout && {
          // Minimum checkout time is 6 minutes
          checkoutEveryNms: Math.max(36e4, this._options._experiments.continuousCheckout)
        }
      )), {
        emit: getHandleRecordingEmit(this),
        onMutation: this._onMutationHandler
      }), canvasOptions ? {
        recordCanvas: canvasOptions.recordCanvas,
        getCanvasManager: canvasOptions.getCanvasManager,
        sampling: canvasOptions.sampling,
        dataURLOptions: canvasOptions.dataURLOptions
      } : {}));
    } catch (err) {
      this.handleException(err);
    }
  }
  /**
   * Stops the recording, if it was running.
   *
   * Returns true if it was previously stopped, or is now stopped,
   * otherwise false.
   */
  stopRecording() {
    try {
      if (this._stopRecording) {
        this._stopRecording();
        this._stopRecording = void 0;
      }
      return true;
    } catch (err) {
      this.handleException(err);
      return false;
    }
  }
  /**
   * Currently, this needs to be manually called (e.g. for tests). Sentry SDK
   * does not support a teardown
   */
  stop() {
    return __async(this, arguments, function* ({
      forceFlush = false,
      reason
    } = {}) {
      if (!this._isEnabled) {
        return;
      }
      this._isEnabled = false;
      try {
        DEBUG_BUILD5 && logger2.info(`Stopping Replay${reason ? ` triggered by ${reason}` : ""}`);
        resetReplayIdOnDynamicSamplingContext();
        this._removeListeners();
        this.stopRecording();
        this._debouncedFlush.cancel();
        if (forceFlush) {
          yield this._flush({
            force: true
          });
        }
        this.eventBuffer && this.eventBuffer.destroy();
        this.eventBuffer = null;
        clearSession(this);
      } catch (err) {
        this.handleException(err);
      }
    });
  }
  /**
   * Pause some replay functionality. See comments for `_isPaused`.
   * This differs from stop as this only stops DOM recording, it is
   * not as thorough of a shutdown as `stop()`.
   */
  pause() {
    if (this._isPaused) {
      return;
    }
    this._isPaused = true;
    this.stopRecording();
    DEBUG_BUILD5 && logger2.info("Pausing replay");
  }
  /**
   * Resumes recording, see notes for `pause().
   *
   * Note that calling `startRecording()` here will cause a
   * new DOM checkout.`
   */
  resume() {
    if (!this._isPaused || !this._checkSession()) {
      return;
    }
    this._isPaused = false;
    this.startRecording();
    DEBUG_BUILD5 && logger2.info("Resuming replay");
  }
  /**
   * If not in "session" recording mode, flush event buffer which will create a new replay.
   * Unless `continueRecording` is false, the replay will continue to record and
   * behave as a "session"-based replay.
   *
   * Otherwise, queue up a flush.
   */
  sendBufferedReplayOrFlush() {
    return __async(this, arguments, function* ({
      continueRecording = true
    } = {}) {
      if (this.recordingMode === "session") {
        return this.flushImmediate();
      }
      const activityTime = Date.now();
      DEBUG_BUILD5 && logger2.info("Converting buffer to session");
      yield this.flushImmediate();
      const hasStoppedRecording = this.stopRecording();
      if (!continueRecording || !hasStoppedRecording) {
        return;
      }
      if (this.recordingMode === "session") {
        return;
      }
      this.recordingMode = "session";
      if (this.session) {
        this._updateUserActivity(activityTime);
        this._updateSessionActivity(activityTime);
        this._maybeSaveSession();
      }
      this.startRecording();
    });
  }
  /**
   * We want to batch uploads of replay events. Save events only if
   * `<flushMinDelay>` milliseconds have elapsed since the last event
   * *OR* if `<flushMaxDelay>` milliseconds have elapsed.
   *
   * Accepts a callback to perform side-effects and returns true to stop batch
   * processing and hand back control to caller.
   */
  addUpdate(cb) {
    const cbResult = cb();
    if (this.recordingMode === "buffer") {
      return;
    }
    if (cbResult === true) {
      return;
    }
    this._debouncedFlush();
  }
  /**
   * Updates the user activity timestamp and resumes recording. This should be
   * called in an event handler for a user action that we consider as the user
   * being "active" (e.g. a mouse click).
   */
  triggerUserActivity() {
    this._updateUserActivity();
    if (!this._stopRecording) {
      if (!this._checkSession()) {
        return;
      }
      this.resume();
      return;
    }
    this.checkAndHandleExpiredSession();
    this._updateSessionActivity();
  }
  /**
   * Updates the user activity timestamp *without* resuming
   * recording. Some user events (e.g. keydown) can be create
   * low-value replays that only contain the keypress as a
   * breadcrumb. Instead this would require other events to
   * create a new replay after a session has expired.
   */
  updateUserActivity() {
    this._updateUserActivity();
    this._updateSessionActivity();
  }
  /**
   * Only flush if `this.recordingMode === 'session'`
   */
  conditionalFlush() {
    if (this.recordingMode === "buffer") {
      return Promise.resolve();
    }
    return this.flushImmediate();
  }
  /**
   * Flush using debounce flush
   */
  flush() {
    return this._debouncedFlush();
  }
  /**
   * Always flush via `_debouncedFlush` so that we do not have flushes triggered
   * from calling both `flush` and `_debouncedFlush`. Otherwise, there could be
   * cases of mulitple flushes happening closely together.
   */
  flushImmediate() {
    this._debouncedFlush();
    return this._debouncedFlush.flush();
  }
  /**
   * Cancels queued up flushes.
   */
  cancelFlush() {
    this._debouncedFlush.cancel();
  }
  /** Get the current sesion (=replay) ID */
  getSessionId() {
    return this.session && this.session.id;
  }
  /**
   * Checks if recording should be stopped due to user inactivity. Otherwise
   * check if session is expired and create a new session if so. Triggers a new
   * full snapshot on new session.
   *
   * Returns true if session is not expired, false otherwise.
   * @hidden
   */
  checkAndHandleExpiredSession() {
    if (this._lastActivity && isExpired(this._lastActivity, this.timeouts.sessionIdlePause) && this.session && this.session.sampled === "session") {
      this.pause();
      return;
    }
    if (!this._checkSession()) {
      return false;
    }
    return true;
  }
  /**
   * Capture some initial state that can change throughout the lifespan of the
   * replay. This is required because otherwise they would be captured at the
   * first flush.
   */
  setInitialState() {
    const urlPath = `${WINDOW8.location.pathname}${WINDOW8.location.hash}${WINDOW8.location.search}`;
    const url = `${WINDOW8.location.origin}${urlPath}`;
    this.performanceEntries = [];
    this.replayPerformanceEntries = [];
    this._clearContext();
    this._context.initialUrl = url;
    this._context.initialTimestamp = Date.now();
    this._context.urls.push(url);
  }
  /**
   * Add a breadcrumb event, that may be throttled.
   * If it was throttled, we add a custom breadcrumb to indicate that.
   */
  throttledAddEvent(event, isCheckout) {
    const res = this._throttledAddEvent(event, isCheckout);
    if (res === THROTTLED) {
      const breadcrumb = createBreadcrumb({
        category: "replay.throttled"
      });
      this.addUpdate(() => {
        return !addEventSync(this, {
          type: ReplayEventTypeCustom,
          timestamp: breadcrumb.timestamp || 0,
          data: {
            tag: "breadcrumb",
            payload: breadcrumb,
            metric: true
          }
        });
      });
    }
    return res;
  }
  /**
   * This will get the parametrized route name of the current page.
   * This is only available if performance is enabled, and if an instrumented router is used.
   */
  getCurrentRoute() {
    const lastActiveSpan = this.lastActiveSpan || getActiveSpan();
    const lastRootSpan = lastActiveSpan && getRootSpan(lastActiveSpan);
    const attributes = lastRootSpan && spanToJSON(lastRootSpan).data || {};
    const source = attributes[SEMANTIC_ATTRIBUTE_SENTRY_SOURCE];
    if (!lastRootSpan || !source || !["route", "custom"].includes(source)) {
      return void 0;
    }
    return spanToJSON(lastRootSpan).description;
  }
  /**
   * Initialize and start all listeners to varying events (DOM,
   * Performance Observer, Recording, Sentry SDK, etc)
   */
  _initializeRecording() {
    this.setInitialState();
    this._updateSessionActivity();
    this.eventBuffer = createEventBuffer({
      useCompression: this._options.useCompression,
      workerUrl: this._options.workerUrl
    });
    this._removeListeners();
    this._addListeners();
    this._isEnabled = true;
    this._isPaused = false;
    this.startRecording();
  }
  /**
   * Loads (or refreshes) the current session.
   */
  _initializeSessionForSampling(previousSessionId) {
    const allowBuffering = this._options.errorSampleRate > 0;
    const session = loadOrCreateSession({
      sessionIdleExpire: this.timeouts.sessionIdleExpire,
      maxReplayDuration: this._options.maxReplayDuration,
      previousSessionId
    }, {
      stickySession: this._options.stickySession,
      sessionSampleRate: this._options.sessionSampleRate,
      allowBuffering
    });
    this.session = session;
  }
  /**
   * Checks and potentially refreshes the current session.
   * Returns false if session is not recorded.
   */
  _checkSession() {
    if (!this.session) {
      return false;
    }
    const currentSession = this.session;
    if (shouldRefreshSession(currentSession, {
      sessionIdleExpire: this.timeouts.sessionIdleExpire,
      maxReplayDuration: this._options.maxReplayDuration
    })) {
      this._refreshSession(currentSession);
      return false;
    }
    return true;
  }
  /**
   * Refresh a session with a new one.
   * This stops the current session (without forcing a flush, as that would never work since we are expired),
   * and then does a new sampling based on the refreshed session.
   */
  _refreshSession(session) {
    return __async(this, null, function* () {
      if (!this._isEnabled) {
        return;
      }
      yield this.stop({
        reason: "refresh session"
      });
      this.initializeSampling(session.id);
    });
  }
  /**
   * Adds listeners to record events for the replay
   */
  _addListeners() {
    try {
      WINDOW8.document.addEventListener("visibilitychange", this._handleVisibilityChange);
      WINDOW8.addEventListener("blur", this._handleWindowBlur);
      WINDOW8.addEventListener("focus", this._handleWindowFocus);
      WINDOW8.addEventListener("keydown", this._handleKeyboardEvent);
      if (this.clickDetector) {
        this.clickDetector.addListeners();
      }
      if (!this._hasInitializedCoreListeners) {
        addGlobalListeners(this);
        this._hasInitializedCoreListeners = true;
      }
    } catch (err) {
      this.handleException(err);
    }
    this._performanceCleanupCallback = setupPerformanceObserver(this);
  }
  /**
   * Cleans up listeners that were created in `_addListeners`
   */
  _removeListeners() {
    try {
      WINDOW8.document.removeEventListener("visibilitychange", this._handleVisibilityChange);
      WINDOW8.removeEventListener("blur", this._handleWindowBlur);
      WINDOW8.removeEventListener("focus", this._handleWindowFocus);
      WINDOW8.removeEventListener("keydown", this._handleKeyboardEvent);
      if (this.clickDetector) {
        this.clickDetector.removeListeners();
      }
      if (this._performanceCleanupCallback) {
        this._performanceCleanupCallback();
      }
    } catch (err) {
      this.handleException(err);
    }
  }
  /**
   * Handle when visibility of the page content changes. Opening a new tab will
   * cause the state to change to hidden because of content of current page will
   * be hidden. Likewise, moving a different window to cover the contents of the
   * page will also trigger a change to a hidden state.
   */
  __init() {
    this._handleVisibilityChange = () => {
      if (WINDOW8.document.visibilityState === "visible") {
        this._doChangeToForegroundTasks();
      } else {
        this._doChangeToBackgroundTasks();
      }
    };
  }
  /**
   * Handle when page is blurred
   */
  __init2() {
    this._handleWindowBlur = () => {
      const breadcrumb = createBreadcrumb({
        category: "ui.blur"
      });
      this._doChangeToBackgroundTasks(breadcrumb);
    };
  }
  /**
   * Handle when page is focused
   */
  __init3() {
    this._handleWindowFocus = () => {
      const breadcrumb = createBreadcrumb({
        category: "ui.focus"
      });
      this._doChangeToForegroundTasks(breadcrumb);
    };
  }
  /** Ensure page remains active when a key is pressed. */
  __init4() {
    this._handleKeyboardEvent = (event) => {
      handleKeyboardEvent(this, event);
    };
  }
  /**
   * Tasks to run when we consider a page to be hidden (via blurring and/or visibility)
   */
  _doChangeToBackgroundTasks(breadcrumb) {
    if (!this.session) {
      return;
    }
    const expired = isSessionExpired(this.session, {
      maxReplayDuration: this._options.maxReplayDuration,
      sessionIdleExpire: this.timeouts.sessionIdleExpire
    });
    if (expired) {
      return;
    }
    if (breadcrumb) {
      this._createCustomBreadcrumb(breadcrumb);
    }
    void this.conditionalFlush();
  }
  /**
   * Tasks to run when we consider a page to be visible (via focus and/or visibility)
   */
  _doChangeToForegroundTasks(breadcrumb) {
    if (!this.session) {
      return;
    }
    const isSessionActive = this.checkAndHandleExpiredSession();
    if (!isSessionActive) {
      DEBUG_BUILD5 && logger2.info("Document has become active, but session has expired");
      return;
    }
    if (breadcrumb) {
      this._createCustomBreadcrumb(breadcrumb);
    }
  }
  /**
   * Update user activity (across session lifespans)
   */
  _updateUserActivity(_lastActivity = Date.now()) {
    this._lastActivity = _lastActivity;
  }
  /**
   * Updates the session's last activity timestamp
   */
  _updateSessionActivity(_lastActivity = Date.now()) {
    if (this.session) {
      this.session.lastActivity = _lastActivity;
      this._maybeSaveSession();
    }
  }
  /**
   * Helper to create (and buffer) a replay breadcrumb from a core SDK breadcrumb
   */
  _createCustomBreadcrumb(breadcrumb) {
    this.addUpdate(() => {
      this.throttledAddEvent({
        type: EventType.Custom,
        timestamp: breadcrumb.timestamp || 0,
        data: {
          tag: "breadcrumb",
          payload: breadcrumb
        }
      });
    });
  }
  /**
   * Observed performance events are added to `this.performanceEntries`. These
   * are included in the replay event before it is finished and sent to Sentry.
   */
  _addPerformanceEntries() {
    let performanceEntries = createPerformanceEntries(this.performanceEntries).concat(this.replayPerformanceEntries);
    this.performanceEntries = [];
    this.replayPerformanceEntries = [];
    if (this._requiresManualStart) {
      const initialTimestampInSeconds = this._context.initialTimestamp / 1e3;
      performanceEntries = performanceEntries.filter((entry) => entry.start >= initialTimestampInSeconds);
    }
    return Promise.all(createPerformanceSpans(this, performanceEntries));
  }
  /**
   * Clear _context
   */
  _clearContext() {
    this._context.errorIds.clear();
    this._context.traceIds.clear();
    this._context.urls = [];
  }
  /** Update the initial timestamp based on the buffer content. */
  _updateInitialTimestampFromEventBuffer() {
    const {
      session,
      eventBuffer
    } = this;
    if (!session || !eventBuffer || this._requiresManualStart) {
      return;
    }
    if (session.segmentId) {
      return;
    }
    const earliestEvent = eventBuffer.getEarliestTimestamp();
    if (earliestEvent && earliestEvent < this._context.initialTimestamp) {
      this._context.initialTimestamp = earliestEvent;
    }
  }
  /**
   * Return and clear _context
   */
  _popEventContext() {
    const _context = {
      initialTimestamp: this._context.initialTimestamp,
      initialUrl: this._context.initialUrl,
      errorIds: Array.from(this._context.errorIds),
      traceIds: Array.from(this._context.traceIds),
      urls: this._context.urls
    };
    this._clearContext();
    return _context;
  }
  /**
   * Flushes replay event buffer to Sentry.
   *
   * Performance events are only added right before flushing - this is
   * due to the buffered performance observer events.
   *
   * Should never be called directly, only by `flush`
   */
  _runFlush() {
    return __async(this, null, function* () {
      const replayId = this.getSessionId();
      if (!this.session || !this.eventBuffer || !replayId) {
        DEBUG_BUILD5 && logger2.error("No session or eventBuffer found to flush.");
        return;
      }
      yield this._addPerformanceEntries();
      if (!this.eventBuffer || !this.eventBuffer.hasEvents) {
        return;
      }
      yield addMemoryEntry(this);
      if (!this.eventBuffer) {
        return;
      }
      if (replayId !== this.getSessionId()) {
        return;
      }
      try {
        this._updateInitialTimestampFromEventBuffer();
        const timestamp = Date.now();
        if (timestamp - this._context.initialTimestamp > this._options.maxReplayDuration + 3e4) {
          throw new Error("Session is too long, not sending replay");
        }
        const eventContext = this._popEventContext();
        const segmentId = this.session.segmentId++;
        this._maybeSaveSession();
        const recordingData = yield this.eventBuffer.finish();
        yield sendReplay({
          replayId,
          recordingData,
          segmentId,
          eventContext,
          session: this.session,
          timestamp,
          onError: (err) => this.handleException(err)
        });
      } catch (err) {
        this.handleException(err);
        this.stop({
          reason: "sendReplay"
        });
        const client = getClient();
        if (client) {
          const dropReason = err instanceof RateLimitError ? "ratelimit_backoff" : "send_error";
          client.recordDroppedEvent(dropReason, "replay");
        }
      }
    });
  }
  /**
   * Flush recording data to Sentry. Creates a lock so that only a single flush
   * can be active at a time. Do not call this directly.
   */
  __init5() {
    this._flush = (..._0) => __async(this, [..._0], function* ({
      force = false
    } = {}) {
      if (!this._isEnabled && !force) {
        return;
      }
      if (!this.checkAndHandleExpiredSession()) {
        DEBUG_BUILD5 && logger2.error("Attempting to finish replay event after session expired.");
        return;
      }
      if (!this.session) {
        return;
      }
      const start = this.session.started;
      const now = Date.now();
      const duration = now - start;
      this._debouncedFlush.cancel();
      const tooShort = duration < this._options.minReplayDuration;
      const tooLong = duration > this._options.maxReplayDuration + 5e3;
      if (tooShort || tooLong) {
        DEBUG_BUILD5 && logger2.info(`Session duration (${Math.floor(duration / 1e3)}s) is too ${tooShort ? "short" : "long"}, not sending replay.`);
        if (tooShort) {
          this._debouncedFlush();
        }
        return;
      }
      const eventBuffer = this.eventBuffer;
      if (eventBuffer && this.session.segmentId === 0 && !eventBuffer.hasCheckout) {
        DEBUG_BUILD5 && logger2.info("Flushing initial segment without checkout.");
      }
      const _flushInProgress = !!this._flushLock;
      if (!this._flushLock) {
        this._flushLock = this._runFlush();
      }
      try {
        yield this._flushLock;
      } catch (err) {
        this.handleException(err);
      } finally {
        this._flushLock = void 0;
        if (_flushInProgress) {
          this._debouncedFlush();
        }
      }
    });
  }
  /** Save the session, if it is sticky */
  _maybeSaveSession() {
    if (this.session && this._options.stickySession) {
      saveSession(this.session);
    }
  }
  /** Handler for rrweb.record.onMutation */
  __init6() {
    this._onMutationHandler = (mutations) => {
      const count = mutations.length;
      const mutationLimit = this._options.mutationLimit;
      const mutationBreadcrumbLimit = this._options.mutationBreadcrumbLimit;
      const overMutationLimit = mutationLimit && count > mutationLimit;
      if (count > mutationBreadcrumbLimit || overMutationLimit) {
        const breadcrumb = createBreadcrumb({
          category: "replay.mutations",
          data: {
            count,
            limit: overMutationLimit
          }
        });
        this._createCustomBreadcrumb(breadcrumb);
      }
      if (overMutationLimit) {
        this.stop({
          reason: "mutationLimit",
          forceFlush: this.recordingMode === "session"
        });
        return false;
      }
      return true;
    };
  }
};
function getOption(selectors, defaultSelectors) {
  return [
    ...selectors,
    // sentry defaults
    ...defaultSelectors
  ].join(",");
}
function getPrivacyOptions({
  mask,
  unmask,
  block,
  unblock,
  ignore
}) {
  const defaultBlockedElements = ['base[href="/"]'];
  const maskSelector = getOption(mask, [".sentry-mask", "[data-sentry-mask]"]);
  const unmaskSelector = getOption(unmask, []);
  const options = {
    // We are making the decision to make text and input selectors the same
    maskTextSelector: maskSelector,
    unmaskTextSelector: unmaskSelector,
    blockSelector: getOption(block, [".sentry-block", "[data-sentry-block]", ...defaultBlockedElements]),
    unblockSelector: getOption(unblock, []),
    ignoreSelector: getOption(ignore, [".sentry-ignore", "[data-sentry-ignore]", 'input[type="file"]'])
  };
  return options;
}
function maskAttribute({
  el,
  key,
  maskAttributes,
  maskAllText,
  privacyOptions,
  value
}) {
  if (!maskAllText) {
    return value;
  }
  if (privacyOptions.unmaskTextSelector && el.matches(privacyOptions.unmaskTextSelector)) {
    return value;
  }
  if (maskAttributes.includes(key) || // Need to mask `value` attribute for `<input>` if it's a button-like
  // type
  key === "value" && el.tagName === "INPUT" && ["submit", "button"].includes(el.getAttribute("type") || "")) {
    return value.replace(/[\S]/g, "*");
  }
  return value;
}
var MEDIA_SELECTORS = 'img,image,svg,video,object,picture,embed,map,audio,link[rel="icon"],link[rel="apple-touch-icon"]';
var DEFAULT_NETWORK_HEADERS = ["content-length", "content-type", "accept"];
var _initialized = false;
var replayIntegration = (options) => {
  return new Replay(options);
};
var Replay = class _Replay {
  /**
   * @inheritDoc
   */
  static __initStatic() {
    this.id = "Replay";
  }
  /**
   * @inheritDoc
   */
  /**
   * Options to pass to `rrweb.record()`
   */
  /**
   * Initial options passed to the replay integration, merged with default values.
   * Note: `sessionSampleRate` and `errorSampleRate` are not required here, as they
   * can only be finally set when setupOnce() is called.
   *
   * @private
   */
  constructor({
    flushMinDelay = DEFAULT_FLUSH_MIN_DELAY,
    flushMaxDelay = DEFAULT_FLUSH_MAX_DELAY,
    minReplayDuration = MIN_REPLAY_DURATION,
    maxReplayDuration = MAX_REPLAY_DURATION,
    stickySession = true,
    useCompression = true,
    workerUrl,
    _experiments = {},
    maskAllText = true,
    maskAllInputs = true,
    blockAllMedia = true,
    mutationBreadcrumbLimit = 750,
    mutationLimit = 1e4,
    slowClickTimeout = 7e3,
    slowClickIgnoreSelectors = [],
    networkDetailAllowUrls = [],
    networkDetailDenyUrls = [],
    networkCaptureBodies = true,
    networkRequestHeaders = [],
    networkResponseHeaders = [],
    mask = [],
    maskAttributes = ["title", "placeholder"],
    unmask = [],
    block = [],
    unblock = [],
    ignore = [],
    maskFn,
    beforeAddRecordingEvent,
    beforeErrorSampling
  } = {}) {
    this.name = _Replay.id;
    const privacyOptions = getPrivacyOptions({
      mask,
      unmask,
      block,
      unblock,
      ignore
    });
    this._recordingOptions = __spreadProps(__spreadValues({
      maskAllInputs,
      maskAllText,
      maskInputOptions: {
        password: true
      },
      maskTextFn: maskFn,
      maskInputFn: maskFn,
      maskAttributeFn: (key, value, el) => maskAttribute({
        maskAttributes,
        maskAllText,
        privacyOptions,
        key,
        value,
        el
      })
    }, privacyOptions), {
      // Our defaults
      slimDOMOptions: "all",
      inlineStylesheet: true,
      // Disable inline images as it will increase segment/replay size
      inlineImages: false,
      // collect fonts, but be aware that `sentry.io` needs to be an allowed
      // origin for playback
      collectFonts: true,
      errorHandler: (err) => {
        try {
          err.__rrweb__ = true;
        } catch (error) {
        }
      }
    });
    this._initialOptions = {
      flushMinDelay,
      flushMaxDelay,
      minReplayDuration: Math.min(minReplayDuration, MIN_REPLAY_DURATION_LIMIT),
      maxReplayDuration: Math.min(maxReplayDuration, MAX_REPLAY_DURATION),
      stickySession,
      useCompression,
      workerUrl,
      blockAllMedia,
      maskAllInputs,
      maskAllText,
      mutationBreadcrumbLimit,
      mutationLimit,
      slowClickTimeout,
      slowClickIgnoreSelectors,
      networkDetailAllowUrls,
      networkDetailDenyUrls,
      networkCaptureBodies,
      networkRequestHeaders: _getMergedNetworkHeaders(networkRequestHeaders),
      networkResponseHeaders: _getMergedNetworkHeaders(networkResponseHeaders),
      beforeAddRecordingEvent,
      beforeErrorSampling,
      _experiments
    };
    if (this._initialOptions.blockAllMedia) {
      this._recordingOptions.blockSelector = !this._recordingOptions.blockSelector ? MEDIA_SELECTORS : `${this._recordingOptions.blockSelector},${MEDIA_SELECTORS}`;
    }
    if (this._isInitialized && isBrowser()) {
      throw new Error("Multiple Sentry Session Replay instances are not supported");
    }
    this._isInitialized = true;
  }
  /** If replay has already been initialized */
  get _isInitialized() {
    return _initialized;
  }
  /** Update _isInitialized */
  set _isInitialized(value) {
    _initialized = value;
  }
  /**
   * Setup and initialize replay container
   */
  afterAllSetup(client) {
    if (!isBrowser() || this._replay) {
      return;
    }
    this._setup(client);
    this._initialize(client);
  }
  /**
   * Start a replay regardless of sampling rate. Calling this will always
   * create a new session. Will log a message if replay is already in progress.
   *
   * Creates or loads a session, attaches listeners to varying events (DOM,
   * PerformanceObserver, Recording, Sentry SDK, etc)
   */
  start() {
    if (!this._replay) {
      return;
    }
    this._replay.start();
  }
  /**
   * Start replay buffering. Buffers until `flush()` is called or, if
   * `replaysOnErrorSampleRate` > 0, until an error occurs.
   */
  startBuffering() {
    if (!this._replay) {
      return;
    }
    this._replay.startBuffering();
  }
  /**
   * Currently, this needs to be manually called (e.g. for tests). Sentry SDK
   * does not support a teardown
   */
  stop() {
    if (!this._replay) {
      return Promise.resolve();
    }
    return this._replay.stop({
      forceFlush: this._replay.recordingMode === "session"
    });
  }
  /**
   * If not in "session" recording mode, flush event buffer which will create a new replay.
   * If replay is not enabled, a new session replay is started.
   * Unless `continueRecording` is false, the replay will continue to record and
   * behave as a "session"-based replay.
   *
   * Otherwise, queue up a flush.
   */
  flush(options) {
    if (!this._replay) {
      return Promise.resolve();
    }
    if (!this._replay.isEnabled()) {
      this._replay.start();
      return Promise.resolve();
    }
    return this._replay.sendBufferedReplayOrFlush(options);
  }
  /**
   * Get the current session ID.
   */
  getReplayId() {
    if (!this._replay || !this._replay.isEnabled()) {
      return;
    }
    return this._replay.getSessionId();
  }
  /**
   * Initializes replay.
   */
  _initialize(client) {
    if (!this._replay) {
      return;
    }
    this._maybeLoadFromReplayCanvasIntegration(client);
    this._replay.initializeSampling();
  }
  /** Setup the integration. */
  _setup(client) {
    const finalOptions = loadReplayOptionsFromClient(this._initialOptions, client);
    this._replay = new ReplayContainer({
      options: finalOptions,
      recordingOptions: this._recordingOptions
    });
  }
  /** Get canvas options from ReplayCanvas integration, if it is also added. */
  _maybeLoadFromReplayCanvasIntegration(client) {
    try {
      const canvasIntegration = client.getIntegrationByName("ReplayCanvas");
      if (!canvasIntegration) {
        return;
      }
      this._replay["_canvas"] = canvasIntegration.getOptions();
    } catch (e3) {
    }
  }
};
Replay.__initStatic();
function loadReplayOptionsFromClient(initialOptions, client) {
  const opt = client.getOptions();
  const finalOptions = __spreadValues({
    sessionSampleRate: 0,
    errorSampleRate: 0
  }, dropUndefinedKeys(initialOptions));
  const replaysSessionSampleRate = parseSampleRate(opt.replaysSessionSampleRate);
  const replaysOnErrorSampleRate = parseSampleRate(opt.replaysOnErrorSampleRate);
  if (replaysSessionSampleRate == null && replaysOnErrorSampleRate == null) {
    consoleSandbox(() => {
      console.warn("Replay is disabled because neither `replaysSessionSampleRate` nor `replaysOnErrorSampleRate` are set.");
    });
  }
  if (replaysSessionSampleRate != null) {
    finalOptions.sessionSampleRate = replaysSessionSampleRate;
  }
  if (replaysOnErrorSampleRate != null) {
    finalOptions.errorSampleRate = replaysOnErrorSampleRate;
  }
  return finalOptions;
}
function _getMergedNetworkHeaders(headers) {
  return [...DEFAULT_NETWORK_HEADERS, ...headers.map((header) => header.toLowerCase())];
}
function getReplay() {
  const client = getClient();
  return client && client.getIntegrationByName("Replay");
}

// node_modules/@sentry-internal/replay-canvas/build/npm/esm/index.js
var NodeType2;
(function(NodeType3) {
  NodeType3[NodeType3["Document"] = 0] = "Document";
  NodeType3[NodeType3["DocumentType"] = 1] = "DocumentType";
  NodeType3[NodeType3["Element"] = 2] = "Element";
  NodeType3[NodeType3["Text"] = 3] = "Text";
  NodeType3[NodeType3["CDATA"] = 4] = "CDATA";
  NodeType3[NodeType3["Comment"] = 5] = "Comment";
})(NodeType2 || (NodeType2 = {}));
function elementClassMatchesRegex2(el, regex) {
  for (let eIndex = el.classList.length; eIndex--; ) {
    const className = el.classList[eIndex];
    if (regex.test(className)) {
      return true;
    }
  }
  return false;
}
function distanceToMatch2(node2, matchPredicate, limit = Infinity, distance = 0) {
  if (!node2) return -1;
  if (node2.nodeType !== node2.ELEMENT_NODE) return -1;
  if (distance > limit) return -1;
  if (matchPredicate(node2)) return distance;
  return distanceToMatch2(node2.parentNode, matchPredicate, limit, distance + 1);
}
function createMatchPredicate2(className, selector) {
  return (node2) => {
    const el = node2;
    if (el === null) return false;
    try {
      if (className) {
        if (typeof className === "string") {
          if (el.matches(`.${className}`)) return true;
        } else if (elementClassMatchesRegex2(el, className)) {
          return true;
        }
      }
      if (selector && el.matches(selector)) return true;
      return false;
    } catch (e22) {
      return false;
    }
  };
}
var DEPARTED_MIRROR_ACCESS_WARNING2 = "Please stop import mirror directly. Instead of that,\r\nnow you can use replayer.getMirror() to access the mirror instance of a replayer,\r\nor you can use record.mirror to access the mirror instance during recording.";
var _mirror2 = {
  map: {},
  getId() {
    console.error(DEPARTED_MIRROR_ACCESS_WARNING2);
    return -1;
  },
  getNode() {
    console.error(DEPARTED_MIRROR_ACCESS_WARNING2);
    return null;
  },
  removeNodeFromMap() {
    console.error(DEPARTED_MIRROR_ACCESS_WARNING2);
  },
  has() {
    console.error(DEPARTED_MIRROR_ACCESS_WARNING2);
    return false;
  },
  reset() {
    console.error(DEPARTED_MIRROR_ACCESS_WARNING2);
  }
};
if (typeof window !== "undefined" && window.Proxy && window.Reflect) {
  _mirror2 = new Proxy(_mirror2, {
    get(target, prop, receiver) {
      if (prop === "map") {
        console.error(DEPARTED_MIRROR_ACCESS_WARNING2);
      }
      return Reflect.get(target, prop, receiver);
    }
  });
}
function hookSetter2(target, key, d2, isRevoked, win = window) {
  const original = win.Object.getOwnPropertyDescriptor(target, key);
  win.Object.defineProperty(target, key, isRevoked ? d2 : {
    set(value) {
      setTimeout3(() => {
        d2.set.call(this, value);
      }, 0);
      if (original && original.set) {
        original.set.call(this, value);
      }
    }
  });
  return () => hookSetter2(target, key, original || {}, true);
}
function patch2(source, name, replacement) {
  try {
    if (!(name in source)) {
      return () => {
      };
    }
    const original = source[name];
    const wrapped = replacement(original);
    if (typeof wrapped === "function") {
      wrapped.prototype = wrapped.prototype || {};
      Object.defineProperties(wrapped, {
        __rrweb_original__: {
          enumerable: false,
          value: original
        }
      });
    }
    source[name] = wrapped;
    return () => {
      source[name] = original;
    };
  } catch (e22) {
    return () => {
    };
  }
}
if (!/[1-9][0-9]{12}/.test(Date.now().toString())) ;
function closestElementOfNode2(node2) {
  if (!node2) {
    return null;
  }
  const el = node2.nodeType === node2.ELEMENT_NODE ? node2 : node2.parentElement;
  return el;
}
function isBlocked2(node2, blockClass, blockSelector, unblockSelector, checkAncestors) {
  if (!node2) {
    return false;
  }
  const el = closestElementOfNode2(node2);
  if (!el) {
    return false;
  }
  const blockedPredicate = createMatchPredicate2(blockClass, blockSelector);
  if (!checkAncestors) {
    const isUnblocked = unblockSelector && el.matches(unblockSelector);
    return blockedPredicate(el) && !isUnblocked;
  }
  const blockDistance = distanceToMatch2(el, blockedPredicate);
  let unblockDistance = -1;
  if (blockDistance < 0) {
    return false;
  }
  if (unblockSelector) {
    unblockDistance = distanceToMatch2(el, createMatchPredicate2(null, unblockSelector));
  }
  if (blockDistance > -1 && unblockDistance < 0) {
    return true;
  }
  return blockDistance < unblockDistance;
}
var cachedImplementations3 = {};
function getImplementation2(name) {
  const cached = cachedImplementations3[name];
  if (cached) {
    return cached;
  }
  const document2 = window.document;
  let impl = window[name];
  if (document2 && typeof document2.createElement === "function") {
    try {
      const sandbox = document2.createElement("iframe");
      sandbox.hidden = true;
      document2.head.appendChild(sandbox);
      const contentWindow = sandbox.contentWindow;
      if (contentWindow && contentWindow[name]) {
        impl = contentWindow[name];
      }
      document2.head.removeChild(sandbox);
    } catch (e3) {
    }
  }
  return cachedImplementations3[name] = impl.bind(window);
}
function onRequestAnimationFrame2(...rest) {
  return getImplementation2("requestAnimationFrame")(...rest);
}
function setTimeout3(...rest) {
  return getImplementation2("setTimeout")(...rest);
}
var CanvasContext = ((CanvasContext2) => {
  CanvasContext2[CanvasContext2["2D"] = 0] = "2D";
  CanvasContext2[CanvasContext2["WebGL"] = 1] = "WebGL";
  CanvasContext2[CanvasContext2["WebGL2"] = 2] = "WebGL2";
  return CanvasContext2;
})(CanvasContext || {});
var errorHandler2;
function registerErrorHandler2(handler) {
  errorHandler2 = handler;
}
var callbackWrapper2 = (cb) => {
  if (!errorHandler2) {
    return cb;
  }
  const rrwebWrapped = (...rest) => {
    try {
      return cb(...rest);
    } catch (error) {
      if (errorHandler2 && errorHandler2(error) === true) {
        return () => {
        };
      }
      throw error;
    }
  };
  return rrwebWrapped;
};
var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
var lookup = typeof Uint8Array === "undefined" ? [] : new Uint8Array(256);
for (i2 = 0; i2 < chars.length; i2++) {
  lookup[chars.charCodeAt(i2)] = i2;
}
var i2;
var encode = function(arraybuffer) {
  var bytes = new Uint8Array(arraybuffer), i2, len = bytes.length, base64 = "";
  for (i2 = 0; i2 < len; i2 += 3) {
    base64 += chars[bytes[i2] >> 2];
    base64 += chars[(bytes[i2] & 3) << 4 | bytes[i2 + 1] >> 4];
    base64 += chars[(bytes[i2 + 1] & 15) << 2 | bytes[i2 + 2] >> 6];
    base64 += chars[bytes[i2 + 2] & 63];
  }
  if (len % 3 === 2) {
    base64 = base64.substring(0, base64.length - 1) + "=";
  } else if (len % 3 === 1) {
    base64 = base64.substring(0, base64.length - 2) + "==";
  }
  return base64;
};
var canvasVarMap = /* @__PURE__ */ new Map();
function variableListFor(ctx, ctor) {
  let contextMap = canvasVarMap.get(ctx);
  if (!contextMap) {
    contextMap = /* @__PURE__ */ new Map();
    canvasVarMap.set(ctx, contextMap);
  }
  if (!contextMap.has(ctor)) {
    contextMap.set(ctor, []);
  }
  return contextMap.get(ctor);
}
var saveWebGLVar = (value, win, ctx) => {
  if (!value || !(isInstanceOfWebGLObject(value, win) || typeof value === "object")) return;
  const name = value.constructor.name;
  const list = variableListFor(ctx, name);
  let index = list.indexOf(value);
  if (index === -1) {
    index = list.length;
    list.push(value);
  }
  return index;
};
function serializeArg(value, win, ctx) {
  if (value instanceof Array) {
    return value.map((arg) => serializeArg(arg, win, ctx));
  } else if (value === null) {
    return value;
  } else if (value instanceof Float32Array || value instanceof Float64Array || value instanceof Int32Array || value instanceof Uint32Array || value instanceof Uint8Array || value instanceof Uint16Array || value instanceof Int16Array || value instanceof Int8Array || value instanceof Uint8ClampedArray) {
    const name = value.constructor.name;
    return {
      rr_type: name,
      args: [Object.values(value)]
    };
  } else if (value instanceof ArrayBuffer) {
    const name = value.constructor.name;
    const base64 = encode(value);
    return {
      rr_type: name,
      base64
    };
  } else if (value instanceof DataView) {
    const name = value.constructor.name;
    return {
      rr_type: name,
      args: [serializeArg(value.buffer, win, ctx), value.byteOffset, value.byteLength]
    };
  } else if (value instanceof HTMLImageElement) {
    const name = value.constructor.name;
    const {
      src
    } = value;
    return {
      rr_type: name,
      src
    };
  } else if (value instanceof HTMLCanvasElement) {
    const name = "HTMLImageElement";
    const src = value.toDataURL();
    return {
      rr_type: name,
      src
    };
  } else if (value instanceof ImageData) {
    const name = value.constructor.name;
    return {
      rr_type: name,
      args: [serializeArg(value.data, win, ctx), value.width, value.height]
    };
  } else if (isInstanceOfWebGLObject(value, win) || typeof value === "object") {
    const name = value.constructor.name;
    const index = saveWebGLVar(value, win, ctx);
    return {
      rr_type: name,
      index
    };
  }
  return value;
}
var serializeArgs = (args, win, ctx) => {
  return args.map((arg) => serializeArg(arg, win, ctx));
};
var isInstanceOfWebGLObject = (value, win) => {
  const webGLConstructorNames = ["WebGLActiveInfo", "WebGLBuffer", "WebGLFramebuffer", "WebGLProgram", "WebGLRenderbuffer", "WebGLShader", "WebGLShaderPrecisionFormat", "WebGLTexture", "WebGLUniformLocation", "WebGLVertexArrayObject", "WebGLVertexArrayObjectOES"];
  const supportedWebGLConstructorNames = webGLConstructorNames.filter((name) => typeof win[name] === "function");
  return Boolean(supportedWebGLConstructorNames.find((name) => value instanceof win[name]));
};
function initCanvas2DMutationObserver(cb, win, blockClass, blockSelector, unblockSelector) {
  const handlers4 = [];
  const props2D = Object.getOwnPropertyNames(win.CanvasRenderingContext2D.prototype);
  for (const prop of props2D) {
    try {
      if (typeof win.CanvasRenderingContext2D.prototype[prop] !== "function") {
        continue;
      }
      const restoreHandler = patch2(win.CanvasRenderingContext2D.prototype, prop, function(original) {
        return function(...args) {
          if (!isBlocked2(this.canvas, blockClass, blockSelector, unblockSelector, true)) {
            setTimeout3(() => {
              const recordArgs = serializeArgs(args, win, this);
              cb(this.canvas, {
                type: CanvasContext["2D"],
                property: prop,
                args: recordArgs
              });
            }, 0);
          }
          return original.apply(this, args);
        };
      });
      handlers4.push(restoreHandler);
    } catch (e3) {
      const hookHandler = hookSetter2(win.CanvasRenderingContext2D.prototype, prop, {
        set(v2) {
          cb(this.canvas, {
            type: CanvasContext["2D"],
            property: prop,
            args: [v2],
            setter: true
          });
        }
      });
      handlers4.push(hookHandler);
    }
  }
  return () => {
    handlers4.forEach((h2) => h2());
  };
}
function getNormalizedContextName(contextType) {
  return contextType === "experimental-webgl" ? "webgl" : contextType;
}
function initCanvasContextObserver(win, blockClass, blockSelector, unblockSelector, setPreserveDrawingBufferToTrue) {
  const handlers4 = [];
  try {
    const restoreHandler = patch2(win.HTMLCanvasElement.prototype, "getContext", function(original) {
      return function(contextType, ...args) {
        if (!isBlocked2(this, blockClass, blockSelector, unblockSelector, true)) {
          const ctxName = getNormalizedContextName(contextType);
          if (!("__context" in this)) this.__context = ctxName;
          if (setPreserveDrawingBufferToTrue && ["webgl", "webgl2"].includes(ctxName)) {
            if (args[0] && typeof args[0] === "object") {
              const contextAttributes = args[0];
              if (!contextAttributes.preserveDrawingBuffer) {
                contextAttributes.preserveDrawingBuffer = true;
              }
            } else {
              args.splice(0, 1, {
                preserveDrawingBuffer: true
              });
            }
          }
        }
        return original.apply(this, [contextType, ...args]);
      };
    });
    handlers4.push(restoreHandler);
  } catch (e3) {
    console.error("failed to patch HTMLCanvasElement.prototype.getContext");
  }
  return () => {
    handlers4.forEach((h2) => h2());
  };
}
function patchGLPrototype(prototype, type, cb, blockClass, blockSelector, unblockSelector, mirror2, win) {
  const handlers4 = [];
  const props = Object.getOwnPropertyNames(prototype);
  for (const prop of props) {
    if (["isContextLost", "canvas", "drawingBufferWidth", "drawingBufferHeight"].includes(prop)) {
      continue;
    }
    try {
      if (typeof prototype[prop] !== "function") {
        continue;
      }
      const restoreHandler = patch2(prototype, prop, function(original) {
        return function(...args) {
          const result = original.apply(this, args);
          saveWebGLVar(result, win, this);
          if ("tagName" in this.canvas && !isBlocked2(this.canvas, blockClass, blockSelector, unblockSelector, true)) {
            const recordArgs = serializeArgs(args, win, this);
            const mutation = {
              type,
              property: prop,
              args: recordArgs
            };
            cb(this.canvas, mutation);
          }
          return result;
        };
      });
      handlers4.push(restoreHandler);
    } catch (e3) {
      const hookHandler = hookSetter2(prototype, prop, {
        set(v2) {
          cb(this.canvas, {
            type,
            property: prop,
            args: [v2],
            setter: true
          });
        }
      });
      handlers4.push(hookHandler);
    }
  }
  return handlers4;
}
function initCanvasWebGLMutationObserver(cb, win, blockClass, blockSelector, unblockSelector, mirror2) {
  const handlers4 = [];
  handlers4.push(...patchGLPrototype(win.WebGLRenderingContext.prototype, CanvasContext.WebGL, cb, blockClass, blockSelector, unblockSelector, mirror2, win));
  if (typeof win.WebGL2RenderingContext !== "undefined") {
    handlers4.push(...patchGLPrototype(win.WebGL2RenderingContext.prototype, CanvasContext.WebGL2, cb, blockClass, blockSelector, unblockSelector, mirror2, win));
  }
  return () => {
    handlers4.forEach((h2) => h2());
  };
}
var r2 = `for(var e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",t="undefined"==typeof Uint8Array?[]:new Uint8Array(256),a=0;a<64;a++)t[e.charCodeAt(a)]=a;var n=function(t){var a,n=new Uint8Array(t),r=n.length,s="";for(a=0;a<r;a+=3)s+=e[n[a]>>2],s+=e[(3&n[a])<<4|n[a+1]>>4],s+=e[(15&n[a+1])<<2|n[a+2]>>6],s+=e[63&n[a+2]];return r%3==2?s=s.substring(0,s.length-1)+"=":r%3==1&&(s=s.substring(0,s.length-2)+"=="),s};const r=new Map,s=new Map;const i=self;i.onmessage=async function(e){if(!("OffscreenCanvas"in globalThis))return i.postMessage({id:e.data.id});{const{id:t,bitmap:a,width:o,height:f,maxCanvasSize:c,dataURLOptions:g}=e.data,u=async function(e,t,a){const r=e+"-"+t;if("OffscreenCanvas"in globalThis){if(s.has(r))return s.get(r);const i=new OffscreenCanvas(e,t);i.getContext("2d");const o=await i.convertToBlob(a),f=await o.arrayBuffer(),c=n(f);return s.set(r,c),c}return""}(o,f,g),[h,d]=function(e,t,a){if(!a)return[e,t];const[n,r]=a;if(e<=n&&t<=r)return[e,t];let s=e,i=t;return s>n&&(i=Math.floor(n*t/e),s=n),i>r&&(s=Math.floor(r*e/t),i=r),[s,i]}(o,f,c),l=new OffscreenCanvas(h,d),w=l.getContext("bitmaprenderer"),p=h===o&&d===f?a:await createImageBitmap(a,{resizeWidth:h,resizeHeight:d,resizeQuality:"low"});w.transferFromImageBitmap(p),a.close();const y=await l.convertToBlob(g),v=y.type,b=await y.arrayBuffer(),m=n(b);if(p.close(),!r.has(t)&&await u===m)return r.set(t,m),i.postMessage({id:t});if(r.get(t)===m)return i.postMessage({id:t});i.postMessage({id:t,type:v,base64:m,width:o,height:f}),r.set(t,m)}};`;
function t() {
  const t3 = new Blob([r2]);
  return URL.createObjectURL(t3);
}
var CanvasManager = class {
  reset() {
    this.pendingCanvasMutations.clear();
    this.restoreHandlers.forEach((handler) => {
      try {
        handler();
      } catch (e3) {
      }
    });
    this.restoreHandlers = [];
    this.windowsSet = /* @__PURE__ */ new WeakSet();
    this.windows = [];
    this.shadowDoms = /* @__PURE__ */ new Set();
    _optionalChain([this, "access", (_2) => _2.worker, "optionalAccess", (_2) => _2.terminate, "call", (_3) => _3()]);
    this.worker = null;
    this.snapshotInProgressMap = /* @__PURE__ */ new Map();
    if (this.options.recordCanvas && typeof this.options.sampling === "number" || this.options.enableManualSnapshot) {
      this.worker = this.initFPSWorker();
    }
  }
  freeze() {
    this.frozen = true;
  }
  unfreeze() {
    this.frozen = false;
  }
  lock() {
    this.locked = true;
  }
  unlock() {
    this.locked = false;
  }
  constructor(options) {
    this.pendingCanvasMutations = /* @__PURE__ */ new Map();
    this.rafStamps = {
      latestId: 0,
      invokeId: null
    };
    this.shadowDoms = /* @__PURE__ */ new Set();
    this.windowsSet = /* @__PURE__ */ new WeakSet();
    this.windows = [];
    this.restoreHandlers = [];
    this.frozen = false;
    this.locked = false;
    this.snapshotInProgressMap = /* @__PURE__ */ new Map();
    this.worker = null;
    this.processMutation = (target, mutation) => {
      const newFrame = this.rafStamps.invokeId && this.rafStamps.latestId !== this.rafStamps.invokeId;
      if (newFrame || !this.rafStamps.invokeId) this.rafStamps.invokeId = this.rafStamps.latestId;
      if (!this.pendingCanvasMutations.has(target)) {
        this.pendingCanvasMutations.set(target, []);
      }
      this.pendingCanvasMutations.get(target).push(mutation);
    };
    const {
      sampling = "all",
      win,
      blockClass,
      blockSelector,
      unblockSelector,
      maxCanvasSize,
      recordCanvas,
      dataURLOptions,
      errorHandler: errorHandler3
    } = options;
    this.mutationCb = options.mutationCb;
    this.mirror = options.mirror;
    this.options = options;
    if (errorHandler3) {
      registerErrorHandler2(errorHandler3);
    }
    if (recordCanvas && typeof sampling === "number" || options.enableManualSnapshot) {
      this.worker = this.initFPSWorker();
    }
    this.addWindow(win);
    if (options.enableManualSnapshot) {
      return;
    }
    callbackWrapper2(() => {
      if (recordCanvas && sampling === "all") {
        this.startRAFTimestamping();
        this.startPendingCanvasMutationFlusher();
      }
      if (recordCanvas && typeof sampling === "number") {
        this.initCanvasFPSObserver(sampling, blockClass, blockSelector, unblockSelector, maxCanvasSize, {
          dataURLOptions
        });
      }
    })();
  }
  addWindow(win) {
    const {
      sampling = "all",
      blockClass,
      blockSelector,
      unblockSelector,
      recordCanvas,
      enableManualSnapshot
    } = this.options;
    if (this.windowsSet.has(win)) return;
    if (enableManualSnapshot) {
      this.windowsSet.add(win);
      this.windows.push(new WeakRef(win));
      return;
    }
    callbackWrapper2(() => {
      if (recordCanvas && sampling === "all") {
        this.initCanvasMutationObserver(win, blockClass, blockSelector, unblockSelector);
      }
      if (recordCanvas && typeof sampling === "number") {
        const canvasContextReset = initCanvasContextObserver(win, blockClass, blockSelector, unblockSelector, true);
        this.restoreHandlers.push(() => {
          canvasContextReset();
        });
      }
    })();
    this.windowsSet.add(win);
    this.windows.push(new WeakRef(win));
  }
  addShadowRoot(shadowRoot) {
    this.shadowDoms.add(new WeakRef(shadowRoot));
  }
  resetShadowRoots() {
    this.shadowDoms = /* @__PURE__ */ new Set();
  }
  initFPSWorker() {
    const worker = new Worker(t());
    worker.onmessage = (e3) => {
      const data = e3.data;
      const {
        id
      } = data;
      this.snapshotInProgressMap.set(id, false);
      if (!("base64" in data)) return;
      const {
        base64,
        type,
        width,
        height
      } = data;
      this.mutationCb({
        id,
        type: CanvasContext["2D"],
        commands: [{
          property: "clearRect",
          args: [0, 0, width, height]
        }, {
          property: "drawImage",
          args: [{
            rr_type: "ImageBitmap",
            args: [{
              rr_type: "Blob",
              data: [{
                rr_type: "ArrayBuffer",
                base64
              }],
              type
            }]
          }, 0, 0, width, height]
        }]
      });
    };
    return worker;
  }
  initCanvasFPSObserver(fps, blockClass, blockSelector, unblockSelector, maxCanvasSize, options) {
    const rafId = this.takeSnapshot(false, fps, blockClass, blockSelector, unblockSelector, maxCanvasSize, options.dataURLOptions);
    this.restoreHandlers.push(() => {
      cancelAnimationFrame(rafId);
    });
  }
  initCanvasMutationObserver(win, blockClass, blockSelector, unblockSelector) {
    const canvasContextReset = initCanvasContextObserver(win, blockClass, blockSelector, unblockSelector, false);
    const canvas2DReset = initCanvas2DMutationObserver(this.processMutation.bind(this), win, blockClass, blockSelector, unblockSelector);
    const canvasWebGL1and2Reset = initCanvasWebGLMutationObserver(this.processMutation.bind(this), win, blockClass, blockSelector, unblockSelector, this.mirror);
    this.restoreHandlers.push(() => {
      canvasContextReset();
      canvas2DReset();
      canvasWebGL1and2Reset();
    });
  }
  snapshot(canvasElement) {
    const {
      options
    } = this;
    const rafId = this.takeSnapshot(true, options.sampling === "all" ? 2 : options.sampling || 2, options.blockClass, options.blockSelector, options.unblockSelector, options.maxCanvasSize, options.dataURLOptions, canvasElement);
    this.restoreHandlers.push(() => {
      cancelAnimationFrame(rafId);
    });
  }
  takeSnapshot(isManualSnapshot, fps, blockClass, blockSelector, unblockSelector, maxCanvasSize, dataURLOptions, canvasElement) {
    const timeBetweenSnapshots = 1e3 / fps;
    let lastSnapshotTime = 0;
    let rafId;
    const getCanvas = (canvasElement2) => {
      if (canvasElement2) {
        return [canvasElement2];
      }
      const matchedCanvas = [];
      const searchCanvas = (root) => {
        root.querySelectorAll("canvas").forEach((canvas) => {
          if (!isBlocked2(canvas, blockClass, blockSelector, unblockSelector, true)) {
            matchedCanvas.push(canvas);
          }
        });
      };
      for (const item of this.windows) {
        const window2 = item.deref();
        if (window2) {
          searchCanvas(window2.document);
        }
      }
      for (const item of this.shadowDoms) {
        const shadowRoot = item.deref();
        if (shadowRoot) {
          searchCanvas(shadowRoot);
        }
      }
      return matchedCanvas;
    };
    const takeCanvasSnapshots = (timestamp) => {
      if (!this.windows.length) {
        return;
      }
      if (lastSnapshotTime && timestamp - lastSnapshotTime < timeBetweenSnapshots) {
        rafId = onRequestAnimationFrame2(takeCanvasSnapshots);
        return;
      }
      lastSnapshotTime = timestamp;
      getCanvas(canvasElement).forEach((canvas) => {
        if (!this.mirror.hasNode(canvas)) {
          return;
        }
        const id = this.mirror.getId(canvas);
        if (this.snapshotInProgressMap.get(id)) return;
        if (!canvas.width || !canvas.height) return;
        this.snapshotInProgressMap.set(id, true);
        if (!isManualSnapshot && ["webgl", "webgl2"].includes(canvas.__context)) {
          const context = canvas.getContext(canvas.__context);
          if (_optionalChain([context, "optionalAccess", (_4) => _4.getContextAttributes, "call", (_5) => _5(), "optionalAccess", (_6) => _6.preserveDrawingBuffer]) === false) {
            context.clear(context.COLOR_BUFFER_BIT);
          }
        }
        createImageBitmap(canvas).then((bitmap) => {
          _optionalChain([this, "access", (_7) => _7.worker, "optionalAccess", (_8) => _8.postMessage, "call", (_9) => _9({
            id,
            bitmap,
            width: canvas.width,
            height: canvas.height,
            dataURLOptions,
            maxCanvasSize
          }, [bitmap])]);
        }).catch((error) => {
          callbackWrapper2(() => {
            throw error;
          })();
        });
      });
      if (!isManualSnapshot) {
        rafId = onRequestAnimationFrame2(takeCanvasSnapshots);
      }
    };
    rafId = onRequestAnimationFrame2(takeCanvasSnapshots);
    return rafId;
  }
  startPendingCanvasMutationFlusher() {
    onRequestAnimationFrame2(() => this.flushPendingCanvasMutations());
  }
  startRAFTimestamping() {
    const setLatestRAFTimestamp = (timestamp) => {
      this.rafStamps.latestId = timestamp;
      onRequestAnimationFrame2(setLatestRAFTimestamp);
    };
    onRequestAnimationFrame2(setLatestRAFTimestamp);
  }
  flushPendingCanvasMutations() {
    this.pendingCanvasMutations.forEach((values, canvas) => {
      const id = this.mirror.getId(canvas);
      this.flushPendingCanvasMutationFor(canvas, id);
    });
    onRequestAnimationFrame2(() => this.flushPendingCanvasMutations());
  }
  flushPendingCanvasMutationFor(canvas, id) {
    if (this.frozen || this.locked) {
      return;
    }
    const valuesWithType = this.pendingCanvasMutations.get(canvas);
    if (!valuesWithType || id === -1) return;
    const values = valuesWithType.map((value) => {
      const _a = value, {
        type: type2
      } = _a, rest = __objRest(_a, [
        "type"
      ]);
      return rest;
    });
    const {
      type
    } = valuesWithType[0];
    this.mutationCb({
      id,
      type,
      commands: values
    });
    this.pendingCanvasMutations.delete(canvas);
  }
};
var CANVAS_QUALITY = {
  low: {
    sampling: {
      canvas: 1
    },
    dataURLOptions: {
      type: "image/webp",
      quality: 0.25
    }
  },
  medium: {
    sampling: {
      canvas: 2
    },
    dataURLOptions: {
      type: "image/webp",
      quality: 0.4
    }
  },
  high: {
    sampling: {
      canvas: 4
    },
    dataURLOptions: {
      type: "image/webp",
      quality: 0.5
    }
  }
};
var INTEGRATION_NAME19 = "ReplayCanvas";
var DEFAULT_MAX_CANVAS_SIZE = 1280;
var _replayCanvasIntegration = (options = {}) => {
  const [maxCanvasWidth, maxCanvasHeight] = options.maxCanvasSize || [];
  const _canvasOptions = {
    quality: options.quality || "medium",
    enableManualSnapshot: options.enableManualSnapshot,
    maxCanvasSize: [maxCanvasWidth ? Math.min(maxCanvasWidth, DEFAULT_MAX_CANVAS_SIZE) : DEFAULT_MAX_CANVAS_SIZE, maxCanvasHeight ? Math.min(maxCanvasHeight, DEFAULT_MAX_CANVAS_SIZE) : DEFAULT_MAX_CANVAS_SIZE]
  };
  let canvasManagerResolve;
  const _canvasManager = new Promise((resolve2) => canvasManagerResolve = resolve2);
  return {
    name: INTEGRATION_NAME19,
    getOptions() {
      const {
        quality,
        enableManualSnapshot,
        maxCanvasSize
      } = _canvasOptions;
      return __spreadValues({
        enableManualSnapshot,
        recordCanvas: true,
        getCanvasManager: (getCanvasManagerOptions) => {
          const manager = new CanvasManager(__spreadProps(__spreadValues({}, getCanvasManagerOptions), {
            enableManualSnapshot,
            maxCanvasSize,
            errorHandler: (err) => {
              try {
                if (typeof err === "object") {
                  err.__rrweb__ = true;
                }
              } catch (error) {
              }
            }
          }));
          canvasManagerResolve(manager);
          return manager;
        }
      }, CANVAS_QUALITY[quality || "medium"] || CANVAS_QUALITY.medium);
    },
    snapshot(canvasElement) {
      return __async(this, null, function* () {
        const canvasManager = yield _canvasManager;
        canvasManager.snapshot(canvasElement);
      });
    }
  };
};
var replayCanvasIntegration = defineIntegration(_replayCanvasIntegration);

// node_modules/@sentry-internal/feedback/build/npm/esm/index.js
var WINDOW9 = GLOBAL_OBJ;
var DOCUMENT = WINDOW9.document;
var NAVIGATOR = WINDOW9.navigator;
var TRIGGER_LABEL = "Report a Bug";
var CANCEL_BUTTON_LABEL = "Cancel";
var SUBMIT_BUTTON_LABEL = "Send Bug Report";
var CONFIRM_BUTTON_LABEL = "Confirm";
var FORM_TITLE = "Report a Bug";
var EMAIL_PLACEHOLDER = "your.email@example.org";
var EMAIL_LABEL = "Email";
var MESSAGE_PLACEHOLDER = "What's the bug? What did you expect?";
var MESSAGE_LABEL = "Description";
var NAME_PLACEHOLDER = "Your Name";
var NAME_LABEL = "Name";
var SUCCESS_MESSAGE_TEXT = "Thank you for your report!";
var IS_REQUIRED_LABEL = "(required)";
var ADD_SCREENSHOT_LABEL = "Add a screenshot";
var REMOVE_SCREENSHOT_LABEL = "Remove screenshot";
var FEEDBACK_WIDGET_SOURCE = "widget";
var FEEDBACK_API_SOURCE = "api";
var SUCCESS_MESSAGE_TIMEOUT = 5e3;
var sendFeedback = (params, hint = {
  includeReplay: true
}) => {
  if (!params.message) {
    throw new Error("Unable to submit feedback with empty message");
  }
  const client = getClient();
  if (!client) {
    throw new Error("No client setup, cannot send feedback.");
  }
  if (params.tags && Object.keys(params.tags).length) {
    getCurrentScope().setTags(params.tags);
  }
  const eventId = captureFeedback(__spreadValues({
    source: FEEDBACK_API_SOURCE,
    url: getLocationHref()
  }, params), hint);
  return new Promise((resolve2, reject) => {
    const timeout = setTimeout(() => reject("Unable to determine if Feedback was correctly sent."), 5e3);
    const cleanup = client.on("afterSendEvent", (event, response) => {
      if (event.event_id !== eventId) {
        return;
      }
      clearTimeout(timeout);
      cleanup();
      if (response && typeof response.statusCode === "number" && response.statusCode >= 200 && response.statusCode < 300) {
        resolve2(eventId);
      }
      if (response && typeof response.statusCode === "number" && response.statusCode === 0) {
        return reject("Unable to send Feedback. This is because of network issues, or because you are using an ad-blocker.");
      }
      if (response && typeof response.statusCode === "number" && response.statusCode === 403) {
        return reject("Unable to send Feedback. This could be because this domain is not in your list of allowed domains.");
      }
      return reject("Unable to send Feedback. This could be because of network issues, or because you are using an ad-blocker");
    });
  });
};
var DEBUG_BUILD6 = typeof __SENTRY_DEBUG__ === "undefined" || __SENTRY_DEBUG__;
function isScreenshotSupported() {
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(NAVIGATOR.userAgent)) {
    return false;
  }
  if (/Macintosh/i.test(NAVIGATOR.userAgent) && NAVIGATOR.maxTouchPoints && NAVIGATOR.maxTouchPoints > 1) {
    return false;
  }
  if (!isSecureContext) {
    return false;
  }
  return true;
}
function mergeOptions(defaultOptions, optionOverrides) {
  return __spreadProps(__spreadValues(__spreadValues({}, defaultOptions), optionOverrides), {
    tags: __spreadValues(__spreadValues({}, defaultOptions.tags), optionOverrides.tags),
    onFormOpen: () => {
      optionOverrides.onFormOpen && optionOverrides.onFormOpen();
      defaultOptions.onFormOpen && defaultOptions.onFormOpen();
    },
    onFormClose: () => {
      optionOverrides.onFormClose && optionOverrides.onFormClose();
      defaultOptions.onFormClose && defaultOptions.onFormClose();
    },
    onSubmitSuccess: (data) => {
      optionOverrides.onSubmitSuccess && optionOverrides.onSubmitSuccess(data);
      defaultOptions.onSubmitSuccess && defaultOptions.onSubmitSuccess(data);
    },
    onSubmitError: (error) => {
      optionOverrides.onSubmitError && optionOverrides.onSubmitError(error);
      defaultOptions.onSubmitError && defaultOptions.onSubmitError(error);
    },
    onFormSubmitted: () => {
      optionOverrides.onFormSubmitted && optionOverrides.onFormSubmitted();
      defaultOptions.onFormSubmitted && defaultOptions.onFormSubmitted();
    },
    themeDark: __spreadValues(__spreadValues({}, defaultOptions.themeDark), optionOverrides.themeDark),
    themeLight: __spreadValues(__spreadValues({}, defaultOptions.themeLight), optionOverrides.themeLight)
  });
}
function createActorStyles(styleNonce) {
  const style = DOCUMENT.createElement("style");
  style.textContent = `
.widget__actor {
  position: fixed;
  z-index: var(--z-index);
  margin: var(--page-margin);
  inset: var(--actor-inset);

  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;

  font-family: inherit;
  font-size: var(--font-size);
  font-weight: 600;
  line-height: 1.14em;
  text-decoration: none;

  background: var(--actor-background, var(--background));
  border-radius: var(--actor-border-radius, 1.7em/50%);
  border: var(--actor-border, var(--border));
  box-shadow: var(--actor-box-shadow, var(--box-shadow));
  color: var(--actor-color, var(--foreground));
  fill: var(--actor-color, var(--foreground));
  cursor: pointer;
  opacity: 1;
  transition: transform 0.2s ease-in-out;
  transform: translate(0, 0) scale(1);
}
.widget__actor[aria-hidden="true"] {
  opacity: 0;
  pointer-events: none;
  visibility: hidden;
  transform: translate(0, 16px) scale(0.98);
}

.widget__actor:hover {
  background: var(--actor-hover-background, var(--background));
  filter: var(--interactive-filter);
}

.widget__actor svg {
  width: 1.14em;
  height: 1.14em;
}

@media (max-width: 600px) {
  .widget__actor span {
    display: none;
  }
}
`;
  if (styleNonce) {
    style.setAttribute("nonce", styleNonce);
  }
  return style;
}
function setAttributesNS(el, attributes) {
  Object.entries(attributes).forEach(([key, val]) => {
    el.setAttributeNS(null, key, val);
  });
  return el;
}
var SIZE = 20;
var XMLNS$2 = "http://www.w3.org/2000/svg";
function FeedbackIcon() {
  const createElementNS = (tagName) => WINDOW9.document.createElementNS(XMLNS$2, tagName);
  const svg = setAttributesNS(createElementNS("svg"), {
    width: `${SIZE}`,
    height: `${SIZE}`,
    viewBox: `0 0 ${SIZE} ${SIZE}`,
    fill: "var(--actor-color, var(--foreground))"
  });
  const g2 = setAttributesNS(createElementNS("g"), {
    clipPath: "url(#clip0_57_80)"
  });
  const path = setAttributesNS(createElementNS("path"), {
    ["fill-rule"]: "evenodd",
    ["clip-rule"]: "evenodd",
    d: "M15.6622 15H12.3997C12.2129 14.9959 12.031 14.9396 11.8747 14.8375L8.04965 12.2H7.49956V19.1C7.4875 19.3348 7.3888 19.5568 7.22256 19.723C7.05632 19.8892 6.83435 19.9879 6.59956 20H2.04956C1.80193 19.9968 1.56535 19.8969 1.39023 19.7218C1.21511 19.5467 1.1153 19.3101 1.11206 19.0625V12.2H0.949652C0.824431 12.2017 0.700142 12.1783 0.584123 12.1311C0.468104 12.084 0.362708 12.014 0.274155 11.9255C0.185602 11.8369 0.115689 11.7315 0.0685419 11.6155C0.0213952 11.4995 -0.00202913 11.3752 -0.00034808 11.25V3.75C-0.00900498 3.62067 0.0092504 3.49095 0.0532651 3.36904C0.0972798 3.24712 0.166097 3.13566 0.255372 3.04168C0.344646 2.94771 0.452437 2.87327 0.571937 2.82307C0.691437 2.77286 0.82005 2.74798 0.949652 2.75H8.04965L11.8747 0.1625C12.031 0.0603649 12.2129 0.00407221 12.3997 0H15.6622C15.9098 0.00323746 16.1464 0.103049 16.3215 0.278167C16.4966 0.453286 16.5964 0.689866 16.5997 0.9375V3.25269C17.3969 3.42959 18.1345 3.83026 18.7211 4.41679C19.5322 5.22788 19.9878 6.32796 19.9878 7.47502C19.9878 8.62209 19.5322 9.72217 18.7211 10.5333C18.1345 11.1198 17.3969 11.5205 16.5997 11.6974V14.0125C16.6047 14.1393 16.5842 14.2659 16.5395 14.3847C16.4948 14.5035 16.4268 14.6121 16.3394 14.7042C16.252 14.7962 16.147 14.8698 16.0307 14.9206C15.9144 14.9714 15.7891 14.9984 15.6622 15ZM1.89695 10.325H1.88715V4.625H8.33715C8.52423 4.62301 8.70666 4.56654 8.86215 4.4625L12.6872 1.875H14.7247V13.125H12.6872L8.86215 10.4875C8.70666 10.3835 8.52423 10.327 8.33715 10.325H2.20217C2.15205 10.3167 2.10102 10.3125 2.04956 10.3125C1.9981 10.3125 1.94708 10.3167 1.89695 10.325ZM2.98706 12.2V18.1625H5.66206V12.2H2.98706ZM16.5997 9.93612V5.01393C16.6536 5.02355 16.7072 5.03495 16.7605 5.04814C17.1202 5.13709 17.4556 5.30487 17.7425 5.53934C18.0293 5.77381 18.2605 6.06912 18.4192 6.40389C18.578 6.73866 18.6603 7.10452 18.6603 7.47502C18.6603 7.84552 18.578 8.21139 18.4192 8.54616C18.2605 8.88093 18.0293 9.17624 17.7425 9.41071C17.4556 9.64518 17.1202 9.81296 16.7605 9.90191C16.7072 9.91509 16.6536 9.9265 16.5997 9.93612Z"
  });
  svg.appendChild(g2).appendChild(path);
  const speakerDefs = createElementNS("defs");
  const speakerClipPathDef = setAttributesNS(createElementNS("clipPath"), {
    id: "clip0_57_80"
  });
  const speakerRect = setAttributesNS(createElementNS("rect"), {
    width: `${SIZE}`,
    height: `${SIZE}`,
    fill: "white"
  });
  speakerClipPathDef.appendChild(speakerRect);
  speakerDefs.appendChild(speakerClipPathDef);
  svg.appendChild(speakerDefs).appendChild(speakerClipPathDef).appendChild(speakerRect);
  return svg;
}
function Actor({
  triggerLabel,
  triggerAriaLabel,
  shadow,
  styleNonce
}) {
  const el = DOCUMENT.createElement("button");
  el.type = "button";
  el.className = "widget__actor";
  el.ariaHidden = "false";
  el.ariaLabel = triggerAriaLabel || triggerLabel || TRIGGER_LABEL;
  el.appendChild(FeedbackIcon());
  if (triggerLabel) {
    const label = DOCUMENT.createElement("span");
    label.appendChild(DOCUMENT.createTextNode(triggerLabel));
    el.appendChild(label);
  }
  const style = createActorStyles(styleNonce);
  return {
    el,
    appendToDom() {
      shadow.appendChild(style);
      shadow.appendChild(el);
    },
    removeFromDom() {
      shadow.removeChild(el);
      shadow.removeChild(style);
    },
    show() {
      el.ariaHidden = "false";
    },
    hide() {
      el.ariaHidden = "true";
    }
  };
}
var PURPLE = "rgba(88, 74, 192, 1)";
var DEFAULT_LIGHT = {
  foreground: "#2b2233",
  background: "#ffffff",
  accentForeground: "white",
  accentBackground: PURPLE,
  successColor: "#268d75",
  errorColor: "#df3338",
  border: "1.5px solid rgba(41, 35, 47, 0.13)",
  boxShadow: "0px 4px 24px 0px rgba(43, 34, 51, 0.12)",
  outline: "1px auto var(--accent-background)",
  interactiveFilter: "brightness(95%)"
};
var DEFAULT_DARK = {
  foreground: "#ebe6ef",
  background: "#29232f",
  accentForeground: "white",
  accentBackground: PURPLE,
  successColor: "#2da98c",
  errorColor: "#f55459",
  border: "1.5px solid rgba(235, 230, 239, 0.15)",
  boxShadow: "0px 4px 24px 0px rgba(43, 34, 51, 0.12)",
  outline: "1px auto var(--accent-background)",
  interactiveFilter: "brightness(150%)"
};
function getThemedCssVariables(theme) {
  return `
  --foreground: ${theme.foreground};
  --background: ${theme.background};
  --accent-foreground: ${theme.accentForeground};
  --accent-background: ${theme.accentBackground};
  --success-color: ${theme.successColor};
  --error-color: ${theme.errorColor};
  --border: ${theme.border};
  --box-shadow: ${theme.boxShadow};
  --outline: ${theme.outline};
  --interactive-filter: ${theme.interactiveFilter};
  `;
}
function createMainStyles({
  colorScheme,
  themeDark,
  themeLight,
  styleNonce
}) {
  const style = DOCUMENT.createElement("style");
  style.textContent = `
:host {
  --font-family: system-ui, 'Helvetica Neue', Arial, sans-serif;
  --font-size: 14px;
  --z-index: 100000;

  --page-margin: 16px;
  --inset: auto 0 0 auto;
  --actor-inset: var(--inset);

  font-family: var(--font-family);
  font-size: var(--font-size);

  ${colorScheme !== "system" ? "color-scheme: only light;" : ""}

  ${getThemedCssVariables(colorScheme === "dark" ? __spreadValues(__spreadValues({}, DEFAULT_DARK), themeDark) : __spreadValues(__spreadValues({}, DEFAULT_LIGHT), themeLight))}
}

${colorScheme === "system" ? `
@media (prefers-color-scheme: dark) {
  :host {
    ${getThemedCssVariables(__spreadValues(__spreadValues({}, DEFAULT_DARK), themeDark))}
  }
}` : ""}
}
`;
  if (styleNonce) {
    style.setAttribute("nonce", styleNonce);
  }
  return style;
}
var buildFeedbackIntegration = ({
  lazyLoadIntegration: lazyLoadIntegration2,
  getModalIntegration,
  getScreenshotIntegration
}) => {
  const feedbackIntegration = ({
    // FeedbackGeneralConfiguration
    id = "sentry-feedback",
    autoInject = true,
    showBranding = true,
    isEmailRequired = false,
    isNameRequired = false,
    showEmail = true,
    showName = true,
    enableScreenshot = true,
    useSentryUser = {
      email: "email",
      name: "username"
    },
    tags,
    styleNonce,
    scriptNonce,
    // FeedbackThemeConfiguration
    colorScheme = "system",
    themeLight = {},
    themeDark = {},
    // FeedbackTextConfiguration
    addScreenshotButtonLabel = ADD_SCREENSHOT_LABEL,
    cancelButtonLabel = CANCEL_BUTTON_LABEL,
    confirmButtonLabel = CONFIRM_BUTTON_LABEL,
    emailLabel = EMAIL_LABEL,
    emailPlaceholder = EMAIL_PLACEHOLDER,
    formTitle = FORM_TITLE,
    isRequiredLabel = IS_REQUIRED_LABEL,
    messageLabel = MESSAGE_LABEL,
    messagePlaceholder = MESSAGE_PLACEHOLDER,
    nameLabel = NAME_LABEL,
    namePlaceholder = NAME_PLACEHOLDER,
    removeScreenshotButtonLabel = REMOVE_SCREENSHOT_LABEL,
    submitButtonLabel = SUBMIT_BUTTON_LABEL,
    successMessageText = SUCCESS_MESSAGE_TEXT,
    triggerLabel = TRIGGER_LABEL,
    triggerAriaLabel = "",
    // FeedbackCallbacks
    onFormOpen,
    onFormClose,
    onSubmitSuccess,
    onSubmitError,
    onFormSubmitted
  } = {}) => {
    const _options = {
      id,
      autoInject,
      showBranding,
      isEmailRequired,
      isNameRequired,
      showEmail,
      showName,
      enableScreenshot,
      useSentryUser,
      tags,
      styleNonce,
      scriptNonce,
      colorScheme,
      themeDark,
      themeLight,
      triggerLabel,
      triggerAriaLabel,
      cancelButtonLabel,
      submitButtonLabel,
      confirmButtonLabel,
      formTitle,
      emailLabel,
      emailPlaceholder,
      messageLabel,
      messagePlaceholder,
      nameLabel,
      namePlaceholder,
      successMessageText,
      isRequiredLabel,
      addScreenshotButtonLabel,
      removeScreenshotButtonLabel,
      onFormClose,
      onFormOpen,
      onSubmitError,
      onSubmitSuccess,
      onFormSubmitted
    };
    let _shadow = null;
    let _subscriptions = [];
    const _createShadow = (options) => {
      if (!_shadow) {
        const host = DOCUMENT.createElement("div");
        host.id = String(options.id);
        DOCUMENT.body.appendChild(host);
        _shadow = host.attachShadow({
          mode: "open"
        });
        _shadow.appendChild(createMainStyles(options));
      }
      return _shadow;
    };
    const _findIntegration = (integrationName, getter, functionMethodName) => __async(void 0, null, function* () {
      const client = getClient();
      const existing = client && client.getIntegrationByName(integrationName);
      if (existing) {
        return existing;
      }
      const integrationFn = getter && getter() || (yield lazyLoadIntegration2(functionMethodName, scriptNonce));
      const integration = integrationFn();
      client && client.addIntegration(integration);
      return integration;
    });
    const _loadAndRenderDialog = (options) => __async(void 0, null, function* () {
      const screenshotRequired = options.enableScreenshot && isScreenshotSupported();
      const [modalIntegration, screenshotIntegration] = yield Promise.all([_findIntegration("FeedbackModal", getModalIntegration, "feedbackModalIntegration"), screenshotRequired ? _findIntegration("FeedbackScreenshot", getScreenshotIntegration, "feedbackScreenshotIntegration") : void 0]);
      if (!modalIntegration) {
        DEBUG_BUILD6 && logger.error("[Feedback] Missing feedback modal integration. Try using `feedbackSyncIntegration` in your `Sentry.init`.");
        throw new Error("[Feedback] Missing feedback modal integration!");
      }
      if (screenshotRequired && !screenshotIntegration) {
        DEBUG_BUILD6 && logger.error("[Feedback] Missing feedback screenshot integration. Proceeding without screenshots.");
      }
      const dialog = modalIntegration.createDialog({
        options: __spreadProps(__spreadValues({}, options), {
          onFormClose: () => {
            dialog && dialog.close();
            options.onFormClose && options.onFormClose();
          },
          onFormSubmitted: () => {
            dialog && dialog.close();
            options.onFormSubmitted && options.onFormSubmitted();
          }
        }),
        screenshotIntegration: screenshotRequired ? screenshotIntegration : void 0,
        sendFeedback,
        shadow: _createShadow(options)
      });
      return dialog;
    });
    const _attachTo = (el, optionOverrides = {}) => {
      const mergedOptions = mergeOptions(_options, optionOverrides);
      const targetEl = typeof el === "string" ? DOCUMENT.querySelector(el) : typeof el.addEventListener === "function" ? el : null;
      if (!targetEl) {
        DEBUG_BUILD6 && logger.error("[Feedback] Unable to attach to target element");
        throw new Error("Unable to attach to target element");
      }
      let dialog = null;
      const handleClick2 = () => __async(void 0, null, function* () {
        if (!dialog) {
          dialog = yield _loadAndRenderDialog(__spreadProps(__spreadValues({}, mergedOptions), {
            onFormSubmitted: () => {
              dialog && dialog.removeFromDom();
              mergedOptions.onFormSubmitted && mergedOptions.onFormSubmitted();
            }
          }));
        }
        dialog.appendToDom();
        dialog.open();
      });
      targetEl.addEventListener("click", handleClick2);
      const unsubscribe = () => {
        _subscriptions = _subscriptions.filter((sub) => sub !== unsubscribe);
        dialog && dialog.removeFromDom();
        dialog = null;
        targetEl.removeEventListener("click", handleClick2);
      };
      _subscriptions.push(unsubscribe);
      return unsubscribe;
    };
    const _createActor = (optionOverrides = {}) => {
      const mergedOptions = mergeOptions(_options, optionOverrides);
      const shadow = _createShadow(mergedOptions);
      const actor = Actor({
        triggerLabel: mergedOptions.triggerLabel,
        triggerAriaLabel: mergedOptions.triggerAriaLabel,
        shadow,
        styleNonce
      });
      _attachTo(actor.el, __spreadProps(__spreadValues({}, mergedOptions), {
        onFormOpen() {
          actor.hide();
        },
        onFormClose() {
          actor.show();
        },
        onFormSubmitted() {
          actor.show();
        }
      }));
      return actor;
    };
    return {
      name: "Feedback",
      setupOnce() {
        if (!isBrowser() || !_options.autoInject) {
          return;
        }
        if (DOCUMENT.readyState === "loading") {
          DOCUMENT.addEventListener("DOMContentLoaded", () => _createActor().appendToDom());
        } else {
          _createActor().appendToDom();
        }
      },
      /**
       * Adds click listener to the element to open a feedback dialog
       *
       * The returned function can be used to remove the click listener
       */
      attachTo: _attachTo,
      /**
       * Creates a new widget which is composed of a Button which triggers a Dialog.
       * Accepts partial options to override any options passed to constructor.
       */
      createWidget(optionOverrides = {}) {
        const actor = _createActor(mergeOptions(_options, optionOverrides));
        actor.appendToDom();
        return actor;
      },
      /**
       * Creates a new Form which you can
       * Accepts partial options to override any options passed to constructor.
       */
      createForm() {
        return __async(this, arguments, function* (optionOverrides = {}) {
          return _loadAndRenderDialog(mergeOptions(_options, optionOverrides));
        });
      },
      /**
       * Removes the Feedback integration (including host, shadow DOM, and all widgets)
       */
      remove() {
        if (_shadow) {
          _shadow.parentElement && _shadow.parentElement.remove();
          _shadow = null;
        }
        _subscriptions.forEach((sub) => sub());
        _subscriptions = [];
      }
    };
  };
  return feedbackIntegration;
};
function getFeedback() {
  const client = getClient();
  return client && client.getIntegrationByName("Feedback");
}
var n;
var l$1;
var u$1;
var i$1;
var o$1;
var r$1;
var f$1;
var c$1 = {};
var s$1 = [];
var a$1 = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;
var h$1 = Array.isArray;
function v$1(n2, l2) {
  for (var u2 in l2) n2[u2] = l2[u2];
  return n2;
}
function p$1(n2) {
  var l2 = n2.parentNode;
  l2 && l2.removeChild(n2);
}
function y$1(l2, u2, t3) {
  var i2, o2, r4, f2 = {};
  for (r4 in u2) "key" == r4 ? i2 = u2[r4] : "ref" == r4 ? o2 = u2[r4] : f2[r4] = u2[r4];
  if (arguments.length > 2 && (f2.children = arguments.length > 3 ? n.call(arguments, 2) : t3), "function" == typeof l2 && null != l2.defaultProps) for (r4 in l2.defaultProps) void 0 === f2[r4] && (f2[r4] = l2.defaultProps[r4]);
  return d$1(l2, f2, i2, o2, null);
}
function d$1(n2, t3, i2, o2, r4) {
  var f2 = {
    type: n2,
    props: t3,
    key: i2,
    ref: o2,
    __k: null,
    __: null,
    __b: 0,
    __e: null,
    __d: void 0,
    __c: null,
    constructor: void 0,
    __v: null == r4 ? ++u$1 : r4,
    __i: -1,
    __u: 0
  };
  return null == r4 && null != l$1.vnode && l$1.vnode(f2), f2;
}
function g$1(n2) {
  return n2.children;
}
function b$1(n2, l2) {
  this.props = n2, this.context = l2;
}
function m$1(n2, l2) {
  if (null == l2) return n2.__ ? m$1(n2.__, n2.__i + 1) : null;
  for (var u2; l2 < n2.__k.length; l2++) if (null != (u2 = n2.__k[l2]) && null != u2.__e) return u2.__e;
  return "function" == typeof n2.type ? m$1(n2) : null;
}
function w$1(n2, u2, t3) {
  var i2, o2 = n2.__v, r4 = o2.__e, f2 = n2.__P;
  if (f2) return (i2 = v$1({}, o2)).__v = o2.__v + 1, l$1.vnode && l$1.vnode(i2), M(f2, i2, o2, n2.__n, void 0 !== f2.ownerSVGElement, 32 & o2.__u ? [r4] : null, u2, null == r4 ? m$1(o2) : r4, !!(32 & o2.__u), t3), i2.__.__k[i2.__i] = i2, i2.__d = void 0, i2.__e != r4 && k$1(i2), i2;
}
function k$1(n2) {
  var l2, u2;
  if (null != (n2 = n2.__) && null != n2.__c) {
    for (n2.__e = n2.__c.base = null, l2 = 0; l2 < n2.__k.length; l2++) if (null != (u2 = n2.__k[l2]) && null != u2.__e) {
      n2.__e = n2.__c.base = u2.__e;
      break;
    }
    return k$1(n2);
  }
}
function x$1(n2) {
  (!n2.__d && (n2.__d = true) && i$1.push(n2) && !C$1.__r++ || o$1 !== l$1.debounceRendering) && ((o$1 = l$1.debounceRendering) || r$1)(C$1);
}
function C$1() {
  var n2, u2, t3, o2 = [], r4 = [];
  for (i$1.sort(f$1); n2 = i$1.shift(); ) n2.__d && (t3 = i$1.length, u2 = w$1(n2, o2, r4) || u2, 0 === t3 || i$1.length > t3 ? (j$1(o2, u2, r4), r4.length = o2.length = 0, u2 = void 0, i$1.sort(f$1)) : u2 && l$1.__c && l$1.__c(u2, s$1));
  u2 && j$1(o2, u2, r4), C$1.__r = 0;
}
function P$1(n2, l2, u2, t3, i2, o2, r4, f2, e3, a2, h2) {
  var v2, p2, y2, d2, _2, g2 = t3 && t3.__k || s$1, b2 = l2.length;
  for (u2.__d = e3, S(u2, l2, g2), e3 = u2.__d, v2 = 0; v2 < b2; v2++) null != (y2 = u2.__k[v2]) && "boolean" != typeof y2 && "function" != typeof y2 && (p2 = -1 === y2.__i ? c$1 : g2[y2.__i] || c$1, y2.__i = v2, M(n2, y2, p2, i2, o2, r4, f2, e3, a2, h2), d2 = y2.__e, y2.ref && p2.ref != y2.ref && (p2.ref && N(p2.ref, null, y2), h2.push(y2.ref, y2.__c || d2, y2)), null == _2 && null != d2 && (_2 = d2), 65536 & y2.__u || p2.__k === y2.__k ? e3 = $(y2, e3, n2) : "function" == typeof y2.type && void 0 !== y2.__d ? e3 = y2.__d : d2 && (e3 = d2.nextSibling), y2.__d = void 0, y2.__u &= -196609);
  u2.__d = e3, u2.__e = _2;
}
function S(n2, l2, u2) {
  var t3, i2, o2, r4, f2, e3 = l2.length, c2 = u2.length, s2 = c2, a2 = 0;
  for (n2.__k = [], t3 = 0; t3 < e3; t3++) null != (i2 = n2.__k[t3] = null == (i2 = l2[t3]) || "boolean" == typeof i2 || "function" == typeof i2 ? null : "string" == typeof i2 || "number" == typeof i2 || "bigint" == typeof i2 || i2.constructor == String ? d$1(null, i2, null, null, i2) : h$1(i2) ? d$1(g$1, {
    children: i2
  }, null, null, null) : void 0 === i2.constructor && i2.__b > 0 ? d$1(i2.type, i2.props, i2.key, i2.ref ? i2.ref : null, i2.__v) : i2) ? (i2.__ = n2, i2.__b = n2.__b + 1, f2 = I(i2, u2, r4 = t3 + a2, s2), i2.__i = f2, o2 = null, -1 !== f2 && (s2--, (o2 = u2[f2]) && (o2.__u |= 131072)), null == o2 || null === o2.__v ? (-1 == f2 && a2--, "function" != typeof i2.type && (i2.__u |= 65536)) : f2 !== r4 && (f2 === r4 + 1 ? a2++ : f2 > r4 ? s2 > e3 - r4 ? a2 += f2 - r4 : a2-- : a2 = f2 < r4 && f2 == r4 - 1 ? f2 - r4 : 0, f2 !== t3 + a2 && (i2.__u |= 65536))) : (o2 = u2[t3]) && null == o2.key && o2.__e && (o2.__e == n2.__d && (n2.__d = m$1(o2)), O(o2, o2, false), u2[t3] = null, s2--);
  if (s2) for (t3 = 0; t3 < c2; t3++) null != (o2 = u2[t3]) && 0 == (131072 & o2.__u) && (o2.__e == n2.__d && (n2.__d = m$1(o2)), O(o2, o2));
}
function $(n2, l2, u2) {
  var t3, i2;
  if ("function" == typeof n2.type) {
    for (t3 = n2.__k, i2 = 0; t3 && i2 < t3.length; i2++) t3[i2] && (t3[i2].__ = n2, l2 = $(t3[i2], l2, u2));
    return l2;
  }
  n2.__e != l2 && (u2.insertBefore(n2.__e, l2 || null), l2 = n2.__e);
  do {
    l2 = l2 && l2.nextSibling;
  } while (null != l2 && 8 === l2.nodeType);
  return l2;
}
function I(n2, l2, u2, t3) {
  var i2 = n2.key, o2 = n2.type, r4 = u2 - 1, f2 = u2 + 1, e3 = l2[u2];
  if (null === e3 || e3 && i2 == e3.key && o2 === e3.type) return u2;
  if (t3 > (null != e3 && 0 == (131072 & e3.__u) ? 1 : 0)) for (; r4 >= 0 || f2 < l2.length; ) {
    if (r4 >= 0) {
      if ((e3 = l2[r4]) && 0 == (131072 & e3.__u) && i2 == e3.key && o2 === e3.type) return r4;
      r4--;
    }
    if (f2 < l2.length) {
      if ((e3 = l2[f2]) && 0 == (131072 & e3.__u) && i2 == e3.key && o2 === e3.type) return f2;
      f2++;
    }
  }
  return -1;
}
function T$1(n2, l2, u2) {
  "-" === l2[0] ? n2.setProperty(l2, null == u2 ? "" : u2) : n2[l2] = null == u2 ? "" : "number" != typeof u2 || a$1.test(l2) ? u2 : u2 + "px";
}
function A$1(n2, l2, u2, t3, i2) {
  var o2;
  n: if ("style" === l2) {
    if ("string" == typeof u2) n2.style.cssText = u2;
    else {
      if ("string" == typeof t3 && (n2.style.cssText = t3 = ""), t3) for (l2 in t3) u2 && l2 in u2 || T$1(n2.style, l2, "");
      if (u2) for (l2 in u2) t3 && u2[l2] === t3[l2] || T$1(n2.style, l2, u2[l2]);
    }
  } else if ("o" === l2[0] && "n" === l2[1]) o2 = l2 !== (l2 = l2.replace(/(PointerCapture)$|Capture$/i, "$1")), l2 = l2.toLowerCase() in n2 ? l2.toLowerCase().slice(2) : l2.slice(2), n2.l || (n2.l = {}), n2.l[l2 + o2] = u2, u2 ? t3 ? u2.u = t3.u : (u2.u = Date.now(), n2.addEventListener(l2, o2 ? L : D$1, o2)) : n2.removeEventListener(l2, o2 ? L : D$1, o2);
  else {
    if (i2) l2 = l2.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
    else if ("width" !== l2 && "height" !== l2 && "href" !== l2 && "list" !== l2 && "form" !== l2 && "tabIndex" !== l2 && "download" !== l2 && "rowSpan" !== l2 && "colSpan" !== l2 && "role" !== l2 && l2 in n2) try {
      n2[l2] = null == u2 ? "" : u2;
      break n;
    } catch (n3) {
    }
    "function" == typeof u2 || (null == u2 || false === u2 && "-" !== l2[4] ? n2.removeAttribute(l2) : n2.setAttribute(l2, u2));
  }
}
function D$1(n2) {
  if (this.l) {
    var u2 = this.l[n2.type + false];
    if (n2.t) {
      if (n2.t <= u2.u) return;
    } else n2.t = Date.now();
    return u2(l$1.event ? l$1.event(n2) : n2);
  }
}
function L(n2) {
  if (this.l) return this.l[n2.type + true](l$1.event ? l$1.event(n2) : n2);
}
function M(n2, u2, t3, i2, o2, r4, f2, e3, c2, s2) {
  var a2, p2, y2, d2, _2, m2, w2, k2, x2, C2, S2, $2, H, I2, T2, A2 = u2.type;
  if (void 0 !== u2.constructor) return null;
  128 & t3.__u && (c2 = !!(32 & t3.__u), r4 = [e3 = u2.__e = t3.__e]), (a2 = l$1.__b) && a2(u2);
  n: if ("function" == typeof A2) try {
    if (k2 = u2.props, x2 = (a2 = A2.contextType) && i2[a2.__c], C2 = a2 ? x2 ? x2.props.value : a2.__ : i2, t3.__c ? w2 = (p2 = u2.__c = t3.__c).__ = p2.__E : ("prototype" in A2 && A2.prototype.render ? u2.__c = p2 = new A2(k2, C2) : (u2.__c = p2 = new b$1(k2, C2), p2.constructor = A2, p2.render = q$1), x2 && x2.sub(p2), p2.props = k2, p2.state || (p2.state = {}), p2.context = C2, p2.__n = i2, y2 = p2.__d = true, p2.__h = [], p2._sb = []), null == p2.__s && (p2.__s = p2.state), null != A2.getDerivedStateFromProps && (p2.__s == p2.state && (p2.__s = v$1({}, p2.__s)), v$1(p2.__s, A2.getDerivedStateFromProps(k2, p2.__s))), d2 = p2.props, _2 = p2.state, p2.__v = u2, y2) null == A2.getDerivedStateFromProps && null != p2.componentWillMount && p2.componentWillMount(), null != p2.componentDidMount && p2.__h.push(p2.componentDidMount);
    else {
      if (null == A2.getDerivedStateFromProps && k2 !== d2 && null != p2.componentWillReceiveProps && p2.componentWillReceiveProps(k2, C2), !p2.__e && (null != p2.shouldComponentUpdate && false === p2.shouldComponentUpdate(k2, p2.__s, C2) || u2.__v === t3.__v)) {
        for (u2.__v !== t3.__v && (p2.props = k2, p2.state = p2.__s, p2.__d = false), u2.__e = t3.__e, u2.__k = t3.__k, u2.__k.forEach(function(n3) {
          n3 && (n3.__ = u2);
        }), S2 = 0; S2 < p2._sb.length; S2++) p2.__h.push(p2._sb[S2]);
        p2._sb = [], p2.__h.length && f2.push(p2);
        break n;
      }
      null != p2.componentWillUpdate && p2.componentWillUpdate(k2, p2.__s, C2), null != p2.componentDidUpdate && p2.__h.push(function() {
        p2.componentDidUpdate(d2, _2, m2);
      });
    }
    if (p2.context = C2, p2.props = k2, p2.__P = n2, p2.__e = false, $2 = l$1.__r, H = 0, "prototype" in A2 && A2.prototype.render) {
      for (p2.state = p2.__s, p2.__d = false, $2 && $2(u2), a2 = p2.render(p2.props, p2.state, p2.context), I2 = 0; I2 < p2._sb.length; I2++) p2.__h.push(p2._sb[I2]);
      p2._sb = [];
    } else do {
      p2.__d = false, $2 && $2(u2), a2 = p2.render(p2.props, p2.state, p2.context), p2.state = p2.__s;
    } while (p2.__d && ++H < 25);
    p2.state = p2.__s, null != p2.getChildContext && (i2 = v$1(v$1({}, i2), p2.getChildContext())), y2 || null == p2.getSnapshotBeforeUpdate || (m2 = p2.getSnapshotBeforeUpdate(d2, _2)), P$1(n2, h$1(T2 = null != a2 && a2.type === g$1 && null == a2.key ? a2.props.children : a2) ? T2 : [T2], u2, t3, i2, o2, r4, f2, e3, c2, s2), p2.base = u2.__e, u2.__u &= -161, p2.__h.length && f2.push(p2), w2 && (p2.__E = p2.__ = null);
  } catch (n3) {
    u2.__v = null, c2 || null != r4 ? (u2.__e = e3, u2.__u |= c2 ? 160 : 32, r4[r4.indexOf(e3)] = null) : (u2.__e = t3.__e, u2.__k = t3.__k), l$1.__e(n3, u2, t3);
  }
  else null == r4 && u2.__v === t3.__v ? (u2.__k = t3.__k, u2.__e = t3.__e) : u2.__e = z$1(t3.__e, u2, t3, i2, o2, r4, f2, c2, s2);
  (a2 = l$1.diffed) && a2(u2);
}
function j$1(n2, u2, t3) {
  for (var i2 = 0; i2 < t3.length; i2++) N(t3[i2], t3[++i2], t3[++i2]);
  l$1.__c && l$1.__c(u2, n2), n2.some(function(u3) {
    try {
      n2 = u3.__h, u3.__h = [], n2.some(function(n3) {
        n3.call(u3);
      });
    } catch (n3) {
      l$1.__e(n3, u3.__v);
    }
  });
}
function z$1(l2, u2, t3, i2, o2, r4, f2, e3, s2) {
  var a2, v2, y2, d2, _2, g2, b2, w2 = t3.props, k2 = u2.props, x2 = u2.type;
  if ("svg" === x2 && (o2 = true), null != r4) {
    for (a2 = 0; a2 < r4.length; a2++) if ((_2 = r4[a2]) && "setAttribute" in _2 == !!x2 && (x2 ? _2.localName === x2 : 3 === _2.nodeType)) {
      l2 = _2, r4[a2] = null;
      break;
    }
  }
  if (null == l2) {
    if (null === x2) return document.createTextNode(k2);
    l2 = o2 ? document.createElementNS("http://www.w3.org/2000/svg", x2) : document.createElement(x2, k2.is && k2), r4 = null, e3 = false;
  }
  if (null === x2) w2 === k2 || e3 && l2.data === k2 || (l2.data = k2);
  else {
    if (r4 = r4 && n.call(l2.childNodes), w2 = t3.props || c$1, !e3 && null != r4) for (w2 = {}, a2 = 0; a2 < l2.attributes.length; a2++) w2[(_2 = l2.attributes[a2]).name] = _2.value;
    for (a2 in w2) _2 = w2[a2], "children" == a2 || ("dangerouslySetInnerHTML" == a2 ? y2 = _2 : "key" === a2 || a2 in k2 || A$1(l2, a2, null, _2, o2));
    for (a2 in k2) _2 = k2[a2], "children" == a2 ? d2 = _2 : "dangerouslySetInnerHTML" == a2 ? v2 = _2 : "value" == a2 ? g2 = _2 : "checked" == a2 ? b2 = _2 : "key" === a2 || e3 && "function" != typeof _2 || w2[a2] === _2 || A$1(l2, a2, _2, w2[a2], o2);
    if (v2) e3 || y2 && (v2.__html === y2.__html || v2.__html === l2.innerHTML) || (l2.innerHTML = v2.__html), u2.__k = [];
    else if (y2 && (l2.innerHTML = ""), P$1(l2, h$1(d2) ? d2 : [d2], u2, t3, i2, o2 && "foreignObject" !== x2, r4, f2, r4 ? r4[0] : t3.__k && m$1(t3, 0), e3, s2), null != r4) for (a2 = r4.length; a2--; ) null != r4[a2] && p$1(r4[a2]);
    e3 || (a2 = "value", void 0 !== g2 && (g2 !== l2[a2] || "progress" === x2 && !g2 || "option" === x2 && g2 !== w2[a2]) && A$1(l2, a2, g2, w2[a2], false), a2 = "checked", void 0 !== b2 && b2 !== l2[a2] && A$1(l2, a2, b2, w2[a2], false));
  }
  return l2;
}
function N(n2, u2, t3) {
  try {
    "function" == typeof n2 ? n2(u2) : n2.current = u2;
  } catch (n3) {
    l$1.__e(n3, t3);
  }
}
function O(n2, u2, t3) {
  var i2, o2;
  if (l$1.unmount && l$1.unmount(n2), (i2 = n2.ref) && (i2.current && i2.current !== n2.__e || N(i2, null, u2)), null != (i2 = n2.__c)) {
    if (i2.componentWillUnmount) try {
      i2.componentWillUnmount();
    } catch (n3) {
      l$1.__e(n3, u2);
    }
    i2.base = i2.__P = null, n2.__c = void 0;
  }
  if (i2 = n2.__k) for (o2 = 0; o2 < i2.length; o2++) i2[o2] && O(i2[o2], u2, t3 || "function" != typeof n2.type);
  t3 || null == n2.__e || p$1(n2.__e), n2.__ = n2.__e = n2.__d = void 0;
}
function q$1(n2, l2, u2) {
  return this.constructor(n2, u2);
}
function B$1(u2, t3, i2) {
  var o2, r4, f2, e3;
  l$1.__ && l$1.__(u2, t3), r4 = (o2 = "function" == typeof i2) ? null : i2 && i2.__k || t3.__k, f2 = [], e3 = [], M(t3, u2 = (!o2 && i2 || t3).__k = y$1(g$1, null, [u2]), r4 || c$1, c$1, void 0 !== t3.ownerSVGElement, !o2 && i2 ? [i2] : r4 ? null : t3.firstChild ? n.call(t3.childNodes) : null, f2, !o2 && i2 ? i2 : r4 ? r4.__e : t3.firstChild, o2, e3), u2.__d = void 0, j$1(f2, u2, e3);
}
n = s$1.slice, l$1 = {
  __e: function(n2, l2, u2, t3) {
    for (var i2, o2, r4; l2 = l2.__; ) if ((i2 = l2.__c) && !i2.__) try {
      if ((o2 = i2.constructor) && null != o2.getDerivedStateFromError && (i2.setState(o2.getDerivedStateFromError(n2)), r4 = i2.__d), null != i2.componentDidCatch && (i2.componentDidCatch(n2, t3 || {}), r4 = i2.__d), r4) return i2.__E = i2;
    } catch (l3) {
      n2 = l3;
    }
    throw n2;
  }
}, u$1 = 0, b$1.prototype.setState = function(n2, l2) {
  var u2;
  u2 = null != this.__s && this.__s !== this.state ? this.__s : this.__s = v$1({}, this.state), "function" == typeof n2 && (n2 = n2(v$1({}, u2), this.props)), n2 && v$1(u2, n2), null != n2 && this.__v && (l2 && this._sb.push(l2), x$1(this));
}, b$1.prototype.forceUpdate = function(n2) {
  this.__v && (this.__e = true, n2 && this.__h.push(n2), x$1(this));
}, b$1.prototype.render = g$1, i$1 = [], r$1 = "function" == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, f$1 = function(n2, l2) {
  return n2.__v.__b - l2.__v.__b;
}, C$1.__r = 0;
var t2;
var r3;
var u;
var i;
var o = 0;
var f = [];
var c = [];
var e2 = l$1;
var a = e2.__b;
var v = e2.__r;
var l = e2.diffed;
var m = e2.__c;
var s = e2.unmount;
var d = e2.__;
function h(n2, t3) {
  e2.__h && e2.__h(r3, n2, o || t3), o = 0;
  var u2 = r3.__H || (r3.__H = {
    __: [],
    __h: []
  });
  return n2 >= u2.__.length && u2.__.push({
    __V: c
  }), u2.__[n2];
}
function p(n2) {
  return o = 1, y(D, n2);
}
function y(n2, u2, i2) {
  var o2 = h(t2++, 2);
  if (o2.t = n2, !o2.__c && (o2.__ = [i2 ? i2(u2) : D(void 0, u2), function(n3) {
    var t3 = o2.__N ? o2.__N[0] : o2.__[0], r4 = o2.t(t3, n3);
    t3 !== r4 && (o2.__N = [r4, o2.__[1]], o2.__c.setState({}));
  }], o2.__c = r3, !r3.u)) {
    var f2 = function(n3, t3, r4) {
      if (!o2.__c.__H) return true;
      var u3 = o2.__c.__H.__.filter(function(n4) {
        return !!n4.__c;
      });
      if (u3.every(function(n4) {
        return !n4.__N;
      })) return !c2 || c2.call(this, n3, t3, r4);
      var i3 = false;
      return u3.forEach(function(n4) {
        if (n4.__N) {
          var t4 = n4.__[0];
          n4.__ = n4.__N, n4.__N = void 0, t4 !== n4.__[0] && (i3 = true);
        }
      }), !(!i3 && o2.__c.props === n3) && (!c2 || c2.call(this, n3, t3, r4));
    };
    r3.u = true;
    var c2 = r3.shouldComponentUpdate, e3 = r3.componentWillUpdate;
    r3.componentWillUpdate = function(n3, t3, r4) {
      if (this.__e) {
        var u3 = c2;
        c2 = void 0, f2(n3, t3, r4), c2 = u3;
      }
      e3 && e3.call(this, n3, t3, r4);
    }, r3.shouldComponentUpdate = f2;
  }
  return o2.__N || o2.__;
}
function _(n2, u2) {
  var i2 = h(t2++, 3);
  !e2.__s && C(i2.__H, u2) && (i2.__ = n2, i2.i = u2, r3.__H.__h.push(i2));
}
function A(n2, u2) {
  var i2 = h(t2++, 4);
  !e2.__s && C(i2.__H, u2) && (i2.__ = n2, i2.i = u2, r3.__h.push(i2));
}
function F(n2) {
  return o = 5, q(function() {
    return {
      current: n2
    };
  }, []);
}
function T(n2, t3, r4) {
  o = 6, A(function() {
    return "function" == typeof n2 ? (n2(t3()), function() {
      return n2(null);
    }) : n2 ? (n2.current = t3(), function() {
      return n2.current = null;
    }) : void 0;
  }, null == r4 ? r4 : r4.concat(n2));
}
function q(n2, r4) {
  var u2 = h(t2++, 7);
  return C(u2.__H, r4) ? (u2.__V = n2(), u2.i = r4, u2.__h = n2, u2.__V) : u2.__;
}
function x(n2, t3) {
  return o = 8, q(function() {
    return n2;
  }, t3);
}
function P(n2) {
  var u2 = r3.context[n2.__c], i2 = h(t2++, 9);
  return i2.c = n2, u2 ? (null == i2.__ && (i2.__ = true, u2.sub(r3)), u2.props.value) : n2.__;
}
function V(n2, t3) {
  e2.useDebugValue && e2.useDebugValue(t3 ? t3(n2) : n2);
}
function b(n2) {
  var u2 = h(t2++, 10), i2 = p();
  return u2.__ = n2, r3.componentDidCatch || (r3.componentDidCatch = function(n3, t3) {
    u2.__ && u2.__(n3, t3), i2[1](n3);
  }), [i2[0], function() {
    i2[1](void 0);
  }];
}
function g() {
  var n2 = h(t2++, 11);
  if (!n2.__) {
    for (var u2 = r3.__v; null !== u2 && !u2.__m && null !== u2.__; ) u2 = u2.__;
    var i2 = u2.__m || (u2.__m = [0, 0]);
    n2.__ = "P" + i2[0] + "-" + i2[1]++;
  }
  return n2.__;
}
function j() {
  for (var n2; n2 = f.shift(); ) if (n2.__P && n2.__H) try {
    n2.__H.__h.forEach(z), n2.__H.__h.forEach(B), n2.__H.__h = [];
  } catch (t3) {
    n2.__H.__h = [], e2.__e(t3, n2.__v);
  }
}
e2.__b = function(n2) {
  r3 = null, a && a(n2);
}, e2.__ = function(n2, t3) {
  t3.__k && t3.__k.__m && (n2.__m = t3.__k.__m), d && d(n2, t3);
}, e2.__r = function(n2) {
  v && v(n2), t2 = 0;
  var i2 = (r3 = n2.__c).__H;
  i2 && (u === r3 ? (i2.__h = [], r3.__h = [], i2.__.forEach(function(n3) {
    n3.__N && (n3.__ = n3.__N), n3.__V = c, n3.__N = n3.i = void 0;
  })) : (i2.__h.forEach(z), i2.__h.forEach(B), i2.__h = [], t2 = 0)), u = r3;
}, e2.diffed = function(n2) {
  l && l(n2);
  var t3 = n2.__c;
  t3 && t3.__H && (t3.__H.__h.length && (1 !== f.push(t3) && i === e2.requestAnimationFrame || ((i = e2.requestAnimationFrame) || w)(j)), t3.__H.__.forEach(function(n3) {
    n3.i && (n3.__H = n3.i), n3.__V !== c && (n3.__ = n3.__V), n3.i = void 0, n3.__V = c;
  })), u = r3 = null;
}, e2.__c = function(n2, t3) {
  t3.some(function(n3) {
    try {
      n3.__h.forEach(z), n3.__h = n3.__h.filter(function(n4) {
        return !n4.__ || B(n4);
      });
    } catch (r4) {
      t3.some(function(n4) {
        n4.__h && (n4.__h = []);
      }), t3 = [], e2.__e(r4, n3.__v);
    }
  }), m && m(n2, t3);
}, e2.unmount = function(n2) {
  s && s(n2);
  var t3, r4 = n2.__c;
  r4 && r4.__H && (r4.__H.__.forEach(function(n3) {
    try {
      z(n3);
    } catch (n4) {
      t3 = n4;
    }
  }), r4.__H = void 0, t3 && e2.__e(t3, r4.__v));
};
var k = "function" == typeof requestAnimationFrame;
function w(n2) {
  var t3, r4 = function() {
    clearTimeout(u2), k && cancelAnimationFrame(t3), setTimeout(n2);
  }, u2 = setTimeout(r4, 100);
  k && (t3 = requestAnimationFrame(r4));
}
function z(n2) {
  var t3 = r3, u2 = n2.__c;
  "function" == typeof u2 && (n2.__c = void 0, u2()), r3 = t3;
}
function B(n2) {
  var t3 = r3;
  n2.__c = n2.__(), r3 = t3;
}
function C(n2, t3) {
  return !n2 || n2.length !== t3.length || t3.some(function(t4, r4) {
    return t4 !== n2[r4];
  });
}
function D(n2, t3) {
  return "function" == typeof t3 ? t3(n2) : t3;
}
var hooks = {
  __proto__: null,
  useCallback: x,
  useContext: P,
  useDebugValue: V,
  useEffect: _,
  useErrorBoundary: b,
  useId: g,
  useImperativeHandle: T,
  useLayoutEffect: A,
  useMemo: q,
  useReducer: y,
  useRef: F,
  useState: p
};
var XMLNS$1 = "http://www.w3.org/2000/svg";
function SentryLogo() {
  const createElementNS = (tagName) => DOCUMENT.createElementNS(XMLNS$1, tagName);
  const svg = setAttributesNS(createElementNS("svg"), {
    width: "32",
    height: "30",
    viewBox: "0 0 72 66",
    fill: "inherit"
  });
  const path = setAttributesNS(createElementNS("path"), {
    transform: "translate(11, 11)",
    d: "M29,2.26a4.67,4.67,0,0,0-8,0L14.42,13.53A32.21,32.21,0,0,1,32.17,40.19H27.55A27.68,27.68,0,0,0,12.09,17.47L6,28a15.92,15.92,0,0,1,9.23,12.17H4.62A.76.76,0,0,1,4,39.06l2.94-5a10.74,10.74,0,0,0-3.36-1.9l-2.91,5a4.54,4.54,0,0,0,1.69,6.24A4.66,4.66,0,0,0,4.62,44H19.15a19.4,19.4,0,0,0-8-17.31l2.31-4A23.87,23.87,0,0,1,23.76,44H36.07a35.88,35.88,0,0,0-16.41-31.8l4.67-8a.77.77,0,0,1,1.05-.27c.53.29,20.29,34.77,20.66,35.17a.76.76,0,0,1-.68,1.13H40.6q.09,1.91,0,3.81h4.78A4.59,4.59,0,0,0,50,39.43a4.49,4.49,0,0,0-.62-2.28Z"
  });
  svg.appendChild(path);
  return svg;
}
var _jsxFileName$5 = "/home/runner/work/sentry-javascript/sentry-javascript/packages/feedback/src/modal/components/DialogHeader.tsx";
function DialogHeader({
  options
}) {
  const logoHtml = q(() => ({
    __html: SentryLogo().outerHTML
  }), []);
  return y$1("h2", {
    class: "dialog__header",
    __self: this,
    __source: {
      fileName: _jsxFileName$5,
      lineNumber: 16
    }
  }, options.formTitle, options.showBranding ? y$1("a", {
    class: "brand-link",
    target: "_blank",
    href: "https://sentry.io/welcome/",
    title: "Powered by Sentry",
    rel: "noopener noreferrer",
    dangerouslySetInnerHTML: logoHtml,
    __self: this,
    __source: {
      fileName: _jsxFileName$5,
      lineNumber: 19
    }
  }) : null);
}
function getMissingFields(feedback, props) {
  const emptyFields = [];
  if (props.isNameRequired && !feedback.name) {
    emptyFields.push(props.nameLabel);
  }
  if (props.isEmailRequired && !feedback.email) {
    emptyFields.push(props.emailLabel);
  }
  if (!feedback.message) {
    emptyFields.push(props.messageLabel);
  }
  return emptyFields;
}
var _jsxFileName$4 = "/home/runner/work/sentry-javascript/sentry-javascript/packages/feedback/src/modal/components/Form.tsx";
function retrieveStringValue(formData, key) {
  const value = formData.get(key);
  if (typeof value === "string") {
    return value.trim();
  }
  return "";
}
function Form({
  options,
  defaultEmail,
  defaultName,
  onFormClose,
  onSubmit,
  onSubmitSuccess,
  onSubmitError,
  showEmail,
  showName,
  screenshotInput
}) {
  const {
    tags,
    addScreenshotButtonLabel,
    removeScreenshotButtonLabel,
    cancelButtonLabel,
    emailLabel,
    emailPlaceholder,
    isEmailRequired,
    isNameRequired,
    messageLabel,
    messagePlaceholder,
    nameLabel,
    namePlaceholder,
    submitButtonLabel,
    isRequiredLabel
  } = options;
  const [error, setError] = p(null);
  const [showScreenshotInput, setShowScreenshotInput] = p(false);
  const ScreenshotInputComponent = screenshotInput && screenshotInput.input;
  const [screenshotError, setScreenshotError] = p(null);
  const onScreenshotError = x((error2) => {
    setScreenshotError(error2);
    setShowScreenshotInput(false);
  }, []);
  const hasAllRequiredFields = x((data) => {
    const missingFields = getMissingFields(data, {
      emailLabel,
      isEmailRequired,
      isNameRequired,
      messageLabel,
      nameLabel
    });
    if (missingFields.length > 0) {
      setError(`Please enter in the following required fields: ${missingFields.join(", ")}`);
    } else {
      setError(null);
    }
    return missingFields.length === 0;
  }, [emailLabel, isEmailRequired, isNameRequired, messageLabel, nameLabel]);
  const handleSubmit = x((e3) => __async(this, null, function* () {
    try {
      e3.preventDefault();
      if (!(e3.target instanceof HTMLFormElement)) {
        return;
      }
      const formData = new FormData(e3.target);
      const attachment = yield screenshotInput && showScreenshotInput ? screenshotInput.value() : void 0;
      const data = {
        name: retrieveStringValue(formData, "name"),
        email: retrieveStringValue(formData, "email"),
        message: retrieveStringValue(formData, "message"),
        attachments: attachment ? [attachment] : void 0
      };
      if (!hasAllRequiredFields(data)) {
        return;
      }
      try {
        yield onSubmit({
          name: data.name,
          email: data.email,
          message: data.message,
          source: FEEDBACK_WIDGET_SOURCE,
          tags
        }, {
          attachments: data.attachments
        });
        onSubmitSuccess(data);
      } catch (error2) {
        DEBUG_BUILD6 && logger.error(error2);
        setError(error2);
        onSubmitError(error2);
      }
    } catch (e22) {
    }
  }), [screenshotInput && showScreenshotInput, onSubmitSuccess, onSubmitError]);
  return y$1("form", {
    class: "form",
    onSubmit: handleSubmit,
    __self: this,
    __source: {
      fileName: _jsxFileName$4,
      lineNumber: 144
    }
  }, ScreenshotInputComponent && showScreenshotInput ? y$1(ScreenshotInputComponent, {
    onError: onScreenshotError,
    __self: this,
    __source: {
      fileName: _jsxFileName$4,
      lineNumber: 146
    }
  }) : null, y$1("div", {
    class: "form__right",
    "data-sentry-feedback": true,
    __self: this,
    __source: {
      fileName: _jsxFileName$4,
      lineNumber: 149
    }
  }, y$1("div", {
    class: "form__top",
    __self: this,
    __source: {
      fileName: _jsxFileName$4,
      lineNumber: 150
    }
  }, error ? y$1("div", {
    class: "form__error-container",
    __self: this,
    __source: {
      fileName: _jsxFileName$4,
      lineNumber: 151
    }
  }, error) : null, showName ? y$1("label", {
    for: "name",
    class: "form__label",
    __self: this,
    __source: {
      fileName: _jsxFileName$4,
      lineNumber: 154
    }
  }, y$1(LabelText, {
    label: nameLabel,
    isRequiredLabel,
    isRequired: isNameRequired,
    __self: this,
    __source: {
      fileName: _jsxFileName$4,
      lineNumber: 155
    }
  }), y$1("input", {
    class: "form__input",
    defaultValue: defaultName,
    id: "name",
    name: "name",
    placeholder: namePlaceholder,
    required: isNameRequired,
    type: "text",
    __self: this,
    __source: {
      fileName: _jsxFileName$4,
      lineNumber: 156
    }
  })) : y$1("input", {
    "aria-hidden": true,
    value: defaultName,
    name: "name",
    type: "hidden",
    __self: this,
    __source: {
      fileName: _jsxFileName$4,
      lineNumber: 167
    }
  }), showEmail ? y$1("label", {
    for: "email",
    class: "form__label",
    __self: this,
    __source: {
      fileName: _jsxFileName$4,
      lineNumber: 171
    }
  }, y$1(LabelText, {
    label: emailLabel,
    isRequiredLabel,
    isRequired: isEmailRequired,
    __self: this,
    __source: {
      fileName: _jsxFileName$4,
      lineNumber: 172
    }
  }), y$1("input", {
    class: "form__input",
    defaultValue: defaultEmail,
    id: "email",
    name: "email",
    placeholder: emailPlaceholder,
    required: isEmailRequired,
    type: "email",
    __self: this,
    __source: {
      fileName: _jsxFileName$4,
      lineNumber: 173
    }
  })) : y$1("input", {
    "aria-hidden": true,
    value: defaultEmail,
    name: "email",
    type: "hidden",
    __self: this,
    __source: {
      fileName: _jsxFileName$4,
      lineNumber: 184
    }
  }), y$1("label", {
    for: "message",
    class: "form__label",
    __self: this,
    __source: {
      fileName: _jsxFileName$4,
      lineNumber: 187
    }
  }, y$1(LabelText, {
    label: messageLabel,
    isRequiredLabel,
    isRequired: true,
    __self: this,
    __source: {
      fileName: _jsxFileName$4,
      lineNumber: 188
    }
  }), y$1("textarea", {
    autoFocus: true,
    class: "form__input form__input--textarea",
    id: "message",
    name: "message",
    placeholder: messagePlaceholder,
    required: true,
    rows: 5,
    __self: this,
    __source: {
      fileName: _jsxFileName$4,
      lineNumber: 189
    }
  })), ScreenshotInputComponent ? y$1("label", {
    for: "screenshot",
    class: "form__label",
    __self: this,
    __source: {
      fileName: _jsxFileName$4,
      lineNumber: 201
    }
  }, y$1("button", {
    class: "btn btn--default",
    type: "button",
    onClick: () => {
      setScreenshotError(null);
      setShowScreenshotInput((prev) => !prev);
    },
    __self: this,
    __source: {
      fileName: _jsxFileName$4,
      lineNumber: 202
    }
  }, showScreenshotInput ? removeScreenshotButtonLabel : addScreenshotButtonLabel), screenshotError ? y$1("div", {
    class: "form__error-container",
    __self: this,
    __source: {
      fileName: _jsxFileName$4,
      lineNumber: 212
    }
  }, screenshotError.message) : null) : null), y$1("div", {
    class: "btn-group",
    __self: this,
    __source: {
      fileName: _jsxFileName$4,
      lineNumber: 216
    }
  }, y$1("button", {
    class: "btn btn--primary",
    type: "submit",
    __self: this,
    __source: {
      fileName: _jsxFileName$4,
      lineNumber: 217
    }
  }, submitButtonLabel), y$1("button", {
    class: "btn btn--default",
    type: "button",
    onClick: onFormClose,
    __self: this,
    __source: {
      fileName: _jsxFileName$4,
      lineNumber: 220
    }
  }, cancelButtonLabel))));
}
function LabelText({
  label,
  isRequired,
  isRequiredLabel
}) {
  return y$1("span", {
    class: "form__label__text",
    __self: this,
    __source: {
      fileName: _jsxFileName$4,
      lineNumber: 239
    }
  }, label, isRequired && y$1("span", {
    class: "form__label__text--required",
    __self: this,
    __source: {
      fileName: _jsxFileName$4,
      lineNumber: 241
    }
  }, isRequiredLabel));
}
var WIDTH = 16;
var HEIGHT = 17;
var XMLNS = "http://www.w3.org/2000/svg";
function SuccessIcon() {
  const createElementNS = (tagName) => WINDOW9.document.createElementNS(XMLNS, tagName);
  const svg = setAttributesNS(createElementNS("svg"), {
    width: `${WIDTH}`,
    height: `${HEIGHT}`,
    viewBox: `0 0 ${WIDTH} ${HEIGHT}`,
    fill: "inherit"
  });
  const g2 = setAttributesNS(createElementNS("g"), {
    clipPath: "url(#clip0_57_156)"
  });
  const path2 = setAttributesNS(createElementNS("path"), {
    ["fill-rule"]: "evenodd",
    ["clip-rule"]: "evenodd",
    d: "M3.55544 15.1518C4.87103 16.0308 6.41775 16.5 8 16.5C10.1217 16.5 12.1566 15.6571 13.6569 14.1569C15.1571 12.6566 16 10.6217 16 8.5C16 6.91775 15.5308 5.37103 14.6518 4.05544C13.7727 2.73985 12.5233 1.71447 11.0615 1.10897C9.59966 0.503466 7.99113 0.34504 6.43928 0.653721C4.88743 0.962403 3.46197 1.72433 2.34315 2.84315C1.22433 3.96197 0.462403 5.38743 0.153721 6.93928C-0.15496 8.49113 0.00346625 10.0997 0.608967 11.5615C1.21447 13.0233 2.23985 14.2727 3.55544 15.1518ZM4.40546 3.1204C5.46945 2.40946 6.72036 2.03 8 2.03C9.71595 2.03 11.3616 2.71166 12.575 3.92502C13.7883 5.13838 14.47 6.78405 14.47 8.5C14.47 9.77965 14.0905 11.0306 13.3796 12.0945C12.6687 13.1585 11.6582 13.9878 10.476 14.4775C9.29373 14.9672 7.99283 15.0953 6.73777 14.8457C5.48271 14.596 4.32987 13.9798 3.42502 13.075C2.52018 12.1701 1.90397 11.0173 1.65432 9.76224C1.40468 8.50718 1.5328 7.20628 2.0225 6.02404C2.5122 4.8418 3.34148 3.83133 4.40546 3.1204Z"
  });
  const path = setAttributesNS(createElementNS("path"), {
    d: "M6.68775 12.4297C6.78586 12.4745 6.89218 12.4984 7 12.5C7.11275 12.4955 7.22315 12.4664 7.32337 12.4145C7.4236 12.3627 7.51121 12.2894 7.58 12.2L12 5.63999C12.0848 5.47724 12.1071 5.28902 12.0625 5.11098C12.0178 4.93294 11.9095 4.77744 11.7579 4.67392C11.6064 4.57041 11.4221 4.52608 11.24 4.54931C11.0579 4.57254 10.8907 4.66173 10.77 4.79999L6.88 10.57L5.13 8.56999C5.06508 8.49566 4.98613 8.43488 4.89768 8.39111C4.80922 8.34735 4.713 8.32148 4.61453 8.31498C4.51605 8.30847 4.41727 8.32147 4.32382 8.35322C4.23038 8.38497 4.14413 8.43484 4.07 8.49999C3.92511 8.63217 3.83692 8.81523 3.82387 9.01092C3.81083 9.2066 3.87393 9.39976 4 9.54999L6.43 12.24C6.50187 12.3204 6.58964 12.385 6.68775 12.4297Z"
  });
  svg.appendChild(g2).append(path, path2);
  const speakerDefs = createElementNS("defs");
  const speakerClipPathDef = setAttributesNS(createElementNS("clipPath"), {
    id: "clip0_57_156"
  });
  const speakerRect = setAttributesNS(createElementNS("rect"), {
    width: `${WIDTH}`,
    height: `${WIDTH}`,
    fill: "white",
    transform: "translate(0 0.5)"
  });
  speakerClipPathDef.appendChild(speakerRect);
  speakerDefs.appendChild(speakerClipPathDef);
  svg.appendChild(speakerDefs).appendChild(speakerClipPathDef).appendChild(speakerRect);
  return svg;
}
var _jsxFileName$3 = "/home/runner/work/sentry-javascript/sentry-javascript/packages/feedback/src/modal/components/Dialog.tsx";
function Dialog(_a) {
  var _b = _a, {
    open,
    onFormSubmitted
  } = _b, props = __objRest(_b, [
    "open",
    "onFormSubmitted"
  ]);
  const options = props.options;
  const successIconHtml = q(() => ({
    __html: SuccessIcon().outerHTML
  }), []);
  const [timeoutId, setTimeoutId] = p(null);
  const handleOnSuccessClick = x(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    onFormSubmitted();
  }, [timeoutId]);
  const onSubmitSuccess = x((data) => {
    props.onSubmitSuccess(data);
    setTimeoutId(setTimeout(() => {
      onFormSubmitted();
      setTimeoutId(null);
    }, SUCCESS_MESSAGE_TIMEOUT));
  }, [onFormSubmitted]);
  return y$1(g$1, {
    __self: this,
    __source: {
      fileName: _jsxFileName$3,
      lineNumber: 48
    }
  }, timeoutId ? y$1("div", {
    class: "success__position",
    onClick: handleOnSuccessClick,
    __self: this,
    __source: {
      fileName: _jsxFileName$3,
      lineNumber: 50
    }
  }, y$1("div", {
    class: "success__content",
    __self: this,
    __source: {
      fileName: _jsxFileName$3,
      lineNumber: 51
    }
  }, options.successMessageText, y$1("span", {
    class: "success__icon",
    dangerouslySetInnerHTML: successIconHtml,
    __self: this,
    __source: {
      fileName: _jsxFileName$3,
      lineNumber: 53
    }
  }))) : y$1("dialog", {
    class: "dialog",
    onClick: options.onFormClose,
    open,
    __self: this,
    __source: {
      fileName: _jsxFileName$3,
      lineNumber: 57
    }
  }, y$1("div", {
    class: "dialog__position",
    __self: this,
    __source: {
      fileName: _jsxFileName$3,
      lineNumber: 58
    }
  }, y$1("div", {
    class: "dialog__content",
    onClick: (e3) => {
      e3.stopPropagation();
    },
    __self: this,
    __source: {
      fileName: _jsxFileName$3,
      lineNumber: 59
    }
  }, y$1(DialogHeader, {
    options,
    __self: this,
    __source: {
      fileName: _jsxFileName$3,
      lineNumber: 66
    }
  }), y$1(Form, __spreadProps(__spreadValues({}, props), {
    onSubmitSuccess,
    __self: this,
    __source: {
      fileName: _jsxFileName$3,
      lineNumber: 67
    }
  }))))));
}
var DIALOG = `
.dialog {
  position: fixed;
  z-index: var(--z-index);
  margin: 0;
  inset: 0;

  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  height: 100vh;
  width: 100vw;

  color: var(--dialog-color, var(--foreground));
  fill: var(--dialog-color, var(--foreground));
  line-height: 1.75em;

  background-color: rgba(0, 0, 0, 0.05);
  border: none;
  inset: 0;
  opacity: 1;
  transition: opacity 0.2s ease-in-out;
}

.dialog__position {
  position: fixed;
  z-index: var(--z-index);
  inset: var(--dialog-inset);
  padding: var(--page-margin);
  display: flex;
  max-height: calc(100vh - (2 * var(--page-margin)));
}
@media (max-width: 600px) {
  .dialog__position {
    inset: var(--page-margin);
    padding: 0;
  }
}

.dialog__position:has(.editor) {
  inset: var(--page-margin);
  padding: 0;
}

.dialog:not([open]) {
  opacity: 0;
  pointer-events: none;
  visibility: hidden;
}
.dialog:not([open]) .dialog__content {
  transform: translate(0, -16px) scale(0.98);
}

.dialog__content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: var(--dialog-padding, 24px);
  max-width: 100%;
  width: 100%;
  max-height: 100%;
  overflow: auto;

  background: var(--dialog-background, var(--background));
  border-radius: var(--dialog-border-radius, 20px);
  border: var(--dialog-border, var(--border));
  box-shadow: var(--dialog-box-shadow, var(--box-shadow));
  transform: translate(0, 0) scale(1);
  transition: transform 0.2s ease-in-out;
}
`;
var DIALOG_HEADER = `
.dialog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: var(--dialog-header-weight, 600);
  margin: 0;
}

.brand-link {
  display: inline-flex;
}
.brand-link:focus-visible {
  outline: var(--outline);
}
`;
var FORM = `
.form {
  display: flex;
  overflow: auto;
  flex-direction: row;
  gap: 16px;
  flex: 1 0;
}

.form__right {
  flex: 0 0 auto;
  width: var(--form-width, 272px);
  display: flex;
  overflow: auto;
  flex-direction: column;
  justify-content: space-between;
  gap: 20px;
}

@media (max-width: 600px) {
  .form__right {
    width: var(--form-width, 100%);
  }
}

.form__top {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form__error-container {
  color: var(--error-color);
  fill: var(--error-color);
}

.form__label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 0px;
}

.form__label__text {
  display: flex;
  gap: 4px;
  align-items: center;
}

.form__label__text--required {
  font-size: 0.85em;
}

.form__input {
  font-family: inherit;
  line-height: inherit;
  background: transparent;
  box-sizing: border-box;
  border: var(--input-border, var(--border));
  border-radius: var(--input-border-radius, 6px);
  color: var(--input-color, inherit);
  fill: var(--input-color, inherit);
  font-size: var(--input-font-size, inherit);
  font-weight: var(--input-font-weight, 500);
  padding: 6px 12px;
}

.form__input::placeholder {
  opacity: 0.65;
  color: var(--input-placeholder-color, inherit);
  filter: var(--interactive-filter);
}

.form__input:focus-visible {
  outline: var(--input-focus-outline, var(--outline));
}

.form__input--textarea {
  font-family: inherit;
  resize: vertical;
}

.error {
  color: var(--error-color);
  fill: var(--error-color);
}
`;
var BUTTON = `
.btn-group {
  display: grid;
  gap: 8px;
}

.btn {
  line-height: inherit;
  border: var(--button-border, var(--border));
  border-radius: var(--button-border-radius, 6px);
  cursor: pointer;
  font-family: inherit;
  font-size: var(--button-font-size, inherit);
  font-weight: var(--button-font-weight, 600);
  padding: var(--button-padding, 6px 16px);
}
.btn[disabled] {
  opacity: 0.6;
  pointer-events: none;
}

.btn--primary {
  color: var(--button-primary-color, var(--accent-foreground));
  fill: var(--button-primary-color, var(--accent-foreground));
  background: var(--button-primary-background, var(--accent-background));
  border: var(--button-primary-border, var(--border));
  border-radius: var(--button-primary-border-radius, 6px);
  font-weight: var(--button-primary-font-weight, 500);
}
.btn--primary:hover {
  color: var(--button-primary-hover-color, var(--accent-foreground));
  fill: var(--button-primary-hover-color, var(--accent-foreground));
  background: var(--button-primary-hover-background, var(--accent-background));
  filter: var(--interactive-filter);
}
.btn--primary:focus-visible {
  background: var(--button-primary-hover-background, var(--accent-background));
  filter: var(--interactive-filter);
  outline: var(--button-primary-focus-outline, var(--outline));
}

.btn--default {
  color: var(--button-color, var(--foreground));
  fill: var(--button-color, var(--foreground));
  background: var(--button-background, var(--background));
  border: var(--button-border, var(--border));
  border-radius: var(--button-border-radius, 6px);
  font-weight: var(--button-font-weight, 500);
}
.btn--default:hover {
  color: var(--button-color, var(--foreground));
  fill: var(--button-color, var(--foreground));
  background: var(--button-hover-background, var(--background));
  filter: var(--interactive-filter);
}
.btn--default:focus-visible {
  background: var(--button-hover-background, var(--background));
  filter: var(--interactive-filter);
  outline: var(--button-focus-outline, var(--outline));
}
`;
var SUCCESS = `
.success__position {
  position: fixed;
  inset: var(--dialog-inset);
  padding: var(--page-margin);
  z-index: var(--z-index);
}
.success__content {
  background: var(--success-background, var(--background));
  border: var(--success-border, var(--border));
  border-radius: var(--success-border-radius, 1.7em/50%);
  box-shadow: var(--success-box-shadow, var(--box-shadow));
  font-weight: var(--success-font-weight, 600);
  color: var(--success-color);
  fill: var(--success-color);
  padding: 12px 24px;
  line-height: 1.75em;

  display: grid;
  align-items: center;
  grid-auto-flow: column;
  gap: 6px;
  cursor: default;
}

.success__icon {
  display: flex;
}
`;
function createDialogStyles(styleNonce) {
  const style = DOCUMENT.createElement("style");
  style.textContent = `
:host {
  --dialog-inset: var(--inset);
}

${DIALOG}
${DIALOG_HEADER}
${FORM}
${BUTTON}
${SUCCESS}
`;
  if (styleNonce) {
    style.setAttribute("nonce", styleNonce);
  }
  return style;
}
var _jsxFileName$2 = "/home/runner/work/sentry-javascript/sentry-javascript/packages/feedback/src/modal/integration.tsx";
function getUser() {
  const currentUser = getCurrentScope().getUser();
  const isolationUser = getIsolationScope().getUser();
  const globalUser = getGlobalScope().getUser();
  if (currentUser && Object.keys(currentUser).length) {
    return currentUser;
  }
  if (isolationUser && Object.keys(isolationUser).length) {
    return isolationUser;
  }
  return globalUser;
}
var feedbackModalIntegration = () => {
  return {
    name: "FeedbackModal",
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    setupOnce() {
    },
    createDialog: ({
      options,
      screenshotIntegration,
      sendFeedback: sendFeedback2,
      shadow
    }) => {
      const shadowRoot = shadow;
      const userKey = options.useSentryUser;
      const user = getUser();
      const el = DOCUMENT.createElement("div");
      const style = createDialogStyles(options.styleNonce);
      let originalOverflow = "";
      const dialog = {
        get el() {
          return el;
        },
        appendToDom() {
          if (!shadowRoot.contains(style) && !shadowRoot.contains(el)) {
            shadowRoot.appendChild(style);
            shadowRoot.appendChild(el);
          }
        },
        removeFromDom() {
          shadowRoot.removeChild(el);
          shadowRoot.removeChild(style);
          DOCUMENT.body.style.overflow = originalOverflow;
        },
        open() {
          renderContent(true);
          options.onFormOpen && options.onFormOpen();
          originalOverflow = DOCUMENT.body.style.overflow;
          DOCUMENT.body.style.overflow = "hidden";
        },
        close() {
          renderContent(false);
          DOCUMENT.body.style.overflow = originalOverflow;
        }
      };
      const screenshotInput = screenshotIntegration && screenshotIntegration.createInput({
        h: y$1,
        hooks,
        dialog,
        options
      });
      const renderContent = (open) => {
        B$1(y$1(Dialog, {
          options,
          screenshotInput,
          showName: options.showName || options.isNameRequired,
          showEmail: options.showEmail || options.isEmailRequired,
          defaultName: userKey && user && user[userKey.name] || "",
          defaultEmail: userKey && user && user[userKey.email] || "",
          onFormClose: () => {
            renderContent(false);
            options.onFormClose && options.onFormClose();
          },
          onSubmit: sendFeedback2,
          onSubmitSuccess: (data) => {
            renderContent(false);
            options.onSubmitSuccess && options.onSubmitSuccess(data);
          },
          onSubmitError: (error) => {
            options.onSubmitError && options.onSubmitError(error);
          },
          onFormSubmitted: () => {
            options.onFormSubmitted && options.onFormSubmitted();
          },
          open,
          __self: void 0,
          __source: {
            fileName: _jsxFileName$2,
            lineNumber: 67
          }
        }), el);
      };
      return dialog;
    }
  };
};
var _jsxFileName$1 = "/home/runner/work/sentry-javascript/sentry-javascript/packages/feedback/src/screenshot/components/CropCorner.tsx";
function CropCornerFactory({
  h: h2
  // eslint-disable-line @typescript-eslint/no-unused-vars
}) {
  return function CropCorner({
    top,
    left,
    corner,
    onGrabButton
  }) {
    return h2("button", {
      class: `editor__crop-corner editor__crop-corner--${corner} `,
      style: {
        top,
        left
      },
      onMouseDown: (e3) => {
        e3.preventDefault();
        onGrabButton(e3, corner);
      },
      onClick: (e3) => {
        e3.preventDefault();
      },
      __self: this,
      __source: {
        fileName: _jsxFileName$1,
        lineNumber: 22
      }
    });
  };
}
function createScreenshotInputStyles(styleNonce) {
  const style = DOCUMENT.createElement("style");
  const surface200 = "#1A141F";
  const gray100 = "#302735";
  style.textContent = `
.editor {
  padding: 10px;
  padding-top: 65px;
  padding-bottom: 65px;
  flex-grow: 1;

  background-color: ${surface200};
  background-image: repeating-linear-gradient(
      -145deg,
      transparent,
      transparent 8px,
      ${surface200} 8px,
      ${surface200} 11px
    ),
    repeating-linear-gradient(
      -45deg,
      transparent,
      transparent 15px,
      ${gray100} 15px,
      ${gray100} 16px
    );
}

.editor__canvas-container {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.editor__canvas-container canvas {
  object-fit: contain;
  position: relative;
}

.editor__crop-btn-group {
  padding: 8px;
  gap: 8px;
  border-radius: var(--menu-border-radius, 6px);
  background: var(--button-primary-background, var(--background));
  width: 175px;
  position: absolute;
}

.editor__crop-corner {
  width: 30px;
  height: 30px;
  position: absolute;
  background: none;
  border: 3px solid #ffffff;
}

.editor__crop-corner--top-left {
  cursor: nwse-resize;
  border-right: none;
  border-bottom: none;
}
.editor__crop-corner--top-right {
  cursor: nesw-resize;
  border-left: none;
  border-bottom: none;
}
.editor__crop-corner--bottom-left {
  cursor: nesw-resize;
  border-right: none;
  border-top: none;
}
.editor__crop-corner--bottom-right {
  cursor: nwse-resize;
  border-left: none;
  border-top: none;
}
`;
  if (styleNonce) {
    style.setAttribute("nonce", styleNonce);
  }
  return style;
}
function useTakeScreenshotFactory({
  hooks: hooks2
}) {
  return function useTakeScreenshot({
    onBeforeScreenshot,
    onScreenshot,
    onAfterScreenshot,
    onError
  }) {
    hooks2.useEffect(() => {
      const takeScreenshot = () => __async(this, null, function* () {
        onBeforeScreenshot();
        const stream = yield NAVIGATOR.mediaDevices.getDisplayMedia({
          video: {
            width: WINDOW9.innerWidth * WINDOW9.devicePixelRatio,
            height: WINDOW9.innerHeight * WINDOW9.devicePixelRatio
          },
          audio: false,
          // @ts-expect-error experimental flags: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia#prefercurrenttab
          monitorTypeSurfaces: "exclude",
          preferCurrentTab: true,
          selfBrowserSurface: "include",
          surfaceSwitching: "exclude"
        });
        const video = DOCUMENT.createElement("video");
        yield new Promise((resolve2, reject) => {
          video.srcObject = stream;
          video.onloadedmetadata = () => {
            onScreenshot(video);
            stream.getTracks().forEach((track) => track.stop());
            resolve2();
          };
          video.play().catch(reject);
        });
        onAfterScreenshot();
      });
      takeScreenshot().catch(onError);
    }, []);
  };
}
var _jsxFileName = "/home/runner/work/sentry-javascript/sentry-javascript/packages/feedback/src/screenshot/components/ScreenshotEditor.tsx";
var CROP_BUTTON_SIZE = 30;
var CROP_BUTTON_BORDER = 3;
var CROP_BUTTON_OFFSET = CROP_BUTTON_SIZE + CROP_BUTTON_BORDER;
var DPI = WINDOW9.devicePixelRatio;
var constructRect = (box) => {
  return {
    x: Math.min(box.startX, box.endX),
    y: Math.min(box.startY, box.endY),
    width: Math.abs(box.startX - box.endX),
    height: Math.abs(box.startY - box.endY)
  };
};
var getContainedSize = (img) => {
  const imgClientHeight = img.clientHeight;
  const imgClientWidth = img.clientWidth;
  const ratio = img.width / img.height;
  let width = imgClientHeight * ratio;
  let height = imgClientHeight;
  if (width > imgClientWidth) {
    width = imgClientWidth;
    height = imgClientWidth / ratio;
  }
  const x2 = (imgClientWidth - width) / 2;
  const y2 = (imgClientHeight - height) / 2;
  return {
    startX: x2,
    startY: y2,
    endX: width + x2,
    endY: height + y2
  };
};
function ScreenshotEditorFactory({
  h: h2,
  hooks: hooks2,
  imageBuffer,
  dialog,
  options
}) {
  const useTakeScreenshot = useTakeScreenshotFactory({
    hooks: hooks2
  });
  return function ScreenshotEditor({
    onError
  }) {
    const styles = hooks2.useMemo(() => ({
      __html: createScreenshotInputStyles(options.styleNonce).innerText
    }), []);
    const CropCorner = CropCornerFactory({
      h: h2
    });
    const canvasContainerRef = hooks2.useRef(null);
    const cropContainerRef = hooks2.useRef(null);
    const croppingRef = hooks2.useRef(null);
    const [croppingRect, setCroppingRect] = hooks2.useState({
      startX: 0,
      startY: 0,
      endX: 0,
      endY: 0
    });
    const [confirmCrop, setConfirmCrop] = hooks2.useState(false);
    const [isResizing, setIsResizing] = hooks2.useState(false);
    hooks2.useEffect(() => {
      WINDOW9.addEventListener("resize", resizeCropper, false);
    }, []);
    function resizeCropper() {
      const cropper = croppingRef.current;
      const imageDimensions = constructRect(getContainedSize(imageBuffer));
      if (cropper) {
        cropper.width = imageDimensions.width * DPI;
        cropper.height = imageDimensions.height * DPI;
        cropper.style.width = `${imageDimensions.width}px`;
        cropper.style.height = `${imageDimensions.height}px`;
        const ctx = cropper.getContext("2d");
        if (ctx) {
          ctx.scale(DPI, DPI);
        }
      }
      const cropButton = cropContainerRef.current;
      if (cropButton) {
        cropButton.style.width = `${imageDimensions.width}px`;
        cropButton.style.height = `${imageDimensions.height}px`;
      }
      setCroppingRect({
        startX: 0,
        startY: 0,
        endX: imageDimensions.width,
        endY: imageDimensions.height
      });
    }
    hooks2.useEffect(() => {
      const cropper = croppingRef.current;
      if (!cropper) {
        return;
      }
      const ctx = cropper.getContext("2d");
      if (!ctx) {
        return;
      }
      const imageDimensions = constructRect(getContainedSize(imageBuffer));
      const croppingBox = constructRect(croppingRect);
      ctx.clearRect(0, 0, imageDimensions.width, imageDimensions.height);
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(0, 0, imageDimensions.width, imageDimensions.height);
      ctx.clearRect(croppingBox.x, croppingBox.y, croppingBox.width, croppingBox.height);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3;
      ctx.strokeRect(croppingBox.x + 1, croppingBox.y + 1, croppingBox.width - 2, croppingBox.height - 2);
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 1;
      ctx.strokeRect(croppingBox.x + 3, croppingBox.y + 3, croppingBox.width - 6, croppingBox.height - 6);
    }, [croppingRect]);
    function onGrabButton(e3, corner) {
      setConfirmCrop(false);
      setIsResizing(true);
      const handleMouseMove = makeHandleMouseMove(corner);
      const handleMouseUp = () => {
        DOCUMENT.removeEventListener("mousemove", handleMouseMove);
        DOCUMENT.removeEventListener("mouseup", handleMouseUp);
        setConfirmCrop(true);
        setIsResizing(false);
      };
      DOCUMENT.addEventListener("mouseup", handleMouseUp);
      DOCUMENT.addEventListener("mousemove", handleMouseMove);
    }
    const makeHandleMouseMove = hooks2.useCallback((corner) => {
      return function(e3) {
        if (!croppingRef.current) {
          return;
        }
        const cropCanvas = croppingRef.current;
        const cropBoundingRect = cropCanvas.getBoundingClientRect();
        const mouseX = e3.clientX - cropBoundingRect.x;
        const mouseY = e3.clientY - cropBoundingRect.y;
        switch (corner) {
          case "top-left":
            setCroppingRect((prev) => __spreadProps(__spreadValues({}, prev), {
              startX: Math.min(Math.max(0, mouseX), prev.endX - CROP_BUTTON_OFFSET),
              startY: Math.min(Math.max(0, mouseY), prev.endY - CROP_BUTTON_OFFSET)
            }));
            break;
          case "top-right":
            setCroppingRect((prev) => __spreadProps(__spreadValues({}, prev), {
              endX: Math.max(Math.min(mouseX, cropCanvas.width / DPI), prev.startX + CROP_BUTTON_OFFSET),
              startY: Math.min(Math.max(0, mouseY), prev.endY - CROP_BUTTON_OFFSET)
            }));
            break;
          case "bottom-left":
            setCroppingRect((prev) => __spreadProps(__spreadValues({}, prev), {
              startX: Math.min(Math.max(0, mouseX), prev.endX - CROP_BUTTON_OFFSET),
              endY: Math.max(Math.min(mouseY, cropCanvas.height / DPI), prev.startY + CROP_BUTTON_OFFSET)
            }));
            break;
          case "bottom-right":
            setCroppingRect((prev) => __spreadProps(__spreadValues({}, prev), {
              endX: Math.max(Math.min(mouseX, cropCanvas.width / DPI), prev.startX + CROP_BUTTON_OFFSET),
              endY: Math.max(Math.min(mouseY, cropCanvas.height / DPI), prev.startY + CROP_BUTTON_OFFSET)
            }));
            break;
        }
      };
    }, []);
    const initialPositionRef = hooks2.useRef({
      initialX: 0,
      initialY: 0
    });
    function onDragStart(e3) {
      if (isResizing) return;
      initialPositionRef.current = {
        initialX: e3.clientX,
        initialY: e3.clientY
      };
      const handleMouseMove = (moveEvent) => {
        const cropCanvas = croppingRef.current;
        if (!cropCanvas) return;
        const deltaX = moveEvent.clientX - initialPositionRef.current.initialX;
        const deltaY = moveEvent.clientY - initialPositionRef.current.initialY;
        setCroppingRect((prev) => {
          const newStartX = Math.max(0, Math.min(prev.startX + deltaX, cropCanvas.width / DPI - (prev.endX - prev.startX)));
          const newStartY = Math.max(0, Math.min(prev.startY + deltaY, cropCanvas.height / DPI - (prev.endY - prev.startY)));
          const newEndX = newStartX + (prev.endX - prev.startX);
          const newEndY = newStartY + (prev.endY - prev.startY);
          initialPositionRef.current.initialX = moveEvent.clientX;
          initialPositionRef.current.initialY = moveEvent.clientY;
          return {
            startX: newStartX,
            startY: newStartY,
            endX: newEndX,
            endY: newEndY
          };
        });
      };
      const handleMouseUp = () => {
        DOCUMENT.removeEventListener("mousemove", handleMouseMove);
        DOCUMENT.removeEventListener("mouseup", handleMouseUp);
      };
      DOCUMENT.addEventListener("mousemove", handleMouseMove);
      DOCUMENT.addEventListener("mouseup", handleMouseUp);
    }
    function submit() {
      const cutoutCanvas = DOCUMENT.createElement("canvas");
      const imageBox = constructRect(getContainedSize(imageBuffer));
      const croppingBox = constructRect(croppingRect);
      cutoutCanvas.width = croppingBox.width * DPI;
      cutoutCanvas.height = croppingBox.height * DPI;
      const cutoutCtx = cutoutCanvas.getContext("2d");
      if (cutoutCtx && imageBuffer) {
        cutoutCtx.drawImage(imageBuffer, croppingBox.x / imageBox.width * imageBuffer.width, croppingBox.y / imageBox.height * imageBuffer.height, croppingBox.width / imageBox.width * imageBuffer.width, croppingBox.height / imageBox.height * imageBuffer.height, 0, 0, cutoutCanvas.width, cutoutCanvas.height);
      }
      const ctx = imageBuffer.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, imageBuffer.width, imageBuffer.height);
        imageBuffer.width = cutoutCanvas.width;
        imageBuffer.height = cutoutCanvas.height;
        imageBuffer.style.width = `${croppingBox.width}px`;
        imageBuffer.style.height = `${croppingBox.height}px`;
        ctx.drawImage(cutoutCanvas, 0, 0);
        resizeCropper();
      }
    }
    useTakeScreenshot({
      onBeforeScreenshot: hooks2.useCallback(() => {
        dialog.el.style.display = "none";
      }, []),
      onScreenshot: hooks2.useCallback((imageSource) => {
        const context = imageBuffer.getContext("2d");
        if (!context) {
          throw new Error("Could not get canvas context");
        }
        imageBuffer.width = imageSource.videoWidth;
        imageBuffer.height = imageSource.videoHeight;
        imageBuffer.style.width = "100%";
        imageBuffer.style.height = "100%";
        context.drawImage(imageSource, 0, 0);
      }, [imageBuffer]),
      onAfterScreenshot: hooks2.useCallback(() => {
        dialog.el.style.display = "block";
        const container = canvasContainerRef.current;
        container && container.appendChild(imageBuffer);
        resizeCropper();
      }, []),
      onError: hooks2.useCallback((error) => {
        dialog.el.style.display = "block";
        onError(error);
      }, [])
    });
    return h2("div", {
      class: "editor",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 315
      }
    }, h2("style", {
      nonce: options.styleNonce,
      dangerouslySetInnerHTML: styles,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 316
      }
    }), h2("div", {
      class: "editor__canvas-container",
      ref: canvasContainerRef,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 317
      }
    }, h2("div", {
      class: "editor__crop-container",
      style: {
        position: "absolute",
        zIndex: 1
      },
      ref: cropContainerRef,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 318
      }
    }, h2("canvas", {
      onMouseDown: onDragStart,
      style: {
        position: "absolute",
        cursor: confirmCrop ? "move" : "auto"
      },
      ref: croppingRef,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 319
      }
    }), h2(CropCorner, {
      left: croppingRect.startX - CROP_BUTTON_BORDER,
      top: croppingRect.startY - CROP_BUTTON_BORDER,
      onGrabButton,
      corner: "top-left",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 324
      }
    }), h2(CropCorner, {
      left: croppingRect.endX - CROP_BUTTON_SIZE + CROP_BUTTON_BORDER,
      top: croppingRect.startY - CROP_BUTTON_BORDER,
      onGrabButton,
      corner: "top-right",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 330
      }
    }), h2(CropCorner, {
      left: croppingRect.startX - CROP_BUTTON_BORDER,
      top: croppingRect.endY - CROP_BUTTON_SIZE + CROP_BUTTON_BORDER,
      onGrabButton,
      corner: "bottom-left",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 336
      }
    }), h2(CropCorner, {
      left: croppingRect.endX - CROP_BUTTON_SIZE + CROP_BUTTON_BORDER,
      top: croppingRect.endY - CROP_BUTTON_SIZE + CROP_BUTTON_BORDER,
      onGrabButton,
      corner: "bottom-right",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 342
      }
    }), h2("div", {
      style: {
        left: Math.max(0, croppingRect.endX - 191),
        top: Math.max(0, croppingRect.endY + 8),
        display: confirmCrop ? "flex" : "none"
      },
      class: "editor__crop-btn-group",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 348
      }
    }, h2("button", {
      onClick: (e3) => {
        e3.preventDefault();
        if (croppingRef.current) {
          setCroppingRect({
            startX: 0,
            startY: 0,
            endX: croppingRef.current.width / DPI,
            endY: croppingRef.current.height / DPI
          });
        }
        setConfirmCrop(false);
      },
      class: "btn btn--default",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 356
      }
    }, options.cancelButtonLabel), h2("button", {
      onClick: (e3) => {
        e3.preventDefault();
        submit();
        setConfirmCrop(false);
      },
      class: "btn btn--primary",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 373
      }
    }, options.confirmButtonLabel)))));
  };
}
var feedbackScreenshotIntegration = () => {
  return {
    name: "FeedbackScreenshot",
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    setupOnce() {
    },
    createInput: ({
      h: h2,
      hooks: hooks2,
      dialog,
      options
    }) => {
      const imageBuffer = DOCUMENT.createElement("canvas");
      return {
        input: ScreenshotEditorFactory({
          h: h2,
          hooks: hooks2,
          imageBuffer,
          dialog,
          options
        }),
        // eslint-disable-line @typescript-eslint/no-explicit-any
        value: () => __async(void 0, null, function* () {
          const blob = yield new Promise((resolve2) => {
            imageBuffer.toBlob(resolve2, "image/png");
          });
          if (blob) {
            const data = new Uint8Array(yield blob.arrayBuffer());
            const attachment = {
              data,
              filename: "screenshot.png",
              contentType: "application/png"
              // attachmentType?: string;
            };
            return attachment;
          }
          return void 0;
        })
      };
    }
  };
};

// node_modules/@sentry/browser/build/npm/esm/feedbackAsync.js
var feedbackAsyncIntegration = buildFeedbackIntegration({
  lazyLoadIntegration
});

// node_modules/@sentry/browser/build/npm/esm/feedbackSync.js
var feedbackSyncIntegration = buildFeedbackIntegration({
  lazyLoadIntegration,
  getModalIntegration: () => feedbackModalIntegration,
  getScreenshotIntegration: () => feedbackScreenshotIntegration
});

// node_modules/@sentry/browser/build/npm/esm/metrics.js
function increment2(name, value = 1, data) {
  metrics.increment(BrowserMetricsAggregator, name, value, data);
}
function distribution2(name, value, data) {
  metrics.distribution(BrowserMetricsAggregator, name, value, data);
}
function set2(name, value, data) {
  metrics.set(BrowserMetricsAggregator, name, value, data);
}
function gauge2(name, value, data) {
  metrics.gauge(BrowserMetricsAggregator, name, value, data);
}
function timing2(name, value, unit = "second", data) {
  return metrics.timing(BrowserMetricsAggregator, name, value, unit, data);
}
var metrics2 = {
  increment: increment2,
  distribution: distribution2,
  set: set2,
  gauge: gauge2,
  timing: timing2
};

// node_modules/@sentry/browser/build/npm/esm/tracing/request.js
var responseToSpanId = /* @__PURE__ */ new WeakMap();
var spanIdToEndTimestamp = /* @__PURE__ */ new Map();
var defaultRequestInstrumentationOptions = {
  traceFetch: true,
  traceXHR: true,
  enableHTTPTimings: true,
  trackFetchStreamPerformance: false
};
function instrumentOutgoingRequests(client, _options) {
  const {
    traceFetch,
    traceXHR,
    trackFetchStreamPerformance,
    shouldCreateSpanForRequest,
    enableHTTPTimings,
    tracePropagationTargets
  } = __spreadValues({
    traceFetch: defaultRequestInstrumentationOptions.traceFetch,
    traceXHR: defaultRequestInstrumentationOptions.traceXHR,
    trackFetchStreamPerformance: defaultRequestInstrumentationOptions.trackFetchStreamPerformance
  }, _options);
  const shouldCreateSpan = typeof shouldCreateSpanForRequest === "function" ? shouldCreateSpanForRequest : (_2) => true;
  const shouldAttachHeadersWithTargets = (url) => shouldAttachHeaders(url, tracePropagationTargets);
  const spans = {};
  if (traceFetch) {
    client.addEventProcessor((event) => {
      if (event.type === "transaction" && event.spans) {
        event.spans.forEach((span) => {
          if (span.op === "http.client") {
            const updatedTimestamp = spanIdToEndTimestamp.get(span.span_id);
            if (updatedTimestamp) {
              span.timestamp = updatedTimestamp / 1e3;
              spanIdToEndTimestamp.delete(span.span_id);
            }
          }
        });
      }
      return event;
    });
    if (trackFetchStreamPerformance) {
      addFetchEndInstrumentationHandler((handlerData) => {
        if (handlerData.response) {
          const span = responseToSpanId.get(handlerData.response);
          if (span && handlerData.endTimestamp) {
            spanIdToEndTimestamp.set(span, handlerData.endTimestamp);
          }
        }
      });
    }
    addFetchInstrumentationHandler((handlerData) => {
      const createdSpan = instrumentFetchRequest(handlerData, shouldCreateSpan, shouldAttachHeadersWithTargets, spans);
      if (handlerData.response && handlerData.fetchData.__span) {
        responseToSpanId.set(handlerData.response, handlerData.fetchData.__span);
      }
      if (createdSpan) {
        const fullUrl = getFullURL2(handlerData.fetchData.url);
        const host = fullUrl ? parseUrl(fullUrl).host : void 0;
        createdSpan.setAttributes({
          "http.url": fullUrl,
          "server.address": host
        });
      }
      if (enableHTTPTimings && createdSpan) {
        addHTTPTimings(createdSpan);
      }
    });
  }
  if (traceXHR) {
    addXhrInstrumentationHandler((handlerData) => {
      const createdSpan = xhrCallback(handlerData, shouldCreateSpan, shouldAttachHeadersWithTargets, spans);
      if (enableHTTPTimings && createdSpan) {
        addHTTPTimings(createdSpan);
      }
    });
  }
}
function isPerformanceResourceTiming(entry) {
  return entry.entryType === "resource" && "initiatorType" in entry && typeof entry.nextHopProtocol === "string" && (entry.initiatorType === "fetch" || entry.initiatorType === "xmlhttprequest");
}
function addHTTPTimings(span) {
  const {
    url
  } = spanToJSON(span).data || {};
  if (!url || typeof url !== "string") {
    return;
  }
  const cleanup = addPerformanceInstrumentationHandler("resource", ({
    entries
  }) => {
    entries.forEach((entry) => {
      if (isPerformanceResourceTiming(entry) && entry.name.endsWith(url)) {
        const spanData = resourceTimingEntryToSpanData(entry);
        spanData.forEach((data) => span.setAttribute(...data));
        setTimeout(cleanup);
      }
    });
  });
}
function extractNetworkProtocol(nextHopProtocol) {
  let name = "unknown";
  let version = "unknown";
  let _name = "";
  for (const char of nextHopProtocol) {
    if (char === "/") {
      [name, version] = nextHopProtocol.split("/");
      break;
    }
    if (!isNaN(Number(char))) {
      name = _name === "h" ? "http" : _name;
      version = nextHopProtocol.split(_name)[1];
      break;
    }
    _name += char;
  }
  if (_name === nextHopProtocol) {
    name = _name;
  }
  return {
    name,
    version
  };
}
function getAbsoluteTime2(time = 0) {
  return ((browserPerformanceTimeOrigin || performance.timeOrigin) + time) / 1e3;
}
function resourceTimingEntryToSpanData(resourceTiming) {
  const {
    name,
    version
  } = extractNetworkProtocol(resourceTiming.nextHopProtocol);
  const timingSpanData = [];
  timingSpanData.push(["network.protocol.version", version], ["network.protocol.name", name]);
  if (!browserPerformanceTimeOrigin) {
    return timingSpanData;
  }
  return [...timingSpanData, ["http.request.redirect_start", getAbsoluteTime2(resourceTiming.redirectStart)], ["http.request.fetch_start", getAbsoluteTime2(resourceTiming.fetchStart)], ["http.request.domain_lookup_start", getAbsoluteTime2(resourceTiming.domainLookupStart)], ["http.request.domain_lookup_end", getAbsoluteTime2(resourceTiming.domainLookupEnd)], ["http.request.connect_start", getAbsoluteTime2(resourceTiming.connectStart)], ["http.request.secure_connection_start", getAbsoluteTime2(resourceTiming.secureConnectionStart)], ["http.request.connection_end", getAbsoluteTime2(resourceTiming.connectEnd)], ["http.request.request_start", getAbsoluteTime2(resourceTiming.requestStart)], ["http.request.response_start", getAbsoluteTime2(resourceTiming.responseStart)], ["http.request.response_end", getAbsoluteTime2(resourceTiming.responseEnd)]];
}
function shouldAttachHeaders(targetUrl, tracePropagationTargets) {
  const href = WINDOW4.location && WINDOW4.location.href;
  if (!href) {
    const isRelativeSameOriginRequest = !!targetUrl.match(/^\/(?!\/)/);
    if (!tracePropagationTargets) {
      return isRelativeSameOriginRequest;
    } else {
      return stringMatchesSomePattern(targetUrl, tracePropagationTargets);
    }
  } else {
    let resolvedUrl;
    let currentOrigin;
    try {
      resolvedUrl = new URL(targetUrl, href);
      currentOrigin = new URL(href).origin;
    } catch (e3) {
      return false;
    }
    const isSameOriginRequest = resolvedUrl.origin === currentOrigin;
    if (!tracePropagationTargets) {
      return isSameOriginRequest;
    } else {
      return stringMatchesSomePattern(resolvedUrl.toString(), tracePropagationTargets) || isSameOriginRequest && stringMatchesSomePattern(resolvedUrl.pathname, tracePropagationTargets);
    }
  }
}
function xhrCallback(handlerData, shouldCreateSpan, shouldAttachHeaders2, spans) {
  const xhr = handlerData.xhr;
  const sentryXhrData = xhr && xhr[SENTRY_XHR_DATA_KEY];
  if (!xhr || xhr.__sentry_own_request__ || !sentryXhrData) {
    return void 0;
  }
  const shouldCreateSpanResult = hasTracingEnabled() && shouldCreateSpan(sentryXhrData.url);
  if (handlerData.endTimestamp && shouldCreateSpanResult) {
    const spanId = xhr.__sentry_xhr_span_id__;
    if (!spanId) return;
    const span2 = spans[spanId];
    if (span2 && sentryXhrData.status_code !== void 0) {
      setHttpStatus(span2, sentryXhrData.status_code);
      span2.end();
      delete spans[spanId];
    }
    return void 0;
  }
  const fullUrl = getFullURL2(sentryXhrData.url);
  const host = fullUrl ? parseUrl(fullUrl).host : void 0;
  const hasParent = !!getActiveSpan();
  const span = shouldCreateSpanResult && hasParent ? startInactiveSpan({
    name: `${sentryXhrData.method} ${sentryXhrData.url}`,
    attributes: {
      type: "xhr",
      "http.method": sentryXhrData.method,
      "http.url": fullUrl,
      url: sentryXhrData.url,
      "server.address": host,
      [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.http.browser",
      [SEMANTIC_ATTRIBUTE_SENTRY_OP]: "http.client"
    }
  }) : new SentryNonRecordingSpan();
  xhr.__sentry_xhr_span_id__ = span.spanContext().spanId;
  spans[xhr.__sentry_xhr_span_id__] = span;
  const client = getClient();
  if (xhr.setRequestHeader && shouldAttachHeaders2(sentryXhrData.url) && client) {
    addTracingHeadersToXhrRequest(
      xhr,
      client,
      // If performance is disabled (TWP) or there's no active root span (pageload/navigation/interaction),
      // we do not want to use the span as base for the trace headers,
      // which means that the headers will be generated from the scope and the sampling decision is deferred
      hasTracingEnabled() && hasParent ? span : void 0
    );
  }
  return span;
}
function addTracingHeadersToXhrRequest(xhr, client, span) {
  const scope = getCurrentScope();
  const isolationScope = getIsolationScope();
  const {
    traceId,
    spanId,
    sampled,
    dsc
  } = __spreadValues(__spreadValues({}, isolationScope.getPropagationContext()), scope.getPropagationContext());
  const sentryTraceHeader = span && hasTracingEnabled() ? spanToTraceHeader(span) : generateSentryTraceHeader(traceId, spanId, sampled);
  const sentryBaggageHeader = dynamicSamplingContextToSentryBaggageHeader(dsc || (span ? getDynamicSamplingContextFromSpan(span) : getDynamicSamplingContextFromClient(traceId, client)));
  setHeaderOnXhr(xhr, sentryTraceHeader, sentryBaggageHeader);
}
function setHeaderOnXhr(xhr, sentryTraceHeader, sentryBaggageHeader) {
  try {
    xhr.setRequestHeader("sentry-trace", sentryTraceHeader);
    if (sentryBaggageHeader) {
      xhr.setRequestHeader(BAGGAGE_HEADER_NAME, sentryBaggageHeader);
    }
  } catch (_2) {
  }
}
function getFullURL2(url) {
  try {
    const parsed = new URL(url, WINDOW4.location.origin);
    return parsed.href;
  } catch (e22) {
    return void 0;
  }
}

// node_modules/@sentry/browser/build/npm/esm/tracing/backgroundtab.js
function registerBackgroundTabDetection() {
  if (WINDOW4 && WINDOW4.document) {
    WINDOW4.document.addEventListener("visibilitychange", () => {
      const activeSpan = getActiveSpan();
      if (!activeSpan) {
        return;
      }
      const rootSpan = getRootSpan(activeSpan);
      if (WINDOW4.document.hidden && rootSpan) {
        const cancelledStatus = "cancelled";
        const {
          op,
          status
        } = spanToJSON(rootSpan);
        if (DEBUG_BUILD3) {
          logger.log(`[Tracing] Transaction: ${cancelledStatus} -> since tab moved to the background, op: ${op}`);
        }
        if (!status) {
          rootSpan.setStatus({
            code: SPAN_STATUS_ERROR,
            message: cancelledStatus
          });
        }
        rootSpan.setAttribute("sentry.cancellation_reason", "document.hidden");
        rootSpan.end();
      }
    });
  } else {
    DEBUG_BUILD3 && logger.warn("[Tracing] Could not set up background tab detection due to lack of global document");
  }
}

// node_modules/@sentry/browser/build/npm/esm/tracing/browserTracingIntegration.js
var BROWSER_TRACING_INTEGRATION_ID = "BrowserTracing";
var DEFAULT_BROWSER_TRACING_OPTIONS = __spreadValues(__spreadProps(__spreadValues({}, TRACING_DEFAULTS), {
  instrumentNavigation: true,
  instrumentPageLoad: true,
  markBackgroundSpan: true,
  enableLongTask: true,
  enableLongAnimationFrame: true,
  enableInp: true,
  _experiments: {}
}), defaultRequestInstrumentationOptions);
var browserTracingIntegration = (_options = {}) => {
  registerSpanErrorInstrumentation();
  const {
    enableInp,
    enableLongTask,
    enableLongAnimationFrame,
    _experiments: {
      enableInteractions,
      enableStandaloneClsSpans
    },
    beforeStartSpan,
    idleTimeout,
    finalTimeout,
    childSpanTimeout,
    markBackgroundSpan,
    traceFetch,
    traceXHR,
    trackFetchStreamPerformance,
    shouldCreateSpanForRequest,
    enableHTTPTimings,
    instrumentPageLoad,
    instrumentNavigation
  } = __spreadValues(__spreadValues({}, DEFAULT_BROWSER_TRACING_OPTIONS), _options);
  const _collectWebVitals = startTrackingWebVitals({
    recordClsStandaloneSpans: enableStandaloneClsSpans || false
  });
  if (enableInp) {
    startTrackingINP();
  }
  if (enableLongAnimationFrame && GLOBAL_OBJ.PerformanceObserver && PerformanceObserver.supportedEntryTypes && PerformanceObserver.supportedEntryTypes.includes("long-animation-frame")) {
    startTrackingLongAnimationFrames();
  } else if (enableLongTask) {
    startTrackingLongTasks();
  }
  if (enableInteractions) {
    startTrackingInteractions();
  }
  const latestRoute = {
    name: void 0,
    source: void 0
  };
  function _createRouteSpan(client, startSpanOptions) {
    const isPageloadTransaction = startSpanOptions.op === "pageload";
    const finalStartSpanOptions = beforeStartSpan ? beforeStartSpan(startSpanOptions) : startSpanOptions;
    const attributes = finalStartSpanOptions.attributes || {};
    if (startSpanOptions.name !== finalStartSpanOptions.name) {
      attributes[SEMANTIC_ATTRIBUTE_SENTRY_SOURCE] = "custom";
      finalStartSpanOptions.attributes = attributes;
    }
    latestRoute.name = finalStartSpanOptions.name;
    latestRoute.source = attributes[SEMANTIC_ATTRIBUTE_SENTRY_SOURCE];
    const idleSpan = startIdleSpan(finalStartSpanOptions, {
      idleTimeout,
      finalTimeout,
      childSpanTimeout,
      // should wait for finish signal if it's a pageload transaction
      disableAutoFinish: isPageloadTransaction,
      beforeSpanEnd: (span) => {
        _collectWebVitals();
        addPerformanceEntries(span, {
          recordClsOnPageloadSpan: !enableStandaloneClsSpans
        });
      }
    });
    function emitFinish() {
      if (["interactive", "complete"].includes(WINDOW4.document.readyState)) {
        client.emit("idleSpanEnableAutoFinish", idleSpan);
      }
    }
    if (isPageloadTransaction && WINDOW4.document) {
      WINDOW4.document.addEventListener("readystatechange", () => {
        emitFinish();
      });
      emitFinish();
    }
    return idleSpan;
  }
  return {
    name: BROWSER_TRACING_INTEGRATION_ID,
    afterAllSetup(client) {
      let activeSpan;
      let startingUrl = WINDOW4.location && WINDOW4.location.href;
      client.on("startNavigationSpan", (startSpanOptions) => {
        if (getClient() !== client) {
          return;
        }
        if (activeSpan && !spanToJSON(activeSpan).timestamp) {
          DEBUG_BUILD3 && logger.log(`[Tracing] Finishing current root span with op: ${spanToJSON(activeSpan).op}`);
          activeSpan.end();
        }
        activeSpan = _createRouteSpan(client, __spreadValues({
          op: "navigation"
        }, startSpanOptions));
      });
      client.on("startPageLoadSpan", (startSpanOptions, traceOptions = {}) => {
        if (getClient() !== client) {
          return;
        }
        if (activeSpan && !spanToJSON(activeSpan).timestamp) {
          DEBUG_BUILD3 && logger.log(`[Tracing] Finishing current root span with op: ${spanToJSON(activeSpan).op}`);
          activeSpan.end();
        }
        const sentryTrace = traceOptions.sentryTrace || getMetaContent("sentry-trace");
        const baggage = traceOptions.baggage || getMetaContent("baggage");
        const propagationContext = propagationContextFromHeaders(sentryTrace, baggage);
        getCurrentScope().setPropagationContext(propagationContext);
        activeSpan = _createRouteSpan(client, __spreadValues({
          op: "pageload"
        }, startSpanOptions));
      });
      client.on("spanEnd", (span) => {
        const op = spanToJSON(span).op;
        if (span !== getRootSpan(span) || op !== "navigation" && op !== "pageload") {
          return;
        }
        const scope = getCurrentScope();
        const oldPropagationContext = scope.getPropagationContext();
        scope.setPropagationContext(__spreadProps(__spreadValues({}, oldPropagationContext), {
          sampled: oldPropagationContext.sampled !== void 0 ? oldPropagationContext.sampled : spanIsSampled(span),
          dsc: oldPropagationContext.dsc || getDynamicSamplingContextFromSpan(span)
        }));
      });
      if (WINDOW4.location) {
        if (instrumentPageLoad) {
          startBrowserTracingPageLoadSpan(client, {
            name: WINDOW4.location.pathname,
            // pageload should always start at timeOrigin (and needs to be in s, not ms)
            startTime: browserPerformanceTimeOrigin ? browserPerformanceTimeOrigin / 1e3 : void 0,
            attributes: {
              [SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: "url",
              [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.pageload.browser"
            }
          });
        }
        if (instrumentNavigation) {
          addHistoryInstrumentationHandler(({
            to,
            from
          }) => {
            if (from === void 0 && startingUrl && startingUrl.indexOf(to) !== -1) {
              startingUrl = void 0;
              return;
            }
            if (from !== to) {
              startingUrl = void 0;
              startBrowserTracingNavigationSpan(client, {
                name: WINDOW4.location.pathname,
                attributes: {
                  [SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: "url",
                  [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.navigation.browser"
                }
              });
            }
          });
        }
      }
      if (markBackgroundSpan) {
        registerBackgroundTabDetection();
      }
      if (enableInteractions) {
        registerInteractionListener(idleTimeout, finalTimeout, childSpanTimeout, latestRoute);
      }
      if (enableInp) {
        registerInpInteractionListener();
      }
      instrumentOutgoingRequests(client, {
        traceFetch,
        traceXHR,
        trackFetchStreamPerformance,
        tracePropagationTargets: client.getOptions().tracePropagationTargets,
        shouldCreateSpanForRequest,
        enableHTTPTimings
      });
    }
  };
};
function startBrowserTracingPageLoadSpan(client, spanOptions, traceOptions) {
  client.emit("startPageLoadSpan", spanOptions, traceOptions);
  getCurrentScope().setTransactionName(spanOptions.name);
  const span = getActiveSpan();
  const op = span && spanToJSON(span).op;
  return op === "pageload" ? span : void 0;
}
function startBrowserTracingNavigationSpan(client, spanOptions) {
  getIsolationScope().setPropagationContext(generatePropagationContext());
  getCurrentScope().setPropagationContext(generatePropagationContext());
  client.emit("startNavigationSpan", spanOptions);
  getCurrentScope().setTransactionName(spanOptions.name);
  const span = getActiveSpan();
  const op = span && spanToJSON(span).op;
  return op === "navigation" ? span : void 0;
}
function getMetaContent(metaName) {
  const metaTag = getDomElement(`meta[name=${metaName}]`);
  return metaTag ? metaTag.getAttribute("content") : void 0;
}
function registerInteractionListener(idleTimeout, finalTimeout, childSpanTimeout, latestRoute) {
  let inflightInteractionSpan;
  const registerInteractionTransaction = () => {
    const op = "ui.action.click";
    const activeSpan = getActiveSpan();
    const rootSpan = activeSpan && getRootSpan(activeSpan);
    if (rootSpan) {
      const currentRootSpanOp = spanToJSON(rootSpan).op;
      if (["navigation", "pageload"].includes(currentRootSpanOp)) {
        DEBUG_BUILD3 && logger.warn(`[Tracing] Did not create ${op} span because a pageload or navigation span is in progress.`);
        return void 0;
      }
    }
    if (inflightInteractionSpan) {
      inflightInteractionSpan.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_IDLE_SPAN_FINISH_REASON, "interactionInterrupted");
      inflightInteractionSpan.end();
      inflightInteractionSpan = void 0;
    }
    if (!latestRoute.name) {
      DEBUG_BUILD3 && logger.warn(`[Tracing] Did not create ${op} transaction because _latestRouteName is missing.`);
      return void 0;
    }
    inflightInteractionSpan = startIdleSpan({
      name: latestRoute.name,
      op,
      attributes: {
        [SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: latestRoute.source || "url"
      }
    }, {
      idleTimeout,
      finalTimeout,
      childSpanTimeout
    });
  };
  if (WINDOW4.document) {
    addEventListener("click", registerInteractionTransaction, {
      once: false,
      capture: true
    });
  }
}

// node_modules/@sentry/browser/build/npm/esm/transports/offline.js
function promisifyRequest(request) {
  return new Promise((resolve2, reject) => {
    request.oncomplete = request.onsuccess = () => resolve2(request.result);
    request.onabort = request.onerror = () => reject(request.error);
  });
}
function createStore(dbName, storeName) {
  const request = indexedDB.open(dbName);
  request.onupgradeneeded = () => request.result.createObjectStore(storeName);
  const dbp = promisifyRequest(request);
  return (callback) => dbp.then((db) => callback(db.transaction(storeName, "readwrite").objectStore(storeName)));
}
function keys(store) {
  return promisifyRequest(store.getAllKeys());
}
function push(store, value, maxQueueSize) {
  return store((store2) => {
    return keys(store2).then((keys2) => {
      if (keys2.length >= maxQueueSize) {
        return;
      }
      store2.put(value, Math.max(...keys2, 0) + 1);
      return promisifyRequest(store2.transaction);
    });
  });
}
function unshift(store, value, maxQueueSize) {
  return store((store2) => {
    return keys(store2).then((keys2) => {
      if (keys2.length >= maxQueueSize) {
        return;
      }
      store2.put(value, Math.min(...keys2, 0) - 1);
      return promisifyRequest(store2.transaction);
    });
  });
}
function shift(store) {
  return store((store2) => {
    return keys(store2).then((keys2) => {
      const firstKey = keys2[0];
      if (firstKey == null) {
        return void 0;
      }
      return promisifyRequest(store2.get(firstKey)).then((value) => {
        store2.delete(firstKey);
        return promisifyRequest(store2.transaction).then(() => value);
      });
    });
  });
}
function createIndexedDbStore(options) {
  let store;
  function getStore() {
    if (store == void 0) {
      store = createStore(options.dbName || "sentry-offline", options.storeName || "queue");
    }
    return store;
  }
  return {
    push: (env) => __async(this, null, function* () {
      try {
        const serialized = yield serializeEnvelope(env);
        yield push(getStore(), serialized, options.maxQueueSize || 30);
      } catch (_2) {
      }
    }),
    unshift: (env) => __async(this, null, function* () {
      try {
        const serialized = yield serializeEnvelope(env);
        yield unshift(getStore(), serialized, options.maxQueueSize || 30);
      } catch (_2) {
      }
    }),
    shift: () => __async(this, null, function* () {
      try {
        const deserialized = yield shift(getStore());
        if (deserialized) {
          return parseEnvelope(deserialized);
        }
      } catch (_2) {
      }
      return void 0;
    })
  };
}
function makeIndexedDbOfflineTransport(createTransport2) {
  return (options) => createTransport2(__spreadProps(__spreadValues({}, options), {
    createStore: createIndexedDbStore
  }));
}
function makeBrowserOfflineTransport(createTransport2 = makeFetchTransport) {
  return makeIndexedDbOfflineTransport(makeOfflineTransport(createTransport2));
}

// node_modules/@sentry/browser/build/npm/esm/profiling/utils.js
var MS_TO_NS = 1e6;
var THREAD_ID_STRING = String(0);
var THREAD_NAME = "main";
var OS_PLATFORM = "";
var OS_PLATFORM_VERSION = "";
var OS_ARCH = "";
var OS_BROWSER = WINDOW4.navigator && WINDOW4.navigator.userAgent || "";
var OS_MODEL = "";
var OS_LOCALE = WINDOW4.navigator && WINDOW4.navigator.language || WINDOW4.navigator && WINDOW4.navigator.languages && WINDOW4.navigator.languages[0] || "";
function isUserAgentData(data) {
  return typeof data === "object" && data !== null && "getHighEntropyValues" in data;
}
var userAgentData = WINDOW4.navigator && WINDOW4.navigator.userAgentData;
if (isUserAgentData(userAgentData)) {
  userAgentData.getHighEntropyValues(["architecture", "model", "platform", "platformVersion", "fullVersionList"]).then((ua) => {
    OS_PLATFORM = ua.platform || "";
    OS_ARCH = ua.architecture || "";
    OS_MODEL = ua.model || "";
    OS_PLATFORM_VERSION = ua.platformVersion || "";
    if (ua.fullVersionList && ua.fullVersionList.length > 0) {
      const firstUa = ua.fullVersionList[ua.fullVersionList.length - 1];
      OS_BROWSER = `${firstUa.brand} ${firstUa.version}`;
    }
  }).catch((e3) => void 0);
}
function isProcessedJSSelfProfile(profile) {
  return !("thread_metadata" in profile);
}
function enrichWithThreadInformation(profile) {
  if (!isProcessedJSSelfProfile(profile)) {
    return profile;
  }
  return convertJSSelfProfileToSampledFormat(profile);
}
function getTraceId(event) {
  const traceId = event && event.contexts && event.contexts["trace"] && event.contexts["trace"]["trace_id"];
  if (typeof traceId === "string" && traceId.length !== 32) {
    if (DEBUG_BUILD3) {
      logger.log(`[Profiling] Invalid traceId: ${traceId} on profiled event`);
    }
  }
  if (typeof traceId !== "string") {
    return "";
  }
  return traceId;
}
function createProfilePayload(profile_id, start_timestamp, processed_profile, event) {
  if (event.type !== "transaction") {
    throw new TypeError("Profiling events may only be attached to transactions, this should never occur.");
  }
  if (processed_profile === void 0 || processed_profile === null) {
    throw new TypeError(`Cannot construct profiling event envelope without a valid profile. Got ${processed_profile} instead.`);
  }
  const traceId = getTraceId(event);
  const enrichedThreadProfile = enrichWithThreadInformation(processed_profile);
  const transactionStartMs = start_timestamp ? start_timestamp : typeof event.start_timestamp === "number" ? event.start_timestamp * 1e3 : timestampInSeconds() * 1e3;
  const transactionEndMs = typeof event.timestamp === "number" ? event.timestamp * 1e3 : timestampInSeconds() * 1e3;
  const profile = {
    event_id: profile_id,
    timestamp: new Date(transactionStartMs).toISOString(),
    platform: "javascript",
    version: "1",
    release: event.release || "",
    environment: event.environment || DEFAULT_ENVIRONMENT,
    runtime: {
      name: "javascript",
      version: WINDOW4.navigator.userAgent
    },
    os: {
      name: OS_PLATFORM,
      version: OS_PLATFORM_VERSION,
      build_number: OS_BROWSER
    },
    device: {
      locale: OS_LOCALE,
      model: OS_MODEL,
      manufacturer: OS_BROWSER,
      architecture: OS_ARCH,
      is_emulator: false
    },
    debug_meta: {
      images: applyDebugMetadata(processed_profile.resources)
    },
    profile: enrichedThreadProfile,
    transactions: [{
      name: event.transaction || "",
      id: event.event_id || uuid4(),
      trace_id: traceId,
      active_thread_id: THREAD_ID_STRING,
      relative_start_ns: "0",
      relative_end_ns: ((transactionEndMs - transactionStartMs) * 1e6).toFixed(0)
    }]
  };
  return profile;
}
function isAutomatedPageLoadSpan(span) {
  return spanToJSON(span).op === "pageload";
}
function convertJSSelfProfileToSampledFormat(input) {
  let EMPTY_STACK_ID = void 0;
  let STACK_ID = 0;
  const profile = {
    samples: [],
    stacks: [],
    frames: [],
    thread_metadata: {
      [THREAD_ID_STRING]: {
        name: THREAD_NAME
      }
    }
  };
  const firstSample = input.samples[0];
  if (!firstSample) {
    return profile;
  }
  const start = firstSample.timestamp;
  const origin = typeof performance.timeOrigin === "number" ? performance.timeOrigin : browserPerformanceTimeOrigin || 0;
  const adjustForOriginChange = origin - (browserPerformanceTimeOrigin || origin);
  input.samples.forEach((jsSample, i2) => {
    if (jsSample.stackId === void 0) {
      if (EMPTY_STACK_ID === void 0) {
        EMPTY_STACK_ID = STACK_ID;
        profile.stacks[EMPTY_STACK_ID] = [];
        STACK_ID++;
      }
      profile["samples"][i2] = {
        // convert ms timestamp to ns
        elapsed_since_start_ns: ((jsSample.timestamp + adjustForOriginChange - start) * MS_TO_NS).toFixed(0),
        stack_id: EMPTY_STACK_ID,
        thread_id: THREAD_ID_STRING
      };
      return;
    }
    let stackTop = input.stacks[jsSample.stackId];
    const stack = [];
    while (stackTop) {
      stack.push(stackTop.frameId);
      const frame = input.frames[stackTop.frameId];
      if (frame && profile.frames[stackTop.frameId] === void 0) {
        profile.frames[stackTop.frameId] = {
          function: frame.name,
          abs_path: typeof frame.resourceId === "number" ? input.resources[frame.resourceId] : void 0,
          lineno: frame.line,
          colno: frame.column
        };
      }
      stackTop = stackTop.parentId === void 0 ? void 0 : input.stacks[stackTop.parentId];
    }
    const sample = {
      // convert ms timestamp to ns
      elapsed_since_start_ns: ((jsSample.timestamp + adjustForOriginChange - start) * MS_TO_NS).toFixed(0),
      stack_id: STACK_ID,
      thread_id: THREAD_ID_STRING
    };
    profile["stacks"][STACK_ID] = stack;
    profile["samples"][i2] = sample;
    STACK_ID++;
  });
  return profile;
}
function addProfilesToEnvelope(envelope, profiles) {
  if (!profiles.length) {
    return envelope;
  }
  for (const profile of profiles) {
    envelope[1].push([{
      type: "profile"
    }, profile]);
  }
  return envelope;
}
function findProfiledTransactionsFromEnvelope(envelope) {
  const events = [];
  forEachEnvelopeItem(envelope, (item, type) => {
    if (type !== "transaction") {
      return;
    }
    for (let j2 = 1; j2 < item.length; j2++) {
      const event = item[j2];
      if (event && event.contexts && event.contexts["profile"] && event.contexts["profile"]["profile_id"]) {
        events.push(item[j2]);
      }
    }
  });
  return events;
}
var debugIdStackParserCache2 = /* @__PURE__ */ new WeakMap();
function applyDebugMetadata(resource_paths) {
  const debugIdMap = GLOBAL_OBJ._sentryDebugIds;
  if (!debugIdMap) {
    return [];
  }
  const client = getClient();
  const options = client && client.getOptions();
  const stackParser = options && options.stackParser;
  if (!stackParser) {
    return [];
  }
  let debugIdStackFramesCache;
  const cachedDebugIdStackFrameCache = debugIdStackParserCache2.get(stackParser);
  if (cachedDebugIdStackFrameCache) {
    debugIdStackFramesCache = cachedDebugIdStackFrameCache;
  } else {
    debugIdStackFramesCache = /* @__PURE__ */ new Map();
    debugIdStackParserCache2.set(stackParser, debugIdStackFramesCache);
  }
  const filenameDebugIdMap = Object.keys(debugIdMap).reduce((acc, debugIdStackTrace) => {
    let parsedStack;
    const cachedParsedStack = debugIdStackFramesCache.get(debugIdStackTrace);
    if (cachedParsedStack) {
      parsedStack = cachedParsedStack;
    } else {
      parsedStack = stackParser(debugIdStackTrace);
      debugIdStackFramesCache.set(debugIdStackTrace, parsedStack);
    }
    for (let i2 = parsedStack.length - 1; i2 >= 0; i2--) {
      const stackFrame = parsedStack[i2];
      const file = stackFrame && stackFrame.filename;
      if (stackFrame && file) {
        acc[file] = debugIdMap[debugIdStackTrace];
        break;
      }
    }
    return acc;
  }, {});
  const images = [];
  for (const path of resource_paths) {
    if (path && filenameDebugIdMap[path]) {
      images.push({
        type: "sourcemap",
        code_file: path,
        debug_id: filenameDebugIdMap[path]
      });
    }
  }
  return images;
}
function isValidSampleRate(rate) {
  if (typeof rate !== "number" && typeof rate !== "boolean" || typeof rate === "number" && isNaN(rate)) {
    DEBUG_BUILD3 && logger.warn(`[Profiling] Invalid sample rate. Sample rate must be a boolean or a number between 0 and 1. Got ${JSON.stringify(rate)} of type ${JSON.stringify(typeof rate)}.`);
    return false;
  }
  if (rate === true || rate === false) {
    return true;
  }
  if (rate < 0 || rate > 1) {
    DEBUG_BUILD3 && logger.warn(`[Profiling] Invalid sample rate. Sample rate must be between 0 and 1. Got ${rate}.`);
    return false;
  }
  return true;
}
function isValidProfile(profile) {
  if (profile.samples.length < 2) {
    if (DEBUG_BUILD3) {
      logger.log("[Profiling] Discarding profile because it contains less than 2 samples");
    }
    return false;
  }
  if (!profile.frames.length) {
    if (DEBUG_BUILD3) {
      logger.log("[Profiling] Discarding profile because it contains no frames");
    }
    return false;
  }
  return true;
}
var PROFILING_CONSTRUCTOR_FAILED = false;
var MAX_PROFILE_DURATION_MS = 3e4;
function isJSProfilerSupported(maybeProfiler) {
  return typeof maybeProfiler === "function";
}
function startJSSelfProfile() {
  const JSProfilerConstructor = WINDOW4.Profiler;
  if (!isJSProfilerSupported(JSProfilerConstructor)) {
    if (DEBUG_BUILD3) {
      logger.log("[Profiling] Profiling is not supported by this browser, Profiler interface missing on window object.");
    }
    return;
  }
  const samplingIntervalMS = 10;
  const maxSamples = Math.floor(MAX_PROFILE_DURATION_MS / samplingIntervalMS);
  try {
    return new JSProfilerConstructor({
      sampleInterval: samplingIntervalMS,
      maxBufferSize: maxSamples
    });
  } catch (e3) {
    if (DEBUG_BUILD3) {
      logger.log("[Profiling] Failed to initialize the Profiling constructor, this is likely due to a missing 'Document-Policy': 'js-profiling' header.");
      logger.log("[Profiling] Disabling profiling for current user session.");
    }
    PROFILING_CONSTRUCTOR_FAILED = true;
  }
  return;
}
function shouldProfileSpan(span) {
  if (PROFILING_CONSTRUCTOR_FAILED) {
    if (DEBUG_BUILD3) {
      logger.log("[Profiling] Profiling has been disabled for the duration of the current user session.");
    }
    return false;
  }
  if (!span.isRecording()) {
    if (DEBUG_BUILD3) {
      logger.log("[Profiling] Discarding profile because transaction was not sampled.");
    }
    return false;
  }
  const client = getClient();
  const options = client && client.getOptions();
  if (!options) {
    DEBUG_BUILD3 && logger.log("[Profiling] Profiling disabled, no options found.");
    return false;
  }
  const profilesSampleRate = options.profilesSampleRate;
  if (!isValidSampleRate(profilesSampleRate)) {
    DEBUG_BUILD3 && logger.warn("[Profiling] Discarding profile because of invalid sample rate.");
    return false;
  }
  if (!profilesSampleRate) {
    DEBUG_BUILD3 && logger.log("[Profiling] Discarding profile because a negative sampling decision was inherited or profileSampleRate is set to 0");
    return false;
  }
  const sampled = profilesSampleRate === true ? true : Math.random() < profilesSampleRate;
  if (!sampled) {
    DEBUG_BUILD3 && logger.log(`[Profiling] Discarding profile because it's not included in the random sample (sampling rate = ${Number(profilesSampleRate)})`);
    return false;
  }
  return true;
}
function createProfilingEvent(profile_id, start_timestamp, profile, event) {
  if (!isValidProfile(profile)) {
    return null;
  }
  return createProfilePayload(profile_id, start_timestamp, profile, event);
}
var PROFILE_MAP = /* @__PURE__ */ new Map();
function getActiveProfilesCount() {
  return PROFILE_MAP.size;
}
function takeProfileFromGlobalCache(profile_id) {
  const profile = PROFILE_MAP.get(profile_id);
  if (profile) {
    PROFILE_MAP.delete(profile_id);
  }
  return profile;
}
function addProfileToGlobalCache(profile_id, profile) {
  PROFILE_MAP.set(profile_id, profile);
  if (PROFILE_MAP.size > 30) {
    const last = PROFILE_MAP.keys().next().value;
    PROFILE_MAP.delete(last);
  }
}

// node_modules/@sentry/browser/build/npm/esm/profiling/startProfileForSpan.js
function startProfileForSpan(span) {
  let startTimestamp;
  if (isAutomatedPageLoadSpan(span)) {
    startTimestamp = timestampInSeconds() * 1e3;
  }
  const profiler2 = startJSSelfProfile();
  if (!profiler2) {
    return;
  }
  if (DEBUG_BUILD3) {
    logger.log(`[Profiling] started profiling span: ${spanToJSON(span).description}`);
  }
  const profileId = uuid4();
  getCurrentScope().setContext("profile", {
    profile_id: profileId,
    start_timestamp: startTimestamp
  });
  function onProfileHandler() {
    return __async(this, null, function* () {
      if (!span) {
        return;
      }
      if (!profiler2) {
        return;
      }
      return profiler2.stop().then((profile) => {
        if (maxDurationTimeoutID) {
          WINDOW4.clearTimeout(maxDurationTimeoutID);
          maxDurationTimeoutID = void 0;
        }
        if (DEBUG_BUILD3) {
          logger.log(`[Profiling] stopped profiling of span: ${spanToJSON(span).description}`);
        }
        if (!profile) {
          if (DEBUG_BUILD3) {
            logger.log(`[Profiling] profiler returned null profile for: ${spanToJSON(span).description}`, "this may indicate an overlapping span or a call to stopProfiling with a profile title that was never started");
          }
          return;
        }
        addProfileToGlobalCache(profileId, profile);
      }).catch((error) => {
        if (DEBUG_BUILD3) {
          logger.log("[Profiling] error while stopping profiler:", error);
        }
      });
    });
  }
  let maxDurationTimeoutID = WINDOW4.setTimeout(() => {
    if (DEBUG_BUILD3) {
      logger.log("[Profiling] max profile duration elapsed, stopping profiling for:", spanToJSON(span).description);
    }
    onProfileHandler();
  }, MAX_PROFILE_DURATION_MS);
  const originalEnd = span.end.bind(span);
  function profilingWrappedSpanEnd() {
    if (!span) {
      return originalEnd();
    }
    void onProfileHandler().then(() => {
      originalEnd();
    }, () => {
      originalEnd();
    });
    return span;
  }
  span.end = profilingWrappedSpanEnd;
}

// node_modules/@sentry/browser/build/npm/esm/profiling/integration.js
var INTEGRATION_NAME20 = "BrowserProfiling";
var _browserProfilingIntegration = () => {
  return {
    name: INTEGRATION_NAME20,
    setup(client) {
      const activeSpan = getActiveSpan();
      const rootSpan = activeSpan && getRootSpan(activeSpan);
      if (rootSpan && isAutomatedPageLoadSpan(rootSpan)) {
        if (shouldProfileSpan(rootSpan)) {
          startProfileForSpan(rootSpan);
        }
      }
      client.on("spanStart", (span) => {
        if (span === getRootSpan(span) && shouldProfileSpan(span)) {
          startProfileForSpan(span);
        }
      });
      client.on("beforeEnvelope", (envelope) => {
        if (!getActiveProfilesCount()) {
          return;
        }
        const profiledTransactionEvents = findProfiledTransactionsFromEnvelope(envelope);
        if (!profiledTransactionEvents.length) {
          return;
        }
        const profilesToAddToEnvelope = [];
        for (const profiledTransaction of profiledTransactionEvents) {
          const context = profiledTransaction && profiledTransaction.contexts;
          const profile_id = context && context["profile"] && context["profile"]["profile_id"];
          const start_timestamp = context && context["profile"] && context["profile"]["start_timestamp"];
          if (typeof profile_id !== "string") {
            DEBUG_BUILD3 && logger.log("[Profiling] cannot find profile for a span without a profile context");
            continue;
          }
          if (!profile_id) {
            DEBUG_BUILD3 && logger.log("[Profiling] cannot find profile for a span without a profile context");
            continue;
          }
          if (context && context["profile"]) {
            delete context.profile;
          }
          const profile = takeProfileFromGlobalCache(profile_id);
          if (!profile) {
            DEBUG_BUILD3 && logger.log(`[Profiling] Could not retrieve profile for span: ${profile_id}`);
            continue;
          }
          const profileEvent = createProfilingEvent(profile_id, start_timestamp, profile, profiledTransaction);
          if (profileEvent) {
            profilesToAddToEnvelope.push(profileEvent);
          }
        }
        addProfilesToEnvelope(envelope, profilesToAddToEnvelope);
      });
    }
  };
};
var browserProfilingIntegration = defineIntegration(_browserProfilingIntegration);

// node_modules/@sentry/angular/fesm2020/sentry-angular.mjs
var IS_DEBUG_BUILD = typeof __SENTRY_DEBUG__ === "undefined" ? true : __SENTRY_DEBUG__;
function getDefaultIntegrations2() {
  return [inboundFiltersIntegration(), functionToStringIntegration(), breadcrumbsIntegration(), globalHandlersIntegration(), linkedErrorsIntegration2(), dedupeIntegration(), httpContextIntegration()];
}
function init2(options) {
  const opts = __spreadValues({
    defaultIntegrations: getDefaultIntegrations2()
  }, options);
  applySdkMetadata(opts, "angular");
  checkAndSetAngularVersion();
  return init(opts);
}
function checkAndSetAngularVersion() {
  const ANGULAR_MINIMUM_VERSION = 14;
  const angularVersion = VERSION && VERSION.major ? parseInt(VERSION.major, 10) : void 0;
  if (angularVersion) {
    if (angularVersion < ANGULAR_MINIMUM_VERSION) {
      IS_DEBUG_BUILD && logger.warn(`This Sentry SDK does not officially support Angular ${angularVersion}.`, `This SDK only supports Angular ${ANGULAR_MINIMUM_VERSION} and above.`, "If you're using lower Angular versions, check the Angular Version Compatibility table in our docs: https://docs.sentry.io/platforms/javascript/guides/angular/#angular-version-compatibility.", "Otherwise, please consider upgrading your Angular version.");
    }
    setContext("angular", {
      version: angularVersion
    });
  }
}
var isNgZoneEnabled = typeof Zone !== "undefined" && Zone.root && Zone.root.run;
function runOutsideAngular(callback) {
  return isNgZoneEnabled ? Zone.root.run(callback) : callback();
}
function tryToUnwrapZonejsError(error) {
  return error && error.ngOriginalError ? error.ngOriginalError : error;
}
function extractHttpModuleError(error) {
  if (isErrorOrErrorLikeObject(error.error)) {
    return error.error;
  }
  if (typeof ErrorEvent !== "undefined" && error.error instanceof ErrorEvent && error.error.message) {
    return error.error.message;
  }
  if (typeof error.error === "string") {
    return `Server returned code ${error.status} with body "${error.error}"`;
  }
  return error.message;
}
function isErrorOrErrorLikeObject(value) {
  if (value instanceof Error) {
    return true;
  }
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value;
  return isString(candidate.name) && isString(candidate.message) && (void 0 === candidate.stack || isString(candidate.stack));
}
var SentryErrorHandler = class {
  constructor(options) {
    this._options = __spreadValues({
      logErrors: true
    }, options);
  }
  /**
   * Method executed when the injector is destroyed.
   */
  ngOnDestroy() {
    if (this._removeAfterSendEventListener) {
      this._removeAfterSendEventListener();
    }
  }
  /**
   * Method called for every value captured through the ErrorHandler
   */
  handleError(error) {
    const extractedError = this._extractError(error) || "Handled unknown error";
    const eventId = runOutsideAngular(() => captureException(extractedError, {
      mechanism: {
        type: "angular",
        handled: false
      }
    }));
    if (this._options.logErrors) {
      consoleSandbox(() => console.error(extractedError));
    }
    if (this._options.showDialog) {
      const client = getClient();
      if (client && !this._removeAfterSendEventListener) {
        this._removeAfterSendEventListener = client.on("afterSendEvent", (event) => {
          if (!event.type && event.event_id) {
            runOutsideAngular(() => {
              showReportDialog(__spreadProps(__spreadValues({}, this._options.dialogOptions), {
                eventId: event.event_id
              }));
            });
          }
        });
      } else if (!client) {
        runOutsideAngular(() => {
          showReportDialog(__spreadProps(__spreadValues({}, this._options.dialogOptions), {
            eventId
          }));
        });
      }
    }
  }
  /**
   * Used to pull a desired value that will be used to capture an event out of the raw value captured by ErrorHandler.
   */
  _extractError(error) {
    if (this._options.extractor) {
      const defaultExtractor = this._defaultExtractor.bind(this);
      return this._options.extractor(error, defaultExtractor);
    }
    return this._defaultExtractor(error);
  }
  /**
   * Default implementation of error extraction that handles default error wrapping, HTTP responses, ErrorEvent and few other known cases.
   */
  _defaultExtractor(errorCandidate) {
    const error = tryToUnwrapZonejsError(errorCandidate);
    if (error instanceof HttpErrorResponse) {
      return extractHttpModuleError(error);
    }
    if (typeof error === "string" || isErrorOrErrorLikeObject(error)) {
      return error;
    }
    return null;
  }
};
SentryErrorHandler.ɵfac = function SentryErrorHandler_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || SentryErrorHandler)(ɵɵinject("errorHandlerOptions"));
};
SentryErrorHandler.ɵprov = ɵɵdefineInjectable({
  token: SentryErrorHandler,
  factory: SentryErrorHandler.ɵfac,
  providedIn: "root"
});
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(SentryErrorHandler, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], function() {
    return [{
      type: void 0,
      decorators: [{
        type: Inject,
        args: ["errorHandlerOptions"]
      }]
    }];
  }, null);
})();
function createErrorHandler(config) {
  return new SentryErrorHandler(config);
}
var ANGULAR_ROUTING_OP = "ui.angular.routing";
var ANGULAR_INIT_OP = "ui.angular.init";
var ANGULAR_OP = "ui.angular";
var instrumentationInitialized;
function browserTracingIntegration2(options = {}) {
  if (options.instrumentNavigation !== false) {
    instrumentationInitialized = true;
  }
  return browserTracingIntegration(__spreadProps(__spreadValues({}, options), {
    instrumentNavigation: false
  }));
}
function _updateSpanAttributesForParametrizedUrl(route, span) {
  const attributes = span && spanToJSON(span).data || {};
  if (span && attributes[SEMANTIC_ATTRIBUTE_SENTRY_SOURCE] === "url") {
    span.updateName(route);
    span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_SOURCE, "route");
    span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN, `auto.${spanToJSON(span).op}.angular`);
  }
}
var TraceService = class {
  constructor(_router) {
    this._router = _router;
    this.navStart$ = this._router.events.pipe(filter((event) => event instanceof NavigationStart), tap((navigationEvent) => {
      if (!instrumentationInitialized) {
        IS_DEBUG_BUILD && logger.error("Angular integration has tracing enabled, but Tracing integration is not configured");
        return;
      }
      if (this._routingSpan) {
        this._routingSpan.end();
        this._routingSpan = null;
      }
      const client = getClient();
      const strippedUrl = stripUrlQueryAndFragment(navigationEvent.url);
      if (client) {
        if (!this._isPageloadOngoing()) {
          runOutsideAngular(() => {
            startBrowserTracingNavigationSpan(client, {
              name: strippedUrl,
              attributes: {
                [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.navigation.angular",
                [SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: "url"
              }
            });
          });
        } else {
          this._pageloadOngoing = false;
        }
        this._routingSpan = runOutsideAngular(() => startInactiveSpan({
          name: `${navigationEvent.url}`,
          op: ANGULAR_ROUTING_OP,
          attributes: __spreadValues({
            [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.ui.angular",
            [SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: "url",
            url: strippedUrl
          }, navigationEvent.navigationTrigger && {
            navigationTrigger: navigationEvent.navigationTrigger
          })
        })) || null;
        return;
      }
    }));
    this.resEnd$ = this._router.events.pipe(filter((event) => event instanceof ResolveEnd), tap((event) => {
      const route = getParameterizedRouteFromSnapshot(event.state.root);
      if (route) {
        getCurrentScope().setTransactionName(route);
      }
      const activeSpan = getActiveSpan();
      const rootSpan = activeSpan && getRootSpan(activeSpan);
      _updateSpanAttributesForParametrizedUrl(route, rootSpan);
    }));
    this.navEnd$ = this._router.events.pipe(filter((event) => event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError), tap(() => {
      if (this._routingSpan) {
        runOutsideAngular(() => {
          this._routingSpan.end();
        });
        this._routingSpan = null;
      }
    }));
    this._routingSpan = null;
    this._pageloadOngoing = true;
    this._subscription = new Subscription();
    this._subscription.add(this.navStart$.subscribe());
    this._subscription.add(this.resEnd$.subscribe());
    this._subscription.add(this.navEnd$.subscribe());
  }
  /**
   * This is used to prevent memory leaks when the root view is created and destroyed multiple times,
   * since `subscribe` callbacks capture `this` and prevent many resources from being GC'd.
   */
  ngOnDestroy() {
    this._subscription.unsubscribe();
  }
  /**
   * We only _avoid_ creating a navigation root span in one case:
   *
   * There is an ongoing pageload span AND the router didn't yet emit the first navigation start event
   *
   * The first navigation start event will create the child routing span
   * and update the pageload root span name on ResolveEnd.
   *
   * There's an edge case we need to avoid here: If the router fires the first navigation start event
   * _after_ the pageload root span finished. This is why we check for the pageload root span.
   * Possible real-world scenario: Angular application and/or router is bootstrapped after the pageload
   * idle root span finished
   *
   * The overall rationale is:
   * - if we already avoided creating a navigation root span once, we don't avoid it again
   *   (i.e. set `_pageloadOngoing` to `false`)
   * - if `_pageloadOngoing` is already `false`, create a navigation root span
   * - if there's no active/pageload root span, create a navigation root span
   * - only if there's an ongoing pageload root span AND `_pageloadOngoing` is still `true,
   *   don't create a navigation root span
   */
  _isPageloadOngoing() {
    if (!this._pageloadOngoing) {
      return false;
    }
    const activeSpan = getActiveSpan();
    if (!activeSpan) {
      this._pageloadOngoing = false;
      return false;
    }
    const rootSpan = getRootSpan(activeSpan);
    this._pageloadOngoing = spanToJSON(rootSpan).op === "pageload";
    return this._pageloadOngoing;
  }
};
TraceService.ɵfac = function TraceService_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || TraceService)(ɵɵinject(Router));
};
TraceService.ɵprov = ɵɵdefineInjectable({
  token: TraceService,
  factory: TraceService.ɵfac,
  providedIn: "root"
});
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(TraceService, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], function() {
    return [{
      type: Router
    }];
  }, null);
})();
var UNKNOWN_COMPONENT = "unknown";
var TraceDirective = class {
  /**
   * Implementation of OnInit lifecycle method
   * @inheritdoc
   */
  ngOnInit() {
    if (!this.componentName) {
      this.componentName = UNKNOWN_COMPONENT;
    }
    if (getActiveSpan()) {
      this._tracingSpan = runOutsideAngular(() => startInactiveSpan({
        name: `<${this.componentName}>`,
        op: ANGULAR_INIT_OP,
        attributes: {
          [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.ui.angular.trace_directive"
        }
      }));
    }
  }
  /**
   * Implementation of AfterViewInit lifecycle method
   * @inheritdoc
   */
  ngAfterViewInit() {
    if (this._tracingSpan) {
      runOutsideAngular(() => this._tracingSpan.end());
    }
  }
};
TraceDirective.ɵfac = function TraceDirective_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || TraceDirective)();
};
TraceDirective.ɵdir = ɵɵdefineDirective({
  type: TraceDirective,
  selectors: [["", "trace", ""]],
  inputs: {
    componentName: [0, "trace", "componentName"]
  }
});
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(TraceDirective, [{
    type: Directive,
    args: [{
      selector: "[trace]"
    }]
  }], null, {
    componentName: [{
      type: Input,
      args: ["trace"]
    }]
  });
})();
var TraceModule = class {
};
TraceModule.ɵfac = function TraceModule_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || TraceModule)();
};
TraceModule.ɵmod = ɵɵdefineNgModule({
  type: TraceModule,
  declarations: [TraceDirective],
  exports: [TraceDirective]
});
TraceModule.ɵinj = ɵɵdefineInjector({});
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(TraceModule, [{
    type: NgModule,
    args: [{
      declarations: [TraceDirective],
      exports: [TraceDirective]
    }]
  }], null, null);
})();
function TraceClass(options) {
  let tracingSpan;
  return (target) => {
    const originalOnInit = target.prototype.ngOnInit;
    target.prototype.ngOnInit = function(...args) {
      tracingSpan = runOutsideAngular(() => startInactiveSpan({
        onlyIfParent: true,
        name: `<${options && options.name ? options.name : "unnamed"}>`,
        op: ANGULAR_INIT_OP,
        attributes: {
          [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.ui.angular.trace_class_decorator"
        }
      }));
      if (originalOnInit) {
        return originalOnInit.apply(this, args);
      }
    };
    const originalAfterViewInit = target.prototype.ngAfterViewInit;
    target.prototype.ngAfterViewInit = function(...args) {
      if (tracingSpan) {
        runOutsideAngular(() => tracingSpan.end());
      }
      if (originalAfterViewInit) {
        return originalAfterViewInit.apply(this, args);
      }
    };
  };
}
function TraceMethod(options) {
  return (target, propertyKey, descriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = function(...args) {
      const now = timestampInSeconds();
      runOutsideAngular(() => {
        startInactiveSpan({
          onlyIfParent: true,
          name: `<${options && options.name ? options.name : "unnamed"}>`,
          op: `${ANGULAR_OP}.${String(propertyKey)}`,
          startTime: now,
          attributes: {
            [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.ui.angular.trace_method_decorator"
          }
        }).end(now);
      });
      if (originalMethod) {
        return originalMethod.apply(this, args);
      }
    };
    return descriptor;
  };
}
function getParameterizedRouteFromSnapshot(route) {
  const parts = [];
  let currentRoute = route && route.firstChild;
  while (currentRoute) {
    const path = currentRoute && currentRoute.routeConfig && currentRoute.routeConfig.path;
    if (path === null || path === void 0) {
      break;
    }
    parts.push(path);
    currentRoute = currentRoute.firstChild;
  }
  const fullPath = parts.filter((part) => part).join("/");
  return fullPath ? `/${fullPath}/` : "/";
}
export {
  BrowserClient,
  SDK_VERSION,
  SEMANTIC_ATTRIBUTE_SENTRY_OP,
  SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN,
  SEMANTIC_ATTRIBUTE_SENTRY_SAMPLE_RATE,
  SEMANTIC_ATTRIBUTE_SENTRY_SOURCE,
  Scope,
  SentryErrorHandler,
  TraceClass,
  TraceDirective,
  TraceMethod,
  TraceModule,
  TraceService,
  WINDOW4 as WINDOW,
  addBreadcrumb,
  addEventProcessor,
  addIntegration,
  addTracingExtensions,
  breadcrumbsIntegration,
  browserApiErrorsIntegration,
  browserProfilingIntegration,
  browserTracingIntegration2 as browserTracingIntegration,
  captureConsoleIntegration,
  captureEvent,
  captureException,
  captureFeedback,
  captureMessage,
  captureSession,
  captureUserFeedback,
  chromeStackLineParser,
  close,
  contextLinesIntegration,
  continueTrace,
  createErrorHandler,
  createTransport,
  createUserFeedbackEnvelope,
  debugIntegration,
  dedupeIntegration,
  defaultRequestInstrumentationOptions,
  defaultStackLineParsers,
  defaultStackParser,
  endSession,
  eventFromException,
  eventFromMessage2 as eventFromMessage,
  exceptionFromError2 as exceptionFromError,
  extraErrorDataIntegration,
  feedbackAsyncIntegration,
  feedbackSyncIntegration as feedbackIntegration,
  feedbackSyncIntegration,
  flush,
  forceLoad,
  functionToStringIntegration,
  geckoStackLineParser,
  getActiveSpan,
  getClient,
  getCurrentHub,
  getCurrentScope,
  getDefaultIntegrations2 as getDefaultIntegrations,
  getFeedback,
  getGlobalScope,
  getIsolationScope,
  getReplay,
  getRootSpan,
  getSpanDescendants,
  getSpanStatusFromHttpCode,
  globalHandlersIntegration,
  httpClientIntegration,
  httpContextIntegration,
  inboundFiltersIntegration,
  init2 as init,
  instrumentOutgoingRequests,
  isInitialized,
  lastEventId,
  lazyLoadIntegration,
  linkedErrorsIntegration2 as linkedErrorsIntegration,
  makeBrowserOfflineTransport,
  makeFetchTransport,
  makeMultiplexedTransport,
  metrics2 as metrics,
  moduleMetadataIntegration,
  onLoad,
  opera10StackLineParser,
  opera11StackLineParser,
  parameterize,
  registerSpanErrorInstrumentation,
  replayCanvasIntegration,
  replayIntegration,
  reportingObserverIntegration,
  rewriteFramesIntegration,
  sendFeedback,
  sessionTimingIntegration,
  setContext,
  setCurrentClient,
  setExtra,
  setExtras,
  setHttpStatus,
  setMeasurement,
  setTag,
  setTags,
  setUser,
  showReportDialog,
  spanToBaggageHeader,
  spanToJSON,
  spanToTraceHeader,
  startBrowserTracingNavigationSpan,
  startBrowserTracingPageLoadSpan,
  startInactiveSpan,
  startNewTrace,
  startSession,
  startSpan,
  startSpanManual,
  suppressTracing,
  thirdPartyErrorFilterIntegration,
  winjsStackLineParser,
  withActiveSpan,
  withIsolationScope2 as withIsolationScope,
  withScope2 as withScope,
  zodErrorsIntegration
};
//# sourceMappingURL=@sentry_angular.js.map
