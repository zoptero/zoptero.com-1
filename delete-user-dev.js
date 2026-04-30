const { ConvexClient } = require("convex/browser");
require("dotenv").config({ path: ".env.local" });

const convex = new ConvexClient(process.env.NEXT_PUBLIC_CONVEX_URL);

async function deleteInvalidUserDev() {
  try {
    console.log("Connecting to development Convex...");
    console.log("Convex URL:", process.env.NEXT_PUBLIC_CONVEX_URL);
    
    // Delete the invalid user with "individual" accountType from development database
    console.log("Deleting invalid user from development database...");
    await convex.action(
      convex._internalAction("users:deleteUserCascadePublic"),
      { clerkId: "j576b83cp874dp0970br36hgg983qqqq" }
    );
    
    console.log("✓ Invalid user deleted successfully from development database!");
  } catch (error) {
    console.error("✗ Error deleting user:", error);
  }
}

deleteInvalidUserDev();