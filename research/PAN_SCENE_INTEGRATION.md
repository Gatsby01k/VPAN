# PAN — coherent scene integration

Historical iteration: the current authored SVG scene is documented in `PAN_NATIVE_ART.md`.

The owner's feedback was that the composition still looked like pasted photographs. This revision retains the folded dashboard arrangement and original artwork while changing how the layers relate.

- One main server sculpture, instead of duplicate server pictures in the hero and overview.
- Shared graphite glass with fine edges; removed the broad bright pink fill and heavy device outline.
- Native vector floor, small anchored callouts, reflection and connecting traces ground the sculpture. The supplied atmosphere becomes a faint material layer.
- The overview is a vector orbital instrument with five nodes drawn from the five real partner roles. Role selection lights its matching node and route, and continues to update the profile and application URL.
- A restrained material sheen, moving route highlights and fine-pointer depth supply motion. Existing logo motion remains. All continuous scene animations and pointer movement respect reduced-motion preferences.

Implementation: `SculptureStage.tsx`, `NetworkOrbit.tsx`, `NetworkConsole.tsx`, and the scoped `scene` CSS layer. No new image generation or raster edits were performed; the existing alpha asset remains unchanged.

Validation: production build passed and prerendered 23 routes. All 16 existing integration tests passed. `git diff --check` passed. Browser access to the local preview was blocked by URL policy, so this iteration has not received a fresh visual browser check or screenshot.
