import NextAuth from 'next-auth';
// import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';

// import nodemailer from "nodemailer";
// import Handlebars from "handlebars";

import { prisma } from '@/lib/prisma';

// import { readFileSync } from "fs";
// import path from "path";

// Email sender
// const transporter = nodemailer.createTransport({
//   host: process.env.EMAIL_SERVER_HOST!,
//   port: process.env.EMAIL_SERVER_PORT,
//   auth: {
//     user: process.env.EMAIL_SERVER_USER,
//     pass: process.env.EMAIL_SERVER_PASSWORD,
//   },
//   secure: true,
// });

// const emailsDir = path.resolve(process.cwd(), "emails");

// const sendVerificationRequest = ({ identifier, url }: {identifier: any, url: string}):void => {
//   const emailFile = readFileSync(path.join(emailsDir, "confirm-email.html"), {
//     encoding: "utf8",
//   });
//   const emailTemplate = Handlebars.compile(emailFile);
//   transporter.sendMail({
//     from: `"✨ SupaVacation" ${process.env.EMAIL_FROM}`,
//     to: identifier,
//     subject: "Your sign-in link for SupaVacation",
//     html: emailTemplate({
//       base_url: process.env.NEXTAUTH_URL,
//       signin_url: url,
//       email: identifier,
//     }),
//   });
// };

// const sendWelcomeEmail = async ({ user }: {
//   user: {
//     email: string
//   }
// }):Promise<void> => {
//   const { email } = user;

//   try {
//     const emailFile = readFileSync(path.join(emailsDir, "welcome.html"), {
//       encoding: "utf8",
//     });
//     const emailTemplate = Handlebars.compile(emailFile);
//     await transporter.sendMail({
//       from: `"✨ SupaVacation" ${process.env.EMAIL_FROM}`,
//       to: email,
//       subject: "Welcome to SupaVacation! 🎉",
//       html: emailTemplate({
//         base_url: process.env.NEXTAUTH_URL,
//         support_email: "support@themodern.dev",
//       }),
//     });
//   } catch (error) {
//     console.log(`❌ Unable to send welcome email to user (${email})`);
//   }
// };

export default NextAuth({
  pages: {
    signIn: '/',
    signOut: '/',
    error: '/',
    verifyRequest: '/',
  },
  providers: [
    // EmailProvider({
    //   maxAge: 10 * 60,
    //   sendVerificationRequest,
    // }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  // events: { createUser: sendWelcomeEmail },
});
