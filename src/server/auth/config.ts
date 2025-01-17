import { PrismaAdapter } from "@auth/prisma-adapter";
import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
} from "next-auth"; 
import DiscordProvider from "next-auth/providers/discord"; 
import { db } from "~/server/db";
 
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  } 
}
 
export const authConfig = {
  providers: [
    DiscordProvider({
      clientId: process.env.AUTH_DISCORD_ID ?? "",
      clientSecret: process.env.AUTH_DISCORD_SECRET ?? "",
    }), 
  ],
  adapter: PrismaAdapter(db),
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
  },
} satisfies NextAuthOptions;


export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authConfig);
};
