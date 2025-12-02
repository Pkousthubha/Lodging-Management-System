// export const BaseUrl = "/api";

export const baseUrl = import.meta.env.VITE_API_BASE_URL;

export const Enviroment = import.meta.env.VITE_ENVIRONMENT;

export const AppName = import.meta.env.VITE_APP_NAME;

export const SessionTimeoutMinutes = import.meta.env.VITE_SESSION_TIMEOUT_MINUTES;

export const ContentType = "application/json";

export const auth = {
  login: `${baseUrl}/api/Auth/Login`,
  verify_resend_otp: `${baseUrl}/api/OTP/VerifyResendOTP`,
  change_password: `${baseUrl}/api/Auth/ChangePassword`,
  forgot_password: `${baseUrl}/api/Auth/ForgotPasswordRequest`,
  reset_password: `${baseUrl}/api/Auth/ResetPassword`,
  refresh_token: "/api/Auth/RefreshToken",
};

export const common = {
  getDropdownList: `${baseUrl}/api/Master/GetDropDownData`
};

export const employee = {
  getEmployeeList: `${baseUrl}/api/Employee/GetEmployeeMasterList`,
  getEmployeeDetails: `${baseUrl}/api/Employee/GetEmployeeDetails`,
  deleteEmployeeDetails: `${baseUrl}/api/Employee/DeleteEmployeeMaster`,
  saveUpdateEmployeeDetails: `${baseUrl}/api/Employee/SaveAndUpdateEmployee`,
  getEmployeeSecurityAccessList: `${baseUrl}/api/Employee/GetEmployeeSecurityAccessList`,
  saveUpdateEmployeeSecurityAccess: `${baseUrl}/api/Employee/SaveAndUpdateEmployeeSecurityAccess`,
};

/**
 * GLOBAL BASE URL GUARD
 * Will be reused by axiosSetup.js
 */
export const ensureBaseUrl = () => {
  if (!baseUrl) {
    throw new Error(
      "API Base URL is not configured. Please set the VITE_API_BASE_URL environment variable to the correct URL for your environment and restart the application."
    );
  }
};

export const ensureEnvironment = () => {
  if (!Enviroment) {
    throw new Error(
      "Environment is not configured. Please set the VITE_ENVIRONMENT environment variable to the correct URL for your environment and restart the application."
    );
  }
};
