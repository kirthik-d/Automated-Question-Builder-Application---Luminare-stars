import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";

// MSAL configuration
const msalConfig = {
    auth: {
        clientId: "e3d709a8-6042-4a6a-b058-c4293a989b54", 
        authority: "https://login.microsoftonline.com/7c0c36f5-af83-4c24-8844-9962e0163719",
        redirectUri: "http://localhost:3000",
    },
    cache: {
        cacheLocation: "localStorage",
        storeAuthStateInCookie: true, 
    },
};

// Initialize the MSAL instance
const msalInstance = new PublicClientApplication(msalConfig);

// Provide the MSAL instance to the app
export const AuthProvider = ({ children }) => {
    return <MsalProvider instance={msalInstance}>{children}</MsalProvider>;
};
