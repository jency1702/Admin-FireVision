// backend/controllers/fireAlertController.js
const admin = require("firebase-admin");
const sgMail = require("@sendgrid/mail");

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const db = admin.firestore();

// ⭐ SEND FIRE ALERT TO ALL REGISTERED USERS
exports.sendFireAlert = async (req, res) => {
  try {
    const {
      fireLocation,
      confidence,
      cctvFootage,
      imageBase64,
      cause,
      dangerScore,
      timestamp,
    } = req.body;

    // Validate input
    if (!fireLocation || confidence === undefined) {
      return res.status(400).json({
        success: false,
        error: "fireLocation and confidence are required",
      });
    }

    // Validate SendGrid API Key
    if (!process.env.SENDGRID_API_KEY) {
      console.error("❌ SENDGRID_API_KEY not configured");
      return res.status(500).json({
        success: false,
        error: "Email service not configured",
      });
    }

    console.log("🔥 Starting fire alert process...");

    // 1. FETCH ALL REGISTERED USERS WITH EMAIL
    const usersSnapshot = await db.collection("users").get();
    const users = [];
    const emails = [];

    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      if (userData.email) {
        users.push({ id: doc.id, ...userData });
        emails.push(userData.email);
      }
    });

    console.log(`📧 Found ${emails.length} registered users`);

    if (emails.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No registered users with email addresses found",
      });
    }

    // 2. CREATE ALERT DOCUMENT IN DATABASE
    const alertData = {
      source: "CCTV",
      fireLocation: fireLocation,
      confidence: confidence,
      cctvFootage: cctvFootage || "CCTV-001",
      cause: cause || "Unknown",
      dangerScore: dangerScore || 0,
      timestamp: admin.firestore.Timestamp.now(),
      message: `🚨 FIRE ALERT: Detected at ${fireLocation} with ${(
        confidence * 100
      ).toFixed(1)}% confidence`,
      status: "active",
      recipientsCount: emails.length,
      emailsSent: [],
    };

    const alertRef = await db.collection("fireAlerts").add(alertData);
    console.log(`✅ Alert document created: ${alertRef.id}`);

    // 3. PREPARE EMAIL CONTENT
    const emailHtml = generateEmailHTML({
      fireLocation,
      confidence,
      cctvFootage,
      cause,
      dangerScore,
    });

    // 4. SEND EMAILS USING SENDGRID
    const emailPromises = emails.map((email) => {
      const msg = {
        to: email,
        from: process.env.SENDGRID_FROM_EMAIL || "noreply@firevision.com",
        subject: "🚨 URGENT: Fire Detected - FireVision Alert System",
        html: emailHtml,
        text: generateEmailText({
          fireLocation,
          confidence,
          cctvFootage,
          cause,
          dangerScore,
        }),
      };

      return sgMail
        .send(msg)
        .then(() => {
          console.log(`✅ Email sent to ${email}`);
          return email;
        })
        .catch((error) => {
          console.error(`❌ Failed to send email to ${email}:`, error.message);
          return null;
        });
    });

    const sentEmails = await Promise.all(emailPromises);
    const successfulEmails = sentEmails.filter((email) => email !== null);

    console.log(
      `📊 Successfully sent ${successfulEmails.length}/${emails.length} emails`
    );

    // 5. UPDATE ALERT WITH SENT EMAILS
    await alertRef.update({
      emailsSent: successfulEmails,
      successfulEmails: successfulEmails.length,
      failedEmails: emails.length - successfulEmails.length,
    });

    res.status(200).json({
      success: true,
      data: {
        alertId: alertRef.id,
        alertCount: successfulEmails.length,
        recipientEmails: successfulEmails,
        message: `Alert sent to ${successfulEmails.length}/${emails.length} users`,
      },
    });
  } catch (error) {
    console.error("❌ Error sending fire alert:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to send fire alert",
    });
  }
};

