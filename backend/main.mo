import Hash "mo:base/Hash";

import Text "mo:base/Text";
import Array "mo:base/Array";
import Result "mo:base/Result";
import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import Time "mo:base/Time";
import Debug "mo:base/Debug";

actor {
  // Types
  type Category = {
    id: Nat;
    name: Text;
    icon: Text;
  };

  type Topic = {
    id: Nat;
    categoryId: Nat;
    title: Text;
    content: Text;
    author: Text;
    createdAt: Time.Time;
  };

  type Reply = {
    id: Nat;
    topicId: Nat;
    content: Text;
    author: Text;
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
  public shared(msg) func createCategory(name: Text, icon: Text): async Result.Result<Nat, Text> {
    let category: Category = {
      id = nextCategoryId;
      name = name;
      icon = icon;
    };
    categories := Array.append(categories, [category]);
    nextCategoryId += 1;
    Debug.print("Created category: " # debug_show(category));
    #ok(category.id)
  };

  public query func getCategories(): async [Category] {
    Debug.print("Returning categories: " # debug_show(categories));
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
          author = Principal.toText(msg.caller);
          createdAt = Time.now();
        };
        topics := Array.append(topics, [topic]);
        nextTopicId += 1;
        Debug.print("Created topic: " # debug_show(topic));
        #ok(topic.id)
      };
    }
  };

  public query func getTopics(categoryId: Nat): async [Topic] {
    let filteredTopics = Array.filter<Topic>(topics, func(t) { t.categoryId == categoryId });
    Debug.print("Returning topics for category " # Nat.toText(categoryId) # ": " # debug_show(filteredTopics));
    filteredTopics
  };

  public query func getTopic(topicId: Nat): async ?Topic {
    let topic = findTopic(topicId);
    Debug.print("Returning topic " # Nat.toText(topicId) # ": " # debug_show(topic));
    topic
  };

  public shared(msg) func createReply(topicId: Nat, content: Text, parentId: ?Nat): async Result.Result<Nat, Text> {
    switch (findTopic(topicId)) {
      case null { #err("Topic not found") };
      case (?_) {
        let reply: Reply = {
          id = nextReplyId;
          topicId = topicId;
          content = content;
          author = Principal.toText(msg.caller);
          parentId = parentId;
          createdAt = Time.now();
        };
        replies := Array.append(replies, [reply]);
        nextReplyId += 1;
        Debug.print("Created reply: " # debug_show(reply));
        #ok(reply.id)
      };
    }
  };

  public query func getReplies(topicId: Nat): async [Reply] {
    let filteredReplies = Array.filter<Reply>(replies, func(r) { r.topicId == topicId });
    Debug.print("Returning replies for topic " # Nat.toText(topicId) # ": " # debug_show(filteredReplies));
    filteredReplies
  };

  // Initialize default categories
  system func preupgrade() {
    if (Array.size(categories) == 0) {
      let defaultCategories = [
        { id = 1; name = "Web Security"; icon = "language" },
        { id = 2; name = "Network Penetration"; icon = "wifi" },
        { id = 3; name = "Cryptography"; icon = "lock" },
        { id = 4; name = "Reverse Engineering"; icon = "build" },
        { id = 5; name = "Malware Analysis"; icon = "bug_report" },
        { id = 6; name = "Social Engineering"; icon = "people" },
      ];
      categories := defaultCategories;
      nextCategoryId := 7;
      Debug.print("Initialized default categories: " # debug_show(defaultCategories));
    };
  };

  system func postupgrade() {
    Debug.print("Post-upgrade check - Categories: " # debug_show(categories));
  };
}
