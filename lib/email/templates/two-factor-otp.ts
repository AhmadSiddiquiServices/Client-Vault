type TwoFactorOtpEmailOptions = {
  userName: string;
  otp: string;
  expiresInMinutes: number;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function createTwoFactorOtpEmail({
  userName,
  otp,
  expiresInMinutes,
}: TwoFactorOtpEmailOptions) {
  const safeUserName = escapeHtml(userName);

  /**
   * Email clients require an absolute URL for images.
   *
   * Example:
   * https://client-vault-kappa.vercel.app/images/logo.png
   */
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://client-vault-kappa.vercel.app";

  const logoUrl = `${appUrl.replace(/\/$/, "")}/images/logo.png`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />
  <meta name="x-apple-disable-message-reformatting" />

  <title>Your ClientVault verification code</title>

  <style>
    html,
    body {
      margin: 0;
      padding: 0;
      width: 100%;
      background: #0a0a0a;
    }

    body {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }

    table {
      border-collapse: collapse;
    }

    img {
      border: 0;
      display: block;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }

    .email-wrapper {
      width: 100%;
      padding: 40px 16px;
      box-sizing: border-box;
      background: #0a0a0a;
    }

    .email-card {
      width: 100%;
      max-width: 520px;
      margin: 0 auto;
      border: 1px solid #262626;
      border-radius: 14px;
      background: #111111;
      overflow: hidden;
    }

    .email-header {
      padding: 26px 28px;
      border-bottom: 1px solid #262626;
      text-align: center;
    }

    .email-logo {
      width: 138px;
      max-width: 100%;
      height: auto;
      margin: 0 auto;
    }

    .email-content {
      padding: 28px;
    }

    .email-title {
      margin: 0;
      font-size: 24px;
      line-height: 1.3;
      font-weight: 700;
      color: #ffffff;
    }

    .email-text {
      margin: 12px 0 0;
      font-size: 14px;
      line-height: 1.7;
      color: #a3a3a3;
    }

    .email-text-small {
      margin: 0;
      font-size: 12px;
      line-height: 1.7;
      color: #737373;
    }

    .otp-box {
      margin: 28px 0;
      padding: 18px;
      border: 1px solid #262626;
      border-radius: 12px;
      background: #0a0a0a;
      text-align: center;
    }

    .otp-label {
      font-size: 11px;
      line-height: 1.5;
      color: #737373;
      text-transform: uppercase;
      letter-spacing: 1.5px;
    }

    .otp-code {
      margin-top: 10px;
      font-size: 32px;
      line-height: 1;
      font-weight: 700;
      letter-spacing: 8px;
      color: #00e676;
    }

    .warning-text {
      margin: 20px 0 0;
      font-size: 12px;
      line-height: 1.7;
      color: #737373;
    }

    .email-footer {
      padding: 18px 28px;
      border-top: 1px solid #262626;
      text-align: center;
    }

    .footer-text {
      margin: 0;
      font-size: 10px;
      line-height: 1.6;
      color: #525252;
    }

    @media only screen and (max-width: 600px) {
      .email-wrapper {
        padding: 20px 10px !important;
      }

      .email-card {
        width: 100% !important;
        border-radius: 12px !important;
      }

      .email-header {
        padding: 22px 18px !important;
      }

      .email-logo {
        width: 120px !important;
        max-width: 80% !important;
        height: auto !important;
      }

      .email-content {
        padding: 22px 18px !important;
      }

      .email-title {
        font-size: 20px !important;
        line-height: 1.35 !important;
      }

      .email-text {
        margin-top: 10px !important;
        font-size: 13px !important;
        line-height: 1.65 !important;
      }

      .otp-box {
        margin: 22px 0 !important;
        padding: 16px 12px !important;
      }

      .otp-label {
        font-size: 10px !important;
        letter-spacing: 1.2px !important;
      }

      .otp-code {
        margin-top: 9px !important;
        font-size: 27px !important;
        letter-spacing: 6px !important;
      }

      .email-text-small {
        font-size: 11px !important;
        line-height: 1.65 !important;
      }

      .warning-text {
        margin-top: 16px !important;
        font-size: 11px !important;
        line-height: 1.65 !important;
      }

      .email-footer {
        padding: 16px 18px !important;
      }

      .footer-text {
        font-size: 9px !important;
        line-height: 1.6 !important;
      }
    }
  </style>
</head>

<body>
  <table
    role="presentation"
    cellpadding="0"
    cellspacing="0"
    border="0"
    width="100%"
    style="width:100%;background:#0a0a0a;"
  >
    <tr>
      <td align="center">

        <div class="email-wrapper">

          <table
            role="presentation"
            cellpadding="0"
            cellspacing="0"
            border="0"
            width="100%"
            class="email-card"
          >

            <!-- Header / Logo -->
            <tr>
              <td
                class="email-header"
                align="center"
              >
                <img
                  src="${logoUrl}"
                  alt="ClientVault"
                  width="138"
                  class="email-logo"
                />
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td class="email-content">

                <h1 class="email-title">
                  Verify your sign-in
                </h1>

                <p class="email-text">
                  Hi ${safeUserName},
                </p>

                <p class="email-text">
                  Someone is signing in to your ClientVault account.
                  Use the verification code below to continue.
                </p>

                <!-- OTP -->
                <div class="otp-box">

                  <div class="otp-label">
                    Verification Code
                  </div>

                  <div class="otp-code">
                    ${otp}
                  </div>

                </div>

                <p class="email-text-small">
                  This code expires in ${expiresInMinutes} minutes.
                  For your security, never share this code with anyone.
                </p>

                <p class="warning-text">
                  If you did not attempt to sign in to ClientVault,
                  secure your account immediately by changing your password.
                </p>

              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td class="email-footer">

                <p class="footer-text">
                  This is an automated security email from ClientVault.
                  Please do not reply to this message.
                </p>

              </td>
            </tr>

          </table>

        </div>

      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = `
ClientVault - Sign-in verification

Hi ${userName},

Someone is signing in to your ClientVault account.

Your verification code is:

${otp}

This code expires in ${expiresInMinutes} minutes.

For your security, never share this code with anyone.

If you did not attempt to sign in to ClientVault, secure your account immediately by changing your password.

This is an automated security email from ClientVault.
  `.trim();

  return {
    html,
    text,
  };
}
