export const idlFactory = ({ IDL }) => {
  const Result = IDL.Variant({ 'ok' : IDL.Nat, 'err' : IDL.Text });
  const Category = IDL.Record({
    'id' : IDL.Nat,
    'icon' : IDL.Text,
    'name' : IDL.Text,
  });
  const Reply = IDL.Record({
    'id' : IDL.Nat,
    'content' : IDL.Text,
    'createdAt' : IDL.Int,
    'author' : IDL.Text,
    'parentId' : IDL.Opt(IDL.Nat),
    'topicId' : IDL.Nat,
  });
  const Topic = IDL.Record({
    'id' : IDL.Nat,
    'categoryId' : IDL.Nat,
    'title' : IDL.Text,
    'content' : IDL.Text,
    'createdAt' : IDL.Int,
    'author' : IDL.Text,
  });
  return IDL.Service({
    'createCategory' : IDL.Func([IDL.Text, IDL.Text], [Result], []),
    'createReply' : IDL.Func(
        [IDL.Nat, IDL.Text, IDL.Opt(IDL.Nat)],
        [Result],
        [],
      ),
    'createTopic' : IDL.Func([IDL.Nat, IDL.Text, IDL.Text], [Result], []),
    'getCategories' : IDL.Func([], [IDL.Vec(Category)], ['query']),
    'getReplies' : IDL.Func([IDL.Nat], [IDL.Vec(Reply)], ['query']),
    'getTopic' : IDL.Func([IDL.Nat], [IDL.Opt(Topic)], ['query']),
    'getTopics' : IDL.Func([IDL.Nat], [IDL.Vec(Topic)], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
