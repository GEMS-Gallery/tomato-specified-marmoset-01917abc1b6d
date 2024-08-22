import Hash "mo:base/Hash";

import Text "mo:base/Text";
import Array "mo:base/Array";
import Result "mo:base/Result";
import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import Time "mo:base/Time";

actor {
  // Types
  type Category = {
    id: Nat;
    name: Text;
  };

  type Topic = {
    id: Nat;
    categoryId: Nat;
    title: Text;
    content: Text;
    author: Principal;
    createdAt: Time.Time;
  };

  type Reply = {
    id: Nat;
    topicId: Nat;
    content: Text;
    author: Principal;
    parentId: ?Nat;
    createdAt: Time.Time;
  };

  type User = {
    principal: Principal;
    username: Text;
  };

  // Stable variables
  stable var categories: [Category] = [];
  stable var topics: [Topic] = [];
  stable var replies: [Reply] = [];
  stable var nextCategoryId: Nat = 1;
  stable var nextTopicId: Nat = 1;
  stable var nextReplyId: Nat = 1;

  // Mutable variables
  let userPrincipals = HashMap.HashMap<Principal, User>(10, Principal.equal, Principal.hash);

  // Helper functions
  func findCategory(id: Nat): ?Category {
    Array.find<Category>(categories, func(c) { c.id == id })
  };

  func findTopic(id: Nat): ?Topic {
    Array.find<Topic>(topics, func(t) { t.id == id })
  };

  // Public functions
  public shared(msg) func createCategory(name: Text): async Result.Result<Nat, Text> {
    let category: Category = {
      id = nextCategoryId;
      name = name;
    };
    categories := Array.append(categories, [category]);
    nextCategoryId += 1;
    #ok(category.id)
  };

  public query func getCategories(): async [Category] {
    categories
  };

  public shared(msg) func createTopic(categoryId: Nat, title: Text, content: Text): async Result.Result<Nat, Text> {
    switch (findCategory(categoryId)) {
      case null { #err("Category not found") };
      case (?_) {
        let topic: Topic = {
          id = nextTopicId;
          categoryId = categoryId;
          title = title;
          content = content;
          author = msg.caller;
          createdAt = Time.now();
        };
        topics := Array.append(topics, [topic]);
        nextTopicId += 1;
        #ok(topic.id)
      };
    }
  };

  public query func getTopics(categoryId: Nat): async [Topic] {
    Array.filter<Topic>(topics, func(t) { t.categoryId == categoryId })
  };

  public shared(msg) func createReply(topicId: Nat, content: Text, parentId: ?Nat): async Result.Result<Nat, Text> {
    switch (findTopic(topicId)) {
      case null { #err("Topic not found") };
      case (?_) {
        let reply: Reply = {
          id = nextReplyId;
          topicId = topicId;
          content = content;
          author = msg.caller;
          parentId = parentId;
          createdAt = Time.now();
        };
        replies := Array.append(replies, [reply]);
        nextReplyId += 1;
        #ok(reply.id)
      };
    }
  };

  public query func getReplies(topicId: Nat): async [Reply] {
    Array.filter<Reply>(replies, func(r) { r.topicId == topicId })
  };

  // Initialize default categories
  system func preupgrade() {
    if (Array.size(categories) == 0) {
      let defaultCategories = [
        { id = 1; name = "Web Security" },
        { id = 2; name = "Network Penetration" },
        { id = 3; name = "Cryptography" },
        { id = 4; name = "Reverse Engineering" },
        { id = 5; name = "Malware Analysis" },
      ];
      categories := defaultCategories;
      nextCategoryId := 6;
    };
  };
}
