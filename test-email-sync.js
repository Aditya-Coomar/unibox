// Test script for email sync functionality
const testEmailSync = async () => {
  try {
    console.log("Testing email sync functionality...");

    const response = await fetch("http://localhost:3000/api/sync/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie:
          "_ga=GA1.1.1769231369.1759945759; X-CSRF-Token=wms-tkp-token_client_10002227248=%3B%20Max-Age=0%3B%20Expires=Thu%2C%2001%20Jan%201970%2000:00:10%20GMT%3B%20Domain=academia.srmist.edu.in%3B%20Path=/%20wms-tkp-token_client_10002227248=%3B%20Max-Age=0%3B%20Expires=Thu%2C%2001%20Jan%201970%2000:00:10%20GMT%3B%20Domain=srmist.edu.in%3B%20Path=/%20wms-tkp-token_client_10002227248=%3B%20Max-Age=0%3B%20Expires=Thu%2C%2001%20Jan%201970%2000:00:10%20GMT%3B%20Domain=edu.in%3B%20Path=/%20wms-tkp-token_client_10002227248=%3B%20Max-Age=0%3B%20Expires=Thu%2C%2001%20Jan%201970%2000:00:10%20GMT%3B%20Path=/%20_iamadt_client_10002227248=c4492148fc9426512be374f4dc8584a668374dd7c469a33d4900f1caedccf52f145b9e189a1389b7cf4842faf17b7914%3B%20Max-Age=3024000%3B%20Expires=Thu%2C%2027-Nov-2025%2014:23:05%20GMT%3B%20HttpOnly%3B%20Domain=academia.srmist.edu.in%3B%20Path=/%3B%20Secure%3B%20SameSite=None%3Bpriority=High%20_iambdt_client_10002227248=9e113e8ba880923e01463901388d7221a7bcd7ad64aaab4ce0fb397720ecd2dc64740adb608932d87772ec4be7d64950eb7bda581dd3c13656acad85f16cf796%3B%20Max-Age=3024000%3B%20Expires=Thu%2C%2027-Nov-2025%2014:23:05%20GMT%3B%20HttpOnly%3B%20Domain=academia.srmist.edu.in%3B%20Path=/%3B%20Secure%3B%20SameSite=None%3Bpriority=High%20_z_identity=true%3B%20Max-Age=7200%3B%20Expires=Thu%2C%2023-Oct-2025%2016:23:05%20GMT%3B%20Path=/%3B%20Secure%3B%20SameSite=None%3Bpriority=Medium; _ga_C3JDRSD2G9=GS2.1.s1761245622$o10$g1$t1761246341$j18$l0$h0; better-auth.state=uvp7IiCnole_-3G5nNVTbEZME9_UKgbX.V2zmt209whMr70ashzoNTlvQYfstXy0rO1094UV452E%3D; better-auth.session_token=eDtRQLuNdQ4FB6DGa0d7VThE1b2zPxsG.K8Xv3Q0OtptYkcOT0t1r5z%2Fs5ZKxbGgH6%2F1MjpmC7YU%3D; __next_hmr_refresh_hash__=260", // You would need to replace this with actual auth
      },
      body: JSON.stringify({ folder: "INBOX" }),
    });

    const result = await response.json();

    console.log("Response status:", response.status);
    console.log("Response:", result);

    if (result.success) {
      console.log(
        `Successfully synced ${result.data.processedCount} new emails out of ${result.data.totalEmails} total emails`
      );
    }
  } catch (error) {
    console.error("Error testing email sync:", error);
  }
};

const testConversations = async () => {
  try {
    console.log("\nTesting conversations API...");

    const response = await fetch("http://localhost:3000/api/conversations", {
      headers: {
        Cookie:
          "_ga=GA1.1.1769231369.1759945759; X-CSRF-Token=wms-tkp-token_client_10002227248=%3B%20Max-Age=0%3B%20Expires=Thu%2C%2001%20Jan%201970%2000:00:10%20GMT%3B%20Domain=academia.srmist.edu.in%3B%20Path=/%20wms-tkp-token_client_10002227248=%3B%20Max-Age=0%3B%20Expires=Thu%2C%2001%20Jan%201970%2000:00:10%20GMT%3B%20Domain=srmist.edu.in%3B%20Path=/%20wms-tkp-token_client_10002227248=%3B%20Max-Age=0%3B%20Expires=Thu%2C%2001%20Jan%201970%2000:00:10%20GMT%3B%20Domain=edu.in%3B%20Path=/%20wms-tkp-token_client_10002227248=%3B%20Max-Age=0%3B%20Expires=Thu%2C%2001%20Jan%201970%2000:00:10%20GMT%3B%20Path=/%20_iamadt_client_10002227248=c4492148fc9426512be374f4dc8584a668374dd7c469a33d4900f1caedccf52f145b9e189a1389b7cf4842faf17b7914%3B%20Max-Age=3024000%3B%20Expires=Thu%2C%2027-Nov-2025%2014:23:05%20GMT%3B%20HttpOnly%3B%20Domain=academia.srmist.edu.in%3B%20Path=/%3B%20Secure%3B%20SameSite=None%3Bpriority=High%20_iambdt_client_10002227248=9e113e8ba880923e01463901388d7221a7bcd7ad64aaab4ce0fb397720ecd2dc64740adb608932d87772ec4be7d64950eb7bda581dd3c13656acad85f16cf796%3B%20Max-Age=3024000%3B%20Expires=Thu%2C%2027-Nov-2025%2014:23:05%20GMT%3B%20HttpOnly%3B%20Domain=academia.srmist.edu.in%3B%20Path=/%3B%20Secure%3B%20SameSite=None%3Bpriority=High%20_z_identity=true%3B%20Max-Age=7200%3B%20Expires=Thu%2C%2023-Oct-2025%2016:23:05%20GMT%3B%20Path=/%3B%20Secure%3B%20SameSite=None%3Bpriority=Medium; _ga_C3JDRSD2G9=GS2.1.s1761245622$o10$g1$t1761246341$j18$l0$h0; better-auth.state=uvp7IiCnole_-3G5nNVTbEZME9_UKgbX.V2zmt209whMr70ashzoNTlvQYfstXy0rO1094UV452E%3D; better-auth.session_token=eDtRQLuNdQ4FB6DGa0d7VThE1b2zPxsG.K8Xv3Q0OtptYkcOT0t1r5z%2Fs5ZKxbGgH6%2F1MjpmC7YU%3D; __next_hmr_refresh_hash__=260", // You would need to replace this with actual auth
      },
    });

    const result = await response.json();

    console.log("Conversations response status:", response.status);
    console.log("Conversations:", result);

    if (result.success && result.data) {
      console.log(`Found ${result.data.length} conversations`);
      result.data.forEach((conv, index) => {
        console.log(
          `${index + 1}. ${conv.contact.firstName || conv.contact.email} - ${
            conv.channel
          } (${conv._count.messages} messages)`
        );
      });
    }
  } catch (error) {
    console.error("Error testing conversations:", error);
  }
};

// Run tests
console.log("=== UniBox Inbound Message Testing ===");
console.log(
  "Note: You'll need to be authenticated or modify the auth check in the APIs for this test to work"
);
console.log("");

testEmailSync();
setTimeout(testConversations, 2000);
