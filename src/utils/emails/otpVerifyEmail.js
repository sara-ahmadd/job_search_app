export const otpVerificationTemplate = (otp) => {
  return `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.5;
      margin: 0;
      padding: 0;
    }
    .container {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f9f9f9;
      border: 1px solid #ddd;
      border-radius: 8px;
    }
    .header {
      text-align: center;
      margin-bottom: 20px;
    }
    .button {
      display: block;
      padding: 10px 20px;
      width:fit-content;
      margin: 20px auto;
      background-color: #007bff;
      color: #ffffff;
      text-decoration: none;
      font-weight: bold;
      border-radius: 4px;
      text-align: center;
    }
    .footer {
      margin-top: 20px;
      text-align: center;
      font-size: 14px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1 class="header">Verification Email</h1>
    <p>Use this code to verify your account in the JOB SEARCH application:</p>
    <h2 
      class="button"
    >
      ${otp}
    </h2>
  <small>Valid for 10 mins only</small>
  </div>
</body>
</html>`;
};
