# TODO: Connect React UI to Flask Backend

## Backend Changes (Minimal)
- [x] Fix file handling in docmind/__init__.py to process multiple uploaded files using getlist
- [x] Modify response_page route to return JSON if Accept header is application/json, else HTML

## React UI Changes
- [x] Update fetch in new_ui/app/page.tsx to send Accept: application/json header
- [x] Change response parsing from HTML DOM to JSON

## Testing
- [x] Test the integration by running both Flask and React apps (Flask running with CORS, React UI updated)
