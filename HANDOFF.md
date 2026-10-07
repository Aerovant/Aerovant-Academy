# Aerovant Academy site: handoff

## Latest round: About page, sample testimonials, full navigation
- `about.html` is new and replaces the old About page. Its copy uses only what the homepage already says:
  no history, dates, counts, percentages, certifications or partners.
- `js/testimonials.js` is new and holds the testimonial entries (six samples for now).
- The main navigation on every page is now Home, Courses, Internships, Workshops, Placement support,
  For colleges, About, then Login and Book a free demo. "Courses" is a plain link to the Courses section.
  Your commented-out Courses dropdown is still in `index.html` if you want it back.
- With seven links the bar is slightly tighter on laptops, and it switches to the Menu button below
  1200px wide instead of 1080px. That is the only change to existing responsive behaviour.

## What changed in the round before
Your approved `index.html` was edited in three places only: the header logo, two new sections
after "A classroom inside a working tech company", and the footer.

New files
- `login.html`, `js/auth.js`, `js/login.js`
- `privacy-policy.html`, `terms-and-conditions.html`, `refund-policy.html`
- `logo/README.txt`, `proof/README.txt`

Changed files
- `index.html`, `css/academy.css` (new rules appended at the end), `js/academy.js`

Still expected from the existing site, unchanged: `pdf/Refund_Policy.pdf`,
`pdf/Privacy_Policy.pdf`, `pdf/Terms _&_Conditions.pdf`, `logo/logo only no bg.png`.

## 1. Logo
The official Aerovant Academy logo is in place on all six pages.
- Header (light background): `logo/academy-logo-blue.png`
- Footer (dark background): `logo/academy-logo-white.png`

Both were made from the PNG files you sent. The only processing was trimming the empty margin
around the artwork and exporting at 240px height, so they stay sharp on high-density screens.
Proportions and colours are untouched. The wide JPG version was not used: it has a white
background, which would show as a white box on the header, and its proportions differ from the PNG pair.

Sizes are set in `css/academy.css` (search for `.brand__logo`): 46px tall in the desktop header,
42px with the Menu button, 56px in the footer. Width always follows the height. 46px is the height
of the header button, so the header is exactly as tall as before. To make the logo bigger, raise
those numbers; the header grows with it.

If a logo file ever goes missing, the page shows the AEROVANT Academy wordmark in type instead of a
broken image.

## 2. Student testimonials (`#students` in index.html, data in `js/testimonials.js`)
The six entries are SAMPLE DATA and say so at the top of the file.
- Each sample entry has `sample: true`. While it does, the page shows a "Sample" tag beside the name
  and a note under the heading. This is deliberate: without it, invented names and quotes would read
  as real student feedback to anyone who sees the page.
- To go live, replace each entry with a real student's details (with written permission) and delete
  its `sample: true` line. The tag and the note disappear by themselves once no sample entries remain.
- Optional per entry: `photo`, `linkedin`, and a `project` (title, summary, stack, GitHub, demo).
  The file's header comment shows the exact shape. The first entry is shown large.
- An empty list hides the whole section. No ratings or stars unless students gave them.

## 3. Proof documents (`#proof` in index.html)
Three empty sheets. Nothing is claimed.
- Put the document in `proof/` and a thumbnail in `proof/thumbs/`.
- Copy the entry from the comment above the section, set the type tab (Registration, Certificate,
  Affiliation, Accreditation, Approval), the title and the issuer line as printed on the document.
- Each document opens in a new tab.
- Delete unused slots. Until one document is real, add `hidden` to the `<section id="proof">` tag.

## 4. Login (`login.html`)
The page is complete on the front end and NOT connected to a backend.
- `js/login.js` is the UI only: validation, error states, show/hide password, the help panel.
- `js/auth.js` is the only place that may talk to a server. `AcademyAuth.signIn()` currently
  rejects with `not_connected`, and the page then tells the user login isn't available.
- To connect it, write the sign-in call inside `signIn()` in `js/auth.js`. The contract (input,
  result, error codes) is documented at the top of that file.
- "Remember me" is passed to `signIn()` as `remember: true/false`. Nothing is stored by the page.
- "Forgot password?" opens a panel that sends people to WhatsApp, phone or email, because no reset
  flow exists. Confirm the team will handle those, or replace the panel with a real reset.
- There is no "create account" link because nothing shows students can register themselves.
  The line under the button points to the demo class instead.
- The Student / Staff / Admin choice mirrors the tabs on the current live login page and is passed
  as `role`. Delete the fieldset if the backend doesn't need it.

DO NOT overwrite the live `login.html` with this file until `js/auth.js` is connected.
The live page has its own sign-in code, which was not in the project I was given. Replacing it
first would disconnect login for students, staff and admins.

## 5. Policy pages
Three separate pages. The text is transcribed from your three PDFs and nothing was added, removed
or corrected. Please proofread each page against its PDF once.
- "Last updated" is one clearly marked line near the top of each page. It is set to the PDF's
  effective date (09-03-2026). Change it whenever the text changes.
- Each page links to the other two and to its PDF.
- Footer policy links on every page use `target="_blank" rel="noopener noreferrer"`.
- Links point to `privacy-policy.html` and so on, matching `about.html` and `login.html`.
  Whether `/privacy-policy` also works without `.html` depends on your host.
- The "Refund policy" links inside the course and FAQ sections of `index.html` still open the PDF,
  because those sections were approved as they are. Point them at `refund-policy.html` if you want
  one source.
- The contact address differs between documents (hr@ in Privacy and Terms, support@ in Refund),
  exactly as in the PDFs.

## 6. Small-phone fix
The existing homepage scrolled sideways on phones 360px wide and under. Two rules at the end of
`css/academy.css` fix it (hero code sample, header). No visual change on larger screens.

## Demo form (unchanged)
Same destinations as before: the Google Sheet (Apps Script) and Web3Forms email.
- A lead counts as received if either the Sheet or the email confirms.
- Spam protection is a Web3Forms honeypot field only.
- Not yet tested against the live Sheet and Web3Forms. Send one real submission after deploying.

## Before launch
Open any page and the browser console lists every dashed "to confirm" field still on it.
Or run: `grep -o 'class="tbc">[^<]*' index.html | sort | uniq -c`

## Switches
- Course status: `data-status="open"` or `"interest"` on each `.switch__item` in the Courses section.
- ThreatReady, Proof documents: add or remove the `hidden` attribute on the section.
- Student testimonials: hides itself when `js/testimonials.js` has an empty list.
