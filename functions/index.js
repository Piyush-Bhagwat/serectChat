const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const db = admin.firestore();

exports.deleteOldMessages = functions.pubsub
    .schedule("every 1 hours") // runs every hour
    .onRun(async (context) => {
        const now = admin.firestore.Timestamp.now();
        const oneDayAgo = new Date(
            now.toDate().getTime() - 24 * 60 * 60 * 1000
        );

        const snapshot = await db
            .collection("messages")
            .where(
                "createdAt",
                "<",
                admin.firestore.Timestamp.fromDate(oneDayAgo)
            )
            .get();

        const batch = db.batch();

        snapshot.forEach((doc) => {
            batch.delete(doc.ref);
        });

        await batch.commit();
        console.log(`Deleted ${snapshot.size} old messages`);
    });
