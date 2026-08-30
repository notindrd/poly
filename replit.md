# Running the project on Replit

This is a static HTML site. The main entry point is `index.html`, with additional standalone pages under `math/` and `french/`.

## Run locally in Replit

Start the configured `Start application` workflow. It serves the project from the repository root at port 5000 using Python's built-in HTTP server:

```bash
python3 -m http.server 5000 --bind 0.0.0.0
```

The main preview opens `index.html`. Several menu items load external URLs, so availability of those items depends on the external sites allowing iframe embedding.