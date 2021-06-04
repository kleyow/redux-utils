import { AxiosPromise, AxiosResponse } from 'axios';
import { SelectEffect, CallEffect } from 'redux-saga/effects';

type KeysOfTypeOfEnum<TEnumType> = keyof TEnumType;

export type BaseObject = Record<string, unknown>;

export enum Method {
  read = 'get',
  create = 'post',
  update = 'put',
  delete = 'delete',
  modify = 'patch',
}

export type MethodName = KeysOfTypeOfEnum<typeof Method>;

export type Response = {
  status: number;
  data: unknown;
};

export type Dispatcher<State = unknown> = Generator<
  State | SelectEffect | CallEffect | AxiosPromise,
  Response,
  BaseObject & State & AxiosResponse
>;

export type UrlConfig<State = unknown, Params = unknown> =
  | string
  | ((state: State, data: Params) => string);

interface Service<State, Params> {
  baseUrl: UrlConfig<State, Params>;
  mock?: (state: State) => boolean;
}

// Mocking configuration
export type MockCall = (data: BaseObject) => Response;

export type CompositeMock = {
  call: MockCall;
  delay: number;
};

type MockConfig = Record<MethodName, MockCall | CompositeMock>;

// Endpoints configuration
export interface EndpointConfig<State = any, Params = any> {
  service: Service<State, Params>;
  url: UrlConfig<State, Params>;
  transformResponse?: (data: unknown) => unknown;
  mock?: Partial<MockConfig>;
}

export type Endpoints = Record<string, EndpointConfig>;

// This helps us to extract from a given type
type StateAndParams<C> = C extends EndpointConfig<infer State, infer Params>
  ? [State, Params]
  : never;

// Api object configuration
export type ExtractState<C> = StateAndParams<C>[0];
export type ExtractParams<C> = StateAndParams<C>[1];

export type ApiMethodMap<T extends EndpointConfig> = Record<
  MethodName,
  (params: ExtractParams<T>) => Dispatcher<ExtractState<T>>
>;

type ValueOf<T extends Endpoints> = T[keyof T];

export type Api<T extends Endpoints> = Record<keyof T, ApiMethodMap<ValueOf<T>>>;
