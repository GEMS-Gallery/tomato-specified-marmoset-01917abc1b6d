import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Category { 'id' : bigint, 'icon' : string, 'name' : string }
export interface Reply {
  'id' : bigint,
  'content' : string,
  'createdAt' : Time,
  'author' : string,
  'parentId' : [] | [bigint],
  'topicId' : bigint,
}
export type Result = { 'ok' : bigint } |
  { 'err' : string };
export type Time = bigint;
export interface Topic {
  'id' : bigint,
  'categoryId' : bigint,
  'title' : string,
  'content' : string,
  'createdAt' : Time,
  'author' : string,
}
export interface _SERVICE {
  'createCategory' : ActorMethod<[string, string], Result>,
  'createReply' : ActorMethod<[bigint, string, [] | [bigint]], Result>,
  'createTopic' : ActorMethod<[bigint, string, string], Result>,
  'getCategories' : ActorMethod<[], Array<Category>>,
  'getReplies' : ActorMethod<[bigint], Array<Reply>>,
  'getTopic' : ActorMethod<[bigint], [] | [Topic]>,
  'getTopics' : ActorMethod<[bigint], Array<Topic>>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
