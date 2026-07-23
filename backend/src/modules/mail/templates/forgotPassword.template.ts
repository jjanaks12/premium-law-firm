export const forgotPasswordTemplate = (otp: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
    .otp { font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #0056b3;
           background: #f4f4f4; padding: 12px; text-align: center; border-radius: 6px; margin: 20px 0; }
    .footer { margin-top: 20px; font-size: 12px; color: #777; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Password Reset OTP</h2>
    <p>Use the code below to reset your password. It expires in <strong>10 minutes</strong>.</p>
    <div class="otp">${otp}</div>
    <p>If you did not request this, ignore this email.</p>
    <div class="footer"><p>The ECAN Team</p></div>
  </div>
</body>
</html>
`;
