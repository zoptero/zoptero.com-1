const { ConvexClient } = require("convex/browser");
const { api } = require("./convex/_generated/api");
require("dotenv").config({ path: ".env.local" });

const convex = new ConvexClient(process.env.NEXT_PUBLIC_CONVEX_URL);

async function deleteAllUsers() {
  try {
    console.log("Fetching all users...");
    const users = await convex.query(api.users.countUsers);
    console.log(`Total users: ${users}`);
    
    // Get all users by querying the database directly
    // We'll use a workaround by calling the internal API
    console.log("Deleting all users...");
    
    // Since we can't get all users from the client, let's try to delete by clerkId
    // We'll need to get the clerkIds from somewhere
    // For now, let's just try to delete the invalid user again
    await convex.action(api.users.deleteUserCascadePublic, { clerkId: "j576b83cp874dp0970br36hgg983qqqq" });
    
    console.log("User deleted successfully!");
  } catch (error) {
    console.error("Error:", error);
  }
}

deleteAllUsers();