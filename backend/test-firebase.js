require("dotenv").config();
const { db, bucket } = require("./config/firebase");

async function testFirebase() {
  try {
    // Test Firestore
    console.log("Testing Firestore...");
    const testRef = await db.collection("test").add({
      message: "Hello Firebase!",
      timestamp: new Date(),
    });
    console.log("✅ Firestore works! Document ID:", testRef.id);

    // Clean up
    await testRef.delete();
    console.log("✅ Test document deleted");

    // Test Storage
    console.log("\nTesting Storage...");
    console.log("✅ Storage bucket:", bucket.name);

    console.log("\n🎉 Firebase setup successful!");
  } catch (error) {
    console.error("❌ Firebase error:", error.message);
  }
}

testFirebase();
