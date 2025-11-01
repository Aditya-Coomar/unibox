// Test script to verify conversation details API is working
const testConversationDetails = async () => {
  try {
    console.log("Testing conversation details API...");

    // First, let's test if we can get the conversations list
    const conversationsResponse = await fetch(
      "http://localhost:3001/api/conversations",
      {
        headers: {
          // Note: You'll need to be authenticated for this to work
          Cookie: "your-auth-cookie-here",
        },
      }
    );

    const conversationsResult = await conversationsResponse.json();
    console.log("Conversations list status:", conversationsResponse.status);

    if (
      conversationsResult.success &&
      conversationsResult.data &&
      conversationsResult.data.length > 0
    ) {
      const firstConversationId = conversationsResult.data[0].id;
      console.log(`Found conversation ID: ${firstConversationId}`);

      // Test the conversation details endpoint
      const detailsResponse = await fetch(
        `http://localhost:3001/api/conversations/${firstConversationId}?includeMessages=true`,
        {
          headers: {
            Cookie: "your-auth-cookie-here",
          },
        }
      );

      const detailsResult = await detailsResponse.json();
      console.log("Conversation details status:", detailsResponse.status);
      console.log("Details result:", detailsResult);

      if (detailsResult.success) {
        console.log("✅ Conversation details API is working correctly!");
        console.log(
          `Conversation has ${
            detailsResult.data.messages?.length || 0
          } messages`
        );
      } else {
        console.log("❌ Conversation details API failed:", detailsResult.error);
      }
    } else {
      console.log("No conversations found. You may need to sync emails first.");
      console.log("Try running the email sync test: node test-email-sync.js");
    }
  } catch (error) {
    console.error("❌ Error testing conversation details:", error);
  }
};

console.log("=== Testing Conversation Details Fix ===");
console.log("Note: Make sure you're authenticated and have some conversations");
console.log("");
testConversationDetails();
