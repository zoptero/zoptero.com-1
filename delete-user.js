const { ConvexClient } = require("convex/browser");
const { api } = require("./convex/_generated/api");
require("dotenv").config({ path: ".env.local" });

const convex = new ConvexClient(process.env.NEXT_PUBLIC_CONVEX_URL);

async function deleteInvalidUser() {
  try {
    console.log("Fetching users...");
    const users = await convex.query(api.users.countUsers);
    console.log(`Total users: ${users}`);
    
    // Get all users
    const allUsers = await convex.query(api.users.getMe);
    console.log("Users:", JSON.stringify(allUsers, null, 2));
    
    // Delete the user with invalid accountType
    // This is a one-time fix for the schema validation error
    console.log("Deleting invalid user...");
    await convex.action(api.users.deleteUserCascadePublic, { clerkId: "j576b83cp874dp0970br36hgg983qqqq" });
    
    console.log("User deleted successfully!");
  } catch (error) {
    console.error("Error:", error);
  }
}

deleteInvalidUser();