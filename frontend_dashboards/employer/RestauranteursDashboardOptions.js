import { DashboardButton } from "../../buttons/DashboardButton";

export function RestauranteursDashboardOptions({
  onDisplaySet,
  onViewOpenJobs,
  stripeCustomerId,
  paymentMethodCheck,
  missingTOSAgreement,
}) {
  return (
    <div className="dash-button-box">
      <DashboardButton
        onDisplaySet={onDisplaySet}
        screen={21}
        style={{ background: "#bceae3", width: "80vw" }}
      >
        Messages
      </DashboardButton>
      {stripeCustomerId === true &&
        paymentMethodCheck === true &&
        !missingTOSAgreement && (
          <div className="nested-button-box">
            <div className="inner-nested-button-box">
              <DashboardButton
                onDisplaySet={onDisplaySet}
                screen={13}
                style={{ background: "#ffe4cf" }}
              >
                Create a Shift
              </DashboardButton>
              <button
                className="dashboard-buttons"
                onClick={() => onViewOpenJobs(true, 14, false, "week")}
                style={{ background: "#ffe4cf" }}
              >
                Open Shifts
              </button>
            </div>
            <div className="inner-nested-button-box">
              <button
                className="dashboard-buttons"
                onClick={() => onViewOpenJobs(false, 18, false, "week")}
                style={{ background: "#ffe4cf" }}
              >
                Hired Shifts
              </button>
              <button
                className="dashboard-buttons"
                onClick={() => onViewOpenJobs(false, 20, true, "week")}
                style={{ background: "#ffe4cf" }}
              >
                Completed Shifts
              </button>
            </div>
          </div>
        )}
      <DashboardButton
        onDisplaySet={onDisplaySet}
        screen={8}
        style={{ background: "#ff8da8", width: "80vw" }}
      >
        Manage Account
      </DashboardButton>
    </div>
  );
}
