# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - navigation [ref=e4]:
      - link "← Back" [ref=e5] [cursor=pointer]:
        - /url: /
        - button "← Back" [ref=e6]
      - img "Outfit Picker Logo" [ref=e7]
      - link "Manage items" [ref=e8] [cursor=pointer]:
        - /url: /items
        - button "Manage items" [ref=e9]
    - generic [ref=e10]:
      - heading "Foreslå outfit" [level=1] [ref=e11]
      - link "Se gemte outfits" [ref=e12] [cursor=pointer]:
        - /url: /outfits
        - button "Se gemte outfits" [ref=e13]
      - button "Generate" [ref=e14]
      - list
  - contentinfo [ref=e15]: © 2025 Outfit Picker
  - alert [ref=e16]
```