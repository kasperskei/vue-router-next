import { LocationQuery, LocationQueryRaw } from '../utils/query'
import { PathParserOptions } from '../matcher/path-parser-ranker'
import { markNonReactive } from 'vue'
import { RouteRecordNormalized } from '../matcher/types'

// type Component = ComponentOptions<Vue> | typeof Vue | AsyncComponent

export type Lazy<T> = () => Promise<T>
export type Override<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U

export type Immutable<T> = {
  readonly [P in keyof T]: Immutable<T[P]>
}

export type TODO = any

export type ListenerRemover = () => void

export type RouteParamValue = string
// TODO: should we allow more values like numbers and normalize them to strings?
// type RouteParamValueRaw = RouteParamValue | number
export type RouteParams = Record<string, RouteParamValue | RouteParamValue[]>
export type RouteParamsRaw = RouteParams
// export type RouteParamsRaw = Record<
//   string,
//   RouteParamValueRaw | RouteParamValueRaw[]
// >

export interface RouteQueryAndHash {
  query?: LocationQueryRaw
  hash?: string
}
export interface LocationAsPath {
  path: string
}

export interface LocationAsName {
  name: string
  params?: RouteParamsRaw
}

export interface LocationAsRelative {
  params?: RouteParams
}

export interface RouteLocationOptions {
  /**
   * Replace the entry in the history instead of pushing a new entry
   */
  replace?: boolean
  /**
   * Triggers the navigation even if the location is the same as the current one
   */
  force?: boolean
}

// User level location
export type RouteLocation =
  | string
  | (RouteQueryAndHash & LocationAsPath & RouteLocationOptions)
  | (RouteQueryAndHash & LocationAsName & RouteLocationOptions)
  | (RouteQueryAndHash & LocationAsRelative & RouteLocationOptions)

// A matched record cannot be a redirection and must contain

export interface RouteLocationNormalized {
  path: string
  fullPath: string
  query: LocationQuery
  hash: string
  name: string | null | undefined
  params: RouteParams
  matched: RouteRecordNormalized[] // non-enumerable
  // TODO: make it an array?
  redirectedFrom: RouteLocationNormalized | undefined
  meta: Record<string | number | symbol, any>
}

// interface PropsTransformer {
//   (params: RouteParams): any
// }

// export interface RouterLocation<PT extends PropsTransformer> {
//   record: RouteRecord<PT>
//   path: string
//   params: ReturnType<PT>
// }

// TODO: type this for beforeRouteUpdate and beforeRouteLeave
export interface RouteComponentInterface {
  beforeRouteEnter?: NavigationGuard<void>
  /**
   * Guard called when the router is navigating away from the current route
   * that is rendering this component.
   * @param to RouteLocation we are navigating to
   * @param from RouteLocation we are navigating from
   * @param next function to validate, cancel or modify (by redirectering) the navigation
   */
  beforeRouteLeave?: NavigationGuard<void>
  /**
   * Guard called whenever the route that renders this component has changed but
   * it is reused for the new route. This allows you to guard for changes in params,
   * the query or the hash.
   * @param to RouteLocation we are navigating to
   * @param from RouteLocation we are navigating from
   * @param next function to validate, cancel or modify (by redirectering) the navigation
   */
  beforeRouteUpdate?: NavigationGuard<void>
}

// TODO: have a real type with augmented properties
// add async component
// export type RouteComponent = (Component | ReturnType<typeof defineComponent>) & RouteComponentInterface
export type RouteComponent = TODO

// TODO: could this be moved to matcher?
export interface RouteRecordCommon {
  path: string
  alias?: string | string[]
  name?: string
  // TODO: beforeEnter has no effect with redirect, move and test
  beforeEnter?: NavigationGuard | NavigationGuard[]
  meta?: Record<string | number | symbol, any>
  // TODO: only allow a subset?
  // TODO: RFC: remove this and only allow global options
  options?: PathParserOptions
}

export type RouteRecordRedirectOption =
  | RouteLocation
  | ((to: Immutable<RouteLocationNormalized>) => RouteLocation)
export interface RouteRecordRedirect extends RouteRecordCommon {
  redirect: RouteRecordRedirectOption
  beforeEnter?: never
  component?: never
  components?: never
}

export interface RouteRecordSingleView extends RouteRecordCommon {
  component: RouteComponent
  children?: RouteRecord[]
}

export interface RouteRecordMultipleViews extends RouteRecordCommon {
  components: Record<string, RouteComponent>
  children?: RouteRecord[]
}

export type RouteRecord =
  | RouteRecordSingleView
  | RouteRecordMultipleViews
  | RouteRecordRedirect

export const START_LOCATION_NORMALIZED: RouteLocationNormalized = markNonReactive(
  {
    path: '/',
    name: undefined,
    params: {},
    query: {},
    hash: '',
    fullPath: '/',
    matched: [],
    meta: {},
    redirectedFrom: undefined,
  }
)

// make matched non enumerable for easy printing
Object.defineProperty(START_LOCATION_NORMALIZED, 'matched', {
  enumerable: false,
})

// Matcher types
// the matcher doesn't care about query and hash
export type MatcherLocation =
  | LocationAsPath
  | LocationAsName
  | LocationAsRelative

// TODO: should probably be the other way around: RouteLocationNormalized extending from MatcherLocationNormalized
export interface MatcherLocationNormalized
  extends Pick<
    RouteLocationNormalized,
    'name' | 'path' | 'params' | 'matched' | 'meta'
  > {}

// used when the route records requires a redirection
// with a function call. The matcher isn't able to do it
// by itself, so it dispatches the information so the router
// can pick it up
export interface MatcherLocationRedirect {
  redirect: RouteRecordRedirectOption
  normalizedLocation: MatcherLocationNormalized
}

// TODO: remove any to type vm and use a generic that comes from the component
// where the navigation guard callback is defined
export interface NavigationGuardCallback {
  (): void
  (location: RouteLocation): void
  (valid: false): void
  (cb: (vm: any) => void): void
}

export interface NavigationGuard<V = void> {
  (
    this: V,
    // TODO: we could maybe add extra information like replace: true/false
    to: Immutable<RouteLocationNormalized>,
    from: Immutable<RouteLocationNormalized>,
    next: NavigationGuardCallback
  ): any
}

export interface PostNavigationGuard {
  (
    to: Immutable<RouteLocationNormalized>,
    from: Immutable<RouteLocationNormalized>
  ): any
}

export * from './type-guards'

export type Mutable<T> = {
  -readonly [P in keyof T]: T[P]
}