// ⭐ FETCH ALL FIRE ALERTS
exports.getAllAlerts = async (req, res) => {
  try {
    const snapshot = await db
      .collection("fireAlerts")
      .orderBy("timestamp", "desc")
      .get();

    const alerts = [];
    snapshot.forEach((doc) => {
      const alertData = doc.data();
      alerts.push({
        id: doc.id,
        ...alertData,
        timestamp: alertData.timestamp?.toDate?.() || alertData.timestamp,
        time: alertData.timestamp?.toDate?.() || alertData.timestamp,
      });
    });

    res.status(200).json({
      success: true,
      data: {
        alerts: alerts,
        count: alerts.length,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching alerts:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// ⭐ FETCH RECENT ALERTS (LAST 50)
exports.getRecentAlerts = async (req, res) => {
  try {
    const snapshot = await db
      .collection("fireAlerts")
      .orderBy("timestamp", "desc")
      .limit(50)
      .get();

    const alerts = [];
    snapshot.forEach((doc) => {
      const alertData = doc.data();
      alerts.push({
        id: doc.id,
        ...alertData,
        timestamp: alertData.timestamp?.toDate?.() || alertData.timestamp,
        time: alertData.timestamp?.toDate?.() || alertData.timestamp,
      });
    });

    res.status(200).json({
      success: true,
      data: {
        alerts: alerts,
        count: alerts.length,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching recent alerts:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// ⭐ DELETE AN ALERT
exports.deleteAlert = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Alert ID is required",
      });
    }

    await db.collection("fireAlerts").doc(id).delete();

    res.status(200).json({
      success: true,
      message: `Alert ${id} deleted successfully`,
    });
  } catch (error) {
    console.error("❌ Error deleting alert:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// ⭐ HELPER: Generate HTML Email
function generateEmailHTML(data) {
  const { fireLocation, confidence, cctvFootage, cause, dangerScore } = data;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; }
          .header { background-color: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .header p { margin: 5px 0; font-size: 18px; font-weight: bold; }
          .content { background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; }
          .content h2 { color: #7f1d1d; margin-top: 0; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          tr { border-bottom: 1px solid #f0f0f0; }
          td { padding: 12px; }
          td:first-child { font-weight: bold; color: #374151; width: 40%; }
          td:last-child { color: #1f2937; }
          .highlight { background-color: #fee2e2; }
          .actions { margin-top: 20px; padding: 15px; background-color: white; border-radius: 6px; border-left: 4px solid #f97316; }
          .actions h3 { color: #ea580c; margin-top: 0; }
          .actions ul { color: #374151; line-height: 1.8; padding-left: 20px; }
          .footer { background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; }
          .footer p { margin: 5px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 FIRE ALERT 🚨</h1>
            <p>IMMEDIATE ACTION REQUIRED</p>
          </div>

          <div class="content">
            <h2>Alert Details</h2>
            
            <table>
              <tr>
                <td>📍 Location:</td>
                <td>${fireLocation}</td>
              </tr>
              <tr class="highlight">
                <td>⚠️ Confidence:</td>
                <td><strong>${(confidence * 100).toFixed(1)}%</strong></td>
              </tr>
              <tr>
                <td>🎥 CCTV Source:</td>
                <td>${cctvFootage}</td>
              </tr>
              <tr class="highlight">
                <td>🔥 Fire Type:</td>
                <td>${cause}</td>
              </tr>
              <tr>
                <td>📊 Danger Score:</td>
                <td>${dangerScore}/10</td>
              </tr>
              <tr class="highlight">
                <td>⏰ Time:</td>
                <td>${new Date().toLocaleString()}</td>
              </tr>
            </table>

            <div class="actions">
              <h3>🚑 Recommended Actions:</h3>
              <ul>
                <li>Evacuate the area immediately if you are nearby</li>
                <li>Contact emergency services (911 or local fire department)</li>
                <li>Alert nearby personnel of the fire hazard</li>
                <li>Check the CCTV footage for detailed assessment</li>
              </ul>
            </div>
          </div>

          <div class="footer">
            <p>This is an automated alert from FireVision AI Detection System</p>
            <p>Do not reply to this email</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

// ⭐ HELPER: Generate Plain Text Email
function generateEmailText(data) {
  const { fireLocation, confidence, cctvFootage, cause, dangerScore } = data;

  return `
FIRE ALERT - IMMEDIATE ACTION REQUIRED

ALERT DETAILS:
- Location: ${fireLocation}
- Confidence: ${(confidence * 100).toFixed(1)}%
- CCTV Source: ${cctvFootage}
- Fire Type: ${cause}
- Danger Score: ${dangerScore}/10
- Time: ${new Date().toLocaleString()}

RECOMMENDED ACTIONS:
1. Evacuate the area immediately if you are nearby
2. Contact emergency services (911 or local fire department)
3. Alert nearby personnel of the fire hazard
4. Check the CCTV footage for detailed assessment

This is an automated alert from FireVision AI Detection System
Do not reply to this email
  `;
}
