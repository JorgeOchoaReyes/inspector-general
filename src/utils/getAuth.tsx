import { type GetServerSideProps } from "next";
import { getSession } from "next-auth/react";

export const getAuthPageProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/sign-in",
        permanent: false,
      },
    };
  }

  return {
    props: {
      session,
      query: context.query,
    },
  };
};