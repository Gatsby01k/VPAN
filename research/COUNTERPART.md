# The Counterpart

The VlaDDoS artwork supplies the shapes and connection points for the interface. The ink, paper, brass and fuchsia palette follows the original plates.

- The cover clips the existing illustration to a torn outline. A path begins at its engraved eyelet and bends around the live headline. The invitation sits on the same paper, overlapping the plate at mobile widths.
- The physical thread is a selector. Dragging the rendered ring toward the upper or lower eyelet previews the target. Releasing it selects the intent, moves the ring into place and updates the brief link. The ring also accepts keyboard input. The radio controls work independently of WebGL and provide the same choices with reduced motion enabled.
- The participant index sits over the printed knot. The payment atlas uses [Natural Earth 1:110m geography](https://github.com/nvkelso/natural-earth-vector/tree/v5.1.2/geojson) and draws a thread from the eyelet of a new brass shuttle illustration to every country with the selected payment method. The original VlaDDoS exchange plate served as the illustration reference. Country names sit above the map as keyboard-accessible stops. The shuttle rewinds the active payment method while retaining the selected country. A route link restores the region, payment method and country, including after visiting a market page. The lower map margin shows the number of matching countries, and the country pane groups payment methods, the research note and links to the country profile and filtered directory. The introduction process follows a single stitched line, while the brief sits on a cut sheet over the exchange artwork.
- The site masthead, route arrows, selection eyelets, tickets and request feedback share the cord and brass details. Contact and About layer the original plates with live copy, and country pages use a small engraved medallion.
- WebGL loads only near the thread scene and pauses when it leaves the viewport. The existing rope solver, renderer, both brief routes, role and country prefills, translations and business endpoints are retained.

The Network opening uses separate brass clasps illustrated from the original exchange plate. The regional directory and each country profile reuse the atlas geography in their own engravings. Sector disclosures, proceedings, and field-note navigation carry the thread marks into the controls.

Use Node 24 in the VPAN directory and start a local server:

```sh
npm run build
npm run qa:serve
```

Open http://127.0.0.1:3100/. The QA server uses a disposable database and a local notification receiver.

The recovery patch and archive for the first redesign are in the shared workspace at `previews/counterpart/recovery/`. They restore into a clean copy of the recorded base commit. The pre-redesign site is the base commit itself.
