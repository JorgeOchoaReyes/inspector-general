import { create } from "zustand";
import { devtools, persist } from "zustand/middleware"; 

interface Storage {
    does_user_have_github_token: boolean;
    setDoesUserHaveGithubToken: (does_user_have_github_token: boolean) => void;
}

export const useStorage = create<Storage>()(
  devtools(
    persist(
      (set) => ({
        does_user_have_github_token: false,
        setDoesUserHaveGithubToken: (does_user_have_github_token) => set({ does_user_have_github_token }),
      }),
      {
        name: "inspector-general-storage",
      },
    ),
  ),
);