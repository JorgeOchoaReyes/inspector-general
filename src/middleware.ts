
import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ req }) => {
      // verify token and return a boolean
      const sessionToken = req.cookies.get(
        process.env.NODE_ENV === "production" ?
          "__Secure-next-auth.session-token" :
          "next-auth.session-token"
      );
      if (sessionToken) return true;
      else return false;
    },
  },
});
 

export const config = { matcher: [ 
  "/dashboard(.*)"
] };