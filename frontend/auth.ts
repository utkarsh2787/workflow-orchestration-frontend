import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { loginGoogle } from "./api_services/auth.service";
import axios from "axios";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  callbacks: {
    async redirect({ url, baseUrl }) {
      console.log({ url, baseUrl });
      return url;
    },
    // async signIn({ user, account, profile }) {
    //   try {
    //     try {
    //       const resp = await axios.post(
    //         `api/user/login/google`,
    //         { email: user.email, name: user.name },
    //       );
    //       console.log("✅ Google sign-in successful:", resp.data);
    //     } catch (error) {
    //       throw error;
    //     }
    //     return true;
    //   } catch (err) {
    //     console.error("❌ Google sign-in failed:", err);
    //     return false;
    //   }
    // }
  }
})