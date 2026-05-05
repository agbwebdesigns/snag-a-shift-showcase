export function CreateJobForm() {
  return (
    <div className="loginform-container">
      <form className="loginform">
        <p>Create a Job</p>
        <input type="text" name="jobtitle" placeholder="Job Title" />
        <input type="text" name="description" placeholder="Description" />
        <input type="date" name="date" placeholder="Date" />
        <input type="number" name="dollarsperhr" placeholder="Hourly Wage" />
        <input type="time" name="worktime" placeholder="Shift Start Time" />
        <input type="time" name="endtime" placeholder="shift End Time" />
        <input
          className="submitbutton"
          type="submit"
          name="submit"
          value="Create Shift"
        />
      </form>
    </div>
  );
}
