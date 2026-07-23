export const notificationTemplate = (title: string, message: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
    .footer { margin-top: 20px; font-size: 12px; color: #777; }
  </style>
</head>
<body>
  <div class="container">
    <h2>${title}</h2>
    <p>${message}</p>
    <div class="footer"><p>The ECAN Team</p></div>
  </div>
</body>
</html>
`;
