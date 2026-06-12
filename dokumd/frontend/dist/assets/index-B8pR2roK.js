//#region \0vite/modulepreload-polyfill.js
(function polyfill() {
	const relList = document.createElement("link").relList;
	if (relList && relList.supports && relList.supports("modulepreload")) return;
	for (const link of document.querySelectorAll("link[rel=\"modulepreload\"]")) processPreload(link);
	new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			if (mutation.type !== "childList") continue;
			for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
		}
	}).observe(document, {
		childList: true,
		subtree: true
	});
	function getFetchOpts(link) {
		const fetchOpts = {};
		if (link.integrity) fetchOpts.integrity = link.integrity;
		if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
		if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
		else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
		else fetchOpts.credentials = "same-origin";
		return fetchOpts;
	}
	function processPreload(link) {
		if (link.ep) return;
		link.ep = true;
		const fetchOpts = getFetchOpts(link);
		fetch(link.href, fetchOpts);
	}
})();
//#endregion
//#region node_modules/svelte/src/internal/shared/utils.js
var is_array = Array.isArray;
var index_of = Array.prototype.indexOf;
var includes = Array.prototype.includes;
var array_from = Array.from;
var define_property = Object.defineProperty;
var get_descriptor = Object.getOwnPropertyDescriptor;
var get_descriptors = Object.getOwnPropertyDescriptors;
var object_prototype = Object.prototype;
var array_prototype = Array.prototype;
var get_prototype_of = Object.getPrototypeOf;
var is_extensible = Object.isExtensible;
/**
* @param {any} thing
* @returns {thing is Function}
*/
function is_function(thing) {
	return typeof thing === "function";
}
var noop = () => {};
/** @param {Function} fn */
function run(fn) {
	return fn();
}
/** @param {Array<() => void>} arr */
function run_all(arr) {
	for (var i = 0; i < arr.length; i++) arr[i]();
}
/**
* TODO replace with Promise.withResolvers once supported widely enough
* @template [T=void]
*/
function deferred() {
	/** @type {(value: T) => void} */
	var resolve;
	/** @type {(reason: any) => void} */
	var reject;
	return {
		promise: new Promise((res, rej) => {
			resolve = res;
			reject = rej;
		}),
		resolve,
		reject
	};
}
/**
* When encountering a situation like `let [a, b, c] = $derived(blah())`,
* we need to stash an intermediate value that `a`, `b`, and `c` derive
* from, in case it's an iterable
* @template T
* @param {ArrayLike<T> | Iterable<T>} value
* @param {number} [n]
* @returns {Array<T>}
*/
function to_array(value, n) {
	if (Array.isArray(value)) return value;
	if (n === void 0 || !(Symbol.iterator in value)) return Array.from(value);
	/** @type {T[]} */
	const array = [];
	for (const element of value) {
		array.push(element);
		if (array.length === n) break;
	}
	return array;
}
//#endregion
//#region node_modules/svelte/src/internal/client/constants.js
/**
* An effect that does not destroy its child effects when it reruns.
* Runs as part of render effects, i.e. not eagerly as part of tree traversal or effect flushing.
*/
var MANAGED_EFFECT = 1 << 24;
var CLEAN = 1024;
var DIRTY = 2048;
var MAYBE_DIRTY = 4096;
var INERT = 8192;
var DESTROYED = 16384;
/** Set once a reaction has run for the first time */
var REACTION_RAN = 32768;
/** Effect is in the process of getting destroyed. Can be observed in child teardown functions */
var DESTROYING = 1 << 25;
/**
* 'Transparent' effects do not create a transition boundary.
* This is on a block effect 99% of the time but may also be on a branch effect if its parent block effect was pruned
*/
var EFFECT_TRANSPARENT = 65536;
var EFFECT_PRESERVED = 1 << 19;
var USER_EFFECT = 1 << 20;
var EFFECT_OFFSCREEN = 1 << 25;
/**
* Tells that we marked this derived and its reactions as visited during the "mark as (maybe) dirty"-phase.
* Will be lifted during execution of the derived and during checking its dirty state (both are necessary
* because a derived might be checked but not executed). This is a pure performance optimization flag and
* should not be used for any other purpose!
*/
var WAS_MARKED = 65536;
var REACTION_IS_UPDATING = 1 << 21;
var ASYNC = 1 << 22;
var ERROR_VALUE = 1 << 23;
var STATE_SYMBOL = Symbol("$state");
var LEGACY_PROPS = Symbol("legacy props");
var LOADING_ATTR_SYMBOL = Symbol("");
var ATTRIBUTES_CACHE = Symbol("attributes");
var CLASS_CACHE = Symbol("class");
var STYLE_CACHE = Symbol("style");
var TEXT_CACHE = Symbol("text");
var FORM_RESET_HANDLER = Symbol("form reset");
/** allow users to ignore aborted signal errors if `reason.name === 'StaleReactionError` */
var STALE_REACTION = new class StaleReactionError extends Error {
	name = "StaleReactionError";
	message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
var IS_XHTML = !!globalThis.document?.contentType && /* @__PURE__ */ globalThis.document.contentType.includes("xml");
/**
* `%name%(...)` can only be used during component initialisation
* @param {string} name
* @returns {never}
*/
function lifecycle_outside_component(name) {
	throw new Error(`https://svelte.dev/e/lifecycle_outside_component`);
}
//#endregion
//#region node_modules/svelte/src/internal/client/errors.js
/**
* Cannot create a `$derived(...)` with an `await` expression outside of an effect tree
* @returns {never}
*/
function async_derived_orphan() {
	throw new Error(`https://svelte.dev/e/async_derived_orphan`);
}
/**
* Keyed each block has duplicate key `%value%` at indexes %a% and %b%
* @param {string} a
* @param {string} b
* @param {string | undefined | null} [value]
* @returns {never}
*/
function each_key_duplicate(a, b, value) {
	throw new Error(`https://svelte.dev/e/each_key_duplicate`);
}
/**
* `%rune%` cannot be used inside an effect cleanup function
* @param {string} rune
* @returns {never}
*/
function effect_in_teardown(rune) {
	throw new Error(`https://svelte.dev/e/effect_in_teardown`);
}
/**
* Effect cannot be created inside a `$derived` value that was not itself created inside an effect
* @returns {never}
*/
function effect_in_unowned_derived() {
	throw new Error(`https://svelte.dev/e/effect_in_unowned_derived`);
}
/**
* `%rune%` can only be used inside an effect (e.g. during component initialisation)
* @param {string} rune
* @returns {never}
*/
function effect_orphan(rune) {
	throw new Error(`https://svelte.dev/e/effect_orphan`);
}
/**
* Maximum update depth exceeded. This typically indicates that an effect reads and writes the same piece of state
* @returns {never}
*/
function effect_update_depth_exceeded() {
	throw new Error(`https://svelte.dev/e/effect_update_depth_exceeded`);
}
/**
* Cannot do `bind:%key%={undefined}` when `%key%` has a fallback value
* @param {string} key
* @returns {never}
*/
function props_invalid_value(key) {
	throw new Error(`https://svelte.dev/e/props_invalid_value`);
}
/**
* Property descriptors defined on `$state` objects must contain `value` and always be `enumerable`, `configurable` and `writable`.
* @returns {never}
*/
function state_descriptors_fixed() {
	throw new Error(`https://svelte.dev/e/state_descriptors_fixed`);
}
/**
* Cannot set prototype of `$state` object
* @returns {never}
*/
function state_prototype_fixed() {
	throw new Error(`https://svelte.dev/e/state_prototype_fixed`);
}
/**
* Updating state inside `$derived(...)`, `$inspect(...)` or a template expression is forbidden. If the value should not be reactive, declare it without `$state`
* @returns {never}
*/
function state_unsafe_mutation() {
	throw new Error(`https://svelte.dev/e/state_unsafe_mutation`);
}
/**
* A `<svelte:boundary>` `reset` function cannot be called while an error is still being handled
* @returns {never}
*/
function svelte_boundary_reset_onerror() {
	throw new Error(`https://svelte.dev/e/svelte_boundary_reset_onerror`);
}
//#endregion
//#region node_modules/svelte/src/constants.js
var HYDRATION_ERROR = {};
var UNINITIALIZED = Symbol("uninitialized");
var NAMESPACE_HTML = "http://www.w3.org/1999/xhtml";
var NAMESPACE_SVG = "http://www.w3.org/2000/svg";
/**
* Reading a derived belonging to a now-destroyed effect may result in stale values
*/
function derived_inert() {
	console.warn(`https://svelte.dev/e/derived_inert`);
}
/**
* Hydration failed because the initial UI does not match what was rendered on the server. The error occurred near %location%
* @param {string | undefined | null} [location]
*/
function hydration_mismatch(location) {
	console.warn(`https://svelte.dev/e/hydration_mismatch`);
}
/**
* The `value` property of a `<select multiple>` element should be an array, but it received a non-array value. The selection will be kept as is.
*/
function select_multiple_invalid_value() {
	console.warn(`https://svelte.dev/e/select_multiple_invalid_value`);
}
/**
* A `<svelte:boundary>` `reset` function only resets the boundary the first time it is called
*/
function svelte_boundary_reset_noop() {
	console.warn(`https://svelte.dev/e/svelte_boundary_reset_noop`);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/hydration.js
/** @import { TemplateNode } from '#client' */
/**
* Use this variable to guard everything related to hydration code so it can be treeshaken out
* if the user doesn't use the `hydrate` method and these code paths are therefore not needed.
*/
var hydrating = false;
/** @param {boolean} value */
function set_hydrating(value) {
	hydrating = value;
}
/**
* The node that is currently being hydrated. This starts out as the first node inside the opening
* <!--[--> comment, and updates each time a component calls `$.child(...)` or `$.sibling(...)`.
* When entering a block (e.g. `{#if ...}`), `hydrate_node` is the block opening comment; by the
* time we leave the block it is the closing comment, which serves as the block's anchor.
* @type {TemplateNode}
*/
var hydrate_node;
/** @param {TemplateNode | null} node */
function set_hydrate_node(node) {
	if (node === null) {
		hydration_mismatch();
		throw HYDRATION_ERROR;
	}
	return hydrate_node = node;
}
function hydrate_next() {
	return set_hydrate_node(/* @__PURE__ */ get_next_sibling(hydrate_node));
}
/** @param {TemplateNode} node */
function reset(node) {
	if (!hydrating) return;
	if (/* @__PURE__ */ get_next_sibling(hydrate_node) !== null) {
		hydration_mismatch();
		throw HYDRATION_ERROR;
	}
	hydrate_node = node;
}
function next(count = 1) {
	if (hydrating) {
		var i = count;
		var node = hydrate_node;
		while (i--) node = /* @__PURE__ */ get_next_sibling(node);
		hydrate_node = node;
	}
}
/**
* Skips or removes (depending on {@link remove}) all nodes starting at `hydrate_node` up until the next hydration end comment
* @param {boolean} remove
*/
function skip_nodes(remove = true) {
	var depth = 0;
	var node = hydrate_node;
	while (true) {
		if (node.nodeType === 8) {
			var data = node.data;
			if (data === "]") {
				if (depth === 0) return node;
				depth -= 1;
			} else if (data === "[" || data === "[!" || data[0] === "[" && !isNaN(Number(data.slice(1)))) depth += 1;
		}
		var next = /* @__PURE__ */ get_next_sibling(node);
		if (remove) node.remove();
		node = next;
	}
}
/**
*
* @param {TemplateNode} node
*/
function read_hydration_instruction(node) {
	if (!node || node.nodeType !== 8) {
		hydration_mismatch();
		throw HYDRATION_ERROR;
	}
	return node.data;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/equality.js
/** @import { Equals } from '#client' */
/** @type {Equals} */
function equals(value) {
	return value === this.v;
}
/**
* @param {unknown} a
* @param {unknown} b
* @returns {boolean}
*/
function safe_not_equal(a, b) {
	return a != a ? b == b : a !== b || a !== null && typeof a === "object" || typeof a === "function";
}
/** @type {Equals} */
function safe_equals(value) {
	return !safe_not_equal(value, this.v);
}
//#endregion
//#region node_modules/svelte/src/internal/flags/index.js
/** True if experimental.async=true */
var async_mode_flag = false;
/** True if we're not certain that we only have Svelte 5 code in the compilation */
var legacy_mode_flag = false;
function enable_legacy_mode_flag() {
	legacy_mode_flag = true;
}
//#endregion
//#region node_modules/svelte/src/internal/client/context.js
/** @import { ComponentContext, DevStackEntry, Effect } from '#client' */
/** @type {ComponentContext | null} */
var component_context = null;
/** @param {ComponentContext | null} context */
function set_component_context(context) {
	component_context = context;
}
/**
* @param {Record<string, unknown>} props
* @param {any} runes
* @param {Function} [fn]
* @returns {void}
*/
function push(props, runes = false, fn) {
	component_context = {
		p: component_context,
		i: false,
		c: null,
		e: null,
		s: props,
		x: null,
		r: active_effect,
		l: legacy_mode_flag && !runes ? {
			s: null,
			u: null,
			$: []
		} : null
	};
}
/**
* @template {Record<string, any>} T
* @param {T} [component]
* @returns {T}
*/
function pop(component) {
	var context = component_context;
	var effects = context.e;
	if (effects !== null) {
		context.e = null;
		for (var fn of effects) create_user_effect(fn);
	}
	if (component !== void 0) context.x = component;
	context.i = true;
	component_context = context.p;
	return component ?? {};
}
/** @returns {boolean} */
function is_runes() {
	return !legacy_mode_flag || component_context !== null && component_context.l === null;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/task.js
/** @type {Array<() => void>} */
var micro_tasks = [];
function run_micro_tasks() {
	var tasks = micro_tasks;
	micro_tasks = [];
	run_all(tasks);
}
/**
* @param {() => void} fn
*/
function queue_micro_task(fn) {
	if (micro_tasks.length === 0 && !is_flushing_sync) {
		var tasks = micro_tasks;
		queueMicrotask(() => {
			if (tasks === micro_tasks) run_micro_tasks();
		});
	}
	micro_tasks.push(fn);
}
/**
* @param {unknown} error
*/
function handle_error(error) {
	var effect = active_effect;
	if (effect === null) {
		/** @type {Derived} */ active_reaction.f |= ERROR_VALUE;
		return error;
	}
	if ((effect.f & 32768) === 0 && (effect.f & 4) === 0) throw error;
	invoke_error_boundary(error, effect);
}
/**
* @param {unknown} error
* @param {Effect | null} effect
*/
function invoke_error_boundary(error, effect) {
	if (effect !== null && (effect.f & 16384) !== 0) return;
	while (effect !== null) {
		if ((effect.f & 128) !== 0) {
			if ((effect.f & 32768) === 0) throw error;
			try {
				/** @type {Boundary} */ effect.b.error(error);
				return;
			} catch (e) {
				error = e;
			}
		}
		effect = effect.parent;
	}
	throw error;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/status.js
/** @import { Derived, Signal } from '#client' */
var STATUS_MASK = ~(DIRTY | MAYBE_DIRTY | CLEAN);
/**
* @param {Signal} signal
* @param {number} status
*/
function set_signal_status(signal, status) {
	signal.f = signal.f & STATUS_MASK | status;
}
/**
* Set a derived's status to CLEAN or MAYBE_DIRTY based on its connection state.
* @param {Derived} derived
*/
function update_derived_status(derived) {
	if ((derived.f & 512) !== 0 || derived.deps === null) set_signal_status(derived, CLEAN);
	else set_signal_status(derived, MAYBE_DIRTY);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/utils.js
/** @import { Derived, Effect, Value } from '#client' */
/**
* @param {Value[] | null} deps
*/
function clear_marked(deps) {
	if (deps === null) return;
	for (const dep of deps) {
		if ((dep.f & 2) === 0 || (dep.f & 65536) === 0) continue;
		dep.f ^= WAS_MARKED;
		clear_marked(
			/** @type {Derived} */
			dep.deps
		);
	}
}
/**
* @param {Effect} effect
* @param {Set<Effect>} dirty_effects
* @param {Set<Effect>} maybe_dirty_effects
*/
function defer_effect(effect, dirty_effects, maybe_dirty_effects) {
	if ((effect.f & 2048) !== 0) dirty_effects.add(effect);
	else if ((effect.f & 4096) !== 0) maybe_dirty_effects.add(effect);
	clear_marked(effect.deps);
	set_signal_status(effect, CLEAN);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/store.js
/**
* We set this to `true` when updating a store so that we correctly
* schedule effects if the update takes place inside a `$:` effect
*/
var legacy_is_updating_store = false;
/**
* Whether or not the prop currently being read is a store binding, as in
* `<Child bind:x={$y} />`. If it is, we treat the prop as mutable even in
* runes mode, and skip `binding_property_non_reactive` validation
*/
var is_store_binding = false;
/**
* Returns a tuple that indicates whether `fn()` reads a prop that is a store binding.
* Used to prevent `binding_property_non_reactive` validation false positives and
* ensure that these props are treated as mutable even in runes mode
* @template T
* @param {() => T} fn
* @returns {[T, boolean]}
*/
function capture_store_binding(fn) {
	var previous_is_store_binding = is_store_binding;
	try {
		is_store_binding = false;
		return [fn(), is_store_binding];
	} finally {
		is_store_binding = previous_is_store_binding;
	}
}
//#endregion
//#region node_modules/svelte/src/reactivity/create-subscriber.js
/**
* Returns a `subscribe` function that integrates external event-based systems with Svelte's reactivity.
* It's particularly useful for integrating with web APIs like `MediaQuery`, `IntersectionObserver`, or `WebSocket`.
*
* If `subscribe` is called inside an effect (including indirectly, for example inside a getter),
* the `start` callback will be called with an `update` function. Whenever `update` is called, the effect re-runs.
*
* If `start` returns a cleanup function, it will be called when the effect is destroyed.
*
* If `subscribe` is called in multiple effects, `start` will only be called once as long as the effects
* are active, and the returned teardown function will only be called when all effects are destroyed.
*
* It's best understood with an example. Here's an implementation of [`MediaQuery`](https://svelte.dev/docs/svelte/svelte-reactivity#MediaQuery):
*
* ```js
* import { createSubscriber } from 'svelte/reactivity';
* import { on } from 'svelte/events';
*
* export class MediaQuery {
* 	#query;
* 	#subscribe;
*
* 	constructor(query) {
* 		this.#query = window.matchMedia(`(${query})`);
*
* 		this.#subscribe = createSubscriber((update) => {
* 			// when the `change` event occurs, re-run any effects that read `this.current`
* 			const off = on(this.#query, 'change', update);
*
* 			// stop listening when all the effects are destroyed
* 			return () => off();
* 		});
* 	}
*
* 	get current() {
* 		// This makes the getter reactive, if read in an effect
* 		this.#subscribe();
*
* 		// Return the current state of the query, whether or not we're in an effect
* 		return this.#query.matches;
* 	}
* }
* ```
* @param {(update: () => void) => (() => void) | void} start
* @since 5.7.0
*/
function createSubscriber(start) {
	let subscribers = 0;
	let version = source(0);
	/** @type {(() => void) | void} */
	let stop;
	return () => {
		if (effect_tracking()) {
			get(version);
			render_effect(() => {
				if (subscribers === 0) stop = untrack(() => start(() => increment(version)));
				subscribers += 1;
				return () => {
					queue_micro_task(() => {
						subscribers -= 1;
						if (subscribers === 0) {
							stop?.();
							stop = void 0;
							increment(version);
						}
					});
				};
			});
		}
	};
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/boundary.js
/** @import { Effect, Source, TemplateNode, } from '#client' */
/**
* @typedef {{
* 	 onerror?: ((error: unknown, reset: () => void) => void) | null;
*   failed?: ((anchor: Node, error: () => unknown, reset: () => () => void) => void) | null;
*   pending?: ((anchor: Node) => void) | null;
* }} BoundaryProps
*/
var flags = EFFECT_TRANSPARENT | EFFECT_PRESERVED;
/**
* @param {TemplateNode} node
* @param {BoundaryProps} props
* @param {((anchor: Node) => void)} children
* @param {((error: unknown) => unknown) | undefined} [transform_error]
* @returns {void}
*/
function boundary(node, props, children, transform_error) {
	new Boundary(node, props, children, transform_error);
}
var Boundary = class {
	/** @type {Boundary | null} */
	parent;
	is_pending = false;
	/**
	* API-level transformError transform function. Transforms errors before they reach the `failed` snippet.
	* Inherited from parent boundary, or defaults to identity.
	* @type {(error: unknown) => unknown}
	*/
	transform_error;
	/** @type {TemplateNode} */
	#anchor;
	/** @type {TemplateNode | null} */
	#hydrate_open = hydrating ? hydrate_node : null;
	/** @type {BoundaryProps} */
	#props;
	/** @type {((anchor: Node) => void)} */
	#children;
	/** @type {Effect} */
	#effect;
	/** @type {Effect | null} */
	#main_effect = null;
	/** @type {Effect | null} */
	#pending_effect = null;
	/** @type {Effect | null} */
	#failed_effect = null;
	/** @type {DocumentFragment | null} */
	#offscreen_fragment = null;
	#local_pending_count = 0;
	#pending_count = 0;
	#pending_count_update_queued = false;
	/** @type {Set<Effect>} */
	#dirty_effects = /* @__PURE__ */ new Set();
	/** @type {Set<Effect>} */
	#maybe_dirty_effects = /* @__PURE__ */ new Set();
	/**
	* A source containing the number of pending async deriveds/expressions.
	* Only created if `$effect.pending()` is used inside the boundary,
	* otherwise updating the source results in needless `Batch.ensure()`
	* calls followed by no-op flushes
	* @type {Source<number> | null}
	*/
	#effect_pending = null;
	#effect_pending_subscriber = createSubscriber(() => {
		this.#effect_pending = source(this.#local_pending_count);
		return () => {
			this.#effect_pending = null;
		};
	});
	/**
	* @param {TemplateNode} node
	* @param {BoundaryProps} props
	* @param {((anchor: Node) => void)} children
	* @param {((error: unknown) => unknown) | undefined} [transform_error]
	*/
	constructor(node, props, children, transform_error) {
		this.#anchor = node;
		this.#props = props;
		this.#children = (anchor) => {
			var effect = active_effect;
			effect.b = this;
			effect.f |= 128;
			children(anchor);
		};
		this.parent = active_effect.b;
		this.transform_error = transform_error ?? this.parent?.transform_error ?? ((e) => e);
		this.#effect = block(() => {
			if (hydrating) {
				const comment = this.#hydrate_open;
				hydrate_next();
				const server_rendered_pending = comment.data === "[!";
				if (comment.data.startsWith("[?")) {
					const serialized_error = JSON.parse(comment.data.slice(2));
					this.#hydrate_failed_content(serialized_error);
				} else if (server_rendered_pending) this.#hydrate_pending_content();
				else this.#hydrate_resolved_content();
			} else this.#render();
		}, flags);
		if (hydrating) this.#anchor = hydrate_node;
	}
	#hydrate_resolved_content() {
		try {
			this.#main_effect = branch(() => this.#children(this.#anchor));
		} catch (error) {
			this.error(error);
		}
	}
	/**
	* @param {unknown} error The deserialized error from the server's hydration comment
	*/
	#hydrate_failed_content(error) {
		const failed = this.#props.failed;
		if (!failed) return;
		this.#failed_effect = branch(() => {
			failed(this.#anchor, () => error, () => () => {});
		});
	}
	#hydrate_pending_content() {
		const pending = this.#props.pending;
		if (!pending) return;
		this.is_pending = true;
		this.#pending_effect = branch(() => pending(this.#anchor));
		queue_micro_task(() => {
			var fragment = this.#offscreen_fragment = document.createDocumentFragment();
			var anchor = create_text();
			fragment.append(anchor);
			this.#main_effect = this.#run(() => {
				return branch(() => this.#children(anchor));
			});
			if (this.#pending_count === 0) {
				this.#anchor.before(fragment);
				this.#offscreen_fragment = null;
				pause_effect(this.#pending_effect, () => {
					this.#pending_effect = null;
				});
				this.#resolve(current_batch);
			}
		});
	}
	#render() {
		try {
			this.is_pending = this.has_pending_snippet();
			this.#pending_count = 0;
			this.#local_pending_count = 0;
			this.#main_effect = branch(() => {
				this.#children(this.#anchor);
			});
			if (this.#pending_count > 0) {
				var fragment = this.#offscreen_fragment = document.createDocumentFragment();
				move_effect(this.#main_effect, fragment);
				const pending = this.#props.pending;
				this.#pending_effect = branch(() => pending(this.#anchor));
			} else this.#resolve(current_batch);
		} catch (error) {
			this.error(error);
		}
	}
	/**
	* @param {Batch} batch
	*/
	#resolve(batch) {
		this.is_pending = false;
		batch.transfer_effects(this.#dirty_effects, this.#maybe_dirty_effects);
	}
	/**
	* Defer an effect inside a pending boundary until the boundary resolves
	* @param {Effect} effect
	*/
	defer_effect(effect) {
		defer_effect(effect, this.#dirty_effects, this.#maybe_dirty_effects);
	}
	/**
	* Returns `false` if the effect exists inside a boundary whose pending snippet is shown
	* @returns {boolean}
	*/
	is_rendered() {
		return !this.is_pending && (!this.parent || this.parent.is_rendered());
	}
	has_pending_snippet() {
		return !!this.#props.pending;
	}
	/**
	* @template T
	* @param {() => T} fn
	*/
	#run(fn) {
		var previous_effect = active_effect;
		var previous_reaction = active_reaction;
		var previous_ctx = component_context;
		set_active_effect(this.#effect);
		set_active_reaction(this.#effect);
		set_component_context(this.#effect.ctx);
		try {
			Batch.ensure();
			return fn();
		} catch (e) {
			handle_error(e);
			return null;
		} finally {
			set_active_effect(previous_effect);
			set_active_reaction(previous_reaction);
			set_component_context(previous_ctx);
		}
	}
	/**
	* Updates the pending count associated with the currently visible pending snippet,
	* if any, such that we can replace the snippet with content once work is done
	* @param {1 | -1} d
	* @param {Batch} batch
	*/
	#update_pending_count(d, batch) {
		if (!this.has_pending_snippet()) {
			if (this.parent) this.parent.#update_pending_count(d, batch);
			return;
		}
		this.#pending_count += d;
		if (this.#pending_count === 0) {
			this.#resolve(batch);
			if (this.#pending_effect) pause_effect(this.#pending_effect, () => {
				this.#pending_effect = null;
			});
			if (this.#offscreen_fragment) {
				this.#anchor.before(this.#offscreen_fragment);
				this.#offscreen_fragment = null;
			}
		}
	}
	/**
	* Update the source that powers `$effect.pending()` inside this boundary,
	* and controls when the current `pending` snippet (if any) is removed.
	* Do not call from inside the class
	* @param {1 | -1} d
	* @param {Batch} batch
	*/
	update_pending_count(d, batch) {
		this.#update_pending_count(d, batch);
		this.#local_pending_count += d;
		if (!this.#effect_pending || this.#pending_count_update_queued) return;
		this.#pending_count_update_queued = true;
		queue_micro_task(() => {
			this.#pending_count_update_queued = false;
			if (this.#effect_pending) internal_set(this.#effect_pending, this.#local_pending_count);
		});
	}
	get_effect_pending() {
		this.#effect_pending_subscriber();
		return get(this.#effect_pending);
	}
	/** @param {unknown} error */
	error(error) {
		if (!this.#props.onerror && !this.#props.failed) throw error;
		if (current_batch?.is_fork) {
			if (this.#main_effect) current_batch.skip_effect(this.#main_effect);
			if (this.#pending_effect) current_batch.skip_effect(this.#pending_effect);
			if (this.#failed_effect) current_batch.skip_effect(this.#failed_effect);
			current_batch.oncommit(() => {
				this.#handle_error(error);
			});
		} else this.#handle_error(error);
	}
	/**
	* @param {unknown} error
	*/
	#handle_error(error) {
		if (this.#main_effect) {
			destroy_effect(this.#main_effect);
			this.#main_effect = null;
		}
		if (this.#pending_effect) {
			destroy_effect(this.#pending_effect);
			this.#pending_effect = null;
		}
		if (this.#failed_effect) {
			destroy_effect(this.#failed_effect);
			this.#failed_effect = null;
		}
		if (hydrating) {
			set_hydrate_node(this.#hydrate_open);
			next();
			set_hydrate_node(skip_nodes());
		}
		var onerror = this.#props.onerror;
		let failed = this.#props.failed;
		var did_reset = false;
		var calling_on_error = false;
		const reset = () => {
			if (did_reset) {
				svelte_boundary_reset_noop();
				return;
			}
			did_reset = true;
			if (calling_on_error) svelte_boundary_reset_onerror();
			if (this.#failed_effect !== null) pause_effect(this.#failed_effect, () => {
				this.#failed_effect = null;
			});
			this.#run(() => {
				this.#render();
			});
		};
		/** @param {unknown} transformed_error */
		const handle_error_result = (transformed_error) => {
			try {
				calling_on_error = true;
				onerror?.(transformed_error, reset);
				calling_on_error = false;
			} catch (error) {
				invoke_error_boundary(error, this.#effect && this.#effect.parent);
			}
			if (failed) this.#failed_effect = this.#run(() => {
				try {
					return branch(() => {
						var effect = active_effect;
						effect.b = this;
						effect.f |= 128;
						failed(this.#anchor, () => transformed_error, () => reset);
					});
				} catch (error) {
					invoke_error_boundary(error, this.#effect.parent);
					return null;
				}
			});
		};
		queue_micro_task(() => {
			/** @type {unknown} */
			var result;
			try {
				result = this.transform_error(error);
			} catch (e) {
				invoke_error_boundary(e, this.#effect && this.#effect.parent);
				return;
			}
			if (result !== null && typeof result === "object" && typeof result.then === "function")
 /** @type {any} */ result.then(
				handle_error_result,
				/** @param {unknown} e */
				(e) => invoke_error_boundary(e, this.#effect && this.#effect.parent)
			);
			else handle_error_result(result);
		});
	}
};
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/async.js
/** @import { Blocker, Effect, Source, Value } from '#client' */
/**
* @param {Blocker[]} blockers
* @param {Array<() => any>} sync
* @param {Array<() => Promise<any>>} async
* @param {(values: Value[]) => any} fn
*/
function flatten(blockers, sync, async, fn) {
	const d = is_runes() ? derived : derived_safe_equal;
	var pending = blockers.filter((b) => !b.settled);
	var deriveds = sync.map(d);
	if (async.length === 0 && pending.length === 0) {
		fn(deriveds);
		return;
	}
	var parent = active_effect;
	var restore = capture();
	var blocker_promise = pending.length === 1 ? pending[0].promise : pending.length > 1 ? Promise.all(pending.map((b) => b.promise)) : null;
	/**
	* @param {Source[]} async
	*/
	function finish(async) {
		if ((parent.f & 16384) !== 0) return;
		restore();
		try {
			fn([...deriveds, ...async]);
		} catch (error) {
			invoke_error_boundary(error, parent);
		}
		unset_context();
	}
	var decrement_pending = increment_pending();
	if (async.length === 0) {
		/** @type {Promise<any>} */ blocker_promise.then(() => finish([])).finally(decrement_pending);
		return;
	}
	function run() {
		Promise.all(async.map((expression) => /* @__PURE__ */ async_derived(expression))).then(finish).catch((error) => invoke_error_boundary(error, parent)).finally(decrement_pending);
	}
	if (blocker_promise) blocker_promise.then(() => {
		restore();
		run();
		unset_context();
	});
	else run();
}
/**
* Captures the current effect context so that we can restore it after
* some asynchronous work has happened (so that e.g. `await a + b`
* causes `b` to be registered as a dependency).
*/
function capture() {
	var previous_effect = active_effect;
	var previous_reaction = active_reaction;
	var previous_component_context = component_context;
	var previous_batch = current_batch;
	return function restore(activate_batch = true) {
		set_active_effect(previous_effect);
		set_active_reaction(previous_reaction);
		set_component_context(previous_component_context);
		if (activate_batch && (previous_effect.f & 16384) === 0) {
			previous_batch?.activate();
			previous_batch?.apply();
		}
	};
}
function unset_context(deactivate_batch = true) {
	set_active_effect(null);
	set_active_reaction(null);
	set_component_context(null);
	if (deactivate_batch) current_batch?.deactivate();
}
/**
* @returns {(skip?: boolean) => void}
*/
function increment_pending() {
	var effect = active_effect;
	var boundary = effect.b;
	var batch = current_batch;
	var blocking = !!boundary?.is_rendered();
	boundary?.update_pending_count(1, batch);
	batch.increment(blocking, effect);
	return () => {
		boundary?.update_pending_count(-1, batch);
		batch.decrement(blocking, effect);
	};
}
/**
* @template V
* @param {() => V} fn
* @returns {Derived<V>}
*/
/*#__NO_SIDE_EFFECTS__*/
function derived(fn) {
	var flags = 2 | DIRTY;
	if (active_effect !== null) active_effect.f |= EFFECT_PRESERVED;
	return {
		ctx: component_context,
		deps: null,
		effects: null,
		equals,
		f: flags,
		fn,
		reactions: null,
		rv: 0,
		v: UNINITIALIZED,
		wv: 0,
		parent: active_effect,
		ac: null
	};
}
var OBSOLETE = Symbol("obsolete");
/**
* @template V
* @param {() => V | Promise<V>} fn
* @param {string} [label]
* @param {string} [location] If provided, print a warning if the value is not read immediately after update
* @returns {Promise<Source<V>>}
*/
/*#__NO_SIDE_EFFECTS__*/
function async_derived(fn, label, location) {
	let parent = active_effect;
	if (parent === null) async_derived_orphan();
	var promise = void 0;
	var signal = source(UNINITIALIZED);
	var should_suspend = !active_reaction;
	/** @type {Set<ReturnType<typeof deferred<V>>>} */
	var deferreds = /* @__PURE__ */ new Set();
	async_effect(() => {
		var effect = active_effect;
		/** @type {ReturnType<typeof deferred<V>>} */
		var d = deferred();
		promise = d.promise;
		try {
			Promise.resolve(fn()).then(d.resolve, (e) => {
				if (e !== STALE_REACTION) d.reject(e);
			}).finally(unset_context);
		} catch (error) {
			d.reject(error);
			unset_context();
		}
		var batch = current_batch;
		if (should_suspend) {
			if ((effect.f & 32768) !== 0) var decrement_pending = increment_pending();
			if (parent.b?.is_rendered()) batch.async_deriveds.get(effect)?.reject(OBSOLETE);
			else for (const d of deferreds.values()) d.reject(OBSOLETE);
			deferreds.add(d);
			batch.async_deriveds.set(effect, d);
		}
		/**
		* @param {any} value
		* @param {unknown} error
		*/
		const handler = (value, error = void 0) => {
			decrement_pending?.();
			deferreds.delete(d);
			if (error === OBSOLETE) return;
			batch.activate();
			if (error) {
				signal.f |= ERROR_VALUE;
				internal_set(signal, error);
			} else {
				if ((signal.f & 8388608) !== 0) signal.f ^= ERROR_VALUE;
				internal_set(signal, value);
			}
			batch.deactivate();
		};
		d.promise.then(handler, (e) => handler(null, e || "unknown"));
	});
	teardown(() => {
		for (const d of deferreds) d.reject(OBSOLETE);
	});
	return new Promise((fulfil) => {
		/** @param {Promise<V>} p */
		function next(p) {
			function go() {
				if (p === promise) fulfil(signal);
				else next(promise);
			}
			p.then(go, go);
		}
		next(promise);
	});
}
/**
* @template V
* @param {() => V} fn
* @returns {Derived<V>}
*/
/*#__NO_SIDE_EFFECTS__*/
function user_derived(fn) {
	const d = /* @__PURE__ */ derived(fn);
	if (!async_mode_flag) push_reaction_value(d);
	return d;
}
/**
* @template V
* @param {() => V} fn
* @returns {Derived<V>}
*/
/*#__NO_SIDE_EFFECTS__*/
function derived_safe_equal(fn) {
	const signal = /* @__PURE__ */ derived(fn);
	signal.equals = safe_equals;
	return signal;
}
/**
* @param {Derived} derived
* @returns {void}
*/
function destroy_derived_effects(derived) {
	var effects = derived.effects;
	if (effects !== null) {
		derived.effects = null;
		for (var i = 0; i < effects.length; i += 1) destroy_effect(effects[i]);
	}
}
/**
* @template T
* @param {Derived} derived
* @returns {T}
*/
function execute_derived(derived) {
	var value;
	var prev_active_effect = active_effect;
	var parent = derived.parent;
	if (!is_destroying_effect && parent !== null && derived.v !== UNINITIALIZED && (parent.f & 24576) !== 0) {
		derived_inert();
		return derived.v;
	}
	set_active_effect(parent);
	try {
		derived.f &= ~WAS_MARKED;
		destroy_derived_effects(derived);
		value = update_reaction(derived);
	} finally {
		set_active_effect(prev_active_effect);
	}
	return value;
}
/**
* @param {Derived} derived
* @returns {void}
*/
function update_derived(derived) {
	var value = execute_derived(derived);
	if (!derived.equals(value)) {
		derived.wv = increment_write_version();
		if (!current_batch?.is_fork || derived.deps === null) {
			if (current_batch !== null) {
				current_batch.capture(derived, value, true);
				previous_batch?.capture(derived, value, true);
			} else derived.v = value;
			if (derived.deps === null) {
				set_signal_status(derived, CLEAN);
				return;
			}
		}
	}
	if (is_destroying_effect) return;
	if (batch_values !== null) {
		if (effect_tracking() || current_batch?.is_fork) batch_values.set(derived, value);
	} else update_derived_status(derived);
}
/**
* @param {Derived} derived
*/
function freeze_derived_effects(derived) {
	if (derived.effects === null) return;
	for (const e of derived.effects) if (e.teardown || e.ac) {
		e.teardown?.();
		e.ac?.abort(STALE_REACTION);
		if (e.fn !== null) e.teardown = noop;
		e.ac = null;
		remove_reactions(e, 0);
		destroy_effect_children(e);
	}
}
/**
* @param {Derived} derived
*/
function unfreeze_derived_effects(derived) {
	if (derived.effects === null) return;
	for (const e of derived.effects) if (e.teardown && e.fn !== null) update_effect(e);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/batch.js
/** @import { Fork } from 'svelte' */
/** @import { Derived, Effect, Reaction, Source, Value } from '#client' */
/** @type {Batch | null} */
var first_batch = null;
/** @type {Batch | null} */
var last_batch = null;
/** @type {Batch | null} */
var current_batch = null;
/**
* This is needed to avoid overwriting inputs
* @type {Batch | null}
*/
var previous_batch = null;
/**
* When time travelling (i.e. working in one batch, while other batches
* still have ongoing work), we ignore the real values of affected
* signals in favour of their values within the batch
* @type {Map<Value, any> | null}
*/
var batch_values = null;
/** @type {Effect | null} */
var last_scheduled_effect = null;
var is_flushing_sync = false;
var is_processing = false;
/**
* During traversal, this is an array. Newly created effects are (if not immediately
* executed) pushed to this array, rather than going through the scheduling
* rigamarole that would cause another turn of the flush loop.
* @type {Effect[] | null}
*/
var collected_effects = null;
/**
* An array of effects that are marked during traversal as a result of a `set`
* (not `internal_set`) call. These will be added to the next batch and
* trigger another `batch.process()`
* @type {Effect[] | null}
* @deprecated when we get rid of legacy mode and stores, we can get rid of this
*/
var legacy_updates = null;
var flush_count = 0;
var uid = 1;
var Batch = class Batch {
	id = uid++;
	/** True as soon as `#process` was called */
	#started = false;
	linked = true;
	/** @type {Batch | null} */
	#prev = null;
	/** @type {Batch | null} */
	#next = null;
	/** @type {Map<Effect, ReturnType<typeof deferred<any>>>} */
	async_deriveds = /* @__PURE__ */ new Map();
	/**
	* The current values of any signals that are updated in this batch.
	* Tuple format: [value, is_derived] (note: is_derived is false for deriveds, too, if they were overridden via assignment)
	* They keys of this map are identical to `this.#previous`
	* @type {Map<Value, [any, boolean]>}
	*/
	current = /* @__PURE__ */ new Map();
	/**
	* The values of any signals (sources and deriveds) that are updated in this batch _before_ those updates took place.
	* They keys of this map are identical to `this.#current`
	* @type {Map<Value, any>}
	*/
	previous = /* @__PURE__ */ new Map();
	/**
	* When the batch is committed (and the DOM is updated), we need to remove old branches
	* and append new ones by calling the functions added inside (if/each/key/etc) blocks
	* @type {Set<(batch: Batch) => void>}
	*/
	#commit_callbacks = /* @__PURE__ */ new Set();
	/**
	* If a fork is discarded, we need to destroy any effects that are no longer needed
	* @type {Set<(batch: Batch) => void>}
	*/
	#discard_callbacks = /* @__PURE__ */ new Set();
	/**
	* The number of async effects that are currently in flight
	*/
	#pending = 0;
	/**
	* Async effects that are currently in flight, _not_ inside a pending boundary
	* @type {Map<Effect, number>}
	*/
	#blocking_pending = /* @__PURE__ */ new Map();
	/**
	* A deferred that resolves when the batch is committed, used with `settled()`
	* TODO replace with Promise.withResolvers once supported widely enough
	* @type {{ promise: Promise<void>, resolve: (value?: any) => void, reject: (reason: unknown) => void } | null}
	*/
	#deferred = null;
	/**
	* The root effects that need to be flushed
	* @type {Effect[]}
	*/
	#roots = [];
	/**
	* Effects created while this batch was active.
	* @type {Effect[]}
	*/
	#new_effects = [];
	/**
	* Deferred effects (which run after async work has completed) that are DIRTY
	* @type {Set<Effect>}
	*/
	#dirty_effects = /* @__PURE__ */ new Set();
	/**
	* Deferred effects that are MAYBE_DIRTY
	* @type {Set<Effect>}
	*/
	#maybe_dirty_effects = /* @__PURE__ */ new Set();
	/**
	* A map of branches that still exist, but will be destroyed when this batch
	* is committed — we skip over these during `process`.
	* The value contains child effects that were dirty/maybe_dirty before being reset,
	* so they can be rescheduled if the branch survives.
	* @type {Map<Effect, { d: Effect[], m: Effect[] }>}
	*/
	#skipped_branches = /* @__PURE__ */ new Map();
	/**
	* Inverse of #skipped_branches which we need to tell prior batches to unskip them when committing
	* @type {Set<Effect>}
	*/
	#unskipped_branches = /* @__PURE__ */ new Set();
	is_fork = false;
	#decrement_queued = false;
	constructor() {
		if (last_batch === null) first_batch = last_batch = this;
		else {
			last_batch.#next = this;
			this.#prev = last_batch;
		}
		last_batch = this;
	}
	#is_deferred() {
		if (this.is_fork) return true;
		for (const effect of this.#blocking_pending.keys()) {
			var e = effect;
			var skipped = false;
			while (e.parent !== null) {
				if (this.#skipped_branches.has(e)) {
					skipped = true;
					break;
				}
				e = e.parent;
			}
			if (!skipped) return true;
		}
		return false;
	}
	/**
	* Add an effect to the #skipped_branches map and reset its children
	* @param {Effect} effect
	*/
	skip_effect(effect) {
		if (!this.#skipped_branches.has(effect)) this.#skipped_branches.set(effect, {
			d: [],
			m: []
		});
		this.#unskipped_branches.delete(effect);
	}
	/**
	* Remove an effect from the #skipped_branches map and reschedule
	* any tracked dirty/maybe_dirty child effects
	* @param {Effect} effect
	* @param {(e: Effect) => void} callback
	*/
	unskip_effect(effect, callback = (e) => this.schedule(e)) {
		var tracked = this.#skipped_branches.get(effect);
		if (tracked) {
			this.#skipped_branches.delete(effect);
			for (var e of tracked.d) {
				set_signal_status(e, DIRTY);
				callback(e);
			}
			for (e of tracked.m) {
				set_signal_status(e, MAYBE_DIRTY);
				callback(e);
			}
		}
		this.#unskipped_branches.add(effect);
	}
	#process() {
		this.#started = true;
		if (flush_count++ > 1e3) {
			this.#unlink();
			infinite_loop_guard();
		}
		for (const e of this.#dirty_effects) {
			this.#maybe_dirty_effects.delete(e);
			set_signal_status(e, DIRTY);
			this.schedule(e);
		}
		for (const e of this.#maybe_dirty_effects) {
			set_signal_status(e, MAYBE_DIRTY);
			this.schedule(e);
		}
		const roots = this.#roots;
		this.#roots = [];
		this.apply();
		/** @type {Effect[]} */
		var effects = collected_effects = [];
		/** @type {Effect[]} */
		var render_effects = [];
		/**
		* @type {Effect[]}
		* @deprecated when we get rid of legacy mode and stores, we can get rid of this
		*/
		var updates = legacy_updates = [];
		for (const root of roots) try {
			this.#traverse(root, effects, render_effects);
		} catch (e) {
			reset_all(root);
			if (!this.#is_deferred()) this.discard();
			throw e;
		}
		current_batch = null;
		if (updates.length > 0) {
			var batch = Batch.ensure();
			for (const e of updates) batch.schedule(e);
		}
		collected_effects = null;
		legacy_updates = null;
		if (this.#is_deferred()) {
			this.#defer_effects(render_effects);
			this.#defer_effects(effects);
			for (const [e, t] of this.#skipped_branches) reset_branch(e, t);
			if (updates.length > 0)
 /** @type {Batch} */ current_batch.#process();
			return;
		}
		const earlier_batch = this.#find_earlier_batch();
		if (earlier_batch) {
			this.#defer_effects(render_effects);
			this.#defer_effects(effects);
			earlier_batch.#merge(this);
			return;
		}
		this.#dirty_effects.clear();
		this.#maybe_dirty_effects.clear();
		for (const fn of this.#commit_callbacks) fn(this);
		this.#commit_callbacks.clear();
		previous_batch = this;
		flush_queued_effects(render_effects);
		flush_queued_effects(effects);
		previous_batch = null;
		this.#deferred?.resolve();
		var next_batch = current_batch;
		if (this.#pending === 0 && (this.#roots.length === 0 || next_batch !== null)) {
			this.#unlink();
			if (async_mode_flag) {
				this.#commit();
				current_batch = next_batch;
			}
		}
		if (this.#roots.length > 0) if (next_batch !== null) {
			const batch = next_batch;
			batch.#roots.push(...this.#roots.filter((r) => !batch.#roots.includes(r)));
		} else next_batch = this;
		if (next_batch !== null) next_batch.#process();
	}
	/**
	* Traverse the effect tree, executing effects or stashing
	* them for later execution as appropriate
	* @param {Effect} root
	* @param {Effect[]} effects
	* @param {Effect[]} render_effects
	*/
	#traverse(root, effects, render_effects) {
		root.f ^= CLEAN;
		var effect = root.first;
		while (effect !== null) {
			var flags = effect.f;
			var is_branch = (flags & 96) !== 0;
			if (!(is_branch && (flags & 1024) !== 0 || (flags & 8192) !== 0 || this.#skipped_branches.has(effect)) && effect.fn !== null) {
				if (is_branch) effect.f ^= CLEAN;
				else if ((flags & 4) !== 0) effects.push(effect);
				else if (async_mode_flag && (flags & 16777224) !== 0) render_effects.push(effect);
				else if (is_dirty(effect)) {
					if ((flags & 16) !== 0) this.#maybe_dirty_effects.add(effect);
					update_effect(effect);
				}
				var child = effect.first;
				if (child !== null) {
					effect = child;
					continue;
				}
			}
			while (effect !== null) {
				var next = effect.next;
				if (next !== null) {
					effect = next;
					break;
				}
				effect = effect.parent;
			}
		}
	}
	#find_earlier_batch() {
		var batch = this.#prev;
		while (batch !== null) {
			if (!batch.is_fork) {
				for (const [value, [, is_derived]] of this.current) if (batch.current.has(value) && !is_derived) return batch;
			}
			batch = batch.#prev;
		}
		return null;
	}
	/**
	* @param {Batch} batch
	*/
	#merge(batch) {
		for (const [source, value] of batch.current) {
			if (!this.previous.has(source) && batch.previous.has(source)) this.previous.set(source, batch.previous.get(source));
			this.current.set(source, value);
		}
		for (const [effect, deferred] of batch.async_deriveds) {
			const d = this.async_deriveds.get(effect);
			if (d) deferred.promise.then(d.resolve).catch(d.reject);
		}
		batch.async_deriveds.clear();
		this.transfer_effects(batch.#dirty_effects, batch.#maybe_dirty_effects);
		/**
		* mark all effects that depend on `batch.current`, except the
		* async effects that we just resolved (TODO unless they depend
		* on values in this batch that are NOT in the later batch?).
		* Through this we also will populate the correct #skipped_branches,
		* oncommit callbacks etc, so we don't need to merge them separately.
		* @param {Value} value
		*/
		const mark = (value) => {
			var reactions = value.reactions;
			if (reactions === null) return;
			for (const reaction of reactions) {
				var flags = reaction.f;
				if ((flags & 2) !== 0) mark(reaction);
				else {
					var effect = reaction;
					if (flags & 4194320 && !this.async_deriveds.has(effect)) {
						this.#maybe_dirty_effects.delete(effect);
						set_signal_status(effect, DIRTY);
						this.schedule(effect);
					}
				}
			}
		};
		for (const source of this.current.keys()) mark(source);
		this.oncommit(() => batch.discard());
		batch.#unlink();
		current_batch = this;
		this.#process();
	}
	/**
	* @param {Effect[]} effects
	*/
	#defer_effects(effects) {
		for (var i = 0; i < effects.length; i += 1) defer_effect(effects[i], this.#dirty_effects, this.#maybe_dirty_effects);
	}
	/**
	* Associate a change to a given source with the current
	* batch, noting its previous and current values
	* @param {Value} source
	* @param {any} value
	* @param {boolean} [is_derived]
	*/
	capture(source, value, is_derived = false) {
		if (source.v !== UNINITIALIZED && !this.previous.has(source)) this.previous.set(source, source.v);
		if ((source.f & 8388608) === 0) {
			this.current.set(source, [value, is_derived]);
			batch_values?.set(source, value);
		}
		if (!this.is_fork) source.v = value;
	}
	activate() {
		current_batch = this;
	}
	deactivate() {
		current_batch = null;
		batch_values = null;
	}
	flush() {
		try {
			is_processing = true;
			current_batch = this;
			this.#process();
		} finally {
			flush_count = 0;
			last_scheduled_effect = null;
			collected_effects = null;
			legacy_updates = null;
			is_processing = false;
			current_batch = null;
			batch_values = null;
			old_values.clear();
		}
	}
	discard() {
		for (const fn of this.#discard_callbacks) fn(this);
		this.#discard_callbacks.clear();
		for (const deferred of this.async_deriveds.values()) deferred.reject(OBSOLETE);
		this.#unlink();
		this.#deferred?.resolve();
	}
	/**
	* @param {Effect} effect
	*/
	register_created_effect(effect) {
		this.#new_effects.push(effect);
	}
	#commit() {
		for (let batch = first_batch; batch !== null; batch = batch.#next) {
			var is_earlier = batch.id < this.id;
			/** @type {Source[]} */
			var sources = [];
			for (const [source, [value, is_derived]] of this.current) {
				if (batch.current.has(source)) {
					var batch_value = batch.current.get(source)[0];
					if (is_earlier && value !== batch_value) batch.current.set(source, [value, is_derived]);
					else continue;
				}
				sources.push(source);
			}
			if (is_earlier) for (const [effect, deferred] of this.async_deriveds) {
				const d = batch.async_deriveds.get(effect);
				if (d) deferred.promise.then(d.resolve).catch(d.reject);
			}
			var current = [...batch.current.keys()].filter((source) => !batch.current.get(source)[1]);
			if (!batch.#started || current.length === 0) continue;
			var others = current.filter((source) => !this.current.has(source));
			if (others.length === 0) {
				if (is_earlier) batch.discard();
			} else if (sources.length > 0) {
				if (is_earlier) for (const unskipped of this.#unskipped_branches) batch.unskip_effect(unskipped, (e) => {
					if ((e.f & 4194320) !== 0) batch.schedule(e);
					else batch.#defer_effects([e]);
				});
				batch.activate();
				/** @type {Set<Value>} */
				var marked = /* @__PURE__ */ new Set();
				/** @type {Map<Reaction, boolean>} */
				var checked = /* @__PURE__ */ new Map();
				for (var source of sources) mark_effects(source, others, marked, checked);
				checked = /* @__PURE__ */ new Map();
				var current_unequal = [...batch.current].filter(([c, v1]) => {
					const v2 = this.current.get(c);
					if (!v2) return true;
					return v2[0] !== v1[0] || v2[1] !== v1[1];
				}).map(([c]) => c);
				if (current_unequal.length > 0) {
					for (const effect of this.#new_effects) if ((effect.f & 155648) === 0 && depends_on(effect, current_unequal, checked)) if ((effect.f & 4194320) !== 0) {
						set_signal_status(effect, DIRTY);
						batch.schedule(effect);
					} else batch.#dirty_effects.add(effect);
				}
				if (batch.#roots.length > 0 && !batch.#decrement_queued) {
					batch.apply();
					for (var root of batch.#roots) batch.#traverse(root, [], []);
					batch.#roots = [];
				}
				batch.deactivate();
			}
		}
	}
	/**
	* @param {boolean} blocking
	* @param {Effect} effect
	*/
	increment(blocking, effect) {
		this.#pending += 1;
		if (blocking) {
			let blocking_pending_count = this.#blocking_pending.get(effect) ?? 0;
			this.#blocking_pending.set(effect, blocking_pending_count + 1);
		}
	}
	/**
	* @param {boolean} blocking
	* @param {Effect} effect
	*/
	decrement(blocking, effect) {
		this.#pending -= 1;
		if (blocking) {
			let blocking_pending_count = this.#blocking_pending.get(effect) ?? 0;
			if (blocking_pending_count === 1) this.#blocking_pending.delete(effect);
			else this.#blocking_pending.set(effect, blocking_pending_count - 1);
		}
		if (this.#decrement_queued) return;
		this.#decrement_queued = true;
		queue_micro_task(() => {
			this.#decrement_queued = false;
			if (this.linked) this.flush();
		});
	}
	/**
	* @param {Set<Effect>} dirty_effects
	* @param {Set<Effect>} maybe_dirty_effects
	*/
	transfer_effects(dirty_effects, maybe_dirty_effects) {
		for (const e of dirty_effects) this.#dirty_effects.add(e);
		for (const e of maybe_dirty_effects) this.#maybe_dirty_effects.add(e);
		dirty_effects.clear();
		maybe_dirty_effects.clear();
	}
	/** @param {(batch: Batch) => void} fn */
	oncommit(fn) {
		this.#commit_callbacks.add(fn);
	}
	/** @param {(batch: Batch) => void} fn */
	ondiscard(fn) {
		this.#discard_callbacks.add(fn);
	}
	settled() {
		return (this.#deferred ??= deferred()).promise;
	}
	static ensure() {
		if (current_batch === null) {
			const batch = current_batch = new Batch();
			if (!is_processing && !is_flushing_sync) queue_micro_task(() => {
				if (!batch.#started) batch.flush();
			});
		}
		return current_batch;
	}
	apply() {
		if (!async_mode_flag || !this.is_fork && this.#prev === null && this.#next === null) {
			batch_values = null;
			return;
		}
		batch_values = /* @__PURE__ */ new Map();
		for (const [source, [value]] of this.current) batch_values.set(source, value);
		for (let batch = first_batch; batch !== null; batch = batch.#next) {
			if (batch === this || batch.is_fork) continue;
			var intersects = false;
			if (batch.id < this.id) for (const [source, [, is_derived]] of batch.current) {
				if (is_derived) continue;
				if (this.current.has(source)) {
					intersects = true;
					break;
				}
			}
			if (!intersects) {
				for (const [source, previous] of batch.previous) if (!batch_values.has(source)) batch_values.set(source, previous);
			}
		}
	}
	/**
	*
	* @param {Effect} effect
	*/
	schedule(effect) {
		last_scheduled_effect = effect;
		if (effect.b?.is_pending && (effect.f & 16777228) !== 0 && (effect.f & 32768) === 0) {
			effect.b.defer_effect(effect);
			return;
		}
		var e = effect;
		while (e.parent !== null) {
			e = e.parent;
			var flags = e.f;
			if (collected_effects !== null && e === active_effect) {
				if (async_mode_flag) return;
				if ((active_reaction === null || (active_reaction.f & 2) === 0) && !legacy_is_updating_store) return;
			}
			if ((flags & 96) !== 0) {
				if ((flags & 1024) === 0) return;
				e.f ^= CLEAN;
			}
		}
		this.#roots.push(e);
	}
	#unlink() {
		if (!this.linked) return;
		var prev = this.#prev;
		var next = this.#next;
		if (prev === null) first_batch = next;
		else prev.#next = next;
		if (next === null) last_batch = prev;
		else next.#prev = prev;
		this.linked = false;
	}
};
function infinite_loop_guard() {
	try {
		effect_update_depth_exceeded();
	} catch (error) {
		invoke_error_boundary(error, last_scheduled_effect);
	}
}
/** @type {Set<Effect> | null} */
var eager_block_effects = null;
/**
* @param {Array<Effect>} effects
* @returns {void}
*/
function flush_queued_effects(effects) {
	var length = effects.length;
	if (length === 0) return;
	var i = 0;
	while (i < length) {
		var effect = effects[i++];
		if ((effect.f & 24576) === 0 && is_dirty(effect)) {
			eager_block_effects = /* @__PURE__ */ new Set();
			update_effect(effect);
			if (effect.deps === null && effect.first === null && effect.nodes === null && effect.teardown === null && effect.ac === null) unlink_effect(effect);
			if (eager_block_effects?.size > 0) {
				old_values.clear();
				for (const e of eager_block_effects) {
					if ((e.f & 24576) !== 0) continue;
					/** @type {Effect[]} */
					const ordered_effects = [e];
					let ancestor = e.parent;
					while (ancestor !== null) {
						if (eager_block_effects.has(ancestor)) {
							eager_block_effects.delete(ancestor);
							ordered_effects.push(ancestor);
						}
						ancestor = ancestor.parent;
					}
					for (let j = ordered_effects.length - 1; j >= 0; j--) {
						const e = ordered_effects[j];
						if ((e.f & 24576) !== 0) continue;
						update_effect(e);
					}
				}
				eager_block_effects.clear();
			}
		}
	}
	eager_block_effects = null;
}
/**
* This is similar to `mark_reactions`, but it only marks async/block effects
* depending on `value` and at least one of the other `sources`, so that
* these effects can re-run after another batch has been committed
* @param {Value} value
* @param {Source[]} sources
* @param {Set<Value>} marked
* @param {Map<Reaction, boolean>} checked
*/
function mark_effects(value, sources, marked, checked) {
	if (marked.has(value)) return;
	marked.add(value);
	if (value.reactions !== null) for (const reaction of value.reactions) {
		const flags = reaction.f;
		if ((flags & 2) !== 0) mark_effects(reaction, sources, marked, checked);
		else if ((flags & 4194320) !== 0 && (flags & 2048) === 0 && depends_on(reaction, sources, checked)) {
			set_signal_status(reaction, DIRTY);
			schedule_effect(reaction);
		}
	}
}
/**
* @param {Reaction} reaction
* @param {Source[]} sources
* @param {Map<Reaction, boolean>} checked
*/
function depends_on(reaction, sources, checked) {
	const depends = checked.get(reaction);
	if (depends !== void 0) return depends;
	if (reaction.deps !== null) for (const dep of reaction.deps) {
		if (includes.call(sources, dep)) return true;
		if ((dep.f & 2) !== 0 && depends_on(dep, sources, checked)) {
			checked.set(dep, true);
			return true;
		}
	}
	checked.set(reaction, false);
	return false;
}
/**
* @param {Effect} effect
* @returns {void}
*/
function schedule_effect(effect) {
	/** @type {Batch} */ current_batch.schedule(effect);
}
/**
* Mark all the effects inside a skipped branch CLEAN, so that
* they can be correctly rescheduled later. Tracks dirty and maybe_dirty
* effects so they can be rescheduled if the branch survives.
* @param {Effect} effect
* @param {{ d: Effect[], m: Effect[] }} tracked
*/
function reset_branch(effect, tracked) {
	if ((effect.f & 32) !== 0 && (effect.f & 1024) !== 0) return;
	if ((effect.f & 2048) !== 0) tracked.d.push(effect);
	else if ((effect.f & 4096) !== 0) tracked.m.push(effect);
	set_signal_status(effect, CLEAN);
	var e = effect.first;
	while (e !== null) {
		reset_branch(e, tracked);
		e = e.next;
	}
}
/**
* Mark an entire effect tree clean following an error
* @param {Effect} effect
*/
function reset_all(effect) {
	set_signal_status(effect, CLEAN);
	var e = effect.first;
	while (e !== null) {
		reset_all(e);
		e = e.next;
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/sources.js
/** @import { Derived, Effect, Source, Value } from '#client' */
/** @type {Set<Effect>} */
var eager_effects = /* @__PURE__ */ new Set();
/** @type {Map<Source, any>} */
var old_values = /* @__PURE__ */ new Map();
var eager_effects_deferred = false;
/**
* @template V
* @param {V} v
* @param {Error | null} [stack]
* @returns {Source<V>}
*/
function source(v, stack) {
	return {
		f: 0,
		v,
		reactions: null,
		equals,
		rv: 0,
		wv: 0
	};
}
/**
* @template V
* @param {V} v
* @param {Error | null} [stack]
*/
/*#__NO_SIDE_EFFECTS__*/
function state(v, stack) {
	const s = source(v, stack);
	push_reaction_value(s);
	return s;
}
/**
* @template V
* @param {V} initial_value
* @param {boolean} [immutable]
* @returns {Source<V>}
*/
/*#__NO_SIDE_EFFECTS__*/
function mutable_source(initial_value, immutable = false, trackable = true) {
	const s = source(initial_value);
	if (!immutable) s.equals = safe_equals;
	if (legacy_mode_flag && trackable && component_context !== null && component_context.l !== null) (component_context.l.s ??= []).push(s);
	return s;
}
/**
* @template V
* @param {Source<V>} source
* @param {V} value
* @param {boolean} [should_proxy]
* @returns {V}
*/
function set(source, value, should_proxy = false) {
	if (active_reaction !== null && (!untracking || (active_reaction.f & 131072) !== 0) && is_runes() && (active_reaction.f & 4325394) !== 0 && (current_sources === null || !current_sources.has(source))) state_unsafe_mutation();
	return internal_set(source, should_proxy ? proxy(value) : value, legacy_updates);
}
/**
* @template V
* @param {Source<V>} source
* @param {V} value
* @param {Effect[] | null} [updated_during_traversal]
* @returns {V}
*/
function internal_set(source, value, updated_during_traversal = null) {
	if (!source.equals(value)) {
		old_values.set(source, is_destroying_effect ? value : source.v);
		var batch = Batch.ensure();
		batch.capture(source, value);
		if ((source.f & 2) !== 0) {
			const derived = source;
			if ((source.f & 2048) !== 0) execute_derived(derived);
			if (batch_values === null) update_derived_status(derived);
		}
		source.wv = increment_write_version();
		mark_reactions(source, DIRTY, updated_during_traversal);
		if (is_runes() && active_effect !== null && (active_effect.f & 1024) !== 0 && (active_effect.f & 96) === 0) if (untracked_writes === null) set_untracked_writes([source]);
		else untracked_writes.push(source);
		if (!batch.is_fork && eager_effects.size > 0 && !eager_effects_deferred) flush_eager_effects();
	}
	return value;
}
function flush_eager_effects() {
	eager_effects_deferred = false;
	for (const effect of eager_effects) {
		if ((effect.f & 1024) !== 0) set_signal_status(effect, MAYBE_DIRTY);
		let dirty;
		try {
			dirty = is_dirty(effect);
		} catch {
			dirty = true;
		}
		if (dirty) update_effect(effect);
	}
	eager_effects.clear();
}
/**
* @template {number | bigint} T
* @param {Source<T>} source
* @param {1 | -1} [d]
* @returns {T}
*/
function update$1(source, d = 1) {
	var value = get(source);
	var result = d === 1 ? value++ : value--;
	set(source, value);
	return result;
}
/**
* Silently (without using `get`) increment a source
* @param {Source<number>} source
*/
function increment(source) {
	set(source, source.v + 1);
}
/**
* @param {Value} signal
* @param {number} status should be DIRTY or MAYBE_DIRTY
* @param {Effect[] | null} updated_during_traversal
* @returns {void}
*/
function mark_reactions(signal, status, updated_during_traversal) {
	var reactions = signal.reactions;
	if (reactions === null) return;
	var runes = is_runes();
	var length = reactions.length;
	for (var i = 0; i < length; i++) {
		var reaction = reactions[i];
		var flags = reaction.f;
		if (!runes && reaction === active_effect) continue;
		var not_dirty = (flags & DIRTY) === 0;
		if (not_dirty) set_signal_status(reaction, status);
		if ((flags & 131072) !== 0) eager_effects.add(reaction);
		else if ((flags & 2) !== 0) {
			var derived = reaction;
			batch_values?.delete(derived);
			if ((flags & 65536) === 0) {
				if (flags & 512 && (active_effect === null || (active_effect.f & 2097152) === 0)) reaction.f |= WAS_MARKED;
				mark_reactions(derived, MAYBE_DIRTY, updated_during_traversal);
			}
		} else if (not_dirty) {
			var effect = reaction;
			if ((flags & 16) !== 0 && eager_block_effects !== null) eager_block_effects.add(effect);
			if (updated_during_traversal !== null) updated_during_traversal.push(effect);
			else schedule_effect(effect);
		}
	}
}
/**
* @template T
* @param {T} value
* @returns {T}
*/
function proxy(value) {
	if (typeof value !== "object" || value === null || STATE_SYMBOL in value) return value;
	const prototype = get_prototype_of(value);
	if (prototype !== object_prototype && prototype !== array_prototype) return value;
	/** @type {Map<any, Source<any>>} */
	var sources = /* @__PURE__ */ new Map();
	var is_proxied_array = is_array(value);
	var version = /* @__PURE__ */ state(0);
	var stack = null;
	var parent_version = update_version;
	/**
	* Executes the proxy in the context of the reaction it was originally created in, if any
	* @template T
	* @param {() => T} fn
	*/
	var with_parent = (fn) => {
		if (update_version === parent_version) return fn();
		var reaction = active_reaction;
		var version = update_version;
		set_active_reaction(null);
		set_update_version(parent_version);
		var result = fn();
		set_active_reaction(reaction);
		set_update_version(version);
		return result;
	};
	if (is_proxied_array) sources.set("length", /* @__PURE__ */ state(
		/** @type {any[]} */
		value.length,
		stack
	));
	return new Proxy(value, {
		defineProperty(_, prop, descriptor) {
			if (!("value" in descriptor) || descriptor.configurable === false || descriptor.enumerable === false || descriptor.writable === false) state_descriptors_fixed();
			var s = sources.get(prop);
			if (s === void 0) with_parent(() => {
				var s = /* @__PURE__ */ state(descriptor.value, stack);
				sources.set(prop, s);
				return s;
			});
			else set(s, descriptor.value, true);
			return true;
		},
		deleteProperty(target, prop) {
			var s = sources.get(prop);
			if (s === void 0) {
				if (prop in target) {
					const s = with_parent(() => /* @__PURE__ */ state(UNINITIALIZED, stack));
					sources.set(prop, s);
					increment(version);
				}
			} else {
				set(s, UNINITIALIZED);
				increment(version);
			}
			return true;
		},
		get(target, prop, receiver) {
			if (prop === STATE_SYMBOL) return value;
			var s = sources.get(prop);
			var exists = prop in target;
			if (s === void 0 && (!exists || get_descriptor(target, prop)?.writable)) {
				s = with_parent(() => {
					return /* @__PURE__ */ state(proxy(exists ? target[prop] : UNINITIALIZED), stack);
				});
				sources.set(prop, s);
			}
			if (s !== void 0) {
				var v = get(s);
				return v === UNINITIALIZED ? void 0 : v;
			}
			return Reflect.get(target, prop, receiver);
		},
		getOwnPropertyDescriptor(target, prop) {
			var descriptor = Reflect.getOwnPropertyDescriptor(target, prop);
			if (descriptor && "value" in descriptor) {
				var s = sources.get(prop);
				if (s) descriptor.value = get(s);
			} else if (descriptor === void 0) {
				var source = sources.get(prop);
				var value = source?.v;
				if (source !== void 0 && value !== UNINITIALIZED) return {
					enumerable: true,
					configurable: true,
					value,
					writable: true
				};
			}
			return descriptor;
		},
		has(target, prop) {
			if (prop === STATE_SYMBOL) return true;
			var s = sources.get(prop);
			var has = s !== void 0 && s.v !== UNINITIALIZED || Reflect.has(target, prop);
			if (s !== void 0 || active_effect !== null && (!has || get_descriptor(target, prop)?.writable)) {
				if (s === void 0) {
					s = with_parent(() => {
						return /* @__PURE__ */ state(has ? proxy(target[prop]) : UNINITIALIZED, stack);
					});
					sources.set(prop, s);
				}
				if (get(s) === UNINITIALIZED) return false;
			}
			return has;
		},
		set(target, prop, value, receiver) {
			var s = sources.get(prop);
			var has = prop in target;
			if (is_proxied_array && prop === "length") for (var i = value; i < s.v; i += 1) {
				var other_s = sources.get(i + "");
				if (other_s !== void 0) set(other_s, UNINITIALIZED);
				else if (i in target) {
					other_s = with_parent(() => /* @__PURE__ */ state(UNINITIALIZED, stack));
					sources.set(i + "", other_s);
				}
			}
			if (s === void 0) {
				if (!has || get_descriptor(target, prop)?.writable) {
					s = with_parent(() => /* @__PURE__ */ state(void 0, stack));
					set(s, proxy(value));
					sources.set(prop, s);
				}
			} else {
				has = s.v !== UNINITIALIZED;
				var p = with_parent(() => proxy(value));
				set(s, p);
			}
			var descriptor = Reflect.getOwnPropertyDescriptor(target, prop);
			if (descriptor?.set) descriptor.set.call(receiver, value);
			if (!has) {
				if (is_proxied_array && typeof prop === "string") {
					var ls = sources.get("length");
					var n = Number(prop);
					if (Number.isInteger(n) && n >= ls.v) set(ls, n + 1);
				}
				increment(version);
			}
			return true;
		},
		ownKeys(target) {
			get(version);
			var own_keys = Reflect.ownKeys(target).filter((key) => {
				var source = sources.get(key);
				return source === void 0 || source.v !== UNINITIALIZED;
			});
			for (var [key, source] of sources) if (source.v !== UNINITIALIZED && !(key in target)) own_keys.push(key);
			return own_keys;
		},
		setPrototypeOf() {
			state_prototype_fixed();
		}
	});
}
/**
* @param {any} value
*/
function get_proxied_value(value) {
	try {
		if (value !== null && typeof value === "object" && STATE_SYMBOL in value) return value[STATE_SYMBOL];
	} catch {}
	return value;
}
/**
* @param {any} a
* @param {any} b
*/
function is(a, b) {
	return Object.is(get_proxied_value(a), get_proxied_value(b));
}
new Set([
	"copyWithin",
	"fill",
	"pop",
	"push",
	"reverse",
	"shift",
	"sort",
	"splice",
	"unshift"
]);
//#endregion
//#region node_modules/svelte/src/internal/client/dom/operations.js
/** @import { Effect, TemplateNode } from '#client' */
/** @type {Window} */
var $window;
/** @type {boolean} */
var is_firefox;
/** @type {() => Node | null} */
var first_child_getter;
/** @type {() => Node | null} */
var next_sibling_getter;
/**
* Initialize these lazily to avoid issues when using the runtime in a server context
* where these globals are not available while avoiding a separate server entry point
*/
function init_operations() {
	if ($window !== void 0) return;
	$window = window;
	is_firefox = /Firefox/.test(navigator.userAgent);
	var element_prototype = Element.prototype;
	var node_prototype = Node.prototype;
	var text_prototype = Text.prototype;
	first_child_getter = get_descriptor(node_prototype, "firstChild").get;
	next_sibling_getter = get_descriptor(node_prototype, "nextSibling").get;
	if (is_extensible(element_prototype)) {
		/** @type {any} */ element_prototype[CLASS_CACHE] = void 0;
		/** @type {any} */ element_prototype[ATTRIBUTES_CACHE] = null;
		/** @type {any} */ element_prototype[STYLE_CACHE] = void 0;
		element_prototype.__e = void 0;
	}
	if (is_extensible(text_prototype))
 /** @type {any} */ text_prototype[TEXT_CACHE] = void 0;
}
/**
* @param {string} value
* @returns {Text}
*/
function create_text(value = "") {
	return document.createTextNode(value);
}
/**
* @template {Node} N
* @param {N} node
*/
/*@__NO_SIDE_EFFECTS__*/
function get_first_child(node) {
	return first_child_getter.call(node);
}
/**
* @template {Node} N
* @param {N} node
*/
/*@__NO_SIDE_EFFECTS__*/
function get_next_sibling(node) {
	return next_sibling_getter.call(node);
}
/**
* Don't mark this as side-effect-free, hydration needs to walk all nodes
* @template {Node} N
* @param {N} node
* @param {boolean} is_text
* @returns {TemplateNode | null}
*/
function child(node, is_text) {
	if (!hydrating) return /* @__PURE__ */ get_first_child(node);
	var child = /* @__PURE__ */ get_first_child(hydrate_node);
	if (child === null) child = hydrate_node.appendChild(create_text());
	else if (is_text && child.nodeType !== 3) {
		var text = create_text();
		child?.before(text);
		set_hydrate_node(text);
		return text;
	}
	if (is_text) merge_text_nodes(child);
	set_hydrate_node(child);
	return child;
}
/**
* Don't mark this as side-effect-free, hydration needs to walk all nodes
* @param {TemplateNode} node
* @param {boolean} [is_text]
* @returns {TemplateNode | null}
*/
function first_child(node, is_text = false) {
	if (!hydrating) {
		var first = /* @__PURE__ */ get_first_child(node);
		if (first instanceof Comment && first.data === "") return /* @__PURE__ */ get_next_sibling(first);
		return first;
	}
	if (is_text) {
		if (hydrate_node?.nodeType !== 3) {
			var text = create_text();
			hydrate_node?.before(text);
			set_hydrate_node(text);
			return text;
		}
		merge_text_nodes(hydrate_node);
	}
	return hydrate_node;
}
/**
* Don't mark this as side-effect-free, hydration needs to walk all nodes
* @param {TemplateNode} node
* @param {number} count
* @param {boolean} is_text
* @returns {TemplateNode | null}
*/
function sibling(node, count = 1, is_text = false) {
	let next_sibling = hydrating ? hydrate_node : node;
	var last_sibling;
	while (count--) {
		last_sibling = next_sibling;
		next_sibling = /* @__PURE__ */ get_next_sibling(next_sibling);
	}
	if (!hydrating) return next_sibling;
	if (is_text) {
		if (next_sibling?.nodeType !== 3) {
			var text = create_text();
			if (next_sibling === null) last_sibling?.after(text);
			else next_sibling.before(text);
			set_hydrate_node(text);
			return text;
		}
		merge_text_nodes(next_sibling);
	}
	set_hydrate_node(next_sibling);
	return next_sibling;
}
/**
* @template {Node} N
* @param {N} node
* @returns {void}
*/
function clear_text_content(node) {
	node.textContent = "";
}
/**
* Returns `true` if we're updating the current block, for example `condition` in
* an `{#if condition}` block just changed. In this case, the branch should be
* appended (or removed) at the same time as other updates within the
* current `<svelte:boundary>`
*/
function should_defer_append() {
	if (!async_mode_flag) return false;
	if (eager_block_effects !== null) return false;
	return (active_effect.f & REACTION_RAN) !== 0;
}
/**
* Branching here is intentional and load-bearing for perf. `createElement(tag)`
* hits a fast path in Blink that `createElementNS(NAMESPACE_HTML, tag)` doesn't,
* and passing an explicit `undefined` as the trailing options arg measurably
* slows both APIs. Funnelling every case through a single `createElementNS(ns,
* tag, options)` call would be smaller but slower on the HTML path.
*
* @template {keyof HTMLElementTagNameMap | string} T
* @param {T} tag
* @param {string} [namespace]
* @param {string} [is]
* @returns {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element}
*/
function create_element(tag, namespace, is) {
	if (namespace == null || namespace === "http://www.w3.org/1999/xhtml") return is ? document.createElement(tag, { is }) : document.createElement(tag);
	return is ? document.createElementNS(namespace, tag, { is }) : document.createElementNS(namespace, tag);
}
/**
* Browsers split text nodes larger than 65536 bytes when parsing.
* For hydration to succeed, we need to stitch them back together
* @param {Text} text
*/
function merge_text_nodes(text) {
	if (text.nodeValue.length < 65536) return;
	let next = text.nextSibling;
	while (next !== null && next.nodeType === 3) {
		next.remove();
		/** @type {string} */ text.nodeValue += next.nodeValue;
		next = text.nextSibling;
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/misc.js
/**
* @param {HTMLElement} dom
* @param {boolean} value
* @returns {void}
*/
function autofocus(dom, value) {
	if (value) {
		const body = document.body;
		dom.autofocus = true;
		queue_micro_task(() => {
			if (document.activeElement === body) dom.focus();
		});
	}
}
var listening_to_form_reset = false;
function add_form_reset_listener() {
	if (!listening_to_form_reset) {
		listening_to_form_reset = true;
		document.addEventListener("reset", (evt) => {
			Promise.resolve().then(() => {
				if (!evt.defaultPrevented) for (const e of evt.target.elements)
 /** @type {any} */ e[FORM_RESET_HANDLER]?.();
			});
		}, { capture: true });
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/shared.js
/**
* @template T
* @param {() => T} fn
*/
function without_reactive_context(fn) {
	var previous_reaction = active_reaction;
	var previous_effect = active_effect;
	set_active_reaction(null);
	set_active_effect(null);
	try {
		return fn();
	} finally {
		set_active_reaction(previous_reaction);
		set_active_effect(previous_effect);
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/effects.js
/** @import { Blocker, ComponentContext, ComponentContextLegacy, Derived, Effect, TemplateNode, TransitionManager } from '#client' */
/**
* @param {'$effect' | '$effect.pre' | '$inspect'} rune
*/
function validate_effect(rune) {
	if (active_effect === null) {
		if (active_reaction === null) effect_orphan(rune);
		effect_in_unowned_derived();
	}
	if (is_destroying_effect) effect_in_teardown(rune);
}
/**
* @param {Effect} effect
* @param {Effect} parent_effect
*/
function push_effect(effect, parent_effect) {
	var parent_last = parent_effect.last;
	if (parent_last === null) parent_effect.last = parent_effect.first = effect;
	else {
		parent_last.next = effect;
		effect.prev = parent_last;
		parent_effect.last = effect;
	}
}
/**
* @param {number} type
* @param {null | (() => void | (() => void))} fn
* @returns {Effect}
*/
function create_effect(type, fn) {
	var parent = active_effect;
	if (parent !== null && (parent.f & 8192) !== 0) type |= INERT;
	/** @type {Effect} */
	var effect = {
		ctx: component_context,
		deps: null,
		nodes: null,
		f: type | DIRTY | 512,
		first: null,
		fn,
		last: null,
		next: null,
		parent,
		b: parent && parent.b,
		prev: null,
		teardown: null,
		wv: 0,
		ac: null
	};
	current_batch?.register_created_effect(effect);
	/** @type {Effect | null} */
	var e = effect;
	if ((type & 4) !== 0) if (collected_effects !== null) collected_effects.push(effect);
	else Batch.ensure().schedule(effect);
	else if (fn !== null) {
		try {
			update_effect(effect);
		} catch (e) {
			destroy_effect(effect);
			throw e;
		}
		if (e.deps === null && e.teardown === null && e.nodes === null && e.first === e.last && (e.f & 524288) === 0) {
			e = e.first;
			if ((type & 16) !== 0 && (type & 65536) !== 0 && e !== null) e.f |= EFFECT_TRANSPARENT;
		}
	}
	if (e !== null) {
		e.parent = parent;
		if (parent !== null) push_effect(e, parent);
		if (active_reaction !== null && (active_reaction.f & 2) !== 0 && (type & 64) === 0) {
			var derived = active_reaction;
			(derived.effects ??= []).push(e);
		}
	}
	return effect;
}
/**
* Internal representation of `$effect.tracking()`
* @returns {boolean}
*/
function effect_tracking() {
	return active_reaction !== null && !untracking;
}
/**
* @param {() => void} fn
*/
function teardown(fn) {
	const effect = create_effect(8, null);
	set_signal_status(effect, CLEAN);
	effect.teardown = fn;
	return effect;
}
/**
* Internal representation of `$effect(...)`
* @param {() => void | (() => void)} fn
*/
function user_effect(fn) {
	validate_effect("$effect");
	var flags = active_effect.f;
	if (!active_reaction && (flags & 32) !== 0 && component_context !== null && !component_context.i) {
		var context = component_context;
		(context.e ??= []).push(fn);
	} else return create_user_effect(fn);
}
/**
* @param {() => void | (() => void)} fn
*/
function create_user_effect(fn) {
	return create_effect(4 | USER_EFFECT, fn);
}
/**
* Internal representation of `$effect.pre(...)`
* @param {() => void | (() => void)} fn
* @returns {Effect}
*/
function user_pre_effect(fn) {
	validate_effect("$effect.pre");
	return create_effect(8 | USER_EFFECT, fn);
}
/**
* An effect root whose children can transition out
* @param {() => void} fn
* @returns {(options?: { outro?: boolean }) => Promise<void>}
*/
function component_root(fn) {
	Batch.ensure();
	const effect = create_effect(64 | EFFECT_PRESERVED, fn);
	return (options = {}) => {
		return new Promise((fulfil) => {
			if (options.outro) pause_effect(effect, () => {
				destroy_effect(effect);
				fulfil(void 0);
			});
			else {
				destroy_effect(effect);
				fulfil(void 0);
			}
		});
	};
}
/**
* @param {() => void | (() => void)} fn
* @returns {Effect}
*/
function effect(fn) {
	return create_effect(4, fn);
}
/**
* @param {() => void | (() => void)} fn
* @returns {Effect}
*/
function async_effect(fn) {
	return create_effect(ASYNC | EFFECT_PRESERVED, fn);
}
/**
* @param {() => void | (() => void)} fn
* @returns {Effect}
*/
function render_effect(fn, flags = 0) {
	return create_effect(8 | flags, fn);
}
/**
* @param {(...expressions: any) => void | (() => void)} fn
* @param {Array<() => any>} sync
* @param {Array<() => Promise<any>>} async
* @param {Blocker[]} blockers
*/
function template_effect(fn, sync = [], async = [], blockers = []) {
	flatten(blockers, sync, async, (values) => {
		create_effect(8, () => {
			fn(...values.map(get));
		});
	});
}
/**
* @param {(() => void)} fn
* @param {number} flags
*/
function block(fn, flags = 0) {
	return create_effect(16 | flags, fn);
}
/**
* @param {(() => void)} fn
* @param {number} flags
*/
function managed(fn, flags = 0) {
	return create_effect(MANAGED_EFFECT | flags, fn);
}
/**
* @param {(() => void)} fn
*/
function branch(fn) {
	return create_effect(32 | EFFECT_PRESERVED, fn);
}
/**
* @param {Effect} effect
*/
function execute_effect_teardown(effect) {
	var teardown = effect.teardown;
	if (teardown !== null) {
		const previously_destroying_effect = is_destroying_effect;
		const previous_reaction = active_reaction;
		set_is_destroying_effect(true);
		set_active_reaction(null);
		try {
			teardown.call(null);
		} finally {
			set_is_destroying_effect(previously_destroying_effect);
			set_active_reaction(previous_reaction);
		}
	}
}
/**
* @param {Effect} signal
* @param {boolean} remove_dom
* @returns {void}
*/
function destroy_effect_children(signal, remove_dom = false) {
	var effect = signal.first;
	signal.first = signal.last = null;
	while (effect !== null) {
		const controller = effect.ac;
		if (controller !== null) without_reactive_context(() => {
			controller.abort(STALE_REACTION);
		});
		var next = effect.next;
		if ((effect.f & 64) !== 0) effect.parent = null;
		else destroy_effect(effect, remove_dom);
		effect = next;
	}
}
/**
* @param {Effect} signal
* @returns {void}
*/
function destroy_block_effect_children(signal) {
	var effect = signal.first;
	while (effect !== null) {
		var next = effect.next;
		if ((effect.f & 32) === 0) destroy_effect(effect);
		effect = next;
	}
}
/**
* @param {Effect} effect
* @param {boolean} [remove_dom]
* @returns {void}
*/
function destroy_effect(effect, remove_dom = true) {
	var removed = false;
	if ((remove_dom || (effect.f & 262144) !== 0) && effect.nodes !== null && effect.nodes.end !== null) {
		remove_effect_dom(effect.nodes.start, effect.nodes.end);
		removed = true;
	}
	effect.f |= DESTROYING;
	destroy_effect_children(effect, remove_dom && !removed);
	remove_reactions(effect, 0);
	var transitions = effect.nodes && effect.nodes.t;
	if (transitions !== null) for (const transition of transitions) transition.stop();
	execute_effect_teardown(effect);
	effect.f ^= DESTROYING;
	effect.f |= DESTROYED;
	var parent = effect.parent;
	if (parent !== null && parent.first !== null) unlink_effect(effect);
	effect.next = effect.prev = effect.teardown = effect.ctx = effect.deps = effect.fn = effect.nodes = effect.ac = effect.b = null;
}
/**
*
* @param {TemplateNode | null} node
* @param {TemplateNode} end
*/
function remove_effect_dom(node, end) {
	while (node !== null) {
		/** @type {TemplateNode | null} */
		var next = node === end ? null : /* @__PURE__ */ get_next_sibling(node);
		node.remove();
		node = next;
	}
}
/**
* Detach an effect from the effect tree, freeing up memory and
* reducing the amount of work that happens on subsequent traversals
* @param {Effect} effect
*/
function unlink_effect(effect) {
	var parent = effect.parent;
	var prev = effect.prev;
	var next = effect.next;
	if (prev !== null) prev.next = next;
	if (next !== null) next.prev = prev;
	if (parent !== null) {
		if (parent.first === effect) parent.first = next;
		if (parent.last === effect) parent.last = prev;
	}
}
/**
* When a block effect is removed, we don't immediately destroy it or yank it
* out of the DOM, because it might have transitions. Instead, we 'pause' it.
* It stays around (in memory, and in the DOM) until outro transitions have
* completed, and if the state change is reversed then we _resume_ it.
* A paused effect does not update, and the DOM subtree becomes inert.
* @param {Effect} effect
* @param {() => void} [callback]
* @param {boolean} [destroy]
*/
function pause_effect(effect, callback, destroy = true) {
	/** @type {TransitionManager[]} */
	var transitions = [];
	pause_children(effect, transitions, true);
	var fn = () => {
		if (destroy) destroy_effect(effect);
		if (callback) callback();
	};
	var remaining = transitions.length;
	if (remaining > 0) {
		var check = () => --remaining || fn();
		for (var transition of transitions) transition.out(check);
	} else fn();
}
/**
* @param {Effect} effect
* @param {TransitionManager[]} transitions
* @param {boolean} local
*/
function pause_children(effect, transitions, local) {
	if ((effect.f & 8192) !== 0) return;
	effect.f ^= INERT;
	var t = effect.nodes && effect.nodes.t;
	if (t !== null) {
		for (const transition of t) if (transition.is_global || local) transitions.push(transition);
	}
	var child = effect.first;
	while (child !== null) {
		var sibling = child.next;
		if ((child.f & 64) === 0) {
			var transparent = (child.f & 65536) !== 0 || (child.f & 32) !== 0 && (effect.f & 16) !== 0;
			pause_children(child, transitions, transparent ? local : false);
		}
		child = sibling;
	}
}
/**
* The opposite of `pause_effect`. We call this if (for example)
* `x` becomes falsy then truthy: `{#if x}...{/if}`
* @param {Effect} effect
*/
function resume_effect(effect) {
	resume_children(effect, true);
}
/**
* @param {Effect} effect
* @param {boolean} local
*/
function resume_children(effect, local) {
	if ((effect.f & 8192) === 0) return;
	effect.f ^= INERT;
	if ((effect.f & 1024) === 0) {
		set_signal_status(effect, DIRTY);
		Batch.ensure().schedule(effect);
	}
	var child = effect.first;
	while (child !== null) {
		var sibling = child.next;
		var transparent = (child.f & 65536) !== 0 || (child.f & 32) !== 0;
		resume_children(child, transparent ? local : false);
		child = sibling;
	}
	var t = effect.nodes && effect.nodes.t;
	if (t !== null) {
		for (const transition of t) if (transition.is_global || local) transition.in();
	}
}
/**
* @param {Effect} effect
* @param {DocumentFragment} fragment
*/
function move_effect(effect, fragment) {
	if (!effect.nodes) return;
	/** @type {TemplateNode | null} */
	var node = effect.nodes.start;
	var end = effect.nodes.end;
	while (node !== null) {
		/** @type {TemplateNode | null} */
		var next = node === end ? null : /* @__PURE__ */ get_next_sibling(node);
		fragment.append(node);
		node = next;
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/legacy.js
/**
* @type {Set<Value> | null}
* @deprecated
*/
var captured_signals = null;
//#endregion
//#region node_modules/svelte/src/internal/client/runtime.js
/** @import { Derived, Effect, Reaction, Source, Value } from '#client' */
var is_updating_effect = false;
var is_destroying_effect = false;
/** @param {boolean} value */
function set_is_destroying_effect(value) {
	is_destroying_effect = value;
}
/** @type {null | Reaction} */
var active_reaction = null;
var untracking = false;
/** @param {null | Reaction} reaction */
function set_active_reaction(reaction) {
	active_reaction = reaction;
}
/** @type {null | Effect} */
var active_effect = null;
/** @param {null | Effect} effect */
function set_active_effect(effect) {
	active_effect = effect;
}
/**
* When sources are created within a reaction, reading and writing
* them within that reaction should not cause a re-run
* @type {null | Set<Source>}
*/
var current_sources = null;
/** @param {Value} value */
function push_reaction_value(value) {
	if (active_reaction !== null && (!async_mode_flag || (active_reaction.f & 2) !== 0)) (current_sources ??= /* @__PURE__ */ new Set()).add(value);
}
/**
* The dependencies of the reaction that is currently being executed. In many cases,
* the dependencies are unchanged between runs, and so this will be `null` unless
* and until a new dependency is accessed — we track this via `skipped_deps`
* @type {null | Value[]}
*/
var new_deps = null;
var skipped_deps = 0;
/**
* Tracks writes that the effect it's executed in doesn't listen to yet,
* so that the dependency can be added to the effect later on if it then reads it
* @type {null | Source[]}
*/
var untracked_writes = null;
/** @param {null | Source[]} value */
function set_untracked_writes(value) {
	untracked_writes = value;
}
/**
* @type {number} Used by sources and deriveds for handling updates.
* Version starts from 1 so that unowned deriveds differentiate between a created effect and a run one for tracing
**/
var write_version = 1;
/** @type {number} Used to version each read of a source of derived to avoid duplicating depedencies inside a reaction */
var read_version = 0;
var update_version = read_version;
/** @param {number} value */
function set_update_version(value) {
	update_version = value;
}
function increment_write_version() {
	return ++write_version;
}
/**
* Determines whether a derived or effect is dirty.
* If it is MAYBE_DIRTY, will set the status to CLEAN
* @param {Reaction} reaction
* @returns {boolean}
*/
function is_dirty(reaction) {
	var flags = reaction.f;
	if ((flags & 2048) !== 0) return true;
	if (flags & 2) reaction.f &= ~WAS_MARKED;
	if ((flags & 4096) !== 0) {
		var dependencies = reaction.deps;
		var length = dependencies.length;
		for (var i = 0; i < length; i++) {
			var dependency = dependencies[i];
			if (is_dirty(dependency)) update_derived(dependency);
			if (dependency.wv > reaction.wv) return true;
		}
		if ((flags & 512) !== 0 && batch_values === null) set_signal_status(reaction, CLEAN);
	}
	return false;
}
/**
* @param {Value} signal
* @param {Effect} effect
* @param {boolean} [root]
*/
function schedule_possible_effect_self_invalidation(signal, effect, root = true) {
	var reactions = signal.reactions;
	if (reactions === null) return;
	if (!async_mode_flag && current_sources !== null && current_sources.has(signal)) return;
	for (var i = 0; i < reactions.length; i++) {
		var reaction = reactions[i];
		if ((reaction.f & 2) !== 0) schedule_possible_effect_self_invalidation(reaction, effect, false);
		else if (effect === reaction) {
			if (root) set_signal_status(reaction, DIRTY);
			else if ((reaction.f & 1024) !== 0) set_signal_status(reaction, MAYBE_DIRTY);
			schedule_effect(reaction);
		}
	}
}
/** @param {Reaction} reaction */
function update_reaction(reaction) {
	var previous_deps = new_deps;
	var previous_skipped_deps = skipped_deps;
	var previous_untracked_writes = untracked_writes;
	var previous_reaction = active_reaction;
	var previous_sources = current_sources;
	var previous_component_context = component_context;
	var previous_untracking = untracking;
	var previous_update_version = update_version;
	var flags = reaction.f;
	new_deps = null;
	skipped_deps = 0;
	untracked_writes = null;
	active_reaction = (flags & 96) === 0 ? reaction : null;
	current_sources = null;
	set_component_context(reaction.ctx);
	untracking = false;
	update_version = ++read_version;
	if (reaction.ac !== null) {
		without_reactive_context(() => {
			/** @type {AbortController} */ reaction.ac.abort(STALE_REACTION);
		});
		reaction.ac = null;
	}
	try {
		reaction.f |= REACTION_IS_UPDATING;
		var fn = reaction.fn;
		var result = fn();
		reaction.f |= REACTION_RAN;
		var deps = reaction.deps;
		var is_fork = current_batch?.is_fork;
		if (new_deps !== null) {
			var i;
			if (!is_fork) remove_reactions(reaction, skipped_deps);
			if (deps !== null && skipped_deps > 0) {
				deps.length = skipped_deps + new_deps.length;
				for (i = 0; i < new_deps.length; i++) deps[skipped_deps + i] = new_deps[i];
			} else reaction.deps = deps = new_deps;
			if (effect_tracking() && (reaction.f & 512) !== 0) for (i = skipped_deps; i < deps.length; i++) (deps[i].reactions ??= []).push(reaction);
		} else if (!is_fork && deps !== null && skipped_deps < deps.length) {
			remove_reactions(reaction, skipped_deps);
			deps.length = skipped_deps;
		}
		if (is_runes() && untracked_writes !== null && !untracking && deps !== null && (reaction.f & 6146) === 0) for (i = 0; i < untracked_writes.length; i++) schedule_possible_effect_self_invalidation(untracked_writes[i], reaction);
		if (previous_reaction !== null && previous_reaction !== reaction) {
			read_version++;
			if (previous_reaction.deps !== null) for (let i = 0; i < previous_skipped_deps; i += 1) previous_reaction.deps[i].rv = read_version;
			if (previous_deps !== null) for (const dep of previous_deps) dep.rv = read_version;
			if (untracked_writes !== null) if (previous_untracked_writes === null) previous_untracked_writes = untracked_writes;
			else previous_untracked_writes.push(...untracked_writes);
		}
		if ((reaction.f & 8388608) !== 0) reaction.f ^= ERROR_VALUE;
		return result;
	} catch (error) {
		return handle_error(error);
	} finally {
		reaction.f ^= REACTION_IS_UPDATING;
		new_deps = previous_deps;
		skipped_deps = previous_skipped_deps;
		untracked_writes = previous_untracked_writes;
		active_reaction = previous_reaction;
		current_sources = previous_sources;
		set_component_context(previous_component_context);
		untracking = previous_untracking;
		update_version = previous_update_version;
	}
}
/**
* @template V
* @param {Reaction} signal
* @param {Value<V>} dependency
* @returns {void}
*/
function remove_reaction(signal, dependency) {
	let reactions = dependency.reactions;
	if (reactions !== null) {
		var index = index_of.call(reactions, signal);
		if (index !== -1) {
			var new_length = reactions.length - 1;
			if (new_length === 0) reactions = dependency.reactions = null;
			else {
				reactions[index] = reactions[new_length];
				reactions.pop();
			}
		}
	}
	if (reactions === null && (dependency.f & 2) !== 0 && (new_deps === null || !includes.call(new_deps, dependency))) {
		var derived = dependency;
		if ((derived.f & 512) !== 0) {
			derived.f ^= 512;
			derived.f &= ~WAS_MARKED;
		}
		if (derived.v !== UNINITIALIZED) update_derived_status(derived);
		freeze_derived_effects(derived);
		remove_reactions(derived, 0);
	}
}
/**
* @param {Reaction} signal
* @param {number} start_index
* @returns {void}
*/
function remove_reactions(signal, start_index) {
	var dependencies = signal.deps;
	if (dependencies === null) return;
	for (var i = start_index; i < dependencies.length; i++) remove_reaction(signal, dependencies[i]);
}
/**
* @param {Effect} effect
* @returns {void}
*/
function update_effect(effect) {
	var flags = effect.f;
	if ((flags & 16384) !== 0) return;
	set_signal_status(effect, CLEAN);
	var previous_effect = active_effect;
	var was_updating_effect = is_updating_effect;
	active_effect = effect;
	is_updating_effect = true;
	try {
		if ((flags & 16777232) !== 0) destroy_block_effect_children(effect);
		else destroy_effect_children(effect);
		execute_effect_teardown(effect);
		var teardown = update_reaction(effect);
		effect.teardown = typeof teardown === "function" ? teardown : null;
		effect.wv = write_version;
	} finally {
		is_updating_effect = was_updating_effect;
		active_effect = previous_effect;
	}
}
/**
* @template V
* @param {Value<V>} signal
* @returns {V}
*/
function get(signal) {
	var is_derived = (signal.f & 2) !== 0;
	captured_signals?.add(signal);
	if (active_reaction !== null && !untracking) {
		if (!(active_effect !== null && (active_effect.f & 16384) !== 0) && (current_sources === null || !current_sources.has(signal))) {
			var deps = active_reaction.deps;
			if ((active_reaction.f & 2097152) !== 0) {
				if (signal.rv < read_version) {
					signal.rv = read_version;
					if (new_deps === null && deps !== null && deps[skipped_deps] === signal) skipped_deps++;
					else if (new_deps === null) new_deps = [signal];
					else new_deps.push(signal);
				}
			} else {
				active_reaction.deps ??= [];
				if (!includes.call(active_reaction.deps, signal)) active_reaction.deps.push(signal);
				var reactions = signal.reactions;
				if (reactions === null) signal.reactions = [active_reaction];
				else if (!includes.call(reactions, active_reaction)) reactions.push(active_reaction);
			}
		}
	}
	if (is_destroying_effect && old_values.has(signal)) return old_values.get(signal);
	if (is_derived) {
		var derived = signal;
		if (is_destroying_effect) {
			var value = derived.v;
			if ((derived.f & 1024) === 0 && derived.reactions !== null || depends_on_old_values(derived)) value = execute_derived(derived);
			old_values.set(derived, value);
			return value;
		}
		var should_connect = (derived.f & 512) === 0 && !untracking && active_reaction !== null && (is_updating_effect || (active_reaction.f & 512) !== 0);
		var is_new = (derived.f & REACTION_RAN) === 0;
		if (is_dirty(derived)) {
			if (should_connect) derived.f |= 512;
			update_derived(derived);
		}
		if (should_connect && !is_new) {
			unfreeze_derived_effects(derived);
			reconnect(derived);
		}
	}
	if (batch_values?.has(signal)) return batch_values.get(signal);
	if ((signal.f & 8388608) !== 0) throw signal.v;
	return signal.v;
}
/**
* (Re)connect a disconnected derived, so that it is notified
* of changes in `mark_reactions`
* @param {Derived} derived
*/
function reconnect(derived) {
	derived.f |= 512;
	if (derived.deps === null) return;
	for (const dep of derived.deps) {
		(dep.reactions ??= []).push(derived);
		if ((dep.f & 2) !== 0 && (dep.f & 512) === 0) {
			unfreeze_derived_effects(dep);
			reconnect(dep);
		}
	}
}
/** @param {Derived} derived */
function depends_on_old_values(derived) {
	if (derived.v === UNINITIALIZED) return true;
	if (derived.deps === null) return false;
	for (const dep of derived.deps) {
		if (old_values.has(dep)) return true;
		if ((dep.f & 2) !== 0 && depends_on_old_values(dep)) return true;
	}
	return false;
}
/**
* When used inside a [`$derived`](https://svelte.dev/docs/svelte/$derived) or [`$effect`](https://svelte.dev/docs/svelte/$effect),
* any state read inside `fn` will not be treated as a dependency.
*
* ```ts
* $effect(() => {
*   // this will run when `data` changes, but not when `time` changes
*   save(data, {
*     timestamp: untrack(() => time)
*   });
* });
* ```
* @template T
* @param {() => T} fn
* @returns {T}
*/
function untrack(fn) {
	var previous_untracking = untracking;
	try {
		untracking = true;
		return fn();
	} finally {
		untracking = previous_untracking;
	}
}
/**
* Possibly traverse an object and read all its properties so that they're all reactive in case this is `$state`.
* Does only check first level of an object for performance reasons (heuristic should be good for 99% of all cases).
* @param {any} value
* @returns {void}
*/
function deep_read_state(value) {
	if (typeof value !== "object" || !value || value instanceof EventTarget) return;
	if (STATE_SYMBOL in value) deep_read(value);
	else if (!Array.isArray(value)) for (let key in value) {
		const prop = value[key];
		if (typeof prop === "object" && prop && STATE_SYMBOL in prop) deep_read(prop);
	}
}
/**
* Deeply traverse an object and read all its properties
* so that they're all reactive in case this is `$state`
* @param {any} value
* @param {Set<any>} visited
* @returns {void}
*/
function deep_read(value, visited = /* @__PURE__ */ new Set()) {
	if (typeof value === "object" && value !== null && !(value instanceof EventTarget) && !visited.has(value)) {
		visited.add(value);
		if (value instanceof Date) value.getTime();
		for (let key in value) try {
			deep_read(value[key], visited);
		} catch (e) {}
		const proto = get_prototype_of(value);
		if (proto !== Object.prototype && proto !== Array.prototype && proto !== Map.prototype && proto !== Set.prototype && proto !== Date.prototype) {
			const descriptors = get_descriptors(proto);
			for (let key in descriptors) {
				const get = descriptors[key].get;
				if (get) try {
					get.call(value);
				} catch (e) {}
			}
		}
	}
}
//#endregion
//#region node_modules/svelte/src/utils.js
/**
* @param {string} name
*/
function is_capture_event(name) {
	return name.endsWith("capture") && name !== "gotpointercapture" && name !== "lostpointercapture";
}
/** List of Element events that will be delegated */
var DELEGATED_EVENTS = [
	"beforeinput",
	"click",
	"change",
	"dblclick",
	"contextmenu",
	"focusin",
	"focusout",
	"input",
	"keydown",
	"keyup",
	"mousedown",
	"mousemove",
	"mouseout",
	"mouseover",
	"mouseup",
	"pointerdown",
	"pointermove",
	"pointerout",
	"pointerover",
	"pointerup",
	"touchend",
	"touchmove",
	"touchstart"
];
/**
* Returns `true` if `event_name` is a delegated event
* @param {string} event_name
*/
function can_delegate_event(event_name) {
	return DELEGATED_EVENTS.includes(event_name);
}
/**
* Attributes that are boolean, i.e. they are present or not present.
*/
var DOM_BOOLEAN_ATTRIBUTES = [
	"allowfullscreen",
	"async",
	"autofocus",
	"autoplay",
	"checked",
	"controls",
	"default",
	"disabled",
	"formnovalidate",
	"indeterminate",
	"inert",
	"ismap",
	"loop",
	"multiple",
	"muted",
	"nomodule",
	"novalidate",
	"open",
	"playsinline",
	"readonly",
	"required",
	"reversed",
	"seamless",
	"selected",
	"webkitdirectory",
	"defer",
	"disablepictureinpicture",
	"disableremoteplayback"
];
/**
* @type {Record<string, string>}
* List of attribute names that should be aliased to their property names
* because they behave differently between setting them as an attribute and
* setting them as a property.
*/
var ATTRIBUTE_ALIASES = {
	formnovalidate: "formNoValidate",
	ismap: "isMap",
	nomodule: "noModule",
	playsinline: "playsInline",
	readonly: "readOnly",
	defaultvalue: "defaultValue",
	defaultchecked: "defaultChecked",
	srcobject: "srcObject",
	novalidate: "noValidate",
	allowfullscreen: "allowFullscreen",
	disablepictureinpicture: "disablePictureInPicture",
	disableremoteplayback: "disableRemotePlayback"
};
/**
* @param {string} name
*/
function normalize_attribute(name) {
	name = name.toLowerCase();
	return ATTRIBUTE_ALIASES[name] ?? name;
}
[...DOM_BOOLEAN_ATTRIBUTES];
/**
* Subset of delegated events which should be passive by default.
* These two are already passive via browser defaults on window, document and body.
* But since
* - we're delegating them
* - they happen often
* - they apply to mobile which is generally less performant
* we're marking them as passive by default for other elements, too.
*/
var PASSIVE_EVENTS = ["touchstart", "touchmove"];
/**
* Returns `true` if `name` is a passive event
* @param {string} name
*/
function is_passive_event(name) {
	return PASSIVE_EVENTS.includes(name);
}
/** List of elements that require raw contents and should not have SSR comments put in them */
var RAW_TEXT_ELEMENTS = [
	"textarea",
	"script",
	"style",
	"title"
];
/** @param {string} name */
function is_raw_text_element(name) {
	return RAW_TEXT_ELEMENTS.includes(name);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/events.js
/**
* Used on elements, as a map of event type -> event handler,
* and on events themselves to track which element handled an event
*/
var event_symbol = Symbol("events");
/** @type {Set<string>} */
var all_registered_events = /* @__PURE__ */ new Set();
/** @type {Set<(events: Array<string>) => void>} */
var root_event_handles = /* @__PURE__ */ new Set();
/**
* @param {string} event_name
* @param {EventTarget} dom
* @param {EventListener} [handler]
* @param {AddEventListenerOptions} [options]
*/
function create_event(event_name, dom, handler, options = {}) {
	/**
	* @this {EventTarget}
	*/
	function target_handler(event) {
		if (!options.capture) handle_event_propagation.call(dom, event);
		if (!event.cancelBubble) return without_reactive_context(() => {
			return handler?.call(this, event);
		});
	}
	if (event_name.startsWith("pointer") || event_name.startsWith("touch") || event_name === "wheel") queue_micro_task(() => {
		dom.addEventListener(event_name, target_handler, options);
	});
	else dom.addEventListener(event_name, target_handler, options);
	return target_handler;
}
/**
* @param {string} event_name
* @param {Element} dom
* @param {EventListener} [handler]
* @param {boolean} [capture]
* @param {boolean} [passive]
* @returns {void}
*/
function event(event_name, dom, handler, capture, passive) {
	var options = {
		capture,
		passive
	};
	var target_handler = create_event(event_name, dom, handler, options);
	if (dom === document.body || dom === window || dom === document || dom instanceof HTMLMediaElement) teardown(() => {
		dom.removeEventListener(event_name, target_handler, options);
	});
}
/**
* @param {string} event_name
* @param {Element} element
* @param {EventListener} [handler]
* @returns {void}
*/
function delegated(event_name, element, handler) {
	(element[event_symbol] ??= {})[event_name] = handler;
}
/**
* @param {Array<string>} events
* @returns {void}
*/
function delegate(events) {
	for (var i = 0; i < events.length; i++) all_registered_events.add(events[i]);
	for (var fn of root_event_handles) fn(events);
}
var last_propagated_event = null;
/**
* @this {EventTarget}
* @param {Event} event
* @returns {void}
*/
function handle_event_propagation(event) {
	var handler_element = this;
	var owner_document = handler_element.ownerDocument;
	var event_name = event.type;
	var path = event.composedPath?.() || [];
	var current_target = path[0] || event.target;
	last_propagated_event = event;
	var path_idx = 0;
	var handled_at = last_propagated_event === event && event[event_symbol];
	if (handled_at) {
		var at_idx = path.indexOf(handled_at);
		if (at_idx !== -1 && (handler_element === document || handler_element === window)) {
			event[event_symbol] = handler_element;
			return;
		}
		var handler_idx = path.indexOf(handler_element);
		if (handler_idx === -1) return;
		if (at_idx <= handler_idx) path_idx = at_idx;
	}
	current_target = path[path_idx] || event.target;
	if (current_target === handler_element) return;
	define_property(event, "currentTarget", {
		configurable: true,
		get() {
			return current_target || owner_document;
		}
	});
	var previous_reaction = active_reaction;
	var previous_effect = active_effect;
	set_active_reaction(null);
	set_active_effect(null);
	try {
		/**
		* @type {unknown}
		*/
		var throw_error;
		/**
		* @type {unknown[]}
		*/
		var other_errors = [];
		while (current_target !== null) {
			if (current_target === handler_element) break;
			try {
				var delegated = current_target[event_symbol]?.[event_name];
				if (delegated != null && (!current_target.disabled || event.target === current_target)) delegated.call(current_target, event);
			} catch (error) {
				if (throw_error) other_errors.push(error);
				else throw_error = error;
			}
			if (event.cancelBubble) break;
			path_idx++;
			current_target = path_idx < path.length ? path[path_idx] : null;
		}
		if (throw_error) {
			for (let error of other_errors) queueMicrotask(() => {
				throw error;
			});
			throw throw_error;
		}
	} finally {
		event[event_symbol] = handler_element;
		delete event.currentTarget;
		set_active_reaction(previous_reaction);
		set_active_effect(previous_effect);
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/reconciler.js
var policy = globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", { 
/** @param {string} html */
createHTML: (html) => {
	return html;
} });
/** @param {string} html */
function create_trusted_html(html) {
	return policy?.createHTML(html) ?? html;
}
/**
* @param {string} html
*/
function create_fragment_from_html(html) {
	var elem = create_element("template");
	elem.innerHTML = create_trusted_html(html.replaceAll("<!>", "<!---->"));
	return elem.content;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/template.js
/** @import { Effect, EffectNodes, TemplateNode } from '#client' */
/** @import { TemplateStructure } from './types' */
/**
* @param {TemplateNode} start
* @param {TemplateNode | null} end
*/
function assign_nodes(start, end) {
	var effect = active_effect;
	if (effect.nodes === null) effect.nodes = {
		start,
		end,
		a: null,
		t: null
	};
}
/**
* @param {string} content
* @param {number} flags
* @returns {() => Node | Node[]}
*/
/*#__NO_SIDE_EFFECTS__*/
function from_html(content, flags) {
	var is_fragment = (flags & 1) !== 0;
	var use_import_node = (flags & 2) !== 0;
	/** @type {Node} */
	var node;
	/**
	* Whether or not the first item is a text/element node. If not, we need to
	* create an additional comment node to act as `effect.nodes.start`
	*/
	var has_start = !content.startsWith("<!>");
	return () => {
		if (hydrating) {
			assign_nodes(hydrate_node, null);
			return hydrate_node;
		}
		if (node === void 0) {
			node = create_fragment_from_html(has_start ? content : "<!>" + content);
			if (!is_fragment) node = /* @__PURE__ */ get_first_child(node);
		}
		var clone = use_import_node || is_firefox ? document.importNode(node, true) : node.cloneNode(true);
		if (is_fragment) {
			var start = /* @__PURE__ */ get_first_child(clone);
			var end = clone.lastChild;
			assign_nodes(start, end);
		} else assign_nodes(clone, clone);
		return clone;
	};
}
/**
* @param {string} content
* @param {number} flags
* @param {'svg' | 'math'} ns
* @returns {() => Node | Node[]}
*/
/*#__NO_SIDE_EFFECTS__*/
function from_namespace(content, flags, ns = "svg") {
	/**
	* Whether or not the first item is a text/element node. If not, we need to
	* create an additional comment node to act as `effect.nodes.start`
	*/
	var has_start = !content.startsWith("<!>");
	var is_fragment = (flags & 1) !== 0;
	var wrapped = `<${ns}>${has_start ? content : "<!>" + content}</${ns}>`;
	/** @type {Element | DocumentFragment} */
	var node;
	return () => {
		if (hydrating) {
			assign_nodes(hydrate_node, null);
			return hydrate_node;
		}
		if (!node) {
			var root = /* @__PURE__ */ get_first_child(create_fragment_from_html(wrapped));
			if (is_fragment) {
				node = document.createDocumentFragment();
				while (/* @__PURE__ */ get_first_child(root)) node.appendChild(/* @__PURE__ */ get_first_child(root));
			} else node = /* @__PURE__ */ get_first_child(root);
		}
		var clone = node.cloneNode(true);
		if (is_fragment) {
			var start = /* @__PURE__ */ get_first_child(clone);
			var end = clone.lastChild;
			assign_nodes(start, end);
		} else assign_nodes(clone, clone);
		return clone;
	};
}
/**
* @param {string} content
* @param {number} flags
*/
/*#__NO_SIDE_EFFECTS__*/
function from_svg(content, flags) {
	return /* @__PURE__ */ from_namespace(content, flags, "svg");
}
/**
* @returns {TemplateNode | DocumentFragment}
*/
function comment() {
	if (hydrating) {
		assign_nodes(hydrate_node, null);
		return hydrate_node;
	}
	var frag = document.createDocumentFragment();
	var start = document.createComment("");
	var anchor = create_text();
	frag.append(start, anchor);
	assign_nodes(start, anchor);
	return frag;
}
/**
* Assign the created (or in hydration mode, traversed) dom elements to the current block
* and insert the elements into the dom (in client mode).
* @param {Text | Comment | Element} anchor
* @param {DocumentFragment | Element} dom
*/
function append(anchor, dom) {
	if (hydrating) {
		var effect = active_effect;
		if ((effect.f & 32768) === 0 || effect.nodes.end === null) effect.nodes.end = hydrate_node;
		hydrate_next();
		return;
	}
	if (anchor === null) return;
	anchor.before(dom);
}
/**
* @param {Element} text
* @param {string} value
* @returns {void}
*/
function set_text(text, value) {
	var str = value == null ? "" : typeof value === "object" ? `${value}` : value;
	if (str !== (text[TEXT_CACHE] ??= text.nodeValue)) {
		/** @type {any} */ text[TEXT_CACHE] = str;
		text.nodeValue = `${str}`;
	}
}
/**
* Mounts a component to the given target and returns the exports and potentially the props (if compiled with `accessors: true`) of the component.
* Transitions will play during the initial render unless the `intro` option is set to `false`.
*
* @template {Record<string, any>} Props
* @template {Record<string, any>} Exports
* @param {ComponentType<SvelteComponent<Props>> | Component<Props, Exports, any>} component
* @param {MountOptions<Props>} options
* @returns {Exports}
*/
function mount(component, options) {
	return _mount(component, options);
}
/** @type {Map<EventTarget, Map<string, number>>} */
var listeners = /* @__PURE__ */ new Map();
/**
* @template {Record<string, any>} Exports
* @param {ComponentType<SvelteComponent<any>> | Component<any>} Component
* @param {MountOptions} options
* @returns {Exports}
*/
function _mount(Component, { target, anchor, props = {}, events, context, intro = true, transformError }) {
	init_operations();
	/** @type {Exports} */
	var component = void 0;
	var unmount = component_root(() => {
		var anchor_node = anchor ?? target.appendChild(create_text());
		boundary(anchor_node, { pending: () => {} }, (anchor_node) => {
			push({});
			var ctx = component_context;
			if (context) ctx.c = context;
			if (events)
 /** @type {any} */ props.$$events = events;
			if (hydrating) assign_nodes(anchor_node, null);
			component = Component(anchor_node, props) || {};
			if (hydrating) {
				/** @type {Effect & { nodes: EffectNodes }} */ active_effect.nodes.end = hydrate_node;
				if (hydrate_node === null || hydrate_node.nodeType !== 8 || hydrate_node.data !== "]") {
					hydration_mismatch();
					throw HYDRATION_ERROR;
				}
			}
			pop();
		}, transformError);
		/** @type {Set<string>} */
		var registered_events = /* @__PURE__ */ new Set();
		/** @param {Array<string>} events */
		var event_handle = (events) => {
			for (var i = 0; i < events.length; i++) {
				var event_name = events[i];
				if (registered_events.has(event_name)) continue;
				registered_events.add(event_name);
				var passive = is_passive_event(event_name);
				for (const node of [target, document]) {
					var counts = listeners.get(node);
					if (counts === void 0) {
						counts = /* @__PURE__ */ new Map();
						listeners.set(node, counts);
					}
					var count = counts.get(event_name);
					if (count === void 0) {
						node.addEventListener(event_name, handle_event_propagation, { passive });
						counts.set(event_name, 1);
					} else counts.set(event_name, count + 1);
				}
			}
		};
		event_handle(array_from(all_registered_events));
		root_event_handles.add(event_handle);
		return () => {
			for (var event_name of registered_events) for (const node of [target, document]) {
				var counts = listeners.get(node);
				var count = counts.get(event_name);
				if (--count == 0) {
					node.removeEventListener(event_name, handle_event_propagation);
					counts.delete(event_name);
					if (counts.size === 0) listeners.delete(node);
				} else counts.set(event_name, count);
			}
			root_event_handles.delete(event_handle);
			if (anchor_node !== anchor) anchor_node.parentNode?.removeChild(anchor_node);
		};
	});
	mounted_components.set(component, unmount);
	return component;
}
/**
* References of the components that were mounted or hydrated.
* Uses a `WeakMap` to avoid memory leaks.
*/
var mounted_components = /* @__PURE__ */ new WeakMap();
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/branches.js
/** @import { Effect, TemplateNode } from '#client' */
/**
* @typedef {{ effect: Effect, fragment: DocumentFragment }} Branch
*/
/**
* @template Key
*/
var BranchManager = class {
	/** @type {TemplateNode} */
	anchor;
	/** @type {Map<Batch, Key>} */
	#batches = /* @__PURE__ */ new Map();
	/**
	* Map of keys to effects that are currently rendered in the DOM.
	* These effects are visible and actively part of the document tree.
	* Example:
	* ```
	* {#if condition}
	* 	foo
	* {:else}
	* 	bar
	* {/if}
	* ```
	* Can result in the entries `true->Effect` and `false->Effect`
	* @type {Map<Key, Effect>}
	*/
	#onscreen = /* @__PURE__ */ new Map();
	/**
	* Similar to #onscreen with respect to the keys, but contains branches that are not yet
	* in the DOM, because their insertion is deferred.
	* @type {Map<Key, Branch>}
	*/
	#offscreen = /* @__PURE__ */ new Map();
	/**
	* Keys of effects that are currently outroing
	* @type {Set<Key>}
	*/
	#outroing = /* @__PURE__ */ new Set();
	/**
	* Whether to pause (i.e. outro) on change, or destroy immediately.
	* This is necessary for `<svelte:element>`
	*/
	#transition = true;
	/**
	* @param {TemplateNode} anchor
	* @param {boolean} transition
	*/
	constructor(anchor, transition = true) {
		this.anchor = anchor;
		this.#transition = transition;
	}
	/**
	* @param {Batch} batch
	*/
	#commit = (batch) => {
		if (!this.#batches.has(batch)) return;
		var key = this.#batches.get(batch);
		var onscreen = this.#onscreen.get(key);
		if (onscreen) {
			resume_effect(onscreen);
			this.#outroing.delete(key);
		} else {
			var offscreen = this.#offscreen.get(key);
			if (offscreen) {
				resume_effect(offscreen.effect);
				this.#onscreen.set(key, offscreen.effect);
				this.#offscreen.delete(key);
				/** @type {TemplateNode} */ offscreen.fragment.lastChild.remove();
				this.anchor.before(offscreen.fragment);
				onscreen = offscreen.effect;
			}
		}
		for (const [b, k] of this.#batches) {
			this.#batches.delete(b);
			if (b === batch) break;
			const offscreen = this.#offscreen.get(k);
			if (offscreen) {
				destroy_effect(offscreen.effect);
				this.#offscreen.delete(k);
			}
		}
		for (const [k, effect] of this.#onscreen) {
			if (k === key || this.#outroing.has(k)) continue;
			const on_destroy = () => {
				if (Array.from(this.#batches.values()).includes(k)) {
					var fragment = document.createDocumentFragment();
					move_effect(effect, fragment);
					fragment.append(create_text());
					this.#offscreen.set(k, {
						effect,
						fragment
					});
				} else destroy_effect(effect);
				this.#outroing.delete(k);
				this.#onscreen.delete(k);
			};
			if (this.#transition || !onscreen) {
				this.#outroing.add(k);
				pause_effect(effect, on_destroy, false);
			} else on_destroy();
		}
	};
	/**
	* @param {Batch} batch
	*/
	#discard = (batch) => {
		this.#batches.delete(batch);
		const keys = Array.from(this.#batches.values());
		for (const [k, branch] of this.#offscreen) if (!keys.includes(k)) {
			destroy_effect(branch.effect);
			this.#offscreen.delete(k);
		}
	};
	/**
	*
	* @param {any} key
	* @param {null | ((target: TemplateNode) => void)} fn
	*/
	ensure(key, fn) {
		var batch = current_batch;
		var defer = should_defer_append();
		if (fn && !this.#onscreen.has(key) && !this.#offscreen.has(key)) if (defer) {
			var fragment = document.createDocumentFragment();
			var target = create_text();
			fragment.append(target);
			this.#offscreen.set(key, {
				effect: branch(() => fn(target)),
				fragment
			});
		} else this.#onscreen.set(key, branch(() => fn(this.anchor)));
		this.#batches.set(batch, key);
		if (defer) {
			for (const [k, effect] of this.#onscreen) if (k === key) batch.unskip_effect(effect);
			else batch.skip_effect(effect);
			for (const [k, branch] of this.#offscreen) if (k === key) batch.unskip_effect(branch.effect);
			else batch.skip_effect(branch.effect);
			batch.oncommit(this.#commit);
			batch.ondiscard(this.#discard);
		} else {
			if (hydrating) this.anchor = hydrate_node;
			this.#commit(batch);
		}
	}
};
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/if.js
/** @import { TemplateNode } from '#client' */
/**
* @param {TemplateNode} node
* @param {(branch: (fn: (anchor: Node) => void, key?: number | false) => void) => void} fn
* @param {boolean} [elseif] True if this is an `{:else if ...}` block rather than an `{#if ...}`, as that affects which transitions are considered 'local'
* @returns {void}
*/
function if_block(node, fn, elseif = false) {
	/** @type {TemplateNode | undefined} */
	var marker;
	if (hydrating) {
		marker = hydrate_node;
		hydrate_next();
	}
	var branches = new BranchManager(node);
	var flags = elseif ? EFFECT_TRANSPARENT : 0;
	/**
	* @param {number | false} key
	* @param {null | ((anchor: Node) => void)} fn
	*/
	function update_branch(key, fn) {
		if (hydrating) {
			var data = read_hydration_instruction(marker);
			if (key !== parseInt(data.substring(1))) {
				var anchor = skip_nodes();
				set_hydrate_node(anchor);
				branches.anchor = anchor;
				set_hydrating(false);
				branches.ensure(key, fn);
				set_hydrating(true);
				return;
			}
		}
		branches.ensure(key, fn);
	}
	block(() => {
		var has_branch = false;
		fn((fn, key = 0) => {
			has_branch = true;
			update_branch(key, fn);
		});
		if (!has_branch) update_branch(-1, null);
	}, flags);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/each.js
/** @import { EachItem, EachOutroGroup, EachState, Effect, EffectNodes, MaybeSource, Source, TemplateNode, TransitionManager, Value } from '#client' */
/** @import { Batch } from '../../reactivity/batch.js'; */
/**
* @param {any} _
* @param {number} i
*/
function index(_, i) {
	return i;
}
/**
* Pause multiple effects simultaneously, and coordinate their
* subsequent destruction. Used in each blocks
* @param {EachState} state
* @param {Effect[]} to_destroy
* @param {null | Node} controlled_anchor
*/
function pause_effects(state, to_destroy, controlled_anchor) {
	/** @type {TransitionManager[]} */
	var transitions = [];
	var length = to_destroy.length;
	/** @type {EachOutroGroup} */
	var group;
	var remaining = to_destroy.length;
	for (var i = 0; i < length; i++) {
		let effect = to_destroy[i];
		pause_effect(effect, () => {
			if (group) {
				group.pending.delete(effect);
				group.done.add(effect);
				if (group.pending.size === 0) {
					var groups = state.outrogroups;
					destroy_effects(state, array_from(group.done));
					groups.delete(group);
					if (groups.size === 0) state.outrogroups = null;
				}
			} else remaining -= 1;
		}, false);
	}
	if (remaining === 0) {
		var fast_path = transitions.length === 0 && controlled_anchor !== null;
		if (fast_path) {
			var anchor = controlled_anchor;
			var parent_node = anchor.parentNode;
			clear_text_content(parent_node);
			parent_node.append(anchor);
			state.items.clear();
		}
		destroy_effects(state, to_destroy, !fast_path);
	} else {
		group = {
			pending: new Set(to_destroy),
			done: /* @__PURE__ */ new Set()
		};
		(state.outrogroups ??= /* @__PURE__ */ new Set()).add(group);
	}
}
/**
* @param {EachState} state
* @param {Effect[]} to_destroy
* @param {boolean} remove_dom
*/
function destroy_effects(state, to_destroy, remove_dom = true) {
	/** @type {Set<Effect> | undefined} */
	var preserved_effects;
	if (state.pending.size > 0) {
		preserved_effects = /* @__PURE__ */ new Set();
		for (const keys of state.pending.values()) for (const key of keys) preserved_effects.add(
			/** @type {EachItem} */
			state.items.get(key).e
		);
	}
	for (var i = 0; i < to_destroy.length; i++) {
		var e = to_destroy[i];
		if (preserved_effects?.has(e)) {
			e.f |= EFFECT_OFFSCREEN;
			move_effect(e, document.createDocumentFragment());
		} else destroy_effect(to_destroy[i], remove_dom);
	}
}
/** @type {TemplateNode} */
var offscreen_anchor;
/**
* @template V
* @param {Element | Comment} node The next sibling node, or the parent node if this is a 'controlled' block
* @param {number} flags
* @param {() => V[]} get_collection
* @param {(value: V, index: number) => any} get_key
* @param {(anchor: Node, item: MaybeSource<V>, index: MaybeSource<number>) => void} render_fn
* @param {null | ((anchor: Node) => void)} fallback_fn
* @returns {void}
*/
function each(node, flags, get_collection, get_key, render_fn, fallback_fn = null) {
	var anchor = node;
	/** @type {Map<any, EachItem>} */
	var items = /* @__PURE__ */ new Map();
	if ((flags & 4) !== 0) {
		var parent_node = node;
		anchor = hydrating ? set_hydrate_node(/* @__PURE__ */ get_first_child(parent_node)) : parent_node.appendChild(create_text());
	}
	if (hydrating) hydrate_next();
	/** @type {Effect | null} */
	var fallback = null;
	var each_array = /* @__PURE__ */ derived_safe_equal(() => {
		var collection = get_collection();
		return is_array(collection) ? collection : collection == null ? [] : array_from(collection);
	});
	/** @type {V[]} */
	var array;
	/** @type {Map<Batch, Set<any>>} */
	var pending = /* @__PURE__ */ new Map();
	var first_run = true;
	/**
	* @param {Batch} batch
	*/
	function commit(batch) {
		if ((state.effect.f & 16384) !== 0) return;
		state.pending.delete(batch);
		state.fallback = fallback;
		reconcile(state, array, anchor, flags, get_key);
		if (fallback !== null) if (array.length === 0) if ((fallback.f & 33554432) === 0) resume_effect(fallback);
		else {
			fallback.f ^= EFFECT_OFFSCREEN;
			move(fallback, null, anchor);
		}
		else pause_effect(fallback, () => {
			fallback = null;
		});
	}
	/**
	* @param {Batch} batch
	*/
	function discard(batch) {
		state.pending.delete(batch);
	}
	/** @type {EachState} */
	var state = {
		effect: block(() => {
			array = get(each_array);
			var length = array.length;
			/** `true` if there was a hydration mismatch. Needs to be a `let` or else it isn't treeshaken out */
			let mismatch = false;
			if (hydrating) {
				if (read_hydration_instruction(anchor) === "[!" !== (length === 0)) {
					anchor = skip_nodes();
					set_hydrate_node(anchor);
					set_hydrating(false);
					mismatch = true;
				}
			}
			var keys = /* @__PURE__ */ new Set();
			var batch = current_batch;
			var defer = should_defer_append();
			for (var index = 0; index < length; index += 1) {
				if (hydrating && hydrate_node.nodeType === 8 && hydrate_node.data === "]") {
					anchor = hydrate_node;
					mismatch = true;
					set_hydrating(false);
				}
				var value = array[index];
				var key = get_key(value, index);
				var item = first_run ? null : items.get(key);
				if (item) {
					if (item.v) internal_set(item.v, value);
					if (item.i) internal_set(item.i, index);
					if (defer) batch.unskip_effect(item.e);
				} else {
					item = create_item(items, first_run ? anchor : offscreen_anchor ??= create_text(), value, key, index, render_fn, flags, get_collection);
					if (!first_run) item.e.f |= EFFECT_OFFSCREEN;
					items.set(key, item);
				}
				keys.add(key);
			}
			if (length === 0 && fallback_fn && !fallback) if (first_run) fallback = branch(() => fallback_fn(anchor));
			else {
				fallback = branch(() => fallback_fn(offscreen_anchor ??= create_text()));
				fallback.f |= EFFECT_OFFSCREEN;
			}
			if (length > keys.size) each_key_duplicate("", "", "");
			if (hydrating && length > 0) set_hydrate_node(skip_nodes());
			if (!first_run) {
				pending.set(batch, keys);
				if (defer) {
					for (const [key, item] of items) if (!keys.has(key)) batch.skip_effect(item.e);
					batch.oncommit(commit);
					batch.ondiscard(discard);
				} else commit(batch);
			}
			if (mismatch) set_hydrating(true);
			get(each_array);
		}),
		flags,
		items,
		pending,
		outrogroups: null,
		fallback
	};
	first_run = false;
	if (hydrating) anchor = hydrate_node;
}
/**
* Skip past any non-branch effects (which could be created with `createSubscriber`, for example) to find the next branch effect
* @param {Effect | null} effect
* @returns {Effect | null}
*/
function skip_to_branch(effect) {
	while (effect !== null && (effect.f & 32) === 0) effect = effect.next;
	return effect;
}
/**
* Add, remove, or reorder items output by an each block as its input changes
* @template V
* @param {EachState} state
* @param {Array<V>} array
* @param {Element | Comment | Text} anchor
* @param {number} flags
* @param {(value: V, index: number) => any} get_key
* @returns {void}
*/
function reconcile(state, array, anchor, flags, get_key) {
	var is_animated = (flags & 8) !== 0;
	var length = array.length;
	var items = state.items;
	var current = skip_to_branch(state.effect.first);
	/** @type {undefined | Set<Effect>} */
	var seen;
	/** @type {Effect | null} */
	var prev = null;
	/** @type {undefined | Set<Effect>} */
	var to_animate;
	/** @type {Effect[]} */
	var matched = [];
	/** @type {Effect[]} */
	var stashed = [];
	/** @type {V} */
	var value;
	/** @type {any} */
	var key;
	/** @type {Effect | undefined} */
	var effect;
	/** @type {number} */
	var i;
	if (is_animated) for (i = 0; i < length; i += 1) {
		value = array[i];
		key = get_key(value, i);
		effect = items.get(key).e;
		if ((effect.f & 33554432) === 0) {
			effect.nodes?.a?.measure();
			(to_animate ??= /* @__PURE__ */ new Set()).add(effect);
		}
	}
	for (i = 0; i < length; i += 1) {
		value = array[i];
		key = get_key(value, i);
		effect = items.get(key).e;
		if (state.outrogroups !== null) for (const group of state.outrogroups) {
			group.pending.delete(effect);
			group.done.delete(effect);
		}
		if ((effect.f & 8192) !== 0) {
			resume_effect(effect);
			if (is_animated) {
				effect.nodes?.a?.unfix();
				(to_animate ??= /* @__PURE__ */ new Set()).delete(effect);
			}
		}
		if ((effect.f & 33554432) !== 0) {
			effect.f ^= EFFECT_OFFSCREEN;
			if (effect === current) move(effect, null, anchor);
			else {
				var next = prev ? prev.next : current;
				if (effect === state.effect.last) state.effect.last = effect.prev;
				if (effect.prev) effect.prev.next = effect.next;
				if (effect.next) effect.next.prev = effect.prev;
				link(state, prev, effect);
				link(state, effect, next);
				move(effect, next, anchor);
				prev = effect;
				matched = [];
				stashed = [];
				current = skip_to_branch(prev.next);
				continue;
			}
		}
		if (effect !== current) {
			if (seen !== void 0 && seen.has(effect)) {
				if (matched.length < stashed.length) {
					var start = stashed[0];
					var j;
					prev = start.prev;
					var a = matched[0];
					var b = matched[matched.length - 1];
					for (j = 0; j < matched.length; j += 1) move(matched[j], start, anchor);
					for (j = 0; j < stashed.length; j += 1) seen.delete(stashed[j]);
					link(state, a.prev, b.next);
					link(state, prev, a);
					link(state, b, start);
					current = start;
					prev = b;
					i -= 1;
					matched = [];
					stashed = [];
				} else {
					seen.delete(effect);
					move(effect, current, anchor);
					link(state, effect.prev, effect.next);
					link(state, effect, prev === null ? state.effect.first : prev.next);
					link(state, prev, effect);
					prev = effect;
				}
				continue;
			}
			matched = [];
			stashed = [];
			while (current !== null && current !== effect) {
				(seen ??= /* @__PURE__ */ new Set()).add(current);
				stashed.push(current);
				current = skip_to_branch(current.next);
			}
			if (current === null) continue;
		}
		if ((effect.f & 33554432) === 0) matched.push(effect);
		prev = effect;
		current = skip_to_branch(effect.next);
	}
	if (state.outrogroups !== null) {
		for (const group of state.outrogroups) if (group.pending.size === 0) {
			destroy_effects(state, array_from(group.done));
			state.outrogroups?.delete(group);
		}
		if (state.outrogroups.size === 0) state.outrogroups = null;
	}
	if (current !== null || seen !== void 0) {
		/** @type {Effect[]} */
		var to_destroy = [];
		if (seen !== void 0) {
			for (effect of seen) if ((effect.f & 8192) === 0) to_destroy.push(effect);
		}
		while (current !== null) {
			if ((current.f & 8192) === 0 && current !== state.fallback) to_destroy.push(current);
			current = skip_to_branch(current.next);
		}
		var destroy_length = to_destroy.length;
		if (destroy_length > 0) {
			var controlled_anchor = (flags & 4) !== 0 && length === 0 ? anchor : null;
			if (is_animated) {
				for (i = 0; i < destroy_length; i += 1) to_destroy[i].nodes?.a?.measure();
				for (i = 0; i < destroy_length; i += 1) to_destroy[i].nodes?.a?.fix();
			}
			pause_effects(state, to_destroy, controlled_anchor);
		}
	}
	if (is_animated) queue_micro_task(() => {
		if (to_animate === void 0) return;
		for (effect of to_animate) effect.nodes?.a?.apply();
	});
}
/**
* @template V
* @param {Map<any, EachItem>} items
* @param {Node} anchor
* @param {V} value
* @param {unknown} key
* @param {number} index
* @param {(anchor: Node, item: V | Source<V>, index: number | Value<number>, collection: () => V[]) => void} render_fn
* @param {number} flags
* @param {() => V[]} get_collection
* @returns {EachItem}
*/
function create_item(items, anchor, value, key, index, render_fn, flags, get_collection) {
	var v = (flags & 1) !== 0 ? (flags & 16) === 0 ? /* @__PURE__ */ mutable_source(value, false, false) : source(value) : null;
	var i = (flags & 2) !== 0 ? source(index) : null;
	return {
		v,
		i,
		e: branch(() => {
			render_fn(anchor, v ?? value, i ?? index, get_collection);
			return () => {
				items.delete(key);
			};
		})
	};
}
/**
* @param {Effect} effect
* @param {Effect | null} next
* @param {Text | Element | Comment} anchor
*/
function move(effect, next, anchor) {
	if (!effect.nodes) return;
	var node = effect.nodes.start;
	var end = effect.nodes.end;
	var dest = next && (next.f & 33554432) === 0 ? next.nodes.start : anchor;
	while (node !== null) {
		var next_node = /* @__PURE__ */ get_next_sibling(node);
		dest.before(node);
		if (node === end) return;
		node = next_node;
	}
}
/**
* @param {EachState} state
* @param {Effect | null} prev
* @param {Effect | null} next
*/
function link(state, prev, next) {
	if (prev === null) state.effect.first = next;
	else prev.next = next;
	if (next === null) state.effect.last = prev;
	else next.prev = prev;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/slot.js
/**
* @param {Comment} anchor
* @param {Record<string, any>} $$props
* @param {string} name
* @param {Record<string, unknown>} slot_props
* @param {null | ((anchor: Comment) => void)} fallback_fn
*/
function slot(anchor, $$props, name, slot_props, fallback_fn) {
	if (hydrating) hydrate_next();
	var slot_fn = $$props.$$slots?.[name];
	var is_interop = false;
	if (slot_fn === true) {
		slot_fn = $$props[name === "default" ? "children" : name];
		is_interop = true;
	}
	if (slot_fn === void 0) {
		if (fallback_fn !== null) fallback_fn(anchor);
	} else slot_fn(anchor, is_interop ? () => slot_props : slot_props);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/snippet.js
/** @import { Snippet } from 'svelte' */
/** @import { TemplateNode } from '#client' */
/** @import { Getters } from '#shared' */
/**
* @template {(node: TemplateNode, ...args: any[]) => void} SnippetFn
* @param {TemplateNode} node
* @param {() => SnippetFn | null | undefined} get_snippet
* @param {(() => any)[]} args
* @returns {void}
*/
function snippet(node, get_snippet, ...args) {
	var branches = new BranchManager(node);
	block(() => {
		const snippet = get_snippet() ?? null;
		branches.ensure(snippet, snippet && ((anchor) => snippet(anchor, ...args)));
	}, EFFECT_TRANSPARENT);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/svelte-element.js
/** @import { Effect, EffectNodes, TemplateNode } from '#client' */
/**
* @param {Comment | Element} node
* @param {() => string} get_tag
* @param {boolean} is_svg
* @param {undefined | ((element: Element, anchor: Node | null) => void)} render_fn,
* @param {undefined | (() => string)} get_namespace
* @param {undefined | [number, number]} location
* @returns {void}
*/
function element(node, get_tag, is_svg, render_fn, get_namespace, location) {
	let was_hydrating = hydrating;
	if (hydrating) hydrate_next();
	/** @type {null | Element} */
	var element = null;
	if (hydrating && hydrate_node.nodeType === 1) {
		element = hydrate_node;
		hydrate_next();
	}
	var anchor = hydrating ? hydrate_node : node;
	var branches = new BranchManager(anchor, false);
	block(() => {
		const next_tag = get_tag() || null;
		var ns = get_namespace ? get_namespace() : is_svg || next_tag === "svg" ? NAMESPACE_SVG : void 0;
		if (next_tag === null) {
			branches.ensure(null, null);
			return;
		}
		branches.ensure(next_tag, (anchor) => {
			if (next_tag) {
				element = hydrating ? element : create_element(next_tag, ns);
				assign_nodes(element, element);
				if (render_fn) {
					var tmp_comment = null;
					if (hydrating && is_raw_text_element(next_tag)) element.append(tmp_comment = document.createComment(""));
					var child_anchor = hydrating ? /* @__PURE__ */ get_first_child(element) : element.appendChild(create_text());
					if (hydrating) if (child_anchor === null) set_hydrating(false);
					else set_hydrate_node(child_anchor);
					render_fn(element, child_anchor);
					tmp_comment?.remove();
				}
				/** @type {Effect & { nodes: EffectNodes }} */ active_effect.nodes.end = element;
				anchor.before(element);
			}
			if (hydrating) set_hydrate_node(anchor);
		});
		return () => {
			if (next_tag);
		};
	}, EFFECT_TRANSPARENT);
	teardown(() => {});
	if (was_hydrating) {
		set_hydrating(true);
		set_hydrate_node(anchor);
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/attachments.js
/** @import { Effect } from '#client' */
/**
* @param {Element} node
* @param {() => (node: Element) => void} get_fn
*/
function attach(node, get_fn) {
	/** @type {false | undefined | ((node: Element) => void)} */
	var fn = void 0;
	/** @type {Effect | null} */
	var e;
	managed(() => {
		if (fn !== (fn = get_fn())) {
			if (e) {
				destroy_effect(e);
				e = null;
			}
			if (fn) e = branch(() => {
				effect(() => fn(node));
			});
		}
	});
}
//#endregion
//#region node_modules/clsx/dist/clsx.mjs
function r(e) {
	var t, f, n = "";
	if ("string" == typeof e || "number" == typeof e) n += e;
	else if ("object" == typeof e) if (Array.isArray(e)) {
		var o = e.length;
		for (t = 0; t < o; t++) e[t] && (f = r(e[t])) && (n && (n += " "), n += f);
	} else for (f in e) e[f] && (n && (n += " "), n += f);
	return n;
}
function clsx$1() {
	for (var e, t, f = 0, n = "", o = arguments.length; f < o; f++) (e = arguments[f]) && (t = r(e)) && (n && (n += " "), n += t);
	return n;
}
//#endregion
//#region node_modules/svelte/src/internal/shared/attributes.js
/**
* Small wrapper around clsx to preserve Svelte's (weird) handling of falsy values.
* TODO Svelte 6 revisit this, and likely turn all falsy values into the empty string (what clsx also does)
* @param  {any} value
*/
function clsx(value) {
	if (typeof value === "object") return clsx$1(value);
	else return value ?? "";
}
var whitespace = [..." 	\n\r\f\xA0\v﻿"];
/**
* @param {any} value
* @param {string | null} [hash]
* @param {Record<string, boolean>} [directives]
* @returns {string | null}
*/
function to_class(value, hash, directives) {
	var classname = value == null ? "" : "" + value;
	if (hash) classname = classname ? classname + " " + hash : hash;
	if (directives) {
		for (var key of Object.keys(directives)) if (directives[key]) classname = classname ? classname + " " + key : key;
		else if (classname.length) {
			var len = key.length;
			var a = 0;
			while ((a = classname.indexOf(key, a)) >= 0) {
				var b = a + len;
				if ((a === 0 || whitespace.includes(classname[a - 1])) && (b === classname.length || whitespace.includes(classname[b]))) classname = (a === 0 ? "" : classname.substring(0, a)) + classname.substring(b + 1);
				else a = b;
			}
		}
	}
	return classname === "" ? null : classname;
}
/**
*
* @param {Record<string,any>} styles
* @param {boolean} important
*/
function append_styles(styles, important = false) {
	var separator = important ? " !important;" : ";";
	var css = "";
	for (var key of Object.keys(styles)) {
		var value = styles[key];
		if (value != null && value !== "") css += " " + key + ": " + value + separator;
	}
	return css;
}
/**
* @param {string} name
* @returns {string}
*/
function to_css_name(name) {
	if (name[0] !== "-" || name[1] !== "-") return name.toLowerCase();
	return name;
}
/**
* @param {any} value
* @param {Record<string, any> | [Record<string, any>, Record<string, any>]} [styles]
* @returns {string | null}
*/
function to_style(value, styles) {
	if (styles) {
		var new_style = "";
		/** @type {Record<string,any> | undefined} */
		var normal_styles;
		/** @type {Record<string,any> | undefined} */
		var important_styles;
		if (Array.isArray(styles)) {
			normal_styles = styles[0];
			important_styles = styles[1];
		} else normal_styles = styles;
		if (value) {
			value = String(value).replaceAll(/\s*\/\*.*?\*\/\s*/g, "").trim();
			/** @type {boolean | '"' | "'"} */
			var in_str = false;
			var in_apo = 0;
			var in_comment = false;
			var reserved_names = [];
			if (normal_styles) reserved_names.push(...Object.keys(normal_styles).map(to_css_name));
			if (important_styles) reserved_names.push(...Object.keys(important_styles).map(to_css_name));
			var start_index = 0;
			var name_index = -1;
			const len = value.length;
			for (var i = 0; i < len; i++) {
				var c = value[i];
				if (in_comment) {
					if (c === "/" && value[i - 1] === "*") in_comment = false;
				} else if (in_str) {
					if (in_str === c) in_str = false;
				} else if (c === "/" && value[i + 1] === "*") in_comment = true;
				else if (c === "\"" || c === "'") in_str = c;
				else if (c === "(") in_apo++;
				else if (c === ")") in_apo--;
				if (!in_comment && in_str === false && in_apo === 0) {
					if (c === ":" && name_index === -1) name_index = i;
					else if (c === ";" || i === len - 1) {
						if (name_index !== -1) {
							var name = to_css_name(value.substring(start_index, name_index).trim());
							if (!reserved_names.includes(name)) {
								if (c !== ";") i++;
								var property = value.substring(start_index, i).trim();
								new_style += " " + property + ";";
							}
						}
						start_index = i + 1;
						name_index = -1;
					}
				}
			}
		}
		if (normal_styles) new_style += append_styles(normal_styles);
		if (important_styles) new_style += append_styles(important_styles, true);
		new_style = new_style.trim();
		return new_style === "" ? null : new_style;
	}
	return value == null ? null : String(value);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/class.js
/**
* @param {Element} dom
* @param {boolean | number} is_html
* @param {string | null} value
* @param {string} [hash]
* @param {Record<string, any>} [prev_classes]
* @param {Record<string, any>} [next_classes]
* @returns {Record<string, boolean> | undefined}
*/
function set_class(dom, is_html, value, hash, prev_classes, next_classes) {
	var prev = dom[CLASS_CACHE];
	if (hydrating || prev !== value || prev === void 0) {
		var next_class_name = to_class(value, hash, next_classes);
		if (!hydrating || next_class_name !== dom.getAttribute("class")) if (next_class_name == null) dom.removeAttribute("class");
		else if (is_html) dom.className = next_class_name;
		else dom.setAttribute("class", next_class_name);
		/** @type {any} */ dom[CLASS_CACHE] = value;
	} else if (next_classes && prev_classes !== next_classes) for (var key in next_classes) {
		var is_present = !!next_classes[key];
		if (prev_classes == null || is_present !== !!prev_classes[key]) dom.classList.toggle(key, is_present);
	}
	return next_classes;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/style.js
/**
* @param {Element & ElementCSSInlineStyle} dom
* @param {Record<string, any>} prev
* @param {Record<string, any>} next
* @param {string} [priority]
*/
function update_styles(dom, prev = {}, next, priority) {
	for (var key in next) {
		var value = next[key];
		if (prev[key] !== value) if (next[key] == null) dom.style.removeProperty(key);
		else dom.style.setProperty(key, value, priority);
	}
}
/**
* @param {Element & ElementCSSInlineStyle} dom
* @param {string | null} value
* @param {Record<string, any> | [Record<string, any>, Record<string, any>]} [prev_styles]
* @param {Record<string, any> | [Record<string, any>, Record<string, any>]} [next_styles]
*/
function set_style(dom, value, prev_styles, next_styles) {
	var prev = dom[STYLE_CACHE];
	if (hydrating || prev !== value) {
		var next_style_attr = to_style(value, next_styles);
		if (!hydrating || next_style_attr !== dom.getAttribute("style")) if (next_style_attr == null) dom.removeAttribute("style");
		else dom.style.cssText = next_style_attr;
		/** @type {any} */ dom[STYLE_CACHE] = value;
	} else if (next_styles) if (Array.isArray(next_styles)) {
		update_styles(dom, prev_styles?.[0], next_styles[0]);
		update_styles(dom, prev_styles?.[1], next_styles[1], "important");
	} else update_styles(dom, prev_styles, next_styles);
	return next_styles;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/select.js
/**
* Selects the correct option(s) (depending on whether this is a multiple select)
* @template V
* @param {HTMLSelectElement} select
* @param {V} value
* @param {boolean} mounting
*/
function select_option(select, value, mounting = false) {
	if (select.multiple) {
		if (value == void 0) return;
		if (!is_array(value)) return select_multiple_invalid_value();
		for (var option of select.options) option.selected = value.includes(get_option_value(option));
		return;
	}
	for (option of select.options) if (is(get_option_value(option), value)) {
		option.selected = true;
		return;
	}
	if (!mounting || value !== void 0) select.selectedIndex = -1;
}
/**
* Selects the correct option(s) if `value` is given,
* and then sets up a mutation observer to sync the
* current selection to the dom when it changes. Such
* changes could for example occur when options are
* inside an `#each` block.
* @param {HTMLSelectElement} select
*/
function init_select(select) {
	var observer = new MutationObserver(() => {
		select_option(select, select.__value);
	});
	observer.observe(select, {
		childList: true,
		subtree: true,
		attributes: true,
		attributeFilter: ["value"]
	});
	teardown(() => {
		observer.disconnect();
	});
}
/** @param {HTMLOptionElement} option */
function get_option_value(option) {
	if ("__value" in option) return option.__value;
	else return option.value;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/attributes.js
/** @import { Blocker, Effect } from '#client' */
var CLASS = Symbol("class");
var STYLE = Symbol("style");
var IS_CUSTOM_ELEMENT = Symbol("is custom element");
var IS_HTML = Symbol("is html");
var LINK_TAG = IS_XHTML ? "link" : "LINK";
var INPUT_TAG = IS_XHTML ? "input" : "INPUT";
var OPTION_TAG = IS_XHTML ? "option" : "OPTION";
var SELECT_TAG = IS_XHTML ? "select" : "SELECT";
/**
* The value/checked attribute in the template actually corresponds to the defaultValue property, so we need
* to remove it upon hydration to avoid a bug when someone resets the form value.
* @param {HTMLInputElement} input
* @returns {void}
*/
function remove_input_defaults(input) {
	if (!hydrating) return;
	var already_removed = false;
	var remove_defaults = () => {
		if (already_removed) return;
		already_removed = true;
		if (input.hasAttribute("value")) {
			var value = input.value;
			set_attribute(input, "value", null);
			input.value = value;
		}
		if (input.hasAttribute("checked")) {
			var checked = input.checked;
			set_attribute(input, "checked", null);
			input.checked = checked;
		}
	};
	/** @type {any} */ input[FORM_RESET_HANDLER] = remove_defaults;
	queue_micro_task(remove_defaults);
	add_form_reset_listener();
}
/**
* Sets the `selected` attribute on an `option` element.
* Not set through the property because that doesn't reflect to the DOM,
* which means it wouldn't be taken into account when a form is reset.
* @param {HTMLOptionElement} element
* @param {boolean} selected
*/
function set_selected(element, selected) {
	if (selected) {
		if (!element.hasAttribute("selected")) element.setAttribute("selected", "");
	} else element.removeAttribute("selected");
}
/**
* @param {Element} element
* @param {string} attribute
* @param {string | null} value
* @param {boolean} [skip_warning]
*/
function set_attribute(element, attribute, value, skip_warning) {
	var attributes = get_attributes(element);
	if (hydrating) {
		attributes[attribute] = element.getAttribute(attribute);
		if (attribute === "src" || attribute === "srcset" || attribute === "href" && element.nodeName === LINK_TAG) {
			if (!skip_warning);
			return;
		}
	}
	if (attributes[attribute] === (attributes[attribute] = value)) return;
	if (attribute === "loading") element[LOADING_ATTR_SYMBOL] = value;
	if (value == null) element.removeAttribute(attribute);
	else if (typeof value !== "string" && get_setters(element).includes(attribute)) element[attribute] = value;
	else element.setAttribute(attribute, value);
}
/**
* Spreads attributes onto a DOM element, taking into account the currently set attributes
* @param {Element & ElementCSSInlineStyle} element
* @param {Record<string | symbol, any> | undefined} prev
* @param {Record<string | symbol, any>} next New attributes - this function mutates this object
* @param {string} [css_hash]
* @param {boolean} [should_remove_defaults]
* @param {boolean} [skip_warning]
* @returns {Record<string, any>}
*/
function set_attributes(element, prev, next, css_hash, should_remove_defaults = false, skip_warning = false) {
	if (hydrating && should_remove_defaults && element.nodeName === INPUT_TAG) {
		var input = element;
		if (!((input.type === "checkbox" ? "defaultChecked" : "defaultValue") in next)) remove_input_defaults(input);
	}
	var attributes = get_attributes(element);
	var is_custom_element = attributes[IS_CUSTOM_ELEMENT];
	var preserve_attribute_case = !attributes[IS_HTML];
	let is_hydrating_custom_element = hydrating && is_custom_element;
	if (is_hydrating_custom_element) set_hydrating(false);
	var current = prev || {};
	var is_option_element = element.nodeName === OPTION_TAG;
	for (var key in prev) if (!(key in next)) next[key] = null;
	if (next.class) next.class = clsx(next.class);
	else if (css_hash || next[CLASS]) next.class = null;
	if (next[STYLE]) next.style ??= null;
	var setters = get_setters(element);
	if (element.nodeName === INPUT_TAG && "type" in next && ("value" in next || "__value" in next)) {
		var type = next.type;
		if (type !== current.type || type === void 0 && element.hasAttribute("type")) {
			current.type = type;
			set_attribute(element, "type", type, skip_warning);
		}
	}
	for (const key in next) {
		let value = next[key];
		if (is_option_element && key === "value" && value == null) {
			element.value = element.__value = "";
			current[key] = value;
			continue;
		}
		if (key === "class") {
			set_class(element, element.namespaceURI === "http://www.w3.org/1999/xhtml", value, css_hash, prev?.[CLASS], next[CLASS]);
			current[key] = value;
			current[CLASS] = next[CLASS];
			continue;
		}
		if (key === "style") {
			set_style(element, value, prev?.[STYLE], next[STYLE]);
			current[key] = value;
			current[STYLE] = next[STYLE];
			continue;
		}
		var prev_value = current[key];
		if (value === prev_value && !(value === void 0 && element.hasAttribute(key))) continue;
		current[key] = value;
		var prefix = key[0] + key[1];
		if (prefix === "$$") continue;
		if (prefix === "on") {
			/** @type {{ capture?: true }} */
			const opts = {};
			const event_handle_key = "$$" + key;
			let event_name = key.slice(2);
			var is_delegated = can_delegate_event(event_name);
			if (is_capture_event(event_name)) {
				event_name = event_name.slice(0, -7);
				opts.capture = true;
			}
			if (!is_delegated && prev_value) {
				if (value != null) continue;
				element.removeEventListener(event_name, current[event_handle_key], opts);
				current[event_handle_key] = null;
			}
			if (is_delegated) {
				delegated(event_name, element, value);
				delegate([event_name]);
			} else if (value != null) {
				/**
				* @this {any}
				* @param {Event} evt
				*/
				function handle(evt) {
					current[key].call(this, evt);
				}
				current[event_handle_key] = create_event(event_name, element, handle, opts);
			}
		} else if (key === "style") set_attribute(element, key, value);
		else if (key === "autofocus") autofocus(element, Boolean(value));
		else if (!is_custom_element && (key === "__value" || key === "value" && value != null)) element.value = element.__value = value;
		else if (key === "selected" && is_option_element) set_selected(element, value);
		else {
			var name = key;
			if (!preserve_attribute_case) name = normalize_attribute(name);
			var is_default = name === "defaultValue" || name === "defaultChecked";
			if (value == null && !is_custom_element && !is_default) {
				attributes[key] = null;
				if (name === "value" || name === "checked") {
					let input = element;
					const use_default = prev === void 0;
					if (name === "value") {
						let previous = input.defaultValue;
						input.removeAttribute(name);
						input.defaultValue = previous;
						input.value = input.__value = use_default ? previous : null;
					} else {
						let previous = input.defaultChecked;
						input.removeAttribute(name);
						input.defaultChecked = previous;
						input.checked = use_default ? previous : false;
					}
				} else element.removeAttribute(key);
			} else if (is_default || setters.includes(name) && (is_custom_element || typeof value !== "string")) {
				element[name] = value;
				if (name in attributes) attributes[name] = UNINITIALIZED;
			} else if (typeof value !== "function") set_attribute(element, name, value, skip_warning);
		}
	}
	if (is_hydrating_custom_element) set_hydrating(true);
	return current;
}
/**
* @param {Element & ElementCSSInlineStyle} element
* @param {(...expressions: any) => Record<string | symbol, any>} fn
* @param {Array<() => any>} sync
* @param {Array<() => Promise<any>>} async
* @param {Blocker[]} blockers
* @param {string} [css_hash]
* @param {boolean} [should_remove_defaults]
* @param {boolean} [skip_warning]
*/
function attribute_effect(element, fn, sync = [], async = [], blockers = [], css_hash, should_remove_defaults = false, skip_warning = false) {
	flatten(blockers, sync, async, (values) => {
		/** @type {Record<string | symbol, any> | undefined} */
		var prev = void 0;
		/** @type {Record<symbol, Effect>} */
		var effects = {};
		var is_select = element.nodeName === SELECT_TAG;
		var inited = false;
		managed(() => {
			var next = fn(...values.map(get));
			/** @type {Record<string | symbol, any>} */
			var current = set_attributes(element, prev, next, css_hash, should_remove_defaults, skip_warning);
			if (inited && is_select && "value" in next) select_option(element, next.value);
			for (let symbol of Object.getOwnPropertySymbols(effects)) if (!next[symbol]) destroy_effect(effects[symbol]);
			for (let symbol of Object.getOwnPropertySymbols(next)) {
				var n = next[symbol];
				if (symbol.description === "@attach" && (!prev || n !== prev[symbol])) {
					if (effects[symbol]) destroy_effect(effects[symbol]);
					effects[symbol] = branch(() => attach(element, () => n));
				}
				current[symbol] = n;
			}
			prev = current;
		});
		if (is_select) {
			var select = element;
			effect(() => {
				select_option(
					select,
					/** @type {Record<string | symbol, any>} */
					prev.value,
					true
				);
				init_select(select);
			});
		}
		inited = true;
	});
}
/**
*
* @param {Element} element
*/
function get_attributes(element) {
	return element[ATTRIBUTES_CACHE] ??= {
		[IS_CUSTOM_ELEMENT]: element.nodeName.includes("-"),
		[IS_HTML]: element.namespaceURI === NAMESPACE_HTML
	};
}
/** @type {Map<string, string[]>} */
var setters_cache = /* @__PURE__ */ new Map();
/** @param {Element} element */
function get_setters(element) {
	var cache_key = element.getAttribute("is") || element.nodeName;
	var setters = setters_cache.get(cache_key);
	if (setters) return setters;
	setters_cache.set(cache_key, setters = []);
	var descriptors;
	var proto = element;
	var element_proto = Element.prototype;
	while (element_proto !== proto) {
		descriptors = get_descriptors(proto);
		for (var key in descriptors) if (descriptors[key].set && key !== "innerHTML" && key !== "textContent" && key !== "innerText") setters.push(key);
		proto = get_prototype_of(proto);
	}
	return setters;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/legacy/lifecycle.js
/** @import { ComponentContextLegacy } from '#client' */
/**
* Legacy-mode only: Call `onMount` callbacks and set up `beforeUpdate`/`afterUpdate` effects
* @param {boolean} [immutable]
*/
function init(immutable = false) {
	const context = component_context;
	const callbacks = context.l.u;
	if (!callbacks) return;
	let props = () => deep_read_state(context.s);
	if (immutable) {
		let version = 0;
		let prev = {};
		const d = /* @__PURE__ */ derived(() => {
			let changed = false;
			const props = context.s;
			for (const key in props) if (props[key] !== prev[key]) {
				prev[key] = props[key];
				changed = true;
			}
			if (changed) version++;
			return version;
		});
		props = () => get(d);
	}
	if (callbacks.b.length) user_pre_effect(() => {
		observe_all(context, props);
		run_all(callbacks.b);
	});
	user_effect(() => {
		const fns = untrack(() => callbacks.m.map(run));
		return () => {
			for (const fn of fns) if (typeof fn === "function") fn();
		};
	});
	if (callbacks.a.length) user_effect(() => {
		observe_all(context, props);
		run_all(callbacks.a);
	});
}
/**
* Invoke the getter of all signals associated with a component
* so they can be registered to the effect this function is called in.
* @param {ComponentContextLegacy} context
* @param {(() => void)} props
*/
function observe_all(context, props) {
	if (context.l.s) for (const signal of context.l.s) get(signal);
	props();
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/props.js
/** @import { Derived, Effect, Source } from './types.js' */
/**
* The proxy handler for legacy $$restProps and $$props
* @type {ProxyHandler<{ props: Record<string | symbol, unknown>, exclude: Array<string | symbol>, special: Record<string | symbol, (v?: unknown) => unknown>, version: Source<number>, parent_effect: Effect }>}}
*/
var legacy_rest_props_handler = {
	get(target, key) {
		if (target.exclude.includes(key)) return;
		get(target.version);
		return key in target.special ? target.special[key]() : target.props[key];
	},
	set(target, key, value) {
		if (!(key in target.special)) {
			var previous_effect = active_effect;
			try {
				set_active_effect(target.parent_effect);
				/** @type {Record<string, (v?: unknown) => unknown>} */
				target.special[key] = prop({ get [key]() {
					return target.props[key];
				} }, key, 4);
			} finally {
				set_active_effect(previous_effect);
			}
		}
		target.special[key](value);
		update$1(target.version);
		return true;
	},
	getOwnPropertyDescriptor(target, key) {
		if (target.exclude.includes(key)) return;
		if (key in target.props) return {
			enumerable: true,
			configurable: true,
			value: target.props[key]
		};
	},
	deleteProperty(target, key) {
		if (target.exclude.includes(key)) return true;
		target.exclude.push(key);
		update$1(target.version);
		return true;
	},
	has(target, key) {
		if (target.exclude.includes(key)) return false;
		return key in target.props;
	},
	ownKeys(target) {
		return Reflect.ownKeys(target.props).filter((key) => !target.exclude.includes(key));
	}
};
/**
* @param {Record<string, unknown>} props
* @param {string[]} exclude
* @returns {Record<string, unknown>}
*/
function legacy_rest_props(props, exclude) {
	return new Proxy({
		props,
		exclude,
		special: {},
		version: source(0),
		parent_effect: active_effect
	}, legacy_rest_props_handler);
}
/**
* The proxy handler for spread props. Handles the incoming array of props
* that looks like `() => { dynamic: props }, { static: prop }, ..` and wraps
* them so that the whole thing is passed to the component as the `$$props` argument.
* @type {ProxyHandler<{ props: Array<Record<string | symbol, unknown> | (() => Record<string | symbol, unknown>)> }>}}
*/
var spread_props_handler = {
	get(target, key) {
		let i = target.props.length;
		while (i--) {
			let p = target.props[i];
			if (is_function(p)) p = p();
			if (typeof p === "object" && p !== null && key in p) return p[key];
		}
	},
	set(target, key, value) {
		let i = target.props.length;
		while (i--) {
			let p = target.props[i];
			if (is_function(p)) p = p();
			const desc = get_descriptor(p, key);
			if (desc && desc.set) {
				desc.set(value);
				return true;
			}
		}
		return false;
	},
	getOwnPropertyDescriptor(target, key) {
		let i = target.props.length;
		while (i--) {
			let p = target.props[i];
			if (is_function(p)) p = p();
			if (typeof p === "object" && p !== null && key in p) {
				const descriptor = get_descriptor(p, key);
				if (descriptor && !descriptor.configurable) descriptor.configurable = true;
				return descriptor;
			}
		}
	},
	has(target, key) {
		if (key === STATE_SYMBOL || key === LEGACY_PROPS) return false;
		for (let p of target.props) {
			if (is_function(p)) p = p();
			if (p != null && key in p) return true;
		}
		return false;
	},
	ownKeys(target) {
		/** @type {Array<string | symbol>} */
		const keys = [];
		for (let p of target.props) {
			if (is_function(p)) p = p();
			if (!p) continue;
			for (const key in p) if (!keys.includes(key)) keys.push(key);
			for (const key of Object.getOwnPropertySymbols(p)) if (!keys.includes(key)) keys.push(key);
		}
		return keys;
	}
};
/**
* @param {Array<Record<string, unknown> | (() => Record<string, unknown>)>} props
* @returns {any}
*/
function spread_props(...props) {
	return new Proxy({ props }, spread_props_handler);
}
/**
* This function is responsible for synchronizing a possibly bound prop with the inner component state.
* It is used whenever the compiler sees that the component writes to the prop, or when it has a default prop_value.
* @template V
* @param {Record<string, unknown>} props
* @param {string} key
* @param {number} flags
* @param {V | (() => V)} [fallback]
* @returns {(() => V | ((arg: V) => V) | ((arg: V, mutation: boolean) => V))}
*/
function prop(props, key, flags, fallback) {
	var runes = !legacy_mode_flag || (flags & 2) !== 0;
	var bindable = (flags & 8) !== 0;
	var lazy = (flags & 16) !== 0;
	var fallback_value = fallback;
	var fallback_dirty = true;
	var fallback_signal = void 0;
	var get_fallback = () => {
		if (lazy && runes) {
			fallback_signal ??= /* @__PURE__ */ derived(fallback);
			return get(fallback_signal);
		}
		if (fallback_dirty) {
			fallback_dirty = false;
			fallback_value = lazy ? untrack(fallback) : fallback;
		}
		return fallback_value;
	};
	/** @type {((v: V) => void) | undefined} */
	let setter;
	if (bindable) {
		var is_entry_props = STATE_SYMBOL in props || LEGACY_PROPS in props;
		setter = get_descriptor(props, key)?.set ?? (is_entry_props && key in props ? (v) => props[key] = v : void 0);
	}
	/** @type {V} */
	var initial_value;
	var is_store_sub = false;
	if (bindable) [initial_value, is_store_sub] = capture_store_binding(() => props[key]);
	else initial_value = props[key];
	if (initial_value === void 0 && fallback !== void 0) {
		initial_value = get_fallback();
		if (setter) {
			if (runes) props_invalid_value(key);
			setter(initial_value);
		}
	}
	/** @type {() => V} */
	var getter;
	if (runes) getter = () => {
		var value = props[key];
		if (value === void 0) return get_fallback();
		fallback_dirty = true;
		return value;
	};
	else getter = () => {
		var value = props[key];
		if (value !== void 0) fallback_value = void 0;
		return value === void 0 ? fallback_value : value;
	};
	if (runes && (flags & 4) === 0) return getter;
	if (setter) {
		var legacy_parent = props.$$legacy;
		return (function(value, mutation) {
			if (arguments.length > 0) {
				if (!runes || !mutation || legacy_parent || is_store_sub)
 /** @type {Function} */ setter(mutation ? getter() : value);
				return value;
			}
			return getter();
		});
	}
	var overridden = false;
	var d = ((flags & 1) !== 0 ? derived : derived_safe_equal)(() => {
		overridden = false;
		return getter();
	});
	if (bindable) get(d);
	var parent_effect = active_effect;
	return (function(value, mutation) {
		if (arguments.length > 0) {
			const new_value = mutation ? get(d) : runes && bindable ? proxy(value) : value;
			set(d, new_value);
			overridden = true;
			if (fallback_value !== void 0) fallback_value = new_value;
			return value;
		}
		if (is_destroying_effect && overridden || (parent_effect.f & 16384) !== 0) return d.v;
		return get(d);
	});
}
if (typeof HTMLElement === "function");
/**
* `onMount`, like [`$effect`](https://svelte.dev/docs/svelte/$effect), schedules a function to run as soon as the component has been mounted to the DOM.
* Unlike `$effect`, the provided function only runs once.
*
* It must be called during the component's initialisation (but doesn't need to live _inside_ the component;
* it can be called from an external module). If a function is returned _synchronously_ from `onMount`,
* it will be called when the component is unmounted.
*
* `onMount` functions do not run during [server-side rendering](https://svelte.dev/docs/svelte/svelte-server#render).
*
* @template T
* @param {() => NotFunction<T> | Promise<NotFunction<T>> | (() => any)} fn
* @returns {void}
*/
function onMount(fn) {
	if (component_context === null) lifecycle_outside_component("onMount");
	if (legacy_mode_flag && component_context.l !== null) init_update_callbacks(component_context).m.push(fn);
	else user_effect(() => {
		const cleanup = untrack(fn);
		if (typeof cleanup === "function") return cleanup;
	});
}
/**
* Legacy-mode: Init callbacks object for onMount/beforeUpdate/afterUpdate
* @param {ComponentContext} context
*/
function init_update_callbacks(context) {
	var l = context.l;
	return l.u ??= {
		a: [],
		b: [],
		m: []
	};
}
//#endregion
//#region node_modules/svelte/src/internal/disclose-version.js
if (typeof window !== "undefined") ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add("5");
//#endregion
//#region node_modules/svelte/src/internal/flags/legacy.js
enable_legacy_mode_flag();
//#endregion
//#region node_modules/@tabler/icons-svelte/dist/defaultAttributes.js
var defaultAttributes = {
	outline: {
		xmlns: "http://www.w3.org/2000/svg",
		width: 24,
		height: 24,
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		"stroke-width": 2,
		"stroke-linecap": "round",
		"stroke-linejoin": "round"
	},
	filled: {
		xmlns: "http://www.w3.org/2000/svg",
		width: 24,
		height: 24,
		viewBox: "0 0 24 24",
		fill: "currentColor",
		stroke: "none"
	}
};
//#endregion
//#region node_modules/@tabler/icons-svelte/dist/Icon.svelte
var root$13 = /* @__PURE__ */ from_svg(`<svg><!><!></svg>`);
function Icon($$anchor, $$props) {
	const $$sanitized_props = legacy_rest_props($$props, [
		"children",
		"$$slots",
		"$$events",
		"$$legacy"
	]);
	const $$restProps = legacy_rest_props($$sanitized_props, [
		"type",
		"name",
		"color",
		"size",
		"stroke",
		"iconNode"
	]);
	push($$props, false);
	let type = prop($$props, "type", 8);
	let name = prop($$props, "name", 8);
	let color = prop($$props, "color", 8, "currentColor");
	let size = prop($$props, "size", 8, 24);
	let stroke = prop($$props, "stroke", 8, 2);
	let iconNode = prop($$props, "iconNode", 8);
	init();
	var svg = root$13();
	attribute_effect(svg, () => ({
		...defaultAttributes[type()],
		...$$restProps,
		width: size(),
		height: size(),
		class: (deep_read_state(name()), deep_read_state($$sanitized_props), untrack(() => `tabler-icon tabler-icon-${name()} ${$$sanitized_props.class ?? ""}`)),
		...type() === "filled" ? { fill: color() } : {
			"stroke-width": stroke(),
			stroke: color()
		}
	}));
	var node = child(svg);
	each(node, 1, iconNode, index, ($$anchor, $$item) => {
		var $$array = /* @__PURE__ */ user_derived(() => to_array(get($$item), 2));
		let tag = () => get($$array)[0];
		let attrs = () => get($$array)[1];
		var fragment = comment();
		element(first_child(fragment), tag, true, ($$element, $$anchor) => {
			attribute_effect($$element, () => ({ ...attrs() }));
		});
		append($$anchor, fragment);
	});
	slot(sibling(node), $$props, "default", {}, null);
	reset(svg);
	append($$anchor, svg);
	pop();
}
//#endregion
//#region node_modules/@tabler/icons-svelte/dist/icons/alert-triangle.svelte
function Alert_triangle($$anchor, $$props) {
	const $$sanitized_props = legacy_rest_props($$props, [
		"children",
		"$$slots",
		"$$events",
		"$$legacy"
	]);
	const iconNode = [
		["path", { "d": "M12 9v4" }],
		["path", { "d": "M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0" }],
		["path", { "d": "M12 16h.01" }]
	];
	Icon($$anchor, spread_props({
		type: "outline",
		name: "alert-triangle"
	}, () => $$sanitized_props, {
		get iconNode() {
			return iconNode;
		},
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = comment();
			slot(first_child(fragment_1), $$props, "default", {}, null);
			append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	}));
}
//#endregion
//#region node_modules/@tabler/icons-svelte/dist/icons/chevron-down.svelte
function Chevron_down($$anchor, $$props) {
	const $$sanitized_props = legacy_rest_props($$props, [
		"children",
		"$$slots",
		"$$events",
		"$$legacy"
	]);
	const iconNode = [["path", { "d": "M6 9l6 6l6 -6" }]];
	Icon($$anchor, spread_props({
		type: "outline",
		name: "chevron-down"
	}, () => $$sanitized_props, {
		get iconNode() {
			return iconNode;
		},
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = comment();
			slot(first_child(fragment_1), $$props, "default", {}, null);
			append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	}));
}
//#endregion
//#region node_modules/@tabler/icons-svelte/dist/icons/chevron-right.svelte
function Chevron_right($$anchor, $$props) {
	const $$sanitized_props = legacy_rest_props($$props, [
		"children",
		"$$slots",
		"$$events",
		"$$legacy"
	]);
	const iconNode = [["path", { "d": "M9 6l6 6l-6 6" }]];
	Icon($$anchor, spread_props({
		type: "outline",
		name: "chevron-right"
	}, () => $$sanitized_props, {
		get iconNode() {
			return iconNode;
		},
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = comment();
			slot(first_child(fragment_1), $$props, "default", {}, null);
			append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	}));
}
//#endregion
//#region node_modules/@tabler/icons-svelte/dist/icons/chevron-up.svelte
function Chevron_up($$anchor, $$props) {
	const $$sanitized_props = legacy_rest_props($$props, [
		"children",
		"$$slots",
		"$$events",
		"$$legacy"
	]);
	const iconNode = [["path", { "d": "M6 15l6 -6l6 6" }]];
	Icon($$anchor, spread_props({
		type: "outline",
		name: "chevron-up"
	}, () => $$sanitized_props, {
		get iconNode() {
			return iconNode;
		},
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = comment();
			slot(first_child(fragment_1), $$props, "default", {}, null);
			append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	}));
}
//#endregion
//#region node_modules/@tabler/icons-svelte/dist/icons/circle-check.svelte
function Circle_check($$anchor, $$props) {
	const $$sanitized_props = legacy_rest_props($$props, [
		"children",
		"$$slots",
		"$$events",
		"$$legacy"
	]);
	const iconNode = [["path", { "d": "M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" }], ["path", { "d": "M9 12l2 2l4 -4" }]];
	Icon($$anchor, spread_props({
		type: "outline",
		name: "circle-check"
	}, () => $$sanitized_props, {
		get iconNode() {
			return iconNode;
		},
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = comment();
			slot(first_child(fragment_1), $$props, "default", {}, null);
			append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	}));
}
//#endregion
//#region node_modules/@tabler/icons-svelte/dist/icons/circle-x.svelte
function Circle_x($$anchor, $$props) {
	const $$sanitized_props = legacy_rest_props($$props, [
		"children",
		"$$slots",
		"$$events",
		"$$legacy"
	]);
	const iconNode = [["path", { "d": "M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" }], ["path", { "d": "M10 10l4 4m0 -4l-4 4" }]];
	Icon($$anchor, spread_props({
		type: "outline",
		name: "circle-x"
	}, () => $$sanitized_props, {
		get iconNode() {
			return iconNode;
		},
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = comment();
			slot(first_child(fragment_1), $$props, "default", {}, null);
			append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	}));
}
//#endregion
//#region node_modules/@tabler/icons-svelte/dist/icons/file-text.svelte
function File_text($$anchor, $$props) {
	const $$sanitized_props = legacy_rest_props($$props, [
		"children",
		"$$slots",
		"$$events",
		"$$legacy"
	]);
	const iconNode = [
		["path", { "d": "M14 3v4a1 1 0 0 0 1 1h4" }],
		["path", { "d": "M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2" }],
		["path", { "d": "M9 9l1 0" }],
		["path", { "d": "M9 13l6 0" }],
		["path", { "d": "M9 17l6 0" }]
	];
	Icon($$anchor, spread_props({
		type: "outline",
		name: "file-text"
	}, () => $$sanitized_props, {
		get iconNode() {
			return iconNode;
		},
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = comment();
			slot(first_child(fragment_1), $$props, "default", {}, null);
			append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	}));
}
//#endregion
//#region node_modules/@tabler/icons-svelte/dist/icons/folder-open.svelte
function Folder_open($$anchor, $$props) {
	const $$sanitized_props = legacy_rest_props($$props, [
		"children",
		"$$slots",
		"$$events",
		"$$legacy"
	]);
	const iconNode = [["path", { "d": "M5 19l2.757 -7.351a1 1 0 0 1 .936 -.649h12.307a1 1 0 0 1 .986 1.164l-.996 5.211a2 2 0 0 1 -1.964 1.625h-14.026a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2h4l3 3h7a2 2 0 0 1 2 2v2" }]];
	Icon($$anchor, spread_props({
		type: "outline",
		name: "folder-open"
	}, () => $$sanitized_props, {
		get iconNode() {
			return iconNode;
		},
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = comment();
			slot(first_child(fragment_1), $$props, "default", {}, null);
			append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	}));
}
//#endregion
//#region node_modules/@tabler/icons-svelte/dist/icons/folder.svelte
function Folder($$anchor, $$props) {
	const $$sanitized_props = legacy_rest_props($$props, [
		"children",
		"$$slots",
		"$$events",
		"$$legacy"
	]);
	const iconNode = [["path", { "d": "M5 4h4l3 3h7a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2" }]];
	Icon($$anchor, spread_props({
		type: "outline",
		name: "folder"
	}, () => $$sanitized_props, {
		get iconNode() {
			return iconNode;
		},
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = comment();
			slot(first_child(fragment_1), $$props, "default", {}, null);
			append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	}));
}
//#endregion
//#region node_modules/@tabler/icons-svelte/dist/icons/minus.svelte
function Minus($$anchor, $$props) {
	const $$sanitized_props = legacy_rest_props($$props, [
		"children",
		"$$slots",
		"$$events",
		"$$legacy"
	]);
	const iconNode = [["path", { "d": "M5 12l14 0" }]];
	Icon($$anchor, spread_props({
		type: "outline",
		name: "minus"
	}, () => $$sanitized_props, {
		get iconNode() {
			return iconNode;
		},
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = comment();
			slot(first_child(fragment_1), $$props, "default", {}, null);
			append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	}));
}
//#endregion
//#region node_modules/@tabler/icons-svelte/dist/icons/square.svelte
function Square($$anchor, $$props) {
	const $$sanitized_props = legacy_rest_props($$props, [
		"children",
		"$$slots",
		"$$events",
		"$$legacy"
	]);
	const iconNode = [["path", { "d": "M3 5a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-14" }]];
	Icon($$anchor, spread_props({
		type: "outline",
		name: "square"
	}, () => $$sanitized_props, {
		get iconNode() {
			return iconNode;
		},
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = comment();
			slot(first_child(fragment_1), $$props, "default", {}, null);
			append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	}));
}
//#endregion
//#region node_modules/@tabler/icons-svelte/dist/icons/star.svelte
function Star($$anchor, $$props) {
	const $$sanitized_props = legacy_rest_props($$props, [
		"children",
		"$$slots",
		"$$events",
		"$$legacy"
	]);
	const iconNode = [["path", { "d": "M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873l-6.158 -3.245" }]];
	Icon($$anchor, spread_props({
		type: "outline",
		name: "star"
	}, () => $$sanitized_props, {
		get iconNode() {
			return iconNode;
		},
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = comment();
			slot(first_child(fragment_1), $$props, "default", {}, null);
			append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	}));
}
//#endregion
//#region node_modules/@tabler/icons-svelte/dist/icons/x.svelte
function X($$anchor, $$props) {
	const $$sanitized_props = legacy_rest_props($$props, [
		"children",
		"$$slots",
		"$$events",
		"$$legacy"
	]);
	const iconNode = [["path", { "d": "M18 6l-12 12" }], ["path", { "d": "M6 6l12 12" }]];
	Icon($$anchor, spread_props({
		type: "outline",
		name: "x"
	}, () => $$sanitized_props, {
		get iconNode() {
			return iconNode;
		},
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = comment();
			slot(first_child(fragment_1), $$props, "default", {}, null);
			append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	}));
}
//#endregion
//#region node_modules/@tabler/icons-svelte/dist/icons/star-filled.svelte
function Star_filled($$anchor, $$props) {
	const $$sanitized_props = legacy_rest_props($$props, [
		"children",
		"$$slots",
		"$$events",
		"$$legacy"
	]);
	const iconNode = [["path", { "d": "M8.243 7.34l-6.38 .925l-.113 .023a1 1 0 0 0 -.44 1.684l4.622 4.499l-1.09 6.355l-.013 .11a1 1 0 0 0 1.464 .944l5.706 -3l5.693 3l.1 .046a1 1 0 0 0 1.352 -1.1l-1.091 -6.355l4.624 -4.5l.078 -.085a1 1 0 0 0 -.633 -1.62l-6.38 -.926l-2.852 -5.78a1 1 0 0 0 -1.794 0l-2.853 5.78z" }]];
	Icon($$anchor, spread_props({
		type: "filled",
		name: "star-filled"
	}, () => $$sanitized_props, {
		get iconNode() {
			return iconNode;
		},
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = comment();
			slot(first_child(fragment_1), $$props, "default", {}, null);
			append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	}));
}
//#endregion
//#region src/lib/overlays/ShortcutsOverlay.svelte
var root$12 = /* @__PURE__ */ from_html(`<div class="dk-overlay" role="dialog"><div class="dk-shortcuts-box"><div class="dk-shortcuts-title">Keyboard Shortcuts <button><!></button></div> <div class="dk-shortcuts-group"><div class="dk-shortcuts-group-title">Navigation</div> <div class="dk-shortcut-row"><span>Open project</span><span class="dk-shortcut-keys"><kbd>CTRL</kbd><kbd>O</kbd></span></div> <div class="dk-shortcut-row"><span>Search</span><span class="dk-shortcut-keys"><kbd>CTRL</kbd><kbd>K</kbd></span></div> <div class="dk-shortcut-row"><span>Close tab</span><span class="dk-shortcut-keys"><kbd>CTRL</kbd><kbd>W</kbd></span></div> <div class="dk-shortcut-row"><span>Next tab</span><span class="dk-shortcut-keys"><kbd>CTRL</kbd><kbd>TAB</kbd></span></div> <div class="dk-shortcut-row"><span>Previous tab</span><span class="dk-shortcut-keys"><kbd>CTRL</kbd><kbd>SHIFT</kbd><kbd>TAB</kbd></span></div> <div class="dk-shortcut-row"><span>Reopen last closed tab</span><span class="dk-shortcut-keys"><kbd>CTRL</kbd><kbd>SHIFT</kbd><kbd>T</kbd></span></div></div> <div class="dk-shortcuts-group"><div class="dk-shortcuts-group-title">Bookmarks</div> <div class="dk-shortcut-row"><span>Toggle bookmark</span><span class="dk-shortcut-keys"><kbd>CTRL</kbd><kbd>D</kbd></span></div></div> <div class="dk-shortcuts-group"><div class="dk-shortcuts-group-title">General</div> <div class="dk-shortcut-row"><span>Keyboard shortcuts</span><span class="dk-shortcut-keys"><kbd>?</kbd></span></div> <div class="dk-shortcut-row"><span>Close overlay</span><span class="dk-shortcut-keys"><kbd>ESC</kbd></span></div></div></div></div>`);
function ShortcutsOverlay($$anchor, $$props) {
	var fragment = comment();
	var node = first_child(fragment);
	var consequent = ($$anchor) => {
		var div = root$12();
		var div_1 = child(div);
		var div_2 = child(div_1);
		var button = sibling(child(div_2));
		X(child(button), { size: 16 });
		reset(button);
		reset(div_2);
		next(6);
		reset(div_1);
		reset(div);
		delegated("click", div, function(...$$args) {
			$$props.onclose?.apply(this, $$args);
		});
		delegated("click", div_1, (e) => e.stopPropagation());
		delegated("click", button, function(...$$args) {
			$$props.onclose?.apply(this, $$args);
		});
		append($$anchor, div);
	};
	if_block(node, ($$render) => {
		if ($$props.show) $$render(consequent);
	});
	append($$anchor, fragment);
}
delegate(["click"]);
//#endregion
//#region src/lib/overlays/SearchOverlay.svelte
var root$11 = /* @__PURE__ */ from_html(`<div class="dk-overlay" role="dialog"><div class="dk-cmd-box"><div class="dk-cmd-input"><span>FTS5 full-text search<span class="cursor"></span></span></div> <div class="dk-cmd-results"><div class="dk-cmd-r selected"><span>FTS5 indexing strategy</span> <span class="path">specs/plan.md</span></div> <div class="dk-cmd-r"><span>SQLite FTS5 schema design</span> <span class="path">docs/architecture.md</span></div> <div class="dk-cmd-r"><span>Search performance goals</span> <span class="path">specs/spec.md</span></div> <div class="dk-cmd-r"><span>pkg/search/search.go contract</span> <span class="path">contracts/indexer.md</span></div></div> <div class="dk-cmd-footer"><div class="dk-cmd-hint"><kbd>↵</kbd> open</div> <div class="dk-cmd-hint"><kbd>↑↓</kbd> navigate</div> <div class="dk-cmd-hint"><kbd>esc</kbd> close</div></div></div></div>`);
function SearchOverlay($$anchor, $$props) {
	var fragment = comment();
	var node = first_child(fragment);
	var consequent = ($$anchor) => {
		var div = root$11();
		var div_1 = child(div);
		reset(div);
		delegated("click", div, function(...$$args) {
			$$props.onclose?.apply(this, $$args);
		});
		delegated("click", div_1, (e) => e.stopPropagation());
		append($$anchor, div);
	};
	if_block(node, ($$render) => {
		if ($$props.show) $$render(consequent);
	});
	append($$anchor, fragment);
}
delegate(["click"]);
//#endregion
//#region node_modules/@wailsio/runtime/dist/nanoid.js
var urlAlphabet = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
function nanoid(size = 21) {
	let id = "";
	let i = size | 0;
	while (i--) id += urlAlphabet[Math.random() * 64 | 0];
	return id;
}
//#endregion
//#region node_modules/@wailsio/runtime/dist/runtime.js
var runtimeURL = window.location.origin + "/wails/runtime";
var objectNames = Object.freeze({
	Call: 0,
	Clipboard: 1,
	Application: 2,
	Events: 3,
	ContextMenu: 4,
	Dialog: 5,
	Window: 6,
	Screens: 7,
	System: 8,
	Browser: 9,
	CancelCall: 10,
	IOS: 11
});
var clientId = nanoid();
/**
* Custom transport implementation (can be set by user)
*/
var customTransport = null;
/**
* Creates a new runtime caller with specified ID.
*
* @param object - The object to invoke the method on.
* @param windowName - The name of the window.
* @return The new runtime caller function.
*/
function newRuntimeCaller(object, windowName = "") {
	return function(method, args = null) {
		return runtimeCallWithID(object, method, windowName, args);
	};
}
async function runtimeCallWithID(objectID, method, windowName, args) {
	var _a, _b;
	if (customTransport) return customTransport.call(objectID, method, windowName, args);
	let url = new URL(runtimeURL);
	let body = {
		object: objectID,
		method
	};
	if (args !== null && args !== void 0) body.args = args;
	let headers = {
		["x-wails-client-id"]: clientId,
		["Content-Type"]: "application/json"
	};
	if (windowName) headers["x-wails-window-name"] = windowName;
	let response = await fetch(url, {
		method: "POST",
		headers,
		body: JSON.stringify(body)
	});
	if (!response.ok) throw new Error(await response.text());
	if (((_b = (_a = response.headers.get("Content-Type")) === null || _a === void 0 ? void 0 : _a.indexOf("application/json")) !== null && _b !== void 0 ? _b : -1) !== -1) return response.json();
	else return response.text();
}
objectNames.System;
var _invoke = (function() {
	var _a, _b, _c, _d, _e, _f;
	try {
		if ((_b = (_a = window.chrome) === null || _a === void 0 ? void 0 : _a.webview) === null || _b === void 0 ? void 0 : _b.postMessage) return window.chrome.webview.postMessage.bind(window.chrome.webview);
		else if ((_e = (_d = (_c = window.webkit) === null || _c === void 0 ? void 0 : _c.messageHandlers) === null || _d === void 0 ? void 0 : _d["external"]) === null || _e === void 0 ? void 0 : _e.postMessage) return window.webkit.messageHandlers["external"].postMessage.bind(window.webkit.messageHandlers["external"]);
		else if ((_f = window.wails) === null || _f === void 0 ? void 0 : _f.invoke) return (msg) => window.wails.invoke(typeof msg === "string" ? msg : JSON.stringify(msg));
	} catch (e) {}
	console.warn("\n%c⚠️ Browser Environment Detected %c\n\n%cOnly UI previews are available in the browser. For full functionality, please run the application in desktop mode.\nMore information at: https://v3.wails.io/learn/build/#using-a-browser-for-development\n", "background: #ffffff; color: #000000; font-weight: bold; padding: 4px 8px; border-radius: 4px; border: 2px solid #000000;", "background: transparent;", "color: #ffffff; font-style: italic; font-weight: bold;");
	return null;
})();
function invoke(msg) {
	_invoke === null || _invoke === void 0 || _invoke(msg);
}
/**
* Checks if the current operating system is Windows.
*
* @return True if the operating system is Windows, otherwise false.
*/
function IsWindows() {
	var _a, _b;
	return ((_b = (_a = window._wails) === null || _a === void 0 ? void 0 : _a.environment) === null || _b === void 0 ? void 0 : _b.OS) === "windows";
}
/**
* Reports whether the app is being run in debug mode.
*
* @returns True if the app is being run in debug mode.
*/
function IsDebug() {
	var _a, _b;
	return Boolean((_b = (_a = window._wails) === null || _a === void 0 ? void 0 : _a.environment) === null || _b === void 0 ? void 0 : _b.Debug);
}
//#endregion
//#region node_modules/@wailsio/runtime/dist/utils.js
/**
* Checks whether the webview supports the {@link MouseEvent#buttons} property.
* Looking at you macOS High Sierra!
*/
function canTrackButtons() {
	return new MouseEvent("mousedown").buttons === 0;
}
/**
* Resolves the closest HTMLElement ancestor of an event's target.
*/
function eventTarget(event) {
	var _a;
	if (event.target instanceof HTMLElement) return event.target;
	else if (!(event.target instanceof HTMLElement) && event.target instanceof Node) return (_a = event.target.parentElement) !== null && _a !== void 0 ? _a : document.body;
	else return document.body;
}
document.addEventListener("DOMContentLoaded", () => {});
//#endregion
//#region node_modules/@wailsio/runtime/dist/contextmenu.js
window.addEventListener("contextmenu", contextMenuHandler);
var call$2 = newRuntimeCaller(objectNames.ContextMenu);
var ContextMenuOpen = 0;
function openContextMenu(id, x, y, data) {
	call$2(ContextMenuOpen, {
		id,
		x,
		y,
		data
	});
}
function contextMenuHandler(event) {
	const target = eventTarget(event);
	const customContextMenu = window.getComputedStyle(target).getPropertyValue("--custom-contextmenu").trim();
	if (customContextMenu) {
		event.preventDefault();
		const data = window.getComputedStyle(target).getPropertyValue("--custom-contextmenu-data");
		openContextMenu(customContextMenu, event.clientX, event.clientY, data);
	} else processDefaultContextMenu(event, target);
}
function processDefaultContextMenu(event, target) {
	if (IsDebug()) return;
	switch (window.getComputedStyle(target).getPropertyValue("--default-contextmenu").trim()) {
		case "show": return;
		case "hide":
			event.preventDefault();
			return;
	}
	if (target.isContentEditable) return;
	const selection = window.getSelection();
	const hasSelection = selection && selection.toString().length > 0;
	if (hasSelection) for (let i = 0; i < selection.rangeCount; i++) {
		const rects = selection.getRangeAt(i).getClientRects();
		for (let j = 0; j < rects.length; j++) {
			const rect = rects[j];
			if (document.elementFromPoint(rect.left, rect.top) === target) return;
		}
	}
	if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
		if (hasSelection || !target.readOnly && !target.disabled) return;
	}
	event.preventDefault();
}
//#endregion
//#region node_modules/@wailsio/runtime/dist/flags.js
/**
* Retrieves the value associated with the specified key from the flag map.
*
* @param key - The key to retrieve the value for.
* @return The value associated with the specified key.
*/
function GetFlag(key) {
	try {
		return window._wails.flags[key];
	} catch (e) {
		throw new Error("Unable to retrieve flag '" + key + "': " + e, { cause: e });
	}
}
//#endregion
//#region node_modules/@wailsio/runtime/dist/drag.js
var canDrag = false;
var dragging = false;
var resizable = false;
var canResize = false;
var resizing = false;
var resizeEdge = "";
var defaultCursor = "auto";
var buttons = 0;
var buttonsTracked = canTrackButtons();
window._wails = window._wails || {};
window._wails.setResizable = (value) => {
	resizable = value;
	if (!resizable) {
		canResize = resizing = false;
		setResize();
	}
};
var dragInitDone = false;
function isMobile() {
	var _a, _b;
	const os = (_b = (_a = window._wails) === null || _a === void 0 ? void 0 : _a.environment) === null || _b === void 0 ? void 0 : _b.OS;
	if (os === "ios" || os === "android") return true;
	const ua = navigator.userAgent || navigator.vendor || window.opera || "";
	return /android|iphone|ipad|ipod|iemobile|wpdesktop/i.test(ua);
}
function tryInitDragHandlers() {
	if (dragInitDone) return;
	if (isMobile()) return;
	window.addEventListener("mousedown", update, { capture: true });
	window.addEventListener("mousemove", update, { capture: true });
	window.addEventListener("mouseup", update, { capture: true });
	for (const ev of [
		"click",
		"contextmenu",
		"dblclick"
	]) window.addEventListener(ev, suppressEvent, { capture: true });
	dragInitDone = true;
}
tryInitDragHandlers();
document.addEventListener("DOMContentLoaded", tryInitDragHandlers, { once: true });
var dragEnvPolls = 0;
var dragEnvPoll = window.setInterval(() => {
	if (dragInitDone) {
		window.clearInterval(dragEnvPoll);
		return;
	}
	tryInitDragHandlers();
	if (++dragEnvPolls > 100) window.clearInterval(dragEnvPoll);
}, 50);
function suppressEvent(event) {
	if (dragging || resizing) {
		event.stopImmediatePropagation();
		event.stopPropagation();
		event.preventDefault();
	}
}
var MouseDown = 0;
var MouseUp = 1;
var MouseMove = 2;
function update(event) {
	let eventType, eventButtons = event.buttons;
	switch (event.type) {
		case "mousedown":
			eventType = MouseDown;
			if (!buttonsTracked) eventButtons = buttons | 1 << event.button;
			break;
		case "mouseup":
			eventType = MouseUp;
			if (!buttonsTracked) eventButtons = buttons & ~(1 << event.button);
			break;
		default:
			eventType = MouseMove;
			if (!buttonsTracked) eventButtons = buttons;
			break;
	}
	let released = buttons & ~eventButtons;
	let pressed = eventButtons & ~buttons;
	buttons = eventButtons;
	if (eventType === MouseDown && !(pressed & event.button)) {
		released |= 1 << event.button;
		pressed |= 1 << event.button;
	}
	if (eventType !== MouseMove && resizing || dragging && (eventType === MouseDown || event.button !== 0)) {
		event.stopImmediatePropagation();
		event.stopPropagation();
		event.preventDefault();
	}
	if (released & 1) primaryUp(event);
	if (pressed & 1) primaryDown(event);
	if (eventType === MouseMove) onMouseMove(event);
}
function primaryDown(event) {
	canDrag = false;
	canResize = false;
	if (!IsWindows()) {
		if (event.type === "mousedown" && event.button === 0 && event.detail !== 1) return;
	}
	if (resizeEdge) {
		canResize = true;
		return;
	}
	const target = eventTarget(event);
	const style = window.getComputedStyle(target);
	canDrag = style.getPropertyValue("--wails-draggable").trim() === "drag" && event.offsetX - parseFloat(style.paddingLeft) < target.clientWidth && event.offsetY - parseFloat(style.paddingTop) < target.clientHeight;
}
function primaryUp(event) {
	canDrag = false;
	dragging = false;
	canResize = false;
	resizing = false;
}
var cursorForEdge = Object.freeze({
	"se-resize": "nwse-resize",
	"sw-resize": "nesw-resize",
	"nw-resize": "nwse-resize",
	"ne-resize": "nesw-resize",
	"w-resize": "ew-resize",
	"n-resize": "ns-resize",
	"s-resize": "ns-resize",
	"e-resize": "ew-resize"
});
function setResize(edge) {
	if (edge) {
		if (!resizeEdge) defaultCursor = document.body.style.cursor;
		document.body.style.cursor = cursorForEdge[edge];
	} else if (!edge && resizeEdge) document.body.style.cursor = defaultCursor;
	resizeEdge = edge || "";
}
function onMouseMove(event) {
	if (canResize && resizeEdge) {
		resizing = true;
		invoke("wails:resize:" + resizeEdge);
	} else if (canDrag) {
		dragging = true;
		invoke("wails:drag");
	}
	if (dragging || resizing) {
		canDrag = canResize = false;
		return;
	}
	if (!resizable || !IsWindows()) {
		if (resizeEdge) setResize();
		return;
	}
	const resizeHandleHeight = GetFlag("system.resizeHandleHeight") || 5;
	const resizeHandleWidth = GetFlag("system.resizeHandleWidth") || 5;
	const cornerExtra = GetFlag("resizeCornerExtra") || 10;
	const rightBorder = window.outerWidth - event.clientX < resizeHandleWidth;
	const leftBorder = event.clientX < resizeHandleWidth;
	const topBorder = event.clientY < resizeHandleHeight;
	const bottomBorder = window.outerHeight - event.clientY < resizeHandleHeight;
	const rightCorner = window.outerWidth - event.clientX < resizeHandleWidth + cornerExtra;
	const leftCorner = event.clientX < resizeHandleWidth + cornerExtra;
	const topCorner = event.clientY < resizeHandleHeight + cornerExtra;
	const bottomCorner = window.outerHeight - event.clientY < resizeHandleHeight + cornerExtra;
	if (!leftCorner && !topCorner && !bottomCorner && !rightCorner) setResize();
	else if (rightCorner && bottomCorner) setResize("se-resize");
	else if (leftCorner && bottomCorner) setResize("sw-resize");
	else if (leftCorner && topCorner) setResize("nw-resize");
	else if (topCorner && rightCorner) setResize("ne-resize");
	else if (leftBorder) setResize("w-resize");
	else if (topBorder) setResize("n-resize");
	else if (bottomBorder) setResize("s-resize");
	else if (rightBorder) setResize("e-resize");
	else setResize();
}
//#endregion
//#region node_modules/@wailsio/runtime/dist/callable.js
var fnToStr = Function.prototype.toString;
var reflectApply = typeof Reflect === "object" && Reflect !== null && Reflect.apply;
var badArrayLike;
var isCallableMarker;
if (typeof reflectApply === "function" && typeof Object.defineProperty === "function") try {
	badArrayLike = Object.defineProperty({}, "length", { get: function() {
		throw isCallableMarker;
	} });
	isCallableMarker = {};
	reflectApply(function() {
		throw 42;
	}, null, badArrayLike);
} catch (_) {
	if (_ !== isCallableMarker) reflectApply = null;
}
else reflectApply = null;
var constructorRegex = /^\s*class\b/;
var isES6ClassFn = function isES6ClassFunction(value) {
	try {
		var fnStr = fnToStr.call(value);
		return constructorRegex.test(fnStr);
	} catch (e) {
		return false;
	}
};
var tryFunctionObject = function tryFunctionToStr(value) {
	try {
		if (isES6ClassFn(value)) return false;
		fnToStr.call(value);
		return true;
	} catch (e) {
		return false;
	}
};
var toStr = Object.prototype.toString;
var objectClass = "[object Object]";
var fnClass = "[object Function]";
var genClass = "[object GeneratorFunction]";
var ddaClass = "[object HTMLAllCollection]";
var ddaClass2 = "[object HTML document.all class]";
var ddaClass3 = "[object HTMLCollection]";
var hasToStringTag = typeof Symbol === "function" && !!Symbol.toStringTag;
var isIE68 = !(0 in [,]);
var isDDA = function isDocumentDotAll() {
	return false;
};
if (typeof document === "object") {
	var all = document.all;
	if (toStr.call(all) === toStr.call(document.all)) isDDA = function isDocumentDotAll(value) {
		if ((isIE68 || !value) && (typeof value === "undefined" || typeof value === "object")) try {
			var str = toStr.call(value);
			return (str === ddaClass || str === ddaClass2 || str === ddaClass3 || str === objectClass) && value("") == null;
		} catch (e) {}
		return false;
	};
}
function isCallableRefApply(value) {
	if (isDDA(value)) return true;
	if (!value) return false;
	if (typeof value !== "function" && typeof value !== "object") return false;
	try {
		reflectApply(value, null, badArrayLike);
	} catch (e) {
		if (e !== isCallableMarker) return false;
	}
	return !isES6ClassFn(value) && tryFunctionObject(value);
}
function isCallableNoRefApply(value) {
	if (isDDA(value)) return true;
	if (!value) return false;
	if (typeof value !== "function" && typeof value !== "object") return false;
	if (hasToStringTag) return tryFunctionObject(value);
	if (isES6ClassFn(value)) return false;
	var strClass = toStr.call(value);
	if (strClass !== fnClass && strClass !== genClass && !/^\[object HTML/.test(strClass)) return false;
	return tryFunctionObject(value);
}
var callable_default = reflectApply ? isCallableRefApply : isCallableNoRefApply;
//#endregion
//#region node_modules/@wailsio/runtime/dist/cancellable.js
var _a;
/**
* Exception class that will be used as rejection reason
* in case a {@link CancellablePromise} is cancelled successfully.
*
* The value of the {@link name} property is the string `"CancelError"`.
* The value of the {@link cause} property is the cause passed to the cancel method, if any.
*/
var CancelError = class extends Error {
	/**
	* Constructs a new `CancelError` instance.
	* @param message - The error message.
	* @param options - Options to be forwarded to the Error constructor.
	*/
	constructor(message, options) {
		super(message, options);
		this.name = "CancelError";
	}
};
/**
* Exception class that will be reported as an unhandled rejection
* in case a {@link CancellablePromise} rejects after being cancelled,
* or when the `oncancelled` callback throws or rejects.
*
* The value of the {@link name} property is the string `"CancelledRejectionError"`.
* The value of the {@link cause} property is the reason the promise rejected with.
*
* Because the original promise was cancelled,
* a wrapper promise will be passed to the unhandled rejection listener instead.
* The {@link promise} property holds a reference to the original promise.
*/
var CancelledRejectionError = class extends Error {
	/**
	* Constructs a new `CancelledRejectionError` instance.
	* @param promise - The promise that caused the error originally.
	* @param reason - The rejection reason.
	* @param info - An optional informative message specifying the circumstances in which the error was thrown.
	*               Defaults to the string `"Unhandled rejection in cancelled promise."`.
	*/
	constructor(promise, reason, info) {
		super((info !== null && info !== void 0 ? info : "Unhandled rejection in cancelled promise.") + " Reason: " + errorMessage(reason), { cause: reason });
		this.promise = promise;
		this.name = "CancelledRejectionError";
	}
};
var barrierSym = Symbol("barrier");
var cancelImplSym = Symbol("cancelImpl");
var species = (_a = Symbol.species) !== null && _a !== void 0 ? _a : Symbol("speciesPolyfill");
/**
* A promise with an attached method for cancelling long-running operations (see {@link CancellablePromise#cancel}).
* Cancellation can optionally be bound to an {@link AbortSignal}
* for better composability (see {@link CancellablePromise#cancelOn}).
*
* Cancelling a pending promise will result in an immediate rejection
* with an instance of {@link CancelError} as reason,
* but whoever started the promise will be responsible
* for actually aborting the underlying operation.
* To this purpose, the constructor and all chaining methods
* accept optional cancellation callbacks.
*
* If a `CancellablePromise` still resolves after having been cancelled,
* the result will be discarded. If it rejects, the reason
* will be reported as an unhandled rejection,
* wrapped in a {@link CancelledRejectionError} instance.
* To facilitate the handling of cancellation requests,
* cancelled `CancellablePromise`s will _not_ report unhandled `CancelError`s
* whose `cause` field is the same as the one with which the current promise was cancelled.
*
* All usual promise methods are defined and return a `CancellablePromise`
* whose cancel method will cancel the parent operation as well, propagating the cancellation reason
* upwards through promise chains.
* Conversely, cancelling a promise will not automatically cancel dependent promises downstream:
* ```ts
* let root = new CancellablePromise((resolve, reject) => { ... });
* let child1 = root.then(() => { ... });
* let child2 = child1.then(() => { ... });
* let child3 = root.catch(() => { ... });
* child1.cancel(); // Cancels child1 and root, but not child2 or child3
* ```
* Cancelling a promise that has already settled is safe and has no consequence.
*
* The `cancel` method returns a promise that _always fulfills_
* after the whole chain has processed the cancel request
* and all attached callbacks up to that moment have run.
*
* All ES2024 promise methods (static and instance) are defined on CancellablePromise,
* but actual availability may vary with OS/webview version.
*
* In line with the proposal at https://github.com/tc39/proposal-rm-builtin-subclassing,
* `CancellablePromise` does not support transparent subclassing.
* Extenders should take care to provide their own method implementations.
* This might be reconsidered in case the proposal is retired.
*
* CancellablePromise is a wrapper around the DOM Promise object
* and is compliant with the [Promises/A+ specification](https://promisesaplus.com/)
* (it passes the [compliance suite](https://github.com/promises-aplus/promises-tests))
* if so is the underlying implementation.
*/
var CancellablePromise = class CancellablePromise extends Promise {
	/**
	* Creates a new `CancellablePromise`.
	*
	* @param executor - A callback used to initialize the promise. This callback is passed two arguments:
	*                   a `resolve` callback used to resolve the promise with a value
	*                   or the result of another promise (possibly cancellable),
	*                   and a `reject` callback used to reject the promise with a provided reason or error.
	*                   If the value provided to the `resolve` callback is a thenable _and_ cancellable object
	*                   (it has a `then` _and_ a `cancel` method),
	*                   cancellation requests will be forwarded to that object and the oncancelled will not be invoked anymore.
	*                   If any one of the two callbacks is called _after_ the promise has been cancelled,
	*                   the provided values will be cancelled and resolved as usual,
	*                   but their results will be discarded.
	*                   However, if the resolution process ultimately ends up in a rejection
	*                   that is not due to cancellation, the rejection reason
	*                   will be wrapped in a {@link CancelledRejectionError}
	*                   and bubbled up as an unhandled rejection.
	* @param oncancelled - It is the caller's responsibility to ensure that any operation
	*                      started by the executor is properly halted upon cancellation.
	*                      This optional callback can be used to that purpose.
	*                      It will be called _synchronously_ with a cancellation cause
	*                      when cancellation is requested, _after_ the promise has already rejected
	*                      with a {@link CancelError}, but _before_
	*                      any {@link then}/{@link catch}/{@link finally} callback runs.
	*                      If the callback returns a thenable, the promise returned from {@link cancel}
	*                      will only fulfill after the former has settled.
	*                      Unhandled exceptions or rejections from the callback will be wrapped
	*                      in a {@link CancelledRejectionError} and bubbled up as unhandled rejections.
	*                      If the `resolve` callback is called before cancellation with a cancellable promise,
	*                      cancellation requests on this promise will be diverted to that promise,
	*                      and the original `oncancelled` callback will be discarded.
	*/
	constructor(executor, oncancelled) {
		let resolve;
		let reject;
		super((res, rej) => {
			resolve = res;
			reject = rej;
		});
		if (this.constructor[species] !== Promise) throw new TypeError("CancellablePromise does not support transparent subclassing. Please refrain from overriding the [Symbol.species] static property.");
		let promise = {
			promise: this,
			resolve,
			reject,
			get oncancelled() {
				return oncancelled !== null && oncancelled !== void 0 ? oncancelled : null;
			},
			set oncancelled(cb) {
				oncancelled = cb !== null && cb !== void 0 ? cb : void 0;
			}
		};
		const state = {
			get root() {
				return state;
			},
			resolving: false,
			settled: false
		};
		Object.defineProperties(this, {
			[barrierSym]: {
				configurable: false,
				enumerable: false,
				writable: true,
				value: null
			},
			[cancelImplSym]: {
				configurable: false,
				enumerable: false,
				writable: false,
				value: cancellerFor(promise, state)
			}
		});
		const rejector = rejectorFor(promise, state);
		try {
			executor(resolverFor(promise, state), rejector);
		} catch (err) {
			if (state.resolving) console.log("Unhandled exception in CancellablePromise executor.", err);
			else rejector(err);
		}
	}
	/**
	* Cancels immediately the execution of the operation associated with this promise.
	* The promise rejects with a {@link CancelError} instance as reason,
	* with the {@link CancelError#cause} property set to the given argument, if any.
	*
	* Has no effect if called after the promise has already settled;
	* repeated calls in particular are safe, but only the first one
	* will set the cancellation cause.
	*
	* The `CancelError` exception _need not_ be handled explicitly _on the promises that are being cancelled:_
	* cancelling a promise with no attached rejection handler does not trigger an unhandled rejection event.
	* Therefore, the following idioms are all equally correct:
	* ```ts
	* new CancellablePromise((resolve, reject) => { ... }).cancel();
	* new CancellablePromise((resolve, reject) => { ... }).then(...).cancel();
	* new CancellablePromise((resolve, reject) => { ... }).then(...).catch(...).cancel();
	* ```
	* Whenever some cancelled promise in a chain rejects with a `CancelError`
	* with the same cancellation cause as itself, the error will be discarded silently.
	* However, the `CancelError` _will still be delivered_ to all attached rejection handlers
	* added by {@link then} and related methods:
	* ```ts
	* let cancellable = new CancellablePromise((resolve, reject) => { ... });
	* cancellable.then(() => { ... }).catch(console.log);
	* cancellable.cancel(); // A CancelError is printed to the console.
	* ```
	* If the `CancelError` is not handled downstream by the time it reaches
	* a _non-cancelled_ promise, it _will_ trigger an unhandled rejection event,
	* just like normal rejections would:
	* ```ts
	* let cancellable = new CancellablePromise((resolve, reject) => { ... });
	* let chained = cancellable.then(() => { ... }).then(() => { ... }); // No catch...
	* cancellable.cancel(); // Unhandled rejection event on chained!
	* ```
	* Therefore, it is important to either cancel whole promise chains from their tail,
	* as shown in the correct idioms above, or take care of handling errors everywhere.
	*
	* @returns A cancellable promise that _fulfills_ after the cancel callback (if any)
	* and all handlers attached up to the call to cancel have run.
	* If the cancel callback returns a thenable, the promise returned by `cancel`
	* will also wait for that thenable to settle.
	* This enables callers to wait for the cancelled operation to terminate
	* without being forced to handle potential errors at the call site.
	* ```ts
	* cancellable.cancel().then(() => {
	*     // Cleanup finished, it's safe to do something else.
	* }, (err) => {
	*     // Unreachable: the promise returned from cancel will never reject.
	* });
	* ```
	* Note that the returned promise will _not_ handle implicitly any rejection
	* that might have occurred already in the cancelled chain.
	* It will just track whether registered handlers have been executed or not.
	* Therefore, unhandled rejections will never be silently handled by calling cancel.
	*/
	cancel(cause) {
		return new CancellablePromise((resolve) => {
			Promise.all([this[cancelImplSym](new CancelError("Promise cancelled.", { cause })), currentBarrier(this)]).then(() => resolve(), () => resolve());
		});
	}
	/**
	* Binds promise cancellation to the abort event of the given {@link AbortSignal}.
	* If the signal has already aborted, the promise will be cancelled immediately.
	* When either condition is verified, the cancellation cause will be set
	* to the signal's abort reason (see {@link AbortSignal#reason}).
	*
	* Has no effect if called (or if the signal aborts) _after_ the promise has already settled.
	* Only the first signal to abort will set the cancellation cause.
	*
	* For more details about the cancellation process,
	* see {@link cancel} and the `CancellablePromise` constructor.
	*
	* This method enables `await`ing cancellable promises without having
	* to store them for future cancellation, e.g.:
	* ```ts
	* await longRunningOperation().cancelOn(signal);
	* ```
	* instead of:
	* ```ts
	* let promiseToBeCancelled = longRunningOperation();
	* await promiseToBeCancelled;
	* ```
	*
	* @returns This promise, for method chaining.
	*/
	cancelOn(signal) {
		if (signal.aborted) this.cancel(signal.reason);
		else signal.addEventListener("abort", () => void this.cancel(signal.reason), { capture: true });
		return this;
	}
	/**
	* Attaches callbacks for the resolution and/or rejection of the `CancellablePromise`.
	*
	* The optional `oncancelled` argument will be invoked when the returned promise is cancelled,
	* with the same semantics as the `oncancelled` argument of the constructor.
	* When the parent promise rejects or is cancelled, the `onrejected` callback will run,
	* _even after the returned promise has been cancelled:_
	* in that case, should it reject or throw, the reason will be wrapped
	* in a {@link CancelledRejectionError} and bubbled up as an unhandled rejection.
	*
	* @param onfulfilled The callback to execute when the Promise is resolved.
	* @param onrejected The callback to execute when the Promise is rejected.
	* @returns A `CancellablePromise` for the completion of whichever callback is executed.
	* The returned promise is hooked up to propagate cancellation requests up the chain, but not down:
	*
	*   - if the parent promise is cancelled, the `onrejected` handler will be invoked with a `CancelError`
	*     and the returned promise _will resolve regularly_ with its result;
	*   - conversely, if the returned promise is cancelled, _the parent promise is cancelled too;_
	*     the `onrejected` handler will still be invoked with the parent's `CancelError`,
	*     but its result will be discarded
	*     and the returned promise will reject with a `CancelError` as well.
	*
	* The promise returned from {@link cancel} will fulfill only after all attached handlers
	* up the entire promise chain have been run.
	*
	* If either callback returns a cancellable promise,
	* cancellation requests will be diverted to it,
	* and the specified `oncancelled` callback will be discarded.
	*/
	then(onfulfilled, onrejected, oncancelled) {
		if (!(this instanceof CancellablePromise)) throw new TypeError("CancellablePromise.prototype.then called on an invalid object.");
		if (!callable_default(onfulfilled)) onfulfilled = identity;
		if (!callable_default(onrejected)) onrejected = thrower;
		if (onfulfilled === identity && onrejected == thrower) return new CancellablePromise((resolve) => resolve(this));
		const barrier = {};
		this[barrierSym] = barrier;
		return new CancellablePromise((resolve, reject) => {
			super.then((value) => {
				var _a;
				if (this[barrierSym] === barrier) this[barrierSym] = null;
				(_a = barrier.resolve) === null || _a === void 0 || _a.call(barrier);
				try {
					resolve(onfulfilled(value));
				} catch (err) {
					reject(err);
				}
			}, (reason) => {
				var _a;
				if (this[barrierSym] === barrier) this[barrierSym] = null;
				(_a = barrier.resolve) === null || _a === void 0 || _a.call(barrier);
				try {
					resolve(onrejected(reason));
				} catch (err) {
					reject(err);
				}
			});
		}, async (cause) => {
			try {
				return oncancelled === null || oncancelled === void 0 ? void 0 : oncancelled(cause);
			} finally {
				await this.cancel(cause);
			}
		});
	}
	/**
	* Attaches a callback for only the rejection of the Promise.
	*
	* The optional `oncancelled` argument will be invoked when the returned promise is cancelled,
	* with the same semantics as the `oncancelled` argument of the constructor.
	* When the parent promise rejects or is cancelled, the `onrejected` callback will run,
	* _even after the returned promise has been cancelled:_
	* in that case, should it reject or throw, the reason will be wrapped
	* in a {@link CancelledRejectionError} and bubbled up as an unhandled rejection.
	*
	* It is equivalent to
	* ```ts
	* cancellablePromise.then(undefined, onrejected, oncancelled);
	* ```
	* and the same caveats apply.
	*
	* @returns A Promise for the completion of the callback.
	* Cancellation requests on the returned promise
	* will propagate up the chain to the parent promise,
	* but not in the other direction.
	*
	* The promise returned from {@link cancel} will fulfill only after all attached handlers
	* up the entire promise chain have been run.
	*
	* If `onrejected` returns a cancellable promise,
	* cancellation requests will be diverted to it,
	* and the specified `oncancelled` callback will be discarded.
	* See {@link then} for more details.
	*/
	catch(onrejected, oncancelled) {
		return this.then(void 0, onrejected, oncancelled);
	}
	/**
	* Attaches a callback that is invoked when the CancellablePromise is settled (fulfilled or rejected). The
	* resolved value cannot be accessed or modified from the callback.
	* The returned promise will settle in the same state as the original one
	* after the provided callback has completed execution,
	* unless the callback throws or returns a rejecting promise,
	* in which case the returned promise will reject as well.
	*
	* The optional `oncancelled` argument will be invoked when the returned promise is cancelled,
	* with the same semantics as the `oncancelled` argument of the constructor.
	* Once the parent promise settles, the `onfinally` callback will run,
	* _even after the returned promise has been cancelled:_
	* in that case, should it reject or throw, the reason will be wrapped
	* in a {@link CancelledRejectionError} and bubbled up as an unhandled rejection.
	*
	* This method is implemented in terms of {@link then} and the same caveats apply.
	* It is polyfilled, hence available in every OS/webview version.
	*
	* @returns A Promise for the completion of the callback.
	* Cancellation requests on the returned promise
	* will propagate up the chain to the parent promise,
	* but not in the other direction.
	*
	* The promise returned from {@link cancel} will fulfill only after all attached handlers
	* up the entire promise chain have been run.
	*
	* If `onfinally` returns a cancellable promise,
	* cancellation requests will be diverted to it,
	* and the specified `oncancelled` callback will be discarded.
	* See {@link then} for more details.
	*/
	finally(onfinally, oncancelled) {
		if (!(this instanceof CancellablePromise)) throw new TypeError("CancellablePromise.prototype.finally called on an invalid object.");
		if (!callable_default(onfinally)) return this.then(onfinally, onfinally, oncancelled);
		return this.then((value) => CancellablePromise.resolve(onfinally()).then(() => value), (reason) => CancellablePromise.resolve(onfinally()).then(() => {
			throw reason;
		}), oncancelled);
	}
	/**
	* We use the `[Symbol.species]` static property, if available,
	* to disable the built-in automatic subclassing features from {@link Promise}.
	* It is critical for performance reasons that extenders do not override this.
	* Once the proposal at https://github.com/tc39/proposal-rm-builtin-subclassing
	* is either accepted or retired, this implementation will have to be revised accordingly.
	*
	* @ignore
	* @internal
	*/
	static get [species]() {
		return Promise;
	}
	static all(values) {
		let collected = Array.from(values);
		const promise = collected.length === 0 ? CancellablePromise.resolve(collected) : new CancellablePromise((resolve, reject) => {
			Promise.all(collected).then(resolve, reject);
		}, (cause) => cancelAll(promise, collected, cause));
		return promise;
	}
	static allSettled(values) {
		let collected = Array.from(values);
		const promise = collected.length === 0 ? CancellablePromise.resolve(collected) : new CancellablePromise((resolve, reject) => {
			Promise.allSettled(collected).then(resolve, reject);
		}, (cause) => cancelAll(promise, collected, cause));
		return promise;
	}
	static any(values) {
		let collected = Array.from(values);
		const promise = collected.length === 0 ? CancellablePromise.resolve(collected) : new CancellablePromise((resolve, reject) => {
			Promise.any(collected).then(resolve, reject);
		}, (cause) => cancelAll(promise, collected, cause));
		return promise;
	}
	static race(values) {
		let collected = Array.from(values);
		const promise = new CancellablePromise((resolve, reject) => {
			Promise.race(collected).then(resolve, reject);
		}, (cause) => cancelAll(promise, collected, cause));
		return promise;
	}
	/**
	* Creates a new cancelled CancellablePromise for the provided cause.
	*
	* @group Static Methods
	*/
	static cancel(cause) {
		const p = new CancellablePromise(() => {});
		p.cancel(cause);
		return p;
	}
	/**
	* Creates a new CancellablePromise that cancels
	* after the specified timeout, with the provided cause.
	*
	* If the {@link AbortSignal.timeout} factory method is available,
	* it is used to base the timeout on _active_ time rather than _elapsed_ time.
	* Otherwise, `timeout` falls back to {@link setTimeout}.
	*
	* @group Static Methods
	*/
	static timeout(milliseconds, cause) {
		const promise = new CancellablePromise(() => {});
		if (AbortSignal && typeof AbortSignal === "function" && AbortSignal.timeout && typeof AbortSignal.timeout === "function") AbortSignal.timeout(milliseconds).addEventListener("abort", () => void promise.cancel(cause));
		else setTimeout(() => void promise.cancel(cause), milliseconds);
		return promise;
	}
	static sleep(milliseconds, value) {
		return new CancellablePromise((resolve) => {
			setTimeout(() => resolve(value), milliseconds);
		});
	}
	/**
	* Creates a new rejected CancellablePromise for the provided reason.
	*
	* @group Static Methods
	*/
	static reject(reason) {
		return new CancellablePromise((_, reject) => reject(reason));
	}
	static resolve(value) {
		if (value instanceof CancellablePromise) return value;
		return new CancellablePromise((resolve) => resolve(value));
	}
	/**
	* Creates a new CancellablePromise and returns it in an object, along with its resolve and reject functions
	* and a getter/setter for the cancellation callback.
	*
	* This method is polyfilled, hence available in every OS/webview version.
	*
	* @group Static Methods
	*/
	static withResolvers() {
		let result = { oncancelled: null };
		result.promise = new CancellablePromise((resolve, reject) => {
			result.resolve = resolve;
			result.reject = reject;
		}, (cause) => {
			var _a;
			(_a = result.oncancelled) === null || _a === void 0 || _a.call(result, cause);
		});
		return result;
	}
};
/**
* Returns a callback that implements the cancellation algorithm for the given cancellable promise.
* The promise returned from the resulting function does not reject.
*/
function cancellerFor(promise, state) {
	let cancellationPromise = void 0;
	return (reason) => {
		if (!state.settled) {
			state.settled = true;
			state.reason = reason;
			promise.reject(reason);
			Promise.prototype.then.call(promise.promise, void 0, (err) => {
				if (err !== reason) throw err;
			});
		}
		if (!state.reason || !promise.oncancelled) return;
		cancellationPromise = new Promise((resolve) => {
			try {
				resolve(promise.oncancelled(state.reason.cause));
			} catch (err) {
				Promise.reject(new CancelledRejectionError(promise.promise, err, "Unhandled exception in oncancelled callback."));
			}
		}).catch((reason) => {
			Promise.reject(new CancelledRejectionError(promise.promise, reason, "Unhandled rejection in oncancelled callback."));
		});
		promise.oncancelled = null;
		return cancellationPromise;
	};
}
/**
* Returns a callback that implements the resolution algorithm for the given cancellable promise.
*/
function resolverFor(promise, state) {
	return (value) => {
		if (state.resolving) return;
		state.resolving = true;
		if (value === promise.promise) {
			if (state.settled) return;
			state.settled = true;
			promise.reject(/* @__PURE__ */ new TypeError("A promise cannot be resolved with itself."));
			return;
		}
		if (value != null && (typeof value === "object" || typeof value === "function")) {
			let then;
			try {
				then = value.then;
			} catch (err) {
				state.settled = true;
				promise.reject(err);
				return;
			}
			if (callable_default(then)) {
				try {
					let cancel = value.cancel;
					if (callable_default(cancel)) {
						const oncancelled = (cause) => {
							Reflect.apply(cancel, value, [cause]);
						};
						if (state.reason) cancellerFor(Object.assign(Object.assign({}, promise), { oncancelled }), state)(state.reason);
						else promise.oncancelled = oncancelled;
					}
				} catch (_a) {}
				const newState = {
					root: state.root,
					resolving: false,
					get settled() {
						return this.root.settled;
					},
					set settled(value) {
						this.root.settled = value;
					},
					get reason() {
						return this.root.reason;
					}
				};
				const rejector = rejectorFor(promise, newState);
				try {
					Reflect.apply(then, value, [resolverFor(promise, newState), rejector]);
				} catch (err) {
					rejector(err);
				}
				return;
			}
		}
		if (state.settled) return;
		state.settled = true;
		promise.resolve(value);
	};
}
/**
* Returns a callback that implements the rejection algorithm for the given cancellable promise.
*/
function rejectorFor(promise, state) {
	return (reason) => {
		if (state.resolving) return;
		state.resolving = true;
		if (state.settled) {
			try {
				if (reason instanceof CancelError && state.reason instanceof CancelError && Object.is(reason.cause, state.reason.cause)) return;
			} catch (_a) {}
			Promise.reject(new CancelledRejectionError(promise.promise, reason));
		} else {
			state.settled = true;
			promise.reject(reason);
		}
	};
}
/**
* Cancels all values in an array that look like cancellable thenables.
* Returns a promise that fulfills once all cancellation procedures for the given values have settled.
*/
function cancelAll(parent, values, cause) {
	const results = [];
	for (const value of values) {
		let cancel;
		try {
			if (!callable_default(value.then)) continue;
			cancel = value.cancel;
			if (!callable_default(cancel)) continue;
		} catch (_a) {
			continue;
		}
		let result;
		try {
			result = Reflect.apply(cancel, value, [cause]);
		} catch (err) {
			Promise.reject(new CancelledRejectionError(parent, err, "Unhandled exception in cancel method."));
			continue;
		}
		if (!result) continue;
		results.push((result instanceof Promise ? result : Promise.resolve(result)).catch((reason) => {
			Promise.reject(new CancelledRejectionError(parent, reason, "Unhandled rejection in cancel method."));
		}));
	}
	return Promise.all(results);
}
/**
* Returns its argument.
*/
function identity(x) {
	return x;
}
/**
* Throws its argument.
*/
function thrower(reason) {
	throw reason;
}
/**
* Attempts various strategies to convert an error to a string.
*/
function errorMessage(err) {
	try {
		if (err instanceof Error || typeof err !== "object" || err.toString !== Object.prototype.toString) return "" + err;
	} catch (_a) {}
	try {
		return JSON.stringify(err);
	} catch (_b) {}
	try {
		return Object.prototype.toString.call(err);
	} catch (_c) {}
	return "<could not convert error to string>";
}
/**
* Gets the current barrier promise for the given cancellable promise. If necessary, initialises the barrier.
*/
function currentBarrier(promise) {
	var _a;
	let pwr = (_a = promise[barrierSym]) !== null && _a !== void 0 ? _a : {};
	if (!("promise" in pwr)) Object.assign(pwr, promiseWithResolvers());
	if (promise[barrierSym] == null) {
		pwr.resolve();
		promise[barrierSym] = pwr;
	}
	return pwr.promise;
}
var promiseWithResolvers = Promise.withResolvers;
if (promiseWithResolvers && typeof promiseWithResolvers === "function") promiseWithResolvers = promiseWithResolvers.bind(Promise);
else promiseWithResolvers = function() {
	let resolve;
	let reject;
	return {
		promise: new Promise((res, rej) => {
			resolve = res;
			reject = rej;
		}),
		resolve,
		reject
	};
};
//#endregion
//#region node_modules/@wailsio/runtime/dist/calls.js
window._wails = window._wails || {};
var call$1 = newRuntimeCaller(objectNames.Call);
var cancelCall = newRuntimeCaller(objectNames.CancelCall);
var callResponses = /* @__PURE__ */ new Map();
var CallBinding = 0;
var CancelMethod = 0;
/**
* Generates a unique ID using the nanoid library.
*
* @returns A unique ID that does not exist in the callResponses set.
*/
function generateID() {
	let result;
	do
		result = nanoid();
	while (callResponses.has(result));
	return result;
}
/**
* Call a bound method according to the given call options.
*
* In case of failure, the returned promise will reject with an exception
* among ReferenceError (unknown method), TypeError (wrong argument count or type),
* {@link RuntimeError} (method returned an error), or other (network or internal errors).
* The exception might have a "cause" field with the value returned
* by the application- or service-level error marshaling functions.
*
* @param options - A method call descriptor.
* @returns The result of the call.
*/
function Call(options) {
	const id = generateID();
	const result = CancellablePromise.withResolvers();
	callResponses.set(id, {
		resolve: result.resolve,
		reject: result.reject
	});
	const request = call$1(CallBinding, Object.assign({ "call-id": id }, options));
	let running = true;
	request.then((res) => {
		running = false;
		callResponses.delete(id);
		result.resolve(res);
	}, (err) => {
		running = false;
		callResponses.delete(id);
		result.reject(err);
	});
	const cancel = () => {
		callResponses.delete(id);
		return cancelCall(CancelMethod, { "call-id": id }).catch((err) => {
			console.error("Error while requesting binding call cancellation:", err);
		});
	};
	result.oncancelled = () => {
		if (running) return cancel();
		else return request.then(cancel);
	};
	return result.promise;
}
/**
* Calls a method by its numeric ID with the specified arguments.
* See {@link Call} for details.
*
* @param methodID - The ID of the method to call.
* @param args - The arguments to pass to the method.
* @return The result of the method call.
*/
function ByID(methodID, ...args) {
	return Call({
		methodID,
		args
	});
}
//#endregion
//#region node_modules/@wailsio/runtime/dist/create.js
/**
* Any is a dummy creation function for simple or unknown types.
*/
function Any(source) {
	return source;
}
/**
* Array takes a creation function for an arbitrary type
* and returns an in-place creation function for an array
* whose elements are of that type.
*/
function Array$1(element) {
	if (element === Any) return (source) => source === null ? [] : source;
	return (source) => {
		if (source === null) return [];
		for (let i = 0; i < source.length; i++) source[i] = element(source[i]);
		return source;
	};
}
/**
* Maps known event names to creation functions for their data types.
* Will be monkey-patched by the binding generator.
*/
var Events = {};
//#endregion
//#region bindings/github.com/wailsapp/wails/v3/internal/eventcreate.js
Object.freeze(Events);
//#endregion
//#region node_modules/@wailsio/runtime/dist/listener.js
var eventListeners = /* @__PURE__ */ new Map();
var Listener = class {
	constructor(eventName, callback, maxCallbacks) {
		this.eventName = eventName;
		this.callback = callback;
		this.maxCallbacks = maxCallbacks || -1;
	}
	dispatch(data) {
		try {
			this.callback(data);
		} catch (err) {
			console.error(err);
		}
		if (this.maxCallbacks === -1) return false;
		this.maxCallbacks -= 1;
		return this.maxCallbacks === 0;
	}
};
function listenerOff(listener) {
	let listeners = eventListeners.get(listener.eventName);
	if (!listeners) return;
	listeners = listeners.filter((l) => l !== listener);
	if (listeners.length === 0) eventListeners.delete(listener.eventName);
	else eventListeners.set(listener.eventName, listeners);
}
//#endregion
//#region node_modules/@wailsio/runtime/dist/events.js
window._wails = window._wails || {};
window._wails.dispatchWailsEvent = dispatchWailsEvent;
objectNames.Events;
/**
* Represents a system event or a custom event emitted through wails-provided facilities.
*/
var WailsEvent = class {
	constructor(name, data) {
		this.name = name;
		this.data = data !== null && data !== void 0 ? data : null;
	}
};
function dispatchWailsEvent(event) {
	let listeners = eventListeners.get(event.name);
	if (!listeners) return;
	let wailsEvent = new WailsEvent(event.name, event.name in Events ? Events[event.name](event.data) : event.data);
	if ("sender" in event) wailsEvent.sender = event.sender;
	listeners = listeners.filter((listener) => !listener.dispatch(wailsEvent));
	if (listeners.length === 0) eventListeners.delete(event.name);
	else eventListeners.set(event.name, listeners);
}
/**
* Register a callback function to be called multiple times for a specific event.
*
* @param eventName - The name of the event to register the callback for.
* @param callback - The callback function to be called when the event is triggered.
* @param maxCallbacks - The maximum number of times the callback can be called for the event. Once the maximum number is reached, the callback will no longer be called.
* @returns A function that, when called, will unregister the callback from the event.
*/
function OnMultiple(eventName, callback, maxCallbacks) {
	let listeners = eventListeners.get(eventName) || [];
	const thisListener = new Listener(eventName, callback, maxCallbacks);
	listeners.push(thisListener);
	eventListeners.set(eventName, listeners);
	return () => listenerOff(thisListener);
}
/**
* Registers a callback function to be executed when the specified event occurs.
*
* @param eventName - The name of the event to register the callback for.
* @param callback - The callback function to be called when the event is triggered.
* @returns A function that, when called, will unregister the callback from the event.
*/
function On(eventName, callback) {
	return OnMultiple(eventName, callback, -1);
}
//#endregion
//#region node_modules/@wailsio/runtime/dist/window.js
var DROP_TARGET_ATTRIBUTE = "data-file-drop-target";
var DROP_TARGET_ACTIVE_CLASS = "file-drop-target-active";
var currentDropTarget = null;
var PositionMethod = 0;
var CenterMethod = 1;
var CloseMethod = 2;
var DisableSizeConstraintsMethod = 3;
var EnableSizeConstraintsMethod = 4;
var FocusMethod = 5;
var ForceReloadMethod = 6;
var FullscreenMethod = 7;
var GetScreenMethod = 8;
var GetZoomMethod = 9;
var HeightMethod = 10;
var HideMethod = 11;
var IsFocusedMethod = 12;
var IsFullscreenMethod = 13;
var IsMaximisedMethod = 14;
var IsMinimisedMethod = 15;
var MaximiseMethod = 16;
var MinimiseMethod = 17;
var NameMethod = 18;
var OpenDevToolsMethod = 19;
var RelativePositionMethod = 20;
var ReloadMethod = 21;
var ResizableMethod = 22;
var RestoreMethod = 23;
var SetPositionMethod = 24;
var SetAlwaysOnTopMethod = 25;
var SetBackgroundColourMethod = 26;
var SetFramelessMethod = 27;
var SetFullscreenButtonEnabledMethod = 28;
var SetMaxSizeMethod = 29;
var SetMinSizeMethod = 30;
var SetRelativePositionMethod = 31;
var SetResizableMethod = 32;
var SetSizeMethod = 33;
var SetTitleMethod = 34;
var SetZoomMethod = 35;
var ShowMethod = 36;
var SizeMethod = 37;
var ToggleFullscreenMethod = 38;
var ToggleMaximiseMethod = 39;
var ToggleFramelessMethod = 40;
var UnFullscreenMethod = 41;
var UnMaximiseMethod = 42;
var UnMinimiseMethod = 43;
var WidthMethod = 44;
var ZoomMethod = 45;
var ZoomInMethod = 46;
var ZoomOutMethod = 47;
var ZoomResetMethod = 48;
var SnapAssistMethod = 49;
var FilesDropped = 50;
var PrintMethod = 51;
/**
* Finds the nearest drop target element by walking up the DOM tree.
*/
function getDropTargetElement(element) {
	if (!element) return null;
	return element.closest(`[${DROP_TARGET_ATTRIBUTE}]`);
}
/**
* Check if we can use WebView2's postMessageWithAdditionalObjects (Windows)
* Also checks that EnableFileDrop is true for this window.
*/
function canResolveFilePaths() {
	var _a, _b, _c, _d;
	if (((_b = (_a = window.chrome) === null || _a === void 0 ? void 0 : _a.webview) === null || _b === void 0 ? void 0 : _b.postMessageWithAdditionalObjects) == null) return false;
	return ((_d = (_c = window._wails) === null || _c === void 0 ? void 0 : _c.flags) === null || _d === void 0 ? void 0 : _d.enableFileDrop) === true;
}
/**
* Send file drop to backend via WebView2 (Windows only)
*/
function resolveFilePaths(x, y, files) {
	var _a, _b;
	if ((_b = (_a = window.chrome) === null || _a === void 0 ? void 0 : _a.webview) === null || _b === void 0 ? void 0 : _b.postMessageWithAdditionalObjects) window.chrome.webview.postMessageWithAdditionalObjects(`file:drop:${x}:${y}`, files);
}
var nativeDragActive = false;
/**
* Cleans up native drag state and hover effects.
* Called on drop or when drag leaves the window.
*/
function cleanupNativeDrag() {
	nativeDragActive = false;
	if (currentDropTarget) {
		currentDropTarget.classList.remove(DROP_TARGET_ACTIVE_CLASS);
		currentDropTarget = null;
	}
}
/**
* Called from Go when a file drag enters the window on Linux/macOS.
*/
function handleDragEnter() {
	var _a, _b;
	if (((_b = (_a = window._wails) === null || _a === void 0 ? void 0 : _a.flags) === null || _b === void 0 ? void 0 : _b.enableFileDrop) === false) return;
	nativeDragActive = true;
}
/**
* Called from Go when a file drag leaves the window on Linux/macOS.
*/
function handleDragLeave() {
	cleanupNativeDrag();
}
/**
* Called from Go during file drag to update hover state on Linux/macOS.
* @param x - X coordinate in CSS pixels
* @param y - Y coordinate in CSS pixels
*/
function handleDragOver(x, y) {
	var _a, _b;
	if (!nativeDragActive) return;
	if (((_b = (_a = window._wails) === null || _a === void 0 ? void 0 : _a.flags) === null || _b === void 0 ? void 0 : _b.enableFileDrop) === false) return;
	const dropTarget = getDropTargetElement(document.elementFromPoint(x, y));
	if (currentDropTarget && currentDropTarget !== dropTarget) currentDropTarget.classList.remove(DROP_TARGET_ACTIVE_CLASS);
	if (dropTarget) {
		dropTarget.classList.add(DROP_TARGET_ACTIVE_CLASS);
		currentDropTarget = dropTarget;
	} else currentDropTarget = null;
}
var callerSym = Symbol("caller");
/**
* The window within which the script is running.
*/
var thisWindow = new class Window {
	/**
	* Initialises a window object with the specified name.
	*
	* @private
	* @param name - The name of the target window.
	*/
	constructor(name = "") {
		this[callerSym] = newRuntimeCaller(objectNames.Window, name);
		for (const method of Object.getOwnPropertyNames(Window.prototype)) if (method !== "constructor" && typeof this[method] === "function") this[method] = this[method].bind(this);
	}
	/**
	* Gets the specified window.
	*
	* @param name - The name of the window to get.
	* @returns The corresponding window object.
	*/
	Get(name) {
		return new Window(name);
	}
	/**
	* Returns the absolute position of the window.
	*
	* @returns The current absolute position of the window.
	*/
	Position() {
		return this[callerSym](PositionMethod);
	}
	/**
	* Centers the window on the screen.
	*/
	Center() {
		return this[callerSym](CenterMethod);
	}
	/**
	* Closes the window.
	*/
	Close() {
		return this[callerSym](CloseMethod);
	}
	/**
	* Disables min/max size constraints.
	*/
	DisableSizeConstraints() {
		return this[callerSym](DisableSizeConstraintsMethod);
	}
	/**
	* Enables min/max size constraints.
	*/
	EnableSizeConstraints() {
		return this[callerSym](EnableSizeConstraintsMethod);
	}
	/**
	* Focuses the window.
	*/
	Focus() {
		return this[callerSym](FocusMethod);
	}
	/**
	* Forces the window to reload the page assets.
	*/
	ForceReload() {
		return this[callerSym](ForceReloadMethod);
	}
	/**
	* Switches the window to fullscreen mode.
	*/
	Fullscreen() {
		return this[callerSym](FullscreenMethod);
	}
	/**
	* Returns the screen that the window is on.
	*
	* @returns The screen the window is currently on.
	*/
	GetScreen() {
		return this[callerSym](GetScreenMethod);
	}
	/**
	* Returns the current zoom level of the window.
	*
	* @returns The current zoom level.
	*/
	GetZoom() {
		return this[callerSym](GetZoomMethod);
	}
	/**
	* Returns the height of the window.
	*
	* @returns The current height of the window.
	*/
	Height() {
		return this[callerSym](HeightMethod);
	}
	/**
	* Hides the window.
	*/
	Hide() {
		return this[callerSym](HideMethod);
	}
	/**
	* Returns true if the window is focused.
	*
	* @returns Whether the window is currently focused.
	*/
	IsFocused() {
		return this[callerSym](IsFocusedMethod);
	}
	/**
	* Returns true if the window is fullscreen.
	*
	* @returns Whether the window is currently fullscreen.
	*/
	IsFullscreen() {
		return this[callerSym](IsFullscreenMethod);
	}
	/**
	* Returns true if the window is maximised.
	*
	* @returns Whether the window is currently maximised.
	*/
	IsMaximised() {
		return this[callerSym](IsMaximisedMethod);
	}
	/**
	* Returns true if the window is minimised.
	*
	* @returns Whether the window is currently minimised.
	*/
	IsMinimised() {
		return this[callerSym](IsMinimisedMethod);
	}
	/**
	* Maximises the window.
	*/
	Maximise() {
		return this[callerSym](MaximiseMethod);
	}
	/**
	* Minimises the window.
	*/
	Minimise() {
		return this[callerSym](MinimiseMethod);
	}
	/**
	* Returns the name of the window.
	*
	* @returns The name of the window.
	*/
	Name() {
		return this[callerSym](NameMethod);
	}
	/**
	* Opens the development tools pane.
	*/
	OpenDevTools() {
		return this[callerSym](OpenDevToolsMethod);
	}
	/**
	* Returns the relative position of the window to the screen.
	*
	* @returns The current relative position of the window.
	*/
	RelativePosition() {
		return this[callerSym](RelativePositionMethod);
	}
	/**
	* Reloads the page assets.
	*/
	Reload() {
		return this[callerSym](ReloadMethod);
	}
	/**
	* Returns true if the window is resizable.
	*
	* @returns Whether the window is currently resizable.
	*/
	Resizable() {
		return this[callerSym](ResizableMethod);
	}
	/**
	* Restores the window to its previous state if it was previously minimised, maximised or fullscreen.
	*/
	Restore() {
		return this[callerSym](RestoreMethod);
	}
	/**
	* Sets the absolute position of the window.
	*
	* @param x - The desired horizontal absolute position of the window.
	* @param y - The desired vertical absolute position of the window.
	*/
	SetPosition(x, y) {
		return this[callerSym](SetPositionMethod, {
			x,
			y
		});
	}
	/**
	* Sets the window to be always on top.
	*
	* @param alwaysOnTop - Whether the window should stay on top.
	*/
	SetAlwaysOnTop(alwaysOnTop) {
		return this[callerSym](SetAlwaysOnTopMethod, { alwaysOnTop });
	}
	/**
	* Sets the background colour of the window.
	*
	* @param r - The desired red component of the window background.
	* @param g - The desired green component of the window background.
	* @param b - The desired blue component of the window background.
	* @param a - The desired alpha component of the window background.
	*/
	SetBackgroundColour(r, g, b, a) {
		return this[callerSym](SetBackgroundColourMethod, {
			r,
			g,
			b,
			a
		});
	}
	/**
	* Removes the window frame and title bar.
	*
	* @param frameless - Whether the window should be frameless.
	*/
	SetFrameless(frameless) {
		return this[callerSym](SetFramelessMethod, { frameless });
	}
	/**
	* Disables the system fullscreen button.
	*
	* @param enabled - Whether the fullscreen button should be enabled.
	*/
	SetFullscreenButtonEnabled(enabled) {
		return this[callerSym](SetFullscreenButtonEnabledMethod, { enabled });
	}
	/**
	* Sets the maximum size of the window.
	*
	* @param width - The desired maximum width of the window.
	* @param height - The desired maximum height of the window.
	*/
	SetMaxSize(width, height) {
		return this[callerSym](SetMaxSizeMethod, {
			width,
			height
		});
	}
	/**
	* Sets the minimum size of the window.
	*
	* @param width - The desired minimum width of the window.
	* @param height - The desired minimum height of the window.
	*/
	SetMinSize(width, height) {
		return this[callerSym](SetMinSizeMethod, {
			width,
			height
		});
	}
	/**
	* Sets the relative position of the window to the screen.
	*
	* @param x - The desired horizontal relative position of the window.
	* @param y - The desired vertical relative position of the window.
	*/
	SetRelativePosition(x, y) {
		return this[callerSym](SetRelativePositionMethod, {
			x,
			y
		});
	}
	/**
	* Sets whether the window is resizable.
	*
	* @param resizable - Whether the window should be resizable.
	*/
	SetResizable(resizable) {
		return this[callerSym](SetResizableMethod, { resizable });
	}
	/**
	* Sets the size of the window.
	*
	* @param width - The desired width of the window.
	* @param height - The desired height of the window.
	*/
	SetSize(width, height) {
		return this[callerSym](SetSizeMethod, {
			width,
			height
		});
	}
	/**
	* Sets the title of the window.
	*
	* @param title - The desired title of the window.
	*/
	SetTitle(title) {
		return this[callerSym](SetTitleMethod, { title });
	}
	/**
	* Sets the zoom level of the window.
	*
	* @param zoom - The desired zoom level.
	*/
	SetZoom(zoom) {
		return this[callerSym](SetZoomMethod, { zoom });
	}
	/**
	* Shows the window.
	*/
	Show() {
		return this[callerSym](ShowMethod);
	}
	/**
	* Returns the size of the window.
	*
	* @returns The current size of the window.
	*/
	Size() {
		return this[callerSym](SizeMethod);
	}
	/**
	* Toggles the window between fullscreen and normal.
	*/
	ToggleFullscreen() {
		return this[callerSym](ToggleFullscreenMethod);
	}
	/**
	* Toggles the window between maximised and normal.
	*/
	ToggleMaximise() {
		return this[callerSym](ToggleMaximiseMethod);
	}
	/**
	* Toggles the window between frameless and normal.
	*/
	ToggleFrameless() {
		return this[callerSym](ToggleFramelessMethod);
	}
	/**
	* Un-fullscreens the window.
	*/
	UnFullscreen() {
		return this[callerSym](UnFullscreenMethod);
	}
	/**
	* Un-maximises the window.
	*/
	UnMaximise() {
		return this[callerSym](UnMaximiseMethod);
	}
	/**
	* Un-minimises the window.
	*/
	UnMinimise() {
		return this[callerSym](UnMinimiseMethod);
	}
	/**
	* Returns the width of the window.
	*
	* @returns The current width of the window.
	*/
	Width() {
		return this[callerSym](WidthMethod);
	}
	/**
	* Zooms the window.
	*/
	Zoom() {
		return this[callerSym](ZoomMethod);
	}
	/**
	* Increases the zoom level of the webview content.
	*/
	ZoomIn() {
		return this[callerSym](ZoomInMethod);
	}
	/**
	* Decreases the zoom level of the webview content.
	*/
	ZoomOut() {
		return this[callerSym](ZoomOutMethod);
	}
	/**
	* Resets the zoom level of the webview content.
	*/
	ZoomReset() {
		return this[callerSym](ZoomResetMethod);
	}
	/**
	* Handles file drops originating from platform-specific code (e.g., macOS/Linux native drag-and-drop).
	* Gathers information about the drop target element and sends it back to the Go backend.
	*
	* @param filenames - An array of file paths (strings) that were dropped.
	* @param x - The x-coordinate of the drop event (CSS pixels).
	* @param y - The y-coordinate of the drop event (CSS pixels).
	*/
	HandlePlatformFileDrop(filenames, x, y) {
		var _a, _b;
		if (((_b = (_a = window._wails) === null || _a === void 0 ? void 0 : _a.flags) === null || _b === void 0 ? void 0 : _b.enableFileDrop) === false) return;
		const dropTarget = getDropTargetElement(document.elementFromPoint(x, y));
		if (!dropTarget) return;
		const elementDetails = {
			id: dropTarget.id,
			classList: Array.from(dropTarget.classList),
			attributes: {}
		};
		for (let i = 0; i < dropTarget.attributes.length; i++) {
			const attr = dropTarget.attributes[i];
			elementDetails.attributes[attr.name] = attr.value;
		}
		const payload = {
			filenames,
			x,
			y,
			elementDetails
		};
		this[callerSym](FilesDropped, payload);
		cleanupNativeDrag();
	}
	SnapAssist() {
		return this[callerSym](SnapAssistMethod);
	}
	/**
	* Opens the print dialog for the window.
	*/
	Print() {
		return this[callerSym](PrintMethod);
	}
}("");
/**
* Sets up global drag and drop event listeners for file drops.
* Handles visual feedback (hover state) and file drop processing.
*/
function setupDropTargetListeners() {
	const docElement = document.documentElement;
	let dragEnterCounter = 0;
	docElement.addEventListener("dragenter", (event) => {
		var _a, _b, _c;
		if (!((_a = event.dataTransfer) === null || _a === void 0 ? void 0 : _a.types.includes("Files"))) return;
		event.preventDefault();
		if (((_c = (_b = window._wails) === null || _b === void 0 ? void 0 : _b.flags) === null || _c === void 0 ? void 0 : _c.enableFileDrop) === false) {
			event.dataTransfer.dropEffect = "none";
			return;
		}
		dragEnterCounter++;
		const dropTarget = getDropTargetElement(document.elementFromPoint(event.clientX, event.clientY));
		if (currentDropTarget && currentDropTarget !== dropTarget) currentDropTarget.classList.remove(DROP_TARGET_ACTIVE_CLASS);
		if (dropTarget) {
			dropTarget.classList.add(DROP_TARGET_ACTIVE_CLASS);
			event.dataTransfer.dropEffect = "copy";
			currentDropTarget = dropTarget;
		} else {
			event.dataTransfer.dropEffect = "none";
			currentDropTarget = null;
		}
	}, false);
	docElement.addEventListener("dragover", (event) => {
		var _a, _b, _c;
		if (!((_a = event.dataTransfer) === null || _a === void 0 ? void 0 : _a.types.includes("Files"))) return;
		event.preventDefault();
		if (((_c = (_b = window._wails) === null || _b === void 0 ? void 0 : _b.flags) === null || _c === void 0 ? void 0 : _c.enableFileDrop) === false) {
			event.dataTransfer.dropEffect = "none";
			return;
		}
		const dropTarget = getDropTargetElement(document.elementFromPoint(event.clientX, event.clientY));
		if (currentDropTarget && currentDropTarget !== dropTarget) currentDropTarget.classList.remove(DROP_TARGET_ACTIVE_CLASS);
		if (dropTarget) {
			if (!dropTarget.classList.contains(DROP_TARGET_ACTIVE_CLASS)) dropTarget.classList.add(DROP_TARGET_ACTIVE_CLASS);
			event.dataTransfer.dropEffect = "copy";
			currentDropTarget = dropTarget;
		} else {
			event.dataTransfer.dropEffect = "none";
			currentDropTarget = null;
		}
	}, false);
	docElement.addEventListener("dragleave", (event) => {
		var _a, _b, _c;
		if (!((_a = event.dataTransfer) === null || _a === void 0 ? void 0 : _a.types.includes("Files"))) return;
		event.preventDefault();
		if (((_c = (_b = window._wails) === null || _b === void 0 ? void 0 : _b.flags) === null || _c === void 0 ? void 0 : _c.enableFileDrop) === false) return;
		if (event.relatedTarget === null) return;
		dragEnterCounter--;
		if (dragEnterCounter === 0 || currentDropTarget && !currentDropTarget.contains(event.relatedTarget)) {
			if (currentDropTarget) {
				currentDropTarget.classList.remove(DROP_TARGET_ACTIVE_CLASS);
				currentDropTarget = null;
			}
			dragEnterCounter = 0;
		}
	}, false);
	docElement.addEventListener("drop", (event) => {
		var _a, _b, _c;
		if (!((_a = event.dataTransfer) === null || _a === void 0 ? void 0 : _a.types.includes("Files"))) return;
		event.preventDefault();
		if (((_c = (_b = window._wails) === null || _b === void 0 ? void 0 : _b.flags) === null || _c === void 0 ? void 0 : _c.enableFileDrop) === false) return;
		dragEnterCounter = 0;
		if (currentDropTarget) {
			currentDropTarget.classList.remove(DROP_TARGET_ACTIVE_CLASS);
			currentDropTarget = null;
		}
		if (canResolveFilePaths()) {
			const files = [];
			if (event.dataTransfer.items) {
				for (const item of event.dataTransfer.items) if (item.kind === "file") {
					const file = item.getAsFile();
					if (file) files.push(file);
				}
			} else if (event.dataTransfer.files) for (const file of event.dataTransfer.files) files.push(file);
			if (files.length > 0) resolveFilePaths(event.clientX, event.clientY, files);
		}
	}, false);
}
if (typeof window !== "undefined" && typeof document !== "undefined") setupDropTargetListeners();
//#endregion
//#region node_modules/@wailsio/runtime/dist/index.js
window._wails = window._wails || {};
window._wails.invoke = invoke;
window._wails.clientId = clientId;
window._wails.handlePlatformFileDrop = thisWindow.HandlePlatformFileDrop.bind(thisWindow);
window._wails.handleDragEnter = handleDragEnter;
window._wails.handleDragLeave = handleDragLeave;
window._wails.handleDragOver = handleDragOver;
invoke("wails:runtime:ready");
/**
* Loads a script from the given URL if it exists.
* Uses HEAD request to check existence, then injects a script tag.
* Silently ignores if the script doesn't exist.
*/
function loadOptionalScript(url) {
	return fetch(url, { method: "HEAD" }).then((response) => {
		if (response.ok) {
			const script = document.createElement("script");
			script.src = url;
			document.head.appendChild(script);
		}
	}).catch(() => {});
}
loadOptionalScript("/wails/custom.js");
//#endregion
//#region bindings/changeme/internal/services/windowservice.js
/**
* WindowService exposes native window operations (minimise, maximise, close) to the frontend.
* These replace the system titlebar since the app uses a custom titlebar.
* @module
*/
/**
* Close closes the application window and terminates the app.
* @returns {$CancellablePromise<void>}
*/
function Close() {
	return ByID(1502034273);
}
/**
* Maximise toggles the window between maximised and normal state.
* @returns {$CancellablePromise<void>}
*/
function Maximise() {
	return ByID(803170324);
}
/**
* Minimise minimises the application window.
* @returns {$CancellablePromise<void>}
*/
function Minimise() {
	return ByID(1466109830);
}
//#endregion
//#region src/lib/topbar/Titlebar.svelte
var root$10 = /* @__PURE__ */ from_html(`<div class="dk-titlebar"><div class="dk-brand"><div class="dk-logo"><svg viewBox="0 0 13 13" style="width:13px;height:13px;fill:white"><rect x="1" y="1" width="4.5" height="4.5" rx="1"></rect><rect x="7.5" y="1" width="4.5" height="4.5" rx="1"></rect><rect x="1" y="7.5" width="4.5" height="4.5" rx="1"></rect><circle cx="9.75" cy="9.75" r="2.25"></circle></svg></div> <span class="dk-name">doku<span class="ext">.md</span></span></div> <div class="dk-titlebarcenter" style="--wails-draggable: drag"></div> <div class="dk-titlebar-actions"><button class="dk-btn"><span>Search</span> <kbd>CTRL+K</kbd></button> <button class="dk-btn"><span>Browse</span> <kbd>CTRL+O</kbd></button></div> <button class="dk-btn" style="padding: 5px 10px"><span>?</span></button> <div class="dk-dots"><div class="dk-dot"><!></div> <div class="dk-dot"><!></div> <div class="dk-dot"><!></div></div></div>`);
function Titlebar($$anchor, $$props) {
	var div = root$10();
	var div_1 = sibling(child(div), 4);
	var button = child(div_1);
	var button_1 = sibling(button, 2);
	reset(div_1);
	var button_2 = sibling(div_1, 2);
	var div_2 = sibling(button_2, 2);
	var div_3 = child(div_2);
	Minus(child(div_3), { size: 11 });
	reset(div_3);
	var div_4 = sibling(div_3, 2);
	Square(child(div_4), { size: 11 });
	reset(div_4);
	var div_5 = sibling(div_4, 2);
	X(child(div_5), { size: 11 });
	reset(div_5);
	reset(div_2);
	reset(div);
	delegated("click", button, function(...$$args) {
		$$props.onsearch?.apply(this, $$args);
	});
	delegated("click", button_1, function(...$$args) {
		$$props.onbrowse?.apply(this, $$args);
	});
	delegated("click", button_2, function(...$$args) {
		$$props.onshortcuts?.apply(this, $$args);
	});
	delegated("click", div_3, function(...$$args) {
		Minimise?.apply(this, $$args);
	});
	delegated("click", div_4, function(...$$args) {
		Maximise?.apply(this, $$args);
	});
	delegated("click", div_5, function(...$$args) {
		Close?.apply(this, $$args);
	});
	append($$anchor, div);
}
delegate(["click"]);
//#endregion
//#region src/lib/center/TabBar.svelte
var root$9 = /* @__PURE__ */ from_html(`<div role="tab" tabindex="0"><!> <span> </span> <span class="close" role="button" tabindex="0"><!></span></div>`);
var root_1$7 = /* @__PURE__ */ from_html(`<div class="dk-overflow-item" role="button" tabindex="0"><!> <span> </span></div>`);
var root_2$2 = /* @__PURE__ */ from_html(`<div class="dk-overflow-dropdown open"></div>`);
var root_3$1 = /* @__PURE__ */ from_html(`<div class="dk-tabs"><div class="dk-tabs-scroll"></div> <div class="dk-tabs-overflow" role="button" tabindex="0"><!></div></div> <!>`, 1);
function TabBar($$anchor, $$props) {
	push($$props, true);
	var fragment = root_3$1();
	var div = first_child(fragment);
	var div_1 = child(div);
	each(div_1, 21, () => $$props.tabs, index, ($$anchor, tab) => {
		var div_2 = root$9();
		var node = child(div_2);
		File_text(node, { size: 14 });
		var span = sibling(node, 2);
		var text = child(span, true);
		reset(span);
		var span_1 = sibling(span, 2);
		X(child(span_1), { size: 12 });
		reset(span_1);
		reset(div_2);
		template_effect(() => {
			set_class(div_2, 1, `dk-tab ${get(tab).active ? "active" : ""}`);
			set_text(text, get(tab).name);
		});
		delegated("click", div_2, () => $$props.onactivetab(get(tab).id));
		delegated("click", span_1, (e) => {
			e.stopPropagation();
			$$props.onclosetab(get(tab).id);
		});
		append($$anchor, div_2);
	});
	reset(div_1);
	var div_3 = sibling(div_1, 2);
	var node_2 = child(div_3);
	var consequent = ($$anchor) => {
		Chevron_up($$anchor, { size: 16 });
	};
	var alternate = ($$anchor) => {
		Chevron_down($$anchor, { size: 16 });
	};
	if_block(node_2, ($$render) => {
		if ($$props.overflowOpen) $$render(consequent);
		else $$render(alternate, -1);
	});
	reset(div_3);
	reset(div);
	var node_3 = sibling(div, 2);
	var consequent_1 = ($$anchor) => {
		var div_4 = root_2$2();
		each(div_4, 21, () => $$props.overflowTabs, index, ($$anchor, tab) => {
			var div_5 = root_1$7();
			var node_4 = child(div_5);
			File_text(node_4, { size: 15 });
			var span_2 = sibling(node_4, 2);
			var text_1 = child(span_2, true);
			reset(span_2);
			reset(div_5);
			template_effect(() => {
				set_attribute(div_5, "title", get(tab).path);
				set_text(text_1, get(tab).name);
			});
			append($$anchor, div_5);
		});
		reset(div_4);
		append($$anchor, div_4);
	};
	if_block(node_3, ($$render) => {
		if ($$props.overflowOpen) $$render(consequent_1);
	});
	delegated("click", div_3, function(...$$args) {
		$$props.ontoggleoverflow?.apply(this, $$args);
	});
	append($$anchor, fragment);
	pop();
}
delegate(["click"]);
//#endregion
//#region src/lib/center/DocumentView.svelte
var root$8 = /* @__PURE__ */ from_html(`<span role="button" tabindex="0"><!></span>`);
var root_1$6 = /* @__PURE__ */ from_html(`<div class="dk-doc"><h1> </h1> <div class="meta"><span> </span> <span>·</span> <span> </span> <span>·</span> <span> </span> <!></div> <!></div>`);
function DocumentView($$anchor, $$props) {
	var div = root_1$6();
	var h1 = child(div);
	var text = child(h1, true);
	reset(h1);
	var div_1 = sibling(h1, 2);
	var span = child(div_1);
	var text_1 = child(span, true);
	reset(span);
	var span_1 = sibling(span, 4);
	var text_2 = child(span_1, true);
	reset(span_1);
	var span_2 = sibling(span_1, 4);
	var text_3 = child(span_2, true);
	reset(span_2);
	var node = sibling(span_2, 2);
	var consequent = ($$anchor) => {
		var span_3 = root$8();
		Star_filled(child(span_3), { size: 16 });
		reset(span_3);
		template_effect(() => set_class(span_3, 1, `star-doc ${$$props.bookmarked ? "on" : ""}`));
		delegated("click", span_3, function(...$$args) {
			$$props.onbookmark?.apply(this, $$args);
		});
		append($$anchor, span_3);
	};
	if_block(node, ($$render) => {
		if ($$props.onbookmark) $$render(consequent);
	});
	reset(div_1);
	slot(sibling(div_1, 2), $$props, "default", {}, null);
	reset(div);
	template_effect(() => {
		set_text(text, $$props.title);
		set_text(text_1, $$props.path);
		set_text(text_2, $$props.date);
		set_text(text_3, $$props.status);
	});
	append($$anchor, div);
}
delegate(["click"]);
//#endregion
//#region src/lib/center/TableOfContents.svelte
var root$7 = /* @__PURE__ */ from_html(`<div> </div>`);
var root_1$5 = /* @__PURE__ */ from_html(`<div class="dk-right"><div class="dk-toc"><div class="dk-toc-title">On this page</div> <!></div> <div class="dk-status"><span> </span> <span class="dk-badge"> </span></div></div>`);
function TableOfContents($$anchor, $$props) {
	var div = root_1$5();
	var div_1 = child(div);
	each(sibling(child(div_1), 2), 17, () => $$props.items, index, ($$anchor, item) => {
		var div_2 = root$7();
		var text = child(div_2, true);
		reset(div_2);
		template_effect(() => {
			set_class(div_2, 1, `dk-toc-item ${get(item).active ? "active" : ""} ${get(item).level === 2 ? "l2" : get(item).level === 3 ? "l3" : ""}`);
			set_text(text, get(item).text);
		});
		append($$anchor, div_2);
	});
	reset(div_1);
	var div_3 = sibling(div_1, 2);
	var span = child(div_3);
	var text_1 = child(span);
	reset(span);
	var span_1 = sibling(span, 2);
	var text_2 = child(span_1, true);
	reset(span_1);
	reset(div_3);
	reset(div);
	template_effect(() => {
		set_text(text_1, `${$$props.indexedCount ?? ""} docs indexed`);
		set_text(text_2, $$props.status);
	});
	append($$anchor, div);
}
//#endregion
//#region src/lib/sidebar/Accordion.svelte
var root$6 = /* @__PURE__ */ from_html(`<div class="dk-acc-body open"><!></div>`);
var root_1$4 = /* @__PURE__ */ from_html(`<div role="button" tabindex="0"> <!></div> <!>`, 1);
function Accordion($$anchor, $$props) {
	push($$props, true);
	var fragment = comment();
	each(first_child(fragment), 17, () => $$props.sections, index, ($$anchor, section) => {
		var fragment_1 = root_1$4();
		var div = first_child(fragment_1);
		var text = child(div);
		var node_1 = sibling(text);
		var consequent = ($$anchor) => {
			Chevron_up($$anchor, { size: 13 });
		};
		var alternate = ($$anchor) => {
			Chevron_down($$anchor, { size: 13 });
		};
		if_block(node_1, ($$render) => {
			if ($$props.open === get(section).id) $$render(consequent);
			else $$render(alternate, -1);
		});
		reset(div);
		var node_2 = sibling(div, 2);
		var consequent_1 = ($$anchor) => {
			var div_1 = root$6();
			snippet(child(div_1), () => get(section).snippet);
			reset(div_1);
			append($$anchor, div_1);
		};
		if_block(node_2, ($$render) => {
			if ($$props.open === get(section).id) $$render(consequent_1);
		});
		template_effect(() => {
			set_class(div, 1, `dk-acc-header ${$$props.open === get(section).id ? "open" : ""}`);
			set_text(text, `${get(section).title ?? ""} `);
		});
		delegated("click", div, () => $$props.ontoggle(get(section).id));
		append($$anchor, fragment_1);
	});
	append($$anchor, fragment);
	pop();
}
delegate(["click"]);
//#endregion
//#region src/lib/sidebar/FileTree.svelte
var root$5 = /* @__PURE__ */ from_html(`<div class="dk-folder" role="button" tabindex="0"><!> <!> </div> <!>`, 1);
var root_1$3 = /* @__PURE__ */ from_html(`<div class="dk-file" role="button" tabindex="0"><!> <span> </span> <span role="button" tabindex="0"><!></span></div>`);
var root_2$1 = /* @__PURE__ */ from_html(`<div class="dk-tree"></div>`);
function FileTree($$anchor, $$props) {
	push($$props, true);
	var div = root_2$1();
	each(div, 21, () => $$props.nodes, index, ($$anchor, node) => {
		var fragment = comment();
		var node_1 = first_child(fragment);
		var consequent_2 = ($$anchor) => {
			var fragment_1 = root$5();
			var div_1 = first_child(fragment_1);
			var node_2 = child(div_1);
			var consequent = ($$anchor) => {
				Chevron_down($$anchor, { size: 14 });
			};
			var alternate = ($$anchor) => {
				Chevron_right($$anchor, { size: 14 });
			};
			if_block(node_2, ($$render) => {
				if (get(node).expanded) $$render(consequent);
				else $$render(alternate, -1);
			});
			var node_3 = sibling(node_2, 2);
			Folder(node_3, { size: 14 });
			var text = sibling(node_3);
			reset(div_1);
			var node_4 = sibling(div_1, 2);
			var consequent_1 = ($$anchor) => {
				var fragment_4 = comment();
				FileTree(first_child(fragment_4), {
					get nodes() {
						return get(node).children;
					},
					get ontogglefolder() {
						return $$props.ontogglefolder;
					},
					get ontogglebookmark() {
						return $$props.ontogglebookmark;
					},
					get onselectfile() {
						return $$props.onselectfile;
					}
				});
				append($$anchor, fragment_4);
			};
			if_block(node_4, ($$render) => {
				if (get(node).expanded && get(node).children) $$render(consequent_1);
			});
			template_effect(() => set_text(text, ` ${get(node).name ?? ""}`));
			delegated("click", div_1, () => $$props.ontogglefolder(get(node)));
			append($$anchor, fragment_1);
		};
		var alternate_2 = ($$anchor) => {
			var div_2 = root_1$3();
			var node_6 = child(div_2);
			File_text(node_6, { size: 14 });
			var span = sibling(node_6, 2);
			var text_1 = child(span, true);
			reset(span);
			var span_1 = sibling(span, 2);
			var node_7 = child(span_1);
			var consequent_3 = ($$anchor) => {
				Star_filled($$anchor, { size: 13 });
			};
			var alternate_1 = ($$anchor) => {
				Star($$anchor, { size: 13 });
			};
			if_block(node_7, ($$render) => {
				if (get(node).bookmarked) $$render(consequent_3);
				else $$render(alternate_1, -1);
			});
			reset(span_1);
			reset(div_2);
			template_effect(() => {
				set_text(text_1, get(node).name);
				set_class(span_1, 1, `star ${get(node).bookmarked ? "on" : ""}`);
			});
			delegated("click", div_2, () => $$props.onselectfile(get(node)));
			delegated("click", span_1, (e) => {
				e.stopPropagation();
				$$props.ontogglebookmark(get(node));
			});
			append($$anchor, div_2);
		};
		if_block(node_1, ($$render) => {
			if (get(node).isDir) $$render(consequent_2);
			else $$render(alternate_2, -1);
		});
		append($$anchor, fragment);
	});
	reset(div);
	append($$anchor, div);
	pop();
}
delegate(["click"]);
//#endregion
//#region src/lib/sidebar/Bookmarks.svelte
var root$4 = /* @__PURE__ */ from_html(`<div class="dk-bm-item" role="button" tabindex="0"><!> </div>`);
var root_1$2 = /* @__PURE__ */ from_html(`<div class="dk-bm-list"></div>`);
function Bookmarks($$anchor, $$props) {
	push($$props, true);
	var div = root_1$2();
	each(div, 21, () => $$props.items, index, ($$anchor, item) => {
		var div_1 = root$4();
		var node = child(div_1);
		Star_filled(node, { size: 14 });
		var text = sibling(node);
		reset(div_1);
		template_effect(() => set_text(text, ` ${get(item).name ?? ""}`));
		delegated("click", div_1, () => $$props.onselect(get(item)));
		append($$anchor, div_1);
	});
	reset(div);
	append($$anchor, div);
	pop();
}
delegate(["click"]);
//#endregion
//#region src/lib/feedback/Toast.svelte
var root$3 = /* @__PURE__ */ from_html(`<div><!> <span> </span> <button class="toast-close"><!></button></div>`);
function Toast($$anchor, $$props) {
	var div = root$3();
	var node = child(div);
	var consequent = ($$anchor) => {
		Circle_check($$anchor, {
			size: 16,
			class: "toast-icon"
		});
	};
	var consequent_1 = ($$anchor) => {
		Alert_triangle($$anchor, {
			size: 16,
			class: "toast-icon"
		});
	};
	var alternate = ($$anchor) => {
		Circle_x($$anchor, {
			size: 16,
			class: "toast-icon"
		});
	};
	if_block(node, ($$render) => {
		if ($$props.type === "success") $$render(consequent);
		else if ($$props.type === "warning") $$render(consequent_1, 1);
		else $$render(alternate, -1);
	});
	var span = sibling(node, 2);
	var text = child(span, true);
	reset(span);
	var button = sibling(span, 2);
	X(child(button), { size: 14 });
	reset(button);
	reset(div);
	template_effect(() => {
		set_class(div, 1, `dk-toast ${$$props.type ?? ""}`);
		set_text(text, $$props.message);
	});
	delegated("click", button, function(...$$args) {
		$$props.ondismiss?.apply(this, $$args);
	});
	append($$anchor, div);
}
delegate(["click"]);
//#endregion
//#region src/lib/feedback/ToastContainer.svelte
var root$2 = /* @__PURE__ */ from_html(`<div class="dk-toasts"></div>`);
function ToastContainer($$anchor, $$props) {
	push($$props, true);
	var div = root$2();
	each(div, 21, () => $$props.items, index, ($$anchor, item) => {
		Toast($$anchor, {
			get type() {
				return get(item).type;
			},
			get message() {
				return get(item).message;
			},
			ondismiss: () => $$props.ondismiss(get(item).id)
		});
	});
	reset(div);
	append($$anchor, div);
	pop();
}
//#endregion
//#region src/lib/center/StatusBar.svelte
var root$1 = /* @__PURE__ */ from_html(`<span class="dk-statusbar-path svelte-1we2aji"><!> </span>`);
var root_1$1 = /* @__PURE__ */ from_html(`<span class="dk-statusbar-path muted svelte-1we2aji">No project open</span>`);
var root_2 = /* @__PURE__ */ from_html(`<span></span>`);
var root_3 = /* @__PURE__ */ from_html(`<span> </span>`);
var root_4 = /* @__PURE__ */ from_html(`<span>Index error</span>`);
var root_5 = /* @__PURE__ */ from_html(`<div class="dk-statusbar svelte-1we2aji"><div class="dk-statusbar-left svelte-1we2aji"><!></div> <div><!></div></div>`);
function StatusBar($$anchor, $$props) {
	push($$props, true);
	let indexedCount = prop($$props, "indexedCount", 3, 0), indexStatus = prop($$props, "indexStatus", 3, "idle");
	function truncatePath(p, maxLen = 60) {
		if (!p || p.length <= maxLen) return p ?? "";
		const parts = p.split("/");
		if (parts.length < 3) return p;
		const first = parts[0] + "/" + parts[1];
		const last = parts[parts.length - 1];
		const middle = parts.slice(2, -1);
		let result = first + "/.../" + last;
		if (result.length > maxLen) result = first + "/.../" + middle.slice(-2).join("/") + "/" + last;
		if (result.length > maxLen) result = first + "/.../" + last;
		return result;
	}
	let statusClass = /* @__PURE__ */ user_derived(() => indexStatus() === "indexing" ? "status-yellow" : indexStatus() === "ready" ? "status-green" : indexStatus() === "error" ? "status-red" : "");
	var div = root_5();
	var div_1 = child(div);
	var node = child(div_1);
	var consequent = ($$anchor) => {
		var span = root$1();
		var node_1 = child(span);
		Folder_open(node_1, {
			size: 14,
			style: "margin-right: 4px; vertical-align: text-bottom;"
		});
		var text = sibling(node_1);
		reset(span);
		template_effect(($0) => {
			set_attribute(span, "title", $$props.path);
			set_text(text, ` ${$0 ?? ""}`);
		}, [() => truncatePath($$props.path)]);
		append($$anchor, span);
	};
	var alternate = ($$anchor) => {
		append($$anchor, root_1$1());
	};
	if_block(node, ($$render) => {
		if ($$props.path) $$render(consequent);
		else $$render(alternate, -1);
	});
	reset(div_1);
	var div_2 = sibling(div_1, 2);
	var node_2 = child(div_2);
	var consequent_1 = ($$anchor) => {
		append($$anchor, root_2());
	};
	var consequent_2 = ($$anchor) => {
		var span_3 = root_3();
		var text_1 = child(span_3);
		reset(span_3);
		template_effect(() => set_text(text_1, `Indexing ${indexedCount() ?? ""} files`));
		append($$anchor, span_3);
	};
	var consequent_3 = ($$anchor) => {
		var span_4 = root_3();
		var text_2 = child(span_4);
		reset(span_4);
		template_effect(() => set_text(text_2, `${indexedCount() ?? ""} docs indexed`));
		append($$anchor, span_4);
	};
	var consequent_4 = ($$anchor) => {
		append($$anchor, root_4());
	};
	if_block(node_2, ($$render) => {
		if (indexStatus() === "idle" && !$$props.path) $$render(consequent_1);
		else if (indexStatus() === "indexing") $$render(consequent_2, 1);
		else if (indexStatus() === "ready") $$render(consequent_3, 2);
		else if (indexStatus() === "error") $$render(consequent_4, 3);
	});
	reset(div_2);
	reset(div);
	template_effect(() => set_class(div_2, 1, `dk-statusbar-right ${get(statusClass) ?? ""}`, "svelte-1we2aji"));
	append($$anchor, div);
	pop();
}
//#endregion
//#region bindings/changeme/pkg/scanner/models.js
/**
* FileEntry represents a single item found during a directory scan.
* The backend determines isDir from the OS; the frontend should not guess it.
*/
var FileEntry = class FileEntry {
	/**
	* Creates a new FileEntry instance.
	* @param {Partial<FileEntry>} [$$source = {}] - The source object to create the FileEntry.
	*/
	constructor($$source = {}) {
		if (!("path" in $$source))
 /**
		* @member
		* @type {string}
		*/
		this["path"] = "";
		if (!("isDir" in $$source))
 /**
		* @member
		* @type {boolean}
		*/
		this["isDir"] = false;
		Object.assign(this, $$source);
	}
	/**
	* Creates a new FileEntry instance from a string or object.
	* @param {any} [$$source = {}]
	* @returns {FileEntry}
	*/
	static createFrom($$source = {}) {
		return new FileEntry(typeof $$source === "string" ? JSON.parse($$source) : $$source);
	}
};
//#endregion
//#region bindings/changeme/internal/services/folderservice.js
/**
* FolderService handles opening local folders via the native OS directory picker.
* @module
*/
/**
* GetFileTree scans the given rootPath for Markdown files and returns the
* resulting FileEntry slice. Each entry contains the relative path and an
* isDir flag determined by the OS, so the frontend never has to guess.
* 
* Excluded directories are resolved via ResolveExcludes, which checks for a
* local .dokuignore file or falls back to global settings.
* @param {string} rootPath
* @returns {$CancellablePromise<scanner$0.FileEntry[]>}
*/
function GetFileTree(rootPath) {
	return ByID(618366615, rootPath).then((($result) => {
		return $$createType1($result);
	}));
}
/**
* IndexProject opens the index database for the given project root, scans all
* Markdown files, and begins indexing them asynchronously. Progress events are
* emitted to the frontend via Wails3 runtime events.
* 
* The frontend should call GetFileTree first to display the tree immediately,
* then call IndexProject to start background indexing.
* @param {string} rootPath
* @returns {$CancellablePromise<void>}
*/
function IndexProject(rootPath) {
	return ByID(1319153186, rootPath);
}
/**
* OpenFolder opens the native OS directory picker and returns the selected path.
* The frontend calls this when the user clicks "Browse" or presses Ctrl+O/⌘O.
* Returns the absolute path to the selected folder, or an empty string if cancelled.
* @returns {$CancellablePromise<string>}
*/
function OpenFolder() {
	return ByID(2364318539);
}
var $$createType0 = FileEntry.createFrom;
var $$createType1 = Array$1($$createType0);
//#endregion
//#region src/lib/helpers/tree.ts
/**
* Converts a flat list of FileEntry items (returned by the Go scanner) into
* a nested FileNode tree. Each entry's isDir flag is used directly — the
* frontend never guesses whether something is a file or a directory.
*
* Example:
*   [
*     { path: "docs/guide.md",  isDir: false },
*     { path: "docs/api/index.md", isDir: false },
*     { path: "osmeusficheiros.md", isDir: true },  // a directory named like a file!
*     { path: "readme.md",      isDir: false },
*   ]
*   →
*   [
*     { name: "docs", isDir: true, children: [
*       { name: "guide.md",  path: "docs/guide.md",  isDir: false },
*       { name: "api",       isDir: true, children: [
*         { name: "index.md", path: "docs/api/index.md", isDir: false }
*       ]}
*     ]},
*     { name: "osmeusficheiros.md", path: "osmeusficheiros.md", isDir: true },
*     { name: "readme.md",          path: "readme.md",          isDir: false },
*   ]
*/
function buildTree(entries, expanded = false) {
	const root = [];
	for (const entry of entries) {
		const parts = entry.path.split("/");
		let currentLevel = root;
		for (let i = 0; i < parts.length; i++) {
			const part = parts[i];
			if (i === parts.length - 1) currentLevel.push({
				name: part,
				path: parts.slice(0, i + 1).join("/"),
				isDir: entry.isDir
			});
			else {
				let existing = currentLevel.find((n) => n.isDir && n.name === part);
				if (!existing) {
					existing = {
						name: part,
						path: parts.slice(0, i + 1).join("/"),
						isDir: true,
						expanded,
						children: []
					};
					currentLevel.push(existing);
				}
				currentLevel = existing.children ?? [];
			}
		}
	}
	return root;
}
//#endregion
//#region src/App.svelte
var root = /* @__PURE__ */ from_html(`<h2>Overview</h2> <p>Desktop application for browsing, searching, and understanding Markdown-based technical documentation.</p> <h2>User Stories</h2> <p>The core experience is opening a project folder and navigating its documentation through a file tree.</p> <h2>Technical Stack</h2> <div class="dk-codeblock"><pre><span class="ck-kw">const</span><span class="ck-tx"> stack</span> = &#123;
              backend:  <span class="ck-st">'Wails3 + Go 1.22'</span>,
              frontend: <span class="ck-st">'Svelte 5 + TypeScript'</span>,
              storage:  <span class="ck-st">'SQLite + FTS5'</span>,
              watcher:  <span class="ck-st">'fsnotify'</span>,
            &#125;</pre></div> <h2>Success Criteria</h2> <p>Open a project with <code>1000</code> files in under <code>5s</code>.</p>`, 1);
var root_1 = /* @__PURE__ */ from_html(`<div class="dk"><!> <div class="dk-body"><div class="dk-left"><!></div> <div class="dk-wrap"><div class="dk-center"><!> <!> <!></div> <!> <!> <!></div></div></div> <!>`, 1);
function App($$anchor, $$props) {
	push($$props, true);
	let accOpen = /* @__PURE__ */ state("project");
	let showSearch = /* @__PURE__ */ state(false);
	let showShortcuts = /* @__PURE__ */ state(false);
	let overflowOpen = /* @__PURE__ */ state(false);
	let projectPath = /* @__PURE__ */ state(null);
	let tabs = /* @__PURE__ */ state(proxy([
		{
			id: "1",
			name: "spec.md",
			path: "specs/001-markdown-doc-browser/spec.md",
			active: true
		},
		{
			id: "2",
			name: "plan.md",
			path: "specs/001-markdown-doc-browser/plan.md",
			active: false
		},
		{
			id: "3",
			name: "tasks.md",
			path: "specs/001-markdown-doc-browser/tasks.md",
			active: false
		},
		{
			id: "4",
			name: "architecture.md",
			path: "docs/architecture.md",
			active: false
		},
		{
			id: "5",
			name: "quickstart.md",
			path: "docs/quickstart.md",
			active: false
		},
		{
			id: "6",
			name: "constitution.md",
			path: ".specify/memory/constitution.md",
			active: false
		},
		{
			id: "7",
			name: "indexer.md",
			path: "specs/contracts/indexer.md",
			active: false
		},
		{
			id: "8",
			name: "data-model.md",
			path: "specs/001-markdown-doc-browser/data-model.md",
			active: false
		},
		{
			id: "9",
			name: "README.md",
			path: "README.md",
			active: false
		},
		{
			id: "10",
			name: "AGENTS.md",
			path: "AGENTS.md",
			active: false
		}
	]));
	let overflowTabs = proxy(Array.from({ length: 20 }, (_, i) => ({
		id: `o${i}`,
		name: `document-0${90 - i}.md`,
		path: `docs/section-${i % 5 + 1}/document-0${90 - i}.md`,
		active: false
	})));
	let tree = /* @__PURE__ */ state(proxy([]));
	let indexCount = /* @__PURE__ */ state(0);
	let indexStatus = /* @__PURE__ */ state("idle");
	const toc = [
		{
			text: "Overview",
			level: 1,
			active: true
		},
		{
			text: "User stories",
			level: 2,
			active: false
		},
		{
			text: "Technical stack",
			level: 2,
			active: false
		},
		{
			text: "Success criteria",
			level: 2,
			active: false
		},
		{
			text: "Requirements",
			level: 1,
			active: false
		},
		{
			text: "Functional",
			level: 2,
			active: false
		},
		{
			text: "Key entities",
			level: 2,
			active: false
		},
		{
			text: "Assumptions",
			level: 1,
			active: false
		},
		{
			text: "Edge cases",
			level: 3,
			active: false
		},
		{
			text: "Out of scope",
			level: 3,
			active: false
		}
	];
	let toasts = /* @__PURE__ */ state(proxy([
		{
			id: "1",
			type: "success",
			message: "Bookmark added — spec.md"
		},
		{
			id: "2",
			type: "warning",
			message: "architecture.md was modified externally. Reload?"
		},
		{
			id: "3",
			type: "error",
			message: "Failed to index document-042.md — permission denied"
		}
	]));
	let bookmarked = /* @__PURE__ */ user_derived(() => get(tree).flatMap((n) => n.children ?? []).filter((f) => f.bookmarked));
	function toggleAcc(section) {
		set(accOpen, get(accOpen) === section ? "" : section, true);
	}
	function toggleFolder(node) {
		node.expanded = !node.expanded;
	}
	function toggleBookmark(node) {
		node.bookmarked = !node.bookmarked;
	}
	function closeTab(id) {
		const idx = get(tabs).findIndex((t) => t.id === id);
		set(tabs, get(tabs).filter((t) => t.id !== id), true);
		if (get(tabs).length && get(tabs)[idx - 1]) get(tabs)[idx - 1].active = true;
		else if (get(tabs).length) get(tabs)[0].active = true;
	}
	function activateTab(id) {
		set(tabs, get(tabs).map((t) => ({
			...t,
			active: t.id === id
		})), true);
	}
	function dismissToast(id) {
		set(toasts, get(toasts).filter((t) => t.id !== id), true);
	}
	async function openFolder() {
		const path = await OpenFolder();
		if (path) {
			set(projectPath, path, true);
			set(indexStatus, "indexing");
			set(tree, buildTree(await GetFileTree(path)), true);
			IndexProject(path);
		}
	}
	function handleKeydown(e) {
		const ctrl = e.ctrlKey || e.metaKey;
		if (ctrl && e.key === "k") {
			e.preventDefault();
			set(showSearch, true);
			return;
		}
		if (ctrl && e.key === "o") {
			e.preventDefault();
			openFolder();
			return;
		}
		if (e.key === "Escape") {
			set(showSearch, false);
			set(showShortcuts, false);
			return;
		}
		if (e.key === "?" && !(e.target instanceof HTMLInputElement)) set(showShortcuts, true);
	}
	onMount(() => {
		On("index:progress", (ev) => {
			set(indexCount, ev.data.done, true);
			set(indexStatus, ev.data.state, true);
		});
	});
	var fragment = root_1();
	event("keydown", $window, handleKeydown);
	var div = first_child(fragment);
	var node_1 = child(div);
	Titlebar(node_1, {
		onsearch: () => set(showSearch, true),
		onbrowse: openFolder,
		onshortcuts: () => set(showShortcuts, true)
	});
	var div_1 = sibling(node_1, 2);
	var div_2 = child(div_1);
	{
		const projectContent = ($$anchor) => {
			FileTree($$anchor, {
				get nodes() {
					return get(tree);
				},
				ontogglefolder: toggleFolder,
				ontogglebookmark: toggleBookmark,
				onselectfile: () => {}
			});
		};
		const bookmarksContent = ($$anchor) => {
			{
				let $0 = /* @__PURE__ */ user_derived(() => get(bookmarked).map((b) => ({
					name: b.name,
					path: b.path
				})));
				Bookmarks($$anchor, {
					get items() {
						return get($0);
					},
					onselect: () => {}
				});
			}
		};
		var node_2 = child(div_2);
		{
			let $0 = /* @__PURE__ */ user_derived(() => [{
				id: "project",
				title: "Project",
				snippet: projectContent
			}, {
				id: "bookmarks",
				title: "Bookmarks",
				snippet: bookmarksContent
			}]);
			Accordion(node_2, {
				get sections() {
					return get($0);
				},
				get open() {
					return get(accOpen);
				},
				ontoggle: toggleAcc
			});
		}
		reset(div_2);
	}
	var div_3 = sibling(div_2, 2);
	var div_4 = child(div_3);
	var node_3 = child(div_4);
	TabBar(node_3, {
		get tabs() {
			return get(tabs);
		},
		get overflowTabs() {
			return overflowTabs;
		},
		onactivetab: activateTab,
		onclosetab: closeTab,
		ontoggleoverflow: () => set(overflowOpen, !get(overflowOpen)),
		get overflowOpen() {
			return get(overflowOpen);
		}
	});
	var node_4 = sibling(node_3, 2);
	DocumentView(node_4, {
		title: "Feature Specification: Markdown Documentation Browser",
		path: "specs/001-markdown-doc-browser",
		date: "2026-06-10",
		status: "Draft",
		bookmarked: true,
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root();
			next(14);
			append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});
	StatusBar(sibling(node_4, 2), {
		get path() {
			return get(projectPath);
		},
		get indexedCount() {
			return get(indexCount);
		},
		get indexStatus() {
			return get(indexStatus);
		}
	});
	reset(div_4);
	var node_6 = sibling(div_4, 2);
	TableOfContents(node_6, {
		get items() {
			return toc;
		},
		indexedCount: 1842,
		status: "Ready"
	});
	var node_7 = sibling(node_6, 2);
	SearchOverlay(node_7, {
		get show() {
			return get(showSearch);
		},
		onclose: () => set(showSearch, false)
	});
	ShortcutsOverlay(sibling(node_7, 2), {
		get show() {
			return get(showShortcuts);
		},
		onclose: () => set(showShortcuts, false)
	});
	reset(div_3);
	reset(div_1);
	reset(div);
	ToastContainer(sibling(div, 2), {
		get items() {
			return get(toasts);
		},
		ondismiss: dismissToast
	});
	append($$anchor, fragment);
	pop();
}
//#endregion
//#region src/main.ts
mount(App, { target: document.getElementById("app") });
//#endregion
