import { create } from "zustand";
import { devtools, persist } from "zustand/middleware"; 

interface DemoState {
  prUrl: string;
  setPrUrl: (prUrl: string) => void;
  diffText: string;
  setDiffText: (diffText: string) => void;
  inspectorGeneralReview: string;
  setInspectorGeneralReview: (inspectorGeneralReview: string) => void;
  reset: () => void;
}

const defauilt = { 
  "diffText": "diff --git a/src/server/api/routers/genius.ts b/src/server/api/routers/genius.ts\nindex dece016..4a01403 100644\n--- a/src/server/api/routers/genius.ts\n+++ b/src/server/api/routers/genius.ts\n@@ -3,9 +3,7 @@ import {\n   createTRPCRouter, \n   publicProcedure,\n } from \"~/server/api/trpc\";\n-import { type GeniusSongReference, type GeniusHit } from \"~/schema\"; \n-import {parse} from \"node-html-parser\"; \n-\n+import { type GeniusSongReference, type GeniusHit } from \"~/schema\";  \n const geniusBaseUrl = \"https://api.genius.com\";\n const ovhApiUrl = \"https://api.lyrics.ovh\";\n \n@@ -90,11 +88,19 @@ export const geniusRouter = createTRPCRouter({\n         let lyrics = \"\";\n  \n         if(lyrics === \"\" && data?.response?.song?.primary_artist?.name && data?.response?.song?.title) { \n-          const url = `${ovhApiUrl}/v1/${data?.response?.song.primary_artist.name}/${data?.response?.song.title}`;\n-          const response = await fetch(url);\n-          const res = await response.json() as { lyrics: string }; \n-          lyrics = res.lyrics ?? \"Lyrics not found\";\n-          lyrics = (res.lyrics || \"\").replaceAll(\"\\n\\n\", \"\\n\").replaceAll(\"\\\\\", \"\").replaceAll(\"\\\"\",\"\");\n+          // console.log(\"artist: \", data?.response?.song?.primary_artist?.name);\n+          // console.log(\"title: \", data?.response?.song?.title); \n+          try{\n+            const url = `${ovhApiUrl}/v1/${data?.response?.song.primary_artist.name}/${data?.response?.song.title}`;\n+            const response = await fetch(url);\n+            const res = await response.json() as { lyrics: string }; \n+            // console.log(res);\n+            lyrics = res.lyrics ?? \"Lyrics not found\";\n+            lyrics = (res.lyrics || \"\").replaceAll(\"\\n\\n\", \"\\n\").replaceAll(\"\\\\\", \"\").replaceAll(\"\\\"\",\"\");\n+          } catch (err) {\n+            console.log(err); \n+            lyrics = \"Lyrics not found\"; \n+          }\n         } else {\n           lyrics = \"Lyrics not found\";\n         }\n",
  "inspectorGeneralReview": "The pull request adds error handling for fetching lyrics from the `ovh` API.  This is a good improvement. However, the error handling could be more robust and informative.\n\n1. **Generic Error Handling:** The `catch (err)` block only logs the error.  It should also include more context, such as the specific request URL that failed and potentially a more user-friendly error message to be returned to the client.\n\n   ```javascript\n   } catch (err) {\n     console.error(\"Error fetching lyrics from OVH API for URL:\", url, err); \n     lyrics = \"Failed to retrieve lyrics. Please try again later.\"; //More user-friendly message\n   }\n   ```\n\n2. **Specific Error Handling (Optional):**  Consider handling specific HTTP error codes (e.g., 404 Not Found) differently.  A 404 might indicate that the song/artist is not found in the OVH API,  allowing for a more precise message to the user.\n\n3. **Avoid Unnecessary `replaceAll` Calls:** The multiple `replaceAll` calls can be chained together for efficiency:\n\n   ```javascript\n   lyrics = (res.lyrics || \"\").replaceAll(/\\\\|\\n\\n|\"/g, \"\");\n   ```\n   This single line replaces all occurrences of `\\`, `\\n\\n`, and `\"`.  The `/g` flag ensures all occurrences are replaced.\n\n\n4. **Consider using a dedicated logging library:**  Instead of using `console.log` and `console.error`, consider using a structured logging library like `pino` or `winston`. This will allow for easier monitoring and debugging in production.\n\n\nThe improved `getSong` function incorporating these suggestions would look like this:\n\n```javascript\n  getSong: publicProcedure\n    .input(z.object({ api_path: z.string() }))\n    .mutation(async ({ input }) => {\n      // ... (rest of the code remains the same)\n\n        if(lyrics === \"\" && data?.response?.song?.primary_artist?.name && data?.response?.song?.title) { \n          try{\n            const url = `${ovhApiUrl}/v1/${data?.response?.song.primary_artist.name}/${data?.response?.song.title}`;\n            const response = await fetch(url);\n            if (!response.ok) {\n              console.error(`OVH API request failed with status ${response.status} for URL: ${url}`);\n              lyrics = `Failed to retrieve lyrics (HTTP ${response.status}). Please try again later.`;\n              return;\n            }\n            const res = await response.json() as { lyrics: string }; \n            lyrics = (res.lyrics || \"\").replaceAll(/\\\\|\\n\\n|\"/g, \"\");\n          } catch (err) {\n            console.error(\"Error fetching lyrics from OVH API for URL:\", url, err); \n            lyrics = \"Failed to retrieve lyrics. Please try again later.\"; \n          }\n        } else {\n          lyrics = \"Lyrics not found\";\n        }\n        // ... (rest of the code remains the same)\n\n    }),\n```\n"
};

export const useDemoStore = create<DemoState>()(
  devtools(
    persist(
      (set) => ({
        prUrl: "",
        setPrUrl: (prUrl) => set({ prUrl }),
        diffText: defauilt.diffText,
        setDiffText: (diffText) => set({ diffText }),
        inspectorGeneralReview: defauilt.inspectorGeneralReview,
        setInspectorGeneralReview: (inspectorGeneralReview) =>
          set({ inspectorGeneralReview }),
        reset: () =>
          set({
            prUrl: "",
            diffText: "",
            inspectorGeneralReview: "",
          }),
      }),
      {
        name: "inspector-general-demo-storage",
      },
    ),
  ),
);