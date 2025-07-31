export const emailTemplate = ({ otp, title = "Confirm Code" } = {}) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>${title}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #121212;
          margin: 0;
          padding: 0;
          color: #f1f1f1;
        }
        .container {
          background-color: #1e1e1e;
          max-width: 600px;
          margin: 50px auto;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);
          text-align: center;
        }
        .logo {
          width: 100px;
          margin-bottom: 20px;
        }
        h2 {
          color: #ffffff;
          margin-bottom: 10px;
        }
        p {
          color: #cccccc;
          font-size: 16px;
          margin-bottom: 20px;
        }
        .otp {
          font-size: 28px;
          font-weight: bold;
          background: #2c2c2c;
          padding: 12px 24px;
          border-radius: 10px;
          display: inline-block;
          letter-spacing: 4px;
          color: #00ffcc;
        }
        .footer {
          margin-top: 30px;
          font-size: 12px;
          color: #888;
        }
        .social-icons img {
          width: 30px;
          margin: 0 8px;
          filter: brightness(0.8);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <img
          src="cid:customLogo"
          alt="App Logo"
          class="logo"
        />
        <h2>${title}</h2>
        <p>Please use the code below:</p>
        <div class="otp">${otp}</div>
        <p>This code will expire shortly. Do not share it with anyone.</p>
        <div class="footer">
          <p>Follow us:</p>
          <div class="social-icons">
            <a href="${process.env.facebookLink || "#"}"><img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook" /></a>
            <a href="${process.env.instegram || "#"}"><img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="Instagram" /></a>
            <a href="${process.env.twitterLink || "#"}"><img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" alt="Twitter" /></a>
          </div>
          <p style="margin-top: 15px;">&copy; ${new Date().getFullYear()} Your App. All rights reserved.</p>
        </div>
      </div>
    </body>
  </html>
  `;
};
