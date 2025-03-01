export const rejectionTemplate = (applicantName, jobTitle, companyName) => {
  return `<!-- Rejection Email Template -->
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Application Rejected</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
    <div style="max-width: 600px; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0px 0px 10px #cccccc;">
        <h2 style="color: #C0392B;">Dear ${applicantName},</h2>
        <p>Thank you for applying for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong>.</p>
        <p>After careful consideration, we regret to inform you that we have decided to move forward with other candidates.</p>
        <p>We appreciate your interest in our company and encourage you to apply again in the future.</p>
        <p>Best wishes,</p>
        <p><strong>Job Search Application📕</strong></p>
    </div>
</body>
</html>`;
};
