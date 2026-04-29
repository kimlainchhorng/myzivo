# Page snapshot

```yaml
- generic [ref=e2]:
  - link "Skip to main content" [ref=e3] [cursor=pointer]:
    - /url: "#main-content"
  - region "Notifications (F8)":
    - list
  - region "Notifications alt+T"
  - generic [ref=e5]:
    - img [ref=e6]
    - paragraph [ref=e8]: Loading...
  - generic [ref=e13]:
    - img [ref=e15]
    - generic [ref=e17]:
      - heading "We Value Your Privacy" [level=3] [ref=e18]:
        - text: We Value Your Privacy
        - img [ref=e19]
      - paragraph [ref=e21]:
        - text: We use cookies to enhance your experience, analyze site traffic, and for marketing purposes. By clicking "Accept All", you consent to our use of cookies. Read our
        - link "Privacy Policy" [ref=e22] [cursor=pointer]:
          - /url: /privacy-policy
        - text: .
      - generic [ref=e23]:
        - button "Accept All" [ref=e25] [cursor=pointer]
        - button "Reject All" [ref=e26] [cursor=pointer]
        - button "Customize" [ref=e27] [cursor=pointer]:
          - img
          - text: Customize
    - button [ref=e29] [cursor=pointer]:
      - img
```