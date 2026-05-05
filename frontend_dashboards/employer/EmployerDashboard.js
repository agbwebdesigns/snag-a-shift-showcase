import { RestauranteursDashboardOptions } from "./RestauranteursDashboardOptions";
import { useEffect } from "react";
import { messaging } from "../../firebase";

export function EmployerDashboard({
  onDisplaySet,
  onDataSet,
  token,
  onViewOpenJobs,
  stripeCustomerId,
  paymentMethodCheck,
  missingTOSAgreement,
}) {
  useEffect(() => {
    // Request permission for notifications
    const requestPermission = async () => {
      try {
        await Notification.requestPermission();
        const fcmtoken = await messaging.getToken({
          vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY,
        });
        // Save this token to your server or local storage
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/restauranteur/save-fcmtoken`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ fcmtoken: fcmtoken }),
          },
        );
        if (!response.ok) {
          throw new Error("Unable to save fcmtoken!");
        }
      } catch (error) {
        console.error("Error getting FCM token:", error);
      }
    };

    requestPermission();

    // Handle incoming messages
    messaging.onMessage((payload) => {
      const notificationTitle = payload.data.title;
      const notificationOptions = {
        body: payload.data.body,
        icon: "/firebase-logo.png",
      };

      new Notification(notificationTitle, notificationOptions);
    });
  }, []);

  return (
    <div className="dashboard">
      <h1>Welcome to your dashboard!</h1>
      <RestauranteursDashboardOptions
        onDisplaySet={onDisplaySet}
        onDataSet={onDataSet}
        token={token}
        onViewOpenJobs={onViewOpenJobs}
        stripeCustomerId={stripeCustomerId}
        paymentMethodCheck={paymentMethodCheck}
        missingTOSAgreement={missingTOSAgreement}
      />
    </div>
  );
}
