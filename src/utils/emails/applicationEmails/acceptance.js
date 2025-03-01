export const acceptanceTemplate = (applicantName, jobTitle) => {
  return `<!-- Acceptance Email Template -->
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Application Accepted</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
    <div style="max-width: 600px; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0px 0px 10px #cccccc;">
        <h2 style="color: #2E86C1;">Congratulations, ${applicantName}!</h2>
        <p>We are pleased to inform you that your application for the <strong>${jobTitle}</strong> position has been accepted.</p>
        <p>Our HR team will contact you soon with the next steps.</p>
        <p>Looking forward to having you on board!</p>
        <p>Best regards,</p>
        <p><strong>Jo Search App📕</strong></p>
    </div>
</body>
</html>`;
};
